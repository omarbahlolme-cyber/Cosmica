const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FRONTEND = path.join(ROOT, "frontend");
const SITE_ORIGIN = "https://www.cosmicalearn.com";

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const writeFile = (fileName, content) =>
  fs.writeFileSync(path.join(FRONTEND, fileName), content, "utf8");
const pageUrl = (fileName) => (fileName === "index.html" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/${fileName}`);

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

const pronunciationPageFile = (key) => `${key}-pronunciation-guide.html`;

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
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Cosmica" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${SITE_ORIGIN}/${escapeHtml(canonicalPath)}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <link rel="preload" as="style" href="style.css?v=20260331" />
    <link rel="stylesheet" href="style.css?v=20260331" />
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
            <span class="account-trigger-caret" aria-hidden="true">▾</span>
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
    <script src="app.js?v=20260410" defer></script>
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
    title: `${ENGLISH_LANGUAGE_NAMES[config.languageKey]} pronunciation guide`,
  },
  {
    href: config.worldFile,
    title: config.backLabel,
  }
)}`;

const PAGES = [
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
];

for (const config of PAGES) {
  const breadcrumbs = breadcrumbSchema([
    { name: "Cosmica", url: `${SITE_ORIGIN}/` },
    { name: config.h1, url: pageUrl(config.file) },
  ]);

  writeFile(
    config.file,
    pageShell({
      htmlLang: config.htmlLang,
      dir: config.dir,
      title: config.title,
      description: config.description,
      canonicalPath: config.file,
      brandSub: config.brandSub,
      backHref: config.backHref,
      backLabel: config.backLabel,
      footerText: config.footerText,
      content: buildContent(config),
      extraStructuredData: [
        jsonLdScript(courseSchema(config), "Course structured data"),
        jsonLdScript(breadcrumbs, "Breadcrumb structured data"),
      ].join("\n"),
    })
  );
}

console.log(`Generated ${PAGES.length} localized SEO landing pages.`);
