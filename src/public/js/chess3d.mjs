/**
 * Tabuleiro 3D (Babylon.js) + motor via API + TD online opcional.
 */
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  DirectionalLight,
  PointLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  PointerEventTypes,
  Mesh,
  Matrix,
  Material,
  DynamicTexture,
  Texture,
  TransformNode,
  Color4
} from "@babylonjs/core";
import { Chess } from "chess.js";

const SQ = 1;
/** Topo das casas (intersecção do raio = casa correta mesmo com câmera em ângulo). */
const BOARD_PLANE_Y = 0.061;
const FILES = "abcdefgh";

function squareFromBoardRC(row, col) {
  return FILES[col] + (8 - row);
}

function sqToWorld(sq) {
  const col = FILES.indexOf(sq[0]);
  const rank = parseInt(sq[1], 10);
  const row = 8 - rank;
  const x = (col - 3.5) * SQ + SQ / 2;
  const z = (3.5 - row) * SQ - SQ / 2;
  return new Vector3(x, 0, z);
}

function worldToSquare(x, z) {
  if (x < -4.6 || x > 4.6 || z < -4.6 || z > 4.6) return null;
  const col = Math.min(7, Math.max(0, Math.floor(x / SQ + 3.5)));
  const row = Math.min(7, Math.max(0, Math.floor(3.5 - z / SQ)));
  return squareFromBoardRC(row, col);
}

/** Intersecção do raio (pointer → câmera) com o plano horizontal do tabuleiro. */
function boardXZFromPointer(scene, camera, px, py) {
  const ray = scene.createPickingRay(px, py, Matrix.Identity(), camera, false);
  const dy = ray.direction.y;
  if (Math.abs(dy) < 1e-6) return null;
  const t = (BOARD_PLANE_Y - ray.origin.y) / dy;
  if (t < 0) return null;
  return {
    x: ray.origin.x + t * ray.direction.x,
    z: ray.origin.z + t * ray.direction.z
  };
}

/** Casa destino a partir do clique: telha, peça (captura) ou projeção no plano do tabuleiro. */
function pointerDestinationSquare(pi, scene, camera) {
  if (!pi.pickInfo?.hit) return null;
  const mesh = pi.pickInfo.pickedMesh;
  if (mesh?.metadata?.isTile && mesh.metadata.square) return mesh.metadata.square;
  const meta = pieceMetaFromPickedMesh(mesh);
  if (meta?.square) return meta.square;
  const xz = boardXZFromPointer(scene, camera, scene.pointerX, scene.pointerY);
  if (xz) return worldToSquare(xz.x, xz.z);
  return null;
}

function pieceMetaFromPickedMesh(mesh) {
  let m = mesh;
  while (m) {
    if (m.metadata?.square && !m.metadata.isTile) return m.metadata;
    m = m.parent;
  }
  return null;
}

const game = new Chess();
let sceneRef = null;
let cameraRef = null;
let chessClockRootRef = null;
let pieceNodes = [];
let busy = false;

// ── Relógio com tempo real ─────────────────────────────────────────────────────────────────────────────
const CLOCK_INITIAL_SECS = 20 * 60; // 20 minutos por jogador
let clockWhiteSecs = CLOCK_INITIAL_SECS;
let clockBlackSecs = CLOCK_INITIAL_SECS;
let clockInterval  = null;
let clockRunning   = false;
let clockWhiteTex  = null; // DynamicTexture para display esquerdo
let clockBlackTex  = null; // DynamicTexture para display direito

/** Formata segundos como MM:SS */
function fmtClock(secs) {
  const s = Math.max(0, Math.floor(secs));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
}

/** Renderiza o tempo na DynamicTexture do display 3D */
function renderClockTexture(tex, timeStr, label, isActive) {
  if (!tex) return;
  const ctx = tex.getContext();
  const w = 256, h = 128;
  // Fundo escuro
  ctx.fillStyle = '#0a0700';
  ctx.fillRect(0, 0, w, h);
  // Borda emissiva
  ctx.strokeStyle = isActive ? '#c87a10' : '#4a3008';
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, w - 4, h - 4);
  // Rótulo
  ctx.fillStyle = isActive ? '#c87a10' : '#5a4010';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, w / 2, 22);
  // Tempo (display 7-segmentos simulado)
  ctx.fillStyle = isActive ? '#ffb830' : '#6a5020';
  ctx.font = 'bold 52px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(timeStr, w / 2, 82);
  tex.update();
}

/** Inicia/para o relógio conforme o turno */
function tickClock() {
  if (!clockRunning || game.isGameOver()) return;
  if (game.turn() === 'w') {
    clockWhiteSecs = Math.max(0, clockWhiteSecs - 1);
  } else {
    clockBlackSecs = Math.max(0, clockBlackSecs - 1);
  }
  updateClockDisplays();
  if (clockWhiteSecs <= 0 || clockBlackSecs <= 0) {
    stopClock();
  }
}

function updateClockDisplays() {
  const whiteTurn = game.turn() === 'w';
  renderClockTexture(clockWhiteTex, fmtClock(clockWhiteSecs), 'SATOR ENGINE', whiteTurn);
  renderClockTexture(clockBlackTex, fmtClock(clockBlackSecs), 'HUMAN PLAYER', !whiteTurn);
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
  clockWhiteSecs = CLOCK_INITIAL_SECS;
  clockBlackSecs = CLOCK_INITIAL_SECS;
  updateClockDisplays();
}
/** Seleção por clique (sem arrastar). Toca-mover: após escolher peça, não pode trocar por outra própria. */
let tapSelection = { from: null };
const TOUCH_MOVE_STRICT = true;
let statusBriefTimer = null;

/** Aplica brilho emissivo dourado na peça selecionada. */
function applySelectionGlow(sq, enable) {
  if (!sceneRef) return;
  for (const node of pieceNodes) {
    const meta = node.metadata;
    if (!meta || meta.square !== sq) continue;
    const meshes = node.getChildMeshes ? node.getChildMeshes(false) : (node.subMeshes ? [node] : []);
    const targets = meshes.length ? meshes : [node];
    for (const m of targets) {
      if (!m.material) continue;
      if (enable) {
        m.material.emissiveColor = new Color3(0.55, 0.38, 0.08); // glow dourado-âmbar
      } else {
        // Restaura emissivo original do bronze
        const isWhite = meta.color === "w";
        m.material.emissiveColor = isWhite
          ? new Color3(0.06, 0.038, 0.01)
          : new Color3(0.025, 0.015, 0.004);
      }
    }
    break;
  }
}

/** Prioridade quando há mais de um lance para a mesma casa (ex.: promoções). */
const KIND_PRI = {
  castle: 7,
  ep: 6,
  capture_promo: 5,
  capture: 4,
  promo: 3,
  double: 2,
  quiet: 1
};

function classifyVerboseMove(mv) {
  const f = mv.flags || "";
  if (f.includes("k") || f.includes("q")) return "castle";
  if (f.includes("e")) return "ep";
  if (f.includes("p") && f.includes("c")) return "capture_promo";
  if (f.includes("p")) return "promo";
  if (f.includes("c")) return "capture";
  if (f.includes("b")) return "double";
  return "quiet";
}

const KIND_COLOR = {
  selected: new Color3(0.95, 0.78, 0.18),
  quiet: new Color3(0.18, 0.72, 0.38),
  capture: new Color3(0.9, 0.22, 0.18),
  castle: new Color3(0.22, 0.4, 0.95),
  ep: new Color3(0.58, 0.28, 0.88),
  promo: new Color3(0.95, 0.68, 0.12),
  double: new Color3(0.15, 0.78, 0.88),
  capture_promo: new Color3(0.92, 0.42, 0.1),
  invalid_flash: new Color3(1, 0.12, 0.12),
  check_king: new Color3(1, 0.38, 0.05),
  check_mate: new Color3(0.92, 0.02, 0.1)
};

/** Casa destino → tipo de lance (melhor prioridade). */
let legalToKind = new Map();
let highlightMeshes = [];
const invalidFlashMeshes = [];

function clearMoveHighlights() {
  for (const m of highlightMeshes) {
    try {
      m.dispose();
    } catch (_) {}
  }
  highlightMeshes = [];
  legalToKind.clear();
}

function makeHighlightMaterial(scene, kind, alpha) {
  const mat = new StandardMaterial(`hlm_${kind}_${Math.random()}`, scene);
  const c = KIND_COLOR[kind] || KIND_COLOR.quiet;
  mat.diffuseColor = Color3.Black();
  mat.specularColor = Color3.Black();
  mat.emissiveColor = c.clone();
  mat.alpha = alpha;
  mat.transparencyMode = Material.MATERIAL_ALPHABLEND;
  mat.backFaceCulling = false;
  return mat;
}

function placeHighlightDisc(scene, sq, kind, diameter) {
  const alpha = kind === "selected" ? 0.38 : 0.5;
  const mat = makeHighlightMaterial(scene, kind, alpha);
  const disc = MeshBuilder.CreateCylinder(`hl_${sq}_${kind}`, { height: 0.02, diameter, tessellation: 36 }, scene);
  disc.material = mat;
  const w = sqToWorld(sq);
  disc.position.set(w.x, BOARD_PLANE_Y + 0.014, w.z);
  disc.rotation.x = Math.PI / 2;
  disc.metadata = { isHighlight: true };
  highlightMeshes.push(disc);
}

function showLegalMovesFor(fromSq) {
  if (!sceneRef) return;
  clearMoveHighlights();
  // Aplica glow na peça selecionada
  applySelectionGlow(fromSq, true);
  const moves = game.moves({ square: fromSq, verbose: true });
  placeHighlightDisc(sceneRef, fromSq, "selected", 0.9);
  if (!moves.length) return;
  for (const mv of moves) {
    const k = classifyVerboseMove(mv);
    const prev = legalToKind.get(mv.to);
    if (!prev || KIND_PRI[k] > KIND_PRI[prev]) legalToKind.set(mv.to, k);
  }
  for (const [sq, kind] of legalToKind) {
    placeHighlightDisc(sceneRef, sq, kind, 0.78);
  }
  syncCheckKingHighlight();
}

function flashInvalidSquare(to) {
  if (!sceneRef || !to) return;
  const mat = makeHighlightMaterial(sceneRef, "invalid_flash", 0.75);
  const disc = MeshBuilder.CreateCylinder(`hl_flash_${to}_${Date.now()}`, { height: 0.028, diameter: 0.84, tessellation: 36 }, sceneRef);
  disc.material = mat;
  const w = sqToWorld(to);
  disc.position.set(w.x, BOARD_PLANE_Y + 0.02, w.z);
  disc.rotation.x = Math.PI / 2;
  invalidFlashMeshes.push(disc);
  const d = disc;
  setTimeout(() => {
    try {
      d.dispose();
    } catch (_) {}
    const i = invalidFlashMeshes.indexOf(d);
    if (i >= 0) invalidFlashMeshes.splice(i, 1);
  }, 520);
}

let checkVisualMeshes = [];
let checkBeforeRender = null;

function findKingSquare(ch, color) {
  const b = ch.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (p && p.type === "k" && p.color === color) {
        return FILES[c] + (8 - r);
      }
    }
  }
  return null;
}

function clearCheckVisual() {
  if (checkBeforeRender && sceneRef) {
    sceneRef.unregisterBeforeRender(checkBeforeRender);
    checkBeforeRender = null;
  }
  for (const m of checkVisualMeshes) {
    try {
      m.dispose();
    } catch (_) {}
  }
  checkVisualMeshes = [];
}

function placeCheckThreatRing(sq, mode) {
  if (!sceneRef) return;
  const isMate = mode === "mate";
  const mat = makeHighlightMaterial(sceneRef, isMate ? "check_mate" : "check_king", isMate ? 0.7 : 0.48);
  mat.emissiveColor = isMate ? new Color3(0.95, 0.04, 0.12) : new Color3(1, 0.42, 0.08);
  const d = isMate ? 1.04 : 0.96;
  const disc = MeshBuilder.CreateCylinder(`chk_${sq}_${mode}`, { height: 0.026, diameter: d, tessellation: 40 }, sceneRef);
  disc.material = mat;
  const w = sqToWorld(sq);
  disc.position.set(w.x, BOARD_PLANE_Y + (isMate ? 0.03 : 0.024), w.z);
  disc.rotation.x = Math.PI / 2;
  disc.metadata = { isCheckRing: true };
  checkVisualMeshes.push(disc);

  if (isMate) {
    const rim = makeHighlightMaterial(sceneRef, "check_mate", 0.32);
    rim.emissiveColor = new Color3(1, 0.2, 0.25);
    const outer = MeshBuilder.CreateCylinder(`chk_outer_${sq}`, { height: 0.016, diameter: 1.14, tessellation: 48 }, sceneRef);
    outer.material = rim;
    outer.position.set(w.x, BOARD_PLANE_Y + 0.018, w.z);
    outer.rotation.x = Math.PI / 2;
    checkVisualMeshes.push(outer);
  } else {
    const meshRef = disc;
    checkBeforeRender = () => {
      if (!meshRef || meshRef.isDisposed()) return;
      const t = performance.now() / 1000;
      meshRef.material.alpha = 0.36 + 0.22 * Math.sin(t * 4.8);
    };
    sceneRef.registerBeforeRender(checkBeforeRender);
  }
}

function syncCheckKingHighlight() {
  if (!sceneRef) return;
  clearCheckVisual();
  if (game.isCheckmate()) {
    const sq = findKingSquare(game, game.turn());
    if (sq) placeCheckThreatRing(sq, "mate");
    return;
  }
  if (game.inCheck()) {
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
    detail.textContent =
      game.turn() === "w"
        ? "As pretas venceram a partida."
        : "As brancas venceram a partida.";
  } else if (game.isStalemate()) {
    title.textContent = "Afogamento";
    detail.textContent =
      "Empate: não há lances legais e o rei não está em xeque.";
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

function getMode() {
  return document.getElementById("mode").value;
}
function getPlayerColor() {
  return document.getElementById("playerColor").value;
}
function getCameraView() {
  const el = document.getElementById("cameraView");
  return el ? el.value : "player";
}
function trainEnabled() {
  return document.getElementById("trainOnline").checked;
}

function syncModeUI() {
  const engine = getMode() === "engine";
  document.getElementById("wrapColor").style.display = engine ? "flex" : "none";
  document.getElementById("depth").disabled = !engine;
  document.getElementById("timeMs").disabled = !engine;
}

/** Orbitar / rodar a câmera só com botão direito (0=esquerdo, 2=direito). Zoom com a roda mantém-se. */
function bindArcRotateRightMouseOnly(camera, scene, canvas) {
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  const setButtons = () => {
    const ptr = camera.inputs.attached?.pointers;
    if (ptr) ptr.buttons = [2];
  };
  setButtons();
  requestAnimationFrame(setButtons);
  requestAnimationFrame(() => requestAnimationFrame(setButtons));
  scene.executeWhenReady(setButtons);
}

/**
 * Presets de câmera (ArcRotate): beta baixo = mais de cima.
 * `orientWhiteBottom`: se true, ângulo como nas brancas; se false, rota 180° (pretas “em baixo” na tela).
 */
function applyBoardCamera() {
  if (!cameraRef) return;
  const cam = cameraRef;
  const whiteSide = getMode() === "human" || getPlayerColor() === "w";
  const preset = getCameraView();
  const orientWhiteBottom = preset === "fixed_white" ? true : whiteSide;

  cam.allowUpsideDown = false;

  if (preset === "top") {
    cam.setTarget(new Vector3(0, 0.5, 0));
    cam.alpha = -Math.PI / 2;
    cam.beta = 0.12;
    cam.radius = 18;
    cam.lowerAlphaLimit = null;
    cam.upperAlphaLimit = null;
    cam.lowerBetaLimit = 0.08;
    cam.upperBetaLimit = 0.62;
    cam.lowerRadiusLimit = 10.5;
    cam.upperRadiusLimit = 26;
    cam.fov = 0.95;
    syncChessClockPlacement();
    return;
  }

  if (preset === "quarter") {
    const zOff = orientWhiteBottom ? 0.14 : -0.14;
    cam.setTarget(new Vector3(0, 0.5, zOff));
    const alpha = orientWhiteBottom ? -Math.PI / 3.25 : Math.PI / 3.25;
    const limA = 0.95;
    cam.alpha = alpha;
    cam.beta = 0.62;
    cam.radius = 11.5;
    cam.lowerAlphaLimit = alpha - limA;
    cam.upperAlphaLimit = alpha + limA;
    cam.lowerBetaLimit = 0.38;
    cam.upperBetaLimit = 1.05;
    cam.lowerRadiusLimit = 7.5;
    cam.upperRadiusLimit = 22;
    cam.fov = 1.0;
    syncChessClockPlacement();
    return;
  }

  /* player (padrão) e fixed_white:
   * Câmera first-person imersiva:
   * - Beta FIXO (sem rotação vertical — apenas pan horizontal + zoom)
   * - FOV amplo (1.12 rad ~ 64°) para perspectiva cinematográfica
   * - Alvo levemente acima do tabuleiro para ver o orbe e o ambiente atrás
   * - Raio menor para ficar mais perto da mesa (imersão)
   */
  const limA = 0.78;         // ~±45° — pan largo para parallax 180° no fundo
  const playerRadius = 11.2; // mais próximo para imersão
  const playerBeta  = 0.82;  // ângulo fixo de inclinação (olhando levemente para baixo)

  if (orientWhiteBottom) {
    cam.setTarget(new Vector3(0, 1.4, -1.2)); // alvo: centro do tabuleiro + um pouco atrás
    const alpha = -Math.PI / 2;
    cam.alpha  = alpha;
    cam.beta   = playerBeta;
    cam.radius = playerRadius;
    cam.lowerAlphaLimit = alpha - limA;
    cam.upperAlphaLimit = alpha + limA;
  } else {
    cam.setTarget(new Vector3(0, 1.4, 1.2));
    const alpha = Math.PI / 2;
    cam.alpha  = alpha;
    cam.beta   = playerBeta;
    cam.radius = playerRadius;
    cam.lowerAlphaLimit = alpha - limA;
    cam.upperAlphaLimit = alpha + limA;
  }
  // Beta fixo: sem rotação vertical no modo first-person
  cam.lowerBetaLimit  = playerBeta - 0.001;
  cam.upperBetaLimit  = playerBeta + 0.001;
  cam.lowerRadiusLimit = 7.5;  // zoom in máximo
  cam.upperRadiusLimit = 17.0; // zoom out máximo
  cam.fov = 1.12; // FOV mais amplo para perspectiva first-person imersiva
  syncChessClockPlacement();
}

function syncChessClockPlacement() {
  if (!chessClockRootRef) return;
  const whiteSide = getMode() === "human" || getPlayerColor() === "w";
  if (whiteSide) {
    // À direita do jogador (+X), na borda da mesa, bem fora do tabuleiro.
    chessClockRootRef.position.set(5.95, 0.44, -5.38);
    chessClockRootRef.rotation.y = -1.02;
  } else {
    chessClockRootRef.position.set(-5.95, 0.44, 5.38);
    chessClockRootRef.rotation.y = 1.02;
  }
}

function isPlayerTurn() {
  if (getMode() === "human") return true;
  return game.turn() === getPlayerColor();
}

function setStatus(msg) {
  const el = document.getElementById("status");
  if (el) el.textContent = msg;
}

function setStatusBrief(msg, ms = 2600) {
  if (statusBriefTimer) {
    clearTimeout(statusBriefTimer);
    statusBriefTimer = null;
  }
  setStatus(msg);
  statusBriefTimer = setTimeout(() => {
    statusBriefTimer = null;
    updateStatus();
  }, ms);
}

function clearTapSelection() {
  // Remove glow da peça que estava selecionada
  if (tapSelection.from) {
    applySelectionGlow(tapSelection.from, false);
  }
  tapSelection.from = null;
  clearMoveHighlights();
  syncCheckKingHighlight();
}

function updateStatus() {
  let s = "";
  if (game.isCheckmate()) {
    s =
      "Xeque-mate — " +
      (game.turn() === "w" ? "vitória das pretas." : "vitória das brancas.");
  } else if (game.isStalemate()) {
    s = "Empate por afogamento.";
  } else if (game.isInsufficientMaterial()) {
    s = "Empate — material insuficiente.";
  } else if (game.isThreefoldRepetition()) {
    s = "Empate — tripla repetição.";
  } else if (game.isDrawByFiftyMoves()) {
    s = "Empate — regra dos 50 lances.";
  } else if (game.isDraw()) {
    s = "Empate.";
  } else {
    s = game.turn() === "w" ? "Vez das brancas." : "Vez das pretas.";
    if (game.inCheck()) {
      s = "Xeque! " + s;
    }
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

function makePieceMaterial(scene, color) {
  const mat = new StandardMaterial(`pm_${color}_${Math.random()}`, scene);
  // Bronze/cobre envelhecido: todas as peças com tonalidade unificada
  // Peças brancas: bronze mais claro/dourado; pretas: bronze mais escuro/oxidado
  if (color === "w") {
    mat.diffuseColor  = new Color3(0.48, 0.32, 0.14);  // bronze dourado
    mat.specularColor = new Color3(0.85, 0.68, 0.32);  // reflexo dourado intenso
    mat.emissiveColor = new Color3(0.06, 0.038, 0.01); // leve brilho quente
    mat.specularPower = 220;
  } else {
    mat.diffuseColor  = new Color3(0.28, 0.18, 0.08);  // bronze escuro/oxidado
    mat.specularColor = new Color3(0.62, 0.48, 0.22);  // reflexo cobre
    mat.emissiveColor = new Color3(0.025, 0.015, 0.004);
    mat.specularPower = 180;
  }
  return mat;
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mármore procedural desenhado no canvas (Carrara / Nero Marquina). */
function paintMarbleTexture(dynamicTex, light, seed) {
  const sz = dynamicTex.getSize();
  const w = sz.width;
  const h = sz.height;
  const ctx = dynamicTex.getContext();
  const rnd = mulberry32(seed >>> 0);

  if (light) {
    // Mármore Calacatta: creme quente com veios dourados
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, `rgb(${248 + (rnd() * 6) | 0},${242 + (rnd() * 6) | 0},${228 + (rnd() * 8) | 0})`);
    g.addColorStop(0.35, `rgb(${240 + (rnd() * 8) | 0},${232 + (rnd() * 8) | 0},${216 + (rnd() * 10) | 0})`);
    g.addColorStop(0.7, `rgb(${232 + (rnd() * 8) | 0},${222 + (rnd() * 8) | 0},${204 + (rnd() * 10) | 0})`);
    g.addColorStop(1, `rgb(${220 + (rnd() * 10) | 0},${210 + (rnd() * 10) | 0},${190 + (rnd() * 12) | 0})`);
    ctx.fillStyle = g;
  } else {
    // Mármore Nero Marquina: preto profundo com veios brancos
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, `rgb(${38 + (rnd() * 10) | 0},${34 + (rnd() * 10) | 0},${42 + (rnd() * 10) | 0})`);
    g.addColorStop(0.4, `rgb(${28 + (rnd() * 8) | 0},${25 + (rnd() * 8) | 0},${32 + (rnd() * 8) | 0})`);
    g.addColorStop(1, `rgb(${14 + (rnd() * 6) | 0},${12 + (rnd() * 6) | 0},${18 + (rnd() * 6) | 0})`);
    ctx.fillStyle = g;
  }
  ctx.fillRect(0, 0, w, h);

  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const grain = light ? 14 : 22;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rnd() - 0.5) * grain;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);

  ctx.globalCompositeOperation = light ? "multiply" : "lighter";
  const veinN = light ? 22 : 20;
  for (let k = 0; k < veinN; k++) {
    // Mármore claro: veios cinza-dourado; mármore escuro: veios brancos e prateados
    ctx.strokeStyle = light
      ? (k % 5 === 0
          ? `rgba(180,148,80,${0.06 + rnd() * 0.08})`   // veio dourado ocasional
          : `rgba(100,92,110,${0.07 + rnd() * 0.09})`)
      : `rgba(200,196,215,${0.045 + rnd() * 0.065})`;
    ctx.lineWidth = 0.6 + rnd() * 2.2;
    ctx.beginPath();
    let x = rnd() * w;
    let y = rnd() * h;
    ctx.moveTo(x, y);
    for (let s = 0; s < 7; s++) {
      const cpx = x + (rnd() - 0.5) * 200;
      const cpy = y + (rnd() - 0.5) * 200;
      const x2 = Math.max(0, Math.min(w, x + (rnd() - 0.5) * 220));
      const y2 = Math.max(0, Math.min(h, y + (rnd() - 0.5) * 220));
      ctx.quadraticCurveTo(cpx, cpy, x2, y2);
      x = x2;
      y = y2;
    }
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";

  dynamicTex.update(true);
}

/** Fundo tipo mármore escuro (faixa horizontal) para texto gravado — continua o mesmo vocabulário visual da base. */
function paintDarkMarbleBandOnCtx(ctx, w, h, seed) {
  const rnd = mulberry32(seed >>> 0);
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, `rgb(${44 + ((rnd() * 12) | 0)},${42 + ((rnd() * 12) | 0)},${48 + ((rnd() * 12) | 0)})`);
  g.addColorStop(1, `rgb(${18 + ((rnd() * 8) | 0)},${17 + ((rnd() * 8) | 0)},${22 + ((rnd() * 8) | 0)})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const grain = 20;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rnd() - 0.5) * grain;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
  ctx.globalCompositeOperation = "multiply";
  for (let k = 0; k < 14; k++) {
    ctx.strokeStyle = `rgba(88,86,98,${0.055 + rnd() * 0.08})`;
    ctx.lineWidth = 0.6 + rnd() * 2;
    ctx.beginPath();
    let x = rnd() * w;
    let y = rnd() * h;
    ctx.moveTo(x, y);
    for (let s = 0; s < 6; s++) {
      x += (rnd() - 0.5) * 160;
      y += (rnd() - 0.5) * 80;
      ctx.lineTo(Math.max(0, Math.min(w, x)), Math.max(0, Math.min(h, y)));
    }
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
}

/** Letras como sulcos gravados no mármore (sem “placa”). */
function drawEngravedSatorTextOnCtx(ctx, tw, th, lines) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const carve = (word, cy, fs) => {
    ctx.font = `700 ${fs}px Georgia, "Times New Roman", serif`;
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.strokeText(word, tw / 2 + 1.2, cy + 1.2);
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.strokeText(word, tw / 2 + 0.6, cy + 0.65);
    ctx.fillStyle = "rgba(5,4,9,0.92)";
    ctx.fillText(word, tw / 2, cy);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(120,112,140,0.18)";
    ctx.strokeText(word, tw / 2 - 0.55, cy - 0.55);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "rgba(255,245,220,0.06)";
    ctx.strokeText(word, tw / 2 - 0.85, cy - 0.85);
  };
  if (lines.length === 1) {
    carve(lines[0], th / 2, 74);
  } else {
    carve(lines[0], th * 0.34, 58);
    carve(lines[1], th * 0.66, 58);
  }
  ctx.restore();
}

function createMarbleTexture(scene, name, light, seed) {
  const tex = new DynamicTexture(name, { width: 512, height: 512 }, scene, false);
  tex.wrapU = Texture.WRAP_ADDRESSMODE;
  tex.wrapV = Texture.WRAP_ADDRESSMODE;
  paintMarbleTexture(tex, light, seed);
  return tex;
}

/**
 * Base Staunton em dois degraus + anel (alinhada a torres/reis de conjunto clássico).
 */
function addPedestal(scene, parts, y0) {
  let y = y0;
  const bot = MeshBuilder.CreateCylinder(`pedb_${Math.random()}`, { diameter: 0.58, height: 0.05, tessellation: 48 }, scene);
  bot.position.y = y + 0.025;
  parts.push(bot);
  y += 0.05;
  const mid = MeshBuilder.CreateCylinder(`pedm_${Math.random()}`, { diameterTop: 0.38, diameterBottom: 0.47, height: 0.064, tessellation: 48 }, scene);
  mid.position.y = y + 0.032;
  parts.push(mid);
  y += 0.064;
  const ring = MeshBuilder.CreateTorus(`pedr_${Math.random()}`, { diameter: 0.34, thickness: 0.024, tessellation: 42 }, scene);
  ring.position.y = y + 0.012;
  ring.rotation.x = Math.PI / 2;
  parts.push(ring);
  y += 0.024;
  return y;
}

/** Perfil de haste côncava (revolução); último ponto em y = stemH. */
function stauntonStemProfile(stemH) {
  return [
    new Vector3(0.198, 0, 0),
    new Vector3(0.206, 0.038, 0),
    new Vector3(0.158, stemH * 0.48, 0),
    new Vector3(0.148, stemH * 0.72, 0),
    new Vector3(0.176, stemH, 0)
  ];
}

function addLatheStem(scene, parts, y0, stemH) {
  const shape = stauntonStemProfile(stemH);
  const lathe = MeshBuilder.CreateLathe(`stl_${Math.random()}`, { shape, tessellation: 52 }, scene);
  lathe.position.y = y0;
  parts.push(lathe);
  return y0 + stemH;
}

function addDoubleCollar(scene, parts, yBase) {
  const d = 0.308;
  const th = 0.017;
  const t1 = MeshBuilder.CreateTorus(`dc1_${Math.random()}`, { diameter: d, thickness: th, tessellation: 44 }, scene);
  t1.position.y = yBase;
  t1.rotation.x = Math.PI / 2;
  parts.push(t1);
  const t2 = MeshBuilder.CreateTorus(`dc2_${Math.random()}`, { diameter: d, thickness: th, tessellation: 44 }, scene);
  t2.position.y = yBase + th * 2 + 0.006;
  t2.rotation.x = Math.PI / 2;
  parts.push(t2);
  return yBase + th * 4 + 0.012;
}

function addTripleCollar(scene, parts, yBase) {
  const rings = [
    { d: 0.27, th: 0.013 },
    { d: 0.318, th: 0.022 },
    { d: 0.27, th: 0.013 }
  ];
  let y = yBase;
  for (const r of rings) {
    const t = MeshBuilder.CreateTorus(`tc_${Math.random()}`, { diameter: r.d, thickness: r.th, tessellation: 44 }, scene);
    t.position.y = y + r.th * 0.5;
    t.rotation.x = Math.PI / 2;
    parts.push(t);
    y += r.th + 0.006;
  }
  return y;
}

/** Fenda do bispo (material escuro; evita CSG — segundo bundle quebrava instanceof Mesh no browser). */
function makeBishopSlitMaterial(scene, color) {
  const m = new StandardMaterial(`bslit_${Math.random()}`, scene);
  if (color === "w") {
    m.diffuseColor = new Color3(0.035, 0.035, 0.04);
    m.specularColor = Color3.Black();
  } else {
    m.diffuseColor = new Color3(0.07, 0.07, 0.08);
    m.specularColor = new Color3(0.22, 0.22, 0.24);
  }
  m.emissiveColor = Color3.Black();
  return m;
}

/** Bispo: mitra + caixa fina na diagonal (mescla multimaterial). */
function bishopMitreWithSlitVisual(scene, parts, yCenter) {
  const mitre = MeshBuilder.CreateSphere(`bm_${Math.random()}`, { diameter: 0.32, segments: 28 }, scene);
  mitre.scaling = new Vector3(0.86, 1.38, 0.86);
  mitre.position.y = yCenter;
  parts.push(mitre);
  const slit = MeshBuilder.CreateBox(`bm_sl_${Math.random()}`, { width: 0.048, height: 0.32, depth: 0.44 }, scene);
  slit.position.set(-0.1, yCenter + 0.045, 0.05);
  slit.rotation.z = 0.62;
  slit.rotation.y = -0.42;
  slit.metadata = { bishopSlit: true };
  parts.push(slit);
}

function addIcoOrSphere(scene, name, radius, yCenter, subdiv = 2) {
  try {
    const mesh = MeshBuilder.CreateIcoSphere(name, { radius, subdivisions: subdiv, flat: false }, scene);
    mesh.position.y = yCenter;
    return mesh;
  } catch {
    const mesh = MeshBuilder.CreateSphere(`${name}_sph`, { diameter: radius * 2, segments: 26 }, scene);
    mesh.position.y = yCenter;
    return mesh;
  }
}

/**
 * Peças Staunton refinadas (malha mais densa + proporções).
 */
function createPieceMesh(scene, type, color) {
  const mat = makePieceMaterial(scene, color);
  const parts = [];
  let y = 0;

  y = addPedestal(scene, parts, y);

  if (type === "p") {
    const body = MeshBuilder.CreateCylinder(`pb_${Math.random()}`, { diameterTop: 0.19, diameterBottom: 0.31, height: 0.26, tessellation: 32 }, scene);
    body.position.y = y + 0.11;
    parts.push(body);
    const collar = MeshBuilder.CreateTorus(`pc_${Math.random()}`, { diameter: 0.2, thickness: 0.038, tessellation: 28 }, scene);
    collar.position.y = y + 0.22;
    collar.rotation.x = Math.PI / 2;
    parts.push(collar);
    const head = addIcoOrSphere(scene, `ph_${Math.random()}`, 0.1, y + 0.29 + 0.1, 2);
    parts.push(head);
  } else if (type === "r") {
    const stemH = 0.36;
    y = addLatheStem(scene, parts, y, stemH);
    y = addDoubleCollar(scene, parts, y + 0.01);
    const headH = 0.1;
    const headR = 0.165;
    const head = MeshBuilder.CreateCylinder(`rt_${Math.random()}`, { diameter: headR * 2, height: headH, tessellation: 48 }, scene);
    head.position.y = y + headH * 0.5;
    parts.push(head);
    const topDeck = MeshBuilder.CreateCylinder(`rtd_${Math.random()}`, { diameter: headR * 2 - 0.04, height: 0.022, tessellation: 40 }, scene);
    topDeck.position.y = y + headH + 0.011;
    parts.push(topDeck);
    const merlons = 8;
    const mr = headR * 0.88;
    const yMer = y + headH + 0.056;
    for (let i = 0; i < merlons; i++) {
      const ang = (i / merlons) * Math.PI * 2;
      const tooth = MeshBuilder.CreateBox(`rc_${i}_${Math.random()}`, { width: 0.088, height: 0.1, depth: 0.052 }, scene);
      tooth.position.set(Math.cos(ang) * mr, yMer, Math.sin(ang) * mr);
      tooth.rotation.y = -ang;
      parts.push(tooth);
    }
  } else if (type === "n") {
    const stemH = 0.24;
    y = addLatheStem(scene, parts, y, stemH);
    const chest = MeshBuilder.CreateCylinder(`nb_${Math.random()}`, { diameterTop: 0.26, diameterBottom: 0.34, height: 0.2, tessellation: 36 }, scene);
    chest.position.y = y + 0.1;
    parts.push(chest);
    y += 0.2;
    const neck = MeshBuilder.CreateCylinder(`nn_${Math.random()}`, { diameterTop: 0.2, diameterBottom: 0.27, height: 0.16, tessellation: 28 }, scene);
    neck.position.set(0.015, y + 0.06, 0.04);
    neck.rotation.z = 0.42;
    neck.rotation.x = -0.32;
    parts.push(neck);
    const skull = MeshBuilder.CreateSphere(`nsk_${Math.random()}`, { diameter: 0.22, segments: 20 }, scene);
    skull.position.set(0.04, y + 0.15, 0.14);
    skull.scaling = new Vector3(1.05, 0.92, 1.25);
    skull.rotation.y = -0.38;
    parts.push(skull);
    const snout = MeshBuilder.CreateCylinder(`nsn_${Math.random()}`, { diameterTop: 0.07, diameterBottom: 0.12, height: 0.34, tessellation: 16 }, scene);
    snout.position.set(0.08, y + 0.1, 0.32);
    snout.rotation.x = 1.05;
    snout.rotation.y = -0.28;
    parts.push(snout);
    const jaw = MeshBuilder.CreateBox(`nj_${Math.random()}`, { width: 0.1, height: 0.06, depth: 0.16 }, scene);
    jaw.position.set(0.06, y + 0.06, 0.34);
    jaw.rotation.x = 0.35;
    jaw.rotation.y = -0.22;
    parts.push(jaw);
    const ear1 = MeshBuilder.CreateCylinder(`ne1_${Math.random()}`, { diameterTop: 0.02, diameterBottom: 0.06, height: 0.1, tessellation: 8 }, scene);
    ear1.position.set(-0.02, y + 0.22, 0.06);
    ear1.rotation.z = -0.35;
    ear1.rotation.x = 0.25;
    parts.push(ear1);
    const ear2 = MeshBuilder.CreateCylinder(`ne2_${Math.random()}`, { diameterTop: 0.02, diameterBottom: 0.055, height: 0.085, tessellation: 8 }, scene);
    ear2.position.set(0.02, y + 0.24, -0.02);
    ear2.rotation.z = 0.28;
    ear2.rotation.x = 0.15;
    parts.push(ear2);
    const maneN = 14;
    for (let i = 0; i < maneN; i++) {
      const t = i / (maneN - 1);
      const ang = -0.85 + t * 1.35;
      const my = y + 0.04 + t * 0.2;
      const mz = -0.12 - t * 0.14;
      const ridge = MeshBuilder.CreateBox(`nm_${i}_${Math.random()}`, { width: 0.028, height: 0.11 + t * 0.06, depth: 0.045 }, scene);
      ridge.position.set(-0.1 - t * 0.04, my, mz);
      ridge.rotation.y = ang;
      ridge.rotation.z = -0.15 - t * 0.25;
      parts.push(ridge);
    }
  } else if (type === "b") {
    const stemH = 0.3;
    y = addLatheStem(scene, parts, y, stemH);
    const lowCollar = MeshBuilder.CreateTorus(`bcl_${Math.random()}`, { diameter: 0.38, thickness: 0.026, tessellation: 44 }, scene);
    lowCollar.position.y = y + 0.014;
    lowCollar.rotation.x = Math.PI / 2;
    parts.push(lowCollar);
    const neck = MeshBuilder.CreateCylinder(`bn_${Math.random()}`, { diameterTop: 0.19, diameterBottom: 0.24, height: 0.07, tessellation: 32 }, scene);
    neck.position.y = y + 0.048;
    parts.push(neck);
    const upCollar = MeshBuilder.CreateTorus(`bcu_${Math.random()}`, { diameter: 0.23, thickness: 0.012, tessellation: 36 }, scene);
    upCollar.position.y = y + 0.09;
    upCollar.rotation.x = Math.PI / 2;
    parts.push(upCollar);
    const yMitre = y + 0.2;
    bishopMitreWithSlitVisual(scene, parts, yMitre);
    const finial = MeshBuilder.CreateSphere(`bfin_${Math.random()}`, { diameter: 0.1, segments: 20 }, scene);
    finial.position.y = yMitre + 0.26;
    parts.push(finial);
  } else if (type === "q") {
    const stemH = 0.4;
    y = addLatheStem(scene, parts, y, stemH);
    y = addTripleCollar(scene, parts, y + 0.008);
    const cup = MeshBuilder.CreateCylinder(`qc_${Math.random()}`, { diameterTop: 0.36, diameterBottom: 0.22, height: 0.15, tessellation: 48 }, scene);
    cup.position.y = y + 0.075;
    parts.push(cup);
    y += 0.15;
    const crownR = 0.152;
    const ySpike = y + 0.07;
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const spike = MeshBuilder.CreateCylinder(`qs_${i}_${Math.random()}`, { diameterTop: 0.04, diameterBottom: 0.09, height: 0.11, tessellation: 10 }, scene);
      spike.position.set(Math.cos(ang) * crownR, ySpike, Math.sin(ang) * crownR);
      parts.push(spike);
      const knob = MeshBuilder.CreateSphere(`qk_${i}_${Math.random()}`, { diameter: 0.065, segments: 14 }, scene);
      knob.position.set(Math.cos(ang) * crownR, ySpike + 0.075, Math.sin(ang) * crownR);
      parts.push(knob);
    }
    const monde = MeshBuilder.CreateSphere(`qj_${Math.random()}`, { diameter: 0.09, segments: 20 }, scene);
    monde.position.y = ySpike + 0.12;
    parts.push(monde);
  } else if (type === "k") {
    const stemH = 0.42;
    y = addLatheStem(scene, parts, y, stemH);
    y = addTripleCollar(scene, parts, y + 0.008);
    const cup = MeshBuilder.CreateCylinder(`kc_${Math.random()}`, { diameterTop: 0.34, diameterBottom: 0.21, height: 0.14, tessellation: 48 }, scene);
    cup.position.y = y + 0.07;
    parts.push(cup);
    y += 0.14;
    const rimY = y + 0.02;
    const battleR = 0.155;
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const tooth = MeshBuilder.CreateCylinder(`kt_${i}_${Math.random()}`, { diameterTop: 0.02, diameterBottom: 0.07, height: 0.095, tessellation: 8 }, scene);
      tooth.position.set(Math.cos(ang) * battleR, rimY + 0.048, Math.sin(ang) * battleR);
      parts.push(tooth);
    }
    const crossY = rimY + 0.11;
    const crossV = MeshBuilder.CreateBox(`kv_${Math.random()}`, { width: 0.065, height: 0.3, depth: 0.065 }, scene);
    crossV.position.y = crossY + 0.12;
    parts.push(crossV);
    const crossH = MeshBuilder.CreateBox(`kh2_${Math.random()}`, { width: 0.22, height: 0.065, depth: 0.065 }, scene);
    crossH.position.y = crossY + 0.2;
    parts.push(crossH);
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [-1, 0],
      [1, 0]
    ]) {
      const orb = MeshBuilder.CreateSphere(`ko_${dx}_${dy}_${Math.random()}`, { diameter: 0.078, segments: 14 }, scene);
      orb.position.set(dx * 0.102, crossY + 0.2 + dy * 0.102, 0);
      parts.push(orb);
    }
  }

  const multiMat = type === "b";
  for (const p of parts) {
    p.material = multiMat && p.metadata?.bishopSlit ? makeBishopSlitMaterial(scene, color) : mat;
  }

  const merged = Mesh.MergeMeshes(parts, false, true, undefined, multiMat, false);
  if (merged) {
    for (const p of parts) {
      try {
        p.dispose();
      } catch (_) {}
    }
    merged.name = `piece_${type}_${color}`;
    if (!multiMat) merged.material = mat;
    merged.refreshBoundingInfo(true);
    merged.metadata = { isPiece: true };
    return merged;
  }
  const root = new TransformNode(`piece_${type}_${color}_root`, scene);
  for (const p of parts) {
    p.parent = root;
  }
  root.metadata = { isPiece: true };
  return root;
}

function disposePieces() {
  for (const m of pieceNodes) m.dispose();
  pieceNodes = [];
}

function syncPiecesFromGame() {
  if (!sceneRef) return;
  const scene = sceneRef;
  disposePieces();
  const board = game.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = board[row][col];
      if (!p) continue;
      const sq = squareFromBoardRC(row, col);
      const mesh = createPieceMesh(scene, p.type, p.color);
      mesh.refreshBoundingInfo(true);
      const minY = mesh.getBoundingInfo().boundingBox.minimum.y;
      const w = sqToWorld(sq);
      mesh.position.set(w.x, 0.06 - minY, w.z);
      mesh.metadata = { ...mesh.metadata, square: sq, type: p.type, color: p.color };
      pieceNodes.push(mesh);
    }
  }
  syncCheckKingHighlight();
}

let promoResolve = null;

function openPromotionPicker() {
  const ov = document.getElementById("promoOverlay");
  ov.classList.add("open");
  ov.setAttribute("aria-hidden", "false");
  return new Promise((resolve) => {
    promoResolve = resolve;
  });
}

function closePromotionPicker(choice) {
  const ov = document.getElementById("promoOverlay");
  ov.classList.remove("open");
  ov.setAttribute("aria-hidden", "true");
  if (promoResolve) {
    promoResolve(choice);
    promoResolve = null;
  }
}

document.querySelectorAll(".promo-btns button").forEach((btn) => {
  btn.addEventListener("click", () => closePromotionPicker(btn.getAttribute("data-p")));
});

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
  try {
    move = game.move(opts);
  } catch {
    return false;
  }
  if (!move) return false;

  tapSelection.from = null;
  clearMoveHighlights();
  const fenAfter = game.fen();
  syncPiecesFromGame();
  updateStatus();

  if (trainEnabled()) {
    try {
      const lr = await fetch("/api/move-learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fenBefore,
          fenAfter,
          san: move.san,
          enabled: true
        })
      }).then((r) => r.json());
      if (lr.ok && lr.tdError != null) {
        document.getElementById("metrics").innerHTML =
          `<strong>TD</strong> ${lr.tdError.toFixed(4)} · <strong>V</strong> ${lr.vBefore?.toFixed(3) ?? "—"}`;
      }
    } catch (e) {
      console.warn("move-learn", e);
    }
  }

  // Atualiza displays do relógio após cada lance
  updateClockDisplays();
  if (game.isGameOver()) stopClock();

  if (getMode() === "engine") maybeEngineReply();
  else if (game.isGameOver()) saveReplayAuto();

  return true;
}

async function callBestMove() {
  if (getMode() !== "engine" || game.isGameOver()) return;
  clearTapSelection();
  busy = true;
  updateStatus();
  const depth = parseInt(document.getElementById("depth").value, 10);
  const timeMs = parseInt(document.getElementById("timeMs").value, 10);
  const fenBefore = game.fen();

  const res = await fetch("/api/bestmove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fen: fenBefore, depth, timeMs })
  }).then((r) => r.json());

  if (res.bestMove && res.bestMove.san) {
    try {
      game.move(res.bestMove.san, { sloppy: true });
    } catch {
      busy = false;
      updateStatus();
      return;
    }
    const fenAfter = game.fen();
    syncPiecesFromGame();
    clearTapSelection();
    updateStatus();

    if (trainEnabled()) {
      try {
        const lr = await fetch("/api/move-learn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fenBefore,
            fenAfter,
            san: res.bestMove.san,
            enabled: true
          })
        }).then((r) => r.json());
        if (lr.ok && lr.tdError != null) {
          document.getElementById("metrics").innerHTML =
            `<strong>TD</strong> ${lr.tdError.toFixed(4)} · motor`;
        }
      } catch (e) {
        console.warn("move-learn engine", e);
      }
    }
  }
  busy = false;
  updateStatus();
  if (game.isGameOver()) saveReplayAuto();
}

function maybeEngineReply() {
  if (getMode() !== "engine" || game.isGameOver()) return;
  if (game.turn() !== getPlayerColor()) {
    setTimeout(() => callBestMove(), 200);
  }
}

async function saveReplayAuto() {
  const pgn = game.pgn();
  let result = "unknown";
  if (game.isCheckmate()) result = game.turn() === "w" ? "black" : "white";
  else if (game.isDraw()) result = "draw";
  await fetch("/api/replay/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pgn,
      fen: game.fen(),
      result,
      moves: game.history(),
      meta: { auto: true, ui: "chess3d", mode: getMode(), playerColor: getPlayerColor() }
    })
  }).catch(() => {});
}

async function refreshNNStatus() {
  try {
    const s = await fetch("/api/nn/status").then((r) => r.json());
    if (!s.ok) return;
    const el = document.getElementById("metrics");
    const cur = el.textContent;
    if (cur === "Rede: —" || !cur.includes("TD")) {
      el.innerHTML = `<strong>NN</strong> in=${s.inputDim} h=${s.hidden} · <strong>upd</strong> ${s.updates}`;
    }
  } catch (_) {}
}

/** Mesa distante (silhueta de torneio / clube). */
function addRemoteChessTable(scene, cx, cz, w, d, woodMat, darkMat) {
  const top = MeshBuilder.CreateBox(`rtTop_${cx}_${cz}`, { width: w, height: 0.07, depth: d }, scene);
  top.position.set(cx, 0.035, cz);
  top.material = woodMat;
  const board = MeshBuilder.CreateBox(`rtBd_${cx}_${cz}`, { width: w * 0.42, height: 0.02, depth: d * 0.42 }, scene);
  board.position.set(cx, 0.085, cz);
  board.material = darkMat;
  const lx = (w * 0.38) / 2;
  const lz = (d * 0.38) / 2;
  const yLeg = -0.32;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const leg = MeshBuilder.CreateCylinder(`rtL_${cx}_${cz}_${sx}_${sz}`, { diameter: 0.11, height: 0.68, tessellation: 10 }, scene);
      leg.position.set(cx + sx * lx, yLeg, cz + sz * lz);
      leg.material = darkMat;
    }
  }
}

/** Pernas + avental da mesa onde jogas (por baixo do mármore). */
function buildPlayerChessTable(scene) {
  // Mesa de mármore Nero Gold/Portoro: preto polido com veios dourados
  const marbleMat = new StandardMaterial("plyrTblMarble", scene);
  marbleMat.diffuseColor  = new Color3(0.072, 0.062, 0.052); // preto mármore escuro
  marbleMat.specularColor = new Color3(0.62, 0.48, 0.22);    // reflexo dourado intenso
  marbleMat.specularPower = 220;                              // superpolido

  // Bordas de latão (moldura da mesa)
  const brassMat = new StandardMaterial("plyrTblBrass", scene);
  brassMat.diffuseColor  = new Color3(0.52, 0.38, 0.12);
  brassMat.specularColor = new Color3(0.88, 0.72, 0.32);
  brassMat.specularPower = 160;

  // Tampo da mesa (mármore)
  const tableTop = MeshBuilder.CreateBox("ptTableTop", { width: 18.0, height: 0.28, depth: 18.0 }, scene);
  tableTop.position.set(0, -0.14, 0);
  tableTop.material = marbleMat;

  // Moldura de latão ao redor do tampo
  const frameN = MeshBuilder.CreateBox("ptFrameN", { width: 18.1, height: 0.30, depth: 0.18 }, scene);
  frameN.position.set(0, -0.14, -9.05); frameN.material = brassMat;
  const frameS = MeshBuilder.CreateBox("ptFrameS", { width: 18.1, height: 0.30, depth: 0.18 }, scene);
  frameS.position.set(0, -0.14,  9.05); frameS.material = brassMat;
  const frameE = MeshBuilder.CreateBox("ptFrameE", { width: 0.18, height: 0.30, depth: 18.1 }, scene);
  frameE.position.set( 9.05, -0.14, 0); frameE.material = brassMat;
  const frameW = MeshBuilder.CreateBox("ptFrameW", { width: 0.18, height: 0.30, depth: 18.1 }, scene);
  frameW.position.set(-9.05, -0.14, 0); frameW.material = brassMat;

  // Pés torneados de latão
  const legMat = new StandardMaterial("plyrTblLeg", scene);
  legMat.diffuseColor  = new Color3(0.38, 0.28, 0.10);
  legMat.specularColor = new Color3(0.72, 0.58, 0.25);
  legMat.specularPower = 130;
  const ap = 4.12;
  const legTop = -0.28;
  const legBot = -1.20;
  const legH = legTop - legBot;
  const cy = (legTop + legBot) / 2;
  for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
    const leg = MeshBuilder.CreateCylinder(`ptLeg_${sx}_${sz}`, { diameter: 0.22, height: legH, tessellation: 16 }, scene);
    leg.position.set(sx * ap, cy, sz * ap);
    leg.material = legMat;
  }
}

/** Biblioteca vitoriana: paredes de mogno, lareira, estantes, vitral, cadeira do adversário. */
function buildChessClubEnvironment(scene) {
  // clearColor da cena: transparente em createScene — fundo real = camadas CSS com parallax

  // Materiais reutilizáveis
  const mognoDark = new StandardMaterial("mognoDark", scene);
  mognoDark.diffuseColor  = new Color3(0.14, 0.072, 0.034);
  mognoDark.specularColor = new Color3(0.22, 0.16, 0.09);
  mognoDark.specularPower = 68;

  const mognoMid = new StandardMaterial("mognoMid", scene);
  mognoMid.diffuseColor  = new Color3(0.22, 0.12, 0.055);
  mognoMid.specularColor = new Color3(0.28, 0.20, 0.11);
  mognoMid.specularPower = 55;

  const stoneMat = new StandardMaterial("stoneMat", scene);
  stoneMat.diffuseColor  = new Color3(0.32, 0.28, 0.24);
  stoneMat.specularColor = new Color3(0.12, 0.10, 0.08);
  stoneMat.specularPower = 22;

  const darkFloor = new StandardMaterial("darkFloor", scene);
  darkFloor.diffuseColor  = new Color3(0.09, 0.055, 0.028);
  darkFloor.specularColor = new Color3(0.14, 0.10, 0.06);
  darkFloor.specularPower = 60;

  // --- PISO ---
  const floor = MeshBuilder.CreateGround("libFloor", { width: 40, height: 40 }, scene);
  floor.position.set(0, -0.22, 0);
  floor.material = darkFloor;

  // --- PAREDES (painéis de mogno) ---
  // Parede traseira (atrás da cadeira do adversário)
  const backWall = MeshBuilder.CreateBox("libBackWall", { width: 28, height: 12, depth: 0.4 }, scene);
  backWall.position.set(0, 5.8, -12.5);
  backWall.material = mognoDark;

  // Painéis verticais da parede traseira
  for (let i = -2; i <= 2; i++) {
    const panel = MeshBuilder.CreateBox(`bwPanel_${i}`, { width: 0.12, height: 9.5, depth: 0.55 }, scene);
    panel.position.set(i * 4.8, 4.5, -12.28);
    panel.material = mognoMid;
  }
  // Friso horizontal
  const frisoBack = MeshBuilder.CreateBox("frisoBack", { width: 28, height: 0.18, depth: 0.55 }, scene);
  frisoBack.position.set(0, 2.2, -12.28);
  frisoBack.material = mognoMid;
  const frisoBackTop = MeshBuilder.CreateBox("frisoBackTop", { width: 28, height: 0.18, depth: 0.55 }, scene);
  frisoBackTop.position.set(0, 8.8, -12.28);
  frisoBackTop.material = mognoMid;

  // Paredes laterais
  const sideL = MeshBuilder.CreateBox("libSideL", { width: 0.4, height: 12, depth: 28 }, scene);
  sideL.position.set(-12.5, 5.8, 1.5);
  sideL.material = mognoDark;
  const sideR = MeshBuilder.CreateBox("libSideR", { width: 0.4, height: 12, depth: 28 }, scene);
  sideR.position.set(12.5, 5.8, 1.5);
  sideR.material = mognoDark;

  // Teto de caixotão
  const ceil = MeshBuilder.CreateBox("libCeil", { width: 28, height: 0.4, depth: 28 }, scene);
  ceil.position.set(0, 11.8, 1.5);
  const ceilMat = new StandardMaterial("libCeilMat", scene);
  ceilMat.diffuseColor  = new Color3(0.10, 0.07, 0.04);
  ceilMat.specularColor = Color3.Black();
  ceil.material = ceilMat;
  // Vigas do teto
  for (let i = -2; i <= 2; i++) {
    const beam = MeshBuilder.CreateBox(`beam_${i}`, { width: 0.22, height: 0.35, depth: 28 }, scene);
    beam.position.set(i * 4.2, 11.45, 1.5);
    beam.material = mognoDark;
  }

  // --- LAREIRA (parede traseira, centro) ---
  // Abertura da lareira
  const fireplaceBase = MeshBuilder.CreateBox("fpBase", { width: 4.8, height: 0.25, depth: 1.2 }, scene);
  fireplaceBase.position.set(4.5, -0.1, -12.0);
  fireplaceBase.material = stoneMat;

  const fpLeft = MeshBuilder.CreateBox("fpLeft", { width: 0.55, height: 4.2, depth: 1.2 }, scene);
  fpLeft.position.set(2.18, 1.85, -12.0);
  fpLeft.material = stoneMat;

  const fpRight = MeshBuilder.CreateBox("fpRight", { width: 0.55, height: 4.2, depth: 1.2 }, scene);
  fpRight.position.set(6.82, 1.85, -12.0);
  fpRight.material = stoneMat;

  const fpTop = MeshBuilder.CreateBox("fpTop", { width: 5.9, height: 0.5, depth: 1.2 }, scene);
  fpTop.position.set(4.5, 3.97, -12.0);
  fpTop.material = stoneMat;

  // Moldura da lareira (mogno)
  const fpMoldLeft = MeshBuilder.CreateBox("fpMoldL", { width: 0.22, height: 4.8, depth: 0.22 }, scene);
  fpMoldLeft.position.set(1.88, 2.0, -11.72);
  fpMoldLeft.material = mognoMid;
  const fpMoldRight = MeshBuilder.CreateBox("fpMoldR", { width: 0.22, height: 4.8, depth: 0.22 }, scene);
  fpMoldRight.position.set(7.12, 2.0, -11.72);
  fpMoldRight.material = mognoMid;
  const fpMoldTop = MeshBuilder.CreateBox("fpMoldTop", { width: 5.46, height: 0.22, depth: 0.22 }, scene);
  fpMoldTop.position.set(4.5, 4.2, -11.72);
  fpMoldTop.material = mognoMid;

  // Interior escuro da lareira
  const fpInterior = MeshBuilder.CreateBox("fpInterior", { width: 4.2, height: 3.8, depth: 0.8 }, scene);
  fpInterior.position.set(4.5, 1.75, -12.35);
  const fpIntMat = new StandardMaterial("fpIntMat", scene);
  fpIntMat.diffuseColor  = new Color3(0.04, 0.02, 0.01);
  fpIntMat.emissiveColor = new Color3(0.02, 0.01, 0.005);
  fpInterior.material = fpIntMat;

  // Brasa emissiva (fogo simulado)
  const ember = MeshBuilder.CreateBox("fpEmber", { width: 3.2, height: 0.18, depth: 0.55 }, scene);
  ember.position.set(4.5, 0.05, -12.2);
  const emberMat = new StandardMaterial("emberMat", scene);
  emberMat.diffuseColor  = new Color3(0.9, 0.35, 0.05);
  emberMat.emissiveColor = new Color3(0.85, 0.28, 0.04);
  emberMat.specularColor = Color3.Black();
  ember.material = emberMat;

  // Chamas (cones emissivos)
  for (let fi = 0; fi < 5; fi++) {
    const fx = 3.0 + fi * 0.75;
    const fh = 0.6 + Math.random() * 0.5;
    const flame = MeshBuilder.CreateCylinder(`flame_${fi}`, {
      diameterTop: 0.01, diameterBottom: 0.28 + Math.random() * 0.12,
      height: fh, tessellation: 8
    }, scene);
    flame.position.set(fx, 0.05 + fh * 0.5, -12.2);
    const flameMat = new StandardMaterial(`flameMat_${fi}`, scene);
    const r = 0.9 + Math.random() * 0.1;
    const g = 0.25 + Math.random() * 0.25;
    flameMat.diffuseColor  = new Color3(r, g, 0.02);
    flameMat.emissiveColor = new Color3(r * 0.8, g * 0.6, 0.01);
    flameMat.alpha = 0.82;
    flameMat.specularColor = Color3.Black();
    flame.material = flameMat;
    // Animação de tremulação
    let t = Math.random() * Math.PI * 2;
    const baseScaleX = 0.9 + Math.random() * 0.2;
    scene.registerBeforeRender(() => {
      t += 0.06 + Math.random() * 0.02;
      flame.scaling.x = baseScaleX * (0.85 + 0.15 * Math.sin(t));
      flame.scaling.z = baseScaleX * (0.85 + 0.15 * Math.cos(t * 1.3));
      flame.scaling.y = 0.9 + 0.1 * Math.sin(t * 0.7);
    });
  }

  // Prateleira da lareira
  const fpShelf = MeshBuilder.CreateBox("fpShelf", { width: 6.2, height: 0.18, depth: 0.65 }, scene);
  fpShelf.position.set(4.5, 4.35, -11.95);
  fpShelf.material = mognoMid;

  // Relógio de parede acima da lareira
  const wallClockBody = MeshBuilder.CreateCylinder("wallClock", { diameter: 0.9, height: 0.12, tessellation: 36 }, scene);
  wallClockBody.position.set(4.5, 5.8, -12.15);
  wallClockBody.rotation.x = Math.PI / 2;
  const wcMat = new StandardMaterial("wcMat", scene);
  wcMat.diffuseColor  = new Color3(0.72, 0.65, 0.48);
  wcMat.specularColor = new Color3(0.55, 0.48, 0.32);
  wcMat.specularPower = 80;
  wallClockBody.material = wcMat;
  const wallClockFace = MeshBuilder.CreateCylinder("wallClockFace", { diameter: 0.72, height: 0.04, tessellation: 36 }, scene);
  wallClockFace.position.set(4.5, 5.8, -12.08);
  wallClockFace.rotation.x = Math.PI / 2;
  const wcFaceMat = new StandardMaterial("wcFaceMat", scene);
  wcFaceMat.diffuseColor  = new Color3(0.88, 0.84, 0.72);
  wcFaceMat.specularColor = new Color3(0.3, 0.28, 0.22);
  wallClockFace.material = wcFaceMat;

  // --- ESTANTES DE LIVROS ---
  function buildBookshelf(name, cx, cz, rotY, shelfCount) {
    const shelfMat = new StandardMaterial(`${name}ShelfMat`, scene);
    shelfMat.diffuseColor  = new Color3(0.18, 0.10, 0.05);
    shelfMat.specularColor = new Color3(0.15, 0.10, 0.06);
    shelfMat.specularPower = 40;

    const root = new TransformNode(name, scene);
    root.position.set(cx, 0, cz);
    root.rotation.y = rotY;

    // Estrutura da estante
    const back = MeshBuilder.CreateBox(`${name}_back`, { width: 5.8, height: 7.2, depth: 0.12 }, scene);
    back.parent = root; back.position.set(0, 3.4, 0); back.material = shelfMat;
    const sideA = MeshBuilder.CreateBox(`${name}_sA`, { width: 0.12, height: 7.2, depth: 0.55 }, scene);
    sideA.parent = root; sideA.position.set(-2.9, 3.4, 0.22); sideA.material = shelfMat;
    const sideB = MeshBuilder.CreateBox(`${name}_sB`, { width: 0.12, height: 7.2, depth: 0.55 }, scene);
    sideB.parent = root; sideB.position.set(2.9, 3.4, 0.22); sideB.material = shelfMat;

    // Prateleiras e livros
    const bookColors = [
      new Color3(0.45, 0.12, 0.08), new Color3(0.08, 0.18, 0.38),
      new Color3(0.28, 0.22, 0.08), new Color3(0.12, 0.28, 0.14),
      new Color3(0.35, 0.28, 0.18), new Color3(0.18, 0.08, 0.28),
      new Color3(0.42, 0.32, 0.12), new Color3(0.08, 0.22, 0.32)
    ];
    for (let s = 0; s < shelfCount; s++) {
      const sy = 0.55 + s * 1.15;
      const shelf = MeshBuilder.CreateBox(`${name}_shelf_${s}`, { width: 5.8, height: 0.06, depth: 0.5 }, scene);
      shelf.parent = root; shelf.position.set(0, sy, 0.18); shelf.material = shelfMat;
      // Livros na prateleira
      let bx = -2.65;
      while (bx < 2.65) {
        const bw = 0.10 + Math.random() * 0.14;
        const bh = 0.62 + Math.random() * 0.32;
        const book = MeshBuilder.CreateBox(`${name}_bk_${s}_${bx.toFixed(2)}`, { width: bw, height: bh, depth: 0.38 }, scene);
        book.parent = root;
        book.position.set(bx + bw / 2, sy + 0.03 + bh / 2, 0.18);
        const bMat = new StandardMaterial(`${name}_bkMat_${s}_${bx.toFixed(2)}`, scene);
        bMat.diffuseColor  = bookColors[Math.floor(Math.random() * bookColors.length)].clone();
        bMat.specularColor = new Color3(0.08, 0.06, 0.04);
        bMat.specularPower = 18;
        book.material = bMat;
        bx += bw + 0.008;
      }
    }
  }

  // Estantes na parede traseira (flanqueando a lareira)
  buildBookshelf("bsLeft",  -5.5, -12.0, 0, 5);
  buildBookshelf("bsRight", 14.5, -12.0, 0, 5);
  // Estantes nas paredes laterais
  buildBookshelf("bsSideL", -12.0, -4.0, Math.PI / 2, 4);
  buildBookshelf("bsSideR",  12.0, -4.0, -Math.PI / 2, 4);

  // --- JANELA COM VITRAL (parede esquerda) ---
  const windowFrame = MeshBuilder.CreateBox("winFrame", { width: 0.18, height: 4.2, depth: 2.8 }, scene);
  windowFrame.position.set(-12.32, 5.2, 4.5);
  windowFrame.material = mognoMid;
  // Vidro do vitral (emissivo colorido)
  const glassColors = [
    { c: new Color3(0.12, 0.28, 0.65), e: new Color3(0.04, 0.10, 0.28) },
    { c: new Color3(0.65, 0.18, 0.08), e: new Color3(0.28, 0.06, 0.02) },
    { c: new Color3(0.12, 0.52, 0.18), e: new Color3(0.04, 0.22, 0.06) },
    { c: new Color3(0.72, 0.62, 0.08), e: new Color3(0.32, 0.26, 0.02) }
  ];
  for (let gi = 0; gi < 4; gi++) {
    const gx = -0.65 + gi * 0.44;
    const glass = MeshBuilder.CreateBox(`winGlass_${gi}`, { width: 0.06, height: 3.6, depth: 0.62 }, scene);
    glass.position.set(-12.28, 5.2, 4.5 + gx);
    const gMat = new StandardMaterial(`winGlassMat_${gi}`, scene);
    gMat.diffuseColor  = glassColors[gi].c;
    gMat.emissiveColor = glassColors[gi].e;
    gMat.alpha = 0.72;
    gMat.specularColor = new Color3(0.5, 0.5, 0.5);
    gMat.specularPower = 120;
    glass.material = gMat;
  }
  // Caixilhos do vitral
  const winCross = MeshBuilder.CreateBox("winCross", { width: 0.06, height: 3.8, depth: 0.06 }, scene);
  winCross.position.set(-12.28, 5.2, 4.5);
  winCross.material = mognoDark;
  const winCrossH = MeshBuilder.CreateBox("winCrossH", { width: 0.06, height: 0.06, depth: 2.85 }, scene);
  winCrossH.position.set(-12.28, 5.2, 4.5);
  winCrossH.material = mognoDark;

  // --- LUMINÁRIA DE PAREDE (arandela) ---
  for (const [lx, lz, ry] of [[-11.8, -8.0, Math.PI/2], [11.8, -8.0, -Math.PI/2]]) {
    const sconce = MeshBuilder.CreateBox(`sconce_${lx}`, { width: 0.12, height: 0.55, depth: 0.38 }, scene);
    sconce.position.set(lx, 5.5, lz);
    sconce.rotation.y = ry;
    sconce.material = mognoMid;
    const bulb = MeshBuilder.CreateSphere(`sconceBulb_${lx}`, { diameter: 0.22, segments: 12 }, scene);
    bulb.position.set(lx, 5.35, lz);
    const bulbMat = new StandardMaterial(`sconceBulbMat_${lx}`, scene);
    bulbMat.diffuseColor  = new Color3(1.0, 0.88, 0.58);
    bulbMat.emissiveColor = new Color3(0.85, 0.62, 0.28);
    bulbMat.specularColor = Color3.Black();
    bulb.material = bulbMat;
  }

  // --- PERGAMINHO (à esquerda da mesa) ---
  const scrollMat = new StandardMaterial("scrollMat", scene);
  scrollMat.diffuseColor  = new Color3(0.82, 0.72, 0.52);
  scrollMat.specularColor = new Color3(0.12, 0.10, 0.07);
  scrollMat.specularPower = 18;
  const scroll = MeshBuilder.CreateCylinder("scroll", { diameter: 0.28, height: 1.8, tessellation: 16 }, scene);
  scroll.position.set(-6.5, 0.14, 1.2);
  scroll.rotation.x = Math.PI / 2;
  scroll.rotation.z = 0.18;
  scroll.material = scrollMat;
  // Papel do pergaminho aberto
  const scrollPaper = MeshBuilder.CreateBox("scrollPaper", { width: 1.9, height: 0.02, depth: 1.4 }, scene);
  scrollPaper.position.set(-6.2, 0.02, 1.8);
  scrollPaper.rotation.y = 0.15;
  const paperMat = new StandardMaterial("paperMat", scene);
  paperMat.diffuseColor  = new Color3(0.88, 0.80, 0.60);
  paperMat.specularColor = new Color3(0.08, 0.07, 0.05);
  paperMat.specularPower = 12;
  scrollPaper.material = paperMat;

  // --- CANETAS/PENAS (à esquerda) ---
  const penMat = new StandardMaterial("penMat", scene);
  penMat.diffuseColor  = new Color3(0.12, 0.10, 0.08);
  penMat.specularColor = new Color3(0.45, 0.38, 0.28);
  penMat.specularPower = 90;
  for (let pi = 0; pi < 2; pi++) {
    const pen = MeshBuilder.CreateCylinder(`pen_${pi}`, { diameterTop: 0.018, diameterBottom: 0.032, height: 1.35, tessellation: 8 }, scene);
    pen.position.set(-7.2 + pi * 0.3, 0.02, 2.2 + pi * 0.4);
    pen.rotation.z = 0.25 + pi * 0.15;
    pen.rotation.y = 0.8 + pi * 0.3;
    pen.material = penMat;
  }
}

/** Nome antigo do cenário — mantido para compatibilidade e caches agressivos do browser. */
function buildSalonBackdrop(scene) {
  buildChessClubEnvironment(scene);
}

/** Moldura em latão: bordas alinhadas ao retângulo real das casas (0,99×0,99), não centrado por simetria errada. */
function addBoardBrassFrame(scene) {
  const brass = new StandardMaterial("brassFrame", scene);
  // Latão polido: dourado-quente com reflexos intensos
  brass.diffuseColor = new Color3(0.68, 0.52, 0.20);
  brass.specularColor = new Color3(0.96, 0.84, 0.46);
  brass.emissiveColor = new Color3(0.04, 0.028, 0.008);
  brass.specularPower = 180;
  const t = 0.095;
  const h = 0.038;
  const y = 0.061;
  const xL = -3.495;
  const xR = 4.495;
  const z1 = -4.495;
  const z8 = 3.495;
  const cx = (xL + xR) / 2;
  const cz = (z1 + z8) / 2;
  const spanX = xR - xL + 2 * t;
  const spanZ = z8 - z1 + 2 * t;

  const south = MeshBuilder.CreateBox("brassFrame_S", { width: spanX, height: h, depth: t }, scene);
  south.position.set(cx, y, z1 - t / 2);
  south.material = brass;

  const north = MeshBuilder.CreateBox("brassFrame_N", { width: spanX, height: h, depth: t }, scene);
  north.position.set(cx, y, z8 + t / 2);
  north.material = brass;

  const innerZ = z8 - z1;
  const west = MeshBuilder.CreateBox("brassFrame_W", { width: t, height: h, depth: innerZ + 2 * t }, scene);
  west.position.set(xL - t / 2, y, cz);
  west.material = brass;

  const east = MeshBuilder.CreateBox("brassFrame_E", { width: t, height: h, depth: innerZ + 2 * t }, scene);
  east.position.set(xR + t / 2, y, cz);
  east.material = brass;
}

/**
 * Quadrado SATOR gravado no mármore: decais projetados na mesh da base (não placas à parte).
 * Sul: ROTAS · Oeste: SATOR · Norte: TENET + OPERA · Leste: AREPO
 */
function addSatorMarbleInscriptions(scene, baseMesh) {
  const half = 4.31;

  function makeEngravedTexture(id, lines, seed) {
    const tw = 1024;
    const th = lines.length > 1 ? 268 : 176;
    const tex = new DynamicTexture(id, { width: tw, height: th }, scene, false);
    const ctx = tex.getContext();
    paintDarkMarbleBandOnCtx(ctx, tw, th, seed);
    drawEngravedSatorTextOnCtx(ctx, tw, th, lines);
    tex.update(true);
    return tex;
  }

  function applyDecal(name, lines, seed, localPos, localNormal, size) {
    const tex = makeEngravedTexture(`${name}_tex`, lines, seed);
    const mat = new StandardMaterial(`${name}_satorDecalMat`, scene);
    mat.diffuseTexture = tex;
    mat.diffuseColor = new Color3(1, 1, 1);
    mat.specularColor = new Color3(0.24, 0.24, 0.3);
    mat.specularPower = 92;
    mat.backFaceCulling = false;
    const decal = MeshBuilder.CreateDecal(
      name,
      baseMesh,
      {
        position: localPos,
        normal: localNormal,
        size,
        angle: 0,
        localMode: true,
        cullBackFaces: true
      },
      scene
    );
    decal.material = mat;
    decal.isPickable = false;
  }

  applyDecal("satorDecalS", ["ROTAS"], 91011, new Vector3(0, 0, -half), new Vector3(0, 0, -1), new Vector3(8.95, 0.28, 0.45));
  applyDecal("satorDecalW", ["SATOR"], 91012, new Vector3(-half, 0, 0), new Vector3(-1, 0, 0), new Vector3(8.95, 0.28, 0.45));
  applyDecal("satorDecalN", ["TENET", "OPERA"], 91013, new Vector3(0, 0, half), new Vector3(0, 0, 1), new Vector3(8.95, 0.44, 0.45));
  applyDecal("satorDecalE", ["AREPO"], 91014, new Vector3(half, 0, 0), new Vector3(1, 0, 0), new Vector3(8.95, 0.28, 0.45));
}

/** Relógio steampunk com display digital âmbar (estilo da imagem de referência). */
function buildClassicChessClock(scene) {
  const root = new TransformNode("chessClockRoot", scene);
  root.position.set(0, 0, 0);
  chessClockRootRef = root;

  // Madeira escura de mogno
  const wood = new StandardMaterial("clkWood", scene);
  wood.diffuseColor  = new Color3(0.22, 0.12, 0.055);
  wood.specularColor = new Color3(0.28, 0.20, 0.11);
  wood.specularPower = 65;

  // Latão envelhecido
  const brass = new StandardMaterial("clkBrass", scene);
  brass.diffuseColor  = new Color3(0.55, 0.42, 0.14);
  brass.specularColor = new Color3(0.88, 0.72, 0.32);
  brass.specularPower = 130;

  // Corpo principal (caixa trapezoidal inclinada)
  const body = MeshBuilder.CreateBox("clkBody", { width: 2.4, height: 1.05, depth: 0.65 }, scene);
  body.parent = root;
  body.position.y = 0.52;
  body.material = wood;

  // Canto/borda de latão
  const edgeTop = MeshBuilder.CreateBox("clkEdgeTop", { width: 2.42, height: 0.06, depth: 0.67 }, scene);
  edgeTop.parent = root; edgeTop.position.y = 1.06; edgeTop.material = brass;
  const edgeBot = MeshBuilder.CreateBox("clkEdgeBot", { width: 2.42, height: 0.06, depth: 0.67 }, scene);
  edgeBot.parent = root; edgeBot.position.y = 0.0; edgeBot.material = brass;
  const edgeL = MeshBuilder.CreateBox("clkEdgeL", { width: 0.06, height: 1.05, depth: 0.67 }, scene);
  edgeL.parent = root; edgeL.position.set(-1.2, 0.52, 0); edgeL.material = brass;
  const edgeR = MeshBuilder.CreateBox("clkEdgeR", { width: 0.06, height: 1.05, depth: 0.67 }, scene);
  edgeR.parent = root; edgeR.position.set(1.2, 0.52, 0); edgeR.material = brass;

  // Separador central
  const divider = MeshBuilder.CreateBox("clkDiv", { width: 0.06, height: 0.85, depth: 0.67 }, scene);
  divider.parent = root; divider.position.set(0, 0.52, 0); divider.material = brass;

  // ── Displays digitais com DynamicTexture (tempo real) ────────────────────────────────────────────
  // Painel esquerdo: SATOR ENGINE (brancas)
  const panelL = MeshBuilder.CreatePlane("clkPanelL", { width: 0.92, height: 0.60 }, scene);
  panelL.parent = root;
  panelL.position.set(-0.56, 0.60, 0.35);
  const texL = new DynamicTexture("clkTexL", { width: 256, height: 128 }, scene, false);
  texL.hasAlpha = false;
  const matL = new StandardMaterial("clkMatL", scene);
  matL.diffuseTexture  = texL;
  matL.emissiveTexture = texL;
  matL.specularColor   = Color3.Black();
  panelL.material = matL;
  clockWhiteTex = texL;

  // Painel direito: HUMAN PLAYER (negras)
  const panelR = MeshBuilder.CreatePlane("clkPanelR", { width: 0.92, height: 0.60 }, scene);
  panelR.parent = root;
  panelR.position.set(0.56, 0.60, 0.35);
  const texR = new DynamicTexture("clkTexR", { width: 256, height: 128 }, scene, false);
  texR.hasAlpha = false;
  const matR = new StandardMaterial("clkMatR", scene);
  matR.diffuseTexture  = texR;
  matR.emissiveTexture = texR;
  matR.specularColor   = Color3.Black();
  panelR.material = matR;
  clockBlackTex = texR;

  // Render inicial dos displays
  updateClockDisplays();

  // Botões de pressionar no topo
  for (const [bx] of [[-0.56], [0.56]]) {
    const btn = MeshBuilder.CreateCylinder(`clkBtn_${bx}`, { diameter: 0.18, height: 0.12, tessellation: 12 }, scene);
    btn.parent = root; btn.position.set(bx, 1.12, 0); btn.material = brass;
  }

  // Pino de latão decorativo
  for (const [bx, bz] of [[-1.1, 0.28], [1.1, 0.28], [-1.1, -0.28], [1.1, -0.28]]) {
    const rivet = MeshBuilder.CreateSphere(`clkRivet_${bx}_${bz}`, { diameter: 0.055, segments: 8 }, scene);
    rivet.parent = root; rivet.position.set(bx, 0.52, bz); rivet.material = brass;
  }
}

function createScene(canvas) {
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: false,
    adaptToDeviceRatio: true,
    alpha: true
  });
  const scene = new Scene(engine);
  // Transparente: o fundo são as duas camadas CSS (parallax) por trás do canvas
  scene.clearColor = new Color4(0, 0, 0, 0);
  buildChessClubEnvironment(scene);

  // Câmera first-person: perspectiva baixa inclinada para o tabuleiro
  const camera = new ArcRotateCamera("cam", -Math.PI / 2, 0.78, 12.5, new Vector3(0, 1.2, -1.5), scene);
  camera.allowUpsideDown = false;
  camera.minZ = 0.08;
  camera.maxZ = 600;
  camera.fov = 1.05; // FOV mais amplo para perspectiva first-person
  camera.inertia = 0.72;
  camera.attachControl(canvas, false);
  bindArcRotateRightMouseOnly(camera, scene, canvas);
  camera.wheelPrecision = 42;
  camera.panningSensibility = 0;
  const ptrIn = camera.inputs.attached?.pointers;
  if (ptrIn) {
    ptrIn.multiTouchPanning = false;
    ptrIn.multiTouchPanAndZoom = false;
  }
  cameraRef = camera;

  const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.26;
  hemi.diffuse = new Color3(0.88, 0.78, 0.62);
  hemi.groundColor = new Color3(0.12, 0.09, 0.06);

  const fireplaceLight = new PointLight("fireplaceLight", new Vector3(4.5, 1.2, -11.5), scene);
  fireplaceLight.intensity = 1.05;
  fireplaceLight.diffuse = new Color3(1.0, 0.52, 0.22);
  fireplaceLight.specular = new Color3(0.95, 0.45, 0.18);
  fireplaceLight.range = 24;
  let fireT = 0;
  scene.registerBeforeRender(() => {
    fireT += 0.04;
    fireplaceLight.intensity = 0.92 + 0.22 * Math.sin(fireT) + 0.12 * Math.sin(fireT * 2.3);
  });

  const boardLight = new PointLight("boardLight", new Vector3(0, 5.5, 0), scene);
  boardLight.intensity = 1.05;
  boardLight.diffuse = new Color3(1.0, 0.88, 0.62);
  boardLight.specular = new Color3(1.0, 0.85, 0.55);
  boardLight.range = 14;

  // Luz de preenchimento fria (janela vitral à esquerda)
  const windowLight = new PointLight("windowLight", new Vector3(-11.5, 5.2, 4.5), scene);
  windowLight.intensity = 0.38;
  windowLight.diffuse = new Color3(0.38, 0.52, 0.88);
  windowLight.specular = new Color3(0.28, 0.42, 0.72);
  windowLight.range = 18;

  buildPlayerChessTable(scene);

  // ── TABULEIRO: base de mármore Nero Gold com casas clássicas branco/preto ──────────────────────────────────────────────────
  // Base do tabuleiro: mármore Nero Gold (preto com veios dourados)
  const base = MeshBuilder.CreateBox("base", { width: 9.4, height: 0.28, depth: 9.4 }, scene);
  base.position.y = -0.14;
  const bmat = new StandardMaterial("bm", scene);
  bmat.diffuseColor  = new Color3(0.065, 0.055, 0.045); // preto mármore
  bmat.specularColor = new Color3(0.55, 0.42, 0.18);    // reflexo dourado
  bmat.specularPower = 180;                              // muito polido
  base.material = bmat;
  addSatorMarbleInscriptions(scene, base);

  // ── Casas do tabuleiro: mármore clássico branco/preto alternado ──────────────────────────────────────────────────
  // Casa clara: Calacatta branco-marfim com reflexo especular alto
  const matLight = new StandardMaterial("tileLight", scene);
  matLight.diffuseColor  = new Color3(0.92, 0.88, 0.80); // branco-marfim quente
  matLight.specularColor = new Color3(0.75, 0.72, 0.65);
  matLight.specularPower = 140;

  // Casa escura: Nero Marquina preto com reflexo especular sutil
  const matDark = new StandardMaterial("tileDark", scene);
  matDark.diffuseColor  = new Color3(0.055, 0.048, 0.042); // preto-antracite
  matDark.specularColor = new Color3(0.22, 0.18, 0.14);
  matDark.specularPower = 110;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const tile = MeshBuilder.CreateBox(`tile_${row}_${col}`, { width: SQ * 0.995, height: 0.065, depth: SQ * 0.995 }, scene);
      const cx = (col - 3.5) * SQ + SQ / 2;
      const cz = (3.5 - row) * SQ - SQ / 2;
      tile.position.set(cx, 0.032, cz);
      // Padrão clássico: casa clara quando (row+col) é par
      tile.material = ((row + col) % 2 === 0) ? matLight : matDark;
      tile.metadata = { square: squareFromBoardRC(row, col), isTile: true };
    }
  }

  // Linhas douradas emissivas da grade 8x8
  const gridLineMat = new StandardMaterial("gridLine", scene);
  gridLineMat.diffuseColor  = new Color3(0.65, 0.45, 0.06);
  gridLineMat.emissiveColor = new Color3(0.72, 0.48, 0.05); // âmbar suave
  gridLineMat.specularColor = Color3.Black();
  const lineH = 0.012;
  const lineW = 0.028;
  // Linhas horizontais (9 linhas ao longo do eixo Z)
  for (let i = 0; i <= 8; i++) {
    const lz = (i - 4) * SQ;
    const hLine = MeshBuilder.CreateBox(`hLine_${i}`, { width: 8.0, height: lineH, depth: lineW }, scene);
    hLine.position.set(0, 0.068, lz);
    hLine.material = gridLineMat;
    hLine.isPickable = false;
  }
  // Linhas verticais (9 linhas ao longo do eixo X)
  for (let i = 0; i <= 8; i++) {
    const lx = (i - 4) * SQ;
    const vLine = MeshBuilder.CreateBox(`vLine_${i}`, { width: lineW, height: lineH, depth: 8.0 }, scene);
    vLine.position.set(lx, 0.068, 0);
    vLine.material = gridLineMat;
    vLine.isPickable = false;
  }

  addBoardBrassFrame(scene);

  // --- MÃO DO JOGADOR (first-person, borda inferior) ---
  (function buildPlayerHand() {
    const handMat = new StandardMaterial("playerHandMat", scene);
    handMat.diffuseColor  = new Color3(0.12, 0.09, 0.07); // luva de couro escuro
    handMat.specularColor = new Color3(0.18, 0.14, 0.10);
    handMat.specularPower = 35;

    // Palma — posicionada na borda inferior da câmera first-person
    // Z=4.5 = borda da mesa, Y=-0.35 = abaixo do tabuleiro
    const palm = MeshBuilder.CreateBox("handPalm", { width: 1.4, height: 0.22, depth: 0.95 }, scene);
    palm.position.set(0.15, -0.35, 4.5);
    palm.rotation.x = -0.28;
    palm.material = handMat;

    // Dedos — ligeiramente curvados sobre a borda do tabuleiro
    for (let fi = 0; fi < 4; fi++) {
      const fx = -0.42 + fi * 0.28;
      const finger = MeshBuilder.CreateCylinder(`handFinger_${fi}`, {
        diameterTop: 0.065, diameterBottom: 0.085, height: 0.44, tessellation: 8
      }, scene);
      finger.position.set(fx, -0.22, 4.22);
      finger.rotation.x = -0.52;
      finger.material = handMat;
    }
    // Polegar
    const thumb = MeshBuilder.CreateCylinder("handThumb", {
      diameterTop: 0.075, diameterBottom: 0.095, height: 0.34, tessellation: 8
    }, scene);
    thumb.position.set(0.82, -0.32, 4.42);
    thumb.rotation.z = -0.65;
    thumb.rotation.x = -0.25;
    thumb.material = handMat;
  })();

  // --- RELÓGIO STEAMPUNK (display digital âmbar) ---
  try {
    buildClassicChessClock(scene);
  } catch (err) {
    console.warn("Relógio 3D omitido:", err);
  }
  applyBoardCamera();

  scene.registerBeforeRender(() => {
    if (!Number.isFinite(camera.alpha) || !Number.isFinite(camera.beta) || !Number.isFinite(camera.radius)) {
      applyBoardCamera();
    }
  });

  scene.onPointerObservable.add((pi) => {
    if (pi.type !== PointerEventTypes.POINTERDOWN) return;
    if (busy || game.isGameOver()) return;
    if (!isPlayerTurn() && getMode() === "engine") return;
    if (!pi.pickInfo?.hit) return;

    const meta = pieceMetaFromPickedMesh(pi.pickInfo.pickedMesh);
    const turn = game.turn();
    const destSq = pointerDestinationSquare(pi, scene, camera);

    const canSelectColor = (c) => (getMode() === "human" ? turn === c : c === getPlayerColor());

    if (tapSelection.from) {
      const from = tapSelection.from;

      if (meta?.square && canSelectColor(meta.color) && meta.square === from) {
        clearTapSelection();
        return;
      }

      if (meta?.square && canSelectColor(meta.color) && meta.square !== from) {
        if (TOUCH_MOVE_STRICT) {
          setStatusBrief(
            "Toca-mover: conclua o lance com a peça escolhida ou clique nela de novo para cancelar a seleção."
          );
          return;
        }
        tapSelection.from = meta.square;
        showLegalMovesFor(meta.square);
        return;
      }

      if (destSq) {
        void (async () => {
          if (destSq === from) {
            clearTapSelection();
            return;
          }
          const ok = await tryMove(from, destSq);
          if (!ok) {
            flashInvalidSquare(destSq);
            showLegalMovesFor(from);
          }
        })();
      }
      return;
    }

    if (meta?.square && canSelectColor(meta.color)) {
      tapSelection.from = meta.square;
      showLegalMovesFor(meta.square);
    }
  });

  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.011;
  scene.fogColor = new Color3(0.22, 0.16, 0.11);
  scene.fogStart = 12;
  scene.fogEnd = 48;

  engine.runRenderLoop(() => scene.render());

  let engineSizedOnce = false;
  function syncCanvasToEngine() {
    try {
      if (!canvas.clientWidth || !canvas.clientHeight) return false;
      engine.resize();
      if (!engineSizedOnce) {
        engineSizedOnce = true;
        applyBoardCamera();
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  let canvasPollFrames = 0;
  function pollCanvasUntilSized() {
    if (syncCanvasToEngine() || canvasPollFrames++ > 300) return;
    requestAnimationFrame(pollCanvasUntilSized);
  }

  window.addEventListener("resize", () => {
    syncCanvasToEngine();
  });
  syncCanvasToEngine();
  requestAnimationFrame(() => {
    syncCanvasToEngine();
    requestAnimationFrame(() => {
      syncCanvasToEngine();
      pollCanvasUntilSized();
    });
  });
  if (typeof ResizeObserver !== "undefined" && canvas) {
    new ResizeObserver(() => syncCanvasToEngine()).observe(canvas);
  }
  window.addEventListener("load", () => {
    syncCanvasToEngine();
  });
  scene.executeWhenReady(() => {
    syncCanvasToEngine();
  });

  sceneRef = scene;
  syncPiecesFromGame();

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") clearTapSelection();
  });

  return { engine, scene };
}

function startNewGame() {
  game.reset();
  clearTapSelection();
  syncModeUI();
  applyBoardCamera();
  syncPiecesFromGame();
  updateStatus();
  resetClock();   // zera e para o relógio
  startClock();   // inicia a contagem
  if (getMode() === "engine" && getPlayerColor() === "b") {
    setTimeout(() => callBestMove(), 300);
  }
  refreshNNStatus();
}

(function setupPartidaPanelToggle() {
  const panel = document.getElementById("partidaPanel");
  const btn = document.getElementById("btnPanelToggle");
  if (!panel || !btn) return;
  function applyCollapsed(collapsed) {
    panel.classList.toggle("panel--collapsed", collapsed);
    btn.setAttribute("aria-expanded", String(!collapsed));
    btn.textContent = collapsed ? "Expandir" : "Recolher";
    btn.title = collapsed ? "Expandir painel" : "Recolher painel";
  }
  btn.addEventListener("click", () => {
    applyCollapsed(!panel.classList.contains("panel--collapsed"));
  });
})();

document.getElementById("btnNew").addEventListener("click", () => startNewGame());
const btnGoNew = document.getElementById("btnGoNew");
if (btnGoNew) btnGoNew.addEventListener("click", () => startNewGame());
document.getElementById("btnUndo").addEventListener("click", () => {
  if (busy) return;
  clearTapSelection();
  if (getMode() === "engine") {
    game.undo();
    game.undo();
  } else {
    game.undo();
  }
  syncPiecesFromGame();
  updateStatus();
});
document.getElementById("mode").addEventListener("change", () => {
  syncModeUI();
  startNewGame();
});
document.getElementById("playerColor").addEventListener("change", () => {
  if (getMode() === "engine") startNewGame();
  else applyBoardCamera();
});
const cameraViewEl = document.getElementById("cameraView");
if (cameraViewEl) {
  cameraViewEl.addEventListener("change", () => applyBoardCamera());
}

const canvas = document.getElementById("renderCanvas");
createScene(canvas);
syncModeUI();
updateStatus();
refreshNNStatus();
setInterval(refreshNNStatus, 12000);

if (getMode() === "engine" && getPlayerColor() === "b") {
  setTimeout(() => callBestMove(), 400);
}

// ─────────────────────────────────────────────────────────────────────────────
// PARALLAX 3D: desloca o background da biblioteca conforme o ângulo da câmera
// Cria ilusão de perspectiva real quando o usuário rotaciona o tabuleiro
// ─────────────────────────────────────────────────────────────────────────────
(function initParallaxBackground() {
  const bgFar = document.getElementById('library-bg-far');
  const bgNear = document.getElementById('library-bg-near');
  if (!bgFar || !bgNear) return;

  /** Metade do sweep horizontal em % de background-position (quase toda a panorâmica). */
  const SWEEP_H_FAR = 44;
  const SWEEP_H_NEAR = 49;
  const SWEEP_V_FAR = 14;
  const SWEEP_V_NEAR = 20;
  const LERP_SPEED = 0.055;

  let targetXF = 50, targetYF = 50, targetXN = 50, targetYN = 50;
  let currentXF = 50, currentYF = 50, currentXN = 50, currentYN = 50;
  let rafId = null;
  let fallbackAlpha0 = null;

  function lerp(a, b, t) { return a + (b - a) * t; }

  /** -1..1 a partir dos limites reais da ArcRotateCamera (usa todo o arco permitido). */
  function parallaxNormFromCamera(cam) {
    let normH = 0;
    let normV = 0;
    const aLo = cam.lowerAlphaLimit;
    const aHi = cam.upperAlphaLimit;
    if (aLo != null && aHi != null && aHi > aLo + 1e-6) {
      const aMid = (aLo + aHi) / 2;
      const aHalf = (aHi - aLo) / 2;
      normH = Math.max(-1, Math.min(1, (cam.alpha - aMid) / aHalf));
    } else {
      if (fallbackAlpha0 == null) fallbackAlpha0 = cam.alpha;
      normH = Math.max(-1, Math.min(1, (cam.alpha - fallbackAlpha0) / Math.PI));
    }

    const bLo = cam.lowerBetaLimit;
    const bHi = cam.upperBetaLimit;
    if (bLo != null && bHi != null && bHi > bLo + 1e-4) {
      const bMid = (bLo + bHi) / 2;
      const bHalf = (bHi - bLo) / 2;
      normV = Math.max(-1, Math.min(1, (cam.beta - bMid) / bHalf));
    } else {
      const rLo = cam.lowerRadiusLimit;
      const rHi = cam.upperRadiusLimit;
      if (rLo != null && rHi != null && rHi > rLo + 1e-4) {
        const rMid = (rLo + rHi) / 2;
        const rHalf = (rHi - rLo) / 2;
        normV = Math.max(-1, Math.min(1, (cam.radius - rMid) / rHalf));
      }
    }
    return { normH, normV };
  }

  function updateParallax() {
    if (!cameraRef) { rafId = requestAnimationFrame(updateParallax); return; }

    const { normH, normV } = parallaxNormFromCamera(cameraRef);

    targetXF = Math.max(3, Math.min(97, 50 - normH * SWEEP_H_FAR));
    targetYF = Math.max(18, Math.min(82, 50 - normV * SWEEP_V_FAR));
    targetXN = Math.max(1, Math.min(99, 50 - normH * SWEEP_H_NEAR));
    targetYN = Math.max(14, Math.min(86, 50 - normV * SWEEP_V_NEAR));

    currentXF = lerp(currentXF, targetXF, LERP_SPEED);
    currentYF = lerp(currentYF, targetYF, LERP_SPEED);
    currentXN = lerp(currentXN, targetXN, LERP_SPEED);
    currentYN = lerp(currentYN, targetYN, LERP_SPEED);

    bgFar.style.backgroundPosition = `${currentXF.toFixed(2)}% ${currentYF.toFixed(2)}%`;
    bgNear.style.backgroundPosition = `${currentXN.toFixed(2)}% ${currentYN.toFixed(2)}%`;

    const skewFar = normH * -0.35;
    const skewNear = normH * -0.65;
    const zoomFar = 1.008 + Math.abs(normV) * 0.012 + Math.abs(normH) * 0.01;
    const zoomNear = 1.012 + Math.abs(normV) * 0.018 + Math.abs(normH) * 0.016;
    bgFar.style.transform = `scale(${zoomFar.toFixed(4)}) skewX(${skewFar.toFixed(2)}deg)`;
    bgNear.style.transform = `scale(${zoomNear.toFixed(4)}) skewX(${skewNear.toFixed(2)}deg)`;

    rafId = requestAnimationFrame(updateParallax);
  }

  // Inicia o loop de parallax após a cena estar pronta
  setTimeout(() => { rafId = requestAnimationFrame(updateParallax); }, 800);

  // Pausa quando a aba fica invisível para economizar recursos
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else {
      if (!rafId) rafId = requestAnimationFrame(updateParallax);
    }
  });
})();
