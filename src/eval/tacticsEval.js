const { Chess } = require("chess.js");
/**
 * TacticsEval (heurístico) – detecta padrões curtos sem fazer prova completa:
 * - fork-like: um lance que cria dupla ameaça (especialmente cavalo)
 * - pin-like: peça cravada ao rei (aproximação via lances legais que revelam)
 * - checks fortes
 *
 * Pontua do ponto de vista do lado a jogar.
 */
const V = { p:100, n:320, b:330, r:500, q:900, k:20000 };

function pieceAt(chess, sq) {
  const board = chess.board();
  const files = "abcdefgh";
  const file = files.indexOf(sq[0]);
  const rank = parseInt(sq[1],10) - 1; // 0..7
  const row = 7 - rank;
  return board[row][file] || null;
}

function tacticalFeatures(chess) {
  const moves = chess.moves({ verbose: true });
  let strongChecks = 0;
  let forkThreats = 0;
  let hangingCaptures = 0;

  // For each candidate move, see if after move our moved piece attacks two valuable enemy pieces (very rough)
  for (const mv of moves) {
    chess.move(mv);
    const movedTo = mv.to;
    const movedPiece = pieceAt(chess, movedTo);

    // checks
    const myMoves2 = chess.moves({ verbose: true });
    // after our move, opponent to move; we measure if our move gave check already
    if (mv.san.includes("+") || mv.san.includes("#")) strongChecks++;

    if (movedPiece) {
      // estimate attacked squares by generating our pseudo-legal moves by forcing turn back (hack)
      const fenParts = chess.fen().split(" ");
      // flip turn back to current player's color (the mover)
      fenParts[1] = movedPiece.color;
  fenParts[3] = "-";
      const tmp = new Chess();
      tmp.load(fenParts.join(" "));
      const aMoves = tmp.moves({ verbose: true }).filter(x => x.from === movedTo);
      const attacked = new Set(aMoves.map(x => x.to));

      // count valuable enemy pieces attacked
      let threats = [];
      for (const sq of attacked) {
        const p = pieceAt(chess, sq);
        if (p && p.color !== movedPiece.color) threats.push(V[p.type] || 0);
      }
      threats.sort((a,b)=>b-a);
      if (threats.length >= 2 && (threats[0] + threats[1]) >= 800) {
        forkThreats++;
      }
    }

    // hanging capture opportunity for us on next? rough: if opponent has a capture of our queen right away
    const oppMoves = chess.moves({ verbose: true }); // opponent to move
    for (const omv of oppMoves) {
      if (omv.captured === "q") { hangingCaptures++; break; }
    }

    chess.undo();
  }

  return { strongChecks, forkThreats, hangingCaptures };
}

function tacticsScore(chess) {
  const f = tacticalFeatures(chess);
  // reward creating checks and forks, penalize obvious queen hangs
  return 250*f.forkThreats + 120*f.strongChecks - 200*f.hangingCaptures;
}

module.exports = { tacticsScore, tacticalFeatures };