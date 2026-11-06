const fs = require("fs");
const path = require("path");
const { calculateAssetVersion } = require("./lib/asset-version");

const ROOT = path.resolve(__dirname, "..");
const FRONTEND_ROOT = path.join(ROOT, "frontend");
const version = calculateAssetVersion(ROOT);

const replaceAssetQuery = (source, assetPath) => {
  const escaped = assetPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return source.replace(
    new RegExp(`(${escaped}\\?v=)[^"']+`, "g"),
    `$1${version}`
  );
};

let updatedHtmlFiles = 0;
for (const entry of fs.readdirSync(FRONTEND_ROOT, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".html")) {
    continue;
  }
  const filePath = path.join(FRONTEND_ROOT, entry.name);
  const before = fs.readFileSync(filePath, "utf8");
  let after = before;
  after = replaceAssetQuery(after, "style.css");
  after = replaceAssetQuery(after, "app.js");
  after = replaceAssetQuery(after, "maps/style-maps.css");
  if (after !== before) {
    fs.writeFileSync(filePath, after, "utf8");
    updatedHtmlFiles += 1;
  }
}

console.log(
  `Synced asset version ${version} across ${updatedHtmlFiles} HTML files.`
);
