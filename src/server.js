require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");
const crypto = require("crypto");
const { attachLobbyRealtime, makeSecret } = require("./lib/lobbyRealtime");

const DATA_DIR = path.join(__dirname, "..", "data");
const CERT_DIR = path.join(DATA_DIR, "certs");

if (!process.env.VERCEL) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(CERT_DIR)) fs.mkdirSync(CERT_DIR, { recursive: true });
}

const { appendLobbyRanking, listLobbyRanking } = require("./db/lobbyRankingPrisma");
const {
  usePersistedLobbies,
  loadLobby,
  persistLobby,
  createLobbySession,
  transactionLobbyUpdate
} = require("./db/lobbySessionStore");

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

if (!process.env.VERCEL) {
  // Hack: Concatenação de string evita que o Vercel File Trace (nft) agrupe os 241MB
  // de src/public na função serverless (ultrapassando os 250MB do limite).
  const folderName = ["p", "u", "b", "l", "i", "c"].join("");
  app.use(
    "/",
    express.static(path.join(__dirname, folderName), {
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
    res.sendFile(path.join(__dirname, folderName, "favicon.svg"));
  });
}

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

// ---------- Multiplayer API (memória no processo; requer Node long-running para produção) ----------
const memoryLobbies = {};
/** @type {(lobbyId: string, msg: object) => void} */
let lobbyBroadcastToLobby = function () {};

/** Expõe limites do alojamento (Vercel + Postgres = salas na BD; WS só em Node long-running). */
app.get("/api/lobby/capabilities", (req, res) => {
  const serverless = Boolean(process.env.VERCEL);
  const dbUrl = process.env.DATABASE_URL || "";
  const pgOk = /^postgres(ql)?:\/\//i.test(dbUrl);
  res.json({
    ok: true,
    persistentLobbies: !serverless || pgOk,
    websocketLobby: !serverless,
    httpPollFallback: serverless && pgOk
  });
});

const DISCONNECT_AWARD_MS = 120000; // 2 min — vitória de quem permanece ligado (WS)

function lobbyEnsureExtras(lobby) {
  if (!lobby) return;
  if (!Array.isArray(lobby.spectators)) lobby.spectators = [];
  if (!lobby.wsSecrets) lobby.wsSecrets = { w: makeSecret(), b: null, spectators: {} };
  if (!lobby.wsSecrets.spectators || typeof lobby.wsSecrets.spectators !== "object") {
    lobby.wsSecrets.spectators = {};
  }
  if (lobby.maxSpectators == null) lobby.maxSpectators = 8;
}

function lobbyClaimMsLeft(lobby, seat) {
  const d = lobby.disconnectStartedAt?.[seat];
  if (!d) return 0;
  return Math.max(0, DISCONNECT_AWARD_MS - (Date.now() - d));
}

async function finalizeLobbyMatch(lobbyId, winner, reasonCode, reasonLabel) {
  const lobby = await loadLobby(memoryLobbies, lobbyId);
  if (!lobby || lobby.finished) return false;
  lobby.finished = true;
  lobby.winnerColor = winner === "draw" ? null : winner;
  lobby.endReason = reasonCode;
  lobby.endReasonLabel = reasonLabel;
  lobby.endedAt = Date.now();
  const names = lobby.names || {};
  const started = lobby.startedAt || lobby.createdAt || lobby.endedAt;
  const durationSec = Math.max(0, Math.round((lobby.endedAt - started) / 1000));
  let scoreW = 0.5;
  let scoreB = 0.5;
  if (winner === "w") {
    scoreW = 1;
    scoreB = 0;
  } else if (winner === "b") {
    scoreW = 0;
    scoreB = 1;
  }
  void appendLobbyRanking({
    lobbyId,
    whiteName: names.white || "Brancas",
    blackName: names.black || "Pretas",
    winner,
    reasonCode,
    reasonLabel,
    scoreWhite: scoreW,
    scoreBlack: scoreB,
    durationSec,
    startedAt: new Date(started).toISOString(),
    endedAt: new Date(lobby.endedAt).toISOString(),
    recordedAt: new Date().toISOString()
  }).catch((e) => console.error("[lobby/ranking] Prisma:", e.message));
  await persistLobby(memoryLobbies, lobbyId, lobby);
  try {
    lobbyBroadcastToLobby(lobbyId, {
      type: "game_over",
      winner,
      reasonCode,
      reasonLabel,
      durationSec
    });
  } catch (_) {
    /* ignore */
  }
  return true;
}

async function tickLobbyDisconnectAwards() {
  if (usePersistedLobbies()) return;
  const now = Date.now();
  for (const lobbyId of Object.keys(memoryLobbies)) {
    const lobby = memoryLobbies[lobbyId];
    if (!lobby || lobby.finished || lobby.players.length < 2) continue;
    const wW = lobby.wsCount?.w ?? 0;
    const wB = lobby.wsCount?.b ?? 0;
    const d = lobby.disconnectStartedAt || { w: null, b: null };
    const e = lobby.everHadWs || { w: false, b: false };
    if (wW > 0 && wB === 0 && e.b && d.b && now - d.b >= DISCONNECT_AWARD_MS) {
      await finalizeLobbyMatch(
        lobbyId,
        "w",
        "disconnect_timeout",
        "Vitória das brancas — oponente ausente (tempo real) por 2+ minutos."
      );
      continue;
    }
    if (wB > 0 && wW === 0 && e.w && d.w && now - d.w >= DISCONNECT_AWARD_MS) {
      await finalizeLobbyMatch(
        lobbyId,
        "b",
        "disconnect_timeout",
        "Vitória das pretas — oponente ausente (tempo real) por 2+ minutos."
      );
      continue;
    }
    if (lobby.bothOfflineSince && now - lobby.bothOfflineSince >= DISCONNECT_AWARD_MS) {
      await finalizeLobbyMatch(
        lobbyId,
        "draw",
        "dual_offline",
        "Empate — ambos ausentes (tempo real) por 2+ minutos."
      );
    }
  }
}

function sanitizeLobbyName(s) {
  if (typeof s !== "string") return "";
  return s.trim().slice(0, 48);
}

function sanitizeLobbyPassword(s) {
  if (typeof s !== "string") return "";
  return s.trim().slice(0, 64);
}

function lobbyPasswordOk(lobby, provided) {
  const stored = lobby.password;
  if (!stored) return true;
  const p = typeof provided === "string" ? provided : "";
  try {
    const a = Buffer.from(p, "utf8");
    const b = Buffer.from(stored, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** @returns {null | { status: number, json: object }} */
function lobbyMutateJoin(lobby, joinName, password) {
  if (!lobbyPasswordOk(lobby, password)) {
    return { status: 403, json: { error: "Senha incorreta" } };
  }
  if (lobby.players.length !== 1) {
    return { status: 400, json: { error: "Sala cheia ou não existe" } };
  }
  lobbyEnsureExtras(lobby);
  lobby.players.push(2);
  lobby.updatedAt = Date.now();
  lobby.startedAt = Date.now();
  if (!lobby.names) {
    lobby.names = { white: null, black: null, opponentExpected: null };
  }
  lobby.names.black = joinName || null;
  if (!lobby.wsSecrets) lobby.wsSecrets = { w: makeSecret(), b: null, spectators: {} };
  if (!lobby.wsSecrets.spectators) lobby.wsSecrets.spectators = {};
  lobby.wsSecrets.b = makeSecret();
  return null;
}

app.post("/api/lobby/create", async (req, res) => {
  const playerName = sanitizeLobbyName(req.body?.playerName);
  const opponentName = sanitizeLobbyName(req.body?.opponentName);
  const passwordRaw = sanitizeLobbyPassword(req.body?.password);
  const maxSpectators = Math.min(32, Math.max(1, parseInt(req.body?.maxSpectators, 10) || 8));
  for (let attempt = 0; attempt < 10; attempt++) {
    const lobbyId = Math.random().toString(36).substring(2, 8);
    const lobby = {
      players: [1],
      maxPlayers: 2,
      maxSpectators,
      spectators: [],
      password: passwordRaw || null,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      lastMove: null,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      startedAt: null,
      finished: false,
      wsCount: { w: 0, b: 0 },
      disconnectStartedAt: { w: null, b: null },
      everHadWs: { w: false, b: false },
      bothOfflineSince: null,
      names: {
        white: playerName || null,
        black: null,
        opponentExpected: opponentName || null
      },
      chat: [],
      wsSecrets: { w: makeSecret(), b: null, spectators: {} }
    };
    try {
      await createLobbySession(memoryLobbies, lobbyId, lobby);
    } catch (e) {
      if (usePersistedLobbies() && e.code === "P2002") continue;
      if (e.code === "LOBBY_ID_COLLISION") continue;
      console.error("[lobby/create]", e.message);
      return res.status(500).json({ error: "Erro ao criar sala." });
    }
    return res.json({
      ok: true,
      lobbyId,
      color: "w",
      names: lobby.names,
      maxPlayers: 2,
      maxSpectators: lobby.maxSpectators,
      hasPassword: Boolean(lobby.password),
      wsSecret: lobby.wsSecrets.w,
      realtimePath: "/api/lobby/socket"
    });
  }
  return res.status(500).json({ error: "Não foi possível criar uma sala. Tente novamente." });
});

app.post("/api/lobby/join", async (req, res) => {
  const { lobbyId } = req.body;
  const joinName = sanitizeLobbyName(req.body?.playerName);
  const password = req.body?.password;
  try {
    if (usePersistedLobbies()) {
      const tr = await transactionLobbyUpdate(lobbyId, (lobby) => lobbyMutateJoin(lobby, joinName, password));
      if (!tr.ok) return res.status(tr.error.status).json(tr.error.json);
      const lobby = tr.lobby;
      return res.json({
        ok: true,
        lobbyId,
        color: "b",
        fen: lobby.fen,
        names: lobby.names,
        maxPlayers: 2,
        maxSpectators: lobby.maxSpectators,
        hasPassword: Boolean(lobby.password),
        wsSecret: lobby.wsSecrets.b,
        realtimePath: "/api/lobby/socket"
      });
    }
    const lobby = await loadLobby(memoryLobbies, lobbyId);
    if (!lobby) {
      return res.status(400).json({ error: "Sala não existe" });
    }
    const err = lobbyMutateJoin(lobby, joinName, password);
    if (err) return res.status(err.status).json(err.json);
    await persistLobby(memoryLobbies, lobbyId, lobby);
    return res.json({
      ok: true,
      lobbyId,
      color: "b",
      fen: lobby.fen,
      names: lobby.names,
      maxPlayers: 2,
      maxSpectators: lobby.maxSpectators,
      hasPassword: Boolean(lobby.password),
      wsSecret: lobby.wsSecrets.b,
      realtimePath: "/api/lobby/socket"
    });
  } catch (e) {
    console.error("[lobby/join]", e.message);
    return res.status(500).json({ error: "Erro ao entrar na sala." });
  }
});

app.post("/api/lobby/spectate", async (req, res) => {
  const lobbyId = req.body?.lobbyId;
  const playerName = sanitizeLobbyName(req.body?.playerName);
  const password = req.body?.password;
  /** @type {{ token: string, id: string } | null} */
  let spectateResult = null;
  try {
    const run = (lobby) => {
      if (!lobby || lobby.finished) {
        return { status: 400, json: { error: "Sala inválida" } };
      }
      lobbyEnsureExtras(lobby);
      if (!lobbyPasswordOk(lobby, password)) {
        return { status: 403, json: { error: "Senha incorreta" } };
      }
      if (lobby.players.length < 2) {
        return { status: 400, json: { error: "Aguarde dois jogadores na sala para assistir." } };
      }
      const cap = lobby.maxSpectators || 8;
      if (lobby.spectators.length >= cap) {
        return { status: 400, json: { error: "Limite de espectadores atingido." } };
      }
      const id = crypto.randomBytes(6).toString("hex");
      const token = makeSecret();
      const disp = playerName || "Espectador";
      lobby.spectators.push({ id, name: disp });
      lobby.wsSecrets.spectators[token] = { id, name: disp };
      spectateResult = { token, id };
      return null;
    };
    if (usePersistedLobbies()) {
      const tr = await transactionLobbyUpdate(lobbyId, run);
      if (!tr.ok) return res.status(tr.error.status).json(tr.error.json);
      if (!spectateResult) return res.status(500).json({ error: "Erro ao assistir." });
      return res.json({
        ok: true,
        wsSecret: spectateResult.token,
        spectatorId: spectateResult.id,
        role: "spectator",
        realtimePath: "/api/lobby/socket"
      });
    }
    const lobby = await loadLobby(memoryLobbies, lobbyId);
    const err = run(lobby);
    if (err) return res.status(err.status).json(err.json);
    await persistLobby(memoryLobbies, lobbyId, lobby);
    if (!spectateResult) return res.status(500).json({ error: "Erro ao assistir." });
    return res.json({
      ok: true,
      wsSecret: spectateResult.token,
      spectatorId: spectateResult.id,
      role: "spectator",
      realtimePath: "/api/lobby/socket"
    });
  } catch (e) {
    console.error("[lobby/spectate]", e.message);
    return res.status(500).json({ error: "Erro ao assistir." });
  }
});

app.post("/api/lobby/claim-seat", async (req, res) => {
  const { lobbyId, seat, playerName, spectatorSecret } = req.body || {};
  if (seat !== "w" && seat !== "b") {
    return res.status(400).json({ error: "Indique seat: \"w\" ou \"b\"." });
  }
  const password = req.body?.password;
  let claimNewSec = null;
  let claimName = null;
  try {
    const mutator = (lobby) => {
      if (!lobby || lobby.finished) {
        return { status: 400, json: { error: "Sala inválida" } };
      }
      lobbyEnsureExtras(lobby);
      if (!lobbyPasswordOk(lobby, password)) {
        return { status: 403, json: { error: "Senha incorreta" } };
      }
      if (lobby.players.length < 2) {
        return { status: 400, json: { error: "Partida ainda não começou." } };
      }
      const wc = lobby.wsCount || { w: 0, b: 0 };
      if (wc[seat] > 0) {
        return { status: 400, json: { error: "Esse lugar já está ocupado no tempo real." } };
      }
      const t0 = lobby.disconnectStartedAt?.[seat];
      if (!t0 || Date.now() - t0 > DISCONNECT_AWARD_MS) {
        return {
          status: 400,
          json: {
            error: "Não há lugar livre para ocupar (ou passaram 2 minutos — vitória por ausência)."
          }
        };
      }
      if (spectatorSecret && lobby.wsSecrets.spectators?.[spectatorSecret]) {
        const meta = lobby.wsSecrets.spectators[spectatorSecret];
        lobby.spectators = lobby.spectators.filter((s) => s.id !== meta.id);
        delete lobby.wsSecrets.spectators[spectatorSecret];
      }
      const nm = sanitizeLobbyName(playerName) || (seat === "w" ? "Brancas" : "Pretas");
      if (seat === "w") lobby.names.white = nm;
      else lobby.names.black = nm;
      const newSec = makeSecret();
      lobby.wsSecrets[seat] = newSec;
      lobby.disconnectStartedAt = lobby.disconnectStartedAt || { w: null, b: null };
      lobby.disconnectStartedAt[seat] = null;
      lobby.everHadWs = lobby.everHadWs || { w: false, b: false };
      lobby.everHadWs[seat] = false;
      lobby.updatedAt = Date.now();
      claimNewSec = newSec;
      claimName = nm;
      return null;
    };
    if (usePersistedLobbies()) {
      const tr = await transactionLobbyUpdate(lobbyId, mutator);
      if (!tr.ok) return res.status(tr.error.status).json(tr.error.json);
      const lobby = tr.lobby;
      try {
        lobbyBroadcastToLobby(lobbyId, {
          type: "seat_claimed",
          seat,
          name: claimName,
          names: { ...lobby.names }
        });
      } catch (_) {
        /* ignore */
      }
      return res.json({
        ok: true,
        color: seat,
        wsSecret: claimNewSec,
        names: lobby.names,
        fen: lobby.fen,
        realtimePath: "/api/lobby/socket"
      });
    }
    const lobby = await loadLobby(memoryLobbies, lobbyId);
    const err = mutator(lobby);
    if (err) return res.status(err.status).json(err.json);
    await persistLobby(memoryLobbies, lobbyId, lobby);
    try {
      lobbyBroadcastToLobby(lobbyId, {
        type: "seat_claimed",
        seat,
        name: claimName,
        names: { ...lobby.names }
      });
    } catch (_) {
      /* ignore */
    }
    return res.json({
      ok: true,
      color: seat,
      wsSecret: claimNewSec,
      names: lobby.names,
      fen: lobby.fen,
      realtimePath: "/api/lobby/socket"
    });
  } catch (e) {
    console.error("[lobby/claim-seat]", e.message);
    return res.status(500).json({ error: "Erro ao ocupar lugar." });
  }
});

app.get("/api/lobby/status/:lobbyId", async (req, res) => {
  try {
    const { lobbyId } = req.params;
    const lobby = await loadLobby(memoryLobbies, lobbyId);
    if (!lobby) return res.status(404).json({ error: "Lobby não encontrado" });
    lobbyEnsureExtras(lobby);
    const names = lobby.names || { white: null, black: null, opponentExpected: null };
    const wc = lobby.wsCount || { w: 0, b: 0 };
    const canClaim = (seat) =>
      !lobby.finished &&
      lobby.players.length >= 2 &&
      wc[seat] === 0 &&
      lobbyClaimMsLeft(lobby, seat) > 0;
    return res.json({
      ok: true,
      playersCount: lobby.players.length,
      maxPlayers: lobby.maxPlayers || 2,
      spectatorsCount: lobby.spectators.length,
      maxSpectators: lobby.maxSpectators || 8,
      hasPassword: Boolean(lobby.password),
      fen: lobby.fen,
      lastMove: lobby.lastMove,
      names,
      finished: Boolean(lobby.finished),
      winner: lobby.finished ? lobby.winnerColor || "draw" : null,
      endReason: lobby.endReason || null,
      endReasonLabel: lobby.endReasonLabel || null,
      seatClaimable: { w: canClaim("w"), b: canClaim("b") },
      claimMsLeft: { w: lobbyClaimMsLeft(lobby, "w"), b: lobbyClaimMsLeft(lobby, "b") }
    });
  } catch (e) {
    console.error("[lobby/status]", e.message);
    return res.status(500).json({ error: "Erro ao ler sala." });
  }
});

app.get("/api/lobby/ranking", async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  try {
    const entries = await listLobbyRanking(limit);
    return res.json({ ok: true, entries });
  } catch (e) {
    console.error("[lobby/ranking]", e.message);
    return res.status(500).json({ ok: false, error: "Falha ao ler ranking (corra: npx prisma migrate deploy)" });
  }
});

app.post("/api/lobby/finish", async (req, res) => {
  const { lobbyId, fen } = req.body || {};
  try {
    const lobby = await loadLobby(memoryLobbies, lobbyId);
    if (!lobby || lobby.finished) {
      return res.status(400).json({ error: "Sala inválida ou partida já terminada" });
    }
    const chess = new Chess();
    if (!safeLoad(chess, fen)) return res.status(400).json({ error: "FEN inválido" });
    if (!chess.isGameOver()) return res.status(400).json({ error: "A partida ainda não terminou" });
    let winner = "draw";
    let reasonCode = "draw";
    let reasonLabel = "Empate.";
    if (chess.isCheckmate()) {
      winner = chess.turn() === "w" ? "b" : "w";
      reasonCode = "checkmate";
      reasonLabel =
        winner === "w"
          ? "Xeque-mate — vitória das brancas."
          : "Xeque-mate — vitória das pretas.";
    } else if (chess.isStalemate()) {
      reasonCode = "stalemate";
      reasonLabel = "Afogamento — empate.";
    } else if (chess.isInsufficientMaterial()) {
      reasonCode = "insufficient";
      reasonLabel = "Material insuficiente — empate.";
    } else if (chess.isThreefoldRepetition()) {
      reasonCode = "repetition";
      reasonLabel = "Tripla repetição — empate.";
    } else if (chess.isDrawByFiftyMoves()) {
      reasonCode = "fifty";
      reasonLabel = "Regra dos 50 lances — empate.";
    }
    await finalizeLobbyMatch(lobbyId, winner, reasonCode, reasonLabel);
    return res.json({ ok: true });
  } catch (e) {
    console.error("[lobby/finish]", e.message);
    return res.status(500).json({ error: "Erro ao finalizar." });
  }
});

app.post("/api/lobby/move", async (req, res) => {
  const { lobbyId, move, fen } = req.body;
  try {
    if (usePersistedLobbies()) {
      const tr = await transactionLobbyUpdate(lobbyId, (lobby) => {
        if (lobby.finished) return { status: 400, json: { error: "Partida terminada" } };
        lobby.fen = fen;
        lobby.lastMove = move;
        lobby.updatedAt = Date.now();
        return null;
      });
      if (!tr.ok) return res.status(tr.error.status).json(tr.error.json);
      return res.json({ ok: true });
    }
    const lobby = await loadLobby(memoryLobbies, lobbyId);
    if (lobby) {
      if (lobby.finished) return res.status(400).json({ error: "Partida terminada" });
      lobby.fen = fen;
      lobby.lastMove = move;
      lobby.updatedAt = Date.now();
      await persistLobby(memoryLobbies, lobbyId, lobby);
      return res.json({ ok: true });
    }
    return res.status(404).json({ error: "Lobby não encontrado" });
  } catch (e) {
    console.error("[lobby/move]", e.message);
    return res.status(500).json({ error: "Erro ao registar lance." });
  }
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
  const server = http.createServer(app);
  try {
    const rt = attachLobbyRealtime(server, { memoryLobbies });
    lobbyBroadcastToLobby = (lobbyId, msg) => rt.broadcastToLobby(lobbyId, msg);
  } catch (e) {
    console.warn("[Sator] WebSocket lobby não disponível:", e.message);
  }
  server.listen(PORT, () => {
    console.log(`Interface Sator Engine: http://localhost:${PORT}`);
    setInterval(() => {
      void tickLobbyDisconnectAwards();
    }, 10000);
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
  const server = https.createServer(opts, app);
  try {
    const rt = attachLobbyRealtime(server, { memoryLobbies });
    lobbyBroadcastToLobby = (lobbyId, msg) => rt.broadcastToLobby(lobbyId, msg);
  } catch (e) {
    console.warn("[Sator] WebSocket lobby não disponível:", e.message);
  }
  server.listen(PORT, () => {
    console.log(`Interface Sator Engine: https://localhost:${PORT} (certificado autoassinado — aceite o aviso no browser para o PWA)`);
    setInterval(() => {
      void tickLobbyDisconnectAwards();
    }, 10000);
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
