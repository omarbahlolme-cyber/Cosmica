const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const MANIFEST_PATH = "frontend/ui/universe-assets.json";
const RENDERER_PATH = "ui/cosmic-scene.bundle.js";
// The homepage scene is procedural. Historical artwork stays in the repository,
// but is no longer a build input or a network dependency of this renderer.
const PAGE_ASSETS = Object.freeze({
  "frontend/index.html": [
    "ui/universe.css",
    "ui/observatory.css",
    "ui/navigation.css",
    "ui/flight-overlays.css",
    "ui/language-chrome.css",
    RENDERER_PATH,
    "ui/universe.js",
  ],
  "frontend/maths-lab.html": ["ui/maths-lab.css", "ui/maths-lab.js", "ui/language-chrome.css"],
  "frontend/privacy.html": ["ui/flight-pages.css", "ui/flight-overlays.css", "ui/language-chrome.css"],
  "frontend/terms.html": ["ui/flight-pages.css", "ui/flight-overlays.css", "ui/language-chrome.css"],
  "frontend/license.html": ["ui/flight-pages.css", "ui/flight-overlays.css", "ui/language-chrome.css"],
  "frontend/offline.html": ["ui/flight-pages.css", "ui/flight-overlays.css", "ui/language-chrome.css"],
});
const ASSET_PATHS = Object.freeze([
  ...new Set(Object.values(PAGE_ASSETS).flat()),
]);
const BUILD_INPUT_PATHS = Object.freeze([
  "frontend/ui/cosmic-scene.js",
  "frontend/ui/subject-star-clusters.js",
  "frontend/ui/space-backdrop.js",
  "scripts/build-universe.js",
  "scripts/lib/universe-assets.js",
]);

const hashBytes = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const readAsset = (root, assetPath) => fs.readFileSync(path.join(root, "frontend", assetPath));
const assetRecord = (bytes) => {
  const sha256 = hashBytes(bytes);
  return { sha256, bytes: bytes.length, version: sha256.slice(0, 12) };
};

// Relevant lock records avoid coupling these artifacts to unrelated npm scripts,
// dependency metadata, or line endings in the rest of package-lock.json.
const lockedBuildDependencies = (root) => {
  const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));
  return Object.fromEntries(
    ["esbuild"].map((name) => {
      const record = lock.packages?.[`node_modules/${name}`];
      if (!record?.version || !record.integrity) {
        throw new Error(`Missing locked ${name} build dependency; restore package-lock.json.`);
      }
      return [name, { version: record.version, resolved: record.resolved, integrity: record.integrity }];
    })
  );
};

const createManifest = (root, rendererBytes) => ({
  schemaVersion: 1,
  buildInputs: Object.fromEntries(
    BUILD_INPUT_PATHS.map((relativePath) => [
      relativePath,
      hashBytes(fs.readFileSync(path.join(root, relativePath))),
    ])
  ),
  buildDependencies: lockedBuildDependencies(root),
  assets: Object.fromEntries(
    ASSET_PATHS.map((assetPath) => [
      assetPath,
      assetRecord(
        assetPath === RENDERER_PATH && rendererBytes !== undefined
          ? rendererBytes
          : readAsset(root, assetPath)
      ),
    ])
  ),
});
const serializeManifest = (manifest) => `${JSON.stringify(manifest, null, 2)}\n`;

const updatePageAssetVersions = (source, pagePath, manifest) => {
  const required = PAGE_ASSETS[pagePath];
  const seen = new Set();
  const result = source.replace(/(\b(?:src|href)=)(["'])([^"']+)\2/g, (match, prefix, quote, url) => {
    const pathname = url.split(/[?#]/, 1)[0];
    const assetPath = pathname.replace(/^\//, "");
    if (!required.includes(assetPath)) return match;
    seen.add(assetPath);
    return `${prefix}${quote}${pathname}?v=${manifest.assets[assetPath].version}${quote}`;
  });
  const missing = required.filter((assetPath) => !seen.has(assetPath));
  if (missing.length) throw new Error(`${pagePath} is missing asset references: ${missing.join(", ")}`);
  return result;
};

// This deliberately needs only Node built-ins, so production installs can verify
// checked-in artifacts without installing esbuild or modifying the checkout.
const checkUniverseAssets = (root) => {
  const manifest = createManifest(root);
  const problems = [];
  const manifestPath = path.join(root, MANIFEST_PATH);
  if (!fs.existsSync(manifestPath) || fs.readFileSync(manifestPath, "utf8") !== serializeManifest(manifest)) {
    problems.push(`${MANIFEST_PATH} does not match the current assets/build inputs`);
  }
  for (const pagePath of Object.keys(PAGE_ASSETS)) {
    const source = fs.readFileSync(path.join(root, pagePath), "utf8");
    if (updatePageAssetVersions(source, pagePath, manifest) !== source) {
      problems.push(`${pagePath} has stale spatial/studio asset versions`);
    }
  }
  return problems;
};

module.exports = {
  ASSET_PATHS,
  BUILD_INPUT_PATHS,
  MANIFEST_PATH,
  PAGE_ASSETS,
  RENDERER_PATH,
  checkUniverseAssets,
  createManifest,
  hashBytes,
  lockedBuildDependencies,
  serializeManifest,
  updatePageAssetVersions,
};
