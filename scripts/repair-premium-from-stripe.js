/* ==========================================================================
   STRIPE PREMIUM REPAIR (ONE-TIME)
   - Re-syncs premium entitlements from Stripe subscriptions.
   - Dry-run by default; use --apply to persist updates to accounts.json.
   - Optional --email=<address> limits repair to one account.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const Stripe = require("stripe");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
dotenv.config({ path: path.resolve(__dirname, "..", "backend", ".env") });

const ROOT = path.resolve(__dirname, "..");
const AUTH_STORE_FILE = path.join(ROOT, "backend", "data", "accounts.json");
const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const parseArgs = (argv) => {
  const args = Array.isArray(argv) ? argv.slice(2) : [];
  const result = {
    apply: false,
    email: "",
  };
  args.forEach((arg) => {
    const raw = String(arg || "").trim();
    if (!raw) {
      return;
    }
    if (raw === "--apply") {
      result.apply = true;
      return;
    }
    if (raw.startsWith("--email=")) {
      result.email = normalizeEmail(raw.slice("--email=".length));
      return;
    }
  });
  return result;
};

const userHasPremium = (userRecord) => {
  const profile = userRecord?.data?.profile || {};
  const premiumRaw = profile.isPremium ?? profile.premium ?? null;
  const premiumText = String(premiumRaw ?? "")
    .trim()
    .toLowerCase();
  const tier = String(profile.plan || profile.tier || profile.membership || "")
    .trim()
    .toLowerCase();
  return (
    premiumRaw === true ||
    premiumText === "1" ||
    premiumText === "true" ||
    premiumText === "yes" ||
    premiumText === "premium" ||
    premiumText === "pro" ||
    premiumText === "plus" ||
    tier === "premium" ||
    tier === "pro" ||
    tier === "plus" ||
    tier === "paid"
  );
};

const isStripeLikelyCandidate = (userRecord) => {
  const profile = userRecord?.data?.profile || {};
  const provider = String(profile.premiumProvider || "")
    .trim()
    .toLowerCase();
  return (
    provider === "stripe" ||
    Boolean(profile.premiumActivatedAt) ||
    Boolean(profile.premiumLastEventId) ||
    Boolean(profile.premiumDeactivatedAt)
  );
};

const loadStore = () => {
  if (!fs.existsSync(AUTH_STORE_FILE)) {
    throw new Error(`Missing auth store file: ${path.relative(ROOT, AUTH_STORE_FILE)}`);
  }
  const raw = fs.readFileSync(AUTH_STORE_FILE, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid accounts.json payload");
  }
  parsed.users = parsed.users && typeof parsed.users === "object" ? parsed.users : {};
  parsed.emailIndex = parsed.emailIndex && typeof parsed.emailIndex === "object" ? parsed.emailIndex : {};
  return parsed;
};

const saveBackupSnapshot = () => {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(ROOT, "backend", "data", `accounts.pre-premium-repair.${stamp}.json`);
  fs.copyFileSync(AUTH_STORE_FILE, backupPath);
  return backupPath;
};

const listStripeCustomersByEmail = async (stripe, email) => {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return [];
  }
  const customers = [];
  let hasMore = true;
  let startingAfter = "";
  while (hasMore) {
    const response = await stripe.customers.list({
      email: normalized,
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    const items = Array.isArray(response?.data) ? response.data : [];
    items.forEach((item) => {
      if (item && !item.deleted) {
        customers.push(item);
      }
    });
    hasMore = Boolean(response?.has_more) && items.length > 0;
    startingAfter = hasMore ? String(items[items.length - 1]?.id || "") : "";
  }
  return customers;
};

const listStripeSubscriptionsForCustomer = async (stripe, customerId) => {
  const subscriptions = [];
  let hasMore = true;
  let startingAfter = "";
  while (hasMore) {
    const response = await stripe.subscriptions.list({
      customer: String(customerId || "").trim(),
      status: "all",
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    const items = Array.isArray(response?.data) ? response.data : [];
    subscriptions.push(...items);
    hasMore = Boolean(response?.has_more) && items.length > 0;
    startingAfter = hasMore ? String(items[items.length - 1]?.id || "") : "";
  }
  return subscriptions;
};

const findPremiumStripeSubscription = async (stripe, email) => {
  const customers = await listStripeCustomersByEmail(stripe, email);
  for (const customer of customers) {
    const subscriptions = await listStripeSubscriptionsForCustomer(stripe, customer.id);
    const eligible = subscriptions.find((subscription) => {
      const status = String(subscription?.status || "")
        .trim()
        .toLowerCase();
      return ACTIVE_STATUSES.has(status);
    });
    if (eligible) {
      return {
        customerId: String(customer.id || ""),
        subscriptionId: String(eligible.id || ""),
        status: String(eligible.status || "").trim().toLowerCase(),
        currentPeriodEnd: Number.isFinite(Number(eligible.current_period_end))
          ? new Date(Number(eligible.current_period_end) * 1000).toISOString()
          : null,
      };
    }
  }
  return null;
};

const applyPremiumProfile = (userRecord, stripeMatch) => {
  const nowIso = new Date().toISOString();
  if (!userRecord.data || typeof userRecord.data !== "object") {
    userRecord.data = {};
  }
  if (!userRecord.data.profile || typeof userRecord.data.profile !== "object") {
    userRecord.data.profile = {};
  }
  const profile = userRecord.data.profile;
  profile.isPremium = true;
  profile.premium = true;
  profile.plan = "premium";
  profile.tier = "premium";
  profile.membership = "premium";
  if (!profile.premiumActivatedAt) {
    profile.premiumActivatedAt = nowIso;
  }
  profile.premiumProvider = "stripe";
  profile.premiumLastSource = "premium-repair-script";
  profile.premiumLastEventAt = nowIso;
  if (stripeMatch?.subscriptionId) {
    profile.premiumLastEventId = stripeMatch.subscriptionId;
  }
  if (stripeMatch?.status) {
    profile.premiumLastEventType = `subscription:${stripeMatch.status}`;
  }
  if (stripeMatch?.currentPeriodEnd) {
    profile.premiumCurrentPeriodEnd = stripeMatch.currentPeriodEnd;
  }
  userRecord.updatedAt = nowIso;
};

const run = async () => {
  const options = parseArgs(process.argv);
  const stripeSecretKey = String(process.env.STRIPE_SECRET_KEY || "").trim();
  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY. Set it in environment/.env before running repair.");
  }
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-01-27.acacia",
  });

  const store = loadStore();
  const allUsers = Object.values(store.users || {}).filter((user) => user && typeof user === "object");
  const targetUsers = allUsers.filter((userRecord) => {
    const email = normalizeEmail(userRecord.email);
    if (!email) {
      return false;
    }
    if (options.email) {
      return email === options.email;
    }
    return !userHasPremium(userRecord) && isStripeLikelyCandidate(userRecord);
  });

  if (!targetUsers.length) {
    console.log("PASS [premium-repair] no matching users found for repair scan");
    return;
  }

  const repaired = [];
  const notEligible = [];

  for (const userRecord of targetUsers) {
    const email = normalizeEmail(userRecord.email);
    const stripeMatch = await findPremiumStripeSubscription(stripe, email);
    if (!stripeMatch) {
      notEligible.push(email);
      continue;
    }
    repaired.push({
      email,
      stripeMatch,
      userId: String(userRecord.id || ""),
    });
    if (options.apply) {
      applyPremiumProfile(userRecord, stripeMatch);
    }
  }

  console.log("PASS [premium-repair] Stripe entitlement scan complete");
  console.log(`- mode: ${options.apply ? "apply" : "dry-run"}`);
  console.log(`- scanned users: ${targetUsers.length}`);
  console.log(`- repair candidates: ${repaired.length}`);
  console.log(`- no active Stripe entitlement: ${notEligible.length}`);

  repaired.forEach((entry) => {
    console.log(
      `  * restore ${entry.email} -> ${entry.stripeMatch.subscriptionId} (${entry.stripeMatch.status})`
    );
  });

  if (!options.apply) {
    console.log("- dry-run only. Re-run with --apply to persist account updates.");
    return;
  }

  if (!repaired.length) {
    console.log("- no repairs needed; accounts.json unchanged.");
    return;
  }

  const backupPath = saveBackupSnapshot();
  store.updatedAt = new Date().toISOString();
  fs.writeFileSync(AUTH_STORE_FILE, JSON.stringify(store, null, 2), "utf8");
  console.log(`- backup: ${path.relative(ROOT, backupPath)}`);
  console.log(`- updated: ${path.relative(ROOT, AUTH_STORE_FILE)}`);
};

run().catch((error) => {
  console.error("PREMIUM REPAIR FAILED");
  console.error(`- ${error?.message || error}`);
  process.exit(1);
});
