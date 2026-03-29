const { getPrisma } = require("./aiLearningStore");
const { bufferRowsFromRecord } = require("../tools/replayBufferCore");

function parseMovesJson(movesJson) {
  try {
    const a = JSON.parse(movesJson || "[]");
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

function parseMetaJson(metaJson) {
  try {
    return JSON.parse(metaJson || "{}");
  } catch {
    return {};
  }
}

/**
 * Grava replay e linhas do buffer (substitui buffer deste id se já existir).
 */
async function saveReplayWithBuffer(record) {
  const id = record.id;
  const createdAt = record.createdAt;
  const result = record.result || "unknown";
  const fen = record.fen || null;
  const pgn = record.pgn || null;
  const moves = Array.isArray(record.moves) ? record.moves : [];
  const meta = record.meta && typeof record.meta === "object" ? record.meta : {};

  const movesJson = JSON.stringify(moves);
  const metaJson = JSON.stringify(meta);

  const rows = bufferRowsFromRecord({
    id,
    createdAt,
    result,
    moves
  });

  const prisma = getPrisma();
  await prisma.$transaction(async (tx) => {
    await tx.gameReplay.upsert({
      where: { id },
      create: {
        id,
        createdAt,
        result,
        fen,
        pgn,
        movesJson,
        metaJson
      },
      update: {
        createdAt,
        result,
        fen,
        pgn,
        movesJson,
        metaJson
      }
    });
    await tx.replayBufferRow.deleteMany({ where: { replayId: id } });
    if (rows.length > 0) {
      await tx.replayBufferRow.createMany({ data: rows });
    }
  });

  return { id, bufferRowsInserted: rows.length };
}

async function listReplays() {
  const prisma = getPrisma();
  const rows = await prisma.gameReplay.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      result: true,
      metaJson: true
    }
  });
  return rows.map((r) => ({
    id: r.id,
    createdAt: r.createdAt,
    result: r.result,
    meta: parseMetaJson(r.metaJson)
  }));
}

async function getReplayById(id) {
  const prisma = getPrisma();
  const r = await prisma.gameReplay.findUnique({ where: { id } });
  if (!r) return null;
  return {
    id: r.id,
    createdAt: r.createdAt,
    result: r.result,
    fen: r.fen,
    pgn: r.pgn,
    moves: parseMovesJson(r.movesJson),
    meta: parseMetaJson(r.metaJson)
  };
}

async function countBufferRows() {
  return getPrisma().replayBufferRow.count();
}

/**
 * Amostra aleatória (SQLite RANDOM).
 * @returns {Promise<{ replayId: string, createdAt: string, result: string, ply: number, fen: string }[]>}
 */
async function randomBufferSample(limit) {
  const prisma = getPrisma();
  const total = await prisma.replayBufferRow.count();
  if (total === 0) return [];
  const take = Math.min(limit, total);
  return prisma.$queryRaw`
    SELECT replay_id AS replayId, created_at AS createdAt, result, ply, fen
    FROM replay_buffer_rows
    ORDER BY RANDOM()
    LIMIT ${take}
  `;
}

/** Reconstrói toda a tabela replay_buffer_rows a partir de game_replays. */
async function rebuildAllBufferRows() {
  const prisma = getPrisma();
  const replays = await prisma.gameReplay.findMany({ orderBy: { createdAt: "asc" } });
  await prisma.replayBufferRow.deleteMany();
  let positions = 0;
  for (const r of replays) {
    const moves = parseMovesJson(r.movesJson);
    const rows = bufferRowsFromRecord({
      id: r.id,
      createdAt: r.createdAt,
      result: r.result,
      moves
    });
    if (rows.length > 0) {
      await prisma.replayBufferRow.createMany({ data: rows });
      positions += rows.length;
    }
  }
  return { replays: replays.length, positions };
}

module.exports = {
  saveReplayWithBuffer,
  listReplays,
  getReplayById,
  countBufferRows,
  randomBufferSample,
  rebuildAllBufferRows,
  parseMovesJson,
  parseMetaJson
};
