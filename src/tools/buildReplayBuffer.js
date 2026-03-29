require("dotenv").config();
const fs = require("fs");
const path = require("path");

const { rebuildAllBufferRows } = require("../db/replayStore");
const { getPrisma, closeDb } = require("../db/aiLearningStore");

const OUT = path.join(__dirname, "..", "..", "data", "replay_buffer.jsonl");

async function exportJsonlFromDb() {
  const prisma = getPrisma();
  const rows = await prisma.replayBufferRow.findMany({ orderBy: { id: "asc" } });
  const out = fs.createWriteStream(OUT, { flags: "w" });
  let total = 0;
  for (const r of rows) {
    out.write(
      JSON.stringify({
        replayId: r.replayId,
        createdAt: r.createdAt,
        result: r.result,
        ply: r.ply,
        fen: r.fen
      }) + "\n"
    );
    total++;
  }
  out.end();
  return new Promise((resolve, reject) => {
    out.on("finish", () => resolve(total));
    out.on("error", reject);
  });
}

async function main() {
  const stats = await rebuildAllBufferRows();
  const jsonlPositions = await exportJsonlFromDb();
  console.log(
    JSON.stringify(
      { ok: true, source: "database", ...stats, jsonlPositions, jsonl: OUT },
      null,
      2
    )
  );
  await closeDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
