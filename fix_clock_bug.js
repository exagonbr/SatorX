const fs = require('fs');
const file = 'src/public/js/chess3d.mjs';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
`function tickClock() {
  if (!clockRunning || game.isGameOver()) return;
  if (game.turn() === 'w') {
    clockWhiteSecs++;
  } else {
    clockBlackSecs++;
  }
  updateClockDisplays();
}`,
`function tickClock() {
  if (!clockRunning || game.isGameOver()) return;
  if (game.turn() === 'w') {
    clockWhiteSecs++;
  } else {
    clockBlackSecs++;
  }
  updateClockDisplays();
}` // Same just checking...
);

fs.writeFileSync(file, code, 'utf8');
