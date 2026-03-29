const fs = require('fs');
const file = 'src/public/js/chess3d.mjs';
let code = fs.readFileSync(file, 'utf8');

// O painel R e L devem garantir que o texto não fique de ponta cabeça
code = code.replace(
`  panelL.rotation.y = Math.PI; // Vira para o lado certo`,
`  panelL.rotation.y = Math.PI; // Vira para o lado certo\n  panelL.rotation.z = Math.PI; // Desvira cabeça pra baixo`
);

code = code.replace(
`  panelR.rotation.y = Math.PI;`,
`  panelR.rotation.y = Math.PI;\n  panelR.rotation.z = Math.PI;`
);

fs.writeFileSync(file, code, 'utf8');
