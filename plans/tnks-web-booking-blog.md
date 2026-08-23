# E-Ticket TNKS Project Review Blog

## Evidence map

- Product guardrails: `PRODUCT.md` (real proof, readable content, no fabricated metrics)
- Blog block contract: `components/blog/BlockEditorPreview.jsx`, `components/blog/BlogPostRenderer.jsx`, `convex/validators.ts`
- Convex image precedent: `scripts/publish-genbi-rebranding-blog.mjs`
- Repository evidence: public branch `struktur3` of `Project-TNKS-2024/web-etiket-gunung-kerinci`, reviewed at commit `8226ff4164d415bdf8c419308df3171d0fe2c035`; related local checkout at `/home/tada/projects/web-etiket-gunung-kerinci`
- Showcase evidence: five supplied PNG captures in `docs/blogs/tnks-web-booking/`; `Pasted image (3).png` and `Pasted image (4).png` have the same SHA-256, so only one copy will be published
- Writing constraints: `anti-ai-slop-writing` for the draft, followed by a surgical `anti-slop` review

### Task: Publish a natural, evidence-based E-Ticket TNKS project review

- Sumber spesifikasi: user request; `PRODUCT.md`; existing Blog/Convex block contract
- Halaman/letak persis: new published entry at `/blog/e-ticket-tnks-project-review`
- Elemen & struktur: native Blog blocks (`paragraph`, `heading`, `image`, `quote`, `list`, `table`, `divider`) rendered by `BlogPostRenderer`
- Dependency baru dibutuhkan?: TIDAK
- Token warna baru dibutuhkan?: TIDAK
- Butuh konfirmasi data (rarity/medal/dsb)?: tidak; review distinguishes screenshots, current code, and unfinished development state
- Acceptance criteria:
  1. The article reviews the Laravel booking system in natural Indonesian, links to the public repository, and contains no technical claim unsupported by code or supplied captures.
  2. Four unique screenshots render with descriptive Indonesian alt text and captions; published blocks persist Convex `storageId` and `assetKey`, never a copied project path or durable delivery URL.
  3. Two pairs of related landscape screenshots render as accessible carousels at a readable desktop width, without regressing the portrait carousel used by Stok Toko or causing mobile overflow.
  4. The deterministic seed contains the eighth Blog post and remains byte-stable across repeated builds.
  5. Convex typecheck, production build, public Blog readback, desktop/mobile render, image decode, keyboard focus, and motion checks pass.
  6. The final prose passes the banned-term scan and the second `anti-slop` review without changing repository facts.
- Guardrail relevan dari §1: no dependency, fabricated data, new color, emoji-as-UI, blocking modal, or horizontal overflow; preserve keyboard and reduced-motion behavior
- Screenshot evidence: `validation/tnks-web-booking-blog/desktop-top.jpg`, `desktop-content.jpg`, `mobile-top.jpg`, `mobile-content.jpg`, `portrait-regression.jpg`, plus assertions in `validation/tnks-web-booking-blog/validation.md`
- Temuan triase (jika ada): P1 fixed — cached images could miss the React `onLoad` callback and remain `is-unknown`; mount-time natural-dimension detection now selects landscape or portrait reliably. No P0/P2/P3/P4 issue was introduced.
- Status: done

## Implementation sequence

1. Draft the review from the repository and image evidence, then run both writing passes.
2. Add an idempotent Convex Storage publisher and deterministic seed entry.
3. Let the shared carousel distinguish landscape from portrait images after decode, using the existing design tokens.
4. Publish, verify storage ownership, build twice, and capture desktop/mobile evidence.
5. Log completion in this plan and `TASKS.md`; commit only the coherent task files.

## Completion log

- Published the 30-block review with four unique Convex Storage images and two consecutive image groups that render as accessible carousels.
- Confirmed the final publisher is idempotent: all four assets were reused rather than uploaded again.
- Confirmed deterministic seed count 8 and stable content SHA-256 `c3bf1172a1bbad42d8ce7d2b35dfa9cab496235c80135b43c662d9e0657392c5` across two builds.
- Passed Convex typecheck, production build, desktop/mobile rendering, interaction, focus, decode, overflow, and portrait-regression checks. Full evidence is in `validation/tnks-web-booking-blog/validation.md`.
