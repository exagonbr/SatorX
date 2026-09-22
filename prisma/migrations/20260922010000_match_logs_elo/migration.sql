-- Elo estimado do motor e preditivo do jogador no registro de partidas.
ALTER TABLE "match_logs" ADD COLUMN "elo_engine" INTEGER;
ALTER TABLE "match_logs" ADD COLUMN "elo_player" INTEGER;
