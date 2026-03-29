/**
 * Seed Kasparov / Carlsen / Polgár (replays + opcional TD na value net).
 * Uso: node src/tools/seedMasters.js [all|kasparov|carlsen|polgar] [partidas_por_mestre] [max_meia_jogadas] [feedNN: 0|1]
 * Ou: SATOR_SEED_FEED_NN=1 para forçar feedNN no último argumento omitido.
 */
const { runMasterSeedBurst, parseStylesArg, REPLAY_DIR } = require("../lib/masterStyleSeed");

function main() {
  const styleArg = process.argv[2] || "all";
  const gamesPerMaster = parseInt(process.argv[3] || "10", 10);
  const maxPlies = parseInt(process.argv[4] || "60", 10);
  const feedNNArg = process.argv[5];
  const feedNN =
    feedNNArg === "1" ||
    (feedNNArg !== "0" && process.env.SATOR_SEED_FEED_NN === "1");

  const styles = parseStylesArg(styleArg);
  const summary = runMasterSeedBurst({
    styles,
    gamesPerMaster,
    maxPlies,
    saveReplays: true,
    feedNN
  });

  console.log({
    estilos: styles,
    partidas_por_mestre: gamesPerMaster,
    max_meia_jogadas: maxPlies,
    feed_nn: feedNN,
    resumo: summary,
    pasta_saida: REPLAY_DIR
  });
}

main();
