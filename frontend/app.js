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
  const nativeSet = WORLD_MAP_TITLE_TRANSLATIONS[WORLD_KEY] || WORLD_MAP_TITLE_TRANSLATIONS.english;
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
    mainNode.textContent = MAP_TITLE_ENGLISH[mapType] || mainNode.textContent;
    const nativeTitle = String(nativeSet?.[mapType] || "").trim();
    translationNode.textContent = nativeTitle;
    translationNode.hidden = !nativeTitle;
    translationNode.setAttribute("dir", "auto");
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
  try {
    // Keep map cache normalized to the base English->base-language table.
    const response = await fetch(BASE_MAP_TRANSLATION_FILE, { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const payload = await response.json();
    writeMapTranslationsCache(payload);
  } catch {}
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

setScrollbarWidth();
window.addEventListener("resize", setScrollbarWidth);

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
    const baseLanguage = String(payload?.data?.settings?.baseLanguage || "")
      .trim()
      .toLowerCase();
    if (!baseLanguage) {
      return;
    }
    try {
      localStorage.setItem("cosmicaBaseLanguage", baseLanguage);
    } catch {}
  };

  return {
    signUp: async ({ email, password, displayName = "", baseLanguage = "" } = {}) => {
      const payload = await request("/api/auth/signup", {
        method: "POST",
        body: { email, password, displayName, baseLanguage },
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
    deleteAccount: ({ password } = {}) =>
      request("/api/auth/account", {
        method: "DELETE",
        body: { password },
      }),
    getAccountData: () => requestOrNullOnUnauthorized("/api/account/data"),
    setAccountData: (data) =>
      request("/api/account/data", {
        method: "PUT",
        body: { data },
      }),
    getProgress: () => requestOrNullOnUnauthorized("/api/progress"),
    setProgress: (progress) =>
      request("/api/progress", {
        method: "PUT",
        body: { progress },
      }),
    trackProgress: ({ worldKey, mapKey, sectionKey, status, score, xpDelta } = {}) =>
      request("/api/progress/track", {
        method: "POST",
        body: { worldKey, mapKey, sectionKey, status, score, xpDelta },
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
      nextData.settings.baseLanguage = String(baseLanguage || "").trim().toLowerCase();
      return request("/api/account/data", {
        method: "PUT",
        body: { data: nextData },
      });
    },
  };
};

window.cosmicaAuth = createCosmicaAuthClient();

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
const MIMI_CHAT_HISTORY_KEY = "cosmicaMimiChatHistory:v1";
const MIMI_CHAT_STORAGE_SCHEMA_KEY = "cosmicaMimiChatSchema";
const MIMI_CHAT_STORAGE_SCHEMA_VERSION = "v2";
let defaultMimiPrompt = "";

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
    const raw =
      sessionStorage.getItem(MIMI_CHAT_HISTORY_KEY) ||
      localStorage.getItem(MIMI_CHAT_HISTORY_KEY);
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
  } catch {}
};

const persistChatHistoryToStorage = () => {
  try {
    const payload = chatHistory.slice(-Math.max(0, MIMI_CONFIG.historyLimit || 0));
    const serialized = JSON.stringify(payload);
    sessionStorage.setItem(MIMI_CHAT_HISTORY_KEY, serialized);
    localStorage.setItem(MIMI_CHAT_HISTORY_KEY, serialized);
  } catch {}
};

const clearChatHistoryFromStorage = () => {
  try {
    sessionStorage.removeItem(MIMI_CHAT_HISTORY_KEY);
    localStorage.removeItem(MIMI_CHAT_HISTORY_KEY);
  } catch {}
};

const ensureMimiChatStorageSchema = () => {
  try {
    const current = localStorage.getItem(MIMI_CHAT_STORAGE_SCHEMA_KEY);
    if (current === MIMI_CHAT_STORAGE_SCHEMA_VERSION) {
      return;
    }
    clearChatHistoryFromStorage();
    localStorage.setItem(
      MIMI_CHAT_STORAGE_SCHEMA_KEY,
      MIMI_CHAT_STORAGE_SCHEMA_VERSION
    );
  } catch {}
};

ensureMimiChatStorageSchema();
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
  chatLog.classList.toggle("has-messages", hasMessages);
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

const resetMimiConversationState = ({ resetPromptText = false } = {}) => {
  chatHistory.length = 0;
  userHasMessagedMimi = false;
  lastMimiReply = "";
  clearChatHistoryFromStorage();
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
  const selectedBaseLanguage = String(
    localStorage.getItem("cosmicaBaseLanguage") || ""
  )
    .trim()
    .toLowerCase();
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

  const selectedBaseLanguage = String(
    localStorage.getItem("cosmicaBaseLanguage") || ""
  )
    .trim()
    .toLowerCase();
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

const LETTER_ROMANIZATION_MAP = Object.freeze({
  korean: Object.freeze({
    ㄱ: "g/k",
    ㄴ: "n",
    ㄷ: "d/t",
    ㄹ: "r/l",
    ㅁ: "m",
    ㅂ: "b/p",
    ㅅ: "s",
    ㅇ: "ng (silent initial)",
    ㅈ: "j",
    ㅊ: "ch",
    ㅋ: "k",
    ㅌ: "t",
    ㅍ: "p",
    ㅎ: "h",
    ㅏ: "a",
    ㅑ: "ya",
    ㅓ: "eo",
    ㅕ: "yeo",
    ㅗ: "o",
    ㅛ: "yo",
    ㅜ: "u",
    ㅠ: "yu",
    ㅡ: "eu",
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
    地: "dì",
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
    を: "wo",
    ん: "n",
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
  hindi: Object.freeze({
    अ: "a",
    आ: "ā",
    इ: "i",
    ई: "ī",
    उ: "u",
    ऊ: "ū",
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
  }),
});

const setupLetterRomanization = () => {
  if (!document.body.classList.contains("letters-page")) {
    return;
  }
  const worldMap = LETTER_ROMANIZATION_MAP[WORLD_KEY];
  if (!worldMap) {
    return;
  }
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

if (chatForm) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
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
});
document.querySelectorAll(".reveal").forEach((el) => {
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
    const starCount = prefersReducedMotion ? 10 : 26;
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
      for (let i = 0; i < 18; i += 1) {
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
      for (let i = 0; i < 4; i += 1) {
        const comet = document.createElement("span");
        comet.className = "world-fx-comet";
        comet.style.setProperty("--c-top", `${(8 + Math.random() * 56).toFixed(2)}%`);
        comet.style.setProperty("--c-size", `${(78 + Math.random() * 44).toFixed(2)}px`);
        comet.style.setProperty("--c-delay", `${(Math.random() * 8).toFixed(2)}s`);
        comet.style.setProperty("--c-duration", `${(5.2 + Math.random() * 3.8).toFixed(2)}s`);
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
  const animateAmbient = (timestamp) => {
    ambientRafId = window.requestAnimationFrame(animateAmbient);
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
  if (!prefersReducedMotion) {
    ambientRafId = window.requestAnimationFrame(animateAmbient);
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      setPointerTargetFromPoint(event.clientX, event.clientY);
    },
    { passive: true }
  );
  window.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches?.[0];
      if (!touch) {
        return;
      }
      setPointerTargetFromPoint(touch.clientX, touch.clientY);
    },
    { passive: true }
  );
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
  if (!audioContext || !orchestra) {
    intensityRaf = window.requestAnimationFrame(updateIntensity);
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
  default: 92,
  "#how": 110,
  "#worlds": 126,
  "#guide": 158,
  "#join": 169,
  "#support": 220,
});
const getMobileHomeAnchorDownShift = (hash) =>
  MOBILE_HOME_ANCHOR_DOWN_SHIFT[hash] ?? MOBILE_HOME_ANCHOR_DOWN_SHIFT.default;
const DESKTOP_HOME_ANCHOR_DOWN_SHIFT = Object.freeze({
  "#guide": 64,
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
  window.matchMedia("(pointer: fine) and (min-width: 961px)").matches;
let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;

if (hero && !prefersReducedMotion) {
  hero.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    hero.style.transform = `translate3d(${x * 10}px, ${y * 10}px, 0)`;
  });

  hero.addEventListener("mouseleave", () => {
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

const updateGaze = (event) => {
  if (!alien || !alienHead) {
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

if (!prefersReducedMotion && alien && alienHead) {
  window.addEventListener("mousemove", updateGaze);
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
const applyMapComingSoonRules = () => {
  if (!document.body.classList.contains("world-page")) {
    return;
  }

  const grammarCard = document.querySelector(".map-card.map-grammar");
  if (!grammarCard) {
    return;
  }

  const forceComingSoon = grammarCard.dataset.forceComingSoon === "true";
  if (!forceComingSoon) {
    grammarCard.classList.remove("coming-soon");
    grammarCard.classList.add("map-link");
    grammarCard.dataset.comingSoon = "false";
    grammarCard.removeAttribute("aria-disabled");
    grammarCard.removeAttribute("title");
    const originalHref =
      grammarCard.getAttribute("href") || grammarCard.dataset.originalHref || "";
    if (originalHref) {
      grammarCard.setAttribute("href", originalHref);
      grammarCard.dataset.originalHref = originalHref;
    }
    grammarCard.querySelector(".coming-soon-badge")?.remove();
    return;
  }

  const currentHref = grammarCard.getAttribute("href");
  if (currentHref) {
    grammarCard.dataset.originalHref = currentHref;
  }

  grammarCard.classList.add("coming-soon");
  grammarCard.classList.remove("map-link");
  grammarCard.dataset.comingSoon = "true";
  grammarCard.setAttribute("aria-disabled", "true");
  grammarCard.setAttribute("title", "Coming soon");
  grammarCard.removeAttribute("href");

  if (!grammarCard.querySelector(".coming-soon-badge")) {
    const badge = document.createElement("span");
    badge.className = "coming-soon-badge";
    badge.textContent = "Coming soon";
    grammarCard.appendChild(badge);
  }
};

applyMapComingSoonRules();

const mapLinks = document.querySelectorAll(".map-link");
const navigateToMapLink = (href) => {
  if (!href) {
    return;
  }
  const baseLanguage = localStorage.getItem("cosmicaBaseLanguage") || "";
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
  const storedLanguageRaw = normalizeLanguageLabel(
    localStorage.getItem("cosmicaBaseLanguage")
  ).toLowerCase();
  const storedLanguage = storedLanguageRaw === WORLD_KEY ? "" : storedLanguageRaw;
  if (storedLanguageRaw === WORLD_KEY) {
    localStorage.removeItem("cosmicaBaseLanguage");
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
    const selected = normalizeLanguageLabel(selectedLanguage).toLowerCase();
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
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (isRecentSpeechActivation(card)) {
            return;
          }
          markSpeechActivation(card);
          playSpeech(card.dataset[datasetKey], { rate, pitch });
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

      if (!prefersReducedMotion) {
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
    const cometCount = prefersReducedMotion ? 2 : 4;
    for (let i = 0; i < cometCount; i += 1) {
      const comet = document.createElement("span");
      comet.className = "home-fx-comet";
      comet.style.setProperty("--c-top", `${(8 + Math.random() * 56).toFixed(2)}%`);
      comet.style.setProperty("--c-size", `${(78 + Math.random() * 44).toFixed(2)}px`);
      comet.style.setProperty("--c-delay", `${(Math.random() * 8).toFixed(2)}s`);
      comet.style.setProperty("--c-duration", `${(5.2 + Math.random() * 3.8).toFixed(2)}s`);
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
  if (homeWorldsSection && !prefersReducedMotion) {
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
  if (heroRightPanel && !prefersReducedMotion) {
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

  const sectionHashes = ["#home", "#how", "#worlds", "#guide", "#join", "#support"];
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
    const focalY = window.scrollY + window.innerHeight * 0.36;
    let winner = trackedSections[0].hash;
    let minDistance = Number.POSITIVE_INFINITY;
    trackedSections.forEach(({ hash, section }) => {
      const distance = Math.abs(section.offsetTop - focalY);
      if (distance < minDistance) {
        minDistance = distance;
        winner = hash;
      }
    });
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
  document.querySelectorAll(".reveal").forEach((el) => observeRevealElement(el));
  setupHomeAltInteractivity();
  void setupLettersTitleTranslation();
  void setupLettersHelperTranslation();
  setupLetterRomanization();
  setupSpeechCards();
  setupBackToTopButton();
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



