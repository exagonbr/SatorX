const fs = require('fs');
const file = 'src/public/js/chess3d.mjs';
let code = fs.readFileSync(file, 'utf8');

// Replace the render logic
code = code.replace(
`function updateClockDisplays() {
  const whiteTurn = game.turn() === 'w';
  renderClockTexture(clockWhiteTex, fmtClock(clockWhiteSecs), 'SATOR ENGINE', whiteTurn);
  renderClockTexture(clockBlackTex, fmtClock(clockBlackSecs), 'HUMAN PLAYER', !whiteTurn);
}`,
`function updateClockDisplays() {
  const whiteTurn = game.turn() === 'w';
  const playerColor = getMode() === "human" ? "w" : getPlayerColor();
  
  // Panel R is always closer to the player, Panel L is further away.
  // Player is at -Z when playing White (clock at +X), or +Z when playing Black (clock at -X).
  // Thus, Panel R always corresponds to the Player, and Panel L to the Opponent/Engine.
  const p1Time = playerColor === 'w' ? clockWhiteSecs : clockBlackSecs;
  const p2Time = playerColor === 'w' ? clockBlackSecs : clockWhiteSecs;
  
  const p1Active = playerColor === 'w' ? whiteTurn : !whiteTurn;
  const p2Active = playerColor === 'w' ? !whiteTurn : whiteTurn;
  
  const p1Label = getMode() === "human" ? "WHITE PLAYER" : "HUMAN PLAYER";
  const p2Label = getMode() === "human" ? "BLACK PLAYER" : "SATOR ENGINE";

  renderClockTexture(clockBlackTex /* which is texR */, fmtClock(p1Time), p1Label, p1Active);
  renderClockTexture(clockWhiteTex /* which is texL */, fmtClock(p2Time), p2Label, p2Active);
}`
);

fs.writeFileSync(file, code, 'utf8');
