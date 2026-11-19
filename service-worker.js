const CACHE = "multiplication-ios-test-v20";
const CORE = ["./index.html", "./games.html", "./manifest.webmanifest", "./icon.svg", "./icon-android.png", "./iphone-app-icon.png", "./iphone-splash.jpg", "./rescue_boy.png", "./rescue_girl.png", "./rescue_certificate_boy_blank.png", "./rescue_certificate_girl_blank.png", "./a_vibrant_highly_detailed_realistic_illustrative.png", "./a_vibrant_highly_detailed_nature_scene_identical.png", "./a_highly_detailed_vibrant_realistic_illustrative.png"];
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
    // Fetch HTML from the network first so Safari does not keep showing outdated screens.
    // The cached page remains available when the device is offline.
    if (req.mode === "navigate" || /\\.html$/.test(new URL(req.url).pathname)) {
      try {
        const response = await fetch(new Request(req, { cache: "no-store" }));
        if (response.ok) (await caches.open(CACHE)).put(req, response.clone());
        return response;
      } catch (_) {
        return cached || (await caches.match("./index.html")) || Response.error();
      }
    }
    if (cached) return cached;
    try {
      const response = await fetch(req);
      if (response.ok) (await caches.open(CACHE)).put(req, response.clone());
      return response;
    } catch (_) {
      return cached || Response.error();
    }
  })());
});
