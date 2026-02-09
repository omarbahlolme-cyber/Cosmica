/* ==========================================================================
   BLOAT GUARD
   - Fails on orphaned root assets that are no longer referenced.
   - Enforces an allowlist for known-unused selectors.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

/* --------------------------------------------------------------------------
   PATHS + CONSTANTS
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const ALLOWLIST_PATH = path.join(__dirname, "bloat-allowlist.json");
const ROOT_FILES = fs.readdirSync(ROOT);
const IGNORE_ROOT_FILE_REGEX = /^live_.*\.(?:html|js|css)$/i;
const LOCAL_REF_REGEX = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
const JS_FILE_REF_REGEX = /["']([A-Za-z0-9._/-]+\.(?:js|css|json|html))["']/g;

const ORPHAN_ASSET_EXTENSIONS = new Set([".js", ".css"]);
const ORPHAN_ASSET_EXCLUDE = new Set([
  "server.js",
  "package-lock.json",
  "package.json",
  "style.css",
  "style-maps.css",
  "app.js",
  "app-maps.js",
]);

const CSS_CLASS_REGEX = /(^|[\s>+~,(])\.([A-Za-z_][A-Za-z0-9_-]*)/gm;
const CSS_ID_REGEX = /(^|[\s>+~,(])#([A-Za-z_][A-Za-z0-9_-]*)/gm;
const HTML_CLASS_ATTR_REGEX = /\bclass\s*=\s*["']([^"']+)["']/gi;
const HTML_ID_ATTR_REGEX = /\bid\s*=\s*["']([^"']+)["']/gi;
const JS_SELECTOR_REGEX = /["'`](?:[#.]([A-Za-z_][A-Za-z0-9_-]*))/g;
const HEX_COLOR_TOKEN_REGEX = /^[A-Fa-f0-9]{3,8}$/;
const WRITE_ALLOWLIST = process.argv.includes("--write-allowlist");

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const getRootFilesByExtension = (extensions) =>
  ROOT_FILES
    .filter((name) => !IGNORE_ROOT_FILE_REGEX.test(name))
    .filter((name) => extensions.has(path.extname(name).toLowerCase()))
    .sort();

const readText = (filePath) => fs.readFileSync(filePath, "utf8");

const normalizeRef = (ref) => {
  const clean = ref.split("#")[0].split("?")[0].trim();
  if (!clean) {
    return null;
  }
  if (clean.startsWith("//")) {
    return null;
  }
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(clean)) {
    return null;
  }
  return clean.startsWith("/") ? clean.slice(1) : clean;
};

const collectLocalReferences = () => {
  const referenced = new Set();
  const htmlFiles = ROOT_FILES.filter((name) => name.endsWith(".html"));
  const jsFiles = ROOT_FILES.filter((name) => name.endsWith(".js"));

  for (const htmlFile of htmlFiles.filter((name) => !IGNORE_ROOT_FILE_REGEX.test(name))) {
    const content = readText(path.join(ROOT, htmlFile));
    let match;
    while ((match = LOCAL_REF_REGEX.exec(content)) !== null) {
      const normalized = normalizeRef(match[1]);
      if (normalized) {
        referenced.add(normalized);
      }
    }
  }

  for (const jsFile of jsFiles.filter((name) => !IGNORE_ROOT_FILE_REGEX.test(name))) {
    const content = readText(path.join(ROOT, jsFile));
    let match;
    while ((match = JS_FILE_REF_REGEX.exec(content)) !== null) {
      const normalized = normalizeRef(match[1]);
      if (normalized) {
        referenced.add(normalized);
      }
    }
  }

  return referenced;
};

const collectCssTokens = () => {
  const classes = new Set();
  const ids = new Set();
  const cssFiles = ROOT_FILES.filter((name) => name.endsWith(".css"));

  for (const cssFile of cssFiles) {
    const content = readText(path.join(ROOT, cssFile));
    let classMatch;
    while ((classMatch = CSS_CLASS_REGEX.exec(content)) !== null) {
      classes.add(classMatch[2]);
    }
    let idMatch;
    while ((idMatch = CSS_ID_REGEX.exec(content)) !== null) {
      if (!HEX_COLOR_TOKEN_REGEX.test(idMatch[2])) {
        ids.add(idMatch[2]);
      }
    }
  }

  return { classes, ids };
};

const collectUsedTokens = () => {
  const classes = new Set();
  const ids = new Set();
  const htmlFiles = ROOT_FILES
    .filter((name) => name.endsWith(".html"))
    .filter((name) => !IGNORE_ROOT_FILE_REGEX.test(name));
  const jsFiles = ROOT_FILES
    .filter((name) => name.endsWith(".js"))
    .filter((name) => !IGNORE_ROOT_FILE_REGEX.test(name));

  for (const htmlFile of htmlFiles) {
    const content = readText(path.join(ROOT, htmlFile));
    let classAttr;
    while ((classAttr = HTML_CLASS_ATTR_REGEX.exec(content)) !== null) {
      classAttr[1]
        .split(/\s+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => classes.add(item));
    }

    let idAttr;
    while ((idAttr = HTML_ID_ATTR_REGEX.exec(content)) !== null) {
      ids.add(idAttr[1].trim());
    }
  }

  for (const jsFile of jsFiles) {
    const content = readText(path.join(ROOT, jsFile));
    let selector;
    while ((selector = JS_SELECTOR_REGEX.exec(content)) !== null) {
      const value = selector[1];
      if (!value) {
        continue;
      }
      if (selector[0].includes("#")) {
        ids.add(value);
      } else {
        classes.add(value);
      }
    }
  }

  return { classes, ids };
};

/* --------------------------------------------------------------------------
   CHECKS
   -------------------------------------------------------------------------- */
const findOrphanRootAssets = (referencedFiles) => {
  const candidates = getRootFilesByExtension(ORPHAN_ASSET_EXTENSIONS).filter(
    (name) => !ORPHAN_ASSET_EXCLUDE.has(name)
  );

  return candidates.filter((asset) => !referencedFiles.has(asset));
};

const findPotentiallyUnusedCssTokens = () => {
  const cssTokens = collectCssTokens();
  const usedTokens = collectUsedTokens();

  const unusedClasses = [...cssTokens.classes].filter((item) => !usedTokens.classes.has(item));
  const unusedIds = [...cssTokens.ids].filter((item) => !usedTokens.ids.has(item));

  return {
    classes: unusedClasses.sort(),
    ids: unusedIds.sort(),
  };
};

const loadAllowlist = () => {
  if (!fs.existsSync(ALLOWLIST_PATH)) {
    return { classes: [], ids: [] };
  }
  const parsed = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, "utf8"));
  return {
    classes: Array.isArray(parsed.classes) ? parsed.classes : [],
    ids: Array.isArray(parsed.ids) ? parsed.ids : [],
  };
};

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
const referencedFiles = collectLocalReferences();
const orphanAssets = findOrphanRootAssets(referencedFiles);
const unusedTokens = findPotentiallyUnusedCssTokens();
const allowlist = loadAllowlist();

const failures = [];

if (orphanAssets.length) {
  failures.push(
    `Orphan root assets (not referenced by HTML/JS): ${orphanAssets.join(", ")}`
  );
}

if (WRITE_ALLOWLIST) {
  const nextAllowlist = {
    classes: unusedTokens.classes,
    ids: unusedTokens.ids,
  };
  fs.writeFileSync(ALLOWLIST_PATH, `${JSON.stringify(nextAllowlist, null, 2)}\n`, "utf8");
  console.log(`PASS [bloat] allowlist refreshed: ${path.relative(ROOT, ALLOWLIST_PATH)}`);
  process.exit(0);
}

const allowlistClassSet = new Set(allowlist.classes);
const allowlistIdSet = new Set(allowlist.ids);
const unexpectedClasses = unusedTokens.classes.filter((item) => !allowlistClassSet.has(item));
const unexpectedIds = unusedTokens.ids.filter((item) => !allowlistIdSet.has(item));

if (unexpectedClasses.length) {
  failures.push(
    `Unexpected unused classes (${unexpectedClasses.length}): ${unexpectedClasses.join(", ")}`
  );
}

if (unexpectedIds.length) {
  failures.push(`Unexpected unused ids (${unexpectedIds.length}): ${unexpectedIds.join(", ")}`);
}

if (failures.length) {
  console.error("BLOAT CHECK FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("PASS [bloat] no orphan root JS/CSS assets");
console.log(
  `PASS [bloat] allowlisted unused selectors classes=${unusedTokens.classes.length}, ids=${unusedTokens.ids.length}`
);
