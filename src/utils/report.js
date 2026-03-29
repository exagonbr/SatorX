const { features } = require("../eval/weights");

function analyzePosition(chess) {
  return {
    fen: chess.fen(),
    turn: chess.turn(),
    features: features(chess)
  };
}

module.exports = { analyzePosition };
