const fs = require("fs");
const h = fs.readFileSync("prod-index.html", "utf8");
const keys = ["menu.start", "MENU.START", "Iniciar partida", "data-i18n", "i18n.js"];
for (const k of keys) console.log(k, h.split(k).length - 1);
const i = h.indexOf("btnStartGame");
console.log("--- snippet ---");
console.log(h.slice(Math.max(0, i - 80), i + 500));
console.log("local i18n", fs.statSync("src/public/js/i18n.js").size);
