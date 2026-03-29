const fs = require('fs');
const file = 'src/public/js/chess3d.mjs';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
`function syncChessClockPlacement() {
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
}`,
`function syncChessClockPlacement() {
  if (!chessClockRootRef) return;
  const whiteSide = getMode() === "human" || getPlayerColor() === "w";
  if (whiteSide) {
    // À direita do jogador (+X), na borda da mesa, bem paralelo ao tabuleiro
    chessClockRootRef.position.set(5.6, 0.22, 0);
    chessClockRootRef.rotation.y = -Math.PI / 2; // Virado para a esquerda (-X), para o tabuleiro
  } else {
    // À esquerda do jogador (-X), borda da mesa, paralelo
    chessClockRootRef.position.set(-5.6, 0.22, 0);
    chessClockRootRef.rotation.y = Math.PI / 2; // Virado para a direita (+X), para o tabuleiro
  }
}`
);

fs.writeFileSync(file, code, 'utf8');
