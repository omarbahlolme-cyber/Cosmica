/* ==========================================================================
   BACKUP CREATOR
   - Produces timestamped source archive and git bundle backups.
   - Intended for local recovery and CI artifact retention.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

/* --------------------------------------------------------------------------
   PATHS
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const BACKUP_DIR = path.join(ROOT, "backups");

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

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
try {
  runGit(["rev-parse", "--is-inside-work-tree"], "Repository check");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const baseName = `cosmica-backup-${timestamp}`;
  const zipPath = path.join(BACKUP_DIR, `${baseName}.zip`);
  const bundlePath = path.join(BACKUP_DIR, `${baseName}.bundle`);
  const manifestPath = path.join(BACKUP_DIR, `${baseName}.json`);

  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const commit = runGit(["rev-parse", "HEAD"], "Resolve current commit");
  const branch = runGit(["rev-parse", "--abbrev-ref", "HEAD"], "Resolve current branch");

  runGit(["archive", "--format=zip", `--output=${zipPath}`, "HEAD"], "Create source archive");
  runGit(["bundle", "create", bundlePath, "--all"], "Create git bundle");

  const manifest = {
    generatedAt: new Date().toISOString(),
    branch,
    commit,
    archive: path.relative(ROOT, zipPath),
    bundle: path.relative(ROOT, bundlePath),
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  console.log("PASS [backup] backup snapshot created");
  console.log(`- ${path.relative(ROOT, zipPath)}`);
  console.log(`- ${path.relative(ROOT, bundlePath)}`);
  console.log(`- ${path.relative(ROOT, manifestPath)}`);
} catch (error) {
  console.error("BACKUP CREATE FAILED");
  console.error(`- ${error.message || error}`);
  process.exit(1);
}
