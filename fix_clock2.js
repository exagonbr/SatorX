const fs = require('fs');
const file = 'src/public/js/chess3d.mjs';
let code = fs.readFileSync(file, 'utf8');

// Change countdown to countup
code = code.replace(
`const CLOCK_INITIAL_SECS = 20 * 60; // 20 minutos por jogador
let clockWhiteSecs = CLOCK_INITIAL_SECS;
let clockBlackSecs = CLOCK_INITIAL_SECS;`,
`const CLOCK_INITIAL_SECS = 0; // Conta para cima (tempo gasto)
let clockWhiteSecs = 0;
let clockBlackSecs = 0;`
);

// Ticking logic
code = code.replace(
`function tickClock() {
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
}`,
`function tickClock() {
  if (!clockRunning || game.isGameOver()) return;
  if (game.turn() === 'w') {
    clockWhiteSecs++;
  } else {
    clockBlackSecs++;
  }
  updateClockDisplays();
}`
);

// Reset
code = code.replace(
`function resetClock() {
  stopClock();
  clockWhiteSecs = CLOCK_INITIAL_SECS;
  clockBlackSecs = CLOCK_INITIAL_SECS;
  updateClockDisplays();
}`,
`function resetClock() {
  stopClock();
  clockWhiteSecs = 0;
  clockBlackSecs = 0;
  updateClockDisplays();
}`
);

// Fix plane visibility
code = code.replace(
`  const matL = new StandardMaterial("clkMatL", scene);
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
  panelR.material = matR;`,
`  const matL = new StandardMaterial("clkMatL", scene);
  matL.diffuseTexture  = texL;
  matL.emissiveTexture = texL;
  matL.specularColor   = Color3.Black();
  matL.backFaceCulling = false; // Garante que a textura seja vista
  panelL.rotation.y = Math.PI; // Vira para o lado certo
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
  matR.backFaceCulling = false;
  panelR.rotation.y = Math.PI;
  panelR.material = matR;`
);

fs.writeFileSync(file, code, 'utf8');
