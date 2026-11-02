(function () {
  var root = document.getElementById("pwa-splash");
  if (!root) return;

  var track = root.querySelector(".pwa-splash__track");
  var started = Date.now();
  var MIN_MS = 700;
  var shown = 0.04;
  var target = 0.08;
  var creep = 0.08;
  var finishing = false;
  var hidden = false;

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
      var img = imgs[i];
      if (img.closest && img.closest("#pwa-splash")) continue;
      total++;
      if (img.complete && img.naturalWidth > 0) ready++;
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

  if (document.readyState === "complete") finish();
  else window.addEventListener("load", finish);
  setTimeout(finish, 12000);

  paint();
  requestAnimationFrame(frame);
})();
