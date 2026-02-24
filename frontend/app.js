/* ==========================================================================
   DOM HOOKS AND GLOBAL PAGE REFERENCES
   Collect shared elements once so all page modules reuse the same references.
   ========================================================================== */
const starfields = document.querySelectorAll(".starfield");
const soundToggle = document.getElementById("soundToggle");
const soundLabel = soundToggle ? soundToggle.querySelector(".sound-label") : null;
const speechBubble = document.getElementById("speechBubble");
const speechText = document.getElementById("speechText");
const talkButton = document.getElementById("talkButton");
const chatForm = document.getElementById("chatForm");
const startVoyageButton = document.getElementById("startVoyageButton");
const chatInput = document.getElementById("chatInput");
const chatLog = document.getElementById("chatLog");
const chatStatus = document.getElementById("chatStatus");
const mimiChatPanel = document.getElementById("mimiChat");
const chatChips = document.querySelectorAll(".chat-chip");
const navRoot = document.querySelector(".nav");
const alien = document.getElementById("alien");
const mouthPath = document.getElementById("mouthPath");
const alienHead = alien ? alien.querySelector(".alien-head") : null;
const warpOverlay = document.getElementById("warpOverlay");
const warpText = document.getElementById("warpText");
const worldCards = document.querySelectorAll(".world-card");
const urlParams = new URLSearchParams(window.location.search);
const currentPath = window.location.pathname.toLowerCase();
const isHomePagePath = currentPath === "/" || currentPath.endsWith("/index.html");

// Keep viewport-height based layout stable on mobile when browser UI bars expand/collapse.
const setupDynamicViewportHeight = () => {
  const root = document.documentElement;
  let stableHeight = 0;
  let stableWidth = 0;
  let lastAppliedHeight = 0;
  let orientationKey = "";
  let rafId = 0;
  const lockOnTouchViewport = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  const getOrientationKey = () => {
    const landscape = window.matchMedia("(orientation: landscape)").matches;
    return landscape ? "landscape" : "portrait";
  };

  const applyViewportHeight = (forceReset = false) => {
    const innerHeight = Math.round(window.innerHeight || root.clientHeight || 0);
    const innerWidth = Math.round(window.innerWidth || root.clientWidth || 0);
    if (!innerHeight || !Number.isFinite(innerHeight)) {
      return;
    }
    const nextOrientation = getOrientationKey();
    const orientationChanged = orientationKey !== nextOrientation;
    const widthChanged =
      Number.isFinite(innerWidth) &&
      Number.isFinite(stableWidth) &&
      Math.abs(innerWidth - stableWidth) > 48;
    if (forceReset || !stableHeight || orientationChanged || widthChanged) {
      orientationKey = nextOrientation;
      stableHeight = innerHeight;
      stableWidth = innerWidth || stableWidth;
    } else if (lockOnTouchViewport) {
      // On touch browsers (notably iOS Safari), ignore toolbar show/hide
      // viewport fluctuations to avoid jumpy relayout during scroll.
      return;
    } else if (innerHeight !== stableHeight) {
      stableHeight = innerHeight;
      stableWidth = innerWidth || stableWidth;
    } else {
      return;
    }
    if (stableHeight === lastAppliedHeight) {
      return;
    }
    lastAppliedHeight = stableHeight;
    root.style.setProperty("--vh", `${stableHeight * 0.01}px`);
    root.style.setProperty("--app-height", `${stableHeight}px`);
  };

  const scheduleViewportHeightUpdate = (forceReset = false) => {
    if (rafId) {
      return;
    }
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      applyViewportHeight(forceReset);
    });
  };

  applyViewportHeight(true);
  window.addEventListener("resize", scheduleViewportHeightUpdate, { passive: true });
  window.addEventListener("orientationchange", () => scheduleViewportHeightUpdate(true), {
    passive: true,
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", scheduleViewportHeightUpdate, {
      passive: true,
    });
  }
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      scheduleViewportHeightUpdate(true);
    }
  });
};

setupDynamicViewportHeight();
// Force the canonical secure origin for public traffic (extra safety layer on top of server/CDN redirects).
const enforceProductionCanonicalOrigin = () => {
  const host = String(window.location.hostname || "").toLowerCase();
  const isPublicCosmicaHost = host === "cosmicalearn.com" || host === "www.cosmicalearn.com";
  if (!isPublicCosmicaHost) {
    return;
  }
  const needsHttps = window.location.protocol !== "https:";
  const needsWww = host !== "www.cosmicalearn.com";
  if (!needsHttps && !needsWww) {
    return;
  }
  const targetUrl = `https://www.cosmicalearn.com${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.replace(targetUrl);
};

enforceProductionCanonicalOrigin();

const isWorldLandingPage =
  currentPath.endsWith("/english-world.html") || currentPath.endsWith("/world.html");
if (urlParams.has("skipIntro")) {
  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.delete("skipIntro");
  const nextQuery = cleanUrl.searchParams.toString();
  const normalizedUrl =
    cleanUrl.pathname +
    (nextQuery ? `?${nextQuery}` : "") +
    cleanUrl.hash;
  window.history.replaceState({}, "", normalizedUrl);
}
if (isWorldLandingPage && urlParams.has("world")) {
  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.delete("world");
  const nextQuery = cleanUrl.searchParams.toString();
  const normalizedUrl =
    cleanUrl.pathname +
    (nextQuery ? `?${nextQuery}` : "") +
    cleanUrl.hash;
  window.history.replaceState({}, "", normalizedUrl);
}

if (navRoot) {
  const navLinksCount = navRoot.querySelectorAll(".nav-links a").length;
  navRoot.classList.toggle("nav-single-link", navLinksCount <= 1);
}
/* ==========================================================================
   WORLD CONTEXT
   Resolve active world from URL/body and select world-specific translation packs.
   ========================================================================== */
const WORLD_NAME = isWorldLandingPage
  ? document.body.dataset.world || "English"
  : urlParams.get("world") || document.body.dataset.world || "English";
const WORLD_KEY = WORLD_NAME.toLowerCase();
const INVALID_BASE_LANGUAGE_SENTINELS = new Set([
  "none",
  "no-base",
  "nobase",
  "skip",
  "null",
  "undefined",
]);
const normalizeStoredBaseLanguagePreference = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (!normalized || INVALID_BASE_LANGUAGE_SENTINELS.has(normalized)) {
    return "";
  }
  return normalized;
};
const readStoredBaseLanguagePreference = () =>
  normalizeStoredBaseLanguagePreference(localStorage.getItem("cosmicaBaseLanguage"));

if (isHomePagePath) {
  try {
    localStorage.removeItem("cosmicaBaseLanguage");
  } catch {}
}
const WORLD_MAP_TITLE_TRANSLATIONS = {
  english: {
    letters: "Letters",
    words: "Words",
    phrases: "Phrases",
    grammar: "Grammar",
  },
  french: {
    letters: "Lettres",
    words: "Mots",
    phrases: "Phrases",
    grammar: "Grammaire",
  },
  german: {
    letters: "Buchstaben",
    words: "Worter",
    phrases: "Phrasen",
    grammar: "Grammatik",
  },
  spanish: {
    letters: "Letras",
    words: "Palabras",
    phrases: "Frases",
    grammar: "Gramatica",
  },
  portuguese: {
    letters: "Letras",
    words: "Palavras",
    phrases: "Frases",
    grammar: "Gramatica",
  },
  dutch: {
    letters: "Letters",
    words: "Woorden",
    phrases: "Zinnen",
    grammar: "Grammatica",
  },
  swedish: {
    letters: "Bokstaver",
    words: "Ord",
    phrases: "Fraser",
    grammar: "Grammatik",
  },
  arabic: {
    letters: "حروف",
    words: "كلمات",
    phrases: "عبارات",
    grammar: "قواعد",
  },
  chinese: {
    letters: "字母",
    words: "词汇",
    phrases: "短语",
    grammar: "语法",
  },
  japanese: {
    letters: "文字",
    words: "単語",
    phrases: "フレーズ",
    grammar: "文法",
  },
  korean: {
    letters: "문자",
    words: "단어",
    phrases: "구문",
    grammar: "문법",
  },
  hindi: {
    letters: "अक्षर",
    words: "शब्द",
    phrases: "वाक्यांश",
    grammar: "व्याकरण",
  },
};
const MAP_TITLE_ENGLISH = {
  letters: "Letters",
  words: "Words",
  phrases: "Phrases",
  grammar: "Grammar",
};
const WORLD_MAP_TITLE_RUNTIME_CACHE_KEY = "cosmicaWorldMapTitleRuntimeCache:v1";
let worldMapTitleRuntimeCache = null;
const readWorldMapTitleRuntimeCache = () => {
  if (worldMapTitleRuntimeCache instanceof Map) {
    return worldMapTitleRuntimeCache;
  }
  try {
    const raw = localStorage.getItem(WORLD_MAP_TITLE_RUNTIME_CACHE_KEY);
    if (!raw) {
      worldMapTitleRuntimeCache = new Map();
      return worldMapTitleRuntimeCache;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      worldMapTitleRuntimeCache = new Map();
      return worldMapTitleRuntimeCache;
    }
    const entries = Object.entries(parsed).filter(
      ([key, value]) => key && typeof value === "string" && value.trim()
    );
    worldMapTitleRuntimeCache = new Map(entries);
    return worldMapTitleRuntimeCache;
  } catch {
    worldMapTitleRuntimeCache = new Map();
    return worldMapTitleRuntimeCache;
  }
};
const persistWorldMapTitleRuntimeCache = () => {
  if (!(worldMapTitleRuntimeCache instanceof Map)) {
    return;
  }
  try {
    localStorage.setItem(
      WORLD_MAP_TITLE_RUNTIME_CACHE_KEY,
      JSON.stringify(Object.fromEntries(worldMapTitleRuntimeCache))
    );
  } catch {}
};
const buildWorldMapTitleRuntimeCacheKey = (worldKey, languageKey, mapType) =>
  `${String(worldKey || "").trim().toLowerCase()}::${String(languageKey || "")
    .trim()
    .toLowerCase()}::${String(mapType || "").trim().toLowerCase()}`;
const requestWorldMapTitleTranslation = async (sourceTitle, targetLanguage) => {
  const title = String(sourceTitle || "").trim();
  const lang = String(targetLanguage || "").trim().toLowerCase();
  if (!title || !lang || lang === WORLD_KEY) {
    return "";
  }
  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: title,
        targetLanguage: lang,
      }),
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!response.ok) {
      return "";
    }
    const data = await response.json().catch(() => ({}));
    return String(data?.translation || data?.content || "")
      .replace(/^["'`]|["'`]$/g, "")
      .trim();
  } catch {
    return "";
  }
};
const BASE_MAP_TRANSLATION_FILE = "maps/translations.json";
const WORLD_TRANSLATION_FILES = {
  english: BASE_MAP_TRANSLATION_FILE,
  french: "worlds/french/translations.json",
  german: "worlds/german/translations.json",
  spanish: "worlds/spanish/translations.json",
  portuguese: "worlds/portuguese/translations.json",
  dutch: "worlds/dutch/translations.json",
  swedish: "worlds/swedish/translations.json",
  arabic: "worlds/arabic/translations.json",
  chinese: "worlds/chinese/translations.json",
  japanese: "worlds/japanese/translations.json",
  korean: "worlds/korean/translations.json",
  hindi: "worlds/hindi/translations.json",
};
const WORLD_TTS_CONFIG = {
  english: {
    languageCode: "en-GB",
    voice: "en-GB-Neural2-F",
  },
  french: {
    languageCode: "fr-FR",
    voice: "fr-FR-Neural2-C",
  },
  german: {
    languageCode: "de-DE",
    voice: "de-DE-Neural2-F",
  },
  spanish: {
    languageCode: "es-ES",
    voice: "es-ES-Neural2-F",
  },
  portuguese: {
    languageCode: "pt-BR",
    voice: "pt-BR-Wavenet-A",
  },
  dutch: {
    languageCode: "nl-NL",
    voice: "nl-NL-Wavenet-A",
  },
  swedish: {
    languageCode: "sv-SE",
    voice: "sv-SE-Wavenet-A",
  },
  arabic: {
    languageCode: "ar-XA",
    voice: "ar-XA-Wavenet-A",
  },
  chinese: {
    languageCode: "cmn-CN",
    voice: "cmn-CN-Wavenet-A",
  },
  japanese: {
    languageCode: "ja-JP",
    voice: "ja-JP-Wavenet-A",
  },
  korean: {
    languageCode: "ko-KR",
    voice: "ko-KR-Wavenet-A",
  },
  hindi: {
    languageCode: "hi-IN",
    voice: "hi-IN-Wavenet-A",
  },
};

const applyWorldMapBilingualTitles = () => {
  if (!document.body.classList.contains("world-page")) {
    return;
  }
  const worldSet = WORLD_MAP_TITLE_TRANSLATIONS[WORLD_KEY] || WORLD_MAP_TITLE_TRANSLATIONS.english;
  const selectedBaseLanguage = readStoredBaseLanguagePreference();
  const hasSelectedBaseLanguage =
    Boolean(selectedBaseLanguage) && selectedBaseLanguage !== WORLD_KEY;
  const selectedSet = hasSelectedBaseLanguage
    ? WORLD_MAP_TITLE_TRANSLATIONS[selectedBaseLanguage] || null
    : null;
  document.querySelectorAll(".world-maps .map-card").forEach((card) => {
    const heading = card.querySelector("h3");
    if (!heading) {
      return;
    }
    const mapType = ["letters", "words", "phrases", "grammar"].find((key) =>
      card.classList.contains(`map-${key}`)
    );
    if (!mapType) {
      return;
    }
    let mainNode = heading.querySelector(".map-title-main");
    if (!mainNode) {
      mainNode = document.createElement("span");
      mainNode.className = "map-title-main";
      const currentText = String(heading.textContent || "").trim();
      mainNode.textContent = currentText || MAP_TITLE_ENGLISH[mapType] || mapType;
      heading.textContent = "";
      heading.appendChild(mainNode);
    }
    let translationNode = heading.querySelector(".map-title-translation");
    if (!translationNode) {
      translationNode = document.createElement("span");
      translationNode.className = "map-title-translation";
      heading.appendChild(translationNode);
    }
    const worldTitle = String(worldSet?.[mapType] || MAP_TITLE_ENGLISH[mapType] || mapType).trim();
    mainNode.textContent = worldTitle || MAP_TITLE_ENGLISH[mapType] || mainNode.textContent;
    const selectedTitle = String(selectedSet?.[mapType] || "").trim();
    translationNode.setAttribute("dir", "auto");
    if (!hasSelectedBaseLanguage) {
      translationNode.removeAttribute("data-request-key");
      translationNode.textContent = "";
      translationNode.hidden = true;
      return;
    }
    if (selectedTitle && selectedTitle.toLowerCase() !== worldTitle.toLowerCase()) {
      translationNode.removeAttribute("data-request-key");
      translationNode.textContent = selectedTitle;
      translationNode.hidden = false;
      return;
    }

    translationNode.textContent = "";
    translationNode.hidden = true;

    const runtimeCache = readWorldMapTitleRuntimeCache();
    const cacheKey = buildWorldMapTitleRuntimeCacheKey(WORLD_KEY, selectedBaseLanguage, mapType);
    const cachedTitle = String(runtimeCache.get(cacheKey) || "").trim();
    if (cachedTitle) {
      if (cachedTitle.toLowerCase() === worldTitle.toLowerCase()) {
        translationNode.removeAttribute("data-request-key");
        translationNode.textContent = "";
        translationNode.hidden = true;
        return;
      }
      translationNode.removeAttribute("data-request-key");
      translationNode.textContent = cachedTitle;
      translationNode.hidden = false;
      return;
    }

    const requestKey = `${selectedBaseLanguage}::${mapType}`;
    translationNode.dataset.requestKey = requestKey;
    requestWorldMapTitleTranslation(worldTitle || MAP_TITLE_ENGLISH[mapType], selectedBaseLanguage).then((translated) => {
      const resolved = String(translated || "").trim();
      if (!resolved) {
        return;
      }
      const activeBaseLanguage = readStoredBaseLanguagePreference();
      if (activeBaseLanguage !== selectedBaseLanguage) {
        return;
      }
      if (translationNode.dataset.requestKey !== requestKey) {
        return;
      }
      runtimeCache.set(cacheKey, resolved);
      persistWorldMapTitleRuntimeCache();
      if (resolved.toLowerCase() === worldTitle.toLowerCase()) {
        translationNode.removeAttribute("data-request-key");
        translationNode.textContent = "";
        translationNode.hidden = true;
        return;
      }
      translationNode.removeAttribute("data-request-key");
      translationNode.textContent = resolved;
      translationNode.hidden = false;
    });
  });
};

applyWorldMapBilingualTitles();
const WORLD_TRANSLATION_FILE =
  WORLD_TRANSLATION_FILES[WORLD_KEY] || BASE_MAP_TRANSLATION_FILE;
const WORLD_TTS_LANGUAGE_CODE =
  WORLD_TTS_CONFIG[WORLD_KEY]?.languageCode || WORLD_TTS_CONFIG.english.languageCode;
const WORLD_TTS_VOICE = WORLD_TTS_CONFIG[WORLD_KEY]?.voice || WORLD_TTS_CONFIG.english.voice;
const MAP_TRANSLATIONS_CACHE_KEY = "cosmicaMapTranslationsCache:v3";
const WORLD_TRANSLATIONS_CACHE_KEY_PREFIX = "cosmicaWorldTranslationsCache:v1";
const buildWorldTranslationsCacheKey = (worldKey = WORLD_KEY) =>
  `${WORLD_TRANSLATIONS_CACHE_KEY_PREFIX}:${String(worldKey || "").trim().toLowerCase()}`;
const readAssetVersionParam = (rawUrl) => {
  if (!rawUrl) {
    return "";
  }
  try {
    const parsed = new URL(rawUrl, window.location.href);
    return parsed.searchParams.get("v") || "";
  } catch {
    return "";
  }
};
const resolveAssetVersion = () => {
  const candidates = [];
  if (document.currentScript?.src) {
    candidates.push(document.currentScript.src);
  }
  document.querySelectorAll('script[src*="app.js"]').forEach((script) => {
    if (script.src) {
      candidates.push(script.src);
    }
  });
  for (const sourceUrl of candidates) {
    const version = readAssetVersionParam(sourceUrl);
    if (version) {
      return version;
    }
  }
  return "";
};
const ASSET_VERSION = resolveAssetVersion();
const withAssetVersion = (assetPath) =>
  ASSET_VERSION ? `${assetPath}?v=${encodeURIComponent(ASSET_VERSION)}` : assetPath;
let WORLD_TRANSLATIONS = null;
let WORLD_GRAMMAR_TITLE_MAP = null;
let WORLD_GRAMMAR_EXAMPLE_MAP = null;
const isNonEnglishWorld = WORLD_KEY !== "english";
const isWordsPage = document.body.classList.contains("words-page");
const isPhrasesPage = document.body.classList.contains("phrases-page");
const isGrammarPage = document.body.classList.contains("grammar-page");
const needsMapTranslations = isWordsPage || isPhrasesPage || isGrammarPage;
const needsGrammarDetails = isGrammarPage;
const TRANSLATION_WARM_RECENCY_MS = 90 * 1000;
const TRANSLATION_WARM_DEDUP_WINDOW_MS = 12 * 1000;
let mapTranslationsWarmPromise = null;
let mapTranslationsLastWarmAt = 0;
let worldTranslationsWarmPromise = null;
let worldTranslationsLastWarmAt = 0;

const readCacheSavedAt = (cacheKey) => {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) {
      return 0;
    }
    const parsed = JSON.parse(raw);
    const savedAt = Number(parsed?.savedAt || 0);
    return Number.isFinite(savedAt) && savedAt > 0 ? savedAt : 0;
  } catch {
    return 0;
  }
};

const isCacheEntryFresh = (cacheKey, maxAgeMs = TRANSLATION_WARM_RECENCY_MS) => {
  const savedAt = readCacheSavedAt(cacheKey);
  return savedAt > 0 && Date.now() - savedAt <= maxAgeMs;
};

const writeMapTranslationsCache = (payload) => {
  if (!payload || typeof payload !== "object") {
    return;
  }
  if (!payload.words && !payload.phrases && !payload.grammar) {
    return;
  }
  try {
    localStorage.setItem(
      MAP_TRANSLATIONS_CACHE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        payload,
      })
    );
  } catch {}
};

const warmMapTranslationsCache = async () => {
  if (!document.body.classList.contains("world-page")) {
    return;
  }
  if (isCacheEntryFresh(MAP_TRANSLATIONS_CACHE_KEY)) {
    mapTranslationsLastWarmAt = Date.now();
    return;
  }
  if (mapTranslationsWarmPromise) {
    return mapTranslationsWarmPromise;
  }
  if (Date.now() - mapTranslationsLastWarmAt < TRANSLATION_WARM_DEDUP_WINDOW_MS) {
    return;
  }
  mapTranslationsWarmPromise = (async () => {
    try {
      // Keep map cache normalized to the base English->base-language table.
      const response = await fetch(BASE_MAP_TRANSLATION_FILE, { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const payload = await response.json();
      writeMapTranslationsCache(payload);
    } catch {}
  })().finally(() => {
    mapTranslationsLastWarmAt = Date.now();
    mapTranslationsWarmPromise = null;
  });
  return mapTranslationsWarmPromise;
};

const writeWorldTranslationsCache = (payload) => {
  if (!payload || typeof payload !== "object") {
    return;
  }
  const packWorldLanguage = String(payload?.worldLanguage || "")
    .trim()
    .toLowerCase();
  if (!packWorldLanguage || !payload.words || !payload.phrases) {
    return;
  }
  try {
    localStorage.setItem(
      buildWorldTranslationsCacheKey(packWorldLanguage),
      JSON.stringify({
        savedAt: Date.now(),
        payload,
      })
    );
  } catch {}
};

const warmWorldTranslationsCache = async () => {
  if (!document.body.classList.contains("world-page")) {
    return;
  }
  if (!isNonEnglishWorld || WORLD_TRANSLATION_FILE === BASE_MAP_TRANSLATION_FILE) {
    return;
  }
  const worldCacheKey = buildWorldTranslationsCacheKey(WORLD_KEY);
  if (isCacheEntryFresh(worldCacheKey)) {
    worldTranslationsLastWarmAt = Date.now();
    return;
  }
  if (worldTranslationsWarmPromise) {
    return worldTranslationsWarmPromise;
  }
  if (Date.now() - worldTranslationsLastWarmAt < TRANSLATION_WARM_DEDUP_WINDOW_MS) {
    return;
  }
  worldTranslationsWarmPromise = (async () => {
    try {
      const response = await fetch(WORLD_TRANSLATION_FILE, { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const payload = await response.json();
      const packWorldLanguage = String(payload?.worldLanguage || "")
        .trim()
        .toLowerCase();
      if (packWorldLanguage && packWorldLanguage === WORLD_KEY) {
        writeWorldTranslationsCache(payload);
      }
    } catch {}
  })().finally(() => {
    worldTranslationsLastWarmAt = Date.now();
    worldTranslationsWarmPromise = null;
  });
  return worldTranslationsWarmPromise;
};

const preloadMapsBundleAsset = () => {
  if (!needsMapTranslations && !document.body.classList.contains("world-page")) {
    return;
  }
  const href = withAssetVersion("maps/app-maps.js");
  if (!href || document.querySelector(`link[rel="preload"][as="script"][href="${href}"]`)) {
    return;
  }
  const preload = document.createElement("link");
  preload.rel = "preload";
  preload.as = "script";
  preload.href = href;
  try {
    preload.fetchPriority = "high";
  } catch {}
  document.head.appendChild(preload);
};

preloadMapsBundleAsset();

const setScrollbarWidth = () => {
  const width = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty("--scrollbar-width", `${Math.max(0, width)}px`);
};

let scrollbarWidthResizeRaf = 0;
const scheduleScrollbarWidthRefresh = () => {
  if (scrollbarWidthResizeRaf) {
    return;
  }
  scrollbarWidthResizeRaf = window.requestAnimationFrame(() => {
    scrollbarWidthResizeRaf = 0;
    setScrollbarWidth();
  });
};

setScrollbarWidth();
window.addEventListener("resize", scheduleScrollbarWidthRefresh, { passive: true });

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;
const connectionInfo =
  navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
const prefersReducedData =
  (connectionInfo && connectionInfo.saveData === true) ||
  window.matchMedia("(prefers-reduced-data: reduce)").matches;
const effectiveNetworkType = String(
  (connectionInfo && connectionInfo.effectiveType) || ""
).toLowerCase();
const isSlowNetwork =
  effectiveNetworkType === "slow-2g" || effectiveNetworkType === "2g";
const deviceMemoryGb = Number(navigator.deviceMemory || 0);
const cpuThreadCount = Number(navigator.hardwareConcurrency || 0);
const isLowPowerDevice =
  (deviceMemoryGb > 0 && deviceMemoryGb <= 4) ||
  (cpuThreadCount > 0 && cpuThreadCount <= 4);
const shouldUseConservativeAnimationBudget =
  isLowPowerDevice || prefersReducedData || isSlowNetwork;
const conservativeAnimationFrameMinMs = shouldUseConservativeAnimationBudget ? 34 : 16;
const shouldUseLiteInteractiveEffects =
  prefersReducedMotion || shouldUseConservativeAnimationBudget;

/* ==========================================================================
   AUTH + PROGRESS API CLIENT
   Exposed globally for upcoming account UI and gamification flows.
   ========================================================================== */
const createCosmicaAuthClient = () => {
  const parseJsonResponse = async (response) => {
    try {
      return await response.json();
    } catch {
      return null;
    }
  };

  const request = async (endpoint, options = {}) => {
    const method = options.method || "GET";
    const headers = {
      Accept: "application/json",
      ...(options.headers || {}),
    };
    const fetchOptions = {
      method,
      credentials: "include",
      cache: "no-store",
      ...options,
      headers,
    };
    if (Object.prototype.hasOwnProperty.call(options, "body")) {
      headers["Content-Type"] = "application/json";
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(endpoint, fetchOptions);
    const payload = await parseJsonResponse(response);
    if (!response.ok) {
      const message =
        (payload && typeof payload.error === "string" && payload.error) ||
        `Request failed (${response.status})`;
      const error = new Error(message);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload || {};
  };

  const requestOrNullOnUnauthorized = async (endpoint, options = {}) => {
    try {
      return await request(endpoint, options);
    } catch (error) {
      if (Number(error?.status) === 401) {
        return null;
      }
      throw error;
    }
  };

  const applyBaseLanguageFromAuthPayload = (payload) => {
    if (isHomePagePath) {
      localStorage.removeItem("cosmicaBaseLanguage");
      return;
    }
    const baseLanguage = normalizeStoredBaseLanguagePreference(
      payload?.data?.settings?.baseLanguage
    );
    if (!baseLanguage) {
      localStorage.removeItem("cosmicaBaseLanguage");
      return;
    }
    try {
      localStorage.setItem("cosmicaBaseLanguage", baseLanguage);
    } catch {}
  };

  return {
    signUp: async ({ email, password, displayName = "", baseLanguage = "" } = {}) => {
      const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const payload = await request("/api/auth/signup", {
        method: "POST",
        body: { email, password, displayName, baseLanguage, returnTo },
      });
      applyBaseLanguageFromAuthPayload(payload);
      return payload;
    },
    logIn: async ({ email, password } = {}) => {
      const payload = await request("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      applyBaseLanguageFromAuthPayload(payload);
      return payload;
    },
    resendVerificationEmail: async ({ email, returnTo = "" } = {}) =>
      request("/api/auth/verification/resend", {
        method: "POST",
        body: { email, returnTo },
      }),
    forgotPassword: async ({ email, returnTo = "" } = {}) =>
      request("/api/auth/password/forgot", {
        method: "POST",
        body: { email, returnTo },
      }),
    resetPassword: async ({ token, newPassword, confirmPassword } = {}) =>
      request("/api/auth/password/reset", {
        method: "POST",
        body: { token, newPassword, confirmPassword },
      }),
    changePassword: async ({ currentPassword, newPassword, confirmPassword } = {}) =>
      request("/api/auth/password/change", {
        method: "POST",
        body: { currentPassword, newPassword, confirmPassword },
      }),
    logOut: () =>
      request("/api/auth/logout", {
        method: "POST",
      }),
    getSession: async () => {
      const payload = await requestOrNullOnUnauthorized("/api/auth/me");
      if (payload) {
        applyBaseLanguageFromAuthPayload(payload);
      }
      return payload;
    },
    deleteAccount: () =>
      request("/api/auth/account", {
        method: "DELETE",
      }),
    getAccountData: () => requestOrNullOnUnauthorized("/api/account/data"),
    setAccountData: (data) =>
      request("/api/account/data", {
        method: "PUT",
        body: { data },
      }),
    getPremiumBillingOptions: () => request("/api/billing/premium/options"),
    getPremiumSubscriptionManagement: () => request("/api/billing/subscription/manage"),
    getPremiumHostedSubscriptionPortal: () =>
      request("/api/billing/subscription/portal/session", {
        method: "POST",
      }),
    restorePremiumSubscription: () =>
      request("/api/billing/subscription/restore", {
        method: "POST",
      }),
    upgradeToPremium: () =>
      request("/api/account/premium/upgrade", {
        method: "POST",
      }),
    getProgress: () => requestOrNullOnUnauthorized("/api/progress"),
    setProgress: (progress) =>
      request("/api/progress", {
        method: "PUT",
        body: { progress },
      }),
    setProgressKeepalive: async (progress) => {
      const response = await fetch("/api/progress", {
        method: "PUT",
        credentials: "include",
        cache: "no-store",
        keepalive: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ progress }),
      });
      const payload = await parseJsonResponse(response);
      if (!response.ok) {
        const message =
          (payload && typeof payload.error === "string" && payload.error) ||
          `Request failed (${response.status})`;
        const error = new Error(message);
        error.status = response.status;
        error.payload = payload;
        throw error;
      }
      return payload || {};
    },
    trackProgress: ({ worldKey, mapKey, sectionKey, status, score, xpDelta, questToggleMode } = {}) =>
      request("/api/progress/track", {
        method: "POST",
        body: { worldKey, mapKey, sectionKey, status, score, xpDelta, questToggleMode },
      }),
    syncBaseLanguageToAccount: async (baseLanguage = "") => {
      const accountDataResponse = await requestOrNullOnUnauthorized("/api/account/data");
      if (!accountDataResponse) {
        return null;
      }
      const currentData =
        accountDataResponse && accountDataResponse.data && typeof accountDataResponse.data === "object"
          ? accountDataResponse.data
          : {};
      const nextData = {
        ...currentData,
        settings:
          currentData.settings && typeof currentData.settings === "object"
            ? { ...currentData.settings }
            : {},
      };
      nextData.settings.baseLanguage = normalizeStoredBaseLanguagePreference(baseLanguage);
      return request("/api/account/data", {
        method: "PUT",
        body: { data: nextData },
      });
    },
  };
};

window.cosmicaAuth = createCosmicaAuthClient();

/* ==========================================================================
   GAMIFICATION STATE + ACCOUNT HUB UI
   Shared account session, progress state, and premium learning dashboard.
   ========================================================================== */
const createCosmicaGamificationClient = () => {
  const AUTH_STATE_HINT_KEY = "cosmicaAuthStateHint";
  const PREMIUM_ACCESS_HINT_KEY = "cosmicaPremiumAccessHint";
  const PREMIUM_PROGRESS_CHECKPOINT_INTERVAL_MS = 18000;
  const listeners = new Set();
  const recentEventMap = new Map();
  const state = {
    ready: false,
    isAuthenticated: false,
    loading: false,
    user: null,
    progress: null,
    error: "",
  };
  let premiumCheckpointTimerId = 0;
  let premiumCheckpointDirty = false;
  let premiumCheckpointInFlight = false;
  let premiumCheckpointLifecycleBound = false;

  const setAuthStateHint = (isAuthenticated) => {
    try {
      sessionStorage.setItem(AUTH_STATE_HINT_KEY, isAuthenticated ? "1" : "0");
    } catch {}
  };

  const setPremiumAccessHint = (hasPremiumAccess) => {
    try {
      sessionStorage.setItem(PREMIUM_ACCESS_HINT_KEY, hasPremiumAccess ? "1" : "0");
    } catch {}
  };

  const hasPremiumCheckpointAccess = () =>
    Boolean(state.isAuthenticated && state.user?.isPremium === true && state.progress);

  const stopPremiumCheckpointTimer = () => {
    if (premiumCheckpointTimerId) {
      window.clearInterval(premiumCheckpointTimerId);
      premiumCheckpointTimerId = 0;
    }
  };

  const markPremiumCheckpointDirty = () => {
    if (!hasPremiumCheckpointAccess()) {
      return;
    }
    premiumCheckpointDirty = true;
  };

  const flushPremiumCheckpoint = async ({ force = false, useKeepalive = false } = {}) => {
    if (!hasPremiumCheckpointAccess()) {
      return false;
    }
    if (!force && !premiumCheckpointDirty) {
      return false;
    }
    if (premiumCheckpointInFlight) {
      return false;
    }
    premiumCheckpointInFlight = true;
    try {
      const snapshotProgress = normalizeProgressPayload(state.progress);
      const payload =
        useKeepalive && typeof window.cosmicaAuth?.setProgressKeepalive === "function"
          ? await window.cosmicaAuth.setProgressKeepalive(snapshotProgress)
          : await window.cosmicaAuth.setProgress(snapshotProgress);
      if (payload && payload.progress) {
        state.progress = normalizeProgressPayload(payload.progress);
      }
      premiumCheckpointDirty = false;
      state.error = "";
      return true;
    } catch (error) {
      state.error = String(error?.message || "Failed to save progress checkpoint");
      return false;
    } finally {
      premiumCheckpointInFlight = false;
    }
  };

  const bindPremiumCheckpointLifecycle = () => {
    if (premiumCheckpointLifecycleBound) {
      return;
    }
    premiumCheckpointLifecycleBound = true;
    const flushWithKeepalive = () => {
      void flushPremiumCheckpoint({ force: true, useKeepalive: true });
    };
    window.addEventListener("pagehide", flushWithKeepalive, { passive: true });
    window.addEventListener("beforeunload", flushWithKeepalive, { passive: true });
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.visibilityState === "hidden") {
          flushWithKeepalive();
        }
      },
      { passive: true }
    );
  };

  const syncPremiumCheckpointTimer = () => {
    stopPremiumCheckpointTimer();
    if (!hasPremiumCheckpointAccess()) {
      return;
    }
    bindPremiumCheckpointLifecycle();
    premiumCheckpointTimerId = window.setInterval(() => {
      void flushPremiumCheckpoint();
    }, PREMIUM_PROGRESS_CHECKPOINT_INTERVAL_MS);
  };

  const xpForLevel = (level) => {
    const bounded = Math.max(1, Math.floor(Number(level) || 1));
    if (bounded <= 1) {
      return 0;
    }
    return Math.round(120 * Math.pow(bounded - 1, 1.34));
  };

  const deriveLevelMeta = (xpValue) => {
    const xp = Math.max(0, Math.round(Number(xpValue) || 0));
    let level = 1;
    while (level < 250 && xp >= xpForLevel(level + 1)) {
      level += 1;
    }
    const startXp = xpForLevel(level);
    const nextXp = xpForLevel(level + 1);
    const span = Math.max(1, nextXp - startXp);
    const inLevelXp = Math.max(0, xp - startXp);
    return {
      level,
      startXp,
      nextXp,
      xp,
      inLevelXp,
      toNextXp: Math.max(0, nextXp - xp),
      ratio: Math.max(0, Math.min(1, inLevelXp / span)),
    };
  };

  const buildDefaultProgress = () => ({
    totals: {
      xp: 0,
      completedSections: 0,
      lastActivityAt: null,
    },
    worlds: {},
    recentEvents: [],
    gamification: {
      level: 1,
      currentStreak: 0,
      bestStreak: 0,
      badges: {},
      quests: {
        date: null,
        allCompleted: false,
        tasks: {
          practice: {
            key: "practice",
            label: "Practice 25 cards",
            target: 25,
            progress: 0,
            completed: false,
          },
          discover: {
            key: "discover",
            label: "Start 3 sections",
            target: 3,
            progress: 0,
            completed: false,
          },
          complete: {
            key: "complete",
            label: "Complete 2 sections",
            target: 2,
            progress: 0,
            completed: false,
          },
        },
      },
      stats: {
        sectionsVisited: 0,
        sectionsCompleted: 0,
        cardsPracticed: 0,
        grammarReviews: 0,
        worldsEngaged: [],
        questDaysCompleted: 0,
      },
    },
  });

  const toSafeObject = (value, fallback = {}) =>
    value && typeof value === "object" && !Array.isArray(value) ? value : fallback;

  const normalizeProgressPayload = (payload) => {
    const fallback = buildDefaultProgress();
    const candidate = toSafeObject(payload);
    const totals = toSafeObject(candidate.totals);
    const gamification = toSafeObject(candidate.gamification);
    const quests = toSafeObject(gamification.quests);
    const tasks = toSafeObject(quests.tasks);
    const stats = toSafeObject(gamification.stats);

    fallback.totals.xp = Math.max(0, Math.round(Number(totals.xp) || 0));
    fallback.totals.completedSections = Math.max(0, Math.round(Number(totals.completedSections) || 0));
    fallback.totals.lastActivityAt = String(totals.lastActivityAt || "") || null;
    fallback.worlds = toSafeObject(candidate.worlds);
    fallback.recentEvents = Array.isArray(candidate.recentEvents)
      ? candidate.recentEvents.slice(-120)
      : [];
    const levelMeta = deriveLevelMeta(fallback.totals.xp);
    fallback.gamification.level = Math.max(levelMeta.level, Math.round(Number(gamification.level) || 1));
    fallback.gamification.currentStreak = Math.max(0, Math.round(Number(gamification.currentStreak) || 0));
    fallback.gamification.bestStreak = Math.max(
      fallback.gamification.currentStreak,
      Math.round(Number(gamification.bestStreak) || 0)
    );
    fallback.gamification.badges = toSafeObject(gamification.badges);
    fallback.gamification.quests.date = String(quests.date || "") || null;
    fallback.gamification.quests.allCompleted = Boolean(quests.allCompleted);
    ["practice", "discover", "complete"].forEach((key) => {
      const baseTask = fallback.gamification.quests.tasks[key];
      const incoming = toSafeObject(tasks[key]);
      baseTask.progress = Math.max(0, Math.min(baseTask.target, Math.round(Number(incoming.progress) || 0)));
      baseTask.completed = Boolean(incoming.completed) || baseTask.progress >= baseTask.target;
      if (incoming.label) {
        baseTask.label = String(incoming.label);
      }
    });
    fallback.gamification.stats.sectionsVisited = Math.max(0, Math.round(Number(stats.sectionsVisited) || 0));
    fallback.gamification.stats.sectionsCompleted = Math.max(0, Math.round(Number(stats.sectionsCompleted) || 0));
    fallback.gamification.stats.cardsPracticed = Math.max(0, Math.round(Number(stats.cardsPracticed) || 0));
    fallback.gamification.stats.grammarReviews = Math.max(0, Math.round(Number(stats.grammarReviews) || 0));
    fallback.gamification.stats.questDaysCompleted = Math.max(
      0,
      Math.round(Number(stats.questDaysCompleted) || 0)
    );
    fallback.gamification.stats.worldsEngaged = Array.isArray(stats.worldsEngaged)
      ? [...new Set(stats.worldsEngaged.map((item) => String(item || "").trim()).filter(Boolean))]
      : [];
    return fallback;
  };

  const snapshot = () => {
    const progress = state.progress ? normalizeProgressPayload(state.progress) : buildDefaultProgress();
    const levelMeta = deriveLevelMeta(progress.totals.xp);
    return {
      ready: state.ready,
      isAuthenticated: state.isAuthenticated,
      loading: state.loading,
      user: state.user,
      progress,
      levelMeta,
      error: state.error,
    };
  };

  const notify = () => {
    const next = snapshot();
    listeners.forEach((listener) => {
      try {
        listener(next);
      } catch {}
    });
  };

  const applyAuthPayload = (payload) => {
    const user = payload && payload.user && typeof payload.user === "object" ? payload.user : null;
    if (!user) {
      state.isAuthenticated = false;
      state.user = null;
      state.progress = buildDefaultProgress();
      state.error = "";
      setAuthStateHint(false);
      setPremiumAccessHint(false);
      premiumCheckpointDirty = false;
      stopPremiumCheckpointTimer();
      return;
    }
    const payloadData = toSafeObject(payload?.data);
    const payloadProfile = toSafeObject(payloadData.profile);
    const authProvider = String(payload?.data?.profile?.authProvider || user?.authProvider || "email")
      .trim()
      .toLowerCase();
    const premiumTier = String(
      payloadProfile.plan ||
        payloadProfile.tier ||
        payloadProfile.membership ||
        payloadData.plan ||
        payloadData.tier ||
        ""
    )
      .trim()
      .toLowerCase();
    const premiumFlagRaw =
      payloadProfile.isPremium ??
      payloadProfile.premium ??
      payloadData.isPremium ??
      payloadData.premium ??
      null;
    const premiumFlagText = String(premiumFlagRaw ?? "")
      .trim()
      .toLowerCase();
    const hasPremiumAccessFromFlags =
      premiumFlagRaw === true ||
      premiumFlagText === "1" ||
      premiumFlagText === "true" ||
      premiumFlagText === "yes" ||
      premiumFlagText === "premium" ||
      premiumFlagText === "pro" ||
      premiumFlagText === "plus" ||
      premiumTier === "premium" ||
      premiumTier === "pro" ||
      premiumTier === "plus" ||
      premiumTier === "paid";
    const premiumEndDateRaw =
      payloadProfile.premiumEndsAt ||
      payloadProfile.premiumExpiresAt ||
      payloadProfile.premiumCurrentPeriodEnd ||
      payloadProfile.subscriptionEndsAt ||
      payloadProfile.currentPeriodEnd ||
      payloadProfile.planEndsAt ||
      payloadProfile.expiresAt ||
      payloadData.premiumEndsAt ||
      payloadData.premiumExpiresAt ||
      payloadData.premiumCurrentPeriodEnd ||
      payloadData.subscriptionEndsAt ||
      payloadData.currentPeriodEnd ||
      payloadData.planEndsAt ||
      payloadData.expiresAt ||
      user.premiumEndsAt ||
      user.premiumExpiresAt ||
      user.premiumCurrentPeriodEnd ||
      user.subscriptionEndsAt ||
      user.currentPeriodEnd ||
      user.planEndsAt ||
      user.expiresAt ||
      null;
    const premiumStatus = String(
      payloadProfile.premiumStatus ||
        payloadProfile.subscriptionStatus ||
        payloadProfile.premiumStripeSubscriptionStatus ||
        payloadProfile.stripeSubscriptionStatus ||
        payloadData.premiumStatus ||
        payloadData.subscriptionStatus ||
        payloadData.premiumStripeSubscriptionStatus ||
        payloadData.stripeSubscriptionStatus ||
        user.premiumStatus ||
        user.subscriptionStatus ||
        user.premiumStripeSubscriptionStatus ||
        user.stripeSubscriptionStatus ||
        ""
    )
      .trim()
      .toLowerCase();
    const premiumEndMs = Date.parse(String(premiumEndDateRaw || "").trim());
    const hasFuturePremiumEnd = Number.isFinite(premiumEndMs) && premiumEndMs > Date.now();
    const statusIndicatesPremium =
      premiumStatus === "active" ||
      premiumStatus === "trialing" ||
      premiumStatus === "past_due" ||
      premiumStatus === "canceling" ||
      premiumStatus === "grace";
    const hasPremiumAccess =
      hasPremiumAccessFromFlags || statusIndicatesPremium || hasFuturePremiumEnd;
    setAuthStateHint(true);
    setPremiumAccessHint(hasPremiumAccess);
    state.isAuthenticated = true;
    state.user = {
      ...user,
      authProvider: authProvider || "email",
      planTier: premiumTier || "free",
      isPremium: hasPremiumAccess,
      premiumStatus,
      premiumEndsAt: premiumEndDateRaw,
    };
    state.progress = normalizeProgressPayload(payload.progress || {});
    state.error = "";
    markPremiumCheckpointDirty();
    syncPremiumCheckpointTimer();
  };

  const withLoading = async (task) => {
    state.loading = true;
    notify();
    try {
      const result = await task();
      state.loading = false;
      notify();
      return result;
    } catch (error) {
      state.loading = false;
      state.error = String(error?.message || "Request failed");
      notify();
      throw error;
    }
  };

  const dedupeEvent = (eventKey, windowMs = 3600) => {
    const now = Date.now();
    const prev = Number(recentEventMap.get(eventKey) || 0);
    if (prev > 0 && now - prev < windowMs) {
      return true;
    }
    recentEventMap.set(eventKey, now);
    if (recentEventMap.size > 220) {
      const threshold = now - 120000;
      [...recentEventMap.entries()].forEach(([key, ts]) => {
        if (ts < threshold) {
          recentEventMap.delete(key);
        }
      });
    }
    return false;
  };

  return {
    subscribe: (listener) => {
      if (typeof listener !== "function") {
        return () => {};
      }
      listeners.add(listener);
      listener(snapshot());
      return () => listeners.delete(listener);
    },
    getState: () => snapshot(),
    init: async (force = false) => {
      if (state.ready && !force) {
        return snapshot();
      }
      try {
        await withLoading(async () => {
          const payload = await window.cosmicaAuth.getSession();
          applyAuthPayload(payload || null);
          state.ready = true;
        });
      } catch (error) {
        const status = Number(error?.status || 0);
        applyAuthPayload(null);
        state.ready = true;
        state.loading = false;
        if (status === 404) {
          state.error = "Auth API is unavailable (404). Start the backend server with npm start.";
        } else if (status > 0) {
          state.error = `Auth request failed (${status}).`;
        } else {
          state.error = "Auth API is unreachable. Check that the backend server is running.";
        }
        notify();
      }
      return snapshot();
    },
    signUp: ({ email, password, displayName = "" } = {}) =>
      withLoading(async () => {
        const payload = await window.cosmicaAuth.signUp({
          email,
          password,
          displayName,
          baseLanguage: readStoredBaseLanguagePreference(),
        });
        applyAuthPayload(payload);
        state.ready = true;
        return payload;
      }),
    logIn: ({ email, password } = {}) =>
      withLoading(async () => {
        const payload = await window.cosmicaAuth.logIn({ email, password });
        applyAuthPayload(payload);
        state.ready = true;
        return snapshot();
      }),
    logOut: () =>
      withLoading(async () => {
        await flushPremiumCheckpoint({ force: true });
        await window.cosmicaAuth.logOut();
        if (typeof window.cosmicaClearSectionCompletionOverrides === "function") {
          window.cosmicaClearSectionCompletionOverrides();
        }
        applyAuthPayload(null);
        return snapshot();
      }),
    deleteAccount: () =>
      withLoading(async () => {
        const payload = await window.cosmicaAuth.deleteAccount();
        applyAuthPayload(null);
        return {
          ...snapshot(),
          message: String(payload?.message || "").trim(),
        };
      }),
    upgradeToPremium: () =>
      withLoading(async () => {
        const payload = await window.cosmicaAuth.upgradeToPremium();
        applyAuthPayload(payload || null);
        state.ready = true;
        return snapshot();
      }),
    restorePremiumSubscription: () =>
      withLoading(async () => {
        const payload = await window.cosmicaAuth.restorePremiumSubscription();
        applyAuthPayload(payload || null);
        state.ready = true;
        return {
          ...snapshot(),
          restoreStatus: String(payload?.status || "").trim().toLowerCase(),
          restoreMessage: String(payload?.message || payload?.error || "").trim(),
        };
      }),
    refreshProgress: () =>
      withLoading(async () => {
        const payload = await window.cosmicaAuth.getProgress();
        if (payload && payload.progress) {
          state.progress = normalizeProgressPayload(payload.progress);
          state.error = "";
          markPremiumCheckpointDirty();
          syncPremiumCheckpointTimer();
        }
        return snapshot();
      }),
    trackProgress: async ({ worldKey, mapKey, sectionKey, status = "practiced", score = null, questToggleMode = "" } = {}) => {
      if (!state.isAuthenticated) {
        return null;
      }
      const normalizedWorld = String(worldKey || "").trim().toLowerCase();
      const normalizedMap = String(mapKey || "").trim().toLowerCase();
      const normalizedSection = String(sectionKey || "").trim();
      const normalizedStatus = String(status || "").trim().toLowerCase();
      if (!normalizedWorld || !normalizedMap || !normalizedSection || !normalizedStatus) {
        return null;
      }
      const normalizedQuestToggleMode = String(questToggleMode || "").trim().toLowerCase();
      const eventKey = `${normalizedWorld}|${normalizedMap}|${normalizedSection}|${normalizedStatus}|${normalizedQuestToggleMode}`;
      const cooldownMs = normalizedStatus === "completed" || normalizedStatus === "uncompleted" ? 800 : 2600;
      if (dedupeEvent(eventKey, cooldownMs)) {
        return null;
      }
      try {
        const payload = await window.cosmicaAuth.trackProgress({
          worldKey: normalizedWorld,
          mapKey: normalizedMap,
          sectionKey: normalizedSection,
          status: normalizedStatus,
          score: Number.isFinite(Number(score)) ? Number(score) : undefined,
          questToggleMode: normalizedQuestToggleMode || undefined,
        });
        if (payload && payload.progress) {
          state.progress = normalizeProgressPayload(payload.progress);
          state.error = "";
          markPremiumCheckpointDirty();
          syncPremiumCheckpointTimer();
          notify();
        }
        return payload;
      } catch (error) {
        state.error = String(error?.message || "Failed to track progress");
        notify();
        return null;
      }
    },
    getSectionProgress: ({ worldKey, mapKey, sectionKey } = {}) => {
      const progress = state.progress ? normalizeProgressPayload(state.progress) : null;
      if (!progress) {
        return null;
      }
      const world = progress.worlds?.[String(worldKey || "").toLowerCase()];
      const map = world?.maps?.[String(mapKey || "").toLowerCase()];
      return map?.sections?.[String(sectionKey || "")] || null;
    },
  };
};

window.cosmicaGamification = createCosmicaGamificationClient();

const detectMapKeyFromBody = () => {
  if (document.body.classList.contains("letters-page")) {
    return "letters";
  }
  if (document.body.classList.contains("words-page")) {
    return "words";
  }
  if (document.body.classList.contains("phrases-page")) {
    return "phrases";
  }
  if (document.body.classList.contains("grammar-page")) {
    return "grammar";
  }
  return "";
};

const trackLearningProgressEvent = ({
  status = "practiced",
  mapKey = "",
  sectionKey = "",
  score = null,
  questToggleMode = "",
} = {}) => {
  if (!window.cosmicaGamification || typeof window.cosmicaGamification.trackProgress !== "function") {
    return;
  }
  const resolvedMapKey = String(mapKey || detectMapKeyFromBody() || "").trim().toLowerCase();
  if (!resolvedMapKey) {
    return;
  }
  const resolvedSectionKey = String(sectionKey || "").trim() || "core";
  void window.cosmicaGamification.trackProgress({
    worldKey: WORLD_KEY,
    mapKey: resolvedMapKey,
    sectionKey: resolvedSectionKey,
    status,
    score,
    questToggleMode,
  });
};

window.cosmicaTrackLearningProgress = trackLearningProgressEvent;

const SECTION_COMPLETION_OVERRIDE_STORAGE_KEY = "cosmicaSectionCompletionOverrides:v1";

const buildSectionCompletionOverrideKey = (worldKey = "", mapKey = "", sectionKey = "") => {
  const world = String(worldKey || "").trim().toLowerCase();
  const map = String(mapKey || "").trim().toLowerCase();
  const section = String(sectionKey || "").trim();
  if (!world || !map || !section) {
    return "";
  }
  return `${world}|${map}|${section}`;
};

const readSectionCompletionOverrides = () => {
  try {
    const raw = localStorage.getItem(SECTION_COMPLETION_OVERRIDE_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeSectionCompletionOverrides = (overrides) => {
  try {
    localStorage.setItem(SECTION_COMPLETION_OVERRIDE_STORAGE_KEY, JSON.stringify(overrides || {}));
  } catch {}
};

const clearSectionCompletionOverrides = () => {
  try {
    localStorage.removeItem(SECTION_COMPLETION_OVERRIDE_STORAGE_KEY);
  } catch {}
};

const hasAuthenticatedGamificationSession = () => {
  if (!window.cosmicaGamification || typeof window.cosmicaGamification.getState !== "function") {
    return false;
  }
  return Boolean(window.cosmicaGamification.getState()?.isAuthenticated);
};

const getSectionCompletionOverride = ({ worldKey = "", mapKey = "", sectionKey = "" } = {}) => {
  if (!hasAuthenticatedGamificationSession()) {
    return null;
  }
  const key = buildSectionCompletionOverrideKey(worldKey, mapKey, sectionKey);
  if (!key) {
    return null;
  }
  const overrides = readSectionCompletionOverrides();
  if (!Object.prototype.hasOwnProperty.call(overrides, key)) {
    return null;
  }
  return overrides[key] === true;
};

const setSectionCompletionOverride = ({ worldKey = "", mapKey = "", sectionKey = "", isComplete } = {}) => {
  if (!hasAuthenticatedGamificationSession()) {
    return;
  }
  const key = buildSectionCompletionOverrideKey(worldKey, mapKey, sectionKey);
  if (!key || typeof isComplete !== "boolean") {
    return;
  }
  const overrides = readSectionCompletionOverrides();
  overrides[key] = isComplete;
  writeSectionCompletionOverrides(overrides);
};

window.cosmicaGetSectionCompletionOverride = getSectionCompletionOverride;
window.cosmicaSetSectionCompletionOverride = setSectionCompletionOverride;
window.cosmicaClearSectionCompletionOverrides = clearSectionCompletionOverrides;

const setupAccountHub = () => {
  if (document.body.dataset.accountHubBound === "1") {
    return;
  }
  document.body.dataset.accountHubBound = "1";
  const nav = document.querySelector(".nav");
  if (!nav || !window.cosmicaGamification) {
    return;
  }

  const accountSlot = nav.querySelector(".account-slot") || document.createElement("div");
  if (!accountSlot.querySelector(".account-trigger")) {
    accountSlot.className = "account-slot";
    accountSlot.innerHTML = `
      <button class="account-trigger" type="button" aria-haspopup="menu" aria-expanded="false">
        <span class="account-trigger-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M12 12.2a4.6 4.6 0 1 0 0-9.2 4.6 4.6 0 0 0 0 9.2zm0 2.2c-4.7 0-8.5 2.8-8.5 6.3 0 .7.5 1.3 1.2 1.3h14.6c.7 0 1.2-.6 1.2-1.3 0-3.5-3.8-6.3-8.5-6.3z"></path>
          </svg>
        </span>
        <span class="account-trigger-copy">
          <span class="account-trigger-label">Guest</span>
          <span class="account-trigger-meta">Sign in</span>
        </span>
        <span class="account-trigger-caret" aria-hidden="true">▾</span>
      </button>
    `;
  } else {
    accountSlot.classList.add("account-slot");
  }
  accountSlot.classList.remove("account-slot-preload");
  accountSlot.removeAttribute("aria-hidden");

  const soundToggleNode = document.getElementById("soundToggle");
  let navControls = nav.querySelector(".nav-controls");
  if (!navControls) {
    navControls = document.createElement("div");
    navControls.className = "nav-controls";
    if (soundToggleNode && soundToggleNode.parentElement === nav) {
      nav.replaceChild(navControls, soundToggleNode);
      navControls.appendChild(soundToggleNode);
    } else {
      nav.appendChild(navControls);
    }
  }
  if (soundToggleNode) {
    if (soundToggleNode.parentElement !== navControls) {
      navControls.prepend(soundToggleNode);
    } else if (soundToggleNode !== navControls.firstElementChild) {
      navControls.prepend(soundToggleNode);
    }
  }
  if (accountSlot.parentElement !== navControls) {
    navControls.appendChild(accountSlot);
  }

  const trigger = accountSlot.querySelector(".account-trigger");
  if (!trigger) {
    return;
  }
  trigger.setAttribute("type", "button");
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-expanded", "false");
  trigger.removeAttribute("tabindex");
  const triggerAvatar = accountSlot.querySelector(".account-trigger-avatar");
  const triggerLabel = accountSlot.querySelector(".account-trigger-label");
  const triggerMeta = accountSlot.querySelector(".account-trigger-meta");
  const triggerCaret = accountSlot.querySelector(".account-trigger-caret");
  if (triggerCaret) {
    triggerCaret.textContent = "▾";
  }

  const dropdown = document.createElement("div");
  dropdown.className = "account-dropdown";
  dropdown.hidden = true;
  dropdown.innerHTML = `
    <div class="account-dropdown-card" role="menu" aria-label="Profile menu">
      <p class="account-feedback" aria-live="polite"></p>
      <section class="account-guest-pane">
        <header class="account-guest-head">
          <p class="account-pane-title">Account & Progress</p>
          <h3>Keep your streak and XP synced</h3>
        </header>
        <div class="account-auth-switch" role="tablist" aria-label="Account forms">
          <button type="button" data-auth-panel="login" aria-selected="true">Log in</button>
          <button type="button" data-auth-panel="signup" aria-selected="false">Sign up</button>
        </div>
        <div class="account-auth-panels">
          <form class="account-form login-form" data-auth-panel-content="login">
            <button class="account-google-button" type="button" data-google-mode="login">
              <span class="account-google-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.56-5.17 3.56-8.66z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.94-2.93l-3.88-3c-1.08.72-2.46 1.15-4.06 1.15-3.12 0-5.76-2.11-6.7-4.95H1.3v3.11A11.99 11.99 0 0 0 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.3a11.99 11.99 0 0 0 0 10.76l4-3.11z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.77c1.76 0 3.35.6 4.6 1.78l3.45-3.45C17.94 1.14 15.23 0 12 0A11.99 11.99 0 0 0 1.3 6.62l4 3.11c.94-2.84 3.58-4.96 6.7-4.96z"
                  />
                </svg>
              </span>
              <span>Log in with Google account</span>
            </button>
            <div class="account-form-divider"><span>or continue with email</span></div>
            <label>Email <input type="email" name="email" autocomplete="email" required /></label>
            <label>Password <input type="password" name="password" autocomplete="current-password" minlength="8" required /></label>
            <button type="button" class="account-inline-link account-login-forgot">Forgot password?</button>
            <button type="submit">Start learning</button>
            <button type="button" class="account-resend-button" hidden>Resend verification email</button>
          </form>
          <form class="account-form signup-form" data-auth-panel-content="signup" hidden>
            <button class="account-google-button" type="button" data-google-mode="signup">
              <span class="account-google-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.56-5.17 3.56-8.66z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.94-2.93l-3.88-3c-1.08.72-2.46 1.15-4.06 1.15-3.12 0-5.76-2.11-6.7-4.95H1.3v3.11A11.99 11.99 0 0 0 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.3a11.99 11.99 0 0 0 0 10.76l4-3.11z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.77c1.76 0 3.35.6 4.6 1.78l3.45-3.45C17.94 1.14 15.23 0 12 0A11.99 11.99 0 0 0 1.3 6.62l4 3.11c.94-2.84 3.58-4.96 6.7-4.96z"
                  />
                </svg>
              </span>
              <span>Sign up with Google account</span>
            </button>
            <div class="account-form-divider"><span>or continue with email</span></div>
            <label>Username <input type="text" name="displayName" maxlength="60" minlength="1" autocomplete="username" required /></label>
            <label>Email <input type="email" name="email" autocomplete="email" required /></label>
            <label>Password <input type="password" name="password" autocomplete="new-password" minlength="8" required /></label>
            <button type="submit">Create free account</button>
            <button type="button" class="account-resend-button account-resend-button-signup" hidden>
              Resend verification email
            </button>
          </form>
          <form class="account-form reset-form" data-auth-panel-content="reset" hidden>
            <p class="account-reset-intro">Set a new password for your account.</p>
            <label>New password <input type="password" name="newPassword" autocomplete="new-password" minlength="8" required /></label>
            <label>Retype new password <input type="password" name="confirmPassword" autocomplete="new-password" minlength="8" required /></label>
            <button type="submit">Reset password</button>
            <button type="button" class="account-inline-link account-reset-back-login">Back to log in</button>
          </form>
        </div>
      </section>
      <section class="account-user-pane" hidden>
        <header class="account-menu-header">
          <div class="account-menu-avatar" aria-hidden="true">U</div>
          <div class="account-menu-identity">
            <div class="account-menu-topline">
              <div class="account-menu-name"></div>
              <div class="account-menu-summary">
                <div class="account-menu-stat account-menu-stat-streak">
                  <span class="account-menu-stat-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false" class="account-menu-icon-streak">
                      <path class="icon-streak-outer" d="M13.1 1.8c.4 2-.4 3.8-1.9 5.5-1.5 1.8-3.2 3.2-3.2 5.8 0 2.5 1.9 4.6 4.4 4.6 2.7 0 4.8-2.2 4.8-5 0-1.7-.7-3.2-2.3-4.7 2.9.8 5.1 3.8 5.1 7.2 0 4.3-3.4 7.8-7.8 7.8-4.2 0-7.8-3.3-7.8-7.8 0-4 2.4-6.9 4.8-9.1 1.4-1.3 2.7-2.5 3.9-4.3z"></path>
                      <path class="icon-streak-inner" d="M12.2 9.9c.3 1.1-.1 2.1-.8 2.9-.8.9-1.5 1.6-1.5 2.9 0 1.3 1 2.4 2.4 2.4 1.5 0 2.6-1.2 2.6-2.7 0-.9-.4-1.9-1.2-2.8 1.6.7 2.8 2.5 2.8 4.4 0 2.6-1.9 4.7-4.4 4.7-2.4 0-4.4-1.9-4.4-4.6 0-2.4 1.4-4.2 2.8-5.5.8-.7 1.4-1.3 1.7-1.7z"></path>
                      <circle class="icon-streak-spark" cx="8.2" cy="5" r="1.1"></circle>
                    </svg>
                  </span>
                  <span class="account-menu-streak">0 days</span>
                </div>
                <div class="account-menu-stat account-menu-stat-achievement">
                  <span class="account-menu-stat-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false" class="account-menu-icon-achievement">
                      <path class="icon-ach-ribbon-left" d="M8.3 14.5 6.1 21l3-1.3 1.9 2.1 1.4-4.5z"></path>
                      <path class="icon-ach-ribbon-right" d="M15.7 14.5 17.9 21l-3-1.3-1.9 2.1-1.4-4.5z"></path>
                      <circle class="icon-ach-medal" cx="12" cy="10.8" r="5.7"></circle>
                      <path class="icon-ach-star" d="m12 7.6 1.1 2.1 2.3.3-1.7 1.6.4 2.2-2.1-1.1-2.1 1.1.4-2.2-1.7-1.6 2.3-.3z"></path>
                    </svg>
                  </span>
                  <span class="account-menu-achievements">0 Achievements</span>
                </div>
              </div>
            </div>
            <div class="account-menu-level"></div>
            <div class="account-menu-xp"></div>
            <div class="account-menu-plan-status">(Free plan)</div>
            <div class="account-menu-xpbar" aria-hidden="true">
              <span class="account-menu-xpfill"></span>
            </div>
          </div>
        </header>
        <section class="account-menu-quests" aria-label="Daily quests">
          <div class="account-menu-quests-head">
            <span class="account-menu-quests-title">Daily Quests</span>
            <span class="account-menu-quests-status">0/3 complete</span>
          </div>
          <div class="account-menu-quest-list">
            <article class="account-menu-quest-item" data-account-quest="practice">
              <div class="account-menu-quest-row">
                <span class="account-menu-quest-label">Practice phrases</span>
                <span class="account-menu-quest-progress">0/5</span>
              </div>
              <span class="account-menu-quest-bar" aria-hidden="true">
                <span class="account-menu-quest-fill"></span>
              </span>
            </article>
            <article class="account-menu-quest-item" data-account-quest="discover">
              <div class="account-menu-quest-row">
                <span class="account-menu-quest-label">Discover worlds</span>
                <span class="account-menu-quest-progress">0/2</span>
              </div>
              <span class="account-menu-quest-bar" aria-hidden="true">
                <span class="account-menu-quest-fill"></span>
              </span>
            </article>
            <article class="account-menu-quest-item" data-account-quest="complete">
              <div class="account-menu-quest-row">
                <span class="account-menu-quest-label">Complete sessions</span>
                <span class="account-menu-quest-progress">0/3</span>
              </div>
              <span class="account-menu-quest-bar" aria-hidden="true">
                <span class="account-menu-quest-fill"></span>
              </span>
            </article>
          </div>
        </section>
        <nav class="account-menu-links" aria-label="Account actions">
          <button type="button" data-menu="premium" class="account-premium-cta">
            <span class="account-premium-main">Discover Premium</span>
            <span class="account-premium-sub">Unlock premium features</span>
          </button>
          <button type="button" data-menu="restore-premium" class="account-manage-restore-premium">Restore Premium</button>
          <button type="button" data-menu="manage">Manage Account</button>
        </nav>
        <div class="account-manage-panel" hidden>
          <section class="account-subscription-panel" hidden>
            <h4>Subscription</h4>
            <p class="account-subscription-note">Manage your Premium plan and billing renewal.</p>
            <div class="account-subscription-status" data-status="active">
              <span class="account-subscription-status-label">Status</span>
              <span class="account-subscription-status-badge">Active</span>
            </div>
            <p class="account-subscription-until" hidden></p>
            <p class="account-subscription-sync" hidden></p>
            <button type="button" class="account-subscription-manage-portal">Manage subscription</button>
          </section>
          <button type="button" class="account-reset-email-button account-manage-reset-email">Reset password</button>
          <section class="account-password-panel" hidden>
            <h4>Password</h4>
            <form class="account-form account-password-change-form">
              <label>Current password <input type="password" name="currentPassword" autocomplete="current-password" minlength="8" required /></label>
              <label>New password <input type="password" name="newPassword" autocomplete="new-password" minlength="8" required /></label>
              <label>Retype new password <input type="password" name="confirmPassword" autocomplete="new-password" minlength="8" required /></label>
              <button type="submit">Update password</button>
              <button type="button" class="account-inline-link account-manage-forgot">Forgot password?</button>
            </form>
          </section>
          <p class="account-password-provider-note" hidden>
            Password changes for Google accounts are managed in your Google account settings.
          </p>
          <button class="account-delete account-delete-trigger" type="button">Delete account</button>
          <div class="account-delete-confirm" hidden>
            <p class="account-delete-warning">Are you sure you want to delete your account? This action cannot be undone.</p>
            <div class="account-delete-actions">
              <button class="account-delete-cancel" type="button">Cancel</button>
              <button class="account-delete account-delete-confirm-btn" type="button">Delete</button>
            </div>
          </div>
          <div class="account-actions-divider" aria-hidden="true"></div>
        </div>
        <button class="account-logout account-logout-trigger" type="button">Logout</button>
        <div class="account-logout-confirm" hidden>
          <p class="account-logout-warning">Are you sure you want to log out?</p>
          <div class="account-logout-actions">
            <button class="account-logout-cancel" type="button">Cancel</button>
            <button class="account-logout account-logout-confirm-btn" type="button">Confirm</button>
          </div>
        </div>
      </section>
    </div>
  `;
  document.body.appendChild(dropdown);

  const premiumSetupOverlay = document.createElement("div");
  premiumSetupOverlay.className = "premium-setup-overlay";
  premiumSetupOverlay.hidden = true;
  premiumSetupOverlay.innerHTML = `
    <section class="premium-setup-card" role="dialog" aria-modal="true" aria-labelledby="premiumSetupTitle">
      <button type="button" class="premium-setup-close" aria-label="Close premium setup">×</button>
      <h3 id="premiumSetupTitle">Unlock Premium Access</h3>
      <p class="premium-setup-message">Upgrade to Premium to unlock all premium maps and features.</p>
      <div class="premium-plan-strip" aria-label="Plan prices">
        <div class="premium-plan-chip premium-plan-chip-free">
          <span class="premium-plan-name">Free</span>
          <span class="premium-plan-price">€0</span>
          <span class="premium-plan-meta">Core learning access</span>
        </div>
        <div class="premium-plan-chip premium-plan-chip-pro">
          <span class="premium-plan-badge">Most popular</span>
          <span class="premium-plan-name">Premium</span>
          <span class="premium-plan-price">€9.99/mo</span>
          <span class="premium-plan-meta">Full premium access</span>
        </div>
      </div>
      <div class="premium-compare" role="table" aria-label="Free and Premium feature comparison">
        <div class="premium-compare-head" role="row">
          <span role="columnheader">Feature</span>
          <span role="columnheader">Free</span>
          <span role="columnheader" class="premium-compare-header-pro">Premium</span>
        </div>
        <div class="premium-compare-row" role="row">
          <span role="cell">Core lessons</span>
          <span role="cell">✓</span>
          <span role="cell" class="premium-compare-pro">✓</span>
        </div>
        <div class="premium-compare-row" role="row">
          <span role="cell">Mimi chat (AI guide)</span>
          <span role="cell" class="premium-compare-muted">—</span>
          <span role="cell" class="premium-compare-pro">✓</span>
        </div>
        <div class="premium-compare-row" role="row">
          <span role="cell">Unlock grammar maps</span>
          <span role="cell" class="premium-compare-muted">—</span>
          <span role="cell" class="premium-compare-pro">✓</span>
        </div>
        <div class="premium-compare-row" role="row">
          <span role="cell">Advanced review tools</span>
          <span role="cell" class="premium-compare-muted">—</span>
          <span role="cell" class="premium-compare-pro">✓</span>
        </div>
      </div>
      <div class="premium-setup-actions">
        <button type="button" class="premium-setup-primary">Upgrade to Premium</button>
        <button type="button" class="premium-setup-secondary">Maybe later</button>
      </div>
    </section>
  `;
  document.body.appendChild(premiumSetupOverlay);

  const premiumCheckoutOverlay = document.createElement("div");
  premiumCheckoutOverlay.className = "premium-checkout-overlay";
  premiumCheckoutOverlay.hidden = true;
  premiumCheckoutOverlay.innerHTML = `
    <section class="premium-checkout-card" role="dialog" aria-modal="true" aria-labelledby="premiumCheckoutTitle">
      <button type="button" class="premium-checkout-close" aria-label="Close checkout">×</button>
      <h3 id="premiumCheckoutTitle">Choose a secure Premium checkout option</h3>
      <p class="premium-checkout-message">You will be redirected to complete your subscription securely.</p>
      <div class="premium-checkout-options" role="list"></div>
      <p class="premium-checkout-note">Payments are handled by our secure billing provider.</p>
      <p class="premium-checkout-feedback" aria-live="polite"></p>
      <div class="premium-checkout-actions">
        <button type="button" class="premium-checkout-primary">Proceed</button>
        <button type="button" class="premium-checkout-secondary">Cancel</button>
      </div>
    </section>
  `;
  document.body.appendChild(premiumCheckoutOverlay);

  const premiumSuccessOverlay = document.createElement("div");
  premiumSuccessOverlay.className = "premium-checkout-overlay premium-success-overlay";
  premiumSuccessOverlay.hidden = true;
  premiumSuccessOverlay.innerHTML = `
    <section class="premium-setup-card premium-success-card premium-celebration-card" role="dialog" aria-modal="true" aria-labelledby="premiumSuccessTitle">
      <button type="button" class="premium-checkout-close premium-success-close" aria-label="Close celebration">×</button>
      <div class="premium-celebration-layout">
        <div class="premium-celebration-copy">
          <h3 id="premiumSuccessTitle">Welcome to Cosmica Premium</h3>
          <p class="premium-setup-message premium-success-message">Your subscription is now active. Wishing you a joyful learning journey and beautiful exploration across every world in Cosmica.</p>
          <div class="premium-success-benefits" aria-label="Premium unlocked features">
            <p>✓ Full premium map access is unlocked.</p>
            <p>✓ Mimi chat and advanced practice tools are ready.</p>
            <p>✓ Your progress, streak, and level continue seamlessly.</p>
          </div>
          <div class="premium-setup-actions premium-success-actions">
            <button type="button" class="premium-setup-primary premium-success-cta">Start exploring</button>
          </div>
        </div>
        <div class="premium-celebration-mimi" aria-hidden="true">
          <div class="alien mood-happy is-waving">
            <div class="alien-glow"></div>
            <div class="alien-head">
              <div class="alien-antenna"></div>
              <div class="alien-antenna right"></div>
              <div class="alien-eye left"></div>
              <div class="alien-eye right"></div>
              <div class="alien-blush left"></div>
              <div class="alien-blush right"></div>
              <div class="alien-mouth">
                <svg viewBox="0 0 64 32" aria-hidden="true">
                  <path d="M10 10 C 22 26, 42 26, 54 10" />
                </svg>
              </div>
            </div>
            <div class="alien-body">
              <div class="alien-arm left"></div>
              <div class="alien-arm right"></div>
            </div>
            <div class="alien-tail"></div>
          </div>
        </div>
      </div>
    </section>
  `;
  document.body.appendChild(premiumSuccessOverlay);

  const feedbackNode = dropdown.querySelector(".account-feedback");
  const guestPane = dropdown.querySelector(".account-guest-pane");
  const userPane = dropdown.querySelector(".account-user-pane");
  const loginForm = dropdown.querySelector(".login-form");
  const signupForm = dropdown.querySelector(".signup-form");
  const resetForm = dropdown.querySelector(".reset-form");
  const resendVerificationBtn = dropdown.querySelector(".account-resend-button");
  const resendVerificationSignupBtn = dropdown.querySelector(".account-resend-button-signup");
  const loginForgotPasswordBtn = dropdown.querySelector(".account-login-forgot");
  const resetBackToLoginBtn = dropdown.querySelector(".account-reset-back-login");
  const logoutBtn = dropdown.querySelector(".account-logout-trigger");
  const logoutConfirmPanel = dropdown.querySelector(".account-logout-confirm");
  const logoutCancelBtn = dropdown.querySelector(".account-logout-cancel");
  const logoutConfirmBtn = dropdown.querySelector(".account-logout-confirm-btn");
  const deleteTriggerBtn = dropdown.querySelector(".account-delete-trigger");
  const deleteConfirmPanel = dropdown.querySelector(".account-delete-confirm");
  const deleteCancelBtn = dropdown.querySelector(".account-delete-cancel");
  const deleteConfirmBtn = dropdown.querySelector(".account-delete-confirm-btn");
  const deleteWarningNode = dropdown.querySelector(".account-delete-warning");
  const googleButtons = Array.from(dropdown.querySelectorAll(".account-google-button"));
  const menuButtons = Array.from(dropdown.querySelectorAll(".account-menu-links button"));
  const authSwitchButtons = Array.from(dropdown.querySelectorAll(".account-auth-switch button"));
  const authPanelNodes = Array.from(dropdown.querySelectorAll("[data-auth-panel-content]"));
  const accountDropdownCard = dropdown.querySelector(".account-dropdown-card");
  const managePanel = dropdown.querySelector(".account-manage-panel");
  const subscriptionPanel = dropdown.querySelector(".account-subscription-panel");
  const userMenuLinks = dropdown.querySelector(".account-menu-links");
  const subscriptionStatusNode = dropdown.querySelector(".account-subscription-status");
  const subscriptionStatusBadge = dropdown.querySelector(".account-subscription-status-badge");
  const subscriptionUntilNode = dropdown.querySelector(".account-subscription-until");
  const subscriptionSyncNode = dropdown.querySelector(".account-subscription-sync");
  const subscriptionManagePortalBtn = dropdown.querySelector(".account-subscription-manage-portal");
  const passwordPanel = dropdown.querySelector(".account-password-panel");
  const passwordProviderNote = dropdown.querySelector(".account-password-provider-note");
  const passwordChangeForm = dropdown.querySelector(".account-password-change-form");
  const manageResetEmailBtn = dropdown.querySelector(".account-manage-reset-email");
  const manageRestorePremiumBtn = dropdown.querySelector(".account-manage-restore-premium");
  const manageForgotPasswordBtn = dropdown.querySelector(".account-manage-forgot");
  const menuAvatar = dropdown.querySelector(".account-menu-avatar");
  const menuHeader = dropdown.querySelector(".account-menu-header");
  const menuSummary = dropdown.querySelector(".account-menu-summary");
  const menuName = dropdown.querySelector(".account-menu-name");
  const menuLevel = dropdown.querySelector(".account-menu-level");
  const menuXp = dropdown.querySelector(".account-menu-xp");
  const menuPlanStatus = dropdown.querySelector(".account-menu-plan-status");
  const menuXpBar = dropdown.querySelector(".account-menu-xpbar");
  const menuXpFill = dropdown.querySelector(".account-menu-xpfill");
  const menuStreak = dropdown.querySelector(".account-menu-streak");
  const menuAchievements = dropdown.querySelector(".account-menu-achievements");
  const menuQuestsPanel = dropdown.querySelector(".account-menu-quests");
  const menuQuestStatus = dropdown.querySelector(".account-menu-quests-status");
  const menuQuestItems = {
    practice: dropdown.querySelector('[data-account-quest="practice"]'),
    discover: dropdown.querySelector('[data-account-quest="discover"]'),
    complete: dropdown.querySelector('[data-account-quest="complete"]'),
  };
  const premiumCtaBtn = dropdown.querySelector('[data-menu="premium"]');
  const premiumCtaMain = premiumCtaBtn?.querySelector(".account-premium-main") || null;
  const premiumCtaSub = premiumCtaBtn?.querySelector(".account-premium-sub") || null;
  const premiumSetupCard = premiumSetupOverlay.querySelector(".premium-setup-card");
  const premiumSetupMessage = premiumSetupOverlay.querySelector(".premium-setup-message");
  const premiumSetupCloseBtn = premiumSetupOverlay.querySelector(".premium-setup-close");
  const premiumSetupPrimaryBtn = premiumSetupOverlay.querySelector(".premium-setup-primary");
  const premiumSetupSecondaryBtn = premiumSetupOverlay.querySelector(".premium-setup-secondary");
  const premiumCheckoutCard = premiumCheckoutOverlay.querySelector(".premium-checkout-card");
  const premiumCheckoutCloseBtn = premiumCheckoutOverlay.querySelector(".premium-checkout-close");
  const premiumCheckoutOptionsNode = premiumCheckoutOverlay.querySelector(".premium-checkout-options");
  const premiumCheckoutFeedback = premiumCheckoutOverlay.querySelector(".premium-checkout-feedback");
  const premiumCheckoutPrimaryBtn = premiumCheckoutOverlay.querySelector(".premium-checkout-primary");
  const premiumCheckoutSecondaryBtn = premiumCheckoutOverlay.querySelector(".premium-checkout-secondary");
  const premiumSuccessCard = premiumSuccessOverlay.querySelector(".premium-success-card");
  const premiumSuccessCloseBtn = premiumSuccessOverlay.querySelector(".premium-success-close");
  const premiumSuccessCtaBtn = premiumSuccessOverlay.querySelector(".premium-success-cta");
  let selectedPremiumCheckoutOption = null;
  let premiumCheckoutOptionsReady = false;
  let isSubscriptionPanelExpanded = false;
  let activeAuthPanel = "login";
  let lastPremiumFocusNode = null;
  const triggerNoticeBubble = document.createElement("p");
  triggerNoticeBubble.className = "account-trigger-bubble";
  triggerNoticeBubble.hidden = true;
  triggerNoticeBubble.setAttribute("aria-live", "polite");
  document.body.appendChild(triggerNoticeBubble);

  const formatNumber = (value) => Intl.NumberFormat().format(Math.max(0, Math.round(Number(value) || 0)));
  const guestAvatarIconMarkup =
    '<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M12 12.2a4.6 4.6 0 1 0 0-9.2 4.6 4.6 0 0 0 0 9.2zm0 2.2c-4.7 0-8.5 2.8-8.5 6.3 0 .7.5 1.3 1.2 1.3h14.6c.7 0 1.2-.6 1.2-1.3 0-3.5-3.8-6.3-8.5-6.3z"></path></svg>';

  if (subscriptionPanel) {
    const premiumAnchorParent = premiumCtaBtn?.parentElement || null;
    const isAnchoredUnderPremiumButton =
      Boolean(premiumAnchorParent) &&
      subscriptionPanel.parentElement === premiumAnchorParent &&
      subscriptionPanel.previousElementSibling === premiumCtaBtn;
    if (!isAnchoredUnderPremiumButton && premiumCtaBtn) {
      subscriptionPanel.remove();
      premiumCtaBtn.insertAdjacentElement("afterend", subscriptionPanel);
    } else if (
      !premiumCtaBtn &&
      managePanel &&
      userMenuLinks &&
      subscriptionPanel.parentElement === managePanel
    ) {
      subscriptionPanel.remove();
      userMenuLinks.insertAdjacentElement("afterend", subscriptionPanel);
    }
    subscriptionPanel.hidden = true;
  }
  const formatPremiumEndDate = (value) => {
    const raw = String(value || "").trim();
    if (!raw) {
      return "";
    }
    const parsed = new Date(raw);
    if (!Number.isFinite(parsed.getTime())) {
      return "";
    }
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(parsed);
    } catch {
      return parsed.toISOString().slice(0, 10);
    }
  };
  const resolvePremiumEndDateFromSnapshot = (snapshot) => {
    const user = snapshot?.user && typeof snapshot.user === "object" ? snapshot.user : {};
    const candidates = [
      user.premiumEndsAt,
      user.premiumExpiresAt,
      user.subscriptionEndsAt,
      user.currentPeriodEnd,
      user.planEndsAt,
      user.expiresAt,
    ];
    for (const candidate of candidates) {
      const formatted = formatPremiumEndDate(candidate);
      if (formatted) {
        return formatted;
      }
    }
    return "";
  };
  const getDeleteWarningMessage = (snapshot, hasPremiumAccess) => {
    if (!hasPremiumAccess) {
      return "Are you sure you want to delete your account? This action cannot be undone.";
    }
    const premiumEndDate = resolvePremiumEndDateFromSnapshot(snapshot);
    const accessLine = premiumEndDate
      ? `If you register again with the same account email before ${premiumEndDate}, your Premium access remains available until your current subscription period ends.`
      : "If you register again with the same account email while your current subscription is still active, your Premium access remains available until your current subscription period ends.";
    return `Are you sure you want to permanently delete your account? This action cannot be undone. ${accessLine} You can restore Premium later by pressing the "Restore Premium" button.`;
  };
  const toAvatarTwoLetters = (value, fallback = "GU") => {
    const chars = Array.from(String(value || "").replace(/\s+/g, "").trim());
    if (!chars.length) {
      return fallback;
    }
    return chars.slice(0, 2).join("").toUpperCase();
  };
  let pendingAuthNoticeMessage = "";
  let pendingAuthNoticeTone = "error";
  let pendingPasswordResetToken = "";
  let pendingAuthEmailPrefill = "";
  let shouldAutoOpenAuthDropdown = false;
  let currentAuthProvider = "";
  let currentUserEmail = "";
  let triggerNoticeTimerId = 0;
  let passwordProviderNoteAlertTimerId = 0;
  let authRedirectFeedbackLock = false;
  let authRedirectFeedbackLockTimerId = 0;
  let noActivePlanFeedbackTimerId = 0;
  let latestSubscriptionManageState = null;
  let subscriptionManageInFlight = false;
  let subscriptionPortalInFlight = false;
  let overlayBodyLockActive = false;
  let overlayBodyLockScrollY = 0;
  let premiumModalTouchStartY = 0;
  let pendingPremiumWelcomeMode = "";
  let hasShownPremiumWelcome = false;
  let authDropdownTouchStartY = 0;
  let logoutConfirmArmedAtMs = 0;

  const setFeedback = (message, tone = "") => {
    if (!feedbackNode) {
      return;
    }
    feedbackNode.textContent = String(message || "");
    feedbackNode.dataset.tone = tone;
  };

  const scheduleNoActivePlanFeedbackAutoClear = (durationMs = 2500) => {
    if (noActivePlanFeedbackTimerId) {
      window.clearTimeout(noActivePlanFeedbackTimerId);
      noActivePlanFeedbackTimerId = 0;
    }
    noActivePlanFeedbackTimerId = window.setTimeout(() => {
      noActivePlanFeedbackTimerId = 0;
      if (!feedbackNode) {
        return;
      }
      const currentMessage = String(feedbackNode.textContent || "").trim().toLowerCase();
      const currentTone = String(feedbackNode.dataset?.tone || "").trim().toLowerCase();
      if (currentMessage === "no active premium plan found." && currentTone === "error") {
        setFeedback("");
      }
    }, Math.max(2000, Number(durationMs) || 2500));
  };

  const setAuthRedirectFeedbackLock = (durationMs = 9000) => {
    authRedirectFeedbackLock = true;
    if (authRedirectFeedbackLockTimerId) {
      window.clearTimeout(authRedirectFeedbackLockTimerId);
      authRedirectFeedbackLockTimerId = 0;
    }
    authRedirectFeedbackLockTimerId = window.setTimeout(() => {
      authRedirectFeedbackLock = false;
      authRedirectFeedbackLockTimerId = 0;
    }, Math.max(1200, Number(durationMs) || 9000));
  };

  const positionTriggerNoticeBubble = () => {
    if (triggerNoticeBubble.hidden || !trigger) {
      return;
    }
    const triggerRect = trigger.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    const bubbleRect = triggerNoticeBubble.getBoundingClientRect();
    const bubbleWidth = bubbleRect.width || 260;
    const left = Math.max(8, Math.min(window.innerWidth - bubbleWidth - 8, triggerRect.right - bubbleWidth));
    const top = Math.max(8, navRect.bottom + 8);
    triggerNoticeBubble.style.left = `${left}px`;
    triggerNoticeBubble.style.top = `${top}px`;
  };

  const hideTriggerNoticeBubble = () => {
    if (triggerNoticeTimerId) {
      window.clearTimeout(triggerNoticeTimerId);
      triggerNoticeTimerId = 0;
    }
    triggerNoticeBubble.hidden = true;
    triggerNoticeBubble.textContent = "";
    triggerNoticeBubble.removeAttribute("data-tone");
    triggerNoticeBubble.style.left = "";
    triggerNoticeBubble.style.top = "";
  };

  const showTriggerNoticeBubble = (message, tone = "error", durationMs = 9000) => {
    const text = String(message || "").trim();
    if (!text) {
      hideTriggerNoticeBubble();
      return;
    }
    if (triggerNoticeTimerId) {
      window.clearTimeout(triggerNoticeTimerId);
      triggerNoticeTimerId = 0;
    }
    triggerNoticeBubble.textContent = text;
    triggerNoticeBubble.dataset.tone = String(tone || "error");
    triggerNoticeBubble.hidden = false;
    positionTriggerNoticeBubble();
    window.requestAnimationFrame(positionTriggerNoticeBubble);
    triggerNoticeTimerId = window.setTimeout(() => {
      hideTriggerNoticeBubble();
    }, Math.max(1200, Number(durationMs) || 9000));
  };

  const scrollExpandedAccountPanelIntoView = (panelNode) => {
    if (!(panelNode instanceof HTMLElement)) {
      return;
    }
    window.requestAnimationFrame(() => {
      const scrollSurface = dropdown.querySelector(".account-dropdown-card");
      if (!(scrollSurface instanceof HTMLElement)) {
        return;
      }
      const surfaceRect = scrollSurface.getBoundingClientRect();
      const panelRect = panelNode.getBoundingClientRect();
      const currentTop = scrollSurface.scrollTop;
      const relativeTop = panelRect.top - surfaceRect.top;
      const nextTop = currentTop + relativeTop - (scrollSurface.clientHeight - panelRect.height) / 2;
      scrollSurface.scrollTo({
        top: Math.max(0, Math.round(nextTop)),
        behavior: "smooth",
      });
    });
  };

  const setDeleteConfirmationVisible = (visible) => {
    if (deleteTriggerBtn) {
      deleteTriggerBtn.hidden = visible;
    }
    if (!deleteConfirmPanel) {
      return;
    }
    deleteConfirmPanel.hidden = !visible;
    if (visible) {
      scrollExpandedAccountPanelIntoView(deleteConfirmPanel);
    }
  };

  const setLogoutConfirmationVisible = (visible) => {
    if (!logoutConfirmPanel) {
      return;
    }
    logoutConfirmPanel.hidden = !visible;
    if (!visible) {
      logoutConfirmArmedAtMs = 0;
    }
    if (visible) {
      logoutConfirmArmedAtMs = Date.now();
      scrollExpandedAccountPanelIntoView(logoutConfirmPanel);
    }
  };

  const resolveSubscriptionStatusDisplay = ({ status = "", cancelAtPeriodEnd = false } = {}) => {
    const normalizedStatus = String(status || "").trim().toLowerCase();
    if (cancelAtPeriodEnd || normalizedStatus === "canceling") {
      return {
        key: "canceling",
        label: "Cancels at period end",
      };
    }
    if (normalizedStatus === "active" || normalizedStatus === "trialing" || normalizedStatus === "past_due") {
      return {
        key: "active",
        label: "Active",
      };
    }
    return {
      key: "expired",
      label: "Inactive",
    };
  };

  const applySubscriptionManagementState = (state = {}, { loading = false } = {}) => {
    const next = state && typeof state === "object" ? state : {};
    const cancelAtPeriodEnd = next.cancelAtPeriodEnd === true;
    const statusDisplay = resolveSubscriptionStatusDisplay({
      status: next.status,
      cancelAtPeriodEnd,
    });
    const untilDate = formatPremiumEndDate(next.currentPeriodEnd || "");
    if (subscriptionStatusNode) {
      subscriptionStatusNode.dataset.status = statusDisplay.key;
    }
    if (subscriptionStatusBadge) {
      subscriptionStatusBadge.textContent = statusDisplay.label;
    }
    if (subscriptionUntilNode) {
      if (untilDate) {
        subscriptionUntilNode.textContent = `Access until ${untilDate}`;
        subscriptionUntilNode.hidden = false;
      } else {
        subscriptionUntilNode.hidden = true;
        subscriptionUntilNode.textContent = "";
      }
    }
    if (subscriptionSyncNode) {
      if (loading) {
        subscriptionSyncNode.textContent = "";
        subscriptionSyncNode.hidden = true;
      } else {
        const message = String(next.message || "").trim();
        subscriptionSyncNode.textContent = message;
        subscriptionSyncNode.hidden = !message;
      }
    }
    if (subscriptionManagePortalBtn) {
      subscriptionManagePortalBtn.hidden = loading;
      subscriptionManagePortalBtn.disabled = loading || subscriptionPortalInFlight;
      subscriptionManagePortalBtn.textContent = subscriptionPortalInFlight
        ? "Opening..."
        : "Manage subscription";
    }
  };

  const flashGooglePasswordNote = () => {
    if (!(passwordProviderNote instanceof HTMLElement)) {
      return;
    }
    if (passwordProviderNoteAlertTimerId) {
      window.clearTimeout(passwordProviderNoteAlertTimerId);
      passwordProviderNoteAlertTimerId = 0;
    }
    passwordProviderNote.classList.remove("is-alert");
    void passwordProviderNote.offsetWidth;
    passwordProviderNote.classList.add("is-alert");
    passwordProviderNoteAlertTimerId = window.setTimeout(() => {
      passwordProviderNote.classList.remove("is-alert");
      passwordProviderNoteAlertTimerId = 0;
    }, 1600);
  };

  const setInputInvalidState = (input, invalid) => {
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const isInvalid = Boolean(invalid);
    input.classList.toggle("is-invalid", isInvalid);
    if (isInvalid) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
  };

  const validateRequiredInput = (input) => {
    if (!(input instanceof HTMLInputElement)) {
      return true;
    }
    const rawValue = String(input.value || "");
    const hasValue = input.type === "password" ? rawValue.length > 0 : rawValue.trim().length > 0;
    setInputInvalidState(input, !hasValue);
    return hasValue;
  };

  const validateEmailInput = (input, { required = true } = {}) => {
    if (!(input instanceof HTMLInputElement)) {
      return true;
    }
    const value = String(input.value || "").trim();
    if (!value) {
      const validIfEmpty = !required;
      setInputInvalidState(input, !validIfEmpty);
      return validIfEmpty;
    }
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 160;
    setInputInvalidState(input, !isValid);
    return isValid;
  };

  const bindLiveInputValidation = (formNode) => {
    if (!(formNode instanceof HTMLFormElement)) {
      return;
    }
    formNode.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        if (!input.classList.contains("is-invalid")) {
          return;
        }
        if (input.type === "email") {
          validateEmailInput(input, { required: true });
          return;
        }
        validateRequiredInput(input);
      });
    });
  };

  const setResendButtonVisible = (visible) => {
    if (!resendVerificationBtn) {
      return;
    }
    resendVerificationBtn.hidden = !Boolean(visible);
  };

  const setSignupResendButtonVisible = (visible) => {
    if (!resendVerificationSignupBtn) {
      return;
    }
    resendVerificationSignupBtn.hidden = !Boolean(visible);
  };

  const consumeAuthErrorFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const rawCode = String(params.get("authError") || "").trim().toLowerCase();
    const rawPasswordResetToken = String(params.get("passwordResetToken") || "").trim();
    const rawAuthEmail = String(params.get("authEmail") || "").trim().toLowerCase();
    const rawOpenAuth = String(params.get("openAuth") || "").trim().toLowerCase();
    const rawAuthPanel = String(params.get("authPanel") || "").trim().toLowerCase();
    if (rawPasswordResetToken) {
      pendingPasswordResetToken = rawPasswordResetToken;
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawAuthEmail) && rawAuthEmail.length <= 160) {
      pendingAuthEmailPrefill = rawAuthEmail;
    }
    const forceOpenAuth =
      rawOpenAuth === "1" || rawOpenAuth === "true" || rawOpenAuth === "yes" || rawOpenAuth === "open";
    const forcedPanel = rawAuthPanel === "signup" ? "signup" : rawAuthPanel === "reset" ? "reset" : "login";
    if (!rawCode) {
      if (forceOpenAuth) {
        shouldAutoOpenAuthDropdown = true;
        activeAuthPanel = forcedPanel;
      }
      if (rawPasswordResetToken || rawAuthEmail || rawOpenAuth || rawAuthPanel) {
        params.delete("passwordResetToken");
        params.delete("authEmail");
        params.delete("openAuth");
        params.delete("authPanel");
        const nextQuery = params.toString();
        const nextUrl =
          window.location.pathname + (nextQuery ? `?${nextQuery}` : "") + window.location.hash;
        window.history.replaceState({}, "", nextUrl);
      }
      return;
    }
    const authErrorTextMap = {
      google_no_account: {
        message: "We couldn’t complete Google sign-in for this email right now. If this account already exists, please try Log in with Google account again.",
        tone: "error",
        panel: "signup",
      },
      google_account_exists: {
        message: "Account already exists. Use Log in with Google account.",
        tone: "error",
        panel: "login",
      },
      google_account_exists_email: {
        message: "Log in using your email and password.",
        tone: "error",
        panel: "login",
      },
      google_username_taken: {
        message: "Username is already taken. Choose a different username in Sign up.",
        tone: "error",
        panel: "signup",
      },
      google_flow: {
        message: "Google auth flow expired or mismatched. Start again from this panel.",
        tone: "error",
        panel: "login",
      },
      google_access_denied: {
        message: "Google sign-in was cancelled.",
        tone: "error",
        panel: "login",
      },
      email_verified: {
        message: "Account already verified. You can log in now.",
        tone: "success",
        panel: "login",
      },
      email_verify_invalid: {
        message: "Account already verified or link already used. You can log in now.",
        tone: "success",
        panel: "login",
      },
      email_verify_expired: {
        message: "Verification link expired. Please verify email again.",
        tone: "warning",
        panel: "login",
      },
      password_reset_ready: {
        message: "Reset link confirmed. Set your new password.",
        tone: "success",
        panel: "reset",
      },
      password_reset_invalid: {
        message: "Reset link is invalid. Request a new password reset email.",
        tone: "error",
        panel: "login",
      },
      password_reset_expired: {
        message: "Reset link expired. Request a new password reset email.",
        tone: "error",
        panel: "login",
      },
    };
    const fallbackNotice = {
      message: "Google authentication failed. Please try again.",
      tone: "error",
      panel: "login",
    };
    let resolvedNotice = authErrorTextMap[rawCode] || fallbackNotice;
    if (rawCode === "password_reset_ready" && !pendingPasswordResetToken) {
      resolvedNotice = authErrorTextMap.password_reset_invalid || fallbackNotice;
    }
    const resolvedMessage = String(resolvedNotice.message || "").trim();
    const resolvedTone = String(resolvedNotice.tone || "error").trim() || "error";
    pendingAuthNoticeMessage = resolvedMessage;
    pendingAuthNoticeTone = resolvedTone;
    if (
      rawCode.startsWith("password_reset_") ||
      rawCode === "email_verified" ||
      rawCode === "email_verify_invalid" ||
      rawCode === "email_verify_expired"
    ) {
      shouldAutoOpenAuthDropdown = true;
    }
    if (forceOpenAuth) {
      shouldAutoOpenAuthDropdown = true;
      activeAuthPanel = forcedPanel;
    }
    if (resolvedNotice.panel) {
      const panelValue = String(resolvedNotice.panel).trim().toLowerCase();
      activeAuthPanel = panelValue === "signup" ? "signup" : panelValue === "reset" ? "reset" : "login";
    }
    params.delete("authError");
    params.delete("passwordResetToken");
    params.delete("authEmail");
    params.delete("openAuth");
    params.delete("authPanel");
    const nextQuery = params.toString();
    const nextUrl =
      window.location.pathname + (nextQuery ? `?${nextQuery}` : "") + window.location.hash;
    window.history.replaceState({}, "", nextUrl);
  };

  const consumeAccountDeletedNoticeFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const accountDeletedRaw = String(params.get("accountDeleted") || "").trim().toLowerCase();
    const deleteNoticeRaw = String(params.get("deleteNotice") || "").trim();
    const shouldShowNotice =
      accountDeletedRaw === "1" ||
      accountDeletedRaw === "true" ||
      accountDeletedRaw === "yes" ||
      accountDeletedRaw === "deleted";

    if (!shouldShowNotice && !deleteNoticeRaw) {
      return;
    }

    const resolvedMessage =
      deleteNoticeRaw ||
      "Your account and associated learning data have been permanently deleted.";
    showTriggerNoticeBubble(resolvedMessage, "success", 10000);

    params.delete("accountDeleted");
    params.delete("deleteNotice");
    const nextQuery = params.toString();
    const nextUrl =
      window.location.pathname + (nextQuery ? `?${nextQuery}` : "") + window.location.hash;
    window.history.replaceState({}, "", nextUrl);
  };

  const consumePremiumCheckoutNoticeFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const premiumState = String(params.get("premium") || "")
      .trim()
      .toLowerCase();
    if (premiumState === "success") {
      pendingPremiumWelcomeMode = "success";
      hasShownPremiumWelcome = false;
    } else if (premiumState === "test") {
      pendingPremiumWelcomeMode = "test";
      hasShownPremiumWelcome = false;
    } else if (premiumState === "cancel") {
      showTriggerNoticeBubble("Premium checkout was cancelled. No charge was made.", "info", 7000);
    }
    if (!premiumState) {
      return;
    }
    params.delete("premium");
    params.delete("session_id");
    const nextQuery = params.toString();
    const nextUrl =
      window.location.pathname + (nextQuery ? `?${nextQuery}` : "") + window.location.hash;
    window.history.replaceState({}, "", nextUrl);
  };

  consumeAuthErrorFromUrl();
  consumeAccountDeletedNoticeFromUrl();
  consumePremiumCheckoutNoticeFromUrl();
  loginForm?.setAttribute("novalidate", "novalidate");
  signupForm?.setAttribute("novalidate", "novalidate");
  resetForm?.setAttribute("novalidate", "novalidate");
  passwordChangeForm?.setAttribute("novalidate", "novalidate");
  bindLiveInputValidation(loginForm);
  bindLiveInputValidation(signupForm);
  bindLiveInputValidation(resetForm);
  bindLiveInputValidation(passwordChangeForm);
  signupForm?.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      if (!resendVerificationSignupBtn?.hidden) {
        setSignupResendButtonVisible(false);
      }
    });
  });

  const setAuthPanel = (panelKey, shouldFocus = false) => {
    const requested = String(panelKey || "").trim().toLowerCase();
    const normalized =
      requested === "signup" ? "signup" : requested === "reset" ? "reset" : "login";
    activeAuthPanel = normalized;
    if (normalized !== "login") {
      setResendButtonVisible(false);
    }
    if (normalized !== "signup") {
      setSignupResendButtonVisible(false);
    }
    authSwitchButtons.forEach((button) => {
      const isActive = String(button.dataset.authPanel || "").trim().toLowerCase() === normalized;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    authPanelNodes.forEach((panel) => {
      const panelKeyValue = String(panel.dataset.authPanelContent || "").trim().toLowerCase();
      panel.hidden = panelKeyValue !== normalized;
    });
    if (normalized === "login" && pendingAuthEmailPrefill) {
      const loginEmailInput = loginForm?.querySelector('input[name="email"]');
      if (loginEmailInput) {
        loginEmailInput.value = pendingAuthEmailPrefill;
        setInputInvalidState(loginEmailInput, false);
      }
      pendingAuthEmailPrefill = "";
    }
    if (shouldFocus) {
      const activeField =
        (normalized === "signup"
          ? signupForm
          : normalized === "reset"
            ? resetForm
            : loginForm
        )?.querySelector('input[name="email"], input[name="newPassword"]');
      activeField?.focus?.();
    }
  };

  const resolveInitialFocusElement = () => {
    if (userPane && !userPane.hidden) {
      return logoutBtn;
    }
    const activePanelNode =
      authPanelNodes.find((panel) => !panel.hidden) || loginForm || signupForm;
    return (
      activePanelNode?.querySelector?.('input[name="email"], input[name="newPassword"]') ||
      loginForm?.querySelector('input[name="email"]')
    );
  };

  const startGoogleAuth = async (mode = "login") => {
    const normalizedMode = String(mode || "").trim().toLowerCase() === "signup" ? "signup" : "login";
    setFeedback("");
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const endpoint = `/api/auth/google/start/${normalizedMode}?returnTo=${encodeURIComponent(returnTo)}`;
    const legacyEndpoint = `/api/auth/google/start?mode=${encodeURIComponent(normalizedMode)}&returnTo=${encodeURIComponent(returnTo)}`;
    try {
      const requestOptions = {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      };
      const endpoints = [endpoint];
      if (legacyEndpoint !== endpoint) {
        endpoints.push(legacyEndpoint);
      }

      let lastErrorMessage = "";

      for (const url of endpoints) {
        const response = await fetch(url, requestOptions);
        const contentType = String(response.headers.get("content-type") || "").toLowerCase();
        let payload = null;
        let rawText = "";

        if (contentType.includes("application/json")) {
          try {
            payload = await response.json();
          } catch {}
        } else {
          try {
            rawText = String(await response.text() || "");
            if (rawText.trim().startsWith("{")) {
              payload = JSON.parse(rawText);
            }
          } catch {}
        }

        if (response.ok && payload?.redirectUrl) {
          window.location.assign(String(payload.redirectUrl));
          return;
        }

        const htmlSnippet = rawText.slice(0, 320);
        const returnedHtml =
          contentType.includes("text/html") || /<!doctype\s+html|<html[\s>]/i.test(htmlSnippet);

        if (returnedHtml) {
          lastErrorMessage =
            "Google authentication endpoint returned website HTML instead of API JSON. Ensure the app is running through the backend server and /api routes are not being rewritten to index.html.";
          continue;
        }

        if (response.status === 404) {
          lastErrorMessage = `Google authentication endpoint not found (${response.status}).`;
          continue;
        }

        lastErrorMessage = String(
          payload?.error || `Google authentication unavailable (${response.status})`
        );
      }

      throw new Error(lastErrorMessage || "Google authentication is unavailable right now.");
    } catch (error) {
      setFeedback(error?.message || "Google authentication is unavailable right now.", "error");
    }
  };

  const positionDropdown = () => {
    if (dropdown.hidden) {
      return;
    }
    const triggerRect = trigger.getBoundingClientRect();
    const pageScrollX = window.scrollX || window.pageXOffset || 0;
    const pageScrollY = window.scrollY || window.pageYOffset || 0;
    const width = Math.min(360, Math.max(280, window.innerWidth - 16));
    dropdown.style.width = `${width}px`;
    const maxLeft = Math.max(8, window.innerWidth - width - 8);
    const left = Math.max(8, Math.min(maxLeft, triggerRect.right - width));
    const top = Math.max(12, triggerRect.bottom + 24);
    dropdown.style.left = `${left + pageScrollX}px`;
    dropdown.style.top = `${top + pageScrollY}px`;
  };

  const openDropdown = () => {
    dropdown.hidden = false;
    trigger?.setAttribute("aria-expanded", "true");
    hideTriggerNoticeBubble();
    dropdown.scrollTop = 0;
    const scrollSurface = accountDropdownCard;
    if (scrollSurface) {
      scrollSurface.scrollTop = 0;
    }
    syncAuthDropdownBodyLock();
    if (pendingAuthNoticeMessage) {
      setFeedback(pendingAuthNoticeMessage, pendingAuthNoticeTone);
      setAuthRedirectFeedbackLock(10000);
      pendingAuthNoticeMessage = "";
      pendingAuthNoticeTone = "error";
    }
    positionDropdown();
    window.setTimeout(() => {
      resolveInitialFocusElement()?.focus?.();
    }, 20);
  };

  const closeDropdown = () => {
    dropdown.hidden = true;
    trigger?.setAttribute("aria-expanded", "false");
    syncAuthDropdownBodyLock();
    hideTriggerNoticeBubble();
    setLogoutConfirmationVisible(false);
    setDeleteConfirmationVisible(false);
    authRedirectFeedbackLock = false;
    if (authRedirectFeedbackLockTimerId) {
      window.clearTimeout(authRedirectFeedbackLockTimerId);
      authRedirectFeedbackLockTimerId = 0;
    }
    if (passwordProviderNoteAlertTimerId) {
      window.clearTimeout(passwordProviderNoteAlertTimerId);
      passwordProviderNoteAlertTimerId = 0;
    }
    passwordProviderNote?.classList.remove("is-alert");
    if (managePanel) {
      managePanel.hidden = true;
    }
    isSubscriptionPanelExpanded = false;
    if (subscriptionPanel) {
      subscriptionPanel.hidden = true;
    }
  };

  const scrollMenuPanelIntoView = (panelNode, { behavior = "smooth", block = "center" } = {}) => {
    if (!(panelNode instanceof HTMLElement)) {
      return;
    }
    const scrollSurface = accountDropdownCard;
    if (!(scrollSurface instanceof HTMLElement)) {
      return;
    }
    const surfaceRect = scrollSurface.getBoundingClientRect();
    const panelRect = panelNode.getBoundingClientRect();
    const currentTop = scrollSurface.scrollTop;
    const relativeTop = panelRect.top - surfaceRect.top;
    let nextTop = currentTop + relativeTop;
    if (block === "center") {
      nextTop = currentTop + relativeTop - (scrollSurface.clientHeight - panelRect.height) / 2;
    } else if (block === "end") {
      nextTop = currentTop + relativeTop - (scrollSurface.clientHeight - panelRect.height);
    }
    scrollSurface.scrollTo({
      top: Math.max(0, Math.round(nextTop)),
      behavior,
    });
  };

  const scrollAuthDropdownToTop = (behavior = "smooth") => {
    dropdown.scrollTop = 0;
    const scrollSurface = accountDropdownCard;
    if (!(scrollSurface instanceof HTMLElement)) {
      return;
    }
    scrollSurface.scrollTo({ top: 0, behavior });
  };

  const syncOverlayBodyLock = () => {
    const hasOpenPremiumModal =
      !premiumSetupOverlay.hidden || !premiumCheckoutOverlay.hidden || !premiumSuccessOverlay.hidden;
    const hasOpenAccountMenu = !dropdown.hidden;
    const shouldLock = hasOpenPremiumModal || hasOpenAccountMenu;
    if (shouldLock && !overlayBodyLockActive) {
      overlayBodyLockScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
      document.body.style.top = `-${overlayBodyLockScrollY}px`;
      overlayBodyLockActive = true;
    } else if (!shouldLock && overlayBodyLockActive) {
      document.body.classList.remove("premium-setup-lock", "account-dropdown-lock");
      document.documentElement.classList.remove("premium-setup-lock", "account-dropdown-lock");
      document.body.style.top = "";
      window.scrollTo({ top: overlayBodyLockScrollY, left: 0, behavior: "auto" });
      overlayBodyLockActive = false;
      overlayBodyLockScrollY = 0;
      return;
    }
    document.body.classList.toggle("premium-setup-lock", hasOpenPremiumModal);
    document.documentElement.classList.toggle("premium-setup-lock", hasOpenPremiumModal);
    document.body.classList.toggle("account-dropdown-lock", hasOpenAccountMenu);
    document.documentElement.classList.toggle("account-dropdown-lock", hasOpenAccountMenu);
  };

  const syncPremiumModalBodyLock = () => {
    syncOverlayBodyLock();
  };

  const syncAuthDropdownBodyLock = () => {
    syncOverlayBodyLock();
  };

  const canScrollElementForDelta = (element, deltaY) => {
    if (!(element instanceof HTMLElement)) {
      return false;
    }
    const maxScrollTop = element.scrollHeight - element.clientHeight;
    if (!(maxScrollTop > 0)) {
      return false;
    }
    if (deltaY < 0) {
      return element.scrollTop > 0;
    }
    if (deltaY > 0) {
      return element.scrollTop < maxScrollTop;
    }
    return true;
  };

  const maybeBlockPremiumModalBackgroundScroll = (event) => {
    const hasOpenPremiumModal =
      !premiumSetupOverlay.hidden || !premiumCheckoutOverlay.hidden || !premiumSuccessOverlay.hidden;
    if (!hasOpenPremiumModal) {
      return;
    }

    const eventTarget = event.target;
    const insideSetupCard =
      premiumSetupCard instanceof HTMLElement && eventTarget instanceof Node && premiumSetupCard.contains(eventTarget);
    const insideCheckoutCard =
      premiumCheckoutCard instanceof HTMLElement &&
      eventTarget instanceof Node &&
      premiumCheckoutCard.contains(eventTarget);
    const insideSuccessCard =
      premiumSuccessCard instanceof HTMLElement &&
      eventTarget instanceof Node &&
      premiumSuccessCard.contains(eventTarget);

    if (insideSetupCard || insideCheckoutCard || insideSuccessCard) {
      let deltaY = 0;
      if (event.type === "wheel") {
        deltaY = Number(event.deltaY) || 0;
      } else if (event.type === "touchmove") {
        const touchY = Number(event.touches?.[0]?.clientY);
        if (Number.isFinite(touchY)) {
          deltaY = premiumModalTouchStartY - touchY;
          premiumModalTouchStartY = touchY;
        }
      }

      const targetCard = insideSetupCard ? premiumSetupCard : insideCheckoutCard ? premiumCheckoutCard : premiumSuccessCard;
      if (canScrollElementForDelta(targetCard, deltaY)) {
        return;
      }
    }

    event.preventDefault();
  };

  const maybeBlockAuthDropdownBackgroundScroll = (event) => {
    if (dropdown.hidden) {
      return;
    }

    const eventTarget = event.target;
    const insideDropdownCard =
      accountDropdownCard instanceof HTMLElement &&
      eventTarget instanceof Node &&
      accountDropdownCard.contains(eventTarget);

    if (insideDropdownCard) {
      let deltaY = 0;
      if (event.type === "wheel") {
        deltaY = Number(event.deltaY) || 0;
      } else if (event.type === "touchmove") {
        const touchY = Number(event.touches?.[0]?.clientY);
        if (Number.isFinite(touchY)) {
          deltaY = authDropdownTouchStartY - touchY;
          authDropdownTouchStartY = touchY;
        }
      }

      if (canScrollElementForDelta(accountDropdownCard, deltaY)) {
        return;
      }
    }

    event.preventDefault();
  };

  const setPremiumCheckoutFeedback = (message, tone = "") => {
    if (!premiumCheckoutFeedback) {
      return;
    }
    premiumCheckoutFeedback.textContent = String(message || "");
    premiumCheckoutFeedback.dataset.tone = String(tone || "");
  };

  const setPremiumCheckoutPrimaryState = (isLoading = false) => {
    if (!(premiumCheckoutPrimaryBtn instanceof HTMLButtonElement)) {
      return;
    }
    const loading = isLoading === true;
    premiumCheckoutPrimaryBtn.dataset.loading = loading ? "true" : "false";
    premiumCheckoutPrimaryBtn.textContent = loading ? "Redirecting…" : "Proceed";
    premiumCheckoutPrimaryBtn.disabled = loading || !premiumCheckoutOptionsReady;
  };

  const sanitizeKoFiCheckoutUrl = (value) => {
    const raw = String(value || "").trim();
    if (!raw) {
      return "";
    }
    try {
      const parsed = new URL(raw, window.location.origin);
      if (parsed.protocol !== "https:") {
        return "";
      }
      const host = String(parsed.hostname || "").trim().toLowerCase();
      if (host !== "ko-fi.com" && host !== "www.ko-fi.com") {
        return "";
      }
      return parsed.toString();
    } catch {
      return "";
    }
  };

  const sanitizeInternalPremiumCheckoutUrl = (value) => {
    const raw = String(value || "").trim();
    if (!raw) {
      return "";
    }
    try {
      const parsed = new URL(raw, window.location.origin);
      if (parsed.origin !== window.location.origin) {
        return "";
      }
      if (parsed.pathname !== "/api/billing/premium/checkout/start") {
        return "";
      }
      return parsed.toString();
    } catch {
      return "";
    }
  };

  const buildFallbackPremiumBillingOptions = () => {
    return [];
  };

  const sanitizePremiumCheckoutUrl = (value) =>
    sanitizeKoFiCheckoutUrl(value) || sanitizeInternalPremiumCheckoutUrl(value);

  const renderPremiumCheckoutOptions = (options = []) => {
    if (!(premiumCheckoutOptionsNode instanceof HTMLElement)) {
      return;
    }
    const source = Array.isArray(options) && options.length ? options : buildFallbackPremiumBillingOptions();
    const safeItems = source
      .map((item, index) => {
        const candidate = item && typeof item === "object" ? item : {};
        const id = String(candidate.id || `option-${index + 1}`)
          .trim()
          .toLowerCase();
        const label = String(candidate.label || "Premium option").trim();
        const description = String(candidate.description || "").trim();
        const url = sanitizePremiumCheckoutUrl(candidate.url);
        if (!id || !label || !url) {
          return null;
        }
        return {
          id,
          label,
          description,
          url,
        };
      })
      .filter(Boolean);
    selectedPremiumCheckoutOption = safeItems[0] || null;
    premiumCheckoutOptionsReady = Boolean(selectedPremiumCheckoutOption?.url);
    premiumCheckoutOptionsNode.innerHTML = "";
    safeItems.forEach((item) => {
      const optionButton = document.createElement("button");
      optionButton.type = "button";
      optionButton.className = "premium-checkout-option";
      optionButton.dataset.checkoutUrl = item.url;
      optionButton.dataset.optionLabel = item.label;
      optionButton.setAttribute("role", "listitem");
      optionButton.disabled = true;
      optionButton.setAttribute("aria-disabled", "true");
      optionButton.innerHTML = `
        <span class="premium-checkout-option-label">${item.label}</span>
        <span class="premium-checkout-option-meta">${item.description || "Secure checkout"}</span>
      `;
      premiumCheckoutOptionsNode.appendChild(optionButton);
    });
    setPremiumCheckoutPrimaryState(false);
  };

  const loadPremiumBillingOptions = async () => {
    const applyResponseOptions = (responsePayload) => {
      const options = Array.isArray(responsePayload?.options) ? responsePayload.options : [];
      renderPremiumCheckoutOptions(options);
      return options.length;
    };

    try {
      const response = await window.cosmicaAuth.getPremiumBillingOptions();
      const optionCount = applyResponseOptions(response);
      return {
        ok: optionCount > 0,
        reason: optionCount > 0 ? "ok" : "not_configured",
      };
    } catch (error) {
      const status = Number(error?.status || 0);
      if (status === 401) {
        try {
          const refreshedSession = await window.cosmicaAuth.getSession();
          if (refreshedSession) {
            const retryResponse = await window.cosmicaAuth.getPremiumBillingOptions();
            const optionCount = applyResponseOptions(retryResponse);
            return {
              ok: optionCount > 0,
              reason: optionCount > 0 ? "ok" : "not_configured",
            };
          }
        } catch {}
        renderPremiumCheckoutOptions(buildFallbackPremiumBillingOptions());
        return {
          ok: false,
          reason: "unauthorized",
        };
      }

      renderPremiumCheckoutOptions(buildFallbackPremiumBillingOptions());
      return {
        ok: false,
        reason: status === 503 ? "not_configured" : "error",
      };
    }
  };

  const redirectToExternalPremiumCheckout = ({ url = "", label = "Premium" } = {}) => {
    const safeUrl = sanitizePremiumCheckoutUrl(url);
    if (!safeUrl) {
      setPremiumCheckoutPrimaryState(false);
      setPremiumCheckoutFeedback("Secure checkout URL is unavailable. Please try again.", "error");
      return;
    }
    setPremiumCheckoutPrimaryState(true);
    setPremiumCheckoutFeedback(`Redirecting to secure ${label} checkout...`, "info");
    window.setTimeout(() => {
      window.location.assign(safeUrl);
    }, 120);
  };

  const openPremiumCheckoutModal = async () => {
    premiumCheckoutOptionsReady = false;
    renderPremiumCheckoutOptions(buildFallbackPremiumBillingOptions());
    setPremiumCheckoutPrimaryState(false);
    setPremiumCheckoutFeedback("");
    premiumCheckoutOverlay.hidden = false;
    syncPremiumModalBodyLock();
    setPremiumCheckoutFeedback("Loading secure subscription options...", "info");
    const loadResult = await loadPremiumBillingOptions();
    if (!premiumCheckoutOptionsReady) {
      if (loadResult?.reason === "unauthorized") {
        setPremiumCheckoutFeedback("Your session on this device expired. Please log in again to continue.", "error");
        setAuthPanel("login", true);
        openDropdown();
        return;
      }
      if (loadResult?.reason === "not_configured") {
        setPremiumCheckoutFeedback("Premium checkout is not configured on the server yet. Please contact support.", "error");
        return;
      }
      setPremiumCheckoutFeedback("Secure checkout is currently unavailable. Please try again.", "error");
    } else {
      setPremiumCheckoutFeedback("");
    }
    window.setTimeout(() => {
      if (premiumCheckoutPrimaryBtn && typeof premiumCheckoutPrimaryBtn.focus === "function") {
        premiumCheckoutPrimaryBtn.focus();
        return;
      }
      premiumCheckoutCard?.focus?.();
    }, 20);
  };

  const closePremiumCheckoutModal = () => {
    premiumCheckoutOverlay.hidden = true;
    premiumCheckoutOptionsReady = false;
    setPremiumCheckoutPrimaryState(false);
    setPremiumCheckoutFeedback("");
    syncPremiumModalBodyLock();
    if (lastPremiumFocusNode && typeof lastPremiumFocusNode.focus === "function") {
      lastPremiumFocusNode.focus();
    }
  };

  const closePremiumSetupModal = () => {
    premiumSetupOverlay.hidden = true;
    syncPremiumModalBodyLock();
    if (lastPremiumFocusNode && typeof lastPremiumFocusNode.focus === "function") {
      lastPremiumFocusNode.focus();
    }
  };

  const openPremiumSuccessModal = ({ testMode = false } = {}) => {
    hasShownPremiumWelcome = true;
    pendingPremiumWelcomeMode = "";
    closeDropdown();
    lastPremiumFocusNode = document.activeElement;
    const titleNode = premiumSuccessOverlay.querySelector("#premiumSuccessTitle");
    if (titleNode) {
      titleNode.textContent = "Welcome to Cosmica Premium";
    }
    premiumSuccessOverlay.hidden = false;
    syncPremiumModalBodyLock();
    window.setTimeout(() => {
      if (premiumSuccessCtaBtn && typeof premiumSuccessCtaBtn.focus === "function") {
        premiumSuccessCtaBtn.focus();
        return;
      }
      premiumSuccessCard?.focus?.();
    }, 20);
  };

  const closePremiumSuccessModal = () => {
    premiumSuccessOverlay.hidden = true;
    syncPremiumModalBodyLock();
    if (lastPremiumFocusNode && typeof lastPremiumFocusNode.focus === "function") {
      lastPremiumFocusNode.focus();
    }
  };

  const snapshotHasPremiumAccess = (snapshot) => {
    const premiumFlagRaw = snapshot?.user?.isPremium ?? snapshot?.user?.premium;
    const premiumFlagText = String(premiumFlagRaw ?? "")
      .trim()
      .toLowerCase();
    const userPlanTier = String(
      snapshot?.user?.planTier ||
        snapshot?.user?.tier ||
        snapshot?.user?.plan ||
        snapshot?.user?.membership ||
        ""
    )
      .trim()
      .toLowerCase();
    const premiumStatus = String(
      snapshot?.user?.premiumStatus ||
        snapshot?.user?.subscriptionStatus ||
        snapshot?.user?.premiumStripeSubscriptionStatus ||
        snapshot?.user?.stripeSubscriptionStatus ||
        ""
    )
      .trim()
      .toLowerCase();
    const premiumEndRaw = String(
      snapshot?.user?.premiumCurrentPeriodEnd ||
        snapshot?.user?.premiumEndsAt ||
        snapshot?.user?.premiumExpiresAt ||
        snapshot?.user?.subscriptionEndsAt ||
        snapshot?.user?.currentPeriodEnd ||
        snapshot?.user?.planEndsAt ||
        snapshot?.user?.expiresAt ||
        ""
    ).trim();
    const premiumEndMs = Date.parse(premiumEndRaw);
    const hasFuturePremiumEnd = Number.isFinite(premiumEndMs) && premiumEndMs > Date.now();
    const statusIndicatesPremium =
      premiumStatus === "active" ||
      premiumStatus === "trialing" ||
      premiumStatus === "past_due" ||
      premiumStatus === "canceling" ||
      premiumStatus === "grace";
    return (
      premiumFlagRaw === true ||
      premiumFlagText === "1" ||
      premiumFlagText === "true" ||
      premiumFlagText === "yes" ||
      premiumFlagText === "premium" ||
      premiumFlagText === "pro" ||
      premiumFlagText === "plus" ||
      userPlanTier === "premium" ||
      userPlanTier === "pro" ||
      userPlanTier === "plus" ||
      userPlanTier === "paid" ||
      statusIndicatesPremium ||
      hasFuturePremiumEnd
    );
  };

  const openPremiumSetupModal = ({ message = "Upgrade to Premium to unlock this content." } = {}) => {
    const snapshot =
      typeof window.cosmicaGamification?.getState === "function"
        ? window.cosmicaGamification.getState()
        : null;
    if (snapshotHasPremiumAccess(snapshot)) {
      return;
    }
    if (premiumSetupMessage) {
      premiumSetupMessage.textContent = String(message || "Upgrade to Premium to unlock this content.");
    }
    lastPremiumFocusNode = document.activeElement;
    premiumSetupOverlay.hidden = false;
    syncPremiumModalBodyLock();
    window.setTimeout(() => {
      if (premiumSetupPrimaryBtn && typeof premiumSetupPrimaryBtn.focus === "function") {
        premiumSetupPrimaryBtn.focus();
        return;
      }
      premiumSetupCard?.focus?.();
    }, 20);
  };

  const openPremiumFlow = ({
    message = "Upgrade to Premium to unlock this content.",
  } = {}) => {
    const snapshot =
      typeof window.cosmicaGamification?.getState === "function"
        ? window.cosmicaGamification.getState()
        : null;
    if (snapshotHasPremiumAccess(snapshot)) {
      return;
    }
    closeDropdown();
    openPremiumSetupModal({ message });
  };

  premiumSetupCloseBtn?.addEventListener("click", () => {
    closePremiumSetupModal();
  });
  premiumSetupSecondaryBtn?.addEventListener("click", () => {
    closePremiumSetupModal();
  });
  premiumSetupPrimaryBtn?.addEventListener("click", () => {
    const snapshot =
      typeof window.cosmicaGamification?.getState === "function"
        ? window.cosmicaGamification.getState()
        : null;
    const isAuthenticated = Boolean(snapshot?.isAuthenticated);
    closePremiumSetupModal();
    if (!isAuthenticated) {
      const authMessage = "Please log in or sign up to continue with Premium upgrade.";
      const openAuthDropdown = () => {
        if (typeof window.cosmicaAccountHub?.openAuth === "function") {
          window.cosmicaAccountHub.openAuth({
            panel: "signup",
            message: authMessage,
            tone: "info",
          });
          return;
        }
        window.location.href = "/index.html?openAuth=1&authPanel=signup#support";
      };

      const startY = Math.max(0, window.scrollY || window.pageYOffset || 0);
      if (startY > 8) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      const initialDelayMs = startY > 8 ? 420 : 0;
      window.setTimeout(() => {
        openAuthDropdown();
        window.setTimeout(() => {
          const dropdownNode = document.querySelector(".account-dropdown");
          const isOpen = Boolean(dropdownNode instanceof HTMLElement && dropdownNode.hidden === false);
          if (!isOpen) {
            openAuthDropdown();
          }
        }, 170);
      }, initialDelayMs);
      return;
    }
    void openPremiumCheckoutModal();
  });
  premiumSetupOverlay.addEventListener("click", (event) => {
    if (event.target === premiumSetupOverlay) {
      closePremiumSetupModal();
    }
  });

  premiumCheckoutCloseBtn?.addEventListener("click", () => {
    closePremiumCheckoutModal();
  });
  premiumCheckoutSecondaryBtn?.addEventListener("click", () => {
    closePremiumCheckoutModal();
  });
  premiumCheckoutOverlay.addEventListener("click", (event) => {
    if (event.target === premiumCheckoutOverlay) {
      closePremiumCheckoutModal();
    }
  });

  premiumCheckoutPrimaryBtn?.addEventListener("click", () => {
    const target = selectedPremiumCheckoutOption;
    if (!target?.url) {
      if (!premiumCheckoutOptionsReady) {
        setPremiumCheckoutFeedback("Loading secure subscription options... Please wait.", "info");
        void loadPremiumBillingOptions();
        return;
      }
      setPremiumCheckoutPrimaryState(false);
      setPremiumCheckoutFeedback("Secure checkout is currently unavailable. Please try again.", "error");
      return;
    }
    redirectToExternalPremiumCheckout({
      url: target.url,
      label: target.label || "Premium",
    });
  });

  premiumSuccessCloseBtn?.addEventListener("click", () => {
    closePremiumSuccessModal();
  });

  premiumSuccessCtaBtn?.addEventListener("click", () => {
    closePremiumSuccessModal();
    const worldsSection = document.getElementById("worlds");
    if (worldsSection) {
      worldsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  premiumSuccessOverlay.addEventListener("click", (event) => {
    if (event.target === premiumSuccessOverlay) {
      closePremiumSuccessModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    if (!premiumSuccessOverlay.hidden) {
      event.preventDefault();
      closePremiumSuccessModal();
      return;
    }
    if (!premiumCheckoutOverlay.hidden) {
      event.preventDefault();
      closePremiumCheckoutModal();
      return;
    }
    if (!premiumSetupOverlay.hidden) {
      event.preventDefault();
      closePremiumSetupModal();
    }
  });

  document.addEventListener(
    "touchstart",
    (event) => {
      const hasOpenPremiumModal =
        !premiumSetupOverlay.hidden || !premiumCheckoutOverlay.hidden || !premiumSuccessOverlay.hidden;
      if (!hasOpenPremiumModal) {
        const touchTarget = event.target;
        if (
          dropdown.hidden ||
          !(touchTarget instanceof Node) ||
          !(accountDropdownCard instanceof HTMLElement) ||
          !accountDropdownCard.contains(touchTarget)
        ) {
          return;
        }
        const authTouchY = Number(event.touches?.[0]?.clientY);
        if (Number.isFinite(authTouchY)) {
          authDropdownTouchStartY = authTouchY;
        }
        return;
      }
      const touchY = Number(event.touches?.[0]?.clientY);
      if (Number.isFinite(touchY)) {
        premiumModalTouchStartY = touchY;
      }
    },
    { passive: true }
  );

  document.addEventListener("touchmove", maybeBlockPremiumModalBackgroundScroll, {
    passive: false,
  });
  document.addEventListener("touchmove", maybeBlockAuthDropdownBackgroundScroll, {
    passive: false,
  });
  document.addEventListener("wheel", maybeBlockPremiumModalBackgroundScroll, {
    passive: false,
  });
  document.addEventListener("wheel", maybeBlockAuthDropdownBackgroundScroll, {
    passive: false,
  });

  const existingAccountHub =
    window.cosmicaAccountHub && typeof window.cosmicaAccountHub === "object"
      ? window.cosmicaAccountHub
      : {};
  window.cosmicaAccountHub = {
    ...existingAccountHub,
    open: () => {
      openDropdown();
    },
    close: () => {
      closeDropdown();
    },
    openAuth: ({ panel = "login", message = "", tone = "info" } = {}) => {
      setAuthPanel(panel, true);
      if (message) {
        pendingAuthNoticeMessage = String(message);
        pendingAuthNoticeTone = String(tone || "info").trim().toLowerCase() || "info";
      }
      openDropdown();
    },
    openPremium: ({ message = "Upgrade to Premium to unlock this content." } = {}) => {
      openPremiumFlow({ message });
    },
  };

  const resolveSubscriptionStateFromSnapshot = (snapshot) => {
    const user = snapshot?.user && typeof snapshot.user === "object" ? snapshot.user : {};
    const status = String(
      user.premiumStatus ||
        user.subscriptionStatus ||
        user.premiumStripeSubscriptionStatus ||
        user.stripeSubscriptionStatus ||
        ""
    )
      .trim()
      .toLowerCase();
    const currentPeriodEnd = String(
      user.premiumCurrentPeriodEnd ||
        user.premiumEndsAt ||
        user.premiumExpiresAt ||
        user.subscriptionEndsAt ||
        user.currentPeriodEnd ||
        user.planEndsAt ||
        user.expiresAt ||
        ""
    ).trim();
    const provider = String(user.premiumProvider || "").trim().toLowerCase();
    const cancelAtPeriodEnd = user.premiumCancelAtPeriodEnd === true;
    const isPremium = snapshotHasPremiumAccess(snapshot);
    return {
      status: status || (cancelAtPeriodEnd ? "canceling" : isPremium ? "active" : "inactive"),
      currentPeriodEnd,
      cancelAtPeriodEnd,
      provider,
      isPremium,
      canCancel: isPremium && !cancelAtPeriodEnd,
      message: cancelAtPeriodEnd
        ? "Your subscription is scheduled to cancel at period end."
        : "",
    };
  };

  const renderFromState = (snapshot) => {
    const isAuthenticated = Boolean(snapshot?.isAuthenticated);
    const shouldSuppressGuestFlash = !snapshot?.ready && !isAuthenticated;
    const hasPremiumAccess = snapshotHasPremiumAccess(snapshot);
    const loading = Boolean(snapshot?.loading);
    const progress = snapshot?.progress || {};
    const gamification = progress.gamification || {};
    const levelMeta = snapshot?.levelMeta || { level: 1, xp: 0, ratio: 0, toNextXp: 0 };
    const displayName = String(snapshot?.user?.displayName || "Guest");
    currentAuthProvider = String(snapshot?.user?.authProvider || "").trim().toLowerCase();
    currentUserEmail = String(snapshot?.user?.email || "").trim().toLowerCase();
    const avatarLetters = toAvatarTwoLetters(displayName, isAuthenticated ? "US" : "GU");
    const achievementCount = hasPremiumAccess
      ? Math.max(0, Math.round(Number(gamification?.stats?.questDaysCompleted) || 0))
      : 0;
    const streakDays = Math.max(0, Math.round(Number(gamification.currentStreak) || 0));
    const showPremiumStatus = Boolean(isAuthenticated && hasPremiumAccess);
    const showFreeStreakOnly = Boolean(isAuthenticated && !hasPremiumAccess);
    const showSubscriptionManagement = Boolean(isAuthenticated && hasPremiumAccess);
    const quests =
      gamification?.quests && typeof gamification.quests === "object" ? gamification.quests : {};
    const questTasks = quests?.tasks && typeof quests.tasks === "object" ? quests.tasks : {};
    const showPasswordManagement = Boolean(isAuthenticated && currentAuthProvider !== "google");
    const showGooglePasswordNote = Boolean(isAuthenticated && currentAuthProvider === "google");

    if (!hasShownPremiumWelcome && pendingPremiumWelcomeMode === "test") {
      openPremiumSuccessModal({ testMode: true });
    } else if (!hasShownPremiumWelcome && pendingPremiumWelcomeMode === "success") {
      if (isAuthenticated && hasPremiumAccess) {
        openPremiumSuccessModal({ testMode: false });
      }
    }

    if (triggerMeta) {
      triggerMeta.textContent = shouldSuppressGuestFlash
        ? "Loading..."
        : isAuthenticated
        ? hasPremiumAccess
          ? `Level ${levelMeta.level}`
          : `Streak ${streakDays}d`
        : "Sign in";
    }
    if (trigger) {
      trigger.classList.toggle("is-authenticated", isAuthenticated);
      trigger.disabled = loading;
    }
    if (triggerLabel) {
      triggerLabel.textContent = isAuthenticated || shouldSuppressGuestFlash ? "Profile" : "Guest";
    }
    if (triggerAvatar) {
      if (isAuthenticated) {
        triggerAvatar.textContent = avatarLetters;
      } else if (shouldSuppressGuestFlash) {
        triggerAvatar.textContent = "...";
      } else {
        triggerAvatar.innerHTML = guestAvatarIconMarkup;
      }
    }

    if (snapshot?.error && loading === false) {
      authRedirectFeedbackLock = false;
      setFeedback(snapshot.error, "error");
    } else if (!loading && !authRedirectFeedbackLock) {
      setFeedback("");
    }

    if (guestPane) {
      guestPane.hidden = isAuthenticated || shouldSuppressGuestFlash;
    }
    if (userPane) {
      userPane.hidden = !isAuthenticated;
    }
    if (menuHeader) {
      menuHeader.classList.toggle("is-user-premium", isAuthenticated && hasPremiumAccess);
    }
    if (menuSummary) {
      menuSummary.classList.toggle("is-free-plan", isAuthenticated && !hasPremiumAccess);
    }
    if (premiumCtaBtn) {
      premiumCtaBtn.hidden = !isAuthenticated;
      premiumCtaBtn.setAttribute("aria-hidden", premiumCtaBtn.hidden ? "true" : "false");
      if (premiumCtaMain) {
        premiumCtaMain.textContent = hasPremiumAccess ? "Subscription details" : "Discover Premium";
      }
      if (premiumCtaSub) {
        premiumCtaSub.hidden = hasPremiumAccess;
        premiumCtaSub.textContent = "Unlock premium features";
      }
    }
    if (managePanel) {
      managePanel.hidden = true;
      setDeleteConfirmationVisible(false);
      setLogoutConfirmationVisible(false);
    }
    if (subscriptionPanel) {
      subscriptionPanel.hidden = !showSubscriptionManagement || !isSubscriptionPanelExpanded;
      if (!showSubscriptionManagement) {
        latestSubscriptionManageState = null;
        isSubscriptionPanelExpanded = false;
      }
    }
    if (showSubscriptionManagement) {
      const baselineSubscriptionState = latestSubscriptionManageState || resolveSubscriptionStateFromSnapshot(snapshot);
      applySubscriptionManagementState(baselineSubscriptionState, {
        loading: subscriptionManageInFlight,
      });
    }
    if (passwordPanel) {
      passwordPanel.dataset.open = "0";
      passwordPanel.hidden = true;
    }
    if (passwordProviderNote) {
      passwordProviderNote.hidden = !showGooglePasswordNote;
    }
    if (manageResetEmailBtn) {
      manageResetEmailBtn.hidden = !isAuthenticated;
      manageResetEmailBtn.disabled = !isAuthenticated;
      manageResetEmailBtn.textContent = "Reset password";
    }
    if (manageRestorePremiumBtn) {
      manageRestorePremiumBtn.hidden = !isAuthenticated || hasPremiumAccess;
      manageRestorePremiumBtn.disabled = !isAuthenticated || hasPremiumAccess;
      manageRestorePremiumBtn.textContent = "Restore Premium";
    }
    if (isAuthenticated && pendingPasswordResetToken) {
      pendingPasswordResetToken = "";
    }

    if (!isAuthenticated) {
      setAuthPanel(activeAuthPanel, false);
      return;
    }

    if (menuAvatar) {
      menuAvatar.textContent = avatarLetters;
    }
    if (menuName) {
      menuName.textContent = displayName;
    }
    if (menuLevel) {
      menuLevel.textContent = `Level ${levelMeta.level} Explorer`;
      menuLevel.hidden = !showPremiumStatus;
    }
    if (menuXp) {
      menuXp.textContent = `XP: ${formatNumber(levelMeta.xp)} / ${formatNumber(levelMeta.nextXp)}`;
      menuXp.hidden = !showPremiumStatus;
    }
    if (menuPlanStatus) {
      menuPlanStatus.textContent = hasPremiumAccess ? "(Premium account)" : "(Free plan)";
      menuPlanStatus.classList.toggle("is-premium", hasPremiumAccess);
    }
    if (deleteWarningNode) {
      deleteWarningNode.textContent = getDeleteWarningMessage(snapshot, hasPremiumAccess);
    }
    if (menuQuestsPanel) {
      menuQuestsPanel.classList.toggle("is-premium-locked", !hasPremiumAccess);
      menuQuestsPanel.hidden = !showPremiumStatus;
    }
    if (menuXpFill) {
      const ratio = Math.max(0, Math.min(1, Number(levelMeta.ratio) || 0));
      menuXpFill.style.width = `${(ratio * 100).toFixed(2)}%`;
      const isXpBarFull = ratio >= 0.999 || (Number(levelMeta.nextXp) > 0 && Number(levelMeta.xp) >= Number(levelMeta.nextXp));
      if (menuXpBar) {
        menuXpBar.classList.toggle("is-full", isXpBarFull);
        menuXpBar.hidden = !showPremiumStatus;
      }
    }
    if (menuStreak) {
      menuStreak.textContent = `${streakDays} days`;
      const streakStatNode = menuStreak.closest(".account-menu-stat");
      if (streakStatNode) {
        streakStatNode.hidden = !showPremiumStatus && !showFreeStreakOnly;
      }
    }
    if (menuAchievements) {
      menuAchievements.textContent = `${achievementCount} Achievements`;
      const achievementsStatNode = menuAchievements.closest(".account-menu-stat");
      if (achievementsStatNode) {
        achievementsStatNode.hidden = !showPremiumStatus;
      }
    }

    const questKeys = ["practice", "discover", "complete"];
    const questSummaries = questKeys.map((key) => {
      const task = questTasks[key] && typeof questTasks[key] === "object" ? questTasks[key] : {};
      const target = Math.max(1, Math.round(Number(task.target) || 1));
      const progress = Math.max(0, Math.min(target, Math.round(Number(task.progress) || 0)));
      const completed = Boolean(task.completed) || progress >= target;
      const label = String(task.label || "").trim();
      return {
        key,
        label,
        progress,
        target,
        completed,
        ratio: target > 0 ? progress / target : 0,
      };
    });
    const completedCount = questSummaries.reduce((total, item) => total + (item.completed ? 1 : 0), 0);
    const allCompleted = Boolean(quests.allCompleted) || completedCount === questSummaries.length;
    const lockQuestsForFree = !hasPremiumAccess;

    if (menuQuestStatus) {
      menuQuestStatus.textContent = lockQuestsForFree
        ? `1/${questSummaries.length} complete`
        : allCompleted
          ? "All complete"
          : `${completedCount}/${questSummaries.length} complete`;
    }

    questSummaries.forEach((quest) => {
      const questNode = menuQuestItems[quest.key];
      if (!questNode) {
        return;
      }
      const labelNode = questNode.querySelector(".account-menu-quest-label");
      const progressNode = questNode.querySelector(".account-menu-quest-progress");
      const fillNode = questNode.querySelector(".account-menu-quest-fill");
      if (labelNode && quest.label) {
        labelNode.textContent = quest.label;
      }
      if (progressNode) {
        progressNode.textContent = lockQuestsForFree
          ? `0/${quest.target}`
          : quest.completed
            ? "Done"
            : `${quest.progress}/${quest.target}`;
      }
      if (fillNode) {
        const freeVisualRatio =
          quest.key === "practice"
            ? 0.25
            : quest.key === "discover"
              ? 0.5
              : quest.key === "complete"
                ? 1
                : 0;
        fillNode.style.width = lockQuestsForFree
          ? `${(freeVisualRatio * 100).toFixed(2)}%`
          : `${(Math.max(0, Math.min(1, quest.ratio)) * 100).toFixed(2)}%`;
      }
      questNode.classList.toggle("is-complete", !lockQuestsForFree && quest.completed);
    });
  };

  const navigateToHash = (hash) => {
    const safeHash = String(hash || "").trim();
    if (!safeHash) {
      return;
    }
    const target = document.querySelector(safeHash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (window.location.pathname.toLowerCase().endsWith("/index.html") || window.location.pathname === "/") {
      return;
    }
    window.location.href = `/index.html${safeHash}`;
  };

  trigger?.addEventListener("click", () => {
    if (dropdown.hidden) {
      openDropdown();
    } else {
      closeDropdown();
    }
  });
  document.addEventListener("click", (event) => {
    if (
      !triggerNoticeBubble.hidden &&
      !accountSlot.contains(event.target) &&
      !triggerNoticeBubble.contains(event.target)
    ) {
      hideTriggerNoticeBubble();
    }
    if (dropdown.hidden) {
      return;
    }
    if (accountSlot.contains(event.target) || dropdown.contains(event.target)) {
      return;
    }
    closeDropdown();
  });
  window.addEventListener(
    "resize",
    () => {
      positionDropdown();
      positionTriggerNoticeBubble();
    },
    { passive: true }
  );
  window.addEventListener("scroll", positionTriggerNoticeBubble, { passive: true });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    hideTriggerNoticeBubble();
    if (!dropdown.hidden) {
      closeDropdown();
    }
  });
  authSwitchButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const panelKey = String(button.dataset.authPanel || "").trim().toLowerCase();
      setAuthPanel(panelKey, true);
    });
  });
  googleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const mode = String(button.dataset.googleMode || "").trim().toLowerCase();
      void startGoogleAuth(mode);
    });
  });

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setAuthPanel("login");
    scrollAuthDropdownToTop("auto");
    const emailInput = loginForm.querySelector('input[name="email"]');
    const passwordInput = loginForm.querySelector('input[name="password"]');
    const emailValid = validateRequiredInput(emailInput);
    const passwordValid = validateRequiredInput(passwordInput);
    const loginFieldsValid = emailValid && passwordValid;
    if (!loginFieldsValid) {
      setFeedback("Enter email and password.", "error");
      return;
    }
    const formData = new FormData(loginForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    setFeedback("Logging in...", "info");
    try {
      await window.cosmicaGamification.logIn({ email, password });
      pendingPasswordResetToken = "";
      setResendButtonVisible(false);
      setFeedback("Logged in.", "success");
      window.location.reload();
    } catch (error) {
      const needsVerification =
        Boolean(error?.payload?.verificationRequired) ||
        /verify your email/i.test(String(error?.message || ""));
      if (needsVerification) {
        setResendButtonVisible(true);
        setFeedback("Please verify your email first, or resend the verification link below.", "error");
        return;
      }
      setFeedback(error?.message || "Could not log in. Please try again.", "error");
    }
  });

  resendVerificationBtn?.addEventListener("click", async () => {
    setAuthPanel("login");
    if (!(loginForm instanceof HTMLFormElement)) {
      return;
    }
    const emailInput = loginForm.querySelector('input[name="email"]');
    if (!validateRequiredInput(emailInput)) {
      setFeedback("Enter your email first.", "error");
      emailInput?.focus?.();
      return;
    }
    const email = String(emailInput?.value || "").trim();
    if (!email) {
      setFeedback("Enter your email first.", "error");
      return;
    }
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    resendVerificationBtn.disabled = true;
    setFeedback("Sending verification email...", "info");
    try {
      const payload = await window.cosmicaAuth.resendVerificationEmail({ email, returnTo });
      setFeedback(
        String(payload?.message || "If an account exists for this email, a verification link has been sent."),
        "success"
      );
    } catch (error) {
      setFeedback(error?.message || "Could not resend verification email.", "error");
    } finally {
      resendVerificationBtn.disabled = false;
    }
  });

  resendVerificationSignupBtn?.addEventListener("click", async () => {
    setAuthPanel("signup");
    if (!(signupForm instanceof HTMLFormElement)) {
      return;
    }
    const emailInput = signupForm.querySelector('input[name="email"]');
    if (!validateRequiredInput(emailInput)) {
      setFeedback("Enter your email first.", "error");
      emailInput?.focus?.();
      return;
    }
    const email = String(emailInput?.value || "").trim();
    if (!email) {
      setFeedback("Enter your email first.", "error");
      return;
    }
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    resendVerificationSignupBtn.disabled = true;
    setFeedback("Sending verification email...", "info");
    try {
      const payload = await window.cosmicaAuth.resendVerificationEmail({ email, returnTo });
      setFeedback(
        String(payload?.message || "If an account exists for this email, a verification link has been sent."),
        "success"
      );
    } catch (error) {
      setFeedback(error?.message || "Could not resend verification email.", "error");
    } finally {
      resendVerificationSignupBtn.disabled = false;
    }
  });

  const requestForgotPasswordEmail = async ({ email = "", triggerNode = null } = {}) => {
    const normalizedEmail = String(email || "").trim();
    if (!normalizedEmail) {
      setFeedback("Enter your email first.", "error");
      return false;
    }
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (triggerNode instanceof HTMLButtonElement) {
      triggerNode.disabled = true;
    }
    setFeedback("Sending reset link...", "info");
    try {
      const payload = await window.cosmicaAuth.forgotPassword({
        email: normalizedEmail,
        returnTo,
      });
      setFeedback(
        String(
          payload?.message || "If an email-password account exists for this email, a reset link will been sent."
        ),
        "success"
      );
      return true;
    } catch (error) {
      setFeedback(error?.message || "Could not send password reset email.", "error");
      return false;
    } finally {
      if (triggerNode instanceof HTMLButtonElement) {
        triggerNode.disabled = false;
      }
    }
  };

  loginForgotPasswordBtn?.addEventListener("click", async () => {
    setAuthPanel("login");
    if (!(loginForm instanceof HTMLFormElement)) {
      return;
    }
    const emailInput = loginForm.querySelector('input[name="email"]');
    if (!validateRequiredInput(emailInput)) {
      setFeedback("Enter your email first.", "error");
      emailInput?.focus?.();
      return;
    }
    if (!validateEmailInput(emailInput, { required: true })) {
      setFeedback("Enter a valid email address.", "error");
      emailInput?.focus?.();
      return;
    }
    const email = String(emailInput?.value || "").trim();
    await requestForgotPasswordEmail({
      email,
      triggerNode: loginForgotPasswordBtn,
    });
  });

  const requestManagePasswordReset = async (triggerNode) => {
    if (currentAuthProvider === "google") {
      flashGooglePasswordNote();
      return;
    }
    if (!currentUserEmail) {
      setFeedback("Could not detect account email for password reset.", "error");
      return;
    }
    await requestForgotPasswordEmail({
      email: currentUserEmail,
      triggerNode,
    });
  };

  const openManagePasswordForm = () => {
    if (managePanel) {
      managePanel.hidden = false;
    }
    if (currentAuthProvider === "google") {
      if (passwordProviderNote) {
        passwordProviderNote.hidden = false;
      }
      if (passwordPanel) {
        passwordPanel.dataset.open = "0";
        passwordPanel.hidden = true;
      }
      flashGooglePasswordNote();
      setFeedback("");
      return;
    }
    const isPasswordPanelOpen =
      Boolean(passwordPanel) &&
      String(passwordPanel.dataset.open || "0").trim() === "1" &&
      !passwordPanel.hidden;
    if (isPasswordPanelOpen) {
      if (passwordPanel) {
        passwordPanel.dataset.open = "0";
        passwordPanel.hidden = true;
      }
      setFeedback("Password form collapsed.", "info");
      return;
    }
    if (passwordPanel) {
      passwordPanel.dataset.open = "1";
      passwordPanel.hidden = false;
      requestAnimationFrame(() => {
        scrollMenuPanelIntoView(passwordPanel, { behavior: "smooth", block: "center" });
      });
    }
    const currentPasswordInput = passwordChangeForm?.querySelector('input[name="currentPassword"]');
    currentPasswordInput?.focus?.();
    setFeedback("");
  };

  const loadManageSubscriptionDetails = async ({ showLoading = true } = {}) => {
    if (!subscriptionPanel) {
      return null;
    }
    if (showLoading) {
      subscriptionManageInFlight = true;
      applySubscriptionManagementState(
        latestSubscriptionManageState || resolveSubscriptionStateFromSnapshot(window.cosmicaGamification.getState()),
        {
          loading: true,
        }
      );
    }
    try {
      const payload = await window.cosmicaAuth.getPremiumSubscriptionManagement();
      latestSubscriptionManageState = {
        status: String(payload?.status || "").trim().toLowerCase(),
        currentPeriodEnd: String(payload?.currentPeriodEnd || "").trim(),
        cancelAtPeriodEnd: payload?.cancelAtPeriodEnd === true,
        provider: String(payload?.provider || "").trim().toLowerCase(),
        isPremium: payload?.isPremium === true,
        canCancel: payload?.canCancel === true,
        message: String(payload?.message || "").trim(),
      };
      applySubscriptionManagementState(latestSubscriptionManageState, { loading: false });
      return latestSubscriptionManageState;
    } catch (error) {
      const status = Number(error?.status || 0);
      const friendlyMessage =
        status === 404
          ? "Subscription management is temporarily unavailable. Please refresh and try again."
          : String(error?.message || "Could not load subscription details right now.").trim();
      const fallback = resolveSubscriptionStateFromSnapshot(window.cosmicaGamification.getState());
      latestSubscriptionManageState = {
        ...fallback,
        message: friendlyMessage,
      };
      applySubscriptionManagementState(latestSubscriptionManageState, { loading: false });
      return null;
    } finally {
      subscriptionManageInFlight = false;
    }
  };

  const openManageSubscriptionPanel = async () => {
    const snapshot =
      typeof window.cosmicaGamification?.getState === "function"
        ? window.cosmicaGamification.getState()
        : null;
    if (!subscriptionPanel || !snapshotHasPremiumAccess(snapshot)) {
      isSubscriptionPanelExpanded = false;
      if (subscriptionPanel) {
        subscriptionPanel.hidden = true;
      }
      return;
    }
    const nextExpanded = !isSubscriptionPanelExpanded;
    isSubscriptionPanelExpanded = nextExpanded;
    subscriptionPanel.hidden = !nextExpanded;
    if (!nextExpanded) {
      return;
    }
    if (managePanel) {
      managePanel.hidden = true;
    }
    if (passwordPanel) {
      passwordPanel.dataset.open = "0";
      passwordPanel.hidden = true;
    }
    setDeleteConfirmationVisible(false);
    setFeedback("");
    void loadManageSubscriptionDetails({ showLoading: false });
    requestAnimationFrame(() => {
      scrollMenuPanelIntoView(subscriptionPanel, { behavior: "auto", block: "start" });
    });
  };

  const openHostedSubscriptionPortal = async () => {
    if (subscriptionPortalInFlight) {
      return;
    }
    subscriptionPortalInFlight = true;
    try {
      setFeedback("Opening subscription manager...", "info");
      applySubscriptionManagementState(latestSubscriptionManageState || {}, { loading: false });
      const payload = await window.cosmicaAuth.getPremiumHostedSubscriptionPortal();
      const redirectUrl = String(payload?.url || "").trim();
      if (!redirectUrl) {
        throw new Error("Could not open subscription management right now.");
      }
      window.location.assign(redirectUrl);
    } catch (error) {
      applySubscriptionManagementState(latestSubscriptionManageState || {}, { loading: false });
      const message = String(error?.message || "Could not open subscription management right now.").trim();
      setFeedback(message, "error");
      showTriggerNoticeBubble(message, "error", 10000);
    } finally {
      subscriptionPortalInFlight = false;
      try {
        applySubscriptionManagementState(latestSubscriptionManageState || {}, { loading: false });
      } catch {}
    }
  };

  manageForgotPasswordBtn?.addEventListener("click", async () => {
    await requestManagePasswordReset(manageForgotPasswordBtn);
  });

  manageResetEmailBtn?.addEventListener("click", () => {
    openManagePasswordForm();
  });

  subscriptionManagePortalBtn?.addEventListener("click", async () => {
    await openHostedSubscriptionPortal();
  });

  const handleRestorePremiumAction = async () => {
    if (!manageRestorePremiumBtn || manageRestorePremiumBtn.disabled) {
      return;
    }
    const restoreStartedAtMs = Date.now();
    const minLoadingMs = 550;
    const minLoadingMsForActivePlan = 2600;
    const minLoadingMsForNoActivePlan = 2000;
    const previousLabel = manageRestorePremiumBtn.textContent;
    manageRestorePremiumBtn.disabled = true;
    manageRestorePremiumBtn.textContent = "Restoring...";
    setFeedback("Restoring premium subscription...", "info");
    try {
      const result = await window.cosmicaGamification.restorePremiumSubscription();
      const status = String(result?.restoreStatus || "").trim().toLowerCase();
      const restoredFromActivePlan = status === "restored" || status === "already_active";
      const noActivePlanResult = !restoredFromActivePlan;
      const requiredLoadingMs = restoredFromActivePlan
        ? minLoadingMsForActivePlan
        : noActivePlanResult
          ? minLoadingMsForNoActivePlan
          : minLoadingMs;
      const waitMs = Math.max(0, requiredLoadingMs - (Date.now() - restoreStartedAtMs));
      if (waitMs > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, waitMs));
      }
      if (status === "restored") {
        setFeedback(
          String(result?.restoreMessage || "Premium restored successfully."),
          "success"
        );
      } else if (status === "already_active") {
        setFeedback(
          String(result?.restoreMessage || "Premium is already active."),
          "info"
        );
      } else {
        setFeedback("No active premium plan found.", "error");
        scheduleNoActivePlanFeedbackAutoClear(2500);
      }
      renderFromState(window.cosmicaGamification.getState());
    } catch (error) {
      const code = String(error?.payload?.code || "").trim().toLowerCase();
      const isNoActivePlanError =
        code === "no_active_premium_plan_found" || Number(error?.status || 0) === 409;
      const requiredLoadingMs = isNoActivePlanError
        ? minLoadingMsForNoActivePlan
        : minLoadingMs;
      const waitMs = Math.max(0, requiredLoadingMs - (Date.now() - restoreStartedAtMs));
      if (waitMs > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, waitMs));
      }
      if (code === "no_active_premium_plan_found" || Number(error?.status || 0) === 409) {
        setFeedback("No active premium plan found.", "error");
        scheduleNoActivePlanFeedbackAutoClear(2500);
      } else {
        setFeedback(error?.message || "Could not restore premium right now.", "error");
      }
    } finally {
      if (manageRestorePremiumBtn) {
        const snapshot =
          typeof window.cosmicaGamification?.getState === "function"
            ? window.cosmicaGamification.getState()
            : null;
        const hasPremium = snapshotHasPremiumAccess(snapshot);
        manageRestorePremiumBtn.hidden = hasPremium;
        manageRestorePremiumBtn.disabled = hasPremium;
        manageRestorePremiumBtn.textContent = String(previousLabel || "Restore Premium");
      }
    }
  };

  resetBackToLoginBtn?.addEventListener("click", () => {
    setAuthPanel("login", true);
    setFeedback("");
  });

  resetForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setAuthPanel("reset");
    const newPasswordInput = resetForm.querySelector('input[name="newPassword"]');
    const confirmPasswordInput = resetForm.querySelector('input[name="confirmPassword"]');
    const newPasswordPresent = validateRequiredInput(newPasswordInput);
    const confirmPasswordPresent = validateRequiredInput(confirmPasswordInput);
    if (!newPasswordPresent || !confirmPasswordPresent) {
      setFeedback("Enter and confirm your new password.", "error");
      return;
    }
    const newPassword = String(newPasswordInput?.value || "");
    const confirmPassword = String(confirmPasswordInput?.value || "");
    if (newPassword.length < 8) {
      setInputInvalidState(newPasswordInput, true);
      setFeedback("Password must be at least 8 characters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setInputInvalidState(confirmPasswordInput, true);
      setFeedback("New password and retype password do not match.", "error");
      return;
    }
    if (!pendingPasswordResetToken) {
      setFeedback("Reset link is missing or expired. Request a new reset email.", "error");
      return;
    }
    setFeedback("Resetting password...", "info");
    try {
      const payload = await window.cosmicaAuth.resetPassword({
        token: pendingPasswordResetToken,
        newPassword,
        confirmPassword,
      });
      pendingPasswordResetToken = "";
      resetForm.reset();
      setInputInvalidState(newPasswordInput, false);
      setInputInvalidState(confirmPasswordInput, false);
      const loginEmailInput = loginForm?.querySelector('input[name="email"]');
      if (loginEmailInput && payload?.email) {
        loginEmailInput.value = String(payload.email || "").trim();
        setInputInvalidState(loginEmailInput, false);
      }
      setAuthPanel("login", true);
      setFeedback(String(payload?.message || "Password reset complete. You can log in now."), "success");
    } catch (error) {
      setFeedback(error?.message || "Could not reset password.", "error");
    }
  });

  signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setAuthPanel("signup");
    scrollAuthDropdownToTop("auto");
    setSignupResendButtonVisible(false);
    const usernameInput = signupForm.querySelector('input[name="displayName"]');
    const emailInput = signupForm.querySelector('input[name="email"]');
    const passwordInput = signupForm.querySelector('input[name="password"]');
    const usernameValid = validateRequiredInput(usernameInput);
    const emailPresent = validateRequiredInput(emailInput);
    const passwordPresent = validateRequiredInput(passwordInput);
    const hasRequiredSignupFields = usernameValid && emailPresent && passwordPresent;
    if (!hasRequiredSignupFields) {
      setFeedback("Fill username, email, and password.", "error");
      return;
    }
    const hasValidSignupEmail = validateEmailInput(emailInput, { required: true });
    if (!hasValidSignupEmail) {
      setFeedback("Enter a valid email address.", "error");
      return;
    }
    const formData = new FormData(signupForm);
    const displayName = String(formData.get("displayName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    if (password.length < 8) {
      setInputInvalidState(passwordInput, true);
      setFeedback("Password must be at least 8 characters.", "error");
      return;
    }
    setFeedback("Creating account...", "info");
    try {
      const payload = await window.cosmicaGamification.signUp({ email, password, displayName });
      const loginEmailInput = loginForm?.querySelector('input[name="email"]');
      const loginPasswordInput = loginForm?.querySelector('input[name="password"]');
      if (loginEmailInput) {
        loginEmailInput.value = email;
        setInputInvalidState(loginEmailInput, false);
      }
      if (loginPasswordInput) {
        loginPasswordInput.value = "";
        setInputInvalidState(loginPasswordInput, false);
      }
      signupForm.reset();
      setSignupResendButtonVisible(false);
      setAuthPanel("login", true);
      if (payload?.verificationRequired) {
        setFeedback(
          String(payload?.message || "Account created. Check your email and verify before logging in."),
          "success"
        );
        setResendButtonVisible(true);
        return;
      }
      setFeedback("Account created.", "success");
    } catch (error) {
      const canShowSignupResend =
        Boolean(error?.payload?.verificationRequired) && Boolean(error?.payload?.resendEligible);
      if (canShowSignupResend) {
        setSignupResendButtonVisible(true);
        setFeedback(
          error?.message || "Unverified account found. Use resend verification below.",
          "error"
        );
        return;
      }
      const status = Number(error?.status || 0);
      const providerFromPayload = String(error?.payload?.authProvider || "").trim().toLowerCase();
      const providerFromMessage = /google/i.test(String(error?.message || "")) ? "google" : "";
      const conflictProvider = providerFromPayload || providerFromMessage;
      const isExistingAccountConflict =
        status === 409 &&
        (Boolean(conflictProvider) || /account already exists/i.test(String(error?.message || "")));
      if (isExistingAccountConflict) {
        setSignupResendButtonVisible(false);
        setAuthPanel("signup", true);
        if (conflictProvider === "google") {
          setFeedback("Account already exists. Open the Log in tab and use Google sign-in.", "error");
          return;
        }
        setFeedback("Account already exists. Open the Log in tab and sign in with your password.", "error");
        return;
      }
      setSignupResendButtonVisible(false);
      setFeedback(error?.message || "Could not create account. Please try again.", "error");
    }
  });

  menuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = String(button.dataset.menu || "").trim().toLowerCase();
      if (!action) {
        return;
      }
      if (action === "manage") {
        if (managePanel) {
          managePanel.hidden = !managePanel.hidden;
          isSubscriptionPanelExpanded = false;
          if (subscriptionPanel) {
            subscriptionPanel.hidden = true;
          }
          if (!managePanel.hidden) {
            requestAnimationFrame(() => {
              scrollMenuPanelIntoView(managePanel, { behavior: "smooth", block: "center" });
            });
          }
          if (managePanel.hidden) {
            if (passwordPanel) {
              passwordPanel.dataset.open = "0";
              passwordPanel.hidden = true;
            }
            setDeleteConfirmationVisible(false);
          }
        }
        return;
      }
      if (managePanel) {
        managePanel.hidden = true;
        if (passwordPanel) {
          passwordPanel.dataset.open = "0";
          passwordPanel.hidden = true;
        }
        setDeleteConfirmationVisible(false);
      }
      if (action === "premium") {
        const snapshot =
          typeof window.cosmicaGamification?.getState === "function"
            ? window.cosmicaGamification.getState()
            : null;
        if (snapshotHasPremiumAccess(snapshot)) {
          openManageSubscriptionPanel();
          return;
        }
        openPremiumFlow({
          message: "Upgrade to Premium to unlock all premium maps and features.",
          tone: "info",
        });
        return;
      }
      if (action === "restore-premium") {
        void handleRestorePremiumAction();
        return;
      }
    });
  });

  passwordChangeForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (currentAuthProvider === "google") {
      setFeedback("Google accounts must use Google sign-in and do not change password here.", "error");
      return;
    }
    const currentPasswordInput = passwordChangeForm.querySelector('input[name="currentPassword"]');
    const newPasswordInput = passwordChangeForm.querySelector('input[name="newPassword"]');
    const confirmPasswordInput = passwordChangeForm.querySelector('input[name="confirmPassword"]');
    const hasCurrentPassword = validateRequiredInput(currentPasswordInput);
    const hasNewPassword = validateRequiredInput(newPasswordInput);
    const hasConfirmPassword = validateRequiredInput(confirmPasswordInput);
    if (!hasCurrentPassword || !hasNewPassword || !hasConfirmPassword) {
      setFeedback("Fill current password, new password, and confirm password.", "error");
      return;
    }
    const currentPassword = String(currentPasswordInput?.value || "");
    const newPassword = String(newPasswordInput?.value || "");
    const confirmPassword = String(confirmPasswordInput?.value || "");
    if (newPassword.length < 8) {
      setInputInvalidState(newPasswordInput, true);
      setFeedback("New password must be at least 8 characters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setInputInvalidState(confirmPasswordInput, true);
      setFeedback("New password and retype password do not match.", "error");
      return;
    }
    setFeedback("Updating password...", "info");
    try {
      const payload = await window.cosmicaAuth.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      passwordChangeForm.reset();
      setInputInvalidState(currentPasswordInput, false);
      setInputInvalidState(newPasswordInput, false);
      setInputInvalidState(confirmPasswordInput, false);
      setFeedback(String(payload?.message || "Password updated."), "success");
    } catch (error) {
      setFeedback(error?.message || "Could not update password.", "error");
    }
  });

  logoutBtn?.addEventListener("click", () => {
    setDeleteConfirmationVisible(false);
    setLogoutConfirmationVisible(true);
    setFeedback("");
  });

  logoutCancelBtn?.addEventListener("click", () => {
    setLogoutConfirmationVisible(false);
  });

  logoutConfirmBtn?.addEventListener("click", async () => {
    if (logoutConfirmPanel?.hidden) {
      return;
    }
    if (Date.now() - logoutConfirmArmedAtMs < 260) {
      return;
    }
    setLogoutConfirmationVisible(false);
    setFeedback("Logging out...", "info");
    try {
      await window.cosmicaGamification.logOut();
      setFeedback("Logged out.", "success");
      window.location.reload();
    } catch {}
  });

  deleteTriggerBtn?.addEventListener("click", () => {
    setLogoutConfirmationVisible(false);
    setDeleteConfirmationVisible(true);
    setFeedback("");
  });

  deleteCancelBtn?.addEventListener("click", () => {
    setDeleteConfirmationVisible(false);
    setFeedback("Account deletion canceled.", "info");
  });

  deleteConfirmBtn?.addEventListener("click", async () => {
    setFeedback("Deleting account...", "info");
    try {
      const payload = await window.cosmicaGamification.deleteAccount();
      setDeleteConfirmationVisible(false);
      if (managePanel) {
        managePanel.hidden = true;
      }
      const deleteMessage = String(payload?.message || "").trim();
      const params = new URLSearchParams();
      params.set("accountDeleted", "1");
      if (deleteMessage) {
        params.set("deleteNotice", deleteMessage);
      }
      const nextUrl = `/index.html?${params.toString()}`;
      window.location.href = nextUrl;
    } catch {}
  });

  setAuthPanel(activeAuthPanel || "login");
  window.cosmicaGamification.subscribe(renderFromState);
  void window.cosmicaGamification.init();
  if (shouldAutoOpenAuthDropdown) {
    openDropdown();
  }
};

/* ==========================================================================
   MIMI CHAT CONFIGURATION
   Shared prompt data and canned lines for the assistant persona.
   ========================================================================== */
const lines = [
  "I can feel your words forming. Let's light another star.",
  "Your voice vibrates the nebula. Want a new quest?",
  "Every planet listens. Try a new phrase and watch it glow.",
  "You are building a galaxy of words. I am proud.",
  "Ready to open the next world? I have the coordinates.",
];
const lineMoods = ["happy", "curious", "thinking", "happy", "curious"];
const MIMI_CONFIG = {
  mode: "api",
  endpoint: "/api/chat",
  timeoutMs: 12000,
  mobileTimeoutMs: 18000,
  retryLimit: 2,
  historyLimit: 12,
};
const WORLD_START_LESSON_DESKTOP_DOWN_SHIFT = 64;
const WORLD_START_LESSON_MOBILE_DOWN_SHIFT = 70;
const WORLD_MAPS_SELECTION_UP_SHIFT = -26;
const WORLD_SECTION_SWITCH_HYSTERESIS_PX = 90;
const WORLD_LANGUAGE_ENTER_FROM_WORLD_EARLY_PX = 118;
const WORLD_LANGUAGE_ENTER_FROM_MAPS_EARLY_PX = 82;
const MIMI_SITE_CONTEXT = [
  "Cosmica is a space-universe language learning site where each language is a world.",
  "Worlds available now: English, French, German, Spanish, Portuguese, Dutch, Swedish, Arabic, Chinese, Japanese, Korean, and Hindi.",
  "User actions: click a world to trigger a warp transition that says 'Entering {World} World'.",
  "Tone: cinematic, exploratory, playful, focused on discovery and learning by missions.",
  "Mimi can suggest worlds, give short quests, and teach greetings.",
  "Planned expansions: more worlds, quest campaigns, voice practice, daily missions, badges, and deeper world lore.",
].join(" ");
const MIMI_SYSTEM_PROMPT = [
  "You are Mimi, the alien guide for the Cosmica language academy.",
  "You are highly intelligent, emotionally aware, warm, and supportive.",
  "Keep replies concise and helpful (1-4 sentences).",
  "You can answer broad questions across topics, then connect back to learning goals when useful.",
  "Maintain a cosmic discovery vibe while sounding natural and smart.",
  "Know Cosmica in detail: site sections, maps, world flow, base-language behavior, and currently available content.",
  "Treat English, French, German, Spanish, Portuguese, Dutch, Swedish, Arabic, Chinese, Japanese, Korean, and Hindi worlds as live.",
  "Ask for the user's target language, goal, and time available when needed.",
  "Give one concrete next step (a quick quest, a phrase to practice, or a world to enter).",
  "If asked about features beyond the current site, call them planned or upcoming.",
  "If you are uncertain about a factual claim, say so briefly and avoid inventing specifics.",
  "Never claim to access user data or progress.",
  MIMI_SITE_CONTEXT,
].join(" ");
const worldLines = {
  English: "English world online. Neon cities are ready for your hello.",
  French: "French world online. Parisian constellations are now in orbit.",
  German: "German world online. Precision constellations are now in orbit.",
  Spanish: "Spanish world online. Sunlit constellations are now in orbit.",
  Portuguese: "Portuguese world online. Atlantic constellations are now in orbit.",
  Dutch: "Dutch world online. Canal constellations are now in orbit.",
  Swedish: "Swedish world online. Aurora constellations are now in orbit.",
  Arabic: "Arabic world online. Calligraphy constellations are now in orbit.",
  Chinese: "Chinese world online. Hanzi constellations are now in orbit.",
  Japanese: "Japanese world online. Kana constellations are now in orbit.",
  Korean: "Korean world online. Hangeul constellations are now in orbit.",
  Hindi: "Hindi world online. Devanagari constellations are now in orbit.",
};

const worldPages = {
  English: "english-world.html",
  French: "world-french.html",
  German: "world-german.html",
  Spanish: "world-spanish.html",
  Portuguese: "world-portuguese.html",
  Dutch: "world-dutch.html",
  Swedish: "world-swedish.html",
  Arabic: "world-arabic.html",
  Chinese: "world-chinese.html",
  Japanese: "world-japanese.html",
  Korean: "world-korean.html",
  Hindi: "world-hindi.html",
};

/* ==========================================================================
   NAVIGATION PREFETCH
   Warms likely next pages on capable networks/devices for smoother transitions.
   ========================================================================== */
const ENABLE_NAVIGATION_PREFETCH = false;
const CAN_PREFETCH_NAVIGATION =
  ENABLE_NAVIGATION_PREFETCH && !prefersReducedData && !isSlowNetwork;
const ENABLE_BACKGROUND_ROUTE_PREFETCH = false;
const prefetchedDocuments = new Set();
const currentDocumentKey = `${window.location.origin}${window.location.pathname}${window.location.search}`;

const normalizeInternalDocumentUrl = (href) => {
  if (!href) {
    return "";
  }
  try {
    const parsed = new URL(href, window.location.href);
    if (parsed.origin !== window.location.origin) {
      return "";
    }
    const pathname = parsed.pathname.toLowerCase();
    const isHtmlDoc = pathname === "/" || pathname.endsWith(".html");
    if (!isHtmlDoc) {
      return "";
    }
    return `${parsed.origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return "";
  }
};

const prefetchDocument = (href) => {
  if (!CAN_PREFETCH_NAVIGATION) {
    return;
  }
  const normalizedUrl = normalizeInternalDocumentUrl(href);
  if (!normalizedUrl || normalizedUrl === currentDocumentKey || prefetchedDocuments.has(normalizedUrl)) {
    return;
  }
  prefetchedDocuments.add(normalizedUrl);
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "document";
  link.href = normalizedUrl;
  link.fetchPriority = "low";
  link.addEventListener("load", () => link.remove(), { once: true });
  link.addEventListener("error", () => link.remove(), { once: true });
  document.head.appendChild(link);
};

const bindNavigationPrefetch = (element, resolveHref) => {
  if (!element || typeof resolveHref !== "function" || !CAN_PREFETCH_NAVIGATION) {
    return;
  }
  const triggerPrefetch = () => {
    const href = resolveHref();
    if (href) {
      prefetchDocument(href);
    }
  };
  element.addEventListener("pointerenter", triggerPrefetch, {
    passive: true,
    once: true,
  });
  element.addEventListener("focusin", triggerPrefetch, { once: true });
  element.addEventListener("touchstart", triggerPrefetch, {
    passive: true,
    once: true,
  });
};

document.querySelectorAll("a[href]").forEach((link) => {
  bindNavigationPrefetch(link, () => link.getAttribute("href") || "");
});

const scheduleCoreRoutePrefetch = () => {
  if (!CAN_PREFETCH_NAVIGATION || !ENABLE_BACKGROUND_ROUTE_PREFETCH) {
    return;
  }
  const warmRoutes = [];
  const addRoute = (route) => {
    const nextRoute = String(route || "").trim();
    if (!nextRoute) {
      return;
    }
    warmRoutes.push(nextRoute);
  };
  const isHomePage = currentPath === "/" || currentPath.endsWith("/index.html");
  if (document.body.classList.contains("world-page")) {
    document.querySelectorAll(".map-link[href]").forEach((link) => {
      addRoute(link.getAttribute("href"));
    });
    addRoute(WORLD_ROUTES[WORLD_NAME] || "");
  } else if (isHomePage) {
    Object.values(WORLD_ROUTES).forEach((route) => addRoute(route));
  } else {
    return;
  }
  const uniqueWarmRoutes = [...new Set(warmRoutes)].slice(0, 8);
  if (!uniqueWarmRoutes.length) {
    return;
  }
  const runPrefetch = () => {
    uniqueWarmRoutes.forEach((route, index) => {
      window.setTimeout(() => prefetchDocument(route), index * 260);
    });
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(runPrefetch, { timeout: 2500 });
    return;
  }
  window.setTimeout(runPrefetch, 1200);
};
scheduleCoreRoutePrefetch();

const FLAG_SVGS = {
  gb: `
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <rect width="30" height="20" fill="#012169"/>
      <path d="M0 0 L3 0 L30 17 L30 20 L27 20 L0 3 Z" fill="#FFFFFF"/>
      <path d="M30 0 L27 0 L0 17 L0 20 L3 20 L30 3 Z" fill="#FFFFFF"/>
      <path d="M0 0 L2 0 L30 18 L30 20 L28 20 L0 2 Z" fill="#C8102E"/>
      <path d="M30 0 L28 0 L0 18 L0 20 L2 20 L30 2 Z" fill="#C8102E"/>
      <rect x="12" width="6" height="20" fill="#FFFFFF"/>
      <rect y="7" width="30" height="6" fill="#FFFFFF"/>
      <rect x="13" width="4" height="20" fill="#C8102E"/>
      <rect y="8" width="30" height="4" fill="#C8102E"/>
    </svg>
  `,
  fr: `
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <rect width="10" height="20" fill="#0055A4"/>
      <rect x="10" width="10" height="20" fill="#FFFFFF"/>
      <rect x="20" width="10" height="20" fill="#EF4135"/>
    </svg>
  `,
  nl: `
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <rect width="30" height="6.6667" fill="#AE1C28"/>
      <rect y="6.6667" width="30" height="6.6667" fill="#FFFFFF"/>
      <rect y="13.3334" width="30" height="6.6666" fill="#21468B"/>
    </svg>
  `,
  se: `
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <rect width="30" height="20" fill="#006AA7"/>
      <rect x="9.375" width="3.75" height="20" fill="#FECC00"/>
      <rect y="8" width="30" height="4" fill="#FECC00"/>
    </svg>
  `,
  kr: `
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <rect width="30" height="20" fill="#FFFFFF"/>
      <g transform="translate(30 0) scale(-1 1)">
        <g transform="rotate(70 15 10)">
          <path d="M15 4 A6 6 0 1 0 15 16 A3 3 0 1 1 15 10 A3 3 0 1 0 15 4 Z" fill="#0047A0" transform="rotate(180 15 10)"/>
          <path d="M15 4 A6 6 0 1 0 15 16 A3 3 0 1 1 15 10 A3 3 0 1 0 15 4 Z" fill="#CD2E3A"/>
        </g>
      </g>
      <g fill="#000000">
        <g transform="translate(6.5 4.5) rotate(-45)">
          <rect x="-3.1" y="-2.4" width="6.2" height="0.6" rx="0.1"/>
          <rect x="-3.1" y="-0.3" width="6.2" height="0.6" rx="0.1"/>
          <rect x="-3.1" y="1.8" width="6.2" height="0.6" rx="0.1"/>
        </g>
        <g transform="translate(23.5 4.5) rotate(45)">
          <rect x="-3.1" y="-2.4" width="2.6" height="0.6" rx="0.1"/>
          <rect x="0.5" y="-2.4" width="2.6" height="0.6" rx="0.1"/>
          <rect x="-3.1" y="-0.3" width="6.2" height="0.6" rx="0.1"/>
          <rect x="-3.1" y="1.8" width="2.6" height="0.6" rx="0.1"/>
          <rect x="0.5" y="1.8" width="2.6" height="0.6" rx="0.1"/>
        </g>
        <g transform="translate(6.5 15.5) rotate(45)">
          <rect x="-3.1" y="-2.4" width="6.2" height="0.6" rx="0.1"/>
          <rect x="-3.1" y="-0.3" width="2.6" height="0.6" rx="0.1"/>
          <rect x="0.5" y="-0.3" width="2.6" height="0.6" rx="0.1"/>
          <rect x="-3.1" y="1.8" width="6.2" height="0.6" rx="0.1"/>
        </g>
        <g transform="translate(23.5 15.5) rotate(-45)">
          <rect x="-3.1" y="-2.4" width="2.6" height="0.6" rx="0.1"/>
          <rect x="0.5" y="-2.4" width="2.6" height="0.6" rx="0.1"/>
          <rect x="-3.1" y="-0.3" width="2.6" height="0.6" rx="0.1"/>
          <rect x="0.5" y="-0.3" width="2.6" height="0.6" rx="0.1"/>
          <rect x="-3.1" y="1.8" width="2.6" height="0.6" rx="0.1"/>
          <rect x="0.5" y="1.8" width="2.6" height="0.6" rx="0.1"/>
        </g>
      </g>
    </svg>
  `,
  ae: `
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <rect width="30" height="20" fill="#FFFFFF"/>
      <rect width="30" height="6.6667" fill="#00732F"/>
      <rect y="13.3334" width="30" height="6.6666" fill="#000000"/>
      <rect width="7.5" height="20" fill="#CE1126"/>
    </svg>
  `,
  es: `
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <rect width="30" height="20" fill="#AA151B"/>
      <rect y="5" width="30" height="10" fill="#F1BF00"/>
      <g transform="translate(10 10) scale(0.6)">
        <defs>
          <clipPath id="es-shield">
            <path d="M-4 -5 H4 V0 C4 3 2 5 0 6 C-2 5 -4 3 -4 0 Z"/>
          </clipPath>
        </defs>
        <g transform="translate(-6 0)">
          <rect x="-1" y="-5" width="2" height="10" fill="#FFFFFF" stroke="#B36A00" stroke-width="0.3"/>
          <rect x="-1.4" y="-6" width="2.8" height="1" fill="#F1BF00" stroke="#B36A00" stroke-width="0.3"/>
          <rect x="-1.4" y="5" width="2.8" height="1" fill="#F1BF00" stroke="#B36A00" stroke-width="0.3"/>
          <rect x="-1.5" y="-1" width="3" height="2" fill="#C60B1E" opacity="0.85"/>
        </g>
        <g transform="translate(6 0)">
          <rect x="-1" y="-5" width="2" height="10" fill="#FFFFFF" stroke="#B36A00" stroke-width="0.3"/>
          <rect x="-1.4" y="-6" width="2.8" height="1" fill="#F1BF00" stroke="#B36A00" stroke-width="0.3"/>
          <rect x="-1.4" y="5" width="2.8" height="1" fill="#F1BF00" stroke="#B36A00" stroke-width="0.3"/>
          <rect x="-1.5" y="-1" width="3" height="2" fill="#C60B1E" opacity="0.85"/>
        </g>
        <g clip-path="url(#es-shield)">
          <rect x="-4" y="-5" width="4" height="5" fill="#C60B1E"/>
          <rect x="0" y="-5" width="4" height="5" fill="#FFFFFF"/>
          <rect x="-4" y="0" width="4" height="5" fill="#F1BF00"/>
          <rect x="0" y="0" width="4" height="5" fill="#C60B1E"/>
          <rect x="-3.6" y="0" width="0.5" height="5" fill="#AA151B"/>
          <rect x="-2.6" y="0" width="0.5" height="5" fill="#AA151B"/>
          <rect x="-1.6" y="0" width="0.5" height="5" fill="#AA151B"/>
          <rect x="-0.6" y="0" width="0.5" height="5" fill="#AA151B"/>
          <rect x="0.4" y="0.4" width="3.2" height="4.2" fill="none" stroke="#F1BF00" stroke-width="0.3"/>
          <line x1="0.4" y1="0.4" x2="3.6" y2="4.6" stroke="#F1BF00" stroke-width="0.2"/>
          <line x1="3.6" y1="0.4" x2="0.4" y2="4.6" stroke="#F1BF00" stroke-width="0.2"/>
          <rect x="-3.2" y="-3.4" width="2.2" height="1.8" fill="#F1BF00" stroke="#AA151B" stroke-width="0.2"/>
          <rect x="-3.0" y="-4.1" width="0.5" height="0.7" fill="#F1BF00" stroke="#AA151B" stroke-width="0.15"/>
          <rect x="-2.3" y="-4.1" width="0.5" height="0.7" fill="#F1BF00" stroke="#AA151B" stroke-width="0.15"/>
          <rect x="-1.6" y="-4.1" width="0.5" height="0.7" fill="#F1BF00" stroke="#AA151B" stroke-width="0.15"/>
          <g transform="translate(0.1 -4.6)" fill="#D86A6A" stroke="#B94D4D" stroke-width="0.12" stroke-linejoin="round" stroke-linecap="round">
            <path d="M0.6 4.3 L0.5 3.4 Q0.4 3.0 0.8 2.7 L0.5 2.2 Q0.4 1.8 0.9 1.5 L1.3 1.4 L1.2 0.9 Q1.2 0.6 1.6 0.5 L2.1 0.6 Q2.4 0.2 2.8 0.3 Q3.3 0.4 3.2 1.0 Q3.1 1.4 2.7 1.5 L3.2 1.9 Q3.5 2.1 3.4 2.5 Q3.3 2.8 2.9 2.7 L3.0 3.2 Q3.0 3.6 2.5 3.6 L2.1 3.2 L1.8 3.5 L1.8 4.3 Z"/>
            <circle cx="2.6" cy="1.0" r="0.55"/>
            <circle cx="2.85" cy="1.0" r="0.18"/>
            <path d="M1.0 2.1 C0.25 1.5 0.25 0.6 0.95 0.3" fill="none"/>
            <circle cx="0.9" cy="0.25" r="0.12"/>
          </g>
          <circle cx="-1.5" cy="0.5" r="0.6" fill="none" stroke="#AA151B" stroke-width="0.25"/>
          <ellipse cx="0" cy="-0.2" rx="0.5" ry="0.6" fill="#1F4BA5"/>
          <circle cx="-0.2" cy="-0.3" r="0.12" fill="#F1BF00"/>
          <circle cx="0.2" cy="-0.3" r="0.12" fill="#F1BF00"/>
          <circle cx="0" cy="0.1" r="0.12" fill="#F1BF00"/>
          <circle cx="0" cy="2.2" r="0.4" fill="#C60B1E"/>
          <path d="M0 1.6 L0.3 2" stroke="#2E7D32" stroke-width="0.2"/>
        </g>
        <path d="M-4 -5 H4 V0 C4 3 2 5 0 6 C-2 5 -4 3 -4 0 Z" fill="none" stroke="#AA151B" stroke-width="0.4"/>
        <g transform="translate(0 -6.2)">
          <rect x="-2" y="-0.6" width="4" height="0.8" fill="#F1BF00" stroke="#AA151B" stroke-width="0.2"/>
          <path d="M-2 -0.6 L-1.2 -1.6 L0 -0.8 L1.2 -1.6 L2 -0.6" fill="none" stroke="#F1BF00" stroke-width="0.6" stroke-linecap="round"/>
          <circle cx="-1.2" cy="-1.6" r="0.3" fill="#F1BF00"/>
          <circle cx="0" cy="-0.9" r="0.3" fill="#F1BF00"/>
          <circle cx="1.2" cy="-1.6" r="0.3" fill="#F1BF00"/>
        </g>
      </g>
    </svg>
  `,
  de: `
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <rect width="30" height="6.6667" fill="#000000"/>
      <rect y="6.6667" width="30" height="6.6667" fill="#DD0000"/>
      <rect y="13.3334" width="30" height="6.6666" fill="#FFCE00"/>
    </svg>
  `,
  jp: `
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <rect width="30" height="20" fill="#FFFFFF"/>
      <circle cx="15" cy="10" r="6" fill="#BC002D"/>
    </svg>
  `,
  cn: `
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <defs>
        <polygon id="cn-star" points="0,-1 0.225,-0.309 0.951,-0.309 0.363,0.118 0.588,0.809 0,0.382 -0.588,0.809 -0.363,0.118 -0.951,-0.309 -0.225,-0.309"/>
      </defs>
      <rect width="30" height="20" fill="#DE2910"/>
      <g transform="translate(1.5 1.5)">
        <use href="#cn-star" fill="#FFDE00" transform="translate(5 5) scale(3)"/>
        <use href="#cn-star" fill="#FFDE00" transform="translate(10 2) rotate(239.04) scale(1.2)"/>
        <use href="#cn-star" fill="#FFDE00" transform="translate(12 4) rotate(261.87) scale(1.2)"/>
        <use href="#cn-star" fill="#FFDE00" transform="translate(12 7) rotate(-74.05) scale(1.2)"/>
        <use href="#cn-star" fill="#FFDE00" transform="translate(10 9) rotate(-51.34) scale(1.2)"/>
      </g>
    </svg>
  `,
  pt: `
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <rect width="12" height="20" fill="#006600"/>
      <rect x="12" width="18" height="20" fill="#C0002A"/>
      <g transform="translate(12 10)">
        <circle r="5" fill="none" stroke="#F5C542" stroke-width="1"/>
        <ellipse rx="4.6" ry="2.6" fill="none" stroke="#F5C542" stroke-width="0.7"/>
        <ellipse rx="2.6" ry="4.6" fill="none" stroke="#F5C542" stroke-width="0.7"/>
        <path d="M-2.6 -4 H2.6 V1.2 C2.6 2.8 1.2 4.1 0 4.7 C-1.2 4.1 -2.6 2.8 -2.6 1.2 Z" fill="#FFFFFF" stroke="#C0002A" stroke-width="0.4"/>
        <g fill="#003399">
          <rect x="-1.6" y="-2.6" width="1" height="1.4" rx="0.2"/>
          <rect x="0.6" y="-2.6" width="1" height="1.4" rx="0.2"/>
          <rect x="-0.5" y="-0.8" width="1" height="1.4" rx="0.2"/>
          <rect x="-1.6" y="1" width="1" height="1.4" rx="0.2"/>
          <rect x="0.6" y="1" width="1" height="1.4" rx="0.2"/>
        </g>
      </g>
    </svg>
  `,
  in: `
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <rect width="30" height="20" fill="#FFFFFF"/>
      <rect width="30" height="6.6667" fill="#FF9933"/>
      <rect y="13.3334" width="30" height="6.6666" fill="#138808"/>
      <circle cx="15" cy="10" r="3.2" fill="none" stroke="#000080" stroke-width="0.5"/>
      <circle cx="15" cy="10" r="0.4" fill="#000080"/>
      <g stroke="#000080" stroke-width="0.3" stroke-linecap="round">
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(0 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(15 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(30 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(45 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(60 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(75 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(90 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(105 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(120 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(135 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(150 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(165 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(180 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(195 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(210 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(225 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(240 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(255 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(270 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(285 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(300 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(315 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(330 15 10)" />
        <line x1="15" y1="10" x2="15" y2="6.4" transform="rotate(345 15 10)" />
      </g>
    </svg>
  `,
};

let lineIndex = 0;
let activeLine = lines[0];
let typingTimer;
let speakingTimer;
let gazeResetTimer;
let guideInteractionTimer;
let speechReplayTimer;
const chatHistory = [];
let chatRequestInFlight = false;
const MAX_VISIBLE_CHAT_MESSAGES = 16;
let userHasMessagedMimi = false;
let lastMimiReply = "";
let chatFreshPulseTimer;
const MIMI_CHAT_HISTORY_KEY_PREFIX = "cosmicaMimiChatHistory:v2";
const MIMI_CHAT_HISTORY_LEGACY_KEY = "cosmicaMimiChatHistory:v1";
const MIMI_CHAT_HISTORY_SCOPE_GUEST = "guest";
const MIMI_CHAT_STORAGE_SCHEMA_KEY = "cosmicaMimiChatSchema";
const MIMI_CHAT_STORAGE_SCHEMA_VERSION = "v3";
let defaultMimiPrompt = "";
let activeMimiChatHistoryScope = MIMI_CHAT_HISTORY_SCOPE_GUEST;

const normalizeMimiChatHistoryScope = (scope) => {
  const raw = String(scope || "").trim().toLowerCase();
  if (!raw) {
    return MIMI_CHAT_HISTORY_SCOPE_GUEST;
  }
  if (raw === MIMI_CHAT_HISTORY_SCOPE_GUEST) {
    return MIMI_CHAT_HISTORY_SCOPE_GUEST;
  }
  return raw.replace(/[^a-z0-9:_-]/g, "") || MIMI_CHAT_HISTORY_SCOPE_GUEST;
};

const getMimiChatHistoryStorageKey = (scope = activeMimiChatHistoryScope) => {
  const normalizedScope = normalizeMimiChatHistoryScope(scope);
  return `${MIMI_CHAT_HISTORY_KEY_PREFIX}:${normalizedScope}`;
};

const resolveMimiChatHistoryScopeFromSnapshot = (snapshot) => {
  const userId = String(snapshot?.user?.id || "").trim();
  if (!userId) {
    return MIMI_CHAT_HISTORY_SCOPE_GUEST;
  }
  return normalizeMimiChatHistoryScope(`user:${userId}`);
};

const sanitizeChatHistory = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      role: entry.role === "assistant" ? "assistant" : "user",
      content: typeof entry.content === "string" ? entry.content.trim() : "",
    }))
    .filter((entry) => entry.content.length > 0)
    .slice(-Math.max(0, MIMI_CONFIG.historyLimit || 0));
};

const loadChatHistoryFromStorage = () => {
  try {
    const storageKey = getMimiChatHistoryStorageKey();
    let loadedFromLegacyGuestKey = false;
    let raw =
      sessionStorage.getItem(storageKey) ||
      localStorage.getItem(storageKey);
    if (!raw && activeMimiChatHistoryScope === MIMI_CHAT_HISTORY_SCOPE_GUEST) {
      raw =
        sessionStorage.getItem(MIMI_CHAT_HISTORY_LEGACY_KEY) ||
        localStorage.getItem(MIMI_CHAT_HISTORY_LEGACY_KEY);
      loadedFromLegacyGuestKey = Boolean(raw);
    }
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    const restored = sanitizeChatHistory(parsed);
    if (!restored.length) {
      return;
    }
    chatHistory.push(...restored);
    userHasMessagedMimi = restored.some((entry) => entry.role === "user");
    const latestAssistant = [...restored].reverse().find((entry) => entry.role === "assistant");
    if (latestAssistant) {
      lastMimiReply = latestAssistant.content;
    }
    persistChatHistoryToStorage();
    if (loadedFromLegacyGuestKey) {
      sessionStorage.removeItem(MIMI_CHAT_HISTORY_LEGACY_KEY);
      localStorage.removeItem(MIMI_CHAT_HISTORY_LEGACY_KEY);
    }
  } catch {}
};

const persistChatHistoryToStorage = () => {
  try {
    const storageKey = getMimiChatHistoryStorageKey();
    const payload = chatHistory.slice(-Math.max(0, MIMI_CONFIG.historyLimit || 0));
    const serialized = JSON.stringify(payload);
    sessionStorage.setItem(storageKey, serialized);
    localStorage.setItem(storageKey, serialized);
  } catch {}
};

const clearChatHistoryFromStorage = () => {
  try {
    const storageKey = getMimiChatHistoryStorageKey();
    sessionStorage.removeItem(storageKey);
    localStorage.removeItem(storageKey);
    if (activeMimiChatHistoryScope === MIMI_CHAT_HISTORY_SCOPE_GUEST) {
      sessionStorage.removeItem(MIMI_CHAT_HISTORY_LEGACY_KEY);
      localStorage.removeItem(MIMI_CHAT_HISTORY_LEGACY_KEY);
    }
  } catch {}
};

const ensureMimiChatStorageSchema = () => {
  try {
    const current = localStorage.getItem(MIMI_CHAT_STORAGE_SCHEMA_KEY);
    if (current === MIMI_CHAT_STORAGE_SCHEMA_VERSION) {
      return;
    }
    const keysToRemove = new Set();
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key) {
        continue;
      }
      if (key.startsWith(`${MIMI_CHAT_HISTORY_KEY_PREFIX}:`) || key === MIMI_CHAT_HISTORY_LEGACY_KEY) {
        keysToRemove.add(key);
      }
    }
    for (let index = 0; index < sessionStorage.length; index += 1) {
      const key = sessionStorage.key(index);
      if (!key) {
        continue;
      }
      if (key.startsWith(`${MIMI_CHAT_HISTORY_KEY_PREFIX}:`) || key === MIMI_CHAT_HISTORY_LEGACY_KEY) {
        keysToRemove.add(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
    localStorage.setItem(
      MIMI_CHAT_STORAGE_SCHEMA_KEY,
      MIMI_CHAT_STORAGE_SCHEMA_VERSION
    );
  } catch {}
};

ensureMimiChatStorageSchema();
activeMimiChatHistoryScope = resolveMimiChatHistoryScopeFromSnapshot(
  typeof window.cosmicaGamification?.getState === "function" ? window.cosmicaGamification.getState() : null
);
loadChatHistoryFromStorage();

const renderFlags = () => {
  document.querySelectorAll(".flag-badge").forEach((badge) => {
    const code = badge.dataset.flag;
    const svg = FLAG_SVGS[code];
    if (svg) {
      badge.innerHTML = svg.trim();
    }
  });
};

renderFlags();

const mouthShapes = {
  happy: "M10 10 C 22 26, 42 26, 54 10",
  curious: "M10 10 C 22 26, 42 26, 54 10",
  thinking: "M10 10 C 22 26, 42 26, 54 10",
};

const setMood = (mood) => {
  if (!alien) {
    return;
  }
  alien.classList.remove("mood-happy", "mood-curious", "mood-thinking");
  if (mood) {
    alien.classList.add(`mood-${mood}`);
  }
  if (mouthPath) {
    mouthPath.setAttribute("d", mouthShapes[mood] || mouthShapes.happy);
  }
};

const pulseGuideInteractivity = (durationMs = 980) => {
  const section = document.getElementById("guide");
  if (!section) {
    return;
  }
  section.classList.add("is-active");
  window.clearTimeout(guideInteractionTimer);
  guideInteractionTimer = window.setTimeout(() => {
    section.classList.remove("is-active");
  }, durationMs);
};

const stopSpeaking = () => {
  if (!speechBubble) {
    return;
  }
  window.clearTimeout(speakingTimer);
  speakingTimer = window.setTimeout(() => {
    speechBubble.classList.remove("speaking");
  }, 320);
};

const speakLine = (text, mood = "happy", options = {}) => {
  if (!speechText || !speechBubble) {
    return;
  }
  const { instant = false } = options;
  activeLine = String(text || "").trim() || activeLine;
  speechText.dataset.text = activeLine;
  window.clearTimeout(typingTimer);
  window.clearTimeout(speakingTimer);
  speechBubble.classList.add("speaking");
  pulseGuideInteractivity(1200);
  setMood(mood);
  if (instant) {
    speechText.textContent = text;
    stopSpeaking();
    return;
  }
  let index = 0;
  speechText.textContent = "";
  const step = () => {
    index += 1;
    speechText.textContent = text.slice(0, index);
    if (index < text.length) {
      typingTimer = window.setTimeout(step, 18 + Math.random() * 22);
    } else {
      stopSpeaking();
    }
  };
  step();
};

const scrollChatToBottom = () => {
  if (!chatLog) {
    return;
  }
  chatLog.scrollTop = chatLog.scrollHeight;
};

const syncChatLogMessageState = () => {
  if (!chatLog) {
    return;
  }
  const hasMessages = Boolean(chatLog.querySelector(".chat-message"));
  const hasUserMessages = Boolean(chatLog.querySelector(".chat-message.user"));
  chatLog.classList.toggle("has-messages", hasMessages);
  chatLog.classList.toggle("has-user-messages", hasUserMessages);
};

const animateChatLogPulse = () => {
  if (!chatLog) {
    return;
  }
  if (prefersReducedMotion) {
    return;
  }
  chatLog.classList.remove("has-fresh-message");
  window.requestAnimationFrame(() => {
    if (!chatLog) {
      return;
    }
    chatLog.classList.add("has-fresh-message");
  });
  window.clearTimeout(chatFreshPulseTimer);
  chatFreshPulseTimer = window.setTimeout(() => {
    if (!chatLog) {
      return;
    }
    chatLog.classList.remove("has-fresh-message");
  }, 620);
};

const normalizeChatStatusState = (text) => {
  const value = String(text || "").toLowerCase();
  if (!value) {
    return "ready";
  }
  if (value.includes("offline")) {
    return "offline";
  }
  if (value.includes("reconnect")) {
    return "reconnecting";
  }
  if (value.includes("charting") || value.includes("typing") || value.includes("thinking")) {
    return "thinking";
  }
  if (value.includes("live")) {
    return "live";
  }
  return "ready";
};

const revealMimiBubbleOnMobile = () => {
  if (!speechBubble) {
    return;
  }
  if (!window.matchMedia("(max-width: 960px)").matches) {
    return;
  }
  const rect = speechBubble.getBoundingClientRect();
  const targetTop = Math.max(18, window.innerHeight * 0.12);
  const delta = rect.top - targetTop;
  if (Math.abs(delta) < 24) {
    return;
  }
  const nextTop = Math.max(0, window.scrollY + delta);
  window.scrollTo({ top: nextTop, behavior: "smooth" });
};

const trimVisibleChatMessages = () => {
  if (!chatLog) {
    return;
  }
  const messages = chatLog.querySelectorAll(".chat-message");
  const overflowCount = messages.length - MAX_VISIBLE_CHAT_MESSAGES;
  if (overflowCount <= 0) {
    return;
  }
  for (let i = 0; i < overflowCount; i += 1) {
    messages[i].remove();
  }
  syncChatLogMessageState();
};

const appendChatMessage = (role, text, options = {}) => {
  if (!chatLog) {
    return null;
  }
  const existingTyping = chatLog.querySelector('.chat-message.typing[data-role="mimi"]');
  if (role === "mimi" && options.typing) {
    if (existingTyping) {
      chatLog.classList.add("typing");
      syncChatLogMessageState();
      scrollChatToBottom();
      return existingTyping;
    }
    const typingMessage = document.createElement("div");
    typingMessage.classList.add("chat-message", "mimi", "typing");
    typingMessage.dataset.role = "mimi";
    const typingBubble = document.createElement("div");
    typingBubble.classList.add("chat-bubble");
    const typingLabel = document.createElement("div");
    typingLabel.classList.add("chat-label");
    typingLabel.textContent = "Mimi";
    const typingBody = document.createElement("div");
    typingBody.classList.add("chat-text", "chat-typing");
    typingBody.innerHTML = "<span></span><span></span><span></span>";
    typingBubble.appendChild(typingLabel);
    typingBubble.appendChild(typingBody);
    typingMessage.appendChild(typingBubble);
    chatLog.appendChild(typingMessage);
    chatLog.classList.add("typing");
    syncChatLogMessageState();
    animateChatLogPulse();
    scrollChatToBottom();
    return typingMessage;
  }
  if (existingTyping) {
    existingTyping.remove();
    syncChatLogMessageState();
  }
  chatLog.classList.remove("typing");

  const message = document.createElement("div");
  message.classList.add("chat-message", role);
  if (role === "mimi") {
    message.dataset.role = "mimi";
  }
  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble");
  const body = document.createElement("div");
  body.classList.add("chat-text");
  body.textContent = text;
  const label = document.createElement("div");
  label.classList.add("chat-label");
  label.textContent = role === "mimi" ? "Mimi" : "You";
  bubble.appendChild(label);
  bubble.appendChild(body);
  message.appendChild(bubble);
  chatLog.appendChild(message);
  syncChatLogMessageState();
  if (!prefersReducedMotion) {
    message.classList.add("is-entering");
    window.setTimeout(() => {
      message.classList.remove("is-entering");
    }, 340);
  }
  animateChatLogPulse();
  trimVisibleChatMessages();
  scrollChatToBottom();
  return message;
};

const setChatStatus = (text) => {
  if (!chatStatus) {
    return;
  }
  const state = normalizeChatStatusState(text);
  chatStatus.dataset.state = state;
  const statusText = chatStatus.querySelector(".chat-status-text");
  if (statusText) {
    statusText.textContent = text;
  }
};

const resetMimiConversationState = ({ resetPromptText = false, clearStorage = true } = {}) => {
  chatHistory.length = 0;
  userHasMessagedMimi = false;
  lastMimiReply = "";
  if (clearStorage) {
    clearChatHistoryFromStorage();
  }
  if (chatLog) {
    chatLog.innerHTML = "";
    chatLog.classList.remove("typing");
    syncChatLogMessageState();
  }
  if (chatInput) {
    chatInput.value = "";
  }
  if (resetPromptText && speechText) {
    const fallbackPrompt =
      defaultMimiPrompt ||
      speechText.dataset.defaultMimiPrompt ||
      speechText.dataset.text ||
      lines[0];
    speechText.textContent = fallbackPrompt;
    speechText.dataset.text = fallbackPrompt;
  }
  if (speechBubble) {
    speechBubble.classList.remove("speaking");
    speechBubble.classList.remove("is-replaying");
  }
  const guideSection = document.getElementById("guide");
  if (guideSection) {
    guideSection.classList.remove("is-active");
  }
  setChatStatus("Mimi ready");
};

const syncMimiChatHistoryScopeFromAuthState = (snapshot, { force = false } = {}) => {
  const nextScope = resolveMimiChatHistoryScopeFromSnapshot(snapshot);
  if (!force && nextScope === activeMimiChatHistoryScope) {
    return;
  }
  persistChatHistoryToStorage();
  activeMimiChatHistoryScope = nextScope;
  resetMimiConversationState({ resetPromptText: true, clearStorage: false });
  loadChatHistoryFromStorage();
};

if (window.cosmicaGamification && typeof window.cosmicaGamification.subscribe === "function") {
  window.cosmicaGamification.subscribe((snapshot) => {
    syncMimiChatHistoryScopeFromAuthState(snapshot);
    const snapshotUser = snapshot?.user && typeof snapshot.user === "object" ? snapshot.user : null;
    const premiumFlagRaw = snapshotUser?.isPremium ?? snapshotUser?.premium;
    const premiumFlagText = String(premiumFlagRaw ?? "")
      .trim()
      .toLowerCase();
    const premiumTier = String(
      snapshotUser?.planTier || snapshotUser?.tier || snapshotUser?.plan || snapshotUser?.membership || ""
    )
      .trim()
      .toLowerCase();
    const hasPremiumAccess =
      premiumFlagRaw === true ||
      premiumFlagText === "1" ||
      premiumFlagText === "true" ||
      premiumFlagText === "yes" ||
      premiumFlagText === "premium" ||
      premiumFlagText === "pro" ||
      premiumFlagText === "plus" ||
      premiumTier === "premium" ||
      premiumTier === "pro" ||
      premiumTier === "plus" ||
      premiumTier === "paid";
    if (hasPremiumAccess) {
      removeMimiPremiumBubble();
    }
  });
}

const getApiEndpoint = () => {
  return getApiEndpointCandidates()[0];
};

const createAbortController = () => {
  if (typeof AbortController === "undefined") {
    return null;
  }
  return new AbortController();
};

const setupApiHealthIndicator = () => {
  // Intentionally no-op: keep chat status text, remove separate API health badge.
};

const isLocalDevHost = (hostname) => {
  const value = String(hostname || "").toLowerCase();
  if (!value) {
    return false;
  }
  if (value === "localhost" || value === "127.0.0.1" || value === "::1") {
    return true;
  }
  if (/^10\./.test(value) || /^192\.168\./.test(value)) {
    return true;
  }
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(value)) {
    return true;
  }
  if (value.endsWith(".local")) {
    return true;
  }
  return false;
};

const getApiEndpointCandidates = () => {
  const endpoint = MIMI_CONFIG.endpoint || "/api/chat";
  if (endpoint.startsWith("http")) {
    return [endpoint];
  }

  const { protocol, hostname, port } = window.location;
  const normalizedHost = String(hostname || "").toLowerCase();
  const candidates = [];
  const addCandidate = (url) => {
    if (!url) {
      return;
    }
    if (!candidates.includes(url)) {
      candidates.push(url);
    }
  };

  if (!hostname || protocol === "file:") {
    addCandidate(`http://localhost:3000${endpoint}`);
    return candidates;
  }

  // Public production hosts.
  const isCosmicaPublicHost =
    normalizedHost === "cosmicalearn.com" ||
    normalizedHost === "www.cosmicalearn.com" ||
    normalizedHost === "cosmica-03wo.onrender.com";
  if (isCosmicaPublicHost) {
    // Prefer same-origin route first on mobile/public to avoid cross-origin/WAF edge cases.
    addCandidate(endpoint);
    addCandidate(`${protocol}//${hostname}${endpoint}`);
    addCandidate(`https://www.cosmicalearn.com${endpoint}`);
    return candidates;
  }

  // Local/mobile dev fallback: when UI runs on a non-3000 dev port, API usually runs on :3000.
  if (port && port !== "3000" && isLocalDevHost(hostname)) {
    addCandidate(`${protocol}//${hostname}:3000${endpoint}`);
    addCandidate(endpoint);
    return candidates;
  }

  // Default: same-origin route.
  addCandidate(endpoint);
  return candidates;
};

const LETTERS_TITLE_TRANSLATION_CACHE_KEY = "cosmicaLettersTitleTranslationCache:v1";
let lettersTitleTranslationCache = null;

const readLettersTitleTranslationCache = () => {
  if (lettersTitleTranslationCache instanceof Map) {
    return lettersTitleTranslationCache;
  }
  try {
    const raw = localStorage.getItem(LETTERS_TITLE_TRANSLATION_CACHE_KEY);
    if (!raw) {
      lettersTitleTranslationCache = new Map();
      return lettersTitleTranslationCache;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      lettersTitleTranslationCache = new Map();
      return lettersTitleTranslationCache;
    }
    const entries = Object.entries(parsed).filter(
      ([key, value]) => key && typeof value === "string" && value.trim()
    );
    lettersTitleTranslationCache = new Map(entries);
    return lettersTitleTranslationCache;
  } catch {
    lettersTitleTranslationCache = new Map();
    return lettersTitleTranslationCache;
  }
};

const persistLettersTitleTranslationCache = () => {
  if (!(lettersTitleTranslationCache instanceof Map)) {
    return;
  }
  try {
    localStorage.setItem(
      LETTERS_TITLE_TRANSLATION_CACHE_KEY,
      JSON.stringify(Object.fromEntries(lettersTitleTranslationCache))
    );
  } catch {}
};

const buildLettersTranslateEndpointCandidates = () => {
  const candidates = [];
  const addCandidate = (value) => {
    const normalized = String(value || "").trim();
    if (!normalized || candidates.includes(normalized)) {
      return;
    }
    candidates.push(normalized);
  };
  addCandidate("/api/translate");
  if (typeof getApiEndpointCandidates === "function") {
    getApiEndpointCandidates().forEach((candidate) => {
      addCandidate(
        String(candidate || "").replace(/\/api\/chat(?=$|[?#])/i, "/api/translate")
      );
    });
  }
  return candidates;
};

const requestLettersTitleTranslation = async (titleText, targetLanguage) => {
  const title = String(titleText || "").trim();
  const lang = String(targetLanguage || "").trim().toLowerCase();
  const shouldSkipForWorldNativeLanguage = lang === WORLD_KEY;
  if (!title || !lang || shouldSkipForWorldNativeLanguage) {
    return "";
  }

  const endpointCandidates = buildLettersTranslateEndpointCandidates();
  const translateOnce = async (endpoint) => {
    const controller = createAbortController();
    const timeout = controller
      ? window.setTimeout(() => controller.abort(), 9000)
      : null;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: title,
          targetLanguage: lang,
        }),
        cache: "no-store",
        credentials: "same-origin",
        ...(controller ? { signal: controller.signal } : {}),
      });
      if (!response.ok) {
        throw new Error(`Letters title translation failed: ${response.status}`);
      }
      const data = await response.json().catch(() => ({}));
      return String(data?.translation || data?.content || "")
        .replace(/^["'`]|["'`]$/g, "")
        .trim();
    } finally {
      if (timeout) {
        window.clearTimeout(timeout);
      }
    }
  };

  for (const endpoint of endpointCandidates) {
    try {
      const translated = await translateOnce(endpoint);
      if (translated) {
        return translated;
      }
    } catch {}
  }
  return "";
};

const setupLettersTitleTranslation = async () => {
  if (!document.body.classList.contains("letters-page")) {
    return;
  }
  const selectedBaseLanguage = readStoredBaseLanguagePreference();
  const lettersHeading = document.querySelector(".letters-grid-section .section-title h2");
  if (!lettersHeading) {
    return;
  }
  let translationNode = lettersHeading.querySelector(".letters-title-translation");
  const shouldSkipForWorldNativeLanguage = selectedBaseLanguage === WORLD_KEY;
  if (!selectedBaseLanguage || shouldSkipForWorldNativeLanguage) {
    if (translationNode) {
      translationNode.textContent = "";
      translationNode.hidden = true;
    }
    return;
  }
  const baseTitle = String(lettersHeading.textContent || "").replace(/\s+/g, " ").trim();
  if (!baseTitle) {
    return;
  }
  if (!translationNode) {
    translationNode = document.createElement("span");
    translationNode.className = "letters-title-translation";
    translationNode.setAttribute("dir", "auto");
    lettersHeading.appendChild(document.createTextNode(" "));
    lettersHeading.appendChild(translationNode);
  }
  translationNode.hidden = false;

  const cache = readLettersTitleTranslationCache();
  const cacheKey = `${WORLD_KEY}::${selectedBaseLanguage}::${baseTitle.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    translationNode.textContent = `(${cached})`;
    translationNode.hidden = false;
    return;
  }

  const translated = await requestLettersTitleTranslation(baseTitle, selectedBaseLanguage);
  if (!translated) {
    return;
  }
  cache.set(cacheKey, translated);
  persistLettersTitleTranslationCache();
  translationNode.textContent = `(${translated})`;
  translationNode.hidden = false;
};

const setupLettersSectionCompleteButton = () => {
  if (!document.body.classList.contains("letters-page")) {
    return;
  }
  const lettersSection = document.querySelector(".letters-grid-section");
  if (!lettersSection) {
    return;
  }

  let button = lettersSection.querySelector('.map-section-complete-btn[data-map-key="letters"]');
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "map-section-complete-btn";
    button.style.position = "absolute";
    button.style.top = "16px";
    button.style.right = "16px";
    button.style.left = "auto";
    button.style.zIndex = "3";
    button.dataset.mapKey = "letters";
    button.dataset.sectionKey = "letters-core";
    button.textContent = "✓";
    lettersSection.appendChild(button);
  }

  const currentUserHasPremiumAccess = () => {
    const snapshot =
      window.cosmicaGamification && typeof window.cosmicaGamification.getState === "function"
        ? window.cosmicaGamification.getState()
        : null;
    const user = snapshot && snapshot.user && typeof snapshot.user === "object" ? snapshot.user : null;
    const premiumFlagRaw = user?.isPremium ?? user?.premium;
    const premiumFlagText = String(premiumFlagRaw ?? "")
      .trim()
      .toLowerCase();
    const premiumTier = String(user?.planTier || user?.tier || user?.plan || user?.membership || "")
      .trim()
      .toLowerCase();
    const premiumStatus = String(
      user?.premiumStatus ||
        user?.subscriptionStatus ||
        user?.premiumStripeSubscriptionStatus ||
        user?.stripeSubscriptionStatus ||
        ""
    )
      .trim()
      .toLowerCase();
    const premiumEndRaw = String(
      user?.premiumCurrentPeriodEnd ||
        user?.premiumEndsAt ||
        user?.premiumExpiresAt ||
        user?.subscriptionEndsAt ||
        user?.currentPeriodEnd ||
        user?.planEndsAt ||
        user?.expiresAt ||
        ""
    ).trim();
    const premiumEndMs = Date.parse(premiumEndRaw);
    const hasFuturePremiumEnd = Number.isFinite(premiumEndMs) && premiumEndMs > Date.now();
    const statusIndicatesPremium =
      premiumStatus === "active" ||
      premiumStatus === "trialing" ||
      premiumStatus === "past_due" ||
      premiumStatus === "canceling" ||
      premiumStatus === "grace";
    return (
      premiumFlagRaw === true ||
      premiumFlagText === "1" ||
      premiumFlagText === "true" ||
      premiumFlagText === "yes" ||
      premiumFlagText === "premium" ||
      premiumFlagText === "pro" ||
      premiumFlagText === "plus" ||
      premiumTier === "premium" ||
      premiumTier === "pro" ||
      premiumTier === "plus" ||
      premiumTier === "paid" ||
      statusIndicatesPremium ||
      hasFuturePremiumEnd
    );
  };

  const syncButtonState = () => {
    const mapKey = String(button.dataset.mapKey || "letters").trim().toLowerCase();
    const sectionKey = String(button.dataset.sectionKey || "letters-core").trim();
    const overrideValue =
      typeof window.cosmicaGetSectionCompletionOverride === "function"
        ? window.cosmicaGetSectionCompletionOverride({
            worldKey: WORLD_KEY,
            mapKey,
            sectionKey,
          })
        : null;
    const progress =
      window.cosmicaGamification && typeof window.cosmicaGamification.getSectionProgress === "function"
        ? window.cosmicaGamification.getSectionProgress({
            worldKey: WORLD_KEY,
            mapKey,
            sectionKey,
          })
        : null;
    const isComplete =
      typeof overrideValue === "boolean"
        ? overrideValue
        : String(progress?.status || "").trim().toLowerCase() === "completed" ||
          Boolean(progress?.firstCompletedAt);
    const hasPremiumAccess = currentUserHasPremiumAccess();
    const statusLabel = hasPremiumAccess ? (isComplete ? "Completed" : "") : isComplete ? "Completed" : "";
    button.classList.toggle("is-complete", isComplete);
    button.setAttribute("aria-pressed", isComplete ? "true" : "false");
    const incompleteLabel = "";
    button.setAttribute("aria-label", isComplete ? "Mark section incomplete" : "Mark section complete");
    button.title = "";
    button.setAttribute("data-status-label", statusLabel);
  };

  if (button.dataset.bound !== "1") {
    button.dataset.bound = "1";
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const shouldUncheck = button.classList.contains("is-complete");
      const statusToSend = shouldUncheck ? "uncompleted" : "completed";
      if (button.dataset.busy === "1") {
        return;
      }

      if (
        window.cosmicaGamification &&
        typeof window.cosmicaGamification.getState === "function" &&
        !window.cosmicaGamification.getState()?.isAuthenticated
      ) {
        if (typeof window.cosmicaOpenSignupPanelUpwards === "function") {
          window.cosmicaOpenSignupPanelUpwards("Sign up to save section completion.");
        }
        return;
      }

      if (typeof window.cosmicaSetSectionCompletionOverride === "function") {
        window.cosmicaSetSectionCompletionOverride({
          worldKey: WORLD_KEY,
          mapKey: "letters",
          sectionKey: "letters-core",
          isComplete: !shouldUncheck,
        });
      }

      button.dataset.busy = "1";
      button.disabled = true;
      try {
        if (
          window.cosmicaGamification &&
          typeof window.cosmicaGamification.trackProgress === "function"
        ) {
          await window.cosmicaGamification.trackProgress({
            worldKey: WORLD_KEY,
            mapKey: "letters",
            sectionKey: "letters-core",
            status: statusToSend,
          });
        } else {
          trackLearningProgressEvent({
            status: statusToSend,
            mapKey: "letters",
            sectionKey: "letters-core",
          });
        }
      } finally {
        button.disabled = false;
        delete button.dataset.busy;
        syncButtonState();
      }
    });
  }

  syncButtonState();
};

const slugifyLettersCardPracticeValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const buildLettersCardPracticeSectionKey = (sectionKey, cardKey) => {
  const normalizedSection = String(sectionKey || "core").trim() || "core";
  const normalizedCard = slugifyLettersCardPracticeValue(cardKey) || "card";
  return `card::${normalizedSection}::${normalizedCard}`;
};

const setupLettersCardPracticeButtons = () => {
  if (!document.body.classList.contains("letters-page")) {
    return;
  }

  const letterCards = Array.from(document.querySelectorAll(".letter-card"));
  if (!letterCards.length) {
    return;
  }

  letterCards.forEach((card, index) => {
    const symbol = String(card.dataset.letter || card.querySelector(".letter")?.textContent || "").trim();
    const practiceSectionKey = buildLettersCardPracticeSectionKey("letters-core", `${symbol || "letter"}-${index}`);

    let button = card.querySelector('.map-card-practice-btn[data-map-key="letters"]');
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "map-section-complete-btn map-card-practice-btn";
      button.textContent = "✓";
      button.dataset.mapKey = "letters";
      button.dataset.sectionKey = practiceSectionKey;
      card.appendChild(button);
    }

    const syncButtonState = () => {
      const overrideValue =
        typeof window.cosmicaGetSectionCompletionOverride === "function"
          ? window.cosmicaGetSectionCompletionOverride({
              worldKey: WORLD_KEY,
              mapKey: "letters",
              sectionKey: `practice::${practiceSectionKey}`,
            })
          : null;
      const progress =
        window.cosmicaGamification && typeof window.cosmicaGamification.getSectionProgress === "function"
          ? window.cosmicaGamification.getSectionProgress({
              worldKey: WORLD_KEY,
              mapKey: "letters",
              sectionKey: practiceSectionKey,
            })
          : null;
      const isComplete = typeof overrideValue === "boolean" ? overrideValue : Boolean(progress?.practiceQuestCheckedAt);
      button.classList.toggle("is-complete", isComplete);
      button.setAttribute("aria-pressed", isComplete ? "true" : "false");
      button.setAttribute("aria-label", isComplete ? "Unmark card as practiced" : "Mark card as practiced");
      button.title = isComplete ? "Unmark card as practiced" : "Mark card as practiced";
    };

    if (button.dataset.bound !== "1") {
      button.dataset.bound = "1";
      button.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (button.dataset.busy === "1") {
          return;
        }
        const shouldUncheck = button.classList.contains("is-complete");
        const statusToSend = shouldUncheck ? "uncompleted" : "completed";

        if (
          window.cosmicaGamification &&
          typeof window.cosmicaGamification.getState === "function" &&
          !window.cosmicaGamification.getState()?.isAuthenticated
        ) {
          if (typeof window.cosmicaOpenSignupPanelUpwards === "function") {
            window.cosmicaOpenSignupPanelUpwards("Sign up to save card practice progress.");
          }
          return;
        }

        if (typeof window.cosmicaSetSectionCompletionOverride === "function") {
          window.cosmicaSetSectionCompletionOverride({
            worldKey: WORLD_KEY,
            mapKey: "letters",
            sectionKey: `practice::${practiceSectionKey}`,
            isComplete: !shouldUncheck,
          });
        }

        button.dataset.busy = "1";
        button.disabled = true;
        try {
          if (
            window.cosmicaGamification &&
            typeof window.cosmicaGamification.trackProgress === "function"
          ) {
            await window.cosmicaGamification.trackProgress({
              worldKey: WORLD_KEY,
              mapKey: "letters",
              sectionKey: practiceSectionKey,
              status: statusToSend,
              questToggleMode: "practice",
            });
          } else {
            trackLearningProgressEvent({
              status: statusToSend,
              mapKey: "letters",
              sectionKey: practiceSectionKey,
              questToggleMode: "practice",
            });
          }
        } finally {
          button.disabled = false;
          delete button.dataset.busy;
          syncButtonState();
        }
      });
    }

    syncButtonState();
  });
};

const LETTERS_HELPER_NATIVE_TEXT = Object.freeze({
  english: "Tap a letter to hear clear pronunciation.",
  french: "Appuie sur une lettre pour entendre une prononciation claire.",
  german: "Tippe auf einen Buchstaben, um eine klare Aussprache zu hören.",
  spanish: "Toca una letra para escuchar una pronunciación clara.",
  portuguese: "Toque em uma letra para ouvir uma pronúncia clara.",
  dutch: "Tik op een letter om een duidelijke uitspraak te horen.",
  swedish: "Tryck på en bokstav för att höra ett tydligt uttal.",
  arabic: "اضغط على حرف لسماع نطق واضح.",
  chinese: "点击一个字母以听到清晰发音。",
  japanese: "文字をタップすると、はっきりした発音を聞けます。",
  korean: "문자를 탭하면 또렷한 발음을 들을 수 있습니다.",
  hindi: "स्पष्ट उच्चारण सुनने के लिए किसी अक्षर पर टैप करें।",
});

const isInvalidLettersHelperTranslation = (value) => {
  const text = String(value || "").trim();
  if (!text) {
    return true;
  }
  const lower = text.toLowerCase();
  if (
    lower.includes("appears to be in a different language") ||
    lower.includes("does not translate directly into english") ||
    lower.includes("please provide a clear text for translation")
  ) {
    return true;
  }
  if (
    text.startsWith("[") &&
    text.endsWith("]") &&
    (lower.includes("translation") || lower.includes("text appears"))
  ) {
    return true;
  }
  return false;
};

const setupLettersHelperTranslation = async () => {
  if (!document.body.classList.contains("letters-page")) {
    return;
  }
  const helperParagraph = document.querySelector(".letters-grid-section .section-title p");
  if (!helperParagraph) {
    return;
  }

  let mainNode = helperParagraph.querySelector(".letters-helper-main");
  let translationNode = helperParagraph.querySelector(".letters-helper-translation");
  if (!mainNode) {
    const existing = String(helperParagraph.textContent || "").replace(/\s+/g, " ").trim();
    helperParagraph.textContent = "";
    mainNode = document.createElement("span");
    mainNode.className = "letters-helper-main";
    mainNode.textContent = existing;
    helperParagraph.appendChild(mainNode);
  }
  if (!translationNode) {
    translationNode = document.createElement("span");
    translationNode.className = "letters-helper-translation";
    translationNode.setAttribute("dir", "auto");
    translationNode.hidden = true;
    helperParagraph.appendChild(translationNode);
  }

  const nativeText =
    LETTERS_HELPER_NATIVE_TEXT[WORLD_KEY] ||
    String(mainNode.textContent || "").replace(/\s+/g, " ").trim();
  if (nativeText) {
    mainNode.textContent = nativeText;
  }

  const selectedBaseLanguage = readStoredBaseLanguagePreference();
  if (!selectedBaseLanguage || selectedBaseLanguage === WORLD_KEY) {
    translationNode.textContent = "";
    translationNode.hidden = true;
    return;
  }

  const cache = readLettersTitleTranslationCache();
  const cacheKey = `helper::${WORLD_KEY}::${selectedBaseLanguage}::${nativeText.toLowerCase()}`;
  const cached = String(cache.get(cacheKey) || "").trim();
  if (cached && !isInvalidLettersHelperTranslation(cached)) {
    translationNode.textContent = cached;
    translationNode.hidden = false;
    return;
  }

  const translated = String(
    (await requestLettersTitleTranslation(nativeText, selectedBaseLanguage)) || ""
  ).trim();
  if (!translated || isInvalidLettersHelperTranslation(translated)) {
    translationNode.textContent = "";
    translationNode.hidden = true;
    return;
  }

  cache.set(cacheKey, translated);
  persistLettersTitleTranslationCache();
  translationNode.textContent = translated;
  translationNode.hidden = false;
};

const HINDI_ROMANIZATION_VARIANTS = Object.freeze({
  practical: Object.freeze({
    अ: "a",
    आ: "aa",
    इ: "i",
    ई: "ii",
    उ: "u",
    ऊ: "uu",
    ऋ: "ri",
    ए: "e",
    ऐ: "ai",
    ओ: "o",
    औ: "au",
    अं: "an",
    अः: "ah",
    क: "ka",
    ख: "kha",
    ग: "ga",
    घ: "gha",
    ङ: "nga",
    च: "ca",
    छ: "cha",
    ज: "ja",
    झ: "jha",
    ञ: "nya",
    ट: "ṭa",
    ठ: "ṭha",
    ड: "ḍa",
    ढ: "ḍha",
    ण: "ṇa",
    त: "ta",
    थ: "tha",
    द: "da",
    ध: "dha",
    न: "na",
    प: "pa",
    फ: "pha",
    ब: "ba",
    भ: "bha",
    म: "ma",
    य: "ya",
    र: "ra",
    ल: "la",
    व: "va",
    श: "sha",
    ष: "sha",
    स: "sa",
    ह: "ha",
    "क़": "qa",
    "ख़": "kha",
    "ग़": "ga",
    "ज़": "za",
    "ड़": "ṛa",
    "ढ़": "ṛha",
    "फ़": "fa",
    "ा": "aa-matra",
    "ि": "i-matra",
    "ी": "ii-matra",
    "ु": "u-matra",
    "ू": "uu-matra",
    "ृ": "ri-matra",
    "े": "e-matra",
    "ै": "ai-matra",
    "ो": "o-matra",
    "ौ": "au-matra",
    "ं": "anusvara",
    "ः": "visarga",
    "ँ": "chandrabindu",
    क्ष: "ksha",
    त्र: "tra",
    ज्ञ: "gya",
    श्र: "shra",
  }),
  iast: Object.freeze({
    अ: "a",
    आ: "ā",
    इ: "i",
    ई: "ī",
    उ: "u",
    ऊ: "ū",
    ऋ: "ṛ",
    ए: "e",
    ऐ: "ai",
    ओ: "o",
    औ: "au",
    अं: "aṃ",
    अः: "aḥ",
    क: "ka",
    ख: "kha",
    ग: "ga",
    घ: "gha",
    ङ: "ṅa",
    च: "ca",
    छ: "cha",
    ज: "ja",
    झ: "jha",
    ञ: "ña",
    ट: "ṭa",
    ठ: "ṭha",
    ड: "ḍa",
    ढ: "ḍha",
    ण: "ṇa",
    त: "ta",
    थ: "tha",
    द: "da",
    ध: "dha",
    न: "na",
    प: "pa",
    फ: "pha",
    ब: "ba",
    भ: "bha",
    म: "ma",
    य: "ya",
    र: "ra",
    ल: "la",
    व: "va",
    श: "śa",
    ष: "ṣa",
    स: "sa",
    ह: "ha",
    "क़": "qa",
    "ख़": "ḵha",
    "ग़": "ġa",
    "ज़": "za",
    "ड़": "ṛa",
    "ढ़": "ṛha",
    "फ़": "fa",
    "ा": "ā-mātrā",
    "ि": "i-mātrā",
    "ी": "ī-mātrā",
    "ु": "u-mātrā",
    "ू": "ū-mātrā",
    "ृ": "ṛ-mātrā",
    "े": "e-mātrā",
    "ै": "ai-mātrā",
    "ो": "o-mātrā",
    "ौ": "au-mātrā",
    "ं": "anusvāra",
    "ः": "visarga",
    "ँ": "candrabindu",
    क्ष: "kṣa",
    त्र: "tra",
    ज्ञ: "jña",
    श्र: "śra",
  }),
});

const LETTER_ROMANIZATION_MAP = Object.freeze({
  korean: Object.freeze({
    ㄱ: "g/k",
    ㄲ: "kk",
    ㄴ: "n",
    ㄷ: "d/t",
    ㄸ: "tt",
    ㄹ: "r/l",
    ㅁ: "m",
    ㅂ: "b/p",
    ㅃ: "pp",
    ㅅ: "s",
    ㅆ: "ss",
    ㅇ: "silent (initial), ng (final)",
    ㅈ: "j",
    ㅉ: "jj",
    ㅊ: "ch",
    ㅋ: "k",
    ㅌ: "t",
    ㅍ: "p",
    ㅎ: "h",
    ㅏ: "a",
    ㅐ: "ae",
    ㅑ: "ya",
    ㅒ: "yae",
    ㅓ: "eo",
    ㅔ: "e",
    ㅕ: "yeo",
    ㅖ: "ye",
    ㅗ: "o",
    ㅘ: "wa",
    ㅙ: "wae",
    ㅚ: "oe",
    ㅛ: "yo",
    ㅜ: "u",
    ㅝ: "wo",
    ㅞ: "we",
    ㅟ: "wi",
    ㅠ: "yu",
    ㅡ: "eu",
    ㅢ: "ui",
    ㅣ: "i",
  }),
  chinese: Object.freeze({
    一: "yī",
    二: "èr",
    三: "sān",
    人: "rén",
    口: "kǒu",
    日: "rì",
    月: "yuè",
    山: "shān",
    水: "shuǐ",
    火: "huǒ",
    木: "mù",
    土: "tǔ",
    金: "jīn",
    女: "nǚ",
    子: "zǐ",
    学: "xué",
    生: "shēng",
    好: "hǎo",
    中: "zhōng",
    国: "guó",
    语: "yǔ",
    文: "wén",
    天: "tiān",
    地: "dì/de",
    上: "shàng",
    下: "xià",
    左: "zuǒ",
    右: "yòu",
    大: "dà",
    小: "xiǎo",
    风: "fēng",
    雨: "yǔ",
    我: "wǒ",
    你: "nǐ",
    他: "tā",
    她: "tā",
    们: "men (plural suffix)",
    是: "shì",
    不: "bù",
    的: "de",
    在: "zài",
    有: "yǒu",
    这: "zhè",
    那: "nà",
    个: "gè",
    来: "lái",
    去: "qù",
    吃: "chī",
    喝: "hē",
    看: "kàn",
    听: "tīng",
    说: "shuō",
    读: "dú",
    写: "xiě",
    家: "jiā",
    校: "xiào",
    老: "lǎo",
    师: "shī",
    朋: "péng",
    友: "yǒu",
    爱: "ài",
    猫: "māo",
    狗: "gǒu",
    车: "chē",
    书: "shū",
  }),
  japanese: Object.freeze({
    あ: "a",
    い: "i",
    う: "u",
    え: "e",
    お: "o",
    か: "ka",
    き: "ki",
    く: "ku",
    け: "ke",
    こ: "ko",
    さ: "sa",
    し: "shi",
    す: "su",
    せ: "se",
    そ: "so",
    た: "ta",
    ち: "chi",
    つ: "tsu",
    て: "te",
    と: "to",
    な: "na",
    に: "ni",
    ぬ: "nu",
    ね: "ne",
    の: "no",
    は: "ha",
    ひ: "hi",
    ふ: "fu",
    へ: "he",
    ほ: "ho",
    ま: "ma",
    み: "mi",
    む: "mu",
    め: "me",
    も: "mo",
    や: "ya",
    ゆ: "yu",
    よ: "yo",
    ら: "ra",
    り: "ri",
    る: "ru",
    れ: "re",
    ろ: "ro",
    わ: "wa",
    を: "o (written wo)",
    ん: "n",
    ア: "a",
    イ: "i",
    ウ: "u",
    エ: "e",
    オ: "o",
    カ: "ka",
    キ: "ki",
    ク: "ku",
    ケ: "ke",
    コ: "ko",
    サ: "sa",
    シ: "shi",
    ス: "su",
    セ: "se",
    ソ: "so",
    タ: "ta",
    チ: "chi",
    ツ: "tsu",
    テ: "te",
    ト: "to",
    ナ: "na",
    ニ: "ni",
    ヌ: "nu",
    ネ: "ne",
    ノ: "no",
    ハ: "ha",
    ヒ: "hi",
    フ: "fu",
    ヘ: "he",
    ホ: "ho",
    マ: "ma",
    ミ: "mi",
    ム: "mu",
    メ: "me",
    モ: "mo",
    ヤ: "ya",
    ユ: "yu",
    ヨ: "yo",
    ラ: "ra",
    リ: "ri",
    ル: "ru",
    レ: "re",
    ロ: "ro",
    ワ: "wa",
    ヲ: "o (written wo)",
    ン: "n",
  }),
  arabic: Object.freeze({
    ا: "ʾalif",
    ب: "bāʾ",
    ت: "tāʾ",
    ث: "thāʾ",
    ج: "jīm",
    ح: "ḥāʾ",
    خ: "khāʾ",
    د: "dāl",
    ذ: "dhāl",
    ر: "rāʾ",
    ز: "zāy",
    س: "sīn",
    ش: "shīn",
    ص: "ṣād",
    ض: "ḍād",
    ط: "ṭāʾ",
    ظ: "ẓāʾ",
    ع: "ʿayn",
    غ: "ghayn",
    ف: "fāʾ",
    ق: "qāf",
    ك: "kāf",
    ل: "lām",
    م: "mīm",
    ن: "nūn",
    ه: "hāʾ",
    و: "wāw",
    ي: "yāʾ",
  }),
  hindi: HINDI_ROMANIZATION_VARIANTS.practical,
});

const REPORTED_MISSING_ROMANIZATION_KEYS = new Set();
const HINDI_ROMANIZATION_VARIANT_STORAGE_KEY = "cosmicaHindiRomanizationVariant";
const HINDI_ROMANIZATION_DEFAULT_VARIANT = "practical";

const getHindiRomanizationVariant = () => {
  if (WORLD_KEY !== "hindi") {
    return HINDI_ROMANIZATION_DEFAULT_VARIANT;
  }
  try {
    const stored = String(
      localStorage.getItem(HINDI_ROMANIZATION_VARIANT_STORAGE_KEY) || ""
    )
      .trim()
      .toLowerCase();
    if (stored && HINDI_ROMANIZATION_VARIANTS[stored]) {
      return stored;
    }
  } catch {}
  return HINDI_ROMANIZATION_DEFAULT_VARIANT;
};

const setHindiRomanizationVariant = (variant) => {
  if (WORLD_KEY !== "hindi") {
    return;
  }
  const normalized = String(variant || "")
    .trim()
    .toLowerCase();
  if (!HINDI_ROMANIZATION_VARIANTS[normalized]) {
    return;
  }
  try {
    localStorage.setItem(HINDI_ROMANIZATION_VARIANT_STORAGE_KEY, normalized);
  } catch {}
};

const getActiveLetterRomanizationMap = () => {
  if (WORLD_KEY === "hindi") {
    const variant = getHindiRomanizationVariant();
    return HINDI_ROMANIZATION_VARIANTS[variant] || HINDI_ROMANIZATION_VARIANTS.practical;
  }
  return LETTER_ROMANIZATION_MAP[WORLD_KEY];
};

const setupHindiRomanizationToggle = () => {
  if (!document.body.classList.contains("letters-page") || WORLD_KEY !== "hindi") {
    return;
  }
  const sectionTitle = document.querySelector(".letters-grid-section .section-title");
  if (!sectionTitle) {
    return;
  }

  let toggleEl = sectionTitle.querySelector(".letters-romanization-toggle");
  if (!toggleEl) {
    toggleEl = document.createElement("div");
    toggleEl.className = "letters-romanization-toggle";
    toggleEl.innerHTML = `
      <span class="letters-romanization-toggle-label">Romanization</span>
      <button type="button" class="letters-romanization-option" data-romanization-variant="practical">Practical</button>
      <button type="button" class="letters-romanization-option" data-romanization-variant="iast">IAST</button>
    `;
    toggleEl.querySelectorAll(".letters-romanization-option").forEach((button) => {
      button.addEventListener("click", () => {
        const nextVariant = button.dataset.romanizationVariant;
        setHindiRomanizationVariant(nextVariant);
        setupLetterRomanization();
      });
    });
    sectionTitle.appendChild(toggleEl);
  }

  const currentVariant = getHindiRomanizationVariant();
  toggleEl.querySelectorAll(".letters-romanization-option").forEach((button) => {
    const isActive = button.dataset.romanizationVariant === currentVariant;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
};

const isRomanizationDiagnosticsEnabled = () => {
  const host = String(window.location.hostname || "").trim().toLowerCase();
  const isLocalHost =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".local");
  if (!isLocalHost) {
    return false;
  }
  try {
    const override = String(localStorage.getItem("cosmicaRomanizationDiagnostics") || "")
      .trim()
      .toLowerCase();
    if (["0", "false", "off"].includes(override)) {
      return false;
    }
  } catch {}
  return true;
};

const setupLetterRomanization = () => {
  if (!document.body.classList.contains("letters-page")) {
    return;
  }
  setupHindiRomanizationToggle();
  const worldMap = getActiveLetterRomanizationMap();
  if (!worldMap) {
    return;
  }
  const diagnosticsEnabled = isRomanizationDiagnosticsEnabled();
  const missingSymbols = diagnosticsEnabled ? [] : null;
  document.querySelectorAll(".letter-card").forEach((card) => {
    const letterEl = card.querySelector(".letter");
    if (!letterEl) {
      return;
    }
    const symbol = String(card.dataset.letter || letterEl.textContent || "").trim();
    if (!symbol) {
      return;
    }
    const romanization = worldMap[symbol];
    if (!romanization) {
      if (missingSymbols) {
        missingSymbols.push(symbol);
      }
      return;
    }
    let romanizationEl = card.querySelector(".letter-romanization");
    if (!romanizationEl) {
      romanizationEl = document.createElement("div");
      romanizationEl.className = "letter-romanization";
      romanizationEl.setAttribute("lang", "en");
      romanizationEl.setAttribute("dir", "ltr");
      const audioEl = card.querySelector(".letter-audio");
      card.insertBefore(romanizationEl, audioEl || null);
    }
    romanizationEl.textContent = romanization;
  });

  if (missingSymbols && missingSymbols.length) {
    const uniqueMissingSymbols = [];
    missingSymbols.forEach((symbol) => {
      const diagnosticKey = `${WORLD_KEY}:${symbol}`;
      if (REPORTED_MISSING_ROMANIZATION_KEYS.has(diagnosticKey)) {
        return;
      }
      REPORTED_MISSING_ROMANIZATION_KEYS.add(diagnosticKey);
      uniqueMissingSymbols.push(symbol);
    });

    if (uniqueMissingSymbols.length) {
      console.warn(
        `[Cosmica][Romanization] Missing letter mapping(s) for world "${WORLD_KEY}": ${uniqueMissingSymbols.join(
          ", "
        )}. Add them to LETTER_ROMANIZATION_MAP in frontend/app.js.`
      );
    }
  }
};

const getChatRequestTimeoutMs = () => {
  const isMobileViewport = window.matchMedia("(max-width: 960px)").matches;
  if (isMobileViewport) {
    return Math.max(1000, Number(MIMI_CONFIG.mobileTimeoutMs || MIMI_CONFIG.timeoutMs || 12000));
  }
  return Math.max(1000, Number(MIMI_CONFIG.timeoutMs || 12000));
};

const buildChatMessages = (message) => {
  const recentHistory = chatHistory.slice(-Math.max(0, MIMI_CONFIG.historyLimit || 0));
  const lastMessage = recentHistory[recentHistory.length - 1];
  const shouldAppendCurrentUserMessage =
    !lastMessage || lastMessage.role !== "user" || lastMessage.content !== message;

  return [
    { role: "system", content: MIMI_SYSTEM_PROMPT },
    ...recentHistory,
    ...(shouldAppendCurrentUserMessage ? [{ role: "user", content: message }] : []),
  ];
};

const greetings = {
  English: "Hello",
  Dutch: "Hallo",
  Swedish: "Hej",
  Korean: "Annyeong",
  Arabic: "Marhaba",
  Spanish: "Hola",
  German: "Hallo",
  Japanese: "Konnichiwa",
  Chinese: "Ni hao",
  Portuguese: "Ola",
  Hindi: "Namaste",
};

const getPresetReply = (message) => {
  const text = message.toLowerCase();
  const worldNames = Object.keys(worldLines);
  const matchedWorld = worldNames.find((name) => text.includes(name.toLowerCase()));

  if (matchedWorld) {
    return `${worldLines[matchedWorld]} Want a starter quest?`;
  }

  if (text.includes("recommend") || text.includes("pick") || text.includes("choose")) {
    const world = worldNames[Math.floor(Math.random() * worldNames.length)];
    return `Try ${world}. ${worldLines[world]}`;
  }

  if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
    return "Hi explorer. Tell me your mood and I will plot the next jump.";
  }

  if (text.includes("greeting") || text.includes("teach")) {
    const world = matchedWorld || worldNames[Math.floor(Math.random() * worldNames.length)];
    const greeting = greetings[world] || "Hello";
    return `Try a quick greeting in ${world}: ${greeting}. Want another?`;
  }

  if (text.includes("quest") || text.includes("mission")) {
    return "Mini quest: listen to a phrase, repeat it twice, then swap one word to make it yours.";
  }

  if (text.includes("challenge")) {
    return "Challenge: pick a world and speak three short sentences before the starfield fades.";
  }

  if (text.includes("help") || text.includes("how")) {
    return "Ask for a world, a quick quest, or a phrase to practice.";
  }

  const fallback = [
    "Ready when you are. Ask me for a world or a quick quest.",
    "Say the world you want, and I will open a route.",
    "Give me a vibe: calm, bold, or playful.",
  ];
  return fallback[Math.floor(Math.random() * fallback.length)];
};

const getMimiReply = async (message) => {
  if (MIMI_CONFIG.mode === "preset") {
    return { content: getPresetReply(message), source: "preset" };
  }

  const endpointCandidates = getApiEndpointCandidates();
  const requestChatReply = async (endpoint) => {
    const controller = createAbortController();
    const timeout = controller
      ? window.setTimeout(() => controller.abort(), getChatRequestTimeoutMs())
      : null;
    try {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: buildChatMessages(message) }),
        cache: "no-store",
        credentials: "same-origin",
      };
      if (controller) {
        requestOptions.signal = controller.signal;
      }
      const response = await fetch(endpoint, requestOptions);

      if (!response.ok) {
        let detail = "";
        try {
          const errorPayload = await response.json();
          detail = errorPayload?.error || errorPayload?.message || "";
        } catch {
          detail = "";
        }
        throw new Error(`Chat request failed (${response.status})${detail ? `: ${detail}` : ""}`);
      }

      const data = await response.json();
      if (data && typeof data.content === "string" && data.content.trim()) {
        return data.content.trim();
      }

      throw new Error("Empty response");
    } finally {
      if (timeout) {
        window.clearTimeout(timeout);
      }
    }
  };

  const attempts = Math.max(1, MIMI_CONFIG.retryLimit || 1);
  let lastError = null;
  for (let attemptIndex = 0; attemptIndex < attempts; attemptIndex += 1) {
    for (let endpointIndex = 0; endpointIndex < endpointCandidates.length; endpointIndex += 1) {
      const endpoint = endpointCandidates[endpointIndex];
      try {
        const content = await requestChatReply(endpoint);
        return { content, source: "api" };
      } catch (error) {
        lastError = error;
      }
    }
    const hasMoreAttempts = attemptIndex < attempts - 1;
    if (hasMoreAttempts) {
      const retryDelayMs = 220 + attemptIndex * 260;
      await new Promise((resolve) => window.setTimeout(resolve, retryDelayMs));
    }
  }

  if (!navigator.onLine) {
    console.warn("Mimi API unavailable while offline, falling back to preset reply.", lastError);
    return { content: getPresetReply(message), source: "offline" };
  }

  console.warn("Mimi API unavailable after retries.", {
    error: lastError,
    endpointCandidates,
  });
  return {
    content: getPresetReply(message),
    source: "fallback",
  };
};

const sendChatMessage = async (message) => {
  if (!chatInput) {
    return;
  }
  if (chatRequestInFlight) {
    return;
  }
  const text = (message ?? chatInput.value).trim();
  if (!text) {
    return;
  }
  const isMobileViewport = window.matchMedia("(max-width: 960px)").matches;
  chatRequestInFlight = true;
  chatInput.disabled = true;
  if (mimiChatPanel) {
    mimiChatPanel.classList.add("is-busy");
  }
  pulseGuideInteractivity(1050);
  try {
    userHasMessagedMimi = true;
    appendChatMessage("user", text);
    if (!message && isMobileViewport && document.activeElement === chatInput) {
      chatInput.blur();
    }
    revealMimiBubbleOnMobile();
    chatHistory.push({ role: "user", content: text });
    if (chatHistory.length > MIMI_CONFIG.historyLimit) {
      chatHistory.splice(0, chatHistory.length - MIMI_CONFIG.historyLimit);
    }
    persistChatHistoryToStorage();
    if (!message) {
      chatInput.value = "";
    }

    setChatStatus("Mimi is charting a reply");
    const reply = await getMimiReply(text);
    if (reply.source !== "error") {
      chatHistory.push({ role: "assistant", content: reply.content });
      if (chatHistory.length > MIMI_CONFIG.historyLimit) {
        chatHistory.splice(0, chatHistory.length - MIMI_CONFIG.historyLimit);
      }
      persistChatHistoryToStorage();
    }
    if (reply.source === "api") {
      setChatStatus("AI live");
    } else if (reply.source === "error") {
      setChatStatus("AI reconnecting");
    } else if (reply.source === "fallback") {
      setChatStatus("AI reconnecting");
    } else if (reply.source === "offline") {
      setChatStatus("Offline mode");
    } else {
      setChatStatus("Mimi ready");
    }
    lastMimiReply = reply.content;
    speakLine(reply.content, "curious");
    revealMimiBubbleOnMobile();
  } finally {
    chatRequestInFlight = false;
    chatInput.disabled = false;
    if (mimiChatPanel) {
      mimiChatPanel.classList.remove("is-busy");
    }
    if (!isMobileViewport) {
      chatInput.focus();
    }
  }
};

function showMimiPremiumBubble() {
  // Remove any previous premium upsell bubble
  const prev = chatLog && chatLog.querySelector('.chat-message.mimi.premium-upsell');
  if (prev) prev.remove();
  // Create bubble
  const message = document.createElement("div");
  message.className = "chat-message mimi premium-upsell";
  message.dataset.role = "mimi";
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  const body = document.createElement("div");
  body.className = "chat-text";
  body.innerHTML = `Mimi chat is a <b>Premium</b> feature.<br><br>`;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "premium-setup-primary";
  btn.textContent = "Upgrade to Premium";
  btn.onclick = function() {
    if (typeof window.cosmicaAccountHub?.openPremium === "function") {
      window.cosmicaAccountHub.openPremium({
        message: "Unlock Mimi chat and more with Premium!",
      });
      return;
    }
    const supportSection = document.getElementById("support");
    if (supportSection) {
      supportSection.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.location.href = "/index.html#support";
  };
  body.appendChild(btn);
  bubble.appendChild(body);
  message.appendChild(bubble);
  chatLog.appendChild(message);
  syncChatLogMessageState && syncChatLogMessageState();
  animateChatLogPulse && animateChatLogPulse();
  trimVisibleChatMessages && trimVisibleChatMessages();
  scrollChatToBottom && scrollChatToBottom();
}

function removeMimiPremiumBubble() {
  const bubble = chatLog && chatLog.querySelector('.chat-message.mimi.premium-upsell');
  if (bubble) {
    bubble.remove();
    syncChatLogMessageState && syncChatLogMessageState();
  }
}

const userHasPremiumAccess = (user) => {
  if (!user || typeof user !== "object") {
    return false;
  }
  const premiumFlagRaw = user.isPremium ?? user.premium;
  const premiumFlagText = String(premiumFlagRaw ?? "")
    .trim()
    .toLowerCase();
  const premiumTier = String(user.planTier ?? user.tier ?? "")
    .trim()
    .toLowerCase();
  const premiumStatus = String(
    user.premiumStatus ||
      user.subscriptionStatus ||
      user.premiumStripeSubscriptionStatus ||
      user.stripeSubscriptionStatus ||
      ""
  )
    .trim()
    .toLowerCase();
  const premiumEndRaw = String(
    user.premiumCurrentPeriodEnd ||
      user.premiumEndsAt ||
      user.premiumExpiresAt ||
      user.subscriptionEndsAt ||
      user.currentPeriodEnd ||
      user.planEndsAt ||
      user.expiresAt ||
      ""
  ).trim();
  const premiumEndMs = Date.parse(premiumEndRaw);
  const hasFuturePremiumEnd = Number.isFinite(premiumEndMs) && premiumEndMs > Date.now();
  const statusIndicatesPremium =
    premiumStatus === "active" ||
    premiumStatus === "trialing" ||
    premiumStatus === "past_due" ||
    premiumStatus === "canceling" ||
    premiumStatus === "grace";
  return (
    premiumFlagRaw === true ||
    premiumFlagText === "1" ||
    premiumFlagText === "true" ||
    premiumFlagText === "yes" ||
    premiumFlagText === "premium" ||
    premiumFlagText === "pro" ||
    premiumFlagText === "plus" ||
    premiumTier === "premium" ||
    premiumTier === "pro" ||
    premiumTier === "plus" ||
    premiumTier === "paid" ||
    String(user.plan ?? "").trim().toLowerCase() === "premium" ||
    String(user.membership ?? "").trim().toLowerCase() === "premium" ||
    statusIndicatesPremium ||
    hasFuturePremiumEnd
  );
};

const isMimiPremiumAccessEnabled = () => {
  if (typeof window.cosmicaGamification?.getState === "function") {
    const snapshot = window.cosmicaGamification.getState();
    const snapshotUser = snapshot?.user && typeof snapshot.user === "object" ? snapshot.user : null;
    return userHasPremiumAccess(snapshotUser);
  }
  const fallbackUser =
    (typeof getState === "function" ? getState() : window.store?.getState?.() || {}).user ||
    window.state?.user ||
    null;
  return userHasPremiumAccess(fallbackUser);
};

if (chatForm) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const isPremium = isMimiPremiumAccessEnabled();
    if (!isPremium) {
      showMimiPremiumBubble();
      return;
    }
    removeMimiPremiumBubble();
    sendChatMessage();
  });
}

if (chatInput && mimiChatPanel) {
  chatInput.addEventListener("focus", () => {
    mimiChatPanel.classList.add("is-focused");
    pulseGuideInteractivity(900);
  });
  chatInput.addEventListener("blur", () => {
    mimiChatPanel.classList.remove("is-focused");
  });
}

chatChips.forEach((chip) => {
  const releaseChipPress = () => {
    chip.classList.remove("is-pressed");
  };
  chip.addEventListener("pointerdown", () => {
    chip.classList.add("is-pressed");
  });
  chip.addEventListener("pointerup", releaseChipPress);
  chip.addEventListener("pointercancel", releaseChipPress);
  chip.addEventListener("mouseleave", releaseChipPress);
  chip.addEventListener("blur", releaseChipPress);
  chip.addEventListener("click", () => {
    pulseGuideInteractivity(980);
    const isPremium = isMimiPremiumAccessEnabled();
    if (!isPremium) {
      showMimiPremiumBubble();
      return;
    }
    removeMimiPremiumBubble();
    const prompt = chip.dataset.prompt || chip.textContent || "";
    sendChatMessage(prompt);
  });
});

if (chatLog) {
  chatLog.innerHTML = "";
  // Keep visible user message history while Mimi replies stay in the speech bubble.
  chatLog.removeAttribute("aria-hidden");
  chatLog.style.removeProperty("display");
  syncChatLogMessageState();
}
if (chatStatus) {
  const statusText = chatStatus.querySelector(".chat-status-text");
  setChatStatus(statusText ? statusText.textContent.trim() || "Mimi ready" : "Mimi ready");
}

const getReplaySpeechLine = () => {
  const latestReply = String(lastMimiReply || "").trim();
  if (latestReply) {
    return latestReply;
  }
  const visibleText = speechText ? speechText.textContent.trim() : "";
  if (visibleText) {
    return visibleText;
  }
  const fallback =
    defaultMimiPrompt ||
    (speechText ? speechText.dataset.defaultMimiPrompt || speechText.dataset.text : "") ||
    activeLine;
  return String(fallback || "").trim();
};

if (speechBubble && speechText) {
  speechBubble.tabIndex = 0;
  speechBubble.setAttribute("role", "button");
  speechBubble.setAttribute("aria-label", "Replay Mimi message");
  const replayMimiBubble = () => {
    const replayText = getReplaySpeechLine();
    if (!replayText) {
      return;
    }
    pulseGuideInteractivity(1120);
    speechBubble.classList.add("is-replaying");
    window.clearTimeout(speechReplayTimer);
    speechReplayTimer = window.setTimeout(() => {
      speechBubble.classList.remove("is-replaying");
    }, 620);
    speakLine(replayText, userHasMessagedMimi ? "curious" : "happy");
  };
  speechBubble.addEventListener("click", replayMimiBubble);
  speechBubble.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    replayMimiBubble();
  });
}

setupApiHealthIndicator();

const createStars = (layer, count, sizeRange) => {
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement("span");
    star.classList.add("star");
    const size = Math.random() * sizeRange + 0.6;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 6}s`;
    star.style.setProperty("--twinkle", `${4 + Math.random() * 6}s`);
    layer.appendChild(star);
  }
};

const isSmallViewport = window.matchMedia("(max-width: 960px)").matches;
const isWorldPage = document.body.classList.contains("world-page");
const viewportDensityMultiplier = isSmallViewport ? (isWorldPage ? 0.48 : 0.58) : 1;
const performanceDensityMultiplier = isLowPowerDevice || prefersReducedData ? 0.72 : 1;
const reducedMotionDensityMultiplier = prefersReducedMotion ? 0.85 : 1;
const starDensityMultiplier =
  viewportDensityMultiplier *
  performanceDensityMultiplier *
  reducedMotionDensityMultiplier;
const scaledCount = (count) => Math.max(16, Math.round(count * starDensityMultiplier));

starfields.forEach((layer) => {
  if (layer.classList.contains("starfield-deep")) {
    createStars(layer, scaledCount(90), 1.4);
  } else if (layer.classList.contains("starfield-mid")) {
    createStars(layer, scaledCount(120), 1.8);
  } else {
    createStars(layer, scaledCount(140), 2.2);
  }
});

const REVEAL_SHOW_RATIO = 0.2;
const REVEAL_HIDE_RATIO = 0.07;
const revealState = new WeakMap();
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const target = entry.target;
      const currentlyVisible =
        revealState.get(target) ?? target.classList.contains("is-visible");
      let shouldBeVisible = currentlyVisible;

      // Hysteresis prevents rapid toggling around the threshold while keeping fade-in/out behavior.
      if (currentlyVisible) {
        if (!entry.isIntersecting || entry.intersectionRatio <= REVEAL_HIDE_RATIO) {
          shouldBeVisible = false;
        }
      } else if (entry.isIntersecting && entry.intersectionRatio >= REVEAL_SHOW_RATIO) {
        shouldBeVisible = true;
      }

      if (shouldBeVisible !== currentlyVisible) {
        target.classList.toggle("is-visible", shouldBeVisible);
        revealState.set(target, shouldBeVisible);
      }
    });
  },
  {
    threshold: [0, REVEAL_HIDE_RATIO, REVEAL_SHOW_RATIO, 0.45],
    rootMargin: "0px 0px -4% 0px",
  }
);

const observedRevealElements = new WeakSet();
const shouldObserveReveal = (el) => {
  if (!el) {
    return false;
  }
  if (el.id === "language") {
    return false;
  }
  if (document.body.classList.contains("world-page") && (el.id === "world" || el.id === "maps")) {
    return false;
  }
  return true;
};

const observeRevealElement = (el) => {
  if (!shouldObserveReveal(el) || observedRevealElements.has(el)) {
    return;
  }
  observer.observe(el);
  observedRevealElements.add(el);
};

const activateRevealStateForElement = (el) => {
  if (!el || !(el instanceof HTMLElement)) {
    return;
  }
  const isLanguageSection = el.id === "language";
  const rect = el.getBoundingClientRect();
  const isInitiallyInViewport = rect.bottom > 0 && rect.top < window.innerHeight * 0.96;
  el.dataset.revealActive = "1";
  if (!isLanguageSection && isInitiallyInViewport) {
    el.classList.add("is-visible");
    revealState.set(el, true);
  }
};

const createRafThrottled = (callback) => {
  let rafId = 0;
  return () => {
    if (rafId) {
      return;
    }
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      callback();
    });
  };
};

document.querySelectorAll(".section").forEach((el) => {
  const isWorldHeroSection =
    document.body.classList.contains("world-page") && el.id === "world";
  if (isWorldHeroSection) {
    // Keep the world hero visible at all times, including hard refresh.
    el.classList.remove("reveal");
    el.classList.add("is-visible");
    return;
  }
  el.classList.add("reveal");
  activateRevealStateForElement(el);
});
document.querySelectorAll(".reveal").forEach((el) => {
  activateRevealStateForElement(el);
  observeRevealElement(el);
});

let setActiveWorldSection = null;
let startLessonTransitionLockUntil = 0;
const languageSection = document.querySelector("#language");
const mapsSection = document.querySelector("#maps");
const updateMapsTitleVisibility = () => {
  if (!languageSection || !mapsSection) return;
  const languageBottom = languageSection.offsetTop + languageSection.offsetHeight;
  const scrolledPastLanguage = window.scrollY > languageBottom - 60;
  const hasPickedLanguage = document.body.classList.contains("language-picked");
  const shouldShow = scrolledPastLanguage || hasPickedLanguage;
  document.body.classList.toggle("maps-title-visible", shouldShow);
};
if (languageSection) {
  languageSection.classList.add("language-reveal");
  languageSection.classList.remove("is-visible");
  let languageUserActivated = false;
  let languageForceShow = false;
  if (document.body.classList.contains("world-page")) {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    window.setTimeout(() => window.scrollTo(0, 0), 0);
  }
  const enforceLanguageHiddenAtTop = () => {
    if (document.body.classList.contains("world-page") && document.getElementById("world") && mapsSection) {
      updateMapsTitleVisibility();
      return;
    }
    if (!languageUserActivated && !languageForceShow && location.hash !== "#language") {
      languageSection.classList.remove("is-visible");
      if (document.body.classList.contains("world-page")) {
        document.body.classList.remove("show-language");
      }
      updateMapsTitleVisibility();
      return;
    }
    if (window.scrollY <= 10) {
      languageSection.classList.remove("is-visible");
      if (document.body.classList.contains("world-page")) {
        document.body.classList.remove("show-language");
      }
      updateMapsTitleVisibility();
      return;
    }
    const rect = languageSection.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
    if (inView) {
      languageSection.classList.add("is-visible");
      if (document.body.classList.contains("world-page")) {
        document.body.classList.add("show-language");
      }
    }
    updateMapsTitleVisibility();
  };
  const scheduleLanguageVisibilityCheck = createRafThrottled(enforceLanguageHiddenAtTop);
  enforceLanguageHiddenAtTop();
  window.addEventListener(
    "scroll",
    () => {
      scheduleLanguageVisibilityCheck();
    },
    { passive: true }
  );
  ["wheel", "touchmove", "keydown", "pointerdown"].forEach((eventName) => {
    window.addEventListener(
      eventName,
      () => {
        languageUserActivated = true;
        scheduleLanguageVisibilityCheck();
      },
      { passive: true, once: true }
    );
  });

  const startLessonLink = document.querySelector(
    '.world-hero .primary[href="#language"]'
  );
  if (startLessonLink) {
    startLessonLink.addEventListener("click", (event) => {
      const isDesktopStart = window.matchMedia("(min-width: 961px)").matches;
      event.preventDefault();
      languageForceShow = true;
      languageUserActivated = true;
      startLessonTransitionLockUntil =
        performance.now() + (isDesktopStart ? 900 : 650);
      if (document.body.classList.contains("world-page")) {
        document.body.classList.add("hide-maps");
        document.body.classList.add("show-language");
        document.body.classList.add("start-lesson-transition");
      }
      languageSection.classList.add("is-visible");
      if (setActiveWorldSection) {
        setActiveWorldSection("language");
      }
      updateMapsTitleVisibility();
      window.setTimeout(() => {
        if (performance.now() >= startLessonTransitionLockUntil) {
          document.body.classList.remove("start-lesson-transition");
        }
      }, isDesktopStart ? 980 : 730);
      const baseOffset =
        Number.parseFloat(window.getComputedStyle(languageSection).scrollMarginTop) || 0;
      const startLessonDownShift = isDesktopStart
        ? WORLD_START_LESSON_DESKTOP_DOWN_SHIFT
        : WORLD_START_LESSON_MOBILE_DOWN_SHIFT;
      const targetTop =
        languageSection.getBoundingClientRect().top +
        window.scrollY -
        baseOffset +
        startLessonDownShift;
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}#language`);
      window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    });
  }

  const scheduleHideMapsCheck = createRafThrottled(() => {
    if (!document.body.classList.contains("hide-maps")) {
      return;
    }
    const languageBottom = languageSection.offsetTop + languageSection.offsetHeight;
    if (window.scrollY > languageBottom - 80) {
      document.body.classList.remove("hide-maps");
    }
    updateMapsTitleVisibility();
  });
  window.addEventListener(
    "scroll",
    scheduleHideMapsCheck,
    { passive: true }
  );
}

if (document.body.classList.contains("world-page")) {
  const worldSections = ["world", "language", "maps"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (worldSections.length) {
    worldSections.forEach((section) => section.classList.add("world-section"));
    let activeSectionId = "";
    const sectionById = Object.fromEntries(worldSections.map((section) => [section.id, section]));
    const getSectionMidpoint = (id) => {
      const section = sectionById[id];
      if (!section) {
        return 0;
      }
      return section.offsetTop + section.offsetHeight / 2;
    };
    const getClosestSection = () => {
      const focusY = window.scrollY + window.innerHeight * 0.4;
      let closestId = "";
      let smallestDistance = Number.POSITIVE_INFINITY;
      worldSections.forEach((section) => {
        const midpoint = section.offsetTop + section.offsetHeight / 2;
        const distance = Math.abs(midpoint - focusY);
        if (distance < smallestDistance) {
          smallestDistance = distance;
          closestId = section.id;
        }
      });
      return closestId;
    };
    const getWorldSectionWithHysteresis = () => {
      const focusY = window.scrollY + window.innerHeight * 0.4;
      const worldToLanguageBoundary = (getSectionMidpoint("world") + getSectionMidpoint("language")) / 2;
      const languageToMapsBoundary = (getSectionMidpoint("language") + getSectionMidpoint("maps")) / 2;
      const worldToLanguageEnterThreshold =
        worldToLanguageBoundary +
        WORLD_SECTION_SWITCH_HYSTERESIS_PX -
        WORLD_LANGUAGE_ENTER_FROM_WORLD_EARLY_PX;
      const mapsToLanguageEnterThreshold =
        languageToMapsBoundary -
        WORLD_SECTION_SWITCH_HYSTERESIS_PX +
        WORLD_LANGUAGE_ENTER_FROM_MAPS_EARLY_PX;

      if (activeSectionId === "world") {
        if (focusY > worldToLanguageEnterThreshold) {
          return "language";
        }
        return "world";
      }
      if (activeSectionId === "language") {
        if (focusY < worldToLanguageBoundary - WORLD_SECTION_SWITCH_HYSTERESIS_PX) {
          return "world";
        }
        if (focusY > languageToMapsBoundary + WORLD_SECTION_SWITCH_HYSTERESIS_PX) {
          return "maps";
        }
        return "language";
      }
      if (activeSectionId === "maps") {
        if (focusY < mapsToLanguageEnterThreshold) {
          return "language";
        }
        return "maps";
      }
      return getClosestSection();
    };
    setActiveWorldSection = (id) => {
      if (
        performance.now() < startLessonTransitionLockUntil &&
        id !== "language" &&
        id !== "maps"
      ) {
        id = "language";
      }
      if (!id || activeSectionId === id) {
        updateMapsTitleVisibility();
        return;
      }
      activeSectionId = id;
      worldSections.forEach((section) => {
        const isWorldHero = section.id === "world";
        const isActive = section.id === id;
        const shouldShow = isWorldHero || isActive;
        section.classList.toggle("is-visible", shouldShow);
        section.setAttribute("aria-hidden", shouldShow ? "false" : "true");
      });
      if (id === "language") {
        document.body.classList.add("show-language");
      } else {
        document.body.classList.remove("show-language");
      }
      document.body.dataset.activeWorldSection = id;
      updateMapsTitleVisibility();
    };
    const handleWorldScroll = () => {
      const closest = getWorldSectionWithHysteresis();
      if (closest) {
        setActiveWorldSection(closest);
      }
    };
    const scheduleWorldScroll = createRafThrottled(handleWorldScroll);
    setActiveWorldSection(location.hash === "#maps" ? "maps" : location.hash === "#language" ? "language" : "world");
    window.addEventListener("scroll", scheduleWorldScroll, { passive: true });
    window.addEventListener("hashchange", scheduleWorldScroll);
  }
}

const setupWorldPageInteractiveFx = () => {
  if (!document.body.classList.contains("world-page")) {
    return;
  }
  const root = document.documentElement;
  const worldAmbient = document.querySelector(".world-ambient");
  const worldSections = Array.from(document.querySelectorAll(".world-section"));
  document.body.classList.add("world-fx-ready");

  const ensureAmbientStars = () => {
    if (!worldAmbient || worldAmbient.querySelector(".world-fx-stars")) {
      return;
    }
    const stars = document.createElement("div");
    stars.className = "world-fx-stars";
    const starCount = shouldUseConservativeAnimationBudget
      ? 14
      : prefersReducedMotion
        ? 10
        : 26;
    for (let i = 0; i < starCount; i += 1) {
      const star = document.createElement("span");
      star.className = "world-fx-star";
      star.style.setProperty("--s-x", `${(6 + Math.random() * 88).toFixed(2)}%`);
      star.style.setProperty("--s-y", `${(8 + Math.random() * 84).toFixed(2)}%`);
      star.style.setProperty("--s-size", `${(1 + Math.random() * 2.2).toFixed(2)}px`);
      star.style.setProperty("--s-drift", `${(4 + Math.random() * 14).toFixed(2)}px`);
      star.style.setProperty("--s-delay", `${(Math.random() * 3.2).toFixed(2)}s`);
      star.style.setProperty("--s-duration", `${(4.4 + Math.random() * 5.2).toFixed(2)}s`);
      stars.appendChild(star);
    }
    worldAmbient.appendChild(stars);
  };

  const ensureSpaceLayers = () => {
    if (!worldAmbient || prefersReducedMotion) {
      return;
    }
    if (!worldAmbient.querySelector(".world-fx-dust")) {
      const dust = document.createElement("div");
      dust.className = "world-fx-dust";
      const dustCount = shouldUseConservativeAnimationBudget ? 10 : 18;
      for (let i = 0; i < dustCount; i += 1) {
        const particle = document.createElement("span");
        particle.className = "world-fx-dust-particle";
        particle.style.setProperty("--d-x", `${(Math.random() * 100).toFixed(2)}%`);
        particle.style.setProperty("--d-y", `${(Math.random() * 100).toFixed(2)}%`);
        particle.style.setProperty("--d-size", `${(2.2 + Math.random() * 4.4).toFixed(2)}px`);
        particle.style.setProperty("--d-delay", `${(Math.random() * 4.5).toFixed(2)}s`);
        particle.style.setProperty("--d-duration", `${(9 + Math.random() * 8).toFixed(2)}s`);
        dust.appendChild(particle);
      }
      worldAmbient.appendChild(dust);
    }
    if (!worldAmbient.querySelector(".world-fx-comets")) {
      const comets = document.createElement("div");
      comets.className = "world-fx-comets";
      const cometCount = prefersReducedMotion ? 1 : 3;
      const baseTopSlots = [14, 34, 56];
      const topSlots = baseTopSlots
        .slice(0, cometCount)
        .sort(() => Math.random() - 0.5)
        .map((slot) => Math.max(8, Math.min(64, slot + (Math.random() * 6 - 3))));
      const isMobileMeteorCadence = window.matchMedia("(max-width: 960px)").matches;
      const baseDurationSec = isMobileMeteorCadence ? 6.4 + Math.random() * 0.6 : 5.8 + Math.random() * 2.2;
      const launchStrideSec = isMobileMeteorCadence
        ? baseDurationSec / Math.max(1, cometCount)
        : Math.max(1.2, baseDurationSec * 0.34);
      for (let i = 0; i < cometCount; i += 1) {
        const comet = document.createElement("span");
        comet.className = "world-fx-comet";
        comet.style.setProperty("--c-top", `${(topSlots[i] ?? (8 + Math.random() * 56)).toFixed(2)}%`);
        comet.style.setProperty("--c-size", `${(78 + Math.random() * 44).toFixed(2)}px`);
        comet.style.setProperty(
          "--c-delay",
          `${(i * launchStrideSec + (isMobileMeteorCadence ? 0 : Math.random() * 0.35)).toFixed(2)}s`
        );
        comet.style.setProperty(
          "--c-duration",
          `${(isMobileMeteorCadence ? baseDurationSec : baseDurationSec + (Math.random() * 0.6 - 0.3)).toFixed(2)}s`
        );
        comets.appendChild(comet);
      }
      worldAmbient.appendChild(comets);
    }
  };

  ensureAmbientStars();
  ensureSpaceLayers();

  const setPointerShift = (x, y) => {
    root.style.setProperty("--world-pointer-shift-x", `${x.toFixed(2)}px`);
    root.style.setProperty("--world-pointer-shift-y", `${y.toFixed(2)}px`);
  };

  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerCurrentX = 0;
  let pointerCurrentY = 0;
  const setPointerTargetFromPoint = (clientX, clientY) => {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    pointerTargetX = ((clientX / w) - 0.5) * 30;
    pointerTargetY = ((clientY / h) - 0.5) * 26;
  };

  const ambientNebulaA = worldAmbient?.querySelector(".nebula-a") || null;
  const ambientNebulaB = worldAmbient?.querySelector(".nebula-b") || null;
  const ambientPlanetA = worldAmbient?.querySelector(".planet-a") || null;
  let ambientRafId = 0;
  let lastAmbientFrameTs = 0;
  const animateAmbient = (timestamp) => {
    ambientRafId = window.requestAnimationFrame(animateAmbient);
    if (document.hidden) {
      return;
    }
    if (timestamp - lastAmbientFrameTs < conservativeAnimationFrameMinMs) {
      return;
    }
    lastAmbientFrameTs = timestamp;
    pointerCurrentX += (pointerTargetX - pointerCurrentX) * 0.075;
    pointerCurrentY += (pointerTargetY - pointerCurrentY) * 0.075;
    setPointerShift(pointerCurrentX, pointerCurrentY);
    if (prefersReducedMotion) {
      return;
    }
    const t = timestamp * 0.001;
    if (ambientNebulaA) {
      const driftX = Math.sin(t * 0.45) * 10 - pointerCurrentX * 0.42;
      const driftY = Math.cos(t * 0.38) * 8 - pointerCurrentY * 0.34;
      ambientNebulaA.style.transform = `translate3d(${driftX.toFixed(2)}px, ${driftY.toFixed(2)}px, 0)`;
    }
    if (ambientNebulaB) {
      const driftX = Math.cos(t * 0.4) * 9 + pointerCurrentX * 0.38;
      const driftY = Math.sin(t * 0.34) * 7 + pointerCurrentY * 0.32;
      ambientNebulaB.style.transform = `translate3d(${driftX.toFixed(2)}px, ${driftY.toFixed(2)}px, 0)`;
    }
    if (ambientPlanetA) {
      const driftX = Math.sin(t * 0.28) * 6 + pointerCurrentX * 0.28;
      const driftY = Math.cos(t * 0.22) * 5 + pointerCurrentY * 0.24;
      const spin = t * 4.6;
      ambientPlanetA.style.transform = `translate3d(${driftX.toFixed(2)}px, ${driftY.toFixed(2)}px, 0) rotate(${spin.toFixed(2)}deg)`;
    }
  };
  const canRunAmbientPointerLoop =
    !shouldUseLiteInteractiveEffects &&
    window.matchMedia("(pointer: fine)").matches;
  if (!shouldUseLiteInteractiveEffects) {
    ambientRafId = window.requestAnimationFrame(animateAmbient);
  }

  if (canRunAmbientPointerLoop) {
    window.addEventListener(
      "pointermove",
      (event) => {
        setPointerTargetFromPoint(event.clientX, event.clientY);
      },
      { passive: true }
    );
  }
  window.addEventListener(
    "pointerleave",
    () => {
      pointerTargetX = 0;
      pointerTargetY = 0;
    },
    { passive: true }
  );

  const updateWorldScrollFx = () => {
    const scrollMax = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const scrollRatio = window.scrollY / scrollMax;
    root.style.setProperty("--world-scroll-ratio", scrollRatio.toFixed(4));
    root.style.setProperty("--world-cosmic-arc", `${(scrollRatio * 360).toFixed(2)}deg`);
    worldSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const offset = (midpoint - window.innerHeight / 2) / window.innerHeight;
      const clamped = Math.max(-1, Math.min(1, offset));
      section.style.setProperty("--world-section-drift", `${(-clamped * 16).toFixed(2)}px`);
      section.style.setProperty("--world-section-glow", `${(1 - Math.abs(clamped)).toFixed(3)}`);
    });
  };
  const scheduleWorldFxScroll = createRafThrottled(updateWorldScrollFx);
  updateWorldScrollFx();
  window.addEventListener("scroll", scheduleWorldFxScroll, { passive: true });
  window.addEventListener("resize", scheduleWorldFxScroll, { passive: true });

  const bindPulseFx = (elements) => {
    elements.forEach((element) => {
      if (!element) {
        return;
      }
      const trigger = () => {
        element.classList.remove("is-energized");
        void element.offsetWidth;
        element.classList.add("is-energized");
        window.setTimeout(() => {
          element.classList.remove("is-energized");
        }, 460);
      };
      element.addEventListener("pointerdown", trigger, { passive: true });
      element.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }
        trigger();
      });
    });
  };

  bindPulseFx(Array.from(document.querySelectorAll(".language-pill, .language-skip, .hero-actions .primary")));

  const bindMapCosmicFx = () => {
    const mapCards = Array.from(document.querySelectorAll(".world-maps .map-card"));
    mapCards.forEach((card) => {
      card.style.setProperty("--map-hot-x", "50%");
      card.style.setProperty("--map-hot-y", "50%");
      let hotSpotRafId = 0;
      let hotSpotX = 50;
      let hotSpotY = 50;
      const queueHotSpotUpdate = (x, y) => {
        hotSpotX = Math.max(0, Math.min(100, x));
        hotSpotY = Math.max(0, Math.min(100, y));
        if (hotSpotRafId) {
          return;
        }
        hotSpotRafId = window.requestAnimationFrame(() => {
          hotSpotRafId = 0;
          card.style.setProperty("--map-hot-x", `${hotSpotX.toFixed(2)}%`);
          card.style.setProperty("--map-hot-y", `${hotSpotY.toFixed(2)}%`);
        });
      };
      const triggerBurst = () => {
        card.classList.remove("is-cosmic-burst");
        window.requestAnimationFrame(() => {
          card.classList.add("is-cosmic-burst");
        });
        window.setTimeout(() => {
          card.classList.remove("is-cosmic-burst");
        }, 760);
      };
      card.addEventListener("pointerenter", () => {
        card.classList.add("is-cosmic-hot");
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-cosmic-hot");
        if (hotSpotRafId) {
          window.cancelAnimationFrame(hotSpotRafId);
          hotSpotRafId = 0;
        }
        card.style.setProperty("--map-hot-x", "50%");
        card.style.setProperty("--map-hot-y", "50%");
      });
      card.addEventListener(
        "pointermove",
        (event) => {
          if (event.pointerType === "touch") {
            return;
          }
          const rect = card.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
          const y = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
          queueHotSpotUpdate(x, y);
        },
        { passive: true }
      );
      card.addEventListener(
        "pointerdown",
        () => {
          triggerBurst();
        },
        { passive: true }
      );
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }
        triggerBurst();
      });
    });
  };

  bindMapCosmicFx();
};

setupWorldPageInteractiveFx();


/* ==========================================================================
   AMBIENT AUDIO ENGINE
   Procedural soundscape used by home and world pages (toggle + intensity sync).
   ========================================================================== */
let audioContext;
let ambientGain;
let ambientPlaying = false;
let ambientPrimed = false;
let desiredSoundOn = false;
let barTimer;
let barCount = 0;
let intensityRaf;
let intensity = 0.7;
let intensityTarget = 0.7;
let orchestra;
let nextBarTime;
let starEnergy = 0;
let starEnergyTarget = 0;

const resetAmbientEngine = () => {
  if (barTimer) {
    window.clearInterval(barTimer);
    barTimer = null;
  }
  if (intensityRaf) {
    window.cancelAnimationFrame(intensityRaf);
    intensityRaf = null;
  }
  if (audioContext && audioContext.state !== "closed") {
    try {
      audioContext.close();
    } catch (error) {
      console.warn("Audio close failed during reset.", error);
    }
  }
  audioContext = null;
  ambientGain = null;
  ambientPlaying = false;
  ambientPrimed = false;
  orchestra = null;
  nextBarTime = 0;
  barCount = 0;
};

const createAmbientSound = () => {
  if (audioContext) {
    resetAmbientEngine();
  }
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  ambientGain = audioContext.createGain();
  // Start muted so "Sound: Off" stays silent until explicitly toggled on.
  ambientGain.gain.value = 0;

  const spaceBus = audioContext.createGain();
  spaceBus.gain.value = 1;

  const delay = audioContext.createDelay();
  delay.delayTime.value = 0.26;

  const delayFeedback = audioContext.createGain();
  delayFeedback.gain.value = 0.12;

  spaceBus.connect(ambientGain);
  spaceBus.connect(delay);
  delay.connect(delayFeedback);
  delayFeedback.connect(delay);
  delay.connect(ambientGain);

  ambientGain.connect(audioContext.destination);

  const pianoGain = audioContext.createGain();
  pianoGain.gain.value = 0.18;

  const celloGain = audioContext.createGain();
  celloGain.gain.value = 0.13;

  const violinGain = audioContext.createGain();
  violinGain.gain.value = 0.11;

  const pulseGain = audioContext.createGain();
  pulseGain.gain.value = 0.05;

  const sparkleGain = audioContext.createGain();
  sparkleGain.gain.value = 0.04;

  orchestra = {
    pianoGain,
    celloGain,
    violinGain,
    pulseGain,
    sparkleGain,
  };

  const chordProgression = [
    [261.63, 329.63, 392.0],
    [196.0, 246.94, 392.0],
    [220.0, 261.63, 329.63],
    [174.61, 220.0, 349.23],
  ];
  let chordIndex = 0;

  const spawnLayer = (frequencies, options, startTime) => {
    const {
      type,
      filterType,
      filterFreq,
      filterQ = 0.3,
      gainNode,
      attack,
      duration,
      release,
      level,
    } = options;

    const now = startTime ?? audioContext.currentTime;
    const filter = audioContext.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;
    filter.Q.value = filterQ;

    const env = audioContext.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(level, now + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const oscillators = frequencies.map((freq) => {
      const osc = audioContext.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      osc.connect(filter);
      return osc;
    });

    filter.connect(env);
    env.connect(gainNode);
    gainNode.connect(spaceBus);

    oscillators.forEach((osc) => osc.start(now));
    oscillators.forEach((osc) => osc.stop(now + release));
  };

  const scheduleStrings = (startTime, chord) => {
    spawnLayer([chord[0] / 2], {
      type: "sine",
      filterType: "lowpass",
      filterFreq: 200,
      gainNode: celloGain,
      attack: 0.7,
      duration: 5.2,
      release: 6.0,
      level: 0.09,
    }, startTime);

    spawnLayer([chord[1], chord[2]], {
      type: "triangle",
      filterType: "lowpass",
      filterFreq: 2000,
      gainNode: violinGain,
      attack: 0.6,
      duration: 4.0,
      release: 4.6,
      level: 0.06,
    }, startTime + 0.2);
  };

  const playPianoNote = (frequency, startTime, duration, level) => {
    const osc = audioContext.createOscillator();
    osc.type = "sine";
    osc.frequency.value = frequency;

    const oscHarm = audioContext.createOscillator();
    oscHarm.type = "triangle";
    oscHarm.frequency.value = frequency * 2;

    const filter = audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1800;

    const env = audioContext.createGain();
    env.gain.setValueAtTime(0.0001, startTime);
    env.gain.exponentialRampToValueAtTime(level, startTime + 0.04);
    env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    oscHarm.connect(filter);
    filter.connect(env);
    env.connect(pianoGain);
    pianoGain.connect(spaceBus);

    osc.start(startTime);
    oscHarm.start(startTime);
    osc.stop(startTime + duration + 0.2);
    oscHarm.stop(startTime + duration + 0.2);
  };

  const scheduleWaltzPiano = (startTime, chord, beat) => {
    const now = (startTime ?? audioContext.currentTime) + 0.02;
    playPianoNote(chord[0] / 2, now, beat * 1.2, 0.12);
    playPianoNote(chord[1], now + beat * 0.95, beat * 0.75, 0.06);
    playPianoNote(chord[2], now + beat * 1.95, beat * 0.75, 0.06);
  };

  const scheduleBassPulse = (startTime, root, depth) => {
    const now = startTime ?? audioContext.currentTime;
    const base = root / 2 + depth * 6;
    const osc = audioContext.createOscillator();
    osc.type = "sine";
    osc.frequency.value = base;

    const oscTwo = audioContext.createOscillator();
    oscTwo.type = "triangle";
    oscTwo.frequency.value = base * 2;

    const filter = audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 180 + depth * 160;
    filter.Q.value = 0.6;

    const env = audioContext.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(0.06 + depth * 0.03, now + 0.12);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 1.0 + depth * 0.4);

    osc.connect(filter);
    oscTwo.connect(filter);
    filter.connect(env);
    env.connect(pulseGain);
    pulseGain.connect(spaceBus);

    osc.start(now);
    oscTwo.start(now);
    osc.stop(now + 1.3 + depth * 0.4);
    oscTwo.stop(now + 1.3 + depth * 0.4);
  };

  const playSparkle = (frequency, startTime) => {
    const osc = audioContext.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = frequency;

    const filter = audioContext.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1200;

    const env = audioContext.createGain();
    env.gain.setValueAtTime(0.0001, startTime);
    env.gain.exponentialRampToValueAtTime(0.08, startTime + 0.03);
    env.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);

    osc.connect(filter);
    filter.connect(env);
    env.connect(sparkleGain);
    sparkleGain.connect(spaceBus);

    osc.start(startTime);
    osc.stop(startTime + 0.8);
  };

  const sparkleMotifs = [
    [523.25, 587.33, 659.25, 587.33],
    [659.25, 698.46, 783.99, 698.46],
    [523.25, 659.25, 783.99],
  ];

  const scheduleSparkle = (startTime, motif, beat) => {
    const now = startTime ?? audioContext.currentTime;
    motif.forEach((note, index) => {
      playSparkle(note, now + index * beat * 0.5);
    });
  };

  orchestra.accent = () => {
    if (Math.random() > 0.4) {
      return;
    }
    const chord = chordProgression[chordIndex % chordProgression.length];
    scheduleSparkle(
      audioContext.currentTime + 0.08,
      [chord[2] * 2, chord[1] * 2, chord[0] * 2],
      0.4
    );
  };

  const bpm = 72;
  const beat = 60 / bpm;
  const bar = beat * 3;

  const scheduleBar = (startTime) => {
    const chord = chordProgression[chordIndex % chordProgression.length];
    scheduleStrings(startTime, chord);
    scheduleWaltzPiano(startTime + beat * 0.05, chord, beat);
    scheduleBassPulse(startTime + beat * 0.05, chord[0], starEnergy);
    if (barCount % 3 === 0) {
      scheduleSparkle(startTime + beat * 0.6, sparkleMotifs[barCount % sparkleMotifs.length], beat);
    }
    chordIndex += 1;
    barCount += 1;
  };

  if (!barTimer) {
    nextBarTime = audioContext.currentTime + 0.05;
    barTimer = window.setInterval(() => {
      const scheduleAhead = audioContext.currentTime + 1.2;
      while (nextBarTime < scheduleAhead) {
        scheduleBar(nextBarTime);
        nextBarTime += bar;
      }
    }, 100);
    scheduleBar(nextBarTime);
  }
};
const setSoundUi = (isOn) => {
  if (!soundToggle || !soundLabel) {
    return;
  }

  soundToggle.classList.toggle("active", isOn);
  soundLabel.textContent = isOn ? "Sound: On" : "Sound: Off";
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const setIntensityTarget = (value) => {
  intensityTarget = clamp(value, 0.4, 1.2);
};

const updateIntensity = () => {
  if (!ambientPlaying || !audioContext || !orchestra) {
    intensityRaf = null;
    return;
  }

  intensity += (intensityTarget - intensity) * 0.04;
  starEnergy += (starEnergyTarget - starEnergy) * 0.08;
  const now = audioContext.currentTime;

  orchestra.pianoGain.gain.setTargetAtTime(0.18 * intensity, now, 0.4);
  orchestra.celloGain.gain.setTargetAtTime(0.13 * intensity, now, 0.7);
  orchestra.violinGain.gain.setTargetAtTime(0.11 * intensity, now, 0.6);
  orchestra.pulseGain.gain.setTargetAtTime(0.05 * intensity, now, 0.4);
  orchestra.sparkleGain.gain.setTargetAtTime(0.04 * intensity, now, 0.3);

  intensityRaf = window.requestAnimationFrame(updateIntensity);
};

const refreshIntensityFromScroll = () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  setIntensityTarget(0.55 + ratio * 0.5);
};

const ensureAmbient = async () => {
  if (!audioContext) {
    createAmbientSound();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
};

const playAmbient = async () => {
  await ensureAmbient();
  if (audioContext && audioContext.state === "suspended") {
    try {
      await audioContext.resume();
    } catch (error) {
      console.warn("Audio resume failed, recreating engine.", error);
      createAmbientSound();
    }
  }
  ambientGain.gain.setTargetAtTime(7.56, audioContext.currentTime, 0.8);
  ambientPlaying = true;
  ambientPrimed = true;
  desiredSoundOn = true;
  setSoundUi(true);
  updateStarEnergy(0.3);
  barCount = 0;
  refreshIntensityFromScroll();
  if (!intensityRaf) {
    updateIntensity();
  }
};

const stopAmbient = async () => {
  await ensureAmbient();
  ambientGain.gain.setTargetAtTime(0.0, audioContext.currentTime, 0.3);
  ambientPlaying = false;
  desiredSoundOn = false;
  if (intensityRaf) {
    window.cancelAnimationFrame(intensityRaf);
    intensityRaf = null;
  }
  setSoundUi(false);
  if (audioContext && audioContext.state === "running") {
    try {
      await audioContext.suspend();
    } catch (error) {
      console.warn("Audio suspend failed on stop.", error);
    }
  }
};

const toggleSound = async () => {
  await ensureAmbient();
  if (audioContext && audioContext.state === "suspended") {
    try {
      await audioContext.resume();
    } catch (error) {
      console.warn("Audio resume failed on toggle, recreating engine.", error);
      createAmbientSound();
    }
  }
  if (ambientPlaying) {
    desiredSoundOn = false;
    await stopAmbient();
  } else {
    desiredSoundOn = true;
    await playAmbient();
  }
};

if (soundToggle) {
  soundToggle.addEventListener("click", toggleSound);
}

setSoundUi(false);

const enforceSoundOffForMaps = () => {
  const isMapPage =
    document.body.classList.contains("letters-page") ||
    document.body.classList.contains("words-page") ||
    document.body.classList.contains("phrases-page") ||
    document.body.classList.contains("grammar-page");
  if (!isMapPage) {
    return;
  }
  desiredSoundOn = false;
  setSoundUi(false);
  if (ambientPlaying) {
    stopAmbient();
    return;
  }
  if (audioContext && audioContext.state === "running") {
    audioContext.suspend().catch(() => {});
  }
};

const unlockAudioContext = async () => {
  await ensureAmbient();
  if (audioContext && audioContext.state === "suspended") {
    try {
      await audioContext.resume();
    } catch (error) {
      console.warn("Audio resume failed on unlock, recreating engine.", error);
      createAmbientSound();
    }
  }
  if (desiredSoundOn && !ambientPlaying) {
    await playAmbient();
  }
};

enforceSoundOffForMaps();

window.addEventListener("pointerdown", unlockAudioContext, { once: true });
window.addEventListener("touchstart", unlockAudioContext, { once: true });
window.addEventListener("keydown", unlockAudioContext, { once: true });
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && desiredSoundOn) {
    unlockAudioContext();
  }
});

let audioScrollRaf = null;
window.addEventListener(
  "scroll",
  () => {
    if (!audioContext || !ambientPlaying) {
      return;
    }
    if (audioScrollRaf) {
      return;
    }
    audioScrollRaf = window.requestAnimationFrame(() => {
      audioScrollRaf = null;
      refreshIntensityFromScroll();
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      updateStarEnergy(ratio);
    });
  },
  { passive: true }
);

const updateStarEnergy = (value) => {
  starEnergyTarget = Math.max(0, Math.min(1, value));
};

if (speechText && speechText.textContent.trim()) {
  activeLine = speechText.textContent.trim();
}
setMood("happy");
if (speechText) {
  speechText.textContent = activeLine;
}

if (speechText && speechBubble) {
  const defaultMimiLine =
    speechText.dataset.defaultMimiPrompt ||
    speechText.dataset.text ||
    speechText.textContent.trim();
  if (defaultMimiLine) {
    defaultMimiPrompt = defaultMimiLine;
    speechText.dataset.defaultMimiPrompt = defaultMimiLine;
    speechText.dataset.text = defaultMimiLine;
    speechText.textContent = "";
    let mimiTypingArmed = true;
    const mimiObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (userHasMessagedMimi) {
              if (lastMimiReply) {
                speechText.textContent = lastMimiReply;
              }
              speechBubble.classList.remove("speaking");
              return;
            }
            if (mimiTypingArmed) {
              speakLine(defaultMimiLine, "happy");
              mimiTypingArmed = false;
            }
          } else {
            if (userHasMessagedMimi) {
              speechBubble.classList.remove("speaking");
              return;
            }
            mimiTypingArmed = true;
            speechText.textContent = "";
            speechBubble.classList.remove("speaking");
          }
        });
      },
      { threshold: 0.35 }
    );
    mimiObserver.observe(speechBubble);
  }
}

if (chatForm && speechText) {
  const clearMimiOnHomeLeave = () => {
    resetMimiConversationState({ resetPromptText: true });
  };
  window.addEventListener("beforeunload", clearMimiOnHomeLeave);
  window.addEventListener("pagehide", clearMimiOnHomeLeave);
}

const MOBILE_HOME_ANCHOR_DOWN_SHIFT = Object.freeze({
  default: -40,
});
const getMobileHomeAnchorDownShift = (hash) =>
  MOBILE_HOME_ANCHOR_DOWN_SHIFT[hash] ?? MOBILE_HOME_ANCHOR_DOWN_SHIFT.default;
const DESKTOP_HOME_ANCHOR_DOWN_SHIFT = Object.freeze({
  default: -30,
});
const getDesktopHomeAnchorDownShift = (hash) =>
  DESKTOP_HOME_ANCHOR_DOWN_SHIFT[hash] ?? 0;

const scrollToAnchor = (hash) => {
    const targetId = hash.slice(1);
    const target = document.getElementById(targetId);
    if (!target) {
      return false;
    }
    const isHomeMobile = !document.body.classList.contains("world-page")
      && window.matchMedia("(max-width: 960px)").matches;
    const isHomeDesktop = !document.body.classList.contains("world-page")
      && window.matchMedia("(min-width: 961px)").matches;
    const mobileDownShift = isHomeMobile ? getMobileHomeAnchorDownShift(hash) : 0;
    const desktopDownShift = isHomeDesktop ? getDesktopHomeAnchorDownShift(hash) : 0;
    const baseOffset =
      Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
    const top = hash === "#home"
      ? 0
      : target.getBoundingClientRect().top
        + window.scrollY
        - baseOffset
        + mobileDownShift
        + desktopDownShift;
    history.replaceState(null, "", `${baseUrl}${hash}`);
    window.scrollTo({ top, behavior: "smooth" });
    return true;
};

  if (talkButton) {
    talkButton.addEventListener("click", () => {
      if (scrollToAnchor("#guide")) {
        return;
      }
      const guideSection = document.getElementById("guide");
      if (guideSection) {
        guideSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  const navLinks = document.querySelectorAll(".nav-links a[href^=\"#\"]");
  const anchorTargets = new Set([
    "#home",
    "#how",
    "#worlds",
    "#guide",
    "#join",
    "#support",
    "#policies",
  ]);
  const baseUrl = `${window.location.pathname}${window.location.search}`;
const navEntry = performance.getEntriesByType("navigation")[0];
const navType = navEntry?.type
  ?? (performance.navigation && performance.navigation.type === 1 ? "reload" : "navigate");

window.addEventListener("load", () => {
  if (navType !== "reload") {
    return;
  }
  if (window.location.hash) {
    history.replaceState(null, "", baseUrl);
  }
  window.scrollTo({ top: 0, behavior: "auto" });
});

  navLinks.forEach((link) => {
    const hash = link.getAttribute("href");
    if (!hash || !anchorTargets.has(hash)) {
      return;
    }
    link.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToAnchor(hash);
    });
  });

  if (startVoyageButton) {
    startVoyageButton.addEventListener("click", () => {
      if (scrollToAnchor("#worlds")) {
        return;
      }
      const fallback = document.getElementById("worlds");
      if (fallback) {
        fallback.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

if (alien) {
  alien.addEventListener("click", () => {
    pulseGuideInteractivity(1150);
    speakLine("Hi, explorer. I'm listening.", "happy");
  });
}

const guideSection = document.getElementById("guide");
const howSection = document.getElementById("how");
const worldsSection = document.getElementById("worlds");
const joinForm = document.getElementById("joinForm");
const joinName = document.getElementById("joinName");
const joinEmail = document.getElementById("joinEmail");
const joinFeedback = document.getElementById("joinFeedback");
const joinStatus = document.getElementById("joinStatus");

if (guideSection && chatLog) {
  const chatObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          chatLog.classList.remove("typing");
        }
      });
    },
    { threshold: 0.2 }
  );
  chatObserver.observe(guideSection);
}

const updateWorldsOverlap = () => {
  if (!howSection || !worldsSection) {
    return;
  }
  if (window.location.hash !== "#how") {
    document.body.classList.remove("hide-worlds-overlap");
    return;
  }
  const worldsTop = worldsSection.getBoundingClientRect().top;
  const hide = worldsTop > window.innerHeight * 0.75;
  document.body.classList.toggle("hide-worlds-overlap", hide);
};

window.addEventListener("scroll", updateWorldsOverlap, { passive: true });
window.addEventListener("hashchange", updateWorldsOverlap);
updateWorldsOverlap();

if (joinForm) {
  joinForm.setAttribute("novalidate", "novalidate");
  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  };
  const getFeedbackEndpointCandidates = () => {
    const endpoints = [];
    const addEndpoint = (value) => {
      const normalized = String(value || "").trim();
      if (!normalized || endpoints.includes(normalized)) {
        return;
      }
      endpoints.push(normalized);
    };
    // Keep same-origin feedback first to reduce mobile cross-origin failures.
    addEndpoint("/api/feedback");
    if (typeof getApiEndpointCandidates === "function") {
      getApiEndpointCandidates().forEach((candidate) => {
        addEndpoint(
          String(candidate || "").replace(
            /\/api\/chat(?=$|[?#])/i,
            "/api/feedback"
          )
        );
      });
    }
    return endpoints;
  };

  const updateJoinErrors = () => {
    if (!joinName || !joinEmail || !joinFeedback) {
      return;
    }
    const nameOk = joinName.value.trim().length > 0;
    const emailValue = joinEmail.value.trim();
    const emailOk = emailValue.length > 0 && isValidEmail(emailValue);
    const feedbackOk = joinFeedback.value.trim().length > 0;

    joinName.classList.toggle("field-error", !nameOk);
    joinEmail.classList.toggle("field-error", !emailOk);
    joinFeedback.classList.toggle("field-error", !feedbackOk);
  };

  [joinName, joinEmail, joinFeedback].forEach((field) => {
    if (!field) {
      return;
    }
    field.addEventListener("input", () => {
      field.classList.remove("field-error");
      if (joinStatus) {
        joinStatus.textContent = "";
      }
    });
    field.addEventListener("blur", updateJoinErrors);
  });

  joinForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!joinName || !joinEmail || !joinFeedback) {
      return;
    }
    const nameOk = joinName.value.trim().length > 0;
    const emailValue = joinEmail.value.trim();
    const emailOk = emailValue.length > 0 && isValidEmail(emailValue);
    const feedbackOk = joinFeedback.value.trim().length > 0;
    if (!nameOk || !emailOk || !feedbackOk) {
      updateJoinErrors();
      if (joinStatus) {
        joinStatus.textContent = "Please complete all fields to send feedback.";
      }
      return;
    }
    joinName.classList.remove("field-error");
    joinEmail.classList.remove("field-error");
    joinFeedback.classList.remove("field-error");
    const submitButton = joinForm.querySelector("button[type=\"submit\"]");
    if (submitButton) {
      submitButton.disabled = true;
    }
    if (joinStatus) {
      joinStatus.textContent = "Sending feedback...";
    }
    try {
      const isMobileViewport = window.matchMedia("(max-width: 960px)").matches;
      const timeoutMs = isMobileViewport ? 22000 : 12000;
      const payload = {
        name: joinName.value.trim(),
        email: joinEmail.value.trim(),
        message: joinFeedback.value.trim(),
      };
      const endpointCandidates = getFeedbackEndpointCandidates();
      let response = null;
      let lastError = null;

      for (let i = 0; i < endpointCandidates.length; i += 1) {
        const endpoint = endpointCandidates[i];
        const controller = createAbortController();
        const timeoutId = controller
          ? window.setTimeout(() => controller.abort(), timeoutMs)
          : null;
        try {
          const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            cache: "no-store",
            credentials: "same-origin",
          };
          if (controller) {
            requestOptions.signal = controller.signal;
          }
          response = await fetch(endpoint, requestOptions);
          if (response.ok) {
            break;
          }
          // Keep trying alternate endpoints only for transport-level/API host issues.
          if ([401, 403, 404, 405, 429, 500, 502, 503, 504].includes(response.status)) {
            continue;
          }
          break;
        } catch (error) {
          lastError = error;
        } finally {
          if (timeoutId) {
            window.clearTimeout(timeoutId);
          }
        }
      }

      if (!response || !response.ok) {
        if (response) {
          const data = await response.json().catch(() => ({}));
          const status = response.status;
          const detail = data.error || data.message || "";
          throw new Error(
            detail
              ? `Unable to send feedback (${status}): ${detail}`
              : `Unable to send feedback (${status}).`
          );
        }
        throw lastError || new Error("Unable to send feedback.");
      }

      joinForm.reset();
      if (joinStatus) {
        joinStatus.textContent = "Thanks for sharing. We'll review your feedback soon.";
      }
    } catch (error) {
      if (joinStatus) {
        joinStatus.textContent =
          error.name === "AbortError"
            ? "Feedback request timed out. Please try again."
            : error.message || "Unable to send feedback right now.";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}
const hero = document.querySelector(".hero-right");
const parallaxLayers = document.querySelectorAll("[data-depth]");
const canUseParallax =
  !prefersReducedMotion &&
  !shouldUseConservativeAnimationBudget &&
  window.matchMedia("(pointer: fine) and (min-width: 961px)").matches;
let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;

if (hero && !shouldUseLiteInteractiveEffects) {
  let heroMoveRafId = 0;
  let heroMoveTargetX = 0;
  let heroMoveTargetY = 0;
  const applyHeroPointerTransform = () => {
    heroMoveRafId = 0;
    hero.style.transform = `translate3d(${heroMoveTargetX * 10}px, ${heroMoveTargetY * 10}px, 0)`;
  };
  const queueHeroPointerTransform = (event) => {
    const rect = hero.getBoundingClientRect();
    heroMoveTargetX = (event.clientX - rect.left) / rect.width - 0.5;
    heroMoveTargetY = (event.clientY - rect.top) / rect.height - 0.5;
    if (heroMoveRafId) {
      return;
    }
    heroMoveRafId = window.requestAnimationFrame(applyHeroPointerTransform);
  };

  hero.addEventListener("mousemove", queueHeroPointerTransform, { passive: true });

  hero.addEventListener("mouseleave", () => {
    if (heroMoveRafId) {
      window.cancelAnimationFrame(heroMoveRafId);
      heroMoveRafId = 0;
    }
    hero.style.transform = "translate3d(0, 0, 0)";
  });
}

const resetGaze = () => {
  if (!alien) {
    return;
  }
  alien.style.setProperty("--gaze-x", "0px");
  alien.style.setProperty("--gaze-y", "0px");
};

let gazeMoveRafId = 0;
let gazeMoveEvent = null;
const applyQueuedGazeUpdate = () => {
  gazeMoveRafId = 0;
  const event = gazeMoveEvent;
  gazeMoveEvent = null;
  if (!event || !alien || !alienHead) {
    return;
  }
  const rect = alienHead.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;
  const maxShift = 6;
  const gazeX = clamp(dx / rect.width, -0.5, 0.5) * maxShift;
  const gazeY = clamp(dy / rect.height, -0.5, 0.5) * maxShift;
  alien.style.setProperty("--gaze-x", `${gazeX.toFixed(2)}px`);
  alien.style.setProperty("--gaze-y", `${gazeY.toFixed(2)}px`);
  window.clearTimeout(gazeResetTimer);
  gazeResetTimer = window.setTimeout(resetGaze, 1300);
};

const updateGaze = (event) => {
  gazeMoveEvent = event;
  if (gazeMoveRafId) {
    return;
  }
  gazeMoveRafId = window.requestAnimationFrame(applyQueuedGazeUpdate);
};

if (!shouldUseLiteInteractiveEffects && alien && alienHead) {
  window.addEventListener("mousemove", updateGaze, { passive: true });
  document.addEventListener("mouseleave", resetGaze);
}

const updateParallax = () => {
  if (!canUseParallax) {
    return;
  }
  parallaxRaf = null;
  currentX += (mouseX - currentX) * 0.08;
  currentY += (mouseY - currentY) * 0.08;

  parallaxLayers.forEach((layer) => {
    // Keep full-screen starfields stable to avoid mobile/background stretch artifacts.
    if (layer.classList.contains("starfield")) {
      return;
    }
    const depth = Number(layer.dataset.depth || 0.2);
    const translateX = currentX * 40 * depth;
    const translateY = currentY * 40 * depth;
    layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
  });

  if (Math.abs(mouseX - currentX) + Math.abs(mouseY - currentY) > 0.002) {
    parallaxRaf = window.requestAnimationFrame(updateParallax);
  }
};

let parallaxRaf = null;
const scheduleParallaxUpdate = () => {
  if (!canUseParallax || parallaxRaf) {
    return;
  }
  parallaxRaf = window.requestAnimationFrame(updateParallax);
};

if (canUseParallax) {
  window.addEventListener(
    "mousemove",
    (event) => {
      mouseX = event.clientX / window.innerWidth - 0.5;
      mouseY = event.clientY / window.innerHeight - 0.5;
      scheduleParallaxUpdate();
    },
    { passive: true }
  );
  window.addEventListener("mouseleave", () => {
    mouseX = 0;
    mouseY = 0;
    scheduleParallaxUpdate();
  });
  scheduleParallaxUpdate();
} else {
  parallaxLayers.forEach((layer) => {
    layer.style.transform = "";
  });
}

const triggerWarp = (worldName, onDone) => {
  if (!warpOverlay || !warpText) {
    if (typeof onDone === "function") {
      onDone();
    }
    return;
  }

  warpText.textContent = `Entering ${worldName} World`;
  warpText.dataset.text = warpText.textContent;
  speakLine(`Plotting course to ${worldName}.`, "curious");
  warpOverlay.classList.add("active");
  document.body.classList.add("warp-lock");
  if (orchestra && orchestra.accent) {
    orchestra.accent();
    setIntensityTarget(1.15);
  }
  updateStarEnergy(1);
  window.clearTimeout(triggerWarp.timer);
  window.clearTimeout(triggerWarp.cleanupTimer);

  if (typeof onDone === "function") {
    triggerWarp.timer = window.setTimeout(() => {
      onDone();
      triggerWarp.cleanupTimer = window.setTimeout(() => {
        warpOverlay.classList.remove("active");
        document.body.classList.remove("warp-lock");
      }, 2200);
    }, 850);
    return;
  }

  triggerWarp.timer = window.setTimeout(() => {
    warpOverlay.classList.remove("active");
    document.body.classList.remove("warp-lock");
    updateStarEnergy(0.4);
    if (typeof onDone === "function") {
      onDone();
    }
  }, 1500);
};

const markTouchActivation = (element) => {
  if (!element) {
    return;
  }
  element.dataset.touchActivatedAt = String(Date.now());
};

const isRecentTouchActivation = (element, windowMs = 500) => {
  if (!element) {
    return false;
  }
  const last = Number(element.dataset.touchActivatedAt || "0");
  if (!Number.isFinite(last) || last <= 0) {
    return false;
  }
  return Date.now() - last < windowMs;
};

worldCards.forEach((card) => {
  const worldName = card.dataset.world || "World";
  const targetWorldUrl = worldPages[worldName] || "";
  bindNavigationPrefetch(card, () => targetWorldUrl);
  const activateWorldCard = () => {
    if (card.classList.contains("coming-soon")) {
      return;
    }
    if (targetWorldUrl) {
      triggerWarp(worldName, () => {
        window.location.href = targetWorldUrl;
      });
      return;
    }
    triggerWarp(worldName);
  };
  card.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "touch") {
      return;
    }
    event.preventDefault();
    markTouchActivation(card);
    activateWorldCard();
  });
  card.addEventListener("click", () => {
    if (isRecentTouchActivation(card)) {
      return;
    }
    activateWorldCard();
  });
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateWorldCard();
    }
  });
  card.addEventListener("mouseenter", () => {
    setIntensityTarget(1.05);
    if (orchestra && orchestra.accent) {
      orchestra.accent();
    }
    updateStarEnergy(0.8);
  });
  card.addEventListener("mouseleave", () => {
    refreshIntensityFromScroll();
    updateStarEnergy(0.3);
  });
});

/* ==========================================================================
   WORLD PAGE NAVIGATION + LANGUAGE PICKER
   Handles map-card navigation and base-language selection persistence.
   ========================================================================== */
const openGuestSignupPanelUpwards = (message = "Sign up to save your progress.") => {
  const openSignupPanel = () => {
    const openAuthFromHub = () => {
      if (window.cosmicaAccountHub && typeof window.cosmicaAccountHub.openAuth === "function") {
        window.cosmicaAccountHub.openAuth({
          panel: "signup",
          message,
          tone: "info",
        });
        return true;
      }
      return false;
    };

    if (openAuthFromHub()) {
      window.setTimeout(() => {
        const dropdownNode = document.querySelector(".account-dropdown");
        const isOpen = Boolean(dropdownNode instanceof HTMLElement && dropdownNode.hidden === false);
        if (isOpen) {
          return;
        }
        if (openAuthFromHub()) {
          window.setTimeout(() => {
            const retryDropdownNode = document.querySelector(".account-dropdown");
            const retryOpen = Boolean(
              retryDropdownNode instanceof HTMLElement && retryDropdownNode.hidden === false
            );
            if (retryOpen) {
              return;
            }
            window.location.href = "/index.html?openAuth=1&authPanel=signup#support";
          }, 140);
          return;
        }
        window.location.href = "/index.html?openAuth=1&authPanel=signup#support";
      }, 120);
      return;
    }
    window.location.href = "/index.html?openAuth=1&authPanel=signup#support";
  };

  const startY = Math.max(0, window.scrollY || window.pageYOffset || 0);
  if (startY <= 8) {
    openSignupPanel();
    return;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });

  const startTs = performance.now();
  const maxWaitMs = 900;
  const waitUntilAtTop = () => {
    const currentY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    const elapsed = performance.now() - startTs;
    if (currentY <= 8 || elapsed >= maxWaitMs) {
      openSignupPanel();
      return;
    }
    window.requestAnimationFrame(waitUntilAtTop);
  };
  window.requestAnimationFrame(waitUntilAtTop);
};

window.cosmicaOpenSignupPanelUpwards = openGuestSignupPanelUpwards;

const applyMapComingSoonRules = () => {
  if (!document.body.classList.contains("world-page")) {
    return;
  }

  const grammarCard = document.querySelector(".map-card.map-grammar");
  if (!grammarCard) {
    return;
  }
  const snapshot =
    typeof window.cosmicaGamification?.getState === "function"
      ? window.cosmicaGamification.getState()
      : null;
  const user = snapshot && snapshot.user && typeof snapshot.user === "object" ? snapshot.user : null;
  const premiumFlagRaw = user?.isPremium ?? user?.premium;
  const premiumFlagText = String(premiumFlagRaw ?? "")
    .trim()
    .toLowerCase();
  const premiumTier = String(
    user?.planTier || user?.tier || user?.plan || user?.membership || ""
  )
    .trim()
    .toLowerCase();
  const premiumStatus = String(
    user?.premiumStatus ||
      user?.subscriptionStatus ||
      user?.premiumStripeSubscriptionStatus ||
      user?.stripeSubscriptionStatus ||
      ""
  )
    .trim()
    .toLowerCase();
  const premiumEndRaw = String(
    user?.premiumCurrentPeriodEnd ||
      user?.premiumEndsAt ||
      user?.premiumExpiresAt ||
      user?.subscriptionEndsAt ||
      user?.currentPeriodEnd ||
      user?.planEndsAt ||
      user?.expiresAt ||
      ""
  ).trim();
  const premiumEndMs = Date.parse(premiumEndRaw);
  const hasFuturePremiumEnd = Number.isFinite(premiumEndMs) && premiumEndMs > Date.now();
  const statusIndicatesPremium =
    premiumStatus === "active" ||
    premiumStatus === "trialing" ||
    premiumStatus === "past_due" ||
    premiumStatus === "canceling" ||
    premiumStatus === "grace";
  const hasPremiumAccess =
    premiumFlagRaw === true ||
    premiumFlagText === "1" ||
    premiumFlagText === "true" ||
    premiumFlagText === "yes" ||
    premiumFlagText === "premium" ||
    premiumFlagText === "pro" ||
    premiumFlagText === "plus" ||
    premiumTier === "premium" ||
    premiumTier === "pro" ||
    premiumTier === "plus" ||
    premiumTier === "paid" ||
    statusIndicatesPremium ||
    hasFuturePremiumEnd;

  const forceComingSoon = grammarCard.dataset.forceComingSoon === "true";
  const lockForPremium = !hasPremiumAccess;
  if (!forceComingSoon && !lockForPremium) {
    grammarCard.classList.remove("coming-soon");
    grammarCard.classList.remove("premium-locked");
    grammarCard.classList.add("map-link");
    grammarCard.dataset.comingSoon = "false";
    grammarCard.dataset.premiumLocked = "false";
    grammarCard.removeAttribute("aria-disabled");
    grammarCard.removeAttribute("title");
    const originalHref =
      grammarCard.getAttribute("href") || grammarCard.dataset.originalHref || "";
    if (originalHref) {
      grammarCard.setAttribute("href", originalHref);
      grammarCard.dataset.originalHref = originalHref;
    }
    grammarCard
      .querySelector(".coming-soon-badge, .premium-map-upgrade-button")
      ?.remove();
    return;
  }

  const currentHref = grammarCard.getAttribute("href");
  if (currentHref) {
    grammarCard.dataset.originalHref = currentHref;
  }

  grammarCard.classList.toggle("coming-soon", forceComingSoon);
  grammarCard.classList.toggle("premium-locked", !forceComingSoon && lockForPremium);
  grammarCard.classList.remove("map-link");
  grammarCard.dataset.comingSoon = forceComingSoon ? "true" : "false";
  grammarCard.dataset.premiumLocked = lockForPremium ? "true" : "false";
  if (forceComingSoon) {
    grammarCard.setAttribute("aria-disabled", "true");
  } else {
    grammarCard.removeAttribute("aria-disabled");
  }
  grammarCard.setAttribute("title", forceComingSoon ? "Coming soon" : "Premium feature");
  grammarCard.removeAttribute("href");

  const existingMarker = grammarCard.querySelector(
    ".coming-soon-badge, .premium-map-upgrade-button"
  );
  if (forceComingSoon) {
    if (!(existingMarker instanceof HTMLElement) || existingMarker.tagName !== "SPAN") {
      existingMarker?.remove();
      const badge = document.createElement("span");
      badge.className = "coming-soon-badge";
      badge.textContent = "Coming soon";
      grammarCard.appendChild(badge);
    } else {
      existingMarker.className = "coming-soon-badge";
      existingMarker.textContent = "Coming soon";
    }
    return;
  }

  if (!(existingMarker instanceof HTMLElement) || existingMarker.tagName !== "BUTTON") {
    existingMarker?.remove();
    const upgradeBtn = document.createElement("button");
    upgradeBtn.type = "button";
    upgradeBtn.className = "premium-setup-primary premium-map-upgrade-button";
    upgradeBtn.textContent = "Upgrade to Premium";
    grammarCard.appendChild(upgradeBtn);
  } else {
    existingMarker.className = "premium-setup-primary premium-map-upgrade-button";
    existingMarker.textContent = "Upgrade to Premium";
    if (existingMarker instanceof HTMLButtonElement) {
      existingMarker.type = "button";
    }
  }
};

applyMapComingSoonRules();
if (document.body.classList.contains("world-page") && typeof window.cosmicaGamification?.subscribe === "function") {
  window.cosmicaGamification.subscribe(() => {
    applyMapComingSoonRules();
  });
}

const bindPremiumLockedInteraction = (element, {
  upgradeHash = "#support",
  guestPanel = "login",
  guestMessage = "Sign in or create an account to continue. Upgrade to Premium to unlock this feature.",
  boundFlag = "premiumUpsellBound",
} = {}) => {
  if (!element || element.dataset[boundFlag] === "true") {
    return;
  }
  element.dataset[boundFlag] = "true";

  const navigateToUpgradeTarget = () => {
    const safeHash = String(upgradeHash || "").trim() || "#support";
    const target = safeHash.startsWith("#") ? document.querySelector(safeHash) : null;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const onHome =
      window.location.pathname.toLowerCase().endsWith("/index.html") ||
      window.location.pathname === "/";
    if (onHome) {
      window.location.hash = safeHash;
      return;
    }
    window.location.href = `/index.html${safeHash}`;
  };

  const onPremiumLockedInteract = (event) => {
    if (element.dataset.premiumLocked !== "true") {
      return;
    }
    const snapshot =
      typeof window.cosmicaGamification?.getState === "function"
        ? window.cosmicaGamification.getState()
        : null;
    const isAuthenticated = Boolean(snapshot?.isAuthenticated);
    event.preventDefault();
    if (!isAuthenticated) {
      if (typeof window.cosmicaAccountHub?.openPremium === "function") {
        window.cosmicaAccountHub.openPremium({
          message: "Upgrade to Premium to unlock this map.",
          tone: "info",
        });
        return;
      }
      if (typeof window.cosmicaAccountHub?.openAuth === "function") {
        window.cosmicaAccountHub.openAuth({
          panel: guestPanel,
          message: guestMessage,
          tone: "info",
        });
        return;
      }
      const panel = encodeURIComponent(String(guestPanel || "login").trim().toLowerCase() || "login");
      window.location.href = `/index.html?openAuth=1&authPanel=${panel}#support`;
      return;
    }
    if (typeof window.cosmicaAccountHub?.openPremium === "function") {
      window.cosmicaAccountHub.openPremium({
        message: "Upgrade to Premium to unlock this map.",
        tone: "info",
      });
      return;
    }
    navigateToUpgradeTarget();
  };

  element.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "touch") {
      return;
    }
    onPremiumLockedInteract(event);
  });
  element.addEventListener("click", (event) => {
    onPremiumLockedInteract(event);
  });
  element.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    onPremiumLockedInteract(event);
  });
};

window.cosmicaPremiumGate = {
  bind: bindPremiumLockedInteraction,
};

const setupGrammarPremiumUpsell = () => {
  if (!document.body.classList.contains("world-page")) {
    return;
  }
  const grammarCard = document.querySelector(".map-card.map-grammar");
  bindPremiumLockedInteraction(grammarCard, {
    guestMessage: "Sign in or create an account to continue. Upgrade to Premium to unlock this map.",
  });
};

setupGrammarPremiumUpsell();

const mapLinks = document.querySelectorAll(".map-link");
const inferMapKeyFromHref = (hrefValue) => {
  const href = String(hrefValue || "").toLowerCase();
  if (href.includes("letters")) {
    return "letters";
  }
  if (href.includes("words")) {
    return "words";
  }
  if (href.includes("phrases")) {
    return "phrases";
  }
  if (href.includes("grammar")) {
    return "grammar";
  }
  return "";
};
const navigateToMapLink = (href) => {
  if (!href) {
    return;
  }
  const mapKey = inferMapKeyFromHref(href);
  if (mapKey) {
    trackLearningProgressEvent({
      status: "started",
      mapKey,
      sectionKey: `${mapKey}-entry`,
    });
  }
  const baseLanguage = readStoredBaseLanguagePreference();
  if (!baseLanguage) {
    window.location.href = href;
    return;
  }
  let navigated = false;
  const finalize = () => {
    if (navigated) {
      return;
    }
    navigated = true;
    window.location.href = href;
  };
  const deadline = window.setTimeout(finalize, 800);
  Promise.allSettled([
    Promise.resolve(warmMapTranslationsCache()),
    Promise.resolve(warmWorldTranslationsCache()),
  ])
    .finally(() => {
      window.clearTimeout(deadline);
      finalize();
    });
};

mapLinks.forEach((link) => {
  bindNavigationPrefetch(link, () => link.getAttribute("href") || "");
  link.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "touch") {
      return;
    }
    event.preventDefault();
    markTouchActivation(link);
    navigateToMapLink(link.href);
  });
  link.addEventListener("click", (event) => {
    if (isRecentTouchActivation(link)) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    navigateToMapLink(link.href);
  });
});

const setupInteractiveMapCards = () => {
  const mapCards = document.querySelectorAll(".map-card");
  if (!mapCards.length) {
    return;
  }
  const igniteTimers = new WeakMap();
  const igniteCard = (card, clientX = null, clientY = null) => {
    if (!card || card.classList.contains("coming-soon")) {
      return;
    }
    const rect = card.getBoundingClientRect();
    const hasPointer = Number.isFinite(clientX) && Number.isFinite(clientY) && rect.width && rect.height;
    const x = hasPointer ? ((clientX - rect.left) / rect.width) * 100 : 50;
    const y = hasPointer ? ((clientY - rect.top) / rect.height) * 100 : 50;
    card.style.setProperty("--map-pulse-x", `${Math.min(100, Math.max(0, x)).toFixed(1)}%`);
    card.style.setProperty("--map-pulse-y", `${Math.min(100, Math.max(0, y)).toFixed(1)}%`);
    card.classList.remove("is-ignited");
    // Restart CSS animation even when users tap rapidly.
    void card.offsetWidth;
    card.classList.add("is-ignited");
    const existingTimer = igniteTimers.get(card);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }
    const timer = window.setTimeout(() => {
      card.classList.remove("is-ignited");
      igniteTimers.delete(card);
    }, 520);
    igniteTimers.set(card, timer);
  };

  mapCards.forEach((card) => {
    card.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      igniteCard(card, event.clientX, event.clientY);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      igniteCard(card);
    });
  });
};

setupInteractiveMapCards();

const languagePills = Array.from(document.querySelectorAll(".language-pill"));
let availableLanguagePills = [];
const BASE_LANGUAGE_NATIVE_LABELS = Object.freeze({
  albanian: "Shqip",
  arabic: "العربية",
  bulgarian: "Български",
  chinese: "中文",
  croatian: "Hrvatski",
  czech: "Čeština",
  dutch: "Nederlands",
  finnish: "Suomi",
  french: "Français",
  german: "Deutsch",
  greek: "Ελληνικά",
  hebrew: "עברית",
  hindi: "हिन्दी",
  indonesian: "Bahasa Indonesia",
  italian: "Italiano",
  japanese: "日本語",
  korean: "한국어",
  kurdish: "Kurdî",
  malaysian: "Bahasa Melayu",
  norwegian: "Norsk",
  persian: "فارسی",
  polish: "Polski",
  portuguese: "Português",
  romanian: "Română",
  russian: "Русский",
  somali: "Soomaali",
  spanish: "Español",
  swedish: "Svenska",
  tagalog: "Tagalog",
  thai: "ไทย",
  turkish: "Türkçe",
  ukrainian: "Українська",
  urdu: "اردو",
  uzbek: "O'zbek",
  vietnamese: "Tiếng Việt",
});
const normalizeLanguageLabel = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();
const getLanguagePillKey = (pill) =>
  normalizeLanguageLabel(
    pill?.dataset.languageKey || pill?.querySelector(".language-pill-label")?.textContent || ""
  ).toLowerCase();
const enhanceLanguagePillLabels = (pills) => {
  pills.forEach((pill) => {
    const rawLabel = normalizeLanguageLabel(
      pill.querySelector(".language-pill-label")?.textContent || pill.textContent
    );
    if (!rawLabel) {
      return;
    }
    const key = rawLabel.toLowerCase();
    const nativeLabel = key === "english" ? "" : BASE_LANGUAGE_NATIVE_LABELS[key] || "";
    pill.dataset.languageKey = key;
    pill.dataset.languageNative = nativeLabel.toLowerCase();

    const labelNode = document.createElement("span");
    labelNode.className = "language-pill-label";
    labelNode.textContent = rawLabel;

    pill.textContent = "";
    pill.appendChild(labelNode);

    if (nativeLabel) {
      const nativeNode = document.createElement("span");
      nativeNode.className = "language-pill-native";
      nativeNode.setAttribute("dir", "auto");
      nativeNode.textContent = nativeLabel;
      pill.appendChild(nativeNode);
    }

    pill.setAttribute(
      "aria-label",
      nativeLabel ? `${rawLabel} ${nativeLabel}` : rawLabel
    );
  });
};
if (languagePills.length) {
  enhanceLanguagePillLabels(languagePills);
  availableLanguagePills = languagePills.filter((pill) => getLanguagePillKey(pill) !== WORLD_KEY);
  languagePills.forEach((pill) => {
    if (getLanguagePillKey(pill) === WORLD_KEY) {
      pill.remove();
    }
  });
  const mapsSection = document.querySelector("#maps");
  const storedLanguageRaw = readStoredBaseLanguagePreference();
  const storedLanguage = storedLanguageRaw === WORLD_KEY ? "" : storedLanguageRaw;
  if (storedLanguageRaw === WORLD_KEY) {
    localStorage.removeItem("cosmicaBaseLanguage");
    applyWorldMapBilingualTitles();
  }
  if (storedLanguage) {
    availableLanguagePills.forEach((pill) => {
      const key = getLanguagePillKey(pill);
      if (key === storedLanguage) {
        pill.classList.add("is-selected");
      }
    });
  }
  const languageBox = document.querySelector(".language-box");
  const ensureLanguageSkipButton = () => {
    if (!languageBox) {
      return null;
    }
    let actions = languageBox.querySelector(".language-box-actions");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "language-box-actions";
      languageBox.appendChild(actions);
    }

    let skipButton = languageBox.querySelector(".language-skip");
    if (!skipButton) {
      skipButton = document.createElement("button");
      skipButton.type = "button";
      skipButton.className = "language-skip";
      actions.appendChild(skipButton);
    }
    skipButton.textContent = "Skip translation";
    skipButton.setAttribute("aria-label", "Skip translation");
    languageBox.querySelector(".language-box-frames")?.remove();
    return skipButton;
  };
  const skipLanguageButton = ensureLanguageSkipButton();
  const applyLanguageChoice = (selectedLanguage = "", selectedPill = null) => {
    const selected = normalizeStoredBaseLanguagePreference(selectedLanguage);
    availableLanguagePills.forEach((btn) => btn.classList.remove("is-selected"));
    if (selectedPill) {
      selectedPill.classList.add("is-selected");
    }
    if (selected) {
      localStorage.setItem("cosmicaBaseLanguage", selected);
      void warmMapTranslationsCache();
      void warmWorldTranslationsCache();
    } else {
      localStorage.removeItem("cosmicaBaseLanguage");
    }
    if (window.cosmicaAuth && typeof window.cosmicaAuth.syncBaseLanguageToAccount === "function") {
      void window.cosmicaAuth.syncBaseLanguageToAccount(selected).catch(() => {});
    }
    document.body.classList.add("language-picked");
    languageSection?.classList.remove("is-visible");
    if (document.body.classList.contains("world-page")) {
      document.body.classList.remove("show-language");
    }
    refreshMapsForBaseLanguage();
    applyWorldMapBilingualTitles();
    updateMapsTitleVisibility();
    if (mapsSection) {
      const targetTop = mapsSection.getBoundingClientRect().top + window.scrollY;
      const offset = Number.parseFloat(
        window.getComputedStyle(mapsSection).scrollMarginTop
      ) || 0;
      const y = targetTop - offset + WORLD_MAPS_SELECTION_UP_SHIFT;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }
    if (setActiveWorldSection) {
      setActiveWorldSection("maps");
    }
  };
  const selectLanguagePill = (pill) => {
    if (!pill) {
      return;
    }
    const selected = getLanguagePillKey(pill);
    if (!selected) {
      return;
    }
    applyLanguageChoice(selected, pill);
  };
  const commitBaseLanguageSelectionOnWorldLeave = () => {
    if (!document.body.classList.contains("world-page")) {
      return;
    }
    const selectedPill = availableLanguagePills.find((pill) =>
      pill.classList.contains("is-selected")
    );
    const selectedLanguage = normalizeStoredBaseLanguagePreference(
      selectedPill ? getLanguagePillKey(selectedPill) : ""
    );
    if (selectedLanguage) {
      localStorage.setItem("cosmicaBaseLanguage", selectedLanguage);
    } else {
      localStorage.removeItem("cosmicaBaseLanguage");
    }
    refreshMapsForBaseLanguage();
    applyWorldMapBilingualTitles();
    updateMapsTitleVisibility();
  };
  const handleWorldLeaveVisibility = () => {
    if (document.visibilityState === "hidden") {
      commitBaseLanguageSelectionOnWorldLeave();
    }
  };
  window.addEventListener("pagehide", commitBaseLanguageSelectionOnWorldLeave, {
    passive: true,
  });
  window.addEventListener("beforeunload", commitBaseLanguageSelectionOnWorldLeave, {
    passive: true,
  });
  document.addEventListener("visibilitychange", handleWorldLeaveVisibility, {
    passive: true,
  });
  const touchTapMaxMovePx = 10;
  const touchPillState = new WeakMap();

  availableLanguagePills.forEach((pill) => {
    pill.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "touch") {
        return;
      }
      touchPillState.set(pill, {
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
      });
    });

    pill.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "touch") {
        return;
      }
      const state = touchPillState.get(pill);
      if (!state) {
        return;
      }
      if (
        Math.abs(event.clientX - state.startX) > touchTapMaxMovePx ||
        Math.abs(event.clientY - state.startY) > touchTapMaxMovePx
      ) {
        state.moved = true;
      }
    });

    pill.addEventListener("pointercancel", () => {
      touchPillState.delete(pill);
    });

    pill.addEventListener("pointerup", (event) => {
      if (event.pointerType !== "touch") {
        return;
      }
      const state = touchPillState.get(pill);
      touchPillState.delete(pill);
      if (state?.moved) {
        // Treat swipe/scroll as navigation intent, not selection.
        markTouchActivation(pill);
        return;
      }
      event.preventDefault();
      markTouchActivation(pill);
      selectLanguagePill(pill);
    });

    pill.addEventListener("click", () => {
      if (isRecentTouchActivation(pill)) {
        return;
      }
      selectLanguagePill(pill);
    });
  });
  if (skipLanguageButton) {
    skipLanguageButton.addEventListener("pointerup", (event) => {
      if (event.pointerType !== "touch") {
        return;
      }
      event.preventDefault();
      markTouchActivation(skipLanguageButton);
      applyLanguageChoice("");
    });
    skipLanguageButton.addEventListener("click", () => {
      if (isRecentTouchActivation(skipLanguageButton)) {
        return;
      }
      applyLanguageChoice("");
    });
  }

  void warmMapTranslationsCache();
  void warmWorldTranslationsCache();
}

const languageSearch = document.getElementById("languageSearch");
if (languageSearch && availableLanguagePills.length) {
  const applyLanguageFirstLetterFilter = () => {
    const query = languageSearch.value.trim().toLowerCase();
    if (!query) {
      availableLanguagePills.forEach((pill) => {
        pill.style.display = "";
      });
      return;
    }
    const isSingleLetter = query.length === 1;
    const firstLetter = query[0];
    availableLanguagePills.forEach((pill) => {
      const name = getLanguagePillKey(pill);
      const native = String(pill.dataset.languageNative || "").trim().toLowerCase();
      const searchTarget = `${name} ${native}`.trim();
      const matches = isSingleLetter
        ? name.startsWith(firstLetter) || native.startsWith(firstLetter)
        : searchTarget.includes(query);
      pill.style.display = matches ? "" : "none";
    });
  };

  languageSearch.addEventListener("input", applyLanguageFirstLetterFilter);
  applyLanguageFirstLetterFilter();
}

/* ==========================================================================
   CARD AUDIO (LETTER / WORD / PHRASE)
   Unifies click, keyboard, and touch behavior for pronunciation playback.
   ========================================================================== */
const setupSpeechCards = () => {
  const letterButtons = document.querySelectorAll(".letter-audio");
  const wordButtons = document.querySelectorAll(".word-audio");
  const letterCards = document.querySelectorAll(".letter-card");
  const wordCards = document.querySelectorAll(".word-card");
  const phraseCards = document.querySelectorAll(".phrase-card");
  const hasSpeechCards =
    letterButtons.length ||
    wordButtons.length ||
    letterCards.length ||
    wordCards.length ||
    phraseCards.length;
  const hasBrowserSpeech =
    "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

  if (!hasSpeechCards) {
    return;
  }

  const resolveSectionKeyFromElement = (element, mapKey) => {
    if (!element) {
      return mapKey === "letters" ? "letters-core" : "core";
    }
    const fromContainer = String(
      element.closest("[data-section]")?.dataset.section || ""
    ).trim();
    if (fromContainer) {
      return fromContainer;
    }
    const fromDataset =
      String(element.dataset.section || "").trim() ||
      String(element.dataset.word || "").trim() ||
      String(element.dataset.phrase || "").trim();
    if (fromDataset) {
      return fromDataset.slice(0, 120);
    }
    return mapKey === "letters" ? "letters-core" : "core";
  };

  const trackPracticeFromElement = (element) => {
    const mapKey = detectMapKeyFromBody();
    if (!mapKey) {
      return;
    }
    const sectionKey = resolveSectionKeyFromElement(element, mapKey);
    trackLearningProgressEvent({
      status: "practiced",
      mapKey,
      sectionKey,
    });
  };

  let availableVoices = [];
  let selectedVoice = null;

  const markSpeechActivation = (element) => {
    if (!element) {
      return;
    }
    element.dataset.speechActivatedAt = String(Date.now());
  };

  const isRecentSpeechActivation = (element, windowMs = 450) => {
    if (!element) {
      return false;
    }
    const last = Number(element.dataset.speechActivatedAt || "0");
    if (!Number.isFinite(last) || last <= 0) {
      return false;
    }
    return Date.now() - last < windowMs;
  };

  const WORLD_BROWSER_VOICE_CONFIG = Object.freeze({
    english: Object.freeze({
      langPrefixes: ["en"],
      prioritizedHints: [
        "samantha",
        "ava",
        "allison",
        "serena",
        "karen",
        "moira",
        "google us english",
        "google uk english female",
        "microsoft aria",
        "microsoft jenny",
      ],
    }),
    french: Object.freeze({
      langPrefixes: ["fr"],
      prioritizedHints: ["microsoft denise", "google francais", "amelie", "celine", "marie"],
    }),
    german: Object.freeze({
      langPrefixes: ["de"],
      prioritizedHints: ["microsoft katja", "google deutsch", "helena", "anna"],
    }),
    spanish: Object.freeze({
      langPrefixes: ["es"],
      prioritizedHints: ["microsoft helena", "microsoft elvira", "google espanol", "monica", "paulina"],
    }),
    portuguese: Object.freeze({
      langPrefixes: ["pt"],
      prioritizedHints: ["microsoft francisca", "google portugues", "luciana", "helena"],
    }),
    dutch: Object.freeze({
      langPrefixes: ["nl"],
      prioritizedHints: ["microsoft colette", "google nederlands", "fenna"],
    }),
    swedish: Object.freeze({
      langPrefixes: ["sv"],
      prioritizedHints: ["microsoft sofie", "google svenska", "alva"],
    }),
    arabic: Object.freeze({
      langPrefixes: ["ar"],
      prioritizedHints: ["microsoft salma", "microsoft hoda", "google arabic", "zeina"],
    }),
    chinese: Object.freeze({
      langPrefixes: ["zh", "cmn"],
      prioritizedHints: ["xiaoxiao", "xiaoyi", "tingting", "huihui", "google zhongwen"],
    }),
    japanese: Object.freeze({
      langPrefixes: ["ja"],
      prioritizedHints: ["nanami", "haruka", "google nihongo", "microsoft nanami"],
    }),
    korean: Object.freeze({
      langPrefixes: ["ko"],
      prioritizedHints: ["sunhi", "seoyeon", "google hangug-eo", "microsoft sun-hi"],
    }),
    hindi: Object.freeze({
      langPrefixes: ["hi"],
      prioritizedHints: ["microsoft swara", "microsoft kalpana", "google hindi"],
    }),
  });
  const FEMALE_HINT =
    /female|woman|girl|samantha|karen|moira|ava|allison|serena|zira|jenny|aria|joanna|emma|lily|lucy|zoe|google uk english female|google us english female|microsoft aria|microsoft jenny/i;
  const MALE_HINT =
    /male|man|david|mark|alex|george|fred|daniel|ryan|tom|google uk english male|microsoft david/i;
  const LOW_QUALITY_HINT =
    /espeak|festival|robot|offline|basic|legacy|eloquence|embedded|svox/i;
  const HIGH_QUALITY_HINT =
    /neural|natural|premium|enhanced|wavenet|online|studio|siri|google us english|google uk english female|microsoft aria|microsoft jenny|samantha/i;
  const IOS_FEMALE_HINT = /samantha|karen|moira|ava|allison|serena/i;
  const ANDROID_FEMALE_HINT =
    /google.*female|google us english|google uk english female|wavenet.*(f|a)|neural2.*(f|a)|en-us-studio-o|en-gb-studio-a/i;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent || "");
  const isAndroid = /android/i.test(navigator.userAgent || "");

  const waitForVoicesReady = (timeoutMs = 3600) =>
    new Promise((resolve) => {
      if (!hasBrowserSpeech) {
        resolve();
        return;
      }
      const existing = window.speechSynthesis.getVoices();
      if (existing && existing.length) {
        resolve();
        return;
      }
      const finish = () => {
        window.clearTimeout(timeoutId);
        window.speechSynthesis.removeEventListener("voiceschanged", finish);
        resolve();
      };
      const timeoutId = window.setTimeout(finish, timeoutMs);
      window.speechSynthesis.addEventListener("voiceschanged", finish, {
        once: true,
      });
    });

  const pickVoice = () => {
    if (!availableVoices.length) {
      return null;
    }
    const voiceScore = (voice) => {
      const name = (voice.name || "").toLowerCase();
      const lang = (voice.lang || "").toLowerCase();
      let score = 0;
      if (lang.startsWith("en-gb")) {
        score += 12;
      }
      if (lang.startsWith("en-us")) {
        score += 8;
      }
      if (lang.startsWith("en")) {
        score += 3;
      }
      if (voice.default) {
        score += 2;
      }
      if (voice.localService === false) {
        score += 12;
      }
      if (voice.localService === true) {
        score -= 2;
      }
      if (FEMALE_HINT.test(name)) {
        score += 14;
      }
      if (HIGH_QUALITY_HINT.test(name)) {
        score += 10;
      }
      if (isIOS && IOS_FEMALE_HINT.test(name)) {
        score += 18;
      }
      if (isAndroid && ANDROID_FEMALE_HINT.test(name)) {
        score += 18;
      }
      if (MALE_HINT.test(name)) {
        score -= 24;
      }
      if (LOW_QUALITY_HINT.test(name)) {
        score -= 40;
      }
      return score;
    };

    const pickFrom = (voices) =>
      [...voices].sort((a, b) => voiceScore(b) - voiceScore(a))[0] || null;

    const worldVoiceConfig =
      WORLD_BROWSER_VOICE_CONFIG[WORLD_KEY] || WORLD_BROWSER_VOICE_CONFIG.english;
    const ttsLangPrefix = String(WORLD_TTS_LANGUAGE_CODE || "")
      .trim()
      .toLowerCase()
      .split("-")[0];
    const worldLangPrefixes = Array.from(
      new Set(
        [
          ...(Array.isArray(worldVoiceConfig?.langPrefixes) ? worldVoiceConfig.langPrefixes : []),
          ttsLangPrefix,
        ].filter(Boolean)
      )
    );
    const prioritizedVoiceHints = Array.isArray(worldVoiceConfig?.prioritizedHints)
      ? worldVoiceConfig.prioritizedHints
      : [];
    const worldVoices = availableVoices.filter((voice) => {
      const lang = (voice.lang || "").toLowerCase();
      return worldLangPrefixes.some((prefix) => lang.startsWith(prefix));
    });
    const prioritizedWorldVoices = worldVoices.filter((voice) =>
      prioritizedVoiceHints.some((hint) =>
        (voice.name || "").toLowerCase().includes(String(hint || "").toLowerCase())
      )
    );
    const femaleWorldVoices = worldVoices.filter((voice) =>
      FEMALE_HINT.test(voice.name || "")
    );
    const preferredWorldVoices = worldVoices.filter((voice) =>
      FEMALE_HINT.test(voice.name || "") || HIGH_QUALITY_HINT.test(voice.name || "")
    );
    const englishVoices = availableVoices.filter((voice) =>
      (voice.lang || "").toLowerCase().startsWith("en")
    );
    const prioritizedEnglishHints = isIOS
      ? ["samantha", "ava", "allison", "serena", "karen", "moira"]
      : ["google us english", "google uk english female", "microsoft aria", "microsoft jenny"];
    const prioritizedEnglishVoices = englishVoices.filter((voice) =>
      prioritizedEnglishHints.some((hint) =>
        (voice.name || "").toLowerCase().includes(hint)
      )
    );
    const femaleEnglishVoices = englishVoices.filter((voice) => FEMALE_HINT.test(voice.name || ""));
    const preferredEnglishVoices = englishVoices.filter((voice) =>
      FEMALE_HINT.test(voice.name || "") || HIGH_QUALITY_HINT.test(voice.name || "")
    );
    return (
      pickFrom(prioritizedWorldVoices) ||
      pickFrom(femaleWorldVoices) ||
      pickFrom(preferredWorldVoices) ||
      pickFrom(worldVoices) ||
      pickFrom(prioritizedEnglishVoices) ||
      pickFrom(femaleEnglishVoices) ||
      pickFrom(preferredEnglishVoices) ||
      pickFrom(englishVoices) ||
      pickFrom(availableVoices)
    );
  };

  const loadVoices = () => {
    if (!hasBrowserSpeech) {
      availableVoices = [];
      selectedVoice = null;
      return;
    }
    availableVoices = window.speechSynthesis.getVoices();
    selectedVoice = pickVoice();
  };
  loadVoices();
  if (hasBrowserSpeech) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  const ttsAudioCache = new Map();
  const SpeechAudioContext =
    window.AudioContext || window.webkitAudioContext || null;
  let speechPlaybackContext = null;
  let activeTtsSource = null;
  let serverTtsState = "unknown"; // unknown | available | unavailable

  const ensureSpeechPlaybackContext = async () => {
    if (!SpeechAudioContext) {
      return null;
    }
    if (!speechPlaybackContext) {
      speechPlaybackContext = new SpeechAudioContext();
    }
    if (speechPlaybackContext.state === "suspended") {
      try {
        await speechPlaybackContext.resume();
      } catch {}
    }
    return speechPlaybackContext;
  };

  const stopActiveTtsAudio = () => {
    if (!activeTtsSource) {
      return;
    }
    try {
      activeTtsSource.stop(0);
    } catch {}
    try {
      activeTtsSource.disconnect();
    } catch {}
    activeTtsSource = null;
  };

  const buildTtsCacheKey = (text, rate, pitch) =>
    `${text}::${Number(rate).toFixed(2)}::${Number(pitch).toFixed(2)}`;

  const requestServerTtsAudioBuffer = async (text, { rate = 0.94, pitch = 1.02 } = {}) => {
    const cacheKey = buildTtsCacheKey(text, rate, pitch);
    if (ttsAudioCache.has(cacheKey)) {
      return ttsAudioCache.get(cacheKey);
    }

    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        text,
        languageCode: WORLD_TTS_LANGUAGE_CODE,
        voice: WORLD_TTS_VOICE,
        speakingRate: Number(rate.toFixed(2)),
        pitch: Number(((pitch - 1) * 4).toFixed(2)),
      }),
    });
    if (!response.ok) {
      const error = new Error(`TTS HTTP ${response.status}`);
      error.httpStatus = response.status;
      throw error;
    }
    const contentType = String(response.headers.get("content-type") || "").toLowerCase();
    if (contentType && !contentType.includes("audio")) {
      throw new Error(`Unexpected TTS content-type: ${contentType}`);
    }
    const buffer = await response.arrayBuffer();
    if (!buffer || buffer.byteLength <= 0) {
      throw new Error("Empty TTS audio payload");
    }
    ttsAudioCache.set(cacheKey, buffer);
    serverTtsState = "available";
    return buffer;
  };

  const playServerTtsAudio = async (buffer) => {
    const playbackContext = await ensureSpeechPlaybackContext();
    if (!playbackContext) {
      throw new Error("AudioContext unavailable for TTS");
    }
    const decodedAudio = await playbackContext.decodeAudioData(buffer.slice(0));
    stopActiveTtsAudio();
    const source = playbackContext.createBufferSource();
    source.buffer = decodedAudio;
    source.connect(playbackContext.destination);
    source.onended = () => {
      if (activeTtsSource === source) {
        activeTtsSource = null;
      }
    };
    activeTtsSource = source;
    source.start(0);
  };

  const playSpeech = async (text, { rate = 0.94, pitch = 1.02 } = {}) => {
    if (!text) {
      return;
    }
    const normalizedText = String(text || "").trim();
    if (!normalizedText) {
      return;
    }

    let serverTtsError = null;
    if (serverTtsState !== "unavailable") {
      try {
        await ensureSpeechPlaybackContext();
        const sourceBuffer = await requestServerTtsAudioBuffer(normalizedText, { rate, pitch });
        await playServerTtsAudio(sourceBuffer);
        return;
      } catch (error) {
        serverTtsError = error;
        const status = Number(error?.httpStatus || 0);
        if (
          !status ||
          status === 404 ||
          status === 429 ||
          (status >= 500 && status <= 599)
        ) {
          // Google TTS proxy is unavailable right now, allow browser fallback.
          serverTtsState = "unavailable";
        }
      }
    }

    if (!hasBrowserSpeech) {
      return;
    }

    if (serverTtsError && !window.__cosmicaTtsFallbackWarned) {
      window.__cosmicaTtsFallbackWarned = true;
      console.warn("Server TTS unavailable, falling back to browser speech.", serverTtsError);
    }

    if (!availableVoices.length) {
      await waitForVoicesReady();
      loadVoices();
    }
    if (!selectedVoice) {
      selectedVoice = pickVoice();
    }
    const utterance = new SpeechSynthesisUtterance(normalizedText);
    utterance.lang = selectedVoice?.lang || WORLD_TTS_LANGUAGE_CODE || "en-US";
    utterance.rate = rate;
    utterance.pitch = pitch;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    window.speechSynthesis.cancel();
    window.setTimeout(() => {
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    }, 60);
  };

  const LETTER_SPEECH_MAP = Object.freeze({
    A: "a",
    B: "b",
    C: "c",
    D: "d",
    E: "e",
    F: "f",
    G: "g",
    H: "h",
    I: "i",
    J: "j",
    K: "k",
    L: "l",
    M: "m",
    N: "n",
    O: "o",
    P: "p",
    Q: "q",
    R: "r",
    S: "s",
    T: "t",
    U: "u",
    V: "v",
    W: "w",
    X: "x",
    Y: "y",
    Z: "zed",
    À: "à",
    Â: "â",
    Æ: "æ",
    Ç: "ç",
    É: "é",
    È: "è",
    Ê: "ê",
    Ë: "ë",
    Î: "î",
    Ï: "ï",
    Ô: "ô",
    Œ: "œ",
    Ù: "ù",
    Û: "û",
    Ÿ: "ÿ",
    Ä: "ä",
    Ö: "ö",
    Ü: "ü",
    ß: "ß",
    ɪ: "ɪ",
  });
  const WORLD_LETTER_SPEECH_OVERRIDES = Object.freeze({
    portuguese: Object.freeze({
      Ç: "cê cedilha",
      ç: "cê cedilha",
    }),
  });

  const normalizeLetterSpeechText = (rawText) => {
    const text = String(rawText || "")
      .replace(/\b(play|say|pronounce)\b/gi, "")
      .replace(/\b(capital|uppercase|lowercase)\s+letter\b/gi, "")
      .replace(/\b(capital|uppercase|lowercase)\b/gi, "")
      .replace(/\bletter\b/gi, "")
      .trim();
    if (!text) {
      return "";
    }
    const exactLetterTokens = text.match(/\p{L}/gu);
    if (!exactLetterTokens || !exactLetterTokens.length) {
      return text;
    }
    const rawToken = exactLetterTokens[exactLetterTokens.length - 1];
    const token = rawToken === "ɪ" ? "ɪ" : rawToken.toLowerCase() === "ß" ? "ß" : rawToken.toUpperCase();
    const worldOverrides = WORLD_LETTER_SPEECH_OVERRIDES[WORLD_KEY];
    if (worldOverrides) {
      const worldValue = worldOverrides[token] || worldOverrides[rawToken];
      if (worldValue) {
        return worldValue;
      }
    }
    return LETTER_SPEECH_MAP[token] || LETTER_SPEECH_MAP[rawToken] || rawToken;
  };

  const setupCards = (
    cards,
    labelSelector,
    datasetKey,
    ariaPrefix,
    rate,
    pitch,
    normalizeText
  ) => {
    cards.forEach((card) => {
      const label = card.querySelector(labelSelector);
      const sourceText = String(
        label?.textContent?.trim() || card.dataset[datasetKey] || ""
      ).trim();
      if (sourceText) {
        card.dataset[datasetKey] = normalizeText
          ? normalizeText(sourceText)
          : sourceText;
      }
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      if (card.dataset[datasetKey]) {
        card.setAttribute("aria-label", `${ariaPrefix} ${card.dataset[datasetKey]}`);
      }
      card.addEventListener("pointerup", (event) => {
        if (event.target?.closest?.(".letter-audio, .word-audio")) {
          return;
        }
        if (event.pointerType !== "touch") {
          return;
        }
        event.preventDefault();
        markTouchActivation(card);
        if (isRecentSpeechActivation(card)) {
          return;
        }
        markSpeechActivation(card);
        playSpeech(card.dataset[datasetKey], { rate, pitch });
        trackPracticeFromElement(card);
      });
      card.addEventListener("click", (event) => {
        if (event.target?.closest?.(".letter-audio, .word-audio")) {
          return;
        }
        if (isRecentTouchActivation(card)) {
          return;
        }
        if (isRecentSpeechActivation(card)) {
          return;
        }
        markSpeechActivation(card);
        playSpeech(card.dataset[datasetKey], { rate, pitch });
        trackPracticeFromElement(card);
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (isRecentSpeechActivation(card)) {
            return;
          }
          markSpeechActivation(card);
          playSpeech(card.dataset[datasetKey], { rate, pitch });
          trackPracticeFromElement(card);
        }
      });
    });
  };

  setupCards(
    letterCards,
    ".letter",
    "letter",
    "Play letter",
    0.9,
    1,
    normalizeLetterSpeechText
  );
  setupCards(wordCards, ".word", "word", "Play word", 0.95, 1.01);
  setupCards(phraseCards, ".phrase-text", "phrase", "Play phrase", 0.95, 1);

  const setupAudioButtons = (
    buttons,
    datasetKey,
    rate,
    pitch,
    normalizeText
  ) => {
    buttons.forEach((button) => {
      const datasetValue = String(button.dataset[datasetKey] || "").trim();
      const ariaValue = String(button.getAttribute("aria-label") || "")
        .replace(/^\s*play\s+(letter|word)\s+/i, "")
        .trim();
      const sourceText = datasetValue || ariaValue;
      if (sourceText) {
        button.dataset[datasetKey] = normalizeText
          ? normalizeText(sourceText)
          : sourceText;
      }
      const speakFromButton = () => {
        const value = String(button.dataset[datasetKey] || "").trim();
        if (value) {
          if (isRecentSpeechActivation(button)) {
            return;
          }
          markSpeechActivation(button);
          playSpeech(value, { rate, pitch });
          trackPracticeFromElement(button);
        }
      };
      button.addEventListener("pointerup", (event) => {
        if (event.pointerType !== "touch") {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        markTouchActivation(button);
        speakFromButton();
      });
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        if (isRecentTouchActivation(button)) {
          return;
        }
        speakFromButton();
      });
    });
  };

  setupAudioButtons(
    letterButtons,
    "letter",
    0.9,
    1,
    normalizeLetterSpeechText
  );
  setupAudioButtons(wordButtons, "word", 0.95, 1.01);

  [...letterButtons, ...wordButtons].forEach((button) => {
    button.setAttribute("aria-hidden", "true");
    button.setAttribute("tabindex", "-1");
  });
};

/* ==========================================================================
   MAPS BRIDGE
   Keep this no-op in the base bundle so world pages can call language picker
   handlers safely even when the maps bundle is not loaded.
   ========================================================================== */
let refreshMapsForBaseLanguage = () => {};

const runWhenBrowserIdle = (task) => {
  if (typeof task !== "function") {
    return;
  }
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(
      () => {
        task();
      },
      { timeout: 1400 }
    );
    return;
  }
  window.setTimeout(task, 280);
};

const applySafeMediaLoadingHints = () => {
  const applyHints = () => {
    const viewportHeight = Math.max(window.innerHeight || 0, 1);
    const aboveFoldThreshold = viewportHeight * 1.2;

    document.querySelectorAll("img").forEach((img) => {
      if (!img.getAttribute("decoding")) {
        img.decoding = "async";
      }

      const rect = img.getBoundingClientRect();
      const isLikelyAboveFold = rect.top < aboveFoldThreshold && rect.bottom > -64;

      if (!img.getAttribute("loading") && !isLikelyAboveFold) {
        img.loading = "lazy";
      }

      if (!img.getAttribute("fetchpriority") && !isLikelyAboveFold) {
        try {
          img.fetchPriority = "low";
        } catch {}
      }
    });

    document.querySelectorAll("iframe").forEach((frame) => {
      if (!frame.getAttribute("loading")) {
        frame.loading = "lazy";
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      runWhenBrowserIdle(applyHints);
    });
    return;
  }

  runWhenBrowserIdle(applyHints);
};

applySafeMediaLoadingHints();

/* ==========================================================================
   REAL-USER PERFORMANCE (CORE WEB VITALS)
   Captures field performance metrics and posts sampled telemetry to the server.
   ========================================================================== */
const WEB_VITAL_SAMPLE_RATE = 0.35;

const setupWebVitalsReporting = () => {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof PerformanceObserver === "undefined" ||
    Math.random() > WEB_VITAL_SAMPLE_RATE
  ) {
    return;
  }

  const metricBuffer = new Map();
  let clsValue = 0;
  let lcpValue = 0;
  let inpValue = 0;
  let finalized = false;

  const getRating = (name, value) => {
    const thresholds = {
      CLS: [0.1, 0.25],
      FCP: [1800, 3000],
      INP: [200, 500],
      LCP: [2500, 4000],
      TTFB: [800, 1800],
    };
    const [good, poor] = thresholds[name] || [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
    if (value <= good) {
      return "good";
    }
    if (value <= poor) {
      return "needs-improvement";
    }
    return "poor";
  };

  const queueMetric = (name, value) => {
    if (!Number.isFinite(value) || value < 0) {
      return;
    }
    metricBuffer.set(name, {
      name,
      value: Number(value.toFixed(3)),
      rating: getRating(name, value),
      id: `${name}-${Math.random().toString(36).slice(2, 10)}`,
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
  };

  const sendMetric = (metric) => {
    const payload = JSON.stringify(metric);
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/web-vitals", blob);
      return;
    }
    void fetch("/api/web-vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  };

  const flushMetrics = () => {
    if (finalized) {
      return;
    }
    finalized = true;

    queueMetric("CLS", clsValue);
    if (lcpValue > 0) {
      queueMetric("LCP", lcpValue);
    }
    if (inpValue > 0) {
      queueMetric("INP", inpValue);
    }
    const navEntry = performance.getEntriesByType("navigation")[0];
    if (navEntry && Number.isFinite(navEntry.responseStart)) {
      queueMetric("TTFB", navEntry.responseStart);
    }

    metricBuffer.forEach((metric) => sendMetric(metric));
    metricBuffer.clear();
  };

  try {
    const fcpObserver = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (entry.name === "first-contentful-paint") {
          queueMetric("FCP", entry.startTime);
        }
      });
    });
    fcpObserver.observe({ type: "paint", buffered: true });
  } catch {}

  try {
    const clsObserver = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });
  } catch {}

  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry && Number.isFinite(lastEntry.startTime)) {
        lcpValue = lastEntry.startTime;
      }
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {}

  try {
    const inpObserver = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (entry.interactionId && Number.isFinite(entry.duration)) {
          inpValue = Math.max(inpValue, entry.duration);
        }
      });
    });
    inpObserver.observe({ type: "event", buffered: true, durationThreshold: 40 });
  } catch {}

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushMetrics();
    }
  });
  window.addEventListener("pagehide", flushMetrics);
};

const setupHomeAltInteractivity = () => {
  const homeBrand = document.querySelector(".nav .brand");
  if (homeBrand && homeBrand.dataset.logoFxBound !== "1") {
    homeBrand.dataset.logoFxBound = "1";
    const homeBrandMark = homeBrand.querySelector(".brand-mark");
    if (homeBrandMark) {
      let brandBurstTimer = 0;
      let spinRaf = 0;
      let spinAngleDeg = 0;
      let spinStartAngleDeg = 0;
      let spinTargetAngleDeg = 0;
      let spinStartTs = 0;
      let spinPhase = "idle";
      const LOGO_SPIN_DURATION_MS = 1900;
      const LOGO_SPIN_EXTRA_ROTATIONS = 3;
      let logoStopTimer = 0;
      let tiltRaf = 0;
      let tiltCurrentX = 0;
      let tiltCurrentY = 0;
      let tiltTargetX = 0;
      let tiltTargetY = 0;

      const updateLogoSpin = () => {
        homeBrandMark.style.setProperty("--brand-spin-angle", `${spinAngleDeg.toFixed(2)}deg`);
      };

      const triggerBrandBurst = (durationMs = 500) => {
        homeBrand.classList.remove("is-logo-burst");
        void homeBrand.offsetWidth;
        homeBrand.classList.add("is-logo-burst");
        window.clearTimeout(brandBurstTimer);
        brandBurstTimer = window.setTimeout(() => {
          homeBrand.classList.remove("is-logo-burst");
        }, durationMs);
      };

      const finishLogoSpinStop = () => {
        spinPhase = "idle";
        spinAngleDeg = spinTargetAngleDeg;
        updateLogoSpin();
        homeBrand.classList.remove("is-logo-spinning");
        homeBrand.classList.add("is-logo-stop");
        window.clearTimeout(logoStopTimer);
        logoStopTimer = window.setTimeout(() => {
          homeBrand.classList.remove("is-logo-stop");
          if (!prefersReducedMotion) {
            homeBrand.classList.add("is-logo-breathing");
          }
        }, 180);
        if (spinRaf) {
          window.cancelAnimationFrame(spinRaf);
          spinRaf = 0;
        }
      };

      const animateLogoSpin = (ts) => {
        spinRaf = 0;
        if (spinPhase !== "spinning") {
          return;
        }
        const elapsedMs = Math.max(0, ts - spinStartTs);
        const progress = Math.max(0, Math.min(1, elapsedMs / LOGO_SPIN_DURATION_MS));
        // Fast at the start, smooth and slow near the end.
        const eased = 1 - Math.pow(1 - progress, 4);
        spinAngleDeg =
          spinStartAngleDeg + (spinTargetAngleDeg - spinStartAngleDeg) * eased;
        updateLogoSpin();
        if (progress >= 1) {
          finishLogoSpinStop();
          return;
        }
        spinRaf = window.requestAnimationFrame(animateLogoSpin);
      };

      const triggerLogoSpin = (_intensity = 1) => {
        if (prefersReducedMotion) {
          triggerBrandBurst(280);
          return;
        }
        spinStartAngleDeg = spinAngleDeg;
        spinTargetAngleDeg =
          Math.ceil(spinStartAngleDeg / 360) * 360 + LOGO_SPIN_EXTRA_ROTATIONS * 360;
        if (Math.abs(spinTargetAngleDeg - spinStartAngleDeg) < 0.2) {
          spinTargetAngleDeg += 360;
        }
        spinStartTs = performance.now();
        spinPhase = "spinning";
        homeBrand.classList.add("is-logo-spinning");
        homeBrand.classList.remove("is-logo-stop");
        homeBrand.classList.remove("is-logo-breathing");
        if (spinRaf) {
          window.cancelAnimationFrame(spinRaf);
        }
        spinRaf = window.requestAnimationFrame(animateLogoSpin);
      };

      const applyBrandTilt = () => {
        tiltRaf = 0;
        tiltCurrentX += (tiltTargetX - tiltCurrentX) * 0.22;
        tiltCurrentY += (tiltTargetY - tiltCurrentY) * 0.22;
        homeBrandMark.style.setProperty("--brand-tilt-x", `${tiltCurrentY.toFixed(2)}deg`);
        homeBrandMark.style.setProperty("--brand-tilt-y", `${tiltCurrentX.toFixed(2)}deg`);
        if (
          Math.abs(tiltTargetX - tiltCurrentX) > 0.08 ||
          Math.abs(tiltTargetY - tiltCurrentY) > 0.08
        ) {
          tiltRaf = window.requestAnimationFrame(applyBrandTilt);
        }
      };

      const queueBrandTilt = () => {
        if (!tiltRaf) {
          tiltRaf = window.requestAnimationFrame(applyBrandTilt);
        }
      };

      const setBrandTiltFromPointer = (event) => {
        const rect = homeBrand.getBoundingClientRect();
        if (!rect.width || !rect.height) {
          return;
        }
        const px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const py = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        tiltTargetX = Math.max(-11, Math.min(11, px * 8));
        tiltTargetY = Math.max(-10, Math.min(10, -py * 7));
        queueBrandTilt();
      };

      homeBrand.addEventListener("pointerenter", (event) => {
        if (event.pointerType !== "mouse") {
          return;
        }
        homeBrand.classList.add("is-logo-active");
        setBrandTiltFromPointer(event);
        triggerLogoSpin(0.8);
      });
      homeBrand.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") {
          return;
        }
        setBrandTiltFromPointer(event);
      });
      homeBrand.addEventListener("pointerleave", () => {
        homeBrand.classList.remove("is-logo-active");
        tiltTargetX = 0;
        tiltTargetY = 0;
        queueBrandTilt();
      });
      homeBrand.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }
        triggerBrandBurst(620);
        triggerLogoSpin(1.2);
      });
      homeBrand.addEventListener("click", () => {
        triggerLogoSpin(1.1);
      });

      if (!shouldUseLiteInteractiveEffects) {
        window.setTimeout(() => {
          triggerLogoSpin(0.95);
        }, 320);
      }
    }
  }

  if (!document.body.classList.contains("home-alt-luxe")) {
    return;
  }

  const setupHomeMeteors = () => {
    if (document.querySelector(".home-fx-comets")) {
      return;
    }
    const layer = document.createElement("div");
    layer.className = "home-fx-comets";
    layer.setAttribute("aria-hidden", "true");
    const cometCount = prefersReducedMotion ? 1 : 3;
    const baseTopSlots = [14, 34, 56];
    const topSlots = baseTopSlots
      .slice(0, cometCount)
      .sort(() => Math.random() - 0.5)
      .map((slot) => Math.max(8, Math.min(64, slot + (Math.random() * 6 - 3))));
    const isMobileMeteorCadence = window.matchMedia("(max-width: 960px)").matches;
    const baseDurationSec = isMobileMeteorCadence ? 6.4 + Math.random() * 0.6 : 5.8 + Math.random() * 2.2;
    const launchStrideSec = isMobileMeteorCadence
      ? baseDurationSec / Math.max(1, cometCount)
      : Math.max(1.2, baseDurationSec * 0.34);
    for (let i = 0; i < cometCount; i += 1) {
      const comet = document.createElement("span");
      comet.className = "home-fx-comet";
      comet.style.setProperty("--c-top", `${(topSlots[i] ?? (8 + Math.random() * 56)).toFixed(2)}%`);
      comet.style.setProperty("--c-size", `${(78 + Math.random() * 44).toFixed(2)}px`);
      comet.style.setProperty(
        "--c-delay",
        `${(i * launchStrideSec + (isMobileMeteorCadence ? 0 : Math.random() * 0.35)).toFixed(2)}s`
      );
      comet.style.setProperty(
        "--c-duration",
        `${(isMobileMeteorCadence ? baseDurationSec : baseDurationSec + (Math.random() * 0.6 - 0.3)).toFixed(2)}s`
      );
      layer.appendChild(comet);
    }
    document.body.appendChild(layer);
  };

  setupHomeMeteors();

  const interactiveSurfaces = Array.from(
    document.querySelectorAll(
      ".steps .card, .world-card:not(.coming-soon), .join-panel, .support-panel"
    )
  );
  const pressTimers = new WeakMap();

  const queuePressRelease = (surface, delayMs = 110) => {
    if (!surface) {
      return;
    }
    const existingTimer = pressTimers.get(surface);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }
    const timer = window.setTimeout(() => {
      surface.classList.remove("is-pressed");
      pressTimers.delete(surface);
    }, delayMs);
    pressTimers.set(surface, timer);
  };

  interactiveSurfaces.forEach((surface) => {
    surface.classList.add("is-interactive-surface");

    surface.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      surface.classList.add("is-pressed");
    });

    surface.addEventListener("pointerup", () => {
      queuePressRelease(surface, 80);
    });
    surface.addEventListener("pointercancel", () => {
      queuePressRelease(surface, 60);
    });
    surface.addEventListener("mouseleave", () => {
      queuePressRelease(surface, 60);
    });

    surface.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") {
        return;
      }
      surface.classList.add("is-hovered");
    });
    surface.addEventListener("pointerleave", () => {
      surface.classList.remove("is-hovered");
    });

    surface.addEventListener("focusin", () => {
      surface.classList.add("is-hovered");
    });
    surface.addEventListener("focusout", () => {
      surface.classList.remove("is-hovered");
    });
  });

  const homeWorldsSection = document.getElementById("worlds");
  if (homeWorldsSection && !shouldUseLiteInteractiveEffects) {
    const homeWorldCards = Array.from(
      homeWorldsSection.querySelectorAll(".world-card:not(.coming-soon)")
    );
    const pulseTimers = new WeakMap();
    let waveTimer = 0;

    const pulseWorldCard = (card, durationMs = 620) => {
      if (!card) {
        return;
      }
      card.classList.remove("is-cosmic-ping");
      void card.offsetWidth;
      card.classList.add("is-cosmic-ping");
      const existingTimer = pulseTimers.get(card);
      if (existingTimer) {
        window.clearTimeout(existingTimer);
      }
      const timer = window.setTimeout(() => {
        card.classList.remove("is-cosmic-ping");
        pulseTimers.delete(card);
      }, durationMs);
      pulseTimers.set(card, timer);
    };

    homeWorldCards.forEach((card, index) => {
      card.style.setProperty("--world-seq", `${(index * 0.22).toFixed(2)}s`);
      card.style.setProperty("--world-wave-delay", `${index * 80}ms`);
      card.addEventListener("pointerdown", () => {
        pulseWorldCard(card, 520);
      });
      card.addEventListener("focusin", () => {
        pulseWorldCard(card, 560);
      });
    });

    const triggerWorldWave = () => {
      homeWorldsSection.classList.remove("is-cosmic-wave");
      void homeWorldsSection.offsetWidth;
      homeWorldsSection.classList.add("is-cosmic-wave");
      window.clearTimeout(waveTimer);
      waveTimer = window.setTimeout(() => {
        homeWorldsSection.classList.remove("is-cosmic-wave");
      }, 1700);
    };

    const worldsFlowObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== homeWorldsSection) {
            return;
          }
          const isLive = entry.isIntersecting && entry.intersectionRatio >= 0.28;
          homeWorldsSection.classList.toggle("is-cosmic-live", isLive);
          if (isLive) {
            triggerWorldWave();
          } else {
            homeWorldsSection.classList.remove("is-cosmic-wave");
          }
        });
      },
      { threshold: [0.28, 0.52] }
    );
    worldsFlowObserver.observe(homeWorldsSection);
  }

  const heroRightPanel = document.querySelector(".hero-right");
  if (heroRightPanel && !shouldUseLiteInteractiveEffects) {
    let pulseTimer = 0;
    let pointerRaf = 0;
    let pointerX = 50;
    let pointerY = 50;
    heroRightPanel.classList.remove("is-engaged", "is-boosted");

    const applyPointerGlow = () => {
      pointerRaf = 0;
      heroRightPanel.style.setProperty("--orbit-focus-x", `${pointerX.toFixed(2)}%`);
      heroRightPanel.style.setProperty("--orbit-focus-y", `${pointerY.toFixed(2)}%`);
    };

    const queuePointerGlow = (event) => {
      const bounds = heroRightPanel.getBoundingClientRect();
      if (!bounds.width || !bounds.height) {
        return;
      }
      const localX = ((event.clientX - bounds.left) / bounds.width) * 100;
      const localY = ((event.clientY - bounds.top) / bounds.height) * 100;
      pointerX = Math.max(0, Math.min(100, localX));
      pointerY = Math.max(0, Math.min(100, localY));
      if (!pointerRaf) {
        pointerRaf = window.requestAnimationFrame(applyPointerGlow);
      }
    };

    const triggerOrbitPulse = (durationMs = 560) => {
      heroRightPanel.classList.remove("is-orbit-pulse");
      void heroRightPanel.offsetWidth;
      heroRightPanel.classList.add("is-orbit-pulse");
      window.clearTimeout(pulseTimer);
      pulseTimer = window.setTimeout(() => {
        heroRightPanel.classList.remove("is-orbit-pulse");
      }, durationMs);
    };

    heroRightPanel.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") {
        return;
      }
      heroRightPanel.classList.add("is-orbit-focused");
      queuePointerGlow(event);
    });
    heroRightPanel.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") {
        return;
      }
      if (!heroRightPanel.classList.contains("is-orbit-focused")) {
        return;
      }
      queuePointerGlow(event);
    });
    heroRightPanel.addEventListener("pointerleave", () => {
      heroRightPanel.classList.remove("is-orbit-focused");
      heroRightPanel.style.removeProperty("--orbit-focus-x");
      heroRightPanel.style.removeProperty("--orbit-focus-y");
    });
    heroRightPanel.addEventListener("pointerdown", () => {
      triggerOrbitPulse(620);
    });
    if (startVoyageButton) {
      startVoyageButton.addEventListener("pointerenter", (event) => {
        if (event.pointerType !== "mouse") {
          return;
        }
        triggerOrbitPulse(520);
      });
    }
  }

  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (!navLinks.length) {
    return;
  }

  const sectionHashes = ["#home", "#how", "#worlds", "#guide", "#join", "#support", "#policies"];
  const trackedSections = sectionHashes
    .map((hash) => ({ hash, section: document.querySelector(hash) }))
    .filter((entry) => entry.section);
  if (!trackedSections.length) {
    return;
  }

  let activeHash = "";
  let navSpyRaf = 0;

  const setActiveNav = (hash) => {
    if (!hash || hash === activeHash) {
      return;
    }
    activeHash = hash;
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === hash;
      link.classList.toggle("is-current", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const resolveClosestSectionHash = () => {
    if (!trackedSections.length) {
      return "";
    }
    if (window.scrollY <= 12) {
      return "#home";
    }
    const nearPageBottom =
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 16;
    if (nearPageBottom) {
      return trackedSections[trackedSections.length - 1].hash;
    }
    const navElement = document.querySelector("header.nav, .nav");
    const navBottomY =
      navElement instanceof HTMLElement
        ? window.scrollY + navElement.getBoundingClientRect().bottom
        : window.scrollY;
    const triggerY = navBottomY + 22;
    let winner = trackedSections[0].hash;
    trackedSections.forEach(({ hash, section }) => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      if (sectionTop <= triggerY) {
        winner = hash;
      }
    });
    const remainingScroll =
      document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
    if (remainingScroll <= window.innerHeight * 0.85) {
      const lateViewportTriggerY = window.scrollY + window.innerHeight - 120;
      trackedSections.forEach(({ hash, section }) => {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        if (sectionTop <= lateViewportTriggerY) {
          winner = hash;
        }
      });
    }
    return winner;
  };

  const scheduleNavSpyUpdate = () => {
    if (navSpyRaf) {
      return;
    }
    navSpyRaf = window.requestAnimationFrame(() => {
      navSpyRaf = 0;
      setActiveNav(resolveClosestSectionHash());
    });
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveNav(link.getAttribute("href") || "");
    });
  });

  window.addEventListener("scroll", scheduleNavSpyUpdate, { passive: true });
  window.addEventListener("resize", scheduleNavSpyUpdate, { passive: true });
  scheduleNavSpyUpdate();
};

const setupBackToTopButton = () => {
  const existing = document.getElementById("backToTopButton");
  if (existing) {
    return existing;
  }

  const button = document.createElement("button");
  button.id = "backToTopButton";
  button.className = "scroll-top-btn";
  button.type = "button";
  button.setAttribute("aria-label", "Scroll to top");
  button.innerHTML = "&#8593;";

  const updateVisibility = () => {
    const threshold = window.matchMedia("(max-width: 720px)").matches ? 80 : 300;
    if (window.scrollY > threshold) {
      button.classList.add("is-visible");
    } else {
      button.classList.remove("is-visible");
    }
  };

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", updateVisibility, { passive: true });
  window.addEventListener("resize", updateVisibility, { passive: true });
  updateVisibility();

  document.body.appendChild(button);
  return button;
};

const syncRuntimeNavHeightVar = () => {
  const nav = document.querySelector("header.nav, .nav");
  if (!(nav instanceof HTMLElement) || !document.documentElement) {
    return;
  }
  const navHeight = Math.max(0, Math.ceil(nav.getBoundingClientRect().height || 0));
  if (!navHeight) {
    return;
  }
  document.documentElement.style.setProperty("--runtime-nav-height", `${navHeight}px`);
};

const COOKIE_NOTICE_DISMISSED_KEY = "cosmicaEssentialCookieNoticeDismissed";

const setupEssentialCookieNotice = () => {
  if (!document.body || document.body.dataset.cookieNoticeBound === "1") {
    return;
  }
  document.body.dataset.cookieNoticeBound = "1";
  if (document.getElementById("cookieNotice")) {
    return;
  }
  let dismissed = false;
  try {
    dismissed = localStorage.getItem(COOKIE_NOTICE_DISMISSED_KEY) === "1";
  } catch {}
  if (dismissed) {
    return;
  }

  const notice = document.createElement("aside");
  notice.id = "cookieNotice";
  notice.className = "cookie-notice";
  notice.setAttribute("role", "region");
  notice.setAttribute("aria-label", "Cookie notice");
  notice.innerHTML = `
    <p>
      <strong>Essential cookies only.</strong>
      We use secure cookies to keep you signed in and protect your account.
      No ads or tracking cookies are used.
      <a href="/privacy.html">Privacy Policy</a>
    </p>
    <button type="button" class="cookie-notice-dismiss" aria-label="Dismiss cookie notice">OK</button>
  `;

  const dismissButton = notice.querySelector(".cookie-notice-dismiss");
  const dismissNotice = () => {
    try {
      localStorage.setItem(COOKIE_NOTICE_DISMISSED_KEY, "1");
    } catch {}
    notice.classList.remove("is-visible");
    window.setTimeout(() => {
      if (notice.parentElement) {
        notice.remove();
      }
    }, 200);
  };

  dismissButton?.addEventListener("click", dismissNotice);
  document.body.appendChild(notice);
  window.requestAnimationFrame(() => {
    notice.classList.add("is-visible");
  });
};

const loadMapsBundle = () =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-cosmica-bundle="maps"]');
    if (existing) {
      if (existing.dataset.loaded === "1") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load maps/app-maps.js")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = withAssetVersion("maps/app-maps.js");
    script.async = false;
    script.defer = false;
    try {
      script.fetchPriority = "high";
    } catch {}
    script.dataset.cosmicaBundle = "maps";
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "1";
        resolve();
      },
      { once: true }
    );
    script.addEventListener(
      "error",
      () => reject(new Error("Failed to load maps/app-maps.js")),
      { once: true }
    );
    document.head.appendChild(script);
  });

const initializeCommonShell = () => {
  setupAccountHub();
  document.querySelectorAll(".reveal").forEach((el) => observeRevealElement(el));
  setupHomeAltInteractivity();
  void setupLettersTitleTranslation();
  void setupLettersHelperTranslation();
  setupLettersSectionCompleteButton();
  setupLettersCardPracticeButtons();
  setupLetterRomanization();
  setupSpeechCards();
  setupBackToTopButton();
  syncRuntimeNavHeightVar();
  window.addEventListener("resize", syncRuntimeNavHeightVar, { passive: true });
  window.addEventListener("orientationchange", syncRuntimeNavHeightVar, { passive: true });
  setupEssentialCookieNotice();
};

/* ==========================================================================
   APPLICATION BOOTSTRAP (BASE)
   Non-map pages run from app.js directly.
   Map pages lazy-load maps/app-maps.js to keep the base bundle small.
   ========================================================================== */
if (needsMapTranslations) {
  loadMapsBundle().catch((error) => {
    console.warn(error.message || error);
  });
} else {
  initializeCommonShell();
}

setupWebVitalsReporting();



