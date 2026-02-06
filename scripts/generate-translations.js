const fs = require("fs");
const path = require("path");
const vm = require("vm");
const OpenAI = require("openai");
require("dotenv").config();

const appPath = path.join(__dirname, "..", "app.js");
const outputPath = path.join(__dirname, "..", "translations.json");

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

const normalizeKey = (value) => value.toString().trim().toLowerCase();
const chunkArray = (items, size) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const REQUEST_DELAY_MS = Number(process.env.TRANSLATION_DELAY_MS || 150);
const BATCH_SIZE = Number(process.env.TRANSLATION_BATCH_SIZE || 60);

const translateBatch = async (items, targetLanguage, label) => {
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
          targetLanguage,
          items,
          instructions: `Translate the following ${label} from English into ${targetLanguage}. Preserve meaning, tone, punctuation, and case. Return JSON with a single object: { "translations": { "<original>": "<translated>", ... } }`,
        }),
      },
    ],
    temperature: 0.2,
    max_tokens: 1500,
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
    console.warn("Failed to load existing translations.json", error);
    return null;
  }
};

const saveProgress = (result) => {
  result.generatedAt = new Date().toISOString();
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf8");
};

const translateSections = async (sections, label, output, result) => {
  for (const [sectionName, items] of Object.entries(sections)) {
    const sectionItems = Array.isArray(items) ? items.map((item) => item.trim()) : [];
    if (!output[sectionName]) {
      output[sectionName] = {};
    }
    sectionItems.forEach((item) => {
      const itemKey = normalizeKey(item);
      if (!output[sectionName][itemKey]) {
        output[sectionName][itemKey] = {};
      }
    });

    for (const language of BASE_LANGUAGES) {
      const langKey = normalizeKey(language);
      const missingItems = sectionItems.filter((item) => {
        const itemKey = normalizeKey(item);
        return !output[sectionName][itemKey]?.[langKey];
      });
      if (!missingItems.length) {
        continue;
      }
      const batches = chunkArray(missingItems, BATCH_SIZE);
      for (const batch of batches) {
        console.log(`Translating ${label} | ${sectionName} | ${language} | ${batch.length} items`);
        const translatedMap = await translateBatch(batch, language, label);
        batch.forEach((item) => {
          const itemKey = normalizeKey(item);
          const translation = translatedMap[itemKey] || "";
          output[sectionName][itemKey][langKey] = translation;
        });
        saveProgress(result);
        await delay(REQUEST_DELAY_MS);
      }
    }
  }
};

const run = async () => {
  const existing = loadExisting();
  const result = {
    generatedAt: existing?.generatedAt || new Date().toISOString(),
    languages: BASE_LANGUAGES,
    words: existing?.words || {},
    phrases: existing?.phrases || {},
  };

  await translateSections(WORD_SECTION_LISTS, "words", result.words, result);
  await translateSections(PHRASE_SECTION_LISTS, "phrases", result.phrases, result);

  saveProgress(result);
  console.log(`Saved translations to ${outputPath}`);
};

run().catch((error) => {
  console.error("Translation generation failed:", error);
  process.exit(1);
});
