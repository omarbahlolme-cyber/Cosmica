/* ==========================================================================
   AUTH DATA BACKUP CREATOR
   - Creates timestamped backups of backend/data auth files.
   - Writes checksum manifest and optionally mirrors to offsite directory.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/* --------------------------------------------------------------------------
   CONFIG
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const AUTH_DATA_DIR = path.join(ROOT, "backend", "data");
const BACKUP_ROOT = path.join(ROOT, "backups", "auth-data");
const SNAPSHOT_PREFIX = "auth-data-";
const KEEP_COUNT = Math.max(1, Number(process.env.AUTH_DATA_BACKUP_KEEP || 30));
const OFFSITE_DIR = String(process.env.AUTH_DATA_BACKUP_OFFSITE_DIR || "").trim();
const REQUIRED_FILES = new Set(["accounts.json", "registered-accounts.json"]);
const FILES_TO_BACKUP = [
  "accounts.json",
  "registered-accounts.json",
  "deleted-accounts.json",
  "blocked-users.json",
  "security-events.json",
];

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const toTimestamp = () => new Date().toISOString().replace(/[:.]/g, "-");

const hashFileSha256 = (filePath) => {
  const payload = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(payload).digest("hex");
};

const listSnapshotDirectories = (rootDir) => {
  if (!fs.existsSync(rootDir)) {
    return [];
  }
  return fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(SNAPSHOT_PREFIX))
    .map((entry) => entry.name)
    .sort();
};

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
try {
  if (!fs.existsSync(AUTH_DATA_DIR)) {
    throw new Error(`Auth data directory missing: ${path.relative(ROOT, AUTH_DATA_DIR)}`);
  }

  fs.mkdirSync(BACKUP_ROOT, { recursive: true });
  const snapshotName = `${SNAPSHOT_PREFIX}${toTimestamp()}`;
  const snapshotDir = path.join(BACKUP_ROOT, snapshotName);
  fs.mkdirSync(snapshotDir, { recursive: true });

  const copiedFiles = [];
  for (const fileName of FILES_TO_BACKUP) {
    const sourcePath = path.join(AUTH_DATA_DIR, fileName);
    if (!fs.existsSync(sourcePath)) {
      if (REQUIRED_FILES.has(fileName)) {
        throw new Error(`Missing required auth data file: ${path.relative(ROOT, sourcePath)}`);
      }
      continue;
    }
    const targetPath = path.join(snapshotDir, fileName);
    fs.copyFileSync(sourcePath, targetPath);
    copiedFiles.push({
      file: fileName,
      sizeBytes: fs.statSync(targetPath).size,
      sha256: hashFileSha256(targetPath),
    });
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceDir: path.relative(ROOT, AUTH_DATA_DIR),
    snapshotDir: path.relative(ROOT, snapshotDir),
    keepCount: KEEP_COUNT,
    fileCount: copiedFiles.length,
    files: copiedFiles,
  };
  const manifestPath = path.join(snapshotDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  let offsiteSnapshotPath = "";
  if (OFFSITE_DIR) {
    const offsiteRoot = path.resolve(ROOT, OFFSITE_DIR);
    offsiteSnapshotPath = path.join(offsiteRoot, snapshotName);
    fs.mkdirSync(offsiteRoot, { recursive: true });
    fs.cpSync(snapshotDir, offsiteSnapshotPath, { recursive: true, force: true });
  }

  const snapshots = listSnapshotDirectories(BACKUP_ROOT);
  const staleSnapshots = snapshots.slice(0, Math.max(0, snapshots.length - KEEP_COUNT));
  staleSnapshots.forEach((snapshot) => {
    const stalePath = path.join(BACKUP_ROOT, snapshot);
    fs.rmSync(stalePath, { recursive: true, force: true });
  });

  console.log("PASS [auth-backup] auth data backup created");
  console.log(`- snapshot: ${path.relative(ROOT, snapshotDir)}`);
  console.log(`- files: ${copiedFiles.length}`);
  if (offsiteSnapshotPath) {
    console.log(`- offsite mirror: ${path.relative(ROOT, offsiteSnapshotPath)}`);
  }
  if (staleSnapshots.length) {
    console.log(`- pruned snapshots: ${staleSnapshots.length}`);
  }
} catch (error) {
  console.error("AUTH DATA BACKUP CREATE FAILED");
  console.error(`- ${error.message || error}`);
  process.exit(1);
}

