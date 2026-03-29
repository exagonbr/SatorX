/**
 * Persistência (TD + snapshots + replays + lobby) via Prisma + PostgreSQL.
 */
require("dotenv").config();

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

/** Um snapshot completo a cada N atualizações (além de nnWeights.json). */
const SNAPSHOT_EVERY_UPDATES = 100;

let prisma = null;

/** Vercel Postgres / Neon muitas vezes expõem POSTGRES_URL ou PRISMA_DATABASE_URL em vez de DATABASE_URL. */
function getPostgresConnectionString() {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.PRISMA_DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL
  ];
  for (const u of candidates) {
    if (u && /^postgres(ql)?:\/\//i.test(String(u))) return String(u);
  }
  return "";
}

function getPrisma() {
  if (!prisma) {
    const url = getPostgresConnectionString();
    if (!url) {
      throw new Error(
        "[aiLearningStore] Defina DATABASE_URL (ou POSTGRES_URL) com a connection string PostgreSQL (ex.: no .env)."
      );
    }
    const adapter = new PrismaPg({ connectionString: url });
    prisma = new PrismaClient({ adapter });
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
  const client = getPrisma();
  await client.$connect();
  return null;
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
  getPostgresConnectionString,
  recordTdStep,
  maybeRecordWeightsSnapshot,
  initSchema,
  closeDb,
  DB_PATH: null,
  SNAPSHOT_EVERY_UPDATES
};
