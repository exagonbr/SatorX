const fs = require("fs");
const path = require("path");

const MAX_ENTRIES = 200;

/**
 * Histórico de partidas online (lobby) para o ranking na página inicial.
 * Em Vercel fica só em memória (sem ficheiro).
 */
function createLobbyRankingStore(dataDir, isVercel) {
  const file = path.join(dataDir, "lobby_rankings.json");
  let entries = [];

  function load() {
    if (isVercel) return;
    try {
      if (fs.existsSync(file)) {
        const j = JSON.parse(fs.readFileSync(file, "utf8"));
        if (Array.isArray(j)) entries = j.slice(-MAX_ENTRIES);
      }
    } catch (_) {
      entries = [];
    }
  }

  function persist() {
    if (isVercel) return;
    try {
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(file, JSON.stringify(entries.slice(-MAX_ENTRIES), null, 0), "utf8");
    } catch (e) {
      console.warn("[lobby/ranking] persist:", e.message);
    }
  }

  function append(entry) {
    const row = {
      id:
        entry.id ||
        Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10),
      lobbyId: entry.lobbyId,
      whiteName: entry.whiteName,
      blackName: entry.blackName,
      winner: entry.winner,
      reasonCode: entry.reasonCode,
      reasonLabel: entry.reasonLabel,
      scoreWhite: entry.scoreWhite,
      scoreBlack: entry.scoreBlack,
      durationSec: entry.durationSec,
      startedAt: entry.startedAt,
      endedAt: entry.endedAt,
      recordedAt: new Date().toISOString()
    };
    entries.push(row);
    if (entries.length > MAX_ENTRIES) entries = entries.slice(-MAX_ENTRIES);
    persist();
    return row;
  }

  function list(limit = 60) {
    const n = Math.min(120, Math.max(1, parseInt(limit, 10) || 60));
    return entries.slice(-n).reverse();
  }

  load();
  return { append, list, load };
}

module.exports = { createLobbyRankingStore };
