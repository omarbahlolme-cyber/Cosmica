# Cosmica Website

Cosmica is a static language-learning site with a small Node/Express backend for chat and feedback APIs.

## Developer map

- Full file-by-file map: `PROJECT_STRUCTURE.md`
- Front-end entry points: `index.html`, `world*.html`, `letters*.html`, `words*.html`, `phrases*.html`, `grammar*.html`
- Base front-end logic: `app.js`
- Map-only front-end bundle: `app-maps.js`
- Shared styling: `style.css`
- Map-only styling: `style-maps.css`
- Backend/API: `server.js`
- Translation data: `translations.json`, `translations.french.json`
- Translation generators: `scripts/`

## Organization standards

1. Keep URL-facing HTML files in root unless route changes are intentional.
2. Keep non-functional cleanups focused on comments, structure, and formatting.
3. Add section headers for every major block in JS/CSS/server/script files.
4. Preserve behavior for readability-only refactors.

## Local run

```bash
npm install
npm start
```

## Formatting

```bash
npm run format
```

## Smoke checks

```bash
npm run smoke
```

Runs two quick safeguards:
1. Verifies local HTML `href/src` references point to real files.
2. Starts the local server on an isolated port and checks core routes return `200`.

## Quality checks (CI + local)

```bash
npm run quality
```

Runs:
1. Syntax checks for key server/client bundles.
2. Bloat checks (orphan root assets + selector advisory report).
3. Performance regression check against `perf/baseline.json`.
4. Release hygiene checks (`CHANGELOG.md` + semver).
5. Smoke checks for links and core routes.

To refresh the perf baseline after intentional optimizations:

```bash
npm run perf:baseline
```
