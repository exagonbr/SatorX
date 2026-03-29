const fs = require("fs");
const path = require("path");
const { Chess } = require("chess.js");
const { findBestMove } = require("../engine");

const CFG_PATH = path.join(__dirname, "..", "eval", "weightsConfig.json");
const BUF_PATH = path.join(__dirname, "..", "..", "data", "replay_buffer.jsonl");

function loadCfg() { return JSON.parse(fs.readFileSync(CFG_PATH, "utf-8")); }
function saveCfg(cfg) { fs.writeFileSync(CFG_PATH, JSON.stringify(cfg, null, 2)); }
function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }

function loadBuffer(limit=2000) {
  const lines = fs.readFileSync(BUF_PATH, "utf-8").trim().split("\n");
  // sample uniformly
  const picked = [];
  for (let i=0; i<lines.length && picked.length<limit; i++) {
    if (Math.random() < limit/Math.max(lines.length,1)) {
      picked.push(JSON.parse(lines[i]));
    }
  }
  // if low, top-up
  while (picked.length < Math.min(limit, lines.length)) {
    picked.push(JSON.parse(lines[Math.floor(Math.random()*lines.length)]));
  }
  return picked;
}

function mutate(cfg, sigma=0.06) {
  const out = JSON.parse(JSON.stringify(cfg));
  function nrand() {
    let u=0,v=0; while(u===0)u=Math.random(); while(v===0)v=Math.random();
    return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
  }
  out.BASE.tactics = clamp(out.BASE.tactics * (1 + sigma*nrand()), 0.1, 3.0);
  out.BASE.king = clamp(out.BASE.king * (1 + sigma*nrand()), 0.1, 3.0);
  for (const mode of ["DEF","ATK","BAL"]) {
    for (const k of ["sator","kasparov","suntzu"]) {
      out.POLICY_MULTIPLIERS[mode][k] = clamp(out.POLICY_MULTIPLIERS[mode][k] * (1 + sigma*nrand()), 0.2, 2.5);
    }
  }
  return out;
}

function scoreOnPositions(positions, depth=4, timeMs=500, maxSamples=120) {
  // Objective: reduzir perdas do motor em posições de replays (usuário=brancas).
  // Interpretação:
  // - Se replay result foi "white" (usuário venceu), queremos que motor (pretas) encontre defesa melhor.
  //   Então avaliamos apenas posições onde é turno das pretas.
  // - Se replay result foi "black" (motor venceu), reforça comportamento atual.
  // Score: +1 se motor melhora (evita mate rápido) em posições ruins, medido por estabilidade (não estar em checkmate em poucas plies).
  let score = 0;
  let used = 0;

  for (const row of positions) {
    if (used >= maxSamples) break;
    const chess = new Chess();
    if (!chess.load(row.fen)) continue;

    // somente quando pretas jogam (motor)
    if (chess.turn() !== "b") continue;

    // foco em replays que o motor perdeu (white venceu)
    const hard = (row.result === "white");

    const bm = findBestMove(chess, depth, timeMs).bestMove;
    if (!bm) continue;
    chess.move(bm.san, { sloppy: true });

    // quick sanity: se motor se coloca em mate imediato, penaliza
    const after = new Chess();
    after.load(chess.fen());
    let bad = 0;
    if (after.isCheckmate()) bad = 1;

    // approximate: if still in check, slight penalty
    const inCheck = after.inCheck() ? 1 : 0;

    if (hard) {
      score += (bad ? -2 : 1) - inCheck*0.5;
    } else {
      score += (bad ? -1 : 0.5) - inCheck*0.2;
    }
    used++;
  }
  return { score, used };
}

function main() {
  if (!fs.existsSync(BUF_PATH)) {
    console.error("Buffer não encontrado. Rode: npm run build-buffer");
    process.exit(1);
  }

  const iters = parseInt(process.argv[2] || "30", 10);
  const depth = parseInt(process.argv[3] || "4", 10);
  const timeMs = parseInt(process.argv[4] || "500", 10);

  const positions = loadBuffer(3000);

  const baseCfg = loadCfg();
  let bestCfg = baseCfg;
  let best = scoreOnPositions(positions, depth, timeMs, 140);
  console.log("Referência inicial:", best);

  for (let i=1;i<=iters;i++){
    const cand = mutate(bestCfg, 0.07);
    saveCfg(cand);
    const s = scoreOnPositions(positions, depth, timeMs, 140);
    console.log(`Iteração ${i}:`, s, "melhor=", best.score);
    if (s.score > best.score) {
      best = s;
      bestCfg = cand;
      console.log(">> Aceito");
    } else {
      saveCfg(bestCfg);
    }
  }

  console.log("Melhor resultado final:", best);
}

main();
