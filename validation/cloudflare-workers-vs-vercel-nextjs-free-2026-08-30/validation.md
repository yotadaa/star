# Validation report

## Verdict

**PASS for publication.** The package is grounded, provider-neutral, internally consistent, and live. Its direct Cloudflare screenshot was replaced with a project-owned deterministic reconstruction before upload.

## Research and editorial gate

- 25 claim-ledger rows with verified, inferred, or bounded-unknown treatment.
- 18 saved Browser source captures from first-party project, framework, platform, and terms pages.
- 26 unique article URLs; all returned HTTP 200 during the independent cross-audit.
- 1,768 grounded-audit words, 9 Markdown headings including the title, and 32 linked URL occurrences.
- Grounded-blog audit: 0 hard findings and 0 warnings.
- Slopbeth deterministic lint: score 0.
- Strict third-person/process scan: no first- or second-person narration, investigation diary, methodology narration, cutoff paragraph, or research-note ending.
- Pros and cons are explicit for both platforms; the verdict remains conditional on workload, compatibility, and plan eligibility.

## Claim boundary

- Cloudflare's 25 August 2026 documentation commit supports a recommendation change, not a quality or performance result.
- vinext is beta; OpenNext remains documented for existing applications and is described by vinext as the more mature broad-compatibility path.
- Cloudflare's 10 ms allowance is active CPU, not wall-clock time. The article also carries Cloudflare's 10–20 ms typical authentication/SSR context.
- Cloudflare's 3 MB Worker limit is compressed; Vercel's standard 250 MB Function limit is uncompressed.
- No latency, cold-start, correctness, or production-workload benchmark is claimed.
- The Cloudflare policy comparison does not override its general, acceptable-use, or product-specific terms.

## Media gate

- Three native article images, all visually inspected:
  - original tactile feature image, 1672×941;
  - deterministic Cloudflare guidance reconstruction, 1600×900;
  - deterministic comparison chart, 1600×1000.
- Every image block has a stable asset key, descriptive alt text, dimensions, and caption.
- The feature is conceptual rather than evidence. The chart repeats nearby sourced facts without pretending unlike daily and monthly meters are one score.
- No collected web screenshot is part of the public article assets; source captures remain private research evidence.

## Payload gate

- Native blocks: 36 total — 23 paragraphs, 8 headings, 3 images, 1 table, and 1 ordered list.
- `status`: `published`.
- `publishedAt`: `2026-08-30T22:30:00+07:00`.
- SEO title: 45 characters.
- SEO description: 159 characters.
- Provider-neutral payload contains no delivery `src` or `storageId`.
- `verify-package.mjs`: 0 errors; file dimensions and SHA-256 checks match the visual ledger.

## Publication and live-route gate

- Live URL: `https://me.mukhtada.my.id/blog/cloudflare-workers-vs-vercel-nextjs-free`.
- The first authorized batch run created the post and uploaded three R2 assets. The duplicate run updated the post with zero uploads and reused all three assets. A final metadata repair run again reused all three assets.
- IndexNow returned HTTP 200 and submitted the Blog index plus both new article URLs.
- The post, `/blog`, and `/sitemap-blog.xml` returned HTTP 200; the Blog sitemap contains the canonical article URL.
- The live page has one H1, a logical H2 structure, an exact self-canonical URL, `BlogPosting` JSON-LD, and the title suffix `· Mukhtada` exactly once.
- Live image audit: all article images loaded with their declared dimensions; every page image has non-empty alt text. The repository-wide audit passed for 94 encoded image files.
- Desktop 1440×1000 and mobile 375×812 checks found no horizontal overflow. Evidence: `live-desktop.png` and `live-mobile.png`.
- The public article contains the deterministic vinext guidance reconstruction and no direct Cloudflare screenshot.

The detailed independent findings and exact corrections are recorded in `cross-audit.md`.
