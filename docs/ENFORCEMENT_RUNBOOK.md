# Enforcement Runbook

This runbook defines how Cosmica enforces `privacy.html`, `terms.html`, and `license.html` in production.

## Scope

Use this process for:
1. Privacy complaints or data-handling incidents.
2. Terms abuse (spam, scraping, bots, attacks, abusive traffic).
3. License violations (copying content/code/branding without permission).

## Roles

1. `Owner`: final decision and communication.
2. `Ops`: evidence collection (logs, request IDs, WAF events).
3. `Dev`: technical mitigation (rules, limits, blocks, patches).

## Severity

1. `SEV-1`: active abuse/outage/legal emergency.
2. `SEV-2`: repeated policy violation with no full outage.
3. `SEV-3`: low-impact complaint/report requiring review.

## Common Evidence Checklist

Collect before action:
1. UTC timestamp range.
2. Endpoint/page involved.
3. Source indicators (IP/ASN/country/user-agent if relevant).
4. Request IDs from API responses (`X-Request-Id`) where available.
5. Cloudflare event IDs/screenshots.
6. Reproduction links/screenshots.

Keep evidence in a dated incident note.

---

## A) Privacy Enforcement (`privacy.html`)

### Typical triggers

1. User says data misuse/privacy breach.
2. Unexpected personal data exposure.
3. Access-control/config issue exposing data.

### Immediate response

1. Triage severity (`SEV-1/2/3`).
2. Stop exposure path first (rule/config/hotfix).
3. Preserve logs/evidence.

### Containment actions

1. Tighten endpoint access/rate limits.
2. Rotate affected secrets/tokens.
3. Remove exposed artifacts from public paths/caches.

### Resolution

1. Confirm remediation in production.
2. Notify impacted users when required by applicable law.
3. Record root cause + prevention changes.

---

## B) Terms Enforcement (`terms.html`)

### Typical triggers

1. API abuse (chat/translate/tts flooding).
2. Bot/scraping behavior.
3. Attempted exploitation/scanning.

### Detection sources

1. Cloudflare WAF/security analytics.
2. API 429/5xx spikes.
3. Uptime/health workflow incidents.
4. Direct abuse reports.

### Enforcement ladder (professional default)

1. `Stage 1`: Managed Challenge / stricter rate limit.
2. `Stage 2`: Temporary block of offending fingerprint (IP/ASN/path).
3. `Stage 3`: Longer block + escalation notes if abuse continues.

### Resolution

1. Confirm traffic normalized.
2. Keep short evidence trail for repeat offenders.
3. Tune permanent guardrails only after verification.

---

## C) License Enforcement (`license.html`)

### Typical triggers

1. Mirrored site/code/assets with your branding/content.
2. Unauthorized redistribution or cloning.

### Verification

1. Capture infringing URLs and screenshots.
2. Compare unique text/assets/branding markers.
3. Save timestamps and whois/hosting info where possible.

### Enforcement actions

1. Send polite removal request first (if appropriate).
2. Send formal takedown notice to host/platform (GitHub/hosting/CDN/search).
3. Escalate to legal counsel for repeated/high-impact infringement.

### Resolution

1. Track notice sent date, response date, and outcome.
2. Recheck takedown result after 24-72h.

---

## Incident Note Template

Use this template:

1. `Incident ID`: YYYYMMDD-XX
2. `Type`: Privacy | Terms | License
3. `Severity`: SEV-1/2/3
4. `Detected at (UTC)`:
5. `Scope`:
6. `Evidence`:
7. `Action taken`:
8. `Status`: Open | Monitoring | Closed
9. `Postmortem owner`:

## Operational Tips

1. Use UTC in all records.
2. Keep actions reversible where possible.
3. Never store more personal data than needed for enforcement evidence.
4. Review this runbook quarterly.
