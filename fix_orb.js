const fs = require('fs');
const file = 'src/public/js/chess3d.mjs';
let code = fs.readFileSync(file, 'utf8');

// The orbe particles need to blend a bit better
code = code.replace(/partSys.minEmitPower = 0.2;\n\s+partSys.maxEmitPower = 0.8;/, 'partSys.minEmitPower = 0.1;\n  partSys.maxEmitPower = 0.4;');
fs.writeFileSync(file, code, 'utf8');
