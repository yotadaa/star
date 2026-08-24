# GPT-6 Astra Rumor Research Blog

## Evidence map

- Product guardrails: `PRODUCT.md` (readable proof, no fabricated figures, clear source boundary)
- Blog block contract: `components/blog/BlockEditorPreview.jsx`, `components/blog/BlogPostRenderer.jsx`, `lib/blog/featuredImage.js`, `convex/validators.ts`
- Convex image precedent: `scripts/publish-tnks-web-booking-blog.mjs`
- Earliest traceable explicit GPT-6 rumor: Leo (`@synthwavedd`) on X, 2026-07-08 16:00:01 UTC, status `2074886230018568582`
- Earliest documented Astra/GPT-6 connection: The Information, 2026-07-31, by Erin Woo, Leo Schwartz, and Stephanie Palazzolo; the report said OpenAI had not decided whether Astra would be GPT-6 or a GPT-5 point release
- Viral near-release claim: Leo (`@synthwavedd`) on X, 2026-08-06 14:00:00 UTC, status `2085365276640702915`; retracted the following day after OpenAI's cyber disclosure
- First-party facts: OpenAI mathematics post (2026-08-01), cyber-capability post (2026-08-07), and model-development pacing update (2026-08-18)
- Codex clue: Tibo Sottiaux (`@thsottiaux`) said Codex “will have Astra” on 2026-08-17 without giving a date
- Writing constraint: warm third-person English prose shaped with `anti-ai-slop-writing`, including a stronger opening hook and a source-led closing CTA
- Visual constraint: primary-source screenshots remain evidence; imagegen outputs use concise narrative captions without process disclaimers, leak language, logos, or fake product UI

### Task: Research and publish the GPT-6 Astra rumor chronology

- Sumber spesifikasi: user request; first-party OpenAI posts; dated X posts; dated reporting and archives; existing Blog/Convex block contract
- Halaman/letak persis: new published entry at `/blog/gpt-6-astra-rumor-origin`
- Elemen & struktur: native Blog blocks (`paragraph`, `heading`, `image`, `quote`, `list`, `table`, `divider`) rendered by `BlogPostRenderer`
- Dependency baru dibutuhkan?: TIDAK
- Token warna baru dibutuhkan?: TIDAK
- Butuh konfirmasi data (rarity/medal/dsb)?: tidak; unresolved claims will stay labeled as rumor or inference
- Acceptance criteria:
  1. The article names the earliest traceable explicit GPT-6 source, separately identifies the first documented Astra/GPT-6 connection, and avoids claiming that either proves who first discussed it privately or in an unindexed post.
  2. Every major statement is classified as first-party confirmation, named reporting, traceable social claim, or unsupported repetition; no 10-trillion-parameter, release-date, benchmark, price, or architecture claim is presented as fact.
  3. The prose uses a warm third-person English voice without first/second-person narration, fabricated anecdotes, banned filler terms, or uniform section rhythm.
  4. Browser-captured source screenshots show the dated public record. Generated featured/supporting art is original, contains no logos or product UI, and uses narrative captions rather than meta commentary about generation or leaks.
  5. Every published image persists a Convex `storageId` and stable `assetKey`, never a durable project path or manually persisted delivery URL.
  6. The deterministic seed contains the ninth Blog post and remains byte-stable across repeated builds.
  7. Convex typecheck, production build, public Blog readback, desktop/mobile rendering, image decode, carousel controls, keyboard focus, and overflow checks pass.
- Guardrail relevan dari §1: no dependency, fabricated data, new color, emoji-as-UI, blocking modal, or horizontal overflow; preserve keyboard and reduced-motion behavior
- Screenshot evidence: `validation/gpt-6-astra-rumor-blog/` after implementation
- Temuan triase (jika ada):
  - PASS - the first image is the generated feature illustration, all 11 image blocks resolve from Convex Storage, and a second publish reused all 11 checksums.
  - PASS - four two-image runs render as carousels; desktop and mobile next controls both reached `2 / 2`.
  - PASS - 375 px document width stayed at 360 px inside a 375 px viewport; the chronology and claim-status tables did not create horizontal overflow.
  - DEFERRED (out-of-scope existing global UI) - the Nala mobile FAB covers a small part of some Blog media captions; recorded in `TASKS.md` Someday with screenshot evidence instead of changing the global assistant during this Blog task.
- Status: done

## Implementation sequence

1. [x] Finish the dated source ledger and record the uncertainty boundary for “first person.”
2. [x] Capture primary-source evidence in the in-app Browser and create two original editorial images with the built-in image generator.
3. [x] Draft the third-person article, run the banned-term and structural writing checks, then add the Convex Storage publisher and ninth seed row.
4. [x] Publish twice, verify image ownership and checksum idempotency, run type/build gates, and capture desktop/mobile evidence.
5. [x] Log completion in this plan and `TASKS.md`; commit only this task's coherent files.

## Validation result

- Published route: `/blog/gpt-6-astra-rumor-origin`
- Payload: 42 native blocks, 8 headings, 11 image blocks, 4 automatic carousels
- Convex Storage: first run `uploads: 11; reused: 0`; second run `uploads: 0; reused: 11`
- Image DOM audit: 11 unique sources observed across initial and next carousel states; every source matched the Convex Storage endpoint and no project path appeared
- Deterministic seed: 9 Blog posts; content SHA-256 `bb9b54633817a1b9b6be2c51ae5c22af328df3d6021124cbd706eec2cd6e9935`
- Writing checks: third-person scan false for `I|we|you`; Indonesian-remnant, meta-disclaimer, and banned-term scans clean
- Technical gates: `npm run build` and sequential `npm run convex:typecheck` pass
- Screenshot evidence:
  - `validation/gpt-6-astra-rumor-blog/desktop-top.jpg`
  - `validation/gpt-6-astra-rumor-blog/desktop-hook.jpg`
  - `validation/gpt-6-astra-rumor-blog/desktop-cta.jpg`
  - `validation/gpt-6-astra-rumor-blog/desktop-source-carousel.jpg`
  - `validation/gpt-6-astra-rumor-blog/desktop-source-carousel-next.jpg`
  - `validation/gpt-6-astra-rumor-blog/mobile-top.jpg`
  - `validation/gpt-6-astra-rumor-blog/mobile-carousel-controls.jpg`
  - `validation/gpt-6-astra-rumor-blog/mobile-carousel-next.jpg`
  - `validation/gpt-6-astra-rumor-blog/mobile-cta.jpg`
