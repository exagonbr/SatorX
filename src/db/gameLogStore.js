const { Chess } = require("chess.js");
const { getPrisma } = require("./aiLearningStore");

function nowIso() {
  return new Date().toISOString();
}

function fenCore(fen) {
  if (!fen || typeof fen !== "string") return "";
  return fen.trim().split(/\s+/).slice(0, 4).join(" ");
}

function resultFromFen(fenAfter) {
  try {
    const c = new Chess();
    c.load(fenAfter);
    if (c.isCheckmate()) return c.turn() === "w" ? "black" : "white";
    if (c.isDraw()) return "draw";
  } catch {
    /* ignore */
  }
  return null;
}

async function logMove(entry) {
  const sessionId = entry.sessionId || "anon";
  const ply = Number(entry.ply) || 0;
  const san = String(entry.san || "");
  const fenBefore = String(entry.fenBefore || "");
  const fenAfter = String(entry.fenAfter || "");
  const ui = String(entry.ui || "unknown");
  const source = String(entry.source || "player");
  const createdAt = nowIso();
  if (!san || !fenBefore || !fenAfter) {
    throw new Error("logMove requer san, fenBefore e fenAfter");
  }

  const core = fenCore(fenBefore);
  const terminal = resultFromFen(fenAfter);

  try {
    const prisma = getPrisma();
    await prisma.gameMoveLog.create({
      data: { sessionId, ply, san, fenBefore, fenAfter, ui, source, createdAt }
    });

    const inc = { plays: 1 };
    if (terminal === "white") inc.whiteWins = 1;
    else if (terminal === "black") inc.blackWins = 1;
    else if (terminal === "draw") inc.draws = 1;

    await prisma.moveStat.upsert({
      where: { fenCore_san: { fenCore: core, san } },
      create: {
        fenCore: core,
        san,
        plays: 1,
        whiteWins: terminal === "white" ? 1 : 0,
        blackWins: terminal === "black" ? 1 : 0,
        draws: terminal === "draw" ? 1 : 0,
        lastAt: createdAt,
        sources: source === "lichess" ? "lichess" : "satorx"
      },
      update: {
        plays: { increment: inc.plays },
        whiteWins: { increment: inc.whiteWins || 0 },
        blackWins: { increment: inc.blackWins || 0 },
        draws: { increment: inc.draws || 0 },
        lastAt: createdAt
      }
    });
  } catch (e) {
    console.warn("[gameLogStore] logMove:", e.message);
  }

  return { ok: true, fenCore: core, terminal };
}

async function statsForFen(fen) {
  const core = fenCore(fen);
  if (!core) return { fenCore: "", total: 0, moves: [] };
  try {
    const rows = await getPrisma().moveStat.findMany({
      where: { fenCore: core },
      orderBy: { plays: "desc" },
      take: 24
    });
    const total = rows.reduce((s, r) => s + (r.plays || 0), 0);
    return {
      fenCore: core,
      total,
      moves: rows.map((r) => ({
        san: r.san,
        plays: r.plays,
        whiteWins: r.whiteWins,
        blackWins: r.blackWins,
        draws: r.draws,
        pct: total ? r.plays / total : 0,
        sources: r.sources
      }))
    };
  } catch (e) {
    console.warn("[gameLogStore] statsForFen:", e.message);
    return { fenCore: core, total: 0, moves: [] };
  }
}

async function ingestExplorerMoves(fen, moves, source) {
  const core = fenCore(fen);
  if (!core || !Array.isArray(moves)) return 0;
  const createdAt = nowIso();
  let n = 0;
  try {
    const prisma = getPrisma();
    for (const mv of moves) {
      const san = mv.san || mv.uci || "";
      const plays = Number(mv.white || 0) + Number(mv.black || 0) + Number(mv.draws || 0) || Number(mv.plays) || 0;
      if (!san || plays <= 0) continue;
      await prisma.moveStat.upsert({
        where: { fenCore_san: { fenCore: core, san } },
        create: {
          fenCore: core,
          san,
          plays,
          whiteWins: Number(mv.white || 0),
          blackWins: Number(mv.black || 0),
          draws: Number(mv.draws || 0),
          lastAt: createdAt,
          sources: source || "lichess"
        },
        update: {
          plays: { increment: plays },
          whiteWins: { increment: Number(mv.white || 0) },
          blackWins: { increment: Number(mv.black || 0) },
          draws: { increment: Number(mv.draws || 0) },
          lastAt: createdAt,
          sources: "mixed"
        }
      });
      n += 1;
    }
  } catch (e) {
    console.warn("[gameLogStore] ingestExplorerMoves:", e.message);
  }
  return n;
}

async function searchGames(q, limit = 20) {
  const query = String(q || "").trim().toLowerCase();
  const take = Math.min(50, Math.max(1, Number(limit) || 20));
  try {
    const prisma = getPrisma();
    const rows = await prisma.gameReplay.findMany({
      orderBy: { createdAt: "desc" },
      take: 400,
      select: { id: true, createdAt: true, result: true, pgn: true, movesJson: true, metaJson: true }
    });
    const filtered = rows.filter((r) => {
      if (!query) return true;
      const blob = `${r.pgn || ""} ${r.movesJson || ""} ${r.metaJson || ""} ${r.result || ""}`.toLowerCase();
      return blob.includes(query);
    });
    const list = filtered.slice(0, take).map((r) => {
      let meta = {};
      try {
        meta = JSON.parse(r.metaJson || "{}");
      } catch {
        meta = {};
      }
      return {
        id: r.id,
        createdAt: r.createdAt,
        result: r.result,
        pgn: r.pgn,
        meta
      };
    });

    const logRows = await prisma.gameMoveLog.findMany({
      orderBy: { id: "desc" },
      take: 120,
      select: { id: true, sessionId: true, ply: true, san: true, ui: true, source: true, createdAt: true, fenBefore: true }
    });
    const moves = logRows
      .filter((r) => {
        if (!query) return true;
        const blob = `${r.san} ${r.sessionId} ${r.ui} ${r.source}`.toLowerCase();
        return blob.includes(query);
      })
      .slice(0, take)
      .map((r) => ({
        id: r.id,
        sessionId: r.sessionId,
        ply: r.ply,
        san: r.san,
        ui: r.ui,
        source: r.source,
        createdAt: r.createdAt
      }));

    return { list, moves };
  } catch (e) {
    console.warn("[gameLogStore] searchGames:", e.message);
    return { list: [], moves: [] };
  }
}

async function recentUniqueFens(limit = 8) {
  try {
    const rows = await getPrisma().gameMoveLog.findMany({
      orderBy: { id: "desc" },
      take: 48,
      select: { fenBefore: true }
    });
    const seen = new Set();
    const out = [];
    for (const r of rows) {
      if (!r.fenBefore || seen.has(r.fenBefore)) continue;
      seen.add(r.fenBefore);
      out.push(r.fenBefore);
      if (out.length >= limit) break;
    }
    return out;
  } catch {
    return [];
  }
}

async function recentMoveLogs(limit = 30) {
  try {
    return await getPrisma().gameMoveLog.findMany({
      orderBy: { id: "desc" },
      take: Math.min(80, Math.max(1, Number(limit) || 30))
    });
  } catch {
    return [];
  }
}

module.exports = {
  fenCore,
  logMove,
  statsForFen,
  ingestExplorerMoves,
  searchGames,
  recentMoveLogs,
  recentUniqueFens
};
