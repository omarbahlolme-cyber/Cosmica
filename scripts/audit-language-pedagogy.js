const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const PREVIEW_SECTIONS = ["Sentence Structure", "Verbs", "Tenses & Aspect"];
const REQUIRED_SOURCE_SECTIONS = [
  "Sentence Structure",
  "Verbs",
  "Tenses & Aspect",
  "Questions",
  "Connections",
  "Conditions",
  "Negation",
  "Nouns & Articles",
  "Modifiers",
  "Pronouns & Reference",
  "Reported Speech",
  "Formality & Style",
  "Discourse & Flow",
  "Modality",
  "Voice & Focus",
];
const REQUIRED_STATIC_GRAMMAR_SECTIONS = [
  "Voice & Focus",
  "Pronouns & Reference",
  "Reported Speech",
  "Formality & Style",
  "Discourse & Flow",
  "Modality",
];
const WORLDS = [
  "arabic",
  "french",
  "german",
  "spanish",
  "portuguese",
  "dutch",
  "swedish",
  "chinese",
  "japanese",
  "korean",
  "hindi",
];

const PRONOUN_EXPECTATIONS = {
  french: {
    elle: "she",
    nous: "we",
  },
  german: {
    sie: "she / they",
  },
  portuguese: {
    ele: "he",
    ela: "she",
    eles: "they",
  },
  chinese: {
    我: "i",
    他: "he",
    她: "she",
    我们: "we",
    他们: "they",
  },
};

const CONTENT_GUARDS = [
  {
    file: "frontend/worlds/french/translations.json",
    mustNotContain: ["Utilisez le verbe à l'infinitif."],
  },
  {
    file: "frontend/worlds/german/translations.json",
    mustNotContain: ["Verwende den Konjunktiv für indirekte Fragen."],
  },
  {
    file: "frontend/worlds/chinese/translations.json",
    mustContain: ["使用“哪个”提问"],
    mustNotContain: ["使用‘的’的疑问句"],
  },
  {
    file: "frontend/worlds/hindi/translations.json",
    mustContain: ["व्यक्ति संबंधी प्रश्न", "विनम्र प्रश्न"],
    mustNotContain: ["संविधानिक प्रश्न"],
  },
  {
    file: "frontend/worlds/swedish/translations.json",
    mustContain: [
      "Pågående handling med 'hålla på att'",
      "När jag åt frukost tänkte jag på gårdagen.",
      "I huvudsatser står 'inte' vanligtvis efter det finita verbet.",
    ],
    mustNotContain: [
      "Framtida Aspekt med 'hålla på att'",
      "Jag håller på att äta frukost imorgon.",
      "Kombinera Tider",
      "Negation placeras före verbet.",
    ],
  },
  {
    file: "frontend/worlds/hindi/translations.json",
    mustContain: [
      "वर्तमान प्रगतिशील",
      "मैं दो घंटे से पढ़ाई कर रहा हूँ।",
      "भूतकाल में 'ने' का प्रयोग",
      "आदत या पुनरावृत्ति",
    ],
    mustNotContain: ["अवधि का संकेत", "क्रियाओं का भिन्नता"],
  },
  {
    file: "frontend/worlds/korean/translations.json",
    mustContain: [
      "장소나 목적어는 동사 앞에 두고 문장 끝에서 높임을 표시합니다.",
      "질문 두 개를 이어 묻기",
    ],
    mustNotContain: ["높임말 사용하기", "복합 질문 만들기"],
  },
  {
    file: "frontend/worlds/german/translations.json",
    mustContain: [
      "Verlaufsform mit 'am'",
      "Sie ist vor allem in der gesprochenen Sprache und regional unterschiedlich üblich.",
    ],
    mustNotContain: ["Aspekt: Dauerhafte Handlungen", "Bildung: Präsens + gerade."],
  },
  {
    file: "frontend/worlds/portuguese/translations.json",
    mustContain: ["Advérbios de tempo e aspecto", "Eu ainda não comi."],
    mustNotContain: ["Uso de Partículas de Tempo"],
  },
  {
    file: "frontend/worlds/korean/translations.json",
    mustContain: ["경험을 나타내는 표현", "미래 시점의 완료 예상"],
    mustNotContain: ["?? ?? ?? ???.", "?? ?? ?? ?? ??? ??? ?? ???."],
  },
  {
    file: "frontend/worlds/japanese/translations.json",
    mustContain: ["過去の継続・反復「〜ていた」", "文脈に応じて継続か反復かを読み分けます。"],
    mustNotContain: ["現在進行形と使い分けます。"],
  },
  {
    file: "frontend/worlds/chinese/translations.json",
    mustContain: ["汉语没有冠词", "每 + 量词 + 名词"],
    mustNotContain: ["时间副词的使用"],
  },
  {
    file: "frontend/worlds/hindi/translations.json",
    mustContain: ["पोस्टपोज़िशन संज्ञा के बाद आती है", "विधेय विशेषण"],
    mustNotContain: ["निर्धारक का प्रयोग", "समानता का संकेत"],
  },
  {
    file: "frontend/worlds/dutch/translations.json",
    mustContain: ["Predicatief zonder -e", "Ook op de juiste plek"],
    mustNotContain: ["Bijvoeglijke naamwoorden in de verleden tijd"],
  },
  {
    file: "frontend/worlds/arabic/translations.json",
    mustContain: ["الضمير المستتر مع الفعل", "الزمن يتبع المعنى لا قاعدة رجوع آلية"],
    mustNotContain: ["التقرير عن الأحداث المستقبلية"],
  },
  {
    file: "frontend/worlds/french/translations.json",
    mustContain: ["Pronoms démonstratifs : celui / celle", "Ordres et conseils avec de + infinitif"],
    mustNotContain: ["Omission des pronoms"],
  },
  {
    file: "frontend/worlds/german/translations.json",
    mustContain: ["Personalpronomen im Dativ", "Konjunktiv I in der indirekten Rede"],
    mustNotContain: ["Omission von Pronomen (Pro-Drop)", "Rückschritt in der indirekten Rede"],
  },
  {
    file: "frontend/worlds/spanish/translations.json",
    mustContain: ["Demostrativos y deixis", "Tiempo y deixis dependen del contexto"],
    mustNotContain: ["Deixis temporal"],
  },
  {
    file: "frontend/worlds/portuguese/translations.json",
    mustContain: ["Pronomes oblíquos diretos", "Tempo e deíxis dependem do contexto"],
    mustNotContain: ["Discurso Indireto com Emoções"],
  },
  {
    file: "frontend/worlds/dutch/translations.json",
    mustContain: ["Verwijswoord er", "Indirecte ja/nee-vraag met of"],
    mustNotContain: ["Omissie van voornaamwoorden (pro-drop)", "Tijdsvormverandering"],
  },
  {
    file: "frontend/worlds/swedish/translations.json",
    mustContain: ["Objektsformer av pronomen", "Pronomen och tidsord skiftar med perspektivet"],
    mustNotContain: ["Omission av pronomen (Pro-drop)", "Backshift i indirekt tal"],
  },
  {
    file: "frontend/worlds/chinese/translations.json",
    mustContain: ["泛指代词: 有人 / 大家 / 别人", "转述特殊疑问句保留疑问词"],
    mustNotContain: ["不定代词", "数量代词"],
  },
  {
    file: "frontend/worlds/japanese/translations.json",
    mustContain: ["こそあど言葉で指す", "伝聞の そうだ"],
    mustNotContain: ["省略とプロドロップ"],
  },
  {
    file: "frontend/worlds/korean/translations.json",
    mustContain: ["당신보다 이름이나 직함이 더 자연스럽다", "간접 인용: -다고 하다"],
    mustNotContain: ["정중한 지시 대명사", "인용구의 변화"],
  },
  {
    file: "frontend/worlds/hindi/translations.json",
    mustContain: ["तू / तुम / आप से आदर का स्तर", "काल अर्थ और संदर्भ से तय होता है"],
    mustNotContain: ["दिशात्मक सर्वनाम", "काल परिवर्तन"],
  },
  {
    file: "frontend/worlds/arabic/translations.json",
    mustContain: ["الأسلوب الرسمي يتجنب العامية", "يجوز / لا يجوز للإذن والمنع"],
    mustNotContain: ["التعبير عن الأحداث المستقبلية"],
  },
  {
    file: "frontend/worlds/chinese/translations.json",
    mustContain: ["话题先行让信息更顺", "必须 表强制义务"],
    mustNotContain: ["使用方面助词"],
  },
  {
    file: "frontend/worlds/french/translations.json",
    mustContain: ["Je voudrais sonne plus diplomatique", "Pouvoir pour capacité ou permission"],
    mustNotContain: ["Utilisation de 'tu' et 'vous'"],
  },
  {
    file: "frontend/worlds/german/translations.json",
    mustContain: ["Also und übrigens steuern den Gesprächsfluss", "Vielleicht / könnte für Wahrscheinlichkeit"],
    mustNotContain: ["Information Flow: weil, dass"],
  },
  {
    file: "frontend/worlds/hindi/translations.json",
    mustContain: ["बैठो, बैठिए में स्तर बदलता है", "पड़ना बाहरी मजबूरी दिखाता है"],
    mustNotContain: ["आदर सूचक शब्द"],
  },
  {
    file: "frontend/worlds/japanese/translations.json",
    mustContain: ["です / ます 体と普通体", "〜てもいい / 〜てはいけない で許可と禁止"],
    mustNotContain: ["基本的な敬語の使い方"],
  },
  {
    file: "frontend/worlds/korean/translations.json",
    mustContain: ["해요체로 기본 공손함 만들기", "은/는 이 화제를 세운다"],
    mustNotContain: ["기본 존댓말 사용"],
  },
  {
    file: "frontend/worlds/portuguese/translations.json",
    mustContain: ["Queria e gostaria soam mais diplomáticos", "Ter de / dever para obrigação"],
    mustNotContain: ["Uso de 'Desculpe' e 'Desculpe-me'"],
  },
  {
    file: "frontend/worlds/spanish/translations.json",
    mustContain: ["¿Usted tiene un momento?", "Quisiera suena más diplomático"],
    mustNotContain: ["?Usted quiere ir al cine?"],
  },
  {
    file: "frontend/worlds/swedish/translations.json",
    mustContain: ["Du är normalt tilltal i modern svenska", "Får / får inte för tillåtelse"],
    mustNotContain: ["Artiklar och formell språkbruk"],
  },
  {
    file: "frontend/worlds/arabic/translations.json",
    mustContain: ["الجملة الفعلية تُبرز الفاعل", "التقديم مع ضمير عائد يصنع موضوعًا واضحًا"],
    mustNotContain: ["ذكر الفاعل في المبني للمجهول"],
  },
  {
    file: "frontend/worlds/chinese/translations.json",
    mustContain: ["把字句突出处理结果", "是……的 强调已知事件中的信息"],
    mustNotContain: ["使用方面助词"],
  },
  {
    file: "frontend/worlds/dutch/translations.json",
    mustContain: ["Resultaat met zijn + voltooid deelwoord", "Cleftzinnen met het is ... die/dat"],
    mustNotContain: ["Basisstructuur van zinnen"],
  },
  {
    file: "frontend/worlds/french/translations.json",
    mustContain: ["La dislocation met un thème devant", "'On' laisse l'agent en arrière-plan"],
    mustNotContain: ["Sujets et Verbes", "Focalisation par Inversion"],
  },
  {
    file: "frontend/worlds/german/translations.json",
    mustContain: ["Zustandspassiv mit sein", "Fokuspartikeln wie nur / auch / sogar"],
    mustNotContain: ["Satzstruktur im Hauptsatz"],
  },
  {
    file: "frontend/worlds/hindi/translations.json",
    mustContain: ["तत्व को आगे रखकर फोकस बदला जा सकता है", "ही संकीर्ण फोकस बनाता है"],
    mustNotContain: ["पद-स्थान का उपयोग"],
  },
  {
    file: "frontend/worlds/japanese/translations.json",
    mustContain: ["は で話題を立てる", "〜のは ... です で焦点化する"],
    mustNotContain: ["受け身の助詞"],
  },
  {
    file: "frontend/worlds/korean/translations.json",
    mustContain: ["은/는 으로 화제를 세운다", "것은 ... 이다 식으로 성분을 부각한다"],
    mustNotContain: ["행위자 생략 피동"],
  },
  {
    file: "frontend/worlds/portuguese/translations.json",
    mustContain: ["Passiva com se tira o agente do foco", "Clivadas com foi ... que"],
    mustNotContain: ["Ênfase no Objeto"],
  },
  {
    file: "frontend/worlds/spanish/translations.json",
    mustContain: ["Se pasivo e impersonal quitan foco del agente", "Fue ... quien / que focaliza"],
    mustNotContain: ["Enfoque en el Objeto", "Yo s? como manzanas."],
  },
  {
    file: "frontend/worlds/swedish/translations.json",
    mustContain: ["S-passiv sätter handlingen i fokus", "Det är ... som markerar fokus"],
    mustNotContain: ["Jag just äter äpplet.", "Äpplet blev ätet av mig just."],
  },
  {
    file: "frontend/maps/app-maps.js",
    mustContain: [
      "const syncGrammarCardMetadataFromWorldPack = () => {",
      "const syncGrammarPreviewCardsFromWorldPack = () => {",
      "syncGrammarCardMetadataFromWorldPack();",
      "syncGrammarPreviewCardsFromWorldPack();",
      "return worldCards;",
    ],
    mustNotContain: [
      "if (hasEnglishSourceMarkers) {",
      "return worldCards.filter((card) => isStrictPedagogyCard(card));",
    ],
  },
];

const decodeHtml = (value) =>
  String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const normalize = (value) => decodeHtml(value).replace(/\s+/g, " ").trim();

const readText = (relativePath) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const readJson = (relativePath) => JSON.parse(readText(relativePath));

const extractPreviewCards = (html) => {
  const cards = [];
  const regex =
    /<article class="card seo-preview-card">[\s\S]*?<h3[^>]*>(.*?)<\/h3>[\s\S]*?<p class="seo-preview-note"[^>]*>(.*?)<\/p>[\s\S]*?<span class="seo-preview-example-sentence">(.*?)<\/span>[\s\S]*?<\/article>/g;
  for (const match of html.matchAll(regex)) {
    cards.push({
      title: normalize(match[1]),
      note: normalize(match[2]),
      example: normalize(match[3]),
    });
  }
  return cards.slice(0, PREVIEW_SECTIONS.length);
};

const extractGrammarCardMetadata = (html) => {
  const cards = [];
  const regex =
    /class="card grammar-card"[\s\S]*?data-concept="([^"]+)"[\s\S]*?data-section="([^"]+)"[\s\S]*?data-index="([^"]+)"[\s\S]*?data-source-title="([^"]+)"/g;
  for (const match of html.matchAll(regex)) {
    cards.push({
      concept: normalize(match[1]),
      section: decodeHtml(match[2]).trim(),
      index: Number(match[3]),
      sourceTitle: normalize(match[4]),
    });
  }
  return cards;
};

const findings = [];

for (const world of WORLDS) {
  const pack = readJson(path.join("frontend", "worlds", world, "translations.json"));
  const html = readText(path.join("frontend", `grammar-${world}.html`));
  const actualCards = extractPreviewCards(html);
  const staticGrammarCards = extractGrammarCardMetadata(html);
  const staticGrammarSections = new Set(staticGrammarCards.map((card) => card.section));

  if (actualCards.length !== PREVIEW_SECTIONS.length) {
    findings.push(
      `[preview] ${world}: expected ${PREVIEW_SECTIONS.length} preview cards, found ${actualCards.length}`
    );
    continue;
  }

  staticGrammarCards.forEach((card) => {
    const sectionCards = Array.isArray(pack?.grammar?.cards?.[card.section])
      ? pack.grammar.cards[card.section]
      : [];
    const sourceCard =
      Number.isFinite(card.index) && card.index >= 0 ? sectionCards[card.index] : null;
    if (!sourceCard) {
      findings.push(
        `[grammar-html] ${world}: missing source card for ${card.section || "<unknown>"} #${card.index}`
      );
      return;
    }

    const expectedConcept = normalize(sourceCard?.title || "");
    const expectedSourceTitle = normalize(sourceCard?.sourceTitle || sourceCard?.title || "");
    if (card.concept !== expectedConcept) {
      findings.push(
        `[grammar-html] ${world}: static concept mismatch for ${card.section} #${card.index}`
      );
    }
    if (card.sourceTitle !== expectedSourceTitle) {
      findings.push(
        `[grammar-html] ${world}: static source title mismatch for ${card.section} #${card.index}`
      );
    }
  });

  REQUIRED_STATIC_GRAMMAR_SECTIONS.forEach((sectionName) => {
    if (!staticGrammarSections.has(sectionName)) {
      findings.push(`[grammar-html] ${world}: missing static section "${sectionName}"`);
    }
  });

  PREVIEW_SECTIONS.forEach((section, index) => {
    const sectionCards = Array.isArray(pack?.grammar?.cards?.[section])
      ? pack.grammar.cards[section]
      : [];
    const actual = actualCards[index];

    if (!sectionCards.length) {
      findings.push(`[preview] ${world}: missing source card for section "${section}"`);
      return;
    }

    const sectionMatches = sectionCards.some((card) => {
      const expectedTitle = normalize(card?.title || "");
      const expectedNote = normalize(Array.isArray(card?.points) ? card.points[0] : "");
      const expectedExample = normalize(card?.example || "");
      return (
        actual.title === expectedTitle &&
        actual.note === expectedNote &&
        actual.example === expectedExample
      );
    });

    if (!sectionMatches) {
      findings.push(
        `[preview] ${world} ${section}: preview card does not match any authored card in the same section`
      );
    }
  });

  Object.entries(pack?.grammar?.cards || {}).forEach(([sectionName, cards]) => {
    if (!Array.isArray(cards) || !cards.length) {
      return;
    }

    cards.forEach((card, index) => {
      const sourceTitle = normalize(card?.sourceTitle || "");
      const sourceExample = normalize(card?.sourceExample || "");
      const worldTitle = normalize(card?.title || "");
      const worldExample = normalize(card?.example || "");
      const mappedTitle = normalize(
        pack?.worldSource?.grammarTitles?.[sectionName]?.[
          String(card?.sourceTitle || "").trim().toLowerCase()
        ] || ""
      );
      const mappedExample = normalize(
        pack?.worldSource?.grammarExamples?.[sectionName]?.[
          String(card?.sourceExample || "").trim().toLowerCase()
        ] || ""
      );

      if (sourceTitle) {
        if (!mappedTitle) {
          findings.push(
            `[worldSource] ${world} ${sectionName}: missing title mapping for card ${index + 1}`
          );
        } else if (worldTitle !== mappedTitle) {
          findings.push(
            `[worldSource] ${world} ${sectionName}: title ${index + 1} is out of sync with sourceTitle`
          );
        }
      }

      if (sourceExample) {
        if (!mappedExample) {
          findings.push(
            `[worldSource] ${world} ${sectionName}: missing example mapping for card ${index + 1}`
          );
        } else if (worldExample !== mappedExample) {
          findings.push(
            `[worldSource] ${world} ${sectionName}: example ${index + 1} is out of sync with sourceExample`
          );
        }
      }
    });
  });

  REQUIRED_SOURCE_SECTIONS.forEach((sectionName) => {
    const cards = Array.isArray(pack?.grammar?.cards?.[sectionName])
      ? pack.grammar.cards[sectionName]
      : [];
    if (!cards.length) {
      findings.push(`[source] ${world}: missing cards for required section "${sectionName}"`);
      return;
    }

    const seenTitles = new Set();
    const seenExamples = new Set();
    cards.forEach((card, index) => {
      const sourceTitle = normalize(card?.sourceTitle || "");
      const sourceExample = normalize(card?.sourceExample || "");

      if (!sourceTitle) {
        findings.push(`[source] ${world} ${sectionName}: missing sourceTitle for card ${index + 1}`);
      } else if (seenTitles.has(sourceTitle)) {
        findings.push(`[source] ${world} ${sectionName}: duplicate sourceTitle for card ${index + 1}`);
      } else {
        seenTitles.add(sourceTitle);
      }

      if (!sourceExample) {
        findings.push(
          `[source] ${world} ${sectionName}: missing sourceExample for card ${index + 1}`
        );
      } else if (seenExamples.has(sourceExample)) {
        findings.push(
          `[source] ${world} ${sectionName}: duplicate sourceExample for card ${index + 1}`
        );
      } else {
        seenExamples.add(sourceExample);
      }
    });
  });

  if (world === "swedish") {
    const sentenceCards = Array.isArray(pack?.grammar?.cards?.["Sentence Structure"])
      ? pack.grammar.cards["Sentence Structure"]
      : [];
    const negationCard = sentenceCards[2] || null;
    const yesNoCard = sentenceCards[3] || null;
    const subordinateCard = sentenceCards[4] || null;

    if (
      !negationCard ||
      !String(negationCard?.points?.[0] || "").includes(
        "negationen vanligtvis efter det finita verbet"
      ) ||
      String(negationCard?.mistakes?.[0]?.wrong || "").includes("inte inte")
    ) {
      findings.push("[swedish] Sentence Structure: main-clause negation card regressed");
    }

    if (
      !yesNoCard ||
      normalize(yesNoCard?.title || "") !== normalize("Ja/nej-frågor med inversion") ||
      !String(yesNoCard?.points?.[0] || "").includes("före subjektet")
    ) {
      findings.push("[swedish] Sentence Structure: yes/no question inversion card regressed");
    }

    if (
      !subordinateCard ||
      normalize(subordinateCard?.title || "") !== normalize("Bisatsordföljd med 'att'") ||
      normalize(subordinateCard?.example || "") !==
        normalize("Jag vet att du inte äter äpplet.") ||
      !String(subordinateCard?.points?.[1] || "").includes("före det finita verbet i bisatsen")
    ) {
      findings.push("[swedish] Sentence Structure: subordinate clause order card regressed");
    }
  }

  if (world === "dutch") {
    const connectionsCards = Array.isArray(pack?.grammar?.cards?.Connections)
      ? pack.grammar.cards.Connections
      : [];
    const expectedConnectionTitles = [
      "En om zinnen te verbinden",
      "Maar om contrast te tonen",
      "Omdat voor reden",
      "Daarom voor gevolg",
      "Als voor voorwaarden",
      "Dat in indirecte rede",
      "Relatieve zinnen met die en dat",
    ];
    if (
      connectionsCards.length !== expectedConnectionTitles.length ||
      connectionsCards.some(
        (card, index) => normalize(card?.title || "") !== normalize(expectedConnectionTitles[index])
      )
    ) {
      findings.push("[dutch] Connections: rebuilt card set regressed");
    }

    const modifierCards = Array.isArray(pack?.grammar?.cards?.Modifiers)
      ? pack.grammar.cards.Modifiers
      : [];
    const expectedModifierTitles = [
      "Bijvoeglijk naamwoord voor het zelfstandig naamwoord",
      "Predicatief zonder -e",
      "Bijwoorden beschrijven het werkwoord",
      "Vergrotende trap met -er en dan",
      "Vergelijking met zo ... als",
      "Overtreffende trap met -st(e)",
      "Meer / minder voor gradatie",
      "Graadwoorden: heel, erg, ontzettend",
      "Frequentiebijwoorden in de middenpositie",
      "Ook op de juiste plek",
    ];
    if (
      modifierCards.length !== expectedModifierTitles.length ||
      modifierCards.some(
        (card, index) => normalize(card?.title || "") !== normalize(expectedModifierTitles[index])
      )
    ) {
      findings.push("[dutch] Modifiers: rebuilt card set regressed");
    }
  }

  if (world === "hindi") {
    const connectionCards = Array.isArray(pack?.grammar?.cards?.Connections)
      ? pack.grammar.cards.Connections
      : [];
    const expectedConnectionTitles = [
      "और से वाक्य जोड़ना",
      "लेकिन से विरोध",
      "क्योंकि से कारण",
      "इसलिए से परिणाम",
      "अगर...तो शर्त",
      "जब...तब समय-संबंध",
      "हालाँकि...फिर भी विरोध",
    ];
    if (
      connectionCards.length !== expectedConnectionTitles.length ||
      connectionCards.some(
        (card, index) => normalize(card?.title || "") !== normalize(expectedConnectionTitles[index])
      )
    ) {
      findings.push("[hindi] Connections: rebuilt card set regressed");
    }

    const nounCards = Array.isArray(pack?.grammar?.cards?.["Nouns & Articles"])
      ? pack.grammar.cards["Nouns & Articles"]
      : [];
    const expectedNounTitles = [
      "संज्ञा का लिंग",
      "एकवचन और बहुवचन",
      "यह / वह से संकेत",
      "ये / वे से बहुवचन संकेत",
      "मेरा / मेरी / मेरे से संबंध",
      "पोस्टपोज़िशन संज्ञा के बाद आती है",
      "ओब्लिक रूप + पोस्टपोज़िशन",
    ];
    if (
      nounCards.length !== expectedNounTitles.length ||
      nounCards.some(
        (card, index) => normalize(card?.title || "") !== normalize(expectedNounTitles[index])
      )
    ) {
      findings.push("[hindi] Nouns & Articles: rebuilt card set regressed");
    }

    const modifierCards = Array.isArray(pack?.grammar?.cards?.Modifiers)
      ? pack.grammar.cards.Modifiers
      : [];
    const expectedModifierTitles = [
      "विशेषण सामान्यतः संज्ञा से पहले",
      "विधेय विशेषण",
      "बदलने वाले विशेषण",
      "अपरिवर्तनीय विशेषण",
      "से के साथ तुलना",
      "सबसे के साथ उच्चतम स्तर",
      "जितना...उतना",
      "बहुत / काफ़ी / थोड़ा",
      "क्रिया को विशेषित करने वाले क्रियाविशेषण",
      "अक्सर / हमेशा / कभी-कभी",
    ];
    if (
      modifierCards.length !== expectedModifierTitles.length ||
      modifierCards.some(
        (card, index) => normalize(card?.title || "") !== normalize(expectedModifierTitles[index])
      )
    ) {
      findings.push("[hindi] Modifiers: rebuilt card set regressed");
    }
  }

  if (world === "chinese") {
    const nounCards = Array.isArray(pack?.grammar?.cards?.["Nouns & Articles"])
      ? pack.grammar.cards["Nouns & Articles"]
      : [];
    const expectedNounTitles = [
      "汉语没有冠词",
      "数词 + 量词 + 名词",
      "这 / 那 + 量词 + 名词",
      "名词 + 的 + 名词",
      "复数常靠数量表达",
      "“们”主要用于人",
      "每 + 量词 + 名词",
    ];
    if (
      nounCards.length !== expectedNounTitles.length ||
      nounCards.some(
        (card, index) => normalize(card?.title || "") !== normalize(expectedNounTitles[index])
      )
    ) {
      findings.push("[chinese] Nouns & Articles: rebuilt card set regressed");
    }
  }
}

for (const [world, expectedEntries] of Object.entries(PRONOUN_EXPECTATIONS)) {
  const pack = readJson(path.join("frontend", "worlds", world, "translations.json"));
  const pronouns = pack?.words?.Pronouns || {};

  for (const [token, expectedSource] of Object.entries(expectedEntries)) {
    const actualSource = normalize(pronouns?.[token]?.source || "");
    if (actualSource !== normalize(expectedSource)) {
      findings.push(
        `[pronouns] ${world}: "${token}" is "${actualSource || "<missing>"}" not "${expectedSource}"`
      );
    }
  }
}

for (const guard of CONTENT_GUARDS) {
  const text = readText(guard.file);
  for (const needle of guard.mustContain || []) {
    if (!text.includes(needle)) {
      findings.push(`[content] ${guard.file}: missing "${needle}"`);
    }
  }
  for (const needle of guard.mustNotContain || []) {
    if (text.includes(needle)) {
      findings.push(`[content] ${guard.file}: still contains "${needle}"`);
    }
  }
}

if (findings.length) {
  console.error("Language pedagogy audit failed:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log(`Language pedagogy audit passed for ${WORLDS.length} grammar pages.`);
