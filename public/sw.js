// SciNexa Progressive Offline Service Worker v5.0 (HeroUI Design System)
// Constant cache names ensure stable offline caching without leaking caches on worker restart
const CACHE_VERSION = 'scinexa-v5-heroui';
const MODEL_CACHE = 'scinexa-v2-models-1';
// The "Offline" modal (OfflineDownloadModal.tsx) fills this cache by hand: never delete it, and always read from it.
const OFFLINE_CACHE = 'scinexa-offline-v2';
const KEEP_CACHES = [CACHE_VERSION, MODEL_CACHE, OFFLINE_CACHE];
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
          if (!KEEP_CACHES.includes(key)) {
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

  // 3a. 3D models, Draco decoder and anatomy JSON: CACHE-FIRST in a versioned cache
  if (url.pathname.startsWith('/models/') || url.pathname.startsWith('/draco/')) {
    event.respondWith(
      // caches.match() looks in ALL caches, so files saved by the Offline modal are found too
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(MODEL_CACHE).then((cache) => cache.put(req, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // 3b. Other static files and data: STALE-WHILE-REVALIDATE
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
