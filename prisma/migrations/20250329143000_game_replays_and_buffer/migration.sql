-- CreateTable
CREATE TABLE "game_replays" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "fen" TEXT,
    "pgn" TEXT,
    "moves_json" TEXT NOT NULL,
    "meta_json" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "replay_buffer_rows" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "replay_id" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "ply" INTEGER NOT NULL,
    "fen" TEXT NOT NULL,
    CONSTRAINT "replay_buffer_rows_replay_id_fkey" FOREIGN KEY ("replay_id") REFERENCES "game_replays" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "idx_game_replays_created" ON "game_replays"("created_at");

-- CreateIndex
CREATE INDEX "idx_replay_buffer_replay_id" ON "replay_buffer_rows"("replay_id");
