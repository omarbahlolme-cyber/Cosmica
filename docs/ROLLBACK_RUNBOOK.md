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

## Local reset to latest commit (destructive, copy/paste)

Use this when your local repo has become messy and you want to go back to the latest committed state exactly as it is in git.

Important:
1. `git reset --hard HEAD` deletes all uncommitted changes in tracked files.
2. `git clean -fd` deletes untracked files and folders.
3. If you may want the current local state later, stash it first.

### 1) Check what will be affected first

```bash
git status
git log -1 --oneline
```

### 2) Safer option: save current local state first

```bash
git stash push -u -m "temp backup before full local reset"
git stash list
```

If you later want that local state back:

```bash
git stash pop
```

### 3) Full local reset to latest commit

```bash
git reset --hard HEAD
git clean -fd
```

### 4) Verify you are fully back to the latest commit

```bash
git status --short
git rev-parse --short HEAD
git log -1 --oneline
```

Expected result:
1. `git status --short` prints nothing (clean working tree).
2. `git rev-parse --short HEAD` shows the current commit SHA.
3. `git log -1 --oneline` shows the latest commit message.

### 5) If you reset too far or want to inspect previous local HEAD positions

```bash
git reflog -10
```

This helps you see:
1. previous commits you were on
2. recent resets
3. whether your local state returned to the intended commit

### 6) Compare current state against the previous commit

```bash
git diff --stat HEAD~1 HEAD
```

Use this when:
1. the repo is clean
2. but you suspect your latest commit already contained an unwanted revert or extra deletion

### 7) Recover local dangling objects only if needed

```bash
git fsck --lost-found
```

Use this only as a last resort when uncommitted work was lost and you want to see whether git can still recover loose objects.

## Backup/restore references

Create and verify backup snapshot:

```bash
npm run backup:create
npm run backup:verify
```

Backup scope note:
1. `npm run backup:create` uses `git archive HEAD` + `git bundle --all`.
2. That means backups include committed/tracked repository content at `HEAD`.
3. Local scratch files (for example `tmp/`) are not included unless tracked/committed.

List latest backup files:

```bash
ls backups
```

Inspect latest backup manifest quickly:

```bash
ls backups/*.json
cat backups/<latest-manifest>.json
```

Restore from bundle into a clean folder:

```bash
git clone backups/<backup>.bundle restored-site
cd restored-site
npm install
npm run quality
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
