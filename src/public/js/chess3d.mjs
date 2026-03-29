import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Chess } from "chess.js";

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
let pieceNodes = [];
let busy = false;

let multiplayerPollId = null;
let myMultiplayerColor = "w";
let currentLobbyId = null;

// ── Relógio ─────────────────────────────────────────────────────────────────────────────
let clockWhiteSecs = 0;
let clockBlackSecs = 0;
let clockInterval  = null;
let clockRunning   = false;
let clockWhiteTex  = null;
let clockBlackTex  = null;
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
  const p1Label = getMode() === "human" ? "BRANCAS" : "VOCÊ";
  const p2Label = getMode() === "human" ? "PRETAS" : "MOTOR SATOR";

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
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    return;
  }
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  if (game.isCheckmate()) {
    title.textContent = "Xeque-mate";
    detail.textContent = game.turn() === "w" ? "As pretas venceram a partida." : "As brancas venceram a partida.";
  } else if (game.isStalemate()) {
    title.textContent = "Afogamento";
    detail.textContent = "Empate: não há lances legais e o rei não está em xeque.";
  } else if (game.isInsufficientMaterial()) {
    title.textContent = "Empate";
    detail.textContent = "Material insuficiente para forçar xeque-mate.";
  } else if (game.isThreefoldRepetition()) {
    title.textContent = "Empate";
    detail.textContent = "Tripla repetição da mesma posição.";
  } else if (game.isDrawByFiftyMoves()) {
    title.textContent = "Empate";
    detail.textContent = "Regra dos 50 lances sem captura ou peão.";
  } else {
    title.textContent = "Fim de partida";
    detail.textContent = "A partida terminou em empate.";
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
  if (getMode() === "multiplayer") return game.turn() === myMultiplayerColor;
  return game.turn() === getPlayerColor();
}

function updateStatus() {
  let s = "";
  if (game.isCheckmate()) {
    s = "Xeque-mate — " + (game.turn() === "w" ? "vitória das pretas." : "vitória das brancas.");
  } else if (game.isStalemate()) s = "Empate por afogamento.";
  else if (game.isInsufficientMaterial()) s = "Empate — material insuficiente.";
  else if (game.isThreefoldRepetition()) s = "Empate — tripla repetição.";
  else if (game.isDrawByFiftyMoves()) s = "Empate — regra dos 50 lances.";
  else if (game.isDraw()) s = "Empate.";
  else {
    s = game.turn() === "w" ? "Vez das brancas." : "Vez das pretas.";
    if (game.inCheck()) s = "Xeque! " + s;
    if (getMode() === "engine" && !game.isGameOver()) {
      s += isPlayerTurn() ? " — sua vez." : " — motor a pensar…";
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

function startMultiplayerPolling() {
  if (multiplayerPollId) clearInterval(multiplayerPollId);
  multiplayerPollId = setInterval(async () => {
    if (!currentLobbyId || getMode() !== "multiplayer") return;
    try {
      const res = await fetch("/api/lobby/status/" + currentLobbyId).then(r => r.json());
      if (res.ok) {
        if (res.playersCount > 1) {
          const st = document.getElementById("lobbyStatus");
          if (st && st.textContent.includes("aguardando")) {
            st.textContent = "Oponente conectado!";
          }
        }
        if (res.fen && res.fen !== game.fen()) {
          game.load(res.fen);
          syncPiecesFromGame();
          updateStatus();
        }
      }
    } catch (e) {
      console.error("Polling error", e);
    }
  }, 2000);
}

async function createLobby() {
  try {
    const res = await fetch("/api/lobby/create", { method: "POST" }).then(r => r.json());
    if (res.ok) {
      currentLobbyId = res.lobbyId;
      myMultiplayerColor = res.color;
      
      const st = document.getElementById("lobbyStatus");
      if(st) st.textContent = "Sala: " + res.lobbyId + " (aguardando)";
      const idInput = document.getElementById("lobbyIdInput");
      if(idInput) idInput.value = res.lobbyId;

      let shareBtn = document.getElementById("btnShareLink");
      if (!shareBtn) {
        shareBtn = document.createElement("button");
        shareBtn.id = "btnShareLink";
        shareBtn.className = "btn";
        shareBtn.style.marginTop = "8px";
        document.getElementById("multiplayerSetup").appendChild(shareBtn);
      }
      const inviteLink = window.location.origin + window.location.pathname + "?lobby=" + res.lobbyId;
      shareBtn.textContent = "Copiar Link de Convite";
      shareBtn.onclick = () => {
        navigator.clipboard.writeText(inviteLink);
        shareBtn.textContent = "Copiado!";
        setTimeout(() => shareBtn.textContent = "Copiar Link de Convite", 2000);
      };

      game.reset();
      syncPiecesFromGame();
      applyBoardCamera();
      updateStatus();
      startMultiplayerPolling();
    }
  } catch (e) {
    alert("Erro ao criar sala");
  }
}

async function joinLobby(id) {
  try {
    const res = await fetch("/api/lobby/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lobbyId: id })
    }).then(r => r.json());
    
    if (res.ok) {
      currentLobbyId = res.lobbyId;
      myMultiplayerColor = res.color;
      game.load(res.fen);
      syncPiecesFromGame();
      applyBoardCamera();
      const st = document.getElementById("lobbyStatus");
      if(st) st.textContent = "Conectado à sala: " + res.lobbyId;
      updateStatus();
      startMultiplayerPolling();
    } else {
      alert("Erro: " + (res.error || "Não foi possível entrar"));
      currentLobbyId = null;
    }
  } catch (e) {
    alert("Erro ao entrar na sala");
  }
}

async function tryMove(from, to) {
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

  if (getMode() === "multiplayer" && currentLobbyId) {
    fetch("/api/lobby/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lobbyId: currentLobbyId, move: move.san, fen: fenAfter })
    }).catch(e => console.error(e));
  }

  updateClockDisplays();
  if (game.isGameOver()) stopClock();

  if (getMode() === "engine") maybeEngineReply();
  // else if (game.isGameOver()) saveReplayAuto();

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
  const preset = getCameraView();
  const orientWhiteBottom = preset === "fixed_white" ? true : whiteSide;

  if (preset === "top") {
    cameraRef.position.set(0, 18, 0.1);
    controlsRef.target.set(0, 0, 0);
  } else if (preset === "quarter") {
    cameraRef.position.set(0, 10, orientWhiteBottom ? 8 : -8);
    controlsRef.target.set(0, 0, 0);
  } else {
    // player / default
    cameraRef.position.set(0, 6, orientWhiteBottom ? 7.5 : -7.5);
    controlsRef.target.set(0, 0.5, orientWhiteBottom ? -0.6 : 0.6);
  }
  
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

// ── Iniciação Three.js ───────────────────────────────────────────────────────────────────
function createScene() {
  const canvas = document.getElementById("renderCanvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  rendererRef = renderer;

  const scene = new THREE.Scene();
  sceneRef = scene;

  // Carregar fundo panorama
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  
  new THREE.TextureLoader().load("/img/library-panorama.webp", (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  });

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  cameraRef = camera;
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controlsRef = controls;

  // Luzes
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xfff0dd, 1.5);
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
  const boardMatWhite = new THREE.MeshStandardMaterial({ color: 0xddddcc, roughness: 0.2 });
  const boardMatBlack = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.2 });
  
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

  clockWhiteMat = new THREE.MeshBasicMaterial({ map: clockWhiteTex });
  clockBlackMat = new THREE.MeshBasicMaterial({ map: clockBlackTex });

  const screenWhite = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), clockWhiteMat);
  screenWhite.position.set(-0.41, 0.2, 0.4);
  screenWhite.rotation.y = -Math.PI / 2;
  chessClockRootRef.add(screenWhite);

  const screenBlack = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), clockBlackMat);
  screenBlack.position.set(-0.41, 0.2, -0.4);
  screenBlack.rotation.y = -Math.PI / 2;
  chessClockRootRef.add(screenBlack);

  updateClockDisplays();

  applyBoardCamera();
  syncPiecesFromGame();

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

  // Loop de renderização
  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  hideChess3dLoadingOverlay();
}

window.addEventListener("DOMContentLoaded", () => {
  createScene();
  updateStatus();

  document.getElementById("btnNew")?.addEventListener("click", () => {
    game.reset();
    resetClock();
    startClock();
    clearTapSelection();
    syncPiecesFromGame();
    updateStatus();
    updateGameOverOverlay();
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
  });

  document.getElementById("btnGoNew")?.addEventListener("click", () => {
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

  const urlParams = new URLSearchParams(window.location.search);
  const urlLobby = urlParams.get('lobby');
  if (urlLobby) {
    const modeEl = document.getElementById("mode");
    if(modeEl) modeEl.value = "multiplayer";
    const setup = document.getElementById("multiplayerSetup");
    if(setup) setup.style.display = "block";
    const wrapColor = document.getElementById("wrapColor");
    if(wrapColor) wrapColor.style.display = "none";
    if (urlLobby === "new") {
      setTimeout(() => document.getElementById("btnCreateLobby")?.click(), 500);
    } else {
      const idInput = document.getElementById("lobbyIdInput");
      if(idInput) idInput.value = urlLobby;
      setTimeout(() => document.getElementById("btnJoinLobby")?.click(), 500);
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
    e.target.textContent = isCol ? "Mostrar" : "Ocultar";
  });

  // Hotkey Esc = cancela seleção
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") clearTapSelection();
  });

  startClock();
  if (getMode() === "engine") maybeEngineReply();
});
