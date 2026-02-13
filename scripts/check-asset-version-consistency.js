/* ==========================================================================
   ASSET VERSION CONSISTENCY CHECK
   - Enforces versioned CSS/JS query params in HTML asset tags.
   - Ensures each shared asset uses one consistent version value site-wide.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

/* --------------------------------------------------------------------------
   PATHS + CONFIG
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const FRONTEND_ROOT = path.join(ROOT, "frontend");
const shouldSkipHtmlFile = (name) => {
  const lower = String(name || "").toLowerCase();
  return (
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

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
const failures = [];

for (const rule of ASSET_RULES) {
  const versionsByFile = new Map();
  const uniqueVersions = new Set();
  let totalMatches = 0;

  for (const htmlFile of htmlFiles) {
    const htmlPath = path.join(FRONTEND_ROOT, htmlFile);
    const content = fs.readFileSync(htmlPath, "utf8");
    const matchedVersions = collectAssetMatches(content, rule.file, rule.attr);
    if (!matchedVersions.length) {
      continue;
    }

    totalMatches += matchedVersions.length;
    matchedVersions.forEach((version) => {
      if (!version) {
        failures.push(
          `${htmlFile}: ${rule.file} is missing ?v= version query param`
        );
        return;
      }
      uniqueVersions.add(version);
      versionsByFile.set(htmlFile, version);
    });
  }

  if (rule.required && totalMatches !== htmlFiles.length) {
    failures.push(
      `${rule.file}: expected one reference in each HTML page (${htmlFiles.length}), found ${totalMatches}`
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
  `PASS [assets] consistent versioned style/app references across ${htmlFiles.length} pages`
);

