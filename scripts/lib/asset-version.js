const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ASSET_VERSION_INPUTS = [
  "frontend/app.js",
  "frontend/style.css",
  "frontend/maps/app-maps.js",
  "frontend/maps/style-maps.css",
];

const calculateAssetVersion = (rootPath) => {
  const hash = crypto.createHash("sha256");
  ASSET_VERSION_INPUTS.forEach((relativePath) => {
    const absolutePath = path.join(rootPath, relativePath);
    const source = fs.readFileSync(absolutePath, "utf8");
    hash.update(relativePath);
    hash.update("\0");
    hash.update(source);
    hash.update("\0");
  });
  return hash.digest("hex").slice(0, 12);
};

module.exports = {
  ASSET_VERSION_INPUTS,
  calculateAssetVersion,
};
