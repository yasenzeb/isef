// SciNexa Progressive Offline Service Worker v2.0
const CACHE_VERSION = 'scinexa-v2-' + Date.now();
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/simulations/bending-light_ar.html',
  '/simulations/circuit-construction-kit-dc_ar.html',
  '/simulations/forces-and-motion-basics_ar.html',
  '/simulations/projectile-motion_ar.html',
  '/models/anatomy/definitions.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_VERSION) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'PURGE_CACHE') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    });
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 1. Navigation requests (HTML documents): NETWORK-FIRST
  // This guarantees that any user or judges refreshing the page always gets the fresh version immediately!
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match(req);
        })
    );
    return;
  }

  // 2. Static Vite hashed assets (JS/CSS with hash like index-XYZ.js): CACHE-FIRST
  // Hashed assets are immutable, safe to cache permanently
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // 3. 3D GLB Models and JSON data: STALE-WHILE-REVALIDATE
  // Serve from cache immediately so models load fast, but fetch from network in background to update
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
