# Blog reading compass — right-rail revision

## Owner correction

The bilateral image cards are rejected. They interrupt the article from both sides and make the recommendations read like advertisements rather than navigation.

The replacement is deliberately simpler:

1. One sticky recent-article list on the right side only.
2. Four real recent posts in publication order, shown as compact text rows without cover images or individual card shadows.
3. One horizontal `Read next` row before comments. Three related posts use equal carousel cells with native horizontal scrolling and scroll snap when the viewport cannot fit the row.
4. No new dependency, color token, client listener, schema, or fabricated data.

## Acceptance criteria

- Wide desktop shows exactly one `Recent articles` aside on the right; the left gutter contains no recommendation component.
- The aside is an ordered list of four real posts, each with title, reading time, vote count, and a minimum 44 px link target.
- The aside remains secondary to the article: no large cover images, no per-row hardcard shadow, and no competing colored header bars.
- The aside is absent below the wide-layout breakpoint; the article returns to its normal centered width.
- `Read next` is one non-wrapping horizontal grid row with three real covers and consistent card anatomy.
- The row fits three cells on wide desktop and becomes a native horizontal carousel on narrower viewports.
- Carousel cells use `scroll-snap-align`, remain keyboard-reachable, and do not cause document-level horizontal overflow.
- Existing comment/vote behavior, source action, structured data, recommendation ranking, and summary-only Convex path remain unchanged.
- Reduced-motion rules remove hover transforms/transitions; production types/build and a clean browser-console check pass.

## Validation evidence

Target folder: `validation/blog-reading-compass-right-rail-2026-08-24/`.

- `desktop-article-rail.png`
- `desktop-read-next-row.png`
- `tablet-read-next-carousel.png`
- `mobile-read-next-carousel.png`
- `results.md`

## Validation results

- Desktop (1280 × 720): one 240 px right rail, four recent rows, no legacy image cards, and no document overflow. The three `Read next` cells resolve to an equal 293 px row inside the 920 px trail.
- Tablet (768 × 900): the rail is hidden; three 280 px cells occupy an 880 px scroll track inside a 713 px viewport; document overflow remains 0 px.
- Mobile (375 × 812): the rail is hidden; three 288 px cells occupy a 904 px scroll track inside a 320 px viewport; document overflow remains 0 px and the next card remains visibly discoverable.
- Keyboard: carousel links receive the existing 2 px dashed focus ring. Reduced-motion CSS removes the new link transitions and card transforms.
- Production: `npm run build`, `npm run convex:typecheck`, and a production HTTP smoke check for the audited article pass.
- Visual triage: the initial rail sat too close to the global Nala trigger at 720 px height. Its entry offset was reduced from 88 px to 32 px, leaving the assistant control clear without moving the article.

Status: validated.
