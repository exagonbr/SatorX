const { satorScore, satorFeatures } = require("./satorEval");
const { kasparovScore, kasparovFeatures } = require("./kasparovEval");
const { sunTzuScore, sunTzuFeatures } = require("./sunTzuEval");
const { sacredScore, sacredFeatures } = require("./sacredGeometryEval");
const { tacticsScore, tacticalFeatures } = require("./tacticsEval");
const { kingSafetyScore, kingSafetyFeatures } = require("./kingSafetyEval");
const { classify, dynamicWeights } = require("./tabulaPolicy");
const { toFeatureVector } = require("./featureVector");

// baseline sacred weight remains constant, but BASE (tactics/king) is read from config
const SACRED_W = 0.35;

function evaluateHeuristicOnly(chess) {
  const policy = classify(chess);
  const W = dynamicWeights(policy);

  const sS = satorScore(chess);
  const kS = kasparovScore(chess);
  const zS = sunTzuScore(chess);
  const gS = sacredScore(chess);
  const tS = tacticsScore(chess);
  const ks = kingSafetyScore(chess);

  const BASE = W.base;

  return (
    SACRED_W * gS +
    (BASE.tactics || 0) * tS +
    (BASE.king || 0) * ks +
    W.sator * sS +
    W.kasparov * kS +
    W.suntzu * zS
  );
}

function evaluate(chess) {
  const h = evaluateHeuristicOnly(chess);
  const nnMod = require("./valueNet");
  const cfg = nnMod.getNNConfig();
  if (!cfg.useInEval) return h;
  const v = nnMod.forward(toFeatureVector(chess));
  return h + (cfg.scale || 45) * v;
}

function features(chess) {
  const policy = classify(chess);
  const W = dynamicWeights(policy);
  return {
    policy,
    weights: { sacred: SACRED_W, base: W.base, mult: { sator: W.sator, kasparov: W.kasparov, suntzu: W.suntzu } },
    sator: satorFeatures(chess),
    kasparov: kasparovFeatures(chess),
    suntzu: sunTzuFeatures(chess),
    sacred: sacredFeatures(chess),
    tactics: tacticalFeatures(chess),
    king: kingSafetyFeatures(chess)
  };
}

module.exports = { evaluate, evaluateHeuristicOnly, features };
