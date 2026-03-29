const { Chess } = require("chess.js");

function extractPositionsFromMoves(moves) {
  const chess = new Chess();
  const positions = [];
  for (let ply = 0; ply < moves.length; ply++) {
    positions.push({ fen: chess.fen(), ply });
    try {
      chess.move(moves[ply], { sloppy: true });
    } catch {
      break;
    }
  }
  positions.push({ fen: chess.fen(), ply: moves.length });
  return positions;
}

/**
 * @param {{ id: string, createdAt: string, result?: string, moves?: string[] }} rec
 * @returns {{ replayId: string, createdAt: string, result: string, ply: number, fen: string }[]}
 */
function bufferRowsFromRecord(rec) {
  const moves = Array.isArray(rec.moves) ? rec.moves : [];
  if (moves.length === 0) return [];
  const positions = extractPositionsFromMoves(moves);
  const result = rec.result || "unknown";
  return positions.map((p) => ({
    replayId: rec.id,
    createdAt: rec.createdAt,
    result,
    ply: p.ply,
    fen: p.fen
  }));
}

module.exports = {
  extractPositionsFromMoves,
  bufferRowsFromRecord
};
