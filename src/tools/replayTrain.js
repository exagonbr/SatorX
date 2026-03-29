/**
 * Replay trainer: salva partidas do usuário e faz ajuste leve por bandit:
 * - Se perder, aumenta pesos DEF (Sator/SunTzu e king safety)
 * - Se ganhar, aumenta pesos ATK (Kasparov) um pouco
 *
 * Arquivo: src/tools/replayTrain.js <result>
 * result: win|loss|draw do ponto de vista das brancas (usuário)
 */
const fs = require("fs");
const path = require("path");

const CFG_PATH = path.join(__dirname, "..", "eval", "weightsConfig.json");
function loadCfg() { return JSON.parse(fs.readFileSync(CFG_PATH, "utf-8")); }
function saveCfg(cfg) { fs.writeFileSync(CFG_PATH, JSON.stringify(cfg, null, 2)); }
function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }

function main() {
  const result = (process.argv[2] || "draw").toLowerCase();
  const cfg = loadCfg();

  if (result === "loss") {
    // motor perdeu para o humano? então suba DEF e king safety
    cfg.BASE.king = clamp(cfg.BASE.king * 1.06, 0.1, 3.0);
    cfg.POLICY_MULTIPLIERS.DEF.suntzu = clamp(cfg.POLICY_MULTIPLIERS.DEF.suntzu * 1.05, 0.2, 2.5);
    cfg.POLICY_MULTIPLIERS.DEF.sator = clamp(cfg.POLICY_MULTIPLIERS.DEF.sator * 1.04, 0.2, 2.5);
  } else if (result === "win") {
    // motor venceu, pode aumentar ATK um pouco (sem virar kamikaze)
    cfg.POLICY_MULTIPLIERS.ATK.kasparov = clamp(cfg.POLICY_MULTIPLIERS.ATK.kasparov * 1.03, 0.2, 2.5);
    cfg.BASE.tactics = clamp(cfg.BASE.tactics * 1.02, 0.1, 3.0);
  } else {
    // draw: leve ajuste para ROTAS (contrajogo)
    cfg.MODULE_BONUS.ROTAS.suntzu = clamp((cfg.MODULE_BONUS.ROTAS.suntzu || 0.1) * 1.02, 0.0, 0.5);
  }

  saveCfg(cfg);
  console.log("Configuração atualizada para o resultado:", result);
}

main();
