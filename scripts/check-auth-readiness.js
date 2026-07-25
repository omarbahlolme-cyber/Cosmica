/* ==========================================================================
   AUTH PRODUCTION READINESS CHECK
   - Validates auth-related environment and cookie policy expectations.
   - Usage:
     node scripts/check-auth-readiness.js
   ========================================================================== */
const fs = require("fs");
const path = require("path");
require("dotenv").config();

/* --------------------------------------------------------------------------
   CONFIG
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const SERVER_FILE = path.join(ROOT, "backend", "server.js");
const ENV = String(process.env.NODE_ENV || "development").trim().toLowerCase();
const isProduction = ENV === "production";

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const checks = [];
const addResult = (status, message) => checks.push({ status, message });
const isTruthy = (value) => ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());

const readServerSource = () => {
  if (!fs.existsSync(SERVER_FILE)) {
    throw new Error(`Missing server file: ${path.relative(ROOT, SERVER_FILE)}`);
  }
  return fs.readFileSync(SERVER_FILE, "utf8");
};

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
try {
  const authFrom = String(
    process.env.AUTH_FROM || process.env.FEEDBACK_FROM || process.env.SMTP_USER || ""
  ).trim();
  const resendEnabled = Boolean(String(process.env.RESEND_API_KEY || "").trim());
  const smtpEnabled = Boolean(
    String(process.env.SMTP_HOST || "").trim() &&
      Number(process.env.SMTP_PORT || 0) > 0 &&
      String(process.env.SMTP_USER || "").trim() &&
      String(process.env.SMTP_PASS || "").trim()
  );
  const hasEmailProvider = resendEnabled || smtpEnabled;

  if (hasEmailProvider) {
    addResult("pass", "Email provider configured (Resend and/or SMTP).");
  } else {
    addResult("warn", "No email delivery provider configured (email verification signup path will be unavailable).");
  }

  if (authFrom) {
    addResult("pass", "Sender address configured (AUTH_FROM/FEEDBACK_FROM/SMTP_USER).");
  } else {
    addResult("warn", "Missing sender address for verification emails.");
  }

  const adminToken = String(process.env.ADMIN_SECURITY_TOKEN || process.env.ADMIN_API_TOKEN || "").trim();
  if (adminToken) {
    addResult("pass", "Admin security token configured.");
  } else {
    addResult("fail", "Missing ADMIN_SECURITY_TOKEN (or ADMIN_API_TOKEN).");
  }

  const passwordIterations = Number(process.env.AUTH_PASSWORD_ITERATIONS || 210000);
  if (Number.isFinite(passwordIterations) && passwordIterations >= 200000) {
    addResult("pass", `AUTH_PASSWORD_ITERATIONS is strong (${passwordIterations}).`);
  } else {
    addResult("warn", `AUTH_PASSWORD_ITERATIONS is low (${passwordIterations}). Recommended >= 200000.`);
  }

  const emailTtlMs = Number(process.env.EMAIL_VERIFICATION_TTL_MS || 24 * 60 * 60 * 1000);
  if (Number.isFinite(emailTtlMs) && emailTtlMs >= 30 * 60 * 1000 && emailTtlMs <= 72 * 60 * 60 * 1000) {
    addResult("pass", `Email verification TTL in sane range (${emailTtlMs} ms).`);
  } else {
    addResult("warn", `EMAIL_VERIFICATION_TTL_MS unusual (${emailTtlMs}). Recommended 30m to 72h.`);
  }

  const authAlertsConfigured = Boolean(
    String(process.env.AUTH_ALERT_WEBHOOK_URL || process.env.ERROR_WEBHOOK_URL || "").trim()
  );
  if (authAlertsConfigured) {
    addResult("pass", "Alert webhook configured (AUTH_ALERT_WEBHOOK_URL or ERROR_WEBHOOK_URL).");
  } else {
    addResult("warn", "No alert webhook configured for auth/security notifications.");
  }

  const stripeSecretKey = String(process.env.STRIPE_SECRET_KEY || "").trim();
  const stripePriceId = String(
    process.env.STRIPE_PREMIUM_PRICE_ID ||
      process.env.STRIPE_PRICE_ID ||
      process.env.PREMIUM_STRIPE_PRICE_ID ||
      ""
  ).trim();
  const stripeWebhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();
  if (stripeSecretKey || stripePriceId || stripeWebhookSecret) {
    if (stripeSecretKey && stripePriceId) {
      addResult("pass", "Stripe checkout credentials configured.");
    } else {
      addResult(
        isProduction ? "fail" : "warn",
        "Stripe checkout is partially configured; set both STRIPE_SECRET_KEY and STRIPE_PREMIUM_PRICE_ID."
      );
    }
    if (stripeWebhookSecret) {
      addResult("pass", "Stripe webhook signing secret configured.");
    } else {
      addResult(
        isProduction ? "fail" : "warn",
        "Missing STRIPE_WEBHOOK_SECRET. Stripe webhooks must be signed in production."
      );
    }
  }

  const publicOrigin = String(process.env.PUBLIC_APP_ORIGIN || "").trim();
  const authStoreBackend = String(process.env.AUTH_STORE_BACKEND || "file").trim().toLowerCase() || "file";
  const authPostgresUrl = String(process.env.AUTH_POSTGRES_URL || process.env.DATABASE_URL || "").trim();
  const authPostgresBootstrapFromFile = isTruthy(process.env.AUTH_POSTGRES_BOOTSTRAP_FROM_FILE);
  const authPostgresFallbackToFile = ["1", "true", "yes"].includes(
    String(process.env.AUTH_POSTGRES_FALLBACK_TO_FILE || "")
      .trim()
      .toLowerCase()
  );
  if (authStoreBackend === "postgres") {
    if (authPostgresUrl) {
      try {
        const parsed = new URL(authPostgresUrl);
        const protocolOk = parsed.protocol === "postgres:" || parsed.protocol === "postgresql:";
        const hostname = parsed.hostname.toLowerCase();
        const isLocalPostgres =
          hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
        const isNeon = hostname.endsWith(".neon.tech");
        const isPooledNeon = isNeon && hostname.includes("-pooler.");
        const sslMode = String(parsed.searchParams.get("sslmode") || "").toLowerCase();
        const tlsRequired = ["require", "verify-ca", "verify-full"].includes(sslMode);
        if (!protocolOk) {
          addResult("fail", "AUTH_POSTGRES_URL must use postgres:// or postgresql://.");
        } else if (isProduction && !isLocalPostgres && !tlsRequired) {
          addResult("fail", "Remote production Postgres URL must include sslmode=require or stronger.");
        } else if (isPooledNeon) {
          addResult("fail", "Use the direct Neon connection URL, not the pooled URL.");
        } else {
          addResult("pass", "Postgres auth store URL is valid and transport policy is satisfied.");
        }
        if (
          isNeon &&
          String(parsed.searchParams.get("channel_binding") || "").toLowerCase() !== "require"
        ) {
          addResult("warn", "Neon URL should include channel_binding=require.");
        }
      } catch {
        addResult("fail", "AUTH_POSTGRES_URL is not a valid URL.");
      }
    } else if (authPostgresFallbackToFile) {
      addResult(
        "warn",
        "AUTH_STORE_BACKEND=postgres has no AUTH_POSTGRES_URL/DATABASE_URL; emergency file fallback will be used until Postgres is configured."
      );
    } else {
      addResult("fail", "AUTH_STORE_BACKEND=postgres requires AUTH_POSTGRES_URL (or DATABASE_URL).");
    }
    if (authPostgresFallbackToFile) {
      addResult(
        isProduction ? "fail" : "warn",
        "AUTH_POSTGRES_FALLBACK_TO_FILE is enabled. Production must fail closed to prevent split auth data."
      );
    }
    if (authPostgresBootstrapFromFile) {
      addResult(
        isProduction ? "fail" : "warn",
        "AUTH_POSTGRES_BOOTSTRAP_FROM_FILE is enabled; an empty Postgres store can import local account data."
      );
    } else {
      addResult("pass", "Postgres file bootstrap is disabled.");
    }
  } else if (authStoreBackend === "file") {
    if (isProduction) {
      addResult(
        "warn",
        "AUTH_STORE_BACKEND=file in production. Ensure persistent disk + single instance, or switch to Postgres."
      );
    } else {
      addResult("pass", "File auth store backend selected for non-production.");
    }
  } else {
    addResult("fail", `Unsupported AUTH_STORE_BACKEND value (${authStoreBackend}). Use file or postgres.`);
  }

  if (isProduction) {
    if (!publicOrigin) {
      addResult("fail", "Missing PUBLIC_APP_ORIGIN in production.");
    } else {
      try {
        const parsed = new URL(publicOrigin);
        if (parsed.protocol === "https:") {
          addResult("pass", `PUBLIC_APP_ORIGIN uses HTTPS (${parsed.origin}).`);
        } else {
          addResult("fail", "PUBLIC_APP_ORIGIN must use https:// in production.");
        }
      } catch {
        addResult("fail", "PUBLIC_APP_ORIGIN is not a valid URL.");
      }
    }
  } else {
    addResult("pass", "Non-production mode detected; strict production URL checks skipped.");
  }

  const googleClientId = String(process.env.GOOGLE_OAUTH_CLIENT_ID || "").trim();
  const googleClientSecret = String(process.env.GOOGLE_OAUTH_CLIENT_SECRET || "").trim();
  const googleRedirect = String(process.env.GOOGLE_OAUTH_REDIRECT_URI || "").trim();
  const googleAnySet = Boolean(googleClientId || googleClientSecret || googleRedirect);
  if (!googleAnySet) {
    addResult("pass", "Google OAuth disabled (no Google OAuth env set).");
  } else if (googleClientId && googleClientSecret) {
    addResult("pass", "Google OAuth credentials are complete.");
  } else {
    addResult("fail", "Google OAuth is partially configured (set both GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET).");
  }

  if (googleRedirect) {
    try {
      const parsed = new URL(googleRedirect);
      if (!isProduction || parsed.protocol === "https:") {
        addResult("pass", `Google OAuth redirect URI valid (${parsed.origin}).`);
      } else {
        addResult("fail", "GOOGLE_OAUTH_REDIRECT_URI must use https:// in production.");
      }
    } catch {
      addResult("fail", "GOOGLE_OAUTH_REDIRECT_URI is not a valid URL.");
    }
  }

  const serverSource = readServerSource();
  const hasHttpOnlyCookie = serverSource.includes("httpOnly: true");
  const hasSameSiteLax = serverSource.includes('sameSite: "Lax"');
  const hasSecureCookieHook = serverSource.includes("secure: shouldUseSecureAuthCookie(req)");
  if (hasHttpOnlyCookie && hasSameSiteLax && hasSecureCookieHook) {
    addResult("pass", "Cookie policy checks found (HttpOnly + SameSite=Lax + conditional Secure).");
  } else {
    addResult("fail", "Cookie policy checks missing in backend/server.js.");
  }

  if (isTruthy(process.env.AUTH_DEBUG_VERBOSE)) {
    addResult("warn", "AUTH_DEBUG_VERBOSE enabled; disable in production if not needed.");
  }

  const failures = checks.filter((entry) => entry.status === "fail");
  const warnings = checks.filter((entry) => entry.status === "warn");
  const passes = checks.filter((entry) => entry.status === "pass");

  passes.forEach((entry) => console.log(`PASS [auth-readiness] ${entry.message}`));
  warnings.forEach((entry) => console.warn(`WARN [auth-readiness] ${entry.message}`));
  failures.forEach((entry) => console.error(`FAIL [auth-readiness] ${entry.message}`));

  if (failures.length) {
    process.exit(1);
  }

  console.log(`PASS [auth-readiness] completed (${passes.length} pass, ${warnings.length} warning)`);
} catch (error) {
  console.error("AUTH READINESS CHECK FAILED");
  console.error(`- ${error.message || error}`);
  process.exit(1);
}
