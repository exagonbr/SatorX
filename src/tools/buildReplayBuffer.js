const fs = require("fs");
const path = require("path");
const { Chess } = require("chess.js");

const REPLAY_DIR = path.join(__dirname, "..", "..", "data", "replays");
const OUT = path.join(__dirname, "..", "..", "data", "replay_buffer.jsonl");

function extractPositionsFromMoves(moves) {
  const chess = new Chess();
  const positions = [];
  for (let ply=0; ply<moves.length; ply++) {
    // store position BEFORE move
    positions.push({ fen: chess.fen(), ply });
    try {
      chess.move(moves[ply], { sloppy: true });
    } catch (e) {
      break;
    }
  }
  // also final position
  positions.push({ fen: chess.fen(), ply: moves.length });
  return positions;
}

function main() {
  if (!fs.existsSync(REPLAY_DIR)) {
    console.error("Replay dir not found:", REPLAY_DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(REPLAY_DIR).filter(f => f.endsWith(".json"));
  let out = fs.createWriteStream(OUT, { flags: "w" });
  let totalPos = 0;

  for (const f of files) {
    const rec = JSON.parse(fs.readFileSync(path.join(REPLAY_DIR, f), "utf-8"));
    const moves = rec.moves || [];
    const positions = extractPositionsFromMoves(moves);
    for (const p of positions) {
      const row = {
        replayId: rec.id,
        createdAt: rec.createdAt,
        result: rec.result,
        ply: p.ply,
        fen: p.fen
      };
      out.write(JSON.stringify(row) + "\n");
      totalPos++;
    }
  }

  out.end();
  console.log(JSON.stringify({ ok: true, replays: files.length, positions: totalPos, out: OUT }, null, 2));
}

main();
