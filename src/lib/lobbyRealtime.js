const WebSocket = require("ws");
const crypto = require("crypto");

const WS_PATH = "/api/lobby/socket";

function makeSecret() {
  return crypto.randomBytes(24).toString("hex");
}

function sanitizeChat(s) {
  if (typeof s !== "string") return "";
  return s.trim().slice(0, 280).replace(/\r\n/g, "\n");
}

/**
 * WebSocket em tempo real para lobby: handshake, ping, estado do jogo e chat.
 * @param {import("http").Server | import("https").Server} server
 * @param {{ memoryLobbies: Record<string, object> }} ctx
 */
function attachLobbyRealtime(server, { memoryLobbies }) {
  /** @type {Map<string, Set<import("ws").WebSocket>>} */
  const lobbySockets = new Map();

  function lobbySend(ws, obj) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(obj));
      } catch (_) {
        /* ignore */
      }
    }
  }

  function broadcastToLobby(lobbyId, obj, exceptWs = null) {
    const set = lobbySockets.get(lobbyId);
    if (!set) return;
    const raw = JSON.stringify(obj);
    for (const client of set) {
      if (client === exceptWs) continue;
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(raw);
        } catch (_) {
          /* ignore */
        }
      }
    }
  }

  function removeFromLobby(ws, lobbyId) {
    const set = lobbySockets.get(lobbyId);
    if (!set) return;
    set.delete(ws);
    if (set.size === 0) lobbySockets.delete(lobbyId);
  }

  function syncBothOffline(lobby) {
    if (!lobby) return;
    if (lobby.finished || !lobby.players || lobby.players.length < 2) {
      lobby.bothOfflineSince = null;
      return;
    }
    const wW = lobby.wsCount?.w ?? 0;
    const wB = lobby.wsCount?.b ?? 0;
    const e = lobby.everHadWs || {};
    if (wW === 0 && wB === 0 && e.w && e.b) {
      if (!lobby.bothOfflineSince) lobby.bothOfflineSince = Date.now();
    } else {
      lobby.bothOfflineSince = null;
    }
  }

  const wss = new WebSocket.Server({ server, path: WS_PATH });

  wss.on("connection", (ws) => {
    ws._lobby = null;

    ws.on("message", (buf) => {
      let msg;
      try {
        msg = JSON.parse(buf.toString());
      } catch {
        return;
      }
      const type = msg && msg.type;

      if (type === "auth") {
        const { lobbyId, secret } = msg;
        const lobby = memoryLobbies[lobbyId];
        if (!lobby || typeof secret !== "string" || !lobby.wsSecrets) {
          return lobbySend(ws, { type: "error", code: "auth", message: "Sala ou credenciais inválidas." });
        }
        let color = null;
        if (secret === lobby.wsSecrets.w) color = "w";
        else if (lobby.wsSecrets.b && secret === lobby.wsSecrets.b) color = "b";

        if (color) {
          ws._lobby = { lobbyId, color, role: "player" };
          if (!lobbySockets.has(lobbyId)) lobbySockets.set(lobbyId, new Set());
          lobbySockets.get(lobbyId).add(ws);

          lobby.wsCount = lobby.wsCount || { w: 0, b: 0 };
          lobby.wsCount[color]++;
          if (lobby.players.length >= 2) {
            lobby.everHadWs = lobby.everHadWs || { w: false, b: false };
            lobby.everHadWs[color] = true;
          }
          lobby.disconnectStartedAt = lobby.disconnectStartedAt || { w: null, b: null };
          if (lobby.wsCount[color] > 0) lobby.disconnectStartedAt[color] = null;
          syncBothOffline(lobby);

          const names = lobby.names || {};
          lobbySend(ws, {
            type: "hello_ack",
            role: "player",
            color,
            fen: lobby.fen,
            names,
            chat: Array.isArray(lobby.chat) ? lobby.chat : [],
            serverTime: Date.now()
          });
          const myName = color === "w" ? names.white : names.black;
          broadcastToLobby(lobbyId, { type: "peer_ws", color, name: myName }, ws);
          const set = lobbySockets.get(lobbyId);
          const playingCount = [...set].filter((c) => {
            const z = c._lobby;
            return z && z.lobbyId === lobbyId && (z.color === "w" || z.color === "b");
          }).length;
          if (playingCount >= 2) {
            broadcastToLobby(lobbyId, { type: "handshake", peersWs: playingCount, t: Date.now() });
          }
          return;
        }

        const specMap = lobby.wsSecrets.spectators || {};
        const specMeta = specMap[secret];
        if (!specMeta) {
          return lobbySend(ws, { type: "error", code: "auth", message: "Credencial inválida." });
        }
        ws._lobby = { lobbyId, role: "spectator", spectatorId: specMeta.id, name: specMeta.name };
        ws._spectatorSecret = secret;
        if (!lobbySockets.has(lobbyId)) lobbySockets.set(lobbyId, new Set());
        lobbySockets.get(lobbyId).add(ws);
        const names = lobby.names || {};
        lobbySend(ws, {
          type: "hello_ack",
          role: "spectator",
          fen: lobby.fen,
          names,
          chat: Array.isArray(lobby.chat) ? lobby.chat : [],
          serverTime: Date.now()
        });
        return;
      }

      const L = ws._lobby;
      if (!L) return;

      const lobby = memoryLobbies[L.lobbyId];
      if (!lobby) return;

      if (type === "ping") {
        return lobbySend(ws, { type: "pong", id: msg.id, serverTime: Date.now() });
      }

      if (type === "move") {
        if (L.role === "spectator") return;
        if (lobby.finished) return;
        const { fen, san } = msg;
        if (typeof fen !== "string") return;
        lobby.fen = fen;
        lobby.lastMove = typeof san === "string" ? san : null;
        lobby.updatedAt = Date.now();
        broadcastToLobby(L.lobbyId, { type: "state", fen: lobby.fen, san: lobby.lastMove, fromColor: L.color }, ws);
        return;
      }

      if (type === "chat") {
        if (lobby.finished) return;
        const text = sanitizeChat(msg.text);
        if (!text) return;
        const names = lobby.names || {};
        let entry;
        if (L.role === "spectator") {
          const base = L.name || "Espectador";
          entry = {
            id: crypto.randomBytes(8).toString("hex"),
            from: "spectator",
            name: base,
            spectator: true,
            text,
            t: Date.now()
          };
        } else {
          const displayName =
            (L.color === "w" ? names.white : names.black) || (L.color === "w" ? "Brancas" : "Pretas");
          entry = {
            id: crypto.randomBytes(8).toString("hex"),
            from: L.color,
            name: displayName,
            text,
            t: Date.now()
          };
        }
        if (!lobby.chat) lobby.chat = [];
        lobby.chat.push(entry);
        if (lobby.chat.length > 80) lobby.chat.splice(0, lobby.chat.length - 80);
        broadcastToLobby(L.lobbyId, { type: "chat", ...entry });
      }
    });

    ws.on("close", () => {
      const L = ws._lobby;
      if (L) {
        const lobby = memoryLobbies[L.lobbyId];
        if (L.role === "spectator" && lobby?.wsSecrets?.spectators && ws._spectatorSecret) {
          delete lobby.wsSecrets.spectators[ws._spectatorSecret];
        } else if (lobby && L.color) {
          const c = L.color;
          lobby.wsCount = lobby.wsCount || { w: 0, b: 0 };
          lobby.wsCount[c] = Math.max(0, (lobby.wsCount[c] || 0) - 1);
          if (lobby.players.length >= 2 && lobby.everHadWs && lobby.everHadWs[c] && lobby.wsCount[c] === 0) {
            lobby.disconnectStartedAt = lobby.disconnectStartedAt || { w: null, b: null };
            lobby.disconnectStartedAt[c] = Date.now();
          }
          syncBothOffline(lobby);
        }
        removeFromLobby(ws, L.lobbyId);
      }
    });

    ws.on("error", () => {});
  });

  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      if (!ws._lobby) return;
      lobbySend(ws, { type: "srv_ping", t: Date.now() });
    });
  }, 20000);

  return { wss, broadcastToLobby };
}

module.exports = { attachLobbyRealtime, makeSecret, WS_PATH };
