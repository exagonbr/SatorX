/**
 * Persistência local do aprendizado (TD + snapshots) via Prisma + SQLite.
 */
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DB_FILE = path.join(DATA_DIR, "ai_learning.db");

/** Um snapshot completo a cada N atualizações (além de nnWeights.json). */
const SNAPSHOT_EVERY_UPDATES = 100;

let prisma = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getPrisma() {
  if (!prisma) {
    ensureDataDir();
    if (!process.env.DATABASE_URL) {
      // Relativo a prisma/schema.prisma → raiz do projeto /data/ai_learning.db
      process.env.DATABASE_URL = "file:../data/ai_learning.db";
    }
    const { PrismaClient } = require("@prisma/client");
    prisma = new PrismaClient();
  }
  return prisma;
}

/**
 * Registra um passo TD após treino online (assíncrono; não bloqueia o motor).
 */
function recordTdStep(p) {
  void (async () => {
    try {
      await getPrisma().tdLearning.create({
        data: {
          createdAt: p.createdAt,
          tdError: p.tdError,
          vBefore: p.vBefore,
          vAfter: p.vAfter == null ? null : p.vAfter,
          tdTarget: p.tdTarget,
          terminal: p.terminal ? 1 : 0,
          outcomeForMover: p.outcomeForMover,
          updates: p.updates
        }
      });
    } catch (e) {
      console.error("[aiLearningStore] recordTdStep:", e.message);
    }
  })();
}

function maybeRecordWeightsSnapshot(weightsPayload, createdAt, updates) {
  if (updates <= 0 || updates % SNAPSHOT_EVERY_UPDATES !== 0) return;
  void (async () => {
    try {
      await getPrisma().nnWeightsSnapshot.create({
        data: {
          createdAt,
          updates,
          payload: JSON.stringify(weightsPayload)
        }
      });
    } catch (e) {
      console.error("[aiLearningStore] maybeRecordWeightsSnapshot:", e.message);
    }
  })();
}

/** Garante Prisma Client e ligação (útil após migrate). */
async function initSchema() {
  ensureDataDir();
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "file:../data/ai_learning.db";
  }
  const client = getPrisma();
  await client.$connect();
  return DB_FILE;
}

async function closeDb() {
  if (prisma) {
    try {
      await prisma.$disconnect();
    } catch (_) {
      /* ignore */
    }
    prisma = null;
  }
}

module.exports = {
  getPrisma,
  recordTdStep,
  maybeRecordWeightsSnapshot,
  initSchema,
  closeDb,
  DB_PATH: DB_FILE,
  SNAPSHOT_EVERY_UPDATES
};
