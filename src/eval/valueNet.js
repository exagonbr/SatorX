/**
 * MLP pequena (valor por lado a jogar) + TD(0) online + persistência em data/.
 */
const fs = require("fs");
const path = require("path");
const { FEATURE_DIM } = require("./featureVector");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const WEIGHTS_PATH = path.join(DATA_DIR, "nnWeights.json");
const CONFIG_PATH = path.join(DATA_DIR, "nnConfig.json");

const DEFAULT_CONFIG = {
  useInEval: true,
  scale: 45,
  gamma: 0.99,
  lr: 0.002,
  anchorBeta: 0.08,
  heuristicScale: 1800,
  gradClip: 1.2,
  hidden: 64
};

let state = {
  W1: null,
  b1: null,
  W2: null,
  b2: 0,
  hidden: 64,
  inputDim: FEATURE_DIM,
  updates: 0,
  lastTdError: 0,
  lastLearnAt: null
};

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadNNConfig() {
  ensureDirs();
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return { ...DEFAULT_CONFIG };
  }
  return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8")) };
}

function saveNNConfig(cfg) {
  ensureDirs();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

function randn() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function initWeights(hidden) {
  const dIn = FEATURE_DIM;
  const scale1 = Math.sqrt(2 / (dIn + hidden));
  const W1 = [];
  const b1 = [];
  for (let r = 0; r < hidden; r++) {
    const row = [];
    for (let c = 0; c < dIn; c++) row.push(randn() * scale1);
    W1.push(row);
    b1.push(randn() * scale1 * 0.1);
  }
  const scale2 = Math.sqrt(2 / (hidden + 1));
  const W2 = [];
  for (let r = 0; r < hidden; r++) W2.push(randn() * scale2);
  const b2 = randn() * scale2 * 0.1;
  return { W1, b1, W2, b2 };
}

function loadFromDisk() {
  ensureDirs();
  const cfg = loadNNConfig();
  const h = cfg.hidden || DEFAULT_CONFIG.hidden;
  if (!fs.existsSync(WEIGHTS_PATH)) {
    const w = initWeights(h);
    state = { ...state, ...w, hidden: h, inputDim: FEATURE_DIM, updates: 0, lastTdError: 0, lastLearnAt: null };
    saveToDisk();
    return;
  }
  const o = JSON.parse(fs.readFileSync(WEIGHTS_PATH, "utf-8"));
  state.W1 = o.W1;
  state.b1 = o.b1;
  state.W2 = o.W2;
  state.b2 = o.b2 ?? 0;
  state.hidden = o.hidden || h;
  state.inputDim = o.inputDim || FEATURE_DIM;
  state.updates = o.updates || 0;
  state.lastTdError = o.lastTdError || 0;
  state.lastLearnAt = o.lastLearnAt || null;
}

function saveToDisk() {
  ensureDirs();
  const tmp = WEIGHTS_PATH + ".tmp";
  const payload = {
    W1: state.W1,
    b1: state.b1,
    W2: state.W2,
    b2: state.b2,
    hidden: state.hidden,
    inputDim: state.inputDim,
    updates: state.updates,
    lastTdError: state.lastTdError,
    lastLearnAt: state.lastLearnAt
  };
  fs.writeFileSync(tmp, JSON.stringify(payload));
  fs.renameSync(tmp, WEIGHTS_PATH);
}

/**
 * Forward: retorna valor escalar e caches para backward.
 */
function forwardPass(x) {
  const { W1, b1, W2, b2 } = state;
  const hidden = state.hidden;
  const z1 = new Array(hidden);
  const h = new Array(hidden);
  for (let r = 0; r < hidden; r++) {
    let s = b1[r];
    const row = W1[r];
    for (let c = 0; c < x.length; c++) s += row[c] * x[c];
    z1[r] = s;
    h[r] = Math.tanh(s);
  }
  let out = b2;
  for (let r = 0; r < hidden; r++) out += W2[r] * h[r];
  return { out, h, z1, x };
}

function forward(x) {
  if (!state.W1) loadFromDisk();
  return forwardPass(x).out;
}

function clip(v, max) {
  if (v > max) return max;
  if (v < -max) return -max;
  return v;
}

/**
 * Um passo TD(0): V(s) aproxima target; semi-gradiente.
 * @param {object} p
 * @param {number[]} p.x0 features em s (antes do lance; quem joga é o mover)
 * @param {number[]} p.x1 features em s' (depois; adversário a jogar), ignorado se terminal
 * @param {boolean} p.terminal
 * @param {number} p.outcomeForMover +1 vitória do jogador que moveu, -1 derrota, 0 empate
 * @param {number} p.heuristicBefore evaluate heurístico em s (âncora)
 */
function tdStep(p) {
  if (!state.W1) loadFromDisk();
  const cfg = loadNNConfig();
  const lr = cfg.lr;
  const gamma = cfg.gamma;
  const beta = cfg.anchorBeta;
  const Hs = cfg.heuristicScale;
  const gc = cfg.gradClip;

  const f0 = forwardPass(p.x0);
  let vNext = 0;
  if (!p.terminal) {
    vNext = forwardPass(p.x1).out;
  }

  let tdTarget = p.terminal ? p.outcomeForMover : -gamma * vNext;
  const hAnch = Math.tanh(p.heuristicBefore / Hs);
  tdTarget = (1 - beta) * tdTarget + beta * hAnch;

  const delta = clip(tdTarget - f0.out, 5);
  state.lastTdError = delta;
  state.updates += 1;
  state.lastLearnAt = new Date().toISOString();

  const hidden = state.hidden;
  const { h, z1, x } = f0;

  let gOut = delta;
  gOut = clip(gOut, gc);

  const dB2 = gOut;
  const dW2 = h.map((hr) => gOut * hr);

  const dH = state.W2.map((w2r) => gOut * w2r);
  const dZ1 = dH.map((dh, r) => clip(dh * (1 - h[r] * h[r]), gc));

  for (let r = 0; r < hidden; r++) {
    state.b1[r] += lr * dZ1[r];
    for (let c = 0; c < x.length; c++) {
      const gW = dZ1[r] * x[c];
      state.W1[r][c] += lr * clip(gW, gc);
    }
  }
  state.b2 += lr * dB2;
  for (let r = 0; r < hidden; r++) {
    state.W2[r] += lr * clip(dW2[r], gc);
  }

  saveToDisk();
  return {
    tdError: delta,
    vBefore: f0.out,
    vAfter: p.terminal ? null : vNext,
    tdTarget
  };
}

function getStatus() {
  if (!state.W1) loadFromDisk();
  const cfg = loadNNConfig();
  return {
    inputDim: FEATURE_DIM,
    hidden: state.hidden,
    updates: state.updates,
    lastTdError: state.lastTdError,
    lastLearnAt: state.lastLearnAt,
    config: {
      useInEval: cfg.useInEval,
      scale: cfg.scale,
      gamma: cfg.gamma,
      lr: cfg.lr,
      anchorBeta: cfg.anchorBeta
    }
  };
}

function getNNConfig() {
  return loadNNConfig();
}

// Carrega na inicialização do processo
loadFromDisk();

module.exports = {
  forward,
  tdStep,
  getStatus,
  getNNConfig,
  loadFromDisk,
  saveToDisk,
  loadNNConfig,
  FEATURE_DIM
};
