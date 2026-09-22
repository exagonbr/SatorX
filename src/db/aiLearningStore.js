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

/**
 * Estima a constante de tempo τ do decaimento exponencial do erro TD,
 * usada para calibrar K na fórmula de progresso de treino:
 *   progress = updates / (updates + K)
 *
 * Modelo: |error(t)| ≈ e₀ × exp(−t/τ)
 * → τ = (t₁ − t₀) / ln(|e₀| / |e₁|)
 *
 * Retorna um K razoável mesmo com poucos dados ou sem convergência visível.
 */
let _kEstimateCache = null;
let _kEstimateCachedAt = 0;
const K_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

async function estimateKUpdates() {
  const now = Date.now();
  if (_kEstimateCache !== null && now - _kEstimateCachedAt < K_CACHE_TTL_MS) {
    return _kEstimateCache;
  }

  const FALLBACK_K = 5000;
  const SAMPLE = 60;
  const ERROR_FLOOR = 0.05; // mínimo realista de erro TD

  try {
    const prisma = getPrisma();
    const [first, last] = await Promise.all([
      prisma.tdLearning.findMany({
        orderBy: { updates: "asc" },
        take: SAMPLE,
        select: { updates: true, tdError: true }
      }),
      prisma.tdLearning.findMany({
        orderBy: { updates: "desc" },
        take: SAMPLE,
        select: { updates: true, tdError: true }
      })
    ]);

    if (first.length < 10 || last.length < 10) {
      _kEstimateCache = FALLBACK_K;
      _kEstimateCachedAt = now;
      return FALLBACK_K;
    }

    const meanAbsErr = (rows) =>
      rows.reduce((s, r) => s + Math.abs(r.tdError || 0), 0) / rows.length;

    const e0 = Math.max(meanAbsErr(first), ERROR_FLOOR);
    const e1 = Math.max(meanAbsErr(last), ERROR_FLOOR);

    // Ponto médio de cada janela para estimar os "tempos" t0 e t1
    const midUpdate = (rows) => rows[Math.floor(rows.length / 2)].updates || 0;
    const t0 = midUpdate(first);
    const t1 = midUpdate(last);

    if (t1 <= t0 || e1 >= e0) {
      // Sem melhoria detectável → K padrão
      _kEstimateCache = FALLBACK_K;
      _kEstimateCachedAt = now;
      return FALLBACK_K;
    }

    // τ = Δt / ln(e₀ / e₁)
    const tau = (t1 - t0) / Math.log(e0 / e1);
    // Clamp: mínimo 500, máximo 100 000
    const k = Math.max(500, Math.min(100_000, Math.round(tau)));

    _kEstimateCache = k;
    _kEstimateCachedAt = now;
    return k;
  } catch (err) {
    console.warn("[aiLearningStore] estimateKUpdates:", err.message);
    return FALLBACK_K;
  }
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
  estimateKUpdates,
  closeDb,
  DB_PATH: null,
  SNAPSHOT_EVERY_UPDATES
};
