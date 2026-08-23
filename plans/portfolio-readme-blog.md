# Portfolio README blog entry

Tanggal: 2026-08-23

### Task: Publish the current portfolio README as a Blog post

- Sumber spesifikasi: user request; referenced Codex task
  `01a02ad1-96dc-7de2-b40c-92bf0567a7fc`; current `README.md` at commit
  `f68538c`; `PRODUCT.md`; existing block contract in
  `convex/validators.ts`, `components/blog/BlockEditorPreview.jsx`, and
  `components/blog/BlogPostRenderer.jsx`; user-directed Convex environment
  contract using only `CONVEX_CLOUD_URL` and `CONVEX_HTTP_URL`.
- Halaman/letak persis: `/blog`, `/blog/mukhtadas-portfolio`, the owner Blog
  block editor, and the deterministic Convex Blog seed.
- Elemen & struktur: translate the README's editorial walkthrough and
  maintainer reference into native heading, paragraph, quote, list, code,
  table, divider, and image blocks. Upload the four tracked screenshots to
  Convex Storage, persist `storageId` plus a stable repository asset key in
  each image block, and resolve the current storage URL on every Blog read.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: TIDAK. Title, prose, architecture, limits, and images
  come from the current committed README and repository evidence.
- Acceptance criteria:
  1. A published post with slug `mukhtadas-portfolio` preserves the README's
     narrative, architecture, setup, security, design, and honest-limit
     sections and links back to the GitHub README.
  2. All four README screenshots are uploaded to Convex Storage and render
     with non-empty alt text and captions, correct intrinsic dimensions, lazy
     loading, and no horizontal overflow at 1280px and 375px viewports. No
     copied image remains under `public/assets/blog/mukhtadas-portfolio/`.
  3. Publishing is idempotent: rerunning the publisher reuses an upload when
     its SHA-256 matches, updates the same slug, and does not duplicate either
     file rows or unrelated Blog posts.
  4. The deterministic seed contains the same asset-keyed payload, builds
     twice with identical content checksums, and increases the expected Blog
     count from four to five. Because `files` is not a replaceable seed table,
     its storage references survive later content seed imports.
  5. `npm run convex:typecheck`, a Convex development push, and the production
     Next.js build pass without adding a dependency.
  6. Desktop and mobile screenshots are captured and visually inspected; DOM
     checks confirm four decoded images, no image failures, and no horizontal
     overflow.
  7. Server queries/actions use `ConvexHttpClient` with `CONVEX_CLOUD_URL`,
     while the server root layout passes that public deployment address as a
     prop to `ConvexReactClient`; no source or example file depends on the
     removed public-prefixed Convex variable.
  8. `CONVEX_HTTP_URL` is documented as the `.convex.site` HTTP Actions origin
     and is not incorrectly supplied to either Convex client.
  9. A trailing slash in the configured cloud URL is normalized before either
     client constructs Convex API paths.
- Guardrail relevan: no dependency, no new color, no fabricated metric, no
  decorative emoji, preserve text alternatives, preserve keyboard and
  reduced-motion behavior, and do not modify unrelated active work.
- Screenshot evidence: `validation/mukhtadas-portfolio-blog/` contains Blog
  index and detail captures at desktop/mobile widths plus four stable desktop
  captures covering the image blocks. DOM checks cover all four decoded images
  at both viewports. Numeric and triage evidence is in `validation.md`.
- Temuan triase: fixed two P1 Convex environment failures: the server helpers'
  dependency on the removed public-prefixed variable and a trailing slash in
  the replacement cloud URL. The user's storage clarification identified the
  temporary public asset mapping as a P1 structure error; it was replaced by
  Convex-native image references. Convex review found and fixed the interrupted
  replacement fallback. Misleading stitched/cropped evidence was discarded and
  replaced by visually inspected stable captures.
- Status: done.
