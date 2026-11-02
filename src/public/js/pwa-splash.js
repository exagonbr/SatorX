(function () {
  var root = document.getElementById("pwa-splash");
  if (!root) return;

  var compose = root.classList.contains("pwa-splash--compose");
  var hold = /[?&]splashHold=1(?:&|$)/.test(location.search);

  function stageHtml() {
    return (
      '<div class="pwa-splash__stage">' +
      '<div class="pwa-splash__sigil" aria-hidden="true">' +
      '<svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">' +
      "<defs>" +
      '<linearGradient id="splashGold" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#f8e7a4"/>' +
      '<stop offset="42%" stop-color="#e2b04e"/>' +
      '<stop offset="100%" stop-color="#7d6124"/>' +
      "</linearGradient>" +
      '<linearGradient id="splashPlate" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#1a140c"/>' +
      '<stop offset="100%" stop-color="#080603"/>' +
      "</linearGradient>" +
      '<filter id="splashGlow" x="-20%" y="-20%" width="140%" height="140%">' +
      '<feGaussianBlur stdDeviation="2.4" result="blur"/>' +
      "<feMerge><feMergeNode in=\"blur\"/><feMergeNode in=\"SourceGraphic\"/></feMerge>" +
      "</filter></defs>" +
      '<g transform="translate(130 130)">' +
      '<rect x="-80" y="-80" width="160" height="160" transform="rotate(45)" fill="url(#splashPlate)" stroke="url(#splashGold)" stroke-width="2.6" filter="url(#splashGlow)"/>' +
      '<rect x="-72" y="-72" width="144" height="144" transform="rotate(45)" fill="none" stroke="rgba(240,196,90,0.22)" stroke-width="0.8"/>' +
      "</g>" +
      '<g font-family="Cinzel, Times New Roman, serif" font-weight="700" font-size="17" text-anchor="middle" dominant-baseline="central" fill="url(#splashGold)">' +
      '<text x="82" y="82">S</text><text x="106" y="82">A</text><text x="130" y="82">T</text><text x="154" y="82">O</text><text x="178" y="82">R</text>' +
      '<text x="82" y="106">A</text><text x="106" y="106">R</text><text x="130" y="106">E</text><text x="154" y="106">P</text><text x="178" y="106">O</text>' +
      '<text x="82" y="130">T</text><text x="106" y="130">E</text><text x="130" y="130">N</text><text x="154" y="130">E</text><text x="178" y="130">T</text>' +
      '<text x="82" y="154">O</text><text x="106" y="154">P</text><text x="130" y="154">E</text><text x="154" y="154">R</text><text x="178" y="154">A</text>' +
      '<text x="82" y="178">R</text><text x="106" y="178">O</text><text x="130" y="178">T</text><text x="154" y="178">A</text><text x="178" y="178">S</text>' +
      "</g>" +
      '<g fill="none" stroke="rgba(240,196,90,0.38)" stroke-width="0.7">' +
      '<path d="M70 70 H190 V190 H70 Z"/>' +
      '<path d="M94 70 V190 M118 70 V190 M142 70 V190 M166 70 V190"/>' +
      '<path d="M70 94 H190 M70 118 H190 M70 142 H190 M70 166 H190"/>' +
      "</g></svg></div>" +
      '<p class="pwa-splash__brand">Satorx</p>' +
      '<div class="pwa-splash__marks" aria-hidden="true">' +
      '<span class="pwa-splash__mark pwa-splash__mark--king">♔</span>' +
      '<span class="pwa-splash__dot"></span>' +
      '<span class="pwa-splash__mark pwa-splash__mark--chip">' +
      '<svg viewBox="0 0 32 32" aria-hidden="true">' +
      '<rect x="8" y="8" width="16" height="16" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/>' +
      '<rect x="12" y="12" width="8" height="8" rx="1" fill="currentColor" opacity="0.22"/>' +
      '<path d="M12 5.5v2.5M16 4.5v3.5M20 5.5v2.5M12 24v2.5M16 24v3.5M20 24v2.5M5.5 12h2.5M4.5 16h3.5M5.5 20h2.5M24 12h2.5M24 16h3.5M24 20h2.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
      '<text x="16" y="18.2" text-anchor="middle" fill="currentColor" font-size="7" font-family="Cinzel,serif" font-weight="700">AI</text>' +
      "</svg></span></div>" +
      '<p class="pwa-splash__blurb" data-i18n="splash.blurb">The Sator Engine combines classical search (minimax + alpha-beta) with a value network trained by temporal-difference learning (TD-λ).</p>' +
      '<p class="pwa-splash__status" data-i18n="splash.init">Initializing engine...</p>' +
      '<div class="pwa-splash__track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Initializing engine" data-i18n-aria="splash.init"><span class="pwa-splash__fill"></span></div>' +
      '<div class="pwa-splash__ornament" aria-hidden="true">' +
      '<svg viewBox="0 0 120 42" fill="none" stroke="currentColor" stroke-width="1">' +
      '<circle cx="60" cy="34" r="18" opacity="0.35"/>' +
      '<circle cx="60" cy="34" r="10" opacity="0.5"/>' +
      '<path d="M60 4v30" opacity="0.7"/>' +
      '<circle cx="60" cy="8" r="2.2" fill="currentColor" stroke="none"/>' +
      '<circle cx="60" cy="18" r="2.2" fill="currentColor" stroke="none"/>' +
      '<circle cx="60" cy="28" r="2.6" fill="currentColor" stroke="none"/>' +
      "</svg></div></div>"
    );
  }

  if (compose && !root.querySelector(".pwa-splash__stage")) {
    root.innerHTML = stageHtml();
    root.setAttribute("aria-busy", "true");
    if (!root.getAttribute("aria-label")) root.setAttribute("aria-label", "Initializing engine");
  }

  var track = root.querySelector(".pwa-splash__track");
  var started = Date.now();
  var MIN_MS = compose ? 1100 : 900;
  var shown = 0.04;
  var target = 0.08;
  var creep = 0.08;
  var finishing = false;
  var hidden = false;

  document.body.classList.add("pwa-booting");

  function paint() {
    if (track) {
      track.style.setProperty("--p", String(shown));
      track.setAttribute("aria-valuenow", String(Math.round(shown * 100)));
    }
  }

  function measure() {
    var imgs = document.images;
    var total = 0;
    var ready = 0;
    for (var i = 0; i < imgs.length; i++) {
      var el = imgs[i];
      if (el.closest && el.closest("#pwa-splash")) continue;
      total++;
      if (el.complete && el.naturalWidth > 0) ready++;
    }
    var fontsReady = 1;
    try {
      if (document.fonts && document.fonts.status !== "loaded") fontsReady = 0.55;
    } catch (e) {}
    var ratio = total ? ready / total : 1;
    var milestone = 0.16;
    if (document.readyState === "interactive") milestone = 0.34;
    if (document.readyState === "complete") milestone = 0.72;
    var real = Math.min(0.92, (milestone + ratio * 0.45) * fontsReady + (1 - fontsReady) * 0.2);
    if (!finishing) target = Math.max(target, real, creep);
  }

  function frame() {
    if (!finishing && creep < 0.9) creep += 0.0015;
    measure();
    shown += (target - shown) * 0.15;
    if (target - shown < 0.004) shown = target;
    paint();
    if (finishing && shown >= 0.995) hide();
    if (!hidden) requestAnimationFrame(frame);
  }

  function finish() {
    if (finishing || hold) return;
    finishing = true;
    target = 1;
  }

  function hide() {
    if (hidden || hold) return;
    if (shown < 0.99) return;
    var wait = Math.max(0, MIN_MS - (Date.now() - started));
    hidden = true;
    setTimeout(function () {
      root.classList.add("pwa-splash--out");
      root.setAttribute("aria-busy", "false");
      document.body.classList.remove("pwa-booting");
      setTimeout(function () {
        if (root.parentNode) root.parentNode.removeChild(root);
      }, 520);
    }, wait);
  }

  if (hold) {
    shown = 0.68;
    target = 0.68;
    finishing = true;
  } else {
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        if (!finishing) target = Math.max(target, 0.55);
      }).catch(function () {});
    }
    setTimeout(finish, 12000);
  }

  paint();
  requestAnimationFrame(frame);
})();
