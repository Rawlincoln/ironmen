const CACHE = "ironmen-v4";
const PRECACHE = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/manifest.json",
  "/icons/icon.svg",
  "/icons/icon-maskable.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/js/data.js",
  "/js/program-data.js",
  "/js/storage.js",
  "/js/house-storage.js",
  "/js/community-data.js",
  "/js/community-storage.js",
  "/js/site-config.js",
  "/js/api-sync.js",
  "/js/auth.js",
  "/js/applications.js",
  "/js/director-dashboard.js",
  "/js/placement.js",
  "/js/documents-view.js",
  "/js/sos.js",
  "/js/notifications.js",
  "/js/pwa.js",
  "/js/house.js",
  "/js/friday-service.js",
  "/js/partners-opportunities.js",
  "/js/women-supporters.js",
  "/js/navigation.js",
  "/js/app.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => {
  if (e.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  if (url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ offline: true, error: "No connection" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    return;
  }

  if (e.request.method !== "GET") return;

  const isAsset = /\.(js|css|html)$/.test(url.pathname) || url.pathname === "/";

  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok && url.origin === self.location.origin) {
        const clone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, clone));
      }
      return res;
    }).catch(() =>
      caches.match(e.request).then((cached) =>
        cached || (isAsset ? caches.match("/index.html") : undefined)
      )
    )
  );
});