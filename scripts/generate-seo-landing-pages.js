const fs = require("fs");
const path = require("path");
const { repairDeepText } = require("./lib/mojibake");

const ROOT = path.resolve(__dirname, "..");
const FRONTEND = path.join(ROOT, "frontend");
const SITE_ORIGIN = "https://www.cosmicalearn.com";
const SHARED_ASSET_VERSION = "20260440";
const STYLE_ASSET_VERSION = SHARED_ASSET_VERSION;
const APP_ASSET_VERSION = SHARED_ASSET_VERSION;
const ACCOUNT_CARET_ENTITY = "&#9662;";

const LANGUAGES = repairDeepText([
  {
    "key": "english",
    "language": "English",
    "worldFile": "english-world.html",
    "lettersFile": "english-letters.html",
    "wordsFile": "english-words.html",
    "phrasesFile": "english-phrases.html",
    "grammarFile": "english-grammar.html"
  },
  {
    "key": "french",
    "language": "French",
    "worldFile": "world-french.html",
    "lettersFile": "letters-french.html",
    "wordsFile": "words-french.html",
    "phrasesFile": "phrases-french.html",
    "grammarFile": "grammar-french.html",
    "localizedGuideFile": "learn-french-online-fr.html",
    "localizedGuideTitle": "Guide en français"
  },
  {
    "key": "spanish",
    "language": "Spanish",
    "worldFile": "world-spanish.html",
    "lettersFile": "letters-spanish.html",
    "wordsFile": "words-spanish.html",
    "phrasesFile": "phrases-spanish.html",
    "grammarFile": "grammar-spanish.html",
    "localizedGuideFile": "learn-spanish-online-es.html",
    "localizedGuideTitle": "Guía en español"
  },
  {
    "key": "arabic",
    "language": "Arabic",
    "worldFile": "world-arabic.html",
    "lettersFile": "letters-arabic.html",
    "wordsFile": "words-arabic.html",
    "phrasesFile": "phrases-arabic.html",
    "grammarFile": "grammar-arabic.html",
    "localizedGuideFile": "learn-arabic-online-ar.html",
    "localizedGuideTitle": "دليل بالعربية"
  },
  {
    "key": "chinese",
    "language": "Chinese",
    "worldFile": "world-chinese.html",
    "lettersFile": "letters-chinese.html",
    "wordsFile": "words-chinese.html",
    "phrasesFile": "phrases-chinese.html",
    "grammarFile": "grammar-chinese.html",
    "localizedGuideFile": "learn-chinese-online-zh.html",
    "localizedGuideTitle": "中文指南"
  },
  {
    "key": "japanese",
    "language": "Japanese",
    "worldFile": "world-japanese.html",
    "lettersFile": "letters-japanese.html",
    "wordsFile": "words-japanese.html",
    "phrasesFile": "phrases-japanese.html",
    "grammarFile": "grammar-japanese.html",
    "localizedGuideFile": "learn-japanese-online-ja.html",
    "localizedGuideTitle": "日本語ガイド"
  },
  {
    "key": "korean",
    "language": "Korean",
    "worldFile": "world-korean.html",
    "lettersFile": "letters-korean.html",
    "wordsFile": "words-korean.html",
    "phrasesFile": "phrases-korean.html",
    "grammarFile": "grammar-korean.html",
    "localizedGuideFile": "learn-korean-online-ko.html",
    "localizedGuideTitle": "한국어 가이드"
  },
  {
    "key": "hindi",
    "language": "Hindi",
    "worldFile": "world-hindi.html",
    "lettersFile": "letters-hindi.html",
    "wordsFile": "words-hindi.html",
    "phrasesFile": "phrases-hindi.html",
    "grammarFile": "grammar-hindi.html",
    "localizedGuideFile": "learn-hindi-online-hi.html",
    "localizedGuideTitle": "हिन्दी गाइड"
  },
  {
    "key": "german",
    "language": "German",
    "worldFile": "world-german.html",
    "lettersFile": "letters-german.html",
    "wordsFile": "words-german.html",
    "phrasesFile": "phrases-german.html",
    "grammarFile": "grammar-german.html",
    "localizedGuideFile": "learn-german-online-de.html",
    "localizedGuideTitle": "Leitfaden auf Deutsch"
  },
  {
    "key": "portuguese",
    "language": "Portuguese",
    "worldFile": "world-portuguese.html",
    "lettersFile": "letters-portuguese.html",
    "wordsFile": "words-portuguese.html",
    "phrasesFile": "phrases-portuguese.html",
    "grammarFile": "grammar-portuguese.html",
    "localizedGuideFile": "learn-portuguese-online-pt.html",
    "localizedGuideTitle": "Guia em português"
  },
  {
    "key": "dutch",
    "language": "Dutch",
    "worldFile": "world-dutch.html",
    "lettersFile": "letters-dutch.html",
    "wordsFile": "words-dutch.html",
    "phrasesFile": "phrases-dutch.html",
    "grammarFile": "grammar-dutch.html",
    "localizedGuideFile": "learn-dutch-online-nl.html",
    "localizedGuideTitle": "Gids in het Nederlands"
  },
  {
    "key": "swedish",
    "language": "Swedish",
    "worldFile": "world-swedish.html",
    "lettersFile": "letters-swedish.html",
    "wordsFile": "words-swedish.html",
    "phrasesFile": "phrases-swedish.html",
    "grammarFile": "grammar-swedish.html",
    "localizedGuideFile": "learn-swedish-online-sv.html",
    "localizedGuideTitle": "Guide på svenska"
  }
]);

const beginnerPageFile = (key) => `learn-${key}-for-beginners.html`;
const pronunciationPageFile = (key) => `${key}-pronunciation-guide.html`;
const travelPhrasesPageFile = (key) => `${key}-travel-phrases.html`;
const localizedPronunciationPageFile = (key) => {
  const normalizedKey = String(key || "").trim().toLowerCase();
  const localizedLang = String(LOCALIZED_HREFLANG_BY_KEY[normalizedKey] || "").trim().toLowerCase();
  if (!normalizedKey || !localizedLang) {
    return "";
  }
  const langSlug = localizedLang.split("-")[0];
  if (!langSlug) {
    return "";
  }
  return `${normalizedKey}-pronunciation-${langSlug}.html`;
};
const localizedTravelPhrasesPageFile = (key) => {
  const normalizedKey = String(key || "").trim().toLowerCase();
  const localizedLang = String(LOCALIZED_HREFLANG_BY_KEY[normalizedKey] || "").trim().toLowerCase();
  if (!normalizedKey || !localizedLang) {
    return "";
  }
  const langSlug = localizedLang.split("-")[0];
  if (!langSlug) {
    return "";
  }
  return `${normalizedKey}-travel-phrases-${langSlug}.html`;
};
const LOCALIZED_HREFLANG_BY_KEY = Object.freeze({
  french: "fr",
  spanish: "es",
  arabic: "ar",
  chinese: "zh-Hans",
  japanese: "ja",
  korean: "ko",
  hindi: "hi",
  german: "de",
  portuguese: "pt",
  dutch: "nl",
  swedish: "sv",
});

const readFile = (fileName) => fs.readFileSync(path.join(FRONTEND, fileName), "utf8");
const writeFile = (fileName, content) => fs.writeFileSync(path.join(FRONTEND, fileName), content, "utf8");
const pageUrl = (fileName) => (fileName === "index.html" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/${fileName}`);

const buildAlternateLinks = (links = []) => {
  const items = links
    .filter((item) => item && item.lang && item.url)
    .map(
      (item) => `    <link rel="alternate" hreflang="${item.lang}" href="${item.url}" />`
    );
  if (!items.length) {
    return "";
  }
  return `    <!-- Multilingual SEO: hreflang cluster -->\n${items.join("\n")}\n    <!-- /Multilingual SEO: hreflang cluster -->\n`;
};

const jsonLdScript = (schema, marker = "") => `    ${marker ? `<!-- ${marker} -->\n    ` : ""}<script type="application/ld+json">
${JSON.stringify(schema, null, 2)
  .split("\n")
  .map((line) => `    ${line}`)
  .join("\n")}
    </script>`;

const breadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

const courseSchema = (config, title, description, canonicalPath) => ({
  "@type": "Course",
  name: title,
  description,
  provider: {
    "@type": "Organization",
    name: "Cosmica",
    url: `${SITE_ORIGIN}/`,
  },
  educationalLevel: ["Beginner", "Intermediate", "Advanced"],
  teaches: [
    `${config.language} pronunciation`,
    `${config.language} vocabulary`,
    `${config.language} phrases`,
    `${config.language} grammar`,
  ],
  url: pageUrl(canonicalPath),
});

const pageShell = ({
  title,
  description,
  canonicalPath,
  brandSub,
  backHref,
  backLabel,
  bodyClass,
  content,
  structuredData,
  alternateLinks = "",
}) => `<!doctype html>
<!-- Page Structure: metadata, navigation, main content, footer -->
<html lang="en">
  <head>
    <!-- Metadata, SEO, social tags, and shared font assets -->
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="shortcut icon" href="/favicon.svg" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="#0a0f24" />
    <meta name="application-name" content="Cosmica" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Cosmica" />
    <link rel="manifest" href="/app.webmanifest" />
    <link rel="apple-touch-icon" sizes="180x180" href="/pwa/apple-touch-icon.png" />
    <link rel="canonical" href="${SITE_ORIGIN}/${canonicalPath}" />
${alternateLinks}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Cosmica" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${SITE_ORIGIN}/${canonicalPath}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <link rel="preload" as="style" href="style.css?v=${STYLE_ASSET_VERSION}" />
    <link rel="stylesheet" href="style.css?v=${STYLE_ASSET_VERSION}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Rajdhani:wght@400;600;700&family=Oxanium:wght@600&display=swap"
      rel="stylesheet"
      data-sri-exempt="google-fonts-dynamic-css"
    />
${structuredData || jsonLdScript({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: title,
  description,
  url: `${SITE_ORIGIN}/${canonicalPath}`,
  isPartOf: {
    "@type": "WebSite",
    name: "Cosmica",
    url: `${SITE_ORIGIN}/`,
  },
})}
    <meta property="og:image" content="${SITE_ORIGIN}/og-image.svg" />
    <meta name="twitter:image" content="${SITE_ORIGIN}/og-image.svg" />
  </head>
  <body class="${bodyClass}">
    <!-- Decorative background layers (aurora + starfield) -->
    <div class="aurora"></div>
    <div class="starfield starfield-deep" data-depth="0.15" aria-hidden="true"></div>
    <div class="starfield starfield-mid" data-depth="0.3" aria-hidden="true"></div>
    <div class="starfield starfield-near" data-depth="0.5" aria-hidden="true"></div>
    <!-- Global navigation header -->
    <header class="nav">
      <div class="brand">
        <span class="brand-mark">C</span>
        <div>
          <div class="brand-title">Cosmica</div>
          <div class="brand-sub">${brandSub}</div>
        </div>
      </div>
      <nav class="nav-links" aria-label="Primary navigation">
        <a href="${backHref}">${backLabel}</a>
      </nav>
      <div class="nav-controls">
        <button class="sound-toggle" id="soundToggle" type="button">
          <span class="dot" aria-hidden="true"></span> <span class="sound-label">Sound: On</span>
        </button>
        <div class="account-slot account-slot-preload" aria-hidden="true">
          <button class="account-trigger" type="button" tabindex="-1">
            <span class="account-trigger-avatar" aria-hidden="true">G</span>
            <span class="account-trigger-copy">
              <span class="account-trigger-label">Guest</span>
              <span class="account-trigger-meta">Sign in</span>
            </span>
            <span class="account-trigger-caret" aria-hidden="true">${ACCOUNT_CARET_ENTITY}</span>
          </button>
        </div>
      </div>
    </header>
    <!-- Page-specific main content -->
    <main>
${content}
    </main>
    <!-- Shared footer -->
    <footer class="footer">
      <span>Cosmica Academy</span>
      <span class="footer-inline-links">
        <span class="footer-right-text">Structured language learning with clear next steps.</span>
        <span class="footer-legal-links">
          <a href="privacy.html">Privacy</a>
          <span class="footer-divider" aria-hidden="true">|</span> <a href="terms.html">Terms</a>
          <span class="footer-divider" aria-hidden="true">|</span>
          <a href="license.html">License</a>
        </span>
      </span>
    </footer>
    <!-- Shared client bundle -->
    <script src="app.js?v=${APP_ASSET_VERSION}" defer></script>
  </body>
</html>
`;

const buildGuidePager = (prev, next) => `      <section class="section reveal guide-pager-section" aria-label="Guide navigation">
        <div class="guide-pager">
          <a class="guide-pager-link guide-pager-prev" href="${prev.href}" aria-label="Previous page: ${prev.title}">
            <span class="guide-pager-arrow" aria-hidden="true">&larr;</span>
          </a>
          <a class="guide-pager-link guide-pager-next" href="${next.href}" aria-label="Next page: ${next.title}">
            <span class="guide-pager-arrow" aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </section>`;

const beginnerContent = (config) => `      <section class="section world-hero" id="guide">
        <div class="section-title">
          <div class="eyebrow">${config.language} Beginner Guide</div>
          <h1>Learn ${config.language} for beginners</h1>
          <p class="lede">
            Start ${config.language} with clear lessons for pronunciation, vocabulary, phrases, and
            grammar.
          </p>
        </div>
      </section>
      <section class="section reveal">
        <div class="section-title">
          <h2>Start with these ${config.language} lessons</h2>
        </div>
        <div class="steps">
          <article class="card">
            <h3>${config.language} letters and sounds</h3>
            <p>Build reading and pronunciation basics.</p>
          </article>
          <article class="card">
            <h3>${config.language} vocabulary</h3>
            <p>Learn useful words with audio and translation.</p>
          </article>
          <article class="card">
            <h3>${config.language} phrases</h3>
            <p>Practice everyday speaking and common sentences.</p>
          </article>
          <article class="card">
            <h3>${config.language} grammar</h3>
            <p>Use words and phrases more accurately.</p>
          </article>
        </div>
      </section>
      <section class="section reveal">
        <div class="section-title">
          <h2>Why this path works</h2>
          <p>Start with sound and core vocabulary, then move into phrases and grammar so each new ${config.language} lesson builds on what you already understand.</p>
        </div>
      </section>
${buildGuidePager(
  {
    href: config.worldFile,
    title: `Return to ${config.language} course`,
  },
  {
    href: pronunciationPageFile(config.key),
    title: `${config.language} pronunciation guide`,
  }
)}`;

const pronunciationContent = (config) => `      <section class="section world-hero" id="guide">
        <div class="section-title">
          <div class="eyebrow">${config.language} Pronunciation Guide</div>
          <h1>${config.language} pronunciation guide</h1>
          <p class="lede">
            Improve ${config.language} pronunciation with sound practice, audio review, and speaking
            patterns built from letters, words, and phrases.
          </p>
        </div>
      </section>
      <section class="section reveal">
        <div class="section-title">
          <h2>Practice ${config.language} pronunciation here</h2>
        </div>
        <div class="steps">
          <article class="card">
            <h3>${config.language} letters</h3>
            <p>Learn the main sounds and pronunciation patterns.</p>
          </article>
          <article class="card">
            <h3>${config.language} vocabulary audio</h3>
            <p>Repeat common words to reinforce sound and meaning.</p>
          </article>
          <article class="card">
            <h3>${config.language} speaking phrases</h3>
            <p>Practice rhythm, stress, and speaking flow in context.</p>
          </article>
          <article class="card">
            <h3>Full ${config.language} course</h3>
            <p>Open the complete lesson path.</p>
          </article>
        </div>
      </section>
      <section class="section reveal">
        <div class="section-title">
          <h2>What to focus on while you practice</h2>
          <p>Listen for clear vowel sounds, stress, rhythm, and sentence flow so your ${config.language} pronunciation improves in both single words and full phrases.</p>
        </div>
      </section>
${buildGuidePager(
  {
    href: beginnerPageFile(config.key),
    title: `${config.language} beginner guide`,
  },
  {
    href: travelPhrasesPageFile(config.key),
    title: `${config.language} travel phrases`,
  }
)}`;

const travelPhrasesContent = (config) => `      <section class="section world-hero" id="guide">
        <div class="section-title">
          <div class="eyebrow">${config.language} Travel Phrases</div>
          <h1>${config.language} travel phrases</h1>
          <p class="lede">
            Learn practical ${config.language} travel phrases for greetings, directions, food,
            transport, and simple everyday situations.
          </p>
        </div>
      </section>
      <section class="section reveal">
        <div class="section-title">
          <h2>Useful ${config.language} phrases for travel</h2>
        </div>
        <div class="steps">
          <article class="card">
            <h3>${config.language} greetings</h3>
            <p>Start conversations politely and confidently.</p>
          </article>
          <article class="card">
            <h3>${config.language} directions</h3>
            <p>Ask where to go and understand simple place words.</p>
          </article>
          <article class="card">
            <h3>${config.language} food phrases</h3>
            <p>Order clearly and handle simple restaurant situations.</p>
          </article>
          <article class="card">
            <h3>${config.language} transport phrases</h3>
            <p>Use common phrases for tickets, timing, and movement.</p>
          </article>
        </div>
      </section>
      <section class="section reveal">
        <div class="section-title">
          <h2>Best lessons for travel-ready speaking</h2>
          <p>Use the phrases map for short speaking patterns, then review vocabulary and pronunciation so your ${config.language} travel phrases feel easier to remember and use.</p>
        </div>
      </section>
${buildGuidePager(
  {
    href: pronunciationPageFile(config.key),
    title: `${config.language} pronunciation guide`,
  },
  config.localizedGuideFile
    ? {
        href: config.localizedGuideFile,
        title: config.localizedGuideTitle,
      }
    : {
        href: config.worldFile,
        title: `Return to ${config.language} course`,
      }
)}`;

const beginnerTitle = (language) => `Learn ${language} for Beginners | Cosmica`;
const beginnerDescription = (language) =>
  `Start ${language} with clear lessons for pronunciation, vocabulary, phrases, and grammar. Build speaking step by step.`;

const pronunciationTitle = (language) => `${language} Pronunciation Guide | Cosmica`;
const pronunciationDescription = (language) =>
  `Improve ${language} pronunciation with audio, repeat practice, and phrase-based speaking support.`;
const travelPhrasesTitle = (language) => `${language} Travel Phrases | Cosmica`;
const travelPhrasesDescription = (language) =>
  `Learn useful ${language} travel phrases for greetings, directions, transport, and daily situations.`;

const guideStructuredData = (config, pageTitle, pageDescription, fileName, pageLabel) => {
  const pageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl(fileName)}#webpage`,
        name: pageTitle,
        description: pageDescription,
        url: pageUrl(fileName),
        inLanguage: "en",
        isPartOf: {
          "@type": "WebSite",
          name: "Cosmica",
          url: `${SITE_ORIGIN}/`,
        },
        about: {
          "@id": `${pageUrl(fileName)}#course`,
        },
      },
      {
        ...courseSchema(config, pageTitle, pageDescription, fileName),
        "@id": `${pageUrl(fileName)}#course`,
      },
    ],
  };

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: `${SITE_ORIGIN}/` },
    { name: `Learn ${config.language} Online`, url: pageUrl(config.worldFile) },
    { name: pageLabel, url: pageUrl(fileName) },
  ]);

  return `${jsonLdScript(pageSchema)}\n${jsonLdScript(breadcrumbs, "Breadcrumb structured data")}`;
};

const faqItems = (config) => [
  {
    question: `How should I start learning ${config.language} on Cosmica?`,
    answer: `Start with letters or pronunciation if you need sound practice, then move into vocabulary, phrases, and grammar so your ${config.language} skills build in a clear order.`,
  },
  {
    question: `Is this ${config.language} course for beginners or advanced learners?`,
    answer: `Both. Cosmica supports first steps, returning learners, and advanced review by connecting core foundations with more accurate speaking, reading, and grammar practice.`,
  },
  {
    question: `Does Cosmica include audio and translation support for ${config.language}?`,
    answer: `Yes. Cosmica uses audio, translations, and guided lesson maps to help you connect pronunciation, meaning, and sentence patterns while learning ${config.language} online.`,
  },
  {
    question: `What is the best next step after basic ${config.language} vocabulary?`,
    answer: `Move into phrases and grammar so you can turn single words into useful sentences, everyday conversations, and more natural ${config.language} speaking.`,
  },
];

const faqAccordion = (items) =>
  items
    .map(
      (item) => `          <details class="faq-item">
            <summary class="faq-question">${item.question}</summary>
            <div class="faq-answer">
              <p>${item.answer}</p>
            </div>
          </details>`
    )
    .join("\n");

const buildGuideCards = (config) => `
      <!-- SEO guide links -->
      <section class="section reveal" id="seo-guides">
        <div class="section-title">
          <h2>Related guides</h2>
        </div>
        <div class="steps">
          <a class="card" href="${beginnerPageFile(config.key)}">
            <h3>${config.language} beginner guide</h3>
          </a>
          <a class="card" href="${pronunciationPageFile(config.key)}">
            <h3>${config.language} pronunciation guide</h3>
          </a>
          <a class="card" href="${travelPhrasesPageFile(config.key)}">
            <h3>${config.language} travel phrases</h3>
          </a>
          ${
            config.localizedGuideFile
              ? `<a class="card" href="${localizedPronunciationPageFile(config.key)}">
            <h3>${config.language} pronunciation in native language</h3>
          </a>`
              : ""
          }
        </div>
      </section>`;

const buildFaqSection = (config) => `
      <!-- SEO FAQ -->
      <section class="section reveal" id="course-faq">
        <div class="section-title">
          <h2>${config.language} course FAQs</h2>
          <p>Clear answers for learners comparing study paths, levels, and lesson structure.</p>
        </div>
        <div class="faq-list">
${faqAccordion(faqItems(config))}
        </div>
      </section>`;

const buildFaqJsonLd = (config) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems(config).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return `    <!-- FAQ structured data -->
    <script type="application/ld+json">
${JSON.stringify(schema, null, 2)
  .split("\n")
  .map((line) => `    ${line}`)
  .join("\n")}
    </script>`;
};

const buildWorldStructuredData = (config) => {
  const title = `Learn ${config.language} Online Course | Cosmica`;
  const description = `Learn ${config.language} online with guided lessons for letters, vocabulary, phrases, and grammar.`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl(config.worldFile)}#webpage`,
        name: title,
        description,
        url: pageUrl(config.worldFile),
        inLanguage: "en",
        isPartOf: {
          "@type": "WebSite",
          name: "Cosmica",
          url: `${SITE_ORIGIN}/`,
        },
        about: {
          "@id": `${pageUrl(config.worldFile)}#course`,
        },
      },
      {
        ...courseSchema(config, `${config.language} language course`, description, config.worldFile),
        "@id": `${pageUrl(config.worldFile)}#course`,
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl(config.worldFile)}#lesson-path`,
        name: `${config.language} lesson path`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: `${config.language} letters`, url: pageUrl(config.lettersFile) },
          { "@type": "ListItem", position: 2, name: `${config.language} vocabulary`, url: pageUrl(config.wordsFile) },
          { "@type": "ListItem", position: 3, name: `${config.language} phrases`, url: pageUrl(config.phrasesFile) },
          { "@type": "ListItem", position: 4, name: `${config.language} grammar`, url: pageUrl(config.grammarFile) },
        ],
      },
    ],
  };

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: `${SITE_ORIGIN}/` },
    { name: `Learn ${config.language} Online`, url: pageUrl(config.worldFile) },
  ]);

  return `${jsonLdScript(graph)}\n${jsonLdScript(breadcrumbs, "Breadcrumb structured data")}`;
};

const buildWorldAlternateLinks = (config) => {
  const links = [{ lang: "en", url: pageUrl(config.worldFile) }];
  if (config.localizedGuideFile) {
    const localizedLang = String(LOCALIZED_HREFLANG_BY_KEY[config.key] || "").trim();
    if (localizedLang) {
      links.push({ lang: localizedLang, url: pageUrl(config.localizedGuideFile) });
    }
  }
  links.push({ lang: "x-default", url: pageUrl(config.worldFile) });
  return buildAlternateLinks(links);
};

const buildPronunciationAlternateLinks = (config) => {
  const links = [{ lang: "en", url: pageUrl(pronunciationPageFile(config.key)) }];
  const localizedLang = String(LOCALIZED_HREFLANG_BY_KEY[config.key] || "").trim();
  const localizedFile = localizedPronunciationPageFile(config.key);
  if (localizedLang && localizedFile) {
    links.push({ lang: localizedLang, url: pageUrl(localizedFile) });
  }
  links.push({ lang: "x-default", url: pageUrl(pronunciationPageFile(config.key)) });
  return buildAlternateLinks(links);
};

const buildTravelAlternateLinks = (config) => {
  const links = [{ lang: "en", url: pageUrl(travelPhrasesPageFile(config.key)) }];
  const localizedLang = String(LOCALIZED_HREFLANG_BY_KEY[config.key] || "").trim();
  const localizedFile = localizedTravelPhrasesPageFile(config.key);
  if (localizedLang && localizedFile) {
    links.push({ lang: localizedLang, url: pageUrl(localizedFile) });
  }
  links.push({ lang: "x-default", url: pageUrl(travelPhrasesPageFile(config.key)) });
  return buildAlternateLinks(links);
};

const replaceHeadStructuredData = (html, blocks) => {
  const ogImageMarker = '<meta property="og:image"';
  const schemaStart = html.indexOf('<script type="application/ld+json">');
  const ogImageIndex = html.indexOf(ogImageMarker, schemaStart);
  if (schemaStart === -1 || ogImageIndex === -1) {
    return html;
  }
  return `${html.slice(0, schemaStart)}${blocks}\n${html.slice(ogImageIndex)}`;
};

const upsertWorldHubSeo = (config) => {
  let html = readFile(config.worldFile);
  const sections = `${buildGuideCards(config)}\n${buildFaqSection(config)}`;
  if (html.includes("<!-- SEO guide links -->")) {
    html = html.replace(
      /<!-- SEO guide links -->[\s\S]*?(?:<!-- SEO FAQ -->[\s\S]*?<\/section>\s*)?(?=<\/main>)/i,
      `${sections}\n`
    );
  } else {
    html = html.replace(/<\/main>/i, `${sections}\n    </main>`);
  }
  const worldStructuredData = buildWorldStructuredData(config);
  const faqScript = buildFaqJsonLd(config);
  html = replaceHeadStructuredData(html, `${worldStructuredData}\n${faqScript}`);
  const alternateLinks = buildWorldAlternateLinks(config);
  if (html.includes("<!-- Multilingual SEO: hreflang cluster -->")) {
    html = html.replace(
      /\s*<!-- Multilingual SEO: hreflang cluster -->[\s\S]*?<!-- \/Multilingual SEO: hreflang cluster -->\s*/i,
      `\n${alternateLinks}`
    );
  } else {
    html = html.replace(
      /(<link rel="canonical" href="[^"]+" \/>)/i,
      `$1\n${alternateLinks.trimEnd()}`
    );
  }

  writeFile(config.worldFile, html);
};

for (const config of LANGUAGES) {
  writeFile(
    beginnerPageFile(config.key),
    pageShell({
      title: beginnerTitle(config.language),
      description: beginnerDescription(config.language),
      canonicalPath: beginnerPageFile(config.key),
      brandSub: `${config.language} Beginner Guide`,
      backHref: config.worldFile,
      backLabel: `Return to ${config.language} course`,
      bodyClass: "world-page seo-guide-page",
      content: beginnerContent(config),
      structuredData: guideStructuredData(
        config,
        beginnerTitle(config.language),
        beginnerDescription(config.language),
        beginnerPageFile(config.key),
        `Learn ${config.language} for beginners`
      ),
    })
  );

  writeFile(
    pronunciationPageFile(config.key),
    pageShell({
      title: pronunciationTitle(config.language),
      description: pronunciationDescription(config.language),
      canonicalPath: pronunciationPageFile(config.key),
      brandSub: `${config.language} Pronunciation`,
      backHref: config.worldFile,
      backLabel: `Return to ${config.language} course`,
      bodyClass: "world-page seo-guide-page",
      content: pronunciationContent(config),
      alternateLinks: buildPronunciationAlternateLinks(config),
      structuredData: guideStructuredData(
        config,
        pronunciationTitle(config.language),
        pronunciationDescription(config.language),
        pronunciationPageFile(config.key),
        `${config.language} pronunciation guide`
      ),
    })
  );

  writeFile(
    travelPhrasesPageFile(config.key),
    pageShell({
      title: travelPhrasesTitle(config.language),
      description: travelPhrasesDescription(config.language),
      canonicalPath: travelPhrasesPageFile(config.key),
      brandSub: `${config.language} Travel Phrases`,
      backHref: config.worldFile,
      backLabel: `Return to ${config.language} course`,
      bodyClass: "world-page seo-guide-page",
      content: travelPhrasesContent(config),
      alternateLinks: buildTravelAlternateLinks(config),
      structuredData: guideStructuredData(
        config,
        travelPhrasesTitle(config.language),
        travelPhrasesDescription(config.language),
        travelPhrasesPageFile(config.key),
        `${config.language} travel phrases`
      ),
    })
  );

  upsertWorldHubSeo(config);
}

console.log(`Generated ${LANGUAGES.length * 3} SEO landing pages and linked them from world hubs.`);


