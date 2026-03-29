const fs = require("fs");
const path = require("path");
const { Chess } = require("chess.js");
const { findBestMove } = require("../engine");

const CFG_PATH = path.join(__dirname, "..", "eval", "weightsConfig.json");

function loadCfg() { return JSON.parse(fs.readFileSync(CFG_PATH, "utf-8")); }
function saveCfg(cfg) { fs.writeFileSync(CFG_PATH, JSON.stringify(cfg, null, 2)); }

function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

function mutate(cfg, sigma=0.12) {
  const out = JSON.parse(JSON.stringify(cfg));
  // Mutate BASE weights and multipliers slightly
  function nrand() {
    // Box-Muller
    let u=0,v=0; while(u===0)u=Math.random(); while(v===0)v=Math.random();
    return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
  }
  out.BASE.tactics = clamp(out.BASE.tactics * (1 + sigma*nrand()), 0.1, 2.0);
  out.BASE.king = clamp(out.BASE.king * (1 + sigma*nrand()), 0.1, 2.5);
  // Keep sacred constant-ish by design; you can unlock if you want.
  for (const mode of ["DEF","ATK","BAL"]) {
    for (const k of ["sator","kasparov","suntzu"]) {
      out.POLICY_MULTIPLIERS[mode][k] = clamp(out.POLICY_MULTIPLIERS[mode][k] * (1 + sigma*nrand()), 0.2, 2.0);
    }
  }
  return out;
}

function playGame(depth=4, timeMs=600, maxPlies=140) {
  const chess = new Chess();
  let plies = 0;
  while (!chess.isGameOver() && plies < maxPlies) {
    const bm = findBestMove(chess, depth, timeMs).bestMove;
    if (!bm) break;
    chess.move(bm.san, { sloppy: true });
    plies++;
  }
  if (chess.isCheckmate()) return chess.turn()==="w" ? -1 : +1; // side to move is mated
  return 0;
}

function evaluateCfg(games=6, depth=4, timeMs=600) {
  let score = 0;
  for (let i=0;i<games;i++) score += playGame(depth, timeMs);
  return score;
}

function main() {
  const iters = parseInt(process.argv[2] || "20", 10);
  const games = parseInt(process.argv[3] || "6", 10);
  const depth = parseInt(process.argv[4] || "4", 10);
  const timeMs = parseInt(process.argv[5] || "600", 10);

  const baseCfg = loadCfg();
  let bestCfg = baseCfg;
  let bestScore = evaluateCfg(games, depth, timeMs);
  console.log("baselineScore:", bestScore);

  for (let t=1;t<=iters;t++){
    const cand = mutate(bestCfg, 0.10);
    saveCfg(cand);
    const s = evaluateCfg(games, depth, timeMs);
    console.log(`iter ${t}: score=${s} best=${bestScore}`);
    if (s > bestScore) {
      bestScore = s;
      bestCfg = cand;
      console.log(">> accepted new cfg");
    } else {
      saveCfg(bestCfg); // revert
    }
  }

  console.log("finalBestScore:", bestScore);
}

main();
