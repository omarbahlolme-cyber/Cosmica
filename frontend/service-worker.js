/* Retirement endpoint for browsers that registered the former site worker.
   New visits do not register a worker. This file never handles or caches requests. */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();
    const names = await caches.keys();
    await Promise.all(names
      .filter((name) => name.startsWith("cosmica-pwa-"))
      .map((name) => caches.delete(name)));
    await self.registration.unregister();
  })());
});
