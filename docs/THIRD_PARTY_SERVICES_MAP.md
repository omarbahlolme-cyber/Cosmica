# Third-Party Services Map

Use this file as the control-plane map for all external services used to run and maintain Cosmica.

## 1) Platform roles (what each service does)

| Platform | Main role for Cosmica | Where to manage | Key config in project |
|---|---|---|---|
| Render | Production hosting/runtime (backend + static serving), env vars, deploys, logs | Render Dashboard | `AUTH_STORE_BACKEND`, `AUTH_POSTGRES_URL`/`DATABASE_URL`, all runtime secrets in Render Environment |
| Cloudflare | DNS, TLS/SSL edge, caching/WAF/domain protection | Cloudflare Dashboard | Domain DNS + SSL policies (no direct app env key) |
| GitHub | Source control, CI/CD workflows, backup/security automation | GitHub repo + Actions | `.github/workflows/*`, branch protection rules |
| Google Cloud Console | Google OAuth app + optional Google TTS credentials | Google Cloud Console | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`, `GOOGLE_TTS_*` |
| Google Search Console | Google indexing/coverage/canonical monitoring | Search Console | `frontend/robots.txt`, `frontend/sitemap.xml`, canonical tags |
| Bing Webmaster | Bing indexing/coverage monitoring | Bing Webmaster Tools | same crawl assets as Google (`robots.txt`, `sitemap.xml`) |
| Naver Webmaster | Naver indexing/coverage monitoring | Naver Search Advisor | same crawl assets as Google (`robots.txt`, `sitemap.xml`) |
| Stripe | Paid subscription lifecycle (checkout/webhooks/subscription state) | Stripe Dashboard | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PREMIUM_PRICE_ID` |
| Ko-fi | Premium purchase links + webhook events (if using Ko-fi path) | Ko-fi Dashboard | `KOFI_PREMIUM_MONTHLY_URL`, `KOFI_WEBHOOK_VERIFICATION_TOKEN` |
| Resend | Transactional email delivery (verification/reset/feedback) | Resend Dashboard | `RESEND_API_KEY`, sender/domain plus `AUTH_FROM`/`FEEDBACK_FROM` |
| Slack | Alert sink for auth/signup/security notifications | Slack App/Webhooks | `SIGNUP_WEBHOOK_URL`, `AUTH_ALERT_WEBHOOK_URL` |
| UptimeRobot | External uptime monitoring and alerting | UptimeRobot Dashboard | monitor URLs (no app env key) |
| OpenAI Platform | Chat/translation AI APIs (ChatGPT/OpenAI endpoints) | OpenAI Platform | `OPENAI_CHAT_KEY` (or `OPENAI_API_KEY`), `OPENAI_TRANSLATE_KEY` |

## 2) Fast ownership by system area

1. Hosting/runtime:
- Render, Cloudflare

2. Code + automation:
- GitHub

3. Identity + language APIs:
- Google Cloud Console, OpenAI Platform

4. Billing/subscription:
- Stripe, Ko-fi

5. Email + alerts:
- Resend, Slack

6. SEO/indexing:
- Google Search Console, Bing Webmaster, Naver Webmaster

7. Availability monitoring:
- UptimeRobot

## 3) What to check when one platform fails

1. Render issue:
- Symptom: site/API down or env not applied.
- First checks: Render deploy status, logs, Environment keys.

2. Cloudflare issue:
- Symptom: DNS mismatch, SSL errors, unexpected caching.
- First checks: DNS records, SSL mode, cache rules.

3. GitHub issue:
- Symptom: quality checks not running or failing unexpectedly.
- First checks: Actions logs, branch protection, workflow changes.

4. Google OAuth issue:
- Symptom: Google sign-in fails or redirect mismatch.
- First checks: OAuth redirect URI in GCP vs `GOOGLE_OAUTH_REDIRECT_URI`, domain/origin consistency.

5. Google TTS issue:
- Symptom: pronunciation audio fails for TTS path.
- First checks: `GOOGLE_TTS_ENABLED`, `GOOGLE_TTS_CREDENTIALS_B64`, logs.

6. Stripe issue:
- Symptom: premium not upgrading/downgrading correctly.
- First checks: webhook deliveries, `STRIPE_WEBHOOK_SECRET`, `npm run billing:contract`.

7. Ko-fi issue:
- Symptom: Ko-fi paid event not updating premium.
- First checks: webhook token, webhook payload delivery, `npm run verify:prod-integrations`.

8. Resend issue:
- Symptom: verification/reset emails not delivered.
- First checks: API key, sender domain status, `AUTH_FROM`, `npm run auth:check:readiness`.

9. Slack issue:
- Symptom: no auth/signup alerts.
- First checks: webhook URL validity and recent delivery logs.

10. SEO platform issue (Google/Bing/Naver):
- Symptom: pages not indexed or dropped.
- First checks: `npm run generate:sitemap`, `npm run indexing:check`, submit updated sitemap.

11. UptimeRobot issue:
- Symptom: no uptime alerts or false alarms.
- First checks: monitor URL, intervals, alert contacts.

12. OpenAI issue:
- Symptom: chat/translation endpoints fail.
- First checks: API key validity, usage limits, backend logs for upstream errors.

## 4) Command checklist by change type

1. SEO/indexing changes (new pages, canonical, sitemap):

```bash
npm run generate:sitemap
npm run check:seo
npm run indexing:check
```

2. Auth/email/provider changes:

```bash
npm run auth:check:readiness
npm run auth:provider:contract
npm run verify:prod-integrations
```

3. Billing/premium changes:

```bash
npm run billing:user-state:contract
npm run billing:contract
npm run smoke:premium:continuity
```

4. Full cross-device confidence before release:

```bash
npm run check:a11y
npm run verify:pc-mobile
npm run verify:viewport:browsers
npm run quality
```

## 5) Operational guardrails

1. Keep secrets only in env stores (Render/GitHub secrets), not in committed files.
2. Keep `ALLOW_SELF_PREMIUM_UPGRADE=false` (or unset) in production.
3. For live manual premium on no-shell Render, use admin API with `x-admin-token` (see `docs/OPERATIONS_HARDENING.md`).
4. Keep production auth on Postgres (`AUTH_STORE_BACKEND=postgres`).
