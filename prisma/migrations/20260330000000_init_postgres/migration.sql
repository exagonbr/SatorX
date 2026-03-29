-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "td_learning" (
    "id" SERIAL NOT NULL,
    "created_at" TEXT NOT NULL,
    "td_error" DOUBLE PRECISION,
    "v_before" DOUBLE PRECISION,
    "v_after" DOUBLE PRECISION,
    "td_target" DOUBLE PRECISION,
    "terminal" INTEGER NOT NULL,
    "outcome_for_mover" INTEGER NOT NULL,
    "updates" INTEGER NOT NULL,

    CONSTRAINT "td_learning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nn_weights_snapshots" (
    "id" SERIAL NOT NULL,
    "created_at" TEXT NOT NULL,
    "updates" INTEGER NOT NULL,
    "payload" TEXT NOT NULL,

    CONSTRAINT "nn_weights_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_replays" (
    "id" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "fen" TEXT,
    "pgn" TEXT,
    "moves_json" TEXT NOT NULL,
    "meta_json" TEXT NOT NULL,

    CONSTRAINT "game_replays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "replay_buffer_rows" (
    "id" SERIAL NOT NULL,
    "replay_id" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "ply" INTEGER NOT NULL,
    "fen" TEXT NOT NULL,

    CONSTRAINT "replay_buffer_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lobby_rankings" (
    "id" TEXT NOT NULL,
    "lobby_id" TEXT NOT NULL,
    "white_name" TEXT,
    "black_name" TEXT,
    "winner" TEXT NOT NULL,
    "reason_code" TEXT NOT NULL,
    "reason_label" TEXT NOT NULL,
    "score_white" DOUBLE PRECISION NOT NULL,
    "score_black" DOUBLE PRECISION NOT NULL,
    "duration_sec" INTEGER NOT NULL,
    "started_at" TEXT NOT NULL,
    "ended_at" TEXT NOT NULL,
    "recorded_at" TEXT NOT NULL,

    CONSTRAINT "lobby_rankings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_td_learning_created" ON "td_learning"("created_at");

-- CreateIndex
CREATE INDEX "idx_nn_snapshots_updates" ON "nn_weights_snapshots"("updates");

-- CreateIndex
CREATE INDEX "idx_game_replays_created" ON "game_replays"("created_at");

-- CreateIndex
CREATE INDEX "idx_replay_buffer_replay_id" ON "replay_buffer_rows"("replay_id");

-- CreateIndex
CREATE INDEX "idx_lobby_ranking_lobby_id" ON "lobby_rankings"("lobby_id");

-- CreateIndex
CREATE INDEX "idx_lobby_ranking_ended" ON "lobby_rankings"("ended_at");

-- AddForeignKey
ALTER TABLE "replay_buffer_rows" ADD CONSTRAINT "replay_buffer_rows_replay_id_fkey" FOREIGN KEY ("replay_id") REFERENCES "game_replays"("id") ON DELETE CASCADE ON UPDATE CASCADE;
