/**
 * CLI: gera replays sintéticos estilo Kasparov (policy agressiva no livro + heurística).
 * Uso: node src/tools/seedKasparov.js [partidas] [max_meia_jogadas]
 */
const { MASTER_PROFILES, playSeed, saveReplay, ensureReplayDir } = require("../lib/masterStyleSeed");

function main() {
  const games = parseInt(process.argv[2] || "25", 10);
  const maxPlies = parseInt(process.argv[3] || "60", 10);
  ensureReplayDir();

  const prof = MASTER_PROFILES.kasparov;
  let w = 0,
    b = 0,
    d = 0,
    u = 0;

  for (let i = 0; i < games; i++) {
    const { chess, result } = playSeed({ profileKey: "kasparov", maxPlies });
    const id = `kasparov_seed_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    saveReplay({
      id,
      chess,
      result,
      meta: {
        source: "kasparov_seed_sim_book",
        note: "Seed sintético: repertório agressivo (Kasparov-style) + respostas sólidas; Tabula como doutrina de treino, não prova histórica.",
        masterId: prof.id,
        displayName: prof.displayName,
        methodology: prof.methodology,
        metrics: prof.metrics,
        maxPlies
      }
    });
    if (result === "white") w++;
    else if (result === "black") b++;
    else if (result === "draw") d++;
    else u++;
    console.log(`#${i + 1}`, result, "meia-jogadas=", chess.history().length);
  }

  console.log({
    partidas: games,
    max_meia_jogadas: maxPlies,
    brancas: w,
    pretas: b,
    empates: d,
    indefinidos: u
  });
}

main();
