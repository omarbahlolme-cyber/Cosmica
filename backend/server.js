/* ==========================================================================
   COSMICA API SERVER
   Serves static site assets and exposes feedback/chat API endpoints.
   ========================================================================== */
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const OpenAI = require("openai");
const nodemailer = require("nodemailer");
require("dotenv").config();

/* --------------------------------------------------------------------------
   EXPRESS APP + CORE MIDDLEWARE
   -------------------------------------------------------------------------- */
const app = express();
const port = Number(process.env.PORT) || 3000;
app.disable("x-powered-by");
app.set("trust proxy", 1);
const STRIPE_WEBHOOK_PATH = "/api/billing/webhooks/stripe";
const APP_VERSION = (() => {
  try {
    return require("../package.json").version || "unknown";
  } catch {
    return "unknown";
  }
})();
const isProduction = process.env.NODE_ENV === "production";
const PROJECT_ROOT = path.resolve(__dirname, "..");
const FRONTEND_ROOT = path.join(PROJECT_ROOT, "frontend");
const FRONTEND_MAPS_ROOT = path.join(FRONTEND_ROOT, "maps");
const ADMIN_SECURITY_BASIC_USER = String(process.env.ADMIN_SECURITY_BASIC_USER || "").trim();
const ADMIN_SECURITY_BASIC_PASS = String(process.env.ADMIN_SECURITY_BASIC_PASS || "").trim();

const jsonBodyParser = express.json({ limit: "1mb" });
app.use((req, res, next) => {
  if (String(req.path || "") === STRIPE_WEBHOOK_PATH) {
    return next();
  }
  return jsonBodyParser(req, res, next);
});
app.use((req, res, next) => {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
});

/* --------------------------------------------------------------------------
   TRANSPORT + SECURITY HEADERS
   -------------------------------------------------------------------------- */
const isLocalHost = (host = "") => {
  const hostname = host.split(":")[0].toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1";
};

const isSecureRequest = (req) => {
  if (req.secure) {
    return true;
  }
  const forwarded = req.headers["x-forwarded-proto"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim().toLowerCase() === "https";
  }
  return false;
};

app.use((req, res, next) => {
  if (!isProduction || isLocalHost(req.headers.host || "")) {
    return next();
  }
  const hostHeader = req.headers.host || "www.cosmicalearn.com";
  const [hostname, portPart] = hostHeader.split(":");
  const canonicalHost = hostname.toLowerCase() === "cosmicalearn.com" ? "www.cosmicalearn.com" : hostname;
  const normalizedHost = portPart ? `${canonicalHost}:${portPart}` : canonicalHost;
  if (isSecureRequest(req) && normalizedHost === hostHeader) {
    return next();
  }
  return res.redirect(308, `https://${normalizedHost}${req.originalUrl}`);
});

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", "data:", "https:"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://static.cloudflareinsights.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        connectSrc: [
          "'self'",
          "https://www.cosmicalearn.com",
          "https://cosmicalearn.com",
          "https://cloudflareinsights.com",
          "https://static.cloudflareinsights.com",
        ],
        upgradeInsecureRequests: isProduction ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: isProduction
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    [
      "accelerometer=()",
      "autoplay=()",
      "camera=()",
      "display-capture=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "microphone=()",
      "payment=()",
      "usb=()",
    ].join(", ")
  );
  next();
});

/* --------------------------------------------------------------------------
   CORS CONFIGURATION
   -------------------------------------------------------------------------- */
const allowedOrigins = new Set([
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://cosmicalearn.com",
  "https://www.cosmicalearn.com",
  "https://cosmica-03wo.onrender.com",
]);

const extraOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

extraOrigins.forEach((origin) => allowedOrigins.add(origin));

const isLocalOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin) || isLocalOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

/* --------------------------------------------------------------------------
   RATE LIMITING
   -------------------------------------------------------------------------- */
const shouldSkipRateLimit = (req) => isLocalHost(req.headers.host || "");

const createLimiter = ({ windowMs, max, scope }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: shouldSkipRateLimit,
    handler: (req, res) => {
      res.status(429).json({
        error: "Too many requests, please try again later.",
        scope,
        requestId: req.requestId || null,
      });
    },
  });

const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  scope: "api",
});
const chatLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 45,
  scope: "chat",
});
const translateLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 90,
  scope: "translate",
});
const feedbackLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 12,
  scope: "feedback",
});
const healthLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 120,
  scope: "health",
});
const webVitalsLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 240,
  scope: "web-vitals",
});
const ttsLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 180,
  scope: "tts",
});
const authSignupLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  scope: "auth-signup",
});
const authLoginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  scope: "auth-login",
});
const authVerifyLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  scope: "auth-verify",
});
const authSessionLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 120,
  scope: "auth-session",
});
const authGoogleLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 80,
  scope: "auth-google",
});
const accountMutationLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 120,
  scope: "account-mutation",
});
const adminSecurityLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 180,
  scope: "admin-security",
});
const progressLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 300,
  scope: "progress",
});
const billingWebhookLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 240,
  scope: "billing-webhook",
});

/* --------------------------------------------------------------------------
   STATIC ASSET HOSTING
   -------------------------------------------------------------------------- */
const FRESH_ASSET_EXTENSIONS = new Set([
  ".js",
  ".css",
  ".json",
  ".map",
]);

const CACHEABLE_MEDIA_EXTENSIONS = new Set([
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".ico",
  ".woff",
  ".woff2",
]);

const RETIRED_WORLD_PATHS = new Set([
]);

const LEGACY_WORLD_ROUTE_REDIRECTS = new Map([
  ["/world.html", "/english-world.html"],
  ["/letters.html", "/english-letters.html"],
  ["/words.html", "/english-words.html"],
  ["/phrases.html", "/english-phrases.html"],
  ["/grammar.html", "/english-grammar.html"],
]);

const parseBasicAuthHeader = (authorizationHeader = "") => {
  const raw = String(authorizationHeader || "").trim();
  if (!raw.toLowerCase().startsWith("basic ")) {
    return null;
  }
  const encoded = raw.slice(6).trim();
  if (!encoded) {
    return null;
  }
  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const dividerIndex = decoded.indexOf(":");
    if (dividerIndex < 0) {
      return null;
    }
    const username = decoded.slice(0, dividerIndex);
    const password = decoded.slice(dividerIndex + 1);
    return {
      username,
      password,
    };
  } catch {
    return null;
  }
};

const basicAuthChallenge = (res) => {
  res.setHeader("WWW-Authenticate", 'Basic realm="Cosmica Admin", charset="UTF-8"');
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  return res.status(401).type("text/plain").send("Authentication required.");
};

app.get("/admin-security.html", (req, res) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Cache-Control", "no-store");
  if (!ADMIN_SECURITY_BASIC_USER || !ADMIN_SECURITY_BASIC_PASS) {
    return res.status(503).type("text/plain").send("Admin page basic auth is not configured.");
  }
  const credentials = parseBasicAuthHeader(req.get("authorization"));
  if (
    !credentials ||
    credentials.username !== ADMIN_SECURITY_BASIC_USER ||
    credentials.password !== ADMIN_SECURITY_BASIC_PASS
  ) {
    return basicAuthChallenge(res);
  }
  return res.sendFile(path.join(FRONTEND_ROOT, "admin-security.html"));
});

app.use((req, res, next) => {
  const requestPath = String(req.path || "").toLowerCase();
  if (!RETIRED_WORLD_PATHS.has(requestPath)) {
    return next();
  }
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  return res.status(410).type("text/plain").send("This page has been removed.");
});

app.use((req, res, next) => {
  const requestPath = String(req.path || "").toLowerCase();
  const targetPath = LEGACY_WORLD_ROUTE_REDIRECTS.get(requestPath);
  if (!targetPath) {
    return next();
  }
  const redirectTarget = `${targetPath}${req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`;
  return res.redirect(308, redirectTarget);
});

const sendMapAssetAlias = (fileName) => (req, res) => {
  return res.sendFile(path.join(FRONTEND_MAPS_ROOT, fileName));
};

app.get("/app-maps.js", sendMapAssetAlias("app-maps.js"));
app.get("/style-maps.css", sendMapAssetAlias("style-maps.css"));
app.get("/translations.json", sendMapAssetAlias("translations.json"));

app.use(
  express.static(FRONTEND_ROOT, {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === ".html") {
        // Keep documents revalidated on every request while remaining eligible
        // for platform/browser speculation and prefetch pipelines.
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        return;
      }
      if (FRESH_ASSET_EXTENSIONS.has(ext)) {
        // Force immediate revalidation for active bundles/data during rapid deploy cycles.
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        return;
      }
      if (CACHEABLE_MEDIA_EXTENSIONS.has(ext)) {
        res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
        return;
      }
      res.setHeader("Cache-Control", "no-cache");
    },
  })
);

/* --------------------------------------------------------------------------
   API CACHE POLICY
   Keep API responses dynamic while static files use tuned cache headers.
   -------------------------------------------------------------------------- */
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use("/api", cors(corsOptions));
app.use("/api", apiLimiter);

/* --------------------------------------------------------------------------
   SECURITY CONTACT FILE
   -------------------------------------------------------------------------- */
app.get("/.well-known/security.txt", (req, res) => {
  res.type("text/plain");
  return res.sendFile(path.join(FRONTEND_ROOT, "security.txt"));
});

app.get("/favicon.ico", (req, res) => {
  return res.redirect(302, "/favicon.svg");
});

/* --------------------------------------------------------------------------
   SERVICE CLIENT HELPERS (OPENAI + EMAIL)
   -------------------------------------------------------------------------- */
const createClient = (apiKey) => new OpenAI({ apiKey });
const getChatClient = () => createClient(process.env.OPENAI_CHAT_KEY || process.env.OPENAI_API_KEY);
const ERROR_WEBHOOK_URL = process.env.ERROR_WEBHOOK_URL || "";
const RUM_WEBHOOK_URL = process.env.RUM_WEBHOOK_URL || "";
const AUTH_ALERT_WEBHOOK_URL = String(process.env.AUTH_ALERT_WEBHOOK_URL || ERROR_WEBHOOK_URL || "").trim();
const AUTH_LOGIN_SPIKE_WINDOW_MS = Math.max(
  60 * 1000,
  Number(process.env.AUTH_LOGIN_SPIKE_WINDOW_MS || 5 * 60 * 1000)
);
const AUTH_LOGIN_SPIKE_THRESHOLD = Math.max(5, Number(process.env.AUTH_LOGIN_SPIKE_THRESHOLD || 20));
const AUTH_LOGIN_SPIKE_COOLDOWN_MS = Math.max(
  60 * 1000,
  Number(process.env.AUTH_LOGIN_SPIKE_COOLDOWN_MS || 15 * 60 * 1000)
);
const AUTH_EMAIL_FAILURE_ALERT_COOLDOWN_MS = Math.max(
  60 * 1000,
  Number(process.env.AUTH_EMAIL_FAILURE_ALERT_COOLDOWN_MS || 20 * 60 * 1000)
);
const isTruthyEnvValue = (value) =>
  ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
const GOOGLE_TTS_ENABLED = isTruthyEnvValue(process.env.GOOGLE_TTS_ENABLED);
const GOOGLE_TTS_DEFAULT_LANGUAGE = process.env.GOOGLE_TTS_LANGUAGE_CODE || "en-GB";
const GOOGLE_TTS_DEFAULT_VOICE = process.env.GOOGLE_TTS_VOICE || "en-GB-Neural2-F";
const authLoginFailureSpikeTracker = new Map();
const authAlertLastSentByKey = new Map();
const stripeWebhookHealthState = {
  lastReceivedAt: null,
  lastProcessedAt: null,
  lastRejectedAt: null,
  lastErrorAt: null,
  lastMonitorCheckAt: null,
  lastReconcileAt: null,
  lastReconcileSummary: null,
  lastEventType: "",
  lastEventId: "",
  recentFailureCount: 0,
  recentSuccessCount: 0,
};
let lastStripeWebhookAlertAtMs = 0;
const STRIPE_WEBHOOK_ALERT_COOLDOWN_MS = Math.max(
  60 * 1000,
  Number(process.env.STRIPE_WEBHOOK_ALERT_COOLDOWN_MS || 5 * 60 * 1000)
);
const STRIPE_WEBHOOK_SILENCE_THRESHOLD_MS = Math.max(
  15 * 60 * 1000,
  Number(process.env.STRIPE_WEBHOOK_SILENCE_THRESHOLD_MS || 12 * 60 * 60 * 1000)
);
const BILLING_MONITOR_INTERVAL_MS = Math.max(
  5 * 60 * 1000,
  Number(process.env.BILLING_MONITOR_INTERVAL_MS || 10 * 60 * 1000)
);
const STRIPE_RECONCILE_INTERVAL_MS = Math.max(
  6 * 60 * 60 * 1000,
  Number(process.env.STRIPE_RECONCILE_INTERVAL_MS || 24 * 60 * 60 * 1000)
);
const AUTH_STORE_FAIL_FAST_ON_LOAD_ERROR = isTruthyEnvValue(
  String(process.env.AUTH_STORE_FAIL_FAST_ON_LOAD_ERROR || "true").trim()
);
const PREMIUM_CONTINUITY_CANARY_INTERVAL_MS = Math.max(
  10 * 60 * 1000,
  Number(process.env.PREMIUM_CONTINUITY_CANARY_INTERVAL_MS || 60 * 60 * 1000)
);
const STRIPE_PREMIUM_RECOVERY_SYNC_COOLDOWN_MS = Math.max(
  2 * 60 * 1000,
  Number(process.env.STRIPE_PREMIUM_RECOVERY_SYNC_COOLDOWN_MS || 10 * 60 * 1000)
);

const getStripeClient = (() => {
  let cachedClient = null;
  let cachedKey = "";
  return () => {
    const secretKey = String(process.env.STRIPE_SECRET_KEY || "").trim();
    if (!secretKey) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }
    if (cachedClient && cachedKey === secretKey) {
      return cachedClient;
    }
    let Stripe = null;
    try {
      Stripe = require("stripe");
    } catch (error) {
      throw new Error(`Stripe package missing: ${error.message || error}`);
    }
    cachedClient = new Stripe(secretKey, {
      apiVersion: "2025-01-27.acacia",
    });
    cachedKey = secretKey;
    return cachedClient;
  };
})();

const getGoogleTtsClient = (() => {
  let cachedClient = null;
  return () => {
    if (!GOOGLE_TTS_ENABLED) {
      return null;
    }
    if (cachedClient) {
      return cachedClient;
    }

    const credentialsB64 = String(process.env.GOOGLE_TTS_CREDENTIALS_B64 || "").trim();
    if (!credentialsB64) {
      throw new Error("Missing GOOGLE_TTS_CREDENTIALS_B64");
    }

    let TextToSpeechClient = null;
    try {
      ({ TextToSpeechClient } = require("@google-cloud/text-to-speech"));
    } catch (error) {
      throw new Error(`Google TTS package missing: ${error.message || error}`);
    }

    let credentials = null;
    try {
      const json = Buffer.from(credentialsB64, "base64").toString("utf8");
      credentials = JSON.parse(json);
    } catch (error) {
      throw new Error(`Invalid GOOGLE_TTS_CREDENTIALS_B64: ${error.message || error}`);
    }

    cachedClient = new TextToSpeechClient({ credentials });
    return cachedClient;
  };
})();

const postErrorWebhook = async (payload) => {
  if (!ERROR_WEBHOOK_URL) {
    return;
  }
  try {
    await fetch(ERROR_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Error webhook failed:", error.message || error);
  }
};

const postRumWebhook = async (payload) => {
  if (!RUM_WEBHOOK_URL) {
    return;
  }
  try {
    await fetch(RUM_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("RUM webhook failed:", error.message || error);
  }
};

const postAuthAlertWebhook = async (payload) => {
  if (!AUTH_ALERT_WEBHOOK_URL) {
    return;
  }
  try {
    await fetch(AUTH_ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Auth alert webhook failed:", error.message || error);
  }
};

const hashForAlert = (value) =>
  crypto.createHash("sha256").update(String(value || ""), "utf8").digest("hex").slice(0, 20);

const pruneAuthAlertCaches = (nowMs = Date.now()) => {
  const staleTrackerMs = Math.max(AUTH_LOGIN_SPIKE_WINDOW_MS * 3, AUTH_LOGIN_SPIKE_COOLDOWN_MS * 2);
  for (const [key, state] of authLoginFailureSpikeTracker.entries()) {
    if (!state || typeof state !== "object") {
      authLoginFailureSpikeTracker.delete(key);
      continue;
    }
    const windowStartedAtMs = Number(state.windowStartedAtMs || 0);
    const lastAlertAtMs = Number(state.lastAlertAtMs || 0);
    const staleByWindow = windowStartedAtMs > 0 && nowMs - windowStartedAtMs > staleTrackerMs;
    const staleByAlert = lastAlertAtMs > 0 && nowMs - lastAlertAtMs > staleTrackerMs;
    if (staleByWindow && staleByAlert) {
      authLoginFailureSpikeTracker.delete(key);
    }
  }
  const staleAlertMs = Math.max(AUTH_EMAIL_FAILURE_ALERT_COOLDOWN_MS * 4, AUTH_LOGIN_SPIKE_COOLDOWN_MS * 3);
  for (const [key, lastSentAtMs] of authAlertLastSentByKey.entries()) {
    if (!Number.isFinite(lastSentAtMs) || nowMs - lastSentAtMs > staleAlertMs) {
      authAlertLastSentByKey.delete(key);
    }
  }
};

const maybeAlertAuthLoginFailureSpike = ({ req = null, email = "", userId = "", reason = "" } = {}) => {
  if (!AUTH_ALERT_WEBHOOK_URL || AUTH_LOGIN_SPIKE_THRESHOLD <= 0) {
    return;
  }
  const nowMs = Date.now();
  const ipHash = getRequestIpHash(req) || "unknown";
  const trackerKey = `login-spike:${ipHash}`;
  const existingState = authLoginFailureSpikeTracker.get(trackerKey) || {
    windowStartedAtMs: nowMs,
    count: 0,
    lastAlertAtMs: 0,
  };
  if (!Number.isFinite(existingState.windowStartedAtMs) || nowMs - existingState.windowStartedAtMs > AUTH_LOGIN_SPIKE_WINDOW_MS) {
    existingState.windowStartedAtMs = nowMs;
    existingState.count = 0;
  }
  existingState.count += 1;
  authLoginFailureSpikeTracker.set(trackerKey, existingState);
  if (existingState.count < AUTH_LOGIN_SPIKE_THRESHOLD) {
    pruneAuthAlertCaches(nowMs);
    return;
  }
  if (nowMs - Number(existingState.lastAlertAtMs || 0) < AUTH_LOGIN_SPIKE_COOLDOWN_MS) {
    pruneAuthAlertCaches(nowMs);
    return;
  }
  existingState.lastAlertAtMs = nowMs;
  authLoginFailureSpikeTracker.set(trackerKey, existingState);
  const normalizedEmail = normalizeEmail(email);
  void postAuthAlertWebhook({
    type: "auth_login_failure_spike",
    severity: "warning",
    timestamp: new Date(nowMs).toISOString(),
    threshold: AUTH_LOGIN_SPIKE_THRESHOLD,
    observedCount: existingState.count,
    windowMs: AUTH_LOGIN_SPIKE_WINDOW_MS,
    cooldownMs: AUTH_LOGIN_SPIKE_COOLDOWN_MS,
    ipHash,
    emailHash: normalizedEmail ? hashForAlert(`email:${normalizedEmail}`) : "",
    userIdHash: userId ? hashForAlert(`user:${String(userId).trim()}`) : "",
    reason: String(reason || "").slice(0, 160),
    requestId: String(req?.requestId || ""),
    endpoint: String(req?.originalUrl || "").slice(0, 240),
    method: String(req?.method || "").slice(0, 16),
  });
  pruneAuthAlertCaches(nowMs);
};

const maybeAlertVerificationEmailDeliveryFailure = ({
  req = null,
  email = "",
  phase = "signup",
  deliveryError = "",
} = {}) => {
  if (!AUTH_ALERT_WEBHOOK_URL) {
    return;
  }
  const nowMs = Date.now();
  const normalizedPhase = String(phase || "signup").trim().toLowerCase() || "signup";
  const errorSignature = hashForAlert(`${normalizedPhase}:${String(deliveryError || "").trim().toLowerCase()}`);
  const alertKey = `verify-email:${errorSignature}`;
  const lastSentAtMs = Number(authAlertLastSentByKey.get(alertKey) || 0);
  if (lastSentAtMs && nowMs - lastSentAtMs < AUTH_EMAIL_FAILURE_ALERT_COOLDOWN_MS) {
    pruneAuthAlertCaches(nowMs);
    return;
  }
  authAlertLastSentByKey.set(alertKey, nowMs);
  const normalizedEmail = normalizeEmail(email);
  void postAuthAlertWebhook({
    type: "auth_verification_email_delivery_failed",
    severity: "error",
    timestamp: new Date(nowMs).toISOString(),
    phase: normalizedPhase,
    cooldownMs: AUTH_EMAIL_FAILURE_ALERT_COOLDOWN_MS,
    emailHash: normalizedEmail ? hashForAlert(`email:${normalizedEmail}`) : "",
    errorMessage: String(deliveryError || "").slice(0, 260),
    requestId: String(req?.requestId || ""),
    endpoint: String(req?.originalUrl || "").slice(0, 240),
    method: String(req?.method || "").slice(0, 16),
  });
  pruneAuthAlertCaches(nowMs);
};

const maybeAlertStripeWebhookIssue = ({ req = null, reason = "", details = {} } = {}) => {
  if (!AUTH_ALERT_WEBHOOK_URL) {
    return;
  }
  const nowMs = Date.now();
  if (lastStripeWebhookAlertAtMs && nowMs - lastStripeWebhookAlertAtMs < STRIPE_WEBHOOK_ALERT_COOLDOWN_MS) {
    return;
  }
  lastStripeWebhookAlertAtMs = nowMs;
  void postAuthAlertWebhook({
    type: "billing_stripe_webhook_issue",
    severity: "error",
    timestamp: new Date(nowMs).toISOString(),
    reason: String(reason || "unknown").slice(0, 200),
    requestId: String(req?.requestId || ""),
    endpoint: String(req?.originalUrl || "").slice(0, 240),
    method: String(req?.method || "").slice(0, 16),
    details,
  });
};

const reportServerError = (scope, error, context = {}) => {
  const message = error?.message || String(error);
  const record = {
    scope,
    message,
    stack: error?.stack || "",
    context,
    timestamp: new Date().toISOString(),
  };
  console.error(`[${scope}] ${message}`, context);
  void postErrorWebhook({ type: "server_error", ...record });
};

const getMailer = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

const sendViaResend = async ({ from, to, replyTo, subject, text }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Missing RESEND_API_KEY" };
  }
  const payload = {
    from,
    to,
    subject,
    text,
  };
  if (replyTo) {
    payload.reply_to = replyTo;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { ok: false, error: body?.message || `Resend error ${response.status}` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Resend request failed" };
  }
};

const hasSmtpDeliveryConfig = () =>
  Boolean(
    String(process.env.SMTP_HOST || "").trim() &&
      Number(process.env.SMTP_PORT || 0) > 0 &&
      String(process.env.SMTP_USER || "").trim() &&
      String(process.env.SMTP_PASS || "").trim()
  );

const hasAnyEmailDeliveryConfig = () =>
  Boolean(String(process.env.RESEND_API_KEY || "").trim()) || hasSmtpDeliveryConfig();

const runAuthRuntimeConfigAudit = () => {
  const issues = [];
  const warnings = [];
  const publicOrigin = String(process.env.PUBLIC_APP_ORIGIN || "").trim();
  const senderAddress = String(
    process.env.AUTH_FROM || process.env.FEEDBACK_FROM || process.env.SMTP_USER || ""
  ).trim();

  if (!ADMIN_SECURITY_TOKEN) {
    issues.push("Missing ADMIN_SECURITY_TOKEN/ADMIN_API_TOKEN (admin security APIs cannot be protected).");
  }
  if (!hasAnyEmailDeliveryConfig()) {
    warnings.push("No email delivery provider configured (email verification sign-up path will be disabled).");
  }
  if (!senderAddress) {
    warnings.push("Missing AUTH_FROM (or FEEDBACK_FROM/SMTP_USER fallback) for verification emails.");
  }
  if (isProduction) {
    if (!publicOrigin) {
      warnings.push("Missing PUBLIC_APP_ORIGIN in production; verification links will depend on request host.");
    } else {
      try {
        const parsed = new URL(publicOrigin);
        if (parsed.protocol !== "https:") {
          issues.push("PUBLIC_APP_ORIGIN must use https:// in production.");
        }
      } catch {
        issues.push("PUBLIC_APP_ORIGIN is not a valid URL.");
      }
    }
    if (!AUTH_ALERT_WEBHOOK_URL) {
      warnings.push("AUTH_ALERT_WEBHOOK_URL/ERROR_WEBHOOK_URL not set; auth security alerts will not be forwarded.");
    }
  }

  if (!issues.length && !warnings.length) {
    return;
  }

  if (issues.length) {
    console.error("[auth-config] Startup issues detected:");
    issues.forEach((issue) => console.error(`- ${issue}`));
  }
  if (warnings.length) {
    console.warn("[auth-config] Startup warnings:");
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }

  void postAuthAlertWebhook({
    type: "auth_runtime_config_audit",
    severity: issues.length ? "error" : "warning",
    timestamp: new Date().toISOString(),
    issues,
    warnings,
    environment: process.env.NODE_ENV || "development",
  });
};

const sendTransactionalEmail = async ({ to, subject, text, replyTo = "" }) => {
  const recipient = String(to || "").trim();
  if (!recipient) {
    return { ok: false, error: "Missing recipient email" };
  }
  const fromAddress = String(
    process.env.AUTH_FROM || process.env.FEEDBACK_FROM || process.env.SMTP_USER || ""
  ).trim();
  if (!fromAddress) {
    return { ok: false, error: "Missing AUTH_FROM/FEEDBACK_FROM sender address" };
  }

  const resendConfigured = Boolean(String(process.env.RESEND_API_KEY || "").trim());
  if (resendConfigured) {
    const resendResult = await sendViaResend({
      from: fromAddress,
      to: recipient,
      replyTo: String(replyTo || "").trim() || undefined,
      subject,
      text,
    });
    if (resendResult.ok) {
      return { ok: true };
    }
  }

  const mailer = getMailer();
  if (!mailer) {
    return { ok: false, error: "No email provider configured" };
  }

  try {
    await mailer.sendMail({
      from: fromAddress,
      to: recipient,
      replyTo: String(replyTo || "").trim() || undefined,
      subject,
      text,
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || "SMTP delivery failed" };
  }
};

/* --------------------------------------------------------------------------
   AUTH + ACCOUNT DATA STORE
   Lightweight file-backed persistence for accounts, sessions, and progress.
   -------------------------------------------------------------------------- */
const AUTH_DATA_ROOT = path.join(__dirname, "data");
const AUTH_STORE_FILE = path.join(AUTH_DATA_ROOT, "accounts.json");
const DELETED_ACCOUNTS_AUDIT_FILE = path.join(AUTH_DATA_ROOT, "deleted-accounts.json");
const REGISTERED_ACCOUNTS_AUDIT_FILE = path.join(AUTH_DATA_ROOT, "registered-accounts.json");
const BLOCKED_USERS_STORE_FILE = path.join(AUTH_DATA_ROOT, "blocked-users.json");
const SECURITY_EVENTS_STORE_FILE = path.join(AUTH_DATA_ROOT, "security-events.json");
const AUTH_STORE_SCHEMA_VERSION = 1;
const BLOCKED_USERS_SCHEMA_VERSION = 1;
const SECURITY_EVENTS_SCHEMA_VERSION = 1;
const AUTH_COOKIE_NAME = "cosmica_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const MAX_SESSIONS_PER_USER = 6;
const ADMIN_SECURITY_TOKEN = String(
  process.env.ADMIN_SECURITY_TOKEN || process.env.ADMIN_API_TOKEN || ""
).trim();
const MAX_USER_DATA_SERIALIZED_CHARS = 120000;
const MAX_PROGRESS_SERIALIZED_CHARS = 220000;
const PASSWORD_HASH_ITERATIONS = Math.max(
  120000,
  Number(process.env.AUTH_PASSWORD_ITERATIONS || 210000)
);
const PASSWORD_HASH_KEYLEN = 64;
const PASSWORD_HASH_DIGEST = "sha512";
const GOOGLE_OAUTH_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_OAUTH_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const GOOGLE_OAUTH_STATE_TTL_MS = 1000 * 60 * 10;
const GOOGLE_OAUTH_FLOW_COOKIE_NAME = "cosmica_google_flow";
const GOOGLE_OAUTH_FLOW_COOKIE_TTL_MS = 1000 * 60 * 12;
const EMAIL_VERIFICATION_TOKEN_TTL_MS = Math.max(
  5 * 60 * 1000,
  Number(process.env.EMAIL_VERIFICATION_TTL_MS || 1000 * 60 * 60 * 24)
);
const PASSWORD_RESET_TOKEN_TTL_MS = Math.max(
  5 * 60 * 1000,
  Number(process.env.PASSWORD_RESET_TTL_MS || 1000 * 60 * 60 * 2)
);
const googleOauthStateStore = new Map();

const isPlainObject = (value) =>
  Boolean(value) && Object.prototype.toString.call(value) === "[object Object]";

const createDefaultUserData = () => ({
  settings: {
    baseLanguage: "",
  },
  profile: {},
});

const QUEST_TASK_TEMPLATES = Object.freeze({
  practice: Object.freeze({
    key: "practice",
    label: "Practice 25 cards",
    target: 25,
  }),
  discover: Object.freeze({
    key: "discover",
    label: "Start 3 sections",
    target: 3,
  }),
  complete: Object.freeze({
    key: "complete",
    label: "Complete 2 sections",
    target: 2,
  }),
});

const REVIEW_INTERVAL_DAYS = Object.freeze([1, 3, 7]);
const WORLD_BOSS_CHECKPOINT_SIZE = 6;
const BOSS_SECTION_KEY_PREFIX = "__boss_checkpoint_";

const createDefaultQuestTasks = () => ({
  practice: {
    ...QUEST_TASK_TEMPLATES.practice,
    progress: 0,
    completed: false,
  },
  discover: {
    ...QUEST_TASK_TEMPLATES.discover,
    progress: 0,
    completed: false,
  },
  complete: {
    ...QUEST_TASK_TEMPLATES.complete,
    progress: 0,
    completed: false,
  },
});

const createDefaultGamificationState = () => ({
  level: 1,
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: null,
  nextLevelXp: 120,
  badges: {},
  quests: {
    date: null,
    tasks: createDefaultQuestTasks(),
    allCompleted: false,
  },
  stats: {
    sectionsVisited: 0,
    sectionsCompleted: 0,
    cardsPracticed: 0,
    grammarReviews: 0,
    worldsEngaged: [],
    questDaysCompleted: 0,
  },
  daily: {
    date: null,
    xpEarned: 0,
    events: 0,
    startedEvents: 0,
    practicedEvents: 0,
    reviewEvents: 0,
    completedEvents: 0,
  },
});

const createDefaultProgress = () => ({
  totals: {
    xp: 0,
    completedSections: 0,
    lastActivityAt: null,
  },
  worlds: {},
  recentEvents: [],
  gamification: createDefaultGamificationState(),
  updatedAt: null,
});

const createEmptyAuthStore = () => ({
  schemaVersion: AUTH_STORE_SCHEMA_VERSION,
  updatedAt: new Date().toISOString(),
  users: {},
  emailIndex: {},
  sessions: {},
});

const createEmptyBlockedUsersStore = () => ({
  schemaVersion: BLOCKED_USERS_SCHEMA_VERSION,
  updatedAt: new Date().toISOString(),
  emails: {},
  userIds: {},
  ipHashes: {},
});

const createEmptySecurityEventsStore = () => ({
  schemaVersion: SECURITY_EVENTS_SCHEMA_VERSION,
  updatedAt: new Date().toISOString(),
  events: [],
});

const cloneObjectSafely = (value, fallbackValue, maxSerializedChars) => {
  if (!isPlainObject(value)) {
    return typeof fallbackValue === "function" ? fallbackValue() : fallbackValue;
  }
  try {
    const serialized = JSON.stringify(value);
    if (!serialized || serialized.length > maxSerializedChars) {
      return typeof fallbackValue === "function" ? fallbackValue() : fallbackValue;
    }
    const parsed = JSON.parse(serialized);
    return isPlainObject(parsed)
      ? parsed
      : typeof fallbackValue === "function"
        ? fallbackValue()
        : fallbackValue;
  } catch {
    return typeof fallbackValue === "function" ? fallbackValue() : fallbackValue;
  }
};

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const sanitizeDisplayName = (value, email = "") => {
  const explicit = String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 60);
  if (explicit) {
    return explicit;
  }
  const fallback = String(email || "")
    .split("@")[0]
    .trim()
    .slice(0, 30);
  return fallback || "Explorer";
};

const createEmptyEmailVerificationState = () => ({
  tokenHash: "",
  expiresAt: null,
  sentAt: null,
});

const normalizeEmailVerificationState = (value) => {
  const fallback = createEmptyEmailVerificationState();
  const candidate = isPlainObject(value) ? value : {};
  fallback.tokenHash = String(candidate.tokenHash || "").trim();
  fallback.expiresAt =
    typeof candidate.expiresAt === "string" && candidate.expiresAt ? candidate.expiresAt : null;
  fallback.sentAt = typeof candidate.sentAt === "string" && candidate.sentAt ? candidate.sentAt : null;
  return fallback;
};

const createEmptyPasswordResetState = () => ({
  tokenHash: "",
  expiresAt: null,
  sentAt: null,
});

const normalizePasswordResetState = (value) => {
  const fallback = createEmptyPasswordResetState();
  const candidate = isPlainObject(value) ? value : {};
  fallback.tokenHash = String(candidate.tokenHash || "").trim();
  fallback.expiresAt =
    typeof candidate.expiresAt === "string" && candidate.expiresAt ? candidate.expiresAt : null;
  fallback.sentAt = typeof candidate.sentAt === "string" && candidate.sentAt ? candidate.sentAt : null;
  return fallback;
};

const normalizePremiumProfileSchema = (profileValue) => {
  const profile = isPlainObject(profileValue) ? profileValue : {};
  const normalized = { ...profile };
  const currentSnapshot = resolvePremiumSnapshotFromProfile(profile);

  normalized.isPremium = currentSnapshot.isPremium;
  normalized.premium = currentSnapshot.isPremium;
  normalized.plan = currentSnapshot.planTier;
  normalized.tier = currentSnapshot.planTier;
  normalized.membership = currentSnapshot.planTier;

  const normalizeBool = (value, fallback = false) => {
    if (value === true || value === false) {
      return value;
    }
    const text = String(value || "").trim().toLowerCase();
    if (!text) {
      return fallback;
    }
    return ["1", "true", "yes", "on"].includes(text);
  };

  const normalizeIso = (value) => {
    const parsedMs = Date.parse(String(value || "").trim());
    if (!Number.isFinite(parsedMs)) {
      return "";
    }
    return new Date(parsedMs).toISOString();
  };

  const normalizeId = (value, limit = 120) => String(value || "").trim().slice(0, limit);
  const normalizeShort = (value, limit = 60) => String(value || "").trim().slice(0, limit);

  normalized.premiumCancelAtPeriodEnd = normalizeBool(normalized.premiumCancelAtPeriodEnd, false);

  const stringIsoFields = [
    "premiumActivatedAt",
    "premiumDeactivatedAt",
    "premiumCancelRequestedAt",
    "premiumCurrentPeriodEnd",
    "premiumScheduledEndAt",
    "premiumLastEventAt",
    "premiumLastSyncedAt",
  ];
  stringIsoFields.forEach((field) => {
    const normalizedIso = normalizeIso(normalized[field]);
    if (normalizedIso) {
      normalized[field] = normalizedIso;
    } else {
      delete normalized[field];
    }
  });

  const boundedFields = [
    ["premiumProvider", 40],
    ["premiumLastSource", 60],
    ["premiumLastEventId", 120],
    ["premiumLastDowngradeEventId", 120],
    ["premiumLastEventType", 80],
    ["premiumLastCurrency", 12],
    ["premiumLastAmount", 40],
    ["premiumStripeCustomerId", 120],
    ["premiumStripeSubscriptionId", 120],
    ["premiumStripeSubscriptionStatus", 60],
  ];
  boundedFields.forEach(([field, limit]) => {
    const value = normalizeShort(normalized[field], limit);
    if (value) {
      normalized[field] = value;
    } else {
      delete normalized[field];
    }
  });

  if (normalized.premiumLastCurrency) {
    normalized.premiumLastCurrency = normalizeId(normalized.premiumLastCurrency, 12).toUpperCase();
  }
  if (normalized.premiumStripeSubscriptionStatus) {
    normalized.premiumStripeSubscriptionStatus = normalizeId(
      normalized.premiumStripeSubscriptionStatus,
      60
    ).toLowerCase();
  }

  return normalized;
};

const normalizeUserData = (value) => {
  const base = createDefaultUserData();
  const candidate = cloneObjectSafely(value, createDefaultUserData, MAX_USER_DATA_SERIALIZED_CHARS);
  const settings = isPlainObject(candidate.settings) ? candidate.settings : {};
  base.settings.baseLanguage = String(settings.baseLanguage || "").trim().slice(0, 40);
  const rawProfile = isPlainObject(candidate.profile)
    ? cloneObjectSafely(candidate.profile, () => ({}), 20000)
    : {};
  base.profile = normalizePremiumProfileSchema(rawProfile);
  return base;
};

const toBoundedInt = (value, min, max) => {
  if (!Number.isFinite(Number(value))) {
    return min;
  }
  return Math.max(min, Math.min(max, Math.round(Number(value))));
};

const normalizeDateKey = (value) => {
  const raw = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }
  const parsed = Date.parse(raw);
  if (!Number.isFinite(parsed)) {
    return "";
  }
  return new Date(parsed).toISOString().slice(0, 10);
};

const getUtcDateKeyFromIso = (isoValue) => normalizeDateKey(isoValue || new Date().toISOString());

const daysBetweenUtcDateKeys = (fromDateKey, toDateKey) => {
  const from = normalizeDateKey(fromDateKey);
  const to = normalizeDateKey(toDateKey);
  if (!from || !to) {
    return Number.POSITIVE_INFINITY;
  }
  const fromMs = Date.parse(`${from}T00:00:00.000Z`);
  const toMs = Date.parse(`${to}T00:00:00.000Z`);
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.round((toMs - fromMs) / 86400000);
};

const addUtcDaysToIso = (isoValue, dayCount) => {
  const baseMs = Date.parse(String(isoValue || ""));
  const sourceMs = Number.isFinite(baseMs) ? baseMs : Date.now();
  const daysMs = Math.max(0, Math.round(Number(dayCount) || 0)) * 86400000;
  return new Date(sourceMs + daysMs).toISOString();
};

const computeReviewDueAt = (memoryStage, nowIso) => {
  const stage = toBoundedInt(memoryStage, 1, REVIEW_INTERVAL_DAYS.length);
  const days = REVIEW_INTERVAL_DAYS[Math.max(0, stage - 1)] || REVIEW_INTERVAL_DAYS[REVIEW_INTERVAL_DAYS.length - 1];
  return addUtcDaysToIso(nowIso, days);
};

const isBossSectionKey = (sectionKey) =>
  String(sectionKey || "").trim().toLowerCase().startsWith(BOSS_SECTION_KEY_PREFIX);

const parseBossCheckpointFromSectionKey = (sectionKey) => {
  const raw = String(sectionKey || "").trim().toLowerCase();
  if (!raw.startsWith(BOSS_SECTION_KEY_PREFIX)) {
    return 0;
  }
  const parsed = Number(raw.slice(BOSS_SECTION_KEY_PREFIX.length));
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return toBoundedInt(parsed, 1, 200);
};

const deriveSectionMasteryStars = ({
  visitCount = 0,
  practiceCount = 0,
  reviewCount = 0,
  completionCount = 0,
  bestScore = null,
  memoryStage = 0,
} = {}) => {
  let stars = 0;
  const score = Number.isFinite(Number(bestScore)) ? Number(bestScore) : null;
  if (visitCount > 0 || practiceCount > 0 || reviewCount > 0 || completionCount > 0) {
    stars = 1;
  }
  if (stars >= 1 && (reviewCount >= 1 || practiceCount >= 6 || (score !== null && score >= 80))) {
    stars = 2;
  }
  if (
    stars >= 2 &&
    (completionCount > 0 || memoryStage >= 3 || (reviewCount >= 2 && score !== null && score >= 88))
  ) {
    stars = 3;
  }
  return toBoundedInt(stars, 0, 3);
};

const createDefaultWorldBossState = () => ({
  checkpointSize: WORLD_BOSS_CHECKPOINT_SIZE,
  unlockedCheckpoint: 0,
  defeatedCheckpoint: 0,
  completedSections: 0,
  nextUnlockInSections: WORLD_BOSS_CHECKPOINT_SIZE,
  readyCheckpoint: 0,
  lastAttemptAt: null,
  lastCompletedAt: null,
  lastUnlockedAt: null,
});

const normalizeWorldBossState = (value) => {
  const fallback = createDefaultWorldBossState();
  const source = isPlainObject(value) ? value : {};
  fallback.checkpointSize = toBoundedInt(source.checkpointSize, WORLD_BOSS_CHECKPOINT_SIZE, 100);
  fallback.unlockedCheckpoint = toBoundedInt(source.unlockedCheckpoint, 0, 200);
  fallback.defeatedCheckpoint = toBoundedInt(
    source.defeatedCheckpoint,
    0,
    Math.max(0, fallback.unlockedCheckpoint)
  );
  fallback.completedSections = toBoundedInt(source.completedSections, 0, 5000000);
  fallback.nextUnlockInSections = toBoundedInt(source.nextUnlockInSections, 0, fallback.checkpointSize);
  fallback.readyCheckpoint =
    fallback.unlockedCheckpoint > fallback.defeatedCheckpoint
      ? fallback.defeatedCheckpoint + 1
      : 0;
  fallback.lastAttemptAt = typeof source.lastAttemptAt === "string" && source.lastAttemptAt ? source.lastAttemptAt : null;
  fallback.lastCompletedAt =
    typeof source.lastCompletedAt === "string" && source.lastCompletedAt ? source.lastCompletedAt : null;
  fallback.lastUnlockedAt =
    typeof source.lastUnlockedAt === "string" && source.lastUnlockedAt ? source.lastUnlockedAt : null;
  return fallback;
};

const xpForLevel = (level) => {
  const bounded = Math.max(1, Math.floor(Number(level) || 1));
  if (bounded <= 1) {
    return 0;
  }
  return Math.round(120 * Math.pow(bounded - 1, 1.34));
};

const deriveLevelMetaFromXp = (xpValue) => {
  const xp = Math.max(0, Math.round(Number(xpValue) || 0));
  let level = 1;
  while (level < 250 && xp >= xpForLevel(level + 1)) {
    level += 1;
  }
  const levelFloorXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const span = Math.max(1, nextLevelXp - levelFloorXp);
  const intoLevelXp = Math.max(0, xp - levelFloorXp);
  return {
    level,
    levelFloorXp,
    nextLevelXp,
    intoLevelXp,
    toNextLevelXp: Math.max(0, nextLevelXp - xp),
    progressRatio: Math.max(0, Math.min(1, intoLevelXp / span)),
  };
};

const normalizeQuestTasks = (value) => {
  const fallback = createDefaultQuestTasks();
  if (!isPlainObject(value)) {
    return fallback;
  }
  Object.keys(fallback).forEach((taskKey) => {
    const source = isPlainObject(value[taskKey]) ? value[taskKey] : {};
    fallback[taskKey].progress = toBoundedInt(source.progress, 0, fallback[taskKey].target);
    fallback[taskKey].completed =
      Boolean(source.completed) || fallback[taskKey].progress >= fallback[taskKey].target;
  });
  return fallback;
};

const normalizeGamificationState = (value, xpValue = 0) => {
  const fallback = createDefaultGamificationState();
  const candidate = isPlainObject(value) ? value : {};
  const levelMeta = deriveLevelMetaFromXp(xpValue);
  fallback.level = toBoundedInt(candidate.level, 1, 250);
  fallback.level = Math.max(fallback.level, levelMeta.level);
  fallback.currentStreak = toBoundedInt(candidate.currentStreak, 0, 5000);
  fallback.bestStreak = Math.max(
    fallback.currentStreak,
    toBoundedInt(candidate.bestStreak, 0, 5000)
  );
  fallback.lastActiveDate = normalizeDateKey(candidate.lastActiveDate) || null;
  fallback.nextLevelXp = Math.max(levelMeta.nextLevelXp, toBoundedInt(candidate.nextLevelXp, 0, 500000000));

  const badges = isPlainObject(candidate.badges) ? candidate.badges : {};
  Object.entries(badges).forEach(([badgeId, badge]) => {
    const id = String(badgeId || "").trim().slice(0, 60);
    if (!id || !isPlainObject(badge)) {
      return;
    }
    fallback.badges[id] = {
      awardedAt: String(badge.awardedAt || "").slice(0, 40) || new Date().toISOString(),
      title: String(badge.title || "").slice(0, 120),
      description: String(badge.description || "").slice(0, 240),
      tier: String(badge.tier || "core").slice(0, 24),
    };
  });

  const quests = isPlainObject(candidate.quests) ? candidate.quests : {};
  fallback.quests.date = normalizeDateKey(quests.date) || null;
  fallback.quests.tasks = normalizeQuestTasks(quests.tasks);
  fallback.quests.allCompleted =
    Boolean(quests.allCompleted) ||
    Object.values(fallback.quests.tasks).every((task) => task.completed);

  const stats = isPlainObject(candidate.stats) ? candidate.stats : {};
  fallback.stats.sectionsVisited = toBoundedInt(stats.sectionsVisited, 0, 5000000);
  fallback.stats.sectionsCompleted = toBoundedInt(stats.sectionsCompleted, 0, 5000000);
  fallback.stats.cardsPracticed = toBoundedInt(stats.cardsPracticed, 0, 50000000);
  fallback.stats.grammarReviews = toBoundedInt(stats.grammarReviews, 0, 50000000);
  fallback.stats.questDaysCompleted = toBoundedInt(stats.questDaysCompleted, 0, 5000000);
  fallback.stats.worldsEngaged = Array.isArray(stats.worldsEngaged)
    ? [...new Set(stats.worldsEngaged.map((key) => String(key || "").trim().slice(0, 40)).filter(Boolean))].slice(
        0,
        30
      )
    : [];

  const daily = isPlainObject(candidate.daily) ? candidate.daily : {};
  fallback.daily.date = normalizeDateKey(daily.date) || null;
  fallback.daily.xpEarned = toBoundedInt(daily.xpEarned, 0, 30000);
  fallback.daily.events = toBoundedInt(daily.events, 0, 50000);
  fallback.daily.startedEvents = toBoundedInt(daily.startedEvents, 0, 50000);
  fallback.daily.practicedEvents = toBoundedInt(daily.practicedEvents, 0, 50000);
  fallback.daily.reviewEvents = toBoundedInt(daily.reviewEvents, 0, 50000);
  fallback.daily.completedEvents = toBoundedInt(daily.completedEvents, 0, 50000);
  return fallback;
};

const normalizeProgress = (value) => {
  const fallback = createDefaultProgress();
  const candidate = cloneObjectSafely(value, createDefaultProgress, MAX_PROGRESS_SERIALIZED_CHARS);
  const totals = isPlainObject(candidate.totals) ? candidate.totals : {};
  fallback.totals.xp = Number.isFinite(totals.xp) ? Math.max(0, Math.round(Number(totals.xp))) : 0;
  fallback.totals.completedSections = Number.isFinite(totals.completedSections)
    ? Math.max(0, Math.round(Number(totals.completedSections)))
    : 0;
  fallback.totals.lastActivityAt =
    typeof totals.lastActivityAt === "string" && totals.lastActivityAt ? totals.lastActivityAt : null;
  fallback.worlds = isPlainObject(candidate.worlds)
    ? cloneObjectSafely(candidate.worlds, () => ({}), MAX_PROGRESS_SERIALIZED_CHARS - 5000)
    : {};
  fallback.recentEvents = Array.isArray(candidate.recentEvents)
    ? candidate.recentEvents.slice(-120).map((event) => ({
        worldKey: String(event?.worldKey || "").slice(0, 40),
        mapKey: String(event?.mapKey || "").slice(0, 20),
        sectionKey: String(event?.sectionKey || "").slice(0, 120),
        status: String(event?.status || "").slice(0, 20),
        xpDelta: Number.isFinite(event?.xpDelta) ? Math.round(Number(event.xpDelta)) : 0,
        timestamp: String(event?.timestamp || "").slice(0, 40),
      }))
    : [];
  fallback.gamification = normalizeGamificationState(candidate.gamification, fallback.totals.xp);
  fallback.updatedAt = typeof candidate.updatedAt === "string" && candidate.updatedAt ? candidate.updatedAt : null;
  return fallback;
};

const normalizeUserRecord = (candidate, fallbackUserId) => {
  if (!isPlainObject(candidate)) {
    return null;
  }
  const id = String(candidate.id || fallbackUserId || "").trim();
  const email = normalizeEmail(candidate.email);
  const password = isPlainObject(candidate.password) ? candidate.password : {};
  const passwordSalt = String(password.salt || "").trim();
  const passwordHash = String(password.hash || "").trim();
  if (!id || !email || !passwordSalt || !passwordHash) {
    return null;
  }
  const normalizedData = normalizeUserData(candidate.data);
  const authProvider = String(normalizedData?.profile?.authProvider || "").trim().toLowerCase();
  const rawEmailVerified = candidate.emailVerified;
  let explicitEmailVerified = null;
  if (typeof rawEmailVerified === "boolean") {
    explicitEmailVerified = rawEmailVerified;
  } else if (typeof rawEmailVerified === "string") {
    const normalizedEmailVerified = rawEmailVerified.trim().toLowerCase();
    if (normalizedEmailVerified === "true" || normalizedEmailVerified === "1") {
      explicitEmailVerified = true;
    } else if (normalizedEmailVerified === "false" || normalizedEmailVerified === "0") {
      explicitEmailVerified = false;
    }
  } else if (typeof rawEmailVerified === "number" && Number.isFinite(rawEmailVerified)) {
    if (rawEmailVerified === 1) {
      explicitEmailVerified = true;
    } else if (rawEmailVerified === 0) {
      explicitEmailVerified = false;
    }
  }
  const emailVerified = explicitEmailVerified !== null ? explicitEmailVerified : authProvider === "google";
  const normalizedEmailVerification = normalizeEmailVerificationState(candidate.emailVerification);
  const normalizedPasswordReset = normalizePasswordResetState(candidate.passwordReset);
  return {
    id,
    email,
    displayName: sanitizeDisplayName(candidate.displayName, email),
    password: {
      salt: passwordSalt,
      hash: passwordHash,
      iterations: Number(password.iterations) || PASSWORD_HASH_ITERATIONS,
      keylen: Number(password.keylen) || PASSWORD_HASH_KEYLEN,
      digest: String(password.digest || PASSWORD_HASH_DIGEST),
    },
    createdAt: String(candidate.createdAt || new Date().toISOString()),
    updatedAt: String(candidate.updatedAt || new Date().toISOString()),
    lastLoginAt: candidate.lastLoginAt ? String(candidate.lastLoginAt) : null,
    emailVerified: Boolean(emailVerified),
    emailVerification: normalizedEmailVerification,
    passwordReset: authProvider === "google" ? createEmptyPasswordResetState() : normalizedPasswordReset,
    data: normalizedData,
    progress: normalizeProgress(candidate.progress),
  };
};

const normalizeAuthStore = (candidate) => {
  const normalized = createEmptyAuthStore();
  if (!isPlainObject(candidate)) {
    return normalized;
  }
  const users = isPlainObject(candidate.users) ? candidate.users : {};
  Object.entries(users).forEach(([userId, record]) => {
    const user = normalizeUserRecord(record, userId);
    if (!user) {
      return;
    }
    normalized.users[user.id] = user;
    normalized.emailIndex[user.email] = user.id;
  });

  const sessions = isPlainObject(candidate.sessions) ? candidate.sessions : {};
  Object.entries(sessions).forEach(([sessionHash, session]) => {
    if (!isPlainObject(session)) {
      return;
    }
    const userId = String(session.userId || "").trim();
    const expiresAt = String(session.expiresAt || "").trim();
    if (!userId || !expiresAt || !normalized.users[userId]) {
      return;
    }
    normalized.sessions[sessionHash] = {
      userId,
      createdAt: String(session.createdAt || new Date().toISOString()),
      updatedAt: String(session.updatedAt || session.createdAt || new Date().toISOString()),
      expiresAt,
      userAgentHash: String(session.userAgentHash || ""),
      ipHash: String(session.ipHash || ""),
    };
  });

  normalized.schemaVersion =
    Number(candidate.schemaVersion) > 0 ? Number(candidate.schemaVersion) : AUTH_STORE_SCHEMA_VERSION;
  normalized.updatedAt = String(candidate.updatedAt || new Date().toISOString());
  return normalized;
};

const normalizeBlockedEntryMeta = (value) => {
  const fallback = {
    blockedAt: new Date().toISOString(),
    reason: "",
    note: "",
    blockedBy: "admin",
  };
  if (!isPlainObject(value)) {
    return fallback;
  }
  fallback.blockedAt = String(value.blockedAt || "").slice(0, 40) || new Date().toISOString();
  fallback.reason = String(value.reason || "").slice(0, 200);
  fallback.note = String(value.note || "").slice(0, 300);
  fallback.blockedBy = String(value.blockedBy || "admin").slice(0, 80) || "admin";
  return fallback;
};

const normalizeBlockedUsersStore = (candidate) => {
  const normalized = createEmptyBlockedUsersStore();
  if (!isPlainObject(candidate)) {
    return normalized;
  }

  const emailEntries = isPlainObject(candidate.emails) ? candidate.emails : {};
  Object.entries(emailEntries).forEach(([email, meta]) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return;
    }
    normalized.emails[normalizedEmail] = normalizeBlockedEntryMeta(meta);
  });

  const userIdEntries = isPlainObject(candidate.userIds) ? candidate.userIds : {};
  Object.entries(userIdEntries).forEach(([userId, meta]) => {
    const normalizedUserId = String(userId || "").trim().slice(0, 120);
    if (!normalizedUserId) {
      return;
    }
    normalized.userIds[normalizedUserId] = normalizeBlockedEntryMeta(meta);
  });

  const ipHashEntries = isPlainObject(candidate.ipHashes) ? candidate.ipHashes : {};
  Object.entries(ipHashEntries).forEach(([ipHash, meta]) => {
    const normalizedIpHash = String(ipHash || "").trim().toLowerCase().slice(0, 120);
    if (!normalizedIpHash) {
      return;
    }
    normalized.ipHashes[normalizedIpHash] = normalizeBlockedEntryMeta(meta);
  });

  normalized.schemaVersion =
    Number(candidate.schemaVersion) > 0 ? Number(candidate.schemaVersion) : BLOCKED_USERS_SCHEMA_VERSION;
  normalized.updatedAt = String(candidate.updatedAt || new Date().toISOString());
  return normalized;
};

const normalizeSecurityEventEntry = (value) => {
  const entry = isPlainObject(value) ? value : {};
  return {
    at: String(entry.at || "").slice(0, 40) || new Date().toISOString(),
    type: String(entry.type || "unknown").slice(0, 80),
    requestId: String(entry.requestId || "").slice(0, 80),
    endpoint: String(entry.endpoint || "").slice(0, 240),
    method: String(entry.method || "").slice(0, 16),
    email: normalizeEmail(entry.email),
    userId: String(entry.userId || "").slice(0, 120),
    ipHash: String(entry.ipHash || "").slice(0, 120),
    reason: String(entry.reason || "").slice(0, 240),
    details: isPlainObject(entry.details) ? cloneObjectSafely(entry.details, () => ({}), 4000) : {},
  };
};

const normalizeSecurityEventsStore = (candidate) => {
  const normalized = createEmptySecurityEventsStore();
  if (!isPlainObject(candidate)) {
    return normalized;
  }
  const events = Array.isArray(candidate.events) ? candidate.events : [];
  normalized.events = events.map((event) => normalizeSecurityEventEntry(event));
  normalized.schemaVersion =
    Number(candidate.schemaVersion) > 0 ? Number(candidate.schemaVersion) : SECURITY_EVENTS_SCHEMA_VERSION;
  normalized.updatedAt = String(candidate.updatedAt || new Date().toISOString());
  return normalized;
};

const writeAuthStoreSync = (store) => {
  if (!fs.existsSync(AUTH_DATA_ROOT)) {
    fs.mkdirSync(AUTH_DATA_ROOT, { recursive: true });
  }
  fs.writeFileSync(AUTH_STORE_FILE, JSON.stringify(store, null, 2), "utf8");
};

const writeDeletedAccountsAuditSync = (entries) => {
  if (!fs.existsSync(AUTH_DATA_ROOT)) {
    fs.mkdirSync(AUTH_DATA_ROOT, { recursive: true });
  }
  const safeEntries = Array.isArray(entries) ? entries : [];
  fs.writeFileSync(DELETED_ACCOUNTS_AUDIT_FILE, JSON.stringify(safeEntries, null, 2), "utf8");
};

const writeRegisteredAccountsAuditSync = (entries) => {
  if (!fs.existsSync(AUTH_DATA_ROOT)) {
    fs.mkdirSync(AUTH_DATA_ROOT, { recursive: true });
  }
  const safeEntries = Array.isArray(entries) ? entries : [];
  fs.writeFileSync(REGISTERED_ACCOUNTS_AUDIT_FILE, JSON.stringify(safeEntries, null, 2), "utf8");
};

const writeBlockedUsersStoreSync = (store) => {
  if (!fs.existsSync(AUTH_DATA_ROOT)) {
    fs.mkdirSync(AUTH_DATA_ROOT, { recursive: true });
  }
  const safeStore = normalizeBlockedUsersStore(store);
  fs.writeFileSync(BLOCKED_USERS_STORE_FILE, JSON.stringify(safeStore, null, 2), "utf8");
};

const writeSecurityEventsStoreSync = (store) => {
  if (!fs.existsSync(AUTH_DATA_ROOT)) {
    fs.mkdirSync(AUTH_DATA_ROOT, { recursive: true });
  }
  const safeStore = normalizeSecurityEventsStore(store);
  fs.writeFileSync(SECURITY_EVENTS_STORE_FILE, JSON.stringify(safeStore, null, 2), "utf8");
};

const loadAuthStoreFromDisk = () => {
  try {
    if (!fs.existsSync(AUTH_DATA_ROOT)) {
      fs.mkdirSync(AUTH_DATA_ROOT, { recursive: true });
    }
    if (!fs.existsSync(AUTH_STORE_FILE)) {
      const initialStore = createEmptyAuthStore();
      writeAuthStoreSync(initialStore);
      return initialStore;
    }
    const raw = fs.readFileSync(AUTH_STORE_FILE, "utf8");
    const parsed = raw.trim() ? JSON.parse(raw) : createEmptyAuthStore();
    const normalized = normalizeAuthStore(parsed);
    writeAuthStoreSync(normalized);
    return normalized;
  } catch (error) {
    console.error("[auth-store] Failed to read auth store, resetting:", error?.message || error);
    if (AUTH_STORE_FAIL_FAST_ON_LOAD_ERROR) {
      throw new Error(`Auth store load failed (fail-fast enabled): ${error?.message || error}`);
    }
    const fallback = createEmptyAuthStore();
    try {
      writeAuthStoreSync(fallback);
    } catch {}
    return fallback;
  }
};

const loadDeletedAccountsAuditFromDisk = () => {
  try {
    if (!fs.existsSync(AUTH_DATA_ROOT)) {
      fs.mkdirSync(AUTH_DATA_ROOT, { recursive: true });
    }
    if (!fs.existsSync(DELETED_ACCOUNTS_AUDIT_FILE)) {
      const initial = [];
      writeDeletedAccountsAuditSync(initial);
      return initial;
    }
    const raw = fs.readFileSync(DELETED_ACCOUNTS_AUDIT_FILE, "utf8");
    const parsed = raw.trim() ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      writeDeletedAccountsAuditSync([]);
      return [];
    }
    const normalized = parsed
      .filter((entry) => isPlainObject(entry))
      .map((entry) => ({
        deletedAt: String(entry.deletedAt || "").slice(0, 40) || new Date().toISOString(),
        userId: String(entry.userId || "").slice(0, 100),
        email: normalizeEmail(entry.email),
        displayName: sanitizeDisplayName(String(entry.displayName || ""), String(entry.email || "")),
        authProvider: String(entry.authProvider || "email").slice(0, 32),
        createdAt: String(entry.createdAt || "").slice(0, 40) || null,
        lastLoginAt: String(entry.lastLoginAt || "").slice(0, 40) || null,
        source: String(entry.source || "self-delete").slice(0, 40),
        requestId: String(entry.requestId || "").slice(0, 80),
      }));
    writeDeletedAccountsAuditSync(normalized);
    return normalized;
  } catch (error) {
    console.error(
      "[deleted-accounts-audit] Failed to read audit store, resetting:",
      error?.message || error
    );
    const fallback = [];
    try {
      writeDeletedAccountsAuditSync(fallback);
    } catch {}
    return fallback;
  }
};

const buildRegistrationAuditEntryFromUser = (userRecord = {}, source = "signup-email", req = null) => {
  const email = normalizeEmail(userRecord?.email);
  if (!email) {
    return null;
  }
  const authProvider =
    String(userRecord?.data?.profile?.authProvider || (source === "signup-google" ? "google" : "email"))
      .trim()
      .toLowerCase() || "email";
  return {
    registeredAt: String(userRecord?.createdAt || "").slice(0, 40) || new Date().toISOString(),
    userId: String(userRecord?.id || "").slice(0, 100),
    email,
    displayName: sanitizeDisplayName(String(userRecord?.displayName || ""), email),
    authProvider: authProvider.slice(0, 32),
    source: String(source || "signup-email").slice(0, 40),
    requestId: String(req?.requestId || "").slice(0, 80),
  };
};

const loadRegisteredAccountsAuditFromDisk = () => {
  try {
    if (!fs.existsSync(AUTH_DATA_ROOT)) {
      fs.mkdirSync(AUTH_DATA_ROOT, { recursive: true });
    }
    if (!fs.existsSync(REGISTERED_ACCOUNTS_AUDIT_FILE)) {
      const bootstrap = Object.values(authStore?.users || {})
        .map((userRecord) => buildRegistrationAuditEntryFromUser(userRecord, "bootstrap-existing", null))
        .filter(Boolean);
      writeRegisteredAccountsAuditSync(bootstrap);
      return bootstrap;
    }
    const raw = fs.readFileSync(REGISTERED_ACCOUNTS_AUDIT_FILE, "utf8");
    const parsed = raw.trim() ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      writeRegisteredAccountsAuditSync([]);
      return [];
    }
    const normalized = parsed
      .filter((entry) => isPlainObject(entry))
      .map((entry) => ({
        registeredAt: String(entry.registeredAt || "").slice(0, 40) || new Date().toISOString(),
        userId: String(entry.userId || "").slice(0, 100),
        email: normalizeEmail(entry.email),
        displayName: sanitizeDisplayName(String(entry.displayName || ""), String(entry.email || "")),
        authProvider: String(entry.authProvider || "email").slice(0, 32),
        source: String(entry.source || "signup-email").slice(0, 40),
        requestId: String(entry.requestId || "").slice(0, 80),
      }));
    writeRegisteredAccountsAuditSync(normalized);
    return normalized;
  } catch (error) {
    console.error(
      "[registered-accounts-audit] Failed to read audit store, resetting:",
      error?.message || error
    );
    const fallback = [];
    try {
      writeRegisteredAccountsAuditSync(fallback);
    } catch {}
    return fallback;
  }
};

const loadBlockedUsersStoreFromDisk = () => {
  try {
    if (!fs.existsSync(AUTH_DATA_ROOT)) {
      fs.mkdirSync(AUTH_DATA_ROOT, { recursive: true });
    }
    if (!fs.existsSync(BLOCKED_USERS_STORE_FILE)) {
      const initial = createEmptyBlockedUsersStore();
      writeBlockedUsersStoreSync(initial);
      return initial;
    }
    const raw = fs.readFileSync(BLOCKED_USERS_STORE_FILE, "utf8");
    const parsed = raw.trim() ? JSON.parse(raw) : createEmptyBlockedUsersStore();
    const normalized = normalizeBlockedUsersStore(parsed);
    writeBlockedUsersStoreSync(normalized);
    return normalized;
  } catch (error) {
    console.error("[blocked-users-store] Failed to read block store, resetting:", error?.message || error);
    const fallback = createEmptyBlockedUsersStore();
    try {
      writeBlockedUsersStoreSync(fallback);
    } catch {}
    return fallback;
  }
};

const loadSecurityEventsStoreFromDisk = () => {
  try {
    if (!fs.existsSync(AUTH_DATA_ROOT)) {
      fs.mkdirSync(AUTH_DATA_ROOT, { recursive: true });
    }
    if (!fs.existsSync(SECURITY_EVENTS_STORE_FILE)) {
      const initial = createEmptySecurityEventsStore();
      writeSecurityEventsStoreSync(initial);
      return initial;
    }
    const raw = fs.readFileSync(SECURITY_EVENTS_STORE_FILE, "utf8");
    const parsed = raw.trim() ? JSON.parse(raw) : createEmptySecurityEventsStore();
    const normalized = normalizeSecurityEventsStore(parsed);
    writeSecurityEventsStoreSync(normalized);
    return normalized;
  } catch (error) {
    console.error("[security-events-store] Failed to read events store, resetting:", error?.message || error);
    const fallback = createEmptySecurityEventsStore();
    try {
      writeSecurityEventsStoreSync(fallback);
    } catch {}
    return fallback;
  }
};

let authStore = loadAuthStoreFromDisk();
let authStorePersistQueue = Promise.resolve();
let deletedAccountsAudit = loadDeletedAccountsAuditFromDisk();
let deletedAccountsAuditPersistQueue = Promise.resolve();
let registeredAccountsAudit = loadRegisteredAccountsAuditFromDisk();
let registeredAccountsAuditPersistQueue = Promise.resolve();
let blockedUsersStore = loadBlockedUsersStoreFromDisk();
let blockedUsersStorePersistQueue = Promise.resolve();
let securityEventsStore = loadSecurityEventsStoreFromDisk();
let securityEventsStorePersistQueue = Promise.resolve();

const queuePersistAuthStore = () => {
  const payload = JSON.stringify(authStore, null, 2);
  authStorePersistQueue = authStorePersistQueue
    .catch(() => {})
    .then(async () => {
      await fs.promises.mkdir(AUTH_DATA_ROOT, { recursive: true });
      const tmpPath = `${AUTH_STORE_FILE}.tmp`;
      await fs.promises.writeFile(tmpPath, payload, "utf8");
      await fs.promises.rename(tmpPath, AUTH_STORE_FILE);
    })
    .catch((error) => {
      reportServerError("auth-store-persist", error);
    });
  return authStorePersistQueue;
};

const queuePersistDeletedAccountsAudit = () => {
  const payload = JSON.stringify(deletedAccountsAudit, null, 2);
  deletedAccountsAuditPersistQueue = deletedAccountsAuditPersistQueue
    .catch(() => {})
    .then(async () => {
      await fs.promises.mkdir(AUTH_DATA_ROOT, { recursive: true });
      const tmpPath = `${DELETED_ACCOUNTS_AUDIT_FILE}.tmp`;
      await fs.promises.writeFile(tmpPath, payload, "utf8");
      await fs.promises.rename(tmpPath, DELETED_ACCOUNTS_AUDIT_FILE);
    })
    .catch((error) => {
      reportServerError("deleted-accounts-audit-persist", error);
    });
  return deletedAccountsAuditPersistQueue;
};

const queuePersistRegisteredAccountsAudit = () => {
  const payload = JSON.stringify(registeredAccountsAudit, null, 2);
  registeredAccountsAuditPersistQueue = registeredAccountsAuditPersistQueue
    .catch(() => {})
    .then(async () => {
      await fs.promises.mkdir(AUTH_DATA_ROOT, { recursive: true });
      const tmpPath = `${REGISTERED_ACCOUNTS_AUDIT_FILE}.tmp`;
      await fs.promises.writeFile(tmpPath, payload, "utf8");
      await fs.promises.rename(tmpPath, REGISTERED_ACCOUNTS_AUDIT_FILE);
    })
    .catch((error) => {
      reportServerError("registered-accounts-audit-persist", error);
    });
  return registeredAccountsAuditPersistQueue;
};

const queuePersistBlockedUsersStore = () => {
  const payload = JSON.stringify(blockedUsersStore, null, 2);
  blockedUsersStorePersistQueue = blockedUsersStorePersistQueue
    .catch(() => {})
    .then(async () => {
      await fs.promises.mkdir(AUTH_DATA_ROOT, { recursive: true });
      const tmpPath = `${BLOCKED_USERS_STORE_FILE}.tmp`;
      await fs.promises.writeFile(tmpPath, payload, "utf8");
      await fs.promises.rename(tmpPath, BLOCKED_USERS_STORE_FILE);
    })
    .catch((error) => {
      reportServerError("blocked-users-store-persist", error);
    });
  return blockedUsersStorePersistQueue;
};

const queuePersistSecurityEventsStore = () => {
  const payload = JSON.stringify(securityEventsStore, null, 2);
  securityEventsStorePersistQueue = securityEventsStorePersistQueue
    .catch(() => {})
    .then(async () => {
      await fs.promises.mkdir(AUTH_DATA_ROOT, { recursive: true });
      const tmpPath = `${SECURITY_EVENTS_STORE_FILE}.tmp`;
      await fs.promises.writeFile(tmpPath, payload, "utf8");
      await fs.promises.rename(tmpPath, SECURITY_EVENTS_STORE_FILE);
    })
    .catch((error) => {
      reportServerError("security-events-store-persist", error);
    });
  return securityEventsStorePersistQueue;
};

const markAuthStoreDirty = () => {
  authStore.updatedAt = new Date().toISOString();
  void queuePersistAuthStore();
};

const markBlockedUsersStoreDirty = () => {
  blockedUsersStore.updatedAt = new Date().toISOString();
  void queuePersistBlockedUsersStore();
};

const markSecurityEventsStoreDirty = () => {
  securityEventsStore.updatedAt = new Date().toISOString();
  void queuePersistSecurityEventsStore();
};

const hashText = (value) => crypto.createHash("sha256").update(String(value || "")).digest("hex");
const hashSessionToken = (token) => hashText(token);
const hashEmailVerificationToken = (token) => hashText(`email-verify:${String(token || "")}`);
const hashPasswordResetToken = (token) => hashText(`password-reset:${String(token || "")}`);

const getRequestIpAddress = (req) => {
  const forwardedFor = String(req.get("x-forwarded-for") || "")
    .split(",")[0]
    .trim();
  const socketIp = String(req.socket?.remoteAddress || "").trim();
  const ip = String(forwardedFor || req.ip || socketIp || "").trim();
  return ip.slice(0, 120);
};

const getRequestIpHash = (req) => {
  const ip = getRequestIpAddress(req);
  if (!ip) {
    return "";
  }
  return hashText(`ip:${ip}`);
};

const constantTimeStringEquals = (a, b) => {
  const aBuffer = Buffer.from(String(a || ""), "utf8");
  const bBuffer = Buffer.from(String(b || ""), "utf8");
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuffer, bBuffer);
};

const appendSecurityEvent = async ({
  type = "unknown",
  req = null,
  email = "",
  userId = "",
  reason = "",
  details = {},
} = {}) => {
  const nextEvent = normalizeSecurityEventEntry({
    at: new Date().toISOString(),
    type: String(type || "unknown"),
    requestId: String(req?.requestId || ""),
    endpoint: String(req?.originalUrl || ""),
    method: String(req?.method || ""),
    email: normalizeEmail(email),
    userId: String(userId || "").trim(),
    ipHash: getRequestIpHash(req),
    reason: String(reason || "").trim(),
    details: isPlainObject(details) ? details : {},
  });
  securityEventsStore.events.push(nextEvent);
  markSecurityEventsStoreDirty();
  return true;
};

const appendBillingEntitlementAudit = async ({
  req = null,
  userRecord = null,
  action = "unknown",
  reason = "",
  before = null,
  after = null,
  details = {},
} = {}) => {
  const userId = String(userRecord?.id || "").trim();
  const email = normalizeEmail(userRecord?.email || "");
  return appendSecurityEvent({
    type: "billing-entitlement-change",
    req,
    userId,
    email,
    reason: String(reason || action || "billing change").slice(0, 220),
    details: {
      action: String(action || "unknown").slice(0, 80),
      before: isPlainObject(before) ? before : {},
      after: isPlainObject(after) ? after : {},
      ...((isPlainObject(details) ? details : {})),
    },
  });
};

const findBlockedPrincipal = ({ email = "", userId = "", ipHash = "" } = {}) => {
  const normalizedUserId = String(userId || "").trim();
  const normalizedEmail = normalizeEmail(email);
  const normalizedIpHash = String(ipHash || "").trim().toLowerCase();

  if (normalizedUserId && blockedUsersStore.userIds[normalizedUserId]) {
    return {
      type: "userId",
      value: normalizedUserId,
      meta: blockedUsersStore.userIds[normalizedUserId],
    };
  }
  if (normalizedEmail && blockedUsersStore.emails[normalizedEmail]) {
    return {
      type: "email",
      value: normalizedEmail,
      meta: blockedUsersStore.emails[normalizedEmail],
    };
  }
  if (normalizedIpHash && blockedUsersStore.ipHashes[normalizedIpHash]) {
    return {
      type: "ipHash",
      value: normalizedIpHash,
      meta: blockedUsersStore.ipHashes[normalizedIpHash],
    };
  }
  return null;
};

const rejectBlockedAccess = ({ req, res, email = "", userId = "", context = "" } = {}) => {
  const blockedMatch = findBlockedPrincipal({
    email,
    userId,
    ipHash: getRequestIpHash(req),
  });
  if (!blockedMatch) {
    return false;
  }

  if (req?.auth?.sessionHash) {
    removeSessionByHash(req.auth.sessionHash);
  }
  clearAuthSessionCookie(req, res);
  void appendSecurityEvent({
    type: "blocked-access",
    req,
    email: normalizeEmail(email) || normalizeEmail(req?.authUser?.email),
    userId: String(userId || req?.authUser?.id || "").trim(),
    reason: `Blocked by ${blockedMatch.type}`,
    details: {
      context: String(context || ""),
      blockedType: blockedMatch.type,
      blockedValue: blockedMatch.value,
    },
  });
  res.status(403).json({ error: "Account is blocked. Contact support." });
  return true;
};

const appendDeletedAccountAuditEntry = async ({ userRecord = null, req = null, source = "self-delete" } = {}) => {
  if (!userRecord || !isPlainObject(userRecord)) {
    return false;
  }
  const email = normalizeEmail(userRecord.email);
  if (!email) {
    return false;
  }
  const authProvider = String(userRecord?.data?.profile?.authProvider || "email").trim().toLowerCase() || "email";
  const entry = {
    deletedAt: new Date().toISOString(),
    userId: String(userRecord.id || "").trim(),
    email,
    displayName: sanitizeDisplayName(String(userRecord.displayName || ""), email),
    authProvider: authProvider.slice(0, 32),
    createdAt: String(userRecord.createdAt || "") || null,
    lastLoginAt: String(userRecord.lastLoginAt || "") || null,
    source: String(source || "self-delete").slice(0, 40),
    requestId: String(req?.requestId || "").slice(0, 80),
  };
  deletedAccountsAudit.push(entry);
  await queuePersistDeletedAccountsAudit();
  return true;
};

const appendRegisteredAccountAuditEntry = async ({ userRecord = null, req = null, source = "signup-email" } = {}) => {
  const entry = buildRegistrationAuditEntryFromUser(userRecord, source, req);
  if (!entry) {
    return false;
  }
  registeredAccountsAudit.push(entry);
  await queuePersistRegisteredAccountsAudit();
  return true;
};

const createEmailVerificationChallenge = () => {
  const rawToken = crypto.randomBytes(32).toString("base64url");
  return {
    rawToken,
    tokenHash: hashEmailVerificationToken(rawToken),
    expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS).toISOString(),
    sentAt: new Date().toISOString(),
  };
};

const createPasswordResetChallenge = () => {
  const rawToken = crypto.randomBytes(32).toString("base64url");
  return {
    rawToken,
    tokenHash: hashPasswordResetToken(rawToken),
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS).toISOString(),
    sentAt: new Date().toISOString(),
  };
};

const parseCookieHeader = (headerValue) => {
  const result = {};
  String(headerValue || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((cookiePart) => {
      const index = cookiePart.indexOf("=");
      if (index < 1) {
        return;
      }
      const key = cookiePart.slice(0, index).trim();
      const value = cookiePart.slice(index + 1).trim();
      if (!key) {
        return;
      }
      try {
        result[key] = decodeURIComponent(value);
      } catch {
        result[key] = value;
      }
    });
  return result;
};

const serializeCookie = (name, value, options = {}) => {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path || "/"}`);
  if (Number.isFinite(options.maxAgeSec)) {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAgeSec))}`);
  }
  if (options.expires instanceof Date) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }
  if (options.httpOnly !== false) {
    parts.push("HttpOnly");
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }
  if (options.secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
};

const shouldUseSecureAuthCookie = (req) =>
  isProduction && !isLocalHost(req.headers.host || "") && isSecureRequest(req);

const setAuthSessionCookie = (req, res, rawToken) => {
  const cookie = serializeCookie(AUTH_COOKIE_NAME, rawToken, {
    path: "/",
    maxAgeSec: Math.floor(SESSION_TTL_MS / 1000),
    sameSite: "Lax",
    secure: shouldUseSecureAuthCookie(req),
    httpOnly: true,
  });
  res.append("Set-Cookie", cookie);
};

const clearAuthSessionCookie = (req, res) => {
  const cookie = serializeCookie(AUTH_COOKIE_NAME, "", {
    path: "/",
    maxAgeSec: 0,
    expires: new Date(0),
    sameSite: "Lax",
    secure: shouldUseSecureAuthCookie(req),
    httpOnly: true,
  });
  res.append("Set-Cookie", cookie);
};

const readGoogleOauthFlowCookie = (req) => {
  const cookies = parseCookieHeader(req.headers.cookie || "");
  return String(cookies[GOOGLE_OAUTH_FLOW_COOKIE_NAME] || "").trim();
};

const setGoogleOauthFlowCookie = (req, res, flowToken) => {
  const cookie = serializeCookie(GOOGLE_OAUTH_FLOW_COOKIE_NAME, String(flowToken || ""), {
    path: "/",
    maxAgeSec: Math.floor(GOOGLE_OAUTH_FLOW_COOKIE_TTL_MS / 1000),
    sameSite: "Lax",
    secure: shouldUseSecureAuthCookie(req),
    httpOnly: true,
  });
  res.append("Set-Cookie", cookie);
};

const clearGoogleOauthFlowCookie = (req, res) => {
  const cookie = serializeCookie(GOOGLE_OAUTH_FLOW_COOKIE_NAME, "", {
    path: "/",
    maxAgeSec: 0,
    expires: new Date(0),
    sameSite: "Lax",
    secure: shouldUseSecureAuthCookie(req),
    httpOnly: true,
  });
  res.append("Set-Cookie", cookie);
};

const pruneExpiredSessions = () => {
  const nowMs = Date.now();
  let removedCount = 0;
  Object.entries(authStore.sessions).forEach(([sessionHash, session]) => {
    const expiryMs = Date.parse(String(session?.expiresAt || ""));
    const sessionUserId = String(session?.userId || "");
    if (!Number.isFinite(expiryMs) || expiryMs <= nowMs || !authStore.users[sessionUserId]) {
      delete authStore.sessions[sessionHash];
      removedCount += 1;
    }
  });
  if (removedCount > 0) {
    markAuthStoreDirty();
  }
  return removedCount;
};

const trimUserSessions = (userId, keepLatest = MAX_SESSIONS_PER_USER) => {
  const sessions = Object.entries(authStore.sessions)
    .filter(([, session]) => String(session?.userId || "") === userId)
    .sort((a, b) => Date.parse(String(b[1]?.createdAt || "")) - Date.parse(String(a[1]?.createdAt || "")));
  if (sessions.length <= keepLatest) {
    return;
  }
  sessions.slice(keepLatest).forEach(([sessionHash]) => {
    delete authStore.sessions[sessionHash];
  });
};

const createSessionForUser = (userId, req) => {
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(rawToken);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();
  authStore.sessions[tokenHash] = {
    userId,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt,
    userAgentHash: hashText(req.get("user-agent") || ""),
    ipHash: hashText(req.ip || ""),
  };
  trimUserSessions(userId);
  markAuthStoreDirty();
  return rawToken;
};

const removeSessionByHash = (sessionHash) => {
  if (!sessionHash || !authStore.sessions[sessionHash]) {
    return;
  }
  delete authStore.sessions[sessionHash];
  markAuthStoreDirty();
};

const removeAllSessionsForUser = (userId) => {
  let removed = false;
  Object.entries(authStore.sessions).forEach(([sessionHash, session]) => {
    if (String(session?.userId || "") === userId) {
      delete authStore.sessions[sessionHash];
      removed = true;
    }
  });
  if (removed) {
    markAuthStoreDirty();
  }
};

const purgeUserFromAuthStore = ({ userId, email = "" } = {}) => {
  const normalizedUserId = String(userId || "").trim();
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedUserId && !normalizedEmail) {
    return false;
  }

  const resolvedUserId =
    normalizedUserId ||
    String(authStore.emailIndex[normalizedEmail] || "").trim();
  const userRecord = resolvedUserId ? authStore.users[resolvedUserId] : null;
  const resolvedEmail = normalizeEmail(userRecord?.email || normalizedEmail);
  let changed = false;

  if (resolvedEmail && authStore.emailIndex[resolvedEmail]) {
    delete authStore.emailIndex[resolvedEmail];
    changed = true;
  }

  Object.entries(authStore.emailIndex).forEach(([indexedEmail, indexedUserId]) => {
    if (String(indexedUserId || "").trim() === resolvedUserId) {
      delete authStore.emailIndex[indexedEmail];
      changed = true;
    }
  });

  if (resolvedUserId && authStore.users[resolvedUserId]) {
    delete authStore.users[resolvedUserId];
    changed = true;
  }

  Object.entries(authStore.sessions).forEach(([sessionHash, session]) => {
    if (String(session?.userId || "").trim() === resolvedUserId) {
      delete authStore.sessions[sessionHash];
      changed = true;
    }
  });

  if (changed) {
    markAuthStoreDirty();
  }
  return changed;
};

const derivePasswordHash = (password, salt, iterations, keylen, digest) =>
  new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, keylen, digest, (error, derived) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derived.toString("hex"));
    });
  });

const buildPasswordRecord = async (plainPassword) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await derivePasswordHash(
    plainPassword,
    salt,
    PASSWORD_HASH_ITERATIONS,
    PASSWORD_HASH_KEYLEN,
    PASSWORD_HASH_DIGEST
  );
  return {
    salt,
    hash,
    iterations: PASSWORD_HASH_ITERATIONS,
    keylen: PASSWORD_HASH_KEYLEN,
    digest: PASSWORD_HASH_DIGEST,
  };
};

const verifyPasswordAgainstRecord = async (plainPassword, passwordRecord) => {
  if (!plainPassword || !isPlainObject(passwordRecord)) {
    return false;
  }
  const iterations = Number(passwordRecord.iterations) || PASSWORD_HASH_ITERATIONS;
  const keylen = Number(passwordRecord.keylen) || PASSWORD_HASH_KEYLEN;
  const digest = String(passwordRecord.digest || PASSWORD_HASH_DIGEST);
  const expectedHash = String(passwordRecord.hash || "").trim();
  const salt = String(passwordRecord.salt || "").trim();
  if (!expectedHash || !salt) {
    return false;
  }
  const computedHash = await derivePasswordHash(plainPassword, salt, iterations, keylen, digest);
  const expected = Buffer.from(expectedHash, "hex");
  const computed = Buffer.from(computedHash, "hex");
  if (expected.length !== computed.length) {
    return false;
  }
  return crypto.timingSafeEqual(expected, computed);
};

const isValidEmail = (email) => {
  if (!email || email.length > 160) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPassword = (password) =>
  typeof password === "string" && password.length >= 8 && password.length <= 128;

const cloneForResponse = (value) => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
};

function resolvePremiumSnapshotFromProfile(profileValue) {
  const profile = isPlainObject(profileValue) ? profileValue : {};
  const premiumRaw = profile.isPremium ?? profile.premium ?? null;
  const premiumText = String(premiumRaw ?? "")
    .trim()
    .toLowerCase();
  const premiumTier = String(profile.plan || profile.tier || profile.membership || "")
    .trim()
    .toLowerCase();
  const legacyPremiumAccess =
    premiumRaw === true ||
    premiumText === "1" ||
    premiumText === "true" ||
    premiumText === "yes" ||
    premiumText === "premium" ||
    premiumText === "pro" ||
    premiumText === "plus" ||
    premiumTier === "premium" ||
    premiumTier === "pro" ||
    premiumTier === "plus" ||
    premiumTier === "paid";
  const premiumWindowMs = parseIsoToMs(profile.premiumCurrentPeriodEnd || profile.premiumScheduledEndAt || "");
  const hasUnexpiredPremiumWindow = premiumWindowMs !== null && premiumWindowMs > Date.now();
  const stripeStatus = String(profile.premiumStripeSubscriptionStatus || "")
    .trim()
    .toLowerCase();
  const hasStripePremiumStatus = ["active", "trialing", "past_due"].includes(stripeStatus);
  const hasPremiumAccess = legacyPremiumAccess || hasUnexpiredPremiumWindow || hasStripePremiumStatus;
  return {
    isPremium: hasPremiumAccess,
    planTier: hasPremiumAccess ? "premium" : "free",
  };
}

function parseIsoToMs(value) {
  const ms = Date.parse(String(value || "").trim());
  return Number.isFinite(ms) ? ms : null;
}

const computePremiumAccessUntilFromProfile = (profileValue, nowIso = new Date().toISOString()) => {
  const profile = isPlainObject(profileValue) ? profileValue : {};
  const explicitEndMs = parseIsoToMs(profile.premiumCurrentPeriodEnd || profile.premiumScheduledEndAt || "");
  if (explicitEndMs !== null) {
    return new Date(explicitEndMs).toISOString();
  }

  const activatedAtMs = parseIsoToMs(profile.premiumActivatedAt || "");
  if (activatedAtMs === null) {
    return null;
  }
  const nowMs = parseIsoToMs(nowIso) ?? Date.now();
  const cycleMs = 30 * 24 * 60 * 60 * 1000;
  const elapsedMs = Math.max(0, nowMs - activatedAtMs);
  const cycleIndex = Math.floor(elapsedMs / cycleMs);
  const cycleEndMsExclusive = activatedAtMs + (cycleIndex + 1) * cycleMs;
  const inclusiveEndMs = cycleEndMsExclusive - 1;
  return new Date(inclusiveEndMs).toISOString();
};

const toPublicUser = (userRecord) => {
  const authProvider =
    String(userRecord?.data?.profile?.authProvider || "email").trim().toLowerCase() || "email";
  const premiumSnapshot = resolvePremiumSnapshotFromProfile(userRecord?.data?.profile);
  const premiumAccessUntil = computePremiumAccessUntilFromProfile(userRecord?.data?.profile);
  const premiumCancelAtPeriodEnd =
    String(userRecord?.data?.profile?.premiumCancelAtPeriodEnd || "")
      .trim()
      .toLowerCase() === "true" || userRecord?.data?.profile?.premiumCancelAtPeriodEnd === true;
  return {
    id: userRecord.id,
    email: userRecord.email,
    displayName: userRecord.displayName,
    emailVerified: userRecord.emailVerified === true,
    createdAt: userRecord.createdAt,
    updatedAt: userRecord.updatedAt,
    lastLoginAt: userRecord.lastLoginAt || null,
    authProvider: authProvider.slice(0, 32),
    isPremium: premiumSnapshot.isPremium,
    planTier: premiumSnapshot.planTier,
    premiumAccessUntil,
    premiumCancelAtPeriodEnd,
  };
};

const getAuthContext = (req) => {
  const cookies = parseCookieHeader(req.headers.cookie || "");
  const rawToken = String(cookies[AUTH_COOKIE_NAME] || "");
  if (!rawToken) {
    return null;
  }
  const sessionHash = hashSessionToken(rawToken);
  const session = authStore.sessions[sessionHash];
  if (!session) {
    return null;
  }
  const expiresMs = Date.parse(String(session.expiresAt || ""));
  if (!Number.isFinite(expiresMs) || expiresMs <= Date.now()) {
    delete authStore.sessions[sessionHash];
    markAuthStoreDirty();
    return null;
  }
  const user = authStore.users[String(session.userId || "")];
  if (!user) {
    delete authStore.sessions[sessionHash];
    markAuthStoreDirty();
    return null;
  }
  return {
    sessionHash,
    session,
    user,
  };
};

app.use("/api", (req, res, next) => {
  pruneExpiredSessions();
  const authContext = getAuthContext(req);
  req.auth = authContext;
  req.authUser = authContext ? authContext.user : null;
  next();
});

app.use("/api", (req, res, next) => {
  if (String(req.path || "").startsWith("/admin/security")) {
    return next();
  }
  if (
    rejectBlockedAccess({
      req,
      res,
      email: req.authUser?.email,
      userId: req.authUser?.id,
      context: "api-middleware",
    })
  ) {
    return;
  }
  next();
});

const requireAuthenticatedUser = (req, res, next) => {
  if (!req.authUser) {
    return res.status(401).json({ error: "Authentication required" });
  }
  return next();
};

const requireAdminSecurityAccess = (req, res, next) => {
  if (!ADMIN_SECURITY_TOKEN) {
    return res.status(503).json({ error: "Admin security token is not configured" });
  }
  const providedToken = String(
    req.get("x-admin-token") || req.body?.adminToken || req.query?.adminToken || ""
  ).trim();
  if (!providedToken || !constantTimeStringEquals(providedToken, ADMIN_SECURITY_TOKEN)) {
    void appendSecurityEvent({
      type: "admin-auth-failed",
      req,
      reason: "Invalid admin token",
      details: {
        path: String(req.originalUrl || ""),
      },
    });
    return res.status(401).json({ error: "Admin authentication required" });
  }
  return next();
};

app.get(
  "/api/admin/security/blocked",
  adminSecurityLimiter,
  requireAdminSecurityAccess,
  (req, res) => {
    return res.json({
      ok: true,
      blocked: blockedUsersStore,
      totals: {
        emails: Object.keys(blockedUsersStore.emails || {}).length,
        userIds: Object.keys(blockedUsersStore.userIds || {}).length,
        ipHashes: Object.keys(blockedUsersStore.ipHashes || {}).length,
      },
    });
  }
);

app.get(
  "/api/admin/security/events",
  adminSecurityLimiter,
  requireAdminSecurityAccess,
  (req, res) => {
    const requestedLimit = Number(req.query?.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.max(1, Math.min(5000, Math.round(requestedLimit)))
      : 200;
    const events = (securityEventsStore.events || []).slice(-limit).reverse();
    return res.json({
      ok: true,
      total: (securityEventsStore.events || []).length,
      events,
    });
  }
);

app.post(
  "/api/admin/security/block",
  adminSecurityLimiter,
  requireAdminSecurityAccess,
  (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const userId = String(req.body?.userId || "").trim().slice(0, 120);
    const ipHashInput = String(req.body?.ipHash || "").trim().toLowerCase().slice(0, 120);
    const ipInput = String(req.body?.ip || "").trim().slice(0, 120);
    const reason = String(req.body?.reason || "policy-violation").trim().slice(0, 200);
    const note = String(req.body?.note || "").trim().slice(0, 300);
    const blockedBy = String(req.body?.blockedBy || "admin").trim().slice(0, 80) || "admin";

    const resolvedIpHash = ipHashInput || (ipInput ? hashText(`ip:${ipInput}`) : "");
    const hasTarget = Boolean(email || userId || resolvedIpHash);
    if (!hasTarget) {
      return res.status(400).json({ error: "Provide at least one of: email, userId, ip/ipHash" });
    }

    const meta = {
      blockedAt: new Date().toISOString(),
      reason,
      note,
      blockedBy,
    };
    if (email) {
      blockedUsersStore.emails[email] = normalizeBlockedEntryMeta(meta);
      const existingUserId = String(authStore.emailIndex[email] || "").trim();
      if (existingUserId) {
        removeAllSessionsForUser(existingUserId);
      }
    }
    if (userId) {
      blockedUsersStore.userIds[userId] = normalizeBlockedEntryMeta(meta);
      removeAllSessionsForUser(userId);
    }
    if (resolvedIpHash) {
      blockedUsersStore.ipHashes[resolvedIpHash] = normalizeBlockedEntryMeta(meta);
    }
    markBlockedUsersStoreDirty();
    void appendSecurityEvent({
      type: "admin-block",
      req,
      email,
      userId,
      reason,
      details: {
        ipHash: resolvedIpHash,
        note,
        blockedBy,
      },
    });
    return res.json({
      ok: true,
      blocked: {
        email: email || null,
        userId: userId || null,
        ipHash: resolvedIpHash || null,
      },
    });
  }
);

app.post(
  "/api/admin/security/unblock",
  adminSecurityLimiter,
  requireAdminSecurityAccess,
  (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const userId = String(req.body?.userId || "").trim().slice(0, 120);
    const ipHashInput = String(req.body?.ipHash || "").trim().toLowerCase().slice(0, 120);
    const ipInput = String(req.body?.ip || "").trim().slice(0, 120);
    const resolvedIpHash = ipHashInput || (ipInput ? hashText(`ip:${ipInput}`) : "");
    const hasTarget = Boolean(email || userId || resolvedIpHash);
    if (!hasTarget) {
      return res.status(400).json({ error: "Provide at least one of: email, userId, ip/ipHash" });
    }

    let changed = false;
    if (email && blockedUsersStore.emails[email]) {
      delete blockedUsersStore.emails[email];
      changed = true;
    }
    if (userId && blockedUsersStore.userIds[userId]) {
      delete blockedUsersStore.userIds[userId];
      changed = true;
    }
    if (resolvedIpHash && blockedUsersStore.ipHashes[resolvedIpHash]) {
      delete blockedUsersStore.ipHashes[resolvedIpHash];
      changed = true;
    }

    if (changed) {
      markBlockedUsersStoreDirty();
    }
    void appendSecurityEvent({
      type: "admin-unblock",
      req,
      email,
      userId,
      reason: changed ? "Unblocked user target(s)" : "Unblock requested but no matching target",
      details: {
        ipHash: resolvedIpHash,
      },
    });
    return res.json({
      ok: true,
      changed,
      unblocked: {
        email: email || null,
        userId: userId || null,
        ipHash: resolvedIpHash || null,
      },
    });
  }
);

const isGoogleOauthConfigured = () =>
  Boolean(
    String(process.env.GOOGLE_OAUTH_CLIENT_ID || "").trim() &&
      String(process.env.GOOGLE_OAUTH_CLIENT_SECRET || "").trim()
  );

const getRequestOrigin = (req) => {
  const forwardedHost = String(req.get("x-forwarded-host") || "")
    .split(",")[0]
    .trim();
  const directHost = String(req.get("host") || "").trim();
  const host = forwardedHost || directHost || `localhost:${port}`;
  const forwardedProto = String(req.get("x-forwarded-proto") || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  const protocol = forwardedProto || (isSecureRequest(req) ? "https" : "http");
  return `${protocol}://${host}`;
};

const getPublicAppOrigin = (req) => {
  const requestOrigin = getRequestOrigin(req);
  const requestHost = String(req.get("host") || "").trim();
  if (isLocalHost(requestHost)) {
    return requestOrigin;
  }
  const configuredOrigin = String(process.env.PUBLIC_APP_ORIGIN || "").trim();
  if (configuredOrigin) {
    try {
      const parsed = new URL(configuredOrigin);
      return parsed.origin;
    } catch {}
  }
  return requestOrigin;
};

const sanitizeReturnToPath = (rawValue) => {
  const raw = String(rawValue || "").trim();
  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return "/index.html";
  }
  try {
    const parsed = new URL(raw, "http://localhost");
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/index.html";
  }
};

const buildGoogleOauthRedirectUri = (req) => {
  const explicit = String(process.env.GOOGLE_OAUTH_REDIRECT_URI || "").trim();
  if (explicit) {
    return explicit;
  }
  return `${getPublicAppOrigin(req)}/api/auth/google/callback`;
};

const cleanupExpiredGoogleOauthStates = () => {
  const nowMs = Date.now();
  for (const [stateToken, payload] of googleOauthStateStore.entries()) {
    const createdAtMs = Number(payload?.createdAt || 0);
    if (!createdAtMs || nowMs - createdAtMs > GOOGLE_OAUTH_STATE_TTL_MS) {
      googleOauthStateStore.delete(stateToken);
    }
  }
};

const createGoogleOauthState = ({ mode = "login", returnTo = "/index.html", flowToken = "" } = {}) => {
  cleanupExpiredGoogleOauthStates();
  const stateToken = crypto.randomBytes(20).toString("base64url");
  googleOauthStateStore.set(stateToken, {
    mode: mode === "signup" ? "signup" : "login",
    returnTo: sanitizeReturnToPath(returnTo),
    flowToken: String(flowToken || "").trim(),
    createdAt: Date.now(),
  });
  return stateToken;
};

const consumeGoogleOauthState = (stateToken) => {
  cleanupExpiredGoogleOauthStates();
  const state = googleOauthStateStore.get(stateToken);
  if (!state) {
    return null;
  }
  googleOauthStateStore.delete(stateToken);
  const createdAtMs = Number(state.createdAt || 0);
  if (!createdAtMs || Date.now() - createdAtMs > GOOGLE_OAUTH_STATE_TTL_MS) {
    return null;
  }
  return state;
};

const exchangeGoogleCodeForTokens = async ({ code, redirectUri }) => {
  const params = new URLSearchParams();
  params.set("code", String(code || ""));
  params.set("client_id", String(process.env.GOOGLE_OAUTH_CLIENT_ID || "").trim());
  params.set("client_secret", String(process.env.GOOGLE_OAUTH_CLIENT_SECRET || "").trim());
  params.set("redirect_uri", String(redirectUri || "").trim());
  params.set("grant_type", "authorization_code");

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params.toString(),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload || typeof payload !== "object") {
    const errorMessage = String(payload?.error_description || payload?.error || "Google token exchange failed");
    throw new Error(errorMessage);
  }
  return payload;
};

const fetchGoogleUserProfile = async ({ accessToken, idToken }) => {
  if (accessToken) {
    const response = await fetch(GOOGLE_OAUTH_USERINFO_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
    const payload = await response.json().catch(() => null);
    if (response.ok && payload && typeof payload === "object") {
      return payload;
    }
  }
  if (idToken) {
    const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    const response = await fetch(verifyUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const payload = await response.json().catch(() => null);
    if (response.ok && payload && typeof payload === "object") {
      return payload;
    }
  }
  throw new Error("Failed to fetch Google profile");
};

const buildEmailVerificationLink = (req, rawToken, returnTo = "/index.html", email = "") => {
  const origin = getPublicAppOrigin(req);
  const verifyUrl = new URL("/api/auth/verify-email", origin);
  verifyUrl.searchParams.set("token", String(rawToken || "").trim());
  verifyUrl.searchParams.set("returnTo", sanitizeReturnToPath(returnTo));
  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail) {
    verifyUrl.searchParams.set("email", normalizedEmail);
  }
  return verifyUrl.toString();
};

const buildPasswordResetLink = (req, rawToken, returnTo = "/index.html") => {
  const origin = getPublicAppOrigin(req);
  const resetUrl = new URL("/api/auth/password/reset", origin);
  resetUrl.searchParams.set("token", String(rawToken || "").trim());
  resetUrl.searchParams.set("returnTo", sanitizeReturnToPath(returnTo));
  return resetUrl.toString();
};

const sendAccountVerificationEmail = async ({ req, email, displayName, rawToken, returnTo }) => {
  const verifyUrl = buildEmailVerificationLink(req, rawToken, returnTo, email);
  const safeName = sanitizeDisplayName(displayName, email);
  const subject = "Verify your Cosmica account";
  const text = [
    `Hi ${safeName},`,
    "",
    "Welcome to Cosmica.",
    "Please verify your email before logging in:",
    verifyUrl,
    "",
    `This link expires in ${Math.round(EMAIL_VERIFICATION_TOKEN_TTL_MS / (1000 * 60 * 60))} hours.`,
    "",
    "If you did not create this account, you can ignore this email.",
  ].join("\n");
  return sendTransactionalEmail({
    to: email,
    subject,
    text,
  });
};

const sendPasswordResetEmail = async ({ req, email, displayName, rawToken, returnTo }) => {
  const resetUrl = buildPasswordResetLink(req, rawToken, returnTo);
  const safeName = sanitizeDisplayName(displayName, email);
  const subject = "Reset your Cosmica password";
  const text = [
    `Hi ${safeName},`,
    "",
    "We received a request to reset your Cosmica password.",
    "Use the secure link below to set a new password:",
    resetUrl,
    "",
    `This link expires in ${Math.round(PASSWORD_RESET_TOKEN_TTL_MS / (1000 * 60))} minutes.`,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");
  return sendTransactionalEmail({
    to: email,
    subject,
    text,
  });
};

const buildAuthErrorRedirectPath = (code, returnTo = "/index.html", extraParams = {}) => {
  const safeTarget = sanitizeReturnToPath(returnTo);
  const extras = isPlainObject(extraParams) ? extraParams : {};
  try {
    const parsed = new URL(safeTarget, "http://localhost");
    parsed.searchParams.set("authError", String(code || "google"));
    Object.entries(extras).forEach(([key, value]) => {
      const normalizedKey = String(key || "").trim();
      if (!normalizedKey) {
        return;
      }
      const normalizedValue = String(value || "").trim();
      if (!normalizedValue) {
        return;
      }
      parsed.searchParams.set(normalizedKey, normalizedValue);
    });
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    const params = new URLSearchParams();
    params.set("authError", String(code || "google"));
    Object.entries(extras).forEach(([key, value]) => {
      const normalizedKey = String(key || "").trim();
      if (!normalizedKey) {
        return;
      }
      const normalizedValue = String(value || "").trim();
      if (!normalizedValue) {
        return;
      }
      params.set(normalizedKey, normalizedValue);
    });
    return `/index.html?${params.toString()}`;
  }
};

const normalizeWorldKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 40);
const normalizeMapKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .slice(0, 20);
const normalizeSectionKey = (value) => String(value || "").trim().slice(0, 120);
const ALLOWED_PROGRESS_MAP_KEYS = new Set(["letters", "words", "phrases", "grammar"]);
const ALLOWED_PROGRESS_STATUS = new Set(["started", "practiced", "reviewed", "completed", "uncompleted"]);

const ensureProgressContainers = (progress, worldKey, mapKey) => {
  if (!isPlainObject(progress.worlds[worldKey])) {
    progress.worlds[worldKey] = { maps: {} };
  }
  if (!isPlainObject(progress.worlds[worldKey].maps)) {
    progress.worlds[worldKey].maps = {};
  }
  if (!isPlainObject(progress.worlds[worldKey].maps[mapKey])) {
    progress.worlds[worldKey].maps[mapKey] = {
      sections: {},
      startedCount: 0,
      practiceCount: 0,
      reviewCount: 0,
      completedCount: 0,
      updatedAt: null,
    };
  }
  if (!isPlainObject(progress.worlds[worldKey].maps[mapKey].sections)) {
    progress.worlds[worldKey].maps[mapKey].sections = {};
  }
  const mapProgress = progress.worlds[worldKey].maps[mapKey];
  mapProgress.startedCount = toBoundedInt(mapProgress.startedCount, 0, 5000000);
  mapProgress.practiceCount = toBoundedInt(mapProgress.practiceCount, 0, 50000000);
  mapProgress.reviewCount = toBoundedInt(mapProgress.reviewCount, 0, 50000000);
  mapProgress.completedCount = toBoundedInt(mapProgress.completedCount, 0, 5000000);
};

const BADGE_DEFINITIONS = Object.freeze({
  first_steps: Object.freeze({
    title: "First Steps",
    description: "Complete your first section.",
    tier: "bronze",
  }),
  section_navigator: Object.freeze({
    title: "Section Navigator",
    description: "Start 5 unique sections.",
    tier: "bronze",
  }),
  grammar_keeper: Object.freeze({
    title: "Grammar Keeper",
    description: "Complete 5 grammar sections.",
    tier: "silver",
  }),
  streak_3: Object.freeze({
    title: "3-Day Streak",
    description: "Learn on 3 consecutive days.",
    tier: "bronze",
  }),
  streak_7: Object.freeze({
    title: "7-Day Streak",
    description: "Learn on 7 consecutive days.",
    tier: "gold",
  }),
  polyglot_scout: Object.freeze({
    title: "Polyglot Scout",
    description: "Practice in 3 language worlds.",
    tier: "silver",
  }),
  listener_150: Object.freeze({
    title: "Signal Listener",
    description: "Practice 150 cards.",
    tier: "silver",
  }),
  quest_7: Object.freeze({
    title: "Quest Master",
    description: "Finish daily quests on 7 days.",
    tier: "gold",
  }),
  level_10: Object.freeze({
    title: "Level 10 Pilot",
    description: "Reach level 10.",
    tier: "gold",
  }),
});

const hasSectionCompletion = (sectionRecord) => {
  if (!isPlainObject(sectionRecord)) {
    return false;
  }
  if (String(sectionRecord.status || "").toLowerCase() === "completed") {
    return true;
  }
  return Boolean(sectionRecord.firstCompletedAt);
};

const countCompletedGrammarSections = (progress) => {
  let count = 0;
  const worlds = isPlainObject(progress.worlds) ? progress.worlds : {};
  Object.values(worlds).forEach((worldRecord) => {
    const grammarSections = worldRecord?.maps?.grammar?.sections;
    if (!isPlainObject(grammarSections)) {
      return;
    }
    Object.values(grammarSections).forEach((sectionRecord) => {
      if (hasSectionCompletion(sectionRecord)) {
        count += 1;
      }
    });
  });
  return count;
};

const awardBadge = (gamification, badgeId, nowIso) => {
  const normalizedId = String(badgeId || "").trim();
  if (!normalizedId || gamification.badges[normalizedId]) {
    return false;
  }
  const meta = BADGE_DEFINITIONS[normalizedId];
  if (!meta) {
    return false;
  }
  gamification.badges[normalizedId] = {
    awardedAt: nowIso,
    title: meta.title,
    description: meta.description,
    tier: meta.tier,
  };
  return true;
};

const updateStreakForDate = (gamification, dateKey) => {
  const last = normalizeDateKey(gamification.lastActiveDate);
  if (last === dateKey) {
    return;
  }
  if (!last) {
    gamification.currentStreak = 1;
  } else {
    const dayGap = daysBetweenUtcDateKeys(last, dateKey);
    gamification.currentStreak = dayGap === 1 ? Math.max(1, gamification.currentStreak + 1) : 1;
  }
  gamification.bestStreak = Math.max(gamification.bestStreak, gamification.currentStreak);
  gamification.lastActiveDate = dateKey;
};

const ensureGamificationDateState = (progress, dateKey) => {
  progress.gamification = normalizeGamificationState(progress.gamification, progress.totals.xp);
  const gamification = progress.gamification;
  if (gamification.daily.date !== dateKey) {
    gamification.daily = {
      date: dateKey,
      xpEarned: 0,
      events: 0,
      startedEvents: 0,
      practicedEvents: 0,
      reviewEvents: 0,
      completedEvents: 0,
    };
  }
  if (gamification.quests.date !== dateKey) {
    gamification.quests = {
      date: dateKey,
      tasks: createDefaultQuestTasks(),
      allCompleted: false,
    };
  }
  updateStreakForDate(gamification, dateKey);
  return gamification;
};

const incrementQuestTaskProgress = (task, amount = 1) => {
  if (!task || task.completed) {
    return false;
  }
  const next = Math.max(0, Math.min(task.target, Number(task.progress || 0) + amount));
  task.progress = next;
  task.completed = task.progress >= task.target;
  return task.completed;
};

const decrementQuestTaskProgress = (task, amount = 1) => {
  if (!task) {
    return false;
  }
  const next = Math.max(0, Math.min(task.target, Number(task.progress || 0) - amount));
  task.progress = next;
  task.completed = task.progress >= task.target;
  return task.completed;
};

const isCountableWorldMapSectionEvent = (eventContext) => {
  const mapKey = String(eventContext?.mapKey || "").trim().toLowerCase();
  const sectionKey = String(eventContext?.sectionKey || "").trim();
  if (!ALLOWED_PROGRESS_MAP_KEYS.has(mapKey) || !sectionKey) {
    return false;
  }
  if (sectionKey.startsWith(BOSS_SECTION_KEY_PREFIX)) {
    return false;
  }
  if (/-entry$/i.test(sectionKey)) {
    return false;
  }
  return true;
};

const isWorldMapCardPracticeEvent = (eventContext) => {
  const status = String(eventContext?.status || "").trim().toLowerCase();
  return status === "practiced" && isCountableWorldMapSectionEvent(eventContext);
};

const countEffectiveCompletedSectionsForQuests = (progress) => {
  const worlds = isPlainObject(progress?.worlds) ? progress.worlds : {};
  let total = 0;

  Object.values(worlds).forEach((worldRecord) => {
    const maps = isPlainObject(worldRecord?.maps) ? worldRecord.maps : {};

    ALLOWED_PROGRESS_MAP_KEYS.forEach((mapKey) => {
      const sections = isPlainObject(maps?.[mapKey]?.sections) ? maps[mapKey].sections : {};
      if (!isPlainObject(sections)) {
        return;
      }

      if (mapKey === "letters") {
        const hasAnyCompletedLettersSection = Object.entries(sections).some(
          ([sectionKey, sectionRecord]) =>
            isCountableWorldMapSectionEvent({ mapKey, sectionKey }) && hasSectionCompletion(sectionRecord)
        );
        if (hasAnyCompletedLettersSection) {
          total += 1;
        }
        return;
      }

      Object.entries(sections).forEach(([sectionKey, sectionRecord]) => {
        if (!isCountableWorldMapSectionEvent({ mapKey, sectionKey })) {
          return;
        }
        if (hasSectionCompletion(sectionRecord)) {
          total += 1;
        }
      });
    });
  });

  return total;
};

const syncCompleteQuestTaskFromProgress = (progress, tasks) => {
  const completeTask = tasks?.complete;
  if (!completeTask) {
    return;
  }
  const target = Math.max(1, Number(completeTask.target || 2));
  const effectiveCompleted = countEffectiveCompletedSectionsForQuests(progress);
  completeTask.progress = Math.max(0, Math.min(target, effectiveCompleted));
  completeTask.completed = completeTask.progress >= target;
};

const updateQuestProgressFromEvent = (progress, eventContext) => {
  const gamification = progress.gamification;
  const tasks = gamification.quests.tasks;
  const hasPremiumAccess = eventContext?.hasPremiumAccess !== false;
  if (!tasks) {
    return false;
  }

  if (eventContext.isPracticeQuestToggle) {
    if (eventContext.shouldMarkPractice) {
      incrementQuestTaskProgress(tasks.practice, 1);
    }
    if (eventContext.shouldUnmarkPractice) {
      decrementQuestTaskProgress(tasks.practice, 1);
    }

    syncCompleteQuestTaskFromProgress(progress, tasks);

    const previouslyAllCompleted = Boolean(gamification.quests.allCompleted);
    const nowAllCompleted = Object.values(tasks).every((task) => task.completed);
    gamification.quests.allCompleted = nowAllCompleted;
    if (hasPremiumAccess && !previouslyAllCompleted && nowAllCompleted) {
      gamification.stats.questDaysCompleted = toBoundedInt(
        Number(gamification.stats.questDaysCompleted || 0) + 1,
        0,
        5000000
      );
      return true;
    }
    return false;
  }

  if (isWorldMapCardPracticeEvent(eventContext)) {
    incrementQuestTaskProgress(tasks.practice, 1);
  }
  if (
    eventContext.status === "started" &&
    eventContext.isFirstSectionVisit &&
    isCountableWorldMapSectionEvent(eventContext)
  ) {
    incrementQuestTaskProgress(tasks.discover, 1);
  }
  if (
    eventContext.status === "completed" &&
    eventContext.isFirstCompletion &&
    isCountableWorldMapSectionEvent(eventContext)
  ) {
    incrementQuestTaskProgress(tasks.complete, 1);
  }
  if (
    eventContext.status === "uncompleted" &&
    eventContext.shouldDecrementCompletion &&
    isCountableWorldMapSectionEvent(eventContext)
  ) {
    decrementQuestTaskProgress(tasks.complete, 1);
  }

  syncCompleteQuestTaskFromProgress(progress, tasks);

  const previouslyAllCompleted = Boolean(gamification.quests.allCompleted);
  const nowAllCompleted = Object.values(tasks).every((task) => task.completed);
  gamification.quests.allCompleted = nowAllCompleted;
  if (hasPremiumAccess && !previouslyAllCompleted && nowAllCompleted) {
    gamification.stats.questDaysCompleted = toBoundedInt(
      Number(gamification.stats.questDaysCompleted || 0) + 1,
      0,
      5000000
    );
    return true;
  }
  return false;
};

const computeEventXpDelta = (status, mapKey, previousSection, dailyState) => {
  const previousStatus = String(previousSection?.status || "").toLowerCase();
  const previousUpdatedMs = Date.parse(String(previousSection?.lastUpdatedAt || ""));
  const recentlyRepeated =
    Number.isFinite(previousUpdatedMs) &&
    Date.now() - previousUpdatedMs < 45000 &&
    previousStatus === status &&
    status !== "completed";
  if (recentlyRepeated) {
    return 0;
  }

  const mapWeights = {
    letters: { started: 5, practiced: 2, reviewed: 3, completed: 32, repeatedComplete: 5 },
    words: { started: 6, practiced: 3, reviewed: 4, completed: 42, repeatedComplete: 6 },
    phrases: { started: 6, practiced: 3, reviewed: 5, completed: 46, repeatedComplete: 6 },
    grammar: { started: 7, practiced: 4, reviewed: 8, completed: 55, repeatedComplete: 8 },
  };
  const weight = mapWeights[mapKey] || mapWeights.words;

  if (dailyState.xpEarned >= 520 && status !== "completed") {
    return 0;
  }
  if (status === "completed") {
    return previousStatus === "completed" ? weight.repeatedComplete : weight.completed;
  }
  if (status === "started") {
    if (!previousSection) {
      return weight.started;
    }
    return previousStatus === "completed" ? 1 : Math.max(1, Math.floor(weight.started / 2));
  }
  if (status === "reviewed") {
    return weight.reviewed;
  }
  if (status === "practiced") {
    return weight.practiced;
  }
  return 0;
};

const syncBadgesAndLevel = (progress, worldKey, nowIso, hasPremiumAccess = true) => {
  const gamification = progress.gamification;
  const worldSet = new Set(gamification.stats.worldsEngaged || []);
  if (worldKey) {
    worldSet.add(worldKey);
  }
  gamification.stats.worldsEngaged = [...worldSet].slice(0, 30);

  const levelMeta = deriveLevelMetaFromXp(progress.totals.xp);
  gamification.level = levelMeta.level;
  gamification.nextLevelXp = levelMeta.nextLevelXp;

  if (!hasPremiumAccess) {
    return;
  }

  if (gamification.stats.sectionsCompleted >= 1) {
    awardBadge(gamification, "first_steps", nowIso);
  }
  if (gamification.stats.sectionsVisited >= 5) {
    awardBadge(gamification, "section_navigator", nowIso);
  }
  if (countCompletedGrammarSections(progress) >= 5) {
    awardBadge(gamification, "grammar_keeper", nowIso);
  }
  if (gamification.currentStreak >= 3) {
    awardBadge(gamification, "streak_3", nowIso);
  }
  if (gamification.currentStreak >= 7) {
    awardBadge(gamification, "streak_7", nowIso);
  }
  if ((gamification.stats.worldsEngaged || []).length >= 3) {
    awardBadge(gamification, "polyglot_scout", nowIso);
  }
  if (gamification.stats.cardsPracticed >= 150) {
    awardBadge(gamification, "listener_150", nowIso);
  }
  if (gamification.stats.questDaysCompleted >= 7) {
    awardBadge(gamification, "quest_7", nowIso);
  }
  if (gamification.level >= 10) {
    awardBadge(gamification, "level_10", nowIso);
  }
};

const userHasPremiumAccessForProgress = (userRecord) => {
  const profile = isPlainObject(userRecord?.data?.profile) ? userRecord.data.profile : {};
  return resolvePremiumSnapshotFromProfile(profile).isPremium;
};

const trackProgressEventForUser = (userRecord, payload) => {
  const worldKey = normalizeWorldKey(payload.worldKey);
  const mapKey = normalizeMapKey(payload.mapKey);
  const sectionKey = normalizeSectionKey(payload.sectionKey);
  const status = String(payload.status || "started").trim().toLowerCase();
  const scoreRaw = Number(payload.score);

  if (!worldKey || !mapKey || !sectionKey) {
    return { ok: false, error: "Missing worldKey, mapKey, or sectionKey" };
  }
  if (!ALLOWED_PROGRESS_MAP_KEYS.has(mapKey)) {
    return { ok: false, error: "Invalid mapKey" };
  }
  if (!ALLOWED_PROGRESS_STATUS.has(status)) {
    return { ok: false, error: "Invalid status" };
  }

  const score = Number.isFinite(scoreRaw) ? Math.max(0, Math.min(100, Math.round(scoreRaw))) : null;
  const hasPremiumAccess = userHasPremiumAccessForProgress(userRecord);
  const questToggleMode = String(payload.questToggleMode || "").trim().toLowerCase();
  const isPracticeQuestToggle = questToggleMode === "practice";
  const now = new Date().toISOString();
  const dateKey = getUtcDateKeyFromIso(now);

  userRecord.progress = normalizeProgress(userRecord.progress);
  const progress = userRecord.progress;
  ensureProgressContainers(progress, worldKey, mapKey);
  const mapProgress = progress.worlds[worldKey].maps[mapKey];
  const previous = isPlainObject(mapProgress.sections[sectionKey]) ? mapProgress.sections[sectionKey] : null;
  const previousStatus = String(previous?.status || "").toLowerCase();
  const previousHasCompletion = hasSectionCompletion(previous);
  const isUncompleteEvent = !isPracticeQuestToggle && status === "uncompleted" && previousHasCompletion;
  const nextStatus =
    isPracticeQuestToggle
      ? previousStatus || "started"
      : status === "uncompleted"
      ? previousStatus && previousStatus !== "completed"
        ? previousStatus
        : "started"
      : status;
  const isFirstCompletion = !isPracticeQuestToggle && status === "completed" && !previousHasCompletion;
  const hasAnyCompletedLettersSection =
    mapKey === "letters" &&
    Object.entries(mapProgress.sections || {}).some(([existingSectionKey, existingSection]) => {
      const existingStatus = String(existingSection?.status || "").trim().toLowerCase();
      return (
        existingStatus === "completed" &&
        isCountableWorldMapSectionEvent({
          mapKey,
          sectionKey: existingSectionKey,
        })
      );
    });
  const isFirstQuestCompletion =
    !isPracticeQuestToggle &&
    status === "completed" &&
    (mapKey === "letters"
      ? isCountableWorldMapSectionEvent({ mapKey, sectionKey }) &&
        previousStatus !== "completed" &&
        !hasAnyCompletedLettersSection
      : isFirstCompletion);
  const hasOtherCompletedLettersSection =
    mapKey === "letters" &&
    Object.entries(mapProgress.sections || {}).some(([existingSectionKey, existingSection]) => {
      if (existingSectionKey === sectionKey) {
        return false;
      }
      const existingStatus = String(existingSection?.status || "").trim().toLowerCase();
      return (
        existingStatus === "completed" &&
        isCountableWorldMapSectionEvent({
          mapKey,
          sectionKey: existingSectionKey,
        })
      );
    });
  const shouldDecrementQuestCompletion =
    !isPracticeQuestToggle &&
    isUncompleteEvent &&
    isCountableWorldMapSectionEvent({ mapKey, sectionKey }) &&
    (mapKey === "letters" ? !hasOtherCompletedLettersSection : true);
  const wasPracticeQuestChecked = Boolean(previous?.practiceQuestCheckedAt);
  const wantsPracticeQuestChecked = isPracticeQuestToggle ? status !== "uncompleted" : wasPracticeQuestChecked;
  const shouldMarkPracticeQuest = isPracticeQuestToggle && !wasPracticeQuestChecked && wantsPracticeQuestChecked;
  const shouldUnmarkPracticeQuest = isPracticeQuestToggle && wasPracticeQuestChecked && !wantsPracticeQuestChecked;
  const isFirstSectionVisit = !previous || toBoundedInt(previous.visitCount, 0, 5000000) === 0;

  const gamification = ensureGamificationDateState(progress, dateKey);
  const computedXpDelta = isPracticeQuestToggle ? 0 : computeEventXpDelta(status, mapKey, previous, gamification.daily);
  let xpDelta = 0;

  const nextVisitCount = toBoundedInt(previous?.visitCount, 0, 5000000) + (status === "started" ? 1 : 0);
  const nextPracticeCount =
    toBoundedInt(previous?.practiceCount, 0, 50000000) + (status === "practiced" ? 1 : 0);
  const nextReviewCount =
    toBoundedInt(previous?.reviewCount, 0, 50000000) + (status === "reviewed" ? 1 : 0);
  const nextCompletionCount =
    toBoundedInt(previous?.completionCount, 0, 5000000) +
    (!isPracticeQuestToggle && (status === "completed" ? 1 : isUncompleteEvent ? -1 : 0));

  mapProgress.sections[sectionKey] = {
    status: nextStatus,
    score,
    visitCount: nextVisitCount,
    practiceCount: nextPracticeCount,
    reviewCount: nextReviewCount,
    completionCount: nextCompletionCount,
    firstStartedAt: previous?.firstStartedAt || (status === "started" ? now : null),
    lastUpdatedAt: now,
    firstCompletedAt:
      isPracticeQuestToggle
        ? previous?.firstCompletedAt || null
        : status === "completed"
          ? previous?.firstCompletedAt || now
          : status === "uncompleted"
            ? null
            : previous?.firstCompletedAt || null,
    practiceQuestCheckedAt: wantsPracticeQuestChecked ? previous?.practiceQuestCheckedAt || now : null,
  };

  if (status === "started") {
    mapProgress.startedCount = toBoundedInt(Number(mapProgress.startedCount || 0) + 1, 0, 5000000);
  }
  if (status === "practiced") {
    mapProgress.practiceCount = toBoundedInt(Number(mapProgress.practiceCount || 0) + 1, 0, 50000000);
  }
  if (status === "reviewed") {
    mapProgress.reviewCount = toBoundedInt(Number(mapProgress.reviewCount || 0) + 1, 0, 50000000);
  }
  if (!isPracticeQuestToggle && status === "completed" && !previousHasCompletion) {
    mapProgress.completedCount = Math.max(0, Number(mapProgress.completedCount || 0) + 1);
    progress.totals.completedSections = Math.max(0, Number(progress.totals.completedSections || 0) + 1);
  }
  if (!isPracticeQuestToggle && isUncompleteEvent) {
    mapProgress.completedCount = Math.max(0, Number(mapProgress.completedCount || 0) - 1);
    progress.totals.completedSections = Math.max(0, Number(progress.totals.completedSections || 0) - 1);
  }

  progress.totals.lastActivityAt = now;
  gamification.daily.events = toBoundedInt(Number(gamification.daily.events || 0) + 1, 0, 50000);
  if (status === "started") {
    gamification.daily.startedEvents = toBoundedInt(Number(gamification.daily.startedEvents || 0) + 1, 0, 50000);
  }
  if (status === "practiced") {
    gamification.daily.practicedEvents = toBoundedInt(
      Number(gamification.daily.practicedEvents || 0) + 1,
      0,
      50000
    );
  }
  if (status === "reviewed") {
    gamification.daily.reviewEvents = toBoundedInt(Number(gamification.daily.reviewEvents || 0) + 1, 0, 50000);
  }
  if (!isPracticeQuestToggle && status === "completed") {
    gamification.daily.completedEvents = toBoundedInt(
      Number(gamification.daily.completedEvents || 0) + 1,
      0,
      50000
    );
  }

  if (isFirstSectionVisit && status === "started") {
    gamification.stats.sectionsVisited = toBoundedInt(
      Number(gamification.stats.sectionsVisited || 0) + 1,
      0,
      5000000
    );
  }
  if (
    isWorldMapCardPracticeEvent({
      status,
      mapKey,
      sectionKey,
    })
  ) {
    gamification.stats.cardsPracticed = toBoundedInt(
      Number(gamification.stats.cardsPracticed || 0) + 1,
      0,
      50000000
    );
  }
  if (status === "reviewed" && mapKey === "grammar") {
    gamification.stats.grammarReviews = toBoundedInt(
      Number(gamification.stats.grammarReviews || 0) + 1,
      0,
      50000000
    );
  }
  if (!isPracticeQuestToggle && isFirstCompletion) {
    gamification.stats.sectionsCompleted = toBoundedInt(
      Number(gamification.stats.sectionsCompleted || 0) + 1,
      0,
      5000000
    );
  }
  if (!isPracticeQuestToggle && isUncompleteEvent) {
    gamification.stats.sectionsCompleted = toBoundedInt(
      Number(gamification.stats.sectionsCompleted || 0) - 1,
      0,
      5000000
    );
  }

  updateQuestProgressFromEvent(progress, {
    status,
    mapKey,
    sectionKey,
    isFirstCompletion: isFirstQuestCompletion,
    isFirstSectionVisit,
    shouldDecrementCompletion: shouldDecrementQuestCompletion,
    isPracticeQuestToggle,
    shouldMarkPractice: shouldMarkPracticeQuest,
    shouldUnmarkPractice: shouldUnmarkPracticeQuest,
    hasPremiumAccess,
  });

  if (hasPremiumAccess && gamification.quests.allCompleted) {
    xpDelta = computedXpDelta;
  }

  progress.totals.xp = Math.max(0, Number(progress.totals.xp || 0) + xpDelta);
  gamification.daily.xpEarned = toBoundedInt(
    Number(gamification.daily.xpEarned || 0) + Math.max(0, xpDelta),
    0,
    30000
  );

  syncBadgesAndLevel(progress, worldKey, now, hasPremiumAccess);

  mapProgress.updatedAt = now;
  progress.updatedAt = now;
  progress.recentEvents.push({
    worldKey,
    mapKey,
    sectionKey,
    status,
    xpDelta,
    timestamp: now,
  });
  progress.recentEvents = progress.recentEvents.slice(-120);
  userRecord.updatedAt = now;
  markAuthStoreDirty();

  return {
    ok: true,
    progress,
    event: {
      worldKey,
      mapKey,
      sectionKey,
      status,
      xpDelta,
      score,
      timestamp: now,
    },
  };
};

/* --------------------------------------------------------------------------
   ROUTE: AUTH + ACCOUNT + PROGRESS
   -------------------------------------------------------------------------- */
const startGoogleOauthFlow = (req, res, forcedMode = "") => {
  if (!isGoogleOauthConfigured()) {
    return res.status(503).json({ error: "Google authentication is not configured" });
  }

  const forced = String(forcedMode || "").trim().toLowerCase();
  const mode =
    forced === "signup" || forced === "login"
      ? forced
      : String(req.query?.mode || "").trim().toLowerCase() === "signup"
        ? "signup"
        : "login";
  const returnTo = sanitizeReturnToPath(req.query?.returnTo);
  const flowToken = crypto.randomBytes(20).toString("base64url");
  setGoogleOauthFlowCookie(req, res, flowToken);
  const stateToken = createGoogleOauthState({ mode, returnTo, flowToken });
  const redirectUri = buildGoogleOauthRedirectUri(req);
  const authorizeParams = new URLSearchParams();
  authorizeParams.set("client_id", String(process.env.GOOGLE_OAUTH_CLIENT_ID || "").trim());
  authorizeParams.set("redirect_uri", redirectUri);
  authorizeParams.set("response_type", "code");
  authorizeParams.set("scope", "openid email profile");
  authorizeParams.set("state", stateToken);
  authorizeParams.set("prompt", "select_account");

  const redirectUrl = `${GOOGLE_OAUTH_AUTHORIZE_URL}?${authorizeParams.toString()}`;
  return res.json({ ok: true, redirectUrl, mode });
};

app.get("/api/auth/google/start/login", authGoogleLimiter, (req, res) =>
  startGoogleOauthFlow(req, res, "login")
);

app.get("/api/auth/google/start/signup", authGoogleLimiter, (req, res) =>
  startGoogleOauthFlow(req, res, "signup")
);

app.get("/api/auth/google/start", authGoogleLimiter, (req, res) => startGoogleOauthFlow(req, res));

app.get("/api/auth/google/callback", authGoogleLimiter, async (req, res) => {
  if (!isGoogleOauthConfigured()) {
    return res.redirect(302, buildAuthErrorRedirectPath("google_not_configured"));
  }

  const authCode = String(req.query?.code || "").trim();
  const stateToken = String(req.query?.state || "").trim();
  const oauthError = String(req.query?.error || "").trim();
  const flowCookieToken = readGoogleOauthFlowCookie(req);
  const stateData = consumeGoogleOauthState(stateToken);
  clearGoogleOauthFlowCookie(req, res);
  if (!stateData) {
    return res.redirect(302, buildAuthErrorRedirectPath("google_state"));
  }
  const stateFlowToken = String(stateData?.flowToken || "").trim();
  const requireFlowCookie =
    String(process.env.GOOGLE_OAUTH_REQUIRE_FLOW_COOKIE || "")
      .trim()
      .toLowerCase() === "true";
  const hasStateFlowToken = Boolean(stateFlowToken);
  const hasFlowCookieToken = Boolean(flowCookieToken);
  const hasFlowTokenMismatch = hasFlowCookieToken && hasStateFlowToken && flowCookieToken !== stateFlowToken;
  if (!hasStateFlowToken || hasFlowTokenMismatch || (requireFlowCookie && !hasFlowCookieToken)) {
    return res.redirect(302, buildAuthErrorRedirectPath("google_flow"));
  }
  if (oauthError) {
    return res.redirect(302, buildAuthErrorRedirectPath(`google_${oauthError}`));
  }
  if (!authCode) {
    return res.redirect(302, buildAuthErrorRedirectPath("google_code"));
  }

  try {
    const redirectUri = buildGoogleOauthRedirectUri(req);
    const tokenPayload = await exchangeGoogleCodeForTokens({
      code: authCode,
      redirectUri,
    });
    const profile = await fetchGoogleUserProfile({
      accessToken: String(tokenPayload.access_token || "").trim(),
      idToken: String(tokenPayload.id_token || "").trim(),
    });

    const email = normalizeEmail(profile.email);
    const emailVerifiedRaw = String(profile.email_verified || "").trim().toLowerCase();
    const emailVerified =
      profile.email_verified === true || emailVerifiedRaw === "true" || emailVerifiedRaw === "1";
    if (!isValidEmail(email) || !emailVerified) {
      return res.redirect(302, buildAuthErrorRedirectPath("google_email"));
    }
    if (
      rejectBlockedAccess({
        req,
        res,
        email,
        context: "auth-google-callback",
      })
    ) {
      return;
    }

    const flowMode = (stateData?.mode || "login").toLowerCase();

    const nowIso = new Date().toISOString();
    const existingUserId = authStore.emailIndex[email];
    let userRecord = existingUserId ? authStore.users[existingUserId] : null;
    let createdNewGoogleUser = false;
    if (
      userRecord &&
      rejectBlockedAccess({
        req,
        res,
        email,
        userId: userRecord.id,
        context: "auth-google-callback-user",
      })
    ) {
      return;
    }

    if (!userRecord) {
      if (flowMode !== "signup") {
        return res.redirect(302, buildAuthErrorRedirectPath("google_no_account"));
      }
      const userId = crypto.randomUUID();
      const generatedPassword = crypto.randomBytes(24).toString("base64url");
      const passwordRecord = await buildPasswordRecord(generatedPassword);
      const displayName = sanitizeDisplayName(profile.name || profile.given_name || "", email);
      userRecord = {
        id: userId,
        email,
        displayName,
        password: passwordRecord,
        createdAt: nowIso,
        updatedAt: nowIso,
        lastLoginAt: nowIso,
        emailVerified: true,
        emailVerification: createEmptyEmailVerificationState(),
        passwordReset: createEmptyPasswordResetState(),
        data: {
          settings: {
            baseLanguage: "",
          },
          profile: {
            authProvider: "google",
            picture: String(profile.picture || "").trim(),
          },
        },
        progress: createDefaultProgress(),
      };
      authStore.users[userId] = userRecord;
      authStore.emailIndex[email] = userId;
      createdNewGoogleUser = true;
    } else {
      if (!userRecord.displayName || userRecord.displayName === "Explorer") {
        userRecord.displayName = sanitizeDisplayName(profile.name || profile.given_name || "", email);
      }
      userRecord.data = normalizeUserData(userRecord.data);
      if (!isPlainObject(userRecord.data.profile)) {
        userRecord.data.profile = {};
      }
      userRecord.data.profile.authProvider = "google";
      const pictureUrl = String(profile.picture || "").trim();
      if (pictureUrl) {
        userRecord.data.profile.picture = pictureUrl;
      }
      userRecord.updatedAt = nowIso;
      userRecord.lastLoginAt = nowIso;
      userRecord.emailVerified = true;
      userRecord.emailVerification = createEmptyEmailVerificationState();
      userRecord.passwordReset = createEmptyPasswordResetState();
    }

    if (createdNewGoogleUser) {
      try {
        await appendRegisteredAccountAuditEntry({
          userRecord,
          req,
          source: "signup-google",
        });
      } catch (auditError) {
        reportServerError("registered-account-audit-write", auditError, {
          requestId: req.requestId,
          method: req.method,
          path: req.originalUrl,
        });
      }
    }

    markAuthStoreDirty();
    const sessionToken = createSessionForUser(userRecord.id, req);
    setAuthSessionCookie(req, res, sessionToken);
    return res.redirect(302, sanitizeReturnToPath(stateData.returnTo));
  } catch (error) {
    reportServerError("auth-google-callback", error, {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
    });
    return res.redirect(302, buildAuthErrorRedirectPath("google_callback"));
  }
});

app.get("/api/auth/verify-email", authGoogleLimiter, (req, res) => {
  const rawToken = String(req.query?.token || "").trim();
  const returnTo = sanitizeReturnToPath(req.query?.returnTo);
  const hintEmail = normalizeEmail(req.query?.email);

  if (!rawToken || rawToken.length < 20) {
    return res.redirect(
      302,
      buildAuthErrorRedirectPath("email_verify_invalid", returnTo, {
        authEmail: hintEmail,
        openAuth: "1",
        authPanel: "login",
      })
    );
  }

  const tokenHash = hashEmailVerificationToken(rawToken);
  const userRecord = Object.values(authStore.users).find((record) => {
    if (!record || typeof record !== "object") {
      return false;
    }
    const verificationState = normalizeEmailVerificationState(record.emailVerification);
    return verificationState.tokenHash === tokenHash;
  });

  if (!userRecord) {
    const hintedUserId = hintEmail ? authStore.emailIndex[hintEmail] : "";
    const hintedUser = hintedUserId ? authStore.users[hintedUserId] : null;
    if (hintedUser && hintedUser.emailVerified === true) {
      return res.redirect(
        302,
        buildAuthErrorRedirectPath("email_verified", returnTo, {
          authEmail: normalizeEmail(hintedUser.email),
          openAuth: "1",
          authPanel: "login",
        })
      );
    }
    // Token was already consumed or no longer associated; keep UX on the login success path.
    return res.redirect(
      302,
      buildAuthErrorRedirectPath("email_verified", returnTo, {
        authEmail: hintEmail,
        openAuth: "1",
        authPanel: "login",
      })
    );
  }

  if (userRecord.emailVerified === true) {
    return res.redirect(
      302,
      buildAuthErrorRedirectPath("email_verified", returnTo, {
        authEmail: normalizeEmail(userRecord.email),
        openAuth: "1",
        authPanel: "login",
      })
    );
  }

  const verificationState = normalizeEmailVerificationState(userRecord.emailVerification);
  const expiresAtMs = Date.parse(String(verificationState.expiresAt || ""));
  if (!Number.isFinite(expiresAtMs) || expiresAtMs < Date.now()) {
    return res.redirect(
      302,
      buildAuthErrorRedirectPath("email_verify_expired", returnTo, {
        authEmail: normalizeEmail(userRecord.email) || hintEmail,
        openAuth: "1",
        authPanel: "login",
      })
    );
  }

  userRecord.emailVerified = true;
  userRecord.emailVerification = {
    tokenHash: verificationState.tokenHash,
    expiresAt: null,
    sentAt: verificationState.sentAt,
  };
  userRecord.updatedAt = new Date().toISOString();
  markAuthStoreDirty();
  return res.redirect(
    302,
    buildAuthErrorRedirectPath("email_verified", returnTo, {
      authEmail: normalizeEmail(userRecord.email),
      openAuth: "1",
      authPanel: "login",
    })
  );
});

app.get("/api/auth/password/reset", authVerifyLimiter, (req, res) => {
  const rawToken = String(req.query?.token || "").trim();
  const returnTo = sanitizeReturnToPath(req.query?.returnTo);

  if (!rawToken || rawToken.length < 20) {
    return res.redirect(302, buildAuthErrorRedirectPath("password_reset_invalid", returnTo));
  }

  const tokenHash = hashPasswordResetToken(rawToken);
  const userRecord = Object.values(authStore.users).find((record) => {
    if (!record || typeof record !== "object") {
      return false;
    }
    const resetState = normalizePasswordResetState(record.passwordReset);
    return resetState.tokenHash === tokenHash;
  });
  if (!userRecord) {
    return res.redirect(302, buildAuthErrorRedirectPath("password_reset_invalid", returnTo));
  }

  const authProvider = String(userRecord?.data?.profile?.authProvider || "email").trim().toLowerCase() || "email";
  if (authProvider === "google") {
    return res.redirect(302, buildAuthErrorRedirectPath("password_reset_invalid", returnTo));
  }

  const resetState = normalizePasswordResetState(userRecord.passwordReset);
  const expiresAtMs = Date.parse(String(resetState.expiresAt || ""));
  if (!Number.isFinite(expiresAtMs) || expiresAtMs < Date.now()) {
    return res.redirect(302, buildAuthErrorRedirectPath("password_reset_expired", returnTo));
  }

  return res.redirect(
    302,
    buildAuthErrorRedirectPath("password_reset_ready", returnTo, {
      passwordResetToken: rawToken,
    })
  );
});

app.post("/api/auth/password/forgot", authVerifyLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const returnTo = sanitizeReturnToPath(req.body?.returnTo);
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Enter a valid email first" });
  }
  if (
    rejectBlockedAccess({
      req,
      res,
      email,
      context: "auth-password-forgot",
    })
  ) {
    return;
  }
  if (!hasAnyEmailDeliveryConfig()) {
    return res.status(503).json({ error: "Email verification is not configured yet" });
  }

  const userId = authStore.emailIndex[email];
  const userRecord = userId ? authStore.users[userId] : null;
  if (
    userRecord &&
    rejectBlockedAccess({
      req,
      res,
      email,
      userId: userRecord.id,
      context: "auth-password-forgot-user",
    })
  ) {
    return;
  }

  if (!userRecord) {
    return res.json({
      ok: true,
      message: "If an email-password account exists for this email, a reset link will been sent.",
    });
  }

  const authProvider = String(userRecord?.data?.profile?.authProvider || "email").trim().toLowerCase() || "email";
  if (authProvider === "google") {
    return res.json({
      ok: true,
      message: "If an email-password account exists for this email, a reset link will been sent.",
    });
  }

  try {
    const resetChallenge = createPasswordResetChallenge();
    const delivery = await sendPasswordResetEmail({
      req,
      email: userRecord.email,
      displayName: userRecord.displayName,
      rawToken: resetChallenge.rawToken,
      returnTo,
    });
    if (!delivery.ok) {
      const deliveryError = String(delivery.error || "").trim();
      void appendSecurityEvent({
        type: "auth-password-reset-email-failed",
        req,
        email: userRecord.email,
        userId: userRecord.id,
        reason: "Password reset email delivery failed",
        details: {
          deliveryError: deliveryError.slice(0, 240),
        },
      });
      maybeAlertVerificationEmailDeliveryFailure({
        req,
        email: userRecord.email,
        phase: "password-reset",
        deliveryError,
      });
      const loweredDeliveryError = deliveryError.toLowerCase();
      if (loweredDeliveryError.includes("testing emails") || loweredDeliveryError.includes("verify a domain")) {
        return res.status(502).json({
          error:
            "Email provider is in testing mode. Verify a domain in Resend and use AUTH_FROM with that domain.",
        });
      }
      return res.status(502).json({
        error: "Could not send password reset email. Check mail provider config and try again.",
      });
    }

    userRecord.passwordReset = {
      tokenHash: resetChallenge.tokenHash,
      expiresAt: resetChallenge.expiresAt,
      sentAt: resetChallenge.sentAt,
    };
    userRecord.updatedAt = new Date().toISOString();
    markAuthStoreDirty();
    void appendSecurityEvent({
      type: "auth-password-reset-requested",
      req,
      email: userRecord.email,
      userId: userRecord.id,
      reason: "Password reset email sent",
    });
    return res.json({
      ok: true,
      message: "If an email-password account exists for this email, a reset link will been sent.",
    });
  } catch (error) {
    reportServerError("auth-password-forgot", error, {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
    });
    return res.status(500).json({ error: "Failed to process password reset request" });
  }
});

app.post("/api/auth/password/reset", authVerifyLimiter, async (req, res) => {
  const rawToken = String(req.body?.token || "").trim();
  const newPassword = String(req.body?.newPassword || "");
  const confirmPassword = String(req.body?.confirmPassword || "");
  if (!rawToken || rawToken.length < 20) {
    return res.status(400).json({ error: "Reset link is invalid. Request a new one." });
  }
  if (!isValidPassword(newPassword)) {
    return res.status(400).json({ error: "Password must be 8-128 characters" });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "New password and confirm password do not match" });
  }

  const tokenHash = hashPasswordResetToken(rawToken);
  const userRecord = Object.values(authStore.users).find((record) => {
    if (!record || typeof record !== "object") {
      return false;
    }
    const resetState = normalizePasswordResetState(record.passwordReset);
    return resetState.tokenHash === tokenHash;
  });
  if (!userRecord) {
    return res.status(400).json({ error: "Reset link is invalid. Request a new one." });
  }

  const authProvider = String(userRecord?.data?.profile?.authProvider || "email").trim().toLowerCase() || "email";
  if (authProvider === "google") {
    return res.status(400).json({ error: "Google accounts must use Google sign-in." });
  }

  const resetState = normalizePasswordResetState(userRecord.passwordReset);
  const expiresAtMs = Date.parse(String(resetState.expiresAt || ""));
  if (!Number.isFinite(expiresAtMs) || expiresAtMs < Date.now()) {
    return res.status(400).json({ error: "Reset link expired. Request a new one." });
  }

  try {
    const passwordRecord = await buildPasswordRecord(newPassword);
    userRecord.password = passwordRecord;
    userRecord.passwordReset = createEmptyPasswordResetState();
    userRecord.updatedAt = new Date().toISOString();
    removeAllSessionsForUser(userRecord.id);
    markAuthStoreDirty();
    void appendSecurityEvent({
      type: "auth-password-reset-success",
      req,
      email: userRecord.email,
      userId: userRecord.id,
      reason: "Password reset completed",
    });
    clearAuthSessionCookie(req, res);
    return res.json({
      ok: true,
      message: "Password reset complete. You can log in now.",
      email: userRecord.email,
    });
  } catch (error) {
    reportServerError("auth-password-reset", error, {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
    });
    return res.status(500).json({ error: "Failed to reset password" });
  }
});

app.post("/api/auth/password/change", authSessionLimiter, requireAuthenticatedUser, async (req, res) => {
  const userRecord = req.authUser;
  const authProvider = String(userRecord?.data?.profile?.authProvider || "email").trim().toLowerCase() || "email";
  if (authProvider === "google") {
    return res.status(400).json({ error: "Google accounts do not use password reset here." });
  }

  const currentPassword = String(req.body?.currentPassword || "");
  const newPassword = String(req.body?.newPassword || "");
  const confirmPassword = String(req.body?.confirmPassword || "");
  if (!currentPassword) {
    return res.status(400).json({ error: "Current password is required" });
  }
  if (!isValidPassword(newPassword)) {
    return res.status(400).json({ error: "Password must be 8-128 characters" });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "New password and confirm password do not match" });
  }

  try {
    const validCurrentPassword = await verifyPasswordAgainstRecord(currentPassword, userRecord.password);
    if (!validCurrentPassword) {
      void appendSecurityEvent({
        type: "auth-password-change-failed",
        req,
        email: userRecord.email,
        userId: userRecord.id,
        reason: "Current password mismatch",
      });
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const passwordRecord = await buildPasswordRecord(newPassword);
    userRecord.password = passwordRecord;
    userRecord.passwordReset = createEmptyPasswordResetState();
    userRecord.updatedAt = new Date().toISOString();
    removeAllSessionsForUser(userRecord.id);
    const sessionToken = createSessionForUser(userRecord.id, req);
    setAuthSessionCookie(req, res, sessionToken);
    markAuthStoreDirty();
    void appendSecurityEvent({
      type: "auth-password-change-success",
      req,
      email: userRecord.email,
      userId: userRecord.id,
      reason: "Password updated from manage account",
    });
    return res.json({
      ok: true,
      message: "Password updated.",
    });
  } catch (error) {
    reportServerError("auth-password-change", error, {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
    });
    return res.status(500).json({ error: "Failed to update password" });
  }
});

app.post("/api/auth/signup", authSignupLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");
  const displayNameInput = String(req.body?.displayName || "").trim();
  const displayName = sanitizeDisplayName(displayNameInput, email);
  const baseLanguage = String(req.body?.baseLanguage || "").trim().slice(0, 40);
  const returnTo = sanitizeReturnToPath(req.body?.returnTo);

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: "Password must be 8-128 characters" });
  }
  if (!displayNameInput) {
    return res.status(400).json({ error: "Username is required" });
  }
  if (!hasAnyEmailDeliveryConfig()) {
    return res.status(503).json({ error: "Email verification is not configured yet" });
  }
  if (
    rejectBlockedAccess({
      req,
      res,
      email,
      context: "auth-signup",
    })
  ) {
    return;
  }

  try {
    const existingUserId = authStore.emailIndex[email];
    const existingUser = existingUserId ? authStore.users[existingUserId] : null;
    if (existingUser) {
      if (existingUser.emailVerified !== true) {
        return res.status(409).json({
          error: "Account exists but is not verified. Use resend verification below.",
          verificationRequired: true,
          resendEligible: true,
        });
      }
      return res.status(409).json({ error: "Account already exists" });
    }

    const verificationChallenge = createEmailVerificationChallenge();
    const passwordRecord = await buildPasswordRecord(password);
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();
    const pendingUserRecord = {
      id: userId,
      email,
      displayName,
      password: passwordRecord,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
      emailVerified: false,
      emailVerification: {
        tokenHash: verificationChallenge.tokenHash,
        expiresAt: verificationChallenge.expiresAt,
        sentAt: verificationChallenge.sentAt,
      },
      passwordReset: createEmptyPasswordResetState(),
      data: {
        settings: {
          baseLanguage,
        },
        profile: {
          authProvider: "email",
        },
      },
      progress: createDefaultProgress(),
    };
    authStore.users[userId] = pendingUserRecord;
    authStore.emailIndex[email] = userId;
    const delivery = await sendAccountVerificationEmail({
      req,
      email,
      displayName,
      rawToken: verificationChallenge.rawToken,
      returnTo,
    });
    if (!delivery.ok) {
      delete authStore.users[userId];
      delete authStore.emailIndex[email];
      const deliveryError = String(delivery.error || "").trim();
      void appendSecurityEvent({
        type: "auth-verification-email-failed",
        req,
        email,
        userId,
        reason: "Signup verification email delivery failed",
        details: {
          phase: "signup",
          deliveryError: deliveryError.slice(0, 240),
        },
      });
      maybeAlertVerificationEmailDeliveryFailure({
        req,
        email,
        phase: "signup",
        deliveryError,
      });
      const loweredDeliveryError = deliveryError.toLowerCase();
      if (loweredDeliveryError.includes("testing emails") || loweredDeliveryError.includes("verify a domain")) {
        return res.status(502).json({
          error:
            "Email provider is in testing mode. Verify a domain in Resend and use AUTH_FROM with that domain.",
        });
      }
      return res.status(502).json({
        error: "Could not send verification email. Check mail provider config and try again.",
      });
    }

    try {
      await appendRegisteredAccountAuditEntry({
        userRecord: pendingUserRecord,
        req,
        source: "signup-email",
      });
    } catch (auditError) {
      reportServerError("registered-account-audit-write", auditError, {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
      });
    }

    markAuthStoreDirty();

    return res.status(201).json({
      ok: true,
      verificationRequired: true,
      message: "Account created. Check your email and verify before logging in.",
      email,
    });
  } catch (error) {
    if (authStore.emailIndex[email]) {
      const userId = authStore.emailIndex[email];
      const createdUser = authStore.users[userId];
      if (createdUser && createdUser.email === email && createdUser.emailVerified !== true) {
        delete authStore.users[userId];
        delete authStore.emailIndex[email];
      }
    }
    reportServerError("auth-signup", error, {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
    });
    return res.status(500).json({ error: "Failed to create account" });
  }
});

app.post("/api/auth/verification/resend", authVerifyLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const returnTo = sanitizeReturnToPath(req.body?.returnTo);
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Enter a valid email first" });
  }
  if (
    rejectBlockedAccess({
      req,
      res,
      email,
      context: "auth-verification-resend",
    })
  ) {
    return;
  }
  if (!hasAnyEmailDeliveryConfig()) {
    return res.status(503).json({ error: "Email verification is not configured yet" });
  }

  const userId = authStore.emailIndex[email];
  const userRecord = userId ? authStore.users[userId] : null;
  if (
    userRecord &&
    rejectBlockedAccess({
      req,
      res,
      email,
      userId: userRecord.id,
      context: "auth-verification-resend-user",
    })
  ) {
    return;
  }
  if (!userRecord) {
    return res.json({
      ok: true,
      message: "If an account exists for this email, a verification link has been sent.",
    });
  }
  if (userRecord.emailVerified === true) {
    return res.json({
      ok: true,
      message: "Email is already verified. You can log in now.",
    });
  }

  try {
    const verificationChallenge = createEmailVerificationChallenge();
    const delivery = await sendAccountVerificationEmail({
      req,
      email: userRecord.email,
      displayName: userRecord.displayName,
      rawToken: verificationChallenge.rawToken,
      returnTo,
    });
    if (!delivery.ok) {
      const deliveryError = String(delivery.error || "").trim();
      void appendSecurityEvent({
        type: "auth-verification-email-failed",
        req,
        email: userRecord.email,
        userId: userRecord.id,
        reason: "Resend verification email delivery failed",
        details: {
          phase: "resend",
          deliveryError: deliveryError.slice(0, 240),
        },
      });
      maybeAlertVerificationEmailDeliveryFailure({
        req,
        email: userRecord.email,
        phase: "resend",
        deliveryError,
      });
      const loweredDeliveryError = deliveryError.toLowerCase();
      if (loweredDeliveryError.includes("testing emails") || loweredDeliveryError.includes("verify a domain")) {
        return res.status(502).json({
          error:
            "Email provider is in testing mode. Verify a domain in Resend and use AUTH_FROM with that domain.",
        });
      }
      return res.status(502).json({
        error: "Could not resend verification email. Check mail provider config and try again.",
      });
    }

    userRecord.emailVerified = false;
    userRecord.emailVerification = {
      tokenHash: verificationChallenge.tokenHash,
      expiresAt: verificationChallenge.expiresAt,
      sentAt: verificationChallenge.sentAt,
    };
    userRecord.updatedAt = new Date().toISOString();
    markAuthStoreDirty();
    return res.json({
      ok: true,
      message: "Verification email sent. Check your inbox.",
    });
  } catch (error) {
    reportServerError("auth-resend-verification", error, {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
    });
    return res.status(500).json({ error: "Failed to resend verification email" });
  }
});

app.post("/api/auth/login", authLoginLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");
  if (!isValidEmail(email) || !isValidPassword(password)) {
    void appendSecurityEvent({
      type: "auth-login-failed",
      req,
      email,
      reason: "Invalid login payload",
    });
    maybeAlertAuthLoginFailureSpike({
      req,
      email,
      reason: "Invalid login payload",
    });
    return res.status(400).json({ error: "Invalid email or password" });
  }
  if (
    rejectBlockedAccess({
      req,
      res,
      email,
      context: "auth-login",
    })
  ) {
    return;
  }

  const userId = authStore.emailIndex[email];
  const userRecord = userId ? authStore.users[userId] : null;
  if (!userRecord) {
    void appendSecurityEvent({
      type: "auth-login-failed",
      req,
      email,
      reason: "Unknown email",
    });
    maybeAlertAuthLoginFailureSpike({
      req,
      email,
      reason: "Unknown email",
    });
    return res.status(401).json({ error: "Invalid email or password" });
  }
  if (
    rejectBlockedAccess({
      req,
      res,
      email,
      userId: userRecord.id,
      context: "auth-login-user",
    })
  ) {
    return;
  }

  try {
    const validPassword = await verifyPasswordAgainstRecord(password, userRecord.password);
    if (!validPassword) {
      void appendSecurityEvent({
        type: "auth-login-failed",
        req,
        email,
        userId: userRecord.id,
        reason: "Wrong password",
      });
      maybeAlertAuthLoginFailureSpike({
        req,
        email,
        userId: userRecord.id,
        reason: "Wrong password",
      });
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (userRecord.emailVerified !== true) {
      return res.status(403).json({
        error: "Please verify your email first. Check your inbox for the verification link.",
        verificationRequired: true,
      });
    }

    userRecord.lastLoginAt = new Date().toISOString();
    userRecord.updatedAt = userRecord.lastLoginAt;
    markAuthStoreDirty();
    await attemptStripePremiumRecoveryIfNeeded(userRecord, "auth-login");
    const sessionToken = createSessionForUser(userRecord.id, req);
    setAuthSessionCookie(req, res, sessionToken);

    return res.json({
      ok: true,
      user: toPublicUser(userRecord),
      data: cloneForResponse(normalizeUserData(userRecord.data)),
      progress: cloneForResponse(normalizeProgress(userRecord.progress)),
    });
  } catch (error) {
    reportServerError("auth-login", error, {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
    });
    return res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/auth/logout", authSessionLimiter, (req, res) => {
  if (req.auth?.sessionHash) {
    removeSessionByHash(req.auth.sessionHash);
  }
  clearAuthSessionCookie(req, res);
  return res.json({ ok: true });
});

app.get("/api/auth/me", authSessionLimiter, async (req, res) => {
  const userRecord = req.authUser;
  if (!userRecord) {
    return res.json({
      ok: true,
      authenticated: false,
      user: null,
      data: null,
      progress: null,
    });
  }
  await attemptStripePremiumRecoveryIfNeeded(userRecord, "auth-me");
  return res.json({
    ok: true,
    authenticated: true,
    user: toPublicUser(userRecord),
    data: cloneForResponse(normalizeUserData(userRecord.data)),
    progress: cloneForResponse(normalizeProgress(userRecord.progress)),
  });
});

app.delete("/api/auth/account", authSessionLimiter, requireAuthenticatedUser, async (req, res) => {
  const userRecord = req.authUser;
  try {
    try {
      await appendDeletedAccountAuditEntry({
        userRecord,
        req,
        source: "self-delete",
      });
    } catch (auditError) {
      reportServerError("deleted-account-audit-write", auditError, {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
      });
    }

    purgeUserFromAuthStore({
      userId: userRecord.id,
      email: userRecord.email,
    });
    void appendSecurityEvent({
      type: "account-deleted",
      req,
      email: userRecord.email,
      userId: userRecord.id,
      reason: "User deleted account",
    });
    clearAuthSessionCookie(req, res);
    return res.json({
      ok: true,
      message: "Account and data deleted permanently. You can sign up again with the same email immediately.",
    });
  } catch (error) {
    reportServerError("auth-delete-account", error, {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
    });
    return res.status(500).json({ error: "Failed to delete account" });
  }
});

app.get("/api/account/data", authSessionLimiter, requireAuthenticatedUser, (req, res) => {
  const userRecord = req.authUser;
  userRecord.data = normalizeUserData(userRecord.data);
  return res.json({
    ok: true,
    data: cloneForResponse(userRecord.data),
  });
});

app.put(
  "/api/account/data",
  accountMutationLimiter,
  requireAuthenticatedUser,
  (req, res) => {
    const incoming = req.body?.data;
    if (!isPlainObject(incoming)) {
      return res.status(400).json({ error: "data must be an object" });
    }
    let serialized = "";
    try {
      serialized = JSON.stringify(incoming);
    } catch {
      return res.status(400).json({ error: "data must be JSON-serializable" });
    }
    if (serialized.length > MAX_USER_DATA_SERIALIZED_CHARS) {
      return res.status(413).json({ error: "data payload too large" });
    }
    const normalizedIncomingData = normalizeUserData(incoming);
    const existingData = normalizeUserData(req.authUser.data);
    normalizedIncomingData.profile = isPlainObject(existingData.profile)
      ? cloneObjectSafely(existingData.profile, () => ({}), 20000)
      : {};
    req.authUser.data = normalizedIncomingData;
    req.authUser.updatedAt = new Date().toISOString();
    markAuthStoreDirty();
    return res.json({
      ok: true,
      data: cloneForResponse(req.authUser.data),
    });
  }
);

app.post(
  "/api/account/premium/upgrade",
  accountMutationLimiter,
  requireAuthenticatedUser,
  (req, res) => {
    const allowSelfPremiumUpgrade =
      String(process.env.ALLOW_SELF_PREMIUM_UPGRADE || "")
        .trim()
        .toLowerCase() === "true";
    if (!allowSelfPremiumUpgrade) {
      return res.status(403).json({
        error: "Self premium upgrade is disabled. Use verified billing webhook activation.",
      });
    }

    const userRecord = req.authUser;
    userRecord.data = normalizeUserData(userRecord.data);
    if (!isPlainObject(userRecord.data.profile)) {
      userRecord.data.profile = {};
    }
    userRecord.data.profile.isPremium = true;
    userRecord.data.profile.premium = true;
    userRecord.data.profile.plan = "premium";
    userRecord.data.profile.tier = "premium";
    userRecord.data.profile.membership = "premium";
    if (!userRecord.data.profile.premiumActivatedAt) {
      userRecord.data.profile.premiumActivatedAt = new Date().toISOString();
    }

    userRecord.updatedAt = new Date().toISOString();
    markAuthStoreDirty();

    return res.json({
      ok: true,
      user: toPublicUser(userRecord),
      data: cloneForResponse(userRecord.data),
      progress: cloneForResponse(normalizeProgress(userRecord.progress)),
    });
  }
);

app.post(
  "/api/account/premium/downgrade",
  accountMutationLimiter,
  requireAuthenticatedUser,
  (req, res) => {
    const userRecord = req.authUser;
    userRecord.data = normalizeUserData(userRecord.data);
    if (!isPlainObject(userRecord.data.profile)) {
      userRecord.data.profile = {};
    }

    userRecord.data.profile.isPremium = false;
    userRecord.data.profile.premium = false;
    userRecord.data.profile.plan = "free";
    userRecord.data.profile.tier = "free";
    userRecord.data.profile.membership = "free";
    userRecord.data.profile.premiumDeactivatedAt = new Date().toISOString();

    userRecord.updatedAt = new Date().toISOString();
    markAuthStoreDirty();

    return res.json({
      ok: true,
      user: toPublicUser(userRecord),
      data: cloneForResponse(userRecord.data),
      progress: cloneForResponse(normalizeProgress(userRecord.progress)),
    });
  }
);

/* --------------------------------------------------------------------------
  ROUTE: BILLING WEBHOOKS (STRIPE + KO-FI)
  -------------------------------------------------------------------------- */
const pickFirstNonEmptyString = (...values) => {
  for (const value of values) {
    const normalized = String(value || "").trim();
    if (normalized) {
      return normalized;
    }
  }
  return "";
};

const parseKofiWebhookPayload = (requestBody) => {
  const candidate = isPlainObject(requestBody) ? requestBody : {};
  const payloadCandidates = [
    candidate.data,
    candidate.payload,
    candidate,
  ];
  for (const item of payloadCandidates) {
    if (isPlainObject(item)) {
      return item;
    }
    const raw = String(item || "").trim();
    if (!raw) {
      continue;
    }
    try {
      const parsed = JSON.parse(raw);
      if (isPlainObject(parsed)) {
        return parsed;
      }
    } catch {}
  }
  return null;
};

const evaluateKofiWebhookPaymentAcceptance = ({ eventType = "", paymentStatus = "", amount = "" } = {}) => {
  const normalizedEventType = String(eventType || "").trim().toLowerCase();
  const normalizedStatus = String(paymentStatus || "").trim().toLowerCase();
  const amountValue = Number.parseFloat(String(amount || "").replace(/[^0-9.-]/g, ""));

  const downgradeKeywords = ["refund", "refunded", "cancel", "canceled", "cancelled", "chargeback"];
  if (downgradeKeywords.some((flag) => normalizedEventType.includes(flag) || normalizedStatus.includes(flag))) {
    return {
      accepted: false,
      action: "downgrade",
      reason: "cancellation-or-refund",
    };
  }

  if (normalizedEventType.includes("failed") || normalizedStatus.includes("failed")) {
    return {
      accepted: false,
      action: "ignore",
      reason: "failed-payment",
    };
  }

  const acceptedStatusKeywords = ["completed", "complete", "paid", "success", "succeeded"];
  if (!acceptedStatusKeywords.some((flag) => normalizedStatus.includes(flag))) {
    return {
      accepted: false,
      action: "ignore",
      reason: "unconfirmed-status",
    };
  }

  const acceptedEventKeywords = ["payment", "subscription", "membership", "donation", "shop_order", "sale"];
  if (normalizedEventType && !acceptedEventKeywords.some((flag) => normalizedEventType.includes(flag))) {
    return {
      accepted: false,
      action: "ignore",
      reason: "unconfirmed-event-type",
    };
  }

  if (!Number.isFinite(amountValue) || amountValue <= 0) {
    return {
      accepted: false,
      action: "ignore",
      reason: "invalid-amount",
    };
  }

  return {
    accepted: true,
    action: "upgrade",
    reason: "confirmed-paid-event",
  };
};

const applyPremiumProfileToUserRecord = (
  userRecord,
  {
    provider = "ko-fi",
    source = "webhook",
    eventId = "",
    eventType = "",
    amount = "",
    currency = "",
    stripeCustomerId = "",
    stripeSubscriptionId = "",
    premiumAccessUntil = "",
    cancelAtPeriodEnd = false,
    subscriptionStatus = "",
  } = {}
) => {
  if (!userRecord || !isPlainObject(userRecord)) {
    return {
      changed: false,
      alreadyPremium: false,
      alreadyProcessed: false,
    };
  }

  userRecord.data = normalizeUserData(userRecord.data);
  if (!isPlainObject(userRecord.data.profile)) {
    userRecord.data.profile = {};
  }

  const profile = userRecord.data.profile;
  const alreadyPremium = userHasPremiumAccessForProgress(userRecord);
  const normalizedEventId = String(eventId || "").trim().slice(0, 120);
  const alreadyProcessed =
    Boolean(normalizedEventId) &&
    String(profile.premiumLastEventId || "").trim() === normalizedEventId;
  if (alreadyPremium && alreadyProcessed) {
    return {
      changed: false,
      alreadyPremium,
      alreadyProcessed,
    };
  }

  const nowIso = new Date().toISOString();
  const beforeSnapshot = {
    isPremium: alreadyPremium,
    planTier: resolvePremiumSnapshotFromProfile(profile).planTier,
    premiumAccessUntil: computePremiumAccessUntilFromProfile(profile),
    cancelAtPeriodEnd: profile.premiumCancelAtPeriodEnd === true,
    subscriptionStatus: String(profile.premiumStripeSubscriptionStatus || "").trim().toLowerCase() || null,
  };
  profile.isPremium = true;
  profile.premium = true;
  profile.plan = "premium";
  profile.tier = "premium";
  profile.membership = "premium";
  if (!profile.premiumActivatedAt) {
    profile.premiumActivatedAt = nowIso;
  }
  profile.premiumLastSource = String(source || "").trim().slice(0, 60) || "webhook";
  profile.premiumProvider = String(provider || "").trim().slice(0, 40) || "ko-fi";
  profile.premiumLastEventAt = nowIso;
  profile.premiumCancelAtPeriodEnd = false;
  delete profile.premiumCancelRequestedAt;
  delete profile.premiumScheduledEndAt;
  if (normalizedEventId) {
    profile.premiumLastEventId = normalizedEventId;
  }
  const normalizedEventType = String(eventType || "").trim().slice(0, 80);
  if (normalizedEventType) {
    profile.premiumLastEventType = normalizedEventType;
  }
  const normalizedAmount = String(amount || "").trim().slice(0, 40);
  if (normalizedAmount) {
    profile.premiumLastAmount = normalizedAmount;
  }
  const normalizedCurrency = String(currency || "").trim().slice(0, 12).toUpperCase();
  if (normalizedCurrency) {
    profile.premiumLastCurrency = normalizedCurrency;
  }
  const normalizedStripeCustomerId = String(stripeCustomerId || "").trim().slice(0, 120);
  if (normalizedStripeCustomerId) {
    profile.premiumStripeCustomerId = normalizedStripeCustomerId;
  }
  const normalizedStripeSubscriptionId = String(stripeSubscriptionId || "").trim().slice(0, 120);
  if (normalizedStripeSubscriptionId) {
    profile.premiumStripeSubscriptionId = normalizedStripeSubscriptionId;
  }
  const normalizedAccessUntil = String(premiumAccessUntil || "").trim();
  if (normalizedAccessUntil && Number.isFinite(Date.parse(normalizedAccessUntil))) {
    profile.premiumCurrentPeriodEnd = new Date(Date.parse(normalizedAccessUntil)).toISOString();
  }
  profile.premiumCancelAtPeriodEnd = cancelAtPeriodEnd === true;
  const normalizedSubscriptionStatus = String(subscriptionStatus || "").trim().toLowerCase().slice(0, 60);
  if (normalizedSubscriptionStatus) {
    profile.premiumStripeSubscriptionStatus = normalizedSubscriptionStatus;
  }
  profile.premiumLastSyncedAt = nowIso;

  const afterSnapshot = {
    isPremium: true,
    planTier: "premium",
    premiumAccessUntil: computePremiumAccessUntilFromProfile(profile),
    cancelAtPeriodEnd: profile.premiumCancelAtPeriodEnd === true,
    subscriptionStatus: String(profile.premiumStripeSubscriptionStatus || "").trim().toLowerCase() || null,
  };

  userRecord.updatedAt = nowIso;
  markAuthStoreDirty();
  void appendBillingEntitlementAudit({
    userRecord,
    action: "upgrade",
    reason: `Premium upgraded (${String(source || "webhook").slice(0, 60)})`,
    before: beforeSnapshot,
    after: afterSnapshot,
    details: {
      provider: String(provider || "").slice(0, 40),
      eventId: normalizedEventId,
      eventType: normalizedEventType,
    },
  });

  return {
    changed: true,
    alreadyPremium,
    alreadyProcessed,
  };
};

const applyPremiumDowngradeToUserRecord = (
  userRecord,
  {
    provider = "ko-fi",
    source = "webhook",
    eventId = "",
    eventType = "",
  } = {}
) => {
  if (!userRecord || !isPlainObject(userRecord)) {
    return {
      changed: false,
      alreadyFree: true,
      alreadyProcessed: false,
    };
  }

  userRecord.data = normalizeUserData(userRecord.data);
  if (!isPlainObject(userRecord.data.profile)) {
    userRecord.data.profile = {};
  }

  const profile = userRecord.data.profile;
  const isPremium = userHasPremiumAccessForProgress(userRecord);
  const normalizedEventId = String(eventId || "").trim().slice(0, 120);
  const alreadyProcessed =
    Boolean(normalizedEventId) &&
    String(profile.premiumLastDowngradeEventId || "").trim() === normalizedEventId;
  if (!isPremium && alreadyProcessed) {
    return {
      changed: false,
      alreadyFree: true,
      alreadyProcessed,
    };
  }

  const nowIso = new Date().toISOString();
  const beforeSnapshot = {
    isPremium,
    planTier: resolvePremiumSnapshotFromProfile(profile).planTier,
    premiumAccessUntil: computePremiumAccessUntilFromProfile(profile),
    cancelAtPeriodEnd: profile.premiumCancelAtPeriodEnd === true,
    subscriptionStatus: String(profile.premiumStripeSubscriptionStatus || "").trim().toLowerCase() || null,
  };
  profile.isPremium = false;
  profile.premium = false;
  profile.plan = "free";
  profile.tier = "free";
  profile.membership = "free";
  profile.premiumLastSource = String(source || "").trim().slice(0, 60) || "webhook";
  profile.premiumProvider = String(provider || "").trim().slice(0, 40) || "ko-fi";
  profile.premiumLastEventAt = nowIso;
  profile.premiumDeactivatedAt = nowIso;
  profile.premiumCancelAtPeriodEnd = false;
  delete profile.premiumCancelRequestedAt;
  delete profile.premiumScheduledEndAt;
  delete profile.premiumCurrentPeriodEnd;
  delete profile.premiumStripeSubscriptionStatus;
  delete profile.premiumStripeSubscriptionId;
  if (normalizedEventId) {
    profile.premiumLastDowngradeEventId = normalizedEventId;
  }
  const normalizedEventType = String(eventType || "").trim().slice(0, 80);
  if (normalizedEventType) {
    profile.premiumLastEventType = normalizedEventType;
  }
  profile.premiumLastSyncedAt = nowIso;

  const afterSnapshot = {
    isPremium: false,
    planTier: "free",
    premiumAccessUntil: computePremiumAccessUntilFromProfile(profile),
    cancelAtPeriodEnd: false,
    subscriptionStatus: null,
  };

  userRecord.updatedAt = nowIso;
  markAuthStoreDirty();
  void appendBillingEntitlementAudit({
    userRecord,
    action: "downgrade",
    reason: `Premium downgraded (${String(source || "webhook").slice(0, 60)})`,
    before: beforeSnapshot,
    after: afterSnapshot,
    details: {
      provider: String(provider || "").slice(0, 40),
      eventId: normalizedEventId,
      eventType: normalizedEventType,
    },
  });

  return {
    changed: isPremium,
    alreadyFree: !isPremium,
    alreadyProcessed,
  };
};

const hasStripePremiumAccessFromStatus = (status = "") => {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  if (!normalizedStatus) {
    return false;
  }
  return ["active", "trialing", "past_due"].includes(normalizedStatus);
};

const shouldStripeDowngradeFromStatus = (status = "") => {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  if (!normalizedStatus) {
    return false;
  }
  return ["canceled", "cancelled", "unpaid", "incomplete_expired"].includes(normalizedStatus);
};

const extractStripeIdentifiersFromObject = (stripeObject = {}) => {
  const objectPayload = isPlainObject(stripeObject) ? stripeObject : {};
  const customerRef = objectPayload.customer;
  const subscriptionRef = objectPayload.subscription;
  const customerId = (() => {
    if (typeof customerRef === "string") {
      return customerRef.trim();
    }
    if (isPlainObject(customerRef)) {
      return String(customerRef.id || "").trim();
    }
    return "";
  })();
  const subscriptionId = (() => {
    if (typeof subscriptionRef === "string") {
      return subscriptionRef.trim();
    }
    if (isPlainObject(subscriptionRef)) {
      return String(subscriptionRef.id || "").trim();
    }
    if (objectPayload.object === "subscription") {
      return String(objectPayload.id || "").trim();
    }
    return "";
  })();
  const currentPeriodEndEpoch = Number(objectPayload.current_period_end || 0);
  const premiumAccessUntil =
    Number.isFinite(currentPeriodEndEpoch) && currentPeriodEndEpoch > 0
      ? new Date(currentPeriodEndEpoch * 1000).toISOString()
      : "";
  return {
    customerId: customerId.slice(0, 120),
    subscriptionId: subscriptionId.slice(0, 120),
    premiumAccessUntil,
    cancelAtPeriodEnd: objectPayload.cancel_at_period_end === true,
    subscriptionStatus: String(objectPayload.status || "").trim().toLowerCase().slice(0, 60),
  };
};

const resolveStripeWebhookUserRecord = async (stripe, stripeObject = {}) => {
  const objectPayload = isPlainObject(stripeObject) ? stripeObject : {};
  const metadata = isPlainObject(objectPayload.metadata) ? objectPayload.metadata : {};
  const customerDetails = isPlainObject(objectPayload.customer_details) ? objectPayload.customer_details : {};
  const customerRef = objectPayload.customer;

  const userIdCandidates = [
    metadata.cosmicaUserId,
    objectPayload.client_reference_id,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  for (const userId of userIdCandidates) {
    const userRecord = authStore.users[userId];
    if (userRecord) {
      return {
        userRecord,
        userId: String(userRecord.id || userId).trim(),
        email: normalizeEmail(userRecord.email),
      };
    }
  }

  const webhookIds = extractStripeIdentifiersFromObject(objectPayload);
  if (webhookIds.customerId) {
    for (const [candidateUserId, candidateRecord] of Object.entries(authStore.users || {})) {
      const storedCustomerId = String(candidateRecord?.data?.profile?.premiumStripeCustomerId || "")
        .trim()
        .slice(0, 120);
      if (storedCustomerId && storedCustomerId === webhookIds.customerId) {
        return {
          userRecord: candidateRecord,
          userId: String(candidateRecord.id || candidateUserId).trim(),
          email: normalizeEmail(candidateRecord.email),
        };
      }
    }
  }

  const customerId = (() => {
    if (typeof customerRef === "string") {
      return customerRef.trim();
    }
    if (isPlainObject(customerRef)) {
      return String(customerRef.id || "").trim();
    }
    return "";
  })();

  const emailCandidates = [
    metadata.cosmicaUserEmail,
    objectPayload.customer_email,
    customerDetails.email,
    objectPayload.receipt_email,
    isPlainObject(customerRef) ? customerRef.email : "",
  ];

  if (!emailCandidates.length && customerId && stripe && stripe.customers) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && !customer.deleted) {
        emailCandidates.push(customer.email);
      }
    } catch {}
  }

  for (const rawEmail of emailCandidates) {
    const email = normalizeEmail(rawEmail);
    if (!isValidEmail(email)) {
      continue;
    }
    const matchedUserId = String(authStore.emailIndex[email] || "").trim();
    const userRecord = matchedUserId ? authStore.users[matchedUserId] : null;
    if (userRecord) {
      return {
        userRecord,
        userId: String(userRecord.id || matchedUserId).trim(),
        email,
      };
    }
  }

  return {
    userRecord: null,
    userId: "",
    email: normalizeEmail(metadata.cosmicaUserEmail || objectPayload.customer_email || customerDetails.email),
  };
};

app.post(
  STRIPE_WEBHOOK_PATH,
  billingWebhookLimiter,
  express.raw({ type: "application/json", limit: "1mb" }),
  async (req, res) => {
    stripeWebhookHealthState.lastReceivedAt = new Date().toISOString();
    const configuredWebhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();
    if (!configuredWebhookSecret) {
      stripeWebhookHealthState.lastErrorAt = new Date().toISOString();
      stripeWebhookHealthState.recentFailureCount += 1;
      maybeAlertStripeWebhookIssue({
        req,
        reason: "Missing STRIPE_WEBHOOK_SECRET",
      });
      reportServerError("stripe-webhook-not-configured", new Error("Missing STRIPE_WEBHOOK_SECRET"), {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
      });
      return res.status(503).json({
        error: "Stripe webhook is not configured yet",
      });
    }

    const signature = String(req.get("stripe-signature") || "").trim();
    if (!signature) {
      stripeWebhookHealthState.lastRejectedAt = new Date().toISOString();
      stripeWebhookHealthState.recentFailureCount += 1;
      return res.status(400).json({ error: "Missing Stripe signature" });
    }

    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(String(req.body || ""), "utf8");
    if (!rawBody.length) {
      return res.status(400).json({ error: "Invalid Stripe webhook payload" });
    }

    let stripe = null;
    let event = null;
    try {
      stripe = getStripeClient();
      event = stripe.webhooks.constructEvent(rawBody, signature, configuredWebhookSecret);
    } catch (error) {
      stripeWebhookHealthState.lastRejectedAt = new Date().toISOString();
      stripeWebhookHealthState.recentFailureCount += 1;
      maybeAlertStripeWebhookIssue({
        req,
        reason: "Invalid Stripe signature",
        details: {
          error: String(error?.message || error).slice(0, 240),
        },
      });
      void appendSecurityEvent({
        type: "stripe-webhook-rejected",
        req,
        reason: "Invalid Stripe signature",
        details: {
          error: String(error?.message || error).slice(0, 240),
        },
      });
      return res.status(400).json({ error: "Invalid Stripe signature" });
    }

    const eventType = String(event?.type || "").trim().toLowerCase();
    const stripeObject = isPlainObject(event?.data?.object) ? event.data.object : {};
    const eventId = String(event?.id || "").trim().slice(0, 120);
    stripeWebhookHealthState.lastEventType = eventType;
    stripeWebhookHealthState.lastEventId = eventId;
    const stripeIds = extractStripeIdentifiersFromObject(stripeObject);

    if (
      eventType !== "checkout.session.completed" &&
      eventType !== "customer.subscription.updated" &&
      eventType !== "customer.subscription.deleted"
    ) {
      return res.json({
        ok: true,
        ignored: true,
        reason: "event-not-handled",
      });
    }

    const matched = await resolveStripeWebhookUserRecord(stripe, stripeObject);
    if (!matched.userRecord) {
      stripeWebhookHealthState.recentFailureCount += 1;
      void appendSecurityEvent({
        type: "stripe-webhook-unmatched",
        req,
        email: matched.email,
        reason: "No account matched Stripe webhook metadata/email",
        details: {
          eventId,
          eventType,
          customerId: String(stripeObject.customer || "").slice(0, 120),
        },
      });
      return res.status(202).json({
        ok: true,
        matched: false,
      });
    }

    if (eventType === "checkout.session.completed") {
      const premiumResult = applyPremiumProfileToUserRecord(matched.userRecord, {
        provider: "stripe",
        source: "stripe-webhook",
        eventId,
        eventType,
        amount: String(stripeObject.amount_total || "").trim().slice(0, 40),
        currency: String(stripeObject.currency || "").trim().slice(0, 12),
        stripeCustomerId: stripeIds.customerId,
        stripeSubscriptionId: stripeIds.subscriptionId,
        premiumAccessUntil: stripeIds.premiumAccessUntil,
        cancelAtPeriodEnd: stripeIds.cancelAtPeriodEnd,
        subscriptionStatus: stripeIds.subscriptionStatus,
      });
      stripeWebhookHealthState.lastProcessedAt = new Date().toISOString();
      stripeWebhookHealthState.recentSuccessCount += 1;

      void appendSecurityEvent({
        type: "stripe-webhook-processed",
        req,
        email: matched.email,
        userId: matched.userId,
        reason: premiumResult.changed ? "Premium activated from Stripe webhook" : "Stripe webhook idempotent replay",
        details: {
          eventId,
          eventType,
          action: "upgrade",
        },
      });

      return res.json({
        ok: true,
        matched: true,
        upgraded: premiumResult.changed,
        alreadyPremium: premiumResult.alreadyPremium,
        alreadyProcessed: premiumResult.alreadyProcessed,
      });
    }

    const subscriptionStatus = String(stripeObject.status || "").trim().toLowerCase();
    const isSubscriptionUpdate = eventType === "customer.subscription.updated";
    const isSubscriptionDeleted = eventType === "customer.subscription.deleted";
    const shouldKeepPremium = isSubscriptionUpdate && hasStripePremiumAccessFromStatus(subscriptionStatus);

    if (shouldKeepPremium) {
      const premiumResult = applyPremiumProfileToUserRecord(matched.userRecord, {
        provider: "stripe",
        source: "stripe-webhook",
        eventId,
        eventType,
        currency: String(stripeObject.currency || "").trim().slice(0, 12),
        stripeCustomerId: stripeIds.customerId,
        stripeSubscriptionId: stripeIds.subscriptionId,
        premiumAccessUntil: stripeIds.premiumAccessUntil,
        cancelAtPeriodEnd: stripeIds.cancelAtPeriodEnd,
        subscriptionStatus: stripeIds.subscriptionStatus || subscriptionStatus,
      });
      stripeWebhookHealthState.lastProcessedAt = new Date().toISOString();
      stripeWebhookHealthState.recentSuccessCount += 1;

      void appendSecurityEvent({
        type: "stripe-webhook-processed",
        req,
        email: matched.email,
        userId: matched.userId,
        reason: premiumResult.changed ? "Premium confirmed from Stripe subscription update" : "Stripe subscription update idempotent/no-op",
        details: {
          eventId,
          eventType,
          status: subscriptionStatus,
          action: "upgrade",
        },
      });

      return res.json({
        ok: true,
        matched: true,
        upgraded: premiumResult.changed,
        alreadyPremium: premiumResult.alreadyPremium,
        alreadyProcessed: premiumResult.alreadyProcessed,
      });
    }

    if (isSubscriptionUpdate && !shouldStripeDowngradeFromStatus(subscriptionStatus)) {
      void appendSecurityEvent({
        type: "stripe-webhook-processed",
        req,
        email: matched.email,
        userId: matched.userId,
        reason: "Stripe subscription update ignored for non-terminal status",
        details: {
          eventId,
          eventType,
          status: subscriptionStatus,
          action: "ignore",
        },
      });

      return res.json({
        ok: true,
        matched: true,
        ignored: true,
        reason: "non-terminal-subscription-status",
      });
    }

    if (!isSubscriptionDeleted && !isSubscriptionUpdate) {
      return res.json({
        ok: true,
        matched: true,
        ignored: true,
        reason: "event-not-applicable",
      });
    }

    const downgradeResult = applyPremiumDowngradeToUserRecord(matched.userRecord, {
      provider: "stripe",
      source: "stripe-webhook",
      eventId,
      eventType,
    });
    stripeWebhookHealthState.lastProcessedAt = new Date().toISOString();
    stripeWebhookHealthState.recentSuccessCount += 1;

    void appendSecurityEvent({
      type: "stripe-webhook-processed",
      req,
      email: matched.email,
      userId: matched.userId,
      reason: downgradeResult.changed
        ? "Premium downgraded from Stripe subscription webhook"
        : "Stripe downgrade webhook idempotent/no-op",
      details: {
        eventId,
        eventType,
        status: subscriptionStatus,
        action: "downgrade",
      },
    });

    return res.json({
      ok: true,
      matched: true,
      downgraded: downgradeResult.changed,
      alreadyFree: downgradeResult.alreadyFree,
      alreadyProcessed: downgradeResult.alreadyProcessed,
    });
  }
);

app.post(
  "/api/billing/webhooks/kofi",
  billingWebhookLimiter,
  express.urlencoded({ extended: false, limit: "1mb" }),
  async (req, res) => {
    const kofiPayload = parseKofiWebhookPayload(req.body);
    if (!kofiPayload) {
      return res.status(400).json({
        error: "Invalid Ko-fi webhook payload",
      });
    }

    const configuredToken = pickFirstNonEmptyString(
      process.env.KOFI_WEBHOOK_VERIFICATION_TOKEN,
      process.env.KOFI_WEBHOOK_TOKEN
    );
    if (!configuredToken) {
      reportServerError("kofi-webhook-not-configured", new Error("Missing webhook verification token"), {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
      });
      return res.status(503).json({
        error: "Ko-fi webhook is not configured yet",
      });
    }

    const providedToken = pickFirstNonEmptyString(
      kofiPayload.verification_token,
      kofiPayload.verificationToken,
      req.get("x-kofi-verification-token"),
      req.body?.verification_token,
      req.body?.verificationToken
    );
    if (!providedToken || !constantTimeStringEquals(providedToken, configuredToken)) {
      void appendSecurityEvent({
        type: "kofi-webhook-rejected",
        req,
        reason: "Invalid webhook verification token",
      });
      return res.status(401).json({
        error: "Invalid webhook verification token",
      });
    }

    const eventType = pickFirstNonEmptyString(
      kofiPayload.type,
      kofiPayload.event,
      kofiPayload.event_type,
      kofiPayload.payment_type
    )
      .trim()
      .toLowerCase();
    const paymentStatus = pickFirstNonEmptyString(
      kofiPayload.status,
      kofiPayload.payment_status,
      kofiPayload.state
    )
      .trim()
      .toLowerCase();
    const amount = pickFirstNonEmptyString(
      kofiPayload.amount,
      kofiPayload.amount_received,
      kofiPayload.total_amount,
      kofiPayload.price
    )
      .trim()
      .slice(0, 40);
    const paymentAcceptance = evaluateKofiWebhookPaymentAcceptance({
      eventType,
      paymentStatus,
      amount,
    });
    if (!paymentAcceptance.accepted && paymentAcceptance.action === "ignore") {
      return res.json({
        ok: true,
        ignored: true,
        reason: paymentAcceptance.reason,
      });
    }

    const supporter = isPlainObject(kofiPayload.supporter) ? kofiPayload.supporter : {};
    const payerEmail = normalizeEmail(
      pickFirstNonEmptyString(
        kofiPayload.email,
        kofiPayload.from_email,
        kofiPayload.supporter_email,
        kofiPayload.payer_email,
        kofiPayload.kofi_transaction_email,
        supporter.email
      )
    );
    if (!isValidEmail(payerEmail)) {
      void appendSecurityEvent({
        type: "kofi-webhook-unmatched",
        req,
        reason: "Webhook did not include a usable payer email",
        details: {
          eventType,
        },
      });
      return res.status(202).json({
        ok: true,
        matched: false,
      });
    }

    const matchedUserId = String(authStore.emailIndex[payerEmail] || "").trim();
    const userRecord = matchedUserId ? authStore.users[matchedUserId] : null;
    if (!userRecord) {
      void appendSecurityEvent({
        type: "kofi-webhook-unmatched",
        req,
        email: payerEmail,
        reason: "No account matched webhook payer email",
        details: {
          eventType,
        },
      });
      return res.status(202).json({
        ok: true,
        matched: false,
      });
    }

    const eventId = pickFirstNonEmptyString(
      kofiPayload.message_id,
      kofiPayload.transaction_id,
      kofiPayload.kofi_transaction_id,
      kofiPayload.payment_id,
      kofiPayload.id
    )
      .trim()
      .slice(0, 120);
    const currency = pickFirstNonEmptyString(
      kofiPayload.currency,
      kofiPayload.currency_code
    )
      .trim()
      .toUpperCase()
      .slice(0, 12);

    if (paymentAcceptance.action === "downgrade") {
      const downgradeResult = applyPremiumDowngradeToUserRecord(userRecord, {
        provider: "ko-fi",
        source: "kofi-webhook",
        eventId,
        eventType,
      });

      void appendSecurityEvent({
        type: "kofi-webhook-processed",
        req,
        email: payerEmail,
        userId: userRecord.id,
        reason: downgradeResult.changed
          ? "Premium downgraded from Ko-fi cancellation/refund webhook"
          : "Ko-fi downgrade webhook idempotent/no-op",
        details: {
          eventId,
          eventType,
          paymentStatus,
          amount,
          currency,
          action: "downgrade",
        },
      });

      return res.json({
        ok: true,
        matched: true,
        downgraded: downgradeResult.changed,
        alreadyFree: downgradeResult.alreadyFree,
        alreadyProcessed: downgradeResult.alreadyProcessed,
      });
    }

    const premiumResult = applyPremiumProfileToUserRecord(userRecord, {
      provider: "ko-fi",
      source: "kofi-webhook",
      eventId,
      eventType,
      amount,
      currency,
    });

    void appendSecurityEvent({
      type: "kofi-webhook-processed",
      req,
      email: payerEmail,
      userId: userRecord.id,
      reason: premiumResult.changed ? "Premium activated from Ko-fi webhook" : "Ko-fi webhook idempotent replay",
      details: {
        eventId,
        eventType,
        paymentStatus,
        amount,
        currency,
      },
    });

    return res.json({
      ok: true,
      matched: true,
      upgraded: premiumResult.changed,
      alreadyPremium: premiumResult.alreadyPremium,
      alreadyProcessed: premiumResult.alreadyProcessed,
    });
  }
);

const isAllowedKoFiCheckoutUrl = (
  value,
  { requireSubscriptionPath = false, requireSubscriptionLikePath = true } = {}
) => {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") {
      return "";
    }
    const host = String(parsed.hostname || "").trim().toLowerCase();
    if (host !== "ko-fi.com" && host !== "www.ko-fi.com") {
      return "";
    }
    const pathName = String(parsed.pathname || "").trim().toLowerCase();
    if (requireSubscriptionLikePath) {
      const isSubscriptionLike = pathName.startsWith("/s/") || pathName.startsWith("/summary/");
      if (!isSubscriptionLike) {
        return "";
      }
    }
    if (requireSubscriptionPath) {
      if (!pathName.startsWith("/s/")) {
        return "";
      }
    }
    return parsed.toString();
  } catch {
    return "";
  }
};

const resolveConfiguredKoFiPremiumCheckoutOptions = () => {
  const resolveFromEnvKeys = (envKeys = [], validator = null) => {
    for (const key of envKeys) {
      const raw = String(process.env[key] || "").trim();
      if (!raw) {
        continue;
      }
      const normalized = typeof validator === "function" ? validator(raw) : raw;
      if (normalized) {
        return {
          value: normalized,
          key,
        };
      }
    }
    return {
      value: "",
      key: "",
    };
  };

  const monthlyEnvResult = resolveFromEnvKeys(
    [
      "KOFI_PREMIUM_MONTHLY_URL",
      "KOFI_PREMIUM_URL",
      "KOFI_MONTHLY_URL",
      "PREMIUM_CHECKOUT_URL",
      "PREMIUM_MONTHLY_URL",
    ],
    (raw) =>
      isAllowedKoFiCheckoutUrl(raw, {
        requireSubscriptionLikePath: true,
      })
  );

  const legacyBaseEnvResult = resolveFromEnvKeys(["KOFI_PREMIUM_BASE_URL"], (raw) =>
    isAllowedKoFiCheckoutUrl(raw, {
      requireSubscriptionPath: true,
      requireSubscriptionLikePath: true,
    })
  );

  const monthlyCheckoutUrl = monthlyEnvResult.value || legacyBaseEnvResult.value;

  const fallbackOptions = [
    {
      id: "monthly",
      label: "Monthly",
      description: "€9.99 per month",
      url: monthlyCheckoutUrl,
    },
  ].filter((item) => Boolean(item?.url));

  const rawCustomOptions =
    String(process.env.KOFI_PREMIUM_OPTIONS_JSON || "").trim() ||
    String(process.env.KOFI_PREMIUM_OPTIONS || "").trim();
  let customOptions = [];
  if (rawCustomOptions) {
    try {
      const parsed = JSON.parse(rawCustomOptions);
      if (Array.isArray(parsed)) {
        customOptions = parsed
          .map((item, index) => {
            const candidate = isPlainObject(item) ? item : {};
            const checkoutUrl = isAllowedKoFiCheckoutUrl(candidate.url, {
              requireSubscriptionLikePath: true,
            });
            if (!checkoutUrl) {
              return null;
            }
            const id = String(candidate.id || `option-${index + 1}`)
              .trim()
              .toLowerCase()
              .slice(0, 32);
            const label = String(candidate.label || "Premium option").trim().slice(0, 60);
            const description = String(candidate.description || "").trim().slice(0, 140);
            if (!id || !label) {
              return null;
            }
            return {
              id,
              label,
              description,
              url: checkoutUrl,
            };
          })
          .filter(Boolean);
      }
    } catch {}
  }

  const optionSource = customOptions.length ? customOptions : fallbackOptions;
  const uniqueById = new Map();
  optionSource.forEach((item) => {
    if (!item?.id || !item?.url || uniqueById.has(item.id)) {
      return;
    }
    uniqueById.set(item.id, item);
  });

  const options = [...uniqueById.values()];
  return {
    options,
    configured: options.length > 0,
    source: customOptions.length
      ? "custom-options-json"
      : monthlyEnvResult.key
        ? `monthly-url:${monthlyEnvResult.key}`
        : legacyBaseEnvResult.key
          ? `monthly-url:${legacyBaseEnvResult.key}`
          : "none",
    provider: "ko-fi",
  };
};

const resolveConfiguredPremiumCheckoutOptions = () => {
  const stripePriceId = String(
    process.env.STRIPE_PREMIUM_PRICE_ID ||
      process.env.STRIPE_PRICE_ID ||
      process.env.PREMIUM_STRIPE_PRICE_ID ||
      ""
  ).trim();
  const stripeSecretKey = String(process.env.STRIPE_SECRET_KEY || "").trim();
  if (stripeSecretKey && stripePriceId) {
    const label = String(process.env.STRIPE_PREMIUM_LABEL || "Monthly").trim().slice(0, 60) || "Monthly";
    const description =
      String(process.env.STRIPE_PREMIUM_DESCRIPTION || "€9.99 per month").trim().slice(0, 140) ||
      "€9.99 per month";
    return {
      options: [
        {
          id: "monthly",
          label,
          description,
          url: "/api/billing/premium/checkout/start?option=monthly",
        },
      ],
      configured: true,
      source: "stripe:STRIPE_PREMIUM_PRICE_ID",
      provider: "stripe",
    };
  }

  return resolveConfiguredKoFiPremiumCheckoutOptions();
};

const createStripePremiumCheckoutSession = async (req, userRecord, optionId = "monthly") => {
  const stripe = getStripeClient();
  const priceId = String(
    process.env.STRIPE_PREMIUM_PRICE_ID ||
      process.env.STRIPE_PRICE_ID ||
      process.env.PREMIUM_STRIPE_PRICE_ID ||
      ""
  ).trim();
  if (!priceId) {
    throw new Error("Missing STRIPE_PREMIUM_PRICE_ID");
  }

  const trialDaysRaw = Number(process.env.STRIPE_PREMIUM_TRIAL_DAYS || 0);
  const trialDays = Number.isFinite(trialDaysRaw) ? Math.max(0, Math.floor(trialDaysRaw)) : 0;

  const origin = getPublicAppOrigin(req);
  const successPath = String(process.env.STRIPE_PREMIUM_SUCCESS_PATH || "/index.html?premium=success").trim();
  const cancelPath = String(process.env.STRIPE_PREMIUM_CANCEL_PATH || "/index.html?premium=cancel").trim();
  const successUrl = new URL(successPath.startsWith("/") ? successPath : `/${successPath}`, origin);
  const cancelUrl = new URL(cancelPath.startsWith("/") ? cancelPath : `/${cancelPath}`, origin);

  const metadata = {
    cosmicaUserId: String(userRecord?.id || "").trim().slice(0, 128),
    cosmicaUserEmail: String(userRecord?.email || "").trim().toLowerCase().slice(0, 200),
    premiumOption: String(optionId || "monthly").trim().toLowerCase().slice(0, 32),
  };

  const subscriptionData = {
    metadata,
  };
  if (trialDays > 0) {
    subscriptionData.trial_period_days = trialDays;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl.toString(),
    cancel_url: cancelUrl.toString(),
    customer_email: metadata.cosmicaUserEmail,
    client_reference_id: metadata.cosmicaUserId,
    allow_promotion_codes: true,
    metadata,
    subscription_data: subscriptionData,
  });

  const checkoutUrl = String(session?.url || "").trim();
  if (!checkoutUrl) {
    throw new Error("Stripe session URL was not returned");
  }
  return checkoutUrl;
};

const listStripeCustomersByEmail = async (stripe, email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    return [];
  }
  const customers = [];
  let startingAfter = "";
  let hasMore = true;
  while (hasMore) {
    const response = await stripe.customers.list({
      email: normalizedEmail,
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
  let startingAfter = "";
  let hasMore = true;
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

const findStripeCancelableSubscriptionForUser = async (stripe, userRecord) => {
  const email = normalizeEmail(userRecord?.email);
  if (!isValidEmail(email)) {
    return null;
  }
  const customers = await listStripeCustomersByEmail(stripe, email);
  for (const customer of customers) {
    const subscriptions = await listStripeSubscriptionsForCustomer(stripe, customer.id);
    const match = subscriptions.find((subscription) => {
      const status = String(subscription?.status || "").trim().toLowerCase();
      return ["active", "trialing", "past_due"].includes(status);
    });
    if (match) {
      return {
        customerId: String(customer.id || "").trim(),
        subscription: match,
      };
    }
  }
  return null;
};

const resolveStripeSubscriptionSnapshotForUser = async (stripe, userRecord) => {
  const profile = isPlainObject(userRecord?.data?.profile) ? userRecord.data.profile : {};
  const knownCustomerId = String(profile.premiumStripeCustomerId || "").trim().slice(0, 120);
  const customerIds = new Set();
  if (knownCustomerId) {
    customerIds.add(knownCustomerId);
  }

  const email = normalizeEmail(userRecord?.email);
  if (isValidEmail(email)) {
    const customers = await listStripeCustomersByEmail(stripe, email);
    for (const customer of customers) {
      const customerId = String(customer?.id || "").trim().slice(0, 120);
      if (customerId) {
        customerIds.add(customerId);
      }
    }
  }

  const allSubscriptions = [];
  for (const customerId of customerIds) {
    const subscriptions = await listStripeSubscriptionsForCustomer(stripe, customerId);
    subscriptions.forEach((subscription) => {
      if (subscription) {
        allSubscriptions.push({
          customerId,
          subscription,
        });
      }
    });
  }

  const activePriority = {
    active: 0,
    trialing: 1,
    past_due: 2,
  };

  const activeMatches = allSubscriptions
    .filter(({ subscription }) => {
      const status = String(subscription?.status || "").trim().toLowerCase();
      return hasStripePremiumAccessFromStatus(status);
    })
    .sort((a, b) => {
      const statusA = String(a.subscription?.status || "").trim().toLowerCase();
      const statusB = String(b.subscription?.status || "").trim().toLowerCase();
      const priorityA = Number.isFinite(activePriority[statusA]) ? activePriority[statusA] : 99;
      const priorityB = Number.isFinite(activePriority[statusB]) ? activePriority[statusB] : 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      const periodEndA = Number(a.subscription?.current_period_end || 0);
      const periodEndB = Number(b.subscription?.current_period_end || 0);
      return periodEndB - periodEndA;
    });

  if (activeMatches.length > 0) {
    const winner = activeMatches[0];
    const subscription = winner.subscription;
    const periodEndEpoch = Number(subscription?.current_period_end || 0);
    return {
      hasPremium: true,
      customerId: String(winner.customerId || "").trim().slice(0, 120),
      subscriptionId: String(subscription?.id || "").trim().slice(0, 120),
      subscriptionStatus: String(subscription?.status || "").trim().toLowerCase().slice(0, 60),
      cancelAtPeriodEnd: subscription?.cancel_at_period_end === true,
      premiumAccessUntil:
        Number.isFinite(periodEndEpoch) && periodEndEpoch > 0
          ? new Date(periodEndEpoch * 1000).toISOString()
          : "",
    };
  }

  return {
    hasPremium: false,
    customerId: knownCustomerId,
    subscriptionId: "",
    subscriptionStatus: "",
    cancelAtPeriodEnd: false,
    premiumAccessUntil: "",
  };
};

const syncUserPremiumFromStripeTruth = async (
  userRecord,
  { source = "admin-resync", forceDowngradeWhenNoActive = true } = {}
) => {
  const stripe = getStripeClient();
  userRecord.data = normalizeUserData(userRecord.data);
  if (!isPlainObject(userRecord.data.profile)) {
    userRecord.data.profile = {};
  }
  const beforePremium = userHasPremiumAccessForProgress(userRecord);
  const snapshot = await resolveStripeSubscriptionSnapshotForUser(stripe, userRecord);

  if (snapshot.hasPremium) {
    const upgradeResult = applyPremiumProfileToUserRecord(userRecord, {
      provider: "stripe",
      source,
      eventType: "stripe-truth-sync",
      stripeCustomerId: snapshot.customerId,
      stripeSubscriptionId: snapshot.subscriptionId,
      premiumAccessUntil: snapshot.premiumAccessUntil,
      cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
      subscriptionStatus: snapshot.subscriptionStatus,
    });
    return {
      action: upgradeResult.changed ? "upgraded" : beforePremium ? "confirmed" : "upgraded",
      changed: upgradeResult.changed,
      isPremium: true,
      snapshot,
    };
  }

  if (!forceDowngradeWhenNoActive) {
    return {
      action: "skipped",
      changed: false,
      isPremium: beforePremium,
      snapshot,
    };
  }

  const downgradeResult = applyPremiumDowngradeToUserRecord(userRecord, {
    provider: "stripe",
    source,
    eventType: "stripe-truth-sync",
  });

  return {
    action: downgradeResult.changed ? "downgraded" : "confirmed-free",
    changed: downgradeResult.changed,
    isPremium: false,
    snapshot,
  };
};

const isStripePremiumRecoveryCandidate = (userRecord) => {
  const profile = isPlainObject(userRecord?.data?.profile) ? userRecord.data.profile : {};
  const provider = String(profile.premiumProvider || "").trim().toLowerCase();
  const lastSource = String(profile.premiumLastSource || "").trim().toLowerCase();
  return (
    provider === "stripe" ||
    Boolean(String(profile.premiumStripeCustomerId || "").trim()) ||
    Boolean(String(profile.premiumStripeSubscriptionId || "").trim()) ||
    Boolean(String(profile.premiumStripeSubscriptionStatus || "").trim()) ||
    lastSource.includes("stripe")
  );
};

const attemptStripePremiumRecoveryIfNeeded = async (userRecord, source = "auth-bootstrap") => {
  if (!userRecord || !isPlainObject(userRecord)) {
    return { attempted: false, recovered: false, reason: "no-user" };
  }

  userRecord.data = normalizeUserData(userRecord.data);
  if (userHasPremiumAccessForProgress(userRecord)) {
    return { attempted: false, recovered: false, reason: "already-premium" };
  }
  if (!isStripePremiumRecoveryCandidate(userRecord)) {
    return { attempted: false, recovered: false, reason: "not-stripe-candidate" };
  }

  const stripeKeyConfigured = Boolean(String(process.env.STRIPE_SECRET_KEY || "").trim());
  if (!stripeKeyConfigured) {
    return { attempted: false, recovered: false, reason: "stripe-not-configured" };
  }

  const profile = isPlainObject(userRecord.data.profile) ? userRecord.data.profile : {};
  const lastAttemptMs = parseIsoToMs(profile.premiumRecoveryLastAttemptAt || "");
  if (
    lastAttemptMs !== null &&
    Date.now() - lastAttemptMs < STRIPE_PREMIUM_RECOVERY_SYNC_COOLDOWN_MS
  ) {
    return { attempted: false, recovered: false, reason: "cooldown" };
  }

  const nowIso = new Date().toISOString();
  profile.premiumRecoveryLastAttemptAt = nowIso;
  userRecord.updatedAt = nowIso;
  markAuthStoreDirty();

  try {
    const result = await syncUserPremiumFromStripeTruth(userRecord, {
      source,
      forceDowngradeWhenNoActive: false,
    });
    return {
      attempted: true,
      recovered: result.isPremium === true,
      reason: result.action,
    };
  } catch (error) {
    reportServerError("premium-recovery-sync", error, {
      source,
      userId: String(userRecord.id || "").slice(0, 120),
      email: normalizeEmail(userRecord.email),
    });
    return { attempted: true, recovered: false, reason: "sync-error" };
  }
};

const resolvePremiumSubscriptionStatus = (userRecord) => {
  const profile = isPlainObject(userRecord?.data?.profile) ? userRecord.data.profile : {};
  const premiumSnapshot = resolvePremiumSnapshotFromProfile(profile);
  const accessUntil = computePremiumAccessUntilFromProfile(profile);
  const cancelAtPeriodEnd =
    profile.premiumCancelAtPeriodEnd === true ||
    ["1", "true", "yes"].includes(String(profile.premiumCancelAtPeriodEnd || "").trim().toLowerCase());
  const subscriptionStatus = String(profile.premiumStripeSubscriptionStatus || "").trim().toLowerCase();
  const lastSyncAt = String(profile.premiumLastSyncedAt || profile.premiumLastEventAt || "").trim() || null;
  const billingStatus = premiumSnapshot.isPremium
    ? cancelAtPeriodEnd
      ? "canceling"
      : "active"
    : "expired";
  return {
    isPremium: premiumSnapshot.isPremium,
    planTier: premiumSnapshot.planTier,
    billingStatus,
    cancelAtPeriodEnd,
    premiumAccessUntil: accessUntil,
    premiumActivatedAt: String(profile.premiumActivatedAt || "") || null,
    premiumProvider: String(profile.premiumProvider || "").trim().toLowerCase() || null,
    stripeSubscriptionStatus: subscriptionStatus || null,
    lastSyncAt,
  };
};

app.get(
  "/api/billing/subscription/status",
  authSessionLimiter,
  requireAuthenticatedUser,
  (req, res) => {
    req.authUser.data = normalizeUserData(req.authUser.data);
    const status = resolvePremiumSubscriptionStatus(req.authUser);
    return res.json({
      ok: true,
      subscription: status,
    });
  }
);

app.get(
  "/api/admin/security/billing/stripe-health",
  adminSecurityLimiter,
  requireAdminSecurityAccess,
  (req, res) => {
    return res.json({
      ok: true,
      configured: {
        stripeSecretKey: Boolean(String(process.env.STRIPE_SECRET_KEY || "").trim()),
        stripeWebhookSecret: Boolean(String(process.env.STRIPE_WEBHOOK_SECRET || "").trim()),
      },
      webhookHealth: {
        ...stripeWebhookHealthState,
      },
      now: new Date().toISOString(),
    });
  }
);

app.post(
  "/api/admin/security/billing/stripe/resync-user",
  adminSecurityLimiter,
  requireAdminSecurityAccess,
  async (req, res) => {
    const userId = String(req.body?.userId || "").trim().slice(0, 120);
    const email = normalizeEmail(req.body?.email);
    const dryRun = isTruthyEnvValue(req.body?.dryRun);
    const forceDowngradeWhenNoActive = !isTruthyEnvValue(req.body?.keepPremiumIfNoStripeActive);

    const targetUserId = userId || (email ? String(authStore.emailIndex[email] || "").trim() : "");
    const userRecord = targetUserId ? authStore.users[targetUserId] : null;
    if (!userRecord) {
      return res.status(404).json({ error: "User not found for provided userId/email" });
    }

    userRecord.data = normalizeUserData(userRecord.data);
    const beforePremium = userHasPremiumAccessForProgress(userRecord);
    const profile = isPlainObject(userRecord.data.profile) ? userRecord.data.profile : {};
    const beforeSnapshot = {
      isPremium: beforePremium,
      stripeCustomerId: String(profile.premiumStripeCustomerId || "").trim().slice(0, 120) || null,
      stripeSubscriptionId: String(profile.premiumStripeSubscriptionId || "").trim().slice(0, 120) || null,
      premiumCurrentPeriodEnd: String(profile.premiumCurrentPeriodEnd || "").trim() || null,
      premiumCancelAtPeriodEnd: profile.premiumCancelAtPeriodEnd === true,
    };

    try {
      const stripe = getStripeClient();
      const liveSnapshot = await resolveStripeSubscriptionSnapshotForUser(stripe, userRecord);

      if (dryRun) {
        return res.json({
          ok: true,
          dryRun: true,
          user: {
            id: String(userRecord.id || targetUserId).trim(),
            email: normalizeEmail(userRecord.email),
          },
          before: beforeSnapshot,
          stripe: liveSnapshot,
          wouldAction: liveSnapshot.hasPremium
            ? beforePremium
              ? "confirm-premium"
              : "upgrade"
            : forceDowngradeWhenNoActive
              ? beforePremium
                ? "downgrade"
                : "confirm-free"
              : "no-change",
        });
      }

      const result = await syncUserPremiumFromStripeTruth(userRecord, {
        source: "admin-stripe-resync",
        forceDowngradeWhenNoActive,
      });

      void appendSecurityEvent({
        type: "admin-billing-resync",
        req,
        email: normalizeEmail(userRecord.email),
        userId: String(userRecord.id || targetUserId).trim(),
        reason: `Stripe entitlement resync: ${result.action}`,
        details: {
          changed: result.changed,
          forceDowngradeWhenNoActive,
        },
      });

      return res.json({
        ok: true,
        dryRun: false,
        user: toPublicUser(userRecord),
        before: beforeSnapshot,
        result: {
          action: result.action,
          changed: result.changed,
          isPremium: result.isPremium,
          stripe: result.snapshot,
        },
      });
    } catch (error) {
      stripeWebhookHealthState.lastErrorAt = new Date().toISOString();
      stripeWebhookHealthState.recentFailureCount += 1;
      reportServerError("admin-stripe-resync-user", error, {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        userId: String(targetUserId || "").slice(0, 120),
      });
      return res.status(500).json({ error: "Stripe resync failed" });
    }
  }
);

app.post(
  "/api/billing/subscription/cancel",
  accountMutationLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const userRecord = req.authUser;
    userRecord.data = normalizeUserData(userRecord.data);
    if (!isPlainObject(userRecord.data.profile)) {
      userRecord.data.profile = {};
    }
    const profile = userRecord.data.profile;
    const premiumSnapshot = resolvePremiumSnapshotFromProfile(profile);
    if (!premiumSnapshot.isPremium) {
      return res.status(400).json({
        error: "No active premium subscription found for this account.",
      });
    }

    const nowIso = new Date().toISOString();
    let scheduledEndIso = computePremiumAccessUntilFromProfile(profile, nowIso);
    let provider = String(profile.premiumProvider || "").trim().toLowerCase() || "stripe";

    const hasStripeSecret = Boolean(String(process.env.STRIPE_SECRET_KEY || "").trim());
    if (hasStripeSecret) {
      try {
        const stripe = getStripeClient();
        const stripeMatch = await findStripeCancelableSubscriptionForUser(stripe, userRecord);
        if (stripeMatch?.subscription?.id) {
          const existing = stripeMatch.subscription;
          const updatedSubscription = existing.cancel_at_period_end
            ? existing
            : await stripe.subscriptions.update(String(existing.id), {
                cancel_at_period_end: true,
              });
          const periodEnd = Number(updatedSubscription?.current_period_end || 0);
          if (Number.isFinite(periodEnd) && periodEnd > 0) {
            scheduledEndIso = new Date(periodEnd * 1000).toISOString();
          }
          provider = "stripe";
        }
      } catch (error) {
        reportServerError("subscription-cancel-request", error, {
          requestId: req.requestId,
          method: req.method,
          path: req.originalUrl,
          userId: String(userRecord.id || "").slice(0, 80),
        });
      }
    }

    profile.premiumCancelAtPeriodEnd = true;
    profile.premiumCancelRequestedAt = nowIso;
    if (scheduledEndIso) {
      profile.premiumScheduledEndAt = scheduledEndIso;
      profile.premiumCurrentPeriodEnd = scheduledEndIso;
    }
    profile.premiumProvider = provider;
    profile.premiumLastSource = "self-service-cancel";
    profile.premiumLastEventAt = nowIso;
    userRecord.updatedAt = nowIso;
    markAuthStoreDirty();

    return res.json({
      ok: true,
      message: "Your subscription will remain active until the end of the current billing period.",
      subscription: resolvePremiumSubscriptionStatus(userRecord),
      user: toPublicUser(userRecord),
      data: cloneForResponse(normalizeUserData(userRecord.data)),
      progress: cloneForResponse(normalizeProgress(userRecord.progress)),
    });
  }
);

app.post(
  "/api/billing/subscription/restore",
  accountMutationLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const userRecord = req.authUser;
    try {
      const result = await syncUserPremiumFromStripeTruth(userRecord, {
        source: "self-service-restore",
        forceDowngradeWhenNoActive: false,
      });

      return res.json({
        ok: true,
        message: result.isPremium
          ? "Premium status synced successfully."
          : "No active Stripe premium subscription was found for this account.",
        result: {
          action: result.action,
          changed: result.changed,
          isPremium: result.isPremium,
          stripe: result.snapshot,
        },
        subscription: resolvePremiumSubscriptionStatus(userRecord),
        user: toPublicUser(userRecord),
        data: cloneForResponse(normalizeUserData(userRecord.data)),
        progress: cloneForResponse(normalizeProgress(userRecord.progress)),
      });
    } catch (error) {
      reportServerError("subscription-restore-request", error, {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        userId: String(userRecord?.id || "").slice(0, 120),
      });
      return res.status(500).json({ error: "Could not restore premium status right now" });
    }
  }
);

app.get(
  "/api/billing/premium/options",
  authSessionLimiter,
  requireAuthenticatedUser,
  (req, res) => {
    const subscription = resolvePremiumSubscriptionStatus(req.authUser);
    const checkoutConfig = resolveConfiguredPremiumCheckoutOptions();
    if (!checkoutConfig.configured) {
      return res.status(503).json({
        error: "Premium checkout is not configured yet",
        code: "premium_checkout_not_configured",
        reasonCode: "premium_checkout_not_configured",
        canPurchase: false,
      });
    }

    const kofiFallbackConfig =
      checkoutConfig.provider === "stripe" ? resolveConfiguredKoFiPremiumCheckoutOptions() : null;
    const fallbackAvailable = Boolean(kofiFallbackConfig?.configured && Array.isArray(kofiFallbackConfig?.options));
    const alreadyPremiumActive =
      subscription?.isPremium === true &&
      (subscription?.billingStatus === "active" || subscription?.billingStatus === "canceling");
    const advisory = alreadyPremiumActive
      ? subscription?.billingStatus === "canceling"
        ? "Your Premium plan is already active and set to cancel at period end. Avoid purchasing again unless you intend to start a second subscription."
        : "Your Premium plan is already active on this account. Avoid purchasing again to prevent duplicate subscriptions."
      : "";

    return res.json({
      ok: true,
      provider: checkoutConfig.provider || "ko-fi",
      options: checkoutConfig.options,
      canPurchase: !alreadyPremiumActive,
      reasonCode: alreadyPremiumActive
        ? "already_premium_active"
        : checkoutConfig.provider === "stripe" && fallbackAvailable
          ? "stripe_primary_fallback_available"
          : "checkout_ready",
      advisory,
      subscription: {
        isPremium: Boolean(subscription?.isPremium),
        billingStatus: String(subscription?.billingStatus || "").trim().toLowerCase() || "expired",
      },
      fallback: {
        provider: fallbackAvailable ? "ko-fi" : null,
        available: fallbackAvailable,
      },
    });
  }
);

app.get(
  "/api/billing/premium/checkout/start",
  authSessionLimiter,
  requireAuthenticatedUser,
  async (req, res) => {
    const subscription = resolvePremiumSubscriptionStatus(req.authUser);
    const alreadyPremiumActive =
      subscription?.isPremium === true &&
      (subscription?.billingStatus === "active" || subscription?.billingStatus === "canceling");
    if (alreadyPremiumActive) {
      return res.status(409).json({
        error: "Premium is already active for this account. Checkout is blocked to avoid duplicate subscriptions.",
        reasonCode: "already_premium_active",
        canPurchase: false,
        subscription,
      });
    }

    const checkoutConfig = resolveConfiguredPremiumCheckoutOptions();
    if (!checkoutConfig.configured) {
      return res.status(503).json({
        error: "Premium checkout is not configured yet",
      });
    }

    const optionId = String(req.query?.option || "monthly")
      .trim()
      .toLowerCase();
    const selectedOption = checkoutConfig.options.find((item) => item?.id === optionId);
    if (!selectedOption) {
      return res.status(404).json({
        error: "Unknown premium checkout option",
      });
    }

    if (checkoutConfig.provider !== "stripe") {
      return res.redirect(303, selectedOption.url);
    }

    try {
      const checkoutUrl = await createStripePremiumCheckoutSession(req, req.authUser, optionId);
      return res.redirect(303, checkoutUrl);
    } catch (error) {
      reportServerError("stripe-checkout-start", error, {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
      });

      const kofiFallbackConfig = resolveConfiguredKoFiPremiumCheckoutOptions();
      const kofiFallbackOption = kofiFallbackConfig.options.find((item) => item?.id === optionId);
      if (kofiFallbackConfig.configured && kofiFallbackOption?.url) {
        return res.redirect(303, kofiFallbackOption.url);
      }

      return res.status(500).json({ error: "Unable to start Stripe checkout" });
    }
  }
);

app.get("/api/progress", progressLimiter, requireAuthenticatedUser, (req, res) => {
  req.authUser.progress = normalizeProgress(req.authUser.progress);
  return res.json({
    ok: true,
    progress: cloneForResponse(req.authUser.progress),
  });
});

app.put("/api/progress", progressLimiter, requireAuthenticatedUser, (req, res) => {
  const incoming = req.body?.progress;
  if (!isPlainObject(incoming)) {
    return res.status(400).json({ error: "progress must be an object" });
  }
  let serialized = "";
  try {
    serialized = JSON.stringify(incoming);
  } catch {
    return res.status(400).json({ error: "progress must be JSON-serializable" });
  }
  if (serialized.length > MAX_PROGRESS_SERIALIZED_CHARS) {
    return res.status(413).json({ error: "progress payload too large" });
  }
  req.authUser.progress = normalizeProgress(incoming);
  req.authUser.progress.updatedAt = new Date().toISOString();
  req.authUser.updatedAt = req.authUser.progress.updatedAt;
  markAuthStoreDirty();
  return res.json({
    ok: true,
    progress: cloneForResponse(req.authUser.progress),
  });
});

app.post("/api/progress/track", progressLimiter, requireAuthenticatedUser, (req, res) => {
  const trackResult = trackProgressEventForUser(req.authUser, req.body || {});
  if (!trackResult.ok) {
    return res.status(400).json({ error: trackResult.error || "Invalid progress payload" });
  }
  return res.json({
    ok: true,
    event: trackResult.event,
    progress: cloneForResponse(trackResult.progress),
  });
});

/* --------------------------------------------------------------------------
   ROUTE: FEEDBACK SUBMISSION
   -------------------------------------------------------------------------- */
app.post("/api/feedback", feedbackLimiter, async (req, res) => {
  const { name, email, message } = req.body || {};
  const safeName = typeof name === "string" ? name.trim() : "";
  const safeEmail = typeof email === "string" ? email.trim() : "";
  const safeMessage = typeof message === "string" ? message.trim() : "";
  const isMonitorCheck = String(req.get("x-monitor-check") || "").trim() === "1";

  if (!safeName || !safeEmail || !safeMessage) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const to = process.env.FEEDBACK_TO || process.env.SMTP_USER;
  const smtpUser = process.env.SMTP_USER;
  const fromAddress = process.env.FEEDBACK_FROM || smtpUser;
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasSmtp = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS
  );
  if (!to || !fromAddress) {
    return res.status(500).json({ error: "Missing FEEDBACK_TO or FEEDBACK_FROM" });
  }
  if (!hasResend && !hasSmtp) {
    return res.status(500).json({ error: "Missing email configuration" });
  }

  if (isMonitorCheck) {
    return res.json({ ok: true, monitor: true });
  }

  try {
    const displayName = safeName && safeEmail ? `${safeName} (${safeEmail})` : safeName;
    const replyToHeader = safeEmail
      ? safeName
        ? `${safeName} <${safeEmail}>`
        : safeEmail
      : undefined;

    const subject = `Cosmica feedback from ${safeName}${safeEmail ? ` (${safeEmail})` : ""}`;
    const text = `Name: ${safeName}\nEmail: ${safeEmail}\n\n${safeMessage}`;

    if (hasResend) {
      const resendResult = await sendViaResend({
        from: fromAddress,
        to,
        replyTo: replyToHeader,
        subject,
        text,
      });
      if (!resendResult.ok) {
        throw new Error(resendResult.error || "Resend failed");
      }
    } else {
      const mailer = getMailer();
      if (!mailer || !smtpUser) {
        return res.status(500).json({ error: "Missing SMTP configuration" });
      }
      const sendFeedback = async (senderAddress) => {
        const fromHeader = displayName ? `${displayName} <${senderAddress}>` : senderAddress;
        await mailer.sendMail({
          from: fromHeader,
          to,
          replyTo: replyToHeader,
          subject,
          text,
        });
      };

      try {
        await sendFeedback(fromAddress);
      } catch (error) {
        if (fromAddress !== smtpUser) {
          await sendFeedback(smtpUser);
        } else {
          throw error;
        }
      }
    }

    return res.json({ ok: true });
  } catch (error) {
    reportServerError("feedback", error, {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
    });
    return res.status(500).json({ error: "Failed to send feedback" });
  }
});

/* --------------------------------------------------------------------------
   ROUTE: TRANSLATION PROXY
   Dedicated endpoint for short UI translation tasks to avoid chat contention.
   -------------------------------------------------------------------------- */
app.post("/api/translate", translateLimiter, async (req, res) => {
  if (!process.env.OPENAI_CHAT_KEY && !process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OPENAI_CHAT_KEY" });
  }

  const text = String(req.body?.text || "").trim();
  const targetLanguage = String(req.body?.targetLanguage || "").trim();
  if (!text || !targetLanguage) {
    return res.status(400).json({ error: "Missing text or targetLanguage" });
  }
  if (text.length > 800 || targetLanguage.length > 80) {
    return res.status(400).json({ error: "Translation payload too large" });
  }

  try {
    const response = await getChatClient().chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 180,
      messages: [
        {
          role: "system",
          content:
            "Translate the text to the requested target language. Return only the translated text without commentary.",
        },
        {
          role: "user",
          content: `Target language: ${targetLanguage}\nText: ${text}`,
        },
      ],
    });

    const translation = response.choices?.[0]?.message?.content?.trim();
    if (!translation) {
      return res.status(500).json({ error: "Empty translation response" });
    }
    return res.json({ translation });
  } catch (error) {
    reportServerError("translate", error, {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
    });
    return res.status(500).json({ error: "Translation request failed" });
  }
});

/* --------------------------------------------------------------------------
   ROUTE: GOOGLE TTS PROXY
   Generates deterministic MP3 speech so mobile/desktop use the same voice.
   -------------------------------------------------------------------------- */
app.post("/api/tts", ttsLimiter, async (req, res) => {
  if (!GOOGLE_TTS_ENABLED) {
    return res.status(503).json({ error: "TTS is disabled" });
  }

  const text = String(req.body?.text || "").trim();
  const languageCode = String(req.body?.languageCode || GOOGLE_TTS_DEFAULT_LANGUAGE).trim();
  const voice = String(req.body?.voice || GOOGLE_TTS_DEFAULT_VOICE).trim();
  const speakingRate = Number(req.body?.speakingRate);
  const pitch = Number(req.body?.pitch);

  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }
  if (text.length > 240) {
    return res.status(400).json({ error: "Text is too long" });
  }

  try {
    const client = getGoogleTtsClient();
    if (!client) {
      return res.status(503).json({ error: "TTS unavailable" });
    }

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode,
        name: voice || undefined,
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate:
          Number.isFinite(speakingRate) && speakingRate >= 0.25 && speakingRate <= 4
            ? speakingRate
            : 1,
        pitch: Number.isFinite(pitch) && pitch >= -20 && pitch <= 20 ? pitch : 0,
      },
    });

    if (!response?.audioContent) {
      return res.status(502).json({ error: "Empty TTS audio response" });
    }

    const audioBuffer = Buffer.isBuffer(response.audioContent)
      ? response.audioContent
      : Buffer.from(response.audioContent, "base64");

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", String(audioBuffer.length));
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(audioBuffer);
  } catch (error) {
    reportServerError("tts", error, {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
    });
    return res.status(500).json({ error: "TTS request failed" });
  }
});

/* --------------------------------------------------------------------------
   ROUTE: MIMI CHAT PROXY
   -------------------------------------------------------------------------- */
app.post("/api/chat", chatLimiter, async (req, res) => {
  if (!process.env.OPENAI_CHAT_KEY && !process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OPENAI_CHAT_KEY" });
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages must be a non-empty array" });
  }

  try {
    const response = await getChatClient().chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 240,
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return res.status(500).json({ error: "Empty response" });
    }

    return res.json({ content });
  } catch (error) {
    reportServerError("chat", error, {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
    });
    return res.status(500).json({ error: "Chat request failed" });
  }
});

let billingBackgroundTaskRunning = false;
let lastStripeDailyReconcileRunAtMs = 0;
let premiumContinuityCanaryRunning = false;
let lastPremiumContinuityCanaryRunAtMs = 0;
const premiumContinuityCanaryState = {
  lastRunAt: null,
  lastStatus: "idle",
  summary: null,
  lastErrorAt: null,
};

const checkStripeWebhookSilence = () => {
  stripeWebhookHealthState.lastMonitorCheckAt = new Date().toISOString();
  const webhookSecretConfigured = Boolean(String(process.env.STRIPE_WEBHOOK_SECRET || "").trim());
  if (!webhookSecretConfigured || STRIPE_WEBHOOK_SILENCE_THRESHOLD_MS <= 0) {
    return;
  }

  const nowMs = Date.now();
  const lastReceivedMs = Date.parse(String(stripeWebhookHealthState.lastReceivedAt || ""));
  const serverUptimeMs = Math.max(0, Math.round(process.uptime() * 1000));
  const silenceMs = Number.isFinite(lastReceivedMs)
    ? Math.max(0, nowMs - lastReceivedMs)
    : serverUptimeMs;

  if (silenceMs < STRIPE_WEBHOOK_SILENCE_THRESHOLD_MS) {
    return;
  }

  maybeAlertStripeWebhookIssue({
    reason: "Stripe webhook silence threshold exceeded",
    details: {
      thresholdMs: STRIPE_WEBHOOK_SILENCE_THRESHOLD_MS,
      silenceMs,
      lastReceivedAt: stripeWebhookHealthState.lastReceivedAt,
    },
  });
};

const runStripeDailyReconciliationDryRun = async () => {
  if (billingBackgroundTaskRunning) {
    return;
  }
  const stripeSecretConfigured = Boolean(String(process.env.STRIPE_SECRET_KEY || "").trim());
  if (!stripeSecretConfigured) {
    return;
  }

  const nowMs = Date.now();
  if (lastStripeDailyReconcileRunAtMs && nowMs - lastStripeDailyReconcileRunAtMs < STRIPE_RECONCILE_INTERVAL_MS) {
    return;
  }
  lastStripeDailyReconcileRunAtMs = nowMs;
  billingBackgroundTaskRunning = true;

  const summary = {
    scanned: 0,
    stripeCandidates: 0,
    wouldUpgrade: 0,
    wouldDowngrade: 0,
    confirmedPremium: 0,
    confirmedFree: 0,
    errors: 0,
  };

  try {
    const stripe = getStripeClient();
    const allUsers = Object.values(authStore.users || {}).filter((user) => user && typeof user === "object");
    for (const userRecord of allUsers) {
      const email = normalizeEmail(userRecord?.email || "");
      if (!isValidEmail(email)) {
        continue;
      }
      summary.scanned += 1;
      userRecord.data = normalizeUserData(userRecord.data);
      const profile = isPlainObject(userRecord?.data?.profile) ? userRecord.data.profile : {};
      const isStripeCandidate =
        String(profile.premiumProvider || "").trim().toLowerCase() === "stripe" ||
        Boolean(profile.premiumStripeCustomerId) ||
        Boolean(profile.premiumStripeSubscriptionId) ||
        userHasPremiumAccessForProgress(userRecord);
      if (!isStripeCandidate) {
        continue;
      }
      summary.stripeCandidates += 1;
      const currentlyPremium = userHasPremiumAccessForProgress(userRecord);
      try {
        const stripeSnapshot = await resolveStripeSubscriptionSnapshotForUser(stripe, userRecord);
        if (stripeSnapshot.hasPremium) {
          if (currentlyPremium) {
            summary.confirmedPremium += 1;
          } else {
            summary.wouldUpgrade += 1;
          }
        } else if (currentlyPremium) {
          summary.wouldDowngrade += 1;
        } else {
          summary.confirmedFree += 1;
        }
      } catch {
        summary.errors += 1;
      }
    }

    stripeWebhookHealthState.lastReconcileAt = new Date().toISOString();
    stripeWebhookHealthState.lastReconcileSummary = {
      ...summary,
      generatedAt: stripeWebhookHealthState.lastReconcileAt,
    };

    if (AUTH_ALERT_WEBHOOK_URL) {
      void postAuthAlertWebhook({
        type: "billing_stripe_daily_reconcile_summary",
        severity: summary.errors > 0 || summary.wouldDowngrade > 0 ? "warning" : "info",
        timestamp: stripeWebhookHealthState.lastReconcileAt,
        summary,
      });
    }
  } catch (error) {
    stripeWebhookHealthState.lastErrorAt = new Date().toISOString();
    stripeWebhookHealthState.recentFailureCount += 1;
    reportServerError("billing-stripe-daily-reconcile", error, {
      monitorIntervalMs: BILLING_MONITOR_INTERVAL_MS,
      reconcileIntervalMs: STRIPE_RECONCILE_INTERVAL_MS,
    });
  } finally {
    billingBackgroundTaskRunning = false;
  }
};

const runPremiumContinuityCanary = async () => {
  if (premiumContinuityCanaryRunning) {
    return;
  }
  const nowMs = Date.now();
  if (
    lastPremiumContinuityCanaryRunAtMs &&
    nowMs - lastPremiumContinuityCanaryRunAtMs < PREMIUM_CONTINUITY_CANARY_INTERVAL_MS
  ) {
    return;
  }
  lastPremiumContinuityCanaryRunAtMs = nowMs;
  premiumContinuityCanaryRunning = true;

  const summary = {
    scanned: 0,
    stripeCandidates: 0,
    entitledUsers: 0,
    potentialFallbacks: 0,
    generatedAt: new Date().toISOString(),
  };

  try {
    const allUsers = Object.values(authStore.users || {}).filter((user) => user && typeof user === "object");
    for (const userRecord of allUsers) {
      const email = normalizeEmail(userRecord?.email || "");
      if (!isValidEmail(email)) {
        continue;
      }
      summary.scanned += 1;
      userRecord.data = normalizeUserData(userRecord.data);
      const profile = isPlainObject(userRecord?.data?.profile) ? userRecord.data.profile : {};
      const stripeCandidate =
        String(profile.premiumProvider || "").trim().toLowerCase() === "stripe" ||
        Boolean(String(profile.premiumStripeCustomerId || "").trim()) ||
        Boolean(String(profile.premiumStripeSubscriptionId || "").trim()) ||
        Boolean(String(profile.premiumStripeSubscriptionStatus || "").trim()) ||
        String(profile.premiumLastSource || "").trim().toLowerCase().includes("stripe");
      if (!stripeCandidate) {
        continue;
      }
      summary.stripeCandidates += 1;

      const premiumWindowMs = parseIsoToMs(profile.premiumCurrentPeriodEnd || profile.premiumScheduledEndAt || "");
      const hasUnexpiredPremiumWindow = premiumWindowMs !== null && premiumWindowMs > Date.now();
      const stripeStatus = String(profile.premiumStripeSubscriptionStatus || "").trim().toLowerCase();
      const hasStripePremiumStatus = ["active", "trialing", "past_due"].includes(stripeStatus);
      const shouldBeEntitled = hasUnexpiredPremiumWindow || hasStripePremiumStatus;
      if (!shouldBeEntitled) {
        continue;
      }
      summary.entitledUsers += 1;

      const resolved = resolvePremiumSnapshotFromProfile(profile);
      if (!resolved.isPremium) {
        summary.potentialFallbacks += 1;
      }
    }

    premiumContinuityCanaryState.lastRunAt = summary.generatedAt;
    premiumContinuityCanaryState.lastStatus = summary.potentialFallbacks > 0 ? "warning" : "ok";
    premiumContinuityCanaryState.summary = summary;
    premiumContinuityCanaryState.lastErrorAt = null;

    if (AUTH_ALERT_WEBHOOK_URL) {
      void postAuthAlertWebhook({
        type: "billing_premium_continuity_canary",
        severity: summary.potentialFallbacks > 0 ? "warning" : "info",
        timestamp: summary.generatedAt,
        summary,
      });
    }
  } catch (error) {
    premiumContinuityCanaryState.lastErrorAt = new Date().toISOString();
    premiumContinuityCanaryState.lastStatus = "error";
    reportServerError("billing-premium-continuity-canary", error, {
      intervalMs: PREMIUM_CONTINUITY_CANARY_INTERVAL_MS,
    });
  } finally {
    premiumContinuityCanaryRunning = false;
  }
};

const startBillingBackgroundMonitors = () => {
  const shouldRun = isTruthyEnvValue(
    String(process.env.BILLING_BACKGROUND_MONITORS_ENABLED || "true").trim()
  );
  if (!shouldRun) {
    return;
  }
  setInterval(() => {
    checkStripeWebhookSilence();
    void runStripeDailyReconciliationDryRun();
    void runPremiumContinuityCanary();
  }, BILLING_MONITOR_INTERVAL_MS);
  void runPremiumContinuityCanary();
};

/* --------------------------------------------------------------------------
   ROUTE: HEALTH CHECK
   -------------------------------------------------------------------------- */
app.get("/api/health", healthLimiter, (req, res) => {
  const checkoutConfig = resolveConfiguredPremiumCheckoutOptions();
  res.json({
    status: "ok",
    version: APP_VERSION,
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    premiumCheckoutConfigured: checkoutConfig.configured,
    premiumCheckoutSource: checkoutConfig.source,
    authStoreFailFastOnLoadError: AUTH_STORE_FAIL_FAST_ON_LOAD_ERROR,
    premiumContinuityCanary: {
      ...premiumContinuityCanaryState,
      intervalMs: PREMIUM_CONTINUITY_CANARY_INTERVAL_MS,
    },
  });
});

/* --------------------------------------------------------------------------
   ROUTE: WEB VITALS INGEST
   -------------------------------------------------------------------------- */
const VALID_WEB_VITAL_NAMES = new Set(["CLS", "FCP", "INP", "LCP", "TTFB"]);
const MAX_VITALS_BATCH = 5;

app.post("/api/web-vitals", webVitalsLimiter, async (req, res) => {
  const payload = req.body;
  const rawMetrics = Array.isArray(payload) ? payload : [payload];

  if (!rawMetrics.length || rawMetrics.length > MAX_VITALS_BATCH) {
    return res.status(400).json({ error: "Invalid web-vitals payload" });
  }

  const metrics = [];
  for (const metric of rawMetrics) {
    if (!metric || typeof metric !== "object") {
      return res.status(400).json({ error: "Invalid web-vitals metric entry" });
    }

    const name = String(metric.name || "").toUpperCase();
    const value = Number(metric.value);
    const rating = String(metric.rating || "").toLowerCase();
    const page = String(metric.page || "").slice(0, 180);
    const id = String(metric.id || "").slice(0, 120);
    const ts = String(metric.timestamp || new Date().toISOString()).slice(0, 64);

    if (!VALID_WEB_VITAL_NAMES.has(name)) {
      return res.status(400).json({ error: `Unsupported metric name: ${name}` });
    }
    if (!Number.isFinite(value) || value < 0 || value > 120000) {
      return res.status(400).json({ error: `Invalid metric value for ${name}` });
    }
    if (!["good", "needs-improvement", "poor"].includes(rating)) {
      return res.status(400).json({ error: `Invalid metric rating for ${name}` });
    }

    metrics.push({
      name,
      value,
      rating,
      page,
      id,
      timestamp: ts,
      userAgent: req.headers["user-agent"] || "",
      requestId: req.requestId || "",
    });
  }

  void postRumWebhook({
    type: "web_vitals",
    source: "cosmica",
    metrics,
  });

  return res.status(202).json({ ok: true });
});

app.use((error, req, res, next) => {
  reportServerError("express", error, {
    requestId: req?.requestId,
    method: req?.method,
    path: req?.originalUrl,
  });
  if (res.headersSent) {
    return next(error);
  }
  return res.status(500).json({
    error: "Internal server error",
    requestId: req?.requestId || null,
  });
});

process.on("unhandledRejection", (reason) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  reportServerError("unhandledRejection", error);
});

process.on("uncaughtException", (error) => {
  reportServerError("uncaughtException", error);
});

/* --------------------------------------------------------------------------
   SERVER STARTUP
   -------------------------------------------------------------------------- */
runAuthRuntimeConfigAudit();
startBillingBackgroundMonitors();

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

