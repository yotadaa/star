# Stok Toko Project Review Blog

## Evidence map

- Product guardrails: `PRODUCT.md` (real proof, readable content, no fabricated metrics)
- Blog block contract: `components/blog/BlockEditorPreview.jsx`, `components/blog/BlogPostRenderer.jsx`, `convex/validators.ts`
- Convex image precedent: `scripts/publish-portfolio-readme-blog.mjs`
- Repository evidence: `docs/blogs/stok-toko-review/shop-management/README.md`, `PRD.md`, `FEATURE.md`, `DESIGN.md`, current Kotlin sources, Room schema exports, tests, and commit history
- Showcase evidence: six user-provided JPEG captures in `docs/blogs/stok-toko-review/`
- Writing constraints: `anti-ai-slop-writing` for the draft, followed by a surgical `anti-slop` editorial review

### Task: Publish a natural, evidence-based Stok Toko project review

- Sumber spesifikasi: user request; `PRODUCT.md` product and anti-reference rules; existing Blog/Convex block contract
- Halaman/letak persis: new published entry at `/blog/stok-toko-project-review`
- Elemen & struktur: native Blog blocks (`paragraph`, `heading`, `image`, `quote`, `list`, `table`, `divider`) rendered by `BlogPostRenderer`
- Dependency baru dibutuhkan?: TIDAK
- Token warna baru dibutuhkan?: TIDAK
- Butuh konfirmasi data (rarity/medal/dsb)?: tidak; the review will distinguish current code from PRD intent
- Acceptance criteria:
  1. The article reviews the implemented Android app in natural Indonesian, links to `https://github.com/yotadaa/shop-management`, and contains no claims unsupported by the repository or supplied captures.
  2. Six representative screenshots render with descriptive Indonesian alt text and captions; published blocks persist Convex `storageId` and `assetKey`, never a copied public path or durable storage URL.
  3. Portrait screenshots stay bounded and centered on desktop and mobile; consecutive images in the same narrative group render as a keyboard-accessible carousel without distorting existing landscape Blog images or causing horizontal overflow.
  4. The deterministic seed contains the sixth Blog post and remains byte-stable across repeated builds.
  5. Convex typecheck, production build, public Blog readback, desktop/mobile render, image decode, keyboard link access, and reduced-motion checks pass.
  6. The final prose passes the banned-term scan and the second `anti-slop` review without changing technical facts.
- Guardrail relevan dari §1: no dependency, fabricated data, new color, emoji-as-UI, blocking modal, or horizontal overflow; preserve keyboard and reduced-motion behavior
- Screenshot evidence: `validation/stok-toko-review-blog/desktop-top.png`, `desktop-content.png`, `mobile-top.png`, `mobile-content.png`, plus DOM/image assertions in `validation/stok-toko-review-blog/validation.md`
- Temuan triase (jika ada): P1 public Convex query transport returned 404 and now falls back to the protected bridge action; P2 portrait images were too tall and are now capped/centered; P2 consecutive related screenshots now render as two accessible carousels. Evidence: `validation/stok-toko-review-blog/validation.md`.
- Status: done

## Implementation sequence

1. Write and self-review the evidence-based block payload.
2. Add an idempotent Convex Storage publisher and deterministic seed entry.
3. Bound portrait image rendering with the existing Blog CSS contract.
4. Publish, validate data and image ownership, build twice, then capture and inspect desktop/mobile evidence.
5. Log completion in this plan and `TASKS.md`; commit only the coherent task files without absorbing unrelated local changes.
