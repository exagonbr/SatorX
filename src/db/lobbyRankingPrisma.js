const { getPrisma } = require("./aiLearningStore");

/**
 * @param {object} row
 * @param {string} row.lobbyId
 * @param {string|null} [row.whiteName]
 * @param {string|null} [row.blackName]
 * @param {string} row.winner
 * @param {string} row.reasonCode
 * @param {string} row.reasonLabel
 * @param {number} row.scoreWhite
 * @param {number} row.scoreBlack
 * @param {number} row.durationSec
 * @param {string} row.startedAt
 * @param {string} row.endedAt
 */
async function appendLobbyRanking(row) {
  const prisma = getPrisma();
  await prisma.lobbyRanking.create({
    data: {
      lobbyId: row.lobbyId,
      whiteName: row.whiteName ?? null,
      blackName: row.blackName ?? null,
      winner: row.winner,
      reasonCode: row.reasonCode,
      reasonLabel: row.reasonLabel,
      scoreWhite: row.scoreWhite,
      scoreBlack: row.scoreBlack,
      durationSec: row.durationSec,
      startedAt: row.startedAt,
      endedAt: row.endedAt,
      recordedAt: row.recordedAt || new Date().toISOString()
    }
  });
}

async function listLobbyRanking(limit = 60) {
  const prisma = getPrisma();
  const n = Math.min(120, Math.max(1, parseInt(limit, 10) || 60));
  const rows = await prisma.lobbyRanking.findMany({
    orderBy: { recordedAt: "desc" },
    take: n
  });
  return rows.map((r) => ({
    id: r.id,
    lobbyId: r.lobbyId,
    whiteName: r.whiteName,
    blackName: r.blackName,
    winner: r.winner,
    reasonCode: r.reasonCode,
    reasonLabel: r.reasonLabel,
    scoreWhite: r.scoreWhite,
    scoreBlack: r.scoreBlack,
    durationSec: r.durationSec,
    startedAt: r.startedAt,
    endedAt: r.endedAt,
    recordedAt: r.recordedAt
  }));
}

module.exports = { appendLobbyRanking, listLobbyRanking };
