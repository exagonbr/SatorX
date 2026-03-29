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
  MeshBuilder,
  StandardMaterial,
  Color3,
  PointerEventTypes,
  Mesh,
  Matrix,
  Material,
  DynamicTexture,
  Texture,
  TransformNode
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
/** Seleção por clique (sem arrastar). Toca-mover: após escolher peça, não pode trocar por outra própria. */
let tapSelection = { from: null };
const TOUCH_MOVE_STRICT = true;
let statusBriefTimer = null;

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
 * Vista padrão tipo “bird’s-eye” inclinada: de cima e ligeiramente de lado (como no tabuleiro clássico 3D).
 * Beta baixo no ArcRotate = mais de cima; raio médio-alto para ver as 64 casas confortavelmente.
 */
function applyPlayerPovCamera() {
  if (!cameraRef) return;
  const cam = cameraRef;
  const whiteSide = getMode() === "human" || getPlayerColor() === "w";
  const limA = 0.55;
  if (whiteSide) {
    cam.setTarget(new Vector3(0, 0.22, 0.12));
    const alpha = -Math.PI / 2.06;
    cam.alpha = alpha;
    cam.beta = 0.66;
    cam.radius = 13.1;
    cam.lowerAlphaLimit = alpha - limA;
    cam.upperAlphaLimit = alpha + limA;
  } else {
    cam.setTarget(new Vector3(0, 0.22, -0.12));
    const alpha = Math.PI / 2.06;
    cam.alpha = alpha;
    cam.beta = 0.66;
    cam.radius = 13.1;
    cam.lowerAlphaLimit = alpha - limA;
    cam.upperAlphaLimit = alpha + limA;
  }
  cam.lowerBetaLimit = 0.38;
  cam.upperBetaLimit = 0.95;
  cam.lowerRadiusLimit = 9.2;
  cam.upperRadiusLimit = 22;
  cam.fov = 0.94;
  cam.allowUpsideDown = false;
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
  if (color === "w") {
    mat.diffuseColor = new Color3(1, 1, 1);
    mat.specularColor = new Color3(1, 1, 1);
    mat.emissiveColor = Color3.Black();
    mat.specularPower = 256;
  } else {
    mat.diffuseColor = Color3.Black();
    mat.specularColor = new Color3(1, 1, 1);
    mat.emissiveColor = Color3.Black();
    mat.specularPower = 220;
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
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, `rgb(${250 + (rnd() * 5) | 0},${246 + (rnd() * 5) | 0},${238 + (rnd() * 6) | 0})`);
    g.addColorStop(0.42, `rgb(${238 + (rnd() * 7) | 0},${232 + (rnd() * 7) | 0},${224 + (rnd() * 8) | 0})`);
    g.addColorStop(1, `rgb(${222 + (rnd() * 9) | 0},${214 + (rnd() * 9) | 0},${206 + (rnd() * 10) | 0})`);
    ctx.fillStyle = g;
  } else {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, `rgb(${44 + (rnd() * 12) | 0},${42 + (rnd() * 12) | 0},${48 + (rnd() * 12) | 0})`);
    g.addColorStop(1, `rgb(${18 + (rnd() * 8) | 0},${17 + (rnd() * 8) | 0},${22 + (rnd() * 8) | 0})`);
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
  const veinN = light ? 18 : 18;
  for (let k = 0; k < veinN; k++) {
    ctx.strokeStyle = light
      ? `rgba(88,84,96,${0.085 + rnd() * 0.095})`
      : `rgba(190,190,205,${0.05 + rnd() * 0.07})`;
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
  const wood = new StandardMaterial("plyrTblWood", scene);
  wood.diffuseColor = new Color3(0.19, 0.1, 0.048);
  wood.specularColor = new Color3(0.11, 0.08, 0.05);
  wood.specularPower = 44;
  const legMat = new StandardMaterial("plyrTblLeg", scene);
  legMat.diffuseColor = new Color3(0.065, 0.05, 0.045);
  legMat.specularPower = 22;
  const ap = 4.12;
  const legTop = -0.19;
  const legBot = -0.76;
  const legH = legTop - legBot;
  const cy = (legTop + legBot) / 2;
  for (const [sx, sz] of [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1]
  ]) {
    const leg = MeshBuilder.CreateCylinder(`ptLeg_${sx}_${sz}`, { diameter: 0.17, height: legH, tessellation: 16 }, scene);
    leg.position.set(sx * ap, cy, sz * ap);
    leg.material = legMat;
  }
  const apron = MeshBuilder.CreateBox("ptApron", { width: 9.95, height: 0.055, depth: 9.95 }, scene);
  apron.position.set(0, -0.208, 0);
  apron.material = wood;
}

/** Salão de clube: piso, paredes, teto, mesas ao fundo, luzes quentes. */
function buildChessClubEnvironment(scene) {
  scene.clearColor = new Color3(0.035, 0.042, 0.055).toColor4(1);

  const floor = MeshBuilder.CreateGround("clubFloor", { width: 62, height: 52 }, scene);
  floor.position.set(0, -0.02, 5);
  const flMat = new StandardMaterial("clubFloorMat", scene);
  flMat.diffuseColor = new Color3(0.13, 0.085, 0.055);
  flMat.specularColor = new Color3(0.05, 0.04, 0.032);
  flMat.specularPower = 26;
  floor.material = flMat;

  const wallPaint = new StandardMaterial("clubWallPaint", scene);
  wallPaint.diffuseColor = new Color3(0.11, 0.14, 0.12);
  wallPaint.specularColor = new Color3(0.04, 0.05, 0.045);
  wallPaint.specularPower = 28;

  const wainMat = new StandardMaterial("clubWain", scene);
  wainMat.diffuseColor = new Color3(0.08, 0.06, 0.048);
  wainMat.specularPower = 18;

  const backWall = MeshBuilder.CreateBox("clubBackWall", { width: 52, height: 10.5, depth: 0.5 }, scene);
  backWall.position.set(0, 5.05, -11.2);
  backWall.material = wallPaint;

  const wain = MeshBuilder.CreateBox("clubWainscot", { width: 50, height: 2.2, depth: 0.12 }, scene);
  wain.position.set(0, 1.15, -10.85);
  wain.material = wainMat;

  const rail = MeshBuilder.CreateBox("clubChairRail", { width: 52, height: 0.28, depth: 0.55 }, scene);
  rail.position.set(0, 9.95, -11.05);
  const railMat = new StandardMaterial("clubRailMat", scene);
  railMat.diffuseColor = new Color3(0.12, 0.09, 0.065);
  railMat.specularColor = new Color3(0.08, 0.07, 0.055);
  rail.material = railMat;

  const ceil = MeshBuilder.CreateBox("clubCeiling", { width: 58, height: 0.45, depth: 50 }, scene);
  ceil.position.set(0, 9.45, 4);
  const ceilMat = new StandardMaterial("clubCeilMat", scene);
  ceilMat.diffuseColor = new Color3(0.06, 0.065, 0.075);
  ceilMat.specularColor = Color3.Black();
  ceil.material = ceilMat;

  const sideL = MeshBuilder.CreateBox("clubSideL", { width: 0.48, height: 8.8, depth: 36 }, scene);
  sideL.position.set(-17.5, 4.6, 3);
  sideL.material = wallPaint;
  const sideR = MeshBuilder.CreateBox("clubSideR", { width: 0.48, height: 8.8, depth: 36 }, scene);
  sideR.position.set(17.5, 4.6, 3);
  sideR.material = wallPaint;

  const lampEmis = new StandardMaterial("clubLampEmis", scene);
  lampEmis.diffuseColor = new Color3(0.95, 0.78, 0.45);
  lampEmis.emissiveColor = new Color3(0.35, 0.26, 0.12);
  lampEmis.specularColor = Color3.Black();
  for (let i = 0; i < 5; i++) {
    const lx = -16 + i * 8;
    const shade = MeshBuilder.CreateBox(`lamp_${i}`, { width: 1.4, height: 0.22, depth: 0.65 }, scene);
    shade.position.set(lx, 8.35, -10.55);
    shade.material = lampEmis;
    const glow = MeshBuilder.CreateBox(`lampGlow_${i}`, { width: 1.1, height: 0.08, depth: 0.4 }, scene);
    glow.position.set(lx, 8.18, -10.48);
    glow.material = lampEmis;
  }

  const tblWood = new StandardMaterial("remoteTblWood", scene);
  tblWood.diffuseColor = new Color3(0.18, 0.1, 0.055);
  tblWood.specularColor = new Color3(0.09, 0.06, 0.04);
  tblWood.specularPower = 38;
  const tblDark = new StandardMaterial("remoteTblDark", scene);
  tblDark.diffuseColor = new Color3(0.06, 0.048, 0.042);
  tblDark.specularPower = 16;

  // Poucas silhuetas ao fundo (evita “mesas flutuantes” a competir com a tua mesa).
  addRemoteChessTable(scene, -9.5, 19.5, 2.8, 2.6, tblWood, tblDark);
  addRemoteChessTable(scene, 9.2, 20.2, 2.8, 2.6, tblWood, tblDark);
}

/** Nome antigo do cenário — mantido para compatibilidade e caches agressivos do browser. */
function buildSalonBackdrop(scene) {
  buildChessClubEnvironment(scene);
}

/** Moldura em latão: bordas alinhadas ao retângulo real das casas (0,99×0,99), não centrado por simetria errada. */
function addBoardBrassFrame(scene) {
  const brass = new StandardMaterial("brassFrame", scene);
  brass.diffuseColor = new Color3(0.62, 0.48, 0.18);
  brass.specularColor = new Color3(0.88, 0.74, 0.38);
  brass.specularPower = 100;
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

/** Relógio de xadrez clássico (dois mostradores); ponteiros seguem a hora local. Posição via syncChessClockPlacement. */
function buildClassicChessClock(scene) {
  const root = new TransformNode("chessClockRoot", scene);
  root.position.set(0, 0, 0);
  chessClockRootRef = root;

  const wood = new StandardMaterial("clkWood", scene);
  wood.diffuseColor = new Color3(0.26, 0.16, 0.1);
  wood.specularColor = new Color3(0.18, 0.14, 0.1);
  wood.specularPower = 44;

  const body = MeshBuilder.CreateBox("clkBody", { width: 1.9, height: 0.88, depth: 0.5 }, scene);
  body.parent = root;
  body.position.y = 0.44;
  body.material = wood;

  const gold = new StandardMaterial("clkBezel", scene);
  gold.diffuseColor = new Color3(0.58, 0.44, 0.16);
  gold.specularColor = new Color3(0.88, 0.75, 0.38);
  gold.specularPower = 118;

  const face = new StandardMaterial("clkFace", scene);
  face.diffuseColor = new Color3(0.93, 0.91, 0.84);
  face.specularColor = new Color3(0.22, 0.21, 0.2);
  face.specularPower = 56;

  const handMat = new StandardMaterial("clkHand", scene);
  handMat.diffuseColor = new Color3(0.07, 0.06, 0.07);
  handMat.specularColor = Color3.Black();

  const pivots = [];

  function addDial(localX, idx) {
    const bezel = MeshBuilder.CreateTorus(`clkBez_${idx}`, { diameter: 0.5, thickness: 0.028, tessellation: 44 }, scene);
    bezel.parent = root;
    bezel.rotation.x = Math.PI / 2;
    bezel.position.set(localX, 0.52, 0.26);
    bezel.material = gold;

    const dial = MeshBuilder.CreateCylinder(`clkDial_${idx}`, { diameter: 0.42, height: 0.035, tessellation: 48 }, scene);
    dial.parent = root;
    dial.rotation.x = Math.PI / 2;
    dial.position.set(localX, 0.52, 0.28);
    dial.material = face;

    const pivotH = new TransformNode(`clkPivH_${idx}`, scene);
    pivotH.parent = root;
    pivotH.position.set(localX, 0.52, 0.3);
    const hHour = MeshBuilder.CreateBox(`clkHH_${idx}`, { width: 0.022, height: 0.024, depth: 0.1 }, scene);
    hHour.parent = pivotH;
    hHour.position.z = 0.05;
    hHour.material = handMat;

    const pivotM = new TransformNode(`clkPivM_${idx}`, scene);
    pivotM.parent = root;
    pivotM.position.set(localX, 0.52, 0.3);
    const hMin = MeshBuilder.CreateBox(`clkHM_${idx}`, { width: 0.016, height: 0.02, depth: 0.14 }, scene);
    hMin.parent = pivotM;
    hMin.position.z = 0.07;
    hMin.material = handMat;

    pivots.push({ hour: pivotH, min: pivotM });
  }

  addDial(-0.52, 0);
  addDial(0.52, 1);

  scene.registerBeforeRender(() => {
    const d = new Date();
    const min = d.getMinutes() + d.getSeconds() / 60;
    const hr = (d.getHours() % 12) + min / 60;
    const angM = (min / 60) * Math.PI * 2;
    const angH = (hr / 12) * Math.PI * 2;
    for (const p of pivots) {
      p.min.rotation.y = -angM;
      p.hour.rotation.y = -angH;
    }
  });

  const lever = MeshBuilder.CreateBox("clkLever", { width: 0.08, height: 0.06, depth: 0.22 }, scene);
  lever.parent = root;
  lever.position.set(0, 0.96, -0.08);
  lever.material = gold;
}

function createScene(canvas) {
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: false,
    adaptToDeviceRatio: true
  });
  const scene = new Scene(engine);
  buildChessClubEnvironment(scene);

  const camera = new ArcRotateCamera("cam", -Math.PI / 2.06, 0.66, 13.1, new Vector3(0, 0.22, 0.12), scene);
  camera.allowUpsideDown = false;
  camera.minZ = 0.12;
  camera.maxZ = 500;
  camera.fov = 0.94;
  camera.inertia = 0.72;
  camera.attachControl(canvas, false);
  bindArcRotateRightMouseOnly(camera, scene, canvas);
  camera.wheelPrecision = 38;
  camera.panningSensibility = 0;
  const ptrIn = camera.inputs.attached?.pointers;
  if (ptrIn) {
    ptrIn.multiTouchPanning = false;
    ptrIn.multiTouchPanAndZoom = false;
  }
  cameraRef = camera;

  const hemi = new HemisphericLight("hemi", new Vector3(0.2, 1, 0.35), scene);
  hemi.intensity = 0.62;
  hemi.diffuse = new Color3(0.88, 0.86, 0.82);
  hemi.groundColor = new Color3(0.07, 0.075, 0.1);

  const dir = new DirectionalLight("dir", new Vector3(-0.55, -1.05, -0.25), scene);
  dir.position = new Vector3(12, 16, 6);
  dir.intensity = 0.72;
  dir.diffuse = new Color3(1, 0.96, 0.9);

  buildPlayerChessTable(scene);

  const marbleLight = createMarbleTexture(scene, "marbleLight", true, 9001);
  const marbleDark = createMarbleTexture(scene, "marbleDark", false, 7001);

  const base = MeshBuilder.CreateBox("base", { width: 8.6, height: 0.18, depth: 8.6 }, scene);
  base.position.y = -0.1;
  const bmat = new StandardMaterial("bm", scene);
  bmat.diffuseTexture = marbleDark;
  bmat.diffuseTexture.uScale = 1.8;
  bmat.diffuseTexture.vScale = 1.8;
  bmat.specularColor = new Color3(0.28, 0.28, 0.34);
  bmat.specularPower = 95;
  base.material = bmat;
  addSatorMarbleInscriptions(scene, base);

  const matLightSq = new StandardMaterial("tileMarbleLight", scene);
  matLightSq.diffuseTexture = marbleLight;
  matLightSq.diffuseTexture.uScale = 2.4;
  matLightSq.diffuseTexture.vScale = 2.4;
  matLightSq.specularColor = new Color3(0.4, 0.4, 0.44);
  matLightSq.specularPower = 95;

  const matDarkSq = new StandardMaterial("tileMarbleDark", scene);
  matDarkSq.diffuseTexture = marbleDark;
  matDarkSq.diffuseTexture.uScale = 2.4;
  matDarkSq.diffuseTexture.vScale = 2.4;
  matDarkSq.specularColor = new Color3(0.26, 0.26, 0.32);
  matDarkSq.specularPower = 95;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const light = (row + col) % 2 === 1;
      const tile = MeshBuilder.CreateBox(`tile_${row}_${col}`, { width: SQ * 0.99, height: 0.06, depth: SQ * 0.99 }, scene);
      const cx = (col - 3.5) * SQ + SQ / 2;
      const cz = (3.5 - row) * SQ - SQ / 2;
      tile.position.set(cx, 0.03, cz);
      tile.material = light ? matLightSq : matDarkSq;
      tile.metadata = { square: squareFromBoardRC(row, col), isTile: true };
    }
  }

  addBoardBrassFrame(scene);

  try {
    buildClassicChessClock(scene);
  } catch (err) {
    console.warn("Relógio 3D omitido:", err);
  }
  applyPlayerPovCamera();

  scene.registerBeforeRender(() => {
    if (!Number.isFinite(camera.alpha) || !Number.isFinite(camera.beta) || !Number.isFinite(camera.radius)) {
      applyPlayerPovCamera();
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

  engine.runRenderLoop(() => scene.render());
  const kickResize = () => {
    try {
      if (!canvas.clientWidth || !canvas.clientHeight) return;
      engine.resize();
    } catch (_) {}
  };
  window.addEventListener("resize", kickResize);
  kickResize();
  requestAnimationFrame(() => {
    kickResize();
    requestAnimationFrame(kickResize);
  });
  if (typeof ResizeObserver !== "undefined" && canvas) {
    new ResizeObserver(kickResize).observe(canvas);
  }

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
  applyPlayerPovCamera();
  syncPiecesFromGame();
  updateStatus();
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
  else applyPlayerPovCamera();
});

const canvas = document.getElementById("renderCanvas");
createScene(canvas);
syncModeUI();
updateStatus();
refreshNNStatus();
setInterval(refreshNNStatus, 12000);

if (getMode() === "engine" && getPlayerColor() === "b") {
  setTimeout(() => callBestMove(), 400);
}
