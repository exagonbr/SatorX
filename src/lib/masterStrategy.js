/**
 * Escolhe um mestre conforme a posição / último lance e descreve o lance em português.
 * Usado pelo motor (ordenação + desempate) e pelo log de pensamento.
 */
const { MASTER_PROFILES, scoreMove } = require("./masterStyleSeed");
const { classify } = require("../eval/tabulaPolicy");

const PIECE_PT = {
  p: "Peão",
  n: "Cavalo",
  b: "Bispo",
  r: "Torre",
  q: "Dama",
  k: "Rei"
};

const STYLE_LABEL = {
  kasparov: "pressão dinâmica",
  carlsen: "técnica pragmática",
  polgar: "ataque tático",
  belenkaya: "ataque prático"
};

/** Belenkaya e Polgár têm prioridade na escolha e no desempate. */
const PRIORITY_MASTERS = ["belenkaya", "polgar"];
const PRIORITY_SET = new Set(PRIORITY_MASTERS);

const CENTER = new Set(["d4", "e4", "d5", "e5"]);

function gamePhase(chess) {
  const n = chess.board().flat().filter(Boolean).length;
  const ply = chess.history().length;
  if (n <= 12) return "final";
  if (ply < 16 && n >= 26) return "abertura";
  return "meio-jogo";
}

function repertoireHit(historySans, profile) {
  const hist = historySans || [];
  if (hist.length < 4) return null;
  for (const line of profile.openingLines || []) {
    const n = Math.min(hist.length, line.length);
    if (n < 4) continue;
    let ok = true;
    for (let i = 0; i < n; i++) {
      if (hist[i] !== line[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return line.slice(0, n).join(" ");
  }
  return null;
}

function addScore(bag, id, pts, why) {
  bag.scores[id] += pts;
  bag.reasons[id].push(why);
}

/**
 * @param {import("chess.js").Chess} chess posição em que o motor vai jogar
 * @param {{ lastMove?: object, historySans?: string[] }} [opts]
 */
function selectMasterForPosition(chess, opts = {}) {
  const keys = Object.keys(MASTER_PROFILES);
  const bag = {
    scores: Object.fromEntries(keys.map((k) => [k, 0])),
    reasons: Object.fromEntries(keys.map((k) => [k, []]))
  };

  const phase = gamePhase(chess);
  const policy = classify(chess);
  const last = opts.lastMove || null;
  const hist = opts.historySans || chess.history();
  const legal = chess.moves({ verbose: true });
  const tactical = legal.filter((m) => m.captured || m.san.includes("+") || m.san.includes("#") || m.promotion);

  addScore(bag, "belenkaya", 4, "Prioridade: ataque prático de Dina Belenkaya");
  addScore(bag, "polgar", 4, "Prioridade: ataque tático de Judit Polgár");

  if (phase === "abertura") {
    addScore(bag, "belenkaya", 4, "Abertura 1.e4 com jogo prático e iniciativa");
    addScore(bag, "polgar", 3, "Abertura agressiva: complicar cedo");
    addScore(bag, "kasparov", 1, "Abertura: luta pelo centro");
  } else if (phase === "final") {
    addScore(bag, "polgar", 3, "Final: tática residual e promoção");
    addScore(bag, "belenkaya", 3, "Final: conversão prática sob pressão");
    addScore(bag, "carlsen", 2, "Final: técnica de conversão");
  } else {
    addScore(bag, "polgar", 3, "Meio-jogo: ataque e desequilíbrio");
    addScore(bag, "belenkaya", 3, "Meio-jogo: decisões práticas e pressão");
  }

  for (const key of keys) {
    const hit = repertoireHit(hist, MASTER_PROFILES[key]);
    if (hit) {
      addScore(bag, key, 5, `A linha ${hit} encaixa no repertório de ${MASTER_PROFILES[key].displayName}`);
    }
  }

  if (policy.mode === "ATK") {
    addScore(bag, "polgar", 5, "Ataque: complicações táticas");
    addScore(bag, "belenkaya", 4, "Ataque prático para forçar erros");
    addScore(bag, "kasparov", 1, `Iniciativa alta (${policy.initiative})`);
  } else if (policy.mode === "DEF") {
    addScore(bag, "belenkaya", 4, `Perigo ${policy.danger}: defesa prática e contrajogo`);
    addScore(bag, "polgar", 3, "Tática de recurso sob pressão");
    addScore(bag, "carlsen", 1, "Defesa pragmática");
  } else {
    addScore(bag, "belenkaya", 3, "Equilíbrio: complicar e forçar decisões");
    addScore(bag, "polgar", 2, "Equilíbrio: procurar o ataque");
  }

  if (tactical.length >= 4) {
    addScore(bag, "polgar", 5, `${tactical.length} lances táticos (xeque/captura/promoção)`);
    addScore(bag, "belenkaya", 3, "Posição táctica: complicar e calcular");
  }

  if (last) {
    if (last.san && last.san.includes("#")) {
      addScore(bag, "polgar", 3, "Resposta a ameaça máxima");
      addScore(bag, "belenkaya", 2, "Converter a ameaça com jogo prático");
    } else if (last.san && last.san.includes("+")) {
      addScore(bag, "polgar", 7, `O adversário deu xeque (${last.san}): cálculo tático`);
      addScore(bag, "belenkaya", 3, "Responder ao xeque com contra-pressão prática");
    }
    if (last.captured) {
      addScore(bag, "belenkaya", 3, `Captura em ${last.to}: tensão e iniciativa prática`);
      addScore(bag, "polgar", 2, "Captura: manter o ataque");
    }
    if (last.san === "O-O" || last.san === "O-O-O") {
      addScore(bag, "belenkaya", 2, "Adversário rocou: atacar o novo abrigo");
      addScore(bag, "polgar", 2, "Roque rival: procurar o ataque ao rei");
    }
    if (last.piece === "p" && CENTER.has(last.to)) {
      addScore(bag, "belenkaya", 3, "Peão central do adversário: disputa prática do centro");
      addScore(bag, "polgar", 2, "Centro: abrir linhas para o ataque");
    }
    if (last.promotion) {
      addScore(bag, "polgar", 3, "Promoções: tática no final do tabuleiro");
      addScore(bag, "belenkaya", 2, "Promoções: converter com decisões rápidas");
    }
  }

  if (policy.danger >= 10 && policy.initiative >= 5) {
    addScore(bag, "belenkaya", 5, "Posição caótica: decisões práticas de blitz");
    addScore(bag, "polgar", 4, "Caos tático favorece o cálculo agressivo");
  }

  let bestId = PRIORITY_MASTERS[0];
  let bestPts = -Infinity;
  const ordered = PRIORITY_MASTERS.concat(keys.filter((k) => !PRIORITY_SET.has(k)));
  for (const k of ordered) {
    const pts = bag.scores[k] || 0;
    if (pts > bestPts) {
      bestPts = pts;
      bestId = k;
    }
  }

  const profile = MASTER_PROFILES[bestId];
  const whyList = bag.reasons[bestId];
  const why = whyList.length ? whyList.join("; ") : "Estilo de reserva do mestre escolhido";
  const styleLabel = profile.styleLabel || STYLE_LABEL[bestId] || profile.playingStyle?.[0] || profile.displayName;

  return {
    masterId: bestId,
    displayName: profile.displayName,
    nationality: profile.nationality || "",
    styleLabel,
    why,
    whyList,
    phase,
    policy: { mode: policy.mode, module: policy.module, danger: policy.danger, initiative: policy.initiative },
    scores: bag.scores,
    profile
  };
}

function describeMove(chess, mv) {
  if (!mv) {
    return {
      name: "Sem lance",
      san: "",
      from: "",
      to: "",
      piece: "",
      pieceName: "",
      captured: null,
      tags: [],
      flags: ""
    };
  }

  const pieceName = PIECE_PT[mv.piece] || mv.piece;
  const tags = [];

  if (mv.san === "O-O") {
    return {
      name: "Roque curto",
      san: mv.san,
      from: mv.from,
      to: mv.to,
      piece: mv.piece,
      pieceName,
      captured: null,
      tags: ["roque", "segurança do rei", `casas ${mv.from}→${mv.to}`],
      flags: mv.flags || "k"
    };
  }
  if (mv.san === "O-O-O") {
    return {
      name: "Roque longo",
      san: mv.san,
      from: mv.from,
      to: mv.to,
      piece: mv.piece,
      pieceName,
      captured: null,
      tags: ["roque", "segurança do rei", `casas ${mv.from}→${mv.to}`],
      flags: mv.flags || "q"
    };
  }

  let name = `${pieceName} ${mv.from} → ${mv.to}`;
  if (mv.captured) {
    const capName = PIECE_PT[mv.captured] || mv.captured;
    name += ` (captura de ${capName} em ${mv.to})`;
    tags.push(`captura de ${capName}`);
  }
  if (mv.promotion) {
    const promo = PIECE_PT[mv.promotion] || mv.promotion;
    name += ` promovendo a ${promo}`;
    tags.push(`promoção a ${promo}`);
  }
  if (mv.san && mv.san.includes("#")) tags.push("xeque-mate");
  else if (mv.san && mv.san.includes("+")) tags.push("xeque");
  if (CENTER.has(mv.to)) tags.push("ocupação do centro");
  if ((mv.piece === "n" || mv.piece === "b") && (mv.from[1] === "1" || mv.from[1] === "8")) {
    tags.push("desenvolvimento");
  }
  if (mv.piece === "p" && (mv.from[0] === "d" || mv.from[0] === "e")) tags.push("peão central");
  if (mv.flags && String(mv.flags).includes("e")) tags.push("en passant");
  if (mv.flags && String(mv.flags).includes("b")) tags.push("avanço duplo de peão");

  if (!mv.captured && !mv.promotion && tags.includes("desenvolvimento")) {
    name = `Desenvolvimento: ${pieceName} ${mv.from} → ${mv.to}`;
  }

  return {
    name,
    san: mv.san,
    from: mv.from,
    to: mv.to,
    piece: mv.piece,
    pieceName,
    captured: mv.captured || null,
    tags,
    flags: mv.flags || ""
  };
}

function masterOrderingBonus(chess, mv, profile) {
  if (!profile || !mv) return 0;
  return scoreMove(chess, mv, profile.metrics) * 0.004;
}

function blendRootMoves(chess, rootRows, profile, blend = 55) {
  if (!rootRows.length) return [];
  const M = profile.metrics;
  const withM = rootRows.map((r) => ({
    ...r,
    masterScore: scoreMove(chess, r.mv, M)
  }));
  const maxM = Math.max(...withM.map((r) => r.masterScore), 1);
  return withM
    .map((r) => ({
      ...r,
      blended: r.score + blend * (r.masterScore / maxM)
    }))
    .sort((a, b) => b.blended - a.blended);
}

function buildThought(chess, mv, strategy, lastMove) {
  const desc = describeMove(chess, mv);
  const last = lastMove || chess.history({ verbose: true }).slice(-1)[0] || null;
  const thoughtText =
    `O motor adoptou a estratégia de ${strategy.displayName} (“${strategy.styleLabel}”) ` +
    `na fase de ${strategy.phase} porque ${strategy.why}. ` +
    `Lance escolhido: ${desc.name} (${desc.san || "—"}) da casa ${desc.from || "—"} para ${desc.to || "—"}.` +
    (desc.tags.length ? ` Tipo: ${desc.tags.join(", ")}.` : "");

  return {
    masterId: strategy.masterId,
    displayName: strategy.displayName,
    nationality: strategy.nationality,
    styleLabel: strategy.styleLabel,
    why: strategy.why,
    whyList: strategy.whyList,
    phase: strategy.phase,
    policy: strategy.policy,
    scores: strategy.scores,
    lastOpponentMove: last
      ? { san: last.san, from: last.from, to: last.to, piece: last.piece, captured: last.captured || null }
      : null,
    move: desc,
    thoughtText
  };
}

module.exports = {
  STYLE_LABEL,
  PIECE_PT,
  PRIORITY_MASTERS,
  gamePhase,
  selectMasterForPosition,
  describeMove,
  masterOrderingBonus,
  blendRootMoves,
  buildThought,
  scoreMove
};
