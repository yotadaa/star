# Validation report

## Outcome

- Live URL: `https://me.mukhtada.my.id/blog/free-portfolio-stack-nextjs-convex-r2-vercel`
- Publication result: created once, then updated idempotently by the same slug, including the later domain-cost clarification.
- Public state: `published`
- IndexNow: HTTP 200 for both the first publication and the duplicate-run check; two URLs submitted each time.
- Git: no commit or push was requested or performed.

## Research and editorial gate

- 21 selected first-party/direct web sources plus local project artifacts.
- 26 Brave screenshot files retained under `sources/`, including focused first-party captures and three SERP snapshots.
- 26 claim-ledger rows, each marked verified, corroborated, or inferred with a stated limit.
- Draft: 2,227 audit words, 10 Markdown headings including the title, 15 source-link occurrences.
- Grounded-blog audit: 0 hard findings, 0 warnings.
- Slopbeth `deslop_lint`: score 0; no phrase or generic-closer hits.
- Slopbeth `orwell_lint`: no dead metaphors, deletable phrases, or jargon hits. The passive-voice heuristic was reviewed against factual descriptions and captions rather than mechanically rewritten.
- All 14 unique external URLs in the draft returned HTTP 200 on the final link check.
- The article ends with a practical template/decision CTA, not a generic research note.
- Ranking boundary is explicit: the work improves relevance and crawlability but does not promise a number-one Google or Bing position.

## Media gate

- Four public assets, all visually inspected:
  - one original tactile editorial feature, 1672×941;
  - one real screenshot of the user-owned portfolio, 1425×891;
  - one attributed Cloudflare R2 checkout evidence capture, 1430×894;
  - one attributed Cloudflare R2 free-tier evidence capture, 1430×894.
- Every native image block has an asset key, descriptive `alt`, caption, width, and height.
- Checksums and encoded dimensions match `visual-ledger.md` and `verify-package.mjs`.
- The feature avoids provider logos, fake dashboards, floating UI, neon infrastructure art, and generic glossy 3D.

## Native payload and data gate

- Payload: 48 native blocks.
- Block mix: 32 paragraphs, 9 headings, 4 images, 1 table, 1 ordered list, and 1 flowchart code block.
- Provider-neutral source payload contains no `src` or `storageId` fields.
- Package verifier: 0 errors.
- SEO title: 53 characters.
- SEO description: 146 characters.
- Convex typecheck: passed.
- Production build: passed on Next.js 15.5.19.
- Convex seed build: passed with 30 Blog records; seed content SHA-256 `43903c4b445a10a06aeee539b822b69f20ec114c8792a35a0d9d1047cb971a58`.

## Publication and duplicate-run gate

First run:

- action `created`;
- 48 blocks and 4 images;
- 4 R2 uploads, 0 reused;
- IndexNow HTTP 200.

Second identical run:

- action `updated` on the same slug;
- 48 blocks and 4 images;
- 0 R2 uploads, 4 reused;
- IndexNow HTTP 200.

Domain-clarification revision and retry:

- action `updated` on the existing slug in both runs;
- 48 blocks and 4 images;
- 0 R2 uploads, 4 reused;
- IndexNow HTTP 200 with two URLs submitted in both runs;
- the article now distinguishes R2 bucket activation from production delivery: `r2.dev` is a throttled non-production endpoint, while a production custom domain must be a zone in the same Cloudflare account as the bucket;
- readers who do not already own a domain are told to buy an inexpensive one and add it to Cloudflare; registration and renewal are explicitly excluded from the `$0 infrastructure` claim;
- the LinkedIn post carries the same distinction.

Post-publication SEO/image audit:

- 30 Blog records;
- 89 image blocks;
- 89 encoded files match the checked-in dimensions;
- zero missing SEO fields;
- zero unused new image-dimension records.

Post-revision audit:

- SEO synchronization reports 0 of 30 Blog records requiring an update and zero missing SEO fields;
- the package verifier reports 0 errors;
- the pre-update global image audit passed for all 89 image blocks. Three post-update retries reached the audit script's 15-second fetch timeout; a separate full-GET check returned HTTP 200 for every current published image URL, and all four images in this article loaded with their expected dimensions in the live browser. No article image or dimension mismatch was found.

## Live route gate

Desktop at 1440×900:

- HTTP 200;
- one page title/H1 for the article;
- canonical URL matches the live slug;
- document title is `Free Portfolio Stack: Next.js, Convex, R2, and Vercel · Mukhtada`;
- description matches the payload;
- `BlogPosting` JSON-LD is present;
- all four article images loaded from the R2 custom domain with correct natural dimensions;
- no document-level horizontal overflow;
- revised domain passages are present in the rendered article;
- full-page screenshots: `live-desktop.png` and `live-domain-revision.png`.

Mobile at 375×812:

- no document-level horizontal overflow;
- article H1 remains singular and readable;
- the table is a keyboard-focusable region with a descriptive label and local horizontal scroll;
- the flowchart exposes `role="img"` plus a directional relationship label;
- no `<img>` on the page lacks an `alt` attribute and no `alt` is empty;
- the revised opening explains the external domain cost;
- full-page screenshots: `live-mobile.png` and `live-domain-revision-mobile.png`.

Keyboard and motion boundary:

- the first Tab reaches `Skip to main content` and the link targets `#main`;
- visual inspection found that this globally shared skip link is occluded by the mobile HUD even while focused. This is a pre-existing site-shell accessibility issue, not an article-data defect. It was not silently changed because the request authorized publication, not a new global deployment;
- the repository has a global `prefers-reduced-motion: reduce` rule that collapses animations and transitions, and the native article blocks add no independent loop. The Brave viewport capability used for this run does not expose media emulation, so no reduced-motion screenshot is claimed.

## Evidence files

- `live-desktop.png`
- `live-mobile.png`
- `live-mobile-focus.png`
- `live-domain-revision.png`
- `live-domain-revision-mobile.png`
- `assignment.md`
- `terminology-ledger.md`
- `claim-ledger.md`
- `source-ledger.md`
- `visual-ledger.md`
- `seo-intent.md`
- `hook-scorecard.md`
- `draft.md`
- `payload.json`
- `linkedin-post.md`
