/**
 * Persistência local do aprendizado (TD + snapshots dos pesos) em SQLite.
 */
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DB_PATH = path.join(DATA_DIR, "ai_learning.db");

/** Um snapshot completo a cada N atualizações (além do arquivo nnWeights.json). */
const SNAPSHOT_EVERY_UPDATES = 100;

let db = null;
let stmtInsertTd = null;
let stmtInsertSnapshot = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function migrate(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS td_learning (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      td_error REAL,
      v_before REAL,
      v_after REAL,
      td_target REAL,
      terminal INTEGER NOT NULL,
      outcome_for_mover INTEGER NOT NULL,
      updates INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_td_learning_created ON td_learning(created_at);

    CREATE TABLE IF NOT EXISTS nn_weights_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      updates INTEGER NOT NULL,
      payload TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_nn_snapshots_updates ON nn_weights_snapshots(updates);
  `);
}

function getDb() {
  if (db) return db;
  ensureDataDir();
  const Database = require("better-sqlite3");
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  migrate(db);
  stmtInsertTd = db.prepare(`
    INSERT INTO td_learning (
      created_at, td_error, v_before, v_after, td_target,
      terminal, outcome_for_mover, updates
    ) VALUES (@created_at, @td_error, @v_before, @v_after, @td_target,
      @terminal, @outcome_for_mover, @updates)
  `);
  stmtInsertSnapshot = db.prepare(`
    INSERT INTO nn_weights_snapshots (created_at, updates, payload)
    VALUES (@created_at, @updates, @payload)
  `);
  return db;
}

/**
 * Registra um passo TD após treino online.
 * @param {object} p
 * @param {string} p.createdAt ISO
 * @param {number} p.tdError
 * @param {number} p.vBefore
 * @param {number|null} p.vAfter
 * @param {number} p.tdTarget
 * @param {boolean} p.terminal
 * @param {number} p.outcomeForMover
 * @param {number} p.updates
 */
function recordTdStep(p) {
  try {
    getDb();
    stmtInsertTd.run({
      created_at: p.createdAt,
      td_error: p.tdError,
      v_before: p.vBefore,
      v_after: p.vAfter == null ? null : p.vAfter,
      td_target: p.tdTarget,
      terminal: p.terminal ? 1 : 0,
      outcome_for_mover: p.outcomeForMover,
      updates: p.updates
    });
  } catch (e) {
    console.error("[aiLearningStore] recordTdStep:", e.message);
  }
}

/**
 * Guarda cópia completa dos pesos no SQLite (histórico).
 * @param {object} weightsPayload mesmo formato serializado que nnWeights.json
 * @param {string} createdAt ISO
 * @param {number} updates
 */
function maybeRecordWeightsSnapshot(weightsPayload, createdAt, updates) {
  if (updates <= 0 || updates % SNAPSHOT_EVERY_UPDATES !== 0) return;
  try {
    getDb();
    stmtInsertSnapshot.run({
      created_at: createdAt,
      updates,
      payload: JSON.stringify(weightsPayload)
    });
  } catch (e) {
    console.error("[aiLearningStore] maybeRecordWeightsSnapshot:", e.message);
  }
}

/** Inicializa o ficheiro e esquema (útil em deploy). */
function initSchema() {
  getDb();
  return DB_PATH;
}

function closeDb() {
  if (db) {
    try {
      db.close();
    } catch (_) {
      /* ignore */
    }
    db = null;
    stmtInsertTd = null;
    stmtInsertSnapshot = null;
  }
}

module.exports = {
  getDb,
  recordTdStep,
  maybeRecordWeightsSnapshot,
  initSchema,
  closeDb,
  DB_PATH,
  SNAPSHOT_EVERY_UPDATES
};
