# Blog SEO Data Backfill — 2026-08-24

## Scope

Close the data gaps recorded in `validation/blog-seo-2026-08-24/blog-data-audit.md`. The work covers the Convex Blog contract, all current published records, deterministic seed input, Blog authoring paths, rendered article metadata, and a preparation contract for the automated Blog-writing agent.

## Evidence and decisions

- The prior live audit found eight published records and 45 image blocks. A fresh inventory after the later Ox Alpha publication found 49 image blocks; every image had alt text and none had stored intrinsic dimensions.
- The deterministic seed currently contains those eight records plus three local fallback drafts. All eleven records must remain valid after a future replace import.
- Every current published article is first-party work by Mukhtada Billah NST and is written in English. The shared author identity and `en-US` language can therefore be stored explicitly without inventing attribution.
- `articleSection` uses a small editorial taxonomy based on each article's observable form: Technical Case Study, AI Investigation, Project Review, Portfolio, or Open Source Project.
- Convex Storage IDs and stable asset keys remain durable identity. Resolved delivery URLs are read-time data and must not be persisted in explicit featured-image metadata.
- Existing records require a widen-first schema change. New fields remain optional during the rollout so deployed functions can read pre-backfill documents safely.
- Image dimensions are measured from the actual encoded image bytes. They are never inferred from CSS or guessed from filenames.
- No npm dependency, color token, or visual design change is required.
- Per the owner request, Blog article document/social titles use the short `· Mukhtada` suffix. Full author identity remains in the byline and structured data.

## Task: Widen the Convex Blog contract

- Sumber spesifikasi: `convex/schema.ts`, `convex/validators.ts`, Convex expert guidance, and the prior Blog data audit.
- Halaman/letak persis: `blogPosts`, nested editor image blocks, Blog queries/mutations, and the authenticated bridge.
- Elemen & struktur: optional explicit SEO title/description, language, author, article section, featured-image identity/dimensions, numeric publication/update dates in the public contract, and image width/height.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: TIDAK; all values are bounded by repository and article evidence.
- Acceptance criteria:
  1. Existing documents remain readable before the backfill.
  2. Every function keeps explicit argument and return validators.
  3. Durable content never stores a generated Convex delivery URL when a storage ID or asset key exists.
  4. Create/update paths clean and preserve every new field without weakening owner/backend authorization.
- Guardrail relevan: no dependency, no fabricated data, internal write functions by default, bounded indexed reads.
- Screenshot evidence: not applicable; covered by type, deployment, and API assertions.
- Temuan triase: no unresolved auth, validator, rollout, query-bound, or durable-media issue in the final Convex review.
- Status: done.

## Task: Idempotent SEO data backfill and audit script

- Sumber spesifikasi: the eight-post data audit, publisher inputs, encoded image files, and Convex bridge authorization.
- Halaman/letak persis: every published Convex Blog record and all current image blocks.
- Elemen & struktur: checked-in editorial manifest, byte-level image-dimension parser, dry-run/apply modes, full-record completeness audit, and no-op second apply.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: TIDAK.
- Acceptance criteria:
  1. The script refuses a partial apply if any published slug lacks approved metadata or any image lacks a measurable source.
  2. Each current published record receives explicit SEO title/description, language, author, section, featured image, numeric dates, and width/height for all 49 image blocks.
  3. A second `--apply` run performs zero mutations.
  4. Audit mode exits nonzero for any missing required field, invalid dimension, invalid URL, duplicate slug, or invalid date order.
- Guardrail relevan: no fabricated dimensions/dates, no secret output, bounded list limit, protected bridge writes.
- Screenshot evidence: terminal evidence in `validation/blog-seo-data-2026-08-24/`.
- Temuan triase: the live inventory contains 49 images rather than the prior audit's 45 because the later Ox Alpha post added four source images; the manifest and audit use the fresh inventory.
- Status: done.

## Task: Prevent future authoring and seed regressions

- Sumber spesifikasi: Blog editor/publisher scripts, deterministic seed builder, and article SEO consumer.
- Halaman/letak persis: Blog create/edit payloads, upload handling, seed generation, publisher payloads, cards, and `/blog/[slug]` metadata/JSON-LD.
- Elemen & struktur: explicit field editing/defaults, upload width/height persistence, manifest-backed seed normalization, and explicit SEO fields preferred over fallbacks.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: TIDAK.
- Acceptance criteria:
  1. New uploaded images persist the compressor's measured width/height.
  2. The seed build fails when a published record is missing the required SEO contract or an image dimension.
  3. Article metadata and `BlogPosting` JSON-LD use explicit title, description, language, author, section, dates, and image dimensions.
  4. Existing visible article titles and excerpts remain unchanged.
- Guardrail relevan: semantic HTML, no new colors/dependencies, no URL persistence for stored media.
- Screenshot evidence: desktop/mobile/reduced-motion article captures under `validation/blog-seo-data-2026-08-24/`.
- Temuan triase: the global Nala mobile trigger still occupies a small lower-right media area; this pre-existing issue is already tracked in `TASKS.md` Someday and was not expanded into this data task.
- Status: done.

## Task: Automated Blog-writer preparation contract

- Sumber spesifikasi: `write-grounded-blogs` evidence/editorial policy, this repository's native block schema, storage contract, and Blog SEO validator.
- Halaman/letak persis: a Markdown handoff document under `docs/` for the user's automated writing agent.
- Elemen & struktur: required research packet, claim and terminology ledgers, editorial fields, image provenance/dimensions, native block payload, pre-publish checks, idempotent publication procedure, and concrete failure conditions.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: TIDAK.
- Acceptance criteria:
  1. The contract tells the agent what must exist before drafting, before upload, before publish, and after publish.
  2. Required field names and allowed block types match the implemented Convex validators.
  3. It bars invented claims, dates, authors, measurements, citations, and unlicensed collected web images.
  4. It includes a machine-checkable handoff checklist and the exact local validation command.
- Guardrail relevan: evidence-first, no fabricated data, accessible images, storage IDs rather than expiring URLs.
- Screenshot evidence: not applicable; Markdown and command validation.
- Temuan triase: none.
- Status: done.

## Validation gate

- `npm run convex:typecheck` passes.
- `npx convex dev --once` deploys the widened development contract.
- The seed builder produces eleven complete Blog records and preserves expected counts.
- Backfill dry-run reports the intended changes; first apply succeeds; second apply reports zero changes; final audit passes all live published records and images.
- `npm run build` passes.
- Production-like article assertions check canonical/OG/Twitter metadata, `BlogPosting` JSON-LD, explicit language/author/section/dates, featured-image dimensions, semantic `<time>`, and sitemap membership.
- Desktop 1440 px, mobile 375 px, and mobile reduced-motion screenshots are captured and visually reviewed with no new overflow. Because the in-app browser has no media-emulation capability, the reduced-motion capture uses the checked-in validation-only Electron helper and asserts the media query plus zero running animations before capture.
- The Convex reviewer checklist finds no unresolved auth, validator, query, storage, or schema rollout issue.
- Only scoped files are staged, committed, and pushed; unrelated local files remain untouched.

## Status

`done`
