const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_ROOT = path.join(PROJECT_ROOT, "backend", "data");

const ACCOUNTS_FILE = path.join(DATA_ROOT, "accounts.json");
const REGISTERED_FILE = path.join(DATA_ROOT, "registered-accounts.json");
const DELETED_FILE = path.join(DATA_ROOT, "deleted-accounts.json");
const SECURITY_FILE = path.join(DATA_ROOT, "security-events.json");

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const readJson = (filePath, fallbackValue) => {
  try {
    if (!fs.existsSync(filePath)) {
      return fallbackValue;
    }
    const raw = fs.readFileSync(filePath, "utf8");
    if (!raw.trim()) {
      return fallbackValue;
    }
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
};

const args = process.argv.slice(2);
const rawEmailArg = args.find((arg) => arg.startsWith("--email=")) || args[0] || "";
const email = normalizeEmail(rawEmailArg.replace(/^--email=/, ""));

if (!email || !email.includes("@")) {
  console.error("Usage: node scripts/check-user-lifecycle.js --email=<user@example.com>");
  process.exit(1);
}

const accounts = readJson(ACCOUNTS_FILE, { users: {}, emailIndex: {} });
const registered = readJson(REGISTERED_FILE, []);
const deleted = readJson(DELETED_FILE, []);
const security = readJson(SECURITY_FILE, { events: [] });

const indexedUserId = String(accounts?.emailIndex?.[email] || "").trim();
const currentUser = indexedUserId ? accounts?.users?.[indexedUserId] : null;
const currentUserFromScan =
  currentUser ||
  Object.values(accounts?.users || {}).find((user) => normalizeEmail(user?.email) === email) ||
  null;

const registeredEntries = Array.isArray(registered)
  ? registered.filter((entry) => normalizeEmail(entry?.email) === email)
  : [];
const deletedEntries = Array.isArray(deleted)
  ? deleted.filter((entry) => normalizeEmail(entry?.email) === email)
  : [];
const events = Array.isArray(security?.events) ? security.events : [];

const accountDeletedEvents = events.filter(
  (event) => normalizeEmail(event?.email) === email && String(event?.type || "") === "account-deleted"
);
const unknownEmailLoginFailures = events.filter(
  (event) =>
    normalizeEmail(event?.email) === email &&
    String(event?.type || "") === "auth-login-failed" &&
    String(event?.reason || "") === "Unknown email"
);

const latest = (items, field) =>
  [...items]
    .map((item) => String(item?.[field] || "").trim())
    .filter(Boolean)
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0] || null;

const summary = {
  email,
  currentAccountExists: Boolean(currentUserFromScan),
  currentAccountUserId: String(currentUserFromScan?.id || indexedUserId || "") || null,
  currentAccountCreatedAt: String(currentUserFromScan?.createdAt || "") || null,
  currentAccountLastLoginAt: String(currentUserFromScan?.lastLoginAt || "") || null,
  currentAccountEmailVerified:
    typeof currentUserFromScan?.emailVerified === "boolean" ? currentUserFromScan.emailVerified : null,
  registeredCount: registeredEntries.length,
  registeredLatestAt: latest(registeredEntries, "registeredAt"),
  deletedAuditCount: deletedEntries.length,
  deletedLatestAt: latest(deletedEntries, "deletedAt"),
  securityAccountDeletedEvents: accountDeletedEvents.length,
  securityAccountDeletedLatestAt: latest(accountDeletedEvents, "at"),
  securityUnknownEmailLoginFailures: unknownEmailLoginFailures.length,
  securityUnknownEmailLatestAt: latest(unknownEmailLoginFailures, "at"),
  likelyState: "",
};

if (summary.currentAccountExists) {
  summary.likelyState = "active-account";
} else if (summary.deletedAuditCount > 0 || summary.securityAccountDeletedEvents > 0) {
  summary.likelyState = "previously-deleted";
} else if (summary.registeredCount > 0) {
  summary.likelyState = "registered-but-missing-from-current-store";
} else {
  summary.likelyState = "never-registered-or-different-email";
}

console.log(JSON.stringify(summary, null, 2));
