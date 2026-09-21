const gameLogStore = require("../db/gameLogStore");

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const cache = new Map();
const CACHE_MS = 6 * 60 * 60 * 1000;

function bookScoresFromStats(stats) {
  const out = {};
  const total = stats && stats.total ? stats.total : 0;
  if (!stats || !total) return out;
  for (const m of stats.moves) {
    out[m.san] = m.pct || 0;
  }
  return out;
}

async function localBook(fen) {
  const stats = await gameLogStore.statsForFen(fen);
  return { stats, scores: bookScoresFromStats(stats) };
}

async function fetchLichessExplorer(fen, kind) {
  const key = kind + "|" + fen;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.data;
  const base =
    kind === "masters"
      ? "https://explorer.lichess.ovh/masters"
      : "https://explorer.lichess.ovh/lichess";
  const qs =
    kind === "masters"
      ? "?fen=" + encodeURIComponent(fen)
      : "?variant=standard&speeds=blitz,rapid,classical&ratings=1800,2000,2200,2500&fen=" +
        encodeURIComponent(fen);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4500);
  try {
    const r = await fetch(base + qs, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SatorX/0.6 (chess engine; local book ingest)"
      },
      signal: ctrl.signal
    });
    if (!r.ok) throw new Error("lichess " + r.status);
    const data = await r.json();
    cache.set(key, { at: Date.now(), data });
    return data;
  } catch (e) {
    console.warn("[openingStats] Lichess:", e.message);
    return null;
  } finally {
    clearTimeout(t);
  }
}

function explorerMoves(data) {
  if (!data || !Array.isArray(data.moves)) return [];
  return data.moves.map((m) => ({
    san: m.san,
    white: m.white,
    black: m.black,
    draws: m.draws,
    plays: (m.white || 0) + (m.black || 0) + (m.draws || 0)
  }));
}

async function blendedPosition(fen, ingest) {
  const local = await localBook(fen);
  let lichess = null;
  let masters = null;
  try {
    lichess = await fetchLichessExplorer(fen, "lichess");
    masters = await fetchLichessExplorer(fen, "masters");
  } catch {
    /* offline */
  }
  const remoteMoves = [...explorerMoves(masters), ...explorerMoves(lichess)];
  if (ingest && remoteMoves.length) {
    await gameLogStore.ingestExplorerMoves(fen, explorerMoves(lichess), "lichess");
    await gameLogStore.ingestExplorerMoves(fen, explorerMoves(masters), "masters");
  }
  const scores = { ...local.scores };
  const remoteTotal = remoteMoves.reduce((s, m) => s + (m.plays || 0), 0);
  if (remoteTotal > 0) {
    for (const m of remoteMoves) {
      const p = (m.plays || 0) / remoteTotal;
      scores[m.san] = Math.max(scores[m.san] || 0, p * 0.85);
    }
  }
  return {
    fen,
    local: local.stats,
    lichess: lichess ? { moves: explorerMoves(lichess).slice(0, 8) } : null,
    masters: masters ? { moves: explorerMoves(masters).slice(0, 8) } : null,
    scores
  };
}

async function seedPopularPositions() {
  const fens = [
    START_FEN,
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1",
    "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
    "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"
  ];
  let ingested = 0;
  for (const fen of fens) {
    const data = await fetchLichessExplorer(fen, "lichess");
    ingested += await gameLogStore.ingestExplorerMoves(fen, explorerMoves(data), "lichess");
    const masters = await fetchLichessExplorer(fen, "masters");
    ingested += await gameLogStore.ingestExplorerMoves(fen, explorerMoves(masters), "masters");
  }
  return { ingested, positions: fens.length };
}

async function ingestRecentPlayedFens() {
  const fens = await gameLogStore.recentUniqueFens(6);
  let ingested = 0;
  for (const fen of fens) {
    const data = await fetchLichessExplorer(fen, "lichess");
    ingested += await gameLogStore.ingestExplorerMoves(fen, explorerMoves(data), "lichess");
  }
  return { ingested, positions: fens.length };
}

module.exports = {
  START_FEN,
  localBook,
  blendedPosition,
  seedPopularPositions,
  ingestRecentPlayedFens,
  bookScoresFromStats
};
