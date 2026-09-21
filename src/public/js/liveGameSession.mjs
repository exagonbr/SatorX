const LS_KEY = "satorx_live_session_v1";
const CH_NAME = "satorx-live-game";

export function newSessionId() {
  return "live_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

export function readLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeLocal(state) {
  try {
    if (state) localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* quota */
  }
}

function playSan(game, san) {
  try {
    return game.move(san) || game.move(san, { strict: false });
  } catch {
    try {
      return game.move(san, { strict: false });
    } catch {
      return null;
    }
  }
}

export function restoreChess(game, state) {
  if (!game || !state) return false;
  if (Array.isArray(state.sans) && state.sans.length) {
    try {
      game.reset();
      for (const san of state.sans) {
        if (!playSan(game, san)) throw new Error("san");
      }
      return true;
    } catch {
      /* pgn */
    }
  }
  try {
    if (state.pgn) {
      game.reset();
      const ok = game.loadPgn(state.pgn, { strict: false });
      if (ok !== false && game.history().length) return true;
    }
  } catch {
    /* fen */
  }
  if (state.fen) {
    try {
      game.load(state.fen);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

function injectStyles() {
  if (document.getElementById("sator-live-css")) return;
  const s = document.createElement("style");
  s.id = "sator-live-css";
  s.textContent = `
    .view-chooser-overlay {
      position: fixed; inset: 0; z-index: 80;
      background: rgba(4,6,10,0.72);
      display: none; align-items: center; justify-content: center;
      padding: 20px;
    }
    .view-chooser-overlay.is-open { display: flex; }
    .view-chooser-card {
      width: min(440px, 94vw);
      background: #0e1420;
      border: 1px solid rgba(212,175,55,0.28);
      border-radius: 16px;
      padding: 22px 20px;
      color: #ede9e0;
      box-shadow: 0 24px 60px rgba(0,0,0,0.55);
      font-family: "Source Sans 3", system-ui, sans-serif;
    }
    .view-chooser-card h2 {
      margin: 0 0 8px;
      font-size: 1.05rem;
      letter-spacing: 0.04em;
    }
    .view-chooser-card p { margin: 0 0 16px; color: #7a8090; font-size: 0.88rem; line-height: 1.5; }
    .view-chooser-actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .view-chooser-actions button {
      flex: 1 1 140px;
      min-height: 44px;
      border-radius: 10px;
      border: 1px solid rgba(212,175,55,0.3);
      background: rgba(212,175,55,0.12);
      color: #f0cc5a;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
    }
    .view-chooser-actions button.ghost {
      background: transparent;
      color: #c8c4b8;
    }
    .live-switch {
      display: inline-flex; gap: 8px; flex-wrap: wrap; align-items: center;
    }
    .live-switch a, .live-switch button {
      font-size: 0.8rem; font-weight: 600;
      color: #d4af37; background: transparent;
      border: 1px solid rgba(212,175,55,0.25);
      border-radius: 8px; padding: 6px 10px;
      text-decoration: none; cursor: pointer; font-family: inherit;
    }
    .book-line { font-size: 0.78rem; color: #7a8090; margin: 6px 0 0; }
    .hist-3d {
      max-height: 160px; overflow: auto; margin-top: 10px;
      font-family: ui-monospace, monospace; font-size: 0.75rem;
      background: rgba(0,0,0,0.28); border-radius: 8px; padding: 8px;
      border: 1px solid rgba(212,175,55,0.08);
    }
  `;
  document.head.appendChild(s);
}

function t(key, vars) {
  return window.SatorI18n ? window.SatorI18n.t(key, vars) : key;
}

function fillChooser(el) {
  const title = el.querySelector("#viewChooserTitle");
  const p = el.querySelector(".view-chooser-card p");
  const b2 = el.querySelector('[data-view="2d"]');
  const b3 = el.querySelector('[data-view="3d"]');
  const bc = el.querySelector('[data-view="cancel"]');
  if (title) title.textContent = t("chooser.title");
  if (p) p.textContent = t("chooser.body");
  if (b2) b2.textContent = t("chooser.2d");
  if (b3) b3.textContent = t("chooser.3d");
  if (bc) bc.textContent = t("common.cancel");
}

window.addEventListener("sator:langchange", function () {
  const el = document.getElementById("viewChooserOverlay");
  if (el) fillChooser(el);
});

function ensureOverlay() {
  injectStyles();
  let el = document.getElementById("viewChooserOverlay");
  if (el) {
    fillChooser(el);
    return el;
  }
  el = document.createElement("div");
  el.id = "viewChooserOverlay";
  el.className = "view-chooser-overlay";
  el.innerHTML = `
    <div class="view-chooser-card" role="dialog" aria-labelledby="viewChooserTitle">
      <h2 id="viewChooserTitle"></h2>
      <p></p>
      <div class="view-chooser-actions">
        <button type="button" data-view="2d"></button>
        <button type="button" data-view="3d"></button>
        <button type="button" class="ghost" data-view="cancel"></button>
      </div>
    </div>`;
  document.body.appendChild(el);
  fillChooser(el);
  return el;
}

export function openViewChooser() {
  const overlay = ensureOverlay();
  overlay.classList.add("is-open");
  return new Promise((resolve) => {
    function done(view) {
      overlay.classList.remove("is-open");
      overlay.removeEventListener("click", onClick);
      resolve(view);
    }
    function onClick(ev) {
      const btn = ev.target.closest("[data-view]");
      if (!btn) {
        if (ev.target === overlay) done(null);
        return;
      }
      const v = btn.getAttribute("data-view");
      done(v === "cancel" ? null : v);
    }
    overlay.addEventListener("click", onClick);
  });
}

export function viewUrl(view, sessionId) {
  const path = view === "3d" ? "/chess3d.html" : "/board2d.html";
  return path + "?live=" + encodeURIComponent(sessionId);
}

export function bindLiveGame(adapter) {
  injectStyles();
  const originId = "tab_" + Math.random().toString(36).slice(2, 9);
  let applying = false;
  let channel = null;
  try {
    channel = new BroadcastChannel(CH_NAME);
  } catch {
    channel = null;
  }

  function snapshot() {
    const game = adapter.getGame();
    const meta = adapter.getMeta() || {};
    const verbose = game.history({ verbose: true }).map(function (m) {
      return { from: m.from, to: m.to, san: m.san, color: m.color, flags: m.flags || "" };
    });
    const prev = readLocal() || {};
    return {
      id: prev.id || newSessionId(),
      fen: game.fen(),
      pgn: game.pgn(),
      sans: game.history(),
      verbose,
      mode: meta.mode || "engine",
      playerColor: meta.playerColor || "w",
      depth: meta.depth,
      timeMs: meta.timeMs,
      clocks: meta.clocks || null,
      trainOnline: meta.trainOnline !== false,
      lastMove: verbose.length ? { from: verbose[verbose.length - 1].from, to: verbose[verbose.length - 1].to } : null,
      thoughtLog: Array.isArray(meta.thoughtLog) ? meta.thoughtLog : (prev.thoughtLog || []),
      updatedAt: Date.now(),
      origin: originId,
      view: adapter.view
    };
  }

  function publish() {
    if (applying) return snapshot();
    const state = snapshot();
    writeLocal(state);
    if (channel) {
      try {
        channel.postMessage({ type: "state", state });
      } catch {
        /* ignore */
      }
    }
    fetch("/api/live-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state)
    }).catch(function () {});
    return state;
  }

  async function logMove(info) {
    const state = readLocal() || publish();
    const body = {
      sessionId: state.id,
      ply: info.ply,
      san: info.san,
      fenBefore: info.fenBefore,
      fenAfter: info.fenAfter,
      ui: adapter.view,
      source: info.source || "player"
    };
    try {
      await fetch("/api/game-log/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    } catch {
      /* offline */
    }
    publish();
  }

  function applyIncoming(state) {
    if (!state || state.origin === originId) return;
    const cur = readLocal();
    if (cur && cur.updatedAt && state.updatedAt && state.updatedAt <= cur.updatedAt) return;
    applying = true;
    try {
      writeLocal(state);
      adapter.applyState(state);
    } finally {
      applying = false;
    }
  }

  async function restore() {
    const params = new URLSearchParams(window.location.search);
    const liveId = params.get("live");
    let state = readLocal();
    if (liveId && (!state || state.id !== liveId)) {
      try {
        const r = await fetch("/api/live-session/" + encodeURIComponent(liveId));
        const j = await r.json();
        if (j && j.ok && j.state) state = j.state;
      } catch {
        /* keep local */
      }
    }
    if (state && ((state.sans && state.sans.length) || state.pgn || state.fen || liveId)) {
      applying = true;
      try {
        adapter.applyState(state);
        writeLocal(state);
      } finally {
        applying = false;
      }
    }
    return state;
  }

  if (channel) {
    channel.addEventListener("message", function (ev) {
      if (ev.data && ev.data.type === "state") applyIncoming(ev.data.state);
    });
  }

  window.addEventListener("storage", function (ev) {
    if (ev.key !== LS_KEY || !ev.newValue) return;
    try {
      applyIncoming(JSON.parse(ev.newValue));
    } catch {
      /* ignore */
    }
  });

    function beginNewSession() {
      writeLocal({ id: newSessionId(), updatedAt: Date.now(), origin: originId, sans: [], pgn: "" });
    }

    function goToView(view) {
      const state = publish();
      window.location.href = viewUrl(view, state.id);
    }

    async function chooseNewGame() {
    const view = await openViewChooser();
    if (!view) return null;
    return view;
  }

  return {
    originId,
    snapshot,
    publish,
    logMove,
    restore,
    goToView,
    chooseNewGame,
    beginNewSession,
    newSessionId,
    isApplying: function () {
      return applying;
    }
  };
}

export async function fetchPositionBook(fen) {
  try {
    const r = await fetch("/api/stats/position", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen, ingest: false })
    });
    return await r.json();
  } catch {
    return null;
  }
}

export async function searchSatorGames(q) {
  try {
    const r = await fetch("/api/search/games?q=" + encodeURIComponent(q || ""));
    return await r.json();
  } catch {
    return { ok: false, list: [] };
  }
}
