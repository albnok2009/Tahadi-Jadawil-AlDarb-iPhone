const CACHE = "multiplication-ios-test-v11";
const CORE = ["./index.html", "./games.html", "./manifest.webmanifest", "./icon.svg", "./icon-android.png", "./iphone-app-icon.png", "./iphone-splash.jpg", "./a_vibrant_highly_detailed_realistic_illustrative.png", "./a_vibrant_highly_detailed_nature_scene_identical.png", "./a_highly_detailed_vibrant_realistic_illustrative.png"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("multiplication-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) {
      // App pages are cache-first so an installed app can start without a network.
      if (req.mode === "navigate" || CORE.some(path => new URL(path, self.registration.scope).pathname === new URL(req.url).pathname)) return cached;
    }
    try {
      const response = await fetch(req);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(req, response.clone());
      }
      return response;
    } catch (_) {
      if (cached) return cached;
      if (req.mode === "navigate") return (await caches.match("./index.html")) || Response.error();
      return Response.error();
    }
  })());
});
