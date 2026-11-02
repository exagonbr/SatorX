(function () {
  if (!("serviceWorker" in navigator)) {
    console.warn("[Sator PWA] Service Worker não suportado neste browser.");
    return;
  }

  var isSecure =
    typeof window !== "undefined" &&
    window.isSecureContext === true;

  if (!isSecure) {
    console.warn(
      "[Sator PWA] Contexto não seguro (HTTP ou IP sem HTTPS). O Service Worker não regista — use HTTPS ou localhost para instalar o PWA."
    );
  }

  var reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", function () {
    if (reloaded) return;
    reloaded = true;
    location.reload();
  });

  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(function (reg) {
        console.info("[Sator PWA] Service Worker registado:", reg.scope);
        if (reg.waiting) reg.waiting.postMessage({ type: "sator-skip-wait" });
        reg.addEventListener("updatefound", function () {
          var worker = reg.installing;
          if (!worker) return;
          worker.addEventListener("statechange", function () {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage({ type: "sator-skip-wait" });
            }
          });
        });
      })
      .catch(function (err) {
        console.warn("[Sator PWA] Falha ao registar Service Worker:", err && err.message ? err.message : err);
      });
  });
})();
