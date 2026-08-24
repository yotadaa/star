# Ox Alpha investigation Blog validation

Validated on August 24, 2026 against the published route
`/blog/ox-alpha-api-left-a-trail`.

## Content and storage

- The article is written in English and uses third-person narration.
- The editorial audit reported 13 headings, 17 source links, and zero hard
  findings. Its only warning was uniform sentence rhythm in repeated table
  cells.
- Convex readback returned 42 blocks and seven image blocks.
- The seven image blocks resolve to seven unique
  `*.convex.cloud/api/storage/*` URLs and all decoded with non-zero natural
  dimensions.
- The set contains three original generated illustrations and four direct
  source-evidence captures. Each evidence caption links to its original page.
- The payload persists `assetKey` and `storageId`, not a repository path or a
  manually appended delivery URL.
- The second publish reused all seven stored files and uploaded none.

## Render checks

- Desktop viewport: 1280 × 720 CSS pixels; document width 1265 pixels. No page
  overflow was present.
- Mobile article frame: 373 × 810 CSS pixels inside the 375 × 812 validation
  capture; document width 358 pixels. No page overflow was present.
- Both generated illustration states were exercised with the real carousel
  controls.
- Both source-evidence benchmark states were exercised with the real carousel
  controls on desktop and mobile. The visible image changed from the 66/113
  community run to the official DeepSWE leaderboard and back.
- All seven source URLs observed in the rendered article came from Convex
  Storage; no `/docs/blogs/` or `/generated/` URL was rendered.

## Reproducibility and build

- `npm run convex:typecheck`: passed.
- `npm run build`: passed, including all 15 static pages and the dynamic Blog
  routes.
- Two consecutive `npm run convex:seed:build` runs produced 10 Blog rows and
  identical content SHA-256
  `2d1b840ff2e11240f617f8dc7dc84c534b3c8e9325c1c318e41abe3d4bb171c3`.

## Screenshot evidence

- `desktop-top.jpg`
- `desktop-official-evidence.jpg`
- `desktop-generated-carousel-first.jpg`
- `desktop-generated-carousel-second.jpg`
- `desktop-fingerprint-evidence.jpg`
- `desktop-benchmark-carousel-first.jpg`
- `desktop-benchmark-carousel-second.jpg`
- `desktop-cta.jpg`
- `mobile-top-frame.jpg`
- `mobile-evidence-carousel-first.jpg`
- `mobile-evidence-carousel-second.jpg`

## Existing global observation

The Nala mobile FAB still occupies a small lower-right area near Blog media.
That global issue predates this article and is already tracked in `TASKS.md`;
it did not block the article images or carousel controls in this validation.
