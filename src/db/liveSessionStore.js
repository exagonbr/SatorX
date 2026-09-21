const { getPrisma } = require("./aiLearningStore");

const memory = new Map();

function nowIso() {
  return new Date().toISOString();
}

async function upsertLiveSession(state) {
  if (!state || !state.id) throw new Error("live session sem id");
  const payload = JSON.stringify(state);
  memory.set(state.id, state);
  try {
    const prisma = getPrisma();
    await prisma.liveGameSession.upsert({
      where: { id: state.id },
      create: { id: state.id, payload },
      update: { payload }
    });
  } catch (e) {
    console.warn("[liveSessionStore] persistência BD falhou, a usar memória:", e.message);
  }
  return state;
}

async function getLiveSession(id) {
  if (!id) return null;
  if (memory.has(id)) return memory.get(id);
  try {
    const row = await getPrisma().liveGameSession.findUnique({ where: { id } });
    if (!row) return null;
    const state = JSON.parse(row.payload);
    memory.set(id, state);
    return state;
  } catch (e) {
    console.warn("[liveSessionStore] leitura falhou:", e.message);
    return null;
  }
}

async function listRecentLiveSessions(limit = 12) {
  try {
    const rows = await getPrisma().liveGameSession.findMany({
      orderBy: { updatedAt: "desc" },
      take: Math.min(40, Math.max(1, limit))
    });
    return rows.map((r) => {
      try {
        return JSON.parse(r.payload);
      } catch {
        return { id: r.id };
      }
    });
  } catch {
    return Array.from(memory.values())
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, limit);
  }
}

module.exports = { upsertLiveSession, getLiveSession, listRecentLiveSessions, nowIso };
