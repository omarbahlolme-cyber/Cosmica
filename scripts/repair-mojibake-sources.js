const fs = require("fs");
const path = require("path");
const vm = require("vm");

const { repairDeepText, repairMojibake } = require("./lib/mojibake");

const ROOT = path.resolve(__dirname, "..");

const LITERAL_TARGETS = [
  {
    file: "scripts/generate-localized-seo-pages.js",
    constNames: ["LOCALIZED_SEO_TEXT", "PAGES"],
  },
  {
    file: "scripts/generate-seo-landing-pages.js",
    constNames: ["LANGUAGES"],
  },
  {
    file: "frontend/app.js",
    constNames: [
      "LETTERS_HELPER_NATIVE_TEXT",
      "HINDI_ROMANIZATION_VARIANTS",
      "LETTER_ROMANIZATION_MAP",
      "BASE_LANGUAGE_NATIVE_LABELS",
      "LETTER_SPEECH_MAP",
      "WORLD_LETTER_SPEECH_OVERRIDES",
    ],
  },
];

const WHOLE_FILE_TARGETS = ["frontend/app.js"];
const WHOLE_DIR_TARGETS = [{ dir: "frontend", extensions: [".html"] }];

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

const rewriteLiteralTargets = (relativePath, constNames) => {
  const filePath = path.join(ROOT, relativePath);
  let source = fs.readFileSync(filePath, "utf8");
  let changed = false;

  const ranges = constNames
    .map((constName) => ({ constName, ...findLiteralRange(source, constName) }))
    .sort((a, b) => a.start - b.start);

  const evaluationContext = { Object };
  const replacements = [];

  ranges.forEach(({ constName, start, end }) => {
    const literal = source.slice(start, end);
    const parsed = vm.runInNewContext(`(${literal})`, evaluationContext);
    const repaired = repairDeepText(parsed);
    const replacement = JSON.stringify(repaired, null, 2);
    evaluationContext[constName] = repaired;
    if (replacement !== literal) {
      replacements.push({ constName, start, end, replacement });
    }
  });

  replacements
    .sort((a, b) => b.start - a.start)
    .forEach(({ constName, start, end, replacement }) => {
      source = `${source.slice(0, start)}${replacement}${source.slice(end)}`;
      changed = true;
      console.log(`Repaired literal ${constName} in ${relativePath}`);
    });

  if (changed) {
    fs.writeFileSync(filePath, `${source}\n`, "utf8");
  }

  return changed;
};

const rewriteWholeFile = (relativePath) => {
  const filePath = path.join(ROOT, relativePath);
  const original = fs.readFileSync(filePath, "utf8");
  const repaired = repairMojibake(original);
  if (repaired !== original) {
    fs.writeFileSync(filePath, repaired, "utf8");
    console.log(`Repaired file ${relativePath}`);
    return true;
  }
  return false;
};

const rewriteWholeDir = (relativeDir, extensions) => {
  const dirPath = path.join(ROOT, relativeDir);
  if (!fs.existsSync(dirPath)) {
    return 0;
  }

  let changedCount = 0;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const relativePath = path.join(relativeDir, entry.name).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      changedCount += rewriteWholeDir(relativePath, extensions);
      continue;
    }
    if (!extensions.some((ext) => entry.name.toLowerCase().endsWith(ext))) {
      continue;
    }
    if (rewriteWholeFile(relativePath)) {
      changedCount += 1;
    }
  }
  return changedCount;
};

let changedCount = 0;

LITERAL_TARGETS.forEach(({ file, constNames }) => {
  if (rewriteLiteralTargets(file, constNames)) {
    changedCount += 1;
  }
});

WHOLE_FILE_TARGETS.forEach((file) => {
  if (rewriteWholeFile(file)) {
    changedCount += 1;
  }
});

WHOLE_DIR_TARGETS.forEach(({ dir, extensions }) => {
  changedCount += rewriteWholeDir(dir, extensions);
});

console.log(`Mojibake repair updated ${changedCount} files.`);
