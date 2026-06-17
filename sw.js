/* Nile Link — Service worker KILL SWITCH (2025-06)
   Previous versions cached too aggressively and prevented users
   from seeing new deploys. This SW deletes all caches, unregisters
   itself, and forces every controlled page to reload so users get
   fresh content directly from the network. */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (_) {}
      try {
        await self.registration.unregister();
      } catch (_) {}
      try {
        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach((c) => {
          try { c.navigate(c.url); } catch (_) {}
        });
      } catch (_) {}
    })()
  );
});

/* Pass-through any in-flight fetches (no caching) */
self.addEventListener('fetch', () => {});
