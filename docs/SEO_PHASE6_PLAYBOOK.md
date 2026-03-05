# SEO Phase 6 Playbook

Phase 6 focuses on ranking growth with low risk:

1. Verify crawl/index health in Google Search Console and Bing Webmaster.
2. Use real query data to improve titles/meta on weak CTR pages.
3. Keep internal links strong so important pages are easy to crawl.

## Commands

Run local SEO health and internal-link checks:

```bash
npm run check:seo
npm run check:seo:links
npm run indexing:check
```

Generate a CTR opportunity report from Search Console export:

```bash
npm run seo:ctr:report -- --input perf/search-console-page-query.csv
```

Run combined Phase 6 workflow:

```bash
npm run seo:phase6 -- --input perf/search-console-page-query.csv
```

The CTR report is written to:

- `perf/seo-ctr-opportunities.json`

## Quick Start (Simple)

1. Export real CSV from Google Search Console:
- Open `Search results` report.
- Click `+ New` -> `Page` -> `Add all pages` (optional but recommended).
- Click `EXPORT` -> `Download CSV`.

2. Save that file as:
- `perf/search-console-page-query.csv`

3. Run:

```bash
npm run seo:phase6 -- --input perf/search-console-page-query.csv
```

4. Open result report:
- `perf/seo-ctr-opportunities.json`

## Search Console + Bing workflow

1. In Google Search Console:
- Confirm property `https://www.cosmicalearn.com`.
- Submit `https://www.cosmicalearn.com/sitemap.xml`.
- Open `Pages` report and confirm important map/world pages are indexed.
- Export a `Pages + Queries` report as CSV to `perf/search-console-page-query.csv`.

2. In Bing Webmaster Tools:
- Confirm site ownership.
- Submit the same sitemap URL.
- Review crawl/index errors and resolve any canonical or fetch issues.

3. Update metadata from report:
- Prioritize pages with high impressions, low CTR, and avg position <= 20.
- Update titles/meta descriptions in generators (`scripts/refresh-seo-copy.js`, `scripts/generate-seo-landing-pages.js`, `scripts/generate-localized-seo-pages.js`).
- Regenerate pages and sitemap, then rerun checks.

## Safe update sequence

```bash
node scripts/refresh-seo-copy.js
node scripts/generate-seo-landing-pages.js
node scripts/generate-localized-seo-pages.js
npm run generate:sitemap
npm run check:seo
npm run check:seo:links
npm run indexing:check
```

## Notes

- `seo-ctr-opportunities.js` is advisory only; it never edits HTML.
- If no Search Console CSV exists yet, the report command safely exits with `SKIP`.
- Keep edits small and batch by 5-10 pages, then measure CTR deltas over 2-4 weeks.
