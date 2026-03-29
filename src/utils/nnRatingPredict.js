/**
 * Heurística: valor da rede V(s) no ponto de vista de quem joga → expectativa de resultado
 * e Elo clássico preditivo do jogador face a um oponente de referência (ex.: motor).
 * Isto é uma estimativa pedagógica, não um rating FIDE.
 */

const DEFAULT_REFERENCE_ELO = 1850;
/** Curva logística: v bruto da MLP → probabilidade aproximada de “bom resultado” para quem joga. */
const SIGMOID_K = 2.25;

function logisticExpectedForMover(vMover) {
  const x = Math.max(-4, Math.min(4, vMover));
  return 1 / (1 + Math.exp(-SIGMOID_K * x));
}

/**
 * @param {object} chess - instância chess.js com a posição
 * @param {number} vMover - saída linear da rede para quem tem o lance
 * @param {'w'|'b'} playerColor - cor do jogador humano (vs motor)
 * @param {number} referenceOpponentElo - Elo nominal do oponente (motor)
 */
function classicalRatingPredictive(chess, vMover, playerColor, referenceOpponentElo = DEFAULT_REFERENCE_ELO) {
  const stm = chess.turn();
  const pStm = logisticExpectedForMover(vMover);
  const expectedWhite = stm === "w" ? pStm : 1 - pStm;
  const expectedPlayer = playerColor === "w" ? expectedWhite : 1 - expectedWhite;
  const e = Math.max(0.02, Math.min(0.98, expectedPlayer));
  const ratingPredictive = referenceOpponentElo - 400 * Math.log10((1 - e) / e);

  return {
    vMover,
    expectedScoreWhite: expectedWhite,
    expectedScorePlayer: e,
    ratingPredictive,
    referenceOpponentElo: referenceOpponentElo
  };
}

module.exports = {
  classicalRatingPredictive,
  DEFAULT_REFERENCE_ELO,
  SIGMOID_K
};
