const CACHE_VERSION = "cosmica-pwa-v20260304j";
const SHELL_CACHE = `${CACHE_VERSION}:shell`;
const PAGE_CACHE = `${CACHE_VERSION}:pages`;
const STATIC_CACHE = `${CACHE_VERSION}:static`;
const ACTIVE_CACHE_NAMES = new Set([SHELL_CACHE, PAGE_CACHE, STATIC_CACHE]);
const OFFLINE_FALLBACK_PATH = "/offline.html";
const APP_ASSET_VERSION = "20260417";
const STYLE_ASSET_VERSION = "20260413";
const MAP_STYLE_ASSET_VERSION = "20260416";
const CORE_SHELL_ASSETS = [
  "/",
  "/index.html",
  "/english-world.html",
  "/offline.html",
  "/style.css",
  `/style.css?v=${STYLE_ASSET_VERSION}`,
  "/app.js",
  `/app.js?v=${APP_ASSET_VERSION}`,
  "/maps/app-maps.js",
  `/maps/app-maps.js?v=${APP_ASSET_VERSION}`,
  "/maps/style-maps.css",
  `/maps/style-maps.css?v=${MAP_STYLE_ASSET_VERSION}`,
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

const isVersionedAssetRequest = (requestUrl) => requestUrl.searchParams.has("v");

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(CORE_SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(deleteLegacyCaches().then(() => self.clients.claim()));
});

self.addEventListener("message", (event) => {
  const message = event.data;
  if (!message || typeof message !== "object") {
    return;
  }

  if (message.type === "CLEAR_OLD_CACHES") {
    event.waitUntil(deleteLegacyCaches());
    return;
  }

  if (message.type === "CLEAR_ALL_APP_CACHES") {
    event.waitUntil(deleteAllAppCaches());
  }
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
    event.respondWith(handleStaticRequest(event.request, requestUrl));
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

const handleStaticRequest = async (request, requestUrl) => {
  const staticCache = await caches.open(STATIC_CACHE);
  const cached = await staticCache.match(request, { ignoreSearch: false });

  if (isVersionedAssetRequest(requestUrl)) {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        await staticCache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch {
      if (cached) {
        return cached;
      }
    }
  }

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

const deleteLegacyCaches = async () => {
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key.startsWith("cosmica-pwa-") && !ACTIVE_CACHE_NAMES.has(key))
      .map((key) => caches.delete(key))
  );
};

const deleteAllAppCaches = async () => {
  const keys = await caches.keys();
  await Promise.all(
    keys.filter((key) => key.startsWith("cosmica-pwa-")).map((key) => caches.delete(key))
  );
};
