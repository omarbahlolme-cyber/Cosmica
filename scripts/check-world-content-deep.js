/* ==========================================================================
   WORLD CONTENT DEEP CHECK
   - Enforces world-level pedagogy metadata gates across all language packs.
   - Complements existing checks:
     - scripts/audit-learning-maps.js
     - scripts/check-world-phrase-intents.js
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const WORLDS_ROOT = path.join(ROOT, "frontend", "worlds");
const REQUIRED_INTENTS = [
  "learn_world_language",
  "speak_world_language",
  "not_speak_world_language",
  "ask_speak_world_language",
];
const INTENT_SCAN_SECTIONS = ["Introductions", "Questions"];
const REQUIRED_NON_ENGLISH_GRAMMAR_DISPLAY_MODES = ["english", "base"];

const readJson = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
};

const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

const hasNonEmptyString = (value) => String(value || "").trim().length > 0;

const fail = (failures, worldKey, message) => {
  failures.push({ worldKey, message });
};

const resolveWorldDirs = () =>
  fs
    .readdirSync(WORLDS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

const scanMapEntries = (mapObject, worldKey, mapKey, failures) => {
  if (!isObject(mapObject)) {
    return 0;
  }
  let entryCount = 0;
  Object.entries(mapObject).forEach(([sectionName, section]) => {
    if (sectionName === "sectionLabels") {
      return;
    }
    if (!isObject(section)) {
      fail(failures, worldKey, `${mapKey}.${sectionName} is not an object.`);
      return;
    }
    Object.entries(section).forEach(([nativeKey, entry]) => {
      entryCount += 1;
      if (!isObject(entry)) {
        fail(failures, worldKey, `${mapKey}.${sectionName}.${nativeKey} is not an object.`);
        return;
      }
      if (!hasNonEmptyString(entry.source)) {
        fail(
          failures,
          worldKey,
          `${mapKey}.${sectionName}.${nativeKey} is missing source text.`
        );
      }
      if (!hasNonEmptyString(entry?.translations?.english)) {
        fail(
          failures,
          worldKey,
          `${mapKey}.${sectionName}.${nativeKey} is missing translations.english.`
        );
      }
    });
  });
  return entryCount;
};

const main = () => {
  const worldKeys = resolveWorldDirs();
  const failures = [];
  const report = [];

  worldKeys.forEach((worldKey) => {
    const worldDir = path.join(WORLDS_ROOT, worldKey);
    const metaPath = path.join(worldDir, `${worldKey}.world.meta.json`);
    if (!fs.existsSync(metaPath)) {
      fail(failures, worldKey, `Missing meta file: ${path.relative(ROOT, metaPath)}`);
      return;
    }

    let meta;
    try {
      meta = readJson(metaPath);
    } catch (error) {
      fail(
        failures,
        worldKey,
        `Invalid JSON in meta file: ${path.relative(ROOT, metaPath)} (${error.message || error})`
      );
      return;
    }

    if (worldKey === "english") {
      const routesPath = path.join(worldDir, `${worldKey}.map-routes.json`);
      if (!fs.existsSync(routesPath)) {
        fail(failures, worldKey, `Missing routes file: ${path.relative(ROOT, routesPath)}`);
      }
      if (!hasNonEmptyString(meta.translationPack)) {
        fail(failures, worldKey, "Missing translationPack in english world meta.");
      }
      const grammarDisplayModes = Array.isArray(meta.grammarDisplayModes)
        ? meta.grammarDisplayModes.map((item) => String(item || "").trim().toLowerCase())
        : [];
      if (!grammarDisplayModes.includes("english")) {
        fail(failures, worldKey, "english world meta.grammarDisplayModes must include english.");
      }
      report.push({
        worldKey,
        status: "ok",
        checked: "meta+routing",
      });
      return;
    }

    const packPath = path.join(worldDir, "translations.json");
    if (!fs.existsSync(packPath)) {
      fail(failures, worldKey, `Missing translation pack: ${path.relative(ROOT, packPath)}`);
      return;
    }

    let pack;
    try {
      pack = readJson(packPath);
    } catch (error) {
      fail(
        failures,
        worldKey,
        `Invalid JSON in translation pack: ${path.relative(ROOT, packPath)} (${error.message || error})`
      );
      return;
    }

    const forms = meta?.phraseIntents?.forms;
    if (!isObject(forms)) {
      fail(failures, worldKey, "Missing phraseIntents.forms in world meta.");
    } else {
      REQUIRED_INTENTS.forEach((intentKey) => {
        if (!hasNonEmptyString(forms[intentKey])) {
          fail(failures, worldKey, `Missing phraseIntents.forms.${intentKey} in world meta.`);
        }
      });
    }

    if (!hasNonEmptyString(meta.nativeName)) {
      fail(failures, worldKey, "Missing nativeName in world meta.");
    } else if (String(meta.nativeName).includes("?")) {
      fail(
        failures,
        worldKey,
        `nativeName appears corrupted ("${String(meta.nativeName)}").`
      );
    }

    const grammarDisplayModes = Array.isArray(meta.grammarDisplayModes)
      ? meta.grammarDisplayModes.map((item) => String(item || "").trim().toLowerCase())
      : [];
    REQUIRED_NON_ENGLISH_GRAMMAR_DISPLAY_MODES.forEach((mode) => {
      if (!grammarDisplayModes.includes(mode)) {
        fail(failures, worldKey, `meta.grammarDisplayModes must include "${mode}".`);
      }
    });

    if (!isObject(pack.words)) {
      fail(failures, worldKey, "Missing words object in translations.json.");
    }
    if (!isObject(pack.phrases)) {
      fail(failures, worldKey, "Missing phrases object in translations.json.");
    }
    if (!isObject(pack.grammar) || !isObject(pack.grammar.cards)) {
      fail(failures, worldKey, "Missing grammar.cards object in translations.json.");
    }

    const wordsSectionCount = isObject(pack.words) ? Object.keys(pack.words).length : 0;
    const phrasesSectionCount = isObject(pack.phrases) ? Object.keys(pack.phrases).length : 0;
    const grammarSectionCount = isObject(pack?.grammar?.cards) ? Object.keys(pack.grammar.cards).length : 0;

    const wordsEntryCount = scanMapEntries(pack.words, worldKey, "words", failures);
    const phrasesEntryCount = scanMapEntries(pack.phrases, worldKey, "phrases", failures);
    const grammarCardCount = isObject(pack?.grammar?.cards)
      ? Object.values(pack.grammar.cards).reduce((sum, cards) => sum + (Array.isArray(cards) ? cards.length : 0), 0)
      : 0;

    if (wordsSectionCount === 0 || wordsEntryCount === 0) {
      fail(failures, worldKey, "Words content is empty.");
    }
    if (phrasesSectionCount === 0 || phrasesEntryCount === 0) {
      fail(failures, worldKey, "Phrases content is empty.");
    }
    if (grammarSectionCount === 0 || grammarCardCount === 0) {
      fail(failures, worldKey, "Grammar cards are empty.");
    }

    Object.entries(pack?.grammar?.cards || {}).forEach(([sectionName, cards]) => {
      if (!Array.isArray(cards)) {
        fail(failures, worldKey, `grammar.cards.${sectionName} is not an array.`);
        return;
      }
      cards.forEach((card, cardIndex) => {
        const ruleOrder = Array.isArray(card?.ruleOrder)
          ? card.ruleOrder.map((entry) => String(entry || "").trim()).filter(Boolean)
          : [];
        const highlights = Array.isArray(card?.exampleHighlights)
          ? card.exampleHighlights.filter(
              (entry) =>
                hasNonEmptyString(entry?.label) && hasNonEmptyString(entry?.text)
            )
          : [];
        if (ruleOrder.length >= 2 && highlights.length >= 2 && ruleOrder.length !== highlights.length) {
          fail(
            failures,
            worldKey,
            `Grammar card mismatch in ${sectionName} #${cardIndex + 1} (${ruleOrder.length} rule slots vs ${highlights.length} highlights).`
          );
        }
      });
    });

    const modalityCards = Array.isArray(pack?.grammar?.cards?.Modality)
      ? pack.grammar.cards.Modality
      : [];
    if (!modalityCards.length) {
      fail(failures, worldKey, "Missing Modality grammar section cards.");
    } else {
      modalityCards.forEach((card, cardIndex) => {
        const ruleOrder = Array.isArray(card?.ruleOrder)
          ? card.ruleOrder.map((entry) => String(entry || "").trim()).filter(Boolean)
          : [];
        const highlights = Array.isArray(card?.exampleHighlights)
          ? card.exampleHighlights.filter(
              (entry) =>
                hasNonEmptyString(entry?.label) && hasNonEmptyString(entry?.text)
            )
          : [];
        if (ruleOrder.length < 2) {
          fail(
            failures,
            worldKey,
            `Modality card #${cardIndex + 1} has insufficient ruleOrder entries.`
          );
        }
        if (highlights.length < 2) {
          fail(
            failures,
            worldKey,
            `Modality card #${cardIndex + 1} has insufficient exampleHighlights entries.`
          );
        }
        if (ruleOrder.length !== highlights.length) {
          fail(
            failures,
            worldKey,
            `Modality card #${cardIndex + 1} ruleOrder/exampleHighlights length mismatch (${ruleOrder.length} vs ${highlights.length}).`
          );
        }
      });
    }

    const intentHits = new Set();
    INTENT_SCAN_SECTIONS.forEach((sectionName) => {
      const section = isObject(pack?.phrases?.[sectionName]) ? pack.phrases[sectionName] : {};
      Object.values(section).forEach((entry) => {
        if (!isObject(entry)) {
          return;
        }
        const intent = String(entry.intent || "").trim();
        if (intent) {
          intentHits.add(intent);
        }
      });
    });
    REQUIRED_INTENTS.forEach((intentKey) => {
      if (!intentHits.has(intentKey)) {
        fail(failures, worldKey, `Intent not found in phrase entries: ${intentKey}`);
      }
    });

    report.push({
      worldKey,
      status: "ok",
      wordsSectionCount,
      phrasesSectionCount,
      grammarSectionCount,
      wordsEntryCount,
      phrasesEntryCount,
      grammarCardCount,
    });
  });

  if (failures.length) {
    console.error("FAIL [world-content-deep] detected issues:");
    failures.forEach((item) => {
      console.error(`- ${item.worldKey}: ${item.message}`);
    });
    process.exit(1);
  }

  console.log(`PASS [world-content-deep] ${report.length} worlds validated`);
  report.forEach((item) => {
    const counts = [
      `words=${item.wordsEntryCount ?? "-"}`,
      `phrases=${item.phrasesEntryCount ?? "-"}`,
      `grammarCards=${item.grammarCardCount ?? "-"}`,
    ].join(", ");
    console.log(`- ${item.worldKey}: ${counts}`);
  });
};

main();
