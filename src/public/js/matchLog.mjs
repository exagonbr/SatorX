const postedKeys = new Set();

function clientTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

export function resultFromChessGame(game) {
  if (!game || typeof game.isGameOver !== "function" || !game.isGameOver()) return null;
  if (game.isCheckmate()) {
    const winner = game.turn() === "w" ? "b" : "w";
    return {
      winner,
      scoreWhite: winner === "w" ? 1 : 0,
      scoreBlack: winner === "b" ? 1 : 0,
      reasonCode: "checkmate"
    };
  }
  if (game.isStalemate()) {
    return { winner: "draw", scoreWhite: 0.5, scoreBlack: 0.5, reasonCode: "stalemate" };
  }
  if (game.isInsufficientMaterial()) {
    return { winner: "draw", scoreWhite: 0.5, scoreBlack: 0.5, reasonCode: "insufficient" };
  }
  if (game.isThreefoldRepetition()) {
    return { winner: "draw", scoreWhite: 0.5, scoreBlack: 0.5, reasonCode: "repetition" };
  }
  if (typeof game.isDrawByFiftyMoves === "function" && game.isDrawByFiftyMoves()) {
    return { winner: "draw", scoreWhite: 0.5, scoreBlack: 0.5, reasonCode: "fifty" };
  }
  if (game.isDraw()) {
    return { winner: "draw", scoreWhite: 0.5, scoreBlack: 0.5, reasonCode: "draw" };
  }
  return { winner: "draw", scoreWhite: 0.5, scoreBlack: 0.5, reasonCode: "draw" };
}

export function playersForMatch(opts) {
  const o = opts || {};
  const mode = o.mode || "engine";
  const you = o.youLabel || "Você";
  const engine = o.engineName || "Sator Engine";
  if (mode === "multiplayer") {
    const names = o.mpNames || {};
    const white = names.white || o.whiteLabel || "Brancas";
    const black = names.black || names.opponentExpected || o.blackLabel || "Pretas";
    const myColor = o.myColor || "w";
    return {
      whiteName: white,
      blackName: black,
      opponent: myColor === "w" ? black : white
    };
  }
  if (mode === "engine") {
    if (o.playerColor === "b") {
      return { whiteName: engine, blackName: you, opponent: engine };
    }
    return { whiteName: you, blackName: engine, opponent: engine };
  }
  return {
    whiteName: o.whiteLabel || "Brancas",
    blackName: o.blackLabel || "Pretas",
    opponent: o.localOpponent || "Jogador local"
  };
}

export function venueForMode(mode) {
  if (mode === "multiplayer") return "Online";
  if (mode === "engine") return "Local vs IA";
  if (mode === "human") return "Local";
  return "Local";
}

/**
 * Grava o fim da partida no servidor. Idempotente por sourceKey.
 * @returns {Promise<boolean>}
 */
export async function logFinishedMatch(payload) {
  const p = payload || {};
  const sourceKey = String(p.sourceKey || "").trim();
  if (!sourceKey || postedKeys.has(sourceKey)) return false;
  postedKeys.add(sourceKey);
  const body = {
    sourceKey,
    mode: p.mode || "unknown",
    ui: p.ui || "",
    whiteName: p.whiteName || "",
    blackName: p.blackName || "",
    opponent: p.opponent || "",
    location: p.location || "",
    timezone: p.timezone || clientTimezone(),
    winner: p.winner || "draw",
    reasonCode: p.reasonCode || "unknown",
    reasonLabel: p.reasonLabel || "",
    scoreWhite: p.scoreWhite,
    scoreBlack: p.scoreBlack,
    startedAt: p.startedAt,
    endedAt: p.endedAt || new Date().toISOString(),
    lobbyId: p.lobbyId || "",
    sessionId: p.sessionId || ""
  };
  try {
    const r = await fetch("/api/matches/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      postedKeys.delete(sourceKey);
      return false;
    }
    return true;
  } catch {
    postedKeys.delete(sourceKey);
    return false;
  }
}

export function resetMatchLogKey(sourceKey) {
  if (sourceKey) postedKeys.delete(String(sourceKey));
}
