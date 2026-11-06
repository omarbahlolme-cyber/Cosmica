/* Read-only production verification; no optional build dependencies or server. */
const path = require("node:path");
const { checkUniverseAssets } = require("./lib/universe-assets");

try {
  const problems = checkUniverseAssets(path.resolve(__dirname, ".."));
  if (problems.length) throw new Error(problems.join("\n"));
  console.log("PASS [universe-assets] manifest, input hashes, and page versions are current");
} catch (error) {
  console.error(`FAIL [universe-assets] ${error.message}\nRun npm run build:universe and review the focused artifacts.`);
  process.exitCode = 1;
}
