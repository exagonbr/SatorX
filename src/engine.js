const { evaluate } = require("./eval/weights");

const TT = new Map();
const KILLERS = new Map(); // depth -> [moveSAN1, moveSAN2]
const HISTORY = new Map(); // key: piece+from+to => score

function hashKey(chess, depth) {
  return chess.fen() + `|d=${depth}`;
}

function histKey(mv) { return `${mv.piece}${mv.from}${mv.to}${mv.promotion||""}`; }

function addHistory(mv, depth) {
  const k = histKey(mv);
  const cur = HISTORY.get(k) || 0;
  HISTORY.set(k, cur + (depth*depth));
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
    const V = { p:100, n:320, b:330, r:500, q:900, k:20000 };
    s += 2500 + ((V[mv.captured]||0) - (V[mv.piece]||0));
  }

  // killers
  const killers = KILLERS.get(depth) || [];
  if (killers.includes(mv.san)) s += 1500;

  // history
  s += (HISTORY.get(histKey(mv)) || 0);

  return s;
}

function orderMoves(moves, depth) {
  return moves
    .map(m => ({ m, s: moveScore(m, depth) }))
    .sort((a,b)=>b.s-a.s)
    .map(x=>x.m);
}

function quiescence(chess, alpha, beta, qDepth=6) {
  const stand = evaluate(chess);
  if (stand >= beta) return beta;
  if (alpha < stand) alpha = stand;
  if (qDepth === 0) return stand;

  let moves = chess.moves({ verbose: true })
    .filter(mv => mv.captured || mv.san.includes("+"));
  moves = orderMoves(moves, 0);

  for (const mv of moves) {
    chess.move(mv);
    const score = -quiescence(chess, -beta, -alpha, qDepth-1);
    chess.undo();
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

function negamax(chess, depth, alpha, beta, ply=0) {
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) return -100000 + ply;
    return 0;
  }

  const key = hashKey(chess, depth);
  const tt = TT.get(key);
  if (tt && tt.depth >= depth) return tt.score;

  if (depth === 0) {
    const q = quiescence(chess, alpha, beta, 6);
    TT.set(key, { depth, score: q });
    return q;
  }

  // chess.js não suporta null-move; aproximação: reduzir profundidade em posições “quietas”.
  const movesNow = chess.moves({ verbose: true });
  const tacticalNow = movesNow.some(m => m.captured || m.san.includes("+"));
  const effectiveDepth = tacticalNow ? depth : Math.max(1, depth-1);

  let best = -Infinity;
  let moves = orderMoves(movesNow, depth);

  for (let i=0; i<moves.length; i++) {
    const mv = moves[i];
    chess.move(mv);

    // LMR: reduzir para movimentos tardios não-táticos
    let newDepth = effectiveDepth - 1;
    const quiet = !(mv.captured || mv.san.includes("+") || mv.promotion);
    if (quiet && i >= 4 && effectiveDepth >= 3) newDepth = Math.max(1, newDepth - 1);

    const score = -negamax(chess, newDepth, -beta, -alpha, ply+1);
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

  TT.set(key, { depth, score: best });
  return best;
}

function clearTranspositionTable() {
  TT.clear();
}

function findBestMove(chess, depth = 7, timeMs = 3000) {
  const start = Date.now();
  let best = null, bestScore = -Infinity, bestDepth = 1;

  for (let d=1; d<=depth; d++) {
    if (Date.now() - start > timeMs) break;

    let localBest=null, localScore=-Infinity;
    let alpha = -Infinity;
    let moves = orderMoves(chess.moves({ verbose: true }), d);

    for (let i=0; i<moves.length; i++) {
      if (Date.now() - start > timeMs) break;
      const mv = moves[i];
      chess.move(mv);
      const score = -negamax(chess, d-1, -Infinity, -alpha, 0);
      chess.undo();

      if (score > localScore) { 
        localScore = score; 
        localBest = mv; 
      }
      if (score > alpha) {
        alpha = score;
      }
    }

    if (localBest) { best = localBest; bestScore = localScore; bestDepth = d; }
  }

  return {
    fen: chess.fen(),
    depth: bestDepth,
    timeMs,
    turn: chess.turn(),
    bestMove: best ? { from: best.from, to: best.to, san: best.san, piece: best.piece, captured: best.captured || null, promotion: best.promotion || null, flags: best.flags } : null,
    score: bestScore
  };
}

module.exports = { findBestMove, clearTranspositionTable };
