/* ==========================================================================
   BACKUP VERIFIER
   - Verifies a git bundle backup and paired source archive.
   - Usage:
     node scripts/verify-backup.js [optional-path-to-bundle]
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

/* --------------------------------------------------------------------------
   PATHS
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const BACKUP_DIR = path.join(ROOT, "backups");
const inputPath = process.argv[2] || "";

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const runGit = (args, stepName) => {
  const result = spawnSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
  });

  if (result.error) {
    throw new Error(`${stepName} failed\n${result.error.message}`);
  }

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`${stepName} failed\n${output}`);
  }

  return (result.stdout || "").trim();
};

const resolveBundlePath = () => {
  if (inputPath) {
    return path.resolve(ROOT, inputPath);
  }

  if (!fs.existsSync(BACKUP_DIR)) {
    throw new Error("Missing backups directory. Run: npm run backup:create");
  }

  const bundles = fs
    .readdirSync(BACKUP_DIR)
    .filter((name) => name.endsWith(".bundle"))
    .sort();

  if (!bundles.length) {
    throw new Error("No bundle backups found. Run: npm run backup:create");
  }

  return path.join(BACKUP_DIR, bundles[bundles.length - 1]);
};

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
try {
  const bundlePath = resolveBundlePath();
  if (!fs.existsSync(bundlePath)) {
    throw new Error(`Bundle not found: ${path.relative(ROOT, bundlePath)}`);
  }

  runGit(["bundle", "verify", bundlePath], "Bundle integrity verify");

  const zipPath = bundlePath.replace(/\.bundle$/i, ".zip");
  if (!fs.existsSync(zipPath)) {
    throw new Error(`Missing paired archive: ${path.relative(ROOT, zipPath)}`);
  }

  const zipSizeBytes = fs.statSync(zipPath).size;
  if (zipSizeBytes <= 1024) {
    throw new Error(`Paired archive appears too small (${zipSizeBytes} bytes): ${path.relative(ROOT, zipPath)}`);
  }

  console.log("PASS [backup] backup verified");
  console.log(`- bundle: ${path.relative(ROOT, bundlePath)}`);
  console.log(`- archive: ${path.relative(ROOT, zipPath)} (${zipSizeBytes} bytes)`);
} catch (error) {
  console.error("BACKUP VERIFY FAILED");
  console.error(`- ${error.message || error}`);
  process.exit(1);
}
