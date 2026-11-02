/**
 * Seeds dos mestres (Kasparov, Carlsen, Polgár, Belenkaya) num processo filho,
 * repetido enquanto o servidor está no ar. Não bloqueia o pedido HTTP.
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const LOCK_PATH = path.join(__dirname, "..", "..", "data", "master-seed.lock");

const DEFAULT_INTERVAL_MS = 10 * 60 * 1000;

let worker = null;
let timer = null;
const status = {
  running: false,
  pid: null,
  startedAt: null,
  finishedAt: null,
  lastExitCode: null,
  intervalMs: null,
  runs: 0,
  gamesPerMaster: null,
  maxPlies: null
};

function readConfig() {
  const gamesPerMaster = parseInt(process.env.SATOR_MASTER_SEED_GAMES || "1", 10);
  const maxPlies = parseInt(process.env.SATOR_MASTER_SEED_PLIES || "48", 10);
  const intervalMs = parseInt(
    process.env.SATOR_MASTER_SEED_INTERVAL_MS || String(DEFAULT_INTERVAL_MS),
    10
  );
  return {
    gamesPerMaster: Number.isFinite(gamesPerMaster) ? gamesPerMaster : 1,
    maxPlies: Number.isFinite(maxPlies) ? maxPlies : 48,
    intervalMs: Number.isFinite(intervalMs) ? intervalMs : DEFAULT_INTERVAL_MS
  };
}

function pidAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function anotherSeedIsRunning() {
  try {
    if (!fs.existsSync(LOCK_PATH)) return false;
    const old = parseInt(fs.readFileSync(LOCK_PATH, "utf8"), 10);
    return pidAlive(old);
  } catch {
    return false;
  }
}

function writeLock(pid) {
  try {
    fs.mkdirSync(path.dirname(LOCK_PATH), { recursive: true });
    fs.writeFileSync(LOCK_PATH, String(pid));
  } catch (e) {
    console.warn("[Sator] Não foi possível gravar o lock da seed:", e.message);
  }
}

function clearLock(pid) {
  try {
    if (!fs.existsSync(LOCK_PATH)) return;
    const old = parseInt(fs.readFileSync(LOCK_PATH, "utf8"), 10);
    if (!pid || old === pid) fs.unlinkSync(LOCK_PATH);
  } catch {
    /* ignore */
  }
}

function reloadEngineWeights() {
  try {
    require("../eval/valueNet").loadFromDisk();
  } catch (e) {
    console.error("[Sator] Recarga da rede após seed falhou:", e.message);
  }
}

function startMasterSeedWorker() {
  if (process.env.SATOR_DISABLE_MASTER_SEED === "1") {
    return { started: false, reason: "disabled" };
  }
  const cfg = readConfig();
  status.gamesPerMaster = cfg.gamesPerMaster;
  status.maxPlies = cfg.maxPlies;
  status.intervalMs = cfg.intervalMs;
  if (cfg.gamesPerMaster <= 0) return { started: false, reason: "zero-games" };
  if (worker) return { started: false, reason: "busy", pid: status.pid };
  if (anotherSeedIsRunning()) return { started: false, reason: "already-running" };

  const script = path.join(__dirname, "..", "tools", "seedMasters.js");
  const root = path.join(__dirname, "..", "..");
  worker = spawn(
    process.execPath,
    [script, "all", String(cfg.gamesPerMaster), String(cfg.maxPlies), "1"],
    {
      cwd: root,
      env: { ...process.env, SATOR_SEED_FEED_NN: "1" },
      stdio: "inherit",
      windowsHide: true
    }
  );
  writeLock(worker.pid);
  status.running = true;
  status.pid = worker.pid;
  status.startedAt = new Date().toISOString();
  status.runs += 1;
  console.log(
    "[Sator] Seed dos mestres em background:",
    JSON.stringify({
      pid: worker.pid,
      gamesPerMaster: cfg.gamesPerMaster,
      maxPlies: cfg.maxPlies,
      run: status.runs
    })
  );

  const child = worker;
  worker.on("exit", (code) => {
    clearLock(child.pid);
    worker = null;
    status.running = false;
    status.pid = null;
    status.finishedAt = new Date().toISOString();
    status.lastExitCode = code;
    reloadEngineWeights();
    console.log(
      "[Sator] Seed dos mestres (background) concluída; rede do motor recarregada.",
      JSON.stringify({ code, finishedAt: status.finishedAt })
    );
  });
  worker.on("error", (err) => {
    console.error("[Sator] Seed dos mestres (background) falhou:", err.message);
    clearLock(child.pid);
    worker = null;
    status.running = false;
    status.pid = null;
    status.lastExitCode = -1;
  });
  worker.unref();
  return { started: true, pid: status.pid };
}

function scheduleMasterContinuousSeed() {
  if (process.env.SATOR_DISABLE_MASTER_SEED === "1") return;
  const { intervalMs } = readConfig();
  status.intervalMs = intervalMs;
  startMasterSeedWorker();
  if (timer || !(intervalMs > 0)) return;
  timer = setInterval(() => {
    startMasterSeedWorker();
  }, intervalMs);
  if (typeof timer.unref === "function") timer.unref();
}

function getMasterSeedStatus() {
  return { ...status };
}

module.exports = {
  scheduleMasterContinuousSeed,
  startMasterSeedWorker,
  getMasterSeedStatus
};
