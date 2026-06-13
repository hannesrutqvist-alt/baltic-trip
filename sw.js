// !! Bump CACHE_VERSION on every deploy to force phones to update !!
const CACHE_VERSION = 'baltic-v45';
const SHELL_CACHE   = `baltic-shell-${CACHE_VERSION}`;
const TILE_CACHE    = 'baltic-tiles-v1';
const WIKI_CACHE    = 'baltic-wiki-v1';

const SHELL_ASSETS = [
  '/',
  '/app.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// ── Install: cache shell assets ──────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: purge old shell caches (keep tiles + wiki) ─────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k.startsWith('baltic-shell-') && k !== SHELL_CACHE)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: shell → cache-first; tiles & wiki → cache-first with network fallback ─
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Map tiles
  if (url.hostname.endsWith('tile.openstreetmap.org') ||
      url.hostname.endsWith('openstreetmap.org')) {
    event.respondWith(
      caches.open(TILE_CACHE).then(cache =>
        cache.match(event.request).then(hit => {
          if (hit) return hit;
          return fetch(event.request).then(res => {
            if (res.ok) cache.put(event.request, res.clone());
            return res;
          }).catch(() => new Response('', {status: 503}));
        })
      )
    );
    return;
  }

  // Wikipedia thumbnails
  if (url.hostname === 'en.wikipedia.org' || url.hostname.endsWith('.wikipedia.org') ||
      url.hostname === 'upload.wikimedia.org') {
    event.respondWith(
      caches.open(WIKI_CACHE).then(cache =>
        cache.match(event.request).then(hit => {
          if (hit) return hit;
          return fetch(event.request).then(res => {
            if (res.ok) cache.put(event.request, res.clone());
            return res;
          }).catch(() => new Response('', {status: 503}));
        })
      )
    );
    return;
  }

  // Shell assets — cache first
  if (SHELL_ASSETS.some(a => url.pathname === a) ||
      url.pathname === '/app.html' || url.pathname === '/') {
    event.respondWith(
      caches.open(SHELL_CACHE).then(cache =>
        cache.match(event.request).then(hit => hit || fetch(event.request))
      )
    );
    return;
  }
});
