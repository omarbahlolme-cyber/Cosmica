/* ==========================================================================
   AUTH DATA BACKUP VERIFIER
   - Verifies latest (or specified) auth-data snapshot using manifest checksums.
   - Usage:
     node scripts/verify-auth-data-backup.js [optional-path-to-snapshot-dir]
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/* --------------------------------------------------------------------------
   CONFIG
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const BACKUP_ROOT = path.join(ROOT, "backups", "auth-data");
const SNAPSHOT_PREFIX = "auth-data-";
const inputPath = String(process.argv[2] || "").trim();

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
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

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
try {
  const snapshotPath = resolveSnapshotPath();
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot not found: ${path.relative(ROOT, snapshotPath)}`);
  }
  const manifestPath = path.join(snapshotPath, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing manifest: ${path.relative(ROOT, manifestPath)}`);
  }

  const manifestRaw = fs.readFileSync(manifestPath, "utf8");
  const manifest = manifestRaw.trim() ? JSON.parse(manifestRaw) : {};
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
    const filePath = path.join(snapshotPath, fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing backup file: ${path.relative(ROOT, filePath)}`);
    }
    const stat = fs.statSync(filePath);
    if (stat.size !== expectedSize) {
      throw new Error(
        `Size mismatch for ${fileName}: expected ${expectedSize} bytes, got ${stat.size} bytes`
      );
    }
    const actualSha = hashFileSha256(filePath);
    if (actualSha !== expectedSha) {
      throw new Error(`Checksum mismatch for ${fileName}`);
    }
  });

  console.log("PASS [auth-backup] auth data backup verified");
  console.log(`- snapshot: ${path.relative(ROOT, snapshotPath)}`);
  console.log(`- files verified: ${files.length}`);
} catch (error) {
  console.error("AUTH DATA BACKUP VERIFY FAILED");
  console.error(`- ${error.message || error}`);
  process.exit(1);
}

