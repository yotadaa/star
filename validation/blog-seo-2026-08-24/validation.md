# Blog Article SEO Validation — 2026-08-24

## Result

Passed for all eight published Blog records available at validation time.

## Automated checks

- Isolated production build: `NEXT_DIST_DIR=.next-seo-build npm run build` — passed.
- `/blog/[slug]` remains dynamically rendered at 4.85 kB route code / 143 kB first-load JS.
- Eight of eight published routes returned HTTP 200.
- Eight of eight emitted an absolute canonical URL, `og:type=article`, `og:locale=en_US`, article publication/update/author tags, a post-specific Open Graph image, a semantic `<time>`, and one `BlogPosting` JSON-LD object.
- Eight of eight `BlogPosting` objects matched the post headline and emitted `en-US`, the repository-grounded author, valid available dates, tags, and a featured image.
- Initial article HTML included all 45 of 45 renderable image blocks: `4, 3, 11, 4, 7, 6, 4, 6` by post.
- The Blog sitemap contained all eight slugs.
- `/blog/seo-audit-missing-slug` returned HTTP 404 with `noindex`.

## Browser checks

- Desktop: 1440 × 1000, one article/H1, semantic detail terms, no horizontal overflow.
- Mobile: 375 × 812, no horizontal overflow; article width 360 px; metadata card width 320 px.
- Gallery: all arrow/dot controls measured 44 × 44 px; exactly one figure visible; next-image selection changed `1 / 2` to `2 / 2`; the newly visible image loaded with its own caption.
- Keyboard: the Previous button received a 2 px dashed focus-visible outline with a 3 px offset.
- Reduced motion: Firefox ran with `ui.prefersReducedMotion=1`; the route’s media rule removes gallery-control transitions and the captured page remained in its static final layout.

## Screenshot evidence

- `desktop-article.png` — desktop header, human date/byline metadata, and loaded first image.
- `mobile-article.png` — mobile header/meta/image, no overflow.
- `mobile-carousel-next.png` — second gallery image selected and rendered.
- `mobile-focus-visible.png` — keyboard focus state; computed outline recorded above.
- `mobile-reduced-motion.png` — 375 px reduced-motion profile.

## Visual triage

- P0 guardrail: none. No dependency, color token, modal, audio, emoji, or fabricated article data was added.
- P1 functional: fixed. Inactive carousel figures now remain in initial HTML while native `hidden` keeps the selected visual state intact.
- P2 accessibility: passed. Semantic metadata, 44 px targets, keyboard focus, reduced-motion rule, and mobile overflow checks passed.
- P3 performance: no new listener or animation was added. Article client size stayed effectively flat.
- P4 existing/out of scope: the Nala mobile FAB can overlap lower-right Blog media/content; it was already recorded in `TASKS.md` Someday and is visible in the mobile evidence. It was not changed during this SEO task.
