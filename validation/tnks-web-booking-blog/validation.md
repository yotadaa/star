# E-Ticket TNKS Blog Validation

Date: 2026-08-23

## Source and writing evidence

- Reviewed the public `struktur3` branch of `Project-TNKS-2024/web-etiket-gunung-kerinci` at commit `8226ff4164d415bdf8c419308df3171d0fe2c035`.
- Grounded the review in routes, controllers, models, migrations, middleware, tests, and the supplied showcase captures. The related local repository was read only and left unchanged.
- Excluded `Pasted image (4).png` because it is byte-identical to `Pasted image (3).png`; both have SHA-256 `9d595cf7d37dec9547d3dde856df702c4cb1d34b9519bc0998ead990ebb115db`.
- Final payload: 30 blocks, 6 headings, 4 image blocks, and 1,080 words when the title, excerpt, table, captions, and body are counted together.
- `anti-ai-slop-writing` shaped the initial prose. A separate `anti-slop` pass removed a repeated contrast construction and a redundant section-ending summary without changing repository facts.
- Final scan found none of the selected banned English filler terms, em dashes, or exclamation marks. All four image blocks have descriptive alt text.

## Convex and deterministic data

- Initial publisher run uploaded four unique PNG files to Convex Storage.
- Final idempotency run updated `e-ticket-tnks-project-review` with `uploads: 0` and `reused: 4`.
- Published post readback returned 30 blocks, 4 images, a `storageId` and stable `assetKey` for every image, and a resolved HTTPS delivery URL supplied by Convex at read time.
- Durable Blog payloads do not contain manually copied project paths or persisted delivery URLs.
- Two consecutive `npm run convex:seed:build` runs produced 8 Blog posts and the same content SHA-256: `c3bf1172a1bbad42d8ce7d2b35dfa9cab496235c80135b43c662d9e0657392c5`.

## Automated checks

- `npm run convex:typecheck` — passed.
- `npm run build` — passed with `/blog/[slug]` at 2.34 kB and 108 kB first-load JavaScript.
- The source repository cannot be test-run in this workspace because PHP and Composer are not installed and the checkout has no `vendor` directory. This limits upstream runtime verification, but does not affect the portfolio Blog build or the repository-grounded code review.

## Browser checks

The production build was served locally and inspected in the in-app browser.

### E-Ticket TNKS desktop

- Route: `/blog/e-ticket-tnks-project-review`
- CSS viewport: 1,350 px wide.
- Two regions named `Galeri 2 gambar` rendered with `is-landscape` after image decode.
- Each carousel used the full 760 px article width; the visible image measured 756 × 425 px and retained its 16:9 source ratio.
- Both next controls moved their carousel to `2 / 2`; the replacement images decoded and exposed the expected Indonesian alt text.
- Keyboard focus on a carousel control showed the existing 2 px dashed gold outline with a 3 px offset.
- `scrollWidth` equaled `clientWidth` at 1,350 px. No horizontal overflow was introduced.

Evidence:

- `desktop-top.jpg`
- `desktop-content.jpg`

### E-Ticket TNKS mobile

- CSS viewport: 360 px wide.
- Both carousels rendered at 320 px; visible images measured 316 × 178 px.
- All images decoded, controls remained reachable, captions wrapped naturally, and `scrollWidth` equaled `clientWidth` at 360 px.
- The carousel adds no looping animation. Its existing reduced-motion rule removes control transitions, so the new orientation sizing has no motion-only state.

Evidence:

- `mobile-top.jpg`
- `mobile-content.jpg`

### Portrait regression

- `/blog/stok-toko-project-review` still classified its first carousel as `is-portrait`.
- The portrait carousel remained capped at 460 px; its 612 × 1,360 source rendered at 275 × 612 px without overflow.

Evidence: `portrait-regression.jpg`

## Triage

- P1, fixed: cached images could finish loading before React attached the original `onLoad` callback, leaving landscape carousels at `is-unknown` and the portrait width. The component now reads `naturalWidth` and `naturalHeight` on mount and still listens for later load completion.
- P0/P2: none found.
- P3/P4: none introduced by this task. The pre-existing raw ISO Blog timestamp remains tracked separately in `TASKS.md` and was not widened into this implementation.
