const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FRONTEND = path.join(ROOT, "frontend");
const SITE_ORIGIN = "https://www.cosmicalearn.com";
const SHARED_ASSET_VERSION = "20260438";
const STYLE_ASSET_VERSION = SHARED_ASSET_VERSION;
const APP_ASSET_VERSION = SHARED_ASSET_VERSION;
const ACCOUNT_CARET_ENTITY = "&#9662;";

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const writeFile = (fileName, content) =>
  fs.writeFileSync(path.join(FRONTEND, fileName), content, "utf8");
const pageUrl = (fileName) => (fileName === "index.html" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/${fileName}`);
const hasMojibake = (value) =>
  /Ã|Â|â|Ø|Ù|Ð|Ñ|ä¸|åœ|æ—|ì˜|í•|à¤|à¥/.test(String(value || ""));
const fixMojibake = (value) => {
  const text = String(value || "");
  if (!hasMojibake(text)) {
    return text;
  }
  try {
    const repaired = Buffer.from(text, "latin1").toString("utf8");
    return repaired || text;
  } catch {
    return text;
  }
};
const repairDeepText = (value) => {
  if (typeof value === "string") {
    return fixMojibake(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => repairDeepText(item));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, repairDeepText(item)])
    );
  }
  return value;
};

const buildAlternateLinks = (links = []) => {
  const items = links
    .filter((item) => item && item.lang && item.url)
    .map(
      (item) => `    <link rel="alternate" hreflang="${escapeHtml(item.lang)}" href="${escapeHtml(item.url)}" />`
    );
  if (!items.length) {
    return "";
  }
  return `    <!-- Multilingual SEO: hreflang cluster -->\n${items.join("\n")}\n    <!-- /Multilingual SEO: hreflang cluster -->\n`;
};

const jsonLdScript = (schema, marker = "") => {
  const json = JSON.stringify(schema, null, 2)
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");

  return `${marker ? `    <!-- ${marker} -->\n` : ""}    <script type="application/ld+json">\n${json}\n    </script>`;
};

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

const courseSchema = (config) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name: config.h1,
  description: config.description,
  provider: {
    "@type": "Organization",
    name: "Cosmica",
    url: `${SITE_ORIGIN}/`,
  },
  url: pageUrl(config.file),
});

const ENGLISH_LANGUAGE_NAMES = {
  french: "French",
  spanish: "Spanish",
  arabic: "Arabic",
  chinese: "Chinese",
  japanese: "Japanese",
  korean: "Korean",
  hindi: "Hindi",
  german: "German",
  portuguese: "Portuguese",
  dutch: "Dutch",
  swedish: "Swedish",
};

const LOCALIZED_SEO_TEXT = Object.freeze(repairDeepText({
  default: {
    pronunciationLabel: "Pronunciation Guide",
    travelLabel: "Travel Phrases",
    pronunciationDescription:
      "Improve pronunciation with audio practice, repeat drills, and clearer speaking rhythm.",
    travelDescription:
      "Learn practical travel phrases for greetings, directions, transport, and daily situations.",
    pronunciationSectionText:
      "Pronunciation practice with audio, repeat drills, and clearer speaking rhythm.",
    travelSectionText:
      "Travel phrase practice for greetings, directions, transport, and daily interactions.",
  },
  french: {
    pronunciationLabel: "Guide de prononciation",
    travelLabel: "Phrases de voyage",
    pronunciationDescription:
      "Ameliorez la prononciation avec audio, repetition et rythme de parole plus naturel.",
    travelDescription:
      "Apprenez des phrases utiles pour saluer, demander une direction et voyager.",
    pronunciationSectionText:
      "Travail de prononciation avec audio, repetition et rythme de parole plus naturel.",
    travelSectionText:
      "Entrainement aux phrases de voyage pour saluer, se deplacer et communiquer au quotidien.",
  },
  spanish: {
    pronunciationLabel: "Guia de pronunciacion",
    travelLabel: "Frases de viaje",
    pronunciationDescription:
      "Mejora tu pronunciacion con audio, repeticion y ritmo de habla mas claro.",
    travelDescription:
      "Aprende frases utiles para saludar, pedir direcciones y viajar con mas confianza.",
    pronunciationSectionText:
      "Practica de pronunciacion con audio, repeticion y ritmo de habla mas claro.",
    travelSectionText:
      "Practica frases de viaje para saludos, direcciones, transporte y situaciones diarias.",
  },
  arabic: {
    pronunciationLabel: "\u062f\u0644\u064a\u0644 \u0627\u0644\u0646\u0637\u0642",
    travelLabel: "\u0639\u0628\u0627\u0631\u0627\u062a \u0627\u0644\u0633\u0641\u0631",
    pronunciationDescription:
      "\u062d\u0633\u0651\u0646 \u0627\u0644\u0646\u0637\u0642 \u0628\u0627\u0644\u0635\u0648\u062a \u0648\u0627\u0644\u062a\u0643\u0631\u0627\u0631 \u0648\u0625\u064a\u0642\u0627\u0639 \u0627\u0644\u0643\u0644\u0627\u0645 \u0628\u0634\u0643\u0644 \u0623\u0648\u0636\u062d.",
    travelDescription:
      "\u062a\u0639\u0644\u0645 \u0639\u0628\u0627\u0631\u0627\u062a \u0639\u0645\u0644\u064a\u0629 \u0644\u0644\u0633\u0641\u0631 \u0644\u0644\u062a\u062d\u064a\u0629 \u0648\u0627\u0644\u0627\u062a\u062c\u0627\u0647\u0627\u062a \u0648\u0627\u0644\u0646\u0642\u0644 \u0648\u0627\u0644\u0645\u0648\u0627\u0642\u0641 \u0627\u0644\u064a\u0648\u0645\u064a\u0629.",
    pronunciationSectionText:
      "\u062a\u062f\u0631\u064a\u0628 \u0646\u0637\u0642 \u0628\u0627\u0644\u0635\u0648\u062a \u0648\u0627\u0644\u062a\u0643\u0631\u0627\u0631 \u0648\u0625\u064a\u0642\u0627\u0639 \u0623\u0648\u0636\u062d \u0644\u0644\u0643\u0644\u0627\u0645.",
    travelSectionText:
      "\u062a\u062f\u0631\u064a\u0628 \u0639\u0644\u0649 \u0639\u0628\u0627\u0631\u0627\u062a \u0627\u0644\u0633\u0641\u0631 \u0644\u0644\u062a\u062d\u064a\u0627\u062a \u0648\u0627\u0644\u0627\u062a\u062c\u0627\u0647\u0627\u062a \u0648\u0627\u0644\u0646\u0642\u0644 \u0648\u0627\u0644\u062d\u064a\u0627\u0629 \u0627\u0644\u064a\u0648\u0645\u064a\u0629.",
  },
  chinese: {
    pronunciationLabel: "\u53d1\u97f3\u6307\u5357",
    travelLabel: "\u65c5\u884c\u77ed\u8bed",
    pronunciationDescription:
      "\u901a\u8fc7\u97f3\u9891\u548c\u8ddf\u8bfb\u7ec3\u4e60\uff0c\u63d0\u5347\u53d1\u97f3\u6e05\u6670\u5ea6\u4e0e\u8bed\u8c03\u8282\u594f\u3002",
    travelDescription:
      "\u5b66\u4e60\u65c5\u884c\u4e2d\u5e38\u7528\u7684\u95ee\u5019\u3001\u95ee\u8def\u3001\u4ea4\u901a\u548c\u65e5\u5e38\u77ed\u8bed\u3002",
    pronunciationSectionText:
      "\u53d1\u97f3\u8bad\u7ec3\u5305\u542b\u97f3\u9891\u3001\u8ddf\u8bfb\u4e0e\u66f4\u6e05\u6670\u7684\u53e3\u8bed\u8282\u594f\u3002",
    travelSectionText:
      "\u65c5\u884c\u77ed\u8bed\u8bad\u7ec3\u6db5\u76d6\u95ee\u5019\u3001\u95ee\u8def\u3001\u4ea4\u901a\u4e0e\u65e5\u5e38\u573a\u666f\u3002",
  },
  japanese: {
    pronunciationLabel: "\u767a\u97f3\u30ac\u30a4\u30c9",
    travelLabel: "\u65c5\u884c\u30d5\u30ec\u30fc\u30ba",
    pronunciationDescription:
      "\u97f3\u58f0\u3068\u53cd\u5fa9\u7df4\u7fd2\u3067\u3001\u767a\u97f3\u306e\u660e\u77ad\u3055\u3068\u8a71\u3059\u30ea\u30ba\u30e0\u3092\u6574\u3048\u307e\u3059\u3002",
    travelDescription:
      "\u3042\u3044\u3055\u3064\u3001\u9053\u6848\u5185\u3001\u4ea4\u901a\u3001\u65e5\u5e38\u5834\u9762\u3067\u4f7f\u3048\u308b\u5b9f\u7528\u30d5\u30ec\u30fc\u30ba\u3092\u5b66\u3073\u307e\u3059\u3002",
    pronunciationSectionText:
      "\u97f3\u58f0\u3068\u53cd\u5fa9\u7df4\u7fd2\u3067\u3001\u767a\u97f3\u3068\u8a71\u3059\u30ea\u30ba\u30e0\u3092\u78ba\u5b9f\u306b\u6574\u3048\u307e\u3059\u3002",
    travelSectionText:
      "\u65c5\u884c\u306b\u5f79\u7acb\u3064\u30d5\u30ec\u30fc\u30ba\u3092\u3001\u3042\u3044\u3055\u3064\u304b\u3089\u79fb\u52d5\u307e\u3067\u7df4\u7fd2\u3057\u307e\u3059\u3002",
  },
  korean: {
    pronunciationLabel: "\ubc1c\uc74c \uac00\uc774\ub4dc",
    travelLabel: "\uc5ec\ud589 \ud45c\ud604",
    pronunciationDescription:
      "\uc624\ub514\uc624\uc640 \ubc18\ubcf5 \uc5f0\uc2b5\uc73c\ub85c \ubc1c\uc74c\uc744 \ub354 \uc815\ud655\ud558\uace0 \uc790\uc5f0\uc2a4\ub7fd\uac8c \ub2e4\ub4ec\uc2b5\ub2c8\ub2e4.",
    travelDescription:
      "\uc778\uc0ac, \uae38 \ubb3b\uae30, \uad50\ud1b5, \uc77c\uc0c1 \uc0c1\ud669\uc5d0\uc11c \uc4f8 \uc218 \uc788\ub294 \uc2e4\uc6a9 \ud45c\ud604\uc744 \ubc30\uc6c1\ub2c8\ub2e4.",
    pronunciationSectionText:
      "\uc624\ub514\uc624\uc640 \ubc18\ubcf5 \uc5f0\uc2b5\uc73c\ub85c \ubc1c\uc74c\uacfc \ub9d0\ud558\uae30 \ub9ac\ub4ec\uc744 \uac1c\uc120\ud569\ub2c8\ub2e4.",
    travelSectionText:
      "\uc5ec\ud589\uc5d0 \ud544\uc694\ud55c \ud45c\ud604\uc744 \uc778\uc0ac, \uc774\ub3d9, \uc77c\uc0c1 \uc0c1\ud669 \uc911\uc2ec\uc73c\ub85c \uc5f0\uc2b5\ud569\ub2c8\ub2e4.",
  },
  hindi: {
    pronunciationLabel: "\u0909\u091a\u094d\u091a\u093e\u0930\u0923 \u0917\u093e\u0907\u0921",
    travelLabel: "\u092f\u093e\u0924\u094d\u0930\u093e \u0935\u093e\u0915\u094d\u092f\u093e\u0902\u0936",
    pronunciationDescription:
      "\u0911\u0921\u093f\u092f\u094b \u0914\u0930 \u0926\u094b\u0939\u0930\u093e\u0935 \u0905\u092d\u094d\u092f\u093e\u0938 \u0915\u0947 \u0938\u093e\u0925 \u0909\u091a\u094d\u091a\u093e\u0930\u0923 \u0914\u0930 \u092c\u094b\u0932\u0928\u0947 \u0915\u093e \u0932\u092f \u0938\u0941\u0927\u093e\u0930\u0947\u0902\u0964",
    travelDescription:
      "\u0928\u092e\u0938\u094d\u0915\u093e\u0930, \u0930\u093e\u0938\u094d\u0924\u093e, \u092f\u093e\u0924\u093e\u092f\u093e\u0924 \u0914\u0930 \u0930\u094b\u091c\u093c\u092e\u0930\u094d\u0930\u093e \u0938\u094d\u0925\u093f\u0924\u093f\u092f\u094b\u0902 \u0915\u0947 \u0932\u093f\u090f \u0909\u092a\u092f\u094b\u0917\u0940 \u0935\u093e\u0915\u094d\u092f\u093e\u0902\u0936 \u0938\u0940\u0916\u0947\u0902\u0964",
    pronunciationSectionText:
      "\u0911\u0921\u093f\u092f\u094b \u0914\u0930 \u0926\u094b\u0939\u0930\u093e\u0935 \u0938\u0947 \u0909\u091a\u094d\u091a\u093e\u0930\u0923 \u0914\u0930 \u092c\u094b\u0932\u0928\u0947 \u0915\u0940 \u0932\u092f \u0915\u094b \u092e\u091c\u092c\u0942\u0924 \u0915\u0930\u0947\u0902\u0964",
    travelSectionText:
      "\u092f\u093e\u0924\u094d\u0930\u093e \u0915\u0947 \u0932\u093f\u090f \u091c\u0930\u0942\u0930\u0940 \u0935\u093e\u0915\u094d\u092f\u093e\u0902\u0936 \u0915\u094b \u0928\u092e\u0938\u094d\u0915\u093e\u0930 \u0938\u0947 \u0926\u0948\u0928\u093f\u0915 \u0938\u0902\u092d\u093e\u0937\u0923 \u0924\u0915 \u0905\u092d\u094d\u092f\u093e\u0938 \u0915\u0930\u0947\u0902\u0964",
  },
  german: {
    pronunciationLabel: "Aussprache",
    travelLabel: "Reisephrasen",
    pronunciationDescription:
      "Verbessern Sie die Aussprache mit Audio, Wiederholung und klarerem Sprechrhythmus.",
    travelDescription:
      "Lernen Sie praktische Reisephrasen fuer Begruessungen, Wege, Verkehr und Alltag.",
    pronunciationSectionText:
      "Aussprachetraining mit Audio, Wiederholung und klarerem Sprechrhythmus.",
    travelSectionText:
      "Training von Reisephrasen fuer Begruessungen, Orientierung, Verkehr und Alltagssituationen.",
  },
  portuguese: {
    pronunciationLabel: "Guia de pronuncia",
    travelLabel: "Frases de viagem",
    pronunciationDescription:
      "Melhore a pronuncia com audio, repeticao e ritmo de fala mais claro.",
    travelDescription:
      "Aprenda frases praticas para cumprimentos, direcoes, transporte e situacoes do dia a dia.",
    pronunciationSectionText:
      "Pratica de pronuncia com audio, repeticao e ritmo de fala mais claro.",
    travelSectionText:
      "Pratica de frases de viagem para cumprimentos, direcoes, transporte e conversas do dia a dia.",
  },
  dutch: {
    pronunciationLabel: "Uitspraakgids",
    travelLabel: "Reiszinnen",
    pronunciationDescription:
      "Verbeter je uitspraak met audio, herhaling en een duidelijker spreekritme.",
    travelDescription:
      "Leer praktische reiszinnen voor begroetingen, routevragen, vervoer en dagelijkse situaties.",
    pronunciationSectionText:
      "Uitspraaktraining met audio, herhaling en een duidelijker spreekritme.",
    travelSectionText:
      "Oefen reiszinnen voor begroetingen, routevragen, vervoer en dagelijkse situaties.",
  },
  swedish: {
    pronunciationLabel: "Uttalsguide",
    travelLabel: "Resefraser",
    pronunciationDescription:
      "Forbattra uttalet med ljud, repetition och tydligare talrytm.",
    travelDescription:
      "Lar dig praktiska resefraser for halsningar, vagar, transport och vardagliga situationer.",
    pronunciationSectionText:
      "Uttalstraning med ljud, repetition och tydligare talrytm.",
    travelSectionText:
      "Trana resefraser for halsningar, vagar, transport och vardagliga situationer.",
  },
}));

const getLocalizedSeoText = (languageKey = "") =>
  LOCALIZED_SEO_TEXT[String(languageKey || "").trim().toLowerCase()] || LOCALIZED_SEO_TEXT.default;

const pronunciationPageFile = (key) => `${key}-pronunciation-guide.html`;
const travelPhrasesPageFile = (key) => `${key}-travel-phrases.html`;
const localizedPronunciationPageFile = ({ languageKey = "", htmlLang = "" } = {}) => {
  const key = String(languageKey || "").trim().toLowerCase();
  const langRaw = String(htmlLang || "").trim().toLowerCase();
  if (!key || !langRaw) {
    return "";
  }
  const langSlug = langRaw.split("-")[0];
  if (!langSlug) {
    return "";
  }
  return `${key}-pronunciation-${langSlug}.html`;
};
const localizedTravelPhrasesPageFile = ({ languageKey = "", htmlLang = "" } = {}) => {
  const key = String(languageKey || "").trim().toLowerCase();
  const langRaw = String(htmlLang || "").trim().toLowerCase();
  if (!key || !langRaw) {
    return "";
  }
  const langSlug = langRaw.split("-")[0];
  if (!langSlug) {
    return "";
  }
  return `${key}-travel-phrases-${langSlug}.html`;
};

const pageShell = ({
  htmlLang,
  dir,
  title,
  description,
  canonicalPath,
  brandSub,
  backHref,
  backLabel,
  footerText,
  content,
  extraStructuredData,
  alternateLinks = "",
}) => {
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_ORIGIN}/${canonicalPath}`,
    inLanguage: htmlLang,
    isPartOf: {
      "@type": "WebSite",
      name: "Cosmica",
      url: `${SITE_ORIGIN}/`,
    },
  };

  return `<!doctype html>
<!-- Page Structure: metadata, navigation, main content, footer -->
<html lang="${escapeHtml(htmlLang)}"${dir ? ` dir="${escapeHtml(dir)}"` : ""}>
  <head>
    <!-- Metadata, SEO, social tags, and shared font assets -->
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="shortcut icon" href="/favicon.svg" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="#0a0f24" />
    <meta name="application-name" content="Cosmica" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Cosmica" />
    <link rel="manifest" href="/app.webmanifest" />
    <link rel="apple-touch-icon" sizes="180x180" href="/pwa/apple-touch-icon.png" />
    <link rel="canonical" href="${SITE_ORIGIN}/${escapeHtml(canonicalPath)}" />
${alternateLinks}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Cosmica" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${SITE_ORIGIN}/${escapeHtml(canonicalPath)}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <link rel="preload" as="style" href="style.css?v=${STYLE_ASSET_VERSION}" />
    <link rel="stylesheet" href="style.css?v=${STYLE_ASSET_VERSION}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Rajdhani:wght@400;600;700&family=Oxanium:wght@600&display=swap"
      rel="stylesheet"
      data-sri-exempt="google-fonts-dynamic-css"
    />
${jsonLdScript(webPageSchema)}
${extraStructuredData ? `${extraStructuredData}\n` : ""}    <meta property="og:image" content="${SITE_ORIGIN}/og-image.svg" />
    <meta name="twitter:image" content="${SITE_ORIGIN}/og-image.svg" />
  </head>
  <body class="world-page seo-guide-page">
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
          <div class="brand-sub">${escapeHtml(brandSub)}</div>
        </div>
      </div>
      <nav class="nav-links" aria-label="Primary navigation">
        <a href="${escapeHtml(backHref)}">${escapeHtml(backLabel)}</a>
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
        <span class="footer-right-text">${escapeHtml(footerText)}</span>
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
};

const buildGuidePager = (prev, next) => `      <section class="section reveal guide-pager-section" aria-label="Guide navigation">
        <div class="guide-pager">
          <a class="guide-pager-link guide-pager-prev" href="${escapeHtml(prev.href)}" aria-label="Previous page: ${escapeHtml(prev.title)}">
            <span class="guide-pager-arrow" aria-hidden="true">&larr;</span>
          </a>
          <a class="guide-pager-link guide-pager-next" href="${escapeHtml(next.href)}" aria-label="Next page: ${escapeHtml(next.title)}">
            <span class="guide-pager-arrow" aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </section>`;

const staticCardsHtml = (cards) =>
  cards
    .map(
      (card) => `          <article class="card">
            <h3>${card.title}</h3>
            <p>${card.text}</p>
          </article>`
    )
    .join("\n");

const buildContent = (config) => `      <section class="section world-hero" id="guide">
        <div class="section-title">
          <div class="eyebrow">${config.eyebrow}</div>
          <h1>${config.h1}</h1>
          <p class="lede">
            ${config.lede}
          </p>
        </div>
      </section>
      <section class="section reveal">
        <div class="section-title">
          <h2>${config.lessonsTitle}</h2>
        </div>
        <div class="steps">
${staticCardsHtml(config.lessonCards)}
        </div>
      </section>
${buildGuidePager(
  {
    href: pronunciationPageFile(config.languageKey),
    title: `${config.h1} - ${getLocalizedSeoText(config.languageKey).pronunciationLabel}`,
  },
  {
    href: localizedPronunciationPageFile(config),
    title: `${config.h1} - ${getLocalizedSeoText(config.languageKey).pronunciationLabel}`,
  }
)}`;

const localizedMainGuideTitle = (config) => `${String(config.h1 || "").trim()} | Cosmica`;

const localizedPronunciationTitle = (config) =>
  `${String(config.h1 || "").trim()} | ${getLocalizedSeoText(config.languageKey).pronunciationLabel} | Cosmica`;

const localizedPronunciationDescription = (config) =>
  getLocalizedSeoText(config.languageKey).pronunciationDescription;

const buildPronunciationContent = (config) => {
  const cards = Array.isArray(config.lessonCards)
    ? config.lessonCards.filter(Boolean).slice(0, 4)
    : [];
  return `      <section class="section world-hero" id="guide">
        <div class="section-title">
          <div class="eyebrow">${config.eyebrow}</div>
          <h1>${config.h1}</h1>
          <p class="lede">
            ${config.lede}
          </p>
        </div>
      </section>
      <section class="section reveal">
        <div class="section-title">
          <h2>${config.lessonsTitle}</h2>
          <p>${getLocalizedSeoText(config.languageKey).pronunciationSectionText}</p>
        </div>
        <div class="steps">
${staticCardsHtml(cards)}
        </div>
      </section>
${buildGuidePager(
  {
    href: config.file,
    title: config.h1,
  },
  {
    href: localizedTravelPhrasesPageFile(config),
    title: `${config.h1} - ${getLocalizedSeoText(config.languageKey).travelLabel}`,
  }
)}`;
};

const localizedTravelPhrasesTitle = (config) =>
  `${String(config.h1 || "").trim()} | ${getLocalizedSeoText(config.languageKey).travelLabel} | Cosmica`;

const localizedTravelPhrasesDescription = (config) =>
  getLocalizedSeoText(config.languageKey).travelDescription;

const buildTravelPhrasesContent = (config) => {
  const cards = Array.isArray(config.lessonCards)
    ? config.lessonCards.filter(Boolean).slice(0, 4)
    : [];
  return `      <section class="section world-hero" id="guide">
        <div class="section-title">
          <div class="eyebrow">${config.eyebrow}</div>
          <h1>${config.h1}</h1>
          <p class="lede">
            ${config.lede}
          </p>
        </div>
      </section>
      <section class="section reveal">
        <div class="section-title">
          <h2>${config.lessonsTitle}</h2>
          <p>${getLocalizedSeoText(config.languageKey).travelSectionText}</p>
        </div>
        <div class="steps">
${staticCardsHtml(cards)}
        </div>
      </section>
${buildGuidePager(
  {
    href: localizedPronunciationPageFile(config),
    title: `${config.h1} - ${getLocalizedSeoText(config.languageKey).pronunciationLabel}`,
  },
  {
    href: travelPhrasesPageFile(config.languageKey),
    title: `${ENGLISH_LANGUAGE_NAMES[config.languageKey]} travel phrases`,
  }
)}`;
};

const PAGES = repairDeepText([
  {
    file: "learn-french-online-fr.html",
    languageKey: "french",
    htmlLang: "fr",
    title: "Apprendre le français en ligne | Vocabulaire, phrases et grammaire | Cosmica",
    description:
      "Apprenez le français en ligne avec des leçons structurées pour la prononciation, le vocabulaire, les phrases et la grammaire.",
    brandSub: "Guide français",
    backHref: "world-french.html",
    backLabel: "Retour au cours de français",
    footerText: "Apprentissage structuré des langues avec des étapes claires.",
    worldFile: "world-french.html",
    eyebrow: "Français en ligne",
    h1: "Apprendre le français en ligne",
    lede:
      "Progressez du niveau débutant aux structures avancées avec de l audio, des traductions et des parcours courts et structurés.",
    lessonsTitle: "Leçons recommandées de français",
    lessonCards: [
      { title: "Alphabet et sons du français", text: "Travaillez la lecture et la prononciation de base." },
      { title: "Vocabulaire français", text: "Renforcez les mots utiles avant de passer à des phrases plus longues." },
      { title: "Phrases françaises utiles", text: "Pratiquez les salutations, les demandes et les situations courantes." },
      { title: "Grammaire française", text: "Clarifiez les structures pour parler et écrire avec plus de précision." },
    ],
  },
  {
    file: "learn-spanish-online-es.html",
    languageKey: "spanish",
    htmlLang: "es",
    title: "Aprender español en línea | Vocabulario, frases y gramática | Cosmica",
    description:
      "Aprende español en línea con lecciones estructuradas de pronunciación, vocabulario, frases y gramática.",
    brandSub: "Guía en español",
    backHref: "world-spanish.html",
    backLabel: "Volver al curso de español",
    footerText: "Aprendizaje de idiomas con estructura y pasos claros.",
    worldFile: "world-spanish.html",
    eyebrow: "Español en línea",
    h1: "Aprender español en línea",
    lede:
      "Avanza desde las bases hasta estructuras más precisas con audio, traducciones y rutas cortas para estudiar con claridad.",
    lessonsTitle: "Lecciones recomendadas de español",
    lessonCards: [
      { title: "Letras y pronunciación", text: "Refuerza sonidos, lectura y base oral." },
      { title: "Vocabulario en español", text: "Aprende palabras comunes antes de pasar a expresiones más largas." },
      { title: "Frases útiles en español", text: "Practica saludos, peticiones y situaciones reales." },
      { title: "Gramática española", text: "Mejora la precisión al hablar y escribir." },
    ],
  },
  {
    file: "learn-arabic-online-ar.html",
    languageKey: "arabic",
    htmlLang: "ar",
    dir: "rtl",
    title: "تعلم العربية عبر الإنترنت | المفردات والعبارات والقواعد | Cosmica",
    description:
      "تعلم العربية عبر الإنترنت من خلال دروس منظمة في النطق والمفردات والعبارات والقواعد.",
    brandSub: "دليل بالعربية",
    backHref: "world-arabic.html",
    backLabel: "العودة إلى دورة العربية",
    footerText: "تعلم منظم للغات بخطوات واضحة.",
    worldFile: "world-arabic.html",
    eyebrow: "العربية عبر الإنترنت",
    h1: "تعلم العربية عبر الإنترنت",
    lede:
      "ابدأ من الأساسيات ثم انتقل إلى القواعد الأكثر تقدما مع الصوت والترجمة ومسار واضح يدعم القراءة والاستماع والتحدث.",
    lessonsTitle: "دروس عربية مقترحة",
    lessonCards: [
      { title: "الحروف والأصوات", text: "ابن أساس القراءة والنطق بطريقة واضحة." },
      { title: "المفردات العربية", text: "وسع حصيلتك من الكلمات الشائعة قبل الانتقال إلى العبارات." },
      { title: "العبارات العربية", text: "تدرب على التحيات والطلبات والمواقف اليومية." },
      { title: "قواعد العربية", text: "طور بناء الجملة ودقة التعبير الشفهي والكتابي." },
    ],
  },
  {
    file: "learn-chinese-online-zh.html",
    languageKey: "chinese",
    htmlLang: "zh-Hans",
    title: "在线学习中文 | 词汇 短语和语法 | Cosmica",
    description:
      "通过结构化课程在线学习中文，练习发音 词汇 常用短语和语法。",
    brandSub: "中文指南",
    backHref: "world-chinese.html",
    backLabel: "返回中文课程",
    footerText: "结构清晰的语言学习路径。",
    worldFile: "world-chinese.html",
    eyebrow: "在线中文课程",
    h1: "在线学习中文",
    lede:
      "从基础内容到更深入的语法逐步提升，配合音频、翻译和清晰的学习路径来加强阅读、听力和口语。",
    lessonsTitle: "推荐的中文学习内容",
    lessonCards: [
      { title: "汉字与发音", text: "先打好识字和发音基础。" },
      { title: "中文词汇", text: "积累高频词，再进入更完整的表达。" },
      { title: "常用中文短语", text: "练习问候、请求和真实场景表达。" },
      { title: "中文语法", text: "提高句子组织和表达准确性。" },
    ],
  },
  {
    file: "learn-japanese-online-ja.html",
    languageKey: "japanese",
    htmlLang: "ja",
    title: "オンラインで日本語を学ぶ | 語彙 フレーズ 文法 | Cosmica",
    description:
      "発音、語彙、フレーズ、文法を順序よく学べる日本語コースです。",
    brandSub: "日本語ガイド",
    backHref: "world-japanese.html",
    backLabel: "日本語コースに戻る",
    footerText: "順序が分かりやすい語学学習。",
    worldFile: "world-japanese.html",
    eyebrow: "オンライン日本語",
    h1: "オンラインで日本語を学ぶ",
    lede:
      "基礎から発展的な文法まで、音声、翻訳、短い学習ルートを使って読み、聞き取り、会話を伸ばせます。",
    lessonsTitle: "おすすめの日本語レッスン",
    lessonCards: [
      { title: "文字と発音", text: "ひらがな、カタカナと発音の基礎を固めます。" },
      { title: "日本語の語彙", text: "よく使う単語を増やして理解を広げます。" },
      { title: "日本語フレーズ", text: "あいさつや依頼など実用的な表現を練習します。" },
      { title: "日本語文法", text: "文の形を整理して、より正確に話せるようにします。" },
    ],
  },
  {
    file: "learn-korean-online-ko.html",
    languageKey: "korean",
    htmlLang: "ko",
    title: "온라인으로 한국어 배우기 | 어휘 표현 문법 | Cosmica",
    description:
      "발음, 어휘, 표현, 문법을 체계적으로 연습할 수 있는 한국어 코스입니다.",
    brandSub: "한국어 가이드",
    backHref: "world-korean.html",
    backLabel: "한국어 코스로 돌아가기",
    footerText: "단계가 분명한 구조형 언어 학습.",
    worldFile: "world-korean.html",
    eyebrow: "온라인 한국어",
    h1: "온라인으로 한국어 배우기",
    lede:
      "기초부터 더 정교한 문법까지, 오디오와 번역, 짧은 학습 경로를 통해 읽기, 듣기, 말하기를 함께 키울 수 있습니다.",
    lessonsTitle: "추천 한국어 학습 경로",
    lessonCards: [
      { title: "한글과 발음", text: "읽기와 발음의 기초를 먼저 다집니다." },
      { title: "한국어 어휘", text: "자주 쓰는 단어를 익혀 표현력을 넓힙니다." },
      { title: "한국어 표현", text: "인사, 요청, 실제 상황 표현을 연습합니다." },
      { title: "한국어 문법", text: "더 정확한 문장 구성과 말하기를 돕습니다." },
    ],
  },
  {
    file: "learn-hindi-online-hi.html",
    languageKey: "hindi",
    htmlLang: "hi",
    title: "ऑनलाइन हिंदी सीखें | शब्दावली वाक्यांश और व्याकरण | Cosmica",
    description:
      "उच्चारण, शब्दावली, वाक्यांश और व्याकरण के साथ संरचित तरीके से हिंदी सीखें।",
    brandSub: "हिंदी गाइड",
    backHref: "world-hindi.html",
    backLabel: "हिंदी कोर्स पर लौटें",
    footerText: "स्पष्ट चरणों के साथ संरचित भाषा सीखना।",
    worldFile: "world-hindi.html",
    eyebrow: "ऑनलाइन हिंदी",
    h1: "ऑनलाइन हिंदी सीखें",
    lede:
      "बुनियादी स्तर से आगे बढ़कर उन्नत व्याकरण तक पहुंचें, और ऑडियो, अनुवाद तथा स्पष्ट अध्ययन पथ के साथ पढ़ना, सुनना और बोलना मजबूत करें।",
    lessonsTitle: "सुझाए गए हिंदी पाठ",
    lessonCards: [
      { title: "अक्षर और उच्चारण", text: "देवनागरी और ध्वनियों की मजबूत नींव बनाएं।" },
      { title: "हिंदी शब्दावली", text: "सामान्य शब्द सीखें और अपनी समझ बढ़ाएं।" },
      { title: "उपयोगी हिंदी वाक्यांश", text: "अभिवादन, अनुरोध और रोजमर्रा की स्थितियों का अभ्यास करें।" },
      { title: "हिंदी व्याकरण", text: "वाक्य रचना और अभिव्यक्ति की शुद्धता मजबूत करें।" },
    ],
  },
  {
    file: "learn-german-online-de.html",
    languageKey: "german",
    htmlLang: "de",
    title: "Deutsch online lernen | Wortschatz, Sätze und Grammatik | Cosmica",
    description:
      "Lernen Sie Deutsch online mit strukturierten Lektionen zu Aussprache, Wortschatz, Sätzen und Grammatik.",
    brandSub: "Leitfaden auf Deutsch",
    backHref: "world-german.html",
    backLabel: "Zurück zum Deutschkurs",
    footerText: "Strukturiertes Sprachenlernen mit klaren nächsten Schritten.",
    worldFile: "world-german.html",
    eyebrow: "Deutsch online",
    h1: "Deutsch online lernen",
    lede:
      "Gehen Sie von den Grundlagen bis zu fortgeschrittener Grammatik mit Audio, Übersetzungen und klaren Lernpfaden für Lesen, Hören und Sprechen.",
    lessonsTitle: "Empfohlene Deutschlektionen",
    lessonCards: [
      { title: "Alphabet und Aussprache", text: "Stärken Sie die Grundlagen für Lesen und Sprechen." },
      { title: "Deutscher Wortschatz", text: "Bauen Sie wichtige Wörter für den Alltag auf." },
      { title: "Nützliche deutsche Sätze", text: "Üben Sie Begrüßungen, Bitten und Alltagssituationen." },
      { title: "Deutsche Grammatik", text: "Arbeiten Sie an genauerem Satzbau und sichererem Ausdruck." },
    ],
  },
  {
    file: "learn-portuguese-online-pt.html",
    languageKey: "portuguese",
    htmlLang: "pt",
    title: "Aprender português online | Vocabulário, frases e gramática | Cosmica",
    description:
      "Aprenda português online com aulas estruturadas de pronúncia, vocabulário, frases e gramática.",
    brandSub: "Guia em português",
    backHref: "world-portuguese.html",
    backLabel: "Voltar ao curso de português",
    footerText: "Aprendizagem de línguas com estrutura e próximos passos claros.",
    worldFile: "world-portuguese.html",
    eyebrow: "Português online",
    h1: "Aprender português online",
    lede:
      "Avance das bases para estruturas mais complexas com áudio, traduções e percursos curtos para leitura, escuta e fala.",
    lessonsTitle: "Lições recomendadas de português",
    lessonCards: [
      { title: "Letras e pronúncia", text: "Fortaleça a base de leitura e som." },
      { title: "Vocabulário em português", text: "Construa palavras frequentes antes de avançar para expressões maiores." },
      { title: "Frases úteis em português", text: "Pratique cumprimentos, pedidos e situações comuns." },
      { title: "Gramática portuguesa", text: "Melhore a precisão ao falar e escrever." },
    ],
  },
  {
    file: "learn-dutch-online-nl.html",
    languageKey: "dutch",
    htmlLang: "nl",
    title: "Nederlands online leren | Woordenschat, zinnen en grammatica | Cosmica",
    description:
      "Leer Nederlands online met gestructureerde lessen voor uitspraak, woordenschat, zinnen en grammatica.",
    brandSub: "Gids in het Nederlands",
    backHref: "world-dutch.html",
    backLabel: "Terug naar de cursus Nederlands",
    footerText: "Gestructureerd talen leren met duidelijke volgende stappen.",
    worldFile: "world-dutch.html",
    eyebrow: "Nederlands online",
    h1: "Nederlands online leren",
    lede:
      "Werk van de basis naar meer gevorderde grammatica met audio, vertalingen en korte leerroutes voor lezen, luisteren en spreken.",
    lessonsTitle: "Aanbevolen lessen Nederlands",
    lessonCards: [
      { title: "Letters en uitspraak", text: "Versterk de basis voor lezen en spreken." },
      { title: "Nederlandse woordenschat", text: "Bouw nuttige woorden op voor alledaagse situaties." },
      { title: "Nuttige Nederlandse zinnen", text: "Oefen begroetingen, verzoeken en echte situaties." },
      { title: "Nederlandse grammatica", text: "Werk aan nauwkeuriger zinsbouw en helderder taalgebruik." },
    ],
  },
  {
    file: "learn-swedish-online-sv.html",
    languageKey: "swedish",
    htmlLang: "sv",
    title: "Lär dig svenska online | Ordförråd, fraser och grammatik | Cosmica",
    description:
      "Lär dig svenska online med strukturerade lektioner i uttal, ordförråd, fraser och grammatik.",
    brandSub: "Guide på svenska",
    backHref: "world-swedish.html",
    backLabel: "Tillbaka till svenskakursen",
    footerText: "Strukturerat språklärande med tydliga nästa steg.",
    worldFile: "world-swedish.html",
    eyebrow: "Svenska online",
    h1: "Lär dig svenska online",
    lede:
      "Gå från grunderna till mer avancerad grammatik med ljud, översättningar och korta studievägar för läsning, lyssning och tal.",
    lessonsTitle: "Rekommenderade svenskalektioner",
    lessonCards: [
      { title: "Bokstäver och uttal", text: "Stärk grunden för läsning och tal." },
      { title: "Svenskt ordförråd", text: "Bygg upp vanliga ord innan du går vidare till längre uttryck." },
      { title: "Användbara svenska fraser", text: "Öva hälsningar, frågor och vanliga situationer." },
      { title: "Svensk grammatik", text: "Förbättra precisionen i tal och skrift." },
    ],
  },
]);

for (const config of PAGES) {
  const localizedSeoText = getLocalizedSeoText(config.languageKey);
  const breadcrumbs = breadcrumbSchema([
    { name: "Cosmica", url: `${SITE_ORIGIN}/` },
    { name: config.h1, url: pageUrl(config.file) },
  ]);
  const alternateLinks = buildAlternateLinks([
    { lang: config.htmlLang, url: pageUrl(config.file) },
    { lang: "en", url: pageUrl(config.worldFile) },
    { lang: "x-default", url: pageUrl(config.worldFile) },
  ]);

  writeFile(
    config.file,
    pageShell({
      htmlLang: config.htmlLang,
      dir: config.dir,
      title: localizedMainGuideTitle(config),
      description: config.description,
      canonicalPath: config.file,
      brandSub: config.brandSub,
      backHref: config.backHref,
      backLabel: config.backLabel,
      footerText: config.footerText,
      content: buildContent(config),
      alternateLinks,
      extraStructuredData: [
        jsonLdScript(courseSchema(config), "Course structured data"),
        jsonLdScript(breadcrumbs, "Breadcrumb structured data"),
      ].join("\n"),
    })
  );

  const localizedPronunciationFile = localizedPronunciationPageFile(config);
  const pronunciationBreadcrumbs = breadcrumbSchema([
    { name: "Cosmica", url: `${SITE_ORIGIN}/` },
    { name: config.h1, url: pageUrl(config.file) },
    {
      name: `${config.h1} - ${localizedSeoText.pronunciationLabel}`,
      url: pageUrl(localizedPronunciationFile),
    },
  ]);
  const pronunciationAlternateLinks = buildAlternateLinks([
    { lang: config.htmlLang, url: pageUrl(localizedPronunciationFile) },
    { lang: "en", url: pageUrl(pronunciationPageFile(config.languageKey)) },
    { lang: "x-default", url: pageUrl(pronunciationPageFile(config.languageKey)) },
  ]);

  writeFile(
    localizedPronunciationFile,
    pageShell({
      htmlLang: config.htmlLang,
      dir: config.dir,
      title: localizedPronunciationTitle(config),
      description: localizedPronunciationDescription(config),
      canonicalPath: localizedPronunciationFile,
      brandSub: `${config.brandSub} - ${localizedSeoText.pronunciationLabel}`,
      backHref: config.file,
      backLabel: config.h1,
      footerText: config.footerText,
      content: buildPronunciationContent(config),
      alternateLinks: pronunciationAlternateLinks,
      extraStructuredData: [
        jsonLdScript(
          {
            ...courseSchema({
              ...config,
              file: localizedPronunciationFile,
              h1: `${config.h1} - ${localizedSeoText.pronunciationLabel}`,
              description: localizedPronunciationDescription(config),
            }),
          },
          "Course structured data"
        ),
        jsonLdScript(pronunciationBreadcrumbs, "Breadcrumb structured data"),
      ].join("\n"),
    })
  );

  const localizedTravelPhrasesFile = localizedTravelPhrasesPageFile(config);
  const travelPhrasesBreadcrumbs = breadcrumbSchema([
    { name: "Cosmica", url: `${SITE_ORIGIN}/` },
    { name: config.h1, url: pageUrl(config.file) },
    {
      name: `${config.h1} - ${localizedSeoText.travelLabel}`,
      url: pageUrl(localizedTravelPhrasesFile),
    },
  ]);
  const travelPhrasesAlternateLinks = buildAlternateLinks([
    { lang: config.htmlLang, url: pageUrl(localizedTravelPhrasesFile) },
    { lang: "en", url: pageUrl(travelPhrasesPageFile(config.languageKey)) },
    { lang: "x-default", url: pageUrl(travelPhrasesPageFile(config.languageKey)) },
  ]);

  writeFile(
    localizedTravelPhrasesFile,
    pageShell({
      htmlLang: config.htmlLang,
      dir: config.dir,
      title: localizedTravelPhrasesTitle(config),
      description: localizedTravelPhrasesDescription(config),
      canonicalPath: localizedTravelPhrasesFile,
      brandSub: `${config.brandSub} - ${localizedSeoText.travelLabel}`,
      backHref: localizedPronunciationFile,
      backLabel: localizedSeoText.pronunciationLabel,
      footerText: config.footerText,
      content: buildTravelPhrasesContent(config),
      alternateLinks: travelPhrasesAlternateLinks,
      extraStructuredData: [
        jsonLdScript(
          {
            ...courseSchema({
              ...config,
              file: localizedTravelPhrasesFile,
              h1: `${config.h1} - ${localizedSeoText.travelLabel}`,
              description: localizedTravelPhrasesDescription(config),
            }),
          },
          "Course structured data"
        ),
        jsonLdScript(travelPhrasesBreadcrumbs, "Breadcrumb structured data"),
      ].join("\n"),
    })
  );
}

console.log(`Generated ${PAGES.length * 3} localized SEO landing pages.`);
