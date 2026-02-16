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

const normalize = (value) => String(value || "").trim().toLowerCase();
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

  const buildSection = (sourceSections = {}, targetSections, sourceMapSections) => {
    Object.entries(sourceSections || {}).forEach(([sectionName, items]) => {
      targetSections[sectionName] = {};
      sourceMapSections[sectionName] = {};
      Object.entries(items || {}).forEach(([englishText, translations]) => {
        const sourceEnglish = fixMojibake(String(englishText || "")).trim();
        if (!sourceEnglish) {
          return;
        }
        const worldText = fixMojibake(
          String(translations?.[WORLD_COLUMN] || sourceEnglish)
        ).trim();
        if (!worldText) {
          return;
        }
        const worldKey = worldText;
        if (!targetSections[sectionName][worldKey]) {
          targetSections[sectionName][worldKey] = {
            source: sourceEnglish,
            translations: {
              english: sourceEnglish,
            },
          };
        }
        sourceMapSections[sectionName][normalize(sourceEnglish)] = worldText;
      });
    });
  };

  buildSection(base.words, result.words, result.worldSource.words);
  buildSection(base.phrases, result.phrases, result.worldSource.phrases);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
  console.log(`Saved ${WORLD_KEY} world pack to ${outPath}`);
};

run();
