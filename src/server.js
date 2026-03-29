const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");

const DATA_DIR = path.join(__dirname, "..", "data");
const REPLAY_DIR = path.join(DATA_DIR, "replays");
const CERT_DIR = path.join(DATA_DIR, "certs");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(REPLAY_DIR)) fs.mkdirSync(REPLAY_DIR);
if (!fs.existsSync(CERT_DIR)) fs.mkdirSync(CERT_DIR, { recursive: true });

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
const { tdStep, getStatus } = require("./eval/valueNet");
const { evaluateHeuristicOnly } = require("./eval/weights");

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

// ---------- Replay API ----------
app.post("/api/replay/save", (req, res) => {
  const { pgn, fen, result, moves, meta } = req.body || {};
  if (!pgn && !moves) return res.status(400).json({ error: "Envie pgn ou moves" });

  const id = (meta && meta.id) ? meta.id : (Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,8));
  const record = {
    id,
    createdAt: nowIso(),
    result: result || "unknown", // white|black|draw|unknown (do ponto de vista do usuário=brancas)
    fen: fen || null,
    pgn: pgn || null,
    moves: moves || null,
    meta: meta || {}
  };

  const file = path.join(REPLAY_DIR, `${id}.json`);
  fs.writeFileSync(file, JSON.stringify(record, null, 2));
  return res.json({ ok: true, id });
});

app.get("/api/replay/list", (req, res) => {
  const files = fs.readdirSync(REPLAY_DIR).filter(f => f.endsWith(".json"));
  const list = files.map(f => {
    const p = path.join(REPLAY_DIR, f);
    const o = JSON.parse(fs.readFileSync(p, "utf-8"));
    return { id: o.id, createdAt: o.createdAt, result: o.result, meta: o.meta || {} };
  }).sort((a,b) => (a.createdAt < b.createdAt ? 1 : -1));
  return res.json({ ok: true, count: list.length, list });
});

app.get("/api/replay/get/:id", (req, res) => {
  const id = req.params.id;
  const file = path.join(REPLAY_DIR, `${id}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: "Replay não encontrado" });
  return res.json(JSON.parse(fs.readFileSync(file, "utf-8")));
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

const PORT = parseInt(process.env.PORT || "3000", 10);
const HTTPS_ENABLED =
  process.env.HTTPS_ENABLED === "1" ||
  process.env.HTTPS_ENABLED === "true" ||
  process.env.HTTPS_ENABLED === "yes";
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || path.join(CERT_DIR, "selfsigned.key");
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || path.join(CERT_DIR, "selfsigned.crt");

function listenHttp() {
  http.createServer(app).listen(PORT, () => {
    console.log(`Interface Sator Engine: http://localhost:${PORT}`);
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
  });
}

if (HTTPS_ENABLED) {
  listenHttps();
} else {
  listenHttp();
}
