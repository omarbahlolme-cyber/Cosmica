const fs = require("fs");
const path = require("path");
const vm = require("vm");
const OpenAI = require("openai");
require("dotenv").config();

const appPath = path.join(__dirname, "..", "app.js");
const WORLD_LANGUAGE = process.env.WORLD_LANGUAGE || "French";
const WORLD_LANG_KEY = WORLD_LANGUAGE.toLowerCase();
const outputPath = path.join(__dirname, "..", `translations.${WORLD_LANG_KEY}.json`);

const apiKey = process.env.OPENAI_TRANSLATE_KEY || process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_TRANSLATE_KEY or OPENAI_API_KEY");
  process.exit(1);
}

const client = new OpenAI({ apiKey });
const appSource = fs.readFileSync(appPath, "utf8");

const extractArray = (regex, label) => {
  const match = appSource.match(regex);
  if (!match) {
    throw new Error(`Unable to find ${label} in app.js`);
  }
  return vm.runInNewContext(`[${match[1]}]`);
};

const extractObject = (regex, label) => {
  const match = appSource.match(regex);
  if (!match) {
    throw new Error(`Unable to find ${label} in app.js`);
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

const normalizeKey = (value) => value.toString().trim().toLowerCase();
const chunkArray = (items, size) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const REQUEST_DELAY_MS = Number(process.env.TRANSLATION_DELAY_MS || 150);
const BATCH_SIZE = Number(process.env.TRANSLATION_BATCH_SIZE || 50);

const translateBatch = async (items, sourceLanguage, targetLanguage, label) => {
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_TRANSLATE_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini",
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
          instructions: `Translate the following ${label} from ${sourceLanguage} into ${targetLanguage}. Preserve meaning, tone, punctuation, and case. Return JSON with a single object: { "translations": { "<original>": "<translated>", ... } }`,
        }),
      },
    ],
    temperature: 0.2,
    max_tokens: 1600,
    response_format: { type: "json_object" },
  });

  const content = response.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Empty translation response");
  }

  const parsed = JSON.parse(content);
  const translations =
    parsed?.translations && typeof parsed.translations === "object" ? parsed.translations : {};

  const normalized = {};
  Object.entries(translations).forEach(([source, translated]) => {
    normalized[normalizeKey(source)] = translated;
  });

  return normalized;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const loadExisting = () => {
  if (!fs.existsSync(outputPath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(outputPath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to load existing translation file", error);
    return null;
  }
};

const saveProgress = (result) => {
  result.generatedAt = new Date().toISOString();
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf8");
};

const ensureSection = (container, section) => {
  if (!container[section]) {
    container[section] = {};
  }
};

const translateSectionItems = async (sectionItems, label, resultSection, sourceMap) => {
  const missingSource = sectionItems.filter((item) => !sourceMap[normalizeKey(item)]);
  const sourceBatches = chunkArray(missingSource, BATCH_SIZE);
  for (const batch of sourceBatches) {
    if (!batch.length) {
      continue;
    }
    console.log(`Creating ${WORLD_LANGUAGE} ${label} | ${batch.length} items`);
    const translatedMap = await translateBatch(batch, "English", WORLD_LANGUAGE, label);
    batch.forEach((item) => {
      const key = normalizeKey(item);
      sourceMap[key] = translatedMap[key] || "";
    });
    saveProgress(resultSection.root);
    await delay(REQUEST_DELAY_MS);
  }

  for (const [englishKey, worldValue] of Object.entries(sourceMap)) {
    if (!worldValue) {
      continue;
    }
    const worldKey = normalizeKey(worldValue);
    if (!resultSection.data[worldKey]) {
      resultSection.data[worldKey] = {
        source: englishKey,
        translations: {},
      };
    }
  }

  for (const language of BASE_LANGUAGES) {
    const langKey = normalizeKey(language);
    const missingWorld = Object.entries(resultSection.data)
      .filter(([, value]) => !value.translations?.[langKey])
      .map(([worldKey]) => worldKey);
    const batches = chunkArray(missingWorld, BATCH_SIZE);
    for (const batch of batches) {
      if (!batch.length) {
        continue;
      }
      console.log(
        `Translating ${label} | ${WORLD_LANGUAGE} -> ${language} | ${batch.length} items`
      );
      const translatedMap = await translateBatch(batch, WORLD_LANGUAGE, language, label);
      batch.forEach((item) => {
        const translation = translatedMap[item] || "";
        if (!resultSection.data[item]) {
          resultSection.data[item] = { source: "", translations: {} };
        }
        resultSection.data[item].translations[langKey] = translation;
      });
      saveProgress(resultSection.root);
      await delay(REQUEST_DELAY_MS);
    }
  }
};

const buildGrammarExplanation = (title) =>
  `This card explains ${title} and how to form it clearly in real sentences.`;

const translateGrammar = async (result) => {
  const grammarResult = result.grammar;
  Object.entries(GRAMMAR_SECTION_LISTS).forEach(([section]) => {
    ensureSection(grammarResult.examples, section);
    ensureSection(grammarResult.explanations, section);
    ensureSection(grammarResult.titles, section);
    ensureSection(result.worldSource.grammarExamples, section);
    ensureSection(result.worldSource.grammarExplanations, section);
    ensureSection(result.worldSource.grammarTitles, section);
  });

  for (const [section, cards] of Object.entries(GRAMMAR_SECTION_LISTS)) {
    const titles = cards.map((card) => card.title.trim());
    const examples = cards.map((card) => (card.example || "").trim()).filter(Boolean);
    const explanations = titles.map((title) => buildGrammarExplanation(title));

    const titleSourceMap = result.worldSource.grammarTitles[section];
    const exampleSourceMap = result.worldSource.grammarExamples[section];
    const explanationSourceMap = result.worldSource.grammarExplanations[section];

    await translateSectionItems(
      titles,
      "grammar titles",
      {
        data: grammarResult.titles[section],
        root: result,
      },
      titleSourceMap
    );

    await translateSectionItems(
      examples,
      "grammar examples",
      {
        data: grammarResult.examples[section],
        root: result,
      },
      exampleSourceMap
    );

    await translateSectionItems(
      explanations,
      "grammar explanations",
      {
        data: grammarResult.explanations[section],
        root: result,
      },
      explanationSourceMap
    );
  }
};

const run = async () => {
  const existing = loadExisting();
  const result = {
    generatedAt: existing?.generatedAt || new Date().toISOString(),
    worldLanguage: WORLD_LANGUAGE,
    baseLanguages: BASE_LANGUAGES,
    words: existing?.words || {},
    phrases: existing?.phrases || {},
    grammar: existing?.grammar || { titles: {}, explanations: {}, examples: {} },
    worldSource: existing?.worldSource || {
      words: {},
      phrases: {},
      grammarTitles: {},
      grammarExamples: {},
      grammarExplanations: {},
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

  for (const [sectionName, items] of Object.entries(WORD_SECTION_LISTS)) {
    await translateSectionItems(
      items,
      "words",
      {
        data: result.words[sectionName],
        root: result,
      },
      result.worldSource.words[sectionName]
    );
  }

  for (const [sectionName, items] of Object.entries(PHRASE_SECTION_LISTS)) {
    await translateSectionItems(
      items,
      "phrases",
      {
        data: result.phrases[sectionName],
        root: result,
      },
      result.worldSource.phrases[sectionName]
    );
  }

  await translateGrammar(result);

  saveProgress(result);
  console.log(`Saved translations to ${outputPath}`);
};

run().catch((error) => {
  console.error("World translation generation failed:", error);
  process.exit(1);
});
