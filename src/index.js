const { Chess } = require("chess.js");
const { findBestMove } = require("./engine");
const { analyzePosition } = require("./utils/report");

function getArg(name, def=null) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && idx + 1 < process.argv.length) return process.argv[idx + 1];
  return def;
}

function main() {
  const cmd = process.argv[2] || "bestmove";
  const fen = getArg("fen", null);
  const depth = parseInt(getArg("depth", "7"), 10);
  const timeMs = parseInt(getArg("time", "3000"), 10);

  const chess = new Chess();
  if (fen) {
    const ok = chess.load(fen);
    if (!ok) {
      console.error("FEN inválido.");
      process.exit(1);
    }
  }

  if (cmd === "analyze") {
    console.log(JSON.stringify(analyzePosition(chess), null, 2));
    return;
  }

  if (cmd === "bestmove") {
    console.log(JSON.stringify(findBestMove(chess, depth, timeMs), null, 2));
    return;
  }

  console.log("Comandos: analyze | bestmove");
}

main();
