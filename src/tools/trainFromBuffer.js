const fs = require("fs");
const path = require("path");
const { Chess } = require("chess.js");
const { findBestMove } = require("../engine");
const { randomBufferSample } = require("../db/replayStore");

const CFG_PATH = path.join(__dirname, "..", "eval", "weightsConfig.json");
const BUF_PATH = path.join(__dirname, "..", "..", "data", "replay_buffer.jsonl");

function loadCfg() {
  return JSON.parse(fs.readFileSync(CFG_PATH, "utf-8"));
}
function saveCfg(cfg) {
  fs.writeFileSync(CFG_PATH, JSON.stringify(cfg, null, 2));
}
function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

function loadBufferFromFile(limit = 2000) {
  if (!fs.existsSync(BUF_PATH)) return [];
  const raw = fs.readFileSync(BUF_PATH, "utf-8").trim();
  if (!raw) return [];
  const lines = raw.split("\n");
  const picked = [];
  for (let i = 0; i < lines.length && picked.length < limit; i++) {
    if (Math.random() < limit / Math.max(lines.length, 1)) {
      picked.push(JSON.parse(lines[i]));
    }
  }
  while (picked.length < Math.min(limit, lines.length)) {
    picked.push(JSON.parse(lines[Math.floor(Math.random() * lines.length)]));
  }
  return picked;
}

async function loadBufferFromDb(limit = 2000) {
  return randomBufferSample(limit);
}

function mutate(cfg, sigma = 0.06) {
  const out = JSON.parse(JSON.stringify(cfg));
  function nrand() {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  out.BASE.tactics = clamp(out.BASE.tactics * (1 + sigma * nrand()), 0.1, 3.0);
  out.BASE.king = clamp(out.BASE.king * (1 + sigma * nrand()), 0.1, 3.0);
  for (const mode of ["DEF", "ATK", "BAL"]) {
    for (const k of ["sator", "kasparov", "suntzu"]) {
      out.POLICY_MULTIPLIERS[mode][k] = clamp(
        out.POLICY_MULTIPLIERS[mode][k] * (1 + sigma * nrand()),
        0.2,
        2.5
      );
    }
  }
  return out;
}

function scoreOnPositions(positions, depth = 4, timeMs = 500, maxSamples = 120) {
  let score = 0;
  let used = 0;

  for (const row of positions) {
    if (used >= maxSamples) break;
    const chess = new Chess();
    try {
      chess.load(row.fen);
    } catch {
      continue;
    }

    if (chess.turn() !== "b") continue;

    const hard = row.result === "white";

    const bm = findBestMove(chess, depth, timeMs).bestMove;
    if (!bm) continue;
    chess.move(bm.san, { sloppy: true });

    const after = new Chess();
    after.load(chess.fen());
    let bad = 0;
    if (after.isCheckmate()) bad = 1;

    const inCheck = after.inCheck() ? 1 : 0;

    if (hard) {
      score += (bad ? -2 : 1) - inCheck * 0.5;
    } else {
      score += (bad ? -1 : 0.5) - inCheck * 0.2;
    }
    used++;
  }
  return { score, used };
}

/**
 * Treino heurístico a partir do buffer (BD ou ficheiro jsonl).
 * @param {{ fromFile?: boolean, iters?: number, depth?: number, timeMs?: number, quiet?: boolean }} opts
 */
async function runTrainFromBuffer(opts = {}) {
  const fromFile = opts.fromFile === true;
  const iters = opts.iters ?? 30;
  const depth = opts.depth ?? 4;
  const timeMs = opts.timeMs ?? 500;
  const quiet = opts.quiet === true;

  let positions;
  if (fromFile) {
    if (!fs.existsSync(BUF_PATH)) {
      throw new Error("Buffer ficheiro não encontrado. Rode: npm run build-buffer");
    }
    positions = loadBufferFromFile(3000);
  } else {
    positions = await loadBufferFromDb(3000);
  }

  if (!positions.length) {
    throw new Error(
      fromFile
        ? "Buffer vazio (jsonl). Rode: npm run build-buffer"
        : "Buffer vazio na base de dados. Guarde uma partida ou rode: npm run build-buffer"
    );
  }

  const baseCfg = loadCfg();
  let bestCfg = baseCfg;
  let best = scoreOnPositions(positions, depth, timeMs, 140);
  if (!quiet) console.log("Referência inicial:", best);

  for (let i = 1; i <= iters; i++) {
    const cand = mutate(bestCfg, 0.07);
    saveCfg(cand);
    const s = scoreOnPositions(positions, depth, timeMs, 140);
    if (!quiet) console.log(`Iteração ${i}:`, s, "melhor=", best.score);
    if (s.score > best.score) {
      best = s;
      bestCfg = cand;
      if (!quiet) console.log(">> Aceito");
    } else {
      saveCfg(bestCfg);
    }
  }

  if (!quiet) console.log("Melhor resultado final:", best);
  return best;
}

function parseCliArgs() {
  const fromFile = process.argv.includes("--file");
  const args = process.argv.slice(2).filter((x) => x !== "--file");
  return {
    fromFile,
    iters: parseInt(args[0] || "30", 10),
    depth: parseInt(args[1] || "4", 10),
    timeMs: parseInt(args[2] || "500", 10)
  };
}

async function main() {
  const { fromFile, iters, depth, timeMs } = parseCliArgs();
  try {
    await runTrainFromBuffer({ fromFile, iters, depth, timeMs });
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  runTrainFromBuffer,
  loadBufferFromFile,
  loadBufferFromDb,
  scoreOnPositions
};
