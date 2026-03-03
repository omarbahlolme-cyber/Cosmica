const CACHE_VERSION = "cosmica-pwa-v20260303o";
const SHELL_CACHE = `${CACHE_VERSION}:shell`;
const PAGE_CACHE = `${CACHE_VERSION}:pages`;
const STATIC_CACHE = `${CACHE_VERSION}:static`;
const OFFLINE_FALLBACK_PATH = "/offline.html";
const CORE_SHELL_ASSETS = [
  "/",
  "/index.html",
  "/english-world.html",
  "/offline.html",
  "/style.css",
  "/app.js",
  "/maps/app-maps.js",
  "/maps/style-maps.css",
  "/maps/translations.json",
  "/favicon.svg",
  "/app.webmanifest",
  "/pwa/apple-touch-icon.png",
  "/pwa/icon-192.png",
  "/pwa/icon-512.png",
  "/pwa/icon-512-maskable.png",
];
const STATIC_EXTENSIONS = new Set([
  ".css",
  ".js",
  ".json",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".ico",
  ".woff",
  ".woff2",
  ".webmanifest",
]);

const isCacheableStaticAsset = (requestUrl) => {
  const pathname = requestUrl.pathname.toLowerCase();
  const lastDot = pathname.lastIndexOf(".");
  if (lastDot < 0) {
    return false;
  }
  return STATIC_EXTENSIONS.has(pathname.slice(lastDot));
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(CORE_SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("cosmica-pwa-") && !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }
  if (requestUrl.pathname.startsWith("/api/") || requestUrl.pathname === "/admin-security.html") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(event.request, requestUrl));
    return;
  }

  if (isCacheableStaticAsset(requestUrl)) {
    event.respondWith(handleStaticRequest(event.request));
  }
});

const handleNavigationRequest = async (request, requestUrl) => {
  const pageCache = await caches.open(PAGE_CACHE);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && requestUrl.search === "") {
      await pageCache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cachedPage = await pageCache.match(request, { ignoreSearch: false });
    if (cachedPage) {
      return cachedPage;
    }
    const fallback = await caches.match(OFFLINE_FALLBACK_PATH, { ignoreSearch: true });
    if (fallback) {
      return fallback;
    }
    return new Response("Offline", {
      status: 503,
      statusText: "Offline",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
};

const handleStaticRequest = async (request) => {
  const staticCache = await caches.open(STATIC_CACHE);
  const cached = await staticCache.match(request, { ignoreSearch: true });
  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) {
        staticCache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    void networkFetch;
    return cached;
  }

  const networkResponse = await networkFetch;
  if (networkResponse) {
    return networkResponse;
  }
  return new Response("", {
    status: 504,
    statusText: "Offline asset unavailable",
  });
};
