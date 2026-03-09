const SECTION_TARGETS = new Set([
  "Conditions",
  "Pronouns & Reference",
  "Reported Speech",
  "Formality & Style",
  "Discourse & Flow",
  "Modality",
  "Voice & Focus",
]);

const WH_WORDS = [
  "who",
  "what",
  "where",
  "when",
  "why",
  "how",
  "whether",
  "if",
  "qui",
  "que",
  "quoi",
  "ou",
  "où",
  "quand",
  "pourquoi",
  "comment",
  "wer",
  "was",
  "wo",
  "wann",
  "warum",
  "wie",
  "ob",
  "wie",
  "qué",
  "que",
  "quien",
  "quién",
  "donde",
  "dónde",
  "cuando",
  "cuándo",
  "por qué",
  "como",
  "cómo",
  "se",
  "onde",
  "quando",
  "porque",
  "hoe",
  "waar",
  "wanneer",
  "var",
  "när",
  "hur",
  "من",
  "ماذا",
  "أين",
  "متى",
  "لماذا",
  "كيف",
  "谁",
  "什么",
  "哪里",
  "哪儿",
  "为什么",
  "怎么",
  "どこ",
  "だれ",
  "誰",
  "なぜ",
  "どう",
  "언제",
  "어디",
  "왜",
  "누구",
  "무엇",
  "कौन",
  "कहाँ",
  "कब",
  "क्यों",
  "कैसे",
];

const EUROPEAN_ARTICLES = new Set([
  "de",
  "het",
  "een",
  "le",
  "la",
  "les",
  "un",
  "une",
  "der",
  "die",
  "das",
  "den",
  "dem",
  "des",
  "el",
  "los",
  "las",
  "lo",
  "um",
  "uma",
  "os",
  "as",
  "o",
  "ett",
  "en",
  "det",
  "den",
  "a",
  "dat",
  "dit",
  "this",
  "that",
  "ce",
  "cet",
  "cette",
  "este",
  "esta",
  "esse",
  "essa",
  "isto",
  "isso",
  "denna",
  "detta",
]);

const AUXILIARY_LINKERS = new Set(["que", "de", "to", "أن"]);
const NEGATION_MARKERS = new Set(["not", "niet", "nicht", "ne", "no", "não", "nao"]);

const EUROPEAN_PRONOUNS = new Set([
  "i",
  "ik",
  "je",
  "j'",
  "jij",
  "u",
  "tu",
  "vous",
  "il",
  "elle",
  "we",
  "wij",
  "he",
  "hij",
  "sie",
  "er",
  "ich",
  "du",
  "wir",
  "yo",
  "tú",
  "usted",
  "ella",
  "él",
  "eu",
  "você",
  "ele",
  "ela",
  "jag",
  "du",
  "han",
  "hon",
  "vi",
]);

const PASSIVE_MARKERS = [
  "wordt",
  "werden",
  "wird",
  "est",
  "será",
  "foi",
  "fue",
  "is",
  "sont",
  "sein",
  "blev",
  "blir",
  "被",
  "られ",
  "받",
  "되",
];

const COPULA_MARKERS = [
  "is",
  "zijn",
  "ist",
  "est",
  "es",
  "ser",
  "é",
  "são",
  "är",
  "です",
  "이다",
  "ہے",
  "है",
];

const RELATIVE_MARKERS = [
  "die",
  "dat",
  "qui",
  "que",
  "quien",
  "som",
  "who",
  "that",
  "が",
  "이",
  "जो",
];

const EXAMPLE_MARKERS = [
  "bijvoorbeeld",
  "par exemple",
  "zum beispiel",
  "por ejemplo",
  "por exemplo",
  "till exempel",
  "مثلاً",
  "مثلا",
  "比如",
  "たとえば",
  "예를 들어",
  "उदाहरण के लिए",
];

const RESULT_MARKERS = [
  "daarom",
  "donc",
  "deshalb",
  "deswegen",
  "por eso",
  "por isso",
  "så",
  "لذلك",
  "所以",
  "그래서",
  "इसलिए",
];

const REPORTED_CONNECTORS = [
  "dat",
  "dass",
  "que",
  "att",
  "कि",
  "إن",
  "إنه",
  "أن",
  "라고",
  "다고",
  "자고",
  "달라고",
  "냐고",
  "는지",
  "と",
];

const CONDITION_MARKERS = [
  "als",
  "se",
  "si",
  "wenn",
  "om",
  "if",
  "unless",
  "tenzij",
  "mits",
  "ook al",
  "au cas où",
  "à condition que",
  "por si",
  "caso",
  "om",
  "إذا",
  "لو",
  "如果",
  "要是",
  "只要",
  "假如",
  "即使",
  "除非",
  "たら",
  "ば",
  "なら",
  "なければ",
  "ても",
  "면",
  "라면",
  "यदि",
  "अगर",
];

const QUOTE_PAIRS = [
  ['"', '"'],
  ["“", "”"],
  ["«", "»"],
  ["„", "“"],
  ["「", "」"],
  ["『", "』"],
  ["'", "'"],
];

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const escapeRegExp = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const stripOuterPunctuation = (value) =>
  String(value || "")
    .trim()
    .replace(/^[\s\p{P}\p{S}]+|[\s\p{P}\p{S}]+$/gu, "")
    .trim();

const cleanSentence = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?。！？]+$/u, "")
    .trim();

const normalizeMarker = (value) =>
  stripOuterPunctuation(value)
    .replace(/^[~〜\-–—]+/u, "")
    .replace(/[~〜\-–—]+$/u, "")
    .trim();

const hasLetterOrNumber = (value) => /[\p{L}\p{N}]/u.test(String(value || ""));

const buildHighlights = (ruleOrder, texts) =>
  ruleOrder
    .map((label, index) => ({
      label: String(label || "").trim(),
      text: stripOuterPunctuation(texts[index] || ""),
    }))
    .filter((entry) => entry.label && entry.text && hasLetterOrNumber(entry.text));

const isSubjectLikeLabel = (value) => {
  const key = normalize(value);
  return [
    "subject",
    "sujet",
    "subjekt",
    "sujeto",
    "sujeito",
    "onderwerp",
    "subjekt",
    "subjekt",
    "subjekt",
    "subjekt",
    "subjekt",
    "주어",
    "主語",
    "主语",
    "فاعل",
    "कर्ता",
    "कथन",
  ].some((token) => key.includes(normalize(token)));
};

const isSpeakerLikeLabel = (value) => {
  const key = normalize(value);
  return ["speaker", "intro", "inleiding", "einleitung", "introducción", "introdução", "화자", "話者", "引述", "कथन", "فعل"].some((token) =>
    key.includes(normalize(token))
  );
};

const isReceiverLikeLabel = (value) => {
  const key = normalize(value);
  return ["receiver", "empf", "mottag", "ontv", "dest", "대상", "받", "受け手", "प्राप्तकर्ता", "المفعول"].some((token) =>
    key.includes(normalize(token))
  );
};

const isTimeLikeLabel = (value) => {
  const key = normalize(value);
  return ["time", "tijd", "temps", "zeit", "tiempo", "tempo", "tid", "时间", "時", "시간", "समय", "زمن"].some((token) =>
    key.includes(normalize(token))
  );
};

const sameHighlights = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (normalize(a[i]?.label) !== normalize(b[i]?.label)) {
      return false;
    }
    if (normalize(a[i]?.text) !== normalize(b[i]?.text)) {
      return false;
    }
  }
  return true;
};

const tokenize = (sentence) =>
  cleanSentence(sentence)
    .split(/\s+/u)
    .map((token) => stripOuterPunctuation(token))
    .filter(Boolean);

const tokensToText = (tokens) => stripOuterPunctuation((tokens || []).join(" "));

const splitMajorClauses = (sentence) => {
  const source = cleanSentence(sentence);
  if (!source) {
    return [];
  }
  return source
    .split(/(?<=[,;،؛，：:])\s*|\s*[;؛，]\s*/u)
    .map((part) => stripOuterPunctuation(part))
    .filter(Boolean);
};

const extractQuotedParts = (sentence) => {
  const source = cleanSentence(sentence);
  for (const [open, close] of QUOTE_PAIRS) {
    const start = source.indexOf(open);
    if (start < 0) {
      continue;
    }
    const end = source.indexOf(close, start + open.length);
    if (end < 0) {
      continue;
    }
    const before = stripOuterPunctuation(source.slice(0, start).replace(/[:：]\s*$/u, ""));
    const quote = stripOuterPunctuation(source.slice(start, end + close.length));
    const after = stripOuterPunctuation(source.slice(end + close.length));
    return { before, quote, after };
  }
  return null;
};

const TITLE_TOKEN_STOPS = new Set([
  "for",
  "para",
  "pour",
  "met",
  "mit",
  "con",
  "de",
  "des",
  "del",
  "der",
  "den",
  "and",
  "en",
  "voor",
  "nach",
  "segun",
  "según",
  "selon",
  "according",
  "mot",
  "för",
  "fuer",
  "für",
  "ro",
  "로",
  "で",
  "से",
  "का",
  "के",
  "की",
  "द्वारा",
]);

const extractSearchableTitleTokens = (title) =>
  String(title || "")
    .split(/[\s/]+/u)
    .map((part) => normalizeMarker(part))
    .filter((part) => part && !TITLE_TOKEN_STOPS.has(normalize(part)));

const findFirstMarker = (sentence, markers = []) => {
  const source = cleanSentence(sentence);
  const lower = source.toLocaleLowerCase();
  let best = null;
  markers
    .map((marker) => normalizeMarker(marker))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .forEach((marker) => {
      const needsBoundary =
        /\s/u.test(source) &&
        /^[A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)*$/u.test(marker);
      let index = -1;
      let foundText = "";
      if (needsBoundary) {
        const pattern = new RegExp(`(^|[\\s\\p{P}])(${escapeRegExp(marker)})(?=$|[\\s\\p{P}])`, "iu");
        const match = source.match(pattern);
        if (match?.index !== undefined) {
          index = match.index + match[1].length;
          foundText = match[2];
        }
      } else {
        const needle = marker.toLocaleLowerCase();
        index = lower.indexOf(needle);
        if (index >= 0) {
          foundText = source.slice(index, index + marker.length);
        }
      }
      if (index < 0 || !foundText) {
        return;
      }
      if (!best || index < best.index || (index === best.index && marker.length > best.marker.length)) {
        best = { marker: foundText, index };
      }
    });
  return best;
};

const splitAroundMarker = (sentence, markers = []) => {
  const source = cleanSentence(sentence);
  const hit = findFirstMarker(source, markers);
  if (!hit) {
    return null;
  }
  const left = stripOuterPunctuation(source.slice(0, hit.index));
  const marker = stripOuterPunctuation(hit.marker);
  const right = stripOuterPunctuation(source.slice(hit.index + hit.marker.length));
  return { left, marker, right };
};

const extractQuotedTitleMarkers = (title) => {
  const markers = [];
  const source = String(title || "");
  const quoted = source.matchAll(/['"“«「](.+?)['"”»」]/gu);
  for (const match of quoted) {
    const marker = stripOuterPunctuation(match[1]);
    if (marker) {
      markers.push(marker);
    }
  }
  return markers;
};

const extractSlashTitleMarkers = (title) => {
  const source = String(title || "")
    .split(/\b(?:for|para|pour|met|mit|con|de|van|med|ro|で|로|के)\b/iu)[0]
    .trim();
  if (!source.includes("/")) {
    return [];
  }
  return source
    .split("/")
    .map((part) => {
      const words = String(part || "").trim().split(/\s+/u).filter(Boolean);
      if (!words.length) {
        return "";
      }
      if (words.length >= 2 && ["o", "a", "os", "as", "the", "le", "la", "les"].includes(normalize(words[0]))) {
        return normalizeMarker(words.slice(0, 2).join(" "));
      }
      if (words.length >= 2 && ["niet", "nicht", "not", "ne", "no", "não", "nao"].includes(normalize(words[0]))) {
        return normalizeMarker(words.slice(0, 2).join(" "));
      }
      if (words.length >= 2 && AUXILIARY_LINKERS.has(normalize(words[1]))) {
        return normalizeMarker(words.slice(0, 2).join(" "));
      }
      return normalizeMarker(words[0]);
    })
    .filter((part) => hasLetterOrNumber(part));
};

const extractTitleMarkers = (title) => {
  const markers = [
    ...extractQuotedTitleMarkers(title),
    ...extractSlashTitleMarkers(title),
    ...extractSearchableTitleTokens(title),
  ];
  return [...new Set(markers)];
};

const inferSimpleSyntaxHighlights = (sentence, ruleOrder) => {
  const slots = Array.isArray(ruleOrder) ? ruleOrder : [];
  const words = tokenize(sentence);
  if (slots.length < 2 || words.length < 2) {
    return [];
  }
  if (slots.length === 2) {
    return buildHighlights(slots, [words[0], tokensToText(words.slice(1))]);
  }
  if (slots.length === 3) {
    if (
      words.length >= 4 &&
      isSubjectLikeLabel(slots[0]) &&
      (EUROPEAN_ARTICLES.has(normalize(words[0])) || EUROPEAN_PRONOUNS.has(normalize(words[0])))
    ) {
      const subjectSize = EUROPEAN_ARTICLES.has(normalize(words[0])) && !EUROPEAN_PRONOUNS.has(normalize(words[1])) ? 2 : 1;
      return buildHighlights(slots, [
        tokensToText(words.slice(0, subjectSize)),
        words[subjectSize],
        tokensToText(words.slice(subjectSize + 1)),
      ]);
    }
    return buildHighlights(slots, [words[0], words[1], tokensToText(words.slice(2))]);
  }
  if (slots.length === 4) {
    const subjectSize =
      words.length >= 5 && isSubjectLikeLabel(slots[0]) && EUROPEAN_ARTICLES.has(normalize(words[0])) ? 2 : 1;
    return buildHighlights(slots, [
      tokensToText(words.slice(0, subjectSize)),
      words[subjectSize],
      words[subjectSize + 1],
      tokensToText(words.slice(subjectSize + 2)),
    ]);
  }
  return buildHighlights(
    slots,
    slots.map((_, index) =>
      index === slots.length - 1 ? tokensToText(words.slice(index)) : words[index]
    )
  );
};

const inferDiscourseHighlights = (card) => {
  const ruleOrder = card.ruleOrder || [];
  const sourceTitle = normalize(card.sourceTitle);
  const titleMarkers = extractTitleMarkers(card.title);
  const sentence = card.example;

  if (sourceTitle.includes("addition and contrast")) {
    const split = splitAroundMarker(sentence, titleMarkers);
    if (split && ruleOrder.length >= 3) {
      return buildHighlights(ruleOrder, [split.left, split.marker, split.right]);
    }
    const clauses = splitMajorClauses(sentence);
    if (clauses.length >= 2 && ruleOrder.length >= 3) {
      const rightWords = tokenize(clauses[1]);
      if (rightWords.length >= 2) {
        return buildHighlights(ruleOrder, [
          clauses[0],
          rightWords[0],
          tokensToText(rightWords.slice(1)),
        ]);
      }
    }
  }

  if (sourceTitle.includes("reason and result")) {
    const split = splitAroundMarker(sentence, RESULT_MARKERS);
    if (split && ruleOrder.length >= 2) {
      return buildHighlights(ruleOrder, [split.left, `${split.marker} ${split.right}`]);
    }
    const fallbackSplit = splitAroundMarker(sentence, titleMarkers);
    if (fallbackSplit && ruleOrder.length >= 2) {
      return buildHighlights(ruleOrder, [fallbackSplit.left, `${fallbackSplit.marker} ${fallbackSplit.right}`]);
    }
    const clauses = splitMajorClauses(sentence);
    if (clauses.length >= 2 && ruleOrder.length >= 2) {
      return buildHighlights(ruleOrder, [clauses[0], clauses.slice(1).join(", ")]);
    }
  }

  if (sourceTitle.includes("sequencing")) {
    const markers = titleMarkers.length ? titleMarkers : EXAMPLE_MARKERS;
    const source = cleanSentence(sentence);
    const hits = markers
      .map((marker) => {
        const found = findFirstMarker(source, [marker]);
        if (!found) {
          return null;
        }
        return { marker: found.marker, index: found.index };
      })
      .filter(Boolean)
      .sort((a, b) => a.index - b.index);
    if (hits.length >= 2) {
      const parts = hits.map((hit, index) => {
        const end = index + 1 < hits.length ? hits[index + 1].index : source.length;
        return stripOuterPunctuation(source.slice(hit.index, end));
      });
      return buildHighlights(ruleOrder, parts.slice(0, ruleOrder.length));
    }
    const clauses = splitMajorClauses(sentence);
    if (clauses.length >= 2) {
      return buildHighlights(ruleOrder, clauses.slice(0, ruleOrder.length));
    }
  }

  if (
    sourceTitle.includes("examples and conclusions") ||
    sourceTitle.includes("examples and framing signals")
  ) {
    const split = splitAroundMarker(sentence, [...EXAMPLE_MARKERS, ...titleMarkers]);
    if (split && ruleOrder.length >= 2) {
      return buildHighlights(ruleOrder, [split.left, `${split.marker} ${split.right}`]);
    }
  }

  if (
    sourceTitle.includes("reference back to previous") ||
    sourceTitle.includes("topic-comment flow") ||
    sourceTitle.includes("topic and focus marking") ||
    sourceTitle.includes("flow-managing discourse markers")
  ) {
    const clauses = splitMajorClauses(sentence);
    if (clauses.length >= 2) {
      return buildHighlights(ruleOrder, clauses.slice(0, ruleOrder.length));
    }
  }

  return [];
};

const inferFormalityHighlights = (card) => {
  const ruleOrder = card.ruleOrder || [];
  const sourceTitle = normalize(card.sourceTitle);
  const titleMarkers = extractTitleMarkers(card.title);
  const sentence = cleanSentence(card.example);
  const clauses = splitMajorClauses(sentence);

  if (
    sourceTitle.includes("greetings") ||
    sourceTitle.includes("titles and honorifics") ||
    sourceTitle.includes("titles and respectful address") ||
    sourceTitle.includes("titles and formal greetings")
  ) {
    if (clauses.length >= 2) {
      return buildHighlights(ruleOrder, [clauses[0], clauses.slice(1).join(", ")]);
    }
    const words = tokenize(sentence);
    if (words.length >= 3) {
      return buildHighlights(ruleOrder, [tokensToText(words.slice(0, 2)), tokensToText(words.slice(2))]);
    }
  }

  if (sourceTitle.includes("formal and informal second-person address") || sourceTitle.includes("address")) {
    const hit = findFirstMarker(sentence, titleMarkers);
    if (hit) {
      const left = stripOuterPunctuation(sentence.slice(0, hit.index));
      const right = stripOuterPunctuation(sentence.slice(hit.index + hit.marker.length));
      const other = right || left;
      return buildHighlights(ruleOrder, [hit.marker, other]);
    }
  }

  if (sourceTitle.includes("speech styles")) {
    const hit = findFirstMarker(sentence, titleMarkers);
    if (hit) {
      return buildHighlights(ruleOrder, [
        stripOuterPunctuation(sentence.slice(0, hit.index)),
        hit.marker,
      ]);
    }
  }

  if (
    sourceTitle.includes("polite requests") ||
    sourceTitle.includes("softening") ||
    sourceTitle.includes("diplomatic") ||
    sourceTitle.includes("indirect")
  ) {
    if (clauses.length >= 2) {
      return buildHighlights(ruleOrder, [clauses[0], clauses.slice(1).join(", ")]);
    }
    const markers = titleMarkers.length ? titleMarkers : tokenize(card.title).slice(0, 2);
    const hit = findFirstMarker(sentence, markers);
    if (hit && hit.index <= 2) {
      const rest = stripOuterPunctuation(sentence.slice(hit.index + hit.marker.length));
      return buildHighlights(ruleOrder, [hit.marker, rest || hit.marker]);
    }
    const words = tokenize(sentence);
    if (words.length >= 3) {
      return buildHighlights(ruleOrder, [words[0], tokensToText(words.slice(1))]);
    }
  }

  return [];
};

const inferModalityHighlights = (card) => {
  const ruleOrder = card.ruleOrder || [];
  const sourceTitle = normalize(card.sourceTitle);
  const titleMarkers = extractTitleMarkers(card.title);
  const sentence = cleanSentence(card.example);
  const words = tokenize(sentence);

  if (sourceTitle.includes("ability") && /أستطيع/u.test(sentence)) {
    const split = splitAroundMarker(sentence, ["أن"]);
    if (split) {
      return buildHighlights(ruleOrder, ["أستطيع", split.marker, split.right]);
    }
  }

  if (words.length >= 3 && AUXILIARY_LINKERS.has(normalize(words[1]))) {
    return buildHighlights(ruleOrder, [tokensToText(words.slice(0, 2)), tokensToText(words.slice(2))]);
  }
  if (words.length >= 4 && EUROPEAN_PRONOUNS.has(normalize(words[0])) && AUXILIARY_LINKERS.has(normalize(words[2]))) {
    return buildHighlights(ruleOrder, [tokensToText(words.slice(1, 3)), tokensToText(words.slice(3))]);
  }
  if (/[ऀ-ॿ]/u.test(sentence) && sourceTitle.includes("ability") && words.length >= 5) {
    return buildHighlights(ruleOrder, [
      words[0],
      tokensToText(words.slice(-2)),
      tokensToText(words.slice(1, -2)),
    ]);
  }

  const split = splitAroundMarker(sentence, titleMarkers);
  if (split) {
    const leftWords = tokenize(split.left);
    if (NEGATION_MARKERS.has(normalize(split.marker)) && leftWords.length) {
      return buildHighlights(ruleOrder, [leftWords[leftWords.length - 1], split.right]);
    }
    const action = split.right || split.left;
    return buildHighlights(ruleOrder, [split.marker, action]);
  }
  if (/[가-힣]/u.test(sentence) && words.length >= 4) {
    return buildHighlights(ruleOrder, [tokensToText(words.slice(-2)), tokensToText(words.slice(1, -2))]);
  }
  if (/[ऀ-ॿ]/u.test(sentence) && words.length >= 3) {
    return buildHighlights(ruleOrder, [words[words.length - 1], tokensToText(words.slice(1, -1))]);
  }
  if (words.length >= 3) {
    return buildHighlights(ruleOrder, [words[1], tokensToText(words.slice(2))]);
  }
  return [];
};

const inferReportedSpeechHighlights = (card) => {
  const ruleOrder = card.ruleOrder || [];
  const sourceTitle = normalize(card.sourceTitle);
  const titleMarkers = extractTitleMarkers(card.title);
  const sentence = cleanSentence(card.example);
  const quoted = extractQuotedParts(sentence);

  if (quoted) {
    if (ruleOrder.length >= 3 && quoted.after) {
      return buildHighlights(ruleOrder, [quoted.before, quoted.quote, quoted.after]);
    }
    return buildHighlights(ruleOrder, [quoted.before, quoted.quote]);
  }

  const genericConnectorSplit = splitAroundMarker(sentence, REPORTED_CONNECTORS);
  if (genericConnectorSplit && ruleOrder.length >= 3) {
    const leftWords = tokenize(genericConnectorSplit.left);
    if (/[가-힣]/u.test(sentence) && leftWords.length >= 2 && isSpeakerLikeLabel(ruleOrder[0])) {
      if (leftWords.length >= 3 && isTimeLikeLabel(ruleOrder[1])) {
        return buildHighlights(ruleOrder, [
          leftWords[0],
          leftWords[1],
          `${tokensToText(leftWords.slice(2))}${genericConnectorSplit.marker} ${genericConnectorSplit.right}`.trim(),
        ]);
      }
      if (leftWords.length >= 3 && isReceiverLikeLabel(ruleOrder[1])) {
        return buildHighlights(ruleOrder, [
          leftWords[0],
          leftWords[1],
          `${tokensToText(leftWords.slice(2))}${genericConnectorSplit.marker} ${genericConnectorSplit.right}`.trim(),
        ]);
      }
      return buildHighlights(ruleOrder, [
        leftWords[0],
        `${tokensToText(leftWords.slice(1))}${genericConnectorSplit.marker}`.trim(),
        genericConnectorSplit.right,
      ]);
    }
    return buildHighlights(ruleOrder, [
      genericConnectorSplit.left,
      genericConnectorSplit.marker,
      genericConnectorSplit.right,
    ]);
  }

  if (
    sourceTitle.includes("reported statements") ||
    sourceTitle.includes("reported yes-no") ||
    sourceTitle.includes("reported wh-questions") ||
    sourceTitle.includes("reference words shift") ||
    sourceTitle.includes("tense follows meaning") ||
    sourceTitle.includes("time and deixis")
  ) {
    const split = splitAroundMarker(sentence, titleMarkers);
    if (split && ruleOrder.length >= 3) {
      return buildHighlights(ruleOrder, [split.left, split.marker, split.right]);
    }
    const words = tokenize(sentence);
    const whIndex = words.findIndex((word) => WH_WORDS.includes(normalize(word)));
    if (whIndex >= 1 && ruleOrder.length >= 3) {
      return buildHighlights(ruleOrder, [
        tokensToText(words.slice(0, whIndex)),
        words[whIndex],
        tokensToText(words.slice(whIndex + 1)),
      ]);
    }
  }

  if (
    sourceTitle.includes("reported requests") ||
    sourceTitle.includes("reported orders") ||
    sourceTitle.includes("reported commands")
  ) {
    const words = tokenize(sentence);
    if (words.length >= 4 && ruleOrder.length >= 3) {
      return buildHighlights(ruleOrder, [
        tokensToText(words.slice(0, 2)),
        words[2],
        tokensToText(words.slice(3)),
      ]);
    }
    const clauses = splitMajorClauses(sentence);
    if (clauses.length >= 2) {
      return buildHighlights(ruleOrder, [clauses[0], clauses[1], clauses[2] || ""]);
    }
    return inferSimpleSyntaxHighlights(sentence, ruleOrder);
  }

  return [];
};

const inferVoiceFocusHighlights = (card) => {
  const ruleOrder = card.ruleOrder || [];
  const sourceTitle = normalize(card.sourceTitle);
  const sentence = cleanSentence(card.example);
  const words = tokenize(sentence);

  if (
    sourceTitle.includes("cleft") ||
    sourceTitle.includes("cliv") ||
    sourceTitle.includes("exclusive focus")
  ) {
    const relativeHit = findFirstMarker(sentence, RELATIVE_MARKERS);
    if (relativeHit) {
      const before = stripOuterPunctuation(sentence.slice(0, relativeHit.index));
      const splitWords = tokenize(before);
      if (splitWords.length >= 2) {
        return buildHighlights(ruleOrder, [
          tokensToText(splitWords.slice(0, normalize(splitWords[0]) === "het" ? 2 : 1)),
          tokensToText(splitWords.slice(normalize(splitWords[0]) === "het" ? 2 : 1)),
          sentence.slice(relativeHit.index),
        ]);
      }
    }
  }

  if (sourceTitle.includes("fronting") || sourceTitle.includes("left dislocation")) {
    if (/[ऀ-ॿ]/u.test(sentence) && ruleOrder.length >= 4 && words.length >= 5) {
      return buildHighlights(ruleOrder, [
        tokensToText(words.slice(0, 2)),
        words[2],
        words[3],
        tokensToText(words.slice(4)),
      ]);
    }
    const clauses = splitMajorClauses(sentence);
    if (clauses.length >= 2) {
      const tailWords = tokenize(clauses.slice(1).join(", "));
      if (tailWords.length >= 2) {
        return buildHighlights(ruleOrder, [
          clauses[0],
          tailWords[0],
          tokensToText(tailWords.slice(1)),
        ]);
      }
      return buildHighlights(ruleOrder, [clauses[0], clauses[1], ""]);
    }
    if (words.length >= 4) {
      const focusSize = EUROPEAN_ARTICLES.has(normalize(words[0])) ? 2 : 1;
      return buildHighlights(ruleOrder, [
        tokensToText(words.slice(0, focusSize)),
        words[focusSize],
        tokensToText(words.slice(focusSize + 1)),
      ]);
    }
  }

  if (sourceTitle.includes("passive")) {
    const hit = findFirstMarker(sentence, PASSIVE_MARKERS);
    if (hit) {
      const leftWords = tokenize(sentence.slice(0, hit.index));
      const rightWords = tokenize(sentence.slice(hit.index + hit.marker.length));
      return buildHighlights(ruleOrder, [
        tokensToText(leftWords),
        hit.marker,
        tokensToText(rightWords),
      ]);
    }
  }

  if (sourceTitle.includes("result state")) {
    const hit = findFirstMarker(sentence, COPULA_MARKERS);
    if (hit) {
      return buildHighlights(ruleOrder, [
        stripOuterPunctuation(sentence.slice(0, hit.index)),
        hit.marker,
        stripOuterPunctuation(sentence.slice(hit.index + hit.marker.length)),
      ]);
    }
  }

  if (
    sourceTitle.includes("active clauses") ||
    sourceTitle.includes("voice active") ||
    sourceTitle.includes("foreground the doer")
  ) {
    return inferSimpleSyntaxHighlights(sentence, ruleOrder);
  }

  if (
    sourceTitle.includes("topic") ||
    sourceTitle.includes("focus particles") ||
    sourceTitle.includes("narrow focus")
  ) {
    const clauses = splitMajorClauses(sentence);
    if (clauses.length >= 2) {
      return buildHighlights(ruleOrder, clauses.slice(0, ruleOrder.length));
    }
    return inferSimpleSyntaxHighlights(sentence, ruleOrder);
  }

  return [];
};

const inferConditionHighlights = (card) => {
  const ruleOrder = card.ruleOrder || [];
  const sentence = cleanSentence(card.example);
  const titleMarkers = [...extractTitleMarkers(card.title), ...CONDITION_MARKERS];
  const clauses = splitMajorClauses(sentence);
  const leading = findFirstMarker(sentence, titleMarkers);

  if (/[一-龯]/u.test(sentence) && clauses.length >= 2) {
    const marker = findFirstMarker(clauses[0], CONDITION_MARKERS);
    const resultMarkers = ["就", "也", "否则", "会"];
    const resultMarker = findFirstMarker(clauses[1], resultMarkers);
    if (ruleOrder.length === 4 && marker && resultMarker) {
      return buildHighlights(ruleOrder, [
        marker.marker,
        stripOuterPunctuation(clauses[0].slice(marker.index + marker.marker.length)),
        resultMarker.marker,
        stripOuterPunctuation(clauses[1].slice(resultMarker.index + resultMarker.marker.length)),
      ]);
    }
    if (ruleOrder.length === 5 && marker && resultMarker) {
      return buildHighlights(ruleOrder, [
        marker.marker,
        stripOuterPunctuation(clauses[0].slice(marker.index + marker.marker.length)),
        stripOuterPunctuation(clauses[1].slice(0, resultMarker.index)),
        resultMarker.marker,
        stripOuterPunctuation(clauses[1].slice(resultMarker.index + resultMarker.marker.length)),
      ]);
    }
  }

  if (clauses.length >= 3 && ruleOrder.length === 3) {
    return buildHighlights(ruleOrder, [clauses[0], clauses[1], clauses.slice(2).join(", ")]);
  }

  if (clauses.length >= 2 && leading && leading.index === 0) {
    const head = clauses[0];
    const main = clauses.slice(1).join(", ");
    const marker = findFirstMarker(head, titleMarkers);
    const conditionalBody = marker
      ? stripOuterPunctuation(head.slice(marker.index + marker.marker.length))
      : head;
    if (ruleOrder.length === 2) {
      return buildHighlights(ruleOrder, [head, main]);
    }
    if (ruleOrder.length === 3) {
      return buildHighlights(ruleOrder, [marker?.marker || head, conditionalBody, main]);
    }
    if (ruleOrder.length >= 4) {
      const mainParts = inferSimpleSyntaxHighlights(main, ruleOrder.slice(2));
      const texts = [marker?.marker || head, conditionalBody];
      mainParts.forEach((entry) => texts.push(entry.text));
      return buildHighlights(ruleOrder, texts);
    }
  }

  if (clauses.length >= 2) {
    const tail = clauses.slice(1).join(", ");
    const tailMarker = findFirstMarker(tail, titleMarkers);
    if (tailMarker && ruleOrder.length >= 4) {
      const tailBody = stripOuterPunctuation(tail.slice(tailMarker.index + tailMarker.marker.length));
      return buildHighlights(ruleOrder, [
        ...inferSimpleSyntaxHighlights(clauses[0], ruleOrder.slice(0, 2)).map((entry) => entry.text),
        tailBody,
        tailMarker.marker,
      ]);
    }
    return buildHighlights(ruleOrder, [clauses[0], tail]);
  }

  const inlineSplit = splitAroundMarker(sentence, titleMarkers);
  if (inlineSplit?.left && inlineSplit?.right && ruleOrder.length === 2) {
    return buildHighlights(ruleOrder, [inlineSplit.left, `${inlineSplit.marker} ${inlineSplit.right}`]);
  }

  return [];
};

const inferPronounHighlights = (card) => {
  const ruleOrder = card.ruleOrder || [];
  const sentence = cleanSentence(card.example);
  const sourceTitle = normalize(card.sourceTitle);
  const words = tokenize(sentence);

  if (sourceTitle.includes("possessive suffixes on nouns") && words.length >= 2) {
    const first = words[0];
    return buildHighlights(ruleOrder, [first.slice(0, -1), first.slice(-1), tokensToText(words.slice(1))]);
  }

  if (sourceTitle.includes("attached object pronouns") && words.length >= 2) {
    const first = words[0];
    return buildHighlights(ruleOrder, [first.slice(0, -1), first.slice(-1), words[1]]);
  }

  if (sourceTitle.includes("possessive forms nae and je") && words.length >= 3 && words[2].endsWith("입니다")) {
    return buildHighlights(ruleOrder, [words[0], words[1], words[2].replace(/입니다$/u, ""), "입니다"]);
  }

  return inferSimpleSyntaxHighlights(sentence, ruleOrder);
};

const inferHighlightsForCard = (worldKey, sectionName, card) => {
  if (!SECTION_TARGETS.has(sectionName) || !card || typeof card !== "object") {
    return [];
  }
  if (!Array.isArray(card.ruleOrder) || card.ruleOrder.length < 2 || !String(card.example || "").trim()) {
    return [];
  }

  switch (sectionName) {
    case "Discourse & Flow":
      return inferDiscourseHighlights(card);
    case "Formality & Style":
      return inferFormalityHighlights(card);
    case "Modality":
      return inferModalityHighlights(card);
    case "Reported Speech":
      return inferReportedSpeechHighlights(card);
    case "Voice & Focus":
      return inferVoiceFocusHighlights(card);
    case "Conditions":
      return inferConditionHighlights(card);
    case "Pronouns & Reference":
      return inferPronounHighlights(card);
    default:
      return [];
  }
};

const repairGrammarHighlightsInPack = (pack, worldKey) => {
  const cardsBySection = pack?.grammar?.cards;
  if (!cardsBySection || typeof cardsBySection !== "object") {
    return 0;
  }

  let changed = 0;
  Object.entries(cardsBySection).forEach(([sectionName, cards]) => {
    if (!Array.isArray(cards)) {
      return;
    }
    cards.forEach((card) => {
      const inferred = inferHighlightsForCard(worldKey, sectionName, card);
      if (inferred.length >= 2 && !sameHighlights(card.exampleHighlights || [], inferred)) {
        card.exampleHighlights = inferred;
        changed += 1;
      }
    });
  });
  return changed;
};

module.exports = {
  inferHighlightsForCard,
  repairGrammarHighlightsInPack,
  sameHighlights,
};
