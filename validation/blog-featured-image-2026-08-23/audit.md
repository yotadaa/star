# Blog Featured Image Validation

Date: 2026-08-23

## Result

Blog grid cards and list rows now display real article imagery. A valid
explicit cover property remains authoritative; otherwise the shared resolver
uses the first valid image block in stored order. The resolver does not mutate
the post, so that image still appears in the article body.

## Resolver fixtures

The source module was imported directly and tested without inserting database
records.

| Fixture | Expected | Result |
| --- | --- | --- |
| Explicit `featuredImage` plus an image block | Explicit URL | Pass |
| Paragraph followed by two valid image blocks | First image | Pass |
| Invalid image followed by a valid carousel image | Valid carousel image | Pass |
| Text-only post | `null` and existing visual fallback | Pass |

Accepted sources remain limited to non-protocol-relative same-origin paths and
HTTPS URLs. The same predicate is used by card covers, standalone article
images, and article carousels.

## Live content check

The public Blog response reported Convex as its source and returned five
published posts. Each card resolved to the first loaded article image:

1. E-Ticket TNKS — Convex Storage image `baeaae75-4233-4464-b168-d93e10b136d9`.
2. GenBI Jambi — Convex Storage image `0c421078-ae2a-40f8-a5a5-f492a3e2932b`.
3. Stok Toko — Convex Storage image `121eb8a4-351a-4772-9339-54f07194cb16`.
4. Mukhtada's Portfolio — Convex Storage image `6dd2aabe-da8c-4893-b4fe-fe68f0aa34f3`.
5. Caelestia Island Suite — its first repository-hosted HTTPS screenshot.

All inspected images were complete with a positive natural width.

## Visual and computed checks

| Evidence | Viewport/state | Findings |
| --- | --- | --- |
| `desktop-grid.png` | 1280 × 800, grid | Five loaded covers; approximately 275 × 138 px; centered `object-fit: cover`; no horizontal overflow. |
| `desktop-list.png` | 1280 × 800, list | Five loaded 52 × 52 px thumbnails; no row-geometry regression or overflow. |
| `mobile-grid.png` | 375 × 812, grid | Five 316 × 138 px covers; single-column hardcards; no horizontal overflow. |
| `mobile-list.png` | 375 × 812, list | Five 44 × 44 px thumbnails; readable rows; no horizontal overflow. |
| `article-first-image.png` | 1280 × 800, Blog detail | The E-Ticket cover source remains rendered in its body carousel at 1920 px natural width; no horizontal overflow. |

Linked covers retain the existing `Baca <title>` accessible name. Cover images
use an empty alt value and `aria-hidden="true"`, because the enclosing link
already names the destination. The tone/sprite fallback remains underneath the
image layer and is the only visual layer when resolution returns `null`; image
load errors hide the failed layer rather than showing a browser glyph.

Browser error log after list/grid/detail checks: empty.

## Guardrails and triage

- P0: none. No dependency, color token, schema, fake image, or persisted-data
  change.
- P1: none. Grid and list share one resolver and the article keeps its block.
- P2: none. Accessible link names remain intact and 375 px has no overflow.
- P3: none observed. Images retain lazy loading and async decoding.
- P4: none in this component scope.

The first production-build attempts overlapped a user-running Next.js dev
process that also wrote to `.next`; this produced missing generated-route
modules. The dev process was stopped, the cache was moved to `/tmp` for
recovery, and a clean `npm run build` completed successfully with all 15 static
pages and the Blog routes present.
