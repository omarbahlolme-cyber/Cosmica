const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");

const LOCALIZED_PAGE_OVERRIDES = Object.freeze({
  "learn-arabic-online-ar.html": {
    title: "تعلم العربية عبر الإنترنت | المفردات والعبارات والقواعد | Cosmica",
    description: "تعلم العربية عبر الإنترنت من خلال دروس منظمة في الحروف والمفردات والعبارات والقواعد.",
    brandSub: "دليل بالعربية",
    backLabel: "العودة إلى دورة العربية",
    footerText: "تعلم منظم للغات بخطوات واضحة.",
    eyebrow: "العربية عبر الإنترنت",
    h1: "تعلم العربية عبر الإنترنت",
    lede: "ابدأ من الأساسيات ثم انتقل إلى القواعد الأكثر تقدماً مع الصوت والترجمة ومسار واضح يدعم القراءة والاستماع والتحدث.",
    lessonsTitle: "دروس عربية مقترحة",
    lessonCards: [
      { title: "الحروف والأصوات", text: "ابنِ أساس القراءة والنطق بطريقة واضحة." },
      { title: "المفردات العربية", text: "وسع حصيلتك من الكلمات الشائعة قبل الانتقال إلى العبارات." },
      { title: "العبارات العربية", text: "تدرّب على التحيات والطلبات والمواقف اليومية." },
      { title: "قواعد العربية", text: "طوّر بناء الجملة ودقة التعبير الشفهي والكتابي." },
    ],
  },
  "learn-chinese-online-zh.html": {
    title: "在线学习中文 | 词汇、短语与语法 | Cosmica",
    description: "通过结构清晰的课程在线学习中文，练习汉字、词汇、常用短语和语法。",
    brandSub: "中文指南",
    backLabel: "返回中文课程",
    footerText: "按清晰步骤系统学习语言。",
    eyebrow: "在线中文课程",
    h1: "在线学习中文",
    lede: "从基础汉字到更深入的语法，配合音频、翻译和清晰学习路径，提升阅读、听力和口语能力。",
    lessonsTitle: "推荐的中文学习内容",
    lessonCards: [
      { title: "汉字与发音", text: "打好识字、语音和朗读基础。" },
      { title: "中文词汇", text: "积累常用词汇，再逐步过渡到更长表达。" },
      { title: "常用中文短语", text: "练习问候、请求和日常情境表达。" },
      { title: "中文语法", text: "提升句子结构和表达准确度。" },
    ],
  },
  "learn-japanese-online-ja.html": {
    title: "オンラインで日本語を学ぶ | 語彙・フレーズ・文法 | Cosmica",
    description: "文字、語彙、フレーズ、文法を順序よく学べるオンライン日本語ガイド。",
    brandSub: "日本語ガイド",
    backLabel: "日本語コースに戻る",
    footerText: "順序立てた学習で着実に語学力を伸ばします。",
    eyebrow: "オンライン日本語",
    h1: "オンラインで日本語を学ぶ",
    lede: "ひらがなから高度な文法まで、音声、翻訳、明確な学習ルートで読み、聞き、話す力を伸ばします。",
    lessonsTitle: "おすすめの日本語レッスン",
    lessonCards: [
      { title: "文字と発音", text: "ひらがな、カタカナ、発音の基礎を固めます。" },
      { title: "日本語の語彙", text: "よく使う単語を増やし、理解を広げます。" },
      { title: "日本語フレーズ", text: "あいさつや依頼など日常的な表現を練習します。" },
      { title: "日本語文法", text: "文の組み立てと表現の正確さを高めます。" },
    ],
  },
  "learn-korean-online-ko.html": {
    title: "온라인으로 한국어 배우기 | 어휘, 표현, 문법 | Cosmica",
    description: "발음, 어휘, 표현, 문법을 체계적으로 익히는 온라인 한국어 가이드입니다.",
    brandSub: "한국어 가이드",
    backLabel: "한국어 코스로 돌아가기",
    footerText: "명확한 단계로 차근차근 언어 실력을 키우세요.",
    eyebrow: "온라인 한국어",
    h1: "온라인으로 한국어 배우기",
    lede: "기초부터 더 높은 수준의 문법까지, 오디오, 번역, 짧은 학습 경로를 따라 읽기, 듣기, 말하기 실력을 균형 있게 키워 보세요.",
    lessonsTitle: "추천 한국어 학습 코스",
    lessonCards: [
      { title: "한글과 발음", text: "읽기와 발음의 기초를 먼저 단단히 다지세요." },
      { title: "한국어 어휘", text: "자주 쓰는 단어를 익혀 표현의 폭을 넓히세요." },
      { title: "한국어 표현", text: "인사, 요청, 일상 상황 표현을 자연스럽게 연습하세요." },
      { title: "한국어 문법", text: "문장 구성과 표현 정확도를 높이세요." },
    ],
  },
  "learn-hindi-online-hi.html": {
    title: "ऑनलाइन हिन्दी सीखें | शब्दावली, वाक्यांश और व्याकरण | Cosmica",
    description: "उच्चारण, शब्दावली, वाक्यांश और व्याकरण के साथ संरचित तरीके से हिन्दी सीखें।",
    brandSub: "हिन्दी गाइड",
    backLabel: "हिन्दी कोर्स पर लौटें",
    footerText: "स्पष्ट अगले चरणों के साथ संरचित भाषा सीखना।",
    eyebrow: "ऑनलाइन हिन्दी",
    h1: "ऑनलाइन हिन्दी सीखें",
    lede: "बुनियाद से शुरू करके उन्नत व्याकरण तक पहुँचें, जहाँ ऑडियो, अनुवाद और स्पष्ट अध्ययन-पथ पढ़ने, सुनने और बोलने को मजबूत करते हैं।",
    lessonsTitle: "सुझाए गए हिन्दी पाठ",
    lessonCards: [
      { title: "अक्षर और उच्चारण", text: "देवनागरी और ध्वनियों की मजबूत नींव बनाइए।" },
      { title: "हिन्दी शब्दावली", text: "सामान्य शब्द सीखें और समझ बढ़ाइए।" },
      { title: "उपयोगी हिन्दी वाक्यांश", text: "अभिवादन, अनुरोध और रोज़मर्रा की स्थितियों का अभ्यास कीजिए।" },
      { title: "हिन्दी व्याकरण", text: "वाक्य रचना और अभिव्यक्ति की शुद्धता बेहतर कीजिए।" },
    ],
  },
  "learn-german-online-de.html": {
    title: "Deutsch online lernen | Wortschatz, Sätze und Grammatik | Cosmica",
    description: "Lernen Sie Deutsch online mit strukturierten Lektionen zu Aussprache, Wortschatz, Sätzen und Grammatik.",
    brandSub: "Leitfaden auf Deutsch",
    backLabel: "Zurück zum Deutschkurs",
    footerText: "Strukturiertes Sprachenlernen mit klaren nächsten Schritten.",
    eyebrow: "Deutsch online",
    h1: "Deutsch online lernen",
    lede: "Gehen Sie von den Grundlagen bis zu fortgeschrittener Grammatik mit Audio, Übersetzungen und klaren Lernpfaden für Lesen, Hören und Sprechen.",
    lessonsTitle: "Empfohlene Deutschlektionen",
    lessonCards: [
      { title: "Alphabet und Aussprache", text: "Stärken Sie die Grundlagen für Lesen und Sprechen." },
      { title: "Deutscher Wortschatz", text: "Bauen Sie wichtige Wörter für den Alltag auf." },
      { title: "Nützliche deutsche Sätze", text: "Üben Sie Begrüßungen, Bitten und Alltagssituationen." },
      { title: "Deutsche Grammatik", text: "Arbeiten Sie an genauerem Satzbau und sichererem Ausdruck." },
    ],
  },
  "learn-portuguese-online-pt.html": {
    title: "Aprender português online | Vocabulário, frases e gramática | Cosmica",
    description: "Aprenda português online com aulas estruturadas de pronúncia, vocabulário, frases e gramática.",
    brandSub: "Guia em português",
    backLabel: "Voltar ao curso de português",
    footerText: "Aprendizagem de línguas com estrutura e próximos passos claros.",
    eyebrow: "Português online",
    h1: "Aprender português online",
    lede: "Avance das bases para estruturas mais complexas com áudio, traduções e percursos curtos para leitura, escuta e fala.",
    lessonsTitle: "Lições recomendadas de português",
    lessonCards: [
      { title: "Letras e pronúncia", text: "Fortaleça a base de leitura e som." },
      { title: "Vocabulário em português", text: "Construa palavras frequentes antes de avançar para expressões maiores." },
      { title: "Frases úteis em português", text: "Pratique cumprimentos, pedidos e situações comuns." },
      { title: "Gramática portuguesa", text: "Melhore a precisão ao falar e escrever." },
    ],
  },
  "learn-swedish-online-sv.html": {
    title: "Lär dig svenska online | Ordförråd, fraser och grammatik | Cosmica",
    description: "Lär dig svenska online med strukturerade lektioner i uttal, ordförråd, fraser och grammatik.",
    brandSub: "Guide på svenska",
    backLabel: "Tillbaka till svenskakursen",
    footerText: "Strukturerat språklärande med tydliga nästa steg.",
    eyebrow: "Svenska online",
    h1: "Lär dig svenska online",
    lede: "Gå från grunderna till mer avancerad grammatik med ljud, översättningar och korta studievägar för läsning, lyssning och tal.",
    lessonsTitle: "Rekommenderade svenskalektioner",
    lessonCards: [
      { title: "Bokstäver och uttal", text: "Stärk grunden för läsning och tal." },
      { title: "Svenskt ordförråd", text: "Bygg upp vanliga ord innan du går vidare till längre uttryck." },
      { title: "Användbara svenska fraser", text: "Öva hälsningar, frågor och vanliga situationer." },
      { title: "Svensk grammatik", text: "Förbättra precisionen i tal och skrift." },
    ],
  },
});

const LANDING_GUIDE_TITLE_OVERRIDES = Object.freeze({
  chinese: "中文指南",
  korean: "한국어 가이드",
  hindi: "हिन्दी गाइड",
});

const LETTERS_PAGE_CONFIGS = Object.freeze([
  {
    file: "frontend/letters-arabic.html",
    hiddenH1: "Learn Arabic Alphabet",
    title: "الحروف العربية",
    intro:
      "This Arabic map builds script recognition through the core alphabet, then expands into the remaining letters used in reading and vocabulary.",
    sectionTitleAttrs: ' style="max-width:100%;width:100%;display:block;"',
    titleAttrs: ' style="direction:rtl;text-align:right;display:block;max-width:100%;margin:0 0 10px auto;"',
    sections: [
      {
        heading: "المستوى 1 من الحروف الأساسية (Core Sequence)",
        note: "ابدأ بهذه الحروف الأساسية بترتيب واضح من الألف حتى الزاي.",
        headingAttrs: ' style="direction:rtl;text-align:right;"',
        noteAttrs: ' style="direction:rtl;text-align:right;"',
        letters: ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز"],
      },
      {
        heading: "المستوى 2 من بقية الحروف (Extended Sequence)",
        note: "تابع مع بقية الحروف، ثم تدرب لاحقًا على أشكالها داخل الكلمات.",
        headingAttrs: ' style="direction:rtl;text-align:right;"',
        noteAttrs: ' style="direction:rtl;text-align:right;"',
        letters: ["س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي"],
      },
    ],
  },
  {
    file: "frontend/letters-chinese.html",
    hiddenH1: "Learn Chinese Characters",
    title: "汉字",
    intro:
      "This Hanzi map builds character recognition through high-utility symbols, moving from core forms into characters used in words and phrases.",
    sections: [
      {
        heading: "Level 1 基础字形 (Foundational Forms)",
        note: "从简单、具体的字形开始，建立字形识别和笔画信心。",
        letters: ["一", "二", "三", "人", "口", "日", "月", "山", "水", "火", "木", "土", "金", "女", "子", "学", "生"],
      },
      {
        heading: "Level 2 自然与核心主题字 (Nature & Core Topic Characters)",
        note: "继续学习常见且实用的具体汉字，它们常见于日常名词和学习场景。",
        letters: ["好", "中", "国", "语", "文", "天", "地", "上", "下", "左", "右", "大", "小", "风", "雨"],
      },
      {
        heading: "Level 3 代词与语法字 (Pronouns & Grammar Characters)",
        note: "把这些字放进最小句框：我是，你是，他/她是，我们有/没有。",
        letters: ["我", "你", "他", "她", "们", "是", "不", "的", "在", "有"],
      },
      {
        heading: "Level 4 动作字 (Action Characters)",
        note: "把动作字加入句型：我来，我去，我吃，我喝，我看，我听。",
        letters: ["这", "那", "个", "来", "去", "吃", "喝", "看", "听", "说", "读", "写"],
      },
      {
        heading: "Level 5 组词与主题扩展 (Phrase-Building & Topic Expansion)",
        note: "把这些字组合成常见词语：学校，老师，朋友，爱书，爱猫，爱狗。",
        letters: ["家", "校", "老", "师", "朋", "友", "爱", "猫", "狗", "车", "书"],
      },
    ],
  },
  {
    file: "frontend/letters-korean.html",
    hiddenH1: "Learn Korean Alphabet",
    title: "한글",
    intro:
      "This Hangul map builds core script recognition through consonants, vowels, and the syllable blocks used in real Korean reading.",
    sections: [
      {
        heading: "Level 1 자음 (Consonants)",
        note: "자음 인식과 된소리 대비를 먼저 익힌 뒤 음절 조합으로 넘어가세요.",
        letters: ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"],
      },
      {
        heading: "Level 2 모음 (Vowels)",
        note: "기본 모음과 복합 모음을 익힌 뒤 가, 너, 교 같은 음절 블록으로 이어 보세요.",
        letters: ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"],
      },
    ],
  },
  {
    file: "frontend/letters-hindi.html",
    hiddenH1: "Learn Hindi Script",
    title: "देवनागरी अक्षर",
    intro:
      "This Devanagari map builds script control through vowels, consonants, matras, signs, and common conjuncts in a practical sequence.",
    sections: [
      {
        heading: "स्वर (Vowels)",
        note: "पहले मूल स्वरों से शुरू करें और हर ध्वनि को साफ़ सुनें।",
        letters: ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "अं", "अः"],
      },
      {
        heading: "व्यंजन (Consonants)",
        note: "व्यंजनों को ध्वनि-परिवारों में पहचानें और उच्चारण के साथ पढ़ें।",
        letters: ["क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह"],
      },
      {
        heading: "नुक्ता वाले अक्षर (Modern Hindi)",
        note: "इन अक्षरों का प्रयोग उर्दू-फ़ारसी मूल के शब्दों में अक्सर मिलता है।",
        letters: ["क़", "ख़", "ग़", "ज़", "ड़", "ढ़", "फ़"],
      },
      {
        heading: "मात्राएँ (Vowel Signs)",
        note: "इन मात्राओं को आधार अक्षरों के साथ जोड़कर पढ़ने का अभ्यास करें।",
        letters: ["ा", "ि", "ी", "ु", "ू", "ृ", "े", "ै", "ो", "ौ", "ं", "ः", "ँ"],
      },
      {
        heading: "संयुक्त अक्षर (Common Conjuncts)",
        note: "इन संयुक्ताक्षरों को बार-बार देखकर शब्द-पहचान तेज़ करें।",
        letters: ["क्ष", "त्र", "ज्ञ", "श्र"],
      },
    ],
  },
]);

const ENHANCED_LETTERS_PAGE_CONFIGS = Object.freeze([
  {
    file: "frontend/letters-arabic.html",
    hiddenH1: "Learn Arabic Script",
    eyebrow: "Script",
    title: "الحروف العربية",
    intro:
      "This Arabic script map starts with the core alphabet, then adds joining behavior, non-joining letters, and short-vowel reading so the script works inside real words.",
    studyPanels: [
      {
        kicker: "Decode",
        title: "Read in connected word chunks",
        points: [
          "Arabic runs from right to left, so begin at the far-right edge of the word.",
          "Track the baseline first, then use the dots to confirm which letter family you are seeing.",
          "Pause only when a non-joining letter like \u062f or \u0648 breaks the chain.",
        ],
      },
      {
        kicker: "Vowels",
        title: "Build vowels after the consonant frame",
        points: [
          "Spot the consonants first, then add fat\u1e25a, kasra, or \u1e0damma to hear the short vowel.",
          "Long vowels stretch with \u0627, \u064a, or \u0648 after the consonant pattern.",
          "Practice minimal contrasts in one burst: \u0628\u064e / \u0628\u0650 / \u0628\u064f, then \u0628\u0627 / \u0628\u064a / \u0628\u0648.",
        ],
      },
      {
        kicker: "Write",
        title: "Trace the base shape before the dots",
        points: [
          "Write the connected line first, then add dots last so similar families stay grouped in memory.",
          "Repeat isolated, initial, medial, and final forms as one family instead of four separate symbols.",
          "After writing a short word once, read the whole word aloud without spelling each letter separately.",
        ],
      },
    ],
    sectionTitleAttrs: ' style="max-width:100%;width:100%;display:block;"',
    titleAttrs: ' style="direction:rtl;text-align:right;display:block;max-width:100%;margin:0 0 10px auto;"',
    sections: [
      {
        heading: "المستوى 1 من الحروف الأساسية (Core Sequence)",
        note: "ابدأ بهذه الحروف الأساسية بترتيب واضح من الألف حتى الزاي.",
        headingAttrs: ' style="direction:rtl;text-align:right;"',
        noteAttrs: ' style="direction:rtl;text-align:right;"',
        cards: ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز"],
      },
      {
        heading: "المستوى 2 من بقية الحروف (Extended Sequence)",
        note: "تابع مع بقية الحروف الشائعة ثم ارجع إليها داخل كلمات قصيرة.",
        headingAttrs: ' style="direction:rtl;text-align:right;"',
        noteAttrs: ' style="direction:rtl;text-align:right;"',
        cards: ["س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي"],
      },
      {
        heading: "المستوى 3 من أشكال الوصل (Joining Shapes)",
        note: "لاحظ كيف يتغير شكل بعض الحروف في أول الكلمة ووسطها وآخرها.",
        headingAttrs: ' style="direction:rtl;text-align:right;"',
        noteAttrs: ' style="direction:rtl;text-align:right;"',
        cards: [
          { text: "بـ", caption: "initial form" },
          { text: "ـبـ", caption: "middle form" },
          { text: "ـب", caption: "final form" },
          { text: "نـ", caption: "initial form" },
          { text: "ـنـ", caption: "middle form" },
          { text: "ـن", caption: "final form" },
          { text: "مـ", caption: "initial form" },
          { text: "ـمـ", caption: "middle form" },
          { text: "ـم", caption: "final form" },
          { text: "يـ", caption: "initial form" },
          { text: "ـيـ", caption: "middle form" },
          { text: "ـي", caption: "final form" },
        ],
      },
      {
        heading: "المستوى 4 من الحروف غير الواصلة لليسار (Non-Joining Letters)",
        note: "هذه الحروف لا تتصل بما بعدها من الجهة اليسرى، لذلك تقطع شكل الكلمة.",
        headingAttrs: ' style="direction:rtl;text-align:right;"',
        noteAttrs: ' style="direction:rtl;text-align:right;"',
        cards: [
          { text: "د", caption: "stops the join" },
          { text: "ذ", caption: "stops the join" },
          { text: "ر", caption: "stops the join" },
          { text: "ز", caption: "stops the join" },
          { text: "و", caption: "stops the join" },
        ],
      },
      {
        heading: "المستوى 5 من الحركات القصيرة والطويلة (Vowel Patterns)",
        note: "درّب أذنك وعينك على الفتحة والكسرة والضمة ثم على المدود الطويلة.",
        headingAttrs: ' style="direction:rtl;text-align:right;"',
        noteAttrs: ' style="direction:rtl;text-align:right;"',
        cards: ["بَ", "بِ", "بُ", "با", "بي", "بو"],
      },
    ],
  },
  {
    file: "frontend/letters-chinese.html",
    hiddenH1: "Learn Chinese Characters",
    eyebrow: "Characters",
    title: "汉字",
    intro:
      "This Hanzi map moves from simple visual forms into sentence-ready characters and full characters built from reusable components.",
    sections: [
      {
        heading: "Level 1 基础字形 (Foundational Forms)",
        note: "从简单、具体的字形开始，先稳住视觉识别和笔画方向感。",
        cards: ["一", "二", "三", "人", "口", "日", "月", "山", "水", "火", "木", "土", "金", "女", "子", "学", "生"],
      },
      {
        heading: "Level 2 自然与核心主题字 (Nature & Core Topic Characters)",
        note: "继续学习常见又高频的具体汉字，它们常常先进入名词和主题词。",
        cards: ["好", "中", "国", "语", "文", "天", "地", "上", "下", "左", "右", "大", "小", "风", "雨"],
      },
      {
        heading: "Level 3 代词与语法字 (Pronouns & Grammar Characters)",
        note: "把这些字放进最小句框：我是，你是，他/她是，我们有/没有。",
        cards: ["我", "你", "他", "她", "们", "是", "不", "的", "在", "有"],
      },
      {
        heading: "Level 4 动作字 (Action Characters)",
        note: "把动作字放进短句里练：我来，我去，我吃，我喝，我看，我听。",
        cards: ["这", "那", "个", "来", "去", "吃", "喝", "看", "听", "说", "读", "写"],
      },
      {
        heading: "Level 5 组词与主题扩展 (Phrase-Building & Topic Expansion)",
        note: "把这些字组合成常见词语：学校，老师，朋友，爱书，爱猫，爱狗。",
        cards: ["家", "校", "老", "师", "朋", "友", "爱", "猫", "狗", "车", "书"],
      },
      {
        heading: "Level 6 部件组合 (Components Inside Full Characters)",
        note: "观察熟悉的部件如何组合成完整汉字：好 = 女 + 子，休 = 亻 + 木，明 = 日 + 月。",
        cards: [
          { text: "好", caption: "女 + 子" },
          { text: "休", caption: "亻 + 木" },
          { text: "明", caption: "日 + 月" },
          { text: "林", caption: "木 + 木" },
          { text: "问", caption: "门 + 口" },
          { text: "男", caption: "田 + 力" },
        ],
      },
    ],
  },
  {
    file: "frontend/letters-japanese.html",
    hiddenH1: "Learn Japanese Kana",
    eyebrow: "Kana",
    title: "日本語かな",
    intro:
      "This foundation map starts with the core hiragana and katakana charts, then adds voiced sounds, contracted sounds, and the small っ / ッ cue used in real reading.",
    groups: [
      {
        className: "letters-script-group letters-script-group-hiragana",
        sections: [
          {
            heading: "ひらがな 基本 (Core Kana)",
            note: "Start with the five vowels, then read each consonant row aloud until the chart feels automatic.",
            cards: ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と", "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ", "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り", "る", "れ", "ろ", "わ", "を", "ん"],
          },
          {
            heading: "ひらがな 濁音・半濁音 (Voiced Kana)",
            note: "Add dakuten and handakuten so you can hear the difference between か/が, さ/ざ, and は/ぱ style pairs.",
            cards: ["が", "ぎ", "ぐ", "げ", "ご", "ざ", "じ", "ず", "ぜ", "ぞ", "だ", "ぢ", "づ", "で", "ど", "ば", "び", "ぶ", "べ", "ぼ", "ぱ", "ぴ", "ぷ", "ぺ", "ぽ"],
          },
          {
            heading: "ひらがな 拗音・促音 (Contracted Sounds)",
            note: "Read these as one beat: きゃ, しゅ, and ちょ blend with small ゃ/ゅ/ょ, while っ signals a doubled consonant.",
            cards: ["きゃ", "きゅ", "きょ", "しゃ", "しゅ", "しょ", "ちゃ", "ちゅ", "ちょ", "にゃ", "にゅ", "にょ", "りゃ", "りゅ", "りょ", "っ"],
          },
        ],
      },
      {
        className: "letters-script-group letters-script-group-katakana",
        sections: [
          {
            heading: "カタカナ 基本 (Core Kana)",
            note: "Use the same row logic again in katakana so names and loanwords become readable faster.",
            cards: ["ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ", "サ", "シ", "ス", "セ", "ソ", "タ", "チ", "ツ", "テ", "ト", "ナ", "ニ", "ヌ", "ネ", "ノ", "ハ", "ヒ", "フ", "ヘ", "ホ", "マ", "ミ", "ム", "メ", "モ", "ヤ", "ユ", "ヨ", "ラ", "リ", "ル", "レ", "ロ", "ワ", "ヲ", "ン"],
          },
          {
            heading: "カタカナ 濁音・半濁音 (Voiced Kana)",
            note: "These marks drive many common loanword sounds such as ガ, ズ, ベ, and ポ.",
            cards: ["ガ", "ギ", "グ", "ゲ", "ゴ", "ザ", "ジ", "ズ", "ゼ", "ゾ", "ダ", "ヂ", "ヅ", "デ", "ド", "バ", "ビ", "ブ", "ベ", "ボ", "パ", "ピ", "プ", "ペ", "ポ"],
          },
          {
            heading: "カタカナ 拗音・促音 (Contracted Sounds)",
            note: "Practice small ャ/ュ/ョ combinations and the small ッ that marks a doubled consonant in many borrowed words.",
            cards: ["キャ", "キュ", "キョ", "シュ", "ショ", "チャ", "チュ", "チョ", "ニャ", "ニュ", "ニョ", "リャ", "リュ", "リョ", "ッ", "ファ", "ティ"],
          },
        ],
      },
    ],
  },
  {
    file: "frontend/letters-korean.html",
    hiddenH1: "Learn Korean Script",
    eyebrow: "Script",
    title: "한글",
    intro:
      "This Hangul map starts with consonants and vowels, then switches to full syllable blocks so reading happens one block at a time.",
    sections: [
      {
        heading: "Level 1 자음 (Consonants)",
        note: "자음 인식과 된소리 대비를 먼저 익힌 뒤 음절 조합으로 넘어가세요.",
        cards: ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"],
      },
      {
        heading: "Level 2 모음 (Vowels)",
        note: "기본 모음과 복합 모음을 익힌 뒤 가, 거, 교 같은 음절 블록으로 이어 보세요.",
        cards: ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"],
      },
      {
        heading: "Level 3 음절 블록 (Syllable Blocks)",
        note: "자모를 하나씩 읽지 말고, 한 블록을 한 번에 읽는 습관을 들이세요.",
        cards: [
          { text: "가", caption: "ㄱ + ㅏ" },
          { text: "거", caption: "ㄱ + ㅓ" },
          { text: "교", caption: "ㄱ + ㅛ" },
          { text: "나", caption: "ㄴ + ㅏ" },
          { text: "누", caption: "ㄴ + ㅜ" },
          { text: "다", caption: "ㄷ + ㅏ" },
          { text: "바", caption: "ㅂ + ㅏ" },
          { text: "사", caption: "ㅅ + ㅏ" },
          { text: "각", caption: "ㄱ + ㅏ + ㄱ" },
          { text: "강", caption: "ㄱ + ㅏ + ㅇ" },
          { text: "한", caption: "ㅎ + ㅏ + ㄴ" },
          { text: "글", caption: "ㄱ + ㅡ + ㄹ" },
        ],
      },
    ],
  },
  {
    file: "frontend/letters-hindi.html",
    hiddenH1: "Learn Hindi Script",
    eyebrow: "Script",
    title: "देवनागरी अक्षर",
    intro:
      "This Devanagari map moves from vowels and consonants into matras, akshara building, and common conjuncts so you read full sound units instead of isolated symbols.",
    sections: [
      {
        heading: "स्वर (Vowels)",
        note: "पहले मूल स्वरों से शुरू करें और हर ध्वनि को साफ़ सुनें।",
        cards: ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "अं", "अः"],
      },
      {
        heading: "व्यंजन (Consonants)",
        note: "व्यंजनों को ध्वनि-परिवारों में पहचानें और उच्चारण के साथ पढ़ें।",
        cards: ["क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह"],
      },
      {
        heading: "नुक्ता वाले अक्षर (Modern Hindi)",
        note: "इन अक्षरों का प्रयोग उर्दू-फ़ारसी मूल के शब्दों में अक्सर मिलता है।",
        cards: ["क़", "ख़", "ग़", "ज़", "ड़", "ढ़", "फ़"],
      },
      {
        heading: "मात्राएँ (Vowel Signs)",
        note: "इन मात्राओं को आधार अक्षरों के साथ जोड़कर पढ़ने का अभ्यास करें।",
        cards: ["ा", "ि", "ी", "ु", "ू", "ृ", "े", "ै", "ो", "ौ", "ं", "ः", "ँ"],
      },
      {
        heading: "अक्षर बनाना (Akshara Building)",
        note: "एक ही व्यंजन के साथ अलग-अलग मात्राएँ जोड़कर पढ़ें: क, का, कि, की, कु, के, को, और halant वाला क्।",
        cards: ["क", "का", "कि", "की", "कु", "के", "को", "क्"],
      },
      {
        heading: "संयुक्त अक्षर (Common Conjuncts)",
        note: "इन संयुक्ताक्षरों को बार-बार देखकर शब्द-पहचान तेज़ करें।",
        cards: ["क्ष", "त्र", "ज्ञ", "श्र"],
      },
    ],
  },
]);

const getEnhancedLettersPageConfig = (filePath) =>
  ENHANCED_LETTERS_PAGE_CONFIGS.find((config) => config.file === filePath);

const applyLettersPedagogyEnhancements = () => {
  const arabic = getEnhancedLettersPageConfig("frontend/letters-arabic.html");
  if (arabic) {
    arabic.studyPanels = [
      {
        kicker: "Decode",
        title: "Read in connected word chunks",
        points: [
          "Arabic runs from right to left, so begin at the far-right edge of the word.",
          "Track the baseline first, then use the dots to confirm which letter family you are seeing.",
          "Pause only when a non-joining letter like \u062f or \u0648 breaks the chain.",
        ],
      },
      {
        kicker: "Vowels",
        title: "Build vowels after the consonant frame",
        points: [
          "Spot the consonants first, then add fat\u1e25a, kasra, or \u1e0damma to hear the short vowel.",
          "Long vowels stretch with \u0627, \u064a, or \u0648 after the consonant pattern.",
          "Practice minimal contrasts in one burst: \u0628\u064e / \u0628\u0650 / \u0628\u064f, then \u0628\u0627 / \u0628\u064a / \u0628\u0648.",
        ],
      },
      {
        kicker: "Write",
        title: "Trace the base shape before the dots",
        points: [
          "Write the connected line first, then add dots last so similar families stay grouped in memory.",
          "Repeat isolated, initial, medial, and final forms as one family instead of four separate symbols.",
          "After writing a short word once, read the whole word aloud without spelling each letter separately.",
        ],
      },
    ];
    arabic.sections[2].cards = [
      { text: "\u0628\u0640", caption: "initial form", speak: "\u0628" },
      { text: "\u0640\u0628\u0640", caption: "middle form", audio: false },
      { text: "\u0640\u0628", caption: "final form", audio: false },
      { text: "\u0646\u0640", caption: "initial form", speak: "\u0646" },
      { text: "\u0640\u0646\u0640", caption: "middle form", audio: false },
      { text: "\u0640\u0646", caption: "final form", audio: false },
      { text: "\u0645\u0640", caption: "initial form", speak: "\u0645" },
      { text: "\u0640\u0645\u0640", caption: "middle form", audio: false },
      { text: "\u0640\u0645", caption: "final form", audio: false },
      { text: "\u064a\u0640", caption: "initial form", speak: "\u064a" },
      { text: "\u0640\u064a\u0640", caption: "middle form", audio: false },
      { text: "\u0640\u064a", caption: "final form", audio: false },
    ];
    arabic.sections[4].cards = [
      { text: "\u0628\u064e", caption: "ba - short a", speak: "\u0628\u064e" },
      { text: "\u0628\u0650", caption: "bi - short i", speak: "\u0628\u0650" },
      { text: "\u0628\u064f", caption: "bu - short u", speak: "\u0628\u064f" },
      { text: "\u0628\u0627", caption: "baa - long a", speak: "\u0628\u0627" },
      { text: "\u0628\u064a", caption: "bii - long i", speak: "\u0628\u064a" },
      { text: "\u0628\u0648", caption: "buu - long u", speak: "\u0628\u0648" },
    ];
    arabic.sections.push({
      heading: "\u0627\u0644\u0645\u0633\u062a\u0648\u0649 6 \u0645\u0646 \u0642\u0631\u0627\u0621\u0629 \u0643\u0644\u0645\u0627\u062a \u0642\u0635\u064a\u0631\u0629 (Word Decoding)",
      note: "Move from isolated shapes into short connected words and read each item in one breath.",
      headingAttrs: ' style="direction:rtl;text-align:right;"',
      noteAttrs: ' style="direction:rtl;text-align:right;"',
      cards: [
        { text: "\u0628\u0627\u0628", caption: "b + long a + b", speak: "\u0628\u0627\u0628" },
        { text: "\u0628\u064a\u062a", caption: "b + long i + t", speak: "\u0628\u064a\u062a" },
        { text: "\u0646\u0648\u0631", caption: "n + long u + r", speak: "\u0646\u0648\u0631" },
        { text: "\u064a\u0648\u0645", caption: "y + long u + m", speak: "\u064a\u0648\u0645" },
        { text: "\u062f\u0631\u0633", caption: "watch \u062f stop the join", speak: "\u062f\u0631\u0633" },
        { text: "\u0643\u062a\u0627\u0628", caption: "k + t + long a + b", speak: "\u0643\u062a\u0627\u0628" },
      ],
    });
  }

  const chinese = getEnhancedLettersPageConfig("frontend/letters-chinese.html");
  if (chinese) {
    chinese.studyPanels = [
      {
        kicker: "Write",
        title: "Use stroke order, not random drawing",
        points: [
          "Practice top to bottom, left to right, and outside before inside until the motion feels automatic.",
          "Finish one clean square before speeding up, because stroke order stabilizes recognition.",
          "Say the syllable aloud as you write so the sound and shape lock together.",
        ],
      },
      {
        kicker: "Decode",
        title: "Read whole characters first",
        points: [
          "Each square is a full syllable and meaning unit, so do not read Hanzi like alphabet letters.",
          "Scan the whole character shape first, then notice the smaller parts inside it.",
          "Move quickly from one character to two-character words so recognition becomes usable in context.",
        ],
      },
      {
        kicker: "Components",
        title: "Reuse radicals and familiar parts",
        points: [
          "Look for semantic clues like \u5973, \u6c35, or \u4ebb and link them to families of meaning.",
          "Look for sound-bearing parts when a component repeats across related characters.",
          "After spotting the parts, return to the whole character so the page teaches reading, not disassembly only.",
        ],
      },
    ];
    chinese.sections.push({
      heading: "\u7b2c 7 \u7ea7 \u5b57\u5230\u8bcd\u7684\u9605\u8bfb (Character-to-Word Reading)",
      note: "Move from single-character recognition into short, high-frequency word chunks that learners can actually read.",
      cards: [
        { text: "\u4f60\u597d", caption: "\u4f60 + \u597d" },
        { text: "\u4e2d\u6587", caption: "\u4e2d + \u6587" },
        { text: "\u5b66\u751f", caption: "\u5b66 + \u751f" },
        { text: "\u670b\u53cb", caption: "\u670b + \u53cb" },
        { text: "\u660e\u5929", caption: "\u660e + \u5929" },
        { text: "\u559d\u6c34", caption: "\u559d + \u6c34" },
      ],
    });
  }

  const japanese = getEnhancedLettersPageConfig("frontend/letters-japanese.html");
  if (japanese) {
    japanese.studyPanels = [
      {
        kicker: "Write",
        title: "Trace vowels and rows before speed",
        points: [
          "Write \u3042\u3044\u3046\u3048\u304a first, then rebuild each consonant row until the pattern feels automatic.",
          "Keep the kana shape smooth and balanced before trying to write quickly.",
          "Read each row aloud as a rhythm unit instead of isolated symbols with long pauses.",
        ],
      },
      {
        kicker: "Rhythm",
        title: "Read small ya, yu, yo and small tsu as one beat",
        points: [
          "A small \u3083/\u3085/\u3087 joins the kana before it, so \u304d\u3083 is one sound chunk, not two separate beats.",
          "A small \u3063 or \u30c3 marks a doubled consonant and creates a short stop before the next kana.",
          "Practice chunking first, then add pitch and speed after the rhythm is stable.",
        ],
      },
      {
        kicker: "Decode",
        title: "Move quickly from charts to real reading chunks",
        points: [
          "Use the chart only as a launchpad, then practice words with yoon, small tsu, and long vowels.",
          "Read hiragana in whole rhythm groups like \u304d\u3087\u3046 and \u304c\u3063\u3053\u3046.",
          "Read katakana in loanword chunks like \u30b3\u30fc\u30d2\u30fc and \u30c1\u30b1\u30c3\u30c8.",
        ],
      },
    ];
    japanese.groups.push({
      className: "letters-script-group letters-script-group-reading",
      sections: [
        {
          heading: "\u3072\u3089\u304c\u306a \u8aad\u307f\u306e\u6d41\u308c (Reading Flow)",
          note: "Move from the chart into common rhythm chunks so yoon, small tsu, and long vowels work inside real reading.",
          cards: [
            { text: "\u304d\u3087\u3046", caption: "\u304d\u3087 + \u3046" },
            { text: "\u304c\u3063\u3053\u3046", caption: "\u304c + \u3063 + \u3053\u3046" },
            { text: "\u3057\u3085\u304f\u3060\u3044", caption: "\u3057\u3085 + \u304f + \u3060 + \u3044" },
            { text: "\u3053\u3093\u306b\u3061\u306f", caption: "\u3053 + \u3093 + \u306b + \u3061 + \u306f" },
          ],
        },
        {
          heading: "\u30ab\u30bf\u30ab\u30ca \u8aad\u307f\u306e\u6d41\u308c (Loanword Flow)",
          note: "Practice long vowels, doubled consonants, and chunking inside common katakana words.",
          cards: [
            { text: "\u30b3\u30fc\u30d2\u30fc", caption: "\u30b3\u30fc + \u30d2\u30fc" },
            { text: "\u30c1\u30b1\u30c3\u30c8", caption: "\u30c1 + \u30b1 + \u30c3 + \u30c8" },
            { text: "\u30cb\u30e5\u30fc\u30b9", caption: "\u30cb\u30e5\u30fc + \u30b9" },
            { text: "\u30b9\u30fc\u30d1\u30fc", caption: "\u30b9\u30fc + \u30d1\u30fc" },
          ],
        },
      ],
    });
  }

  const korean = getEnhancedLettersPageConfig("frontend/letters-korean.html");
  if (korean) {
    korean.studyPanels = [
      {
        kicker: "Build",
        title: "Assemble one block at a time",
        points: [
          "Start with the initial consonant, add the vowel shape, then check whether a final consonant sits at the bottom.",
          "Read the whole square as one syllable block instead of sounding out each jamo separately.",
          "Keep practicing left-right and top-bottom layouts until the block patterns feel automatic.",
        ],
      },
      {
        kicker: "Batchim",
        title: "Watch for final consonants at the bottom",
        points: [
          "When a consonant drops under the vowel, it becomes batchim and closes the syllable.",
          "Train your eye to scan top shape first, then bottom shape, in one quick movement.",
          "Practice pairs like \uac00 / \uac01 and \ub098 / \ub0a8 so open and closed syllables stay distinct.",
        ],
      },
      {
        kicker: "Write",
        title: "Write inside the square, not in a line",
        points: [
          "Hangul letters stack into a block, so keep the whole syllable visually balanced inside one square.",
          "Trace a few clean blocks slowly before trying longer words.",
          "After writing a block, read it aloud immediately so structure and sound reinforce each other.",
        ],
      },
    ];
    korean.sections.push(
      {
        heading: "\ub808\ubca8 4 \ubc1b\uce68 (Final Consonants)",
        note: "Add bottom consonants so learners can see how open blocks turn into closed blocks in real reading.",
        cards: [
          { text: "\ub0a8", caption: "\u3134 + \u314f + \u3141" },
          { text: "\uac04", caption: "\u3131 + \u314f + \u3134" },
          { text: "\ubc24", caption: "\u3142 + \u314f + \u3141" },
          { text: "\uc9d1", caption: "\u3148 + \u3163 + \u3142" },
          { text: "\ubb38", caption: "\u3141 + \u315c + \u3134" },
          { text: "\ub2ec", caption: "\u3137 + \u314f + \u3139" },
        ],
      },
      {
        heading: "\ub808\ubca8 5 \uc77d\uae30 \uc0ac\ub2e4\ub9ac (Reading Ladder)",
        note: "Climb from single blocks into short everyday words while keeping the block-by-block reading habit.",
        cards: [
          { text: "\ud55c\uae00", caption: "\ud55c + \uae00" },
          { text: "\ud55c\uad6d", caption: "\ud55c + \uad6d" },
          { text: "\ud559\uad50", caption: "\ud559 + \uad50" },
          { text: "\uc0ac\ub78c", caption: "\uc0ac + \ub78c" },
          { text: "\uac10\uc0ac", caption: "\uac10 + \uc0ac" },
        ],
      }
    );
  }

  const hindi = getEnhancedLettersPageConfig("frontend/letters-hindi.html");
  if (hindi) {
    hindi.studyPanels = [
      {
        kicker: "Decode",
        title: "Read the headline as one word line",
        points: [
          "The top bar links letters visually across the word, so train your eye to scan full aksharas under one headline.",
          "Do not read Devanagari as loose alphabet pieces; read one consonant-vowel unit at a time.",
          "After spotting each akshara, blend them straight into the word without long pauses.",
        ],
      },
      {
        kicker: "Matras",
        title: "Matras can move, but the sound stays with one akshara",
        points: [
          "A matra may sit before, after, above, or below the consonant, but it still belongs to the same sound unit.",
          "Practice \u0915, \u0915\u093e, \u0915\u093f, \u0915\u0940, \u0915\u0941, and \u0915\u094b as one family.",
          "Remember that \u093f is written before the consonant shape but pronounced after k.",
        ],
      },
      {
        kicker: "Halant",
        title: "Use halant to stop the inherent a",
        points: [
          "A bare consonant usually carries an inherent a sound until a matra or halant changes it.",
          "The halant removes that vowel and helps create conjunct clusters like \u0915\u094d\u0937 and \u0924\u094d\u0930.",
          "Write the full akshara slowly first, then read the cluster in one breath.",
        ],
      },
    ];
    hindi.sections[4].cards = [
      { text: "\u0915", caption: "inherent a" },
      { text: "\u0915\u093e", caption: "\u093e adds aa after the consonant" },
      { text: "\u0915\u093f", caption: "\u093f is written before, read after k" },
      { text: "\u0915\u0940", caption: "\u0940 adds long ii" },
      { text: "\u0915\u0941", caption: "\u0941 sits below for short u" },
      { text: "\u0915\u0947", caption: "\u0947 adds e" },
      { text: "\u0915\u094b", caption: "\u094b adds o" },
      { text: "\u0915\u094d", caption: "halant removes the final a" },
    ];
    hindi.sections.push({
      heading: "\u092a\u0922\u093c\u0928\u0947 \u0915\u0940 \u0938\u0940\u0922\u093c\u0940 (Reading Ladder)",
      note: "Move from single aksharas into short everyday words so matras and conjuncts become readable in context.",
      cards: [
        { text: "\u0926\u093f\u0928", caption: "\u0926\u093f + \u0928" },
        { text: "\u0915\u093e\u092e", caption: "\u0915\u093e + \u092e" },
        { text: "\u0918\u0930", caption: "\u0918 + \u0930" },
        { text: "\u0916\u0947\u0932", caption: "\u0916\u0947 + \u0932" },
        { text: "\u092d\u093e\u0930\u0924", caption: "\u092d\u093e + \u0930 + \u0924" },
        { text: "\u092a\u094d\u0930\u0947\u092e", caption: "\u092a\u094d\u0930\u0947 + \u092e" },
      ],
    });
  }
};

applyLettersPedagogyEnhancements();

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const findLiteralRange = (source, constName) => {
  const marker = `const ${constName} =`;
  const startIndex = source.indexOf(marker);
  if (startIndex < 0) {
    throw new Error(`Missing constant ${constName}`);
  }

  let cursor = source.indexOf("=", startIndex) + 1;
  while (cursor < source.length && /\s/.test(source[cursor])) {
    cursor += 1;
  }

  while (cursor < source.length && !["[", "{"].includes(source[cursor])) {
    cursor += 1;
  }

  const openChar = source[cursor];
  const closeChar = openChar === "[" ? "]" : "}";
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
        return { start: cursor, end: index + 1 };
      }
    }
  }

  throw new Error(`Unterminated literal for ${constName}`);
};

const rewriteLiteral = (relativePath, constName, transform) => {
  const filePath = path.join(ROOT, relativePath);
  let source = fs.readFileSync(filePath, "utf8");
  const { start, end } = findLiteralRange(source, constName);
  const literal = source.slice(start, end);
  const parsed = vm.runInNewContext(`(${literal})`);
  const nextValue = transform(parsed);
  const replacement = JSON.stringify(nextValue, null, 2);
  if (replacement === literal) {
    return false;
  }
  source = `${source.slice(0, start)}${replacement}${source.slice(end)}`;
  fs.writeFileSync(filePath, `${source}\n`, "utf8");
  return true;
};

const rewriteLocalizedPages = () =>
  rewriteLiteral("scripts/generate-localized-seo-pages.js", "PAGES", (pages) =>
    pages.map((page) =>
      LOCALIZED_PAGE_OVERRIDES[page.file] ? { ...page, ...LOCALIZED_PAGE_OVERRIDES[page.file] } : page
    )
  );

const rewriteLandingGuideTitles = () =>
  rewriteLiteral("scripts/generate-seo-landing-pages.js", "LANGUAGES", (languages) =>
    languages.map((language) =>
      LANDING_GUIDE_TITLE_OVERRIDES[language.key]
        ? { ...language, localizedGuideTitle: LANDING_GUIDE_TITLE_OVERRIDES[language.key] }
        : language
    )
  );

const normalizeIndexPage = () => {
  const filePath = path.join(ROOT, "frontend", "index.html");
  const original = fs.readFileSync(filePath, "utf8");
  let next = original;

  next = next.replace(
    /(<span class="account-trigger-caret" aria-hidden="true">)[\s\S]*?(<\/span>)/i,
    "$1&#9662;$2"
  );
  next = next.replace(
    /<p class="world-native-name" lang="ar" dir="rtl">[\s\S]*?<\/p>/,
    '<p class="world-native-name" lang="ar" dir="rtl">العربية</p>'
  );
  next = next.replace(
    /<p class="world-native-name" lang="zh">[\s\S]*?<\/p>/,
    '<p class="world-native-name" lang="zh">中文</p>'
  );
  next = next.replace(
    /<p class="world-native-name" lang="ja">[\s\S]*?<\/p>/,
    '<p class="world-native-name" lang="ja">日本語</p>'
  );
  next = next.replace(
    /<p class="world-native-name" lang="ko">[\s\S]*?<\/p>/,
    '<p class="world-native-name" lang="ko">한국어</p>'
  );
  next = next.replace(
    /<p class="world-native-name" lang="hi">[\s\S]*?<\/p>/,
    '<p class="world-native-name" lang="hi">हिन्दी</p>'
  );

  if (next === original) {
    return false;
  }

  fs.writeFileSync(filePath, next, "utf8");
  return true;
};

const normalizeLetterCard = (card) => {
  if (typeof card === "string") {
    return {
      text: card,
      speak: card,
      audioEnabled: true,
      caption: "",
      className: "",
      cardAttrs: "",
      letterAttrs: "",
      captionAttrs: "",
    };
  }
  const text = String(card?.text ?? card?.letter ?? "").trim();
  const speak = String(card?.speak ?? text).trim();
  return {
    text,
    speak: speak || text,
    audioEnabled: card?.audio !== false,
    caption: String(card?.caption || "").trim(),
    className: String(card?.className || "").trim(),
    cardAttrs: String(card?.cardAttrs || "").trim(),
    letterAttrs: String(card?.letterAttrs || "").trim(),
    captionAttrs: String(card?.captionAttrs || "").trim(),
  };
};

const renderLetterCard = (cardValue) => {
  const card = normalizeLetterCard(cardValue);
  const cardClassName = ["card", "letter-card", card.className].filter(Boolean).join(" ");
  const speechDisabledAttr = card.audioEnabled ? "" : ' data-speech-disabled="true"';
  const cardAttrs = `${speechDisabledAttr}${card.cardAttrs ? ` ${card.cardAttrs.replace(/^\s+/, "")}` : ""}`;
  const letterAttrs = card.letterAttrs ? ` ${card.letterAttrs.replace(/^\s+/, "")}` : "";
  const captionAttrs = card.captionAttrs ? ` ${card.captionAttrs.replace(/^\s+/, "")}` : "";
  const captionMarkup = card.caption
    ? `\n            <div class="letter-card-caption"${captionAttrs}>${escapeHtml(card.caption)}</div>`
    : "";
  const audioMarkup = card.audioEnabled
    ? `\n            <button class="letter-audio" type="button" data-letter="${escapeHtml(card.speak || card.text)}" aria-label="Play pronunciation for ${escapeHtml(card.speak || card.text)}">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M5 9v6h4l5 4V5l-5 4H5Z" fill="currentColor" />
                <path
                  d="M17 8c1.5 1.2 2.5 3 2.5 4.9S18.5 16.7 17 18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </button>`
    : "";
  return `          <div class="${escapeHtml(cardClassName)}" data-letter="${escapeHtml(card.speak || card.text)}"${cardAttrs}>
            <div class="letter"${letterAttrs}>${escapeHtml(card.text)}</div>${captionMarkup}${audioMarkup}
          </div>`;
};

const renderLettersSection = (section) => {
  const headingAttrs = section.headingAttrs || "";
  const noteAttrs = section.noteAttrs || "";
  const cards = Array.isArray(section.cards) ? section.cards : section.letters || [];
  const gridClass = section.gridClass ? ` letters-grid ${section.gridClass}` : "letters-grid";
  const lettersMarkup = cards.map((card) => renderLetterCard(card)).join("\n");
  return `        <h3 class="letters-script-heading"${headingAttrs}>${escapeHtml(section.heading)}</h3>
        <p class="letters-script-note"${noteAttrs}>${escapeHtml(section.note)}</p>
        <div class="${escapeHtml(gridClass.trim())}">
${lettersMarkup}
        </div>`;
};

const renderLettersGroup = (group) => {
  const groupClassName = [...new Set(["letters-script-group", String(group.className || "").trim()].join(" ").split(/\s+/).filter(Boolean))].join(" ");
  const sectionsMarkup = (group.sections || []).map((section) => renderLettersSection(section)).join("\n");
  return `        <div class="${escapeHtml(groupClassName)}">
${sectionsMarkup}
        </div>`;
};

const renderLettersStudyPanel = (panel) => {
  const panelClassName = ["letters-study-panel", String(panel.className || "").trim()]
    .filter(Boolean)
    .join(" ");
  const panelAttrs = panel.attrs ? ` ${panel.attrs.replace(/^\s+/, "")}` : "";
  const kickerAttrs = panel.kickerAttrs ? ` ${panel.kickerAttrs.replace(/^\s+/, "")}` : "";
  const titleAttrs = panel.titleAttrs ? ` ${panel.titleAttrs.replace(/^\s+/, "")}` : "";
  const pointsAttrs = panel.pointsAttrs ? ` ${panel.pointsAttrs.replace(/^\s+/, "")}` : "";
  const kickerMarkup = panel.kicker
    ? `\n            <div class="letters-study-kicker"${kickerAttrs}>${escapeHtml(panel.kicker)}</div>`
    : "";
  const pointsMarkup = (panel.points || [])
    .map((point) => `              <li>${escapeHtml(point)}</li>`)
    .join("\n");
  return `          <article class="${escapeHtml(panelClassName)}"${panelAttrs}>${kickerMarkup}
            <h3 class="letters-study-title"${titleAttrs}>${escapeHtml(panel.title || "")}</h3>
            <ul class="letters-study-points"${pointsAttrs}>
${pointsMarkup}
            </ul>
          </article>`;
};

const renderLettersStudyPanels = (panels) => {
  if (!Array.isArray(panels) || !panels.length) {
    return "";
  }
  const panelsMarkup = panels.map((panel) => renderLettersStudyPanel(panel)).join("\n");
  return `        <div class="letters-study-grid">
${panelsMarkup}
        </div>`;
};

const renderLettersMain = (config) => {
  const studyPanelsMarkup = renderLettersStudyPanels(config.studyPanels);
  const bodyMarkup = Array.isArray(config.groups)
    ? config.groups.map((group) => renderLettersGroup(group)).join("\n")
    : (config.sections || []).map((section) => renderLettersSection(section)).join("\n");

  return `    <main id="main-content">
      <h1 class="visually-hidden">${escapeHtml(config.hiddenH1)}</h1>
      <section class="section letters-grid-section reveal" id="letters">
        <div class="section-title"${config.sectionTitleAttrs || ""}>
          <div class="eyebrow">${escapeHtml(config.eyebrow || "Letters")}</div>
          <h2${config.titleAttrs || ""}>${escapeHtml(config.title)}</h2>
          <p>${escapeHtml(config.intro)}</p>
        </div>
${studyPanelsMarkup ? `${studyPanelsMarkup}\n` : ""}${bodyMarkup}
      </section>
    </main>`;
};

const rebuildLettersPages = () => {
  let changed = 0;
  ENHANCED_LETTERS_PAGE_CONFIGS.forEach((config) => {
    const filePath = path.join(ROOT, config.file);
    const original = fs.readFileSync(filePath, "utf8");
    const next = original.replace(/<main\b[^>]*>[\s\S]*?<\/main>/i, renderLettersMain(config));
    if (next !== original) {
      fs.writeFileSync(filePath, next, "utf8");
      changed += 1;
    }
  });
  return changed;
};

const argv = new Set(process.argv.slice(2));
const lettersOnlyMode = argv.has("--letters-only");

let changedFiles = 0;

if (!lettersOnlyMode && rewriteLocalizedPages()) {
  changedFiles += 1;
  console.log("Updated localized guide source content.");
}

if (!lettersOnlyMode && rewriteLandingGuideTitles()) {
  changedFiles += 1;
  console.log("Updated localized guide titles in world hubs.");
}

if (!lettersOnlyMode && normalizeIndexPage()) {
  changedFiles += 1;
  console.log("Normalized index world native names.");
}

const rebuiltLettersCount = rebuildLettersPages();
if (rebuiltLettersCount) {
  changedFiles += rebuiltLettersCount;
  console.log(`Rebuilt ${rebuiltLettersCount} script-heavy letters pages.`);
}

console.log(`Language source fixes updated ${changedFiles} files.`);
