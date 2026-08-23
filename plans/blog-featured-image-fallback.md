# Blog Featured Image Fallback Plan

Date: 2026-08-23

Status: completed and validated

## 1. Problem

Blog entries already contain resolved Convex Storage image blocks, but the Blog
grid and list ignore them. Both views always show a generated tone panel and a
document icon, so image-rich articles still look as if they have no cover.

The current `blogPosts` schema has no dedicated featured-image field. Adding a
database field, migration, and editor control is not required to satisfy the
requested fallback and would widen this task unnecessarily.

## 2. Sources

- User screenshot: Blog grid cards have large placeholder covers even though
  the published articles contain image blocks.
- `DESIGN.md` §§4.4, 8.6, 10, 14, 16, 18: real project evidence should carry
  visual weight; Blog cards keep the hardcard grammar; mobile cannot overflow.
- `PRODUCT.md`: preserve real proof, avoid fabricated content and generic card
  decoration.
- `convex/blog.ts`: public Blog reads resolve every stored image block into a
  renderable `src` before returning the post.
- `BlogPostRenderer.jsx`: valid Blog images are same-origin paths or HTTPS URLs;
  the article preserves each block's alt text and caption.

## 3. Contract

Create one shared resolver for Blog cover imagery.

1. If a post source supplies an explicit `featuredImage`, `featured_image`,
   `coverImage`, or `cover_image`, the first valid value wins. This preserves a
   future or external explicit choice without adding a new persistence field.
2. Otherwise, scan blocks in stored order and use the first image block with a
   valid same-origin or HTTPS source.
3. A missing or invalid image keeps the existing tone-and-icon fallback.
4. The resolver never mutates or reorders article blocks. The same first image
   still renders in the article body.
5. Grid and list use the same resolved source so their article identity cannot
   drift.

## 4. Task record

### Task: First Blog image as featured-image fallback

- Sumber spesifikasi: user request; `PRODUCT.md` Design Principle 3;
  `DESIGN.md` §§4.4, 8.6, 10, 14, 16, 18.
- Halaman/letak persis: Blog card cover in grid view and 52 px/44 px thumbnail
  in desktop/mobile list view.
- Elemen & struktur: existing linked cover containers receive a real `<img>`;
  the existing sprite remains underneath as the missing/broken-image fallback.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: TIDAK. Selection follows stored block order.
- Acceptance criteria:
  1. An explicit valid featured-image value wins when present.
  2. Without one, the first valid image block becomes the grid and list cover.
  3. Posts without valid images retain their current tone/icon treatment.
  4. Broken cover loads reveal the existing fallback instead of a broken-image
     glyph.
  5. Thumbnails use `object-fit: cover`, do not stretch source images, and stay
     inside the existing hardcard geometry.
  6. Linked covers keep their existing accessible article name; decorative
     thumbnail images do not create duplicate announcements.
  7. Grid/list still have no horizontal overflow at 1280 and 375 px.
  8. Article blocks, database rows, package dependencies, and color tokens do
     not change.
- Guardrail relevan: real evidence only, no new dependency/color, accessible
  linked image, touch/keyboard unchanged, no overflow.
- Screenshot evidence: `validation/blog-featured-image-2026-08-23/` covers
  desktop grid/list, mobile grid/list, and the first image still rendered in a
  Blog detail. The no-image branch is covered by a resolver fixture and the
  persistent fallback layer in both card variants; no fake post was inserted
  for a screenshot.
- Temuan triase: no P0-P4 regression in the component scope. A running local
  dev server initially wrote into `.next` during the production build; it was
  stopped and a clean-cache build passed.
- Status: done.

## 5. Validation plan

1. Test resolver precedence with explicit image, first block, invalid first
   source, and no-image fixtures.
2. Inspect real published posts to confirm card sources match their first
   renderable image blocks.
3. Capture grid and list at 1280 × 800 and 375 × 812.
4. Verify computed object-fit, cover bounds, accessible names, and overflow.
5. Open one article to confirm the first body image remains present.
6. Run the production build, record triage, then commit this unit separately.

## 6. Validation result

- All four resolver fixtures passed: explicit override, first valid block,
  invalid-source skip, and no-image null fallback.
- All five live published posts resolved to loaded images in desktop and mobile
  grid/list states. Grid covers measured 138 px high; list thumbnails measured
  52 px on desktop and 44 px on mobile; every image used `object-fit: cover`.
- The linked cover keeps the existing `Baca <title>` accessible name. The image
  itself is decorative (`alt=""`, `aria-hidden="true"`) to avoid duplicate
  announcements.
- The first E-Ticket image remained in the article renderer with the same
  Convex Storage URL, a 1920 px natural width, and no page overflow.
- `git diff --check` and `npm run build` passed. No schema, dependency, content
  row, article block, or color-token change was required.
- Detailed measurements and screenshot paths are recorded in
  `validation/blog-featured-image-2026-08-23/audit.md`.
