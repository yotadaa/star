# Google Analytics all-route tagging and SEO roadmap audit

- **Date:** 2026-09-01
- **Scope:** root App Router layout, GA4 env migration, IndexNow env alias,
  optional PageSpeed API CLI, all public HTML routes, and the supplied SEO
  roadmap.
- **Status:** validated
- **New dependency required?:** NO
- **New color token required?:** NO
- **Credential rule:** no configured value may enter tracked source, logs,
  screenshots, or validation JSON.

## Evidence and root cause

The live Home initial document contains no Google tag loader or GA4 config.
Repository tracing shows that `app/layout.js` mounts `GoogleAnalytics` once for
the complete App Router tree, but `lib/googleAnalytics.mjs` still reads
`NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`. After the deployment variable was renamed to
`GOOGLE_ANALYTICS_ID`, the validator returns an empty string and the component
renders nothing.

Google's current troubleshooting guidance requires the snippet inside the
`head` of every measured page. The existing `afterInteractive` implementation
is global but does not satisfy that initial-document placement contract.

## Task 1 — Migrate and place GA4 globally

- Read only `GOOGLE_ANALYTICS_ID` from the Server Component environment.
- Render the supplied async loader and one inline `dataLayer`/`gtag` config in
  the root layout `head`.
- Keep the strict measurement-ID validator and JSON serialization boundary.
- Do not hardcode the deployment measurement ID or add a second tag path.

### Acceptance criteria

1. Every 200 HTML URL in the page and Blog sitemaps contains exactly one GA
   loader and one config script inside `head`.
2. The root 404 document and representative public routes inherit the same
   single tag.
3. A client-side Home → About navigation does not duplicate scripts or config
   commands.
4. Missing/malformed IDs render no tag.
5. API, robots, sitemap, image, manifest, and key-file handlers remain outside
   the HTML tagging requirement.

## Task 2 — Align server-only SEO-tool env names

- Treat `PAGESPEED_INSIGHT_API` as a server-only CLI credential and add a
  bounded PageSpeed Insights command that never prints the key.
- Prefer `AHREFS_INDEXNOW_KEY` for IndexNow while retaining the previous
  `INDEXNOW_API_KEY` as a migration fallback so an older production deployment
  does not silently lose submissions.
- Update active env documentation, examples, and verification scripts.

### Acceptance criteria

1. The PageSpeed CLI returns only scores/metrics and its analyzed URL.
2. IndexNow verification and submission use the canonical new variable when
   present; tests prove fallback behavior without real values.
3. No client-prefixed env exposes either server-only credential.

## Task 3 — Audit the 12-step SEO roadmap

Classify each step as done, partial, external/blocked, or recurring using live
HTTP/crawl evidence and repository contracts. Do not mark Search Console query
research, authority links, rich-result repair, or monthly monitoring complete
without account-level or URL-level evidence.

## Validation and release

1. Build with a synthetic valid GA ID, then run a production server.
2. Execute an all-route initial-HTML and browser-navigation audit with Google
   requests intercepted so validation sends no analytics traffic.
3. Run env-boundary, typecheck, build, credential, IndexNow, and public SEO
   checks.
4. Save assertion-bearing evidence in
   `validation/google-analytics-all-routes-2026-09-01/`.
5. Visually inspect representative public HTML pages for regressions, update
   `TASKS.md`, commit the scoped unit, push, and verify the remote SHA.

## Validation outcome

All local gates passed. Forty-seven sitemap HTML routes plus the forbidden and
404 documents contain one loader/config pair inside `head`; Home → About client
navigation keeps the tag singleton. The live SEO crawl passes 47/47 URLs, and
the server-only PageSpeed command returned a mobile score of 75 with
Accessibility, Best Practices, and SEO at 100. Evidence:
`validation/google-analytics-all-routes-2026-09-01/README.md`.
