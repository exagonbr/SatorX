/**
 * Seeds sintéticos por estilo de mestre + opcional TD(0) na value net (aprendizado contínuo).
 * Metodologias e métricas são heurísticas de policy (não dados históricos reais dos jogadores).
 */
const fs = require("fs");
const path = require("path");
const { Chess } = require("chess.js");
const { toFeatureVector } = require("../eval/featureVector");
const { tdStep } = require("../eval/valueNet");
const { evaluateHeuristicOnly } = require("../eval/weights");
const { clearTranspositionTable } = require("../engine");

const REPLAY_DIR = path.join(__dirname, "..", "..", "data", "replays");

const PIECE_VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

const MASTER_PROFILES = {
  kasparov: {
    id: "kasparov",
    displayName: "Garry Kasparov",
    methodology: [
      "Preparação de abertura profunda e variantes agressivas",
      "Pressão dinâmica e luta pela iniciativa em todas as fases",
      "Cálculo de variantes táticas e sacrifícios posicionais calculados",
      "Psicologia competitiva: forçar decisões difíceis ao adversário"
    ],
    metrics: {
      mate: 200000,
      check: 8000,
      captureBase: 2000,
      captureMatMul: 1,
      promotion: 3000,
      centerSquare: 200,
      developPiece: 350,
      castle: 700,
      centralPawn: 150,
      rankAdvancePawn: 40
    },
    topPool: 6,
    openingLines: [
      ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7"],
      ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"],
      ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5", "Be7", "e3", "O-O"],
      ["c4", "e5", "Nc3", "Nf6", "g3", "Bb4", "Bg2", "O-O", "Nf3", "Re8"]
    ]
  },
  carlsen: {
    id: "carlsen",
    displayName: "Magnus Carlsen",
    methodology: [
      "Pragmatismo: escolher posições jogáveis e pouco claras",
      "Finais e técnica: converter vantagens mínimas com paciência",
      "Versatilidade de aberturas e evitar preparação estreita do adversário",
      "Resistência e precisão sob pressão de tempo e cansaco"
    ],
    metrics: {
      mate: 200000,
      check: 5200,
      captureBase: 1750,
      captureMatMul: 1.05,
      promotion: 3200,
      centerSquare: 265,
      developPiece: 310,
      castle: 820,
      centralPawn: 195,
      rankAdvancePawn: 55,
      endgameKingCentral: 120
    },
    topPool: 4,
    openingLines: [
      ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6", "O-O", "Nxe4", "d4", "Nd6"],
      ["d4", "Nf6", "c4", "e6", "Nf3", "d5", "g3", "Be7", "Bg2", "O-O"],
      ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"],
      ["c4", "c5", "Nc3", "Nc6", "g3", "g6", "Bg2", "Bg7", "Nf3", "Nf6"]
    ]
  },
  polgar: {
    id: "polgar",
    displayName: "Judit Polgár",
    methodology: [
      "Xadrez de ataque e tática: buscar complicações quando favorece o talento",
      "Aberturas agressivas com brancas; defesas dinâmicas com pretas",
      "Confiança no cálculo e em posições imbalanced",
      "Estilo de luta constante — evitar simplificações cedendo iniciativa"
    ],
    metrics: {
      mate: 200000,
      check: 9200,
      captureBase: 2150,
      captureMatMul: 1.08,
      promotion: 3100,
      centerSquare: 210,
      developPiece: 380,
      castle: 680,
      centralPawn: 145,
      rankAdvancePawn: 45,
      queenAggression: 180
    },
    topPool: 6,
    openingLines: [
      ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "Bg4"],
      ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4", "exd4"],
      ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "Nf3", "O-O"],
      ["e4", "e6", "d4", "d5", "Nc3", "Nf6", "Bg5", "Be7", "e5", "Nfd7"]
    ]
  }
};

function ensureReplayDir() {
  if (!fs.existsSync(REPLAY_DIR)) fs.mkdirSync(REPLAY_DIR, { recursive: true });
}

function scoreMove(chess, mv, M) {
  let s = 0;
  if (mv.san.includes("#")) s += M.mate;
  if (mv.san.includes("+")) s += M.check;
  if (mv.captured) {
    const gain = (PIECE_VAL[mv.captured] || 0) - (PIECE_VAL[mv.piece] || 0);
    s += M.captureBase + M.captureMatMul * gain;
  }
  if (mv.promotion) s += M.promotion;

  const center = new Set(["d4", "e4", "d5", "e5"]);
  if (center.has(mv.to)) s += M.centerSquare;

  if ((mv.piece === "n" || mv.piece === "b") && (mv.from[1] === "1" || mv.from[1] === "8")) {
    s += M.developPiece;
  }
  if (mv.san === "O-O" || mv.san === "O-O-O") s += M.castle;
  if (mv.piece === "p" && (mv.from[0] === "d" || mv.from[0] === "e")) s += M.centralPawn;

  if (M.rankAdvancePawn && mv.piece === "p") {
    const rank = mv.color === "w" ? parseInt(mv.to[1], 10) : 9 - parseInt(mv.to[1], 10);
    s += M.rankAdvancePawn * Math.max(0, rank - 2);
  }

  if (M.endgameKingCentral && mv.piece === "k") {
    const pcs = chess.board().flat().filter(Boolean).length;
    if (pcs <= 12) {
      const file = mv.to.charCodeAt(0) - 96;
      const rk = parseInt(mv.to[1], 10);
      const cd = Math.abs(file - 4.5);
      const rd = mv.color === "w" ? Math.abs(rk - 5.5) : Math.abs(rk - 4.5);
      s += M.endgameKingCentral * (1 / (1 + cd + rd));
    }
  }

  if (M.queenAggression && mv.piece === "q") {
    s += M.queenAggression;
  }

  return s;
}

function chooseMove(chess, profile) {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;
  const M = profile.metrics;
  const scored = moves.map((m) => ({ m, s: scoreMove(chess, m, M) })).sort((a, b) => b.s - a.s);
  const k = Math.min(profile.topPool, scored.length);
  const top = scored.slice(0, k);
  return top[Math.floor(Math.random() * top.length)].m;
}

function pickLine(profile) {
  const lines = profile.openingLines;
  return lines[Math.floor(Math.random() * lines.length)];
}

function playSeed({ profileKey, maxPlies = 60 }) {
  const profile = MASTER_PROFILES[profileKey];
  if (!profile) throw new Error(`Perfil desconhecido: ${profileKey}`);
  const chess = new Chess();
  const line = pickLine(profile);

  for (const san of line) {
    if (chess.isGameOver()) break;
    try {
      chess.move(san, { sloppy: true });
    } catch {
      break;
    }
  }

  while (!chess.isGameOver() && chess.history().length < maxPlies) {
    const mv = chooseMove(chess, profile);
    if (!mv) break;
    chess.move(mv);
  }

  let result = "draw";
  if (chess.isCheckmate()) result = chess.turn() === "w" ? "black" : "white";
  else if (chess.isDraw()) result = "draw";
  else result = "unknown";

  return { chess, result, profile };
}

function saveReplay({ id, chess, result, meta }) {
  ensureReplayDir();
  const rec = {
    id,
    createdAt: new Date().toISOString(),
    result,
    fen: chess.fen(),
    pgn: chess.pgn(),
    moves: chess.history(),
    meta
  };
  fs.writeFileSync(path.join(REPLAY_DIR, `${id}.json`), JSON.stringify(rec, null, 2));
}

/**
 * Aplica TD(0) lance a lance, como /api/move-learn.
 */
function feedGameToValueNet(chess) {
  const g = new Chess();
  const sans = chess.history();
  for (const san of sans) {
    const fenBefore = g.fen();
    g.move(san);
    const fenAfter = g.fen();

    const before = new Chess();
    before.load(fenBefore);
    const after = new Chess();
    after.load(fenAfter);

    const terminal = after.isGameOver();
    let outcomeForMover = 0;
    if (after.isCheckmate()) outcomeForMover = 1;
    else if (after.isDraw()) outcomeForMover = 0;

    tdStep({
      x0: toFeatureVector(before),
      x1: toFeatureVector(after),
      terminal,
      outcomeForMover,
      heuristicBefore: evaluateHeuristicOnly(before)
    });
  }
  clearTranspositionTable();
}

/**
 * Gera partidas por mestre, grava replays e opcionalmente alimenta a rede neural.
 * @param {object} opts
 * @param {string[]} [opts.styles]
 * @param {number} [opts.gamesPerMaster]
 * @param {number} [opts.maxPlies]
 * @param {boolean} [opts.saveReplays]
 * @param {boolean} [opts.feedNN]
 */
function runMasterSeedBurst(opts = {}) {
  const styles = opts.styles || Object.keys(MASTER_PROFILES);
  const gamesPerMaster = opts.gamesPerMaster ?? 1;
  const maxPlies = opts.maxPlies ?? 48;
  const saveReplays = opts.saveReplays !== false;
  const feedNN = opts.feedNN !== false;

  ensureReplayDir();
  const summary = { byStyle: {}, tdSteps: 0, replays: 0 };

  for (const key of styles) {
    const profile = MASTER_PROFILES[key];
    if (!profile) continue;
    summary.byStyle[key] = { white: 0, black: 0, draw: 0, unknown: 0, replays: 0 };

    for (let i = 0; i < gamesPerMaster; i++) {
      const { chess, result, profile: prof } = playSeed({ profileKey: key, maxPlies });
      const id = `${prof.id}_seed_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

      if (saveReplays) {
        saveReplay({
          id,
          chess,
          result,
          meta: {
            source: "master_continuous_seed",
            masterId: prof.id,
            displayName: prof.displayName,
            methodology: prof.methodology,
            metrics: prof.metrics,
            maxPlies,
            continuousLearning: true
          }
        });
        summary.replays += 1;
        summary.byStyle[key].replays += 1;
      }

      if (feedNN) {
        const pliesBefore = chess.history().length;
        feedGameToValueNet(chess);
        summary.tdSteps += pliesBefore;
      }

      if (result === "white") summary.byStyle[key].white += 1;
      else if (result === "black") summary.byStyle[key].black += 1;
      else if (result === "draw") summary.byStyle[key].draw += 1;
      else summary.byStyle[key].unknown += 1;
    }
  }

  return summary;
}

function parseStylesArg(arg) {
  const a = (arg || "all").toLowerCase();
  if (a === "all") return Object.keys(MASTER_PROFILES);
  if (MASTER_PROFILES[a]) return [a];
  return Object.keys(MASTER_PROFILES);
}

module.exports = {
  MASTER_PROFILES,
  REPLAY_DIR,
  scoreMove,
  chooseMove,
  playSeed,
  saveReplay,
  feedGameToValueNet,
  runMasterSeedBurst,
  parseStylesArg,
  ensureReplayDir
};
