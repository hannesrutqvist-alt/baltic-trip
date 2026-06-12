// Baltic Dispatch 2026 — Service Worker
// !! Bump CACHE_VERSION on every deploy to force phones to update !!
const CACHE_VERSION = 'baltic-v6';
const SHELL_CACHE   = `baltic-shell-${CACHE_VERSION}`;
const TILE_CACHE    = 'baltic-tiles-v1';  // tiles accumulate, never bust

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
      .then(() => self.skipWaiting())   // activate immediately, don't wait
  );
});

// ── ACTIVATE: delete ALL old shell caches ────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('baltic-shell-') && k !== SHELL_CACHE)
          .map(k  => caches.delete(k))
      )
    ).then(() => self.clients.claim())  // take control of open tabs now
  );
});

// ── FETCH ─────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // ── app.html: NETWORK-FIRST ──────────────────────────────────
  // Always try the network so updates arrive immediately.
  // Only fall back to cache when genuinely offline.
  if (url.pathname.endsWith('app.html') || url.pathname === '/' ||
      url.pathname.endsWith('/index.html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then(c => c.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))   // offline → serve cache
    );
    return;
  }

  // ── Leaflet + other CDN assets: cache-first (rarely change) ──
  if (url.hostname.includes('unpkg.com')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            caches.open(SHELL_CACHE).then(c => c.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  // ── Map tiles: cache-on-browse (accumulate as you explore) ───
  if (url.hostname.endsWith('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(TILE_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached);
        })
      )
    );
    return;
  }

  // ── Everything else: network with cache fallback ──────────────
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});
