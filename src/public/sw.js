/* Sator Engine — Service Worker (cache de app shell + runtime) */
const CACHE_VERSION = "v3";
const PRECACHE = "sator-precache-" + CACHE_VERSION;
const RUNTIME = "sator-runtime-" + CACHE_VERSION;

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/chess3d.html",
  "/board2d.html",
  "/offline.html",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/js/pwa-register.js",
  "/js/chess3d.mjs",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/icons/icon-maskable-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    (async function () {
      const cache = await caches.open(PRECACHE);
      for (const url of PRECACHE_URLS) {
        try {
          await cache.add(new Request(url, { cache: "reload" }));
        } catch (e) {
          console.warn("[Sator SW] precache ignorado:", url);
        }
      }
    })()
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (k) {
            return k.startsWith("sator-") && k !== PRECACHE && k !== RUNTIME;
          })
          .map(function (k) {
            return caches.delete(k);
          })
      );
    })
  );
  self.clients.claim();
});

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (cached) {
      var networkFetch = fetch(request).then(function (networkResponse) {
        if (networkResponse && networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      });
      return cached || networkFetch;
    });
  });
}

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  var url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  var isNavigate = request.mode === "navigate";

  if (isNavigate && url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(RUNTIME).then(function (c) {
              c.put(request, copy);
            });
          }
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (hit) {
            return hit || caches.match("/offline.html") || caches.match("/index.html");
          });
        })
    );
    return;
  }

  if (url.hostname === "unpkg.com") {
    event.respondWith(staleWhileRevalidate(request, RUNTIME));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(function (cached) {
        if (cached) return cached;
        return fetch(request).then(function (response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(RUNTIME).then(function (c) {
              c.put(request, copy);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(request).catch(function () {
      return caches.match(request);
    })
  );
});
