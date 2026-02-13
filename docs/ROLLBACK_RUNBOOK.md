# Rollback Runbook

Use this runbook when production is unhealthy and you need a safe, fast rollback.

## Core principles

1. Prefer non-destructive rollback (`git revert`) over history rewrite.
2. Roll back on a dedicated branch, then merge via PR.
3. Validate locally before pushing.
4. Deploy `main` only after CI checks pass.

## Quick diagnostics (copy/paste)

```bash
git status
git branch --show-current
git log --oneline -n 20
git tag --sort=-creatordate | head -n 10
npm run rollback:info
```

## A) Full rollback to a known-good release tag

Example target tag: `v1.1.0`.

### 1) Prepare rollback branch

```bash
git checkout main
git pull origin main
git checkout -b rollback/v1.1.0-hotfix
```

### 2) Revert all commits after that tag

```bash
git revert --no-edit $(git rev-list -n 1 v1.1.0)..HEAD
```

### 3) Validate

```bash
npm install
npm run quality
```

### 4) Push and open PR

```bash
git push -u origin rollback/v1.1.0-hotfix
```

Open PR to `main`, merge after checks pass.

## B) Roll back one bad commit only

Use this when only one release change is broken.

```bash
git checkout main
git pull origin main
git checkout -b rollback/revert-bad-commit
git revert --no-edit <bad_commit_sha>
npm run quality
git push -u origin rollback/revert-bad-commit
```

## C) Roll back selected files/folders only

Use this when one area is broken (for example only `frontend/` styles).

```bash
git checkout main
git pull origin main
git checkout -b rollback/partial-hotfix
git restore --source v1.1.0 -- frontend/style.css frontend/maps/style-maps.css
git add frontend/style.css frontend/maps/style-maps.css
git commit -m "rollback(partial): restore stable styles from v1.1.0"
npm run quality
git push -u origin rollback/partial-hotfix
```

## Deploy + cache refresh checklist

1. Merge rollback PR into `main`.
2. Deploy latest `main` in Render.
3. Purge Cloudflare cache (`Purge Everything`).
4. Verify:
   - `https://www.cosmicalearn.com/api/health` returns `status: ok`
   - Homepage and key maps load
   - Chat / Translate / Feedback / TTS endpoints respond normally

## Useful verification commands

```bash
curl.exe -i https://www.cosmicalearn.com/api/health
curl.exe -I https://www.cosmicalearn.com
npm run smoke
npm run quality
```

## Abort and recovery commands (during rollback work)

If a git operation gets stuck/conflicted:

```bash
git merge --abort
git rebase --abort
git revert --abort
git cherry-pick --abort
```

If you have local edits you need to pause:

```bash
git stash push -u -m "wip-before-rollback"
git stash list
git stash pop
```

## Backup/restore references

Create and verify backup snapshot:

```bash
npm run backup:create
npm run backup:verify
```

List latest backup files:

```bash
ls backups
```

## Post-incident notes template

Record this in your incident notes:

1. Trigger and root cause summary.
2. Rollback strategy used (A/B/C above).
3. Tag or commit reverted.
4. Rollback PR link.
5. Render deploy time (UTC).
6. Cloudflare purge time (UTC).
7. Follow-up fix PR(s).
