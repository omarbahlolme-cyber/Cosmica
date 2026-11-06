/* ==========================================================================
   ASSET VERSION CONSISTENCY CHECK
   - Enforces versioned CSS/JS query params in HTML asset tags.
   - Ensures each shared asset uses one consistent version value site-wide.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const { calculateAssetVersion } = require("./lib/asset-version");

/* --------------------------------------------------------------------------
   PATHS + CONFIG
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const FRONTEND_ROOT = path.join(ROOT, "frontend");
const EXPECTED_ASSET_VERSION = calculateAssetVersion(ROOT);
const shouldSkipHtmlFile = (name) => {
  const lower = String(name || "").toLowerCase();
  return (
    lower === "admin-security.html" ||
    lower.startsWith("live_") ||
    /^naver[a-z0-9]+\.html$/i.test(lower) ||
    /^google[a-z0-9]+\.html$/i.test(lower) ||
    /^bing[a-z0-9]+\.html$/i.test(lower) ||
    /^baidu_verify_[a-z0-9]+\.html$/i.test(lower)
  );
};
const htmlFiles = fs
  .readdirSync(FRONTEND_ROOT, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => name.toLowerCase().endsWith(".html"))
  .filter((name) => !shouldSkipHtmlFile(name))
  .sort();
const htmlSources = new Map(
  htmlFiles.map((fileName) => [
    fileName,
    fs.readFileSync(path.join(FRONTEND_ROOT, fileName), "utf8"),
  ])
);
const standaloneFiles = new Set(
  htmlFiles.filter((fileName) =>
    /<html\b[^>]*\bdata-runtime\s*=\s*["']standalone["']/i.test(htmlSources.get(fileName))
  )
);
const sharedPageCount = htmlFiles.length - standaloneFiles.size;

const ASSET_RULES = [
  { file: "style.css", attr: "href", required: true },
  { file: "app.js", attr: "src", required: true },
  { file: "maps/style-maps.css", attr: "href", required: false },
];

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const collectAssetMatches = (htmlContent, assetFile, attrName) => {
  const pattern = new RegExp(
    `${attrName}\\s*=\\s*["']${escapeRegex(assetFile)}(?:\\?v=([^"']+))?["']`,
    "gi"
  );
  const versions = [];
  let match;
  while ((match = pattern.exec(htmlContent)) !== null) {
    versions.push(match[1] ? match[1].trim() : "");
  }
  return versions;
};

// Independent learning tools opt in explicitly and validate their own local assets.
const collectStandaloneAssets = (htmlContent) => {
  const readAttribute = (tag, name) => {
    const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"));
    return match ? match[1] : "";
  };
  const assets = [];
  const tags = htmlContent.match(/<(?:link|script)\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const script = /^<script\b/i.test(tag);
    if (!script && !/(?:^|\s)stylesheet(?:\s|$)/i.test(readAttribute(tag, "rel"))) {
      continue;
    }
    const reference = readAttribute(tag, script ? "src" : "href");
    if (!reference || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)) {
      continue;
    }
    assets.push({ reference, extension: script ? ".js" : ".css" });
  }
  return assets;
};

const validateStandaloneAssets = (fileName, content, failures) => {
  const assets = collectStandaloneAssets(content);
  for (const extension of [".css", ".js"]) {
    if (!assets.some((asset) => asset.extension === extension)) {
      failures.push(`${fileName}: standalone page requires a local ${extension} asset`);
    }
  }
  for (const { reference, extension } of assets) {
    try {
      const url = new URL(reference, "https://cosmica.local/");
      const relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, "");
      const absolutePath = path.resolve(FRONTEND_ROOT, relativePath);
      const resolvedRelativePath = path.relative(FRONTEND_ROOT, absolutePath);
      if (
        resolvedRelativePath.startsWith("..") ||
        path.isAbsolute(resolvedRelativePath) ||
        path.extname(absolutePath).toLowerCase() !== extension ||
        !fs.existsSync(absolutePath) ||
        !fs.statSync(absolutePath).isFile()
      ) {
        failures.push(`${fileName}: standalone asset is missing or invalid: ${reference}`);
      }
      if (!String(url.searchParams.get("v") || "").trim()) {
        failures.push(`${fileName}: standalone asset is missing ?v= version query param: ${reference}`);
      }
    } catch {
      failures.push(`${fileName}: standalone asset URL is invalid: ${reference}`);
    }
  }
};

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
const failures = [];

for (const fileName of standaloneFiles) {
  validateStandaloneAssets(fileName, htmlSources.get(fileName), failures);
}

for (const rule of ASSET_RULES) {
  const versionsByFile = new Map();
  const uniqueVersions = new Set();
  let totalMatches = 0;
  let filesWithMatch = 0;

  for (const htmlFile of htmlFiles) {
    const content = htmlSources.get(htmlFile);
    const matchedVersions = collectAssetMatches(content, rule.file, rule.attr);
    if (!matchedVersions.length) {
      continue;
    }

    totalMatches += matchedVersions.length;
    if (!standaloneFiles.has(htmlFile)) {
      filesWithMatch += 1;
    }
    matchedVersions.forEach((version) => {
      if (!version) {
        failures.push(
          `${htmlFile}: ${rule.file} is missing ?v= version query param`
        );
        return;
      }
      uniqueVersions.add(version);
      versionsByFile.set(htmlFile, version);
      if (version !== EXPECTED_ASSET_VERSION) {
        failures.push(
          `${htmlFile}: ${rule.file} uses stale version ${version}; expected ${EXPECTED_ASSET_VERSION}`
        );
      }
    });
  }

  if (rule.required && filesWithMatch !== sharedPageCount) {
    failures.push(
      `${rule.file}: expected reference in each shared-runtime HTML page (${sharedPageCount}), found ${filesWithMatch}`
    );
  }

  if (uniqueVersions.size > 1) {
    const detail = [...versionsByFile.entries()]
      .map(([file, version]) => `${file}=>${version}`)
      .join(", ");
    failures.push(
      `${rule.file}: inconsistent version values across pages (${detail})`
    );
  }
}

if (failures.length) {
  console.error("ASSET VERSION CHECK FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `PASS [assets] content-derived version ${EXPECTED_ASSET_VERSION} across ${sharedPageCount} shared pages; ${standaloneFiles.size} standalone pages validated`
);

