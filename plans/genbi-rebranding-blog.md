# GenBI Rebranding Project Review Blog

## Evidence map

- Product guardrails: `PRODUCT.md` (real proof, readable content, no fabricated metrics)
- Blog block contract: `components/blog/BlockEditorPreview.jsx`, `components/blog/BlogPostRenderer.jsx`, `convex/validators.ts`
- Convex image precedent: `scripts/publish-portfolio-readme-blog.mjs`
- Repository snapshot: `docs/blogs/genbi-rebranding/genbi-rebranding/`, including its Git history, root PHP MVC app, Laravel migration copy, routes, migrations, tests, theme registry, and progress log
- Showcase evidence: eight supplied PNG captures in `docs/blogs/genbi-rebranding/`; two Prestasi files have the same SHA-256, leaving seven unique images
- Writing constraints: draft with `anti-ai-slop-writing`, then review with `unslop`; remove banned wording, generic praise, unsupported impact claims, repetitive structure, and machine-like rhythm

### Task: Publish a natural, evidence-based GenBI Jambi project review

- Sumber spesifikasi: user request; `PRODUCT.md` product and anti-reference rules; existing Blog/Convex block contract
- Halaman/letak persis: new published entry at `/blog/genbi-rebranding`
- Elemen & struktur: native Blog blocks (`paragraph`, `heading`, `image`, `quote`, `list`, `table`, `divider`) rendered by `BlogPostRenderer`
- Dependency baru dibutuhkan?: TIDAK
- Token warna baru dibutuhkan?: TIDAK
- Butuh konfirmasi data (rarity/medal/dsb)?: tidak; every technical claim will come from the supplied repository snapshot or screenshot set
- Acceptance criteria:
  1. The article reviews the project's change from a public rebrand into an organizational website and internal work system in natural Indonesian, links to `https://github.com/GenBI-Jambi/genbi-rebranding`, and labels snapshot-bound counts as such.
  2. Seven unique screenshots render with descriptive Indonesian alt text and captions; the duplicate Prestasi capture is intentionally omitted.
  3. Published image blocks persist Convex `storageId` and `assetKey`, never a copied `public/` path or durable storage URL.
  4. The deterministic seed includes the GenBI post without dropping the unfinished Stok Toko seed work and remains byte-stable across repeated builds.
  5. The publisher is idempotent by asset key and SHA-256: the second run reuses all seven Convex files.
  6. Convex typecheck, production build, public Blog readback, desktop/mobile render, image decode, keyboard link access, reduced-motion check, and horizontal-overflow check pass.
  7. The final prose passes the banned-term scan and a manual `unslop` audit without weakening technical accuracy.
- Guardrail relevan dari §1: no dependency, fabricated data, new color, emoji-as-UI, blocking modal, or horizontal overflow; preserve keyboard and reduced-motion behavior
- Screenshot evidence: `validation/genbi-rebranding-blog/desktop-top.png`, `desktop-content.png`, `mobile-top.png`, `mobile-content.png`, plus DOM/image assertions in `validation/genbi-rebranding-blog/validation.md`
- Temuan triase (jika ada): no P0-P3 findings; P4 shared Blog metadata renders the full ISO timestamp and is deferred to `TASKS.md` Someday with `validation/genbi-rebranding-blog/desktop-top.png` and `mobile-top.png`
- Status: done

## Implementation sequence

1. Draft the review from the repository history, current route/model structure, tests, and supplied screenshots.
2. Run the two writing-skill audits and correct any generic or unsupported sentence.
3. Add an idempotent Convex Storage publisher and extend the existing deterministic seed additively.
4. Publish twice, verify storage ownership and public readback, then run type/build gates.
5. Capture and inspect desktop/mobile evidence, record triage, and log completion without absorbing unrelated worktree files.

## Completion record

- Published 40 blocks at `/blog/genbi-rebranding`.
- Uploaded seven unique screenshots to Convex Storage; the repeat publisher reused all seven.
- Preserved the unfinished Stok Toko seed work while extending the deterministic Blog count to seven.
- Passed prose, storage, API, checksum, seed, type, production-build, keyboard, motion, and desktop/mobile layout gates.
- Final evidence: `validation/genbi-rebranding-blog/validation.md`.
