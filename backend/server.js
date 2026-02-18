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
const authSessionLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 120,
  scope: "auth-session",
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

const isPlainObject = (value) =>
  Boolean(value) && Object.prototype.toString.call(value) === "[object Object]";

const createDefaultUserData = () => ({
  settings: {
    baseLanguage: "",
  },
  profile: {},
});

const createDefaultProgress = () => ({
  totals: {
    xp: 0,
    completedSections: 0,
    lastActivityAt: null,
  },
  worlds: {},
  recentEvents: [],
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
    ? candidate.recentEvents.slice(-50).map((event) => ({
        worldKey: String(event?.worldKey || "").slice(0, 40),
        mapKey: String(event?.mapKey || "").slice(0, 20),
        sectionKey: String(event?.sectionKey || "").slice(0, 120),
        status: String(event?.status || "").slice(0, 20),
        xpDelta: Number.isFinite(event?.xpDelta) ? Math.round(Number(event.xpDelta)) : 0,
        timestamp: String(event?.timestamp || "").slice(0, 40),
      }))
    : [];
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
    data: normalizeUserData(candidate.data),
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
const ALLOWED_PROGRESS_STATUS = new Set(["started", "completed", "reviewed"]);

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
      completedCount: 0,
      updatedAt: null,
    };
  }
  if (!isPlainObject(progress.worlds[worldKey].maps[mapKey].sections)) {
    progress.worlds[worldKey].maps[mapKey].sections = {};
  }
};

const trackProgressEventForUser = (userRecord, payload) => {
  const worldKey = normalizeWorldKey(payload.worldKey);
  const mapKey = normalizeMapKey(payload.mapKey);
  const sectionKey = normalizeSectionKey(payload.sectionKey);
  const status = String(payload.status || "started").trim().toLowerCase();
  const scoreRaw = Number(payload.score);
  const xpDeltaRaw = Number(payload.xpDelta);

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
  const xpDelta = Number.isFinite(xpDeltaRaw) ? Math.max(-1000, Math.min(5000, Math.round(xpDeltaRaw))) : 0;
  const now = new Date().toISOString();

  userRecord.progress = normalizeProgress(userRecord.progress);
  const progress = userRecord.progress;
  ensureProgressContainers(progress, worldKey, mapKey);
  const mapProgress = progress.worlds[worldKey].maps[mapKey];
  const previous = isPlainObject(mapProgress.sections[sectionKey]) ? mapProgress.sections[sectionKey] : null;

  mapProgress.sections[sectionKey] = {
    status,
    score,
    lastUpdatedAt: now,
    firstCompletedAt:
      status === "completed"
        ? previous?.firstCompletedAt || now
        : previous?.firstCompletedAt || null,
  };

  if (status === "completed" && previous?.status !== "completed") {
    mapProgress.completedCount = Math.max(0, Number(mapProgress.completedCount || 0) + 1);
    progress.totals.completedSections = Math.max(0, Number(progress.totals.completedSections || 0) + 1);
  }

  progress.totals.xp = Math.max(0, Number(progress.totals.xp || 0) + xpDelta);
  progress.totals.lastActivityAt = now;
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
  progress.recentEvents = progress.recentEvents.slice(-50);
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
app.post("/api/auth/signup", authSignupLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");
  const displayName = sanitizeDisplayName(req.body?.displayName, email);
  const baseLanguage = String(req.body?.baseLanguage || "").trim().slice(0, 40);

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: "Password must be 8-128 characters" });
  }
  if (authStore.emailIndex[email]) {
    return res.status(409).json({ error: "Account already exists" });
  }

  try {
    const passwordRecord = await buildPasswordRecord(password);
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();
    authStore.users[userId] = {
      id: userId,
      email,
      displayName,
      password: passwordRecord,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      data: {
        settings: {
          baseLanguage,
        },
        profile: {},
      },
      progress: createDefaultProgress(),
    };
    authStore.emailIndex[email] = userId;
    const sessionToken = createSessionForUser(userId, req);
    setAuthSessionCookie(req, res, sessionToken);

    return res.status(201).json({
      ok: true,
      user: toPublicUser(authStore.users[userId]),
      data: cloneForResponse(authStore.users[userId].data),
      progress: cloneForResponse(authStore.users[userId].progress),
    });
  } catch (error) {
    reportServerError("auth-signup", error, {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
    });
    return res.status(500).json({ error: "Failed to create account" });
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

