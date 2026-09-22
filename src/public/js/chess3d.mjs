import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { Chess } from "chess.js";
import { bindLiveGame, fetchPositionBook, restoreChess } from "/js/liveGameSession.mjs?v=2";
import {
  logFinishedMatch,
  resultFromChessGame,
  playersForMatch,
  resetMatchLogKey
} from "/js/matchLog.mjs?v=2";

function t(key, vars) {
  return window.SatorI18n ? window.SatorI18n.t(key, vars) : key;
}
function apiErr(msg, fallback) {
  return window.SatorI18n ? window.SatorI18n.apiError(msg, fallback) : (msg || fallback || "");
}

const SQ = 1;
const BOARD_PLANE_Y = 0.061;
const FILES = "abcdefgh";

function prefersReducedData() {
  if (typeof window === "undefined" || typeof matchMedia === "undefined") return false;
  try {
    return matchMedia("(prefers-reduced-data: reduce)").matches;
  } catch {
    return false;
  }
}

function hideChess3dLoadingOverlay() {
  const el = document.getElementById("chess3d-loading");
  if (!el || el.dataset.done === "1") return;
  el.dataset.done = "1";
  el.classList.add("chess3d-loading--out");
  el.setAttribute("aria-busy", "false");
  setTimeout(() => el.remove(), 700);
}

function squareFromBoardRC(row, col) {
  return FILES[col] + (8 - row);
}

function sqToWorld(sq) {
  const col = FILES.indexOf(sq[0]);
  const rank = parseInt(sq[1], 10);
  const row = 8 - rank;
  const x = (col - 3.5) * SQ;
  const z = (row - 3.5) * SQ;
  return new THREE.Vector3(x, 0, z);
}

function worldToSquare(x, z) {
  if (x < -4.6 || x > 4.6 || z < -4.6 || z > 4.6) return null;
  const col = Math.min(7, Math.max(0, Math.floor(x / SQ + 4.0)));
  const row = Math.min(7, Math.max(0, Math.floor(z / SQ + 4.0)));
  return squareFromBoardRC(row, col);
}

const game = new Chess();
let sceneRef = null;
let cameraRef = null;
let controlsRef = null;
let rendererRef = null;
let composerRef = null;
/** @type {{
 *   fireLight: THREE.PointLight | null, firePhase: number,
 *   skybox: THREE.Mesh | null,
 *   candleLights: THREE.PointLight[], chandelierPhase: number,
 *   moonLight: THREE.PointLight | null,
 *   ceilingGroup: THREE.Group | null,
 *   dust: { points: THREE.Points, positions: Float32Array, phases: Float32Array, speeds: Float32Array } | null
 * }} */
const libraryAnim = {
  fireLight: null,
  firePhase: 0,
  skybox: null,
  candleLights: [],
  chandelierPhase: 0,
  moonLight: null,
  ceilingGroup: null,
  dust: null
};
let pieceNodes = [];
let busy = false;
let liveApi = null;
let bookRefreshTimer = null;

let multiplayerPollId = null;
let myMultiplayerColor = "w";
let currentLobbyId = null;
let chess3dToastTimer = null;
/** Contagem de jogadores no último poll (anfitrião vê toast quando passa de 1 a 2). */
let mpLastPlayersPollCount = 0;
let mpSocket = null;
let mpWsSecret = null;
let mpPingIntervalId = null;
let mpLastRttMs = null;
/** Evita duplicar linhas do chat quando o mesmo evento chega por WS e por poll HTTP. */
const mpChatSeenIds = new Set();

/** @type {{ ok: boolean, persistentLobbies?: boolean, websocketLobby?: boolean, httpPollFallback?: boolean } | null} */
let mpCaps = null;
let mpCapsPromise = null;
/** Incrementado em cada `connectMpRealtime` para ignorar resultados de tentativas antigas (async). */
let mpRealtimeConnectGen = 0;

function defaultMpCapsWhenUnknown() {
  const h = typeof location !== "undefined" ? location.hostname : "";
  const localDev =
    h === "localhost" ||
    h === "127.0.0.1" ||
    (h.length > 0 && h.endsWith(".local"));
  if (localDev) {
    return { ok: true, persistentLobbies: true, websocketLobby: true };
  }
  return { ok: true, persistentLobbies: false, websocketLobby: false };
}

/** @param {{ force?: boolean } | undefined} [options] */
function ensureLobbyCapabilities(options) {
  const force = options && options.force === true;
  if (force) {
    mpCaps = null;
    mpCapsPromise = null;
  }
  if (mpCaps) return Promise.resolve(mpCaps);
  if (mpCapsPromise) return mpCapsPromise;
  const fetchInit = force ? { cache: "no-store" } : {};
  mpCapsPromise = fetch("/api/lobby/capabilities", fetchInit)
    .then(async (r) => {
      let j = null;
      try {
        j = await r.json();
      } catch {
        j = null;
      }
      if (r.ok && j && j.ok && typeof j.persistentLobbies === "boolean") {
        mpCaps = j;
      } else {
        mpCaps = defaultMpCapsWhenUnknown();
      }
      return mpCaps;
    })
    .catch(() => {
      mpCaps = defaultMpCapsWhenUnknown();
      return mpCaps;
    });
  return mpCapsPromise;
}

const LS_MP_HOST_LOBBY = "sator_mp_host_lobby";
let mpLobbyActionBusy = false;

function rememberMpHostLobby(lobbyId) {
  try {
    if (lobbyId) localStorage.setItem(LS_MP_HOST_LOBBY, lobbyId);
  } catch (_) {
    /* quota / modo privado */
  }
}

function isMpHostOfLobby(lobbyId) {
  if (!lobbyId) return false;
  try {
    return localStorage.getItem(LS_MP_HOST_LOBBY) === lobbyId;
  } catch (_) {
    return false;
  }
}

const SS_MP_GUEST_SECRET = "satorx_mp_guest_";

function readMpGuestSecret(lobbyId) {
  if (!lobbyId) return "";
  try {
    const raw = sessionStorage.getItem(SS_MP_GUEST_SECRET + lobbyId);
    if (!raw) return "";
    const j = JSON.parse(raw);
    return typeof j.secret === "string" ? j.secret : "";
  } catch {
    return "";
  }
}

function rememberMpGuestSecret(lobbyId, secret) {
  try {
    if (lobbyId && secret) sessionStorage.setItem(SS_MP_GUEST_SECRET + lobbyId, JSON.stringify({ secret }));
  } catch (_) {}
}

function showToast(message, variant = "info") {
  const el = document.getElementById("chess3dToast");
  if (!el || !message) return;
  el.textContent = message;
  el.classList.remove("toast--success", "toast--error");
  if (variant === "success") el.classList.add("toast--success");
  else if (variant === "error") el.classList.add("toast--error");
  el.classList.add("toast--show");
  if (chess3dToastTimer) clearTimeout(chess3dToastTimer);
  chess3dToastTimer = setTimeout(() => {
    chess3dToastTimer = null;
    el.classList.remove("toast--show");
  }, variant === "error" ? 5200 : 3800);
}

function lobbyNamesLine(names, playersCount, lobbyId) {
  const n = names || {};
  const w = n.white || t("mp.white");
  const b = n.black || n.opponentExpected || null;
  if (playersCount > 1 && n.black) {
    return t("mp.roomVs", { id: lobbyId, w: w, b: n.black });
  }
  if (b) {
    return t("mp.roomWaitLink", { id: lobbyId, w: w, b: b });
  }
  return t("mp.roomWait", { id: lobbyId, w: w });
}

let mpResultPosted = false;
let mpServerEndShown = false;
let lastMpEnd = { reasonLabel: "", winner: "" };

function resetMpMatchReporting() {
  mpResultPosted = false;
  mpServerEndShown = false;
  mpOpponentReady = false;
}

/** Só permite jogar lances quando os dois jogadores estão na sala (convidado entrou). */
let mpOpponentReady = false;

let mpIsSpectator = false;
let mpLobbyNames = null;
let matchStartedAt = null;
let lastMatchLogKey = null;

function markMatchStarted() {
  if (!matchStartedAt) matchStartedAt = new Date().toISOString();
}

function resetMatchSession() {
  matchStartedAt = null;
  if (lastMatchLogKey) resetMatchLogKey(lastMatchLogKey);
  lastMatchLogKey = null;
}

async function logMatchIfFinished() {
  if (!game.isGameOver()) return;
  const mode = getMode();
  if (mode === "multiplayer") return;
  const outcome = resultFromChessGame(game);
  if (!outcome) return;
  const sessionId = liveApi && liveApi.snapshot ? liveApi.snapshot().id : null;
  const endedAt = new Date().toISOString();
  const sourceKey = sessionId
    ? "live:" + sessionId + ":" + endedAt.slice(0, 16)
    : "local-3d:" + endedAt;
  lastMatchLogKey = sourceKey;
  const players = playersForMatch({
    mode,
    playerColor: getPlayerColor()
  });
  let eloEngine = null;
  let eloPlayer = null;
  if (mode === "engine") {
    try {
      const st = await fetch("/api/nn/status").then((r) => r.json());
      if (st && st.ok && st.eloEstimateRounded != null) eloEngine = st.eloEstimateRounded;
      const pred = await fetch("/api/nn/predict-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen: game.fen(), playerColor: getPlayerColor() })
      }).then((r) => r.json());
      if (pred && pred.ok && pred.ratingPredictiveRounded != null) {
        eloPlayer = pred.ratingPredictiveRounded;
      }
    } catch {
      /* offline */
    }
  }
  await logFinishedMatch({
    sourceKey,
    mode,
    ui: "chess3d",
    ...players,
    winner: outcome.winner,
    reasonCode: outcome.reasonCode,
    scoreWhite: outcome.scoreWhite,
    scoreBlack: outcome.scoreBlack,
    eloEngine,
    eloPlayer,
    startedAt: matchStartedAt || endedAt,
    endedAt,
    sessionId: sessionId || ""
  });
}

function closeMpGameOverOverlay() {
  const overlay = document.getElementById("gameOverOverlay");
  if (overlay) {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
  }
}

function applyMpRematchBoard(fen) {
  const startFen =
    fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  mpServerEndShown = false;
  mpResultPosted = false;
  try {
    game.load(startFen);
    syncPiecesFromGame();
    syncCheckKingHighlight();
  } catch (_) {
    /* ignore */
  }
  updateStatus();
  updateGameOverOverlay();
  closeMpGameOverOverlay();
  resetMatchSession();
  resetClock();
  startClock();
}

async function requestMpRematch() {
  if (!currentLobbyId) return;
  const pass = (document.getElementById("mpJoinPassword")?.value || "").trim();
  showToast(t("mp.restarting"), "info");
  try {
    const r = await fetch("/api/lobby/rematch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lobbyId: currentLobbyId, password: pass })
    });
    const res = await r.json();
    if (!r.ok || !res.ok) {
      showToast(apiErr(res.error, "mp.errRematch"), "error");
      return;
    }
    applyMpRematchBoard(res.fen);
    if (!mpSocket || mpSocket.readyState !== WebSocket.OPEN) {
      showToast(t("mp.rematchOk"), "success");
    }
  } catch (e) {
    showToast(t("mp.net"), "error");
  }
}

function openMpServerEndOverlay(reasonLabel, winner) {
  mpServerEndShown = true;
  lastMpEnd = { reasonLabel: reasonLabel || "", winner: winner || "" };
  const overlay = document.getElementById("gameOverOverlay");
  const title = document.getElementById("goTitle");
  const detail = document.getElementById("goDetail");
  if (!overlay || !title || !detail) return;
  if (mpIsSpectator) {
    title.textContent = t("go.gameOver");
  } else if (winner === "draw") {
    title.textContent = t("go.gameOver");
  } else if (winner === myMultiplayerColor) {
    title.textContent = t("go.win");
  } else {
    title.textContent = t("go.loss");
  }
  detail.textContent = reasonLabel ? apiErr(reasonLabel) : t("go.ended");
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  stopClock();
}

function postMpFinishIfNeeded() {
  if (getMode() !== "multiplayer" || !currentLobbyId || !game.isGameOver() || mpResultPosted) return;
  mpResultPosted = true;
  fetch("/api/lobby/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lobbyId: currentLobbyId, fen: game.fen() })
  })
    .then(async (r) => {
      if (!r.ok) mpResultPosted = false;
    })
    .catch(() => {
      mpResultPosted = false;
    });
}

// ── Relógio ─────────────────────────────────────────────────────────────────────────────
let clockWhiteSecs = 0;
let clockBlackSecs = 0;
let clockInterval  = null;
let clockRunning   = false;
let clockWhiteTex  = null;
let clockBlackTex  = null;
/** Materiais das telas do relógio 3D (referência de módulo evita ReferenceError em strict mode). */
let clockScreenMatWhite = null;
let clockScreenMatBlack = null;
let chessClockRootRef = null;

function getMode() { return document.getElementById("mode").value; }
function getPlayerColor() { return document.getElementById("playerColor").value; }
function getCameraView() { const el = document.getElementById("cameraView"); return el ? el.value : "player"; }
function trainEnabled() { return document.getElementById("trainOnline").checked; }

function fmtClock(secs) {
  const s = Math.max(0, Math.floor(secs));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
}

function renderClockTexture(canvas, timeStr, label, isActive) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = '#0a0700';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = isActive ? '#c87a10' : '#4a3008';
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, w - 4, h - 4);
  ctx.fillStyle = isActive ? '#c87a10' : '#5a4010';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, w / 2, 22);
  ctx.fillStyle = isActive ? '#ffb830' : '#6a5020';
  ctx.font = 'bold 52px monospace';
  ctx.fillText(timeStr, w / 2, 82);
}

function tickClock() {
  if (!clockRunning || game.isGameOver()) return;
  if (getMode() === "multiplayer" && !mpIsSpectator && !mpOpponentReady) return;
  if (game.turn() === 'w') clockWhiteSecs++;
  else clockBlackSecs++;
  updateClockDisplays();
}

function updateClockDisplays() {
  const whiteTurn = game.turn() === 'w';
  const playerColor = getMode() === "human" ? "w" : getPlayerColor();
  
  const p1Time = playerColor === 'w' ? clockWhiteSecs : clockBlackSecs;
  const p2Time = playerColor === 'w' ? clockBlackSecs : clockWhiteSecs;
  const p1Active = playerColor === 'w' ? whiteTurn : !whiteTurn;
  const p2Active = playerColor === 'w' ? !whiteTurn : whiteTurn;
  const p1Label = getMode() === "human" ? t("clock.white") : t("clock.you");
  const p2Label = getMode() === "human" ? t("clock.black") : t("clock.engine");

  if (clockBlackTex && clockBlackTex.image) {
    renderClockTexture(clockBlackTex.image, fmtClock(p1Time), p1Label, p1Active);
    clockBlackTex.needsUpdate = true;
  }
  if (clockWhiteTex && clockWhiteTex.image) {
    renderClockTexture(clockWhiteTex.image, fmtClock(p2Time), p2Label, p2Active);
    clockWhiteTex.needsUpdate = true;
  }
}

function startClock() {
  markMatchStarted();
  if (clockInterval) clearInterval(clockInterval);
  clockRunning = true;
  clockInterval = setInterval(tickClock, 1000);
  updateClockDisplays();
}

function stopClock() {
  clockRunning = false;
  if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }
}

function resetClock() {
  stopClock();
  clockWhiteSecs = 0;
  clockBlackSecs = 0;
  updateClockDisplays();
}

// ── UI / Interação ───────────────────────────────────────────────────────────────────────
let tapSelection = { from: null };
const KIND_PRI = { castle: 7, ep: 6, capture_promo: 5, capture: 4, promo: 3, double: 2, quiet: 1 };
const KIND_COLOR = {
  selected: 0xf2c82e, quiet: 0x2eb861, capture: 0xe5382e, castle: 0x3866f2,
  ep: 0x9447e0, promo: 0xebad1f, double: 0x26c6d8, capture_promo: 0xeb6b1a,
  invalid_flash: 0xff1e1e, check_king: 0xff6a00, check_mate: 0xeb0518
};

let highlightMeshes = [];
function clearMoveHighlights() {
  for (const m of highlightMeshes) {
    sceneRef.remove(m);
    if(m.geometry) m.geometry.dispose();
    if(m.material) m.material.dispose();
  }
  highlightMeshes = [];
}

function placeHighlightDisc(sq, kind, diameter) {
  const alpha = kind === "selected" ? 0.38 : 0.5;
  const color = KIND_COLOR[kind] || KIND_COLOR.quiet;
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: alpha, depthWrite: false });
  const geom = new THREE.CylinderGeometry(diameter/2, diameter/2, 0.02, 32);
  const disc = new THREE.Mesh(geom, mat);
  const w = sqToWorld(sq);
  disc.position.set(w.x, BOARD_PLANE_Y + 0.014, w.z);
  disc.userData = { isHighlight: true, square: sq };
  sceneRef.add(disc);
  highlightMeshes.push(disc);
}

function showLegalMovesFor(fromSq) {
  clearMoveHighlights();
  applySelectionGlow(fromSq, true);
  const moves = game.moves({ square: fromSq, verbose: true });
  placeHighlightDisc(fromSq, "selected", 0.9);
  if (!moves.length) return;
  
  const legalToKind = new Map();
  for (const mv of moves) {
    let k = "quiet";
    const f = mv.flags || "";
    if (f.includes("k") || f.includes("q")) k = "castle";
    else if (f.includes("e")) k = "ep";
    else if (f.includes("p") && f.includes("c")) k = "capture_promo";
    else if (f.includes("p")) k = "promo";
    else if (f.includes("c")) k = "capture";
    else if (f.includes("b")) k = "double";

    const prev = legalToKind.get(mv.to);
    if (!prev || KIND_PRI[k] > KIND_PRI[prev]) legalToKind.set(mv.to, k);
  }
  for (const [sq, kind] of legalToKind) {
    placeHighlightDisc(sq, kind, 0.78);
  }
  syncCheckKingHighlight();
}

function applySelectionGlow(sq, enable) {
  for (const node of pieceNodes) {
    if (node.userData && node.userData.square === sq) {
      node.traverse((child) => {
        if (child.isMesh && child.material) {
          if (enable) {
            child.material.emissive = new THREE.Color(0x8c6114);
          } else {
            const isWhite = node.userData.color === "w";
            child.material.emissive = isWhite ? new THREE.Color(0x0a0907) : new THREE.Color(0x050406);
          }
        }
      });
      break;
    }
  }
}

function clearTapSelection() {
  if (tapSelection.from) applySelectionGlow(tapSelection.from, false);
  tapSelection.from = null;
  clearMoveHighlights();
  syncCheckKingHighlight();
}

let checkVisualMeshes = [];
function clearCheckVisual() {
  for (const m of checkVisualMeshes) {
    sceneRef.remove(m);
    if(m.geometry) m.geometry.dispose();
    if(m.material) m.material.dispose();
  }
  checkVisualMeshes = [];
}

function findKingSquare(ch, color) {
  const b = ch.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (p && p.type === "k" && p.color === color) return FILES[c] + (8 - r);
    }
  }
  return null;
}

function placeCheckThreatRing(sq, mode) {
  const isMate = mode === "mate";
  const color = isMate ? 0xf20a1f : 0xff6a14;
  const alpha = isMate ? 0.7 : 0.48;
  const d = isMate ? 1.04 : 0.96;
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: alpha, depthWrite: false });
  const geom = new THREE.CylinderGeometry(d/2, d/2, 0.026, 32);
  const disc = new THREE.Mesh(geom, mat);
  const w = sqToWorld(sq);
  disc.position.set(w.x, BOARD_PLANE_Y + 0.024, w.z);
  sceneRef.add(disc);
  checkVisualMeshes.push(disc);
}

function syncCheckKingHighlight() {
  clearCheckVisual();
  if (game.isCheckmate()) {
    const sq = findKingSquare(game, game.turn());
    if (sq) placeCheckThreatRing(sq, "mate");
  } else if (game.inCheck()) {
    const sq = findKingSquare(game, game.turn());
    if (sq) placeCheckThreatRing(sq, "check");
  }
}

function updateGameOverOverlay() {
  const overlay = document.getElementById("gameOverOverlay");
  const title = document.getElementById("goTitle");
  const detail = document.getElementById("goDetail");
  if (!overlay || !title || !detail) return;
  if (!game.isGameOver()) {
    if (getMode() === "multiplayer" && mpServerEndShown) {
      return;
    }
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    return;
  }
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  if (game.isCheckmate()) {
    title.textContent = t("go.checkmate");
    detail.textContent = game.turn() === "w" ? t("go.blackWon") : t("go.whiteWon");
  } else if (game.isStalemate()) {
    title.textContent = t("go.stalemate");
    detail.textContent = t("go.stalemateDetail");
  } else if (game.isInsufficientMaterial()) {
    title.textContent = t("go.draw");
    detail.textContent = t("go.insufficient");
  } else if (game.isThreefoldRepetition()) {
    title.textContent = t("go.draw");
    detail.textContent = t("go.repetition");
  } else if (game.isDrawByFiftyMoves()) {
    title.textContent = t("go.draw");
    detail.textContent = t("go.fifty");
  } else {
    title.textContent = t("go.gameOver");
    detail.textContent = t("go.drawEnded");
  }
}

function setStatus(msg) {
  const el = document.getElementById("status");
  if (el) el.textContent = msg;
}

let statusBriefTimer = null;
function setStatusBrief(msg, ms = 2600) {
  if (statusBriefTimer) { clearTimeout(statusBriefTimer); statusBriefTimer = null; }
  setStatus(msg);
  statusBriefTimer = setTimeout(() => { statusBriefTimer = null; updateStatus(); }, ms);
}

function isPlayerTurn() {
  if (getMode() === "human") return true;
  if (getMode() === "multiplayer") {
    if (mpIsSpectator) return false;
    if (!mpOpponentReady) return false;
    return game.turn() === myMultiplayerColor;
  }
  return game.turn() === getPlayerColor();
}

function updateStatus() {
  let s = "";
  if (
    getMode() === "multiplayer" &&
    currentLobbyId &&
    !mpIsSpectator &&
    !mpOpponentReady &&
    !game.isGameOver()
  ) {
    s = t("status.waitOpp");
    setStatus(s);
    const stEl = document.getElementById("status");
    if (stEl) {
      stEl.classList.remove("status--check", "status--mate", "status--draw");
    }
    syncCheckKingHighlight();
    updateGameOverOverlay();
    if (getMode() === "multiplayer") postMpFinishIfNeeded();
    renderMoveHistory3d();
    refreshBookLine3d();
    return;
  }
  if (game.isCheckmate()) {
    s = game.turn() === "w" ? t("status.mateBlack") : t("status.mateWhite");
  } else if (game.isStalemate()) s = t("status.stalemate");
  else if (game.isInsufficientMaterial()) s = t("status.insufficient");
  else if (game.isThreefoldRepetition()) s = t("status.repetition");
  else if (game.isDrawByFiftyMoves()) s = t("status.fifty");
  else if (game.isDraw()) s = t("status.draw");
  else {
    s = game.turn() === "w" ? t("status.turnWhite") : t("status.turnBlack");
    if (game.inCheck()) s = t("status.check") + s;
    if (getMode() === "engine" && !game.isGameOver()) {
      s += isPlayerTurn() ? t("status.yourTurn") : t("status.thinking");
    }
  }
  setStatus(s);
  const st = document.getElementById("status");
  if (st) {
    st.classList.toggle("status--check", game.inCheck() && !game.isGameOver());
    st.classList.toggle("status--mate", game.isCheckmate());
    st.classList.toggle("status--draw", game.isDraw() && !game.isCheckmate());
  }
  syncCheckKingHighlight();
  updateGameOverOverlay();
  if (getMode() === "multiplayer") postMpFinishIfNeeded();
  renderMoveHistory3d();
  refreshBookLine3d();
}

function renderMoveHistory3d() {
  const el = document.getElementById("moveHistory3d");
  if (!el) return;
  const verbose = game.history({ verbose: true });
  if (!verbose.length) {
    el.textContent = t("board2d.noMoves");
    return;
  }
  const rows = [];
  for (let i = 0; i < verbose.length; i += 2) {
    const n = Math.floor(i / 2) + 1;
    const w = verbose[i] ? verbose[i].san : "";
    const b = verbose[i + 1] ? verbose[i + 1].san : "";
    rows.push(n + ". " + w + (b ? "  " + b : ""));
  }
  el.textContent = rows.join("\n");
}

function refreshBookLine3d() {
  const el = document.getElementById("bookLine3d");
  if (!el) return;
  clearTimeout(bookRefreshTimer);
  bookRefreshTimer = setTimeout(async () => {
    const data = await fetchPositionBook(game.fen());
    if (!data || !data.ok) {
      el.textContent = t("book.unavailable");
      return;
    }
    const localMoves = (data.local && data.local.moves) || [];
    const top = localMoves.slice(0, 4).map((m) => m.san + " (" + m.plays + ")");
    const remote = data.lichess && data.lichess.moves && data.lichess.moves[0]
      ? t("book.lichess", { san: data.lichess.moves[0].san })
      : "";
    el.textContent = top.length
      ? t("book.sator", { list: top.join(" · "), remote: remote })
      : t("book.empty", { remote: remote });
  }, 200);
}

async function sendMoveLearn(fenBefore, fenAfter, san) {
  try {
    await fetch("/api/move-learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fenBefore, fenAfter, san, enabled: true })
    });
  } catch {
    /* offline */
  }
}

function saveReplayAuto() {
  const pgn = game.pgn();
  let result = "unknown";
  if (game.isCheckmate()) result = game.turn() === "w" ? "black" : "white";
  else if (game.isDraw()) result = "draw";
  fetch("/api/replay/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pgn,
      fen: game.fen(),
      result,
      moves: game.history(),
      meta: {
        auto: true,
        ui: "chess3d",
        mode: getMode(),
        sessionId: liveApi && liveApi.snapshot ? liveApi.snapshot().id : null
      }
    })
  }).catch(() => {});
  void logMatchIfFinished();
}

function applyLiveState(state) {
  if (!state || getMode() === "multiplayer") return;
  restoreChess(game, state);
  if (state.mode) {
    const modeEl = document.getElementById("mode");
    if (modeEl && modeEl.value !== "multiplayer") modeEl.value = state.mode;
  }
  if (state.playerColor) {
    const pc = document.getElementById("playerColor");
    if (pc) pc.value = state.playerColor;
  }
  if (state.depth) {
    const d = document.getElementById("depth");
    if (d) d.value = String(state.depth);
  }
  if (state.timeMs) {
    const t = document.getElementById("timeMs");
    if (t) t.value = String(state.timeMs);
  }
  if (state.clocks) {
    clockWhiteSecs = Number(state.clocks.white) || 0;
    clockBlackSecs = Number(state.clocks.black) || 0;
    if (state.clocks.paused) stopClock();
    else startClock();
    updateClockDisplays();
  }
  clearTapSelection();
  syncPiecesFromGame();
  applyBoardCamera();
  updateStatus();
}

// ── Geometria das Peças ─────────────────────────────────────────────────────────────────
function createPieceMesh(type, color) {
  const isWhite = color === "w";
  const mat = new THREE.MeshStandardMaterial({
    color: isWhite ? 0xf0e8db : 0x24212b,
    roughness: isWhite ? 0.38 : 0.34,
    metalness: 0.05,
    emissive: isWhite ? 0x0a0907 : 0x050406
  });

  const group = new THREE.Group();
  
  // Pedestal base
  const baseGeom = new THREE.CylinderGeometry(0.35, 0.45, 0.1, 32);
  const base = new THREE.Mesh(baseGeom, mat);
  base.position.y = 0.05;
  group.add(base);

  if (type === "p") {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.3, 32), mat);
    body.position.y = 0.25;
    group.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 16), mat);
    head.position.y = 0.48;
    group.add(head);
  } else if (type === "r") {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.5, 32), mat);
    body.position.y = 0.35;
    group.add(body);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.2, 32), mat);
    head.position.y = 0.7;
    group.add(head);
  } else if (type === "n") {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.4, 32), mat);
    body.position.y = 0.3;
    group.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.5), mat);
    head.position.y = 0.65;
    head.position.z = 0.1;
    head.rotation.x = 0.2;
    group.add(head);
  } else if (type === "b") {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.3, 0.6, 32), mat);
    body.position.y = 0.4;
    group.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 16), mat);
    head.scale.set(1, 1.4, 1);
    head.position.y = 0.8;
    group.add(head);
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 8), mat);
    finial.position.y = 1.05;
    group.add(finial);
  } else if (type === "q") {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.3, 0.7, 32), mat);
    body.position.y = 0.45;
    group.add(body);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.15, 0.2, 32), mat);
    crown.position.y = 0.9;
    group.add(crown);
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), mat);
    finial.position.y = 1.05;
    group.add(finial);
  } else if (type === "k") {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.35, 0.75, 32), mat);
    body.position.y = 0.475;
    group.add(body);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.2, 0.2, 32), mat);
    crown.position.y = 0.95;
    group.add(crown);
    const cross1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.25, 0.05), mat);
    cross1.position.y = 1.2;
    group.add(cross1);
    const cross2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.05), mat);
    cross2.position.y = 1.2;
    group.add(cross2);
  }

  // Shadow settings
  group.traverse((c) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });

  group.userData = { isPiece: true, type, color };
  return group;
}

function disposePieces() {
  for (const m of pieceNodes) {
    sceneRef.remove(m);
    m.traverse(c => {
      if (c.isMesh) {
        if(c.geometry) c.geometry.dispose();
        if(c.material) c.material.dispose();
      }
    });
  }
  pieceNodes = [];
}

function syncPiecesFromGame() {
  disposePieces();
  const board = game.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = board[row][col];
      if (!p) continue;
      const sq = squareFromBoardRC(row, col);
      const mesh = createPieceMesh(p.type, p.color);
      const w = sqToWorld(sq);
      mesh.position.set(w.x, 0.06, w.z);
      mesh.userData.square = sq;
      sceneRef.add(mesh);
      pieceNodes.push(mesh);
    }
  }
  syncCheckKingHighlight();
}

// ── Interação ───────────────────────────────────────────────────────────────────────────
let promoResolve = null;
function openPromotionPicker() {
  const ov = document.getElementById("promoOverlay");
  ov.classList.add("open");
  ov.setAttribute("aria-hidden", "false");
  return new Promise((resolve) => { promoResolve = resolve; });
}

function closePromotionPicker(choice) {
  const ov = document.getElementById("promoOverlay");
  ov.classList.remove("open");
  ov.setAttribute("aria-hidden", "true");
  if (promoResolve) { promoResolve(choice); promoResolve = null; }
}

document.querySelectorAll(".promo-btns button").forEach((btn) => {
  btn.addEventListener("click", () => closePromotionPicker(btn.getAttribute("data-p")));
});

function updateMpConnStats() {
  const el = document.getElementById("mpConnStats");
  if (!el) return;
  if (!currentLobbyId || getMode() !== "multiplayer") {
    el.textContent = t("mp.channelIdle");
    return;
  }
  const wsOk = mpSocket && mpSocket.readyState === WebSocket.OPEN;
  const ch = wsOk ? t("mp.ws") : t("mp.http");
  const ping = mpLastRttMs != null ? `${Math.round(mpLastRttMs)} ms` : "—";
  el.textContent = t("mp.channelLine", { ch: ch, ping: ping });
}

function appendMpChatLine(entry) {
  const log = document.getElementById("mpChatLog");
  if (!log || !entry || !entry.text) return;
  const row = document.createElement("div");
  row.className = "mp-chat-line";
  let who = entry.name || (entry.from === "w" ? t("mp.white") : entry.from === "b" ? t("mp.black") : t("mp.spectator"));
  if (entry.spectator || entry.from === "spectator") who = t("mp.specChat", { name: entry.name || t("mp.spectator") });
  const time = entry.t
    ? new Date(entry.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
  const meta = document.createElement("span");
  meta.className = "mp-chat-meta";
  meta.textContent = (time ? `${time} · ` : "") + who + ": ";
  const body = document.createElement("span");
  body.className = "mp-chat-text";
  body.textContent = entry.text;
  row.appendChild(meta);
  row.appendChild(body);
  log.appendChild(row);
  log.scrollTop = log.scrollHeight;
}

function clearMpChatUi() {
  const log = document.getElementById("mpChatLog");
  if (log) log.textContent = "";
  const input = document.getElementById("mpChatInput");
  if (input) input.value = "";
  mpChatSeenIds.clear();
}

function mergeMpChatFromPoll(entries) {
  if (!Array.isArray(entries)) return;
  for (const e of entries) {
    if (!e || !e.text) continue;
    const id = e.id;
    if (id) {
      if (mpChatSeenIds.has(id)) continue;
      mpChatSeenIds.add(id);
    }
    appendMpChatLine(e);
  }
}

async function sendMpChat() {
  const input = document.getElementById("mpChatInput");
  if (!input) return;
  const text = (input.value || "").trim();
  if (!text) return;

  if (mpSocket && mpSocket.readyState === WebSocket.OPEN) {
    mpSocket.send(JSON.stringify({ type: "chat", text }));
    input.value = "";
    return;
  }

  const caps = await ensureLobbyCapabilities();
  const allowHttpChat =
    caps.httpPollFallback === true ||
    (caps.persistentLobbies === true && caps.websocketLobby === false);
  if (!allowHttpChat || !currentLobbyId || !mpWsSecret) {
    showToast(t("mp.needRealtimeChat"), "info");
    return;
  }

  try {
    const r = await fetch("/api/lobby/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lobbyId: currentLobbyId, secret: mpWsSecret, text })
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) {
      showToast(apiErr(j.error, "mp.errChat"), "error");
      return;
    }
    input.value = "";
    if (j.entry && j.entry.text) {
      if (j.entry.id) {
        if (mpChatSeenIds.has(j.entry.id)) return;
        mpChatSeenIds.add(j.entry.id);
      }
      appendMpChatLine(j.entry);
    }
  } catch (_) {
    showToast(t("mp.netChat"), "error");
  }
}

function disconnectMpRealtime() {
  if (mpPingIntervalId) {
    clearInterval(mpPingIntervalId);
    mpPingIntervalId = null;
  }
  if (mpSocket) {
    try {
      mpSocket.close();
    } catch (_) {
      /* ignore */
    }
    mpSocket = null;
  }
  mpWsSecret = null;
  mpLastRttMs = null;
  mpIsSpectator = false;
  updateMpConnStats();
  scheduleMultiplayerPoll();
}

function connectMpRealtime(lobbyId, secret) {
  if (!lobbyId || !secret || typeof WebSocket === "undefined") {
    disconnectMpRealtime();
    scheduleMultiplayerPoll();
    updateMpConnStats();
    return;
  }
  if (
    currentLobbyId === lobbyId &&
    mpWsSecret === secret &&
    mpSocket &&
    (mpSocket.readyState === WebSocket.CONNECTING ||
      mpSocket.readyState === WebSocket.OPEN)
  ) {
    scheduleMultiplayerPoll();
    updateMpConnStats();
    return;
  }

  disconnectMpRealtime();

  const myGen = ++mpRealtimeConnectGen;

  void (async () => {
    const caps = await ensureLobbyCapabilities({ force: true });
    if (myGen !== mpRealtimeConnectGen) return;
    if (currentLobbyId !== lobbyId) return;

    if (caps.websocketLobby !== true) {
      mpWsSecret = secret;
      scheduleMultiplayerPoll();
      updateMpConnStats();
      return;
    }

    if (myGen !== mpRealtimeConnectGen || currentLobbyId !== lobbyId) return;

    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${proto}//${window.location.host}/api/lobby/socket`;
    mpWsSecret = secret;
    const ws = new WebSocket(url);
    mpSocket = ws;

    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({ type: "auth", lobbyId, secret: mpWsSecret }));
      mpPingIntervalId = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const id = Date.now();
        ws._lastPingId = id;
        ws.send(JSON.stringify({ type: "ping", id }));
      }, 2800);
      updateMpConnStats();
      scheduleMultiplayerPoll();
    });

    ws.addEventListener("message", (ev) => {
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (msg.type === "hello_ack") {
        mpIsSpectator = msg.role === "spectator";
        if (msg.fen && msg.fen !== game.fen()) {
          try {
            game.load(msg.fen);
            syncPiecesFromGame();
            updateStatus();
          } catch (_) {
            /* ignore */
          }
        }
        applyBoardCamera();
        const log = document.getElementById("mpChatLog");
        if (log && Array.isArray(msg.chat)) {
          log.textContent = "";
          mpChatSeenIds.clear();
          for (const e of msg.chat) {
            if (e && e.id) mpChatSeenIds.add(e.id);
            appendMpChatLine(e);
          }
        }
        scheduleMultiplayerPoll();
        return;
      }
      if (msg.type === "pong" && msg.id === ws._lastPingId) {
        mpLastRttMs = Date.now() - msg.id;
        updateMpConnStats();
        return;
      }
      if (
        msg.type === "state" &&
        msg.fen &&
        msg.fromColor &&
        (mpIsSpectator || msg.fromColor !== myMultiplayerColor)
      ) {
        if (msg.fen !== game.fen()) {
          try {
            game.load(msg.fen);
            syncPiecesFromGame();
            updateStatus();
          } catch (_) {
            /* ignore */
          }
        }
        return;
      }
      if (msg.type === "chat" && msg.text) {
        if (msg.id) {
          if (mpChatSeenIds.has(msg.id)) return;
          mpChatSeenIds.add(msg.id);
        }
        appendMpChatLine(msg);
        return;
      }
      if (msg.type === "handshake") {
        showToast(t("mp.handshake"), "success");
        updateMpConnStats();
        return;
      }
      if (msg.type === "seat_claimed") {
        const st = document.getElementById("lobbyStatus");
        if (st && msg.names) {
          st.textContent = lobbyNamesLine(msg.names, 2, currentLobbyId || "");
        }
        showToast(t("mp.seatTaken", { name: msg.name || t("mp.player"), seat: msg.seat === "w" ? t("mp.seatW") : t("mp.seatB") }), "info");
        return;
      }
      if (msg.type === "game_over") {
        mpResultPosted = true;
        if (!mpServerEndShown) {
          openMpServerEndOverlay(msg.reasonLabel, msg.winner);
        }
        return;
      }
      if (msg.type === "rematch" && msg.fen) {
        applyMpRematchBoard(msg.fen);
        if (!mpIsSpectator) {
          showToast(t("mp.rematchOk"), "success");
        }
        return;
      }
      if (msg.type === "error" && msg.message) {
        showToast(apiErr(msg.message), "error");
      }
    });

    ws.addEventListener("close", () => {
      if (mpPingIntervalId) {
        clearInterval(mpPingIntervalId);
        mpPingIntervalId = null;
      }
      if (mpSocket === ws) mpSocket = null;
      updateMpConnStats();
      scheduleMultiplayerPoll();
    });

    ws.addEventListener("error", () => {
      /* fallback para HTTP; sem toast para evitar spam */
    });
  })();
}

async function pollLobbyOnce() {
  if (!currentLobbyId || getMode() !== "multiplayer") return;
  if (mpCaps && mpCaps.persistentLobbies === false) return;
  try {
    const res = await fetch("/api/lobby/status/" + currentLobbyId).then((r) => r.json());
    if (res.ok) {
      const st = document.getElementById("lobbyStatus");
      if (st) {
        st.textContent = lobbyNamesLine(res.names, res.playersCount, currentLobbyId);
      }
      if (res.playersCount >= 2 && !mpOpponentReady) {
        mpOpponentReady = true;
        updateStatus();
      }
      if (res.playersCount > 1 && mpLastPlayersPollCount === 1 && myMultiplayerColor === "w") {
        showToast(t("mp.oppJoined"), "success");
      }
      mpLastPlayersPollCount = res.playersCount;
      if (Array.isArray(res.chat)) mergeMpChatFromPoll(res.chat);
      if (res.fen && res.fen !== game.fen()) {
        try {
          game.load(res.fen);
          syncPiecesFromGame();
          updateStatus();
        } catch (_) {
          /* ignore */
        }
      }
      if (res.finished && res.endReasonLabel && !mpServerEndShown) {
        openMpServerEndOverlay(res.endReasonLabel, res.winner);
        mpResultPosted = true;
      }
      updateMpClaimUi(res);
    }
  } catch (e) {
    console.error("Polling error", e);
  }
}

function updateMpClaimUi(res) {
  const row = document.getElementById("mpClaimRow");
  if (!row || !res) return;
  if (!currentLobbyId || getMode() !== "multiplayer" || res.finished) {
    row.style.display = "none";
    return;
  }
  const wBtn = document.getElementById("btnClaimW");
  const bBtn = document.getElementById("btnClaimB");
  let show = false;
  if (wBtn) {
    const on = Boolean(res.seatClaimable && res.seatClaimable.w);
    wBtn.style.display = on ? "inline-flex" : "none";
    if (on) show = true;
  }
  if (bBtn) {
    const on = Boolean(res.seatClaimable && res.seatClaimable.b);
    bBtn.style.display = on ? "inline-flex" : "none";
    if (on) show = true;
  }
  row.style.display = show ? "flex" : "none";
}

async function claimLobbySeat(seat) {
  const id = currentLobbyId;
  if (!id) return;
  const caps = await ensureLobbyCapabilities();
  if (caps.persistentLobbies === false) {
    showToast(t("mp.unsupported"), "error");
    return;
  }
  const pass = (document.getElementById("mpJoinPassword")?.value || "").trim();
  const playerName = (document.getElementById("mpPlayerName")?.value || "").trim();
  const spectatorToken = mpIsSpectator ? mpWsSecret : null;
  showToast(t("mp.claiming"), "info");
  try {
    const r = await fetch("/api/lobby/claim-seat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lobbyId: id,
        seat,
        password: pass,
        playerName,
        spectatorSecret: spectatorToken || undefined
      })
    });
    const res = await r.json();
    if (!r.ok || !res.ok) {
      showToast(apiErr(res.error, "mp.errClaim"), "error");
      return;
    }
    resetMpMatchReporting();
    myMultiplayerColor = res.color;
    mpIsSpectator = false;
    mpOpponentReady = true;
    if (res.fen) {
      try {
        game.load(res.fen);
        syncPiecesFromGame();
      } catch (_) {
        /* ignore */
      }
    }
    const st = document.getElementById("lobbyStatus");
    if (st && res.names) st.textContent = lobbyNamesLine(res.names, 2, id);
    applyBoardCamera();
    updateStatus();
    showToast(t("mp.claimed"), "success");
    if (res.color === "b") rememberMpGuestSecret(id, res.wsSecret);
    connectMpRealtime(id, res.wsSecret);
    document.getElementById("mpClaimRow").style.display = "none";
  } catch (e) {
    showToast(t("mp.net"), "error");
  }
}

function scheduleMultiplayerPoll() {
  if (multiplayerPollId) {
    clearInterval(multiplayerPollId);
    multiplayerPollId = null;
  }
  if (!currentLobbyId || getMode() !== "multiplayer") return;
  if (mpCaps && mpCaps.persistentLobbies === false) return;
  const ms = mpSocket && mpSocket.readyState === WebSocket.OPEN ? 12000 : 2000;
  multiplayerPollId = setInterval(pollLobbyOnce, ms);
  pollLobbyOnce();
}

async function createLobby() {
  if (mpLobbyActionBusy) return;
  mpLobbyActionBusy = true;
  const nameEl = document.getElementById("mpPlayerName");
  const oppEl = document.getElementById("mpOpponentName");
  const passEl = document.getElementById("mpRoomPassword");
  const maxEl = document.getElementById("mpMaxPlayers");
  const maxSpecEl = document.getElementById("mpMaxSpectators");
  const playerName = (nameEl?.value || "").trim();
  const opponentName = (oppEl?.value || "").trim();
  const password = (passEl?.value || "").trim();
  const maxPlayers = maxEl ? parseInt(maxEl.value, 10) || 2 : 2;
  const maxSpectators = maxSpecEl ? parseInt(maxSpecEl.value, 10) || 8 : 8;
  showToast(t("mp.connecting"), "info");
  try {
    const caps = await ensureLobbyCapabilities();
    if (caps.persistentLobbies === false) {
      showToast(t("mp.unsupported"), "error");
      return;
    }
    if (currentLobbyId && isMpHostOfLobby(currentLobbyId)) {
      showToast(
        t("mp.alreadyCreated", { id: currentLobbyId }),
        "info"
      );
      return;
    }
    const r = await fetch("/api/lobby/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName, opponentName, password, maxPlayers, maxSpectators })
    });
    const res = await r.json();
    if (!r.ok || !res.ok) {
      showToast(apiErr(res.error, "mp.errCreate"), "error");
      return;
    }
    resetMpMatchReporting();
    rememberMpHostLobby(res.lobbyId);
    currentLobbyId = res.lobbyId;
    myMultiplayerColor = res.color;
    showToast(t("mp.created"), "success");

    mpLastPlayersPollCount = 1;
    const st = document.getElementById("lobbyStatus");
    if (st) {
      st.textContent = lobbyNamesLine(res.names, 1, res.lobbyId);
    }
    const idInput = document.getElementById("lobbyIdInput");
    if (idInput) idInput.value = res.lobbyId;

    let shareBtn = document.getElementById("btnShareLink");
    if (!shareBtn) {
      shareBtn = document.createElement("button");
      shareBtn.id = "btnShareLink";
      shareBtn.className = "btn";
      shareBtn.style.marginTop = "8px";
      document.getElementById("multiplayerSetup").appendChild(shareBtn);
    }
    const inviteLink =
      window.location.origin + window.location.pathname + "?join=" + encodeURIComponent(res.lobbyId);
    shareBtn.textContent = t("mp.share");
    shareBtn.onclick = () => {
      navigator.clipboard.writeText(inviteLink);
      shareBtn.textContent = t("mp.copied");
      setTimeout(() => shareBtn.textContent = t("mp.share"), 2000);
    };

    clearMpChatUi();
    game.reset();
    syncPiecesFromGame();
    applyBoardCamera();
    updateStatus();
    connectMpRealtime(res.lobbyId, res.wsSecret);
  } catch (e) {
    showToast(t("mp.netCreate"), "error");
  } finally {
    mpLobbyActionBusy = false;
  }
}

async function joinLobby(id) {
  if (!id) return;
  if (isMpHostOfLobby(id)) {
    showToast(t("mp.hostSkipJoin"), "info");
    return;
  }
  if (
    currentLobbyId === id &&
    mpSocket &&
    (mpSocket.readyState === WebSocket.CONNECTING ||
      mpSocket.readyState === WebSocket.OPEN)
  ) {
    showToast(t("mp.alreadyIn"), "info");
    return;
  }
  if (mpLobbyActionBusy) return;
  mpLobbyActionBusy = true;
  const playerName = (document.getElementById("mpPlayerName")?.value || "").trim();
  const joinPass = (document.getElementById("mpJoinPassword")?.value || "").trim();
  showToast(t("mp.connectingRoom"), "info");
  try {
    const caps = await ensureLobbyCapabilities();
    if (caps.persistentLobbies === false) {
      showToast(t("mp.unsupported"), "error");
      return;
    }
    const previousSecret = readMpGuestSecret(id);
    const r = await fetch("/api/lobby/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lobbyId: id,
        playerName,
        password: joinPass,
        ...(previousSecret ? { previousSecret } : {})
      })
    });
    const res = await r.json();

    if (r.ok && res.ok) {
      resetMpMatchReporting();
      currentLobbyId = res.lobbyId;
      myMultiplayerColor = res.color;
      mpOpponentReady = true;
      game.load(res.fen);
      syncPiecesFromGame();
      applyBoardCamera();
      mpLastPlayersPollCount = 2;
      const st = document.getElementById("lobbyStatus");
      if (st) {
        st.textContent = lobbyNamesLine(res.names, 2, res.lobbyId);
      }
      showToast(t("mp.joined"), "success");
      updateStatus();
      clearMpChatUi();
      if (res.color === "b") rememberMpGuestSecret(res.lobbyId, res.wsSecret);
      connectMpRealtime(res.lobbyId, res.wsSecret);
    } else {
      showToast(apiErr(res.error, "mp.errJoin"), "error");
      currentLobbyId = null;
      mpOpponentReady = false;
    }
  } catch (e) {
    showToast(t("mp.netJoin"), "error");
    mpOpponentReady = false;
  } finally {
    mpLobbyActionBusy = false;
  }
}

async function spectateLobby() {
  const id = document.getElementById("lobbyIdInput")?.value.trim();
  if (!id) {
    showToast(t("mp.needId"), "error");
    return;
  }
  if (isMpHostOfLobby(id)) {
    showToast(t("mp.hostSkipSpec"), "info");
    return;
  }
  if (currentLobbyId === id && !mpIsSpectator) {
    showToast(t("mp.alreadyPlaying"), "info");
    return;
  }
  if (
    currentLobbyId === id &&
    mpIsSpectator &&
    mpSocket &&
    (mpSocket.readyState === WebSocket.CONNECTING ||
      mpSocket.readyState === WebSocket.OPEN)
  ) {
    showToast(t("mp.alreadyWatching"), "info");
    return;
  }
  if (mpLobbyActionBusy) return;
  mpLobbyActionBusy = true;
  const pass = (document.getElementById("mpJoinPassword")?.value || "").trim();
  const playerName = (document.getElementById("mpPlayerName")?.value || "").trim();
  showToast(t("mp.enteringSpec"), "info");
  try {
    const caps = await ensureLobbyCapabilities();
    if (caps.persistentLobbies === false) {
      showToast(t("mp.unsupported"), "error");
      return;
    }
    const r = await fetch("/api/lobby/spectate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lobbyId: id, playerName, password: pass })
    });
    const res = await r.json();
    if (!r.ok || !res.ok) {
      showToast(apiErr(res.error, "mp.errSpectate"), "error");
      return;
    }
    resetMpMatchReporting();
    currentLobbyId = id;
    mpLastPlayersPollCount = 2;
    const st = document.getElementById("lobbyStatus");
    if (st) st.textContent = t("mp.specRoom", { id: id });
    syncPiecesFromGame();
    applyBoardCamera();
    updateStatus();
    clearMpChatUi();
    connectMpRealtime(id, res.wsSecret);
    showToast(t("mp.watching"), "success");
  } catch (e) {
    showToast(t("mp.net"), "error");
  } finally {
    mpLobbyActionBusy = false;
  }
}

async function tryMove(from, to) {
  if (getMode() === "multiplayer" && mpIsSpectator) return false;
  if (getMode() === "multiplayer" && !mpIsSpectator && !mpOpponentReady) return false;
  const moving = game.get(from);
  if (!moving) return false;

  let promotion = undefined;
  if (moving.type === "p") {
    const toRank = to[1];
    if ((moving.color === "w" && toRank === "8") || (moving.color === "b" && toRank === "1")) {
      promotion = await openPromotionPicker();
    }
  }

  const fenBefore = game.fen();
  const opts = { from, to };
  if (promotion) opts.promotion = promotion;
  let move;
  try { move = game.move(opts); } catch { return false; }
  if (!move) return false;

  tapSelection.from = null;
  clearMoveHighlights();
  const fenAfter = game.fen();
  syncPiecesFromGame();
  updateStatus();

  void sendMoveLearn(fenBefore, fenAfter, move.san);
  if (liveApi) {
    void liveApi.logMove({
      ply: game.history().length,
      san: move.san,
      fenBefore,
      fenAfter,
      source: "player"
    });
  }

  if (getMode() === "multiplayer" && currentLobbyId) {
    if (mpSocket && mpSocket.readyState === WebSocket.OPEN) {
      mpSocket.send(JSON.stringify({ type: "move", san: move.san, fen: fenAfter }));
    } else {
      fetch("/api/lobby/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lobbyId: currentLobbyId, move: move.san, fen: fenAfter })
      }).catch((e) => console.error(e));
    }
  }

  updateClockDisplays();
  if (game.isGameOver()) {
    stopClock();
    saveReplayAuto();
  }

  if (getMode() === "engine") maybeEngineReply();

  return true;
}

async function callBestMove() {
  if (getMode() !== "engine" || game.isGameOver()) return;
  clearTapSelection();
  busy = true;
  updateStatus();
  const depth = parseInt(document.getElementById("depth").value, 10) || 7;
  const timeMs = parseInt(document.getElementById("timeMs").value, 10) || 2500;
  const fenBefore = game.fen();

  const res = await fetch("/api/bestmove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fen: fenBefore, depth, timeMs })
  }).then((r) => r.json()).catch(() => ({}));

  if (res.bestMove && res.bestMove.san) {
    try { game.move(res.bestMove.san, { sloppy: true }); } catch { busy = false; return; }
    syncPiecesFromGame();
    clearTapSelection();
    updateStatus();
    const fenAfter = game.fen();
    void sendMoveLearn(fenBefore, fenAfter, res.bestMove.san);
    if (liveApi) {
      void liveApi.logMove({
        ply: game.history().length,
        san: res.bestMove.san,
        fenBefore,
        fenAfter,
        source: "engine"
      });
    }
    if (game.isGameOver()) {
      stopClock();
      saveReplayAuto();
    }
  }
  busy = false;
  updateStatus();
}

function maybeEngineReply() {
  if (getMode() !== "engine" || game.isGameOver()) return;
  if (game.turn() !== getPlayerColor()) {
    setTimeout(() => callBestMove(), 200);
  }
}

// ── Configuração Câmera ─────────────────────────────────────────────────────────────────
function applyBoardCamera() {
  if (!cameraRef) return;
  const whiteSide = getMode() === "human" || getPlayerColor() === "w";
  const preset =
    getMode() === "multiplayer" && mpIsSpectator ? "top" : getCameraView();
  const orientWhiteBottom = preset === "fixed_white" ? true : whiteSide;

  if (preset === "top") {
    // Câmera fica acima do teto da sala: escondemos o teto/vigas (só têm face voltada
    // para dentro) para não bloquear/distorcer a vista de cima.
    cameraRef.position.set(0, 18, 0.1);
    controlsRef.target.set(0, 0, 0);
  } else if (preset === "quarter") {
    // Mantida dentro da sala (abaixo do teto em ~6.65 e do lustre em ~5.75) para evitar
    // "furar" o telhado e ver a sala por fora.
    cameraRef.position.set(0, 5.1, orientWhiteBottom ? 8 : -8);
    controlsRef.target.set(0, 0, 0);
  } else {
    // player / default
    cameraRef.position.set(0, 6, orientWhiteBottom ? 7.5 : -7.5);
    controlsRef.target.set(0, 0.5, orientWhiteBottom ? -0.6 : 0.6);
  }
  if (libraryAnim.ceilingGroup) libraryAnim.ceilingGroup.visible = preset !== "top";

  if (controlsRef) {
    controlsRef.maxDistance = 25;
    controlsRef.minDistance = 5;
    // se for player, limitar rotação vertical para first person view
    if (preset === "player" || preset === "fixed_white") {
       controlsRef.maxPolarAngle = Math.PI / 2.2;
    } else {
       controlsRef.maxPolarAngle = Math.PI / 2.1;
    }
    controlsRef.update();
  }

  syncChessClockPlacement();
}

function syncChessClockPlacement() {
  if (!chessClockRootRef) return;
  const whiteSide = getMode() === "human" || getPlayerColor() === "w";
  if (whiteSide) {
    chessClockRootRef.position.set(5.6, 0.0, 0);
    chessClockRootRef.rotation.y = -Math.PI / 2;
  } else {
    chessClockRootRef.position.set(-5.6, 0.0, 0);
    chessClockRootRef.rotation.y = Math.PI / 2;
  }
}

// ── Cena da biblioteca (procedural) + bloom ───────────────────────────────────────────────
function setupRendererColorPipeline(renderer) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
}

function createBloomComposer(renderer, scene, camera, w, h) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.42, 0.35, 0.78));
  return composer;
}

// ── Utilitários de geração procedural (PRNG determinístico + texturas canvas) ────────────
function makeSeededRandom(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let out = Math.imul(s ^ (s >>> 15), 1 | s);
    out = (out + Math.imul(out ^ (out >>> 7), 61 | out)) ^ out;
    return ((out ^ (out >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvasTexture(draw, w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeFloorTexture() {
  const rnd = makeSeededRandom(7);
  return makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#241811";
    ctx.fillRect(0, 0, w, h);
    const rows = 8;
    const cols = 6;
    const ph = h / rows;
    const pw = w / cols;
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * pw * 0.5;
      for (let c = -1; c <= cols; c++) {
        const shade = 26 + Math.floor(rnd() * 22);
        ctx.fillStyle = `rgb(${shade + 46}, ${shade + 27}, ${shade + 16})`;
        ctx.fillRect(c * pw + offset, r * ph, pw - 3, ph - 3);
      }
      ctx.strokeStyle = "rgba(8,5,3,0.65)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, r * ph);
      ctx.lineTo(w, r * ph);
      ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      ctx.strokeStyle = "rgba(8,5,3,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c * pw, 0);
      ctx.lineTo(c * pw, h);
      ctx.stroke();
    }
  }, 1024, 1024);
}

function makeStoneWallTexture() {
  const rnd = makeSeededRandom(21);
  return makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#4b463f";
    ctx.fillRect(0, 0, w, h);
    const rows = 10;
    const cols = 6;
    const ph = h / rows;
    const pw = w / cols;
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * pw * 0.5;
      for (let c = -1; c <= cols; c++) {
        const shade = 58 + Math.floor(rnd() * 26);
        ctx.fillStyle = `rgb(${shade}, ${shade - 6}, ${shade - 14})`;
        ctx.fillRect(c * pw + offset + 2, r * ph + 2, pw - 4, ph - 4);
      }
    }
    ctx.strokeStyle = "rgba(20,16,12,0.55)";
    ctx.lineWidth = 2;
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * ph);
      ctx.lineTo(w, r * ph);
      ctx.stroke();
    }
  }, 1024, 1024);
}

function makeRugTexture() {
  return makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#3a1a1a";
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    for (let r = Math.min(w, h) / 2; r > 10; r -= 26) {
      ctx.strokeStyle = Math.round(r / 26) % 2 === 0 ? "#7a2e22" : "#c99a4a";
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.74, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, 512, 512);
}

function makeWoodTileTexture(base, grain, seed) {
  const rnd = makeSeededRandom(seed);
  return makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 46; i++) {
      const y = rnd() * h;
      const amp = 3 + rnd() * 9;
      const freq = 0.015 + rnd() * 0.02;
      ctx.strokeStyle = grain;
      ctx.globalAlpha = 0.1 + rnd() * 0.16;
      ctx.lineWidth = 1 + rnd() * 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += w / 16) {
        ctx.lineTo(x, y + Math.sin(x * freq + i) * amp);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, 256, 256);
}

function makeSoftGlowTexture() {
  return makeCanvasTexture((ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,232,190,0.9)");
    g.addColorStop(1, "rgba(255,232,190,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }, 64, 64);
}

// ── Poltrona de couro estilo "wingback" (procedural, sem modelo externo) ─────────────────
function buildArmchair(seatColor) {
  const wood = new THREE.MeshStandardMaterial({ color: 0x1a120e, roughness: 0.68, metalness: 0.08 });
  const leather = new THREE.MeshStandardMaterial({ color: seatColor, roughness: 0.42, metalness: 0.08 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a050, roughness: 0.3, metalness: 0.75 });

  const chair = new THREE.Group();

  for (const [lx, lz] of [[-0.5, 0.42], [0.5, 0.42], [-0.5, -0.4], [0.5, -0.4]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 0.46, 10), wood);
    leg.position.set(lx, 0.23, lz);
    leg.castShadow = true;
    chair.add(leg);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), brass);
    foot.position.set(lx, 0.01, lz);
    chair.add(foot);
  }

  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.22, 1.0), leather);
  seat.position.set(0, 0.57, 0);
  seat.castShadow = true;
  seat.receiveShadow = true;
  chair.add(seat);
  const seatCushion = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.58, 0.14, 16), leather);
  seatCushion.position.set(0, 0.72, 0);
  seatCushion.castShadow = true;
  chair.add(seatCushion);

  const backCenter = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.5, 0.22), leather);
  backCenter.position.set(0, 1.35, -0.44);
  backCenter.rotation.x = -0.08;
  backCenter.castShadow = true;
  chair.add(backCenter);

  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.15, 0.62), leather);
    wing.position.set(side * 0.56, 1.28, -0.16);
    wing.rotation.y = side * 0.55;
    wing.castShadow = true;
    chair.add(wing);
  }

  const backCap = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.22, 12, 1, false, 0, Math.PI), leather);
  backCap.rotation.z = Math.PI / 2;
  backCap.rotation.y = Math.PI / 2;
  backCap.position.set(0, 2.12, -0.46);
  chair.add(backCap);

  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.82), leather);
    arm.position.set(side * 0.62, 0.86, 0.02);
    arm.castShadow = true;
    chair.add(arm);
    const armRoll = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), leather);
    armRoll.scale.set(1, 0.9, 1);
    armRoll.position.set(side * 0.62, 0.86, 0.44);
    chair.add(armRoll);
    const armPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.42, 8), wood);
    armPost.position.set(side * 0.62, 0.6, 0.36);
    chair.add(armPost);
  }

  for (let i = 0; i < 5; i++) {
    const stud = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), brass);
    stud.position.set(-0.4 + i * 0.2, 2.02, -0.34);
    chair.add(stud);
  }

  return chair;
}

// ── Lustre de ferro com velas (8 chamas + 8 luzes suaves) ─────────────────────────────────
function buildChandelier(parent, atY, atZ) {
  const chandelier = new THREE.Group();
  chandelier.position.set(0, atY, atZ);
  parent.add(chandelier);

  const chainMat = new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.4, metalness: 0.6 });
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6), chainMat);
  chain.position.y = 0.45;
  chandelier.add(chain);

  const ironMat = new THREE.MeshStandardMaterial({ color: 0x0e0c0a, roughness: 0.55, metalness: 0.55 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.05, 8, 24), ironMat);
  ring.rotation.x = Math.PI / 2;
  chandelier.add(ring);

  const candleCount = 8;
  const candleLights = [];
  for (let i = 0; i < candleCount; i++) {
    const a = (i / candleCount) * Math.PI * 2;
    const cx = Math.cos(a) * 0.85;
    const cz = Math.sin(a) * 0.85;

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.4, 6), ironMat);
    arm.position.set(cx * 0.5, -0.12, cz * 0.5);
    arm.rotation.z = Math.atan2(cx, 0.4);
    chandelier.add(arm);

    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.032, 0.22, 8),
      new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.7 })
    );
    candle.position.set(cx, 0.11, cz);
    chandelier.add(candle);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.028, 0.09, 8),
      new THREE.MeshStandardMaterial({ color: 0xffb347, emissive: 0xff9922, emissiveIntensity: 2.6, roughness: 1 })
    );
    flame.position.set(cx, 0.24, cz);
    chandelier.add(flame);

    const light = new THREE.PointLight(0xffcc77, 0.55, 7.5, 2.2);
    light.position.set(cx, 0.2, cz);
    light.castShadow = false;
    chandelier.add(light);
    candleLights.push(light);
  }

  return candleLights;
}

// ── Janela gótica com luar frio entrando (arco ogival procedural) ────────────────────────
function makeGothicArchShape(width, height) {
  const w = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-w, 0);
  shape.lineTo(-w, height * 0.58);
  shape.quadraticCurveTo(-w, height, 0, height);
  shape.quadraticCurveTo(w, height, w, height * 0.58);
  shape.lineTo(w, 0);
  shape.lineTo(-w, 0);
  return shape;
}

function buildGothicWindow(parent, wx, wy, wz) {
  const width = 2.2;
  const height = 4.0;

  const frame = new THREE.Mesh(
    new THREE.ExtrudeGeometry(makeGothicArchShape(width, height), { depth: 0.5, bevelEnabled: false }),
    new THREE.MeshStandardMaterial({ color: 0x3a332a, roughness: 0.75 })
  );
  frame.position.set(wx, wy, wz - 0.4);
  frame.castShadow = true;
  parent.add(frame);

  const glass = new THREE.Mesh(
    new THREE.ShapeGeometry(makeGothicArchShape(width * 0.76, height * 0.86)),
    new THREE.MeshStandardMaterial({
      color: 0x9fc2e8,
      emissive: 0x3a5c8c,
      emissiveIntensity: 0.55,
      roughness: 0.1,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide
    })
  );
  glass.position.set(wx, wy, wz - 0.15);
  parent.add(glass);

  const traceryMat = new THREE.MeshStandardMaterial({ color: 0x22190f, roughness: 0.6 });
  for (let i = 0; i < 2; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.05, height * 0.72, 0.15), traceryMat);
    bar.position.set(wx - width * 0.19 + i * width * 0.38, wy, wz - 0.15);
    parent.add(bar);
  }
  const hbar = new THREE.Mesh(new THREE.BoxGeometry(width * 0.7, 0.05, 0.15), traceryMat);
  hbar.position.set(wx, wy, wz - 0.15);
  parent.add(hbar);

  const moonLight = new THREE.PointLight(0x4d6fb0, 3.2, 20, 2);
  moonLight.position.set(wx, wy + 0.7, wz - 2.4);
  moonLight.castShadow = false;
  parent.add(moonLight);

  return moonLight;
}

const ROOM_HALF_X = 9.6;
const ROOM_Z_BACK = -13.0;
const ROOM_Z_FRONT = 9.4;
const ROOM_HEIGHT = 7.2;
const FLOOR_Y = -0.55;

function addProceduralLibraryRoom(parent) {
  const stone = new THREE.MeshStandardMaterial({
    color: 0x6a635c,
    roughness: 0.91,
    metalness: 0.04
  });
  const darkWood = new THREE.MeshStandardMaterial({
    color: 0x1a120e,
    roughness: 0.72,
    metalness: 0.06
  });
  const brass = new THREE.MeshStandardMaterial({
    color: 0xc9a050,
    roughness: 0.32,
    metalness: 0.72
  });

  // ── Piso: parquê procedural (textura canvas) ────────────────────────────────────────────
  const floorTex = makeFloorTexture();
  floorTex.repeat.set(4, 5);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_HALF_X * 2, ROOM_Z_FRONT - ROOM_Z_BACK),
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.6, metalness: 0.08 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, FLOOR_Y, (ROOM_Z_FRONT + ROOM_Z_BACK) / 2);
  floor.receiveShadow = true;
  parent.add(floor);

  // Tapete central sob a mesa de jogo
  const rug = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 7.4),
    new THREE.MeshStandardMaterial({ map: makeRugTexture(), roughness: 0.95 })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, FLOOR_Y + 0.01, 0);
  rug.receiveShadow = true;
  parent.add(rug);

  // ── Paredes: lambri de madeira + estuque de pedra ───────────────────────────────────────
  const stoneTex = makeStoneWallTexture();
  stoneTex.repeat.set(3, 2);
  const stoneMat = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.92, metalness: 0.02 });
  const wainscotMat = new THREE.MeshStandardMaterial({ color: 0x1d140f, roughness: 0.6, metalness: 0.05 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x0f0a06, roughness: 0.5, metalness: 0.15 });
  const wainscotH = 2.6;

  function addWallSlab(width, height, depth, cx, cy, cz, mat) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
    wall.position.set(cx, cy, cz);
    wall.receiveShadow = true;
    parent.add(wall);
    return wall;
  }

  // Parede de fundo (atrás da lareira) — permanece fechada.
  addWallSlab(ROOM_HALF_X * 2, wainscotH, 0.3, 0, FLOOR_Y + wainscotH / 2, ROOM_Z_BACK, wainscotMat);
  addWallSlab(ROOM_HALF_X * 2, ROOM_HEIGHT - wainscotH, 0.3, 0, FLOOR_Y + wainscotH + (ROOM_HEIGHT - wainscotH) / 2, ROOM_Z_BACK, stoneMat);
  addWallSlab(ROOM_HALF_X * 2, 0.12, 0.34, 0, FLOOR_Y + wainscotH, ROOM_Z_BACK, trimMat);

  // Parede frontal — vão ogival aberto (sem laje atrás do vidro): o céu do skybox fica
  // visível de verdade através da janela gótica, em vez de bloqueado por uma parede opaca.
  const WIN_WX = 3.0;
  const WIN_HALF_W = 1.2;
  const WIN_BOTTOM = FLOOR_Y + 0.6;
  const WIN_TOP = FLOOR_Y + 4.7;
  const holeLeft = WIN_WX - WIN_HALF_W;
  const holeRight = WIN_WX + WIN_HALF_W;
  const holeWidth = holeRight - holeLeft;

  function addFrontColumn(xStart, xEnd) {
    const width = xEnd - xStart;
    if (width <= 0.02) return;
    const cx = (xStart + xEnd) / 2;
    addWallSlab(width, wainscotH, 0.3, cx, FLOOR_Y + wainscotH / 2, ROOM_Z_FRONT, wainscotMat);
    addWallSlab(width, ROOM_HEIGHT - wainscotH, 0.3, cx, FLOOR_Y + wainscotH + (ROOM_HEIGHT - wainscotH) / 2, ROOM_Z_FRONT, stoneMat);
    addWallSlab(width, 0.12, 0.34, cx, FLOOR_Y + wainscotH, ROOM_Z_FRONT, trimMat);
  }
  addFrontColumn(-ROOM_HALF_X, holeLeft);
  addFrontColumn(holeRight, ROOM_HALF_X);

  // Verga (lintel) de pedra acima do vão, até o teto.
  const lintelHeight = ROOM_HEIGHT - (WIN_TOP - FLOOR_Y);
  if (lintelHeight > 0.02) {
    addWallSlab(holeWidth, lintelHeight, 0.3, WIN_WX, WIN_TOP + lintelHeight / 2, ROOM_Z_FRONT, stoneMat);
  }
  // Soleira baixa abaixo do vão (o vitral não desce até o piso).
  const sillHeight = WIN_BOTTOM - FLOOR_Y;
  if (sillHeight > 0.02) {
    addWallSlab(holeWidth, sillHeight, 0.3, WIN_WX, FLOOR_Y + sillHeight / 2, ROOM_Z_FRONT, wainscotMat);
  }
  // Paredes laterais
  const runZ = ROOM_Z_FRONT - ROOM_Z_BACK;
  const midZ = (ROOM_Z_FRONT + ROOM_Z_BACK) / 2;
  for (const side of [-1, 1]) {
    const x = side * ROOM_HALF_X;
    addWallSlab(0.3, wainscotH, runZ, x, FLOOR_Y + wainscotH / 2, midZ, wainscotMat);
    addWallSlab(0.3, ROOM_HEIGHT - wainscotH, runZ, x, FLOOR_Y + wainscotH + (ROOM_HEIGHT - wainscotH) / 2, midZ, stoneMat);
    addWallSlab(0.34, 0.12, runZ, x, FLOOR_Y + wainscotH, midZ, trimMat);
  }

  // ── Teto com vigas (coffered) ───────────────────────────────────────────────────────────
  // Agrupado para poder ser ocultado na câmera "De cima": o plano do teto só tem face
  // voltada para baixo (visível de dentro da sala); visto de fora/cima ele fica invisível
  // e sobrariam só as vigas cortando a vista — por isso escondemos o grupo inteiro nesse caso.
  const ceilingGroup = new THREE.Group();
  ceilingGroup.name = "ceilingGroup";
  parent.add(ceilingGroup);
  libraryAnim.ceilingGroup = ceilingGroup;

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_HALF_X * 2, runZ),
    new THREE.MeshStandardMaterial({ color: 0x140f0a, roughness: 0.88 })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, FLOOR_Y + ROOM_HEIGHT, midZ);
  ceilingGroup.add(ceiling);

  const beamMat = new THREE.MeshStandardMaterial({ color: 0x120b07, roughness: 0.7 });
  const beamCountZ = 7;
  for (let i = 0; i <= beamCountZ; i++) {
    const z = ROOM_Z_BACK + (i / beamCountZ) * runZ;
    const beam = new THREE.Mesh(new THREE.BoxGeometry(ROOM_HALF_X * 2 - 0.2, 0.28, 0.34), beamMat);
    beam.position.set(0, FLOOR_Y + ROOM_HEIGHT - 0.16, z);
    beam.castShadow = true;
    ceilingGroup.add(beam);
  }
  const beamCountX = 3;
  for (let i = 0; i <= beamCountX; i++) {
    const x = -ROOM_HALF_X + 0.4 + (i / beamCountX) * (ROOM_HALF_X * 2 - 0.8);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, runZ - 0.2), beamMat);
    beam.position.set(x, FLOOR_Y + ROOM_HEIGHT - 0.28, midZ);
    ceilingGroup.add(beam);
  }

  // ── Lareira (fundo, eixo -Z) — soleira, brasas, quadro e velas ─────────────────────────
  const fireplace = new THREE.Group();
  fireplace.position.set(0, 0, -11.2);
  const hearth = new THREE.Mesh(new THREE.BoxGeometry(5.8, 3.4, 1.5), stone);
  hearth.position.set(0, 1.65, 0);
  hearth.castShadow = true;
  hearth.receiveShadow = true;
  fireplace.add(hearth);
  const inner = new THREE.Mesh(
    new THREE.BoxGeometry(2.9, 2.35, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x0d0a08, roughness: 1, metalness: 0 })
  );
  inner.position.set(0, 1.45, 0.68);
  fireplace.add(inner);
  const fireGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.35, 1.75),
    new THREE.MeshStandardMaterial({
      color: 0xff5c18,
      emissive: 0xff3a06,
      emissiveIntensity: 3.2,
      roughness: 1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92
    })
  );
  fireGlow.position.set(0, 1.28, 0.72);
  fireplace.add(fireGlow);
  const emberRnd = makeSeededRandom(55);
  const embersMat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, emissive: 0xff5500, emissiveIntensity: 3, roughness: 1 });
  for (let i = 0; i < 6; i++) {
    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.05 + emberRnd() * 0.04, 6, 5), embersMat);
    ember.position.set((emberRnd() - 0.5) * 1.6, 0.1 + emberRnd() * 0.15, 0.55 + emberRnd() * 0.2);
    fireplace.add(ember);
  }
  const grateMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.7 });
  for (let i = 0; i < 5; i++) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.7, 6), grateMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(-0.8 + i * 0.4, 0.04, 0.62);
    fireplace.add(bar);
  }
  const mantel = new THREE.Mesh(new THREE.BoxGeometry(6, 0.18, 0.65), darkWood);
  mantel.position.set(0, 3.22, 0.25);
  mantel.castShadow = true;
  fireplace.add(mantel);
  const mantleDecoL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 8), brass);
  mantleDecoL.position.set(-1.1, 3.45, 0.35);
  fireplace.add(mantleDecoL);
  const mantleDecoR = mantleDecoL.clone();
  mantleDecoR.position.x = 1.1;
  fireplace.add(mantleDecoR);
  const candleFlameGeo = new THREE.ConeGeometry(0.045, 0.14, 8);
  const candleFlameMat = new THREE.MeshStandardMaterial({ color: 0xffb347, emissive: 0xff9922, emissiveIntensity: 2.4, roughness: 1 });
  const flameL = new THREE.Mesh(candleFlameGeo, candleFlameMat);
  flameL.position.set(-1.1, 3.68, 0.35);
  fireplace.add(flameL);
  const flameR = flameL.clone();
  flameR.position.x = 1.1;
  fireplace.add(flameR);
  const frameArt = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.0, 0.08), darkWood);
  frameArt.position.set(0, 4.55, 0.1);
  fireplace.add(frameArt);
  const canvasArt = new THREE.Mesh(
    new THREE.PlaneGeometry(1.35, 1.75),
    new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 0.85 })
  );
  canvasArt.position.set(0, 4.55, 0.15);
  fireplace.add(canvasArt);
  parent.add(fireplace);

  // ── Poltronas (brancas e pretas) — encostadas na mesa, fora da área do tabuleiro ───────
  // Mesa: z ±5 (tampo 10 de profundidade). Cadeira fica atrás da borda, com folga para os
  // joelhos por baixo da mesa, e não deve invadir o tabuleiro (z ±4) nem a câmera do jogador.
  const CHAIR_Z = 6.35;
  const chairBlack = buildArmchair(0x4a1520);
  chairBlack.position.set(0, 0, -CHAIR_Z);
  parent.add(chairBlack);

  const chairWhite = buildArmchair(0x5a2a18);
  chairWhite.position.set(0, 0, CHAIR_Z);
  chairWhite.rotation.y = Math.PI;
  parent.add(chairWhite);

  // ── Estantes do chão ao teto (livros via InstancedMesh — leve, um draw call por lado) ──
  function buildBookshelfWall(x, faceDir) {
    const zStart = ROOM_Z_BACK + 1.0;
    const zEnd = ROOM_Z_FRONT - 1.0;
    const runLength = zEnd - zStart;
    const shelfCount = 5;

    const backing = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 6.3, runLength),
      new THREE.MeshStandardMaterial({ color: 0x160f0a, roughness: 0.75 })
    );
    backing.position.set(x, FLOOR_Y + 0.3 + 3.15, zStart + runLength / 2);
    backing.receiveShadow = true;
    parent.add(backing);

    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x241811, roughness: 0.55 });
    const faceX = x - faceDir * 0.34;
    for (let s = 0; s < shelfCount; s++) {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, runLength), shelfMat);
      slab.position.set(x - faceDir * 0.02, FLOOR_Y + 0.75 + s * 1.25, zStart + runLength / 2);
      slab.castShadow = true;
      parent.add(slab);
    }

    const bookGeo = new THREE.BoxGeometry(0.16, 1.0, 0.34);
    const perShelf = Math.floor(runLength / 0.19);
    const total = perShelf * shelfCount;
    const bookMat = new THREE.MeshStandardMaterial({ roughness: 0.82, metalness: 0.02 });
    const books = new THREE.InstancedMesh(bookGeo, bookMat, total);
    books.castShadow = true;
    const rnd = makeSeededRandom(Math.round(x * 100) + 3);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let idx = 0;
    for (let s = 0; s < shelfCount; s++) {
      const shelfTopY = FLOOR_Y + 0.75 + s * 1.25 + 0.035;
      for (let i = 0; i < perShelf; i++) {
        const z = zStart + 0.12 + i * 0.19 + (rnd() - 0.5) * 0.02;
        const h = 0.78 + rnd() * 0.36;
        dummy.position.set(faceX, shelfTopY + h / 2, z);
        dummy.rotation.set(0, (rnd() - 0.5) * 0.06, (rnd() - 0.5) * 0.05);
        dummy.scale.set(0.9 + rnd() * 0.3, h, 0.85 + rnd() * 0.25);
        dummy.updateMatrix();
        books.setMatrixAt(idx, dummy.matrix);
        const hue = 0.02 + rnd() * 0.09;
        color.setHSL(hue, 0.4 + rnd() * 0.25, 0.16 + rnd() * 0.16);
        books.setColorAt(idx, color);
        idx++;
      }
    }
    books.instanceMatrix.needsUpdate = true;
    if (books.instanceColor) books.instanceColor.needsUpdate = true;
    parent.add(books);
  }
  buildBookshelfWall(-ROOM_HALF_X + 0.35, -1);
  buildBookshelfWall(ROOM_HALF_X - 0.35, 1);

  // ── Lustre central com velas ────────────────────────────────────────────────────────────
  const candleLights = buildChandelier(parent, FLOOR_Y + ROOM_HEIGHT - 0.9, 1.0);

  // ── Janela gótica com luar (parede frontal, longe do tabuleiro) ────────────────────────
  const moonLight = buildGothicWindow(parent, 3.0, FLOOR_Y + 2.65, ROOM_Z_FRONT);

  // ── Mesa larga sob o tabuleiro (apenas borda visual) ────────────────────────────────────
  const tableTop = new THREE.Mesh(
    new THREE.BoxGeometry(12, 0.08, 10),
    new THREE.MeshStandardMaterial({
      color: 0x1c1410,
      roughness: 0.55,
      metalness: 0.08
    })
  );
  tableTop.position.set(0, -0.26, 0);
  tableTop.receiveShadow = true;
  parent.add(tableTop);

  return { candleLights, moonLight };
}

// ── Poeira flutuante (motas de pó iluminadas — profundidade e imersão) ───────────────────
function addDustParticles(scene) {
  const count = 140;
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);
  const rnd = makeSeededRandom(99);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rnd() - 0.5) * 17;
    positions[i * 3 + 1] = 0.2 + rnd() * 6.4;
    positions[i * 3 + 2] = ROOM_Z_BACK + 1 + rnd() * (ROOM_Z_FRONT - ROOM_Z_BACK - 2);
    phases[i] = rnd() * Math.PI * 2;
    speeds[i] = 0.08 + rnd() * 0.16;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.05,
    map: makeSoftGlowTexture(),
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  libraryAnim.dust = { points, positions, phases, speeds };
}

function installLibraryEnvironment(scene) {
  const root = new THREE.Group();
  root.name = "libraryFurniture";
  scene.add(root);

  // Densidade reduzida (era 0.038): o céu visto pelo vão ogival precisa "respirar" em vez
  // de ficar embaçado logo na abertura.
  scene.fog = new THREE.FogExp2(0x0e0b08, 0.03);

  const fireLight = new THREE.PointLight(0xff6620, 9, 24, 2.2);
  fireLight.position.set(0, 1.28, -10.5);
  fireLight.castShadow = false;
  scene.add(fireLight);
  libraryAnim.fireLight = fireLight;

  const { candleLights, moonLight } = addProceduralLibraryRoom(root);
  libraryAnim.candleLights = candleLights;
  libraryAnim.moonLight = moonLight;

  addDustParticles(scene);
}

// ── Céu noturno procedural (6 faces, gerado em CanvasTexture) ────────────────────────────
// Gradiente + estrelas + névoa de horizonte; a face "moon" recebe a lua cheia e fica
// alinhada com a janela gótica da parede frontal (+z), para o luar bater direto no vão.
function makeNightSkyTexture(kind, seed) {
  const rnd = makeSeededRandom(seed);
  return makeCanvasTexture((ctx, w, h) => {
    let top, bottom;
    if (kind === "up") {
      top = "#02030a";
      bottom = "#0a1330";
    } else if (kind === "down") {
      top = "#04060c";
      bottom = "#010102";
    } else {
      top = "#05091a";
      bottom = "#142448";
    }
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    if (kind !== "down") {
      const starCount = kind === "up" ? 280 : 150;
      const starSpanY = kind === "up" ? h : h * 0.78;
      for (let i = 0; i < starCount; i++) {
        const x = rnd() * w;
        const y = rnd() * starSpanY;
        const r = 0.4 + rnd() * 1.5;
        const alpha = 0.35 + rnd() * 0.65;
        ctx.fillStyle = `rgba(230,236,255,${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (kind === "moon") {
      const mx = w * 0.6;
      const my = h * 0.35;
      const mr = w * 0.055;
      const glow = ctx.createRadialGradient(mx, my, 0, mx, my, mr * 5.5);
      glow.addColorStop(0, "rgba(210,225,255,0.55)");
      glow.addColorStop(1, "rgba(210,225,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#eef3ff";
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(178,192,218,0.5)";
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(
          mx + (rnd() - 0.5) * mr * 1.2,
          my + (rnd() - 0.5) * mr * 1.2,
          mr * (0.08 + rnd() * 0.12),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    if (kind === "side" || kind === "moon") {
      const hg = ctx.createLinearGradient(0, h * 0.72, 0, h);
      hg.addColorStop(0, "rgba(20,32,58,0)");
      hg.addColorStop(1, "rgba(30,45,70,0.55)");
      ctx.fillStyle = hg;
      ctx.fillRect(0, h * 0.72, w, h * 0.28);
    }
  }, 1024, 1024);
}

// ── Skybox (técnica clássica: cubo gigante + 6 materiais BackSide) ───────────────────────
// Ref.: https://redstapler.co/create-3d-world-with-three-js-and-skybox-technique/
// A câmera fica "dentro" do cubo; cada face recebe uma textura própria (frente, trás, cima,
// baixo, direita, esquerda) com side: THREE.BackSide para renderizar a face interna.
function installSkybox(scene) {
  const sideTex = makeNightSkyTexture("side", 501);
  const upTex = makeNightSkyTexture("up", 502);
  const downTex = makeNightSkyTexture("down", 503);
  const moonTex = makeNightSkyTexture("moon", 504);
  for (const tex of [sideTex, upTex, downTex, moonTex]) {
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
  }

  const faceMat = (map) =>
    new THREE.MeshBasicMaterial({ map, fog: false, depthWrite: false, side: THREE.BackSide });

  // Ordem de faces do BoxGeometry: +x (direita), -x (esquerda), +y (cima), -y (baixo),
  // +z (frente — alinhada com a janela gótica), -z (trás — parede da lareira).
  const materialArray = [
    faceMat(sideTex),
    faceMat(sideTex),
    faceMat(upTex),
    faceMat(downTex),
    faceMat(moonTex),
    faceMat(sideTex)
  ];

  const skyboxGeo = new THREE.BoxGeometry(2000, 2000, 2000);
  const skybox = new THREE.Mesh(skyboxGeo, materialArray);
  skybox.renderOrder = -10;
  scene.add(skybox);
  libraryAnim.skybox = skybox;
}

// ── Iniciação Three.js ───────────────────────────────────────────────────────────────────
function createScene() {
  const canvas = document.getElementById("renderCanvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0a0806, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  setupRendererColorPipeline(renderer);
  rendererRef = renderer;

  const scene = new THREE.Scene();
  sceneRef = scene;

  installSkybox(scene);
  installLibraryEnvironment(scene);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
  cameraRef = camera;
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controlsRef = controls;

  // Luzes (ambiente + key; lareira suave em installLibraryEnvironment)
  const hemiLight = new THREE.HemisphereLight(0xfff5ee, 0x2a2420, 0.48);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xfff0dd, 1.15);
  dirLight.position.set(5, 12, 8);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 30;
  dirLight.shadow.camera.left = -10;
  dirLight.shadow.camera.right = 10;
  dirLight.shadow.camera.top = 10;
  dirLight.shadow.camera.bottom = -10;
  scene.add(dirLight);

  // Tabuleiro
  const boardGroup = new THREE.Group();
  scene.add(boardGroup);
  
  const boardGeo = new THREE.BoxGeometry(8, 0.1, 8);
  // Madeira quente (bordo claro + nogueira escura) — bem mais clara que as peças pretas
  // (0x24212b), garantindo contraste alto e boa leitura das peças no tabuleiro.
  const lightWoodTex = makeWoodTileTexture("#e8c99a", "#c9a066", 301);
  const darkWoodTex = makeWoodTileTexture("#8a5a30", "#6a3f22", 302);
  const boardMatWhite = new THREE.MeshStandardMaterial({ map: lightWoodTex, roughness: 0.42, metalness: 0.04 });
  const boardMatBlack = new THREE.MeshStandardMaterial({ map: darkWoodTex, roughness: 0.4, metalness: 0.04 });
  
  // Quadrados individuais (ajustado para ser suavemente elevado)
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const isWhite = (r + c) % 2 === 0;
      const tile = new THREE.Mesh(new THREE.BoxGeometry(1, 0.12, 1), isWhite ? boardMatWhite : boardMatBlack);
      tile.position.set((c - 3.5) * SQ, 0, (r - 3.5) * SQ);
      tile.receiveShadow = true;
      tile.userData = { isTile: true, square: squareFromBoardRC(r, c) };
      boardGroup.add(tile);
    }
  }
  
  // Moldura do tabuleiro
  const frameGeo = new THREE.BoxGeometry(8.4, 0.2, 8.4);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x2b1c12, roughness: 0.6 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.y = -0.05;
  frame.receiveShadow = true;
  boardGroup.add(frame);

  // Relógio 3D
  chessClockRootRef = new THREE.Group();
  scene.add(chessClockRootRef);
  
  const clockBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 1.6), new THREE.MeshStandardMaterial({ color: 0x111111 }));
  clockBase.position.y = 0.2;
  clockBase.castShadow = true;
  chessClockRootRef.add(clockBase);

  // Telas do Relógio
  const canvasWhite = document.createElement("canvas");
  canvasWhite.width = 256; canvasWhite.height = 128;
  clockWhiteTex = new THREE.CanvasTexture(canvasWhite);
  clockWhiteTex.minFilter = THREE.LinearFilter;
  const canvasBlack = document.createElement("canvas");
  canvasBlack.width = 256; canvasBlack.height = 128;
  clockBlackTex = new THREE.CanvasTexture(canvasBlack);
  clockBlackTex.minFilter = THREE.LinearFilter;

  clockScreenMatWhite = new THREE.MeshBasicMaterial({ map: clockWhiteTex });
  clockScreenMatBlack = new THREE.MeshBasicMaterial({ map: clockBlackTex });

  const screenWhite = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), clockScreenMatWhite);
  screenWhite.position.set(-0.41, 0.2, 0.4);
  screenWhite.rotation.y = -Math.PI / 2;
  chessClockRootRef.add(screenWhite);

  const screenBlack = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), clockScreenMatBlack);
  screenBlack.position.set(-0.41, 0.2, -0.4);
  screenBlack.rotation.y = -Math.PI / 2;
  chessClockRootRef.add(screenBlack);

  updateClockDisplays();

  applyBoardCamera();
  syncPiecesFromGame();

  const useBloom = !prefersReducedData();
  if (useBloom) {
    const composer = createBloomComposer(
      renderer,
      scene,
      camera,
      window.innerWidth,
      window.innerHeight
    );
    composer.setPixelRatio(window.devicePixelRatio);
    composer.setSize(window.innerWidth, window.innerHeight);
    composerRef = composer;
  } else {
    composerRef = null;
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  canvas.addEventListener("pointerdown", async (e) => {
    if (e.button !== 0 || busy) return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    let targetSquare = null;

    for (let i = 0; i < intersects.length; i++) {
      let node = intersects[i].object;
      while (node) {
        if (node.userData?.square) {
          targetSquare = node.userData.square;
          break;
        }
        if (node.userData?.isHighlight && node.userData.square) {
           targetSquare = node.userData.square;
           break;
        }
        node = node.parent;
      }
      if (targetSquare) break;
    }

    if (!targetSquare) {
      clearTapSelection();
      return;
    }

    const clickedPiece = game.get(targetSquare);
    const isPlayer = isPlayerTurn();

    if (tapSelection.from) {
      const from = tapSelection.from;
      const to = targetSquare;
      if (from === to) {
        clearTapSelection();
        return;
      }
      const moves = game.moves({ square: from, verbose: true });
      const valid = moves.find((m) => m.to === to);
      if (valid && isPlayer) {
        busy = true;
        const ok = await tryMove(from, to);
        if (!ok) {
           clearTapSelection();
        }
        busy = false;
        return;
      }
      if (clickedPiece && clickedPiece.color === game.turn() && isPlayer) {
        tapSelection.from = targetSquare;
        showLegalMovesFor(targetSquare);
        return;
      }
      clearTapSelection();
    } else {
      if (!isPlayer || game.isGameOver()) return;
      if (clickedPiece && clickedPiece.color === game.turn()) {
        tapSelection.from = targetSquare;
        showLegalMovesFor(targetSquare);
      }
    }
  });

  let lastFrameT = performance.now();
  renderer.setAnimationLoop((now) => {
    const dt = Math.min(0.05, (now - lastFrameT) / 1000);
    lastFrameT = now;
    controls.update();
    if (libraryAnim.fireLight) {
      libraryAnim.firePhase += dt * 10;
      const f = libraryAnim.firePhase;
      libraryAnim.fireLight.intensity = 9 + Math.sin(f) * 1.4 + Math.sin(f * 2.7) * 0.9;
    }
    // Paralaxe sutil: rotação muito lenta do skybox (sensação de céu vivo/profundidade).
    // Mantido centrado na câmera para nunca haver clipping/seam ao orbitar perto das bordas.
    if (libraryAnim.skybox) {
      libraryAnim.skybox.position.copy(camera.position);
      libraryAnim.skybox.rotation.y += dt * 0.0015;
    }
    // Velas do lustre: tremular independente por vela
    if (libraryAnim.candleLights && libraryAnim.candleLights.length) {
      libraryAnim.chandelierPhase += dt * 6;
      const cp = libraryAnim.chandelierPhase;
      for (let i = 0; i < libraryAnim.candleLights.length; i++) {
        libraryAnim.candleLights[i].intensity =
          0.5 + Math.sin(cp + i * 1.3) * 0.08 + Math.sin(cp * 2.1 + i) * 0.05;
      }
    }
    // Poeira flutuante: deriva lenta para cima com leve oscilação lateral
    if (libraryAnim.dust) {
      const { points, positions, phases, speeds } = libraryAnim.dust;
      for (let i = 0; i < phases.length; i++) {
        phases[i] += dt * speeds[i];
        positions[i * 3 + 1] += dt * 0.05;
        if (positions[i * 3 + 1] > FLOOR_Y + ROOM_HEIGHT - 0.4) positions[i * 3 + 1] = FLOOR_Y + 0.2;
        positions[i * 3] += Math.sin(phases[i]) * dt * 0.03;
      }
      points.geometry.attributes.position.needsUpdate = true;
    }
    if (composerRef) composerRef.render();
    else renderer.render(scene, camera);
  });

  window.addEventListener("resize", () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (composerRef) composerRef.setSize(w, h);
  });

  hideChess3dLoadingOverlay();
}

window.addEventListener("DOMContentLoaded", () => {
  void ensureLobbyCapabilities();
  createScene();
  updateStatus();

  liveApi = bindLiveGame({
    view: "3d",
    getGame: () => game,
    getMeta: () => ({
      mode: getMode(),
      playerColor: getPlayerColor(),
      depth: parseInt(document.getElementById("depth")?.value, 10) || 7,
      timeMs: parseInt(document.getElementById("timeMs")?.value, 10) || 2500,
      clocks: {
        white: clockWhiteSecs,
        black: clockBlackSecs,
        paused: !clockRunning,
        side: game.turn()
      }
    }),
    applyState: applyLiveState
  });

  document.getElementById("btnNew")?.addEventListener("click", async () => {
    const view = liveApi ? await liveApi.chooseNewGame() : "3d";
    if (!view) return;
    if (liveApi) liveApi.beginNewSession();
    game.reset();
    resetMatchSession();
    resetClock();
    startClock();
    clearTapSelection();
    syncPiecesFromGame();
    updateStatus();
    updateGameOverOverlay();
    if (liveApi) liveApi.publish();
    if (view === "2d") {
      liveApi.goToView("2d");
      return;
    }
    if (getMode() === "engine") maybeEngineReply();
  });

  document.getElementById("btnUndo")?.addEventListener("click", () => {
    if (busy || getMode() === "multiplayer") return;
    game.undo();
    if (getMode() === "engine" && game.turn() !== getPlayerColor()) {
      game.undo();
    }
    clearTapSelection();
    syncPiecesFromGame();
    updateStatus();
    if (liveApi) liveApi.publish();
  });

  document.getElementById("btnSwitch2d")?.addEventListener("click", () => {
    if (liveApi) liveApi.goToView("2d");
    else window.location.href = "/board2d.html";
  });

  document.getElementById("btnGoNew")?.addEventListener("click", () => {
    if (getMode() === "multiplayer" && currentLobbyId && mpServerEndShown && !mpIsSpectator) {
      void requestMpRematch();
      return;
    }
    document.getElementById("btnNew")?.click();
  });

  document.getElementById("btnCreateLobby")?.addEventListener("click", () => {
    createLobby();
  });

  document.getElementById("btnJoinLobby")?.addEventListener("click", () => {
    const code = document.getElementById("lobbyIdInput")?.value.trim();
    if (code) {
      joinLobby(code);
    }
  });

  document.getElementById("btnSpectateLobby")?.addEventListener("click", () => {
    spectateLobby();
  });
  document.getElementById("btnClaimW")?.addEventListener("click", () => {
    claimLobbySeat("w");
  });
  document.getElementById("btnClaimB")?.addEventListener("click", () => {
    claimLobbySeat("b");
  });

  document.getElementById("btnMpChatSend")?.addEventListener("click", () => {
    sendMpChat();
  });
  document.getElementById("mpChatInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMpChat();
    }
  });

  const urlParams = new URLSearchParams(window.location.search);
  const urlJoin = urlParams.get("join");
  const urlLobby = urlParams.get("lobby");
  if (urlLobby || urlJoin) {
    const modeEl = document.getElementById("mode");
    if (modeEl) modeEl.value = "multiplayer";
    const setup = document.getElementById("multiplayerSetup");
    if (setup) setup.style.display = "block";
    const wrapColor = document.getElementById("wrapColor");
    if (wrapColor) wrapColor.style.display = "none";
    if (urlLobby === "new") {
      setTimeout(() => {
        void createLobby();
      }, 500);
    } else {
      const codeFromJoin = urlJoin && urlJoin.trim();
      const codeFromLobby = urlLobby && urlLobby !== "new" ? urlLobby.trim() : "";
      const code = codeFromJoin || codeFromLobby || "";
      if (code) {
        const idInput = document.getElementById("lobbyIdInput");
        if (idInput) idInput.value = code;
        if (isMpHostOfLobby(code)) {
          const st = document.getElementById("lobbyStatus");
          if (st) st.textContent = t("mp.hostWait");
          showToast(t("mp.hostSkipJoin"), "info");
        } else {
          setTimeout(() => {
            void joinLobby(code);
          }, 500);
        }
      }
    }
  }

  document.getElementById("mode")?.addEventListener("change", () => {
    const engine = getMode() === "engine";
    const multi = getMode() === "multiplayer";
    const setup = document.getElementById("multiplayerSetup");
    document.getElementById("wrapColor").style.display = engine ? "flex" : "none";
    if (setup) setup.style.display = multi ? "block" : "none";
    
    if (!multi) {
      if (multiplayerPollId) {
        clearInterval(multiplayerPollId);
        multiplayerPollId = null;
      }
      currentLobbyId = null;
      mpLastPlayersPollCount = 0;
      resetMpMatchReporting();
      disconnectMpRealtime();
      clearMpChatUi();
      updateMpConnStats();
    } else {
      void ensureLobbyCapabilities().then((caps) => {
        if (caps.persistentLobbies === false) {
          const st = document.getElementById("lobbyStatus");
          if (st) {
            st.textContent = t("mp.unavailableHost");
          }
        }
      });
    }

    applyBoardCamera();
    updateStatus();
    if (engine) maybeEngineReply();
  });

  document.getElementById("playerColor")?.addEventListener("change", () => {
    applyBoardCamera();
    updateStatus();
    if (getMode() === "engine") maybeEngineReply();
  });

  document.getElementById("cameraView")?.addEventListener("change", () => {
    applyBoardCamera();
  });

  document.getElementById("btnPanelToggle")?.addEventListener("click", (e) => {
    const p = document.getElementById("partidaPanel");
    p.classList.toggle("panel--collapsed");
    const isCol = p.classList.contains("panel--collapsed");
    e.target.textContent = isCol ? t("chess3d.show") : t("chess3d.hide");
    e.target.setAttribute("title", isCol ? t("chess3d.show") : t("chess3d.hideTitle"));
  });

  // Hotkey Esc = cancela seleção
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") clearTapSelection();
  });

  document.getElementById("btnSwitch2dFooter")?.addEventListener("click", () => {
    document.getElementById("btnSwitch2d")?.click();
  });

  const skipLive = Boolean(urlLobby || urlJoin);
  if (!skipLive && liveApi) {
    void liveApi.restore().then((restored) => {
      if (restored && restored.clocks && !restored.clocks.paused) startClock();
      else if (!restored || !(restored.sans && restored.sans.length)) startClock();
      updateStatus();
      if (getMode() === "engine") maybeEngineReply();
    });
  } else {
    startClock();
    if (getMode() === "engine") maybeEngineReply();
  }

  window.addEventListener("sator:langchange", () => {
    updateStatus();
    updateClockDisplays();
    updateMpConnStats();
    renderMoveHistory3d();
    refreshBookLine3d();
    updateGameOverOverlay();
    if (mpServerEndShown) openMpServerEndOverlay(lastMpEnd.reasonLabel, lastMpEnd.winner);
    const shareBtn = document.getElementById("btnShareLink");
    if (shareBtn) shareBtn.textContent = t("mp.share");
    const toggle = document.getElementById("btnPanelToggle");
    const panel = document.getElementById("partidaPanel");
    if (toggle && panel) {
      const isCol = panel.classList.contains("panel--collapsed");
      toggle.textContent = isCol ? t("chess3d.show") : t("chess3d.hide");
    }
  });
});
