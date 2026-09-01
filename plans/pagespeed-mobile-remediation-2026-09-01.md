# PageSpeed mobile remediation

- **Date:** 2026-09-01
- **Route:** `/`
- **Source:** PageSpeed Insights mobile report `7jky4y81u3`; supplied Ahrefs
  `All issues` PDF and four issue CSV exports; `PRODUCT.md`;
  `design-system.md`; `report.md`; `plans/performance-audit-2026-08-24.md`;
  `plans/hero-audit-remediation-2026-09-01.md`
- **Status:** validated
- **New dependency required?:** NO
- **New color token required?:** NO
- **Data confirmation required?:** NO; this is a measured performance and accessibility repair.

## Report baseline

The supplied Lighthouse 13.4.1 mobile run, captured on 2026-09-01 with a
Moto G Power profile and slow 4G, reports:

| Signal | Result |
| --- | ---: |
| Performance | 34 |
| Accessibility | 87 |
| Best Practices | 100 |
| SEO | 100 |
| First Contentful Paint | 2.5 s |
| Largest Contentful Paint | 6.7 s |
| Total Blocking Time | 18,090 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 12.4 s |

The report attributes 37.4 seconds to main-thread work, with 34.6 seconds in
the `Other` category and repeated long tasks from the Home client chunks. The
LCP image is not discoverable in the initial document and lacks high fetch
priority. Image delivery has about 346 KiB of estimated waste, led by Home Blog
covers and the always-visible 352 × 432 Nala PNG rendered near 88 × 107 CSS px.
Google Tag contributes about 167 KiB, and the accessibility failures identify
invalid `list`/`status` nesting, low-contrast section and Blog metadata, repeated
`Read article` names, a color-only footer link, and three non-composited Glimpse
animations.

There is no field data in this report. Local validation can prove the changed
rendering, request, long-task, semantic, and visual contracts, but a new public
PageSpeed score requires deployment and a fresh Google run.

## Search audit baseline

The supplied Ahrefs export identifies 11 issue types across 178 tracked
instances. Four accompanying CSVs provide actionable rows for this work unit:

| Issue | Supplied rows | Repair boundary |
| --- | ---: | --- |
| Meta description too long | 5 | Home, About, and three named Blog articles |
| Title too long | 1 | Ox Alpha Blog article |
| Page links to redirect | 4 links on 3 pages | Two AP article URLs and two GitHub directory URLs |
| Image file too large | 6 | Commit-pinned Caelestia screenshots, 1.0-1.9 MB each |

The summary-only issues (external 4XX, indexable pages absent from the sitemap,
one rich-result validation error, thin incoming internal links, and canonical
redirect rows) do not include affected URLs in the supplied files. They remain
classification targets for the local crawl; no URL or schema repair will be
guessed without a failing row.

## Root-cause map

1. `HomePageContent` mounts `ParallaxScene` through a client-only dynamic
   boundary whose loading fallback is empty, so the browser cannot discover the
   Hero image from initial HTML.
2. `ParallaxScene` immediately chooses WebGL on any WebGL2-capable client,
   including mobile. This downloads and runs the R3F/Three scene despite the
   existing static scene already matching the responsive visual contract.
3. Nala mounts globally and ships a 95 KiB idle PNG for a 64 px fixed control.
4. GA4 contributes a smaller third-party cost, but changing its delivery timing
   would change analytics semantics and could miss short sessions. It remains
   `afterInteractive` in this unit.
5. Featured Blog covers use raw remote images at their full stored width. The
   project already ships Next's image optimizer, so the public R2 hostname can
   be allowlisted without inventing a provider-specific transformation URL.

## Task 1 — Mobile static-first Hero and LCP discovery

- **Exact location:** Home Hero renderer boundary and initial scene.
- **Structure:** preserve desktop WebGL and all current static/WebGL parity;
  choose the existing static renderer on compact screens, and render a
  responsive, server-visible initial Hero landscape whose request is reused by
  the hydrated static scene.
- **Acceptance criteria:**
  1. A 412 px mobile run never imports R3F/Three and exposes
     `data-renderer="static"` after hydration.
  2. Initial Home HTML contains the mobile Hero LCP asset with intrinsic
     dimensions and high fetch priority.
  3. Desktop retains the WebGL path; reduced motion retains the static path.
  4. Morning/noon/sunset/night visuals, overlay pause, entity lifecycle, and
     zero-overflow contracts remain unchanged.
  5. No new dependency, color, or duplicate transferred image request.

## Task 2 — Improve Home image delivery

- **Exact location:** Featured Blog covers, global Nala fixed control, and its
  expression portraits.
- **Structure:** replace the oversized Nala PNG delivery path with
  pixel-preserving, 2× WebP derivatives while retaining the original files as
  source assets and preserving panel behavior. Route the existing public R2
  Blog covers through Next's responsive image optimizer. Keep GA4 timing
  unchanged.
- **Acceptance criteria:**
  1. Home Blog cards request responsive, cached image variants sized for their
     grid slot while retaining lazy loading, intrinsic layout, fallback, and
     descriptive alternatives.
  2. The closed Nala control transfers an appropriately sized modern image;
     every expression still resolves when the panel opens.
  3. Nala dimensions, pixel rendering, accessible name, and keyboard behavior
     remain unchanged.
  4. GA4 remains env-gated, single-instanced, and `afterInteractive`; the
     performance work does not silently trade away analytics coverage.

## Task 3 — Repair PageSpeed accessibility and compositing findings

- **Exact location:** Quest Log/HUD semantics, Home Blog cards, section labels,
  Glimpse controls, and Footer.
- **Structure:** use native grouping semantics instead of invalid ARIA roles;
  add title-specific accessible link names; reuse stronger existing foreground
  tokens; make the back-to-top affordance visibly underlined; keep Glimpse
  state changes transform/opacity-only where animation is involved.
- **Acceptance criteria:**
  1. No `role=list` owns a non-list child and no `role=status` contains the
     Quest Log links.
  2. Each Featured Blog `Read article` link has a unique accessible name.
  3. The flagged Home labels, metadata, actions, and footer link meet the
     intended non-color/contrast treatment using existing tokens.
  4. `glimpse-unlock` no longer animates `box-shadow` or border color, and dot
     selection does not animate paint-only properties.
  5. Keyboard, touch, reduced motion, and no-overflow behavior pass at mobile
     and desktop widths.

## Task 4 — Repair the actionable search-audit rows

- **Exact location:** public page metadata, Blog article SEO normalization,
  inline Blog links, and Blog image previews.
- **Structure:** preserve visible article titles and prose; apply narrow
  per-slug metadata corrections before metadata and `BlogPosting` generation;
  resolve known AP and GitHub directory redirects at render time; route the
  existing Caelestia screenshots through Next image optimization and mount the
  fullscreen copy only when its dialog opens.
- **Acceptance criteria:**
  1. The five reported meta descriptions are at most 160 characters, and the
     reported Ox Alpha document title remains at most 60 characters including
     its existing `Mukhtada` suffix.
  2. Existing Convex rows and future seed/publisher payloads produce the same
     corrected metadata without changing visible editorial headlines.
  3. The four reported links resolve directly to HTTP 200 destinations; GitHub
     directory links use `/tree/`, while file links keep `/blob/`.
  4. Initial Caelestia article markup does not expose raw oversized GitHub PNG
     downloads. Responsive preview variants retain alt text, intrinsic size,
     lazy loading, keyboard/touch dialog behavior, and focus return.
  5. No unknown PDF-summary row is changed without URL-level evidence.

## Task 5 — Validation and release

1. Capture a production baseline and final run at 412 × 823, plus visual checks
   at 375, 768, and 1440 px.
2. Record renderer mode, loaded R3F/Three chunks, Hero image discovery and
   priority, image transfer, long tasks, LCP/FCP observations, console errors,
   and horizontal overflow.
3. Validate desktop WebGL, mobile static, reduced motion, all four phases,
   Nala closed/open, Glimpse default/focus, Featured Blog, and Footer.
4. Re-run the public SEO crawl, assert the supplied metadata/link/image rows,
   and classify any summary-only issue that can be reproduced locally.
5. Run `npm run build`, `npm run convex:typecheck`, `git diff --check`, and
   verify `package.json`/lockfiles have no dependency diff.
6. Save assertion-bearing evidence in
   `validation/pagespeed-mobile-remediation-2026-09-01/`, update `TASKS.md`,
   commit only this coherent work unit, and push.

## Guardrails

- Preserve the open Hero composition, existing visual contract, SEO/structured
  data, Featured Blog server rendering, and unrelated route behavior.
- Do not add npm packages, hex colors, fabricated data, audio, blocking UI, or
  generic glow/glass treatment.
- Stop all loops under reduced motion and retain visible keyboard focus.
- Treat the supplied PageSpeed score as a historical baseline, not as proof of
  the post-change public score.

## Validation outcome

All implementation and release gates passed. The final throttled mobile trace
recorded FCP/LCP at 2.3 seconds, 1.62 seconds of observed blocking above 50 ms,
zero CLS, zero WebGL requests, and zero console errors. The rendered SEO audit
passed the five description rows, one title row, four redirect-link rows, six
oversized-image rows, and the three pagination sitemap URLs. Evidence:
`validation/pagespeed-mobile-remediation-2026-09-01/README.md`.
