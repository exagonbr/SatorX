const { Chess } = require("chess.js");
const { findBestMove } = require("../engine");

function randMove(chess) {
  const moves = chess.moves({ verbose: true });
  return moves[Math.floor(Math.random()*moves.length)];
}

function playGame({ depth=5, timeMs=1200, maxPlies=160, opponent="random" }) {
  const chess = new Chess();
  let plies = 0;

  while (!chess.isGameOver() && plies < maxPlies) {
    const turn = chess.turn();
    let mv;
    if (opponent === "random" && turn === "b") {
      mv = randMove(chess);
    } else {
      mv = findBestMove(chess, depth, timeMs).bestMove;
    }
    if (!mv) break;
    chess.move(mv);
    plies++;
  }
  return { result: chess.isCheckmate() ? (chess.turn()==="w" ? "black_wins" : "white_wins") : "draw", plies, fen: chess.fen() };
}

function main() {
  const games = parseInt(process.argv[2] || "10", 10);
  const depth = parseInt(process.argv[3] || "5", 10);
  const timeMs = parseInt(process.argv[4] || "1200", 10);

  let w=0,b=0,d=0;
  for (let i=0;i<games;i++){
    const g = playGame({ depth, timeMs, opponent:"random" });
    if (g.result==="white_wins") w++;
    else if (g.result==="black_wins") b++;
    else d++;
    console.log(`#${i+1}`, g.result, "plies=", g.plies);
  }
  console.log({ games, depth, timeMs, white_wins:w, black_wins:b, draws:d });
}

main();
