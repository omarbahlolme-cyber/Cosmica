/* ==========================================================================
   RELEASE HYGIENE CHECK
   - Ensures package version is semver.
   - Ensures CHANGELOG.md exists with required sections.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

/* --------------------------------------------------------------------------
   PATHS
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const PACKAGE_PATH = path.join(ROOT, "package.json");
const CHANGELOG_PATH = path.join(ROOT, "CHANGELOG.md");
const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
const failures = [];

if (!fs.existsSync(PACKAGE_PATH)) {
  failures.push("Missing package.json");
} else {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, "utf8"));
  if (!SEMVER_REGEX.test(String(pkg.version || ""))) {
    failures.push(`package.json version must be semver (x.y.z). Received: "${pkg.version}"`);
  }
}

if (!fs.existsSync(CHANGELOG_PATH)) {
  failures.push("Missing CHANGELOG.md");
} else {
  const changelog = fs.readFileSync(CHANGELOG_PATH, "utf8");
  if (!/^#\s+Changelog/m.test(changelog)) {
    failures.push("CHANGELOG.md must start with a 'Changelog' title");
  }
  if (!/^##\s+\[Unreleased\]/m.test(changelog)) {
    failures.push("CHANGELOG.md must include a '## [Unreleased]' section");
  }
}

if (failures.length) {
  console.error("RELEASE CHECK FAILED");
  failures.forEach((line) => console.error(`- ${line}`));
  process.exit(1);
}

console.log("PASS [release] changelog + version hygiene");
