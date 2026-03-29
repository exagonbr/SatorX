const fs = require('fs');
const file = 'src/public/js/chess3d.mjs';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
`    chessClockRootRef.position.set(5.6, 0.22, 0);
    chessClockRootRef.rotation.y = -Math.PI / 2; // Virado para a esquerda (-X), para o tabuleiro
  } else {
    // À esquerda do jogador (-X), borda da mesa, paralelo
    chessClockRootRef.position.set(-5.6, 0.22, 0);`,
`    chessClockRootRef.position.set(5.6, 0.0, 0);
    chessClockRootRef.rotation.y = -Math.PI / 2; // Virado para a esquerda (-X), para o tabuleiro
  } else {
    // À esquerda do jogador (-X), borda da mesa, paralelo
    chessClockRootRef.position.set(-5.6, 0.0, 0);`
);

fs.writeFileSync(file, code, 'utf8');
