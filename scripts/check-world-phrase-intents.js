/* ==========================================================================
   WORLD PHRASE INTENT CHECK
   Prevents non-English worlds from shipping English-anchored phrase intents.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const worldsRoot = path.join(__dirname, "..", "frontend", "worlds");
const legacySources = [
  "i am learning english",
  "i speak english",
  "i do not speak english",
  "do you speak english",
];
const requiredIntents = [
  "learn_world_language",
  "speak_world_language",
  "not_speak_world_language",
  "ask_speak_world_language",
];

const readJson = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
};

const fail = (message) => {
  console.error(`FAIL [world-intents] ${message}`);
  process.exitCode = 1;
};

const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

const run = () => {
  const worldDirs = fs
    .readdirSync(worldsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  worldDirs.forEach((worldKey) => {
    if (worldKey === "english") {
      return;
    }
    const worldMetaPath = path.join(worldsRoot, worldKey, `${worldKey}.world.meta.json`);
    if (!fs.existsSync(worldMetaPath)) {
      return;
    }
    const worldMeta = readJson(worldMetaPath);
    const intentForms = worldMeta?.phraseIntents?.forms;
    if (!isObject(intentForms)) {
      return;
    }
    const packPath = path.join(worldsRoot, worldKey, "translations.json");
    if (!fs.existsSync(packPath)) {
      return;
    }
    const pack = readJson(packPath);
    const phrases = isObject(pack?.phrases) ? pack.phrases : {};

    const phraseEntries = [];
    ["Introductions", "Questions"].forEach((sectionName) => {
      const section = isObject(phrases?.[sectionName]) ? phrases[sectionName] : {};
      Object.entries(section).forEach(([worldPhrase, payload]) => {
        if (!isObject(payload)) {
          return;
        }
        phraseEntries.push({
          section: sectionName,
          worldPhrase,
          source: String(payload.source || "").trim().toLowerCase(),
          intent: String(payload.intent || "").trim(),
        });
      });
    });

    legacySources.forEach((legacySource) => {
      const hit = phraseEntries.find((entry) => entry.source === legacySource);
      if (hit) {
        fail(
          `${worldKey}: legacy source "${legacySource}" still present (section="${hit.section}", phrase="${hit.worldPhrase}").`
        );
      }
    });

    requiredIntents.forEach((intentKey) => {
      const hit = phraseEntries.find((entry) => entry.intent === intentKey);
      if (!hit) {
        fail(`${worldKey}: missing required phrase intent "${intentKey}".`);
      }
    });
  });

  if (!process.exitCode) {
    console.log("PASS [world-intents] non-English phrase intents are world-native");
  }
};

run();
