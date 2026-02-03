const path = require("path");
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "1mb" }));

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

app.use(express.static(path.join(__dirname)));

const createClient = (apiKey) => new OpenAI({ apiKey });
const getChatClient = () =>
  createClient(process.env.OPENAI_CHAT_KEY || process.env.OPENAI_API_KEY);

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

app.post("/api/feedback", async (req, res) => {
  const mailer = getMailer();
  if (!mailer) {
    return res.status(500).json({ error: "Missing SMTP configuration" });
  }

  const { name, email, message } = req.body || {};
  const safeName = typeof name === "string" ? name.trim() : "";
  const safeEmail = typeof email === "string" ? email.trim() : "";
  const safeMessage = typeof message === "string" ? message.trim() : "";

  if (!safeName || !safeEmail || !safeMessage) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const to = process.env.FEEDBACK_TO || process.env.SMTP_USER;
  const fromAddress = process.env.FEEDBACK_FROM || process.env.SMTP_USER;
  if (!to || !fromAddress) {
    return res.status(500).json({ error: "Missing FEEDBACK_TO or FEEDBACK_FROM" });
  }

  try {
    const displayName = safeName && safeEmail ? `${safeName} (${safeEmail})` : safeName;
    const fromHeader = displayName ? `${displayName} <${fromAddress}>` : fromAddress;
    const replyToHeader = safeEmail
      ? safeName
        ? `${safeName} <${safeEmail}>`
        : safeEmail
      : undefined;

    await mailer.sendMail({
      from: fromHeader,
      to,
      replyTo: replyToHeader,
      subject: `Cosmica feedback from ${safeName}${safeEmail ? ` (${safeEmail})` : ""}`,
      text: `Name: ${safeName}\nEmail: ${safeEmail}\n\n${safeMessage}`,
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error("Feedback error:", error.message || error);
    return res.status(500).json({ error: "Failed to send feedback" });
  }
});

app.post("/api/chat", async (req, res) => {
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
    console.error("Chat error:", error.message || error);
    return res.status(500).json({ error: "Chat request failed" });
  }
});


app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
