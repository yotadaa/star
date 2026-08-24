# DeepSeek Harness stuck-installation blog validation

## Scope

- Slug: `deepseek-harness-npx-stuck-pnpm-dlx-wrapper`
- Source bundle: `docs/blogs/dsh-problem-stuck-installation/`
- Payload: `scripts/blog-payloads/dsh-stuck-installation.json`
- Publisher: `scripts/publish-dsh-stuck-installation-blog.mjs`
- Research cutoff: 2026-08-24

## Editorial gate

- `audit_blog.py --third-person` on the Markdown draft: 0 hard findings, 0 warnings.
- Prose length: approximately 1,216 words, excluding code and metadata.
- Structure: one H1 and eight H2 sections in the draft; the rendered page adds only its existing Comments H3.
- Evidence boundary is explicit: the captured record does not establish why `npx` waited, does not claim that `npx` is generally broken, and treats the later plugin-tree failures as a separate layer.
- Every current or technical claim has a nearby first-party link. The two supplied terminal captures are used as source evidence rather than decoration.
- No first- or second-person pronouns, placeholder prose, fake quotation, emoji, or invented metrics were added.

## Publication gate

- First publisher run: created one post, uploaded four images, and wrote 46 native blocks.
- Second publisher run: updated the same slug, uploaded zero images, and reused all four stored assets.
- Final package-script run after seed integration: updated the same slug again,
  uploaded zero images, and reused all four stored assets.
- Durable image references are Convex `storageId` values keyed by stable `assetKey`; no expiring URL is stored in the payload.
- Rendered structure: seven article H2 headings, five code blocks, one semantic list, one native table, and one two-image source-evidence carousel.

## Browser gate

Validated in the in-app browser against the local Next.js application.

- Desktop viewport: 1280 × 900 CSS pixels.
- Mobile viewport: 375 × 812 CSS pixels; screenshots use a 360 × 812 page clip because the browser reserves 15 pixels for its scrollbar.
- Horizontal overflow: none at either width.
- All four unique Convex Storage images completed with non-zero intrinsic dimensions.
- Carousel state changed from slide 1 to slide 2 and reported `2 / 2`.
- Keyboard focus on the carousel control was `:focus-visible` with a 2px dashed accent outline.
- The mobile table is contained in a labeled, keyboard-focusable region (`role="region"`, `tabindex="0"`). Its 620px table scrolls inside a 331px region while the 375px document itself remains overflow-free.
- Representative contrast ratios: title 12.99:1, body 10.04:1, code 11.74:1, caption 9.07:1, table text 11.74:1.
- Browser console warnings/errors: none.
- Reduced motion: the article payload introduces no animation or loop; existing site motion behavior was not changed by this task.

## Reproducibility and build gate

- Two consecutive `npm run convex:seed:build` runs produced 11 Blog rows and
  the identical content SHA-256
  `64046885bb8f01039f9c1d7049ef7b6da292771fbce87aaaa35392b00cea579b`.
- `npm run convex:typecheck`: passed.
- Isolated `npm run build`: passed; Next.js compiled successfully, validated
  types, and generated all 15 static pages while keeping the live workspace
  build cache untouched.

## Screenshot evidence

- `desktop-article-top.jpg`
- `desktop-evidence-carousel-slide-1.jpg`
- `desktop-evidence-carousel-slide-2.jpg`
- `desktop-carousel-focus-visible.jpg`
- `desktop-pinned-wrapper.jpg`
- `mobile-article-top.jpg`
- `mobile-evidence-carousel.jpg`
- `mobile-table-focus.jpg`
- `mobile-conclusion.jpg`

## Triase

- P0 guardrails: pass. No new dependency, color token, emoji, modal, or audio.
- P1 functional: pass. The post, images, links, carousel, code, table, and conclusion render from native blocks.
- P2 accessibility: pass for content introduced by this task. Focus, contrast, semantics, and mobile containment were verified.
- P3 performance: no new client dependency or custom listener was introduced. Images are served from Convex Storage through the existing reader.
- P4 cosmetic: no unresolved item recorded.
