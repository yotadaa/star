# Blog reading compass right-rail revision — validation

Audited route: `/blog/ox-alpha-api-left-a-trail`

## Functional and layout gate

| Viewport | Recent rail | `Read next` track | Document overflow | Result |
|---|---:|---:|---:|---|
| 1280 × 720 | 1 rail, 4 rows, 240 px | 3 × 293 px; 920 / 920 px | 0 px | Pass |
| 768 × 900 | Hidden | 3 × 280 px; 880 / 713 px | 0 px | Pass |
| 375 × 812 | Hidden | 3 × 288 px; 904 / 320 px | 0 px | Pass |

The first track figure is `scrollWidth / clientWidth`. Overflow is intentionally local to the tablet/mobile carousel; the document itself does not scroll horizontally.

## Accessibility and interaction gate

- The recent area is one labelled complementary region with an ordered list.
- Every recent row is at least 88 px high and exposes title, reading time, and real vote count.
- Every `Read next` cell is a normal internal link and receives the existing 2 px dashed `:focus-visible` outline.
- Scroll snapping and `overscroll-behavior-inline` keep horizontal navigation bounded to the carousel.
- `prefers-reduced-motion: reduce` removes the new transitions and hover/press transforms.

## Guardrail and production gate

- No package, color token, client listener, schema, mutation, or fabricated recommendation data was added.
- The Impeccable detector reported no finding in the new rail or carousel selectors. Its six reported findings are pre-existing rules elsewhere in `app/globals.css` and outside this diff.
- `git diff --check`: pass.
- `npm run build`: pass.
- `npm run convex:typecheck`: pass after the production build regenerated `.next/types`.
- Production server smoke: `GET /blog/ox-alpha-api-left-a-trail` returned HTTP 200 with a 123,548-byte response.

## Visual triage

- P2: at 720 px desktop height, the first rail offset left its fourth row behind the global Nala trigger. Fixed by reducing the rail entry margin from 88 px to 32 px; the final desktop screenshot shows both controls clear.
- No remaining P0–P3 findings in this component revision.

## Evidence

- `desktop-article-rail.png`
- `desktop-read-next-row.png`
- `tablet-read-next-carousel.png`
- `mobile-read-next-carousel.png`
