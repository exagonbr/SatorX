const { evaluate } = require("./eval/weights");

const TT = new Map();
const KILLERS = new Map(); // depth -> [moveSAN1, moveSAN2]
const HISTORY = new Map(); // key: piece+from+to => score

/** Deadline da busca atual (ms epoch); 0 = sem limite. */
let searchDeadline = 0;
let searchAborted = false;

function hashKey(chess, depth) {
  return chess.fen() + `|d=${depth}`;
}

function histKey(mv) {
  return `${mv.piece}${mv.from}${mv.to}${mv.promotion || ""}`;
}

function addHistory(mv, depth) {
  const k = histKey(mv);
  const cur = HISTORY.get(k) || 0;
  HISTORY.set(k, cur + depth * depth);
}

function addKiller(mv, depth) {
  const san = mv.san;
  const arr = KILLERS.get(depth) || [];
  if (!arr.includes(san)) {
    arr.unshift(san);
    if (arr.length > 2) arr.pop();
    KILLERS.set(depth, arr);
  }
}

function moveScore(mv, depth) {
  let s = 0;
  if (mv.san.includes("#")) s += 100000;
  if (mv.san.includes("+")) s += 6000;
  if (mv.promotion) s += 4000;

  if (mv.captured) {
    const V = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
    s += 2500 + ((V[mv.captured] || 0) - (V[mv.piece] || 0));
  }

  const killers = KILLERS.get(depth) || [];
  if (killers.includes(mv.san)) s += 1500;

  s += HISTORY.get(histKey(mv)) || 0;

  return s;
}

function orderMoves(moves, depth) {
  return moves
    .map((m) => ({ m, s: moveScore(m, depth) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.m);
}

function timeUp() {
  if (!searchDeadline) return false;
  if (Date.now() >= searchDeadline) {
    searchAborted = true;
    return true;
  }
  return false;
}

function remainingMs() {
  if (!searchDeadline) return 1e9;
  return searchDeadline - Date.now();
}

function adaptiveQDepth() {
  const left = remainingMs();
  if (left < 80) return 0;
  if (left < 250) return 1;
  if (left < 800) return 2;
  return 3;
}

function quiescence(chess, alpha, beta, qDepth) {
  if (timeUp()) return evaluate(chess);

  const stand = evaluate(chess);
  if (stand >= beta) return beta;
  if (alpha < stand) alpha = stand;
  if (qDepth <= 0) return stand;

  let moves = chess.moves({ verbose: true }).filter((mv) => mv.captured || mv.san.includes("+"));
  moves = orderMoves(moves, 0);

  for (const mv of moves) {
    if (timeUp()) break;
    chess.move(mv);
    const score = -quiescence(chess, -beta, -alpha, qDepth - 1);
    chess.undo();
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

function negamax(chess, depth, alpha, beta, ply = 0) {
  if (timeUp()) return evaluate(chess);

  if (chess.isGameOver()) {
    if (chess.isCheckmate()) return -100000 + ply;
    return 0;
  }

  const key = hashKey(chess, depth);
  const tt = TT.get(key);
  if (tt && tt.depth >= depth) return tt.score;

  if (depth === 0) {
    const q = quiescence(chess, alpha, beta, adaptiveQDepth());
    if (!searchAborted) TT.set(key, { depth, score: q });
    return q;
  }

  // chess.js não suporta null-move; aproximação: reduzir profundidade em posições “quietas”.
  const movesNow = chess.moves({ verbose: true });
  const tacticalNow = movesNow.some((m) => m.captured || m.san.includes("+"));
  const effectiveDepth = tacticalNow ? depth : Math.max(1, depth - 1);

  let best = -Infinity;
  let moves = orderMoves(movesNow, depth);

  for (let i = 0; i < moves.length; i++) {
    if (timeUp()) break;
    const mv = moves[i];
    chess.move(mv);

    // LMR: reduzir para movimentos tardios não-táticos
    let newDepth = effectiveDepth - 1;
    const quiet = !(mv.captured || mv.san.includes("+") || mv.promotion);
    if (quiet && i >= 4 && effectiveDepth >= 3) newDepth = Math.max(1, newDepth - 1);

    const score = -negamax(chess, newDepth, -beta, -alpha, ply + 1);
    chess.undo();

    if (score > best) best = score;
    if (score > alpha) {
      alpha = score;
      addHistory(mv, depth);
    }
    if (alpha >= beta) {
      if (!mv.captured) addKiller(mv, depth);
      break;
    }
  }

  if (best === -Infinity) return evaluate(chess);
  if (!searchAborted) TT.set(key, { depth, score: best });
  return best;
}

function clearTranspositionTable() {
  TT.clear();
}

/**
 * @param {import("chess.js").Chess} chess
 * @param {number} depth
 * @param {number} timeMs teto duro de reflexão
 * @param {object} [options]
 */
function findBestMove(chess, depth = 7, timeMs = 3000, options = {}) {
  const start = Date.now();
  const budget = Math.max(80, Number(timeMs) || 3000);
  searchDeadline = start + budget;
  searchAborted = false;

  let best = null;
  let bestScore = -Infinity;
  let bestDepth = 1;
  const book = options.book && typeof options.book === "object" ? options.book : {};
  const {
    selectMasterForPosition,
    masterOrderingBonus,
    blendRootMoves,
    buildThought
  } = require("./lib/masterStrategy");

  const lastMove = options.lastMove || chess.history({ verbose: true }).slice(-1)[0] || null;
  const historySans = options.historySans || chess.history();
  const strategy = selectMasterForPosition(chess, { lastMove, historySans });
  const profile = strategy.profile;

  const maxDepth = Math.max(1, Math.min(Number(depth) || 7, 12));

  for (let d = 1; d <= maxDepth; d++) {
    if (timeUp()) break;

    let alpha = -Infinity;
    const rootRows = [];
    let moves = chess
      .moves({ verbose: true })
      .map((m) => ({
        m,
        s:
          moveScore(m, d) +
          Math.round((book[m.san] || 0) * 2200) +
          masterOrderingBonus(chess, m, profile)
      }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.m);

    if (!moves.length) break;

    let iterationComplete = true;
    for (let i = 0; i < moves.length; i++) {
      if (timeUp()) {
        iterationComplete = false;
        break;
      }
      const mv = moves[i];
      chess.move(mv);
      const score = -negamax(chess, d - 1, -Infinity, -alpha, 0);
      chess.undo();
      if (searchAborted && rootRows.length === 0) {
        // ao menos um score parcial na 1ª iteração
      }
      rootRows.push({ mv, score });
      if (score > alpha) alpha = score;
    }

    if (!rootRows.length) break;

    const ranked = blendRootMoves(
      chess,
      rootRows,
      profile,
      profile && (profile.id === "polgar" || profile.id === "belenkaya") ? 90 : 40
    );

    // Só promove a profundidade se a iteração fechou; senão mantém o melhor anterior
    // (exceto na 1ª profundidade, onde qualquer lance parcial serve de fallback).
    if (ranked[0] && (iterationComplete || !best)) {
      best = ranked[0].mv;
      bestScore = ranked[0].score;
      bestDepth = d;
    }

    if (!iterationComplete || searchAborted) break;
  }

  // Fallback: qualquer lance legal se a busca abortou sem resultado
  if (!best) {
    const legal = chess.moves({ verbose: true });
    if (legal.length) best = legal[0];
  }

  const thought = buildThought(chess, best, strategy, lastMove);
  const elapsedMs = Date.now() - start;

  return {
    fen: chess.fen(),
    depth: bestDepth,
    timeMs: budget,
    elapsedMs,
    timedOut: searchAborted || elapsedMs >= budget,
    turn: chess.turn(),
    bestMove: best
      ? {
          from: best.from,
          to: best.to,
          san: best.san,
          piece: best.piece,
          captured: best.captured || null,
          promotion: best.promotion || null,
          flags: best.flags
        }
      : null,
    score: bestScore,
    masterStrategy: thought
  };
}

module.exports = { findBestMove, clearTranspositionTable };
