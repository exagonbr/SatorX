const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function material(chess) {
  const board = chess.board();
  let w = 0, b = 0;
  for (const row of board) for (const p of row) {
    if (!p) continue;
    const v = PIECE_VALUES[p.type];
    if (p.color === "w") w += v; else b += v;
  }
  return { w, b };
}

function kasparovFeatures(chess) {
  const turn = chess.turn();
  const moves = chess.moves({ verbose: true });
  let checks = 0, captures = 0;
  for (const mv of moves) {
    if (mv.san.includes("+") || mv.san.includes("#")) checks++;
    if (mv.captured) captures++;
  }
  const mob = moves.length;
  const inCheck = chess.inCheck();

  const mat = material(chess);
  const matDiff = (turn === "w" ? (mat.w - mat.b) : (mat.b - mat.w));

  return { turn, mobility: mob, checks, captures, inCheck, materialDiff: matDiff };
}

function kasparovScore(chess) {
  const f = kasparovFeatures(chess);
  return (
    20 * f.materialDiff +
     1.5 * f.mobility +
     6 * f.checks +
     2 * f.captures -
    25 * (f.inCheck ? 1 : 0)
  );
}

module.exports = { kasparovScore, kasparovFeatures };
