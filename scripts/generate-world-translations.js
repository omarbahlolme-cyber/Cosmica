/* ==========================================================================
   WORLD CONTENT GENERATOR
   Creates a world-native pack:
   frontend/worlds/<world>/translations.json
   - Words/Phrases display in world language (source tracked to English)
   - Grammar titles/examples/explanations translated to world language
   - Grammar cards translated (title, rules points, example, mistakes)
   - Base-language translations use source fallback at runtime (no huge precompute)
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const OpenAI = require("openai");
require("dotenv").config();

const mapsPath = path.join(__dirname, "..", "frontend", "maps", "app-maps.js");
const WORLD_LANGUAGE = String(process.env.WORLD_LANGUAGE || "French").trim();
const WORLD_LANG_KEY = WORLD_LANGUAGE.toLowerCase();
const outputDir = path.join(__dirname, "..", "frontend", "worlds", WORLD_LANG_KEY);
const outputPath = path.join(outputDir, "translations.json");

const apiKey = process.env.OPENAI_TRANSLATE_KEY || process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_TRANSLATE_KEY or OPENAI_API_KEY");
  process.exit(1);
}

const client = new OpenAI({ apiKey });
const mapsSource = fs.readFileSync(mapsPath, "utf8");

const extractArray = (regex, label) => {
  const match = mapsSource.match(regex);
  if (!match) {
    throw new Error(`Unable to find ${label} in frontend/maps/app-maps.js`);
  }
  return vm.runInNewContext(`[${match[1]}]`);
};

const extractObject = (regex, label) => {
  const match = mapsSource.match(regex);
  if (!match) {
    throw new Error(`Unable to find ${label} in frontend/maps/app-maps.js`);
  }
  return vm.runInNewContext(`(${match[1]})`);
};

const BASE_LANGUAGES = extractArray(/const BASE_LANGUAGES = \[([\s\S]*?)\];/, "BASE_LANGUAGES");
const WORD_SECTION_LISTS = extractObject(
  /const WORD_SECTION_LISTS = ({[\s\S]*?});/,
  "WORD_SECTION_LISTS"
);
const PHRASE_SECTION_LISTS = extractObject(
  /const PHRASE_SECTION_LISTS = ({[\s\S]*?});/,
  "PHRASE_SECTION_LISTS"
);
const GRAMMAR_SECTION_LISTS = extractObject(
  /const GRAMMAR_SECTION_LISTS = ({[\s\S]*?});/,
  "GRAMMAR_SECTION_LISTS"
);
const GRAMMAR_MISTAKES = extractObject(
  /const GRAMMAR_MISTAKES = ({[\s\S]*?});/,
  "GRAMMAR_MISTAKES"
);

const REQUEST_DELAY_MS = Number(process.env.TRANSLATION_DELAY_MS || 120);
const BATCH_SIZE = Number(process.env.TRANSLATION_BATCH_SIZE || 80);
const MODEL = process.env.OPENAI_TRANSLATE_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";

const normalizeKey = (value) => String(value || "").trim().toLowerCase();
const chunkArray = (items, size) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureSection = (container, section) => {
  if (!container[section]) {
    container[section] = {};
  }
};

const loadExisting = () => {
  if (!fs.existsSync(outputPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(outputPath, "utf8"));
  } catch (error) {
    console.warn("Failed to load existing world translation pack. Rebuilding.", error.message);
    return null;
  }
};

const saveProgress = (result) => {
  result.generatedAt = new Date().toISOString();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf8");
};

const translateBatch = async (items, sourceLanguage, targetLanguage, label) => {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are a professional human translator. Output valid JSON only with no extra text.",
      },
      {
        role: "user",
        content: JSON.stringify({
          sourceLanguage,
          targetLanguage,
          items,
          instructions:
            `Translate the ${label} from ${sourceLanguage} into ${targetLanguage}. ` +
            "Preserve meaning and punctuation. Keep output concise. " +
            'Return JSON only: {"translations":{"<original>":"<translated>"}}',
        }),
      },
    ],
    temperature: 0.2,
    max_tokens: 2200,
    response_format: { type: "json_object" },
  });

  const content = response.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error(`Empty translation response for ${label}`);
  }
  const parsed = JSON.parse(content);
  const translations =
    parsed?.translations && typeof parsed.translations === "object" ? parsed.translations : {};

  const normalized = {};
  Object.entries(translations).forEach(([source, translated]) => {
    normalized[normalizeKey(source)] = String(translated || "").trim();
  });
  return normalized;
};

const translateToWorldCached = async (items, label, sourceToWorldMap, result) => {
  const unique = [...new Set((items || []).map((item) => String(item || "").trim()).filter(Boolean))];
  const missing = unique.filter((item) => !sourceToWorldMap[normalizeKey(item)]);
  for (const batch of chunkArray(missing, BATCH_SIZE)) {
    if (!batch.length) {
      continue;
    }
    console.log(`Translating ${label} -> ${WORLD_LANGUAGE} (${batch.length})`);
    const translatedMap = await translateBatch(batch, "English", WORLD_LANGUAGE, label);
    batch.forEach((item) => {
      const key = normalizeKey(item);
      sourceToWorldMap[key] = translatedMap[key] || item;
    });
    saveProgress(result);
    await delay(REQUEST_DELAY_MS);
  }
};

const buildGrammarExplanation = (title) =>
  `This card explains ${title} and how to form it clearly in real sentences.`;

const run = async () => {
  const existing = loadExisting();
  const result = {
    generatedAt: existing?.generatedAt || new Date().toISOString(),
    worldLanguage: WORLD_LANG_KEY,
    baseLanguages: BASE_LANGUAGES,
    words: existing?.words || {},
    phrases: existing?.phrases || {},
    grammar: existing?.grammar || {
      titles: {},
      examples: {},
      explanations: {},
      cards: {},
    },
    worldSource: existing?.worldSource || {
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

  for (const section of Object.keys(WORD_SECTION_LISTS)) {
    ensureSection(result.words, section);
    ensureSection(result.worldSource.words, section);
  }
  for (const section of Object.keys(PHRASE_SECTION_LISTS)) {
    ensureSection(result.phrases, section);
    ensureSection(result.worldSource.phrases, section);
  }
  for (const section of Object.keys(GRAMMAR_SECTION_LISTS)) {
    ensureSection(result.grammar.titles, section);
    ensureSection(result.grammar.examples, section);
    ensureSection(result.grammar.explanations, section);
    if (!Array.isArray(result.grammar.cards[section])) {
      result.grammar.cards[section] = [];
    }
    ensureSection(result.worldSource.grammarTitles, section);
    ensureSection(result.worldSource.grammarExamples, section);
    ensureSection(result.worldSource.grammarExplanations, section);
    ensureSection(result.worldSource.grammarPoints, section);
    ensureSection(result.worldSource.grammarMistakeWrong, section);
    ensureSection(result.worldSource.grammarMistakeFix, section);
  }

  for (const [section, items] of Object.entries(WORD_SECTION_LISTS)) {
    await translateToWorldCached(items, `words / ${section}`, result.worldSource.words[section], result);
    Object.entries(result.worldSource.words[section]).forEach(([englishKey, worldWord]) => {
      const worldKey = normalizeKey(worldWord);
      if (!worldKey) {
        return;
      }
      const sourceEnglish = String(items.find((item) => normalizeKey(item) === englishKey) || englishKey);
      result.words[section][worldKey] = {
        source: sourceEnglish,
        translations: {
          english: sourceEnglish,
        },
      };
    });
    saveProgress(result);
  }

  for (const [section, items] of Object.entries(PHRASE_SECTION_LISTS)) {
    await translateToWorldCached(
      items,
      `phrases / ${section}`,
      result.worldSource.phrases[section],
      result
    );
    Object.entries(result.worldSource.phrases[section]).forEach(([englishKey, worldPhrase]) => {
      const worldKey = normalizeKey(worldPhrase);
      if (!worldKey) {
        return;
      }
      const sourceEnglish = String(items.find((item) => normalizeKey(item) === englishKey) || englishKey);
      result.phrases[section][worldKey] = {
        source: sourceEnglish,
        translations: {
          english: sourceEnglish,
        },
      };
    });
    saveProgress(result);
  }

  for (const [section, cards] of Object.entries(GRAMMAR_SECTION_LISTS)) {
    const englishTitles = cards.map((card) => String(card.title || "").trim()).filter(Boolean);
    const englishExamples = cards.map((card) => String(card.example || "").trim()).filter(Boolean);
    const englishExplanations = englishTitles.map((title) => buildGrammarExplanation(title));

    await translateToWorldCached(
      englishTitles,
      `grammar titles / ${section}`,
      result.worldSource.grammarTitles[section],
      result
    );
    await translateToWorldCached(
      englishExamples,
      `grammar examples / ${section}`,
      result.worldSource.grammarExamples[section],
      result
    );
    await translateToWorldCached(
      englishExplanations,
      `grammar explanations / ${section}`,
      result.worldSource.grammarExplanations[section],
      result
    );

    const pointsInSection = [
      ...new Set(
        cards.flatMap((card) => (Array.isArray(card.points) ? card.points : [])).map((p) => String(p || "").trim()).filter(Boolean)
      ),
    ];
    await translateToWorldCached(
      pointsInSection,
      `grammar points / ${section}`,
      result.worldSource.grammarPoints[section],
      result
    );

    const mistakeWrongInSection = [];
    const mistakeFixInSection = [];
    cards.forEach((card) => {
      const pair = GRAMMAR_MISTAKES[normalizeKey(card.title)];
      if (!pair) {
        return;
      }
      if (pair.wrong) {
        mistakeWrongInSection.push(String(pair.wrong));
      }
      if (pair.fix) {
        mistakeFixInSection.push(String(pair.fix));
      }
    });
    await translateToWorldCached(
      [...new Set(mistakeWrongInSection)],
      `grammar mistakes (wrong) / ${section}`,
      result.worldSource.grammarMistakeWrong[section],
      result
    );
    await translateToWorldCached(
      [...new Set(mistakeFixInSection)],
      `grammar mistakes (fix) / ${section}`,
      result.worldSource.grammarMistakeFix[section],
      result
    );

    result.grammar.cards[section] = cards.map((card) => {
      const sourceTitle = String(card.title || "").trim();
      const sourceExample = String(card.example || "").trim();
      const translatedTitle =
        result.worldSource.grammarTitles[section][normalizeKey(sourceTitle)] || sourceTitle;
      const translatedExample =
        result.worldSource.grammarExamples[section][normalizeKey(sourceExample)] || sourceExample;
      const translatedPoints = (card.points || []).map((point) => {
        const sourcePoint = String(point || "").trim();
        if (!sourcePoint) {
          return sourcePoint;
        }
        return (
          result.worldSource.grammarPoints[section][normalizeKey(sourcePoint)] || sourcePoint
        );
      });
      const sourceMistake = GRAMMAR_MISTAKES[normalizeKey(sourceTitle)];
      const mistakes = sourceMistake
        ? [
            {
              wrong:
                result.worldSource.grammarMistakeWrong[section][
                  normalizeKey(sourceMistake.wrong)
                ] || sourceMistake.wrong,
              fix:
                result.worldSource.grammarMistakeFix[section][
                  normalizeKey(sourceMistake.fix)
                ] || sourceMistake.fix,
              sourceWrong: sourceMistake.wrong,
              sourceFix: sourceMistake.fix,
            },
          ]
        : [];

      return {
        title: translatedTitle,
        sourceTitle,
        points: translatedPoints,
        sourcePoints: [...(card.points || [])],
        example: translatedExample,
        sourceExample,
        mistakes,
      };
    });

    Object.entries(result.worldSource.grammarTitles[section]).forEach(([englishKey, worldTitle]) => {
      const sourceTitle =
        englishTitles.find((item) => normalizeKey(item) === englishKey) || englishKey;
      const worldKey = normalizeKey(worldTitle);
      if (!worldKey) {
        return;
      }
      result.grammar.titles[section][worldKey] = {
        source: sourceTitle,
        translations: {
          english: sourceTitle,
        },
      };
    });

    Object.entries(result.worldSource.grammarExamples[section]).forEach(
      ([englishKey, worldExample]) => {
        const sourceExample =
          englishExamples.find((item) => normalizeKey(item) === englishKey) || englishKey;
        const worldKey = normalizeKey(worldExample);
        if (!worldKey) {
          return;
        }
        result.grammar.examples[section][worldKey] = {
          source: sourceExample,
          translations: {
            english: sourceExample,
          },
        };
      }
    );

    Object.entries(result.worldSource.grammarExplanations[section]).forEach(
      ([englishKey, worldExplanation]) => {
        const sourceExplanation =
          englishExplanations.find((item) => normalizeKey(item) === englishKey) || englishKey;
        const worldKey = normalizeKey(worldExplanation);
        if (!worldKey) {
          return;
        }
        result.grammar.explanations[section][worldKey] = {
          source: sourceExplanation,
          translations: {
            english: sourceExplanation,
          },
        };
      }
    );

    saveProgress(result);
  }

  saveProgress(result);
  console.log(`Saved world translation pack to ${outputPath}`);
};

run().catch((error) => {
  console.error("World translation generation failed:", error);
  process.exit(1);
});
