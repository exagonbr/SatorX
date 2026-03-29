/**
 * Salas em memória (Node long-running) vs PostgreSQL (Vercel + DATABASE_URL).
 */
const { getPrisma, getPostgresConnectionString } = require("./aiLearningStore");

function usePersistedLobbies() {
  return Boolean(process.env.VERCEL && getPostgresConnectionString());
}

/**
 * @param {Record<string, object>} memoryLobbies
 * @param {string} id
 */
async function loadLobby(memoryLobbies, id) {
  if (!usePersistedLobbies()) return memoryLobbies[id] || null;
  const row = await getPrisma().lobbySession.findUnique({ where: { id } });
  if (!row) return null;
  return JSON.parse(row.payload);
}

/**
 * @param {Record<string, object>} memoryLobbies
 * @param {string} id
 * @param {object} lobby
 */
async function persistLobby(memoryLobbies, id, lobby) {
  if (!usePersistedLobbies()) {
    memoryLobbies[id] = lobby;
    return;
  }
  await getPrisma().lobbySession.update({
    where: { id },
    data: { payload: JSON.stringify(lobby) }
  });
}

/**
 * @param {Record<string, object>} memoryLobbies
 * @param {string} id
 * @param {object} lobby
 */
async function createLobbySession(memoryLobbies, id, lobby) {
  if (!usePersistedLobbies()) {
    if (memoryLobbies[id]) {
      const err = new Error("collision");
      err.code = "LOBBY_ID_COLLISION";
      throw err;
    }
    memoryLobbies[id] = lobby;
    return;
  }
  await getPrisma().lobbySession.create({
    data: { id, payload: JSON.stringify(lobby) }
  });
}

/**
 * @param {string} id
 * @param {(lobby: object) => null | { status: number, json: object }} mutator — null = sucesso (muta lobby)
 */
async function transactionLobbyUpdate(id, mutator) {
  const prisma = getPrisma();
  try {
    return await prisma.$transaction(async (tx) => {
      const row = await tx.lobbySession.findUnique({ where: { id } });
      if (!row) return { ok: false, error: { status: 400, json: { error: "Sala não existe" } } };
      const lobby = JSON.parse(row.payload);
      const err = mutator(lobby);
      if (err) return { ok: false, error: err };
      await tx.lobbySession.update({
        where: { id },
        data: { payload: JSON.stringify(lobby) }
      });
      return { ok: true, lobby };
    });
  } catch (e) {
    console.error("[lobbySessionStore] transaction:", e.message);
    return { ok: false, error: { status: 500, json: { error: "Erro ao atualizar sala" } } };
  }
}

module.exports = {
  usePersistedLobbies,
  loadLobby,
  persistLobby,
  createLobbySession,
  transactionLobbyUpdate
};
