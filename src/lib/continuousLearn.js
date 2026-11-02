/**
 * Aprendizado contínuo: livro Lichess/mestres + amostra do buffer TD.
 */
const openingStats = require("./openingStats");
const { schedulePostGameTrain } = require("../db/postGameTrainScheduler");

let lastTick = 0;
let lastReason = null;
let looping = false;
const MIN_MS = 12 * 60 * 1000;

async function tickContinuousLearn(reason) {
  const now = Date.now();
  if (now - lastTick < MIN_MS && reason !== "force") return { skipped: true, reason };
  lastTick = now;
  lastReason = reason || "schedule";
  const book = await openingStats.seedPopularPositions();
  const recent = await openingStats.ingestRecentPlayedFens();
  schedulePostGameTrain();
  console.log("[Sator] Aprendizado contínuo (livro+buffer):", JSON.stringify({ reason, ...book, recent }));
  return { ok: true, reason, ...book, recent };
}

function scheduleContinuousLearn(reason) {
  if (process.env.SATOR_DISABLE_CONTINUOUS_LEARN === "1") return;
  setImmediate(() => {
    void tickContinuousLearn(reason || "schedule").catch((e) => {
      console.error("[Sator] Aprendizado contínuo falhou:", e.message);
    });
  });
}

/** Livro do motor (Lichess + mestres) e buffer TD, em ciclo, sem depender de lances do utilizador. */
function startContinuousLearnBackground() {
  if (process.env.SATOR_DISABLE_CONTINUOUS_LEARN === "1") return;
  if (looping) return;
  looping = true;
  const intervalMs = parseInt(process.env.SATOR_CONTINUOUS_LEARN_INTERVAL_MS || String(MIN_MS), 10);
  scheduleContinuousLearn("boot");
  if (!(intervalMs > 0)) return;
  const timer = setInterval(() => scheduleContinuousLearn("interval"), intervalMs);
  if (typeof timer.unref === "function") timer.unref();
}

function getContinuousLearnStatus() {
  const intervalMs = parseInt(process.env.SATOR_CONTINUOUS_LEARN_INTERVAL_MS || String(MIN_MS), 10);
  return {
    looping,
    lastTick: lastTick || null,
    lastReason,
    intervalMs,
    minGapMs: MIN_MS
  };
}

module.exports = {
  tickContinuousLearn,
  scheduleContinuousLearn,
  startContinuousLearnBackground,
  getContinuousLearnStatus
};
