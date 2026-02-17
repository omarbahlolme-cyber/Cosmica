/* ==========================================================================
   WORLD ROMANIZATION GENERATOR
   Adds `romanization` fields to word/phrase entries for non-Latin worlds:
   frontend/worlds/<world>/translations.json
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const WORLD_CONFIG = Object.freeze({
  arabic: Object.freeze({
    label: "Arabic",
    scheme:
      "Accurate Arabic transliteration in Latin script. Keep pronunciation clear and readable for learners. Use apostrophes only when needed.",
  }),
  chinese: Object.freeze({
    label: "Mandarin Chinese (Simplified)",
    scheme:
      "Hanyu Pinyin with tone marks (for example: ni hao with tone marks). Output only transliteration, not translation.",
  }),
  japanese: Object.freeze({
    label: "Japanese",
    scheme:
      "Hepburn romaji with natural spacing for phrases. Output only transliteration, not translation.",
  }),
  korean: Object.freeze({
    label: "Korean",
    scheme:
      "Revised Romanization of Korean. Output only transliteration, not translation.",
  }),
  hindi: Object.freeze({
    label: "Hindi (Devanagari)",
    scheme:
      "Precise Hindi transliteration in Latin script for learners. Use diacritics only where helpful and keep output readable.",
  }),
});

const DEFAULT_WORLDS = Object.keys(WORLD_CONFIG).join(",");
const TARGET_WORLDS = String(process.env.ROMANIZATION_WORLDS || DEFAULT_WORLDS)
  .split(",")
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);
const BATCH_SIZE = Math.max(10, Number(process.env.ROMANIZATION_BATCH_SIZE || 72));
const REQUEST_DELAY_MS = Math.max(0, Number(process.env.ROMANIZATION_DELAY_MS || 120));
const MODEL =
  process.env.OPENAI_TRANSLITERATION_MODEL ||
  process.env.OPENAI_TRANSLATE_MODEL ||
  process.env.OPENAI_MODEL ||
  "gpt-4o-mini";

const apiKey = process.env.OPENAI_TRANSLATE_KEY || process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_TRANSLATE_KEY or OPENAI_API_KEY");
  process.exit(1);
}

const client = new OpenAI({ apiKey });
const worldsRoot = path.join(__dirname, "..", "frontend", "worlds");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const chunkArray = (items, size) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const normalizeLookupKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const cleanRomanization = (value) =>
  String(value || "")
    .replace(/^["'`]|["'`]$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const readWorldPack = (worldKey) => {
  const filePath = path.join(worldsRoot, worldKey, "translations.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing translations pack: ${filePath}`);
  }
  const payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return { filePath, payload };
};

const saveWorldPack = (filePath, payload) => {
  payload.generatedAt = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
};

const transliterateBatch = async ({ worldKey, sectionLabel, items }) => {
  const world = WORLD_CONFIG[worldKey];
  const response = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.1,
    max_tokens: 2200,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a precise transliteration engine. Return valid JSON only, with no additional text.",
      },
      {
        role: "user",
        content: JSON.stringify({
          worldLanguage: world.label,
          transliterationStandard: world.scheme,
          section: sectionLabel,
          items,
          instructions:
            "For each item, output only its Latin-script transliteration (romanization). " +
            "Do not translate meaning. Keep punctuation intent. " +
            'Return JSON exactly in this shape: {"romanizations":{"<original>":"<romanized>"}}',
        }),
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error(`Empty romanization response (${worldKey} / ${sectionLabel})`);
  }

  const parsed = JSON.parse(content);
  const romanizations =
    parsed?.romanizations && typeof parsed.romanizations === "object" ? parsed.romanizations : {};
  const normalized = {};
  Object.entries(romanizations).forEach(([source, romanized]) => {
    const key = normalizeLookupKey(source);
    const value = cleanRomanization(romanized);
    if (key && value) {
      normalized[key] = value;
    }
  });
  return normalized;
};

const collectMissing = (entries) =>
  Object.keys(entries || {}).filter((text) => {
    const value = cleanRomanization(entries?.[text]?.romanization);
    return !value;
  });

const applyRomanizationToSection = async ({
  worldKey,
  pack,
  filePath,
  mapType,
  sectionName,
  entries,
}) => {
  const missing = collectMissing(entries);
  if (!missing.length) {
    return { added: 0, missing: 0 };
  }

  let added = 0;
  let unresolved = 0;
  const batches = chunkArray(missing, BATCH_SIZE);
  for (const batch of batches) {
    console.log(
      `Romanizing ${worldKey} ${mapType}/${sectionName}: ${batch.length} items (${added + unresolved + 1}/${missing.length}+)`
    );
    const result = await transliterateBatch({
      worldKey,
      sectionLabel: `${mapType}/${sectionName}`,
      items: batch,
    });
    batch.forEach((sourceText) => {
      const lookup = normalizeLookupKey(sourceText);
      const romanization = result[lookup] || "";
      if (!romanization) {
        unresolved += 1;
        return;
      }
      entries[sourceText].romanization = romanization;
      added += 1;
    });
    saveWorldPack(filePath, pack);
    await delay(REQUEST_DELAY_MS);
  }

  return { added, missing: unresolved };
};

const processWorld = async (worldKey) => {
  const config = WORLD_CONFIG[worldKey];
  if (!config) {
    console.warn(`Skipping unsupported world key "${worldKey}"`);
    return;
  }

  const { filePath, payload } = readWorldPack(worldKey);
  const packWorldLanguage = String(payload?.worldLanguage || "")
    .trim()
    .toLowerCase();
  if (packWorldLanguage && packWorldLanguage !== worldKey) {
    throw new Error(
      `World mismatch for ${worldKey}: pack reports worldLanguage="${packWorldLanguage}"`
    );
  }

  let addedTotal = 0;
  let unresolvedTotal = 0;
  const mapTypes = ["words", "phrases"];
  for (const mapType of mapTypes) {
    const sections = payload?.[mapType];
    if (!sections || typeof sections !== "object") {
      continue;
    }
    for (const [sectionName, entries] of Object.entries(sections)) {
      if (!entries || typeof entries !== "object" || Array.isArray(entries)) {
        continue;
      }
      const { added, missing } = await applyRomanizationToSection({
        worldKey,
        pack: payload,
        filePath,
        mapType,
        sectionName,
        entries,
      });
      addedTotal += added;
      unresolvedTotal += missing;
    }
  }

  saveWorldPack(filePath, payload);
  console.log(
    `Completed ${worldKey}: added ${addedTotal} romanizations, unresolved ${unresolvedTotal}`
  );
};

const run = async () => {
  for (const worldKey of TARGET_WORLDS) {
    await processWorld(worldKey);
  }
  console.log("Romanization generation complete.");
};

run().catch((error) => {
  console.error("Romanization generation failed:", error);
  process.exit(1);
});
