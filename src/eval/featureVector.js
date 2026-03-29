/**
 * Vetor numérico fixo para a rede de valor, derivado das mesmas features do motor.
 * @see docs em plano: dimensão estável para MLP.
 */
const { satorFeatures } = require("./satorEval");
const { kasparovFeatures } = require("./kasparovEval");
const { sunTzuFeatures } = require("./sunTzuEval");
const { sacredFeatures } = require("./sacredGeometryEval");
const { tacticalFeatures } = require("./tacticsEval");
const { kingSafetyFeatures } = require("./kingSafetyEval");
const { classify } = require("./tabulaPolicy");

const T = (x, s = 1) => Math.tanh(x / s);

/** Dimensão do vetor (documentada para I/O da rede). */
const FEATURE_DIM = 38;

function modeOneHot(mode) {
  return mode === "DEF" ? [1, 0, 0] : mode === "ATK" ? [0, 1, 0] : [0, 0, 1];
}

/**
 * @param {import("chess.js").Chess} chess
 * @returns {number[]}
 */
function toFeatureVector(chess) {
  const s = satorFeatures(chess);
  const k = kasparovFeatures(chess);
  const z = sunTzuFeatures(chess);
  const g = sacredFeatures(chess);
  const t = tacticalFeatures(chess);
  const ks = kingSafetyFeatures(chess);
  const policy = classify(chess);

  const turnW = chess.turn() === "w" ? 1 : 0;

  const vec = [
    T(s.tenet.self, 4),
    T(s.tenet.enemy, 4),
    T(s.ring.self, 6),
    T(s.ring.enemy, 6),
    T(s.perimeter.self, 8),
    T(s.perimeter.enemy, 8),
    T(s.porosity, 10),
    T(s.rotas.checks, 3),
    T(s.rotas.captures, 3),
    T(k.mobility, 25),
    T(k.checks, 3),
    T(k.captures, 3),
    k.inCheck ? 1 : 0,
    T(k.materialDiff, 15),
    T(z.my.mobility, 25),
    T(z.my.checks, 3),
    T(z.my.captures, 3),
    T(z.enemy.mobility, 25),
    T(z.enemy.checks, 3),
    T(z.enemy.captures, 3),
    T(g.center.self, 3),
    T(g.center.enemy, 3),
    T(g.ring1.self, 6),
    T(g.ring1.enemy, 6),
    T(g.ring2.self, 10),
    T(g.ring2.enemy, 10),
    T(g.perimeter.self, 10),
    T(g.perimeter.enemy, 10),
    T(t.strongChecks, 5),
    T(t.forkThreats, 5),
    T(t.hangingCaptures, 5),
    T(ks.ringAttacks, 6),
    T(ks.pawnShield, 4),
    ks.inCheck ? 1 : 0,
    ...modeOneHot(policy.mode),
    turnW
  ];

  if (vec.length !== FEATURE_DIM) {
    throw new Error(`featureVector: expected ${FEATURE_DIM}, got ${vec.length}`);
  }
  return vec;
}

module.exports = { toFeatureVector, FEATURE_DIM };
