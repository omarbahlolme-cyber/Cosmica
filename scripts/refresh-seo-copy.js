const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const FRONTEND = path.join(ROOT, "frontend");
const MAPS_BUNDLE = path.join(FRONTEND, "maps", "app-maps.js");
const MAP_STYLE_ASSET_VERSION = "20260417";
const APP_ASSET_VERSION = "20260420";

const LANGUAGES = [
  {
    key: "english",
    language: "English",
    worldFile: "english-world.html",
    wordsFile: "english-words.html",
    phrasesFile: "english-phrases.html",
    grammarFile: "english-grammar.html",
    lettersFile: "english-letters.html",
    lettersTitle: "Learn English Alphabet Online | Letters and Pronunciation | Cosmica",
    lettersDescription:
      "Practice the English alphabet with clear letter pronunciation, audio support, and structured review for reading and speaking.",
  },
  {
    key: "arabic",
    language: "Arabic",
    worldFile: "world-arabic.html",
    wordsFile: "words-arabic.html",
    phrasesFile: "phrases-arabic.html",
    grammarFile: "grammar-arabic.html",
    lettersFile: "letters-arabic.html",
    lettersTitle: "Learn Arabic Alphabet Online | Letters and Pronunciation | Cosmica",
    lettersDescription:
      "Practice Arabic letters with audio pronunciation and structured review to build reading confidence and letter recognition.",
  },
  {
    key: "chinese",
    language: "Chinese",
    worldFile: "world-chinese.html",
    wordsFile: "words-chinese.html",
    phrasesFile: "phrases-chinese.html",
    grammarFile: "grammar-chinese.html",
    lettersFile: "letters-chinese.html",
    lettersTitle: "Learn Chinese Characters Online | Hanzi Practice | Cosmica",
    lettersDescription:
      "Practice Chinese characters with audio support and guided review to build Hanzi recognition and reading confidence.",
  },
  {
    key: "dutch",
    language: "Dutch",
    worldFile: "world-dutch.html",
    wordsFile: "words-dutch.html",
    phrasesFile: "phrases-dutch.html",
    grammarFile: "grammar-dutch.html",
    lettersFile: "letters-dutch.html",
    lettersTitle: "Learn Dutch Alphabet Online | Letters and Pronunciation | Cosmica",
    lettersDescription:
      "Practice the Dutch alphabet with clear pronunciation, audio support, and structured review for listening and speaking.",
  },
  {
    key: "french",
    language: "French",
    worldFile: "world-french.html",
    wordsFile: "words-french.html",
    phrasesFile: "phrases-french.html",
    grammarFile: "grammar-french.html",
    lettersFile: "letters-french.html",
    lettersTitle: "Learn French Alphabet Online | Letters and Pronunciation | Cosmica",
    lettersDescription:
      "Practice the French alphabet with audio pronunciation and simple review to strengthen reading, spelling, and speaking accuracy.",
  },
  {
    key: "german",
    language: "German",
    worldFile: "world-german.html",
    wordsFile: "words-german.html",
    phrasesFile: "phrases-german.html",
    grammarFile: "grammar-german.html",
    lettersFile: "letters-german.html",
    lettersTitle: "Learn German Alphabet Online | Letters and Pronunciation | Cosmica",
    lettersDescription:
      "Practice the German alphabet with clear audio, pronunciation support, and structured review for reading and speaking.",
  },
  {
    key: "hindi",
    language: "Hindi",
    worldFile: "world-hindi.html",
    wordsFile: "words-hindi.html",
    phrasesFile: "phrases-hindi.html",
    grammarFile: "grammar-hindi.html",
    lettersFile: "letters-hindi.html",
    lettersTitle: "Learn Hindi Script Online | Devanagari Letters | Cosmica",
    lettersDescription:
      "Practice Hindi letters in Devanagari with audio pronunciation and structured review to build reading confidence from the start.",
  },
  {
    key: "japanese",
    language: "Japanese",
    worldFile: "world-japanese.html",
    wordsFile: "words-japanese.html",
    phrasesFile: "phrases-japanese.html",
    grammarFile: "grammar-japanese.html",
    lettersFile: "letters-japanese.html",
    lettersTitle: "Learn Japanese Characters Online | Hiragana and Katakana | Cosmica",
    lettersDescription:
      "Practice Hiragana and Katakana with audio pronunciation and structured review to build a strong Japanese reading foundation.",
  },
  {
    key: "korean",
    language: "Korean",
    worldFile: "world-korean.html",
    wordsFile: "words-korean.html",
    phrasesFile: "phrases-korean.html",
    grammarFile: "grammar-korean.html",
    lettersFile: "letters-korean.html",
    lettersTitle: "Learn Korean Alphabet Online | Hangul Practice | Cosmica",
    lettersDescription:
      "Practice Hangul letters with clear audio, pronunciation support, and structured review for reading and speaking Korean.",
  },
  {
    key: "portuguese",
    language: "Portuguese",
    worldFile: "world-portuguese.html",
    wordsFile: "words-portuguese.html",
    phrasesFile: "phrases-portuguese.html",
    grammarFile: "grammar-portuguese.html",
    lettersFile: "letters-portuguese.html",
    lettersTitle: "Learn Portuguese Alphabet Online | Letters and Pronunciation | Cosmica",
    lettersDescription:
      "Practice the Portuguese alphabet with audio pronunciation and structured review to improve reading, listening, and speaking.",
  },
  {
    key: "spanish",
    language: "Spanish",
    worldFile: "world-spanish.html",
    wordsFile: "words-spanish.html",
    phrasesFile: "phrases-spanish.html",
    grammarFile: "grammar-spanish.html",
    lettersFile: "letters-spanish.html",
    lettersTitle: "Learn Spanish Alphabet Online | Letters and Pronunciation | Cosmica",
    lettersDescription:
      "Practice the Spanish alphabet with clear pronunciation, audio support, and structured review for speaking and reading.",
  },
  {
    key: "swedish",
    language: "Swedish",
    worldFile: "world-swedish.html",
    wordsFile: "words-swedish.html",
    phrasesFile: "phrases-swedish.html",
    grammarFile: "grammar-swedish.html",
    lettersFile: "letters-swedish.html",
    lettersTitle: "Learn Swedish Alphabet Online | Letters and Pronunciation | Cosmica",
    lettersDescription:
      "Practice the Swedish alphabet with audio pronunciation and structured review to build early reading and speaking confidence.",
  },
];

const readFile = (fileName) => fs.readFileSync(path.join(FRONTEND, fileName), "utf8");
const writeFile = (fileName, content) => fs.writeFileSync(path.join(FRONTEND, fileName), content);
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const normalizePreviewLookupKey = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

const mapsBundleSource = fs.readFileSync(MAPS_BUNDLE, "utf8");

const extractAssignedLiteral = (source, constName) => {
  const marker = `const ${constName} =`;
  const startIndex = source.indexOf(marker);
  if (startIndex < 0) {
    throw new Error(`Missing constant ${constName} in maps bundle`);
  }
  let cursor = source.indexOf("=", startIndex) + 1;
  while (cursor < source.length && /\s/.test(source[cursor])) {
    cursor += 1;
  }
  const openChar = source[cursor];
  const closeChar = openChar === "[" ? "]" : openChar === "{" ? "}" : "";
  if (!closeChar) {
    throw new Error(`Unsupported literal opener for ${constName}: ${openChar}`);
  }
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = cursor; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }
    if (char === openChar) {
      depth += 1;
      continue;
    }
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return source.slice(cursor, index + 1);
      }
    }
  }
  throw new Error(`Unterminated literal for ${constName}`);
};

const parseLiteralFromMapsBundle = (constName) =>
  vm.runInNewContext(`(${extractAssignedLiteral(mapsBundleSource, constName)})`);

const BASE_WORD_SECTION_ORDER = parseLiteralFromMapsBundle("WORD_SECTION_ORDER");
const BASE_WORD_SECTION_LISTS = parseLiteralFromMapsBundle("WORD_SECTION_LISTS");
const BASE_PHRASE_SECTION_ORDER = parseLiteralFromMapsBundle("PHRASE_SECTION_ORDER");
const BASE_PHRASE_SECTION_LISTS = parseLiteralFromMapsBundle("PHRASE_SECTION_LISTS");
const BASE_GRAMMAR_SECTION_ORDER = parseLiteralFromMapsBundle("GRAMMAR_SECTION_ORDER");
const BASE_GRAMMAR_SECTION_LISTS = parseLiteralFromMapsBundle("GRAMMAR_SECTION_LISTS");
const STATIC_WORD_SECTION_LIMIT = 2;
const STATIC_WORD_CARD_LIMIT = 8;
const STATIC_PHRASE_SECTION_LIMIT = 2;
const STATIC_PHRASE_CARD_LIMIT = 6;
const STATIC_GRAMMAR_SECTION_LIMIT = 2;
const STATIC_GRAMMAR_CARD_LIMIT = 6;

const worldPackCache = new Map();
const loadWorldPack = (worldKey) => {
  if (worldPackCache.has(worldKey)) {
    return worldPackCache.get(worldKey);
  }
  if (worldKey === "english") {
    worldPackCache.set(worldKey, null);
    return null;
  }
  const filePath = path.join(FRONTEND, "worlds", worldKey, "translations.json");
  const pack = JSON.parse(fs.readFileSync(filePath, "utf8"));
  worldPackCache.set(worldKey, pack);
  return pack;
};

const getSectionLabel = (pack, mapKey, sectionName) =>
  String(pack?.[mapKey]?.sectionLabels?.[sectionName] || sectionName || "").trim();

const toTitleCase = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase());

const getGlossFromEntry = (entryValue, fallback) => {
  const englishTranslation = String(entryValue?.translations?.english || "").trim();
  if (englishTranslation) {
    return englishTranslation;
  }
  return String(entryValue?.source || fallback || "").trim();
};

const buildWordPreviewCards = (config) => {
  const pack = loadWorldPack(config.key);
  const getWordsForSection = (sectionName) => {
    if (pack?.words?.[sectionName] && typeof pack.words[sectionName] === "object") {
      return Object.entries(pack.words[sectionName]).map(([target, entryValue]) => ({
        target: String(target).trim(),
        gloss: getGlossFromEntry(entryValue, target),
        source: String(entryValue?.source || target).trim(),
      }));
    }
    return (BASE_WORD_SECTION_LISTS[sectionName] || []).map((item) => ({
      target: String(item).trim(),
      gloss: String(item).trim(),
      source: String(item).trim(),
    }));
  };
  return BASE_WORD_SECTION_ORDER.map((sectionName) => ({
    title: getSectionLabel(pack, "words", sectionName),
    sourceTitle: sectionName,
    items: getWordsForSection(sectionName).filter((entry) => entry.target).slice(0, 3),
  }))
    .filter((entry) => entry.items.length)
    .slice(0, 3);
};

const buildPhrasePreviewCards = (config) => {
  const pack = loadWorldPack(config.key);
  const getPhrasesForSection = (sectionName) => {
    if (pack?.phrases?.[sectionName] && typeof pack.phrases[sectionName] === "object") {
      return Object.entries(pack.phrases[sectionName]).map(([target, entryValue]) => ({
        target: String(target).trim(),
        gloss: getGlossFromEntry(entryValue, target),
        source: String(entryValue?.source || target).trim(),
      }));
    }
    return (BASE_PHRASE_SECTION_LISTS[sectionName] || []).map((item) => ({
      target: String(item).trim(),
      gloss: String(item).trim(),
      source: String(item).trim(),
    }));
  };
  return BASE_PHRASE_SECTION_ORDER.map((sectionName) => ({
    title: getSectionLabel(pack, "phrases", sectionName),
    sourceTitle: sectionName,
    items: getPhrasesForSection(sectionName).filter((entry) => entry.target).slice(0, 2),
  }))
    .filter((entry) => entry.items.length)
    .slice(0, 3);
};

const buildGrammarPreviewCards = (config) => {
  const pack = loadWorldPack(config.key);
  const previewCards = [];
  const seenLabels = new Set();
  const seenTitles = new Set();
  const seenExamples = new Set();

  BASE_GRAMMAR_SECTION_ORDER.forEach((sectionName) => {
    const sectionLabel = getSectionLabel(pack, "grammar", sectionName);
    const normalizedLabel = normalizePreviewLookupKey(sectionLabel || sectionName);
    if (seenLabels.has(normalizedLabel)) {
      return;
    }
    const translatedCards = Array.isArray(pack?.grammar?.cards?.[sectionName]) ? pack.grammar.cards[sectionName] : null;
    const baseCards = BASE_GRAMMAR_SECTION_LISTS[sectionName] || [];
    const cards = translatedCards || baseCards;
    let selectedEntry = null;

    for (let index = 0; index < cards.length; index += 1) {
      const card = cards[index];
      const baseCard = baseCards[index] || {};
      const title = String(card?.title || "").trim();
      const example = String(card?.example || "").trim();
      if (!title || !example) {
        continue;
      }
      const normalizedTitle = normalizePreviewLookupKey(title);
      const normalizedExample = normalizePreviewLookupKey(example);
      const candidate = {
        sectionLabel,
        sourceSectionLabel: sectionName,
        title,
        sourceTitle: toTitleCase(baseCard?.title || title),
        example,
        point: Array.isArray(card?.points) && card.points.length ? String(card.points[0]) : "",
        supportTitle: toTitleCase(baseCard?.title || ""),
        supportPoint: Array.isArray(baseCard?.points) && baseCard.points.length ? String(baseCard.points[0]) : "",
      };
      if (!seenTitles.has(normalizedTitle) && !seenExamples.has(normalizedExample)) {
        selectedEntry = candidate;
        seenTitles.add(normalizedTitle);
        seenExamples.add(normalizedExample);
        break;
      }
      if (!selectedEntry) {
        selectedEntry = candidate;
      }
    }

    if (!selectedEntry) {
      return;
    }

    seenLabels.add(normalizedLabel);
    previewCards.push({
      sectionLabel,
      sourceSectionLabel: sectionName,
      title: selectedEntry.title,
      sourceTitle: selectedEntry.sourceTitle,
      example: selectedEntry.example,
      point: selectedEntry.point,
      supportTitle: selectedEntry.supportTitle,
      supportPoint: selectedEntry.supportPoint,
    })
  });

  return previewCards.slice(0, 3);
};

const renderVocabPreviewCards = (entries, mapKey) =>
  entries
    .map((entry) => {
      const rows = entry.items
        .map(({ target, gloss, source }) => {
          const shouldHideByDefault =
            !gloss || gloss.toLowerCase() === target.toLowerCase();
          const glossMarkup =
            gloss
              ? `<span class="seo-preview-gloss" data-preview-map="${escapeHtml(
                  mapKey
                )}" data-preview-section-source="${escapeHtml(
                  entry.sourceTitle
                )}" data-preview-source="${escapeHtml(source)}" data-preview-default-hidden="${shouldHideByDefault ? "true" : "false"}"${shouldHideByDefault ? ' hidden="hidden"' : ""}>${escapeHtml(toTitleCase(gloss))}</span>`
              : "";
          return `            <div class="seo-preview-item">
              <span class="seo-preview-term">${escapeHtml(target)}</span>
              ${glossMarkup}
            </div>`;
        })
        .join("\n");
      return `          <article class="card seo-preview-card">
            <h3 data-preview-map="${escapeHtml(mapKey)}" data-preview-section-title-source="${escapeHtml(
              entry.sourceTitle
            )}">${escapeHtml(entry.sourceTitle)}</h3>
            <div class="seo-preview-list">
${rows}
            </div>
          </article>`;
    })
    .join("\n");

const renderGrammarPreviewCards = (entries) =>
  entries
    .map((entry) => {
      const supportTitleMarkup = entry.supportTitle
        ? `<p class="seo-preview-support" data-preview-ui-source="Topic: ${escapeHtml(
            entry.supportTitle
          )}" data-preview-source="${escapeHtml(entry.supportTitle)}">Topic: ${escapeHtml(
            entry.supportTitle
          )}</p>`
        : "";
      const supportPointMarkup = entry.supportPoint
        ? `<p class="seo-preview-note" data-preview-grammar-section-source="${escapeHtml(
            entry.sourceSectionLabel
          )}" data-preview-source="${escapeHtml(entry.supportPoint)}">${escapeHtml(entry.supportPoint)}</p>`
        : "";
      return `          <article class="card seo-preview-card">
            <div class="seo-preview-kicker" data-preview-map="grammar" data-preview-section-title-source="${escapeHtml(
              entry.sourceSectionLabel
            )}">${escapeHtml(entry.sourceSectionLabel)}</div>
            <h3 data-preview-ui-source="${escapeHtml(entry.sourceTitle || entry.title)}">${escapeHtml(
              entry.sourceTitle || entry.title
            )}</h3>
            ${supportTitleMarkup}
            ${supportPointMarkup}
            <p class="seo-preview-example"><span class="seo-preview-example-label" data-preview-ui-source="Example">Example</span>: <span class="seo-preview-example-sentence">${escapeHtml(
              entry.example
            )}</span></p>
          </article>`;
    })
    .join("\n");

const buildStaticWordSections = (config) => {
  const pack = loadWorldPack(config.key);
  return BASE_WORD_SECTION_ORDER.map((sectionName) => {
    const worldSection = pack?.words?.[sectionName];
    const words =
      worldSection && typeof worldSection === "object"
        ? Object.keys(worldSection).filter((key) => String(key || "").trim())
        : config.key === "english"
          ? (BASE_WORD_SECTION_LISTS[sectionName] || []).slice()
          : [];
    if (!words.length) {
      return null;
    }
    return {
      sectionName,
      displaySectionName: getSectionLabel(pack, "words", sectionName),
      items: words
        .slice(0, STATIC_WORD_CARD_LIMIT)
        .map((word) => {
          const entryValue = worldSection?.[word] || null;
          const gloss = getGlossFromEntry(entryValue, word);
          return {
            word,
            gloss,
          };
        }),
    };
  })
    .filter(Boolean)
    .slice(0, STATIC_WORD_SECTION_LIMIT);
};

const buildStaticPhraseSections = (config) => {
  const pack = loadWorldPack(config.key);
  return BASE_PHRASE_SECTION_ORDER.map((sectionName) => {
    const worldSection = pack?.phrases?.[sectionName];
    const phrases =
      worldSection && typeof worldSection === "object"
        ? Object.keys(worldSection).filter((key) => String(key || "").trim())
        : config.key === "english"
          ? (BASE_PHRASE_SECTION_LISTS[sectionName] || []).slice()
          : [];
    if (!phrases.length) {
      return null;
    }
    return {
      sectionName,
      displaySectionName: getSectionLabel(pack, "phrases", sectionName),
      items: phrases
        .slice(0, STATIC_PHRASE_CARD_LIMIT)
        .map((phrase) => {
          const entryValue = worldSection?.[phrase] || null;
          const gloss = getGlossFromEntry(entryValue, phrase);
          return {
            phrase,
            gloss,
          };
        }),
    };
  })
    .filter(Boolean)
    .slice(0, STATIC_PHRASE_SECTION_LIMIT);
};

const buildStaticGrammarSections = (config) => {
  const pack = loadWorldPack(config.key);
  return BASE_GRAMMAR_SECTION_ORDER.map((sectionName) => {
    const translatedCards = Array.isArray(pack?.grammar?.cards?.[sectionName])
      ? pack.grammar.cards[sectionName]
      : null;
    const baseCards = BASE_GRAMMAR_SECTION_LISTS[sectionName] || [];
    const cards = translatedCards || baseCards;
    if (!cards.length) {
      return null;
    }
    const items = cards
      .slice(0, STATIC_GRAMMAR_CARD_LIMIT)
      .map((card, index) => {
        const baseCard = baseCards[index] || {};
        const displayTitle = String(card?.title || "").trim();
        const sourceTitle = String(baseCard?.title || card?.sourceTitle || displayTitle).trim();
        if (!displayTitle) {
          return null;
        }
        return {
          displayTitle,
          sourceTitle,
        };
      })
      .filter(Boolean);
    if (!items.length) {
      return null;
    }
    return {
      sectionName,
      displaySectionName: getSectionLabel(pack, "grammar", sectionName),
      items,
    };
  })
    .filter(Boolean)
    .slice(0, STATIC_GRAMMAR_SECTION_LIMIT);
};

const renderStaticWordSections = (sections) =>
  sections
    .map((section) => {
      const cards = section.items
        .map(({ word, gloss }) => {
          const showGloss =
            gloss &&
            String(gloss || "").trim().toLowerCase() !== String(word || "").trim().toLowerCase();
          return `        <div class="card word-card" data-word="${escapeHtml(word)}">
          <div class="word">${escapeHtml(word)}</div>
          <div class="word-translation"${showGloss ? "" : ' hidden="hidden"'}>${showGloss ? escapeHtml(toTitleCase(gloss)) : ""}</div>
          <button class="word-audio" type="button" data-word="${escapeHtml(word)}" aria-hidden="true" tabindex="-1">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M5 9v6h4l5 4V5l-5 4H5Z" fill="currentColor"/>
              <path d="M17 8c1.5 1.2 2.5 3 2.5 4.9S18.5 16.7 17 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </button>
        </div>`;
        })
        .join("\n");
      return `      <section class="section words-group reveal" data-section="${escapeHtml(
        section.sectionName
      )}">
        <div class="section-title">
          <h2 data-source-title="${escapeHtml(section.sectionName)}" data-base-title="${escapeHtml(
            section.sectionName
          )}"><span class="map-section-title-main">${escapeHtml(
            section.displaySectionName
          )}</span></h2>
        </div>
        <div class="words-grid">
${cards}
        </div>
      </section>`;
    })
    .join("\n");

const renderStaticPhraseSections = (sections) =>
  sections
    .map((section) => {
      const cards = section.items
        .map(({ phrase, gloss }) => {
          const showGloss =
            gloss &&
            String(gloss || "").trim().toLowerCase() !== String(phrase || "").trim().toLowerCase();
          return `        <div class="card phrase-card" data-phrase="${escapeHtml(phrase)}">
          <div class="phrase-text">${escapeHtml(phrase)}</div>
          <div class="phrase-translation"${showGloss ? "" : ' hidden="hidden"'}>${showGloss ? escapeHtml(toTitleCase(gloss)) : ""}</div>
          <button class="word-audio" type="button" data-word="${escapeHtml(phrase)}" aria-hidden="true" tabindex="-1">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M5 9v6h4l5 4V5l-5 4H5Z" fill="currentColor"/>
              <path d="M17 8c1.5 1.2 2.5 3 2.5 4.9S18.5 16.7 17 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </button>
        </div>`;
        })
        .join("\n");
      return `      <section class="section phrases-group reveal" data-section="${escapeHtml(
        section.sectionName
      )}">
        <div class="section-title">
          <h2 data-source-title="${escapeHtml(section.sectionName)}" data-base-title="${escapeHtml(
            section.sectionName
          )}"><span class="map-section-title-main">${escapeHtml(
            section.displaySectionName
          )}</span></h2>
        </div>
        <div class="words-grid">
${cards}
        </div>
      </section>`;
    })
    .join("\n");

const renderStaticGrammarSections = (sections) =>
  sections
    .map((section) => {
      const cards = section.items
        .map(
          ({ displayTitle, sourceTitle }, index) => `        <div class="card grammar-card" tabindex="0" role="button" data-concept="${escapeHtml(
            displayTitle
          )}" data-section="${escapeHtml(section.sectionName)}" data-index="${index}" data-source-title="${escapeHtml(
            sourceTitle
          )}" aria-label="${escapeHtml(displayTitle)}">
          <div class="grammar-text">
            <span class="grammar-title-main">${escapeHtml(displayTitle)}</span>
            <span class="grammar-title-translation" hidden="hidden"></span>
          </div>
        </div>`
        )
        .join("\n");
      return `      <section class="section grammar-group reveal" data-section="${escapeHtml(
        section.sectionName
      )}">
        <div class="section-title">
          <h2 data-source-title="${escapeHtml(section.sectionName)}" data-base-title="${escapeHtml(
            section.sectionName
          )}"><span class="map-section-title-main">${escapeHtml(
            section.displaySectionName
          )}</span></h2>
        </div>
        <div class="words-grid">
${cards}
        </div>
      </section>`;
    })
    .join("\n");

const replaceTitle = (html, value) => html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${value}</title>`);

const replaceMetaByName = (html, name, value) =>
  html.replace(
    new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["'][^"']*["'][^>]*>`, "i"),
    `<meta name="${name}" content="${value}" />`
  );

const replaceMetaByProperty = (html, name, value) =>
  html.replace(
    new RegExp(`<meta[^>]*property=["']${name}["'][^>]*content=["'][^"']*["'][^>]*>`, "i"),
    `<meta property="${name}" content="${value}" />`
  );

const replaceJsonLdNameAndDescription = (html, name, description) =>
  html
    .replace(/"name":\s*"[^"]+"/, `"name": "${name}"`)
    .replace(/"description":\s*"[^"]+"/, `"description": "${description}"`);

const replaceLangToEnglish = (html) => html.replace(/<html lang="[^"]+">/i, '<html lang="en">');

const replaceMapStyleAsset = (html) =>
  html.replace(/maps\/style-maps\.css\?v=[^"]+/i, `maps/style-maps.css?v=${MAP_STYLE_ASSET_VERSION}`);

const replaceMapAppAsset = (html) =>
  html.replace(/app\.js\?v=[^"]+/i, `app.js?v=${APP_ASSET_VERSION}`);

const replaceWorldPage = (config) => {
  const title = `Learn ${config.language} Online | Vocabulary, Phrases and Grammar | Cosmica`;
  const description = `Learn ${config.language} online with step-by-step lessons for letters, vocabulary, phrases, and grammar. Use audio, translations, and guided practice to build confidence.`;
  const socialDescription = `Learn ${config.language} online with structured lessons, audio, translations, and guided practice for real-world speaking.`;
  const h1 = `Learn ${config.language} Online`;
  const eyebrow = `Learn ${config.language}`;
  const h2 = `Build ${config.language} skills with step-by-step lessons`;
  const lede = `Build ${config.language} from core foundations to advanced grammar with translations, audio, and short practice paths that strengthen reading, listening, and speaking.`;
  const button = `Start ${config.language} lessons`;

  let html = readFile(config.worldFile);
  html = replaceLangToEnglish(html);
  html = html.replace(
    /\s*<!-- Multilingual SEO: hreflang cluster -->[\s\S]*?<!-- \/Multilingual SEO: hreflang cluster -->\s*/i,
    "\n"
  );
  html = replaceTitle(html, title);
  html = replaceMetaByName(html, "description", description);
  html = replaceMetaByProperty(html, "og:title", title);
  html = replaceMetaByProperty(html, "og:description", socialDescription);
  html = replaceMetaByName(html, "twitter:title", title);
  html = replaceMetaByName(html, "twitter:description", socialDescription);
  html = replaceJsonLdNameAndDescription(html, title, description);
  html = html.replace(/<h1[\s\S]*?<\/h1>/i, `<h1 class="visually-hidden">${h1}</h1>`);
  html = html.replace(/<div class="eyebrow">[\s\S]*?<\/div>/, `<div class="eyebrow">${eyebrow}</div>`);
  html = html.replace(/<h2>[\s\S]*?<\/h2>/, `<h2>${h2}</h2>`);
  html = html.replace(/<p class="lede">[\s\S]*?<\/p>/, `<p class="lede">\n            ${lede}\n          </p>`);
  html = html.replace(
    /<div class="hero-actions"><a class="primary" href="#language">[\s\S]*?<\/a><\/div>/,
    `<div class="hero-actions"><a class="primary" href="#language">${button}</a></div>`
  );
  writeFile(config.worldFile, html);
};

const buildMapContent = (config, map) => {
  if (map === "words") {
    const previewCards = buildWordPreviewCards(config);
    return `      <h1 class="visually-hidden">Learn ${config.language} Vocabulary Online</h1>
      <!-- SEO landing content -->
      <section class="section reveal seo-map-hero">
        <div class="section-title">
          <div class="eyebrow" data-preview-ui-source="${config.language} Vocabulary">${config.language} Vocabulary</div>
          <h2 data-preview-ui-source="Learn ${config.language} words with audio and translations">Learn ${config.language} words with audio and translations</h2>
          <p data-preview-ui-source="Topic-based words with audio, translation, and quick review.">Topic-based words with audio, translation, and quick review.</p>
        </div>
      </section>
      <section class="section reveal seo-map-support">
        <div class="section-title">
          <div class="eyebrow" data-preview-ui-source="How It Helps">How It Helps</div>
          <h2 data-preview-ui-source="Use everyday vocabulary with confidence">Use everyday vocabulary with confidence</h2>
          <p data-preview-ui-source="Build faster recognition, clearer pronunciation, and stronger recall across daily topics.">Build faster recognition, clearer pronunciation, and stronger recall across daily topics.</p>
        </div>
      </section>
      <section class="section reveal seo-map-preview-section">
        <div class="section-title">
          <div class="eyebrow" data-preview-ui-source="Sample Topics">Sample Topics</div>
          <h2 data-preview-ui-source="${config.language} vocabulary at a glance">${config.language} vocabulary at a glance</h2>
          <p data-preview-ui-source="Quick examples from the lesson map, with meaning support built in.">Quick examples from the lesson map, with meaning support built in.</p>
        </div>
        <div class="steps">
${renderVocabPreviewCards(previewCards, "words")}
        </div>
      </section>
      <div class="words-controls" id="wordsControls"></div>
      <div id="wordsSections"></div>`;
  }

  if (map === "phrases") {
    const previewCards = buildPhrasePreviewCards(config);
    return `      <h1 class="visually-hidden">Learn ${config.language} Phrases Online</h1>
      <!-- SEO landing content -->
      <section class="section reveal seo-map-hero">
        <div class="section-title">
          <div class="eyebrow" data-preview-ui-source="${config.language} Phrases">${config.language} Phrases</div>
          <h2 data-preview-ui-source="Learn useful ${config.language} phrases for everyday speaking">Learn useful ${config.language} phrases for everyday speaking</h2>
          <p data-preview-ui-source="Practical phrases with audio, translation, and quick review.">Practical phrases with audio, translation, and quick review.</p>
        </div>
      </section>
      <section class="section reveal seo-map-support">
        <div class="section-title">
          <div class="eyebrow" data-preview-ui-source="How It Helps">How It Helps</div>
          <h2 data-preview-ui-source="Move from words to real conversation">Move from words to real conversation</h2>
          <p data-preview-ui-source="Practice short phrases for greetings, questions, polite requests, and natural replies.">Practice short phrases for greetings, questions, polite requests, and natural replies.</p>
        </div>
      </section>
      <section class="section reveal seo-map-preview-section">
        <div class="section-title">
          <div class="eyebrow" data-preview-ui-source="Sample Phrases">Sample Phrases</div>
          <h2 data-preview-ui-source="${config.language} phrase sets at a glance">${config.language} phrase sets at a glance</h2>
          <p data-preview-ui-source="Short examples from the page, paired with clear English meaning.">Short examples from the page, paired with clear English meaning.</p>
        </div>
        <div class="steps">
${renderVocabPreviewCards(previewCards, "phrases")}
        </div>
      </section>
      <div class="words-controls" id="phrasesControls"></div>
      <div id="phrasesSections"></div>`;
  }

  const previewCards = buildGrammarPreviewCards(config);
  return `      <h1 class="visually-hidden">Learn ${config.language} Grammar Online</h1>
      <!-- SEO landing content -->
      <section class="section reveal seo-map-hero">
        <div class="section-title">
          <div class="eyebrow" data-preview-ui-source="${config.language} Grammar">${config.language} Grammar</div>
          <h2 data-preview-ui-source="Learn ${config.language} grammar with clear examples and explanations">Learn ${config.language} grammar with clear examples and explanations</h2>
          <p data-preview-ui-source="Core grammar with examples, explanations, and quick review.">Core grammar with examples, explanations, and quick review.</p>
        </div>
      </section>
      <section class="section reveal seo-map-support">
        <div class="section-title">
          <div class="eyebrow" data-preview-ui-source="How It Helps">How It Helps</div>
          <h2 data-preview-ui-source="Understand how the language works">Understand how the language works</h2>
          <p data-preview-ui-source="Learn sentence patterns, verb use, and core rules that improve accuracy.">Learn sentence patterns, verb use, and core rules that improve accuracy.</p>
        </div>
      </section>
      <section class="section reveal seo-map-preview-section">
        <div class="section-title">
          <div class="eyebrow" data-preview-ui-source="Sample Lessons">Sample Lessons</div>
          <h2 data-preview-ui-source="${config.language} grammar at a glance">${config.language} grammar at a glance</h2>
          <p data-preview-ui-source="Real lesson topics with English support and example sentences.">Real lesson topics with English support and example sentences.</p>
        </div>
        <div class="steps">
${renderGrammarPreviewCards(previewCards)}
        </div>
      </section>
      <div class="words-controls" id="grammarControls"></div>
      <div id="grammarSections"></div>`;
};

const replaceMapPage = (config, map, fileName, title, description, socialDescription, hiddenH1) => {
  let html = readFile(fileName);
  html = replaceLangToEnglish(html);
  html = replaceMapStyleAsset(html);
  html = replaceMapAppAsset(html);
  html = replaceTitle(html, title);
  html = replaceMetaByName(html, "description", description);
  html = replaceMetaByProperty(html, "og:title", title);
  html = replaceMetaByProperty(html, "og:description", socialDescription);
  html = replaceMetaByName(html, "twitter:title", title);
  html = replaceMetaByName(html, "twitter:description", socialDescription);
  html = replaceJsonLdNameAndDescription(html, title, description);
  const controlsId = map === "words" ? "wordsControls" : map === "phrases" ? "phrasesControls" : "grammarControls";
  const sectionsId = map === "words" ? "wordsSections" : map === "phrases" ? "phrasesSections" : "grammarSections";
  const landingContent = buildMapContent(config, map);
  const mainContentPattern = new RegExp(
    `<h1 class="visually-hidden">[\\s\\S]*?<div class="words-controls" id="${escapeRegex(
      controlsId
    )}"><\\/div>\\s*<div id="${escapeRegex(sectionsId)}">[\\s\\S]*?<\\/div>`,
    "i"
  );
  html = html.replace(mainContentPattern, landingContent);
  html = html.replace(
    /<h1 class="visually-hidden">[\s\S]*?<\/h1>/,
    `<h1 class="visually-hidden">${hiddenH1}</h1>`
  );
  writeFile(fileName, html);
};

const replaceLettersPage = (config) => {
  let html = readFile(config.lettersFile);
  html = replaceLangToEnglish(html);
  html = replaceMapStyleAsset(html);
  html = replaceMapAppAsset(html);
  html = replaceTitle(html, config.lettersTitle);
  html = replaceMetaByName(html, "description", config.lettersDescription);
  html = replaceMetaByProperty(html, "og:title", config.lettersTitle);
  html = replaceMetaByProperty(html, "og:description", config.lettersDescription);
  html = replaceMetaByName(html, "twitter:title", config.lettersTitle);
  html = replaceMetaByName(html, "twitter:description", config.lettersDescription);
  html = replaceJsonLdNameAndDescription(html, config.lettersTitle, config.lettersDescription);
  html = html.replace(
    /<h1 class="visually-hidden">[\s\S]*?<\/h1>/,
    `<h1 class="visually-hidden">${config.lettersTitle.replace(" | Cosmica", "")}</h1>`
  );
  writeFile(config.lettersFile, html);
};

for (const config of LANGUAGES) {
  replaceWorldPage(config);

  replaceMapPage(
    config,
    "words",
    config.wordsFile,
    `Learn ${config.language} Vocabulary Online | Audio Flashcards | Cosmica`,
    `Build ${config.language} vocabulary with topic-based word cards, audio pronunciation, and translation support for everyday speaking, travel, study, and work.`,
    `Practice ${config.language} vocabulary with audio, translations, and focused topic-based review.`,
    `Learn ${config.language} Vocabulary Online`
  );

  replaceMapPage(
    config,
    "phrases",
    config.phrasesFile,
    `Learn ${config.language} Phrases Online | Everyday Speaking Practice | Cosmica`,
    `Learn useful ${config.language} phrases with structured practice, translations, and audio support for greetings, travel, daily conversation, and common situations.`,
    `Practice useful ${config.language} phrases with audio, translations, and organized speaking review.`,
    `Learn ${config.language} Phrases Online`
  );

  replaceMapPage(
    config,
    "grammar",
    config.grammarFile,
    `Learn ${config.language} Grammar Online | Lessons and Examples | Cosmica`,
    `Study ${config.language} grammar with structured lessons, practical examples, and clear explanations that help you build accurate speaking and writing skills.`,
    `Learn ${config.language} grammar with examples, explanations, and guided lesson sections.`,
    `Learn ${config.language} Grammar Online`
  );

  replaceLettersPage(config);
}

console.log(`Updated SEO copy for ${LANGUAGES.length} language sets.`);
