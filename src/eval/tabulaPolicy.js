const fs = require("fs");
const path = require("path");
const { satorFeatures } = require("./satorEval");
const { kasparovFeatures } = require("./kasparovEval");
const { sunTzuFeatures } = require("./sunTzuEval");

function loadConfig() {
  const p = path.join(__dirname, "weightsConfig.json");
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function classify(chess) {
  const s = satorFeatures(chess);
  const k = kasparovFeatures(chess);
  const z = sunTzuFeatures(chess);

  const enemyForce = z.enemy.checks + z.enemy.captures;
  const myForce = z.my.checks + z.my.captures;

  const danger = s.porosity + 2*enemyForce + (k.inCheck ? 3 : 0);
  const initiative = myForce + Math.max(0, k.mobility - z.enemy.mobility);

  const mode = danger >= 10 ? "DEF" : (initiative >= 5 ? "ATK" : "BAL");

  let module = "TENET";
  if (mode === "DEF") {
    module = danger >= 14 ? "OPERA" : (s.porosity >= 6 ? "TENET" : "SATOR");
    if (enemyForce === 0 && s.porosity <= 3) module = "ROTAS";
    if (z.enemy.captures >= 3) module = "AREPO";
  } else if (mode === "ATK") {
    module = initiative >= 8 ? "OPERA" : "TENET";
    if (myForce === 0 && initiative >= 5) module = "SATOR";
    if (z.my.captures >= 3) module = "AREPO";
    if (initiative < 6) module = "ROTAS";
  } else {
    module = "SATOR";
  }

  return { mode, module, danger, initiative };
}

function dynamicWeights(policy) {
  const cfg = loadConfig();
  const mult = cfg.POLICY_MULTIPLIERS[policy.mode] || cfg.POLICY_MULTIPLIERS.BAL;
  const bonus = cfg.MODULE_BONUS[policy.module] || { sator:0, kasparov:0, suntzu:0 };

  return {
    sator: mult.sator + (bonus.sator || 0),
    kasparov: mult.kasparov + (bonus.kasparov || 0),
    suntzu: mult.suntzu + (bonus.suntzu || 0),
    base: cfg.BASE
  };
}

module.exports = { classify, dynamicWeights, loadConfig };
