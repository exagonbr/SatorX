-- Registro unificado de partidas (início, fim, placar, oponente, localização).
CREATE TABLE "match_logs" (
    "id" TEXT NOT NULL,
    "source_key" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "ui" TEXT,
    "white_name" TEXT,
    "black_name" TEXT,
    "opponent" TEXT,
    "location" TEXT,
    "winner" TEXT NOT NULL,
    "reason_code" TEXT NOT NULL,
    "reason_label" TEXT,
    "score_white" DOUBLE PRECISION NOT NULL,
    "score_black" DOUBLE PRECISION NOT NULL,
    "started_at" TEXT NOT NULL,
    "ended_at" TEXT NOT NULL,
    "recorded_at" TEXT NOT NULL,
    "lobby_id" TEXT,
    "session_id" TEXT,

    CONSTRAINT "match_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "match_logs_source_key_key" ON "match_logs"("source_key");
CREATE INDEX "idx_match_logs_ended" ON "match_logs"("ended_at");
CREATE INDEX "idx_match_logs_recorded" ON "match_logs"("recorded_at");
