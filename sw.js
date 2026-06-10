// Baltic Dispatch 2026 — Service Worker
// Caches the app shell + Leaflet tiles for offline use.
const CACHE_VERSION = 'baltic-v1';
const SHELL_CACHE   = 'baltic-shell-v1';
const TILE_CACHE    = 'baltic-tiles-v1';

// Files to cache on install
const SHELL_ASSETS = [
  './app.html',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
];

// ── INSTALL: pre-cache app shell ──────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: clean old caches ────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== SHELL_CACHE && k !== TILE_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: serve from cache, fall back to network ─────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Map tiles: network-first, cache on success
  if (url.hostname.endsWith('tile.openstreetmap.org') ||
      url.hostname.includes('unpkg.com')) {
    event.respondWith(
      caches.open(TILE_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached); // offline and not in cache → undefined (tiles just blank)
        })
      )
    );
    return;
  }

  // App shell: cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(SHELL_CACHE).then(c => c.put(request, clone));
        }
        return response;
      }).catch(() => caches.match('./app.html')); // offline fallback
    })
  );
});
