/* ==========================================================================
   WORLD PACK BOOTSTRAP (NO LLM)
   Builds a world pack from frontend/maps/translations.json so non-English
   worlds always display words/phrases in the world language first.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const WORLD_KEY = String(process.env.WORLD_KEY || process.env.WORLD_LANGUAGE || "german")
  .trim()
  .toLowerCase();
const WORLD_COLUMN = String(process.env.WORLD_COLUMN || WORLD_KEY)
  .trim()
  .toLowerCase();

const basePath = path.join(__dirname, "..", "frontend", "maps", "translations.json");
const outDir = path.join(__dirname, "..", "frontend", "worlds", WORLD_KEY);
const outPath = path.join(outDir, "translations.json");
const worldMetaPath = path.join(
  __dirname,
  "..",
  "frontend",
  "worlds",
  WORLD_KEY,
  `${WORLD_KEY}.world.meta.json`
);

const normalize = (value) => String(value || "").trim().toLowerCase();
const PHRASE_INTENT_BY_ENGLISH_SOURCE = {
  "i am learning english": "learn_world_language",
  "i speak english": "speak_world_language",
  "i do not speak english": "not_speak_world_language",
  "do you speak english": "ask_speak_world_language",
};

const WORLD_LANGUAGE_INTENT_CONFIG = {
  french: {
    englishLanguageLabel: "french",
    forms: {
      learn_world_language: "j'apprends le français",
      speak_world_language: "je parle français",
      not_speak_world_language: "je ne parle pas français",
      ask_speak_world_language: "parles-tu français",
    },
  },
  german: {
    englishLanguageLabel: "german",
    forms: {
      learn_world_language: "ich lerne Deutsch",
      speak_world_language: "ich spreche Deutsch",
      not_speak_world_language: "ich spreche kein Deutsch",
      ask_speak_world_language: "sprichst du Deutsch",
    },
  },
  spanish: {
    englishLanguageLabel: "spanish",
    forms: {
      learn_world_language: "estoy aprendiendo español",
      speak_world_language: "hablo español",
      not_speak_world_language: "no hablo español",
      ask_speak_world_language: "¿hablas español?",
    },
  },
};

const readWorldMetaIntentConfig = () => {
  if (!fs.existsSync(worldMetaPath)) {
    return null;
  }
  try {
    const meta = JSON.parse(fs.readFileSync(worldMetaPath, "utf8"));
    const englishLanguageLabel = String(meta?.phraseIntents?.englishLanguageLabel || "").trim();
    const forms = meta?.phraseIntents?.forms || {};
    if (!englishLanguageLabel || typeof forms !== "object") {
      return null;
    }
    return {
      englishLanguageLabel,
      forms: {
        learn_world_language: String(forms.learn_world_language || "").trim(),
        speak_world_language: String(forms.speak_world_language || "").trim(),
        not_speak_world_language: String(forms.not_speak_world_language || "").trim(),
        ask_speak_world_language: String(forms.ask_speak_world_language || "").trim(),
      },
    };
  } catch {
    return null;
  }
};

const WORLD_INTENT_CONFIG = readWorldMetaIntentConfig() || WORLD_LANGUAGE_INTENT_CONFIG[WORLD_KEY];

const buildIntentEnglishSource = (intentKey, englishLanguageLabel) => {
  const label = String(englishLanguageLabel || "").trim().toLowerCase();
  if (!label) {
    return "";
  }
  switch (intentKey) {
    case "learn_world_language":
      return `i am learning ${label}`;
    case "speak_world_language":
      return `i speak ${label}`;
    case "not_speak_world_language":
      return `i do not speak ${label}`;
    case "ask_speak_world_language":
      return `do you speak ${label}`;
    default:
      return "";
  }
};

const resolvePhraseIntentOverride = (sectionName, sourceEnglish) => {
  const intentKey = PHRASE_INTENT_BY_ENGLISH_SOURCE[normalize(sourceEnglish)];
  if (!intentKey) {
    return null;
  }
  // These intent cards are intentionally scoped to phrase introductions/questions.
  if (sectionName !== "Introductions" && sectionName !== "Questions") {
    return null;
  }
  const worldConfig = WORLD_INTENT_CONFIG;
  if (!worldConfig) {
    return null;
  }
  const worldPhrase = String(worldConfig.forms?.[intentKey] || "").trim();
  const worldIntentSource = buildIntentEnglishSource(intentKey, worldConfig.englishLanguageLabel);
  if (!worldPhrase || !worldIntentSource) {
    return null;
  }
  return {
    intentKey,
    worldPhrase,
    worldIntentSource,
  };
};
const fixMojibake = (value) => {
  const text = String(value || "");
  // Repair common UTF-8 bytes misread as Latin-1/Windows-1252 (e.g. tschÃ¼ss -> tschüss).
  if (!/[ÃÂâ]/.test(text)) {
    return text;
  }
  try {
    const repaired = Buffer.from(text, "latin1").toString("utf8");
    return repaired || text;
  } catch {
    return text;
  }
};

const run = () => {
  const raw = fs.readFileSync(basePath, "utf8");
  const base = JSON.parse(raw);

  const result = {
    generatedAt: new Date().toISOString(),
    worldLanguage: WORLD_KEY,
    baseLanguages: Array.isArray(base.languages) ? base.languages : [],
    words: {},
    phrases: {},
    grammar: {
      titles: {},
      examples: {},
      explanations: {},
      cards: {},
      sectionLabels: {},
    },
    worldSource: {
      words: {},
      phrases: {},
      grammarTitles: {},
      grammarExamples: {},
      grammarExplanations: {},
      grammarPoints: {},
      grammarMistakeWrong: {},
      grammarMistakeFix: {},
    },
  };

  const buildSection = (sourceSections = {}, targetSections, sourceMapSections, sectionKind) => {
    Object.entries(sourceSections || {}).forEach(([sectionName, items]) => {
      targetSections[sectionName] = {};
      sourceMapSections[sectionName] = {};
      Object.entries(items || {}).forEach(([englishText, translations]) => {
        const rawSourceEnglish = fixMojibake(String(englishText || "")).trim();
        const sourceEnglish = rawSourceEnglish;
        if (!sourceEnglish) {
          return;
        }
        const phraseIntentOverride =
          sectionKind === "phrases" ? resolvePhraseIntentOverride(sectionName, sourceEnglish) : null;
        const worldText = fixMojibake(
          String(
            phraseIntentOverride?.worldPhrase ||
              translations?.[WORLD_COLUMN] ||
              sourceEnglish
          )
        ).trim();
        if (!worldText) {
          return;
        }
        const sourceForEntry = phraseIntentOverride?.worldIntentSource || sourceEnglish;
        const worldKey = worldText;
        if (!targetSections[sectionName][worldKey]) {
          targetSections[sectionName][worldKey] = {
            source: sourceForEntry,
            ...(phraseIntentOverride?.intentKey
              ? { intent: phraseIntentOverride.intentKey }
              : {}),
            translations: {
              english: sourceForEntry,
            },
          };
        }
        sourceMapSections[sectionName][normalize(sourceEnglish)] = worldText;
        if (sourceForEntry !== sourceEnglish) {
          sourceMapSections[sectionName][normalize(sourceForEntry)] = worldText;
        }
      });
    });
  };

  buildSection(base.words, result.words, result.worldSource.words, "words");
  buildSection(base.phrases, result.phrases, result.worldSource.phrases, "phrases");

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
  console.log(`Saved ${WORLD_KEY} world pack to ${outPath}`);
};

run();
