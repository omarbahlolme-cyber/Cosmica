/* ==========================================================================
   GRAMMAR ZERO-TOLERANCE CHECK
   - Validates strict card quality gates against live_french_translations.json.
   - Supports scoped runs by section list or by running all sections before one.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LIVE_PATH = path.join(ROOT, "live_french_translations.json");
const APP_MAPS_PATH = path.join(ROOT, "frontend", "maps", "app-maps.js");

const readJson = (filePath) =>
  JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));

const readText = (filePath) => fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");

const norm = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const sentenceCount = (value) => (String(value || "").match(/[.!?]/g) || []).length;

const hasEndPunctuation = (value) => /[.!?]$/.test(String(value || "").trim());

const tokenize = (value) =>
  norm(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "to",
  "of",
  "in",
  "on",
  "for",
  "and",
  "or",
  "with",
  "by",
  "is",
  "are",
  "be",
  "was",
  "were",
  "that",
  "this",
  "it",
  "as",
  "at",
  "from",
  "can",
  "do",
  "does",
  "did",
  "have",
  "has",
  "had",
  "will",
]);

// Includes a strict "4th-person" pedagogical extension for generic/indefinite reference
// (e.g., "one") in addition to standard person/number agreement checks.
const AGREEMENT_ERROR_PATTERNS = [
  { regex: /\b(i|you|we|they)\s+is\b/i, reason: "use are with plural/you, not is" },
  { regex: /\b(he|she|it)\s+are\b/i, reason: "use is with 3rd person singular, not are" },
  { regex: /\b(i|you|we|they)\s+has\b/i, reason: "use have with plural/you, not has" },
  { regex: /\b(he|she|it)\s+have\b/i, reason: "use has with 3rd person singular, not have" },
  { regex: /\b(i|you|we|they)\s+does\b/i, reason: "use do with non-3rd-singular subjects, not does" },
  { regex: /\b(he|she|it)\s+do\b/i, reason: "use does with 3rd person singular, not do" },
  { regex: /\b(we|you|they)\s+was\b/i, reason: "use were with plural/you, not was" },
  { regex: /\b(i|he|she|it)\s+were\b/i, reason: "use was with singular, not were" },
  { regex: /\bone\s+are\b/i, reason: "use is with generic 'one', not are" },
  { regex: /\bone\s+have\b/i, reason: "use has with generic 'one', not have" },
  { regex: /\bone\s+do\b/i, reason: "use does with generic 'one', not do" },
  { regex: /\bone\s+were\b/i, reason: "use was with generic 'one', not were" },
];

const PRESENT_SIMPLE_3RD_PERSON_CHECK = {
  title: "present simple",
  regex: /\b(he|she|it)\s+[a-z]+s\b/i,
  reason: "present simple must show 3rd person singular agreement (-s/-es)",
};

const TEMPLATE_REQUIREMENTS = [
  {
    title: "present simple",
    requiredParts: ["base verb", "verb-s/-es", "he/she/it"],
  },
  {
    title: "yes no questions",
    requiredParts: ["do/does/did", "subject", "base verb"],
  },
  {
    title: "wh questions",
    requiredParts: ["wh-word", "do/does/did", "subject", "base verb"],
  },
  {
    title: "questions with do",
    requiredParts: ["do/does/did", "subject", "base verb"],
  },
  {
    title: "not with be",
    requiredParts: ["be (am/is/are/was/were)", "not", "complement"],
  },
  {
    title: "not with do",
    requiredParts: ["do/does/did", "not", "base verb"],
  },
  {
    title: "negative short forms",
    requiredParts: ["subject", "don't/doesn't/isn't/aren't"],
  },
  {
    title: "negative words",
    requiredParts: ["no/none/never/nothing", "clause element"],
  },
  {
    title: "negative questions",
    requiredParts: ["don't/doesn't/didn't", "subject", "base verb"],
  },
  {
    title: "limited negatives",
    requiredParts: ["hardly/barely/rarely", "verb"],
  },
  {
    title: "basic connectors",
    requiredParts: ["clause", "and/but/or", "clause"],
  },
  {
    title: "reason and result",
    requiredParts: ["clause", "because", "so"],
  },
  {
    title: "contrast and choice",
    requiredParts: ["clause", "but/although", "either", "or"],
  },
  {
    title: "time connectors",
    requiredParts: ["main clause", "before/after/when", "clause"],
  },
  {
    title: "comparison links",
    requiredParts: ["like/as", "than"],
  },
  {
    title: "adding ideas",
    requiredParts: ["also", "in addition", "clause"],
  },
  {
    title: "ordering ideas",
    requiredParts: ["first", "then", "finally"],
  },
  {
    title: "real conditions",
    requiredParts: ["if", "present simple"],
  },
  {
    title: "future conditions",
    requiredParts: ["if", "present simple", "will", "base verb"],
  },
  {
    title: "unreal present",
    requiredParts: ["if", "past simple", "would", "base verb"],
  },
  {
    title: "unreal past",
    requiredParts: ["if", "past perfect", "would have", "past participle"],
  },
  {
    title: "mixed conditions",
    requiredParts: ["if", "past perfect", "would", "base verb"],
  },
  {
    title: "unless and otherwise",
    requiredParts: ["unless", "present clause"],
  },
  {
    title: "active voice",
    requiredParts: ["doer (subject)", "action verb", "object"],
  },
  {
    title: "passive voice",
    requiredParts: ["receiver/object", "be", "past participle"],
  },
  {
    title: "focus shifts",
    requiredParts: ["fronted focus phrase", "subject", "verb"],
  },
  {
    title: "cleft sentences",
    requiredParts: ["it", "be", "focus", "who/that", "clause"],
  },
  {
    title: "there and it subjects",
    requiredParts: ["there + be", "it + be"],
  },
  {
    title: "ability",
    requiredParts: ["can/could", "base verb"],
  },
  {
    title: "permission",
    requiredParts: ["can/may/could", "subject", "base verb"],
  },
  {
    title: "obligation",
    requiredParts: ["must/have to", "base verb"],
  },
  {
    title: "advice",
    requiredParts: ["should/ought to", "base verb"],
  },
  {
    title: "possibility",
    requiredParts: ["may/might", "base verb"],
  },
  {
    title: "probability",
    requiredParts: ["will", "probably", "base verb"],
  },
  {
    title: "polite requests",
    requiredParts: ["could/would", "subject", "base verb", "object"],
  },
  {
    title: "offers and invitations",
    requiredParts: ["would you like", "noun", "verb"],
  },
  {
    title: "reporting statements",
    requiredParts: ["said", "clause"],
  },
  {
    title: "reporting questions",
    requiredParts: ["asked", "if/whether", "clause"],
  },
  {
    title: "reporting requests",
    requiredParts: ["asked", "object", "to + base verb"],
  },
  {
    title: "reporting commands",
    requiredParts: ["told/ordered", "object", "to + base verb"],
  },
  {
    title: "backshift basics",
    requiredParts: ["reported clause", "present -> past", "would", "could"],
  },
  {
    title: "time place changes",
    requiredParts: ["now -> then", "here -> there", "today -> that day"],
  },
  {
    title: "formal vs informal",
    requiredParts: ["formal request form", "informal request form"],
  },
  {
    title: "contractions",
    requiredParts: ["contraction"],
  },
  {
    title: "polite softening",
    requiredParts: ["could/would", "subject", "base verb"],
  },
  {
    title: "spoken vs written",
    requiredParts: ["written standard sentence"],
  },
  {
    title: "professional style",
    requiredParts: ["polite greeting/closing", "clear request"],
  },
  {
    title: "casual style",
    requiredParts: ["casual greeting", "simple clause"],
  },
  {
    title: "clarity and brevity",
    requiredParts: ["short direct clause"],
  },
  {
    title: "opening and closing",
    requiredParts: ["greeting", "main message", "closing signal"],
  },
  {
    title: "topic shifts",
    requiredParts: ["shift marker", "complete clause"],
  },
  {
    title: "cohesion tools",
    requiredParts: ["clause", "linker", "reference word"],
  },
  {
    title: "sequencing ideas",
    requiredParts: ["first", "then", "clause"],
  },
  {
    title: "clarification moves",
    requiredParts: ["do you mean", "noun phrase"],
  },
  {
    title: "summaries",
    requiredParts: ["in short/to sum up", "main point"],
  },
  {
    title: "emphasis and repetition",
    requiredParts: ["subject", "do/really", "base verb", "key phrase"],
  },
  {
    title: "conversation flow",
    requiredParts: ["listening signal", "turn-taking signal"],
  },
  {
    title: "giving examples",
    requiredParts: ["for example/for instance", "clause"],
  },
  {
    title: "repair and correction",
    requiredParts: ["sorry/i mean", "correction"],
  },
];

const QUESTION_HIGHLIGHT_REQUIREMENTS = [
  {
    title: "yes no questions",
    example: "Do you work here?",
    labels: ["Aux: do", "Subject: you", "Base verb: work"],
  },
  {
    title: "wh questions",
    example: "Where does he live?",
    labels: ["Wh word: where", "Aux: does", "Subject: he", "Base verb: live"],
  },
  {
    title: "questions with be",
    example: "Is the store open?",
    labels: ["Be verb: is", "Subject: the store", "Complement: open"],
  },
  {
    title: "questions with do",
    example: "Did you call her?",
    labels: ["Aux: did", "Subject: you", "Base verb: call"],
  },
  {
    title: "questions with modals",
    example: "Could you help me?",
    labels: ["Modal: could", "Subject: you", "Base verb: help"],
  },
  {
    title: "tag questions",
    example: "You are ready, aren't you?",
    labels: ["Statement: you are ready", "Tag: aren't you"],
  },
  {
    title: "indirect questions",
    example: "Could you tell me where it is?",
    labels: ["Intro: could you tell me", "Wh clause: where it is"],
  },
];

const NEGATION_HIGHLIGHT_REQUIREMENTS = [
  {
    title: "not with be",
    example: "She is not tired.",
    labels: ["Subject: she", "Be verb: is", "Not: not", "Complement: tired"],
  },
  {
    title: "not with do",
    example: "They do not agree.",
    labels: ["Subject: they", "Aux: do", "Not: not", "Base verb: agree"],
  },
  {
    title: "negative short forms",
    example: "I don't know.",
    labels: ["Subject: I", "Aux: don't", "Base verb: know"],
  },
  {
    title: "negative words",
    example: "There is no milk.",
    labels: ["Negative word: no", "Noun: milk"],
  },
  {
    title: "negative questions",
    example: "Don't you want coffee?",
    labels: ["Aux: don't", "Subject: you", "Base verb: want", "Object: coffee"],
  },
  {
    title: "limited negatives",
    example: "He rarely eats out.",
    labels: ["Subject: he", "Negative adverb: rarely", "Verb: eats"],
  },
];

const CONNECTION_HIGHLIGHT_REQUIREMENTS = [
  {
    title: "basic connectors",
    example: "I called, but no one answered.",
    labels: ["Clause 1: I called", "Connector: but", "Clause 2: no one answered"],
  },
  {
    title: "reason and result",
    example: "It rained, so we stayed.",
    labels: ["Reason clause: it rained", "Connector: so", "Result clause: we stayed"],
  },
  {
    title: "contrast and choice",
    example: "She went, although she was tired.",
    labels: ["Clause 1: she went", "Contrast connector: although", "Clause 2: she was tired"],
  },
  {
    title: "time connectors",
    example: "Call me when you arrive.",
    labels: ["Main clause: call me", "Time connector: when", "Clause: you arrive"],
  },
  {
    title: "comparison links",
    example: "This feels like home.",
    labels: ["Subject: this", "Verb: feels", "Comparison: like", "Object: home"],
  },
  {
    title: "adding ideas",
    example: "We also need chairs.",
    labels: ["Addition marker: also", "Clause: need chairs"],
  },
  {
    title: "ordering ideas",
    example: "First we plan, then we act.",
    labels: ["Sequence: first", "Clause: we plan", "Sequence: then", "Clause: we act"],
  },
];

const CONDITION_HIGHLIGHT_REQUIREMENTS = [
  {
    title: "real conditions",
    example: "If you press this, it starts.",
    labels: ["If clause: if you press this", "Result clause: it starts"],
  },
  {
    title: "future conditions",
    example: "If it is sunny, we will go.",
    labels: ["If clause: if it is sunny", "Result clause: we will go"],
  },
  {
    title: "unreal present",
    example: "If I had time, I would help.",
    labels: ["If clause: if i had time", "Would clause: i would help"],
  },
  {
    title: "unreal past",
    example: "If we had left earlier, we would have arrived.",
    labels: [
      "If clause: if we had left earlier",
      "Would have clause: we would have arrived",
    ],
  },
  {
    title: "mixed conditions",
    example: "If she had studied, she would be calm now.",
    labels: ["If clause: if she had studied", "Would clause: she would be calm now"],
  },
  {
    title: "unless and otherwise",
    example: "We will go unless it rains.",
    labels: ["Result clause: we will go", "Unless clause: unless it rains"],
  },
];

const VOICE_HIGHLIGHT_REQUIREMENTS = [
  {
    title: "active voice",
    example: "The chef cooked dinner.",
    labels: ["Doer: the chef", "Action verb: cooked", "Object: dinner"],
  },
  {
    title: "passive voice",
    example: "The meal was cooked.",
    labels: ["Object: the meal", "Be verb: was", "Past participle: cooked"],
  },
  {
    title: "focus shifts",
    example: "That book, I finished yesterday.",
    labels: ["Focus phrase: that book", "Subject: i", "Verb: finished"],
  },
  {
    title: "cleft sentences",
    example: "It is John who called.",
    labels: ["It subject: it is", "Focus phrase: john", "Clause: who called"],
  },
  {
    title: "there and it subjects",
    example: "There is a problem.",
    labels: ["There subject: there is", "Noun: a problem"],
  },
];

const MODALITY_HIGHLIGHT_REQUIREMENTS = [
  {
    title: "ability",
    example: "She can swim.",
    labels: ["Subject: she", "Modal: can", "Base verb: swim"],
  },
  {
    title: "permission",
    example: "May I sit here?",
    labels: ["Modal: may", "Subject: i", "Base verb: sit"],
  },
  {
    title: "obligation",
    example: "You must wear a seatbelt.",
    labels: ["Subject: you", "Modal: must", "Base verb: wear"],
  },
  {
    title: "advice",
    example: "You should rest.",
    labels: ["Subject: you", "Modal: should", "Base verb: rest"],
  },
  {
    title: "possibility",
    example: "It might rain today.",
    labels: ["Modal: might", "Base verb: rain"],
  },
  {
    title: "probability",
    example: "He will probably come.",
    labels: [
      "Subject: he",
      "Modal: will",
      "Probability word: probably",
      "Base verb: come",
    ],
  },
  {
    title: "polite requests",
    example: "Could you open the window?",
    labels: ["Modal: could", "Subject: you", "Base verb: open", "Object: the window"],
  },
  {
    title: "offers and invitations",
    example: "Would you like some tea?",
    labels: ["Modal phrase: would you like", "Object: some tea"],
  },
];

const REPORTED_SPEECH_HIGHLIGHT_REQUIREMENTS = [
  {
    title: "reporting statements",
    example: "She said she was ready.",
    labels: ["Reporting verb: said", "Clause: she was ready"],
  },
  {
    title: "reporting questions",
    example: "He asked if I was okay.",
    labels: ["Reporting verb: asked", "If clause: if I was okay"],
  },
  {
    title: "reporting requests",
    example: "She asked me to wait.",
    labels: ["Reporting verb: asked", "Object: me", "To-infinitive: to wait"],
  },
  {
    title: "reporting commands",
    example: "He told us to leave.",
    labels: ["Reporting verb: told", "Object: us", "To-infinitive: to leave"],
  },
  {
    title: "backshift basics",
    example: "They said they had time.",
    labels: ["Reporting verb: said", "Backshifted clause: they had time"],
  },
  {
    title: "time place changes",
    example: "He said he was there.",
    labels: ["Reporting verb: said", "Shifted phrase: he was there"],
  },
];

const FORMALITY_HIGHLIGHT_REQUIREMENTS = [
  {
    title: "formal vs informal",
    example: "Could you assist me?",
    labels: ["Formal request: could you assist me", "Addressee: you"],
  },
  {
    title: "contractions",
    example: "I can't stay long.",
    labels: ["Subject: I", "Contraction: can't", "Base verb: stay"],
  },
  {
    title: "polite softening",
    example: "Could you close the door?",
    labels: ["Softener: could", "Subject: you", "Base verb: close", "Object: the door"],
  },
  {
    title: "spoken vs written",
    example: "Please see the details below.",
    labels: ["Polite marker: please", "Written clause: see the details below"],
  },
  {
    title: "professional style",
    example: "Thank you for your time.",
    labels: ["Polite closing: thank you", "Noun phrase: your time"],
  },
  {
    title: "casual style",
    example: "Hey, how is it going?",
    labels: ["Casual greeting: hey", "Clause: how is it going"],
  },
  {
    title: "clarity and brevity",
    example: "We need a quick answer.",
    labels: ["Subject: we", "Direct clause: need a quick answer"],
  },
];

const DISCOURSE_HIGHLIGHT_REQUIREMENTS = [
  {
    title: "opening and closing",
    example: "Hi everyone, that is all for today.",
    labels: ["Opening: hi everyone", "Closing: that is all for today"],
  },
  {
    title: "topic shifts",
    example: "By the way, I have news.",
    labels: ["Shift marker: by the way", "New-topic clause: i have news"],
  },
  {
    title: "cohesion tools",
    example: "I bought a book, and it is useful.",
    labels: ["Clause 1: i bought a book", "Linker: and", "Reference: it"],
  },
  {
    title: "sequencing ideas",
    example: "First we pack, then we leave.",
    labels: ["Sequence: first", "Clause 1: we pack", "Sequence: then", "Clause 2: we leave"],
  },
  {
    title: "clarification moves",
    example: "Do you mean the morning meeting?",
    labels: ["Clarification marker: do you mean", "Focus phrase: the morning meeting"],
  },
  {
    title: "summaries",
    example: "In short, we are ready.",
    labels: ["Summary marker: in short", "Main point: we are ready"],
  },
  {
    title: "emphasis and repetition",
    example: "I do need your answer today.",
    labels: ["Emphasis marker: do", "Main clause: need your answer today"],
  },
  {
    title: "conversation flow",
    example: "I see, please continue.",
    labels: ["Listening signal: i see", "Turn signal: please continue"],
  },
  {
    title: "giving examples",
    example: "For example, call the help desk.",
    labels: ["Example marker: for example", "Example clause: call the help desk"],
  },
  {
    title: "repair and correction",
    example: "Sorry, I mean Tuesday, not Monday.",
    labels: [
      "Repair marker: sorry",
      "Correction marker: i mean",
      "Corrected phrase: tuesday, not monday",
    ],
  },
];

const CEFR_BANNED_PATTERNS = [
  /\bnotwithstanding\b/i,
  /\bwhereas\b/i,
  /\bheretofore\b/i,
  /\bthereby\b/i,
  /\bhenceforth\b/i,
  /\binsofar\b/i,
];

const IDIOM_BANNED_PATTERNS = [
  /\bpiece of cake\b/i,
  /\bbreak the ice\b/i,
  /\bhit the sack\b/i,
  /\bonce in a blue moon\b/i,
  /\bunder the weather\b/i,
];

const MAX_WORDS_PER_SENTENCE = 16;
const MAX_SENTENCE_SEGMENTS = 3;
const MAX_TOKEN_EDITS = 6;
const MAX_EDIT_GROUPS = 2;
const MIN_TOKEN_OVERLAP_RATIO = 0.5;

const PASS_LOCK_DEFAULT_SECTIONS = [
  "Sentence Structure",
  "Verbs",
  "Tenses & Aspect",
  "Nouns & Articles",
  "Pronouns & Reference",
  "Modifiers",
  "Questions",
  "Negation",
];

const buildTopicTokenSet = (title, points, example) => {
  const tokens = new Set();
  [title, ...(points || []), example].forEach((item) => {
    tokenize(item).forEach((token) => {
      if (!STOPWORDS.has(token) && token.length >= 3) {
        tokens.add(token);
      }
    });
  });
  return tokens;
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const opts = {
    sections: null,
    beforeSection: null,
  };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--sections") {
      opts.sections = String(args[i + 1] || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      i += 1;
      continue;
    }
    if (arg === "--before-section") {
      opts.beforeSection = String(args[i + 1] || "").trim();
      i += 1;
    }
  }
  return opts;
};

const fail = (failures, message) => failures.push(message);

const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getGrammarTemplate = (appMapsSource, title) => {
  const pattern = new RegExp(`"${escapeRegex(title)}"\\s*:\\s*"([^"]+)"`, "i");
  const match = appMapsSource.match(pattern);
  return match ? String(match[1] || "").trim() : "";
};

const runAgreementChecks = (failures, label, text) => {
  AGREEMENT_ERROR_PATTERNS.forEach((entry) => {
    if (entry.regex.test(String(text || ""))) {
      fail(failures, `${label}: agreement error (${entry.reason}) -> "${text}"`);
    }
  });
};

const parseObjectLiteralFromSource = (source, constName) => {
  const pattern = new RegExp(`const\\s+${escapeRegex(constName)}\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`, "m");
  const match = source.match(pattern);
  if (!match) {
    return {};
  }
  try {
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return ({${match[1]}});`)();
  } catch {
    return {};
  }
};

const extractExampleContracts = (source) => {
  const contracts = {};
  const blockPattern =
    /if\s*\(title\.includes\("([^"]+)"\)\)\s*\{\s*return\s*\[\s*\{\s*labels:\s*\[([\s\S]*?)\],\s*base:\s*"([^"]*)",\s*expanded:\s*"([^"]*)"/g;
  let match = blockPattern.exec(source);
  while (match) {
    const title = String(match[1] || "").trim().toLowerCase();
    const labelsBlock = String(match[2] || "");
    const expanded = String(match[4] || "").trim();
    const labels = [];
    const labelPattern = /"([^"]+)"/g;
    let labelMatch = labelPattern.exec(labelsBlock);
    while (labelMatch) {
      labels.push(String(labelMatch[1] || "").trim());
      labelMatch = labelPattern.exec(labelsBlock);
    }
    if (title && labels.length) {
      contracts[title] = { labels, expanded };
    }
    match = blockPattern.exec(source);
  }
  return contracts;
};

const splitIntoSentenceSegments = (text) =>
  String(text || "")
    .split(/[.!?]/)
    .map((part) => part.trim())
    .filter(Boolean);

const runStyleLinterChecks = (failures, label, text) => {
  const raw = String(text || "");
  if (!raw.trim()) {
    return;
  }
  const segments = splitIntoSentenceSegments(raw);
  if (segments.length > MAX_SENTENCE_SEGMENTS) {
    fail(failures, `${label}: too many sentence segments (${segments.length})`);
  }
  segments.forEach((segment) => {
    const words = tokenize(segment);
    if (words.length > MAX_WORDS_PER_SENTENCE) {
      fail(
        failures,
        `${label}: sentence too long for CEFR target (${words.length} words): "${segment}"`
      );
    }
  });
  if (/[;:]/.test(raw)) {
    fail(failures, `${label}: avoid semicolons/colons in learner-level sentence: "${raw}"`);
  }
  CEFR_BANNED_PATTERNS.forEach((pattern) => {
    if (pattern.test(raw)) {
      fail(failures, `${label}: advanced register word not allowed: "${raw}"`);
    }
  });
  IDIOM_BANNED_PATTERNS.forEach((pattern) => {
    if (pattern.test(raw)) {
      fail(failures, `${label}: idiomatic expression not allowed: "${raw}"`);
    }
  });
};

const computeEditStats = (wrongText, fixText) => {
  const wrongTokens = tokenize(wrongText);
  const fixTokens = tokenize(fixText);
  const m = wrongTokens.length;
  const n = fixTokens.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i += 1) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j += 1) {
    dp[0][j] = j;
  }
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      if (wrongTokens[i - 1] === fixTokens[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }

  const operations = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && wrongTokens[i - 1] === fixTokens[j - 1]) {
      operations.push("M");
      i -= 1;
      j -= 1;
      continue;
    }
    const deletion = i > 0 ? dp[i - 1][j] : Number.POSITIVE_INFINITY;
    const insertion = j > 0 ? dp[i][j - 1] : Number.POSITIVE_INFINITY;
    const substitution = i > 0 && j > 0 ? dp[i - 1][j - 1] : Number.POSITIVE_INFINITY;
    const minNeighbor = Math.min(deletion, insertion, substitution);
    if (substitution === minNeighbor && i > 0 && j > 0) {
      operations.push("S");
      i -= 1;
      j -= 1;
    } else if (deletion === minNeighbor && i > 0) {
      operations.push("D");
      i -= 1;
    } else {
      operations.push("I");
      j -= 1;
    }
  }
  operations.reverse();

  let editGroups = 0;
  let inEdit = false;
  operations.forEach((op) => {
    const isEdit = op !== "M";
    if (isEdit && !inEdit) {
      editGroups += 1;
      inEdit = true;
    } else if (!isEdit) {
      inEdit = false;
    }
  });

  const wrongSet = new Set(wrongTokens);
  const fixSet = new Set(fixTokens);
  let overlap = 0;
  wrongSet.forEach((token) => {
    if (fixSet.has(token)) {
      overlap += 1;
    }
  });
  const overlapRatio = Math.max(wrongSet.size, fixSet.size)
    ? overlap / Math.max(wrongSet.size, fixSet.size)
    : 1;

  return {
    distance: dp[m][n],
    editGroups,
    overlapRatio,
  };
};

const runOneErrorOnlyChecks = (failures, label, wrong, fix) => {
  const stats = computeEditStats(wrong, fix);
  if (stats.distance > MAX_TOKEN_EDITS) {
    fail(failures, `${label}: correction edits too many tokens (${stats.distance})`);
  }
  if (stats.editGroups > MAX_EDIT_GROUPS) {
    fail(failures, `${label}: correction introduces multiple edit groups (${stats.editGroups})`);
  }
  if (stats.overlapRatio < MIN_TOKEN_OVERLAP_RATIO) {
    fail(
      failures,
      `${label}: wrong/fix too different for one-reason correction (overlap ${stats.overlapRatio.toFixed(2)})`
    );
  }
};

const buildTemplateSlotChecks = (template) => {
  const lower = String(template || "").toLowerCase();
  const checks = [];
  if (/\bif\b/.test(lower)) {
    checks.push({ name: "if-marker", regex: /\bif\b/i });
  }
  if (lower.includes("unless")) {
    checks.push({ name: "unless-marker", regex: /\bunless\b/i });
  }
  if (lower.includes("do/does/did")) {
    checks.push({ name: "aux-do", regex: /\b(do|does|did)\b/i });
  }
  if (lower.includes("don't/doesn't/didn't")) {
    checks.push({ name: "aux-neg-do", regex: /\b(don't|doesn't|didn't)\b/i });
  }
  if (lower.includes("be (am/is/are/was/were)") || /\bsubject\s*\+\s*be\b/.test(lower)) {
    checks.push({ name: "be-form", regex: /\b(am|is|are|was|were)\b/i });
  }
  if (/\bnot\b/.test(lower)) {
    checks.push({ name: "not-marker", regex: /\bnot\b|n't/gi });
  }
  if (lower.includes("verb-ing")) {
    checks.push({ name: "verb-ing", regex: /\b[a-z]+ing\b/i });
  }
  if (lower.includes("past participle")) {
    checks.push({
      name: "past-participle",
      regex: /\b[a-z]+(ed|en)\b|\b(been|gone|done|seen|left|known|written|driven|eaten|taken|given)\b/i,
    });
  }
  if (lower.includes("will + base verb")) {
    checks.push({ name: "will-marker", regex: /\bwill\b/i });
  }
  if (lower.includes("would have")) {
    checks.push({ name: "would-have", regex: /\bwould\s+have\b/i });
  }
  if (lower.includes("would + base verb")) {
    checks.push({ name: "would-marker", regex: /\bwould\b/i });
  }
  if (lower.includes("to-infinitive")) {
    checks.push({ name: "to-infinitive", regex: /\bto\s+[a-z]+\b/i });
  }
  if (lower.includes("wh-word")) {
    checks.push({ name: "wh-word", regex: /\b(who|what|where|when|why|how)\b/i });
  }
  if (lower.includes("modal")) {
    checks.push({
      name: "modal",
      regex: /\b(can|could|may|might|must|should|would|will|shall)\b/i,
    });
  }
  if (lower.includes("can/could")) {
    checks.push({ name: "can-could", regex: /\b(can|could)\b/i });
  }
  if (lower.includes("can/may/could")) {
    checks.push({ name: "permission-modal", regex: /\b(can|may|could)\b/i });
  }
  if (lower.includes("must/have to")) {
    checks.push({ name: "obligation-modal", regex: /\bmust\b|\bhave to\b|\bhas to\b|\bhad to\b/i });
  }
  if (lower.includes("should/ought to")) {
    checks.push({ name: "advice-modal", regex: /\bshould\b|\bought to\b/i });
  }
  if (lower.includes("may/might")) {
    checks.push({ name: "possibility-modal", regex: /\bmay\b|\bmight\b/i });
  }
  if (lower.includes("probably")) {
    checks.push({ name: "probability-word", regex: /\bprobably\b/i });
  }
  if (lower.includes("would you like")) {
    checks.push({ name: "would-you-like", regex: /\bwould you like\b/i });
  }
  if (lower.includes("could/would")) {
    checks.push({ name: "request-modal", regex: /\b(could|would)\b/i });
  }
  if (lower.includes("said")) {
    checks.push({ name: "reporting-said", regex: /\bsaid\b/i });
  }
  if (lower.includes("asked")) {
    checks.push({ name: "reporting-asked", regex: /\basked\b/i });
  }
  if (lower.includes("if/whether")) {
    checks.push({ name: "if-whether", regex: /\bif\b|\bwhether\b/i });
  }
  if (lower.includes("told/ordered")) {
    checks.push({ name: "told-ordered", regex: /\b(told|ordered)\b/i });
  }
  if (
    lower.includes("asked + object + to + base verb") ||
    lower.includes("told/ordered + object + to + base verb") ||
    lower.includes("to-infinitive")
  ) {
    checks.push({ name: "to-base-verb", regex: /\bto\s+[a-z]+\b/i });
  }
  if (lower.includes("tag")) {
    checks.push({ name: "tag-form", regex: /,\s*[a-z]+'?t?\s+[a-z]+\?/i });
  }
  if (lower.includes("question")) {
    checks.push({ name: "question-mark", regex: /\?$/ });
  }
  return checks;
};

const runStructuralTemplateChecks = (failures, label, title, template, text) => {
  const rawTemplate = String(template || "").trim();
  if (!rawTemplate) {
    return;
  }
  const alternatives = rawTemplate
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
  const segments = splitIntoSentenceSegments(text);
  const candidateSegments = segments.length ? segments : [String(text || "").trim()];
  if (!alternatives.length) {
    return;
  }

  const alternativeChecks = alternatives.map((alt) => buildTemplateSlotChecks(alt));
  if (alternativeChecks.every((list) => list.length === 0)) {
    return;
  }

  if (alternatives.length === 1) {
    const checks = alternativeChecks[0];
    checks.forEach((check) => {
      const ok = candidateSegments.some((segment) => check.regex.test(String(segment || "").trim()));
      if (!ok) {
        fail(
          failures,
          `${label}: structural check "${check.name}" failed for "${title}" template "${rawTemplate}"`
        );
      }
    });
    return;
  }

  const matchByAlternative = alternatives.map((alt, index) => {
    const checks = alternativeChecks[index];
    if (!checks.length) {
      return true;
    }
    return candidateSegments.some((segment) =>
      checks.every((check) => check.regex.test(String(segment || "").trim()))
    );
  });

  const requireAllAlternatives = candidateSegments.length >= alternatives.length;
  if (requireAllAlternatives) {
    matchByAlternative.forEach((matched, index) => {
      if (!matched) {
        fail(
          failures,
          `${label}: no sentence segment matches template alternative "${alternatives[index]}" for "${title}"`
        );
      }
    });
    return;
  }

  if (!matchByAlternative.some(Boolean)) {
    fail(
      failures,
      `${label}: no sentence segment matches any template alternative for "${title}" (${rawTemplate})`
    );
  }
};

const runConceptWhitelistChecks = (
  failures,
  label,
  title,
  sectionName,
  points,
  wrong,
  fix,
  conceptCueMap,
  sectionTitles
) => {
  const key = String(title || "").toLowerCase();
  const ownCues = Array.isArray(conceptCueMap[key]) ? conceptCueMap[key] : [];
  const fallbackCues = [
    ...tokenize(title).filter((token) => token.length >= 2),
    ...(Array.isArray(points) ? points : [])
      .flatMap((point) => tokenize(point))
      .filter((token) => token.length >= 2),
    ...sectionName
      .split(" ")
      .map((token) => token.trim().toLowerCase())
      .filter((token) => token.length >= 2),
  ];
  const cuePool = [...new Set([...ownCues, ...fallbackCues])];
  if (!cuePool.length) {
    return;
  }
  const combined = `${wrong} ${fix}`;
  const ownHits = cuePool.filter((cue) => norm(combined).includes(norm(cue))).length;
  if (ownHits === 0) {
    fail(failures, `${label}: mistake pair missing title concept cues for "${title}"`);
    return;
  }

  const sectionTitleList = Array.isArray(sectionTitles?.[sectionName])
    ? sectionTitles[sectionName]
    : [];
  let foreignHits = 0;
  sectionTitleList.forEach((otherTitle) => {
    const otherKey = String(otherTitle || "").toLowerCase();
    if (!otherKey || otherKey === key) {
      return;
    }
    const cues = Array.isArray(conceptCueMap[otherKey]) ? conceptCueMap[otherKey] : [];
    cues.forEach((cue) => {
      const normCue = norm(cue);
      if (!normCue || cuePool.some((ownCue) => norm(ownCue) === normCue)) {
        return;
      }
      if (norm(combined).includes(normCue)) {
        foreignHits += 1;
      }
    });
  });
  if (foreignHits >= 6 && ownHits <= 1) {
    fail(
      failures,
      `${label}: mistake pair drifts to other concepts (own cues ${ownHits}, foreign cues ${foreignHits})`
    );
  }
};

const runHighlightContractChecks = (failures, contracts) => {
  Object.entries(contracts || {}).forEach(([title, contract]) => {
    const labels = Array.isArray(contract?.labels) ? contract.labels : [];
    const expanded = String(contract?.expanded || "");
    if (labels.length < 2) {
      fail(failures, `highlight contract (${title}): at least 2 labels required`);
      return;
    }
    const functionToTexts = new Map();
    labels.forEach((label) => {
      const raw = String(label || "").trim();
      if (!raw.includes(":")) {
        fail(failures, `highlight contract (${title}): label missing function separator ":" -> "${raw}"`);
        return;
      }
      const [fnPart, textPart] = raw.split(":");
      const fn = String(fnPart || "").trim().toLowerCase();
      const txt = String(textPart || "").trim();
      if (!fn || !txt) {
        fail(failures, `highlight contract (${title}): invalid label "${raw}"`);
        return;
      }
      if (!norm(expanded).includes(norm(txt))) {
        fail(
          failures,
          `highlight contract (${title}): label text "${txt}" not found in example "${expanded}"`
        );
      }
      const texts = functionToTexts.get(fn) || new Set();
      texts.add(norm(txt));
      functionToTexts.set(fn, texts);
    });
    // Guard against accidental semantic collisions in labels (same text mapped to many functions).
    const textToFunction = new Map();
    labels.forEach((label) => {
      const [fnPart, textPart] = String(label || "").split(":");
      const fn = String(fnPart || "").trim().toLowerCase();
      const txt = norm(textPart || "");
      if (!fn || !txt) {
        return;
      }
      const existing = textToFunction.get(txt);
      if (existing && existing !== fn) {
        fail(
          failures,
          `highlight contract (${title}): text "${textPart.trim()}" mapped to multiple functions (${existing}, ${fn})`
        );
      } else {
        textToFunction.set(txt, fn);
      }
    });
  });
};

const main = () => {
  const opts = parseArgs();
  const live = readJson(LIVE_PATH);
  const appMapsSource = readText(APP_MAPS_PATH);
  const cardsBySection = live?.grammar?.cards || {};
  const sectionNames = Object.keys(cardsBySection);
  let targetSections = sectionNames.slice();

  if (Array.isArray(opts.sections) && opts.sections.length) {
    targetSections = opts.sections;
  } else if (opts.beforeSection) {
    const idx = sectionNames.indexOf(opts.beforeSection);
    if (idx < 0) {
      console.error(`FAIL [grammar-zero-tolerance] unknown section: ${opts.beforeSection}`);
      process.exit(1);
    }
    targetSections = sectionNames.slice(0, idx);
  }

  const failures = [];
  const worldSource = live?.worldSource || {};
  const worldPoints = worldSource?.grammarPoints || {};
  const worldExamples = worldSource?.grammarExamples || {};
  const worldWrong = worldSource?.grammarMistakeWrong || {};
  const worldFix = worldSource?.grammarMistakeFix || {};
  const conceptCueMap = parseObjectLiteralFromSource(appMapsSource, "GRAMMAR_MISTAKE_TOPIC_CUES");
  const exampleContracts = extractExampleContracts(appMapsSource);
  const sectionTitles = {};
  Object.entries(cardsBySection).forEach(([sectionName, cards]) => {
    sectionTitles[sectionName] = (Array.isArray(cards) ? cards : [])
      .map((card) => String(card?.sourceTitle || "").trim().toLowerCase())
      .filter(Boolean);
  });
  runHighlightContractChecks(failures, exampleContracts);

  TEMPLATE_REQUIREMENTS.forEach((entry) => {
    const template = getGrammarTemplate(appMapsSource, entry.title).toLowerCase();
    if (!template) {
      fail(failures, `app-maps: missing GRAMMAR_TEMPLATES entry for "${entry.title}"`);
      return;
    }
    entry.requiredParts.forEach((part) => {
      if (!template.includes(part)) {
        fail(
          failures,
          `app-maps: ${entry.title} template missing "${part}" (found: "${template}")`
        );
      }
    });
  });

  QUESTION_HIGHLIGHT_REQUIREMENTS.forEach((entry) => {
    const contract = exampleContracts[String(entry.title || "").toLowerCase()];
    if (!contract) {
      fail(failures, `app-maps: missing question example builder block for "${entry.title}"`);
      return;
    }
    if (norm(contract.expanded) !== norm(entry.example)) {
      fail(
        failures,
        `app-maps: question example mismatch for "${entry.title}" (expected "${entry.example}")`
      );
    }
    entry.labels.forEach((label) => {
      const hasLabel = (contract.labels || []).some((item) => norm(item) === norm(label));
      if (!hasLabel) {
        fail(
          failures,
          `app-maps: missing question highlight label "${label}" for "${entry.title}"`
        );
      }
    });
  });

  NEGATION_HIGHLIGHT_REQUIREMENTS.forEach((entry) => {
    const contract = exampleContracts[String(entry.title || "").toLowerCase()];
    if (!contract) {
      fail(failures, `app-maps: missing negation example builder block for "${entry.title}"`);
      return;
    }
    if (norm(contract.expanded) !== norm(entry.example)) {
      fail(
        failures,
        `app-maps: negation example mismatch for "${entry.title}" (expected "${entry.example}")`
      );
    }
    entry.labels.forEach((label) => {
      const hasLabel = (contract.labels || []).some((item) => norm(item) === norm(label));
      if (!hasLabel) {
        fail(
          failures,
          `app-maps: missing negation highlight label "${label}" for "${entry.title}"`
        );
      }
    });
  });

  CONNECTION_HIGHLIGHT_REQUIREMENTS.forEach((entry) => {
    const contract = exampleContracts[String(entry.title || "").toLowerCase()];
    if (!contract) {
      fail(failures, `app-maps: missing connection example builder block for "${entry.title}"`);
      return;
    }
    if (norm(contract.expanded) !== norm(entry.example)) {
      fail(
        failures,
        `app-maps: connection example mismatch for "${entry.title}" (expected "${entry.example}")`
      );
    }
    entry.labels.forEach((label) => {
      const hasLabel = (contract.labels || []).some((item) => norm(item) === norm(label));
      if (!hasLabel) {
        fail(
          failures,
          `app-maps: missing connection highlight label "${label}" for "${entry.title}"`
        );
      }
    });
  });

  CONDITION_HIGHLIGHT_REQUIREMENTS.forEach((entry) => {
    const contract = exampleContracts[String(entry.title || "").toLowerCase()];
    if (!contract) {
      fail(failures, `app-maps: missing condition example builder block for "${entry.title}"`);
      return;
    }
    if (norm(contract.expanded) !== norm(entry.example)) {
      fail(
        failures,
        `app-maps: condition example mismatch for "${entry.title}" (expected "${entry.example}")`
      );
    }
    entry.labels.forEach((label) => {
      const hasLabel = (contract.labels || []).some((item) => norm(item) === norm(label));
      if (!hasLabel) {
        fail(
          failures,
          `app-maps: missing condition highlight label "${label}" for "${entry.title}"`
        );
      }
    });
  });

  VOICE_HIGHLIGHT_REQUIREMENTS.forEach((entry) => {
    const contract = exampleContracts[String(entry.title || "").toLowerCase()];
    if (!contract) {
      fail(failures, `app-maps: missing voice example builder block for "${entry.title}"`);
      return;
    }
    if (norm(contract.expanded) !== norm(entry.example)) {
      fail(
        failures,
        `app-maps: voice example mismatch for "${entry.title}" (expected "${entry.example}")`
      );
    }
    entry.labels.forEach((label) => {
      const hasLabel = (contract.labels || []).some((item) => norm(item) === norm(label));
      if (!hasLabel) {
        fail(
          failures,
          `app-maps: missing voice highlight label "${label}" for "${entry.title}"`
        );
      }
    });
  });

  MODALITY_HIGHLIGHT_REQUIREMENTS.forEach((entry) => {
    const contract = exampleContracts[String(entry.title || "").toLowerCase()];
    if (!contract) {
      fail(failures, `app-maps: missing modality example builder block for "${entry.title}"`);
      return;
    }
    if (norm(contract.expanded) !== norm(entry.example)) {
      fail(
        failures,
        `app-maps: modality example mismatch for "${entry.title}" (expected "${entry.example}")`
      );
    }
    entry.labels.forEach((label) => {
      const hasLabel = (contract.labels || []).some((item) => norm(item) === norm(label));
      if (!hasLabel) {
        fail(
          failures,
          `app-maps: missing modality highlight label "${label}" for "${entry.title}"`
        );
      }
    });
  });

  REPORTED_SPEECH_HIGHLIGHT_REQUIREMENTS.forEach((entry) => {
    const contract = exampleContracts[String(entry.title || "").toLowerCase()];
    if (!contract) {
      fail(failures, `app-maps: missing reported-speech example builder block for "${entry.title}"`);
      return;
    }
    if (norm(contract.expanded) !== norm(entry.example)) {
      fail(
        failures,
        `app-maps: reported-speech example mismatch for "${entry.title}" (expected "${entry.example}")`
      );
    }
    entry.labels.forEach((label) => {
      const hasLabel = (contract.labels || []).some((item) => norm(item) === norm(label));
      if (!hasLabel) {
        fail(
          failures,
          `app-maps: missing reported-speech highlight label "${label}" for "${entry.title}"`
        );
      }
    });
  });

  FORMALITY_HIGHLIGHT_REQUIREMENTS.forEach((entry) => {
    const contract = exampleContracts[String(entry.title || "").toLowerCase()];
    if (!contract) {
      fail(failures, `app-maps: missing formality example builder block for "${entry.title}"`);
      return;
    }
    if (norm(contract.expanded) !== norm(entry.example)) {
      fail(
        failures,
        `app-maps: formality example mismatch for "${entry.title}" (expected "${entry.example}")`
      );
    }
    entry.labels.forEach((label) => {
      const hasLabel = (contract.labels || []).some((item) => norm(item) === norm(label));
      if (!hasLabel) {
        fail(
          failures,
          `app-maps: missing formality highlight label "${label}" for "${entry.title}"`
        );
      }
    });
  });

  DISCOURSE_HIGHLIGHT_REQUIREMENTS.forEach((entry) => {
    const contract = exampleContracts[String(entry.title || "").toLowerCase()];
    if (!contract) {
      fail(failures, `app-maps: missing discourse example builder block for "${entry.title}"`);
      return;
    }
    if (norm(contract.expanded) !== norm(entry.example)) {
      fail(
        failures,
        `app-maps: discourse example mismatch for "${entry.title}" (expected "${entry.example}")`
      );
    }
    entry.labels.forEach((label) => {
      const hasLabel = (contract.labels || []).some((item) => norm(item) === norm(label));
      if (!hasLabel) {
        fail(
          failures,
          `app-maps: missing discourse highlight label "${label}" for "${entry.title}"`
        );
      }
    });
  });

  targetSections.forEach((sectionName) => {
    const cards = cardsBySection[sectionName];
    if (!Array.isArray(cards) || cards.length === 0) {
      fail(failures, `${sectionName}: cards missing or empty`);
      return;
    }

    const seenTitles = new Set();
    const expectedPoints = new Set();
    const expectedExamples = new Set();
    const expectedWrong = new Set();
    const expectedFix = new Set();
    cards.forEach((card, index) => {
      const label = `${sectionName}#${index + 1}`;
      const title = String(card?.sourceTitle || "").trim();
      const points = Array.isArray(card?.sourcePoints) ? card.sourcePoints : [];
      const example = String(card?.sourceExample || "").trim();
      const mistakes = Array.isArray(card?.mistakes) ? card.mistakes : [];
      const wrong = String(mistakes?.[0]?.sourceWrong || "").trim();
      const fix = String(mistakes?.[0]?.sourceFix || "").trim();

      if (!title) {
        fail(failures, `${label}: missing sourceTitle`);
      } else if (seenTitles.has(title.toLowerCase())) {
        fail(failures, `${label}: duplicate sourceTitle "${title}"`);
      } else {
        seenTitles.add(title.toLowerCase());
      }

      if (points.length < 2) {
        fail(failures, `${label}: must contain at least 2 sourcePoints`);
      }
      points.forEach((point, pointIndex) => {
        if (!String(point || "").trim()) {
          fail(failures, `${label}: sourcePoints[${pointIndex}] is empty`);
        }
      });

      if (!example) {
        fail(failures, `${label}: missing sourceExample`);
      }
      runAgreementChecks(failures, `${label} example`, example);
      runStyleLinterChecks(failures, `${label} example`, example);

      const template = getGrammarTemplate(appMapsSource, String(title || "").toLowerCase());
      runStructuralTemplateChecks(failures, `${label} example`, title, template, example);

      if (mistakes.length !== 1) {
        fail(failures, `${label}: must contain exactly 1 mistake pair`);
      }
      if (!wrong || !fix) {
        fail(failures, `${label}: mistake pair missing wrong/fix text`);
      } else {
        if (norm(wrong) === norm(fix)) {
          fail(failures, `${label}: wrong and fix are identical`);
        }
        if (!hasEndPunctuation(wrong)) {
          fail(failures, `${label}: wrong must end with punctuation`);
        }
        if (!hasEndPunctuation(fix)) {
          fail(failures, `${label}: fix must end with punctuation`);
        }
        if (sentenceCount(wrong) > 1) {
          fail(failures, `${label}: wrong must contain one sentence`);
        }
        if (sentenceCount(fix) > 1) {
          fail(failures, `${label}: fix must contain one sentence`);
        }
        runAgreementChecks(failures, `${label} fix`, fix);
        runStyleLinterChecks(failures, `${label} wrong`, wrong);
        runStyleLinterChecks(failures, `${label} fix`, fix);
        runOneErrorOnlyChecks(failures, `${label} wrong->fix`, wrong, fix);
        runStructuralTemplateChecks(failures, `${label} fix`, title, template, fix);
      }

      if (String(title || "").toLowerCase() === PRESENT_SIMPLE_3RD_PERSON_CHECK.title) {
        const checkText = `${example} ${fix}`;
        if (!PRESENT_SIMPLE_3RD_PERSON_CHECK.regex.test(checkText)) {
          fail(
            failures,
            `${label}: ${PRESENT_SIMPLE_3RD_PERSON_CHECK.reason} (example/fix: "${checkText.trim()}")`
          );
        }
      }

      const topicTokens = buildTopicTokenSet(title, points, example);
      const mistakeTokens = new Set([...tokenize(wrong), ...tokenize(fix)]);
      let overlap = 0;
      topicTokens.forEach((token) => {
        if (mistakeTokens.has(token)) {
          overlap += 1;
        }
      });
      if (overlap === 0) {
        fail(failures, `${label}: mistake pair appears off-topic`);
      }
      runConceptWhitelistChecks(
        failures,
        `${label}`,
        title,
        sectionName,
        points,
        wrong,
        fix,
        conceptCueMap,
        sectionTitles
      );

      const wsPoints = worldPoints?.[sectionName] || {};
      points.forEach((point) => {
        if (!Object.prototype.hasOwnProperty.call(wsPoints, point)) {
          fail(failures, `${label}: worldSource missing point key "${point}"`);
        }
        expectedPoints.add(point);
      });
      const wsExamples = worldExamples?.[sectionName] || {};
      if (!Object.prototype.hasOwnProperty.call(wsExamples, example.toLowerCase())) {
        fail(failures, `${label}: worldSource missing example key "${example.toLowerCase()}"`);
      }
      expectedExamples.add(example.toLowerCase());
      const wsWrong = worldWrong?.[sectionName] || {};
      if (!Object.prototype.hasOwnProperty.call(wsWrong, wrong.toLowerCase())) {
        fail(failures, `${label}: worldSource missing wrong key "${wrong.toLowerCase()}"`);
      }
      expectedWrong.add(wrong.toLowerCase());
      const wsFix = worldFix?.[sectionName] || {};
      if (!Object.prototype.hasOwnProperty.call(wsFix, fix.toLowerCase())) {
        fail(failures, `${label}: worldSource missing fix key "${fix.toLowerCase()}"`);
      }
      expectedFix.add(fix.toLowerCase());
    });

    const wsPointsKeys = Object.keys(worldPoints?.[sectionName] || {});
    wsPointsKeys.forEach((key) => {
      if (!expectedPoints.has(key)) {
        fail(failures, `${sectionName}: stale worldSource point key "${key}"`);
      }
    });
    const wsExampleKeys = Object.keys(worldExamples?.[sectionName] || {}).map((key) =>
      String(key || "").toLowerCase()
    );
    wsExampleKeys.forEach((key) => {
      if (!expectedExamples.has(key)) {
        fail(failures, `${sectionName}: stale worldSource example key "${key}"`);
      }
    });
    const wsWrongKeys = Object.keys(worldWrong?.[sectionName] || {}).map((key) =>
      String(key || "").toLowerCase()
    );
    wsWrongKeys.forEach((key) => {
      if (!expectedWrong.has(key)) {
        fail(failures, `${sectionName}: stale worldSource wrong key "${key}"`);
      }
    });
    const wsFixKeys = Object.keys(worldFix?.[sectionName] || {}).map((key) =>
      String(key || "").toLowerCase()
    );
    wsFixKeys.forEach((key) => {
      if (!expectedFix.has(key)) {
        fail(failures, `${sectionName}: stale worldSource fix key "${key}"`);
      }
    });
  });

  if (failures.length) {
    console.error("FAIL [grammar-zero-tolerance] issues detected:");
    failures.forEach((entry) => console.error(`- ${entry}`));
    process.exit(1);
  }

  console.log(
    `PASS [grammar-zero-tolerance] ${targetSections.length} sections validated (${targetSections.join(
      ", "
    )})`
  );
};

main();
