const fs = require("fs");
const path = require("path");

const { hasLikelyMojibake } = require("./lib/mojibake");

const ROOT = path.resolve(__dirname, "..");
const findings = [];

const scanFile = (relativePath) => {
  const filePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(filePath)) {
    return;
  }
  const text = fs.readFileSync(filePath, "utf8");
  if (hasLikelyMojibake(text)) {
    findings.push(relativePath);
  }
};

const scanDir = (relativeDir, extensions) => {
  const dirPath = path.join(ROOT, relativeDir);
  if (!fs.existsSync(dirPath)) {
    return;
  }
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const relativePath = path.join(relativeDir, entry.name).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      scanDir(relativePath, extensions);
      continue;
    }
    if (extensions.some((ext) => entry.name.toLowerCase().endsWith(ext))) {
      scanFile(relativePath);
    }
  }
};

scanFile("frontend/app.js");
scanFile("scripts/generate-localized-seo-pages.js");
scanFile("scripts/generate-seo-landing-pages.js");
scanDir("frontend", [".html"]);

if (findings.length) {
  console.error("Mojibake check failed:");
  findings.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log("Mojibake check passed.");
