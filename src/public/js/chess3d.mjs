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
  ShadowGenerator,
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
let shadowGenRef = null;
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
    // Marfim levemente quente (contrasta com o mármore claro sem ser plástico branco)
    mat.diffuseColor = new Color3(0.97, 0.96, 0.94);
    mat.specularColor = new Color3(0.88, 0.86, 0.82);
    mat.emissiveColor = new Color3(0.038, 0.036, 0.034);
    mat.specularPower = 195;
  } else {
    // Ébano: ainda “pretas”, mas com volume visível (antes quase preto absoluto no mármore escuro)
    mat.diffuseColor = new Color3(0.16, 0.14, 0.18);
    mat.specularColor = new Color3(0.52, 0.5, 0.56);
    mat.emissiveColor = new Color3(0.042, 0.038, 0.048);
    mat.specularPower = 165;
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

function createMarbleTexture(scene, name, light, seed) {
  const tex = new DynamicTexture(name, { width: 512, height: 512 }, scene, false);
  tex.wrapU = Texture.WRAP_ADDRESSMODE;
  tex.wrapV = Texture.WRAP_ADDRESSMODE;
  paintMarbleTexture(tex, light, seed);
  return tex;
}

/** Base com disco largo + anel (efeito “torno” Staunton). */
function addPedestal(scene, parts, y0) {
  const base = MeshBuilder.CreateCylinder(`pedb_${Math.random()}`, { diameter: 0.55, height: 0.052, tessellation: 40 }, scene);
  base.position.y = y0 + 0.026;
  parts.push(base);
  const ring = MeshBuilder.CreateTorus(`pedr_${Math.random()}`, { diameter: 0.4, thickness: 0.032, tessellation: 36 }, scene);
  ring.position.y = y0 + 0.052 + 0.016;
  ring.rotation.x = Math.PI / 2;
  parts.push(ring);
  return y0 + 0.052 + 0.032;
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
    body.position.y = y + 0.13;
    parts.push(body);
    const collar = MeshBuilder.CreateTorus(`pc_${Math.random()}`, { diameter: 0.2, thickness: 0.038, tessellation: 28 }, scene);
    collar.position.y = y + 0.24;
    collar.rotation.x = Math.PI / 2;
    parts.push(collar);
    const head = addIcoOrSphere(scene, `ph_${Math.random()}`, 0.1, y + 0.31 + 0.1, 2);
    parts.push(head);
  } else if (type === "r") {
    const tower = MeshBuilder.CreateCylinder(`rt_${Math.random()}`, { diameter: 0.36, height: 0.4, tessellation: 8 }, scene);
    tower.position.y = y + 0.2;
    tower.rotation.y = Math.PI / 8;
    parts.push(tower);
    const band = MeshBuilder.CreateTorus(`rb_${Math.random()}`, { diameter: 0.3, thickness: 0.028, tessellation: 24 }, scene);
    band.position.y = y + 0.34;
    band.rotation.x = Math.PI / 2;
    parts.push(band);
    for (let i = 0; i < 4; i++) {
      const cren = MeshBuilder.CreateBox(`rc_${i}_${Math.random()}`, { width: 0.095, height: 0.14, depth: 0.095 }, scene);
      const ox = (i % 2 === 0 ? -1 : 1) * 0.125;
      const oz = (i < 2 ? -1 : 1) * 0.125;
      cren.position.set(ox, y + 0.4 + 0.07, oz);
      parts.push(cren);
    }
  } else if (type === "n") {
    const chest = MeshBuilder.CreateCylinder(`nb_${Math.random()}`, { diameterTop: 0.3, diameterBottom: 0.36, height: 0.26, tessellation: 32 }, scene);
    chest.position.y = y + 0.13;
    parts.push(chest);
    const neck = MeshBuilder.CreateCylinder(`nn_${Math.random()}`, { diameterTop: 0.22, diameterBottom: 0.28, height: 0.18, tessellation: 24 }, scene);
    neck.position.set(0.02, y + 0.28, 0.06);
    neck.rotation.z = 0.5;
    neck.rotation.x = -0.25;
    parts.push(neck);
    const snout = MeshBuilder.CreateBox(`ns_${Math.random()}`, { width: 0.16, height: 0.14, depth: 0.42 }, scene);
    snout.position.set(0.06, y + 0.36, 0.2);
    snout.rotation.y = -0.35;
    parts.push(snout);
    const crest = MeshBuilder.CreateBox(`nc_${Math.random()}`, { width: 0.06, height: 0.22, depth: 0.12 }, scene);
    crest.position.set(-0.04, y + 0.42, -0.06);
    crest.rotation.z = -0.4;
    parts.push(crest);
  } else if (type === "b") {
    const stem = MeshBuilder.CreateCylinder(`bs_${Math.random()}`, { diameterTop: 0.24, diameterBottom: 0.35, height: 0.4, tessellation: 32 }, scene);
    stem.position.y = y + 0.2;
    parts.push(stem);
    const mitre = addIcoOrSphere(scene, `bm_${Math.random()}`, 0.16, y + 0.44, 2);
    mitre.scaling = new Vector3(0.88, 1.22, 0.88);
    parts.push(mitre);
    const slot = MeshBuilder.CreateBox(`bx_${Math.random()}`, { width: 0.055, height: 0.26, depth: 0.42 }, scene);
    slot.position.y = y + 0.46;
    parts.push(slot);
  } else if (type === "q") {
    const skirt = MeshBuilder.CreateCylinder(`q1_${Math.random()}`, { diameterTop: 0.38, diameterBottom: 0.44, height: 0.22, tessellation: 36 }, scene);
    skirt.position.y = y + 0.11;
    parts.push(skirt);
    const gown = MeshBuilder.CreateCylinder(`q2_${Math.random()}`, { diameterTop: 0.32, diameterBottom: 0.38, height: 0.26, tessellation: 36 }, scene);
    gown.position.y = y + 0.28;
    parts.push(gown);
    const neck = addIcoOrSphere(scene, `qn_${Math.random()}`, 0.1, y + 0.45, 2);
    parts.push(neck);
    const crownR = 0.17;
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const spike = MeshBuilder.CreateCylinder(`qs_${i}_${Math.random()}`, { diameterTop: 0.02, diameterBottom: 0.1, height: 0.12, tessellation: 6 }, scene);
      spike.position.set(Math.cos(ang) * crownR, y + 0.56, Math.sin(ang) * crownR);
      parts.push(spike);
    }
    const jewel = addIcoOrSphere(scene, `qj_${Math.random()}`, 0.075, y + 0.62, 2);
    parts.push(jewel);
  } else if (type === "k") {
    const robe = MeshBuilder.CreateCylinder(`kr_${Math.random()}`, { diameterTop: 0.32, diameterBottom: 0.42, height: 0.5, tessellation: 36 }, scene);
    robe.position.y = y + 0.25;
    parts.push(robe);
    const collar = MeshBuilder.CreateTorus(`kt_${Math.random()}`, { diameter: 0.26, thickness: 0.03, tessellation: 28 }, scene);
    collar.position.y = y + 0.48;
    collar.rotation.x = Math.PI / 2;
    parts.push(collar);
    const head = addIcoOrSphere(scene, `kh_${Math.random()}`, 0.13, y + 0.56, 2);
    parts.push(head);
    const crossV = MeshBuilder.CreateBox(`kv_${Math.random()}`, { width: 0.07, height: 0.32, depth: 0.07 }, scene);
    crossV.position.y = y + 0.78;
    parts.push(crossV);
    const crossH = MeshBuilder.CreateBox(`kh2_${Math.random()}`, { width: 0.24, height: 0.07, depth: 0.07 }, scene);
    crossH.position.y = y + 0.86;
    parts.push(crossH);
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [-1, 0],
      [1, 0]
    ]) {
      const orb = MeshBuilder.CreateSphere(`ko_${dx}_${dy}_${Math.random()}`, { diameter: 0.07, segments: 12 }, scene);
      orb.position.set(dx * 0.11, y + 0.86 + dy * 0.11, 0);
      parts.push(orb);
    }
  }

  for (const p of parts) p.material = mat;

  const merged = Mesh.MergeMeshes(parts, true, true, undefined, false, true);
  merged.name = `piece_${type}_${color}`;
  merged.material = mat;
  merged.receiveShadows = true;
  merged.refreshBoundingInfo(true);
  merged.metadata = { isPiece: true };
  return merged;
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
      if (shadowGenRef) shadowGenRef.addShadowCaster(mesh);
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

/** Parede e moldura superior — salão de jogo. */
function buildSalonBackdrop(scene) {
  scene.clearColor = new Color3(0.06, 0.08, 0.12).toColor4(1);

  const wall = MeshBuilder.CreateBox("salonWall", { width: 30, height: 11, depth: 0.55 }, scene);
  wall.position.set(0, 5.0, -7.6);
  const wm = new StandardMaterial("salonWallMat", scene);
  wm.diffuseColor = new Color3(0.1, 0.19, 0.12);
  wm.specularColor = new Color3(0.06, 0.1, 0.08);
  wm.specularPower = 42;
  wall.material = wm;

  const rail = MeshBuilder.CreateBox("salonRail", { width: 30, height: 0.22, depth: 0.58 }, scene);
  rail.position.set(0, 9.85, -7.55);
  const rm = new StandardMaterial("salonRailMat", scene);
  rm.diffuseColor = new Color3(0.13, 0.1, 0.08);
  rm.specularColor = new Color3(0.1, 0.09, 0.07);
  rail.material = rm;
}

/** Moldura em latão ao redor das 64 casas. */
function addBoardBrassFrame(scene) {
  const brass = new StandardMaterial("brassFrame", scene);
  brass.diffuseColor = new Color3(0.7, 0.54, 0.2);
  brass.specularColor = new Color3(0.92, 0.78, 0.42);
  brass.specularPower = 108;
  const half = 4.12;
  const t = 0.12;
  const y = 0.038;
  const thick = 0.048;
  const span = half * 2 + t * 2;
  const depth = t;
  const bars = [
    { w: span, h: thick, d: depth, x: 0, z: half + t / 2 },
    { w: span, h: thick, d: depth, x: 0, z: -half - t / 2 },
    { w: depth, h: thick, d: span - 2 * depth, x: half + t / 2, z: 0 },
    { w: depth, h: thick, d: span - 2 * depth, x: -half - t / 2, z: 0 }
  ];
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    const m = MeshBuilder.CreateBox(`brassFrame_${i}`, { width: b.w, height: b.h, depth: b.d }, scene);
    m.position.set(b.x, y, b.z);
    m.material = brass;
    m.receiveShadows = true;
  }
}

/** Relógio de xadrez clássico (dois mostradores); ponteiros seguem a hora local. */
function buildClassicChessClock(scene) {
  const root = new TransformNode("chessClockRoot", scene);
  root.position.set(5.62, 0.96, 2.95);
  root.rotation.y = -0.52;

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
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
  const scene = new Scene(engine);
  buildSalonBackdrop(scene);

  const lockAlpha = -Math.PI / 2.35;
  const lockBeta = 1.05;
  const camera = new ArcRotateCamera("cam", lockAlpha, lockBeta, 14, Vector3.Zero(), scene);
  camera.lowerAlphaLimit = camera.upperAlphaLimit = lockAlpha;
  camera.lowerBetaLimit = camera.upperBetaLimit = lockBeta;
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 8;
  camera.upperRadiusLimit = 22;
  camera.wheelPrecision = 40;
  camera.panningSensibility = 0;

  const hemi = new HemisphericLight("hemi", new Vector3(0.25, 1, 0.2), scene);
  hemi.intensity = 0.55;
  hemi.groundColor = new Color3(0.08, 0.09, 0.14);

  const dir = new DirectionalLight("dir", new Vector3(-0.4, -1, -0.35), scene);
  dir.position = new Vector3(10, 18, 8);
  dir.intensity = 0.85;
  dir.shadowMinZ = 1;
  dir.shadowMaxZ = 40;

  const ground = MeshBuilder.CreateGround("ground", { width: 32, height: 32 }, scene);
  ground.position.y = -0.02;
  const gmat = new StandardMaterial("gm", scene);
  gmat.diffuseColor = new Color3(0.09, 0.07, 0.055);
  gmat.specularColor = new Color3(0.04, 0.035, 0.03);
  gmat.specularPower = 24;
  ground.material = gmat;
  ground.receiveShadows = true;

  buildClassicChessClock(scene);

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
      tile.receiveShadows = true;
      tile.metadata = { square: squareFromBoardRC(row, col), isTile: true };
    }
  }

  addBoardBrassFrame(scene);

  const shadow = new ShadowGenerator(2048, dir);
  shadow.useBlurExponentialShadowMap = true;
  shadow.blurKernel = 32;
  shadowGenRef = shadow;

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
  window.addEventListener("resize", () => engine.resize());

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
  syncPiecesFromGame();
  updateStatus();
  if (getMode() === "engine" && getPlayerColor() === "b") {
    setTimeout(() => callBestMove(), 300);
  }
  refreshNNStatus();
}

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
