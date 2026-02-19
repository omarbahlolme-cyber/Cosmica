/* ==========================================================================
   AUTH DATA BACKUP RESTORER
   - Restores backend/data auth files from a chosen backup snapshot.
   - Creates a pre-restore snapshot of current auth data for rollback safety.
   - Usage:
     node scripts/restore-auth-data-backup.js [optional-path-to-snapshot-dir] --yes [--dry-run]
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
const PRE_RESTORE_ROOT = path.join(ROOT, "backups", "auth-data-pre-restore");
const SNAPSHOT_PREFIX = "auth-data-";
const args = process.argv.slice(2);
const hasYesFlag = args.includes("--yes");
const hasDryRunFlag = args.includes("--dry-run");
const inputPath = args.find((arg) => !arg.startsWith("--")) || "";

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const toTimestamp = () => new Date().toISOString().replace(/[:.]/g, "-");

const hashFileSha256 = (filePath) => {
  const payload = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(payload).digest("hex");
};

const resolveSnapshotPath = () => {
  if (inputPath) {
    return path.resolve(ROOT, inputPath);
  }
  if (!fs.existsSync(BACKUP_ROOT)) {
    throw new Error(`Missing backup root: ${path.relative(ROOT, BACKUP_ROOT)}`);
  }
  const snapshots = fs
    .readdirSync(BACKUP_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(SNAPSHOT_PREFIX))
    .map((entry) => entry.name)
    .sort();
  if (!snapshots.length) {
    throw new Error("No auth-data backups found. Run: npm run auth-backup:create");
  }
  return path.join(BACKUP_ROOT, snapshots[snapshots.length - 1]);
};

const loadAndValidateManifest = (snapshotPath) => {
  const manifestPath = path.join(snapshotPath, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing manifest: ${path.relative(ROOT, manifestPath)}`);
  }
  const raw = fs.readFileSync(manifestPath, "utf8");
  const manifest = raw.trim() ? JSON.parse(raw) : {};
  const files = Array.isArray(manifest.files) ? manifest.files : [];
  if (!files.length) {
    throw new Error(`Manifest has no files: ${path.relative(ROOT, manifestPath)}`);
  }
  files.forEach((entry) => {
    const fileName = String(entry?.file || "").trim();
    const expectedSha = String(entry?.sha256 || "").trim().toLowerCase();
    const expectedSize = Number(entry?.sizeBytes || 0);
    if (!fileName || !expectedSha || !Number.isFinite(expectedSize) || expectedSize < 0) {
      throw new Error(`Manifest entry invalid: ${JSON.stringify(entry)}`);
    }
    const sourcePath = path.join(snapshotPath, fileName);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Missing backup file: ${path.relative(ROOT, sourcePath)}`);
    }
    const stat = fs.statSync(sourcePath);
    if (stat.size !== expectedSize) {
      throw new Error(
        `Size mismatch for ${fileName}: expected ${expectedSize} bytes, got ${stat.size} bytes`
      );
    }
    const actualSha = hashFileSha256(sourcePath);
    if (actualSha !== expectedSha) {
      throw new Error(`Checksum mismatch for ${fileName}`);
    }
  });
  return files;
};

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
try {
  if (!hasYesFlag) {
    throw new Error("Refusing to restore without confirmation. Re-run with --yes.");
  }

  const snapshotPath = resolveSnapshotPath();
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot not found: ${path.relative(ROOT, snapshotPath)}`);
  }
  const manifestFiles = loadAndValidateManifest(snapshotPath);
  const restoreFileNames = manifestFiles.map((entry) => String(entry.file).trim()).filter(Boolean);

  if (hasDryRunFlag) {
    console.log("PASS [auth-backup] dry-run restore check passed");
    console.log(`- snapshot: ${path.relative(ROOT, snapshotPath)}`);
    console.log(`- files ready: ${restoreFileNames.length}`);
    return;
  }

  fs.mkdirSync(AUTH_DATA_DIR, { recursive: true });
  fs.mkdirSync(PRE_RESTORE_ROOT, { recursive: true });

  const preRestoreDir = path.join(PRE_RESTORE_ROOT, `pre-restore-${toTimestamp()}`);
  fs.mkdirSync(preRestoreDir, { recursive: true });

  const existingDataFiles = fs
    .readdirSync(AUTH_DATA_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"))
    .map((entry) => entry.name);
  existingDataFiles.forEach((fileName) => {
    const sourcePath = path.join(AUTH_DATA_DIR, fileName);
    const targetPath = path.join(preRestoreDir, fileName);
    fs.copyFileSync(sourcePath, targetPath);
  });

  restoreFileNames.forEach((fileName) => {
    const sourcePath = path.join(snapshotPath, fileName);
    const targetPath = path.join(AUTH_DATA_DIR, fileName);
    fs.copyFileSync(sourcePath, targetPath);
  });

  restoreFileNames.forEach((fileName) => {
    const expectedEntry = manifestFiles.find((entry) => String(entry.file).trim() === fileName);
    const targetPath = path.join(AUTH_DATA_DIR, fileName);
    const stat = fs.statSync(targetPath);
    if (stat.size !== Number(expectedEntry.sizeBytes || 0)) {
      throw new Error(`Post-restore size mismatch for ${fileName}`);
    }
    const actualSha = hashFileSha256(targetPath);
    if (actualSha !== String(expectedEntry.sha256 || "").trim().toLowerCase()) {
      throw new Error(`Post-restore checksum mismatch for ${fileName}`);
    }
  });

  console.log("PASS [auth-backup] auth data restore completed");
  console.log(`- restored from: ${path.relative(ROOT, snapshotPath)}`);
  console.log(`- files restored: ${restoreFileNames.length}`);
  console.log(`- pre-restore snapshot: ${path.relative(ROOT, preRestoreDir)}`);
} catch (error) {
  console.error("AUTH DATA BACKUP RESTORE FAILED");
  console.error(`- ${error.message || error}`);
  process.exit(1);
}

