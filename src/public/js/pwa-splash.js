(function () {
  var root = document.getElementById("pwa-splash");
  if (!root) return;

  var track = root.querySelector(".pwa-splash__track");
  var isIndex = root.classList.contains("pwa-splash--index");
  var started = Date.now();
  var MIN_MS = isIndex ? 1100 : 900;
  var shown = 0.04;
  var target = 0.08;
  var creep = 0.08;
  var finishing = false;
  var hidden = false;
  var hold = /[?&]splashHold=1(?:&|$)/.test(location.search);

  if (isIndex) document.body.classList.add("pwa-booting");

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
