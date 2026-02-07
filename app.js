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
const introOverlay = document.getElementById("introOverlay");
const introButton = document.getElementById("introButton");
const introSpeechText = document.getElementById("introSpeechText");
const urlParams = new URLSearchParams(window.location.search);
const skipIntro = urlParams.get("skipIntro") === "1";
const WORLD_NAME =
  urlParams.get("world") ||
  document.body.dataset.world ||
  "English";
const WORLD_KEY = WORLD_NAME.toLowerCase();
const WORLD_TRANSLATION_FILES = {
  french: "translations.french.json",
};
const WORLD_TRANSLATION_FILE =
  WORLD_TRANSLATION_FILES[WORLD_KEY] || "translations.json";
let WORLD_TRANSLATIONS = null;
let WORLD_GRAMMAR_TITLE_MAP = null;
let WORLD_GRAMMAR_EXAMPLE_MAP = null;
const isNonEnglishWorld = WORLD_KEY !== "english";

if (skipIntro) {
  document.body.classList.remove("intro-active", "intro-leave");
  if (introOverlay) {
    introOverlay.setAttribute("aria-hidden", "true");
    introOverlay.style.display = "none";
  }
}
const setScrollbarWidth = () => {
  const width = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty("--scrollbar-width", `${Math.max(0, width)}px`);
};

setScrollbarWidth();
window.addEventListener("resize", setScrollbarWidth);

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

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
  "Worlds available now: English, French, Dutch, Swedish, Korean, Arabic, Spanish, German, Japanese, Chinese, Portuguese, Hindi.",
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
  French: "French world humming. Soft vowels and poetic trails await.",
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
  English: "world.html?world=English",
  French: "world-french.html?world=French",
};
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
let introTypingTimer;
let introSpeakingTimer;
const chatHistory = [];

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

const createTypingIndicator = () => {
  const typing = document.createElement("span");
  typing.classList.add("chat-typing");
  for (let i = 0; i < 3; i += 1) {
    const dot = document.createElement("span");
    typing.appendChild(dot);
  }
  return typing;
};

const appendChatMessage = (role, text, options = {}) => {
  if (!chatLog) {
    return null;
  }
  if (role === "mimi") {
    if (options.typing) {
      chatLog.classList.add("typing");
    } else {
      chatLog.classList.remove("typing");
    }
    return chatLog;
  }
  const message = document.createElement("div");
  message.classList.add("chat-message", role);
  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble");
  const body = document.createElement("div");
  body.classList.add("chat-text");
  body.textContent = text;
  const label = document.createElement("div");
  label.classList.add("chat-label");
  label.textContent = "You";
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
  French: "Bonjour",
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
      throw new Error("Chat request failed");
    }

    const data = await response.json();
    if (data && typeof data.content === "string" && data.content.trim()) {
      return { content: data.content.trim(), source: "api" };
    }

    throw new Error("Empty response");
  } catch (error) {
    if (MIMI_CONFIG.mode === "hybrid") {
      return { content: getPresetReply(message), source: "preset" };
    }
    return { content: "AI link is offline right now. Check the server and key.", source: "error" };
  } finally {
    window.clearTimeout(timeout);
  }
};

const sendChatMessage = async (message) => {
  if (!chatInput) {
    return;
  }
  const text = (message ?? chatInput.value).trim();
  if (!text) {
    return;
  }
  if (chatLog) {
    chatLog.innerHTML = "";
    chatLog.classList.remove("typing");
  }
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
  chatHistory.push({ role: "assistant", content: reply.content });
  if (chatHistory.length > MIMI_CONFIG.historyLimit) {
    chatHistory.splice(0, chatHistory.length - MIMI_CONFIG.historyLimit);
  }
  if (reply.source === "api") {
    setChatStatus("AI live");
  } else if (reply.source === "preset") {
    setChatStatus("Offline - preset");
  } else {
    setChatStatus("AI offline");
  }
  speakLine(reply.content, "curious");
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

starfields.forEach((layer) => {
  if (layer.classList.contains("starfield-deep")) {
    createStars(layer, 90, 1.4);
  } else if (layer.classList.contains("starfield-mid")) {
    createStars(layer, 120, 1.8);
  } else {
    createStars(layer, 140, 2.2);
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

document.querySelectorAll(".section").forEach((el) => {
  el.classList.add("reveal");
});
document.querySelectorAll(".reveal").forEach((el) => {
  if (el.id === "language") return;
  if (document.body.classList.contains("world-page") && (el.id === "world" || el.id === "maps")) {
    return;
  }
  observer.observe(el);
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
  let languageHasUserScrolled = false;
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
  enforceLanguageHiddenAtTop();
  window.addEventListener(
    "scroll",
    () => {
      languageHasUserScrolled = true;
      window.requestAnimationFrame(enforceLanguageHiddenAtTop);
    },
    { passive: true }
  );
  ["wheel", "touchmove", "keydown", "pointerdown"].forEach((eventName) => {
    window.addEventListener(
      eventName,
      () => {
        languageUserActivated = true;
        enforceLanguageHiddenAtTop();
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
      languageSection.classList.add("is-visible");
      if (document.body.classList.contains("world-page")) {
        document.body.classList.add("show-language");
        document.body.classList.add("hide-maps");
      }
      updateMapsTitleVisibility();
      if (setActiveWorldSection) {
        setActiveWorldSection("language");
      }
    });
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!document.body.classList.contains("hide-maps")) {
        return;
      }
      const languageBottom = languageSection.offsetTop + languageSection.offsetHeight;
      if (window.scrollY > languageBottom - 80) {
        document.body.classList.remove("hide-maps");
      }
      updateMapsTitleVisibility();
    },
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
    setActiveWorldSection(location.hash === "#maps" ? "maps" : location.hash === "#language" ? "language" : "world");
    window.addEventListener("scroll", () => {
      window.requestAnimationFrame(handleWorldScroll);
    }, { passive: true });
    window.addEventListener("hashchange", handleWorldScroll);
  }
}


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
let starIndex = 0;
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

window.addEventListener("scroll", () => {
  if (!audioContext || !ambientPlaying) {
    return;
  }
  refreshIntensityFromScroll();
  updateStarEnergy(window.scrollY / (document.body.scrollHeight - window.innerHeight || 1));
});

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

const triggerMimiLine = () => {
  lineIndex = (lineIndex + 1) % lines.length;
  activeLine = lines[lineIndex];
  speakLine(activeLine, lineMoods[lineIndex] || "happy");
  if (speechBubble) {
    speechBubble.animate(
      [
        { transform: "translateY(0)", opacity: 1 },
        { transform: "translateY(-8px)", opacity: 0.6 },
        { transform: "translateY(0)", opacity: 1 },
      ],
      { duration: 600, easing: "ease-out" }
    );
  }
};

  const scrollToAnchor = (hash) => {
    const targetId = hash.slice(1);
    const target = document.getElementById(targetId);
    if (!target) {
      return false;
    }
    const top = hash === "#home"
      ? 0
      : target.getBoundingClientRect().top
        + window.scrollY
        - (Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0);
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
  const anchorTargets = new Set(["#how", "#home"]);
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

const closeIntro = () => {
  if (document.body.classList.contains("intro-leave")) {
    return;
  }
  if (introTypingTimer) {
    window.clearTimeout(introTypingTimer);
    introTypingTimer = null;
  }
  if (introSpeakingTimer) {
    window.clearTimeout(introSpeakingTimer);
    introSpeakingTimer = null;
  }
  document.body.classList.add("intro-leave");
  window.setTimeout(() => {
    document.body.classList.remove("intro-active", "intro-leave");
    if (introOverlay) {
      introOverlay.setAttribute("aria-hidden", "true");
    }
  }, 650);
};

if (introButton) {
  introButton.addEventListener("click", () => {
    closeIntro();
  });
}

const startIntroTyping = () => {
  if (skipIntro) {
    return;
  }
  if (!introSpeechText) {
    return;
  }
  const text = introSpeechText.dataset.text || introSpeechText.textContent.trim();
  if (!text) {
    return;
  }
  const introBubble = introSpeechText.closest(".speech");
  if (prefersReducedMotion) {
    introSpeechText.textContent = text;
    return;
  }
  if (introBubble) {
    introBubble.classList.add("speaking");
  }
  introSpeechText.textContent = "";
  let index = 0;
    const step = () => {
      index += 1;
      introSpeechText.textContent = text.slice(0, index);
      if (index < text.length) {
        introTypingTimer = window.setTimeout(step, 18 + Math.random() * 22);
      } else if (introBubble) {
      introSpeakingTimer = window.setTimeout(() => {
        introBubble.classList.remove("speaking");
      }, 600);
    }
  };
  step();
};

window.addEventListener("load", startIntroTyping, { once: true });

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
          chatLog.innerHTML = "";
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

if (!prefersReducedMotion) {
  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX / window.innerWidth - 0.5;
    mouseY = event.clientY / window.innerHeight - 0.5;
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
  if (prefersReducedMotion) {
    return;
  }
  currentX += (mouseX - currentX) * 0.08;
  currentY += (mouseY - currentY) * 0.08;
  const scrollOffset = window.scrollY * 0.2;

  parallaxLayers.forEach((layer) => {
    const depth = Number(layer.dataset.depth || 0.2);
    const translateX = currentX * 40 * depth;
    const translateY = currentY * 40 * depth + scrollOffset * depth * 0.1;
    layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
  });

  window.requestAnimationFrame(updateParallax);
};

if (!prefersReducedMotion) {
  updateParallax();
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

  triggerWarp.timer = window.setTimeout(() => {
    warpOverlay.classList.remove("active");
    document.body.classList.remove("warp-lock");
    updateStarEnergy(0.4);
    if (typeof onDone === "function") {
      onDone();
    }
  }, 1500);
};

worldCards.forEach((card) => {
  const worldName = card.dataset.world || "World";
  const worldLine = worldLines[worldName] || "A new world is ready.";
  card.addEventListener("click", () => {
    if (card.classList.contains("coming-soon")) {
      return;
    }
    const targetUrl = worldPages[worldName];
    if (targetUrl) {
      triggerWarp(worldName, () => {
        window.location.href = targetUrl;
      });
      return;
    }
    triggerWarp(worldName);
  });
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (card.classList.contains("coming-soon")) {
        return;
      }
      const targetUrl = worldPages[worldName];
      if (targetUrl) {
        triggerWarp(worldName, () => {
          window.location.href = targetUrl;
        });
        return;
      }
      triggerWarp(worldName);
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
  languagePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      languagePills.forEach((btn) => btn.classList.remove("is-selected"));
      pill.classList.add("is-selected");
      const selected = pill.textContent.trim().toLowerCase();
      if (selected) {
        localStorage.setItem("cosmicaBaseLanguage", selected);
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
    });
  });
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

  const pickVoice = () => {
    if (!availableVoices.length) {
      return null;
    }
    const voiceScore = (voice) => {
      const name = (voice.name || "").toLowerCase();
      let score = 0;
      if (voice.lang && voice.lang.toLowerCase().startsWith("en-gb")) {
        score += 8;
      }
      if (voice.lang && voice.lang.toLowerCase().startsWith("en")) {
        score += 1.5;
      }
      if (voice.localService) {
        score += 1.5;
      }
      if (
        /female|woman|girl|zira|jenny|samantha|aria|ava|allison|amber|serena|michelle|joanna|lucy|zoe|lily|emma/.test(
          name
        )
      ) {
        score += 4;
      }
      if (/male|man|david|mark|alex|daniel|ryan|tom|george/.test(name)) {
        score -= 3;
      }
      if (/natural|neural|premium|enhanced/.test(name)) {
        score += 2;
      }
      return score;
    };

    const pickFrom = (voices) =>
      [...voices].sort((a, b) => voiceScore(b) - voiceScore(a))[0] || null;

    const enGbVoices = availableVoices.filter((voice) =>
      (voice.lang || "").toLowerCase().startsWith("en-gb")
    );
    return pickFrom(enGbVoices) || pickFrom(availableVoices);
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
    utterance.lang = selectedVoice?.lang || "en-GB";
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
      card.addEventListener("click", () => {
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

const BASE_LANGUAGES = [
  "albanian",
  "arabic",
  "bulgarian",
  "chinese",
  "croatian",
  "czech",
  "dutch",
  "finnish",
  "french",
  "german",
  "greek",
  "hebrew",
  "hindi",
  "indonesian",
  "italian",
  "japanese",
  "korean",
  "kurdish",
  "malaysian",
  "norwegian",
  "persian",
  "polish",
  "romanian",
  "russian",
  "somali",
  "spanish",
  "swedish",
  "tagalog",
  "thai",
  "turkish",
  "ukrainian",
  "urdu",
  "uzbek",
  "vietnamese",
];

const WORD_SECTION_ORDER = [
  "Greetings",
  "Pronouns",
  "Verbs & Tenses",
  "Questions & Connectors",
  "Numbers & Counting",
  "Time, Date & Frequency",
  "Descriptions & Adjectives",
  "Opinions & Preferences",
  "Weather & Seasons",
  "Places & Directions",
  "countries",
  "Feelings & States",
  "Family & Relationships",
  "Food & Eating",
  "Health & Body",
  "Technology & Communication",
  "Work & School",
];

const WORD_SECTION_LISTS = {
  Greetings: [
    "hi",
    "hello",
    "good morning",
    "good afternoon",
    "good evening",
    "good night",
    "goodbye",
    "bye",
    "see you",
    "take care",
    "welcome",
    "excuse me",
    "sorry",
    "thank you",
    "you're welcome",
    "thanks",
    "good day",
    "how are you",
    "nice to meet you",
    "pleased to meet you",
    "see you later",
    "see you soon",
    "see you tomorrow",
    "have a nice day",
    "have a good day",
    "good luck",
    "welcome back",
    "no problem",
  ],
  Pronouns: [
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
    "my",
    "your",
    "his",
    "its",
    "our",
    "their",
    "mine",
    "yours",
    "hers",
    "ours",
    "theirs",
    "myself",
    "yourself",
    "himself",
    "herself",
    "itself",
    "ourselves",
    "themselves",
    "this",
    "that",
    "these",
    "those",
    "someone",
    "anyone",
    "everyone",
    "nobody",
    "something",
    "anything",
    "everything",
    "nothing",
    "everybody",
    "somebody",
    "anybody",
    "no one",
    "each",
    "either",
    "neither",
    "both",
    "all",
    "none",
    "each other",
    "one another",
  ],
  "Verbs & Tenses": [
    "be",
    "have",
    "do",
    "go",
    "get",
    "make",
    "take",
    "come",
    "see",
    "look",
    "hear",
    "say",
    "tell",
    "ask",
    "give",
    "bring",
    "put",
    "keep",
    "find",
    "leave",
    "move",
    "live",
    "open",
    "close",
    "start",
    "finish",
    "play",
    "read",
    "write",
    "speak",
    "listen",
    "learn",
    "help",
    "travel",
    "drive",
    "walk",
    "run",
    "sleep",
    "cook",
    "buy",
    "sell",
    "pay",
    "use",
    "eat",
    "drink",
    "teach",
    "understand",
    "remember",
    "forget",
    "wait",
    "stay",
    "arrive",
    "return",
    "meet",
    "visit",
    "send",
    "receive",
    "answer",
    "explain",
    "repeat",
    "practice",
    "plan",
    "decide",
    "try",
    "change",
    "build",
    "fix",
    "stop",
    "stand",
    "sit",
    "turn",
    "carry",
    "hold",
    "wear",
    "wash",
    "grow",
    "win",
    "lose",
    "join",
    "share",
    "order",
    "follow",
    "save",
  ],
  "Questions & Connectors": [
    "who",
    "what",
    "where",
    "when",
    "why",
    "how",
    "which",
    "whose",
    "how many",
    "how much",
    "and",
    "but",
    "or",
    "so",
    "because",
    "if",
    "then",
    "also",
    "before",
    "after",
    "while",
    "since",
    "until",
    "although",
    "however",
    "whom",
    "where from",
    "what time",
    "how long",
    "how often",
    "whether",
    "unless",
    "yet",
    "still",
    "therefore",
    "so that",
    "in case",
    "because of",
    "as",
    "than",
    "through",
    "without",
    "with",
    "about",
    "for",
    "from",
    "to",
    "into",
    "over",
    "under",
    "between",
    "around",
    "across",
    "behind",
    "in front of",
    "next to",
    "past",
  ],
  "Numbers & Counting": [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
    "hundred",
    "thousand",
    "million",
    "billion",
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
    "ninth",
    "tenth",
    "last",
    "eleventh",
    "twelfth",
    "thirteenth",
    "fourteenth",
    "fifteenth",
    "sixteenth",
    "seventeenth",
    "eighteenth",
    "nineteenth",
    "twentieth",
    "thirtieth",
    "fortieth",
    "fiftieth",
    "sixtieth",
    "seventieth",
    "eightieth",
    "ninetieth",
    "hundredth",
    "thousandth",
    "millionth",
    "billionth",
    "half",
    "quarter",
    "dozen",
    "pair",
    "couple",
  ],
  "Time, Date & Frequency": [
    "time",
    "clock",
    "hour",
    "minute",
    "second",
    "day",
    "week",
    "month",
    "year",
    "today",
    "tomorrow",
    "yesterday",
    "dawn",
    "morning",
    "afternoon",
    "dusk",
    "evening",
    "night",
    "weekend",
    "date",
    "calendar",
    "holiday",
    "now",
    "later",
    "soon",
    "early",
    "late",
    "always",
    "usually",
    "often",
    "sometimes",
    "rarely",
    "never",
    "moment",
    "midday",
    "noon",
    "midnight",
    "tonight",
    "daily",
    "weekly",
    "monthly",
    "yearly",
    "hourly",
    "once",
    "twice",
    "occasionally",
    "frequently",
  ],
  "Descriptions & Adjectives": [
    "good",
    "bad",
    "big",
    "small",
    "new",
    "old",
    "young",
    "beautiful",
    "ugly",
    "easy",
    "hard",
    "fast",
    "slow",
    "clean",
    "dirty",
    "rich",
    "poor",
    "high",
    "low",
    "short",
    "long",
    "strong",
    "weak",
    "quiet",
    "loud",
    "safe",
    "dangerous",
    "simple",
    "difficult",
    "important",
    "different",
    "same",
    "open",
    "closed",
    "full",
    "empty",
    "bright",
    "dark",
    "tall",
    "wide",
    "narrow",
    "deep",
    "shallow",
    "heavy",
    "light",
    "soft",
    "smooth",
    "rough",
    "sharp",
    "dull",
    "cheap",
    "expensive",
    "busy",
    "free",
    "ready",
    "available",
    "possible",
    "impossible",
    "correct",
    "wrong",
    "friendly",
    "kind",
    "polite",
    "rude",
    "brave",
    "careful",
    "famous",
    "local",
    "foreign",
    "modern",
    "ancient",
    "fresh",
    "stale",
    "round",
    "square",
    "flat",
    "thin",
    "thick",
    "dry",
    "wet",
  ],
  "Opinions & Preferences": [
    "like",
    "love",
    "prefer",
    "enjoy",
    "hate",
    "want",
    "need",
    "think",
    "believe",
    "agree",
    "disagree",
    "favorite",
    "best",
    "worst",
    "choose",
    "opinion",
    "choice",
    "suggest",
    "recommend",
    "wish",
    "guess",
    "maybe",
    "probably",
    "perhaps",
    "definitely",
    "certainly",
    "depends",
    "matter",
  ],
  "Weather & Seasons": [
    "weather",
    "sun",
    "sunny",
    "rain",
    "rainy",
    "snow",
    "snowy",
    "wind",
    "windy",
    "cloud",
    "cloudy",
    "storm",
    "fog",
    "hot",
    "warm",
    "cold",
    "cool",
    "temperature",
    "spring",
    "summer",
    "autumn",
    "winter",
    "forecast",
    "breeze",
    "drizzle",
    "thunder",
    "lightning",
    "hail",
    "stormy",
    "foggy",
    "humid",
    "humidity",
    "dry",
    "wet",
    "icy",
    "freezing",
    "heat",
    "sunrise",
    "sunset",
    "rainbow",
  ],
  "Places & Directions": [
    "home",
    "city",
    "town",
    "village",
    "street",
    "road",
    "way",
    "corner",
    "left",
    "right",
    "straight",
    "north",
    "south",
    "east",
    "west",
    "inside",
    "outside",
    "near",
    "far",
    "here",
    "there",
    "entrance",
    "exit",
    "building",
    "room",
    "bathroom",
    "kitchen",
    "bedroom",
    "station",
    "airport",
    "hotel",
    "restaurant",
    "cafe",
    "shop",
    "market",
    "bank",
    "post office",
    "park",
    "museum",
    "library",
    "hospital",
    "pharmacy",
    "clinic",
    "police station",
    "fire station",
    "gym",
    "stadium",
    "beach",
    "mountain",
    "river",
    "lake",
    "forest",
    "island",
    "bridge",
    "square",
    "mall",
    "store",
    "bakery",
    "zoo",
    "theater",
    "cinema",
    "bus stop",
    "subway",
    "parking lot",
    "farm",
    "factory",
    "harbor",
    "port",
    "dock",
    "church",
    "temple",
    "mosque",
    "synagogue",
  ],
  countries: [
    "United Kingdom",
    "Ireland",
    "France",
    "Germany",
    "Spain",
    "Portugal",
    "Italy",
    "Netherlands",
    "Belgium",
    "Sweden",
    "Norway",
    "Denmark",
    "Finland",
    "Iceland",
    "Switzerland",
    "Austria",
    "Greece",
    "Poland",
    "Czechia",
    "Hungary",
    "Romania",
    "Bulgaria",
    "Serbia",
    "Croatia",
    "Slovenia",
    "Slovakia",
    "Bosnia and Herzegovina",
    "Montenegro",
    "Kosovo",
    "Albania",
    "Moldova",
    "Ukraine",
    "Belarus",
    "Russia",
    "Estonia",
    "Latvia",
    "Lithuania",
    "Luxembourg",
    "Malta",
    "Cyprus",
    "Andorra",
    "Liechtenstein",
    "Monaco",
    "San Marino",
    "Vatican City",
    "Georgia",
    "Armenia",
    "Azerbaijan",
    "Turkey",
    "Kazakhstan",
    "Kyrgyzstan",
    "Tajikistan",
    "Turkmenistan",
    "Uzbekistan",
    "Afghanistan",
    "Pakistan",
    "India",
    "Bangladesh",
    "Sri Lanka",
    "Nepal",
    "Bhutan",
    "Maldives",
    "China",
    "Mongolia",
    "North Korea",
    "South Korea",
    "Japan",
    "Taiwan",
    "Hong Kong",
    "Vietnam",
    "Thailand",
    "Malaysia",
    "Indonesia",
    "Philippines",
    "Singapore",
    "Myanmar",
    "Cambodia",
    "Laos",
    "Brunei",
    "Timor-Leste",
    "Papua New Guinea",
    "Australia",
    "New Zealand",
    "Fiji",
    "Samoa",
    "Tonga",
    "Vanuatu",
    "Solomon Islands",
    "Kiribati",
    "Tuvalu",
    "Nauru",
    "Palau",
    "Marshall Islands",
    "Micronesia",
    "United States",
    "Canada",
    "Mexico",
    "Guatemala",
    "Honduras",
    "El Salvador",
    "Nicaragua",
    "Costa Rica",
    "Panama",
    "Cuba",
    "Dominican Republic",
    "Jamaica",
    "Haiti",
    "Bahamas",
    "Barbados",
    "Trinidad and Tobago",
    "Antigua and Barbuda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Grenada",
    "Belize",
    "Guyana",
    "Suriname",
    "Brazil",
    "Argentina",
    "Chile",
    "Uruguay",
    "Paraguay",
    "Bolivia",
    "Peru",
    "Colombia",
    "Venezuela",
    "Ecuador",
    "Qatar",
    "Bahrain",
    "Kuwait",
    "Oman",
    "Saudi Arabia",
    "United Arab Emirates",
    "Yemen",
    "Iraq",
    "Iran",
    "Jordan",
    "Lebanon",
    "Syria",
    "Palestine",
    "Egypt",
    "Libya",
    "Tunisia",
    "Algeria",
    "Morocco",
    "Mauritania",
    "Sudan",
    "Ethiopia",
    "Somalia",
    "Eritrea",
    "Djibouti",
    "Kenya",
    "Uganda",
    "Tanzania",
    "Rwanda",
    "Burundi",
    "Democratic Republic of the Congo",
    "Gabon",
    "Cameroon",
    "Central African Republic",
    "Chad",
    "Niger",
    "Nigeria",
    "Ghana",
    "C?te d?Ivoire",
    "Burkina Faso",
    "Mali",
    "Senegal",
    "Gambia",
    "Guinea",
    "Sierra Leone",
    "Liberia",
    "Togo",
    "Benin",
    "Cape Verde",
    "Sao Tome and Principe",
    "Angola",
    "Namibia",
    "Botswana",
    "Zimbabwe",
    "Zambia",
    "Mozambique",
    "Malawi",
    "Madagascar",
    "Comoros",
    "Seychelles",
    "Mauritius",
    "South Africa",
    "Eswatini",
    "Lesotho",
  ],
  "Feelings & States": [
    "happy",
    "sad",
    "angry",
    "afraid",
    "excited",
    "bored",
    "tired",
    "sleepy",
    "hungry",
    "thirsty",
    "nervous",
    "calm",
    "okay",
    "lonely",
    "confused",
    "proud",
    "relaxed",
    "stressed",
    "worried",
    "surprised",
    "shy",
    "ashamed",
    "embarrassed",
    "jealous",
    "grateful",
    "hopeful",
    "frustrated",
    "overwhelmed",
    "confident",
    "insecure",
    "curious",
    "focused",
    "satisfied",
    "disappointed",
    "relieved",
    "anxious",
    "content",
  ],
  "Family & Relationships": [
    "family",
    "parent",
    "mother",
    "father",
    "son",
    "daughter",
    "brother",
    "sister",
    "husband",
    "wife",
    "partner",
    "child",
    "baby",
    "cousin",
    "aunt",
    "uncle",
    "grandmother",
    "grandfather",
    "friend",
    "neighbor",
    "sibling",
    "grandparent",
    "grandchild",
    "grandson",
    "granddaughter",
    "stepmother",
    "stepfather",
    "stepson",
    "stepdaughter",
    "boyfriend",
    "girlfriend",
    "fianc?",
    "fianc?e",
    "spouse",
    "relative",
    "roommate",
    "in-law",
    "mother-in-law",
    "father-in-law",
    "brother-in-law",
    "sister-in-law",
  ],
  "Food & Eating": [
    "water",
    "bread",
    "rice",
    "pasta",
    "meat",
    "chicken",
    "fish",
    "egg",
    "milk",
    "cheese",
    "fruit",
    "apple",
    "banana",
    "orange",
    "vegetable",
    "salad",
    "soup",
    "sugar",
    "salt",
    "coffee",
    "tea",
    "juice",
    "breakfast",
    "lunch",
    "dinner",
    "snack",
    "dessert",
    "butter",
    "yogurt",
    "beef",
    "pork",
    "ham",
    "sausage",
    "shrimp",
    "seafood",
    "potato",
    "tomato",
    "onion",
    "garlic",
    "carrot",
    "lettuce",
    "pepper",
    "cucumber",
    "corn",
    "beans",
    "mushroom",
    "oil",
    "vinegar",
    "spice",
    "sauce",
    "noodle",
    "sandwich",
    "pizza",
    "burger",
    "steak",
    "cake",
    "cookie",
    "ice cream",
    "chocolate",
    "honey",
    "jam",
    "cereal",
    "oats",
  ],
  "Health & Body": [
    "head",
    "hair",
    "face",
    "eye",
    "ear",
    "nose",
    "mouth",
    "tooth",
    "neck",
    "shoulder",
    "arm",
    "hand",
    "finger",
    "chest",
    "back",
    "stomach",
    "leg",
    "knee",
    "foot",
    "skin",
    "heart",
    "blood",
    "bone",
    "doctor",
    "nurse",
    "medicine",
    "pain",
    "fever",
    "sick",
    "healthy",
    "brain",
    "throat",
    "lip",
    "tongue",
    "elbow",
    "wrist",
    "hip",
    "ankle",
    "toe",
    "nail",
    "lung",
    "liver",
    "kidney",
    "muscle",
    "joint",
    "spine",
    "headache",
    "stomachache",
    "cough",
    "injury",
    "wound",
    "bandage",
    "pill",
    "vaccine",
    "allergy",
    "symptom",
    "appointment",
    "checkup",
  ],
  "Technology & Communication": [
    "phone",
    "computer",
    "internet",
    "email",
    "message",
    "text",
    "call",
    "video",
    "camera",
    "app",
    "website",
    "password",
    "wifi",
    "screen",
    "keyboard",
    "mouse",
    "battery",
    "charger",
    "social media",
    "online",
    "offline",
    "download",
    "upload",
    "file",
    "link",
    "tablet",
    "laptop",
    "desktop",
    "microphone",
    "speaker",
    "headphones",
    "earbuds",
    "browser",
    "search",
    "login",
    "logout",
    "username",
    "account",
    "profile",
    "notification",
    "chat",
    "voice",
    "signal",
    "network",
    "router",
    "bluetooth",
    "printer",
    "scanner",
    "storage",
    "cloud",
    "update",
    "settings",
    "stream",
  ],
  "Work & School": [
    "work",
    "job",
    "office",
    "company",
    "boss",
    "colleague",
    "meeting",
    "project",
    "task",
    "salary",
    "schedule",
    "student",
    "teacher",
    "school",
    "class",
    "lesson",
    "homework",
    "exam",
    "grade",
    "study",
    "book",
    "notebook",
    "pen",
    "pencil",
    "desk",
    "break",
    "university",
    "training",
    "subject",
    "course",
    "assignment",
    "lecture",
    "presentation",
    "report",
    "deadline",
    "group",
    "team",
    "manager",
    "employee",
    "intern",
    "resume",
    "interview",
    "career",
    "promotion",
    "skills",
    "department",
    "principal",
    "professor",
    "assistant",
    "research",
    "quiz",
    "certificate",
    "degree",
  ],
};

const PHRASE_SECTION_ORDER = [
  "Greetings",
  "Politeness",
  "Introductions",
  "Conversation",
  "Questions",
  "Requests",
  "Time & Plans",
  "Directions",
  "Food",
  "Shopping",
  "Health",
  "Feelings",
  "Opinions",
  "Work & Study",
  "Problems",
  "Everyday Expressions",
];

const PHRASE_SECTION_LISTS = {
  Greetings: [
    "hi there",
    "hello there",
    "good morning",
    "good afternoon",
    "good evening",
    "good night",
    "how are you",
    "how are you doing",
    "how is it going",
    "good to see you",
    "nice to see you",
    "welcome back",
    "long time no see",
    "see you later",
    "see you soon",
    "see you tomorrow",
    "take care",
    "have a good day",
    "have a nice day",
  ],
  Politeness: [
    "excuse me",
    "pardon me",
    "i am sorry",
    "sorry about that",
    "thank you",
    "thank you very much",
    "thanks a lot",
    "i appreciate it",
    "you are welcome",
    "no problem",
    "that is okay",
    "after you",
    "my apologies",
    "please forgive me",
  ],
  Introductions: [
    "my name is",
    "i am",
    "i am from",
    "i live in",
    "i work at",
    "i study at",
    "i am a student",
    "i am a teacher",
    "i am new here",
    "let me introduce myself",
    "this is my friend",
    "this is my brother",
    "this is my sister",
    "nice to meet you",
    "pleased to meet you",
    "i am learning english",
    "i speak english",
    "i do not speak english",
  ],
  Conversation: [
    "can you repeat that",
    "can you say that again",
    "what do you mean",
    "i do not understand",
    "i understand",
    "i see",
    "that makes sense",
    "that is interesting",
    "tell me more",
    "i am listening",
    "let me think",
  ],
  Questions: [
    "what is this",
    "what is that",
    "who is that",
    "where are you",
    "where is the bathroom",
    "where is the station",
    "when is it",
    "what time is it",
    "how many people",
    "which one is better",
    "do you speak english",
    "do you have this",
    "is this correct",
    "is it open",
    "is it closed",
    "is there a",
    "are you ready",
    "what do you think",
    "what is your name",
  ],
  Requests: [
    "can you help me",
    "could you help me",
    "please help me",
    "can you show me",
    "could you show me",
    "can you tell me",
    "could you tell me",
    "can you explain",
    "could you explain",
    "can i have",
    "could i have",
    "i would like",
    "i would like to",
    "i need",
    "i need to",
    "i want to",
    "let me know",
    "please wait a moment",
    "please speak slowly",
    "can you speak slowly",
  ],
  "Time & Plans": [
    "what time works",
    "what time is good",
    "do you have time",
    "are you free",
    "i am free",
    "i am busy",
    "let us meet",
    "let us go",
    "let us start",
    "let us finish",
    "i will be late",
    "i will be early",
    "i will be there",
    "see you at",
    "see you on",
    "next week",
    "this weekend",
    "tomorrow morning",
    "this afternoon",
    "tonight at",
    "i have plans",
    "can we meet",
  ],
  Directions: [
    "turn left",
    "turn right",
    "go straight",
    "go back",
    "go ahead",
    "on the left",
    "on the right",
    "next to the",
    "across from the",
    "between the",
    "in front of the",
    "behind the",
    "at the corner",
    "on this street",
    "one block away",
    "two blocks away",
    "near the",
    "far from the",
    "go past the",
    "take the first left",
    "take the second right",
  ],
  Food: [
    "i am hungry",
    "i am thirsty",
    "can i see the menu",
    "table for two",
    "i would like water",
    "i would like coffee",
    "i will have the",
    "can i order",
    "the bill please",
    "no sugar please",
    "no salt please",
    "with no ice",
    "i am allergic to",
    "i do not eat meat",
    "i do not eat pork",
    "is this vegetarian",
    "can i get",
    "takeaway please",
    "to go please",
    "i would like to drink",
    "i would like to eat",
  ],
  Shopping: [
    "i am just looking",
    "i am looking for",
    "do you have another color",
    "do you have a smaller size",
    "do you have a larger size",
    "can i try it on",
    "how much is this",
    "how much is that",
    "i will take it",
    "where is the cashier",
    "do you accept cards",
    "can i pay by card",
    "can i pay in cash",
    "is there a discount",
    "can i return this",
    "i need a receipt",
    "it is too expensive",
  ],
  Health: [
    "i am sick",
    "i feel sick",
    "i have a headache",
    "i have a fever",
    "i have a cough",
    "i have a sore throat",
    "i need a doctor",
    "call a doctor",
    "call an ambulance",
    "i need medicine",
    "where is the pharmacy",
    "it hurts here",
    "i have an allergy",
    "i feel better",
    "i feel worse",
    "my stomach hurts",
    "i have an appointment",
  ],
  Feelings: [
    "i am happy",
    "i am sad",
    "i am angry",
    "i am tired",
    "i am sleepy",
    "i am excited",
    "i am nervous",
    "i am worried",
    "i am stressed",
    "i am calm",
    "i feel fine",
    "i feel great",
    "i feel bad",
    "i feel relaxed",
    "i feel lonely",
    "i feel confused",
    "i feel proud",
    "i feel embarrassed",
    "i feel grateful",
  ],
  Opinions: [
    "i think so",
    "i do not think so",
    "i like it",
    "i love it",
    "i do not like it",
    "it is good",
    "it is bad",
    "it is okay",
    "it is better",
    "it is worse",
    "i prefer",
    "i agree",
    "i disagree",
    "in my opinion",
    "i believe",
    "i am not sure",
    "i am sure",
    "that is true",
    "that is false",
    "that is correct",
    "that is wrong",
  ],
  "Work & Study": [
    "i am at work",
    "i am at school",
    "i have class",
    "i have homework",
    "i have an exam",
    "i have a test",
    "i have a project",
    "i am working",
    "i am studying",
    "i need help with",
    "i have a deadline",
    "i have a question",
    "i am on a break",
    "i am late for class",
    "i am early for work",
    "i work from home",
    "i work in",
  ],
  Problems: [
    "i have a problem",
    "something is wrong",
    "it does not work",
    "it is broken",
    "i need help",
    "i am lost",
    "i lost my",
    "i cannot find",
    "i missed my",
    "i forgot my",
    "i made a mistake",
    "i need to cancel",
    "i need to reschedule",
    "i have no money",
    "my phone is dead",
    "i ran out of",
    "i do not know",
    "i am stuck",
    "there is a mistake",
  ],
  "Everyday Expressions": [
    "just a second",
    "one moment",
    "right now",
    "not yet",
    "maybe later",
    "of course",
    "i am ready",
    "i am not ready",
    "that is fine",
    "that is enough",
    "too much",
    "a little bit",
    "a lot of",
    "almost done",
    "all done",
    "no worries",
    "sounds good",
    "that works",
    "good idea",
    "let us try",
  ],
};

const GRAMMAR_SECTION_ORDER = [
  "Sentence Structure",
  "Verbs",
  "Tenses & Aspect",
  "Nouns & Articles",
  "Pronouns & Reference",
  "Modifiers",
  "Questions",
  "Negation",
  "Connections",
  "Conditions",
  "Voice & Focus",
  "Modality",
  "Reported Speech",
  "Formality & Style",
  "Discourse & Flow",
];

const GRAMMAR_SECTION_LISTS = {
  "Sentence Structure": [
    {
      title: "basic word order",
      points: [
        "basic word order for statements",
        "subject before verb",
        "object after verb",
      ],
      example: "She reads a book.",
    },
    {
      title: "sentence parts",
      points: [
        "core subject slot",
        "core verb slot",
        "object and complement slot",
      ],
      example: "They named her captain.",
    },
    {
      title: "adding details",
      points: [
        "time at sentence end",
        "place after verb",
        "extra phrases after objects",
      ],
      example: "She met him at noon at the station.",
    },
    {
      title: "linking clauses",
      points: [
        "main clause idea",
        "reason clause add-on",
        "time clause add-on",
      ],
      example: "I stayed home because it rained.",
    },
    {
      title: "sentence variety",
      points: [
        "short sentences for impact",
        "long sentences for detail",
        "avoid run-on sentences",
      ],
      example: "We finished early. We went home after class because we were tired.",
    },
  ],
  Verbs: [
    {
      title: "action verbs",
      points: [
        "action verbs for movement",
        "action verbs for tasks",
        "action verbs for change",
      ],
      example: "They carry the boxes.",
    },
    {
      title: "state verbs",
      points: [
        "state verbs for feelings",
        "state verbs for thoughts",
        "state verbs for possession",
      ],
      example: "She feels tired.",
    },
    {
      title: "linking verbs",
      points: [
        "be as linking verb",
        "feel and seem links",
        "become and remain links",
      ],
      example: "The room feels quiet.",
    },
    {
      title: "verb patterns",
      points: [
        "verb plus object pattern",
        "verb plus adjective pattern",
        "verb plus preposition pattern",
      ],
      example: "He placed the book on the table.",
    },
    {
      title: "verb combinations",
      points: [
        "verb plus infinitive",
        "verb plus gerund",
        "verb plus that clause",
      ],
      example: "We decided to stay.",
    },
    {
      title: "phrasal verbs",
      points: [
        "verb plus particle",
        "separable phrasal verbs",
        "meaning shift with particles",
      ],
      example: "She turned off the light.",
    },
  ],
  "Tenses & Aspect": [
    {
      title: "present simple",
      points: [
        "present simple for habits",
        "present simple for facts",
        "present simple for schedules",
      ],
      example: "She works every day.",
    },
    {
      title: "present continuous",
      points: [
        "present continuous for now",
        "present continuous for temporary actions",
        "present continuous for near plans",
      ],
      example: "I am waiting outside.",
    },
    {
      title: "past simple",
      points: [
        "past simple for finished actions",
        "past simple for past time words",
        "past simple for sequences",
      ],
      example: "They visited Paris.",
    },
    {
      title: "past continuous",
      points: [
        "past continuous for background",
        "past continuous with interruption",
        "past continuous for two actions",
      ],
      example: "I was cooking when he called.",
    },
    {
      title: "present perfect",
      points: [
        "present perfect for experience",
        "present perfect for recent results",
        "present perfect with since and for",
      ],
      example: "He has lived here for years.",
    },
    {
      title: "past perfect",
      points: [
        "past perfect for earlier past",
        "past perfect for cause in past",
        "past perfect with before",
      ],
      example: "She had left before I arrived.",
    },
    {
      title: "future forms",
      points: [
        "will for decisions",
        "going to for plans",
        "present continuous for plans",
      ],
      example: "We are meeting tomorrow.",
    },
    {
      title: "future continuous",
      points: [
        "future continuous for progress",
        "future continuous for background",
        "future continuous for polite inquiry",
      ],
      example: "I will be working at six.",
    },
    {
      title: "future perfect",
      points: [
        "future perfect for deadlines",
        "future perfect with by time",
        "future perfect for completion",
      ],
      example: "They will have finished by Friday.",
    },
    {
      title: "aspect contrasts",
      points: [
        "simple vs continuous contrast",
        "perfect vs simple contrast",
        "duration focus contrast",
      ],
      example: "I have been waiting all day.",
    },
  ],
  "Nouns & Articles": [
    {
      title: "countable nouns",
      points: [
        "countable nouns with numbers",
        "a or an before countables",
        "plural for more than one",
      ],
      example: "I have a coin.",
    },
    {
      title: "uncountable nouns",
      points: [
        "uncountable nouns without plural",
        "some with uncountables",
        "a piece of for units",
      ],
      example: "We need some rice.",
    },
    {
      title: "articles",
      points: [
        "a or an for first mention",
        "the for specific reference",
        "no article for general ideas",
      ],
      example: "The dog is outside.",
    },
    {
      title: "plural forms",
      points: [
        "regular plural endings",
        "spelling changes in plurals",
        "irregular plural forms",
      ],
      example: "Two children are here.",
    },
    {
      title: "possessive nouns",
      points: [
        "apostrophe s ownership",
        "plural possessive endings",
        "things and relationships",
      ],
      example: "Sara's phone is new.",
    },
    {
      title: "noun phrases",
      points: [
        "determiner plus noun",
        "adjective plus noun",
        "noun plus noun pairing",
      ],
      example: "The small kitchen table broke.",
    },
    {
      title: "quantifiers",
      points: [
        "many and much choice",
        "few and little choice",
        "a lot of for quantity",
      ],
      example: "There are many options.",
    },
  ],
  "Pronouns & Reference": [
    {
      title: "subject pronouns",
      points: [
        "i you he she set",
        "we and they plural",
        "it for things",
      ],
      example: "They are ready.",
    },
    {
      title: "object pronouns",
      points: [
        "me him her set",
        "us and them plural",
        "object position after verbs",
      ],
      example: "She called me.",
    },
    {
      title: "possessive forms",
      points: [
        "my your his her set",
        "our their with nouns",
        "mine yours for standalone",
      ],
      example: "This is my bag.",
    },
    {
      title: "reflexive pronouns",
      points: [
        "myself yourself pattern",
        "herself himself pattern",
        "emphasis with reflexives",
      ],
      example: "He hurt himself.",
    },
    {
      title: "demonstratives",
      points: [
        "this that for single",
        "these those for plural",
        "near vs far reference",
      ],
      example: "Those are my keys.",
    },
    {
      title: "relative reference",
      points: [
        "who for people",
        "which for things",
        "that for general use",
      ],
      example: "The man who called left.",
    },
    {
      title: "indefinite reference",
      points: [
        "someone anyone set",
        "everyone no one set",
        "something anything set",
      ],
      example: "Someone is waiting.",
    },
  ],
  Modifiers: [
    {
      title: "adjectives basics",
      points: [
        "adjectives describe nouns",
        "adjectives before nouns",
        "adjectives after be",
      ],
      example: "The house is quiet.",
    },
    {
      title: "adjective order",
      points: [
        "opinion before size",
        "age before color",
        "material near noun",
      ],
      example: "She bought a small red bag.",
    },
    {
      title: "comparatives",
      points: [
        "er or more forms",
        "than comparisons",
        "irregular comparative forms",
      ],
      example: "This is faster than that.",
    },
    {
      title: "superlatives",
      points: [
        "est or most forms",
        "the with superlative",
        "group comparison focus",
      ],
      example: "He is the tallest.",
    },
    {
      title: "adverbs basics",
      points: [
        "adverbs describe verbs",
        "adverbs after verb",
        "adverbs before adjectives",
      ],
      example: "She speaks clearly.",
    },
    {
      title: "frequency adverbs",
      points: [
        "always usually often set",
        "rarely never set",
        "position with be",
      ],
      example: "I usually wake early.",
    },
    {
      title: "time and place adverbs",
      points: [
        "time at end position",
        "place at the end",
        "time before place order",
      ],
      example: "We met there yesterday.",
    },
    {
      title: "degree words",
      points: [
        "very really set",
        "too and enough",
        "quite and rather",
      ],
      example: "The room is very warm.",
    },
    {
      title: "participles",
      points: [
        "ing adjectives for cause",
        "ed adjectives for feeling",
        "avoid confusion",
      ],
      example: "The movie was boring.",
    },
    {
      title: "modifier stacking",
      points: [
        "multiple adjectives",
        "multiple adverbs",
        "keep focus clear",
      ],
      example: "She quickly answered the hard question.",
    },
  ],
  Questions: [
    {
      title: "yes no questions",
      points: ["aux + subject + base verb"],
      example: "Do you work here?",
    },
    {
      title: "wh questions",
      points: ["wh word + aux + subject + base verb"],
      example: "Where does he live?",
    },
    {
      title: "questions with be",
      points: ["be + subject + complement"],
      example: "Is the store open?",
    },
    {
      title: "questions with do",
      points: ["aux + subject + base verb"],
      example: "Did you call her?",
    },
    {
      title: "questions with modals",
      points: ["modal + subject + base verb"],
      example: "Could you help me?",
    },
    {
      title: "tag questions",
      points: ["statement + tag"],
      example: "You are ready, aren't you?",
    },
    {
      title: "indirect questions",
      points: ["intro + wh clause"],
      example: "Could you tell me where it is?",
    },
  ],
  Negation: [
    {
      title: "not with be",
      points: ["subject + be + not + complement"],
      example: "She is not tired.",
    },
    {
      title: "not with do",
      points: ["subject + aux + not + base verb"],
      example: "They do not agree.",
    },
    {
      title: "negative short forms",
      points: ["subject + aux + base verb"],
      example: "I don't know.",
    },
    {
      title: "negative words",
      points: ["negative word + noun"],
      example: "There is no milk.",
    },
    {
      title: "negative questions",
      points: ["aux + subject + base verb + object"],
      example: "Don't you want coffee?",
    },
    {
      title: "limited negatives",
      points: ["subject + negative adverb + verb"],
      example: "He rarely eats out.",
    },
  ],
  Connections: [
    {
      title: "basic connectors",
      points: ["clause 1 + connector + clause 2"],
      example: "I called but no one answered.",
    },
    {
      title: "reason and result",
      points: ["reason clause + connector + result clause"],
      example: "It rained, so we stayed.",
    },
    {
      title: "contrast and choice",
      points: ["clause 1 + contrast connector + clause 2"],
      example: "She went, although she was tired.",
    },
    {
      title: "time connectors",
      points: ["main clause + time connector + clause"],
      example: "Call me when you arrive.",
    },
    {
      title: "comparison links",
      points: ["subject + verb + comparison + object"],
      example: "This feels like home.",
    },
    {
      title: "adding ideas",
      points: ["addition marker + clause"],
      example: "We also need chairs.",
    },
    {
      title: "ordering ideas",
      points: ["sequence + clause"],
      example: "First we plan, then we act.",
    },
  ],
  Conditions: [
    {
      title: "real conditions",
      points: ["if clause + result clause"],
      example: "If you press this, it starts.",
    },
    {
      title: "future conditions",
      points: ["if clause + result clause"],
      example: "If it is sunny, we will go.",
    },
    {
      title: "unreal present",
      points: ["if clause + would clause"],
      example: "If I had time, I would help.",
    },
    {
      title: "unreal past",
      points: ["if clause + would have clause"],
      example: "If we had left earlier, we would have arrived.",
    },
    {
      title: "mixed conditions",
      points: ["if clause + result clause"],
      example: "If she studied, she would be calm.",
    },
    {
      title: "unless and otherwise",
      points: ["result clause + unless clause"],
      example: "We will go unless it rains.",
    },
  ],
  "Voice & Focus": [
    {
      title: "active voice",
      points: ["doer + action verb + object"],
      example: "The chef cooked dinner.",
    },
    {
      title: "passive voice",
      points: ["object + be verb + past participle"],
      example: "The meal was cooked.",
    },
    {
      title: "focus shifts",
      points: ["focus phrase + subject + verb"],
      example: "That book, I finished yesterday.",
    },
    {
      title: "cleft sentences",
      points: ["it subject + focus phrase + clause"],
      example: "It is John who called.",
    },
    {
      title: "there and it subjects",
      points: ["there subject + be verb + noun"],
      example: "There is a problem.",
    },
  ],
  Modality: [
    {
      title: "ability",
      points: ["subject + modal + base verb"],
      example: "She can swim.",
    },
    {
      title: "permission",
      points: ["modal + subject + base verb"],
      example: "May I sit here?",
    },
    {
      title: "obligation",
      points: ["subject + modal + base verb"],
      example: "You must wear a seatbelt.",
    },
    {
      title: "advice",
      points: ["subject + modal + base verb"],
      example: "You should rest.",
    },
    {
      title: "possibility",
      points: ["modal + base verb"],
      example: "It might rain today.",
    },
    {
      title: "probability",
      points: ["subject + modal + probability word + base verb"],
      example: "He will probably come.",
    },
    {
      title: "polite requests",
      points: ["modal + subject + base verb + object"],
      example: "Could you open the window?",
    },
    {
      title: "offers and invitations",
      points: ["modal phrase + object"],
      example: "Would you like some tea?",
    },
  ],
  "Reported Speech": [
    {
      title: "reporting statements",
      points: [
        "say with that clause",
        "tell with object",
        "reporting verbs set",
      ],
      example: "She said she was ready.",
    },
    {
      title: "reporting questions",
      points: [
        "ask with if",
        "ask with question word",
        "no inversion",
      ],
      example: "He asked if I was okay.",
    },
    {
      title: "reporting requests",
      points: [
        "ask to do",
        "tell to do requests",
        "polite reporting",
      ],
      example: "She asked me to wait.",
    },
    {
      title: "reporting commands",
      points: [
        "tell to do commands",
        "order to do",
        "instruction shift",
      ],
      example: "He told us to leave.",
    },
    {
      title: "backshift basics",
      points: [
        "present to past shift",
        "will to would shift",
        "can to could shift",
      ],
      example: "They said they had time.",
    },
    {
      title: "time place changes",
      points: [
        "now to then",
        "here to there",
        "today to that day",
      ],
      example: "He said he was there.",
    },
  ],
  "Formality & Style": [
    {
      title: "formal vs informal",
      points: [
        "formal word choice",
        "informal word choice",
        "match audience tone",
      ],
      example: "Could you assist me?",
    },
    {
      title: "contractions",
      points: [
        "short forms in speech",
        "avoid in formal writing",
        "clarity choices",
      ],
      example: "I can't stay long.",
    },
    {
      title: "polite softening",
      points: [
        "please for politeness",
        "soft request forms",
        "indirect language",
      ],
      example: "Could you close the door?",
    },
    {
      title: "spoken vs written",
      points: [
        "spoken simplicity",
        "written clarity",
        "sentence length control",
      ],
      example: "Please see the details below.",
    },
    {
      title: "professional style",
      points: [
        "clear purpose first",
        "neutral tone",
        "polite closing",
      ],
      example: "Thank you for your time.",
    },
    {
      title: "casual style",
      points: [
        "friendly tone",
        "short phrases",
        "informal openings",
      ],
      example: "Hey, how is it going?",
    },
    {
      title: "clarity and brevity",
      points: [
        "short sentences",
        "avoid extra words",
        "main point first",
      ],
      example: "We need a quick answer.",
    },
  ],
  "Discourse & Flow": [
    {
      title: "opening and closing",
      points: [
        "start a talk",
        "end a talk",
        "closing signal words",
      ],
      example: "Anyway, that is all.",
    },
    {
      title: "topic shifts",
      points: [
        "change topic smoothly",
        "return to topic",
        "signal the shift",
      ],
      example: "By the way, I have news.",
    },
    {
      title: "cohesion tools",
      points: [
        "reference words",
        "linking phrases",
        "topic tracking",
      ],
      example: "This idea connects to the last point.",
    },
    {
      title: "sequencing ideas",
      points: [
        "first next last",
        "sequence signal words",
        "clear sequence",
      ],
      example: "First we pack, then we leave.",
    },
    {
      title: "clarification moves",
      points: [
        "rephrase key point",
        "ask for clarity",
        "confirm meaning",
      ],
      example: "Let me put it another way.",
    },
    {
      title: "summaries",
      points: [
        "in short",
        "to sum up",
        "main point recap",
      ],
      example: "In short, we are ready.",
    },
    {
      title: "emphasis and repetition",
      points: [
        "stress key idea",
        "repeat for focus",
        "signal emphasis",
      ],
      example: "It is really important.",
    },
    {
      title: "conversation flow",
      points: [
        "turn taking",
        "listening signals",
        "smooth exchange",
      ],
      example: "I see, please continue.",
    },
    {
      title: "giving examples",
      points: [
        "for example",
        "for instance",
        "such as",
      ],
      example: "For example, call the help desk.",
    },
    {
      title: "repair and correction",
      points: [
        "self correction",
        "clarify quickly",
        "restart phrasing",
      ],
      example: "Sorry, let me try again.",
    },
  ],
};


const createTranslationShell = () => {
  const shell = {};
  BASE_LANGUAGES.forEach((lang) => {
    shell[lang] = "";
  });
  return shell;
};

const buildWorldGrammarMaps = () => {
  if (!WORLD_TRANSLATIONS?.grammar) {
    WORLD_GRAMMAR_TITLE_MAP = null;
    WORLD_GRAMMAR_EXAMPLE_MAP = null;
    return;
  }
  const titles = WORLD_TRANSLATIONS.grammar.titles || {};
  const examples = WORLD_TRANSLATIONS.grammar.examples || {};
  WORLD_GRAMMAR_TITLE_MAP = {};
  WORLD_GRAMMAR_EXAMPLE_MAP = {};
  Object.entries(titles).forEach(([section, items]) => {
    const map = {};
    Object.entries(items || {}).forEach(([translatedTitle, payload]) => {
      const source = String(payload?.source || "").toLowerCase();
      if (source) {
        map[source] = translatedTitle;
      }
    });
    WORLD_GRAMMAR_TITLE_MAP[section] = map;
  });
  Object.entries(examples).forEach(([section, items]) => {
    const map = {};
    Object.entries(items || {}).forEach(([translatedSentence, payload]) => {
      const source = String(payload?.source || "").toLowerCase();
      if (source) {
        map[source] = translatedSentence;
      }
    });
    WORLD_GRAMMAR_EXAMPLE_MAP[section] = map;
  });
};

const getWorldWordList = (section) => {
  const fromWorld = WORLD_TRANSLATIONS?.words?.[section];
  if (fromWorld && typeof fromWorld === "object") {
    return Object.keys(fromWorld);
  }
  return WORD_SECTION_LISTS[section] || [];
};

const getWorldPhraseList = (section) => {
  const fromWorld = WORLD_TRANSLATIONS?.phrases?.[section];
  if (fromWorld && typeof fromWorld === "object") {
    return Object.keys(fromWorld);
  }
  return PHRASE_SECTION_LISTS[section] || [];
};

const getWorldGrammarTitle = (section, title) => {
  const map = WORLD_GRAMMAR_TITLE_MAP?.[section];
  const key = String(title || "").toLowerCase();
  return map?.[key] || title;
};

const getWorldGrammarExample = (section, englishExample) => {
  const map = WORLD_GRAMMAR_EXAMPLE_MAP?.[section];
  const key = String(englishExample || "").toLowerCase();
  return map?.[key] || englishExample;
};

const WORD_TRANSLATIONS = Object.fromEntries(
  WORD_SECTION_ORDER.map((section) => [
    section,
    Object.fromEntries(
      (WORD_SECTION_LISTS[section] || []).map((word) => [
        word.toLowerCase(),
        createTranslationShell(),
      ])
    ),
  ])
);

const PHRASE_TRANSLATIONS = Object.fromEntries(
  PHRASE_SECTION_ORDER.map((section) => [
    section,
    Object.fromEntries(
      (PHRASE_SECTION_LISTS[section] || []).map((phrase) => [
        phrase.toLowerCase(),
        createTranslationShell(),
      ])
    ),
  ])
);

const GRAMMAR_TRANSLATIONS = Object.fromEntries(
  GRAMMAR_SECTION_ORDER.map((section) => [
    section,
    Object.fromEntries(
      (GRAMMAR_SECTION_LISTS[section] || []).map((card) => [
        (card.example || "").toLowerCase(),
        createTranslationShell(),
      ])
    ),
  ])
);

const GRAMMAR_EXPLANATION_TRANSLATIONS = Object.fromEntries(
  GRAMMAR_SECTION_ORDER.map((section) => [section, {}])
);

const ensureGrammarExplanationEntry = (section, key) => {
  if (!section || !key) {
    return null;
  }
  if (!GRAMMAR_EXPLANATION_TRANSLATIONS[section]) {
    GRAMMAR_EXPLANATION_TRANSLATIONS[section] = {};
  }
  if (!GRAMMAR_EXPLANATION_TRANSLATIONS[section][key]) {
    GRAMMAR_EXPLANATION_TRANSLATIONS[section][key] = createTranslationShell();
  }
  return GRAMMAR_EXPLANATION_TRANSLATIONS[section][key];
};

const hydrateGrammarExplanationTranslations = (data) => {
  if (!data || typeof data !== "object") {
    return;
  }
  const explanations = data.grammar?.explanations;
  if (explanations && typeof explanations === "object") {
    Object.entries(explanations).forEach(([section, items]) => {
      Object.values(items || {}).forEach((payload) => {
        const source = String(payload?.source || "").toLowerCase().trim();
        if (!source) {
          return;
        }
        const entry = ensureGrammarExplanationEntry(section, source);
        if (!entry) {
          return;
        }
        const translations = payload?.translations;
        if (translations && typeof translations === "object") {
          Object.entries(translations).forEach(([lang, value]) => {
            if (typeof value === "string" && value.trim()) {
              entry[String(lang).toLowerCase()] = value;
            }
          });
        }
      });
    });
  }

  const legacy = data.grammarExplanations;
  const legacyLang = String(data.worldLanguage || "").toLowerCase();
  if (legacy && typeof legacy === "object" && legacyLang) {
    Object.entries(legacy).forEach(([section, items]) => {
      Object.entries(items || {}).forEach(([sourceText, translation]) => {
        const key = String(sourceText || "").toLowerCase().trim();
        if (!key || typeof translation !== "string" || !translation.trim()) {
          return;
        }
        const entry = ensureGrammarExplanationEntry(section, key);
        if (!entry) {
          return;
        }
        entry[legacyLang] = translation;
      });
    });
  }
};

const hydrateTranslations = (target, source) => {
  if (!source || typeof source !== "object") {
    return;
  }
  Object.entries(source).forEach(([section, items]) => {
    if (!items || typeof items !== "object") {
      return;
    }
    if (!target[section]) {
      target[section] = {};
    }
    Object.entries(items).forEach(([key, langs]) => {
      const normalizedKey = String(key).toLowerCase();
      if (!target[section][normalizedKey]) {
        target[section][normalizedKey] = createTranslationShell();
      }
      if (langs && typeof langs === "object") {
        Object.entries(langs).forEach(([lang, value]) => {
          if (typeof value === "string" && value.trim()) {
            target[section][normalizedKey][String(lang).toLowerCase()] = value;
          }
        });
      }
    });
  });
};

const loadTranslations = async () => {
  try {
    let explanationPackLoaded = false;
    const baseResponse = await fetch("translations.json", { cache: "no-store" });
    if (baseResponse.ok) {
      const baseData = await baseResponse.json();
      hydrateTranslations(WORD_TRANSLATIONS, baseData.words);
      hydrateTranslations(PHRASE_TRANSLATIONS, baseData.phrases);
      hydrateTranslations(GRAMMAR_TRANSLATIONS, baseData.grammar);
      if (baseData?.grammar?.explanations || baseData?.grammarExplanations) {
        hydrateGrammarExplanationTranslations(baseData);
        explanationPackLoaded = true;
      }
    }
    if (!explanationPackLoaded) {
      try {
        const explanationResponse = await fetch("translations.french.json", { cache: "no-store" });
        if (explanationResponse.ok) {
          const explanationData = await explanationResponse.json();
          hydrateGrammarExplanationTranslations(explanationData);
          explanationPackLoaded = true;
        }
      } catch (error) {
        console.warn("Failed to load translations.french.json", error);
      }
    }
    if (isNonEnglishWorld && WORLD_TRANSLATION_FILE !== "translations.json") {
      const response = await fetch(WORLD_TRANSLATION_FILE, { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (data?.worldLanguage) {
        WORLD_TRANSLATIONS = data;
        buildWorldGrammarMaps();
        hydrateGrammarExplanationTranslations(data);
      }
    }
  } catch (error) {
    console.warn("Failed to load translations.json", error);
  }
};

const renderWordsSections = () => {
  const container = document.getElementById("wordsSections");
  const controls = document.getElementById("wordsControls");
  if (!container) {
    return;
  }
  container.innerHTML = "";
  if (controls) {
    controls.innerHTML = "";
  }

  const sections = [];
  WORD_SECTION_ORDER.forEach((sectionName) => {
    const words = getWorldWordList(sectionName);
    if (!words) {
      return;
    }
    const section = document.createElement("section");
    section.className = "section words-group reveal";
    section.dataset.section = sectionName;
    const title = document.createElement("div");
    title.className = "section-title";
    title.innerHTML = `<h2>${sectionName}</h2>`;
    const grid = document.createElement("div");
    grid.className = "words-grid";
    words.forEach((word) => {
      const card = document.createElement("div");
      card.className = "card word-card";
      card.dataset.word = word;
      card.innerHTML = `
        <div class="word">${word}</div>
        <div class="word-translation"></div>
        <button class="word-audio" type="button" data-word="${word}" aria-hidden="true" tabindex="-1">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M5 9v6h4l5 4V5l-5 4H5Z" fill="currentColor"/>
            <path d="M17 8c1.5 1.2 2.5 3 2.5 4.9S18.5 16.7 17 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </button>
      `;
      grid.appendChild(card);
    });
    section.appendChild(title);
    section.appendChild(grid);
    container.appendChild(section);
    sections.push(section);
  });

  if (controls) {
    const eyebrow = document.createElement("div");
    eyebrow.className = "words-controls-eyebrow";
    eyebrow.textContent = "Words";
    const label = document.createElement("div");
    label.className = "words-controls-label";
    label.textContent = "Choose a section";
    const list = document.createElement("div");
    list.className = "words-controls-list";

    const makeButton = (title, value) => {
      const button = document.createElement("button");
      button.className = "words-filter";
      button.type = "button";
      button.dataset.filter = value;
      button.textContent = title;
      return button;
    };

    const allButton = makeButton("All sections", "all");
    allButton.classList.add("is-all");
    allButton.classList.add("is-active");
    list.appendChild(allButton);
    if (document.body.classList.contains("words-page")) {
      document.body.dataset.wordsFilter = "all";
    }

    WORD_SECTION_ORDER.forEach((sectionName) => {
      const displayName = sectionName === "countries" ? "Countries" : sectionName;
      list.appendChild(makeButton(displayName, sectionName));
    });

    const applyFilter = (filter) => {
      if (document.body.classList.contains("words-page")) {
        document.body.dataset.wordsFilter = filter;
      }
      sections.forEach((section) => {
        const show = filter === "all" || section.dataset.section === filter;
        section.style.display = show ? "" : "none";
        if (show) {
          section.classList.add("is-visible");
        } else {
          section.classList.remove("is-visible");
        }
      });
      updateWordsTopState();
    };

    list.addEventListener("click", (event) => {
      const button = event.target.closest(".words-filter");
      if (!button) {
        return;
      }
      list.querySelectorAll(".words-filter").forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      const filter = button.dataset.filter || "all";
      applyFilter(filter);
      if (filter === "all") {
        const first = sections[0];
        if (first) {
          const nav = document.querySelector(".nav");
          const navHeight = nav ? nav.offsetHeight : 0;
          const offset = Math.max(0, navHeight - 60);
          const y = first.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        } else {
          const nav = document.querySelector(".nav");
          const navHeight = nav ? nav.offsetHeight : 0;
          const offset = Math.max(0, navHeight - 60);
          const y = container.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }
      } else {
        const target = sections.find((section) => section.dataset.section === filter);
        if (target) {
          const nav = document.querySelector(".nav");
          const navHeight = nav ? nav.offsetHeight : 0;
          const offset = Math.max(0, navHeight - 60);
          const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }
      }
    });

    controls.appendChild(eyebrow);
    controls.appendChild(label);
    controls.appendChild(list);
  }
};

const renderPhrasesSections = () => {
  const container = document.getElementById("phrasesSections");
  const controls = document.getElementById("phrasesControls");
  if (!container) {
    return;
  }
  container.innerHTML = "";
  if (controls) {
    controls.innerHTML = "";
  }

  const sections = [];
  PHRASE_SECTION_ORDER.forEach((sectionName) => {
    const phrases = getWorldPhraseList(sectionName);
    if (!phrases) {
      return;
    }
    const section = document.createElement("section");
    section.className = "section phrases-group reveal";
    section.dataset.section = sectionName;
    const title = document.createElement("div");
    title.className = "section-title";
    title.innerHTML = `<h2>${sectionName}</h2>`;
    const grid = document.createElement("div");
    grid.className = "words-grid";
    phrases.forEach((phrase) => {
      const card = document.createElement("div");
      card.className = "card phrase-card";
      card.dataset.phrase = phrase;
      card.innerHTML = `
        <div class="phrase-text">${phrase}</div>
        <div class="phrase-translation"></div>
        <button class="word-audio" type="button" data-word="${phrase}" aria-hidden="true" tabindex="-1">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M5 9v6h4l5 4V5l-5 4H5Z" fill="currentColor"/>
            <path d="M17 8c1.5 1.2 2.5 3 2.5 4.9S18.5 16.7 17 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </button>
      `;
      grid.appendChild(card);
    });
    section.appendChild(title);
    section.appendChild(grid);
    container.appendChild(section);
    sections.push(section);
  });

  if (controls) {
    const eyebrow = document.createElement("div");
    eyebrow.className = "words-controls-eyebrow";
    eyebrow.textContent = "Phrases";
    const label = document.createElement("div");
    label.className = "words-controls-label";
    label.textContent = "Choose a section";
    const list = document.createElement("div");
    list.className = "words-controls-list";

    const makeButton = (title, value) => {
      const button = document.createElement("button");
      button.className = "words-filter";
      button.type = "button";
      button.dataset.filter = value;
      button.textContent = title;
      return button;
    };

    const allButton = makeButton("All sections", "all");
    allButton.classList.add("is-all");
    allButton.classList.add("is-active");
    list.appendChild(allButton);
    if (document.body.classList.contains("phrases-page")) {
      document.body.dataset.phrasesFilter = "all";
    }

    PHRASE_SECTION_ORDER.forEach((sectionName) => {
      list.appendChild(makeButton(sectionName, sectionName));
    });

    const applyFilter = (filter) => {
      if (document.body.classList.contains("phrases-page")) {
        document.body.dataset.phrasesFilter = filter;
      }
      sections.forEach((section) => {
        const show = filter === "all" || section.dataset.section === filter;
        section.style.display = show ? "" : "none";
        if (show) {
          section.classList.add("is-visible");
        } else {
          section.classList.remove("is-visible");
        }
      });
      updatePhrasesTopState();
    };

    list.addEventListener("click", (event) => {
      const button = event.target.closest(".words-filter");
      if (!button) {
        return;
      }
      list.querySelectorAll(".words-filter").forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      const filter = button.dataset.filter || "all";
      applyFilter(filter);
      if (filter === "all") {
        const first = sections[0];
        if (first) {
          const nav = document.querySelector(".nav");
          const navHeight = nav ? nav.offsetHeight : 0;
          const offset = Math.max(0, navHeight - 60);
          const y = first.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        } else {
          const nav = document.querySelector(".nav");
          const navHeight = nav ? nav.offsetHeight : 0;
          const offset = Math.max(0, navHeight - 60);
          const y = container.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }
      } else {
        const target = sections.find((section) => section.dataset.section === filter);
        if (target) {
          const nav = document.querySelector(".nav");
          const navHeight = nav ? nav.offsetHeight : 0;
          const offset = Math.max(0, navHeight - 60);
          const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }
      }
    });

    controls.appendChild(eyebrow);
    controls.appendChild(label);
    controls.appendChild(list);
  }
};

const renderGrammarSections = () => {
  const container = document.getElementById("grammarSections");
  const controls = document.getElementById("grammarControls");
  if (!container) {
    return;
  }
  container.innerHTML = "";
  if (controls) {
    controls.innerHTML = "";
  }

  const sections = [];
  GRAMMAR_SECTION_ORDER.forEach((sectionName) => {
    const concepts = GRAMMAR_SECTION_LISTS[sectionName];
    if (!concepts) {
      return;
    }
    const section = document.createElement("section");
    section.className = "section grammar-group reveal";
    section.dataset.section = sectionName;
    const title = document.createElement("div");
    title.className = "section-title";
    title.innerHTML = `<h2>${sectionName}</h2>`;
    const grid = document.createElement("div");
    grid.className = "words-grid";
    concepts.forEach((concept, conceptIndex) => {
      const card = document.createElement("div");
      card.className = "card grammar-card";
      card.dataset.concept = concept.title;
      card.dataset.section = sectionName;
      card.dataset.index = String(conceptIndex);
      const displayTitle = getWorldGrammarTitle(sectionName, concept.title);
      card.innerHTML = `<div class="grammar-text">${displayTitle}</div>`;
      grid.appendChild(card);
    });
    section.appendChild(title);
    section.appendChild(grid);
    container.appendChild(section);
    sections.push(section);
  });

  if (controls) {
    const eyebrow = document.createElement("div");
    eyebrow.className = "words-controls-eyebrow";
    eyebrow.textContent = "Grammar";
    const label = document.createElement("div");
    label.className = "words-controls-label";
    label.textContent = "Choose a section";
    const list = document.createElement("div");
    list.className = "words-controls-list";

    const makeButton = (title, value) => {
      const button = document.createElement("button");
      button.className = "words-filter";
      button.type = "button";
      button.dataset.filter = value;
      button.textContent = title;
      return button;
    };

    const allButton = makeButton("All sections", "all");
    allButton.classList.add("is-all");
    allButton.classList.add("is-active");
    list.appendChild(allButton);
    if (document.body.classList.contains("grammar-page")) {
      document.body.dataset.grammarFilter = "all";
    }

    GRAMMAR_SECTION_ORDER.forEach((sectionName) => {
      list.appendChild(makeButton(sectionName, sectionName));
    });

    const applyFilter = (filter) => {
      if (document.body.classList.contains("grammar-page")) {
        document.body.dataset.grammarFilter = filter;
      }
      sections.forEach((section) => {
        const show = filter === "all" || section.dataset.section === filter;
        section.style.display = show ? "" : "none";
        if (show) {
          section.classList.add("is-visible");
        } else {
          section.classList.remove("is-visible");
        }
      });
      updateGrammarTopState();
    };

    list.addEventListener("click", (event) => {
      const button = event.target.closest(".words-filter");
      if (!button) {
        return;
      }
      list.querySelectorAll(".words-filter").forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      const filter = button.dataset.filter || "all";
      applyFilter(filter);
      if (filter === "all") {
        const first = sections[0];
        if (first) {
          const nav = document.querySelector(".nav");
          const navHeight = nav ? nav.offsetHeight : 0;
          const offset = Math.max(0, navHeight - 60);
          const y = first.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        } else {
          const nav = document.querySelector(".nav");
          const navHeight = nav ? nav.offsetHeight : 0;
          const offset = Math.max(0, navHeight - 60);
          const y = container.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }
      } else {
        const target = sections.find((section) => section.dataset.section === filter);
        if (target) {
          const nav = document.querySelector(".nav");
          const navHeight = nav ? nav.offsetHeight : 0;
          const offset = Math.max(0, navHeight - 60);
          const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }
      }
    });

    controls.appendChild(eyebrow);
    controls.appendChild(label);
    controls.appendChild(list);
  }
};

const buildAltGrammarExample = (() => {
  const subjects = [
    "We",
    "They",
    "You",
    "People",
    "Friends",
    "Students",
    "Workers",
    "Families",
    "Teams",
    "Neighbors",
  ];
  const verbs = [
    "meet",
    "visit",
    "need",
    "want",
    "call",
    "help",
    "check",
    "finish",
    "start",
    "plan",
    "share",
    "order",
  ];
  const objects = [
    "the manager",
    "the schedule",
    "the report",
    "a ticket",
    "the plan",
    "the task",
    "the room",
    "the meeting",
    "the email",
    "the project",
    "the map",
    "the problem",
  ];
  const times = [
    "today",
    "this morning",
    "tonight",
    "this week",
    "later",
    "tomorrow",
    "right now",
    "after lunch",
    "this evening",
    "next week",
  ];

  return (card, index) => {
    if (card && card.title.toLowerCase().includes("adding details")) {
      return "We talked in the kitchen after dinner because it was late.";
    }
    const s = subjects[index % subjects.length];
    const v = verbs[Math.floor(index / subjects.length) % verbs.length];
    const o =
      objects[
        Math.floor(index / (subjects.length * verbs.length)) % objects.length
      ];
    const t =
      times[
        Math.floor(
          index /
            (subjects.length * verbs.length * objects.length)
        ) % times.length
      ];
    return `${s} ${v} ${o} ${t}.`;
  };
})();

const buildGrammarExplanation = (card) => {
  return `This card explains ${card.title} and how to form it clearly in real sentences.`;
};

const resolveGrammarExplanation = (section, explanationText, baseLanguage) => {
  const sectionKey = section || GRAMMAR_SECTION_ORDER[0];
  const key = (explanationText || "").toLowerCase().trim();
  const langKey = (baseLanguage || "").toLowerCase();
  if (!langKey) {
    return "";
  }
  const entry = GRAMMAR_EXPLANATION_TRANSLATIONS?.[sectionKey]?.[key];
  if (!entry) {
    return "";
  }
  return entry[langKey] || "";
};

const GRAMMAR_TEMPLATES = {
  "basic word order": "subject + verb + object",
  "sentence parts": "subject + verb + object + complement",
  "adding details": "subject + verb + object + (time) + (place) + (reason)",
  "linking clauses": "main clause + connector + clause",
  "sentence variety": "short sentence + longer sentence",
  "action verbs": "subject + action verb + object",
  "state verbs": "subject + state verb + complement",
  "linking verbs": "subject + linking verb + adjective/noun",
  "verb patterns": "verb + object | verb + adjective | verb + preposition",
  "verb combinations": "verb + to-infinitive | verb + -ing",
  "phrasal verbs": "verb + particle + object",
  "present simple": "subject + base verb",
  "present continuous": "subject + be + verb-ing",
  "past simple": "subject + past verb",
  "past continuous": "subject + was/were + verb-ing",
  "present perfect": "subject + have/has + past participle",
  "past perfect": "subject + had + past participle",
  "future forms": "will + base verb | be going to + base verb",
  "future continuous": "will be + verb-ing",
  "future perfect": "will have + past participle",
  "aspect contrasts": "simple = whole; continuous = in progress; perfect = result",
  "countable nouns": "a/an + noun | two + nouns",
  "uncountable nouns": "some + noun | much + noun",
  "articles": "a/an + noun | the + noun | no article",
  "plural forms": "noun + -s/-es",
  "possessive nouns": "noun + 's",
  "noun phrases": "determiner + adjective + noun",
  "quantifiers": "some/any/many/much + noun",
  "subject pronouns": "subject pronoun + verb",
  "object pronouns": "verb + object pronoun",
  "possessive forms": "my/your + noun | mine/yours",
  "reflexive pronouns": "subject + verb + reflexive",
  "demonstratives": "this/that/these/those + noun",
  "relative reference": "noun + who/which/that + clause",
  "indefinite reference": "someone/anyone/anything",
  "adjectives basics": "adjective + noun",
  "adjective order": "opinion + size + age + color + noun",
  "comparatives": "adj-er/more + than",
  "superlatives": "the + adj-est/most + noun",
  "adverbs basics": "verb + adverb",
  "frequency adverbs": "always/often + verb",
  "time and place adverbs": "verb + time/place adverb",
  "degree words": "very/too/enough + adjective",
  "participles": "boring/ bored + noun/person",
  "modifier stacking": "multiple modifiers before noun",
  "yes no questions": "do/does + subject + verb",
  "wh questions": "wh-word + do/does + subject + verb",
  "questions with be": "be + subject + complement",
  "questions with do": "do/does + subject + verb",
  "questions with modals": "modal + subject + base verb",
  "tag questions": "statement, auxiliary + pronoun?",
  "indirect questions": "intro + wh-word + subject + verb",
  "not with be": "subject + be + not + complement",
  "not with do": "subject + do/does + not + verb",
  "negative short forms": "don't/doesn't/isn't",
  "negative words": "no/none/never/nothing",
  "negative questions": "don't/doesn't + subject + verb?",
  "limited negatives": "hardly/barely/rarely + verb",
  "basic connectors": "and/but/or + clause",
  "reason and result": "because/so + clause",
  "contrast and choice": "but/although/either/or",
  "time connectors": "before/after/when + clause",
  "comparison links": "like/as/than + clause",
  "adding ideas": "also/in addition + clause",
  "ordering ideas": "first/then/finally + clause",
  "real conditions": "if + present, present",
  "future conditions": "if + present, will + verb",
  "unreal present": "if + past, would + verb",
  "unreal past": "if + had, would have + past participle",
  "mixed conditions": "if + past perfect, would + base verb",
  "unless and otherwise": "unless + clause, result",
  "active voice": "subject + verb + object",
  "passive voice": "object + be + past participle",
  "focus shifts": "fronted phrase + sentence",
  "cleft sentences": "it is/was + focus + that + clause",
  "there and it subjects": "there is/are | it is/was",
  "ability": "can/could + base verb",
  "permission": "can/may + base verb",
  "obligation": "must/have to + base verb",
  "advice": "should/ought to + base verb",
  "possibility": "may/might + base verb",
  "probability": "will/probably + verb",
  "polite requests": "could you + base verb",
  "offers and invitations": "would you like to + verb",
  "reporting statements": "said (that) + clause",
  "reporting questions": "asked + if/wh-word + clause",
  "reporting requests": "asked + to + verb",
  "reporting commands": "told + to + verb",
  "backshift basics": "present -> past, will -> would",
  "time place changes": "today -> that day, here -> there",
  "formal vs informal": "formal forms vs casual forms",
  "contractions": "I'm/you're vs I am/you are",
  "polite softening": "could/would + verb",
  "spoken vs written": "short spoken vs structured written",
  "professional style": "clear, neutral tone",
  "casual style": "simple, relaxed tone",
  "clarity and brevity": "short, direct sentences",
  "opening and closing": "greet + close",
  "topic shifts": "new topic + link",
  "cohesion tools": "this/that/these + noun",
  "sequencing ideas": "first/next/then",
  "clarification moves": "do you mean + ...",
  "summaries": "in short/in summary",
  "emphasis and repetition": "really + verb | do + verb",
  "conversation flow": "turn-taking signals",
  "giving examples": "for example + clause",
  "repair and correction": "sorry, I mean + ...",
};

const expandGrammarPoint = (point) => {
  const lower = point.toLowerCase();
  if (lower.includes("time")) {
    return `${point} (yesterday, at noon)`;
  }
  if (lower.includes("place")) {
    return `${point} (at the station, in the kitchen)`;
  }
  if (lower.includes("reason")) {
    return `${point} (because it rained)`;
  }
  if (lower.includes("manner")) {
    return `${point} (quickly, with care)`;
  }
  if (lower.includes("question")) {
    return `${point} (who, what, where, why)`;
  }
  if (lower.includes("article")) {
    return `${point} (a, an, the)`;
  }
  if (lower.includes("pronoun")) {
    return `${point} (he, she, they)`;
  }
  if (lower.includes("connector")) {
    return `${point} (and, but, because)`;
  }
  if (lower.includes("modal")) {
    return `${point} (can, should, must)`;
  }
  return point;
};

const buildStructureExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("basic word order")) {
    return [
      {
        labels: ["Subject: she", "Verb: reads", "Object: a book"],
        base: "She reads.",
        expanded: "She reads a book.",
      },
      {
        labels: ["Subject: The dog", "Verb: runs", "Place: in the park"],
        base: "The dog runs.",
        expanded: "The dog runs in the park.",
      },
      {
        labels: ["Subject: We", "Verb: made", "Object: dinner", "Place: at home"],
        base: "We made it.",
        expanded: "We made dinner at home.",
      },
    ];
  }
  if (title.includes("sentence parts")) {
    return [
      {
        labels: [
          "Subject: They",
          "Verb: named",
          "Object: her",
          "Complement: captain",
        ],
        base: "They named her captain.",
        expanded: "They named her captain today.",
      },
      {
        labels: [
          "Subject: My sister",
          "Verb: is",
          "Complement: a pilot",
          "Place: at the airport",
        ],
        base: "My sister is a pilot.",
        expanded: "My sister is a pilot at the airport.",
      },
      {
        labels: [
          "Subject: The room",
          "Verb: feels",
          "Complement: cold",
          "Time: after sunset",
        ],
        base: "The room feels cold.",
        expanded: "The room feels cold after sunset.",
      },
    ];
  }
  if (title.includes("adding details")) {
    return [
      {
        labels: [
          "Subject: She",
          "Verb: met",
          "Object: him",
          "Time: at noon",
          "Place: at the station",
        ],
        base: "She met him.",
        expanded: "She met him at noon at the station.",
      },
      {
        labels: [
          "Subject: We",
          "Verb: talked",
          "Place: in the kitchen",
          "Time: after dinner",
        ],
        base: "We talked.",
        expanded: "We talked in the kitchen after dinner.",
      },
      {
        labels: [
          "Subject: I",
          "Verb: stayed",
          "Place: in the kitchen",
          "Time: after dinner",
          "Reason: because it was late",
        ],
        base: "I stayed.",
        expanded: "I stayed in the kitchen after dinner because it was late.",
      },
    ];
  }
  if (title.includes("linking clauses")) {
    return [
      {
        labels: [
          "Main clause: I stayed home",
          "Connector: because",
          "Clause: it rained",
        ],
        base: "I stayed home.",
        expanded: "I stayed home because it rained.",
      },
      {
        labels: [
          "Main clause: She left early",
          "Connector: so",
          "Clause: she could rest",
        ],
        base: "She left early.",
        expanded: "She left early so she could rest.",
      },
      {
        labels: [
          "Main clause: We waited",
          "Connector: until",
          "Clause: the bus arrived",
        ],
        base: "We waited.",
        expanded: "We waited until the bus arrived.",
      },
    ];
  }
  if (title.includes("sentence variety")) {
    return [
      {
        labels: [
          "Short sentence: We finished early",
          "Long sentence: We went home after class because we were tired",
        ],
        base: "We finished early.",
        expanded: "We finished early. We went home after class because we were tired.",
      },
      {
        labels: [
          "Short sentence: He called me",
          "Long sentence: I missed it because I was busy",
        ],
        base: "He called me.",
        expanded: "He called me. I missed it because I was busy.",
      },
      {
        labels: [
          "Short sentence: We met",
          "Long sentence: We talked for a while after class",
        ],
        base: "We met.",
        expanded: "We met. We talked for a while after class.",
      },
    ];
  }
  return null;
};

const buildVerbExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("action verbs")) {
    return [
      {
        labels: ["Subject: They", "Action verb: carry", "Object: the boxes"],
        base: "They carry the boxes.",
        expanded: "They carry the boxes.",
      },
    ];
  }
  if (title.includes("state verbs")) {
    return [
      {
        labels: ["Subject: She", "State verb: feels", "Complement: tired"],
        base: "She feels tired.",
        expanded: "She feels tired.",
      },
    ];
  }
  if (title.includes("linking verbs")) {
    return [
      {
        labels: ["Subject: The room", "Linking verb: feels", "Complement: quiet"],
        base: "The room feels quiet.",
        expanded: "The room feels quiet.",
      },
    ];
  }
  if (title.includes("verb patterns")) {
    return [
      {
        labels: ["Verb: placed", "Preposition: on", "Object: the table"],
        base: "placed on the table",
        expanded: "He placed the book on the table.",
      },
    ];
  }
  if (title.includes("verb combinations")) {
    return [
      {
        labels: [
          "Verb: decided",
          "Infinitive: to stay",
          "Gerund: learning",
          "That clause: that it helps",
        ],
        base: "decided to stay, learning, that it helps",
        expanded: "We decided to stay, enjoy learning, and believe that it helps.",
      },
    ];
  }
  if (title.includes("phrasal verbs")) {
    return [
      {
        labels: ["Verb: turned", "Particle: off", "Object: the light"],
        base: "turned off the light",
        expanded: "She turned off the light.",
      },
    ];
  }
  return null;
};

const buildTenseExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("present simple")) {
    return [
      {
        labels: ["Subject: She", "Verb: works"],
        base: "She works every day.",
        expanded: "She works every day.",
      },
    ];
  }
  if (title.includes("present continuous")) {
    return [
      {
        labels: ["Subject: She", "Be verb: is", "Verb-ing: working"],
        base: "She is working now.",
        expanded: "She is working now.",
      },
    ];
  }
  if (title.includes("past simple")) {
    return [
      {
        labels: ["Subject: They", "Past verb: visited"],
        base: "They visited Paris.",
        expanded: "They visited Paris.",
      },
    ];
  }
  if (title.includes("past continuous")) {
    return [
      {
        labels: ["Subject: I", "Be verb: was", "Verb-ing: cooking"],
        base: "I was cooking.",
        expanded: "I was cooking.",
      },
    ];
  }
  if (title.includes("present perfect")) {
    return [
      {
        labels: ["Subject: He", "Auxiliary: has", "Past participle: lived"],
        base: "He has lived here for years.",
        expanded: "He has lived here for years.",
      },
    ];
  }
  if (title.includes("past perfect")) {
    return [
      {
        labels: ["Subject: She", "Auxiliary: had", "Past participle: left"],
        base: "She had left earlier.",
        expanded: "She had left earlier.",
      },
    ];
  }
  if (title.includes("future forms")) {
    return [
      {
        labels: ["Subject: We", "Future marker: will", "Base verb: meet"],
        base: "We will meet tomorrow.",
        expanded: "We will meet tomorrow.",
      },
    ];
  }
  if (title.includes("future continuous")) {
    return [
      {
        labels: [
          "Subject: I",
          "Future marker: will",
          "Be verb: be",
          "Verb-ing: working",
        ],
        base: "I will be working at six.",
        expanded: "I will be working at six.",
      },
    ];
  }
  if (title.includes("future perfect")) {
    return [
      {
        labels: [
          "Subject: They",
          "Future marker: will",
          "Auxiliary: have",
          "Past participle: finished",
        ],
        base: "They will have finished by Friday.",
        expanded: "They will have finished by Friday.",
      },
    ];
  }
  if (title.includes("aspect contrasts")) {
    return [
      {
        labels: ["Simple form: work", "Continuous form: am working"],
        base: "I work. I am working now.",
        expanded: "I work. I am working now.",
      },
    ];
  }
  return null;
};

const buildNounExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("countable nouns")) {
    return [
      {
        labels: ["Number: Two", "Noun: apples"],
        base: "Two apples are on the table.",
        expanded: "Two apples are on the table.",
      },
    ];
  }
  if (title.includes("uncountable nouns")) {
    return [
      {
        labels: ["Quantifier: Some", "Noun: rice"],
        base: "We need some rice.",
        expanded: "We need some rice.",
      },
    ];
  }
  if (title.includes("articles")) {
    return [
      {
        labels: ["Article: A", "Noun: dog"],
        base: "A dog is outside.",
        expanded: "A dog is outside.",
      },
    ];
  }
  if (title.includes("plural forms")) {
    return [
      {
        labels: ["Plural noun: boxes"],
        base: "The boxes are heavy.",
        expanded: "The boxes are heavy.",
      },
    ];
  }
  if (title.includes("possessive nouns")) {
    return [
      {
        labels: ["Possessive: Sara's", "Noun: phone"],
        base: "Sara's phone is new.",
        expanded: "Sara's phone is new.",
      },
    ];
  }
  if (title.includes("noun phrases")) {
    return [
      {
        labels: ["Determiner: The", "Adjective: small", "Noun: table"],
        base: "The small table broke.",
        expanded: "The small table broke.",
      },
    ];
  }
  if (title.includes("quantifiers")) {
    return [
      {
        labels: ["Quantifier: many", "Noun: options"],
        base: "There are many options.",
        expanded: "There are many options.",
      },
    ];
  }
  return null;
};

const buildPronounExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("subject pronouns")) {
    return [
      {
        labels: ["Subject pronoun: She", "Verb: is"],
        base: "She is.",
        expanded: "She is.",
      },
    ];
  }
  if (title.includes("object pronouns")) {
    return [
      {
        labels: ["Verb: saw", "Object pronoun: him"],
        base: "Saw him.",
        expanded: "Saw him.",
      },
    ];
  }
  if (title.includes("possessive forms")) {
    return [
      {
        labels: ["Possessive: her", "Noun: bag"],
        base: "her bag",
        expanded: "her bag",
      },
    ];
  }
  if (title.includes("reflexive pronouns")) {
    return [
      {
        labels: ["Subject: I", "Verb: hurt", "Reflexive: myself"],
        base: "I hurt myself.",
        expanded: "I hurt myself.",
      },
    ];
  }
  if (title.includes("demonstratives")) {
    return [
      {
        labels: ["Demonstrative: those", "Noun: keys"],
        base: "those keys",
        expanded: "those keys",
      },
    ];
  }
  if (title.includes("relative reference")) {
    return [
      {
        labels: ["Noun: man", "Relative: who", "Clause: called"],
        base: "the man who called",
        expanded: "the man who called",
      },
    ];
  }
  if (title.includes("indefinite reference")) {
    return [
      {
        labels: ["Indefinite: someone", "Verb: is"],
        base: "Someone is.",
        expanded: "Someone is.",
      },
    ];
  }
  return null;
};

const buildModifierExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("adjectives basics")) {
    return [
      {
        labels: ["Adjective: quiet", "Noun: house"],
        base: "The quiet house is empty.",
        expanded: "The quiet house is empty.",
      },
    ];
  }
  if (title.includes("adjective order")) {
    return [
      {
        labels: [
          "Opinion: lovely",
          "Size: small",
          "Age: old",
          "Color: red",
          "Noun: bag",
        ],
        base: "a lovely small old red bag",
        expanded: "She bought a lovely small old red bag.",
      },
    ];
  }
  if (title.includes("comparatives")) {
    return [
      {
        labels: ["Comparative: faster", "Than: than"],
        base: "faster than",
        expanded: "This is faster than that.",
      },
    ];
  }
  if (title.includes("superlatives")) {
    return [
      {
        labels: ["Article: the", "Superlative: tallest"],
        base: "the tallest",
        expanded: "He is the tallest.",
      },
    ];
  }
  if (title.includes("adverbs basics")) {
    return [
      {
        labels: ["Verb: speaks", "Adverb: clearly"],
        base: "speaks clearly",
        expanded: "She speaks clearly.",
      },
    ];
  }
  if (title.includes("frequency adverbs")) {
    return [
      {
        labels: ["Frequency adverb: usually", "Verb: wakes"],
        base: "usually wakes",
        expanded: "She usually wakes early.",
      },
    ];
  }
  if (title.includes("time and place adverbs")) {
    return [
      {
        labels: ["Place adverb: here", "Time adverb: yesterday"],
        base: "here yesterday",
        expanded: "We met here yesterday.",
      },
    ];
  }
  if (title.includes("degree words")) {
    return [
      {
        labels: ["Degree word: very", "Adjective: warm"],
        base: "very warm",
        expanded: "The room is very warm.",
      },
    ];
  }
  if (title.includes("participles")) {
    return [
      {
        labels: ["Participle: boring", "Noun: movie"],
        base: "boring movie",
        expanded: "The boring movie ended early.",
      },
    ];
  }
  if (title.includes("modifier stacking")) {
    return [
      {
        labels: ["Adverb: quickly", "Adjective: hard", "Noun: question"],
        base: "quickly hard question",
        expanded: "She quickly answered the hard question.",
      },
    ];
  }
  return null;
};

const buildConditionExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("real conditions")) {
    return [
      {
        labels: ["If clause: if you press this", "Result clause: it starts"],
        base: "if you press this, it starts",
        expanded: "If you press this, it starts.",
      },
    ];
  }
  if (title.includes("future conditions")) {
    return [
      {
        labels: ["If clause: if it is sunny", "Result clause: we will go"],
        base: "if it is sunny, we will go",
        expanded: "If it is sunny, we will go.",
      },
    ];
  }
  if (title.includes("unreal present")) {
    return [
      {
        labels: ["If clause: if i had time", "Would clause: i would help"],
        base: "if i had time, i would help",
        expanded: "If I had time, I would help.",
      },
    ];
  }
  if (title.includes("unreal past")) {
    return [
      {
        labels: [
          "If clause: if we had left earlier",
          "Would have clause: we would have arrived",
        ],
        base: "if we had left earlier, we would have arrived",
        expanded: "If we had left earlier, we would have arrived.",
      },
    ];
  }
  if (title.includes("mixed conditions")) {
    return [
      {
        labels: ["If clause: if she studied", "Result clause: she would be calm"],
        base: "if she studied, she would be calm",
        expanded: "If she studied, she would be calm.",
      },
    ];
  }
  if (title.includes("unless and otherwise")) {
    return [
      {
        labels: ["Unless clause: unless it rains", "Result clause: we will go"],
        base: "we will go unless it rains",
        expanded: "We will go unless it rains.",
      },
    ];
  }
  return null;
};

const buildVoiceExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("active voice")) {
    return [
      {
        labels: ["Doer: the chef", "Action verb: cooked", "Object: dinner"],
        base: "the chef cooked dinner",
        expanded: "The chef cooked dinner.",
      },
    ];
  }
  if (title.includes("passive voice")) {
    return [
      {
        labels: ["Object: the meal", "Be verb: was", "Past participle: cooked"],
        base: "the meal was cooked",
        expanded: "The meal was cooked.",
      },
    ];
  }
  if (title.includes("focus shifts")) {
    return [
      {
        labels: [
          "Focus phrase: that book",
          "Subject: i",
          "Verb: finished",
        ],
        base: "that book, i finished",
        expanded: "That book, I finished yesterday.",
      },
    ];
  }
  if (title.includes("cleft sentences")) {
    return [
      {
        labels: [
          "It subject: it is",
          "Focus phrase: john",
          "Clause: who called",
        ],
        base: "it is john who called",
        expanded: "It is John who called.",
      },
    ];
  }
  if (title.includes("there and it subjects")) {
    return [
      {
        labels: ["There subject: there is", "Noun: a problem"],
        base: "there is a problem",
        expanded: "There is a problem.",
      },
    ];
  }
  return null;
};

const buildModalityExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("ability")) {
    return [
      {
        labels: ["Subject: she", "Modal: can", "Base verb: swim"],
        base: "she can swim",
        expanded: "She can swim.",
      },
    ];
  }
  if (title.includes("permission")) {
    return [
      {
        labels: ["Modal: may", "Subject: i", "Base verb: sit"],
        base: "may i sit",
        expanded: "May I sit here?",
      },
    ];
  }
  if (title.includes("obligation")) {
    return [
      {
        labels: ["Subject: you", "Modal: must", "Base verb: wear"],
        base: "you must wear",
        expanded: "You must wear a seatbelt.",
      },
    ];
  }
  if (title.includes("advice")) {
    return [
      {
        labels: ["Subject: you", "Modal: should", "Base verb: rest"],
        base: "you should rest",
        expanded: "You should rest.",
      },
    ];
  }
  if (title.includes("possibility")) {
    return [
      {
        labels: ["Modal: might", "Base verb: rain"],
        base: "might rain",
        expanded: "It might rain today.",
      },
    ];
  }
  if (title.includes("probability")) {
    return [
      {
        labels: [
          "Subject: he",
          "Modal: will",
          "Probability word: probably",
          "Base verb: come",
        ],
        base: "he will probably come",
        expanded: "He will probably come.",
      },
    ];
  }
  if (title.includes("polite requests")) {
    return [
      {
        labels: [
          "Modal: could",
          "Subject: you",
          "Base verb: open",
          "Object: the window",
        ],
        base: "could you open the window",
        expanded: "Could you open the window?",
      },
    ];
  }
  if (title.includes("offers and invitations")) {
    return [
      {
        labels: ["Modal phrase: would you like", "Object: some tea"],
        base: "would you like some tea",
        expanded: "Would you like some tea?",
      },
    ];
  }
  return null;
};

const buildQuestionExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("yes no questions")) {
    return [
      {
        labels: ["Aux: do", "Subject: you", "Base verb: work"],
        base: "do you work",
        expanded: "Do you work?",
      },
    ];
  }
  if (title.includes("wh questions")) {
    return [
      {
        labels: [
          "Wh word: where",
          "Aux: do",
          "Subject: you",
          "Base verb: live",
        ],
        base: "where do you live",
        expanded: "Where do you live?",
      },
    ];
  }
  if (title.includes("questions with be")) {
    return [
      {
        labels: ["Be verb: is", "Subject: the store", "Complement: open"],
        base: "is the store open",
        expanded: "Is the store open?",
      },
    ];
  }
  if (title.includes("questions with do")) {
    return [
      {
        labels: ["Aux: did", "Subject: she", "Base verb: call"],
        base: "did she call",
        expanded: "Did she call?",
      },
    ];
  }
  if (title.includes("questions with modals")) {
    return [
      {
        labels: ["Modal: could", "Subject: you", "Base verb: help"],
        base: "could you help",
        expanded: "Could you help?",
      },
    ];
  }
  if (title.includes("tag questions")) {
    return [
      {
        labels: ["Statement: you are ready", "Tag: aren't you"],
        base: "you are ready, aren't you",
        expanded: "You are ready, aren't you?",
      },
    ];
  }
  if (title.includes("indirect questions")) {
    return [
      {
        labels: ["Intro: could you tell me", "Wh clause: where it is"],
        base: "could you tell me where it is",
        expanded: "Could you tell me where it is?",
      },
    ];
  }
  return null;
};

const buildNegationExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("not with be")) {
    return [
      {
        labels: [
          "Subject: she",
          "Be verb: is",
          "Not: not",
          "Complement: ready",
        ],
        base: "she is not ready",
        expanded: "She is not ready.",
      },
    ];
  }
  if (title.includes("not with do")) {
    return [
      {
        labels: [
          "Subject: they",
          "Aux: do",
          "Not: not",
          "Base verb: agree",
        ],
        base: "they do not agree",
        expanded: "They do not agree.",
      },
    ];
  }
  if (title.includes("negative short forms")) {
    return [
      {
        labels: ["Subject: I", "Aux: don't", "Base verb: know"],
        base: "i don't know",
        expanded: "I don't know.",
      },
    ];
  }
  if (title.includes("negative words")) {
    return [
      {
        labels: ["Negative word: no", "Noun: milk"],
        base: "no milk",
        expanded: "There is no milk.",
      },
    ];
  }
  if (title.includes("negative questions")) {
    return [
      {
        labels: ["Aux: don't", "Subject: you", "Base verb: want", "Object: coffee"],
        base: "don't you want coffee",
        expanded: "Don't you want coffee?",
      },
    ];
  }
  if (title.includes("limited negatives")) {
    return [
      {
        labels: ["Subject: he", "Negative adverb: rarely", "Verb: eats"],
        base: "he rarely eats",
        expanded: "He rarely eats out.",
      },
    ];
  }
  return null;
};

const buildConnectionExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("basic connectors")) {
    return [
      {
        labels: [
          "Clause 1: I called",
          "Connector: but",
          "Clause 2: no one answered",
        ],
        base: "i called, but no one answered",
        expanded: "I called, but no one answered.",
      },
    ];
  }
  if (title.includes("reason and result")) {
    return [
      {
        labels: [
          "Reason clause: it rained",
          "Connector: so",
          "Result clause: we stayed",
        ],
        base: "it rained, so we stayed",
        expanded: "It rained, so we stayed.",
      },
    ];
  }
  if (title.includes("contrast and choice")) {
    return [
      {
        labels: [
          "Clause 1: she went",
          "Contrast connector: although",
          "Clause 2: she was tired",
        ],
        base: "she went, although she was tired",
        expanded: "She went, although she was tired.",
      },
    ];
  }
  if (title.includes("time connectors")) {
    return [
      {
        labels: ["Main clause: call me", "Time connector: when", "Clause: you arrive"],
        base: "call me when you arrive",
        expanded: "Call me when you arrive.",
      },
    ];
  }
  if (title.includes("comparison links")) {
    return [
      {
        labels: [
          "Subject: this",
          "Verb: feels",
          "Comparison: like",
          "Object: home",
        ],
        base: "this feels like home",
        expanded: "This feels like home.",
      },
    ];
  }
  if (title.includes("adding ideas")) {
    return [
      {
        labels: ["Addition marker: also", "Clause: need chairs"],
        base: "also need chairs",
        expanded: "We also need chairs.",
      },
    ];
  }
  if (title.includes("ordering ideas")) {
    return [
      {
        labels: [
          "Sequence: first",
          "Clause: we plan",
          "Sequence: then",
          "Clause: we act",
        ],
        base: "first we plan, then we act",
        expanded: "First we plan, then we act.",
      },
    ];
  }
  return null;
};

const getExampleLabelClass = (label) => {
  const type = normalizeLabelType(label);
  switch (type) {
    case "time":
      return "label-time";
    case "place":
      return "label-place";
    case "reason":
      return "label-reason";
    case "manner":
      return "label-manner";
    case "subject":
      return "label-subject";
    case "action-verb":
      return "label-action-verb";
    case "state-verb":
      return "label-state-verb";
    case "linking-verb":
      return "label-linking-verb";
    case "verb":
      return "label-verb";
    case "be-verb":
      return "label-be-verb";
    case "verb-ing":
      return "label-verb-ing";
    case "past-verb":
      return "label-past-verb";
    case "past-participle":
      return "label-past-participle";
    case "auxiliary":
      return "label-auxiliary";
    case "aux":
      return "label-aux";
    case "wh-word":
      return "label-wh-word";
    case "wh-clause":
      return "label-wh-clause";
    case "modal":
      return "label-modal";
    case "intro":
      return "label-intro";
    case "statement":
      return "label-statement";
    case "tag":
      return "label-tag";
    case "not":
      return "label-not";
    case "negative-word":
      return "label-negative-word";
    case "negative-adverb":
      return "label-negative-adverb";
    case "reason-clause":
      return "label-reason-clause";
    case "result-clause":
      return "label-result-clause";
    case "if-clause":
      return "label-if-clause";
    case "unless-clause":
      return "label-unless-clause";
    case "would-clause":
      return "label-would-clause";
    case "would-have-clause":
      return "label-would-have-clause";
    case "time-connector":
      return "label-time-connector";
    case "contrast-connector":
      return "label-contrast-connector";
    case "addition-marker":
      return "label-addition-marker";
    case "comparison":
      return "label-comparison";
    case "sequence":
      return "label-sequence";
    case "clause-1":
      return "label-clause-1";
    case "clause-2":
      return "label-clause-2";
    case "doer":
      return "label-doer";
    case "focus-phrase":
      return "label-focus-phrase";
    case "it-subject":
      return "label-it-subject";
    case "there-subject":
      return "label-there-subject";
    case "probability-word":
      return "label-probability-word";
    case "modal-phrase":
      return "label-modal-phrase";
    case "future-marker":
      return "label-future-marker";
    case "base-verb":
      return "label-base-verb";
    case "simple-form":
      return "label-simple-form";
    case "continuous-form":
      return "label-continuous-form";
    case "article":
      return "label-article";
    case "determiner":
      return "label-determiner";
    case "adjective":
      return "label-adjective";
    case "adverb":
      return "label-adverb";
    case "frequency-adverb":
      return "label-frequency-adverb";
    case "time-adverb":
      return "label-time-adverb";
    case "place-adverb":
      return "label-place-adverb";
    case "degree-word":
      return "label-degree-word";
    case "opinion":
      return "label-opinion";
    case "size":
      return "label-size";
    case "age":
      return "label-age";
    case "color":
      return "label-color";
    case "comparative":
      return "label-comparative";
    case "than":
      return "label-than";
    case "superlative":
      return "label-superlative";
    case "participle":
      return "label-participle";
    case "number":
      return "label-number";
    case "quantifier":
      return "label-quantifier";
    case "plural-noun":
      return "label-plural-noun";
    case "possessive":
      return "label-possessive";
    case "noun":
      return "label-noun";
    case "subject-pronoun":
      return "label-subject-pronoun";
    case "object-pronoun":
      return "label-object-pronoun";
    case "reflexive":
      return "label-reflexive";
    case "demonstrative":
      return "label-demonstrative";
    case "relative":
      return "label-relative";
    case "indefinite":
      return "label-indefinite";
    case "particle":
      return "label-particle";
    case "preposition":
      return "label-preposition";
    case "infinitive":
      return "label-infinitive";
    case "gerund":
      return "label-gerund";
    case "that-clause":
      return "label-that-clause";
    case "object":
      return "label-object";
    case "complement":
      return "label-complement";
    case "connector":
      return "label-connector";
    case "main-clause":
      return "label-main-clause";
    case "contrast":
      return "label-contrast";
    case "clause":
      return "label-clause";
    case "sentence-1":
      return "label-sentence-1";
    case "sentence-2":
      return "label-sentence-2";
    case "sentence":
      return "label-sentence";
    default:
      return "label-generic";
  }
};

const getExampleLabelText = (label) => {
  const raw = label.split(":")[0]?.trim() || label;
  const lower = raw.toLowerCase();
  if (lower.includes("sentence 1")) return "Sentence 1";
  if (lower.includes("sentence 2")) return "Sentence 2";
  if (lower.includes("short sentence")) return "Short sentence";
  if (lower.includes("long sentence")) return "Long sentence";
  if (lower.includes("main clause")) return "Main clause";
  if (lower.includes("sentence")) return "Sentence";
  if (lower.includes("time connector")) return "Time connector";
  if (lower.includes("contrast connector")) return "Contrast connector";
  if (lower.includes("addition marker")) return "Addition marker";
  if (lower.includes("reason clause")) return "Reason clause";
  if (lower.includes("result clause")) return "Result clause";
  if (lower.includes("would have clause")) return "Would have clause";
  if (lower.includes("would clause")) return "Would clause";
  if (lower.includes("if clause")) return "If clause";
  if (lower.includes("unless clause")) return "Unless clause";
  if (lower.includes("negative word")) return "Negative word";
  if (lower.includes("negative adverb")) return "Negative adverb";
  if (lower === "not") return "Not";
  if (lower.includes("wh word")) return "Wh word";
  if (lower.includes("wh clause")) return "Wh clause";
  if (lower.includes("intro")) return "Intro";
  if (lower.includes("modal")) return "Modal";
  if (lower === "aux") return "Aux";
  if (lower.includes("tag")) return "Tag";
  if (lower.includes("statement")) return "Statement";
  if (lower.includes("comparison")) return "Comparison";
  if (lower.includes("sequence")) return "Sequence";
  if (lower.includes("clause 1")) return "Clause 1";
  if (lower.includes("clause 2")) return "Clause 2";
  if (lower.includes("doer")) return "Doer";
  if (lower.includes("focus phrase")) return "Focus phrase";
  if (lower.includes("it subject")) return "It subject";
  if (lower.includes("there subject")) return "There subject";
  if (lower.includes("probability word")) return "Probability word";
  if (lower.includes("modal phrase")) return "Modal phrase";
  if (lower.includes("action verb")) return "Action verb";
  if (lower.includes("state verb")) return "State verb";
  if (lower.includes("linking verb")) return "Linking verb";
  if (lower.includes("subject pronoun")) return "Subject pronoun";
  if (lower.includes("object pronoun")) return "Object pronoun";
  if (lower.includes("be verb")) return "Be verb";
  if (lower.includes("verb-ing")) return "Verb-ing";
  if (lower.includes("past verb")) return "Past verb";
  if (lower.includes("past participle")) return "Past participle";
  if (lower.includes("auxiliary")) return "Auxiliary";
  if (lower.includes("future marker")) return "Future marker";
  if (lower.includes("base verb")) return "Base verb";
  if (lower.includes("simple form")) return "Simple form";
  if (lower.includes("continuous form")) return "Continuous form";
  if (lower.includes("particle")) return "Particle";
  if (lower.includes("determiner")) return "Determiner";
  if (lower.includes("adjective")) return "Adjective";
  if (lower.includes("frequency adverb")) return "Frequency adverb";
  if (lower.includes("time adverb")) return "Time adverb";
  if (lower.includes("place adverb")) return "Place adverb";
  if (lower.includes("degree word")) return "Degree word";
  if (lower.includes("adverb")) return "Adverb";
  if (lower.includes("opinion")) return "Opinion";
  if (lower.includes("size")) return "Size";
  if (lower.includes("age")) return "Age";
  if (lower.includes("color")) return "Color";
  if (lower.includes("comparative")) return "Comparative";
  if (lower.includes("than")) return "Than";
  if (lower.includes("superlative")) return "Superlative";
  if (lower.includes("participle")) return "Participle";
  if (lower.includes("number")) return "Number";
  if (lower.includes("quantifier")) return "Quantifier";
  if (lower.includes("plural noun")) return "Plural noun";
  if (lower.includes("possessive")) return "Possessive";
  if (lower.includes("noun")) return "Noun";
  if (lower.includes("subject pronoun")) return "Subject pronoun";
  if (lower.includes("object pronoun")) return "Object pronoun";
  if (lower.includes("reflexive")) return "Reflexive";
  if (lower.includes("demonstrative")) return "Demonstrative";
  if (lower.includes("relative")) return "Relative";
  if (lower.includes("indefinite")) return "Indefinite";
  if (lower.includes("subject")) return "Subject";
  if (lower.includes("verb")) return "Verb";
  if (lower.includes("article")) return "Article";
  if (lower.includes("preposition")) return "Preposition";
  if (lower.includes("infinitive")) return "Infinitive";
  if (lower.includes("gerund")) return "Gerund";
  if (lower.includes("that clause")) return "That clause";
  if (lower.includes("object")) return "Object";
  if (lower.includes("complement")) return "Complement";
  if (lower.includes("contrast")) return "Contrast";
  if (lower.includes("connector")) return "Connector";
  if (lower.includes("time")) return "Time";
  if (lower.includes("place")) return "Place";
  if (lower.includes("reason")) return "Reason";
  if (lower.includes("manner")) return "Manner";
  if (lower.includes("clause")) return "Clause";
  return raw;
};

const normalizeLabelType = (label) => {
  const key = label.split(":")[0]?.trim().toLowerCase();
  if (key.includes("sentence 1")) return "sentence-1";
  if (key.includes("sentence 2")) return "sentence-2";
  if (key.includes("short sentence")) return "sentence-1";
  if (key.includes("long sentence")) return "sentence-2";
  if (key.includes("main clause")) return "main-clause";
  if (key.includes("clause 1")) return "clause-1";
  if (key.includes("clause 2")) return "clause-2";
  if (key.includes("would have clause")) return "would-have-clause";
  if (key.includes("would clause")) return "would-clause";
  if (key.includes("if clause")) return "if-clause";
  if (key.includes("unless clause")) return "unless-clause";
  if (key.includes("doer")) return "doer";
  if (key.includes("focus phrase")) return "focus-phrase";
  if (key.includes("it subject")) return "it-subject";
  if (key.includes("there subject")) return "there-subject";
  if (key.includes("probability word")) return "probability-word";
  if (key.includes("modal phrase")) return "modal-phrase";
  if (key.includes("wh clause")) return "wh-clause";
  if (key.includes("reason clause")) return "reason-clause";
  if (key.includes("result clause")) return "result-clause";
  if (key.includes("time connector")) return "time-connector";
  if (key.includes("contrast connector")) return "contrast-connector";
  if (key.includes("addition marker")) return "addition-marker";
  if (key.includes("comparison")) return "comparison";
  if (key.includes("sequence")) return "sequence";
  if (key.includes("wh word")) return "wh-word";
  if (key.includes("intro")) return "intro";
  if (key === "aux") return "aux";
  if (key.includes("modal")) return "modal";
  if (key.includes("statement")) return "statement";
  if (key.includes("tag")) return "tag";
  if (key === "not") return "not";
  if (key.includes("negative word")) return "negative-word";
  if (key.includes("negative adverb")) return "negative-adverb";
  if (key.includes("time")) return "time";
  if (key.includes("place")) return "place";
  if (key.includes("reason")) return "reason";
  if (key.includes("manner")) return "manner";
  if (key.includes("subject")) return "subject";
  if (key.includes("action verb")) return "action-verb";
  if (key.includes("state verb")) return "state-verb";
  if (key.includes("linking verb")) return "linking-verb";
  if (key.includes("be verb")) return "be-verb";
  if (key.includes("verb-ing")) return "verb-ing";
  if (key.includes("past verb")) return "past-verb";
  if (key.includes("past participle")) return "past-participle";
  if (key.includes("auxiliary")) return "auxiliary";
  if (key.includes("future marker")) return "future-marker";
  if (key.includes("base verb")) return "base-verb";
  if (key.includes("simple form")) return "simple-form";
  if (key.includes("continuous form")) return "continuous-form";
  if (key.includes("particle")) return "particle";
  if (key.includes("determiner")) return "determiner";
  if (key.includes("adjective")) return "adjective";
  if (key.includes("frequency adverb")) return "frequency-adverb";
  if (key.includes("time adverb")) return "time-adverb";
  if (key.includes("place adverb")) return "place-adverb";
  if (key.includes("degree word")) return "degree-word";
  if (key.includes("adverb")) return "adverb";
  if (key.includes("opinion")) return "opinion";
  if (key.includes("size")) return "size";
  if (key.includes("age")) return "age";
  if (key.includes("color")) return "color";
  if (key.includes("comparative")) return "comparative";
  if (key.includes("than")) return "than";
  if (key.includes("superlative")) return "superlative";
  if (key.includes("participle")) return "participle";
  if (key.includes("number")) return "number";
  if (key.includes("quantifier")) return "quantifier";
  if (key.includes("plural noun")) return "plural-noun";
  if (key.includes("possessive")) return "possessive";
  if (key.includes("noun")) return "noun";
  if (key.includes("subject pronoun")) return "subject-pronoun";
  if (key.includes("object pronoun")) return "object-pronoun";
  if (key.includes("reflexive")) return "reflexive";
  if (key.includes("demonstrative")) return "demonstrative";
  if (key.includes("relative")) return "relative";
  if (key.includes("indefinite")) return "indefinite";
  if (key.includes("verb")) return "verb";
  if (key.includes("article")) return "article";
  if (key.includes("preposition")) return "preposition";
  if (key.includes("infinitive")) return "infinitive";
  if (key.includes("gerund")) return "gerund";
  if (key.includes("that clause")) return "that-clause";
  if (key.includes("object")) return "object";
  if (key.includes("complement")) return "complement";
  if (key.includes("contrast")) return "contrast";
  if (key.includes("connector")) return "connector";
  if (key.includes("sentence")) return "sentence";
  if (key.includes("clause")) return "clause";
  return "generic";
};

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildWordBoundaryPattern = (phrase) => {
  const escaped = escapeRegExp(phrase);
  const startsWord = /^\w/.test(phrase);
  const endsWord = /\w$/.test(phrase);
  const prefix = startsWord ? "\\b" : "";
  const suffix = endsWord ? "\\b" : "";
  return new RegExp(`${prefix}${escaped}${suffix}`, "i");
};

const applyGrammarHighlights = (sentence, labels = []) => {
  let output = sentence;
  labels.forEach((label) => {
    const parts = label.split(":");
    if (parts.length < 2) {
      return;
    }
    const phrase = parts.slice(1).join(":").trim();
    if (!phrase) {
      return;
    }
    const type = normalizeLabelType(label);
    const pattern = buildWordBoundaryPattern(phrase);
    if (!pattern.test(output)) {
      return;
    }
    output = output.replace(
      pattern,
      (match) => `<span class="highlight highlight-${type}">${match}</span>`
    );
  });
  return output;
};


const findFirstMatch = (sentence, patterns = []) => {
  const lower = sentence.toLowerCase();
  for (const pattern of patterns) {
    const idx = lower.indexOf(pattern);
    if (idx >= 0) {
      return { phrase: sentence.slice(idx, idx + pattern.length), index: idx };
    }
  }
  return null;
};

const splitByConnector = (sentence) => {
  const connectors = [
    "because",
    "so",
    "but",
    "and",
    "or",
    "although",
    "while",
    "when",
    "if",
    "unless",
    "before",
    "after",
    "until",
  ];
  const lower = sentence.toLowerCase();
  for (const conn of connectors) {
    const idx = lower.indexOf(` ${conn} `);
    if (idx >= 0) {
      const left = sentence.slice(0, idx).replace(/[,\s]+$/, "").trim();
      const right = sentence.slice(idx + conn.length + 2).replace(/^[,\s]+/, "").trim();
      return { left, connector: conn, right };
    }
  }
  return null;
};

const parseSVO = (sentence) => {
  const clean = sentence.replace(/[.!?]$/, "").trim();
  const words = clean.split(/\s+/);
  if (words.length < 2) return null;
  const determiners = [
    "the",
    "a",
    "an",
    "my",
    "your",
    "his",
    "her",
    "our",
    "their",
    "this",
    "that",
    "these",
    "those",
  ];
  const startsWithDet = determiners.includes(words[0].toLowerCase());
  const subject = startsWithDet && words.length >= 3 ? `${words[0]} ${words[1]}` : words[0];
  const verbIndex = startsWithDet && words.length >= 3 ? 2 : 1;
  const verb = words[verbIndex] || "";
  const object = words.slice(verbIndex + 1).join(" ").trim();
  return { subject, verb, object };
};

const findTimePhrase = (sentence) => {
  const timePhrases = [
    "today",
    "yesterday",
    "tomorrow",
    "tonight",
    "this morning",
    "this afternoon",
    "this evening",
    "this week",
    "next week",
    "after dinner",
    "after lunch",
    "after class",
    "before lunch",
    "before dinner",
    "at noon",
    "at night",
    "in the morning",
    "in the evening",
  ];
  return findFirstMatch(sentence, timePhrases);
};

const findPlacePhrase = (sentence) => {
  const placeRegex = /\b(?:in|at|on)\s+(?:the\s+)?([a-z]+(?:\s+[a-z]+)?)/i;
  const match = sentence.match(placeRegex);
  if (!match) return null;
  return { phrase: match[0].trim(), index: match.index ?? 0 };
};

const findVerbPhrase = (sentence) => {
  const auxRegex = /\b(am|is|are|was|were|has|have|had|will|would|can|could|should|might|must)\s+([a-z]+(?:ing|ed)?)\b/i;
  const auxMatch = sentence.match(auxRegex);
  if (auxMatch) {
    return auxMatch[0];
  }
  const svo = parseSVO(sentence);
  if (svo?.verb) return svo.verb;
  return "";
};

const buildLabelsForCard = (card, sentence) => {
  const title = card.title.toLowerCase();
  const section = card.section?.toLowerCase?.() || "";
  const labels = [];

  const addLabel = (type, phrase) => {
    if (!phrase) return;
    const label = `${type}: ${phrase}`;
    if (!labels.includes(label)) labels.push(label);
  };

  if (title.includes("linking clauses") || section.includes("connections") || section.includes("conditions")) {
    const split = splitByConnector(sentence);
    if (split) {
      addLabel("Main clause", split.left);
      addLabel("Connector", split.connector);
      addLabel("Clause", split.right);
      return labels;
    }
  }

  if (section.includes("verbs") || title.includes("verb")) {
    const svo = parseSVO(sentence);
    if (svo) {
      if (title.includes("action")) {
        addLabel("Subject", svo.subject);
        addLabel("Action verb", svo.verb);
        addLabel("Object", svo.object);
        return labels;
      }
      if (title.includes("state")) {
        addLabel("Subject", svo.subject);
        addLabel("State verb", svo.verb);
        addLabel("Complement", svo.object);
        return labels;
      }
      if (title.includes("linking")) {
        addLabel("Subject", svo.subject);
        addLabel("Linking verb", svo.verb);
        addLabel("Complement", svo.object);
        return labels;
      }
      if (title.includes("phrasal")) {
        addLabel("Verb", svo.verb);
        const particleMatch = sentence.match(/\b([a-z]+)\s+(up|out|off|in|on|down)\b/i);
        if (particleMatch) {
          addLabel("Particle", particleMatch[2]);
        }
        let obj = svo.object || "";
        if (particleMatch) {
          const particle = particleMatch[2];
          obj = obj.replace(new RegExp(`^${escapeRegExp(particle)}\\s+`, "i"), "");
        }
        addLabel("Object", obj);
        return labels;
      }
      if (title.includes("patterns")) {
        addLabel("Verb", svo.verb);
        const prepMatch = sentence.match(/\b(on|in|at|with|to|for)\s+(the\s+)?[a-z]+\b/i);
        if (prepMatch) {
          addLabel("Preposition", prepMatch[0]);
        }
        addLabel("Object", svo.object);
        return labels;
      }
      if (title.includes("combinations")) {
        addLabel("Verb", svo.verb);
        const toMatch = sentence.match(/\bto\s+[a-z]+\b/i);
        const ingMatch = sentence.match(/\b[a-z]+ing\b/i);
        if (toMatch) addLabel("Infinitive", toMatch[0]);
        if (ingMatch) addLabel("Gerund", ingMatch[0]);
        return labels;
      }
      addLabel("Subject", svo.subject);
      addLabel("Verb", svo.verb);
      addLabel("Object", svo.object);
      return labels;
    }
  }

  if (section.includes("tenses")) {
    const time = findTimePhrase(sentence);
    if (time) addLabel("Time", time.phrase);
    const verbPhrase = findVerbPhrase(sentence);
    if (verbPhrase) addLabel("Verb", verbPhrase);
    if (labels.length) return labels;
  }

  if (section.includes("nouns") || title.includes("article") || title.includes("quantifier")) {
    const articleMatch = sentence.match(/\b(a|an|the|some|many|much|few|little)\b/i);
    if (articleMatch) addLabel("Article", articleMatch[0]);
    const nounMatch = sentence.match(/\b[a-z]+(?:s|ren)?\b(?!.*\b(a|an|the|some|many|much|few|little)\b)/i);
    if (nounMatch) addLabel("Noun", nounMatch[0]);
    if (labels.length) return labels;
  }

  if (section.includes("pronouns") || title.includes("pronoun")) {
    const pronounMatch = sentence.match(/\b(i|you|he|she|we|they|me|him|her|us|them|my|your|his|their|our|mine|yours|hers|theirs|myself|yourself|himself|herself|ourselves|themselves)\b/i);
    if (pronounMatch) addLabel("Pronoun", pronounMatch[0]);
    if (labels.length) return labels;
  }

  if (section.includes("modifiers") || title.includes("adjective") || title.includes("adverb")) {
    const adjMatch = sentence.match(/\b(quiet|small|red|tall|fast|slow|happy|cold|warm|new|old|clear|bright)\b/i);
    const advMatch = sentence.match(/\b(quickly|slowly|clearly|quietly|carefully)\b/i);
    if (adjMatch) addLabel("Adjective", adjMatch[0]);
    if (advMatch) addLabel("Adverb", advMatch[0]);
    if (labels.length) return labels;
  }

  if (section.includes("questions")) {
    const whMatch = sentence.match(/\b(who|what|where|when|why|how)\b/i);
    if (whMatch) addLabel("Question word", whMatch[0]);
    const auxMatch = sentence.match(/\b(do|does|did|is|are|was|were|can|could|should)\b/i);
    if (auxMatch) addLabel("Auxiliary", auxMatch[0]);
    if (labels.length) return labels;
  }

  if (section.includes("negation") || title.includes("negation")) {
    const negMatch = sentence.match(/\b(not|never|no|nothing|nobody|none|nowhere)\b/i);
    if (negMatch) addLabel("Negative", negMatch[0]);
    if (labels.length) return labels;
  }

  if (section.includes("modality")) {
    const modalMatch = sentence.match(/\b(can|could|should|must|might|may|will|would)\b/i);
    if (modalMatch) addLabel("Modal", modalMatch[0]);
    if (labels.length) return labels;
  }

  if (section.includes("reported")) {
    const reportMatch = sentence.match(/\b(said|told|asked)\b/i);
    if (reportMatch) addLabel("Reporting verb", reportMatch[0]);
    const clauseMatch = splitByConnector(sentence);
    if (clauseMatch) addLabel("Clause", clauseMatch.right);
    if (labels.length) return labels;
  }

  const split = splitByConnector(sentence);
  if (split) {
    addLabel("Main clause", split.left);
    addLabel("Connector", split.connector);
    addLabel("Clause", split.right);
    return labels;
  }

  const time = findTimePhrase(sentence);
  if (time) addLabel("Time", time.phrase);
  const place = findPlacePhrase(sentence);
  if (place) addLabel("Place", place.phrase);
  const reasonMatch = sentence.match(/\bbecause\s+[^.?!]+/i);
  if (reasonMatch) addLabel("Reason", reasonMatch[0]);
  if (labels.length) return labels;

  const svo = parseSVO(sentence);
  if (svo) {
    addLabel("Subject", svo.subject);
    addLabel("Verb", svo.verb);
    addLabel("Object", svo.object);
    return labels;
  }

  const clean = sentence.replace(/[.!?]$/, "").trim();
  if (clean) {
    addLabel("Sentence", clean);
  }
  return labels;
};

const extractLabelsFromSentence = (sentence) => {
  if (!sentence) {
    return [];
  }
  const lower = sentence.toLowerCase();
  const matches = [];
  const addMatch = (type, phrase, index) => {
    const label = `${type}: ${phrase}`;
    if (!matches.some((item) => item.label === label)) {
      matches.push({ label, index });
    }
  };

  const reasonWords = ["because", "so", "since"];
  const contrastWords = ["but", "although", "though", "however"];
  const connectorWords = ["and", "or", "when", "while", "if", "unless", "until"];
  const mannerWords = ["quickly", "slowly", "carefully", "well", "badly", "politely", "quietly", "loudly"];
  const timeWords = [
    "today",
    "yesterday",
    "tomorrow",
    "tonight",
    "morning",
    "afternoon",
    "evening",
    "night",
    "now",
    "later",
  ];

  reasonWords.forEach((word) => {
    const idx = lower.indexOf(` ${word} `);
    if (idx >= 0) addMatch("Reason", word, idx);
  });
  contrastWords.forEach((word) => {
    const idx = lower.indexOf(` ${word} `);
    if (idx >= 0) addMatch("Contrast", word, idx);
  });
  connectorWords.forEach((word) => {
    const idx = lower.indexOf(` ${word} `);
    if (idx >= 0) addMatch("Connector", word, idx);
  });
  mannerWords.forEach((word) => {
    const idx = lower.indexOf(` ${word} `);
    if (idx >= 0) addMatch("Manner", word, idx);
  });

  const timeRegex = /\b(?:at|after|before|by)\s+(?:the\s+)?([a-z]+(?:\s+[a-z]+)?)/gi;
  let match;
  while ((match = timeRegex.exec(sentence)) !== null) {
    const phrase = match[0].trim();
    addMatch("Time", phrase, match.index);
  }

  timeWords.forEach((word) => {
    const idx = lower.indexOf(` ${word}`);
    if (idx >= 0) {
      addMatch("Time", word, idx);
    }
  });

  const placeRegex = /\b(?:in|at|on)\s+(?:the\s+)?([a-z]+(?:\s+[a-z]+)?)/gi;
  while ((match = placeRegex.exec(sentence)) !== null) {
    const phrase = match[0].trim();
    if (phrase.toLowerCase().startsWith("at the") && phrase.toLowerCase().includes("noon")) {
      continue;
    }
    addMatch("Place", phrase, match.index);
  }

  const ordered = matches
    .sort((a, b) => a.index - b.index)
    .map((item) => item.label);
  if (!ordered.length) {
    const clean = sentence.replace(/[.!?]$/, "").trim();
    if (clean) {
      ordered.push(`Sentence: ${clean}`);
    }
  }
  return ordered;
};

const stripLabelPhrases = (sentence, labels) => {
  let output = sentence;
  labels.forEach((label) => {
    const parts = label.split(":");
    if (parts.length < 2) {
      return;
    }
    const phrase = parts.slice(1).join(":").trim();
    if (!phrase) {
      return;
    }
    const pattern = buildWordBoundaryPattern(phrase);
    output = output.replace(pattern, "").replace(/\s{2,}/g, " ");
  });
  output = output
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/\s+\?/g, "?")
    .replace(/\s+\!/g, "!")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!output) {
    return sentence;
  }
  return output;
};

const buildGenericExamplePairs = (cardData, index) => {
  const exampleA = cardData.example || buildAltGrammarExample(cardData, index);
  const examples = [exampleA];
  return examples.map((expanded) => {
    const labels = buildLabelsForCard(cardData, expanded);
    let base = stripLabelPhrases(expanded, labels);
    if (!base || base.trim().length < 2) {
      base = expanded;
    }
    return { base, expanded, labels };
  });
};


const buildGrammarHowItWorks = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("adding details")) {
    return {
      order: "(time) + (place)",
      bullets: [
        "add time phrases like at noon or yesterday",
        "add place phrases like at the station or in the kitchen",
      ],
      template: "subject + verb + object + (time) + (place)",
    };
  }
  const expandedPoints = (card.points || []).map(expandGrammarPoint);
  const template = GRAMMAR_TEMPLATES[card.title] || null;
  return {
    bullets: expandedPoints,
    template,
  };
};

const GRAMMAR_MISTAKES = {
  "basic word order": {
    wrong: "Reads she a book.",
    fix: "She reads a book.",
  },
  "sentence parts": {
    wrong: "Is a pilot my brother.",
    fix: "My brother is a pilot.",
  },
  "adding details": {
    wrong: "She met him noon station.",
    fix: "She met him at noon at the station.",
  },
  "linking clauses": {
    wrong: "I stayed home because.",
    fix: "I stayed home because it rained.",
  },
  "sentence variety": {
    wrong: "We finished early so.",
    fix: "We finished early, so we left.",
  },
  "action verbs": {
    wrong: "She run every morning.",
    fix: "She runs every morning.",
  },
  "state verbs": {
    wrong: "He is knowing the answer.",
    fix: "He knows the answer.",
  },
  "linking verbs": {
    wrong: "The soup tastes is good.",
    fix: "The soup tastes good.",
  },
  "verb patterns": {
    wrong: "He placed the book on.",
    fix: "He placed the book on the table.",
  },
  "verb combinations": {
    wrong: "She enjoys to swim.",
    fix: "She enjoys swimming.",
  },
  "phrasal verbs": {
    wrong: "He turned the light on off.",
    fix: "He turned off the light.",
  },
  "present simple": {
    wrong: "She is work every day.",
    fix: "She works every day.",
  },
  "present continuous": {
    wrong: "She works now.",
    fix: "She is working now.",
  },
  "past simple": {
    wrong: "She go yesterday.",
    fix: "She went yesterday.",
  },
  "past continuous": {
    wrong: "She was cook when I called.",
    fix: "She was cooking when I called.",
  },
  "present perfect": {
    wrong: "She finished already.",
    fix: "She has finished already.",
  },
  "past perfect": {
    wrong: "He left when I arrive.",
    fix: "He had left when I arrived.",
  },
  "future forms": {
    wrong: "She will going to call.",
    fix: "She is going to call.",
  },
  "future continuous": {
    wrong: "She will work at 8.",
    fix: "She will be working at 8.",
  },
  "future perfect": {
    wrong: "She will finish by noon.",
    fix: "She will have finished by noon.",
  },
  "aspect contrasts": {
    wrong: "I am knowing him.",
    fix: "I know him.",
  },
  "countable nouns": {
    wrong: "She bought apple.",
    fix: "She bought an apple.",
  },
  "uncountable nouns": {
    wrong: "I need two breads.",
    fix: "I need some bread.",
  },
  "articles": {
    wrong: "I saw movie.",
    fix: "I saw a movie.",
  },
  "plural forms": {
    wrong: "Three child play.",
    fix: "Three children play.",
  },
  "possessive nouns": {
    wrong: "The teachers book is new.",
    fix: "The teacher's book is new.",
  },
  "noun phrases": {
    wrong: "She bought dress red.",
    fix: "She bought a red dress.",
  },
  "quantifiers": {
    wrong: "How much apples?",
    fix: "How many apples?",
  },
  "subject pronouns": {
    wrong: "Her is here.",
    fix: "She is here.",
  },
  "object pronouns": {
    wrong: "He saw I.",
    fix: "He saw me.",
  },
  "possessive forms": {
    wrong: "This is her book is.",
    fix: "This book is hers.",
  },
  "reflexive pronouns": {
    wrong: "I hurt me.",
    fix: "I hurt myself.",
  },
  "demonstratives": {
    wrong: "These book is mine.",
    fix: "This book is mine.",
  },
  "relative reference": {
    wrong: "The man which called me.",
    fix: "The man who called me.",
  },
  "indefinite reference": {
    wrong: "Anyone is here.",
    fix: "Someone is here.",
  },
  "adjectives basics": {
    wrong: "She has hair long.",
    fix: "She has long hair.",
  },
  "adjective order": {
    wrong: "A red small car.",
    fix: "A small red car.",
  },
  "comparatives": {
    wrong: "This is more cheap.",
    fix: "This is cheaper.",
  },
  "superlatives": {
    wrong: "He is the most fast.",
    fix: "He is the fastest.",
  },
  "adverbs basics": {
    wrong: "She speaks slow.",
    fix: "She speaks slowly.",
  },
  "frequency adverbs": {
    wrong: "She goes always early.",
    fix: "She always goes early.",
  },
  "time and place adverbs": {
    wrong: "He arrived yesterday here.",
    fix: "He arrived here yesterday.",
  },
  "degree words": {
    wrong: "It is enough hot.",
    fix: "It is hot enough.",
  },
  "participles": {
    wrong: "The story was boringed.",
    fix: "The story was boring.",
  },
  "modifier stacking": {
    wrong: "She bought a red small new bag.",
    fix: "She bought a small new red bag.",
  },
  "yes no questions": {
    wrong: "You like coffee?",
    fix: "Do you like coffee?",
  },
  "wh questions": {
    wrong: "Where you live?",
    fix: "Where do you live?",
  },
  "questions with be": {
    wrong: "You are ready?",
    fix: "Are you ready?",
  },
  "questions with do": {
    wrong: "She likes pizza?",
    fix: "Does she like pizza?",
  },
  "questions with modals": {
    wrong: "You can help me?",
    fix: "Can you help me?",
  },
  "tag questions": {
    wrong: "She is here, is she?",
    fix: "She is here, isn't she?",
  },
  "indirect questions": {
    wrong: "Can you tell me where is he?",
    fix: "Can you tell me where he is?",
  },
  "not with be": {
    wrong: "He not happy.",
    fix: "He is not happy.",
  },
  "not with do": {
    wrong: "She not like tea.",
    fix: "She does not like tea.",
  },
  "negative short forms": {
    wrong: "He does notn't know.",
    fix: "He doesn't know.",
  },
  "negative words": {
    wrong: "I don't have nothing.",
    fix: "I don't have anything.",
  },
  "negative questions": {
    wrong: "You don't like it?",
    fix: "Don't you like it?",
  },
  "limited negatives": {
    wrong: "She hardly doesn't sleep.",
    fix: "She hardly sleeps.",
  },
  "basic connectors": {
    wrong: "I went but stayed.",
    fix: "I went and stayed.",
  },
  "reason and result": {
    wrong: "I was late because the bus.",
    fix: "I was late because the bus was late.",
  },
  "contrast and choice": {
    wrong: "I like tea but I also like coffee.",
    fix: "I like tea, but I also like coffee.",
  },
  "time connectors": {
    wrong: "I left before I will eat.",
    fix: "I left before I ate.",
  },
  "comparison links": {
    wrong: "She is like taller me.",
    fix: "She is taller than me.",
  },
  "adding ideas": {
    wrong: "He also went but too.",
    fix: "He also went.",
  },
  "ordering ideas": {
    wrong: "Finally, first we meet.",
    fix: "First we met, finally we left.",
  },
  "real conditions": {
    wrong: "If you will come, we meet.",
    fix: "If you come, we meet.",
  },
  "future conditions": {
    wrong: "If it will rain, we will stay.",
    fix: "If it rains, we will stay.",
  },
  "unreal present": {
    wrong: "If I will have time, I would go.",
    fix: "If I had time, I would go.",
  },
  "unreal past": {
    wrong: "If I knew, I would have told.",
    fix: "If I had known, I would have told.",
  },
  "mixed conditions": {
    wrong: "If I studied, I would have the job now.",
    fix: "If I had studied, I would have the job now.",
  },
  "unless and otherwise": {
    wrong: "We will go unless it will rain.",
    fix: "We will go unless it rains.",
  },
  "active voice": {
    wrong: "The cake baked my mom.",
    fix: "My mom baked the cake.",
  },
  "passive voice": {
    wrong: "The report finished yesterday.",
    fix: "The report was finished yesterday.",
  },
  "focus shifts": {
    wrong: "This book I bought yesterday it.",
    fix: "This book, I bought yesterday.",
  },
  "cleft sentences": {
    wrong: "Was it she called.",
    fix: "It was she who called.",
  },
  "there and it subjects": {
    wrong: "Is a problem in the room.",
    fix: "There is a problem in the room.",
  },
  "ability": {
    wrong: "She can to swim.",
    fix: "She can swim.",
  },
  "permission": {
    wrong: "May I to sit here?",
    fix: "May I sit here?",
  },
  "obligation": {
    wrong: "You must to wear a badge.",
    fix: "You must wear a badge.",
  },
  "advice": {
    wrong: "You should to rest.",
    fix: "You should rest.",
  },
  "possibility": {
    wrong: "It might to rain.",
    fix: "It might rain.",
  },
  "probability": {
    wrong: "He probably to arrive late.",
    fix: "He will probably arrive late.",
  },
  "polite requests": {
    wrong: "Could you open the door?",
    fix: "Could you open the door, please?",
  },
  "offers and invitations": {
    wrong: "Do you like to come?",
    fix: "Would you like to come?",
  },
  "reporting statements": {
    wrong: "She said me she is tired.",
    fix: "She said she was tired.",
  },
  "reporting questions": {
    wrong: "He asked where is the station.",
    fix: "He asked where the station was.",
  },
  "reporting requests": {
    wrong: "She asked me can I help.",
    fix: "She asked me to help.",
  },
  "reporting commands": {
    wrong: "He told me to went.",
    fix: "He told me to go.",
  },
  "backshift basics": {
    wrong: "She said she is ready.",
    fix: "She said she was ready.",
  },
  "time place changes": {
    wrong: "He said he will come here today.",
    fix: "He said he would come there that day.",
  },
  "formal vs informal": {
    wrong: "Hey, give me the report.",
    fix: "Hello, could you send the report?",
  },
  "contractions": {
    wrong: "I am late, do not wait.",
    fix: "I'm late, don't wait.",
  },
  "polite softening": {
    wrong: "Send me the file now.",
    fix: "Could you send me the file?",
  },
  "spoken vs written": {
    wrong: "I would like to inform you I arrived.",
    fix: "I arrived.",
  },
  "professional style": {
    wrong: "Hey, I need this ASAP.",
    fix: "Hello, I need this soon.",
  },
  "casual style": {
    wrong: "Dear Sir or Madam, what's up?",
    fix: "Hey, what's up?",
  },
  "clarity and brevity": {
    wrong: "Due to the fact that it is raining, we will not go.",
    fix: "It is raining, so we will not go.",
  },
  "opening and closing": {
    wrong: "I want to talk. Goodbye.",
    fix: "Hi, I wanted to talk. Thanks, goodbye.",
  },
  "topic shifts": {
    wrong: "Anyway, back to something else.",
    fix: "By the way, can we talk about the schedule?",
  },
  "cohesion tools": {
    wrong: "I bought a book. Book is new.",
    fix: "I bought a book. It is new.",
  },
  "sequencing ideas": {
    wrong: "First I left, then I woke up.",
    fix: "First I woke up, then I left.",
  },
  "clarification moves": {
    wrong: "What you said?",
    fix: "What do you mean?",
  },
  "summaries": {
    wrong: "In short, many things.",
    fix: "In short, we need more time.",
  },
  "emphasis and repetition": {
    wrong: "I do want to go not.",
    fix: "I do want to go.",
  },
  "conversation flow": {
    wrong: "Me too. You?",
    fix: "Me too. And you?",
  },
  "giving examples": {
    wrong: "For example, it is.",
    fix: "For example, it is useful for travel.",
  },
  "repair and correction": {
    wrong: "I mean, I am go.",
    fix: "Sorry, I mean I am going.",
  },
};

const buildGrammarMistakes = (card) => {
  const title = card.title.toLowerCase();
  const pair = GRAMMAR_MISTAKES[title];
  if (pair) {
    return [pair];
  }
  return [
    {
      wrong: "She not explain well.",
      fix: "She did not explain well.",
    },
  ];
};

const formatGrammarExample = (card, sentence) => {
  const title = card.title.toLowerCase();
  if (title.includes("adding details")) {
    return sentence
      .replace(/at noon/i, '<span class="highlight highlight-time">at noon</span>')
      .replace(/at the station/i, '<span class="highlight highlight-place">at the station</span>')
      .replace(/yesterday/i, '<span class="highlight highlight-time">yesterday</span>')
      .replace(/in the kitchen/i, '<span class="highlight highlight-place">in the kitchen</span>')
      .replace(/after dinner/i, '<span class="highlight highlight-time">after dinner</span>')
      .replace(/because it rained/i, '<span class="highlight highlight-reason">because it rained</span>')
      .replace(/because it was late/i, '<span class="highlight highlight-reason">because it was late</span>')
      .replace(/quickly/i, '<span class="highlight highlight-manner">quickly</span>');
  }
  return sentence;
};

const ensureGrammarOverlay = () => {
  let overlay = document.getElementById("grammarOverlay");
  const needsRebuild =
    !overlay ||
    !overlay.querySelector(".grammar-modal") ||
    !overlay.querySelector(".grammar-modal-body");
  if (needsRebuild) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "grammar-overlay";
      overlay.id = "grammarOverlay";
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="grammar-modal" role="dialog" aria-modal="true" aria-live="polite">
        <button class="grammar-close" type="button" aria-label="Close">&times;</button>
        <div class="grammar-modal-body"></div>
      </div>
    `;
  }
  return overlay;
};
const renderGrammarModal = (section, index) => {
  const overlay = ensureGrammarOverlay();
  if (!overlay) {
    return;
  }
  const modalBody = overlay.querySelector(".grammar-modal-body");
  if (!modalBody) {
    return;
  }
  overlay.dataset.section = section || "";
  overlay.dataset.index = String(index ?? "0");
  const cardData = GRAMMAR_SECTION_LISTS[section]?.[index];
  if (!cardData) {
    modalBody.innerHTML = "";
    overlay.classList.remove("is-visible");
    document.body.classList.remove("modal-open");
    return;
  }

  const baseLanguage = localStorage.getItem("cosmicaBaseLanguage") || "";
  const explanation = buildGrammarExplanation(cardData);
  const explanationTranslation = baseLanguage
    ? resolveGrammarExplanation(section, explanation, baseLanguage)
    : "";
  const mistakes = buildGrammarMistakes(cardData);
  const howItWorks = buildGrammarHowItWorks(cardData);
  const examples = [cardData.example, buildAltGrammarExample(cardData, index)];
  const shouldCapPhrase = true;

  let renderedExamples = "";
  const structureExamples =
    section === "Sentence Structure" ? buildStructureExamples(cardData) : null;
  const verbExamples = section === "Verbs" ? buildVerbExamples(cardData) : null;
  const tenseExamples =
    section === "Tenses & Aspect" ? buildTenseExamples(cardData) : null;
  const nounExamples =
    section === "Nouns & Articles" ? buildNounExamples(cardData) : null;
  const pronounExamples =
    section === "Pronouns & Reference" ? buildPronounExamples(cardData) : null;
  const modifierExamples =
    section === "Modifiers" ? buildModifierExamples(cardData) : null;
  const questionExamples =
    section === "Questions" ? buildQuestionExamples(cardData) : null;
  const negationExamples =
    section === "Negation" ? buildNegationExamples(cardData) : null;
  const connectionExamples =
    section === "Connections" ? buildConnectionExamples(cardData) : null;
  const conditionExamples =
    section === "Conditions" ? buildConditionExamples(cardData) : null;
  const voiceExamples =
    section === "Voice & Focus" ? buildVoiceExamples(cardData) : null;
  const modalityExamples =
    section === "Modality" ? buildModalityExamples(cardData) : null;
  const activeExamples =
    structureExamples ||
    verbExamples ||
    tenseExamples ||
    nounExamples ||
    pronounExamples ||
    modifierExamples ||
    questionExamples ||
    negationExamples ||
    connectionExamples ||
    conditionExamples ||
    voiceExamples ||
    modalityExamples;
  if (activeExamples) {
    const item = activeExamples[0];
    const expandedText =
      shouldCapPhrase && item.expanded
        ? item.expanded.charAt(0).toUpperCase() + item.expanded.slice(1)
        : item.expanded;
    const baseTranslation = resolveGrammarTranslation(
      section,
      item.base,
      baseLanguage
    );
    const expandedTranslation = resolveGrammarTranslation(
      section,
      item.expanded,
      baseLanguage
    );
    renderedExamples = `
      <div class="grammar-example">
        <div class="grammar-example-labels">
          ${item.labels
            .map((label) => `<span class="grammar-label ${getExampleLabelClass(label)}">${getExampleLabelText(label)}</span>`)
            .join("")}
        </div>
        <div class="grammar-example-expanded">Phrase: ${applyGrammarHighlights(expandedText, item.labels)}</div>
        ${expandedTranslation ? `<div class="grammar-translation">${expandedTranslation}</div>` : ""}
      </div>
    `;
  } else {
    const genericPairs = buildGenericExamplePairs(cardData, index);
    renderedExamples = genericPairs
      .map((item) => {
        const expandedText =
          shouldCapPhrase && item.expanded
            ? item.expanded.charAt(0).toUpperCase() + item.expanded.slice(1)
            : item.expanded;
        const baseTranslation = resolveGrammarTranslation(
          section,
          item.base,
          baseLanguage
        );
        const expandedTranslation = resolveGrammarTranslation(
          section,
          item.expanded,
          baseLanguage
        );
        return `
          <div class="grammar-example">
            <div class="grammar-example-labels">
              ${item.labels
                .map((label) => `<span class="grammar-label ${getExampleLabelClass(label)}">${getExampleLabelText(label)}</span>`)
                .join("")}
            </div>
            <div class="grammar-example-expanded">Phrase: ${applyGrammarHighlights(expandedText, item.labels)}</div>
            ${expandedTranslation ? `<div class="grammar-translation">${expandedTranslation}</div>` : ""}
          </div>
        `;
      })
      .join("");
  }

  modalBody.innerHTML = `
    <div class="grammar-modal-header">
      <h3>${cardData.title}</h3>
      <p>${explanation}</p>
      ${explanationTranslation ? `<p class="grammar-translation grammar-explanation-translation">${explanationTranslation}</p>` : ""}
    </div>
    <div class="grammar-modal-grid">
      <div class="grammar-block">
        <h4>Rules</h4>
        ${howItWorks.order ? `<div class="grammar-order">Order: ${howItWorks.order}</div>` : ""}
        <ul>
          ${(howItWorks.bullets || []).map((item) => `<li>${item}</li>`).join("")}
        </ul>
        ${howItWorks.template ? `<div class="grammar-template">${howItWorks.template}</div>` : ""}
      </div>
      <div class="grammar-block">
        <h4>Examples</h4>
        ${renderedExamples}
      </div>
      <div class="grammar-block">
        <h4>Common mistakes</h4>
        <ul>
          ${mistakes
            .map(
              (mistake) =>
                `<li><span class="mistake-wrong">Wrong:</span> ${mistake.wrong}</li>
                 <li><span class="mistake-fix">Fix:</span> ${mistake.fix}</li>`
            )
            .join("")}
        </ul>
      </div>
    </div>
  `;
  modalBody.scrollTop = 0;
  overlay.querySelector(".grammar-modal")?.scrollTo(0, 0);
};


const openGrammarModal = (section, index) => {
  const overlay = ensureGrammarOverlay();
  if (!overlay) {
    return;
  }
  renderGrammarModal(section, index);
  overlay.classList.add("is-visible");
  document.body.classList.add("modal-open");
  lockModalScroll();
  const modal = overlay.querySelector(".grammar-modal");
  const modalBody = overlay.querySelector(".grammar-modal-body");
  if (modal) {
    modal.scrollTop = 0;
  }
  if (modalBody) {
    modalBody.scrollTop = 0;
  }
  overlay.querySelector(".grammar-modal")?.focus?.();
};

let modalScrollLockY = 0;
const lockModalScroll = () => {
  if (document.body.style.position === "fixed") {
    return;
  }
  modalScrollLockY = window.scrollY || 0;
  document.body.style.position = "fixed";
  document.body.style.top = `-${modalScrollLockY}px`;
  document.body.style.width = "100%";
};

const unlockModalScroll = () => {
  if (document.body.style.position !== "fixed") {
    return;
  }
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  window.scrollTo(0, modalScrollLockY || 0);
};
const setupGrammarModal = () => {
  const hasGrammarPage = document.body.classList.contains("grammar-page");
  const hasGrammarCards = !!document.querySelector(".grammar-card");
  if (!hasGrammarPage && !hasGrammarCards) {
    return;
  }
  const overlay = ensureGrammarOverlay();
  const modal = overlay.querySelector(".grammar-modal");
  const closeBtn = overlay.querySelector(".grammar-close");

  overlay.__refresh = () => {
    if (!overlay.classList.contains("is-visible")) {
      return;
    }
    const section = overlay.dataset.section || "";
    const index = Number(overlay.dataset.index || "0");
    renderGrammarModal(section, index);
  };

  const closeModal = () => {
    overlay.classList.remove("is-visible");
    document.body.classList.remove("modal-open");
    unlockModalScroll();
  };

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-visible")) {
      closeModal();
    }
  });
  document.addEventListener("click", (event) => {
    const card = event.target.closest(".grammar-card");
    if (!card) {
      return;
    }
    const section = card.dataset.section;
    const index = Number(card.dataset.index);
    openGrammarModal(section, index);
  });
};

const resolveWordTranslation = (section, englishWord, baseLanguage) => {
  const sectionKey = section || WORD_SECTION_ORDER[0];
  const wordKey = (englishWord || "").toLowerCase();
  const langKey = (baseLanguage || "").toLowerCase();
  let translation = "";
  const worldEntry = WORLD_TRANSLATIONS?.words?.[sectionKey]?.[wordKey];
  if (worldEntry && worldEntry.translations) {
    translation = worldEntry.translations?.[langKey] || "";
  }
  if (!translation) {
    translation = WORD_TRANSLATIONS[sectionKey]?.[wordKey]?.[langKey] || "";
  }
  if (!translation) {
    if (englishWord && baseLanguage) {
      console.warn(
        `Missing translation: section="${sectionKey}", word="${englishWord}", language="${baseLanguage}"`
      );
    }
    return "(translation unavailable)";
  }
  return translation;
};

const applyWordTranslations = () => {
  const baseLanguage = localStorage.getItem("cosmicaBaseLanguage") || "";
  document.querySelectorAll(".word-card").forEach((card) => {
    const word = card.dataset.word || card.querySelector(".word")?.textContent?.trim() || "";
    const section = card.closest("[data-section]")?.dataset.section || "Core words";
    let translationEl = card.querySelector(".word-translation");
    if (!translationEl) {
      translationEl = document.createElement("div");
      translationEl.className = "word-translation";
      const audioEl = card.querySelector(".word-audio");
      card.insertBefore(translationEl, audioEl || null);
    }
    translationEl.textContent = resolveWordTranslation(section, word, baseLanguage);
  });
};

const resolvePhraseTranslation = (section, englishPhrase, baseLanguage) => {
  const sectionKey = section || PHRASE_SECTION_ORDER[0];
  const phraseKey = (englishPhrase || "").toLowerCase();
  const langKey = (baseLanguage || "").toLowerCase();
  let translation = "";
  const worldEntry = WORLD_TRANSLATIONS?.phrases?.[sectionKey]?.[phraseKey];
  if (worldEntry && worldEntry.translations) {
    translation = worldEntry.translations?.[langKey] || "";
  }
  if (!translation) {
    translation = PHRASE_TRANSLATIONS[sectionKey]?.[phraseKey]?.[langKey] || "";
  }
  if (!translation) {
    if (englishPhrase && baseLanguage) {
      console.warn(
        `Missing translation: section="${sectionKey}", phrase="${englishPhrase}", language="${baseLanguage}"`
      );
    }
    return "(translation unavailable)";
  }
  return translation;
};

const applyPhraseTranslations = () => {
  const baseLanguage = localStorage.getItem("cosmicaBaseLanguage") || "";
  document.querySelectorAll(".phrase-card").forEach((card) => {
    const phrase =
      card.dataset.phrase || card.querySelector(".phrase-text")?.textContent?.trim() || "";
    const section = card.closest("[data-section]")?.dataset.section || PHRASE_SECTION_ORDER[0];
    let translationEl = card.querySelector(".phrase-translation");
    if (!translationEl) {
      translationEl = document.createElement("div");
      translationEl.className = "phrase-translation";
      const audioEl = card.querySelector(".word-audio");
      card.insertBefore(translationEl, audioEl || null);
    }
    translationEl.textContent = resolvePhraseTranslation(section, phrase, baseLanguage);
  });
};

const resolveGrammarTranslation = (section, exampleSentence, baseLanguage) => {
  const sectionKey = section || GRAMMAR_SECTION_ORDER[0];
  const sentenceKey = (exampleSentence || "").toLowerCase();
  const langKey = (baseLanguage || "").toLowerCase();
  let translation = "";
  const worldEntry = WORLD_TRANSLATIONS?.grammar?.examples?.[sectionKey]?.[sentenceKey];
  if (worldEntry && worldEntry.translations) {
    translation = worldEntry.translations?.[langKey] || "";
  }
  if (!translation) {
    translation = GRAMMAR_TRANSLATIONS[sectionKey]?.[sentenceKey]?.[langKey] || "";
  }
  if (!translation) {
    if (exampleSentence && baseLanguage) {
      console.warn(
        `Missing translation: section="${sectionKey}", example="${exampleSentence}", language="${baseLanguage}"`
      );
    }
    return "";
  }
  return translation;
};

const refreshMapsForBaseLanguage = () => {
  if (document.querySelector(".word-card")) {
    applyWordTranslations();
  }
  if (document.querySelector(".phrase-card")) {
    applyPhraseTranslations();
  }
  const overlay = ensureGrammarOverlay();
  if (overlay && typeof overlay.__refresh === "function") {
    overlay.__refresh();
  }
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

let wordsHasScrolled = false;
let phrasesHasScrolled = false;
let grammarHasScrolled = false;

const updateWordsTopState = () => {
  if (!document.body.classList.contains("words-page")) {
    return;
  }
  document.body.classList.remove("words-at-top");
};

const updatePhrasesTopState = () => {
  if (!document.body.classList.contains("phrases-page")) {
    return;
  }
  document.body.classList.remove("phrases-at-top");
};

const updateGrammarTopState = () => {
  if (!document.body.classList.contains("grammar-page")) {
    return;
  }
  document.body.classList.remove("grammar-at-top");
};

renderWordsSections();
renderPhrasesSections();
renderGrammarSections();
setupGrammarModal();
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
setupSpeechCards();
setupBackToTopButton();
if (document.querySelector(".word-card")) {
  applyWordTranslations();
}
if (document.querySelector(".phrase-card")) {
  applyPhraseTranslations();
}
updateWordsTopState();
updatePhrasesTopState();
updateGrammarTopState();

loadTranslations().then(() => {
  if (document.querySelector(".word-card")) {
    applyWordTranslations();
  }
  if (document.querySelector(".phrase-card")) {
    applyPhraseTranslations();
  }
  const overlay = ensureGrammarOverlay();
  if (overlay && typeof overlay.__refresh === "function") {
    overlay.__refresh();
  }
});
window.addEventListener(
  "scroll",
  () => {
    if (!document.body.classList.contains("words-page")) {
      return;
    }
    wordsHasScrolled = true;
    window.requestAnimationFrame(updateWordsTopState);
  },
  { passive: true }
);
window.addEventListener(
  "scroll",
  () => {
    if (!document.body.classList.contains("phrases-page")) {
      return;
    }
    phrasesHasScrolled = true;
    window.requestAnimationFrame(updatePhrasesTopState);
  },
  { passive: true }
);
window.addEventListener(
  "scroll",
  () => {
    if (!document.body.classList.contains("grammar-page")) {
      return;
    }
    grammarHasScrolled = true;
    window.requestAnimationFrame(updateGrammarTopState);
  },
  { passive: true }
);












