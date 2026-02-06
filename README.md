# Cosmica Website

## What is this?
Cosmica is a static front-end site with a small Node/Express backend for chat and feedback.

## Project layout
- HTML pages: `index.html`, `world*.html`, `words*.html`, `phrases*.html`, `letters*.html`, `grammar*.html`
- Styles: `style.css`
- Front-end logic: `app.js`
- Server: `server.js`
- Translations: `translations.json`, `translations.french.json`
- Scripts: `scripts/` (translation generators)
- SEO: `sitemap.xml`, `robots.txt`

## How to keep code organized (safe)
- **Do not remove code** unless you verify it’s unused (use browser coverage first).
- **Format only** to improve readability:
  - Run: `npm run format`
- **Add comments** to mark sections instead of moving code.
- Keep HTML in page order, CSS in section order, JS in feature order.

## Local run
```bash
npm install
npm start
```

## Formatting
```bash
npm run format
```
