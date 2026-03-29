const { Chess } = require("chess.js");
/**
 * KingSafetyEval – heurística simples:
 * - penaliza rei em check
 * - penaliza alta densidade de ataques inimigos no "anel do rei" (8 casas ao redor)
 * - penaliza colunas abertas/sem peões de escudo (aproximação)
 */
const V = { p:100, n:320, b:330, r:500, q:900, k:20000 };

function findKing(chess, color) {
  const board = chess.board();
  const files = "abcdefgh";
  for (let r=0;r<8;r++){
    for (let c=0;c<8;c++){
      const p = board[r][c];
      if (p && p.type==="k" && p.color===color){
        const file = files[c];
        const rank = 8 - r;
        return file+rank;
      }
    }
  }
  return null;
}

function neighborSquares(sq) {
  const files = "abcdefgh";
  const f = files.indexOf(sq[0]);
  const r = parseInt(sq[1],10)-1;
  const res = [];
  for (let df=-1; df<=1; df++){
    for (let dr=-1; dr<=1; dr++){
      if (df===0 && dr===0) continue;
      const nf=f+df, nr=r+dr;
      if (nf>=0 && nf<8 && nr>=0 && nr<8){
        res.push(files[nf]+(nr+1));
      }
    }
  }
  return res;
}

function squaresAttackedBy(chess, color) {
  const fenParts = chess.fen().split(" ");
  fenParts[1] = color;
  fenParts[3] = "-";
  const tmp = new Chess();
  tmp.load(fenParts.join(" "));
  const moves = tmp.moves({ verbose: true });
  const attacked = new Set();
  for (const mv of moves) attacked.add(mv.to);
  return attacked;
}

function kingSafetyFeatures(chess) {
  const turn = chess.turn();
  const enemy = turn === "w" ? "b" : "w";

  const ksq = findKing(chess, turn);
  const ring = ksq ? neighborSquares(ksq) : [];
  const attEn = squaresAttackedBy(chess, enemy);

  let ringAtt = 0;
  for (const s of ring) if (attEn.has(s)) ringAtt++;

  // pawn shield: count friendly pawns on squares in front of king (very rough)
  // if king on g1: expect pawns f2,g2,h2; similarly others
  const board = chess.board();
  const files = "abcdefgh";
  function pieceAt(sq){
    const c = files.indexOf(sq[0]);
    const rank = parseInt(sq[1], 10);
    if (c < 0 || c > 7 || rank < 1 || rank > 8) return null;
    const row = 8 - rank;
    if (row < 0 || row > 7) return null;
    const rowArr = board[row];
    if (!rowArr) return null;
    return rowArr[c] || null;
  }

  let shield = 0;
  if (ksq) {
    const file = ksq[0];
    const rank = parseInt(ksq[1],10);
    const dir = (turn==="w") ? 1 : -1; // pawns are ahead in rank+1 for white
    const adjFiles = [String.fromCharCode(file.charCodeAt(0)-1), file, String.fromCharCode(file.charCodeAt(0)+1)];
    for (const af of adjFiles) {
      if (af < "a" || af > "h") continue;
      const sq = af + (rank + dir);
      const p = pieceAt(sq);
      if (p && p.type==="p" && p.color===turn) shield++;
    }
  }

  const inCheck = chess.inCheck();

  return { kingSquare: ksq, ringAttacks: ringAtt, pawnShield: shield, inCheck };
}

function kingSafetyScore(chess) {
  const f = kingSafetyFeatures(chess);
  // penaliza ring attacks e falta de escudo
  const score = -220*(f.inCheck?1:0) - 40*f.ringAttacks + 25*f.pawnShield;
  return score;
}

module.exports = { kingSafetyScore, kingSafetyFeatures };