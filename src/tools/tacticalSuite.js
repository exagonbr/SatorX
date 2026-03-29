const { Chess } = require("chess.js");
const { findBestMove } = require("../engine");

/**
 * Mini suite de tática (sanidade).
 * Não é “Lichess puzzle set”, é um smoke test para ver se o motor enxerga o óbvio.
 */
const CASES = [
  { name:"Mate em 1 (Qh7#)", fen:"6k1/6pp/8/8/8/7Q/6PP/6K1 w - - 0 1", expects:["Qxh7#","Qh7#"] },
  { name:"Mate em 1 (Re8#)", fen:"4k3/8/8/8/8/8/4R3/4K3 w - - 0 1", expects:["Re8#"] },
  { name:"Tática: garfo de cavalo", fen:"r1bqkbnr/pppp1ppp/2n5/4p3/3P4/2N5/PPP1PPPP/R1BQKBNR w KQkq - 2 3", expects:null },
  { name:"Mate simples (Qe8#)", fen:"4k3/8/8/8/8/4Q3/8/4K3 w - - 0 1", expects:["Qe8#"] }
];

function main() {
  const depth = parseInt(process.argv[2] || "7", 10);
  const timeMs = parseInt(process.argv[3] || "2000", 10);

  let pass=0;
  for (const c of CASES) {
    const chess = new Chess();
    chess.load(c.fen);
    const res = findBestMove(chess, depth, timeMs);
    const san = res.bestMove ? res.bestMove.san : null;

    let ok = true;
    if (c.expects) ok = c.expects.includes(san);
    // quando expects=null, apenas reporta
    if (c.expects) {
      console.log(c.name, "→", san, ok ? "ok" : "falha");
      if (ok) pass++;
    } else {
      console.log(c.name, "→", san, "(relatório)");
      pass++;
    }
  }
  console.log({ total: CASES.length, aprovados: pass });
}

main();
