/* ==========================================================================
   COSMICA API SERVER
   Serves static site assets and exposes feedback/chat API endpoints.
   ========================================================================== */
const path = require("path");
const crypto = require("crypto");
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
    return require("./package.json").version || "unknown";
  } catch {
    return "unknown";
  }
})();
const isProduction = process.env.NODE_ENV === "production";

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
        connectSrc: ["'self'", "https://www.cosmicalearn.com", "https://cosmicalearn.com"],
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

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || isLocalOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  })
);

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
  "/world-french.html",
  "/letters-french.html",
  "/words-french.html",
  "/phrases-french.html",
  "/grammar-french.html",
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

app.use(
  express.static(path.join(__dirname), {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === ".html") {
        // Keep documents always fresh so mobile browsers never pin stale layout shells.
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
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
app.use("/api", apiLimiter);

/* --------------------------------------------------------------------------
   SECURITY CONTACT FILE
   -------------------------------------------------------------------------- */
app.get("/.well-known/security.txt", (req, res) => {
  res.type("text/plain");
  return res.sendFile(path.join(__dirname, "security.txt"));
});

/* --------------------------------------------------------------------------
   SERVICE CLIENT HELPERS (OPENAI + EMAIL)
   -------------------------------------------------------------------------- */
const createClient = (apiKey) => new OpenAI({ apiKey });
const getChatClient = () => createClient(process.env.OPENAI_CHAT_KEY || process.env.OPENAI_API_KEY);
const ERROR_WEBHOOK_URL = process.env.ERROR_WEBHOOK_URL || "";
const RUM_WEBHOOK_URL = process.env.RUM_WEBHOOK_URL || "";

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
   ROUTE: FEEDBACK SUBMISSION
   -------------------------------------------------------------------------- */
app.post("/api/feedback", feedbackLimiter, async (req, res) => {
  const { name, email, message } = req.body || {};
  const safeName = typeof name === "string" ? name.trim() : "";
  const safeEmail = typeof email === "string" ? email.trim() : "";
  const safeMessage = typeof message === "string" ? message.trim() : "";

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
