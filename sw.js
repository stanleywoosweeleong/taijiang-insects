/* Taijiang Insects — offline-first service worker.
   Bump CACHE when index.html or data.js change. */
const CACHE = "taijiang-insects-v3";
const MODEL_HOSTS = ["cdn.jsdelivr.net","tfhub.dev","www.kaggle.com","storage.googleapis.com"];
const SHELL = ["./", "./index.html", "./data.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // recogniser scripts + model weights (cross-origin): cache-first, so the camera works offline after first use
  if (url.origin !== location.origin) {
    if (!MODEL_HOSTS.includes(url.hostname)) return;
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(e.request); if (hit) return hit;
      const r = await fetch(e.request); if (r.ok || r.type === "opaque") c.put(e.request, r.clone()); return r;
    }));
    return;
  }
  // vendored model files (same origin): cache-first too
  if (url.pathname.includes("/model/")) {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(e.request); if (hit) return hit;
      const r = await fetch(e.request); if (r.ok) c.put(e.request, r.clone()); return r;
    }));
    return;
  }
  // photos: cache-first, cache on success only (missing photos stay 404)
  if (url.pathname.includes("/img/")) {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(e.request); if (hit) return hit;
      try { const r = await fetch(e.request); if (r.ok) c.put(e.request, r.clone()); return r; }
      catch (err) { return new Response("", { status: 404 }); }
    }));
    return;
  }
  // shell: network-first so updates arrive, fall back to cache offline
  e.respondWith(fetch(e.request).then(r => { if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; })
    .catch(() => caches.match(e.request).then(h => h || caches.match("./index.html"))));
});
