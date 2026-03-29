const path = require("path");
const { spawn } = require("child_process");

let worker = null;
let pending = false;

function schedulePostGameTrain() {
  if (process.env.POST_GAME_TRAIN === "0" || process.env.POST_GAME_TRAIN === "false") {
    return;
  }
  pending = true;
  if (worker) return;
  startWorker();
}

function startWorker() {
  pending = false;
  const workerPath = path.join(__dirname, "..", "tools", "postGameTrainWorker.js");
  const root = path.join(__dirname, "..", "..");
  worker = spawn(process.execPath, [workerPath], {
    cwd: root,
    env: process.env,
    stdio: process.env.POST_GAME_TRAIN_VERBOSE === "1" ? "inherit" : "ignore"
  });
  worker.on("exit", () => {
    worker = null;
    if (pending) startWorker();
  });
  worker.on("error", (err) => {
    console.error("[postGameTrainScheduler]", err.message);
    worker = null;
    if (pending) startWorker();
  });
  worker.unref();
}

module.exports = { schedulePostGameTrain };
