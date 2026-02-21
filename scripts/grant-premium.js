/* ==========================================================================
   ADMIN: GRANT PREMIUM TO USER
   - Usage:
     node scripts/grant-premium.js --email user@example.com [--days 30]
     node scripts/grant-premium.js --email user@example.com --until 2099-12-31
   - Default duration: far-future (2099-12-31) if no --days/--until provided.
   - Edits backend/data/accounts.json in place. Run a backup first:
     npm run auth-backup:create
   ========================================================================== */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
};

const email = String(getArgValue("--email") || "").trim().toLowerCase();
const days = getArgValue("--days");
const until = getArgValue("--until");

if (!email || !email.includes("@")) {
  console.error("ERROR: --email is required (example: --email user@example.com)");
  process.exit(1);
}

const ROOT = path.resolve(__dirname, "..");
const AUTH_FILE = path.join(ROOT, "backend", "data", "accounts.json");

if (!fs.existsSync(AUTH_FILE)) {
  console.error(`ERROR: Auth store not found at ${path.relative(ROOT, AUTH_FILE)}`);
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(fs.readFileSync(AUTH_FILE, "utf8"));
} catch (error) {
  console.error("ERROR: Failed to read/parse accounts.json", error.message || error);
  process.exit(1);
}

if (!parsed || typeof parsed !== "object" || !parsed.users || !parsed.emailIndex) {
  console.error("ERROR: accounts.json is missing users/emailIndex");
  process.exit(1);
}

const userId = parsed.emailIndex[email];
if (!userId || !parsed.users[userId]) {
  console.error(`ERROR: No user found with email: ${email}`);
  process.exit(1);
}

const userRecord = parsed.users[userId];
if (!userRecord.data || typeof userRecord.data !== "object") {
  userRecord.data = {};
}
if (!userRecord.data.profile || typeof userRecord.data.profile !== "object") {
  userRecord.data.profile = {};
}
const profile = userRecord.data.profile;

// Determine premium end date
let premiumEndIso = "2099-12-31T00:00:00.000Z";
if (until) {
  const candidate = new Date(until);
  if (Number.isFinite(candidate.getTime())) {
    premiumEndIso = candidate.toISOString();
  } else {
    console.warn(`WARN: --until value invalid (${until}); using default ${premiumEndIso}`);
  }
} else if (days) {
  const n = Number(days);
  if (Number.isFinite(n) && n > 0) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + n);
    premiumEndIso = d.toISOString();
  } else {
    console.warn(`WARN: --days value invalid (${days}); using default ${premiumEndIso}`);
  }
}

const nowIso = new Date().toISOString();

profile.isPremium = true;
profile.premium = true;
profile.plan = "premium";
profile.tier = "premium";
profile.membership = "premium";
profile.premiumProvider = "manual";
profile.premiumLastSource = "manual-grant";
profile.premiumStripeSubscriptionStatus = "active";
profile.premiumCurrentPeriodEnd = premiumEndIso;
profile.premiumActivatedAt = profile.premiumActivatedAt || nowIso;
profile.premiumLastEventAt = nowIso;
profile.premiumCancelAtPeriodEnd = false;
delete profile.premiumCancelRequestedAt;
delete profile.premiumScheduledEndAt;

userRecord.updatedAt = nowIso;
parsed.updatedAt = nowIso;

fs.writeFileSync(AUTH_FILE, JSON.stringify(parsed, null, 2), "utf8");

console.log("PASS [grant-premium] premium granted");
console.log(`- email: ${email}`);
console.log(`- premium until: ${premiumEndIso}`);
console.log(`- provider: ${profile.premiumProvider}`);
