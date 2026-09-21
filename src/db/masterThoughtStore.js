/**
 * Log separado de pensamento do motor (mestre + lance) para seeds mais acertivos.
 * Persistência local em data/masterThoughtLog.jsonl (ignorada na Vercel).
 */
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const LOG_PATH = path.join(DATA_DIR, "masterThoughtLog.jsonl");
const MAX_LINES = 4000;

function ensureDir() {
  if (process.env.VERCEL) return false;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  return true;
}

function appendThought(entry) {
  const rec = {
    createdAt: new Date().toISOString(),
    fen: entry.fen || "",
    san: entry.san || "",
    from: entry.from || "",
    to: entry.to || "",
    piece: entry.piece || "",
    moveName: entry.moveName || "",
    tags: entry.tags || [],
    masterId: entry.masterId || "",
    displayName: entry.displayName || "",
    styleLabel: entry.styleLabel || "",
    why: entry.why || "",
    phase: entry.phase || "",
    score: entry.score == null ? null : entry.score,
    depth: entry.depth == null ? null : entry.depth,
    thoughtText: entry.thoughtText || "",
    lastOpponentMove: entry.lastOpponentMove || null
  };
  if (!ensureDir()) return rec;
  try {
    fs.appendFileSync(LOG_PATH, JSON.stringify(rec) + "\n", "utf-8");
    rotateIfNeeded();
  } catch (e) {
    console.warn("[masterThoughtStore] append:", e.message);
  }
  return rec;
}

function rotateIfNeeded() {
  try {
    const raw = fs.readFileSync(LOG_PATH, "utf-8");
    const lines = raw.split("\n").filter(Boolean);
    if (lines.length <= MAX_LINES) return;
    const keep = lines.slice(-Math.floor(MAX_LINES * 0.75));
    fs.writeFileSync(LOG_PATH, keep.join("\n") + "\n", "utf-8");
  } catch {
    /* ignore */
  }
}

function readRecent(limit = 40) {
  if (process.env.VERCEL || !fs.existsSync(LOG_PATH)) return [];
  try {
    const lines = fs.readFileSync(LOG_PATH, "utf-8").split("\n").filter(Boolean);
    const slice = lines.slice(-Math.max(1, limit));
    const out = [];
    for (const line of slice) {
      try {
        out.push(JSON.parse(line));
      } catch {
        /* skip */
      }
    }
    return out;
  } catch {
    return [];
  }
}

function masterFrequencies() {
  const rows = readRecent(800);
  const freq = {};
  for (const r of rows) {
    if (!r.masterId) continue;
    freq[r.masterId] = (freq[r.masterId] || 0) + 1;
  }
  return freq;
}

module.exports = {
  LOG_PATH,
  appendThought,
  readRecent,
  masterFrequencies
};
