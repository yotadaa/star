# Caelestia Island Suite blog entry

Tanggal: 2026-08-23

### Task: Add the Caelestia Island Suite README as a Blog post

- Sumber spesifikasi: user request; repository README at
  `https://github.com/yotadaa/caelestia-island-suite`; `PRODUCT.md` design and
  accessibility rules; existing block contract in `convex/validators.ts`,
  `components/blog/BlockEditorPreview.jsx`, and
  `components/blog/BlogPostRenderer.jsx`.
- Halaman/letak persis: `/blog`, `/blog/caelestia-island-suite`, and the
  owner Blog block editor.
- Elemen & struktur: preserve the current block-level document model. Map the
  README to heading, paragraph, list, code, table, divider, and image blocks.
  Extend only the existing image block with optional `src` and `alt` fields.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: TIDAK. The user supplied the repository and asked to
  use its README; image assignments come from that README.
- Acceptance criteria:
  1. A published post with slug `caelestia-island-suite` contains the current
     README sections and links back to the GitHub repository.
  2. Image blocks render real README showcase images with non-empty alt text,
     responsive sizing, lazy loading, and no mobile horizontal overflow.
  3. The owner editor can create and edit `src`, `alt`, and caption values for
     image blocks without breaking older blocks or posts.
  4. Publishing is idempotent and updates an existing slug rather than
     replacing the Blog table or duplicating a row.
  5. `npm run convex:typecheck`, Convex push, and `npm run build` pass.
  6. Desktop 1280px, mobile 375px, and reduced-motion render evidence passes
     visual review.
- Guardrail relevan: no dependency, no new color token, no fabricated facts,
  preserve WCAG text alternatives, no horizontal overflow, and no change to
  unrelated gamification work.
- Screenshot evidence: `validation/caelestia-island-suite-blog/` covers the
  desktop Blog index, desktop detail/top showcase, and mobile detail/top
  showcase. See `validation.md` for computed image and overflow assertions.
- Temuan triase: two P2 mobile overflow findings were fixed in-cycle. The
  reduced-motion state is not applicable because image blocks add no motion.
  The owner-only editor redirected the unauthenticated validation browser as
  intended, so its three image fields were build-verified rather than captured.
- Status: done.
