const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FRONTEND = path.join(ROOT, "frontend");

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
  const worldHref = config.worldFile;
  const lettersHref = config.lettersFile;
  const wordsHref = config.wordsFile;
  const phrasesHref = config.phrasesFile;
  const grammarHref = config.grammarFile;

  if (map === "words") {
    return `      <h1 class="visually-hidden">Learn ${config.language} Vocabulary Online</h1>
      <!-- SEO landing content -->
      <section class="section reveal">
        <div class="section-title">
          <div class="eyebrow">${config.language} Vocabulary</div>
          <h2>Learn ${config.language} words with audio and translations</h2>
          <p>Topic-based words with audio, translation, and quick review.</p>
        </div>
      </section>
      <div class="words-controls" id="wordsControls"></div>
      <div id="wordsSections"></div>`;
  }

  if (map === "phrases") {
    return `      <h1 class="visually-hidden">Learn ${config.language} Phrases Online</h1>
      <!-- SEO landing content -->
      <section class="section reveal">
        <div class="section-title">
          <div class="eyebrow">${config.language} Phrases</div>
          <h2>Learn useful ${config.language} phrases for everyday speaking</h2>
          <p>Practical phrases with audio, translation, and quick review.</p>
        </div>
      </section>
      <div class="words-controls" id="phrasesControls"></div>
      <div id="phrasesSections"></div>`;
  }

  return `      <h1 class="visually-hidden">Learn ${config.language} Grammar Online</h1>
      <!-- SEO landing content -->
      <section class="section reveal">
        <div class="section-title">
          <div class="eyebrow">${config.language} Grammar</div>
          <h2>Learn ${config.language} grammar with clear examples and explanations</h2>
          <p>Core grammar with examples, explanations, and quick review.</p>
        </div>
      </section>
      <div class="words-controls" id="grammarControls"></div>
      <div id="grammarSections"></div>`;
};

const replaceMapPage = (config, map, fileName, title, description, socialDescription, hiddenH1) => {
  let html = readFile(fileName);
  html = replaceLangToEnglish(html);
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
    )}"><\\/div>\\s*<div id="${escapeRegex(sectionsId)}"><\\/div>`,
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
