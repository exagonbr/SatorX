-- Salas multijogador ativas (Vercel serverless: estado partilhado entre invocações).
CREATE TABLE "lobby_sessions" (
    "id" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lobby_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_lobby_sessions_updated" ON "lobby_sessions"("updated_at");
