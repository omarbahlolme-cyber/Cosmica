/* ===========================================================================
   STRIPE PREMIUM RECONCILIATION
   - Aligns accounts.json premium status with live Stripe subscription truth.
   - Dry-run by default; pass --apply to persist upgrades/downgrades.
   - Optional --email=<address> or --userId=<id> to scope reconciliation.
   - Use --keep-premium-if-missing to avoid downgrading when Stripe has no active sub.
   =========================================================================== */
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
const isTruthy = (value) => ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());

const parseArgs = (argv) => {
  const options = {
    apply: false,
    email: "",
    userId: "",
    keepPremiumIfMissing: false,
  };
  (Array.isArray(argv) ? argv.slice(2) : []).forEach((arg) => {
    const raw = String(arg || "").trim();
    if (!raw) {
      return;
    }
    if (raw === "--apply") {
      options.apply = true;
      return;
    }
    if (raw === "--keep-premium-if-missing") {
      options.keepPremiumIfMissing = true;
      return;
    }
    if (raw.startsWith("--email=")) {
      options.email = normalizeEmail(raw.slice("--email=".length));
      return;
    }
    if (raw.startsWith("--userId=")) {
      options.userId = String(raw.slice("--userId=".length) || "").trim().slice(0, 120);
    }
  });
  return options;
};

const loadStore = () => {
  if (!fs.existsSync(AUTH_STORE_FILE)) {
    throw new Error(`Missing auth store file: ${path.relative(ROOT, AUTH_STORE_FILE)}`);
  }
  const parsed = JSON.parse(fs.readFileSync(AUTH_STORE_FILE, "utf8"));
  parsed.users = parsed?.users && typeof parsed.users === "object" ? parsed.users : {};
  parsed.emailIndex = parsed?.emailIndex && typeof parsed.emailIndex === "object" ? parsed.emailIndex : {};
  return parsed;
};

const saveBackupSnapshot = () => {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(ROOT, "backend", "data", `accounts.pre-stripe-reconcile.${stamp}.json`);
  fs.copyFileSync(AUTH_STORE_FILE, backupPath);
  return backupPath;
};

const ensureProfile = (userRecord) => {
  if (!userRecord.data || typeof userRecord.data !== "object") {
    userRecord.data = {};
  }
  if (!userRecord.data.profile || typeof userRecord.data.profile !== "object") {
    userRecord.data.profile = {};
  }
  return userRecord.data.profile;
};

const userHasPremium = (userRecord) => {
  const profile = userRecord?.data?.profile || {};
  const premiumRaw = profile.isPremium ?? profile.premium ?? null;
  const premiumText = String(premiumRaw ?? "").trim().toLowerCase();
  const tier = String(profile.plan || profile.tier || profile.membership || "").trim().toLowerCase();
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

const findActiveStripeSubscriptionForUser = async (stripe, userRecord) => {
  const profile = userRecord?.data?.profile || {};
  const knownCustomerId = String(profile.premiumStripeCustomerId || "").trim();
  const customerIds = new Set();
  if (knownCustomerId) {
    customerIds.add(knownCustomerId);
  }

  const email = normalizeEmail(userRecord?.email);
  if (email) {
    const customers = await listStripeCustomersByEmail(stripe, email);
    customers.forEach((customer) => {
      const customerId = String(customer?.id || "").trim();
      if (customerId) {
        customerIds.add(customerId);
      }
    });
  }

  for (const customerId of customerIds) {
    const subscriptions = await listStripeSubscriptionsForCustomer(stripe, customerId);
    const winner = subscriptions
      .filter((subscription) => ACTIVE_STATUSES.has(String(subscription?.status || "").trim().toLowerCase()))
      .sort((a, b) => Number(b?.current_period_end || 0) - Number(a?.current_period_end || 0))[0];
    if (winner) {
      const periodEnd = Number(winner.current_period_end || 0);
      return {
        customerId,
        subscriptionId: String(winner.id || ""),
        status: String(winner.status || "").trim().toLowerCase(),
        cancelAtPeriodEnd: winner.cancel_at_period_end === true,
        currentPeriodEnd:
          Number.isFinite(periodEnd) && periodEnd > 0 ? new Date(periodEnd * 1000).toISOString() : "",
      };
    }
  }
  return null;
};

const applyPremium = (userRecord, stripeMatch) => {
  const profile = ensureProfile(userRecord);
  const nowIso = new Date().toISOString();
  profile.isPremium = true;
  profile.premium = true;
  profile.plan = "premium";
  profile.tier = "premium";
  profile.membership = "premium";
  if (!profile.premiumActivatedAt) {
    profile.premiumActivatedAt = nowIso;
  }
  profile.premiumProvider = "stripe";
  profile.premiumLastSource = "stripe-reconcile-script";
  profile.premiumLastEventAt = nowIso;
  profile.premiumStripeCustomerId = String(stripeMatch?.customerId || "").trim().slice(0, 120);
  profile.premiumStripeSubscriptionId = String(stripeMatch?.subscriptionId || "").trim().slice(0, 120);
  profile.premiumStripeSubscriptionStatus = String(stripeMatch?.status || "").trim().toLowerCase().slice(0, 60);
  profile.premiumCancelAtPeriodEnd = stripeMatch?.cancelAtPeriodEnd === true;
  if (stripeMatch?.currentPeriodEnd) {
    profile.premiumCurrentPeriodEnd = stripeMatch.currentPeriodEnd;
  }
  userRecord.updatedAt = nowIso;
};

const applyDowngrade = (userRecord) => {
  const profile = ensureProfile(userRecord);
  const nowIso = new Date().toISOString();
  profile.isPremium = false;
  profile.premium = false;
  profile.plan = "free";
  profile.tier = "free";
  profile.membership = "free";
  profile.premiumProvider = "stripe";
  profile.premiumLastSource = "stripe-reconcile-script";
  profile.premiumLastEventAt = nowIso;
  profile.premiumDeactivatedAt = nowIso;
  profile.premiumCancelAtPeriodEnd = false;
  delete profile.premiumCurrentPeriodEnd;
  delete profile.premiumScheduledEndAt;
  delete profile.premiumCancelRequestedAt;
  delete profile.premiumStripeSubscriptionStatus;
  delete profile.premiumStripeSubscriptionId;
  userRecord.updatedAt = nowIso;
};

const run = async () => {
  const options = parseArgs(process.argv);
  const stripeSecretKey = String(process.env.STRIPE_SECRET_KEY || "").trim();
  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-01-27.acacia",
  });

  const store = loadStore();
  const users = Object.values(store.users || {}).filter((user) => user && typeof user === "object");
  const scopedUsers = users.filter((userRecord) => {
    const email = normalizeEmail(userRecord.email);
    const id = String(userRecord.id || "").trim();
    if (options.userId) {
      return id === options.userId;
    }
    if (options.email) {
      return email === options.email;
    }
    return Boolean(email);
  });

  if (!scopedUsers.length) {
    console.log("PASS [premium-reconcile] no matching users to scan");
    return;
  }

  const summary = {
    scanned: 0,
    upgraded: 0,
    downgraded: 0,
    confirmedPremium: 0,
    confirmedFree: 0,
    skipped: 0,
    errors: 0,
  };
  const changes = [];

  for (const userRecord of scopedUsers) {
    summary.scanned += 1;
    const email = normalizeEmail(userRecord.email);
    const userId = String(userRecord.id || "").trim();
    const wasPremium = userHasPremium(userRecord);

    try {
      const stripeMatch = await findActiveStripeSubscriptionForUser(stripe, userRecord);
      if (stripeMatch) {
        if (options.apply) {
          applyPremium(userRecord, stripeMatch);
        }
        if (wasPremium) {
          summary.confirmedPremium += 1;
          changes.push(`${email || userId}: confirmed premium (${stripeMatch.status})`);
        } else {
          summary.upgraded += 1;
          changes.push(`${email || userId}: upgrade -> ${stripeMatch.subscriptionId} (${stripeMatch.status})`);
        }
        continue;
      }

      if (options.keepPremiumIfMissing) {
        summary.skipped += 1;
        changes.push(`${email || userId}: skipped (no active Stripe subscription)`);
        continue;
      }

      if (wasPremium) {
        if (options.apply) {
          applyDowngrade(userRecord);
        }
        summary.downgraded += 1;
        changes.push(`${email || userId}: downgrade (no active Stripe subscription)`);
      } else {
        summary.confirmedFree += 1;
      }
    } catch (error) {
      summary.errors += 1;
      changes.push(`${email || userId}: error ${String(error?.message || error).slice(0, 180)}`);
     }
   }

  console.log("PASS [premium-reconcile] Stripe truth scan complete");
  console.log(`- mode: ${options.apply ? "apply" : "dry-run"}`);
  console.log(`- scanned: ${summary.scanned}`);
  console.log(`- upgraded: ${summary.upgraded}`);
  console.log(`- downgraded: ${summary.downgraded}`);
  console.log(`- confirmed premium: ${summary.confirmedPremium}`);
  console.log(`- confirmed free: ${summary.confirmedFree}`);
  console.log(`- skipped: ${summary.skipped}`);
  console.log(`- errors: ${summary.errors}`);

  changes.slice(0, 200).forEach((line) => {
    console.log(`  * ${line}`);
  });

  if (!options.apply) {
    console.log("- dry-run only. Re-run with --apply to persist updates.");
    return;
  }

  const hasWriteChanges = summary.upgraded > 0 || summary.downgraded > 0;
  if (!hasWriteChanges) {
    console.log("- no entitlement changes required; accounts.json unchanged.");
    return;
  }

  const backupPath = saveBackupSnapshot();
  store.updatedAt = new Date().toISOString();
  fs.writeFileSync(AUTH_STORE_FILE, JSON.stringify(store, null, 2), "utf8");
  console.log(`- backup: ${path.relative(ROOT, backupPath)}`);
  console.log(`- updated: ${path.relative(ROOT, AUTH_STORE_FILE)}`);
};

run().catch((error) => {
  console.error("PREMIUM RECONCILIATION FAILED");
  console.error(`- ${error?.message || error}`);
  process.exit(1);
});
