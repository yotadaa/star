# Public SEO tooling and credential validation — 2026-09-01

## Result

Passed. Deployment-specific analytics and verification values now enter through
environment variables, no configured GA measurement ID or high-confidence
credential pattern remains in 2,391 tracked files, and the production indexing
surface passes a Googlebot-style crawl with zero failures or warnings.

Google's current minimum eligibility requirements are crawl access, HTTP 200,
and indexable content. Meeting them does not guarantee indexing. The live audit
tests those boundaries plus canonical, metadata, structured-data, sitemap, and
internal-discovery contracts. Sources:
[Google Search technical requirements](https://developers.google.com/search/docs/essentials/technical),
[Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
and [Google ownership verification](https://support.google.com/webmasters/answer/9008080?hl=en).

## Credential boundary

| Check | Result |
|---|---|
| Ignored local environment | `.env.local` is covered by `.gitignore` and is not tracked |
| Concrete configured GA ID in tracked files | 0 |
| High-confidence API key, OAuth client ID, bearer token, private key patterns | 0 |
| Tracked files scanned | 2,391 |
| Package or lockfile dependency change | None |
| Runtime guard tests | Valid IDs/tokens accepted; empty, malformed, and markup-like values omitted |

The GA measurement ID and ownership-verification tokens are browser-visible
public identifiers once rendered, but are env-configured to keep deployment
values out of source. `INDEXNOW_API_KEY` remains server-only. The scanner
reports only pattern labels and file/line locations on failure; it never prints
matched values.

Commands:

```text
npm run credentials:audit
npm run seo:env:verify
```

## Live indexing and discovery audit

`live-seo-audit.json` records the final production run:

| Gate | Result |
|---|---|
| `robots.txt` | HTTP 200, plain text, canonical sitemap declared, root allowed |
| Sitemap index | HTTP 200, XML, two same-origin child sitemaps |
| Public pages sitemap | 7 URLs |
| Blog sitemap | 37 URLs |
| Sitemap URL responses | 44/44 HTTP 200 |
| Self-canonicals, indexability, title, description, one H1, parseable JSON-LD | Passed on 44/44 |
| Home-led HTML crawl | 47 HTML pages including Blog pagination |
| Sitemap pages discoverable through normal HTML links | 44/44 |
| Failures / warnings | 0 / 0 |

Command:

```text
npm run seo:audit -- --output=validation/public-seo-credentials-tooling-2026-09-01/live-seo-audit.json
```

Google documents that sitemap submission is a hint rather than a guarantee and
recommends absolute canonical URLs. The audit deliberately normalizes only the
equivalent root trailing slash and otherwise requires a self-canonical.

## Verification metadata and external tools

- `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`, and
  `AHREFS_SITE_VERIFICATION` render their exact platform meta names only when a
  bounded token value is present.
- A Search Console Domain property uses DNS verification and no app env.
- Ahrefs recommends importing a matching verified Search Console property; its
  optional HTML-tag path is supported without putting Google OAuth credentials
  in this app. Source: [Ahrefs ownership verification](https://help.ahrefs.com/en/articles/3275938-verifying-ownership-of-your-project-or-website).
- Bing likewise supports Search Console import, DNS, or a meta tag. Source:
  [Bing site verification](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b).
- Screaming Frog, PageSpeed/Lighthouse, Rich Results Test, and Google Trends need
  no application credential for the supplied workflow.

The complete env/tool matrix and dashboard handoff are in
`docs/seo-tooling-setup.md`.

## GA4 regression and visual evidence

The production build uses ignored `.env.local` for the configured measurement
ID. The browser audit intercepts the Google loader and blocks analytics
collection, then redacts the ID before writing `browser-results.json`.

| Gate | Result |
|---|---|
| Measurement ID format and cross-route consistency | Passed |
| Loader / inline config / dataLayer config | Exactly one each |
| Home → About client navigation | No duplicate loader or config |
| Desktop/mobile console errors | 0 |
| Desktop/mobile horizontal overflow | 0 |

Screenshots were visually inspected:

- `validation/google-analytics-4-2026-09-01/screenshots/home-desktop.png`
  (1440 × 1000)
- `validation/google-analytics-4-2026-09-01/screenshots/about-mobile.png`
  (375 × 812)

No visible UI changed, and neither capture shows clipping or horizontal
overflow.

## Build and protocol validation

| Command | Result |
|---|---|
| `npm run convex:typecheck` | Passed |
| `npm run build` | Passed (Next.js 15.5.19, 16 static pages generated) |
| `npm run indexnow:verify` | Passed protocol/key/host/payload/response checks |
| `npm run indexnow:submit -- --dry-run` | 38 same-host URLs, no secret output |
| `npm run indexnow:submit` | HTTP 200, 38 URLs accepted |
| `git diff --check` | Passed |

`indexnow-submission.json` stores only the non-secret receipt. IndexNow applies
to Bing and participating engines, not Google, and HTTP 200 confirms receipt—not
that any URL was indexed or ranked.

## Triage

- P0 security/guardrail: fixed by removing the configured measurement ID from
  tracked source and evidence, keeping `.env.local` ignored, and adding the
  redacted credential audit.
- P1 indexing/discovery: none in the final crawl. An initial sitemap-only graph
  flagged five false orphan candidates; following real Blog pagination proved
  all 44 sitemap URLs discoverable without a UI change.
- P2 accessibility: no new visible or interactive UI. Existing desktop/mobile
  captures have no overflow or console error.
- P3 performance: GA remains `afterInteractive`; the audit records response
  latency diagnostically but does not misrepresent it as field Core Web Vitals.
- P4 cosmetic: none.
