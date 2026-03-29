/**
 * Processo em background: treina pesos heurísticos a partir do buffer na BD.
 * Chamado pelo servidor após guardar replay (ver postGameTrainScheduler).
 */
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:../data/ai_learning.db";
}

const { countBufferRows } = require("../db/replayStore");
const { runTrainFromBuffer } = require("./trainFromBuffer");
const { closeDb } = require("../db/aiLearningStore");

(async () => {
  try {
    const n = await countBufferRows();
    if (n === 0) {
      console.log("[postGameTrain] buffer vazio, skip");
      return;
    }
    const iters = parseInt(process.env.POST_GAME_TRAIN_ITERS || "12", 10);
    const depth = parseInt(process.env.POST_GAME_TRAIN_DEPTH || "4", 10);
    const timeMs = parseInt(process.env.POST_GAME_TRAIN_TIME_MS || "400", 10);
    await runTrainFromBuffer({
      fromFile: false,
      iters,
      depth,
      timeMs,
      quiet: process.env.POST_GAME_TRAIN_VERBOSE !== "1"
    });
  } catch (e) {
    console.error("[postGameTrain]", e.message || e);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
})();
