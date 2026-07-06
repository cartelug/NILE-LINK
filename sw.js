/* ============================================================
   NILE LINK — service worker (real offline caching, safe & versioned)

   Design that avoids the old "stale deploy" trap:
   - Navigations (HTML): NETWORK-FIRST → always fresh when online,
     fall back to cache, then an offline page. New deploys are seen
     immediately.
   - Same-origin static assets (css/js/img/fonts): CACHE-FIRST, but
     safe because every asset URL carries ?v=<version>; a new deploy
     bumps the version → new URL → cache miss → fetched fresh.
   - Supabase (and any API/data) requests: never cached — network only.
   - Google Fonts + Unsplash images: stale-while-revalidate.

   Bump VERSION on any change to force a clean update.
   ============================================================ */
const VERSION       = 'nl-20260706e';
const STATIC_CACHE  = 'nl-static-' + VERSION;
const RUNTIME_CACHE = 'nl-runtime-' + VERSION;
const OFFLINE_URL   = 'offline.html';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.add(OFFLINE_URL).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

function isStaticAsset(pathname) {
  return /\.(css|js|png|jpe?g|svg|webp|gif|woff2?|ico|json)$/i.test(pathname);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }

  // Never cache Supabase or any non-http(s) scheme — data must be fresh.
  if (url.hostname.endsWith('supabase.co')) return;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // HTML navigations → network-first, fall back to cache, then offline page.
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (_) {
        const cached = await caches.match(req);
        return cached || (await caches.match(OFFLINE_URL)) || Response.error();
      }
    })());
    return;
  }

  // Same-origin versioned static assets → cache-first.
  if (url.origin === self.location.origin && isStaticAsset(url.pathname)) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.status === 200 && fresh.type !== 'opaque') {
          const cache = await caches.open(STATIC_CACHE);
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch (_) {
        return cached || Response.error();
      }
    })());
    return;
  }

  // Google Fonts + Unsplash images → stale-while-revalidate.
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname) ||
      /images\.unsplash\.com$/.test(url.hostname)) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      const fetching = fetch(req).then((res) => {
        if (res && res.status === 200) {
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, res.clone()));
        }
        return res;
      }).catch(() => cached);
      return cached || fetching;
    })());
    return;
  }

  // Everything else → default network behavior.
});
