/* ==========================================================================
   SECURITY.TXT POLICY CHECK
   - Validates required fields and expiry freshness.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

/* --------------------------------------------------------------------------
   PATHS + CONFIG
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const FRONTEND_ROOT = path.join(ROOT, "frontend");
const SECURITY_TXT_PATH = path.join(FRONTEND_ROOT, "security.txt");
const MIN_VALIDITY_DAYS = 30;

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
const failures = [];

if (!fs.existsSync(SECURITY_TXT_PATH)) {
  failures.push("Missing security.txt");
} else {
  const lines = fs
    .readFileSync(SECURITY_TXT_PATH, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const fields = new Map();
  for (const line of lines) {
    const [rawKey, ...rest] = line.split(":");
    if (!rawKey || !rest.length) {
      continue;
    }
    fields.set(rawKey.trim(), rest.join(":").trim());
  }

  const contact = fields.get("Contact") || "";
  const expires = fields.get("Expires") || "";
  const canonical = fields.get("Canonical") || "";
  const policy = fields.get("Policy") || "";
  const preferredLanguages = fields.get("Preferred-Languages") || "";

  if (!contact.startsWith("mailto:")) {
    failures.push("security.txt Contact must be a mailto: address");
  }

  const expiresDate = new Date(expires);
  if (!expires || Number.isNaN(expiresDate.getTime())) {
    failures.push("security.txt Expires is missing or invalid date");
  } else {
    const minDate = new Date(Date.now() + MIN_VALIDITY_DAYS * 24 * 60 * 60 * 1000);
    if (expiresDate <= minDate) {
      failures.push(
        `security.txt Expires must be at least ${MIN_VALIDITY_DAYS} days in the future (found ${expiresDate.toISOString()})`
      );
    }
  }

  if (canonical !== "https://www.cosmicalearn.com/.well-known/security.txt") {
    failures.push("security.txt Canonical must be https://www.cosmicalearn.com/.well-known/security.txt");
  }

  if (!/^https:\/\/www\.cosmicalearn\.com\/.+/i.test(policy)) {
    failures.push("security.txt Policy must be an HTTPS URL under www.cosmicalearn.com");
  }

  if (!preferredLanguages) {
    failures.push("security.txt Preferred-Languages is missing");
  }
}

if (failures.length) {
  console.error("SECURITY.TXT CHECK FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("PASS [security-txt] policy + expiry checks");




