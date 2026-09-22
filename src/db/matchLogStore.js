const { getPrisma } = require("./aiLearningStore");

function matchLogDelegate() {
  const prisma = getPrisma();
  const model = prisma.matchLog;
  if (!model) {
    throw new Error(
      "Cliente Prisma sem model MatchLog — pare o servidor (npm run server) e execute: npx prisma generate"
    );
  }
  return model;
}

function clip(s, n) {
  if (s == null) return null;
  const t = String(s).trim();
  if (!t) return null;
  return t.slice(0, n || 80);
}

function toIso(v) {
  if (!v) return new Date().toISOString();
  if (typeof v === "number" && Number.isFinite(v)) return new Date(v).toISOString();
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function numScore(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function optionalInt(v) {
  if (v == null || v === "") return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? n : null;
}

/**
 * @param {object} row
 */
async function upsertMatchLog(row) {
  const sourceKey = clip(row.sourceKey, 160);
  if (!sourceKey) throw new Error("sourceKey é obrigatório");
  const winner = clip(row.winner, 16) || "draw";
  const data = {
    sourceKey,
    mode: clip(row.mode, 32) || "unknown",
    ui: clip(row.ui, 32),
    whiteName: clip(row.whiteName, 80),
    blackName: clip(row.blackName, 80),
    opponent: clip(row.opponent, 80),
    location: clip(row.location, 160),
    winner,
    reasonCode: clip(row.reasonCode, 48) || "unknown",
    reasonLabel: clip(row.reasonLabel, 200),
    scoreWhite: numScore(row.scoreWhite, 0.5),
    scoreBlack: numScore(row.scoreBlack, 0.5),
    eloEngine: optionalInt(row.eloEngine),
    eloPlayer: optionalInt(row.eloPlayer),
    startedAt: toIso(row.startedAt),
    endedAt: toIso(row.endedAt),
    recordedAt: row.recordedAt ? toIso(row.recordedAt) : new Date().toISOString(),
    lobbyId: clip(row.lobbyId, 64),
    sessionId: clip(row.sessionId, 80)
  };
  await matchLogDelegate().upsert({
    where: { sourceKey },
    create: data,
    update: {
      mode: data.mode,
      ui: data.ui,
      whiteName: data.whiteName,
      blackName: data.blackName,
      opponent: data.opponent,
      location: data.location,
      winner: data.winner,
      reasonCode: data.reasonCode,
      reasonLabel: data.reasonLabel,
      scoreWhite: data.scoreWhite,
      scoreBlack: data.scoreBlack,
      eloEngine: data.eloEngine,
      eloPlayer: data.eloPlayer,
      startedAt: data.startedAt,
      endedAt: data.endedAt,
      recordedAt: data.recordedAt,
      lobbyId: data.lobbyId,
      sessionId: data.sessionId
    }
  });
}

function matchTypeCode(entry) {
  const mode = String(entry.mode || "").toLowerCase();
  if (mode === "multiplayer" || entry.lobbyId) return "multiplayer";
  if (mode === "human") return "human";
  if (mode === "engine") return "engine";
  const loc = String(entry.location || "").toLowerCase();
  if (loc === "online" || loc.startsWith("online ·") || loc.startsWith("online,")) {
    return "multiplayer";
  }
  return "engine";
}

function enrichEntry(e) {
  return { ...e, matchType: matchTypeCode(e) };
}

function mapRow(r) {
  return enrichEntry({
    id: r.id,
    sourceKey: r.sourceKey,
    mode: r.mode,
    ui: r.ui,
    whiteName: r.whiteName,
    blackName: r.blackName,
    opponent: r.opponent,
    location: r.location,
    winner: r.winner,
    reasonCode: r.reasonCode,
    reasonLabel: r.reasonLabel,
    scoreWhite: r.scoreWhite,
    scoreBlack: r.scoreBlack,
    eloEngine: r.eloEngine != null ? r.eloEngine : null,
    eloPlayer: r.eloPlayer != null ? r.eloPlayer : null,
    startedAt: r.startedAt,
    endedAt: r.endedAt,
    recordedAt: r.recordedAt,
    lobbyId: r.lobbyId,
    sessionId: r.sessionId
  });
}

function rankingAsMatch(r) {
  const white = r.whiteName || "Brancas";
  const black = r.blackName || "Pretas";
  return enrichEntry({
    id: "lobby-" + r.id,
    sourceKey: "legacy-lobby:" + r.lobbyId + ":" + (r.startedAt || r.endedAt),
    mode: "multiplayer",
    ui: null,
    whiteName: r.whiteName,
    blackName: r.blackName,
    opponent: white + " vs " + black,
    location: "Online",
    winner: r.winner,
    reasonCode: r.reasonCode,
    reasonLabel: r.reasonLabel,
    scoreWhite: r.scoreWhite,
    scoreBlack: r.scoreBlack,
    eloEngine: null,
    eloPlayer: null,
    startedAt: r.startedAt,
    endedAt: r.endedAt,
    recordedAt: r.recordedAt,
    lobbyId: r.lobbyId,
    sessionId: null
  });
}

async function listMatchLogs(limit = 80) {
  const n = Math.min(200, Math.max(1, parseInt(limit, 10) || 80));
  const rows = await matchLogDelegate().findMany({
    orderBy: { endedAt: "desc" },
    take: n
  });
  return rows.map(mapRow);
}

/**
 * União do registro unificado com o ranking de lobby antigo (sem duplicar).
 */
async function listAllMatches(limit = 80) {
  const n = Math.min(200, Math.max(1, parseInt(limit, 10) || 80));
  const pool = Math.min(400, Math.max(n, 120));
  const logs = await listMatchLogs(pool);
  const seen = new Set();
  for (const e of logs) {
    if (e.lobbyId) seen.add("lobby:" + e.lobbyId + ":" + (e.startedAt || ""));
    seen.add(e.sourceKey);
  }
  let extra = [];
  try {
    const { listLobbyRanking } = require("./lobbyRankingPrisma");
    const ranking = await listLobbyRanking(pool);
    extra = ranking
      .map(rankingAsMatch)
      .filter((e) => {
        const k = "lobby:" + e.lobbyId + ":" + (e.startedAt || "");
        if (seen.has(k) || seen.has(e.sourceKey)) return false;
        seen.add(k);
        return true;
      });
  } catch {
    extra = [];
  }
  const merged = logs.concat(extra);
  merged.sort((a, b) => String(b.endedAt || "").localeCompare(String(a.endedAt || "")));
  return merged.slice(0, n);
}

module.exports = { upsertMatchLog, listMatchLogs, listAllMatches };
