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
const chatChips = document.querySelectorAll(".chat-chip");
const alien = document.getElementById("alien");
const mouthPath = document.getElementById("mouthPath");
const alienHead = alien ? alien.querySelector(".alien-head") : null;
const warpOverlay = document.getElementById("warpOverlay");
const warpText = document.getElementById("warpText");
const worldCards = document.querySelectorAll(".world-card");
const urlParams = new URLSearchParams(window.location.search);
const currentPath = window.location.pathname.toLowerCase();
const isWorldLandingPage = currentPath.endsWith("/world.html");
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
/* ==========================================================================
   WORLD CONTEXT
   Resolve active world from URL/body and select world-specific translation packs.
   ========================================================================== */
const WORLD_NAME = isWorldLandingPage
  ? document.body.dataset.world || "English"
  : urlParams.get("world") || document.body.dataset.world || "English";
const WORLD_KEY = WORLD_NAME.toLowerCase();
const WORLD_TRANSLATION_FILE = "translations.json";
const MAP_TRANSLATIONS_CACHE_KEY = "cosmicaMapTranslationsCache:v1";
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
    const response = await fetch(WORLD_TRANSLATION_FILE, { cache: "force-cache" });
    if (!response.ok) {
      return;
    }
    const payload = await response.json();
    writeMapTranslationsCache(payload);
  } catch {}
};

const preloadMapsBundleAsset = () => {
  if (!needsMapTranslations) {
    return;
  }
  const href = withAssetVersion("app-maps.js");
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
  timeoutMs: 8000,
  historyLimit: 10,
};
const MIMI_SITE_CONTEXT = [
  "Cosmica is a space-universe language learning site where each language is a world.",
  "Worlds available now: English.",
  "User actions: click a world to trigger a warp transition that says 'Entering {World} World'.",
  "Tone: cinematic, exploratory, playful, focused on discovery and learning by missions.",
  "Mimi can suggest worlds, give short quests, and teach greetings.",
  "Planned expansions: more worlds, quest campaigns, voice practice, daily missions, badges, and deeper world lore.",
].join(" ");
const MIMI_SYSTEM_PROMPT = [
  "You are Mimi, the alien guide for the Cosmica language academy.",
  "Keep replies concise and helpful (1-3 sentences).",
  "Maintain a cosmic discovery vibe without sounding overly emotional.",
  "Ask for the user's target language, goal, and time available when needed.",
  "Give one concrete next step (a quick quest, a phrase to practice, or a world to enter).",
  "If asked about features beyond the current site, call them planned or upcoming.",
  "Never claim to access user data or progress.",
  MIMI_SITE_CONTEXT,
].join(" ");
const worldLines = {
  English: "English world online. Neon cities are ready for your hello.",
  Dutch: "Dutch world steady. Quick missions and clear sounds ahead.",
  Swedish: "Swedish world glowing. Breathe with the aurora and speak.",
  Korean: "Korean world pulsing. Follow the beat of the script.",
  Arabic: "Arabic world shimmering. Let calligraphy guide your voice.",
  Spanish: "Spanish world alive. Follow the rhythm and bright story trails.",
  German: "German world precise. Clear routes and strong signals ahead.",
  Japanese: "Japanese world serene. Lantern paths and gentle honor cues.",
  Chinese: "Chinese world radiant. Trace calligraphy rivers of light.",
  Portuguese: "Portuguese world tidal. Sail the melody routes together.",
  Hindi: "Hindi world festive. Follow the cadence through starlit arcs.",
};

const worldPages = {
  English: "world.html",
};

/* ==========================================================================
   NAVIGATION PREFETCH
   Warms likely next pages on capable networks/devices for smoother transitions.
   ========================================================================== */
const CAN_PREFETCH_NAVIGATION = !prefersReducedData && !isSlowNetwork;
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
  if (!CAN_PREFETCH_NAVIGATION) {
    return;
  }
  const warmRoutes = [
    "/",
    "/world.html",
    "/letters.html",
    "/words.html",
    "/phrases.html",
    "/grammar.html",
  ];
  const runPrefetch = () => {
    warmRoutes.forEach((route) => prefetchDocument(route));
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
const chatHistory = [];
let chatRequestInFlight = false;

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
  window.clearTimeout(typingTimer);
  window.clearTimeout(speakingTimer);
  speechBubble.classList.add("speaking");
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

const appendChatMessage = (role, text, options = {}) => {
  if (!chatLog) {
    return null;
  }
  const existingTyping = chatLog.querySelector('.chat-message.typing[data-role="mimi"]');
  if (role === "mimi" && options.typing) {
    if (existingTyping) {
      chatLog.classList.add("typing");
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
    scrollChatToBottom();
    return typingMessage;
  }
  if (existingTyping) {
    existingTyping.remove();
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
  scrollChatToBottom();
  return message;
};

const setChatStatus = (text) => {
  if (!chatStatus) {
    return;
  }
  const statusText = chatStatus.querySelector(".chat-status-text");
  if (statusText) {
    statusText.textContent = text;
  }
};

const getApiEndpoint = () => {
  const endpoint = MIMI_CONFIG.endpoint || "/api/chat";
  if (endpoint.startsWith("http")) {
    return endpoint;
  }
  const { protocol, hostname, port } = window.location;
  if (!hostname || protocol === "file:") {
    return `http://localhost:3000${endpoint}`;
  }
  if ((hostname === "localhost" || hostname === "127.0.0.1") && port && port !== "3000") {
    return `http://${hostname}:3000${endpoint}`;
  }
  return endpoint;
};

const buildChatMessages = (message) => {
  return [
    { role: "system", content: MIMI_SYSTEM_PROMPT },
    { role: "user", content: message },
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

  const endpoint = getApiEndpoint();
  const requestChatReply = async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), MIMI_CONFIG.timeoutMs);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: buildChatMessages(message) }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Chat request failed (${response.status})`);
      }

      const data = await response.json();
      if (data && typeof data.content === "string" && data.content.trim()) {
        return data.content.trim();
      }

      throw new Error("Empty response");
    } finally {
      window.clearTimeout(timeout);
    }
  };

  try {
    const content = await requestChatReply();
    return { content, source: "api" };
  } catch (firstError) {
    if (navigator.onLine) {
      try {
        await new Promise((resolve) => window.setTimeout(resolve, 180));
        const content = await requestChatReply();
        return { content, source: "api" };
      } catch (secondError) {
        console.warn("Mimi API retry failed, falling back to preset reply.", secondError);
      }
    } else {
      console.warn("Mimi API unavailable while offline, falling back to preset reply.", firstError);
    }
    return { content: getPresetReply(message), source: "preset" };
  }
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
  chatRequestInFlight = true;
  chatInput.disabled = true;
  try {
    appendChatMessage("user", text);
    chatHistory.push({ role: "user", content: text });
    if (chatHistory.length > MIMI_CONFIG.historyLimit) {
      chatHistory.splice(0, chatHistory.length - MIMI_CONFIG.historyLimit);
    }
    if (!message) {
      chatInput.value = "";
    }

    appendChatMessage("mimi", "", { typing: true });
    setChatStatus("Mimi is charting a reply");
    const reply = await getMimiReply(text);
    appendChatMessage("mimi", "", { typing: false });
    appendChatMessage("mimi", reply.content);
    chatHistory.push({ role: "assistant", content: reply.content });
    if (chatHistory.length > MIMI_CONFIG.historyLimit) {
      chatHistory.splice(0, chatHistory.length - MIMI_CONFIG.historyLimit);
    }
    if (reply.source === "api") {
      setChatStatus("AI live");
    } else {
      setChatStatus("Mimi ready");
    }
    speakLine(reply.content, "curious");
  } finally {
    chatRequestInFlight = false;
    chatInput.disabled = false;
    chatInput.focus();
  }
};

if (chatForm) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendChatMessage();
  });
}

chatChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const prompt = chip.dataset.prompt || chip.textContent || "";
    sendChatMessage(prompt);
  });
});

if (chatLog) {
  chatLog.innerHTML = "";
}

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

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      } else {
        entry.target.classList.remove("is-visible");
      }
    });
  },
  { threshold: 0.18 }
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
  el.classList.add("reveal");
});
document.querySelectorAll(".reveal").forEach((el) => {
  observeRevealElement(el);
});

let setActiveWorldSection = null;
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
    startLessonLink.addEventListener("click", () => {
      languageForceShow = true;
      languageUserActivated = true;
      if (document.body.classList.contains("world-page")) {
        document.body.classList.add("hide-maps");
      }
      window.requestAnimationFrame(() => {
        languageSection.classList.add("is-visible");
        if (document.body.classList.contains("world-page")) {
          document.body.classList.add("show-language");
        }
        updateMapsTitleVisibility();
        if (setActiveWorldSection) {
          setActiveWorldSection("language");
        }
      });
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
    setActiveWorldSection = (id) => {
      if (!id || activeSectionId === id) {
        updateMapsTitleVisibility();
        return;
      }
      activeSectionId = id;
      worldSections.forEach((section) => {
        const isActive = section.id === id;
        section.classList.toggle("is-visible", isActive);
        section.setAttribute("aria-hidden", isActive ? "false" : "true");
      });
      if (id === "language") {
        document.body.classList.add("show-language");
      } else {
        document.body.classList.remove("show-language");
      }
      updateMapsTitleVisibility();
    };
    const handleWorldScroll = () => {
      const closest = getClosestSection();
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
  const mimiLine = speechText.dataset.text || speechText.textContent.trim();
  if (mimiLine) {
    speechText.dataset.text = mimiLine;
    speechText.textContent = "";
    let mimiTypingArmed = true;
    const mimiObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (mimiTypingArmed) {
              speakLine(mimiLine, "happy");
              mimiTypingArmed = false;
            }
          } else {
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

const MOBILE_HOME_ANCHOR_DOWN_SHIFT = Object.freeze({
  default: 64,
  "#worlds": 80,
  "#guide": 112,
  "#join": 144,
  "#support": 176,
});
const getMobileHomeAnchorDownShift = (hash) =>
  MOBILE_HOME_ANCHOR_DOWN_SHIFT[hash] ?? MOBILE_HOME_ANCHOR_DOWN_SHIFT.default;

const scrollToAnchor = (hash) => {
    const targetId = hash.slice(1);
    const target = document.getElementById(targetId);
    if (!target) {
      return false;
    }
    const isHomeMobile = !document.body.classList.contains("world-page")
      && window.matchMedia("(max-width: 960px)").matches;
    const mobileDownShift = isHomeMobile ? getMobileHomeAnchorDownShift(hash) : 0;
    const baseOffset =
      Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
    const top = hash === "#home"
      ? 0
      : target.getBoundingClientRect().top
        + window.scrollY
        - baseOffset
        + mobileDownShift;
    history.replaceState(null, "", `${baseUrl}${hash}`);
    window.scrollTo({ top, behavior: "smooth" });
    return true;
};

  if (talkButton) {
    talkButton.addEventListener("click", () => {
      const guideSection = document.getElementById("guide");
    const guideTitle = guideSection ? guideSection.querySelector("h2") : null;
    const chatPanel = document.getElementById("mimiChat");
    if (guideSection && guideTitle && chatPanel) {
      const top = guideTitle.getBoundingClientRect().top + window.scrollY;
      const bottom = chatPanel.getBoundingClientRect().bottom + window.scrollY;
      const midpoint = (top + bottom) / 2 - window.innerHeight / 2;
      const clamped = Math.max(0, midpoint);
      window.scrollTo({ top: clamped, behavior: "smooth" });
      return;
    }
    if (guideSection) {
      guideSection.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (chatPanel) {
      chatPanel.scrollIntoView({ behavior: "smooth", block: "center" });
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
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 12000);
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: joinName.value.trim(),
          email: joinEmail.value.trim(),
          message: joinFeedback.value.trim(),
        }),
        signal: controller.signal,
      }).finally(() => window.clearTimeout(timeoutId));

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to send feedback.");
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
  const deadline = window.setTimeout(finalize, 350);
  Promise.resolve(warmMapTranslationsCache())
    .catch(() => {})
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

const languagePills = document.querySelectorAll(".language-pill");
if (languagePills.length) {
  const mapsSection = document.querySelector("#maps");
  const storedLanguage = localStorage.getItem("cosmicaBaseLanguage");
  if (storedLanguage) {
    languagePills.forEach((pill) => {
      const key = pill.textContent.trim().toLowerCase();
      if (key === storedLanguage) {
        pill.classList.add("is-selected");
      }
    });
  }
  const selectLanguagePill = (pill) => {
    if (!pill) {
      return;
    }
    languagePills.forEach((btn) => btn.classList.remove("is-selected"));
    pill.classList.add("is-selected");
    const selected = pill.textContent.trim().toLowerCase();
    if (selected) {
      localStorage.setItem("cosmicaBaseLanguage", selected);
      void warmMapTranslationsCache();
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
      const y = targetTop - offset;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }
    if (setActiveWorldSection) {
      setActiveWorldSection("maps");
    }
  };
  languagePills.forEach((pill) => {
    pill.addEventListener("pointerup", (event) => {
      if (event.pointerType !== "touch") {
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

  void warmMapTranslationsCache();
}

const languageSearch = document.getElementById("languageSearch");
if (languageSearch && languagePills.length) {
  const applyLanguageFirstLetterFilter = () => {
    const query = languageSearch.value.trim().toLowerCase();
    if (!query) {
      languagePills.forEach((pill) => {
        pill.style.display = "";
      });
      return;
    }
    const isSingleLetter = query.length === 1;
    const firstLetter = query[0];
    languagePills.forEach((pill) => {
      const name = pill.textContent.trim().toLowerCase();
      const matches = isSingleLetter
        ? name.startsWith(firstLetter)
        : name.includes(query);
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

  if (!hasSpeechCards || !("speechSynthesis" in window)) {
    return;
  }

  let availableVoices = [];
  let selectedVoice = null;

  const FEMALE_HINT =
    /female|woman|girl|samantha|karen|moira|ava|allison|serena|zira|jenny|aria|joanna|emma|lily|lucy|zoe|google uk english female|google us english female|microsoft aria|microsoft jenny/i;
  const MALE_HINT =
    /male|man|david|mark|alex|george|fred|daniel|ryan|tom|google uk english male|microsoft david/i;
  const LOW_QUALITY_HINT =
    /espeak|festival|compact|robot|offline|basic|legacy/i;
  const HIGH_QUALITY_HINT =
    /neural|natural|premium|enhanced|wavenet|online|studio/i;
  const IOS_FEMALE_HINT = /samantha|karen|moira|ava|allison|serena/i;
  const ANDROID_FEMALE_HINT =
    /google.*female|wavenet.*(f|a)|neural2.*(f|a)|en-us-studio-o|en-gb-studio-a/i;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent || "");

  const pickVoice = () => {
    if (!availableVoices.length) {
      return null;
    }
    const voiceScore = (voice) => {
      const name = (voice.name || "").toLowerCase();
      const lang = (voice.lang || "").toLowerCase();
      let score = 0;
      if (lang.startsWith("en-us")) {
        score += 8;
      }
      if (lang.startsWith("en-gb")) {
        score += 7;
      }
      if (lang.startsWith("en")) {
        score += 3;
      }
      if (voice.default) {
        score += 2;
      }
      if (FEMALE_HINT.test(name)) {
        score += 14;
      }
      if (HIGH_QUALITY_HINT.test(name)) {
        score += 6;
      }
      if (isIOS && IOS_FEMALE_HINT.test(name)) {
        score += 10;
      }
      if (!isIOS && ANDROID_FEMALE_HINT.test(name)) {
        score += 8;
      }
      if (MALE_HINT.test(name)) {
        score -= 9;
      }
      if (LOW_QUALITY_HINT.test(name)) {
        score -= 12;
      }
      return score;
    };

    const pickFrom = (voices) =>
      [...voices].sort((a, b) => voiceScore(b) - voiceScore(a))[0] || null;

    const englishVoices = availableVoices.filter((voice) =>
      (voice.lang || "").toLowerCase().startsWith("en")
    );
    const preferredEnglishVoices = englishVoices.filter((voice) =>
      FEMALE_HINT.test(voice.name || "") || HIGH_QUALITY_HINT.test(voice.name || "")
    );
    return (
      pickFrom(preferredEnglishVoices) ||
      pickFrom(englishVoices) ||
      pickFrom(availableVoices)
    );
  };

  const loadVoices = () => {
    availableVoices = window.speechSynthesis.getVoices();
    selectedVoice = pickVoice();
  };
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;

  const playSpeech = (text, { rate = 0.92, pitch = 1.12 } = {}) => {
    if (!text) {
      return;
    }
    if (!selectedVoice) {
      loadVoices();
      selectedVoice = pickVoice();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedVoice?.lang || "en-US";
    utterance.rate = rate;
    utterance.pitch = pitch;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    window.speechSynthesis.cancel();
    window.setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 60);
  };

  const setupCards = (cards, labelSelector, datasetKey, ariaPrefix, rate, pitch) => {
    cards.forEach((card) => {
      const label = card.querySelector(labelSelector);
      if (label && !card.dataset[datasetKey]) {
        card.dataset[datasetKey] = label.textContent.trim();
      }
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      if (card.dataset[datasetKey]) {
        card.setAttribute("aria-label", `${ariaPrefix} ${card.dataset[datasetKey]}`);
      }
      card.addEventListener("pointerup", (event) => {
        if (event.pointerType !== "touch") {
          return;
        }
        event.preventDefault();
        markTouchActivation(card);
        playSpeech(card.dataset[datasetKey], { rate, pitch });
      });
      card.addEventListener("click", () => {
        if (isRecentTouchActivation(card)) {
          return;
        }
        playSpeech(card.dataset[datasetKey], { rate, pitch });
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          playSpeech(card.dataset[datasetKey], { rate, pitch });
        }
      });
    });
  };

  setupCards(letterCards, ".letter", "letter", "Play letter", 0.92, 1.12);
  setupCards(wordCards, ".word", "word", "Play word", 0.95, 1.05);
  setupCards(phraseCards, ".phrase-text", "phrase", "Play phrase", 0.95, 1.02);

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
      existing.addEventListener("error", () => reject(new Error("Failed to load app-maps.js")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = withAssetVersion("app-maps.js");
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
      () => reject(new Error("Failed to load app-maps.js")),
      { once: true }
    );
    document.head.appendChild(script);
  });

const initializeCommonShell = () => {
  document.querySelectorAll(".reveal").forEach((el) => observeRevealElement(el));
  setupSpeechCards();
  setupBackToTopButton();
};

/* ==========================================================================
   APPLICATION BOOTSTRAP (BASE)
   Non-map pages run from app.js directly.
   Map pages lazy-load app-maps.js to keep the base bundle small.
   ========================================================================== */
if (needsMapTranslations) {
  loadMapsBundle().catch((error) => {
    console.warn(error.message || error);
  });
} else {
  initializeCommonShell();
}

setupWebVitalsReporting();


