const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FRONTEND = path.join(ROOT, 'frontend');
const WORLDS_DIR = path.join(FRONTEND, 'worlds');

const templateWorld = fs.readFileSync(path.join(FRONTEND, 'world-german.html'), 'utf8');
const templateLetters = fs.readFileSync(path.join(FRONTEND, 'letters-german.html'), 'utf8');
const templateWords = fs.readFileSync(path.join(FRONTEND, 'words-german.html'), 'utf8');
const templatePhrases = fs.readFileSync(path.join(FRONTEND, 'phrases-german.html'), 'utf8');
const templateGrammar = fs.readFileSync(path.join(FRONTEND, 'grammar-german.html'), 'utf8');

const iconSvg = `
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M5 9v6h4l5 4V5l-5 4H5Z" fill="currentColor" />
                <path
                  d="M17 8c1.5 1.2 2.5 3 2.5 4.9S18.5 16.7 17 18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>`;

const worldConfigs = [
  {
    key: 'portuguese',
    displayName: 'Portuguese',
    nativeName: 'Português',
    htmlLang: 'pt',
    ttsLanguageCode: 'pt-BR',
    ttsVoice: 'pt-BR-Wavenet-A',
    phraseIntents: {
      englishLanguageLabel: 'portuguese',
      forms: {
        learn_world_language: 'estou aprendendo português',
        speak_world_language: 'eu falo português',
        not_speak_world_language: 'eu não falo português',
        ask_speak_world_language: 'você fala português?'
      }
    },
    lettersTitle: 'Alfabeto Português (A-Z)',
    lettersDescription: 'Tap a letter to hear clear Portuguese pronunciation. Additional forms include &Aacute;, &Acirc;, &Atilde;, &Agrave;, &Ccedil;, &Eacute;, &Ecirc;, &Iacute;, &Oacute;, &Ocirc;, &Otilde;, &Uacute;.',
    letters: [
      ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
      'Á','Â','Ã','À','Ç','É','Ê','Í','Ó','Ô','Õ','Ú'
    ]
  },
  {
    key: 'dutch',
    displayName: 'Dutch',
    nativeName: 'Nederlands',
    htmlLang: 'nl',
    ttsLanguageCode: 'nl-NL',
    ttsVoice: 'nl-NL-Wavenet-A',
    phraseIntents: {
      englishLanguageLabel: 'dutch',
      forms: {
        learn_world_language: 'ik leer Nederlands',
        speak_world_language: 'ik spreek Nederlands',
        not_speak_world_language: 'ik spreek geen Nederlands',
        ask_speak_world_language: 'spreek je Nederlands?'
      }
    },
    lettersTitle: 'Nederlands Alfabet (A-Z)',
    lettersDescription: 'Tap a letter to hear clear Dutch pronunciation. Additional forms include &Eacute;, &Euml;, &Iuml;, &Ouml;, &Uuml;.',
    letters: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), 'É','Ë','Ï','Ö','Ü']
  },
  {
    key: 'swedish',
    displayName: 'Swedish',
    nativeName: 'Svenska',
    htmlLang: 'sv',
    ttsLanguageCode: 'sv-SE',
    ttsVoice: 'sv-SE-Wavenet-A',
    phraseIntents: {
      englishLanguageLabel: 'swedish',
      forms: {
        learn_world_language: 'jag lär mig svenska',
        speak_world_language: 'jag talar svenska',
        not_speak_world_language: 'jag talar inte svenska',
        ask_speak_world_language: 'talar du svenska?'
      }
    },
    lettersTitle: 'Svenska alfabetet (A-Z)',
    lettersDescription: 'Tap a letter to hear clear Swedish pronunciation. Additional Swedish letters: &Aring;, &Auml;, &Ouml;.',
    letters: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), 'Å','Ä','Ö']
  },
  {
    key: 'arabic',
    displayName: 'Arabic',
    nativeName: 'العربية',
    htmlLang: 'ar',
    ttsLanguageCode: 'ar-XA',
    ttsVoice: 'ar-XA-Wavenet-A',
    phraseIntents: {
      englishLanguageLabel: 'arabic',
      forms: {
        learn_world_language: 'أتعلم العربية',
        speak_world_language: 'أنا أتحدث العربية',
        not_speak_world_language: 'أنا لا أتحدث العربية',
        ask_speak_world_language: 'هل تتحدث العربية؟'
      }
    },
    lettersTitle: 'الحروف العربية',
    lettersDescription: 'Tap a letter to hear clear Arabic pronunciation.',
    letters: ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي']
  },
  {
    key: 'chinese',
    displayName: 'Chinese',
    nativeName: '中文',
    htmlLang: 'zh',
    ttsLanguageCode: 'cmn-CN',
    ttsVoice: 'cmn-CN-Wavenet-A',
    phraseIntents: {
      englishLanguageLabel: 'chinese',
      forms: {
        learn_world_language: '我在学中文',
        speak_world_language: '我会说中文',
        not_speak_world_language: '我不会说中文',
        ask_speak_world_language: '你会说中文吗？'
      }
    },
    lettersTitle: '汉字基础',
    lettersDescription: 'Tap a character to hear clear Mandarin pronunciation.',
    letters: ['一','二','三','人','口','日','月','山','水','火','木','土','金','女','子','学','生','好','中','国','语','文','天','地']
  },
  {
    key: 'japanese',
    displayName: 'Japanese',
    nativeName: '日本語',
    htmlLang: 'ja',
    ttsLanguageCode: 'ja-JP',
    ttsVoice: 'ja-JP-Wavenet-A',
    phraseIntents: {
      englishLanguageLabel: 'japanese',
      forms: {
        learn_world_language: '日本語を勉強しています',
        speak_world_language: '日本語を話せます',
        not_speak_world_language: '日本語を話せません',
        ask_speak_world_language: '日本語を話せますか？'
      }
    },
    lettersTitle: 'ひらがな (基本)',
    lettersDescription: 'Tap a character to hear clear Japanese pronunciation.',
    letters: ['あ','い','う','え','お','か','き','く','け','こ','さ','し','す','せ','そ','た','ち','つ','て','と','な','に','ぬ','ね','の','は','ひ','ふ','へ','ほ','ま','み','む','め','も','や','ゆ','よ','ら','り','る','れ','ろ','わ','を','ん']
  },
  {
    key: 'korean',
    displayName: 'Korean',
    nativeName: '한국어',
    htmlLang: 'ko',
    ttsLanguageCode: 'ko-KR',
    ttsVoice: 'ko-KR-Wavenet-A',
    phraseIntents: {
      englishLanguageLabel: 'korean',
      forms: {
        learn_world_language: '한국어를 배우고 있어요',
        speak_world_language: '한국어를 해요',
        not_speak_world_language: '한국어를 못 해요',
        ask_speak_world_language: '한국어를 할 수 있어요?'
      }
    },
    lettersTitle: '한글 자모',
    lettersDescription: 'Tap a character to hear clear Korean pronunciation.',
    letters: ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ','ㅏ','ㅑ','ㅓ','ㅕ','ㅗ','ㅛ','ㅜ','ㅠ','ㅡ','ㅣ']
  },
  {
    key: 'hindi',
    displayName: 'Hindi',
    nativeName: 'हिन्दी',
    htmlLang: 'hi',
    ttsLanguageCode: 'hi-IN',
    ttsVoice: 'hi-IN-Wavenet-A',
    phraseIntents: {
      englishLanguageLabel: 'hindi',
      forms: {
        learn_world_language: 'मैं हिंदी सीख रहा/रही हूँ',
        speak_world_language: 'मैं हिंदी बोलता/बोलती हूँ',
        not_speak_world_language: 'मैं हिंदी नहीं बोलता/बोलती हूँ',
        ask_speak_world_language: 'क्या आप हिंदी बोलते हैं?'
      }
    },
    lettersTitle: 'देवनागरी अक्षर',
    lettersDescription: 'Tap a letter to hear clear Hindi pronunciation.',
    letters: ['अ','आ','इ','ई','उ','ऊ','ए','ऐ','ओ','औ','अं','अः','क','ख','ग','घ','ङ','च','छ','ज','झ','ञ','ट','ठ','ड','ढ','ण','त','थ','द','ध','न','प','फ','ब','भ','म','य','र','ल','व','श','ष','स','ह']
  }
];

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const buildLetterCards = (letters) => letters
  .map((letter) => {
    const safeLetter = escapeHtml(letter);
    return [
      '          <div class="card letter-card">',
      `            <div class="letter">${safeLetter}</div>`,
      `            <button class="letter-audio" type="button" data-letter="${safeLetter}" aria-label="Play letter ${safeLetter}">`,
      iconSvg,
      '            </button>',
      '          </div>'
    ].join('\n');
  })
  .join('\n');

const applyCommonReplacements = (template, world) => {
  return template
    .replace(/lang="de"/g, `lang="${world.htmlLang}"`)
    .replace(/German/g, world.displayName)
    .replace(/german/g, world.key);
};

const writeIfChanged = (targetPath, content) => {
  if (fs.existsSync(targetPath)) {
    const current = fs.readFileSync(targetPath, 'utf8');
    if (current === content) {
      return;
    }
  }
  fs.writeFileSync(targetPath, content, 'utf8');
};

for (const world of worldConfigs) {
  let worldPage = applyCommonReplacements(templateWorld, world);
  let wordsPage = applyCommonReplacements(templateWords, world);
  let phrasesPage = applyCommonReplacements(templatePhrases, world);
  let grammarPage = applyCommonReplacements(templateGrammar, world);
  let lettersPage = applyCommonReplacements(templateLetters, world);

  lettersPage = lettersPage
    .replace(/<h2>[\s\S]*?<\/h2>/, `<h2>${world.lettersTitle}</h2>`)
    .replace(
      /(<section class="section letters-grid-section reveal" id="letters">[\s\S]*?<div class="section-copy">\s*<h2>[\s\S]*?<\/h2>\s*)<p>[\s\S]*?<\/p>/,
      `$1<p>${world.lettersDescription}</p>`
    )
    .replace(/<div class="letters-grid">[\s\S]*?<\/div>\s*<\/section>/, `<div class="letters-grid">\n${buildLetterCards(world.letters)}\n        </div>\n      </section>`);

  writeIfChanged(path.join(FRONTEND, `world-${world.key}.html`), worldPage);
  writeIfChanged(path.join(FRONTEND, `words-${world.key}.html`), wordsPage);
  writeIfChanged(path.join(FRONTEND, `phrases-${world.key}.html`), phrasesPage);
  writeIfChanged(path.join(FRONTEND, `grammar-${world.key}.html`), grammarPage);
  writeIfChanged(path.join(FRONTEND, `letters-${world.key}.html`), lettersPage);

  const worldDir = path.join(WORLDS_DIR, world.key);
  fs.mkdirSync(worldDir, { recursive: true });

  const worldMeta = {
    worldKey: world.key,
    nativeName: world.nativeName,
    tts: {
      languageCode: world.ttsLanguageCode,
      voice: world.ttsVoice,
    },
    phraseIntents: world.phraseIntents,
    translationPack: `frontend/worlds/${world.key}/translations.json`,
  };

  const mapRoutes = {
    worldKey: world.key,
    displayName: world.displayName,
    routes: {
      world: `world-${world.key}.html`,
      letters: `letters-${world.key}.html`,
      words: `words-${world.key}.html`,
      phrases: `phrases-${world.key}.html`,
      grammar: `grammar-${world.key}.html`,
    },
  };

  const readme = [
    `# ${world.displayName} World Data`,
    "",
    "This folder contains world-specific configuration and data files.",
    "",
    `- \`${world.key}.world.meta.json\`: world metadata and TTS settings`,
    `- \`${world.key}.map-routes.json\`: route mapping used for QA/docs`,
    "- `translations.json`: world-native words/phrases pack",
    "",
    "Public routes stay in `frontend/` root for stable indexed URLs.",
    "",
  ].join("\n");

  writeIfChanged(path.join(worldDir, `${world.key}.world.meta.json`), `${JSON.stringify(worldMeta, null, 2)}\n`);
  writeIfChanged(path.join(worldDir, `${world.key}.map-routes.json`), `${JSON.stringify(mapRoutes, null, 2)}\n`);
  writeIfChanged(path.join(worldDir, 'README.md'), readme);
}

console.log(`Scaffolded ${worldConfigs.length} worlds.`);
