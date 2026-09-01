# Public SEO tooling and credential boundary — 2026-09-01

## Goal

Apply the actionable parts of the two supplied SEO notes without adding a
dependency or placing credential/configuration values in tracked source. Keep
Google indexing eligibility measurable and document which tools need runtime
environment variables versus dashboard-only setup.

## Discovery evidence

- The production homepage, `robots.txt`, sitemap index, public-pages sitemap,
  and Blog sitemap returned HTTP 200 to a Googlebot user agent on 2026-09-01.
- The sitemap index referenced the two expected same-origin child sitemaps.
- All 44 URLs listed across those sitemaps returned HTTP 200, a self-canonical
  URL after trailing-slash normalization, and no `noindex` directive.
- The production homepage contains a title, description, and JSON-LD.
- The GA4 measurement ID is currently repeated in tracked component, source,
  plan, task, audit, and result files instead of being supplied at build time.
- Search Console, Bing, and Ahrefs verification tags are absent from production.
- `/indexnow-key.txt` now returns HTTP 200 with plain text, so the existing
  `TASKS.md` note claiming a production 503 is stale.

## Tool and environment boundary

| Tool | Application environment needed? | Boundary |
|---|---|---|
| Google Analytics 4 | `GOOGLE_ANALYTICS_ID` | Server-read browser ID emitted into the root `<head>`, configured through env to keep deployment config out of source |
| Google Search Console | `GOOGLE_SITE_VERIFICATION` only for HTML-tag verification | Public ownership token; a Domain property instead uses DNS and no app env |
| Bing Webmaster Tools | `BING_SITE_VERIFICATION` only for HTML-tag verification | Public ownership token; GSC import or DNS needs no app env |
| Ahrefs Webmaster Tools | `AHREFS_SITE_VERIFICATION` only for HTML-tag verification | Prefer GSC import; dashboard OAuth credentials never enter this app |
| PageSpeed Insights API | `PAGESPEED_INSIGHT_API` | Optional server-only CLI credential; never rendered into the site |
| IndexNow | `AHREFS_INDEXNOW_KEY` | Server-only ownership key; never `NEXT_PUBLIC_` |
| Screaming Frog | No | Desktop crawler configuration/license stays outside the app |
| Lighthouse / PageSpeed Insights | No | Browser/web audit; no API integration is required |
| Rich Results Test | No | URL-based web validator |
| Google Trends | No | Dashboard research workflow |

## Implementation plan

1. Move the GA4 measurement ID to ignored `.env.local` for local validation
   and read it from `GOOGLE_ANALYTICS_ID` in the root Server Component. Render no
   analytics scripts when the value is missing or malformed.
2. Add optional, validated Google/Bing/Ahrefs ownership metadata sourced only
   from environment variables. Keep empty values out of rendered HTML.
3. Sanitize the current GA4 value from every tracked file. Preserve validation
   semantics by discovering the configured ID from the intercepted loader
   rather than hard-coding it in the audit.
4. Expand `.env.example` and add a setup guide that classifies public IDs,
   server-only values, and tools requiring no app environment.
5. Add a dependency-free public SEO crawler that checks sitemap/robots fetches,
   same-origin absolute URLs, 200 responses, canonical/indexing metadata,
   titles, descriptions, H1s, parseable JSON-LD, and sitemap-page internal links.
6. Validate typecheck, production build, GA browser interception, public SEO
   crawl, tracked-secret patterns, package diff, and Git whitespace.
7. Record evidence, update `TASKS.md`, commit only this SEO unit, and push.

## Acceptance criteria

1. No current tracked file contains the configured GA4 measurement ID or a
   detected API key, OAuth client secret, bearer token, or private key.
2. GA4 renders exactly one loader/config pair when the env is valid and renders
   neither when it is missing or malformed.
3. Optional ownership tokens render the correct metadata names only when their
   env values are valid; actual tokens remain outside Git.
4. The audit passes every URL in the production sitemap and reports orphan-like
   sitemap pages rather than silently ignoring them.
5. No dependency, lockfile, visible layout, canonical URL, structured-data
   meaning, or public content is changed.

## Validation evidence

Final evidence will be stored in
`validation/public-seo-credentials-tooling-2026-09-01/`.

Status: done. The final live crawl passed 44/44 sitemap URLs with zero failures
or warnings; the credential scan passed 2,401 tracked files; IndexNow accepted
38 URLs; typecheck, production build, and the redacted GA browser audit passed.
