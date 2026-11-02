(function () {
  var root = document.getElementById("pwa-splash");
  if (!root) return;

  var art = root.querySelector(".pwa-splash__art");
  var img = root.querySelector(".pwa-splash__art img");
  var track = root.querySelector(".pwa-splash__track");
  var isIndex = root.classList.contains("pwa-splash--index");
  var started = Date.now();
  var MIN_MS = 900;
  var shown = 0.04;
  var target = 0.08;
  var creep = 0.08;
  var finishing = false;
  var hidden = false;

  /* Posição da barra na arte landscape 1024×576 */
  var BAR = { x: 0.283, y: 0.82, w: 0.434, h: 0.028 };

  function layoutIndexBar() {
    if (!isIndex || !art || !img || !track) return;
    var aw = art.clientWidth;
    var ah = art.clientHeight;
    var nw = img.naturalWidth || 1024;
    var nh = img.naturalHeight || 576;
    if (aw < 2 || ah < 2) return;

    var scale = Math.max(aw / nw, ah / nh);
    var rw = nw * scale;
    var rh = nh * scale;
    var ox = (aw - rw) / 2;
    /* object-position: center 28% → vertical bias */
    var posY = 0.28;
    var oy = (ah - rh) * posY;

    track.style.left = ox + BAR.x * rw + "px";
    track.style.top = oy + BAR.y * rh + "px";
    track.style.width = BAR.w * rw + "px";
    track.style.height = Math.max(8, BAR.h * rh) + "px";
  }

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
    var ratio = total ? ready / total : 0;
    var milestone = 0.16;
    if (document.readyState === "interactive") milestone = 0.34;
    if (document.readyState === "complete") milestone = 0.72;
    var real = Math.min(0.92, milestone + ratio * 0.5);
    if (!finishing) target = Math.max(target, real, creep);
  }

  function frame() {
    if (!finishing && creep < 0.9) creep += 0.0016;
    measure();
    shown += (target - shown) * 0.16;
    if (target - shown < 0.004) shown = target;
    paint();
    if (finishing && shown >= 0.995) hide();
    if (!hidden) requestAnimationFrame(frame);
  }

  function finish() {
    if (finishing) return;
    finishing = true;
    target = 1;
  }

  function hide() {
    if (hidden) return;
    var wait = Math.max(0, MIN_MS - (Date.now() - started));
    if (shown < 0.99) return;
    hidden = true;
    setTimeout(function () {
      root.classList.add("pwa-splash--out");
      root.setAttribute("aria-busy", "false");
      setTimeout(function () {
        if (root.parentNode) root.parentNode.removeChild(root);
      }, 520);
    }, wait);
  }

  if (isIndex) {
    layoutIndexBar();
    window.addEventListener("resize", layoutIndexBar);
    if (img) {
      img.addEventListener("load", layoutIndexBar);
      if (img.complete) layoutIndexBar();
    }
  }

  if (document.readyState === "complete") finish();
  else window.addEventListener("load", finish);
  setTimeout(finish, 12000);

  paint();
  requestAnimationFrame(frame);
})();
