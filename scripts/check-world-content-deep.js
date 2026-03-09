/* ==========================================================================
   WORLD CONTENT DEEP CHECK
   - Enforces world-level pedagogy metadata gates across all language packs.
   - Complements existing checks:
     - scripts/audit-learning-maps.js
     - scripts/check-world-phrase-intents.js
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const {
  inferHighlightsForCard,
  sameHighlights,
} = require("./grammar-highlight-repairs");

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
const PHRASE_CANARIES = {
  german: {
    Introductions: {
      "Darf ich mich vorstellen?": "let me introduce myself",
    },
    Questions: {
      "was ist das da": "what is that",
    },
    Politeness: {
      "Ich weiß das zu schätzen": "i appreciate it",
    },
  },
  hindi: {
    Introductions: {
      "यह मेरा दोस्त है / यह मेरी दोस्त है": "this is my friend",
    },
    Politeness: {
      "मैं क्षमा चाहता/चाहती हूँ": "my apologies",
    },
    Requests: {
      "क्या मैं ... ले सकता/सकती हूँ?": "can i have",
      "क्या मुझे ... मिल सकता है?": "could i have",
      "मैं ... चाहूँगा/चाहूँगी": "i would like",
    },
  },
  japanese: {
    Introductions: {
      "こちらは私の兄 / 弟です": "this is my brother",
    },
    Politeness: {
      "失礼します": "pardon me",
      "本当にありがとうございます": "thanks a lot",
    },
    Questions: {
      "どこにいますか": "where are you",
    },
  },
  korean: {
    Introductions: {
      "제 이름은": "my name is",
      "저는": "i am",
      "이분은 제 친구예요": "this is my friend",
      "한국어를 말해요": "i speak korean",
    },
    Politeness: {
      "그건 죄송해요": "sorry about that",
      "정말 감사드립니다": "i appreciate it",
      "정말 감사합니다": "thanks a lot",
      "문제없어요": "no problem",
    },
    Questions: {
      "어디에 계세요?": "where are you",
    },
    Requests: {
      "...을/를 원해요": "i would like",
    },
  },
};
const WORD_CANARIES = {
  arabic: {
    "Questions & Connectors": {
      "من": "who",
    },
    "Verbs & Tenses": {
      "يكون": "be",
      "يذهب": "go",
      "يأخذ": "take",
      "يقول": "say",
      "يعطي": "give",
    },
    Pronouns: {
      "إياي": "me",
      "إياه": "him",
      "إياها": "her",
      "إيانا": "us",
      "إياهم": "them",
      "ـي": "my",
      "ـكَ / ـكِ": "your",
      "ـه": "his",
      "ـه / ـها": "its",
      "ـنا": "our",
      "ـهم": "their",
      "لي": "mine",
      "لك / لكِ": "yours",
      "لها": "hers",
      "لنا": "ours",
      "لهم": "theirs",
    },
  },
  chinese: {
    "Questions & Connectors": {
      "谁": "who",
    },
  },
  dutch: {
    "Questions & Connectors": {
      "wie": "who",
    },
    "Feelings & States": {
      kalm: "calm",
    },
    Pronouns: {
      zij: { source: "she / they", worldSources: ["she", "they"] },
      zijn: { source: "his / its", worldSources: ["his", "its"] },
      iedereen: { source: "everyone / everybody", worldSources: ["everyone", "everybody"] },
      iemand: { source: "someone / anyone", worldSources: ["someone", "anyone", "anybody"] },
    },
  },
  french: {
    "Questions & Connectors": {
      qui: "who",
    },
    Pronouns: {
      lui: { source: "him / her", worldSources: ["him"] },
      son: { source: "his / her / its", worldSources: ["his", "its"] },
      ces: { source: "these / those", worldSources: ["these", "those"] },
    },
  },
  german: {
    "Verbs & Tenses": {
      gehen: "go",
    },
    Pronouns: {
      sie: { source: "she / they", worldSources: ["she", "they"] },
      sein: { source: "his / its", worldSources: ["his", "its"] },
      irgendjemand: { source: "anybody", worldSources: ["anyone", "anybody"] },
    },
  },
  hindi: {
    "Questions & Connectors": {
      "क्या": "what",
    },
    "Verbs & Tenses": {
      "पास होना": "have",
    },
    "Feelings & States": {
      "डरा हुआ/डरी हुई": "afraid",
    },
    Pronouns: {
      "वह": { source: "he / she / that", worldSources: ["he", "she", "that"] },
      "यह": { source: "this / it", worldSources: ["this", "it"] },
      "वे": { source: "they / those", worldSources: ["they", "those"] },
      "उसे": { source: "him / her", worldSources: ["him", "her"] },
      "मेरा": { source: "my / mine", worldSources: ["my", "mine"] },
      "तुम्हारा": { source: "your / yours", worldSources: ["your", "yours"] },
      "उसका": { source: "his / her / hers", worldSources: ["his", "hers"] },
      "हमारा": { source: "our / ours", worldSources: ["our", "ours"] },
      "उनका": { source: "their / theirs", worldSources: ["their", "theirs"] },
      "वह खुद": { source: "himself / herself", worldSources: ["himself", "herself"] },
    },
  },
  japanese: {
    Greetings: {
      "こんにちは": "hello",
      "バイバイ": "bye",
    },
    "Feelings & States": {
      "さみしい": "lonely",
    },
  },
  korean: {
    "Feelings & States": {
      "행복하다": "happy",
      "슬프다": "sad",
      "화나다": "angry",
      "두렵다": "afraid",
      "신나다": "excited",
      "지루하다": "bored",
      "피곤하다": "tired",
      "졸리다": "sleepy",
      "배고프다": "hungry",
      "목마르다": "thirsty",
      "긴장되다": "nervous",
      "차분하다": "calm",
      "괜찮다": "okay",
      "외롭다": "lonely",
    },
    Greetings: {
      "안녕하세요": {
        source: "hello",
        worldSources: ["hello", "good morning", "good afternoon", "good evening"],
      },
      "죄송합니다": "sorry",
      "고마워요": "thanks",
      "별말씀을요": "you're welcome",
      "만나 뵙게 되어 기쁩니다": "pleased to meet you",
    },
    Pronouns: {
      "이": { source: "this / this one", worldSources: ["this"] },
      "저": { source: "that / that one", worldSources: ["that"] },
      "누군가": { source: "someone / somebody", worldSources: ["someone", "somebody"] },
      "아무나": { source: "anyone / anybody", worldSources: ["anyone", "anybody"] },
      "모두": { source: "everyone / everybody / all", worldSources: ["everyone", "everybody", "all"] },
      "아무도": { source: "nobody / no one", worldSources: ["nobody", "no one"] },
      "아무것도": "nothing",
    },
  },
  portuguese: {
    Greetings: {
      "bom dia": "good morning",
    },
    "Questions & Connectors": {
      como: "how",
    },
    "Verbs & Tenses": {
      conseguir: "get",
    },
    Pronouns: {
      isso: { source: "it / that", worldSources: ["it"] },
      meu: { source: "my / mine", worldSources: ["my", "mine"] },
      nosso: { source: "our / ours", worldSources: ["our", "ours"] },
    },
  },
  spanish: {
    Greetings: {
      "adiós": "goodbye",
    },
    "Verbs & Tenses": {
      conseguir: "get",
    },
    Pronouns: {
      eso: { source: "it / that", worldSources: ["it", "that"] },
      nuestro: { source: "our / ours", worldSources: ["our", "ours"] },
      suyo: { source: "his / hers / its / theirs", worldSources: ["hers", "theirs"] },
    },
  },
  swedish: {
    "Questions & Connectors": {
      vem: "who",
    },
    "Verbs & Tenses": {
      "gå": "go",
    },
    Pronouns: {
      det: { source: "it / that", worldSources: ["it", "that"] },
      min: { source: "my / mine", worldSources: ["my", "mine"] },
      din: { source: "your / yours", worldSources: ["your", "yours"] },
      vår: { source: "our / ours", worldSources: ["our", "ours"] },
      "sig själv": {
        source: "himself / herself / itself",
        worldSources: ["himself", "herself", "itself"],
      },
    },
  },
};
const FORBIDDEN_WORD_ENTRIES = {
  korean: {
    Greetings: ["좋은 아침", "좋은 오후", "좋은 저녁"],
  },
};

const readJson = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
};

const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const normalize = (value) => String(value || "").trim().toLowerCase();

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

        const expectedHighlights = inferHighlightsForCard(worldKey, sectionName, card, cardIndex);
        if (expectedHighlights.length >= 2 && !sameHighlights(highlights, expectedHighlights)) {
          fail(
            failures,
            worldKey,
            `Grammar highlight alignment drift in ${sectionName} #${cardIndex + 1}.`
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

    const phraseCanaries = PHRASE_CANARIES[worldKey];
    if (phraseCanaries) {
      Object.entries(phraseCanaries).forEach(([sectionName, expectations]) => {
        const section = isObject(pack?.phrases?.[sectionName]) ? pack.phrases[sectionName] : {};
        const worldSourceSection = isObject(pack?.worldSource?.phrases?.[sectionName])
          ? pack.worldSource.phrases[sectionName]
          : {};
        Object.entries(expectations).forEach(([nativePhrase, expectedSource]) => {
          const entry = section[nativePhrase];
          if (!isObject(entry)) {
            fail(
              failures,
              worldKey,
              `Missing phrase canary in ${sectionName}: "${nativePhrase}".`
            );
            return;
          }
          if (normalize(entry.source) !== normalize(expectedSource)) {
            fail(
              failures,
              worldKey,
              `Phrase canary source drift in ${sectionName}: "${nativePhrase}" -> "${entry.source}".`
            );
          }
          if (normalize(worldSourceSection[expectedSource]) !== normalize(nativePhrase)) {
            fail(
              failures,
              worldKey,
              `worldSource mismatch in ${sectionName}: "${expectedSource}" -> "${worldSourceSection[expectedSource] || "<missing>"}".`
            );
          }
        });
      });
    }

    const wordCanaries = WORD_CANARIES[worldKey];
    if (wordCanaries) {
      Object.entries(wordCanaries).forEach(([sectionName, expectations]) => {
        const section = isObject(pack?.words?.[sectionName]) ? pack.words[sectionName] : {};
        const worldSourceSection = isObject(pack?.worldSource?.words?.[sectionName])
          ? pack.worldSource.words[sectionName]
          : {};
        Object.entries(expectations).forEach(([nativeWord, expectedValue]) => {
          const config =
            typeof expectedValue === "string"
              ? { source: expectedValue, worldSources: [expectedValue] }
              : {
                  source: expectedValue?.source || "",
                  worldSources: Array.isArray(expectedValue?.worldSources)
                    ? expectedValue.worldSources
                    : [],
                };
          const entry = section[nativeWord];
          if (!isObject(entry)) {
            fail(
              failures,
              worldKey,
              `Missing word canary in ${sectionName}: "${nativeWord}".`
            );
            return;
          }
          if (normalize(entry.source) !== normalize(config.source)) {
            fail(
              failures,
              worldKey,
              `Word canary source drift in ${sectionName}: "${nativeWord}" -> "${entry.source}".`
            );
          }
          config.worldSources.forEach((worldSourceKey) => {
            if (normalize(worldSourceSection[worldSourceKey]) !== normalize(nativeWord)) {
              fail(
                failures,
                worldKey,
                `wordSource mismatch in ${sectionName}: "${worldSourceKey}" -> "${worldSourceSection[worldSourceKey] || "<missing>"}".`
              );
            }
          });
        });
      });
    }

    const forbiddenWords = FORBIDDEN_WORD_ENTRIES[worldKey];
    if (forbiddenWords) {
      Object.entries(forbiddenWords).forEach(([sectionName, blockedWords]) => {
        const section = isObject(pack?.words?.[sectionName]) ? pack.words[sectionName] : {};
        blockedWords.forEach((blockedWord) => {
          if (isObject(section[blockedWord])) {
            fail(
              failures,
              worldKey,
              `Forbidden word entry still present in ${sectionName}: "${blockedWord}".`
            );
          }
        });
      });
    }

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
