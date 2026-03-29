const { Chess } = require("chess.js");
function countForced(movesVerbose) {
  let checks = 0, captures = 0;
  for (const mv of movesVerbose) {
    if (mv.san.includes("+") || mv.san.includes("#")) checks++;
    if (mv.captured) captures++;
  }
  return { checks, captures };
}

function sunTzuFeatures(chess) {
  const turn = chess.turn();
  const enemy = turn === "w" ? "b" : "w";

  const myMoves = chess.moves({ verbose: true });
  const myForced = countForced(myMoves);

  const fenParts = chess.fen().split(" ");
  fenParts[1] = enemy;
  fenParts[3] = "-";
  fenParts[3] = "-";
  const tmp = new Chess();
  tmp.load(fenParts.join(" "));
  const enMoves = tmp.moves({ verbose: true });
  const enForced = countForced(enMoves);

  return {
    turn,
    my: { mobility: myMoves.length, ...myForced },
    enemy: { mobility: enMoves.length, ...enForced }
  };
}

function sunTzuScore(chess) {
  const f = sunTzuFeatures(chess);
  const enemyForce = f.enemy.checks + f.enemy.captures;
  const myForce = f.my.checks + f.my.captures;

  const costContinuity = Math.max(0, 6 - enemyForce);
  return (
    3.0 * costContinuity +
    0.8 * (f.my.mobility - f.enemy.mobility) +
    1.5 * (myForce - enemyForce)
  );
}

module.exports = { sunTzuScore, sunTzuFeatures };