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
    styleLabel: "pressão dinâmica",
    nationality: "Rússia",
    age: 63,
    ranking: "Elo FIDE 2812 (inativo); pico 2851; n.º 1 mundial (1984–2005)",
    biography:
      "Garry Kimovich Kasparov nasceu em Baku a 13 de abril de 1963. Campeão Mundial de 1985 a 2000, foi o n.º 1 do ranking durante 255 meses e retirou-se da competição regular em 2005 ainda no topo. O seu Elo de pico (2851, em 1999) foi recorde mundial até 2013.",
    playingStyle: [
      "Ataque dinâmico e luta pela iniciativa em todas as fases",
      "Preparação profunda de aberturas e variantes agressivas",
      "Cálculo tático, sacrifícios posicionais e pressão psicológica",
      "Repertório: Ruy López, Siciliana Najdorf, Escocesa, Gambito da Dama, Inglesa, Índia do Rei (Sämisch) e Grünfeld"
    ],
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
      ["c4", "e5", "Nc3", "Nf6", "g3", "Bb4", "Bg2", "O-O", "Nf3", "Re8"],
      ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Nf6", "Nc3", "Bb4"],
      ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "f3", "O-O"],
      ["d4", "Nf6", "c4", "g6", "Nc3", "d5", "cxd5", "Nxd5", "e4", "Nxc3"]
    ]
  },
  carlsen: {
    id: "carlsen",
    displayName: "Magnus Carlsen",
    styleLabel: "técnica pragmática",
    nationality: "Noruega",
    age: 35,
    ranking: "Elo FIDE 2823; 1.º do mundo (set. 2026); pico 2882",
    biography:
      "Sven Magnus Øen Carlsen nasceu em Tønsberg a 30 de novembro de 1990. Cinco vezes campeão mundial clássico (2013–2023), lidera o ranking FIDE desde 2011 e detém o recorde de Elo da história (2882). Também acumula títulos mundiais de rápido, blitz e Freestyle.",
    playingStyle: [
      "Estilo universal e pragmático: posições jogáveis, pouco teóricas",
      "Técnica de finais e conversão paciente de vantagens mínimas",
      "Versatilidade de aberturas para evitar preparação estreita",
      "Repertório: Ruy López (Berlim), Catalã, Siciliana Dragão, Inglesa simétrica, Sistema London, Italiana e Caro-Kann"
    ],
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
      ["c4", "c5", "Nc3", "Nc6", "g3", "g6", "Bg2", "Bg7", "Nf3", "Nf6"],
      ["d4", "Nf6", "Nf3", "d5", "Bf4", "c5", "e3", "Nc6", "c3", "e6"],
      ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "d3", "Nf6", "c3", "a6"],
      ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5", "Ng3", "Bg6"]
    ]
  },
  polgar: {
    id: "polgar",
    displayName: "Judit Polgár",
    styleLabel: "ataque tático",
    nationality: "Hungria",
    age: 50,
    ranking: "Elo FIDE 2675 (inativo); pico 2735; 8.ª do mundo (2004)",
    biography:
      "Judit Polgár nasceu em Budapeste a 23 de julho de 1976. É a única mulher a entrar no top 10 mundial e a ultrapassar 2700 Elo. Tornou-se Grande Mestre aos 15 anos, recusou o circuito feminino e enfrentou a elite masculina até se retirar da competição em 2014.",
    playingStyle: [
      "Xadrez de ataque e tática: complicações e posições desequilibradas",
      "1.e4 agressivo com brancas; defesas dinâmicas com pretas",
      "Luta constante — evita simplificações que cedem a iniciativa",
      "Repertório: Siciliana, Italiana, Índia do Rei, Francesa, Gambito do Rei, Ruy López e Ataque Austríaco (Pirc)"
    ],
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
      ["e4", "e6", "d4", "d5", "Nc3", "Nf6", "Bg5", "Be7", "e5", "Nfd7"],
      ["e4", "e5", "f4", "exf4", "Nf3", "g5", "h4", "g4", "Ne5", "Nf6"],
      ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "b5"],
      ["e4", "d6", "d4", "Nf6", "Nc3", "g6", "f4", "Bg7", "Nf3", "O-O"]
    ]
  },
  belenkaya: {
    id: "belenkaya",
    displayName: "Dina Belenkaya",
    styleLabel: "ataque prático",
    nationality: "França",
    age: 32,
    ranking: "Elo FIDE 2237; pico 2364 (fev. 2019)",
    biography:
      "Dina Vadimovna Belenkaya nasceu em São Petersburgo a 22 de dezembro de 1993. Quatro vezes campeã feminina de São Petersburgo e participante da Copa do Mundo Feminina de 2021. Representou a Rússia até 2022, Israel entre 2022 e 2026, e a França desde 2026. Também é comentarista e criadora de conteúdo de xadrez.",
    playingStyle: [
      "Ataque prático: complicar a posição e forçar erros sob pressão",
      "1.e4 agressivo — Italiana, Escocesa e gambitos de iniciativa",
      "Defesas dinâmicas com pretas e ritmo de blitz no relógio",
      "Repertório: Italiana, Escocesa, Gambito Evans, Siciliana Dragão, Francesa Winawer, Índia do Rei e Escandinava"
    ],
    methodology: [
      "Xadrez de ataque prático: complicar a posição e forçar erros sob pressão",
      "Repertório 1.e4 agressivo — Italiana, Escocesa e gambitos de iniciativa",
      "Defesas dinâmicas com pretas (Siciliana, Francesa, Índia do Rei)",
      "Ritmo de blitz: decisões rápidas, peça ativa e pressão constante no relógio"
    ],
    metrics: {
      mate: 200000,
      check: 8600,
      captureBase: 2050,
      captureMatMul: 1.06,
      promotion: 3050,
      centerSquare: 225,
      developPiece: 370,
      castle: 640,
      centralPawn: 155,
      rankAdvancePawn: 52,
      queenAggression: 155,
      knightForward: 95
    },
    topPool: 7,
    openingLines: [
      ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4", "exd4"],
      ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Bc5", "Be3", "Qf6"],
      ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4", "Bxb4", "c3", "Ba5"],
      ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"],
      ["e4", "e6", "d4", "d5", "Nc3", "Bb4", "e5", "c5", "a3", "Bxc3+"],
      ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "Nf3", "O-O"],
      ["e4", "d5", "exd5", "Qxd5", "Nc3", "Qa5", "d4", "Nf6", "Nf3", "c6"]
    ]
  }
};

function ensureReplayDir() {
  if (process.env.VERCEL) return;
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

  if (M.knightForward && mv.piece === "n") {
    const rank = mv.color === "w" ? parseInt(mv.to[1], 10) : 9 - parseInt(mv.to[1], 10);
    s += M.knightForward * Math.max(0, rank - 3);
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
  if (!process.env.VERCEL) {
    fs.writeFileSync(path.join(REPLAY_DIR, `${id}.json`), JSON.stringify(rec, null, 2));
  }
}

/**
 * Aplica TD(0) lance a lance, como /api/move-learn.
 */
function feedGameToValueNet(chess, startFen) {
  const g = new Chess();
  if (startFen) {
    try {
      const ok = g.load(startFen);
      if (ok === false) return;
    } catch {
      return;
    }
  }
  const sans = chess.history();
  for (const san of sans) {
    const fenBefore = g.fen();
    try {
      g.move(san);
    } catch {
      break;
    }
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
 * O volume por estilo segue o log de pensamento do motor (mestres mais usados recebem mais seeds).
 * @param {object} opts
 * @param {string[]} [opts.styles]
 * @param {number} [opts.gamesPerMaster]
 * @param {number} [opts.maxPlies]
 * @param {boolean} [opts.saveReplays]
 * @param {boolean} [opts.feedNN]
 * @param {boolean} [opts.reinforceThoughtLog]
 */
function styleGameCounts(gamesPerMaster) {
  let freq = {};
  try {
    freq = require("../db/masterThoughtStore").masterFrequencies();
  } catch {
    freq = {};
  }
  const keys = Object.keys(MASTER_PROFILES);
  const total = keys.reduce((s, k) => s + (freq[k] || 0), 0);
  const out = {};
  for (const k of keys) {
    if (total < 6) out[k] = gamesPerMaster;
    else {
      const share = (freq[k] || 0) / total;
      out[k] = Math.max(1, Math.round(gamesPerMaster * (0.55 + share * 1.2)));
    }
  }
  return { counts: out, freq, total };
}

function playFromFen({ profileKey, fen, firstSan, extraPlies = 24 }) {
  const profile = MASTER_PROFILES[profileKey];
  if (!profile) return null;
  const chess = new Chess();
  try {
    const ok = chess.load(fen);
    if (ok === false) return null;
  } catch {
    return null;
  }
  const startFen = chess.fen();
  if (firstSan) {
    try {
      chess.move(firstSan);
    } catch {
      /* posição já pode incluir o lance */
    }
  }
  let n = 0;
  while (!chess.isGameOver() && n < extraPlies) {
    const mv = chooseMove(chess, profile);
    if (!mv) break;
    chess.move(mv);
    n += 1;
  }
  let result = "draw";
  if (chess.isCheckmate()) result = chess.turn() === "w" ? "black" : "white";
  else if (chess.isDraw()) result = "draw";
  else result = "unknown";
  return { chess, result, profile, startFen };
}

function runThoughtLogReinforce(opts = {}) {
  const extraPlies = opts.extraPlies ?? 20;
  const limit = opts.limit ?? 16;
  const feedNN = opts.feedNN !== false;
  const saveReplays = opts.saveReplays === true;
  let rows = [];
  try {
    rows = require("../db/masterThoughtStore").readRecent(limit);
  } catch {
    rows = [];
  }
  const summary = { used: 0, tdSteps: 0, skipped: 0, byStyle: {} };
  for (const row of rows) {
    if (!row.masterId || !MASTER_PROFILES[row.masterId] || !row.fen) {
      summary.skipped += 1;
      continue;
    }
    const played = playFromFen({
      profileKey: row.masterId,
      fen: row.fen,
      firstSan: row.san,
      extraPlies
    });
    if (!played) {
      summary.skipped += 1;
      continue;
    }
    summary.used += 1;
    summary.byStyle[row.masterId] = (summary.byStyle[row.masterId] || 0) + 1;
    if (saveReplays) {
      const id = `${played.profile.id}_thought_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      saveReplay({
        id,
        chess: played.chess,
        result: played.result,
        meta: {
          source: "master_thought_reinforce",
          masterId: played.profile.id,
          displayName: played.profile.displayName,
          fromThought: {
            san: row.san,
            why: row.why,
            phase: row.phase,
            moveName: row.moveName
          }
        }
      });
    }
    if (feedNN) {
      const plies = played.chess.history().length;
      feedGameToValueNet(played.chess, played.startFen);
      summary.tdSteps += plies;
    }
  }
  return summary;
}

function runMasterSeedBurst(opts = {}) {
  const styles = opts.styles || Object.keys(MASTER_PROFILES);
  const gamesPerMaster = opts.gamesPerMaster ?? 1;
  const maxPlies = opts.maxPlies ?? 48;
  const saveReplays = opts.saveReplays !== false;
  const feedNN = opts.feedNN !== false;
  const weighted = styleGameCounts(gamesPerMaster);

  ensureReplayDir();
  const summary = { byStyle: {}, tdSteps: 0, replays: 0, thoughtWeights: weighted };

  for (const key of styles) {
    const profile = MASTER_PROFILES[key];
    if (!profile) continue;
    summary.byStyle[key] = { white: 0, black: 0, draw: 0, unknown: 0, replays: 0 };
    const nGames = weighted.counts[key] ?? gamesPerMaster;

    for (let i = 0; i < nGames; i++) {
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
            nationality: prof.nationality,
            age: prof.age,
            ranking: prof.ranking,
            biography: prof.biography,
            playingStyle: prof.playingStyle,
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

  if (opts.reinforceThoughtLog !== false) {
    try {
      summary.thoughtReinforce = runThoughtLogReinforce({
        extraPlies: Math.min(20, maxPlies),
        limit: 12,
        feedNN,
        saveReplays: false
      });
    } catch (e) {
      summary.thoughtReinforce = { error: e.message };
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
  playFromFen,
  saveReplay,
  feedGameToValueNet,
  runMasterSeedBurst,
  runThoughtLogReinforce,
  styleGameCounts,
  parseStylesArg,
  ensureReplayDir
};
