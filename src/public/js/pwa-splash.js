(function () {
  var el = document.getElementById("pwa-splash");
  if (!el) return;

  var MIN_MS = 900;
  var started = Date.now();
  var done = false;

  function hide() {
    if (done) return;
    done = true;
    var wait = Math.max(0, MIN_MS - (Date.now() - started));
    setTimeout(function () {
      el.classList.add("pwa-splash--out");
      el.setAttribute("aria-busy", "false");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 520);
    }, wait);
  }

  if (document.readyState === "complete") hide();
  else window.addEventListener("load", hide);
  setTimeout(hide, 8000);
})();
