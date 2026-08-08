/*
 * Onramp service worker.
 *
 * Strategy:
 * - Cache-first for hashed static assets under /assets/ (Vite emits hashes).
 * - Stale-while-revalidate for HTML entry point (so updates land within a
 *   round trip but users always see something).
 * - Network-only for optional LLM endpoint calls (never cache assignment text).
 *
 * The cache version string is bumped on every release. Old caches are cleaned
 * on the 'activate' event. Assignment text NEVER touches the cache.
 */

const CACHE_VERSION = 'onramp-v1';
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const HTML_CACHE = `${CACHE_VERSION}-html`;

const CORE_ASSETS = ['/', '/index.html', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(HTML_CACHE).then((cache) => cache.addAll(CORE_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;    // never intercept cross-origin

  // Cache-first for hashed assets
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const fresh = await fetch(req);
        if (fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      }),
    );
    return;
  }

  // Stale-while-revalidate for HTML + manifest + icons
  event.respondWith(
    caches.open(HTML_CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then((fresh) => {
        if (fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      }).catch(() => cached);
      return cached ?? fetchPromise;
    }),
  );
});
