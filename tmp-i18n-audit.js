const fs = require("fs");
const vm = require("vm");

const htmlFiles = [
  "src/public/index.html",
  "src/public/board2d.html",
  "src/public/chess3d.html",
  "src/public/matches.html",
  "src/public/ranking.html",
  "src/public/offline.html",
];

const src = fs.readFileSync("src/public/js/i18n.js", "utf8");
const sandbox = {
  window: {},
  document: {
    documentElement: { lang: "" },
    readyState: "loading",
    addEventListener() {},
    head: { appendChild() {} },
    body: null,
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement() { return { id: "", textContent: "", setAttribute() {}, appendChild() {} }; },
  },
  localStorage: { getItem() { return null; }, setItem() {} },
  location: { pathname: "/" },
  CustomEvent: function () {},
  console,
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(src, sandbox);
const t = sandbox.SatorI18n.t;
const ptKeys = new Set();

const attrRe = /data-i18n(?:-html|-placeholder|-title|-aria|-alt|-content)?="([^"]+)"/g;
const missing = [];
const keyAsText = [];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  let am;
  const seen = new Set();
  while ((am = attrRe.exec(html))) {
    const key = am[1];
    if (seen.has(key)) continue;
    seen.add(key);
    const value = t(key);
    if (value === key) missing.push(file + " " + key);
  }
  const textRe = /data-i18n="([^"]+)"[^>]*>([^<]*)</g;
  let tm;
  while ((tm = textRe.exec(html))) {
    const key = tm[1];
    const text = tm[2].replace(/&nbsp;|&#\d+;|\s+/g, " ").trim();
    if (!text) continue;
    if (text.toLowerCase() === key.toLowerCase() || text === key) keyAsText.push(file + " TEXT=" + text + " KEY=" + key);
  }
}

const jsFiles = [
  "src/public/js/chess3d.mjs",
  "src/public/js/liveGameSession.mjs",
  "src/public/index.html",
  "src/public/board2d.html",
  "src/public/matches.html",
  "src/public/ranking.html",
];
const callRe = /\bt\(\s*["']([a-zA-Z0-9_.]+)["']/g;
const missingCalls = [];
for (const file of jsFiles) {
  const code = fs.readFileSync(file, "utf8");
  let cm;
  const seen = new Set();
  while ((cm = callRe.exec(code))) {
    const key = cm[1];
    if (seen.has(key)) continue;
    seen.add(key);
    if (t(key) === key) missingCalls.push(file + " " + key);
  }
}

console.log("MISSING ATTR", missing.length);
missing.forEach((x) => console.log(x));
console.log("KEY AS TEXT", keyAsText.length);
keyAsText.forEach((x) => console.log(x));
console.log("MISSING CALLS", missingCalls.length);
missingCalls.forEach((x) => console.log(x));
console.log("pt keys", ptKeys.size);
