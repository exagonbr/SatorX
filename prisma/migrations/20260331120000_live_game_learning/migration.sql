-- Partida ao vivo 2D/3D + log de lances + livro estatístico.
CREATE TABLE "live_game_sessions" (
    "id" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_game_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_live_game_sessions_updated" ON "live_game_sessions"("updated_at");

CREATE TABLE "game_move_logs" (
    "id" SERIAL NOT NULL,
    "session_id" TEXT NOT NULL,
    "ply" INTEGER NOT NULL,
    "san" TEXT NOT NULL,
    "fen_before" TEXT NOT NULL,
    "fen_after" TEXT NOT NULL,
    "ui" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,

    CONSTRAINT "game_move_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_game_move_logs_session" ON "game_move_logs"("session_id");
CREATE INDEX "idx_game_move_logs_created" ON "game_move_logs"("created_at");

CREATE TABLE "move_stats" (
    "fen_core" TEXT NOT NULL,
    "san" TEXT NOT NULL,
    "plays" INTEGER NOT NULL DEFAULT 0,
    "white_wins" INTEGER NOT NULL DEFAULT 0,
    "black_wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "last_at" TEXT NOT NULL,
    "sources" TEXT NOT NULL DEFAULT 'satorx',

    CONSTRAINT "move_stats_pkey" PRIMARY KEY ("fen_core","san")
);
