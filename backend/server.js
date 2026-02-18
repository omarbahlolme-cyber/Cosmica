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

app.use(express.json({ limit: "1mb" }));
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
const progressLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 300,
  scope: "progress",
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
const isTruthyEnvValue = (value) =>
  ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
const GOOGLE_TTS_ENABLED = isTruthyEnvValue(process.env.GOOGLE_TTS_ENABLED);
const GOOGLE_TTS_DEFAULT_LANGUAGE = process.env.GOOGLE_TTS_LANGUAGE_CODE || "en-GB";
const GOOGLE_TTS_DEFAULT_VOICE = process.env.GOOGLE_TTS_VOICE || "en-GB-Neural2-F";

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
const AUTH_STORE_SCHEMA_VERSION = 1;
const AUTH_COOKIE_NAME = "cosmica_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const MAX_SESSIONS_PER_USER = 6;
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
    label: "Practice 12 cards",
    target: 12,
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

const normalizeUserData = (value) => {
  const base = createDefaultUserData();
  const candidate = cloneObjectSafely(value, createDefaultUserData, MAX_USER_DATA_SERIALIZED_CHARS);
  const settings = isPlainObject(candidate.settings) ? candidate.settings : {};
  base.settings.baseLanguage = String(settings.baseLanguage || "").trim().slice(0, 40);
  base.profile = isPlainObject(candidate.profile)
    ? cloneObjectSafely(candidate.profile, () => ({}), 20000)
    : {};
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
  const explicitEmailVerified =
    typeof candidate.emailVerified === "boolean" ? candidate.emailVerified : null;
  const emailVerified =
    explicitEmailVerified !== null ? explicitEmailVerified : authProvider === "google" || authProvider === "";
  const normalizedEmailVerification = normalizeEmailVerificationState(candidate.emailVerification);
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
    emailVerification: emailVerified ? createEmptyEmailVerificationState() : normalizedEmailVerification,
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

const writeAuthStoreSync = (store) => {
  if (!fs.existsSync(AUTH_DATA_ROOT)) {
    fs.mkdirSync(AUTH_DATA_ROOT, { recursive: true });
  }
  fs.writeFileSync(AUTH_STORE_FILE, JSON.stringify(store, null, 2), "utf8");
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
    const fallback = createEmptyAuthStore();
    try {
      writeAuthStoreSync(fallback);
    } catch {}
    return fallback;
  }
};

let authStore = loadAuthStoreFromDisk();
let authStorePersistQueue = Promise.resolve();

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

const markAuthStoreDirty = () => {
  authStore.updatedAt = new Date().toISOString();
  void queuePersistAuthStore();
};

const hashText = (value) => crypto.createHash("sha256").update(String(value || "")).digest("hex");
const hashSessionToken = (token) => hashText(token);
const hashEmailVerificationToken = (token) => hashText(`email-verify:${String(token || "")}`);

const createEmailVerificationChallenge = () => {
  const rawToken = crypto.randomBytes(32).toString("base64url");
  return {
    rawToken,
    tokenHash: hashEmailVerificationToken(rawToken),
    expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS).toISOString(),
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

const toPublicUser = (userRecord) => ({
  id: userRecord.id,
  email: userRecord.email,
  displayName: userRecord.displayName,
  emailVerified: userRecord.emailVerified !== false,
  createdAt: userRecord.createdAt,
  updatedAt: userRecord.updatedAt,
  lastLoginAt: userRecord.lastLoginAt || null,
});

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

const requireAuthenticatedUser = (req, res, next) => {
  if (!req.authUser) {
    return res.status(401).json({ error: "Authentication required" });
  }
  return next();
};

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
  return `${getRequestOrigin(req)}/api/auth/google/callback`;
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

const buildEmailVerificationLink = (req, rawToken, returnTo = "/index.html") => {
  const origin = getPublicAppOrigin(req);
  const verifyUrl = new URL("/api/auth/verify-email", origin);
  verifyUrl.searchParams.set("token", String(rawToken || "").trim());
  verifyUrl.searchParams.set("returnTo", sanitizeReturnToPath(returnTo));
  return verifyUrl.toString();
};

const sendAccountVerificationEmail = async ({ req, email, displayName, rawToken, returnTo }) => {
  const verifyUrl = buildEmailVerificationLink(req, rawToken, returnTo);
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

const buildAuthErrorRedirectPath = (code, returnTo = "/index.html") => {
  const safeTarget = sanitizeReturnToPath(returnTo);
  try {
    const parsed = new URL(safeTarget, "http://localhost");
    parsed.searchParams.set("authError", String(code || "google"));
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return `/index.html?authError=${encodeURIComponent(String(code || "google"))}`;
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
const ALLOWED_PROGRESS_STATUS = new Set(["started", "practiced", "reviewed", "completed"]);

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

const updateQuestProgressFromEvent = (progress, eventContext) => {
  const gamification = progress.gamification;
  const tasks = gamification.quests.tasks;
  if (!tasks) {
    return false;
  }

  if (eventContext.status === "practiced" || eventContext.status === "reviewed") {
    incrementQuestTaskProgress(tasks.practice, 1);
  }
  if (eventContext.status === "started" && eventContext.isFirstSectionVisit) {
    incrementQuestTaskProgress(tasks.discover, 1);
  }
  if (eventContext.status === "completed" && eventContext.isFirstCompletion) {
    incrementQuestTaskProgress(tasks.complete, 1);
  }

  const previouslyAllCompleted = Boolean(gamification.quests.allCompleted);
  const nowAllCompleted = Object.values(tasks).every((task) => task.completed);
  gamification.quests.allCompleted = nowAllCompleted;
  if (!previouslyAllCompleted && nowAllCompleted) {
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

const syncBadgesAndLevel = (progress, worldKey, nowIso) => {
  const gamification = progress.gamification;
  const worldSet = new Set(gamification.stats.worldsEngaged || []);
  if (worldKey) {
    worldSet.add(worldKey);
  }
  gamification.stats.worldsEngaged = [...worldSet].slice(0, 30);

  const levelMeta = deriveLevelMetaFromXp(progress.totals.xp);
  gamification.level = levelMeta.level;
  gamification.nextLevelXp = levelMeta.nextLevelXp;

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
  const now = new Date().toISOString();
  const dateKey = getUtcDateKeyFromIso(now);

  userRecord.progress = normalizeProgress(userRecord.progress);
  const progress = userRecord.progress;
  ensureProgressContainers(progress, worldKey, mapKey);
  const mapProgress = progress.worlds[worldKey].maps[mapKey];
  const previous = isPlainObject(mapProgress.sections[sectionKey]) ? mapProgress.sections[sectionKey] : null;
  const previousStatus = String(previous?.status || "").toLowerCase();
  const isFirstCompletion = status === "completed" && previousStatus !== "completed";
  const isFirstSectionVisit = !previous || toBoundedInt(previous.visitCount, 0, 5000000) === 0;

  const gamification = ensureGamificationDateState(progress, dateKey);
  const xpDelta = computeEventXpDelta(status, mapKey, previous, gamification.daily);

  const nextVisitCount = toBoundedInt(previous?.visitCount, 0, 5000000) + (status === "started" ? 1 : 0);
  const nextPracticeCount =
    toBoundedInt(previous?.practiceCount, 0, 50000000) + (status === "practiced" ? 1 : 0);
  const nextReviewCount =
    toBoundedInt(previous?.reviewCount, 0, 50000000) + (status === "reviewed" ? 1 : 0);
  const nextCompletionCount =
    toBoundedInt(previous?.completionCount, 0, 5000000) + (status === "completed" ? 1 : 0);

  mapProgress.sections[sectionKey] = {
    status,
    score,
    visitCount: nextVisitCount,
    practiceCount: nextPracticeCount,
    reviewCount: nextReviewCount,
    completionCount: nextCompletionCount,
    firstStartedAt: previous?.firstStartedAt || (status === "started" ? now : null),
    lastUpdatedAt: now,
    firstCompletedAt:
      status === "completed"
        ? previous?.firstCompletedAt || now
        : previous?.firstCompletedAt || null,
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
  if (status === "completed" && previous?.status !== "completed") {
    mapProgress.completedCount = Math.max(0, Number(mapProgress.completedCount || 0) + 1);
    progress.totals.completedSections = Math.max(0, Number(progress.totals.completedSections || 0) + 1);
  }

  progress.totals.xp = Math.max(0, Number(progress.totals.xp || 0) + xpDelta);
  progress.totals.lastActivityAt = now;
  gamification.daily.events = toBoundedInt(Number(gamification.daily.events || 0) + 1, 0, 50000);
  gamification.daily.xpEarned = toBoundedInt(
    Number(gamification.daily.xpEarned || 0) + Math.max(0, xpDelta),
    0,
    30000
  );
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
  if (status === "completed") {
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
  if (status === "practiced") {
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
  if (isFirstCompletion) {
    gamification.stats.sectionsCompleted = toBoundedInt(
      Number(gamification.stats.sectionsCompleted || 0) + 1,
      0,
      5000000
    );
  }

  updateQuestProgressFromEvent(progress, {
    status,
    isFirstCompletion,
    isFirstSectionVisit,
  });
  syncBadgesAndLevel(progress, worldKey, now);

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
  if (!flowCookieToken || !stateFlowToken || flowCookieToken !== stateFlowToken) {
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

    const nowIso = new Date().toISOString();
    const existingUserId = authStore.emailIndex[email];
    let userRecord = existingUserId ? authStore.users[existingUserId] : null;
    const authMode = String(stateData?.mode || "").trim().toLowerCase() === "signup" ? "signup" : "login";

    if (!userRecord && authMode !== "signup") {
      return res.redirect(302, buildAuthErrorRedirectPath("google_no_account"));
    }

    if (userRecord && authMode === "signup") {
      return res.redirect(302, buildAuthErrorRedirectPath("google_account_exists"));
    }

    if (!userRecord) {
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

  if (!rawToken || rawToken.length < 20) {
    return res.redirect(302, buildAuthErrorRedirectPath("email_verify_invalid", returnTo));
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
    return res.redirect(302, buildAuthErrorRedirectPath("email_verify_invalid", returnTo));
  }

  if (userRecord.emailVerified === true) {
    return res.redirect(302, buildAuthErrorRedirectPath("email_verified", returnTo));
  }

  const verificationState = normalizeEmailVerificationState(userRecord.emailVerification);
  const expiresAtMs = Date.parse(String(verificationState.expiresAt || ""));
  if (!Number.isFinite(expiresAtMs) || expiresAtMs < Date.now()) {
    return res.redirect(302, buildAuthErrorRedirectPath("email_verify_expired", returnTo));
  }

  userRecord.emailVerified = true;
  userRecord.emailVerification = createEmptyEmailVerificationState();
  userRecord.updatedAt = new Date().toISOString();
  markAuthStoreDirty();
  return res.redirect(302, buildAuthErrorRedirectPath("email_verified", returnTo));
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

  try {
    const existingUserId = authStore.emailIndex[email];
    const existingUser = existingUserId ? authStore.users[existingUserId] : null;
    if (existingUser) {
      if (existingUser.emailVerified === false) {
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
      data: {
        settings: {
          baseLanguage,
        },
        profile: {},
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
      if (createdUser && createdUser.email === email && createdUser.emailVerified === false) {
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
  if (!hasAnyEmailDeliveryConfig()) {
    return res.status(503).json({ error: "Email verification is not configured yet" });
  }

  const userId = authStore.emailIndex[email];
  const userRecord = userId ? authStore.users[userId] : null;
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
    return res.status(400).json({ error: "Invalid email or password" });
  }

  const userId = authStore.emailIndex[email];
  const userRecord = userId ? authStore.users[userId] : null;
  if (!userRecord) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  try {
    const validPassword = await verifyPasswordAgainstRecord(password, userRecord.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (userRecord.emailVerified === false) {
      return res.status(403).json({
        error: "Please verify your email first. Check your inbox for the verification link.",
        verificationRequired: true,
      });
    }

    userRecord.lastLoginAt = new Date().toISOString();
    userRecord.updatedAt = userRecord.lastLoginAt;
    markAuthStoreDirty();
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

app.get("/api/auth/me", authSessionLimiter, requireAuthenticatedUser, (req, res) => {
  const userRecord = req.authUser;
  return res.json({
    ok: true,
    user: toPublicUser(userRecord),
    data: cloneForResponse(normalizeUserData(userRecord.data)),
    progress: cloneForResponse(normalizeProgress(userRecord.progress)),
  });
});

app.delete("/api/auth/account", authSessionLimiter, requireAuthenticatedUser, async (req, res) => {
  const password = String(req.body?.password || "");
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: "Password is required" });
  }

  const userRecord = req.authUser;
  try {
    const validPassword = await verifyPasswordAgainstRecord(password, userRecord.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    delete authStore.emailIndex[userRecord.email];
    delete authStore.users[userRecord.id];
    removeAllSessionsForUser(userRecord.id);
    clearAuthSessionCookie(req, res);
    markAuthStoreDirty();
    return res.json({ ok: true });
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
    req.authUser.data = normalizeUserData(incoming);
    req.authUser.updatedAt = new Date().toISOString();
    markAuthStoreDirty();
    return res.json({
      ok: true,
      data: cloneForResponse(req.authUser.data),
    });
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

/* --------------------------------------------------------------------------
   ROUTE: HEALTH CHECK
   -------------------------------------------------------------------------- */
app.get("/api/health", healthLimiter, (req, res) => {
  res.json({
    status: "ok",
    version: APP_VERSION,
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
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
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

