/* ==========================================================================
   WORLD PHRASE INTENT APPLIER
   Ensures non-English world packs contain world-native intent entries for:
   - learn_world_language
   - speak_world_language
   - not_speak_world_language
   - ask_speak_world_language
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const WORLDS_DIR = path.join(ROOT, "frontend", "worlds");

const LEGACY_ENGLISH_SOURCES = [
  "i am learning english",
  "i speak english",
  "i do not speak english",
  "do you speak english",
];

const INTENT_SPECS = [
  {
    intent: "learn_world_language",
    section: "Introductions",
    sourceBuilder: (label) => `i am learning ${label}`,
  },
  {
    intent: "speak_world_language",
    section: "Introductions",
    sourceBuilder: (label) => `i speak ${label}`,
  },
  {
    intent: "not_speak_world_language",
    section: "Introductions",
    sourceBuilder: (label) => `i do not speak ${label}`,
  },
  {
    intent: "ask_speak_world_language",
    section: "Questions",
    sourceBuilder: (label) => `do you speak ${label}`,
  },
];

const normalize = (value) => String(value || "").trim().toLowerCase();

const readJson = (filePath) =>
  JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));

const writeJson = (filePath, payload) =>
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

const removeLegacyIntentEntries = (section) => {
  if (!section || typeof section !== "object") {
    return;
  }
  Object.entries(section).forEach(([key, payload]) => {
    const source = normalize(payload?.source);
    const sourceHasEnglish = /\benglish\b/.test(source);
    if (LEGACY_ENGLISH_SOURCES.includes(source) || sourceHasEnglish) {
      delete section[key];
    }
  });
};

const applyForWorld = (worldKey) => {
  if (worldKey === "english") {
    return false;
  }
  const worldDir = path.join(WORLDS_DIR, worldKey);
  const metaPath = path.join(worldDir, `${worldKey}.world.meta.json`);
  const packPath = path.join(worldDir, "translations.json");
  if (!fs.existsSync(metaPath) || !fs.existsSync(packPath)) {
    return false;
  }

  const meta = readJson(metaPath);
  const pack = readJson(packPath);
  const phraseIntents = meta?.phraseIntents;
  const englishLanguageLabel = String(phraseIntents?.englishLanguageLabel || "")
    .trim()
    .toLowerCase();
  const forms = phraseIntents?.forms || {};
  if (!englishLanguageLabel || typeof forms !== "object") {
    return false;
  }

  if (!pack.phrases || typeof pack.phrases !== "object") {
    pack.phrases = {};
  }
  if (!pack.phrases.Introductions || typeof pack.phrases.Introductions !== "object") {
    pack.phrases.Introductions = {};
  }
  if (!pack.phrases.Questions || typeof pack.phrases.Questions !== "object") {
    pack.phrases.Questions = {};
  }

  removeLegacyIntentEntries(pack.phrases.Introductions);
  removeLegacyIntentEntries(pack.phrases.Questions);

  INTENT_SPECS.forEach((spec) => {
    const worldPhrase = String(forms[spec.intent] || "").trim();
    if (!worldPhrase) {
      return;
    }
    const source = spec.sourceBuilder(englishLanguageLabel);
    const targetSection = pack.phrases[spec.section];
    targetSection[worldPhrase] = {
      source,
      intent: spec.intent,
      translations: {
        english: source,
      },
    };
  });

  if (!pack.worldSource || typeof pack.worldSource !== "object") {
    pack.worldSource = {};
  }
  if (!pack.worldSource.phrases || typeof pack.worldSource.phrases !== "object") {
    pack.worldSource.phrases = {};
  }
  if (
    !pack.worldSource.phrases.Introductions ||
    typeof pack.worldSource.phrases.Introductions !== "object"
  ) {
    pack.worldSource.phrases.Introductions = {};
  }
  if (
    !pack.worldSource.phrases.Questions ||
    typeof pack.worldSource.phrases.Questions !== "object"
  ) {
    pack.worldSource.phrases.Questions = {};
  }

  INTENT_SPECS.forEach((spec) => {
    const worldPhrase = String(forms[spec.intent] || "").trim();
    if (!worldPhrase) {
      return;
    }
    const source = spec.sourceBuilder(englishLanguageLabel);
    const section = pack.worldSource.phrases[spec.section];
    section[normalize(source)] = worldPhrase;
  });

  pack.generatedAt = new Date().toISOString();
  writeJson(packPath, pack);
  return true;
};

const run = () => {
  const worldKeys = fs
    .readdirSync(WORLDS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  let changed = 0;
  worldKeys.forEach((worldKey) => {
    if (applyForWorld(worldKey)) {
      changed += 1;
      console.log(`Applied intent phrases: ${worldKey}`);
    }
  });

  console.log(`Intent phrase apply complete. Worlds updated: ${changed}`);
};

run();
