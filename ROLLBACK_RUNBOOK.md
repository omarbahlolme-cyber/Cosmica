# Rollback Runbook

Use this runbook when production is unhealthy and a fast, safe rollback is required.

## 1) Identify target release

List recent release tags and suggested commands:

```bash
npm run rollback:info
```

Choose the latest known-good semver tag (example: `v1.1.0`).

## 2) Prepare rollback branch

```bash
git checkout main
git pull origin main
git checkout -b rollback/v1.1.0-hotfix
```

Replace `v1.1.0` with your chosen target tag.

## 3) Revert main to target release state (non-destructive)

```bash
git revert --no-edit $(git rev-list -n 1 v1.1.0)..HEAD
```

This creates new revert commits instead of rewriting history.

## 4) Validate before shipping

```bash
npm install
npm run quality
```

If quality is green, continue.

## 5) Push and open PR

```bash
git push -u origin rollback/v1.1.0-hotfix
```

Open PR into `main`, merge after checks pass.

## 6) Deploy + cache refresh

1. Deploy latest `main` in Render.
2. Purge Cloudflare cache (`Purge Everything`).
3. Verify:
   - `/api/health` is `ok`
   - homepage and key maps load
   - chat/translate/feedback/tts endpoints respond normally

## 7) Post-incident record

Document:
1. Trigger/root cause.
2. Tag rolled back to.
3. Exact rollback PR and deploy time.
4. Follow-up fix PR(s).
