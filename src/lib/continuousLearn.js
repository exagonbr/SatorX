/**
 * Aprendizado contínuo: livro Lichess/mestres + amostra do buffer TD.
 */
const openingStats = require("./openingStats");
const { schedulePostGameTrain } = require("../db/postGameTrainScheduler");

let lastTick = 0;
const MIN_MS = 12 * 60 * 1000;

async function tickContinuousLearn(reason) {
  const now = Date.now();
  if (now - lastTick < MIN_MS && reason !== "force") return { skipped: true };
  lastTick = now;
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

module.exports = { tickContinuousLearn, scheduleContinuousLearn };
