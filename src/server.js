const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");

if (process.env.VERCEL) {
  // Em ambiente Vercel (read-only), copia a DB para /tmp para permitir escritas temporárias
  const dbPath = path.join(__dirname, "..", "data", "ai_learning.db");
  const tmpDbPath = "/tmp/ai_learning.db";
  try {
    if (fs.existsSync(dbPath) && !fs.existsSync(tmpDbPath)) {
      fs.copyFileSync(dbPath, tmpDbPath);
    }
  } catch (err) {
    console.warn("Aviso Vercel: não foi possível copiar DB para /tmp", err);
  }
  process.env.DATABASE_URL = "file:/tmp/ai_learning.db";
} else if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:../data/ai_learning.db";
}

const DATA_DIR = path.join(__dirname, "..", "data");
const CERT_DIR = path.join(DATA_DIR, "certs");

if (!process.env.VERCEL) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(CERT_DIR)) fs.mkdirSync(CERT_DIR, { recursive: true });
}

function nowIso() { return new Date().toISOString(); }

/** chess.js v1: load() não retorna booleano; usa try/catch. */
function safeLoad(chess, fen) {
  if (!fen) return true;
  try {
    chess.load(fen);
    return true;
  } catch {
    return false;
  }
}

const { Chess } = require("chess.js");
const { findBestMove, clearTranspositionTable } = require("./engine");
const { analyzePosition } = require("./utils/report");
const { toFeatureVector } = require("./eval/featureVector");
const { tdStep, getStatus, forward } = require("./eval/valueNet");
const { classicalRatingPredictive, DEFAULT_REFERENCE_ELO } = require("./utils/nnRatingPredict");
const { evaluateHeuristicOnly } = require("./eval/weights");
const { runMasterSeedBurst } = require("./lib/masterStyleSeed");
const replayStore = require("./db/replayStore");
const { schedulePostGameTrain } = require("./db/postGameTrainScheduler");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use(
  "/",
  express.static(path.join(__dirname, "public"), {
    setHeaders(res, filePath) {
      if (filePath.endsWith("manifest.webmanifest")) {
        res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
      }
      if (path.basename(filePath) === "sw.js") {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      }
    }
  })
);

app.get("/favicon.ico", (req, res) => {
  res.type("image/svg+xml");
  res.sendFile(path.join(__dirname, "public", "favicon.svg"));
});

app.get("/api/ping", (req, res) => res.json({ ok: true }));

app.post("/api/bestmove", (req, res) => {
  const { fen, depth = 7, timeMs = 2500 } = req.body || {};
  const chess = new Chess();
  if (!safeLoad(chess, fen)) return res.status(400).json({ error: "FEN inválido" });
  const result = findBestMove(chess, depth, timeMs);
  return res.json(result);
});

// ---------- Replay API (Prisma / SQLite: game_replays + replay_buffer_rows) ----------
app.post("/api/replay/save", async (req, res) => {
  const { pgn, fen, result, moves, meta } = req.body || {};
  if (!pgn && !moves) return res.status(400).json({ error: "Envie pgn ou moves" });

  const id = meta && meta.id ? meta.id : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  const record = {
    id,
    createdAt: nowIso(),
    result: result || "unknown",
    fen: fen || null,
    pgn: pgn || null,
    moves: moves || [],
    meta: meta || {}
  };

  try {
    const { bufferRowsInserted } = await replayStore.saveReplayWithBuffer(record);
    schedulePostGameTrain();
    return res.json({ ok: true, id, bufferRowsInserted });
  } catch (e) {
    console.error("[replay/save]", e.message);
    return res.status(500).json({
      error: "Falha ao gravar replay na base de dados",
      hint: "Corra: npm run db:migrate"
    });
  }
});

app.get("/api/replay/list", async (req, res) => {
  try {
    const list = await replayStore.listReplays();
    return res.json({ ok: true, count: list.length, list });
  } catch (e) {
    console.error("[replay/list]", e.message);
    return res.status(500).json({ error: "Falha ao listar replays" });
  }
});

app.get("/api/replay/get/:id", async (req, res) => {
  try {
    const row = await replayStore.getReplayById(req.params.id);
    if (!row) return res.status(404).json({ error: "Replay não encontrado" });
    return res.json(row);
  } catch (e) {
    console.error("[replay/get]", e.message);
    return res.status(500).json({ error: "Falha ao ler replay" });
  }
});

app.post("/api/analyze", (req, res) => {
  const { fen } = req.body || {};
  const chess = new Chess();
  if (!safeLoad(chess, fen)) return res.status(400).json({ error: "FEN inválido" });
  return res.json(analyzePosition(chess));
});

function normFenCore(fen) {
  if (!fen || typeof fen !== "string") return "";
  const parts = fen.trim().split(/\s+/);
  return parts.slice(0, 4).join(" ");
}

/** TD(0) online após lance válido; invalida TT do motor. */
app.post("/api/move-learn", (req, res) => {
  const { fenBefore, fenAfter, san, enabled = true } = req.body || {};
  if (enabled === false) {
    return res.json({ ok: true, skipped: true });
  }
  if (!fenBefore || !fenAfter || !san) {
    return res.status(400).json({ error: "Envie fenBefore, fenAfter e san" });
  }

  const before = new Chess();
  if (!safeLoad(before, fenBefore)) return res.status(400).json({ error: "fenBefore inválido" });

  const trial = new Chess();
  if (!safeLoad(trial, fenBefore)) return res.status(400).json({ error: "fenBefore inválido" });
  let mv;
  try {
    mv = trial.move(san, { sloppy: true });
  } catch {
    mv = null;
  }
  if (!mv) return res.status(400).json({ error: "Lance ilegal para fenBefore" });

  if (normFenCore(trial.fen()) !== normFenCore(fenAfter)) {
    return res.status(400).json({ error: "fenAfter não corresponde ao lance" });
  }

  const after = new Chess();
  if (!safeLoad(after, fenAfter)) return res.status(400).json({ error: "fenAfter inválido" });

  const x0 = toFeatureVector(before);
  const x1 = toFeatureVector(after);
  const heuristicBefore = evaluateHeuristicOnly(before);

  const terminal = after.isGameOver();
  let outcomeForMover = 0;
  if (after.isCheckmate()) outcomeForMover = 1;
  else if (after.isDraw()) outcomeForMover = 0;

  const out = tdStep({
    x0,
    x1,
    terminal,
    outcomeForMover,
    heuristicBefore
  });
  clearTranspositionTable();

  return res.json({
    ok: true,
    terminal,
    outcomeForMover,
    ...out
  });
});

app.get("/api/nn/status", (req, res) => {
  return res.json({ ok: true, ...getStatus() });
});

/** Elo clássico preditivo (heurístico) a partir de V(s) da rede, vs oponente de referência. */
app.post("/api/nn/predict-rating", (req, res) => {
  const { fen, playerColor = "w", referenceElo } = req.body || {};
  const chess = new Chess();
  if (!safeLoad(chess, fen)) return res.status(400).json({ error: "FEN inválido" });
  const pc = playerColor === "b" ? "b" : "w";
  const refRaw =
    referenceElo != null && referenceElo !== ""
      ? Number(referenceElo)
      : parseInt(process.env.SATOR_NN_REFERENCE_ELO || String(DEFAULT_REFERENCE_ELO), 10);
  const ref = Number.isFinite(refRaw) ? refRaw : DEFAULT_REFERENCE_ELO;
  const vMover = forward(toFeatureVector(chess));
  const pred = classicalRatingPredictive(chess, vMover, pc, ref);
  return res.json({
    ok: true,
    sideToMove: chess.turn(),
    playerColor: pc,
    ratingPredictive: pred.ratingPredictive,
    ratingPredictiveRounded: Math.round(pred.ratingPredictive),
    expectedScorePlayer: pred.expectedScorePlayer,
    vMover: pred.vMover,
    referenceOpponentElo: pred.referenceOpponentElo,
    note: "Estimativa heurística a partir da rede de valor (não é rating oficial)."
  });
});

const PORT = parseInt(process.env.PORT || "3000", 10);
const HTTPS_ENABLED =
  process.env.HTTPS_ENABLED === "1" ||
  process.env.HTTPS_ENABLED === "true" ||
  process.env.HTTPS_ENABLED === "yes";
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || path.join(CERT_DIR, "selfsigned.key");
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || path.join(CERT_DIR, "selfsigned.crt");

/** Aprendizado contínuo na subida: replays sintéticos (Kasparov, Carlsen, Polgár) + TD(0) na value net. */
function scheduleMasterContinuousSeed() {
  if (process.env.SATOR_DISABLE_MASTER_SEED === "1") return;
  const gamesPerMaster = parseInt(process.env.SATOR_MASTER_SEED_GAMES || "1", 10);
  const maxPlies = parseInt(process.env.SATOR_MASTER_SEED_PLIES || "48", 10);
  if (gamesPerMaster <= 0) return;
  setImmediate(() => {
    try {
      const r = runMasterSeedBurst({
        gamesPerMaster,
        maxPlies,
        saveReplays: true,
        feedNN: true
      });
      console.log("[Sator] Aprendizado contínuo (mestres):", JSON.stringify(r));
    } catch (e) {
      console.error("[Sator] Seed de mestres falhou:", e.message);
    }
  });
}

function listenHttp() {
  http.createServer(app).listen(PORT, () => {
    console.log(`Interface Sator Engine: http://localhost:${PORT}`);
    scheduleMasterContinuousSeed();
  });
}

function listenHttps() {
  if (!fs.existsSync(SSL_KEY_PATH) || !fs.existsSync(SSL_CERT_PATH)) {
    console.warn(
      "[Sator] HTTPS_ENABLED mas ficheiros em falta:",
      SSL_KEY_PATH,
      SSL_CERT_PATH,
      "— a usar HTTP. Corra: bash scripts/gen-selfsigned-cert.sh"
    );
    listenHttp();
    return;
  }
  const opts = {
    key: fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH)
  };
  https.createServer(opts, app).listen(PORT, () => {
    console.log(`Interface Sator Engine: https://localhost:${PORT} (certificado autoassinado — aceite o aviso no browser para o PWA)`);
    scheduleMasterContinuousSeed();
  });
}

if (process.env.VERCEL) {
  // Em ambiente Vercel (serverless), exportamos a app em vez de escutar portas localmente
  module.exports = app;
} else {
  if (HTTPS_ENABLED) {
    listenHttps();
  } else {
    listenHttp();
  }
}
