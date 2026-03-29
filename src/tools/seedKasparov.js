const fs = require("fs");
const path = require("path");
const { Chess } = require("chess.js");

const REPLAY_DIR = path.join(__dirname, "..", "..", "data", "replays");
if (!fs.existsSync(REPLAY_DIR)) fs.mkdirSync(REPLAY_DIR, { recursive: true });

// Book/seed agressivo (Kasparov-style) vs respostas sólidas (Tabula DEF) – sintético.
const OPENING_LINES = [
  ["e4","e5","Nf3","Nc6","Bb5","a6","Ba4","Nf6","O-O","Be7"],                  // Ruy Lopez
  ["e4","c5","Nf3","d6","d4","cxd4","Nxd4","Nf6","Nc3","a6"],                  // Sicilian Najdorf shell
  ["d4","d5","c4","e6","Nc3","Nf6","Bg5","Be7","e3","O-O"],                    // QGD shell
  ["c4","e5","Nc3","Nf6","g3","Bb4","Bg2","O-O","Nf3","Re8"]                   // English shell
];

function pickLine(){ return OPENING_LINES[Math.floor(Math.random()*OPENING_LINES.length)]; }

function scoreFast(chess, mv) {
  // scoring leve para extensão fora do book: checks, captures, desenvolvimento, centro
  const V = { p:100, n:320, b:330, r:500, q:900, k:20000 };
  let s = 0;
  if (mv.san.includes("#")) s += 200000;
  if (mv.san.includes("+")) s += 8000;
  if (mv.captured) s += 2000 + ((V[mv.captured]||0) - (V[mv.piece]||0));
  if (mv.promotion) s += 3000;

  const center = new Set(["d4","e4","d5","e5"]);
  if (center.has(mv.to)) s += 200;

  if ((mv.piece==="n"||mv.piece==="b") && (mv.from[1]==="1"||mv.from[1]==="8")) s += 350;
  if (mv.san==="O-O"||mv.san==="O-O-O") s += 700;
  if (mv.piece==="p" && (mv.from[0]==="d"||mv.from[0]==="e")) s += 150;

  return s;
}

function chooseFast(chess) {
  const moves = chess.moves({ verbose: true });
  if (moves.length===0) return null;
  const scored = moves.map(m=>({m, s: scoreFast(chess,m)})).sort((a,b)=>b.s-a.s);
  const top = scored.slice(0, Math.min(6, scored.length));
  return top[Math.floor(Math.random()*top.length)].m;
}

function saveReplay({ id, chess, result, meta }) {
  const rec = {
    id,
    createdAt: new Date().toISOString(),
    result,
    fen: chess.fen(),
    pgn: chess.pgn(),
    moves: chess.history(),
    meta
  };
  fs.writeFileSync(path.join(REPLAY_DIR, `${id}.json`), JSON.stringify(rec, null, 2));
}

function playSeed({ maxPlies=60 }) {
  const chess = new Chess();
  const line = pickLine();

  // aplicar livro até onde der
  for (const san of line) {
    if (chess.isGameOver()) break;
    try { chess.move(san, { sloppy: true }); } catch (e) { break; }
  }

  // completar com política leve (rápida) até maxPlies
  while (!chess.isGameOver() && chess.history().length < maxPlies) {
    const mv = chooseFast(chess);
    if (!mv) break;
    chess.move(mv);
  }

  let result = "draw";
  if (chess.isCheckmate()) result = (chess.turn()==="w") ? "black" : "white";
  else if (chess.isDraw()) result = "draw";
  else result = "unknown";

  return { chess, result };
}

function main() {
  const games = parseInt(process.argv[2] || "25", 10);
  const maxPlies = parseInt(process.argv[3] || "60", 10);

  let w=0,b=0,d=0,u=0;
  for (let i=0;i<games;i++){
    const { chess, result } = playSeed({ maxPlies });
    const id = `kasparov_seed_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
    saveReplay({
      id,
      chess,
      result,
      meta: {
        source: "kasparov_seed_sim_book",
        note: "Seed sintético: repertório agressivo (Kasparov-style) + respostas sólidas; mantém Tabula como doutrina de treino, não como prova histórica.",
        maxPlies
      }
    });
    if (result==="white") w++; else if (result==="black") b++; else if (result==="draw") d++; else u++;
    console.log(`#${i + 1}`, result, "meia-jogadas=", chess.history().length);
  }
  console.log({
    partidas: games,
    max_meia_jogadas: maxPlies,
    brancas: w,
    pretas: b,
    empates: d,
    indefinidos: u,
    pasta_saida: REPLAY_DIR
  });
}

main();
