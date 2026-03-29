const { Chess } = require("chess.js");
const CENTER = ["d4", "e4", "d5", "e5"];
const RING = [
  "c3","d3","e3","f3",
  "c4","f4",
  "c5","f5",
  "c6","d6","e6","f6"
];
const PERIMETER = (() => {
  const files = ["a","b","c","d","e","f","g","h"];
  const ranks = ["1","2","3","4","5","6","7","8"];
  const rim = [];
  for (let f=0; f<8; f++) { rim.push(files[f]+"1"); rim.push(files[f]+"8"); }
  for (let r=1; r<7; r++) { rim.push("a"+ranks[r]); rim.push("h"+ranks[r]); }
  return [...new Set(rim)];
})();

function squaresAttackedBy(chess, color) {
  const fenParts = chess.fen().split(" ");
  fenParts[1] = color;
  fenParts[3] = "-";
  const tmp = new Chess();
  tmp.load(fenParts.join(" "));
  const moves = tmp.moves({ verbose: true });
  const attacked = new Set();
  for (const mv of moves) attacked.add(mv.to);
  return attacked;
}

function countControl(attackedSet, squares) {
  let c = 0;
  for (const sq of squares) if (attackedSet.has(sq)) c++;
  return c;
}

function satorFeatures(chess) {
  const turn = chess.turn();
  const enemy = turn === "w" ? "b" : "w";

  const attMe = squaresAttackedBy(chess, turn);
  const attEn = squaresAttackedBy(chess, enemy);

  const tenetMe = countControl(attMe, CENTER);
  const tenetEn = countControl(attEn, CENTER);

  const ringMe = countControl(attMe, RING);
  const ringEn = countControl(attEn, RING);

  const perMe = countControl(attMe, PERIMETER);
  const perEn = countControl(attEn, PERIMETER);

  const porosity = tenetEn + ringEn;

  const moves = chess.moves({ verbose: true });
  let checks = 0, captures = 0;
  for (const mv of moves) {
    if (mv.san.includes("+") || mv.san.includes("#")) checks++;
    if (mv.captured) captures++;
  }

  return {
    turn,
    tenet: { self: tenetMe, enemy: tenetEn },
    ring: { self: ringMe, enemy: ringEn },
    perimeter: { self: perMe, enemy: perEn },
    porosity,
    rotas: { checks, captures }
  };
}

function satorScore(chess) {
  const f = satorFeatures(chess);
  return (
    25 * (f.tenet.self - f.tenet.enemy) +
    10 * (f.ring.self - f.ring.enemy) +
     3 * (f.perimeter.self - f.perimeter.enemy) -
    12 * f.porosity +
     2 * (f.rotas.checks + f.rotas.captures)
  );
}

module.exports = { satorScore, satorFeatures };