/* ==========================================================================
   GRAMMAR PEER REVIEW CHECK (independent pass)
   - Second-pass deterministic reviewer for pedagogical quality.
   - Designed to run alongside check-grammar-zero-tolerance.js.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LIVE_PATH = path.join(ROOT, "live_french_translations.json");

const readJson = (filePath) =>
  JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));

const norm = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value) => norm(value).split(" ").filter(Boolean);

const sentenceCount = (value) => (String(value || "").match(/[.!?]/g) || []).length;
const hasEndPunctuation = (value) => /[.!?]$/.test(String(value || "").trim());

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

const startsUppercase = (value) => /^[A-Z]/.test(String(value || "").trim());
const hasDoubledWord = (value) => /\b([a-z']+)\s+\1\b/i.test(String(value || ""));

const BAD_FIX_PATTERNS = [
  /\b(i|you|we|they)\s+is\b/i,
  /\b(he|she|it)\s+are\b/i,
  /\b(i|you|we|they)\s+has\b/i,
  /\b(he|she|it)\s+have\b/i,
  /\b(he|she|it)\s+do\b/i,
  /\b(i|you|we|they)\s+does\b/i,
];

const CEFR_SOFT_BAN = [
  /\bnotwithstanding\b/i,
  /\btherein\b/i,
  /\bhenceforth\b/i,
  /\bwhereas\b/i,
];

const main = () => {
  const opts = parseArgs();
  const live = readJson(LIVE_PATH);
  const cardsBySection = live?.grammar?.cards || {};
  const sectionNames = Object.keys(cardsBySection);
  let targetSections = sectionNames.slice();

  if (Array.isArray(opts.sections) && opts.sections.length) {
    targetSections = opts.sections;
  } else if (opts.beforeSection) {
    const idx = sectionNames.indexOf(opts.beforeSection);
    if (idx < 0) {
      console.error(`FAIL [grammar-peer-review] unknown section: ${opts.beforeSection}`);
      process.exit(1);
    }
    targetSections = sectionNames.slice(0, idx);
  }

  const failures = [];

  targetSections.forEach((sectionName) => {
    const cards = cardsBySection[sectionName];
    if (!Array.isArray(cards) || cards.length === 0) {
      fail(failures, `${sectionName}: cards missing or empty`);
      return;
    }

    cards.forEach((card, index) => {
      const label = `${sectionName}#${index + 1}`;
      const title = String(card?.sourceTitle || "").trim();
      const points = Array.isArray(card?.sourcePoints) ? card.sourcePoints : [];
      const example = String(card?.sourceExample || "").trim();
      const mistakes = Array.isArray(card?.mistakes) ? card.mistakes : [];
      const wrong = String(mistakes?.[0]?.sourceWrong || "").trim();
      const fix = String(mistakes?.[0]?.sourceFix || "").trim();

      if (!title || tokenize(title).length < 1) {
        fail(failures, `${label}: title is missing`);
      }

      if (points.length < 2 || points.length > 4) {
        fail(failures, `${label}: expected 2-4 pedagogy rule points`);
      }
      points.forEach((point, pointIndex) => {
        const text = String(point || "").trim();
        if (!text) {
          fail(failures, `${label}: empty point at index ${pointIndex}`);
        } else if (!/[a-z]/i.test(text)) {
          fail(failures, `${label}: non-linguistic point text "${text}"`);
        }
      });

      if (!example) {
        fail(failures, `${label}: missing example`);
      } else {
        if (!startsUppercase(example)) {
          fail(failures, `${label}: example should start with uppercase`);
        }
        if (!hasEndPunctuation(example)) {
          fail(failures, `${label}: example must end with punctuation`);
        }
        if (sentenceCount(example) > 3) {
          fail(failures, `${label}: example too long (${sentenceCount(example)} sentences)`);
        }
        if (hasDoubledWord(example)) {
          fail(failures, `${label}: example has repeated adjacent words`);
        }
      }

      if (mistakes.length !== 1 || !wrong || !fix) {
        fail(failures, `${label}: must contain exactly one wrong/fix pair`);
      } else {
        if (!startsUppercase(wrong) || !startsUppercase(fix)) {
          fail(failures, `${label}: wrong/fix should start with uppercase`);
        }
        if (!hasEndPunctuation(wrong) || !hasEndPunctuation(fix)) {
          fail(failures, `${label}: wrong/fix must end with punctuation`);
        }
        if (sentenceCount(wrong) !== 1 || sentenceCount(fix) !== 1) {
          fail(failures, `${label}: wrong/fix must be one sentence each`);
        }
        if (norm(wrong) === norm(fix)) {
          fail(failures, `${label}: wrong/fix are identical`);
        }
        if (hasDoubledWord(wrong) || hasDoubledWord(fix)) {
          fail(failures, `${label}: wrong/fix contains repeated adjacent words`);
        }
        BAD_FIX_PATTERNS.forEach((pattern) => {
          if (pattern.test(fix)) {
            fail(failures, `${label}: fix still contains agreement error -> "${fix}"`);
          }
        });
      }

      CEFR_SOFT_BAN.forEach((pattern) => {
        if (pattern.test(`${example} ${wrong} ${fix}`)) {
          fail(failures, `${label}: advanced register vocabulary detected`);
        }
      });

      const conceptSet = new Set([
        ...tokenize(title),
        ...points.flatMap((p) => tokenize(p)),
        ...tokenize(example),
      ]);
      const fixTokens = tokenize(fix);
      const overlap = fixTokens.filter(
        (token) => conceptSet.has(token) && token.length >= 3
      ).length;
      if (overlap === 0) {
        fail(failures, `${label}: fix appears off-topic vs title/rules`);
      }
    });
  });

  if (failures.length) {
    console.error("FAIL [grammar-peer-review] issues detected:");
    failures.forEach((entry) => console.error(`- ${entry}`));
    process.exit(1);
  }

  console.log(
    `PASS [grammar-peer-review] ${targetSections.length} sections validated (${targetSections.join(
      ", "
    )})`
  );
};

main();
