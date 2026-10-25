/* Taijiang Insects — offline-first service worker.
   Bump CACHE when index.html or data.js change. */
const CACHE = "taijiang-insects-v7";
const SHELL = ["./", "./index.html", "./data.js", "./journal.css", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("taijiang-insects-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.origin !== location.origin) return;
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
