# Cosmica Website

Cosmica is a static language-learning site with a small Node/Express backend for chat and feedback APIs.

## Developer map

- Full file-by-file map: `PROJECT_STRUCTURE.md`
- Front-end entry points: `index.html`, `world*.html`, `letters*.html`, `words*.html`, `phrases*.html`, `grammar*.html`
- Shared front-end logic: `app.js`
- Shared styling: `style.css`
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
