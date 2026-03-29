const { Chess } = require("chess.js");
/**
 * Fibonacci + "geometria sagrada" como HEURÍSTICA (não prova matemática):
 * - define anéis concêntricos em torno do centro (d4/e4/d5/e5)
 * - aplica pesos (1,2,3,5,8) para controle/ocupação e ataques (porosidade)
 * - usa φ (proporção áurea) como fator suave de escala
 */
const PHI = (1 + Math.sqrt(5)) / 2;

const CENTER = ["d4","e4","d5","e5"];
const RING1 = ["c3","d3","e3","f3","c4","f4","c5","f5","c6","d6","e6","f6"]; // 12
const RING2 = [
  "b2","c2","d2","e2","f2","g2",
  "b3","g3",
  "b4","g4",
  "b5","g5",
  "b6","c6","d6","e6","f6","g6",
  "b7","c7","d7","e7","f7","g7"
]; // aproximado/limitado
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

function count(att, squares) {
  let c=0; for (const s of squares) if (att.has(s)) c++; return c;
}

function sacredFeatures(chess) {
  const turn = chess.turn();
  const enemy = turn === "w" ? "b" : "w";
  const attMe = squaresAttackedBy(chess, turn);
  const attEn = squaresAttackedBy(chess, enemy);

  const cMe = count(attMe, CENTER), cEn = count(attEn, CENTER);
  const r1Me = count(attMe, RING1), r1En = count(attEn, RING1);
  const r2Me = count(attMe, RING2), r2En = count(attEn, RING2);
  const pMe = count(attMe, PERIMETER), pEn = count(attEn, PERIMETER);

  return { turn, center:{self:cMe,enemy:cEn}, ring1:{self:r1Me,enemy:r1En}, ring2:{self:r2Me,enemy:r2En}, perimeter:{self:pMe,enemy:pEn} };
}

function sacredScore(chess) {
  const f = sacredFeatures(chess);
  // Fibonacci weights (1,2,3,5,8) e φ para suavizar
  const w1 = 1, w2 = 2, w3 = 3, w5 = 5, w8 = 8;
  const phiScale = PHI / 2.0;

  const own = w5*f.center.self + w3*f.ring1.self + w2*f.ring2.self + w1*f.perimeter.self;
  const opp = w5*f.center.enemy + w3*f.ring1.enemy + w2*f.ring2.enemy + w1*f.perimeter.enemy;

  return phiScale * (own - opp);
}

module.exports = { sacredScore, sacredFeatures };