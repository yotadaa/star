# Validation report

## Verdict

**PASS and published.** The English article preserves the verified claim boundary and passed the repository, publication, SEO, image, and live-render gates.

## Translation boundary

- The English article preserves the Indonesian edition's verified facts, attributions, uncertainty, and source URLs.
- No new factual claim or stronger conclusion was introduced during translation.
- Both public visuals were rebuilt with English labels rather than publishing Indonesian text inside an English article.

## Package checks

- Draft: 2,195 audit-counted words, 9 Markdown headings, 21 URL occurrences.
- Grounded audit: 0 hard findings; one reviewed rhythm warning caused by compact tables and the ordered diagnostic sequence.
- Slopbeth marker score: 0.
- Signature gate: 0 hard signatures, 3 reviewed date-range patterns, PASS.
- Native payload: 43 blocks (26 paragraphs, 8 headings, 5 tables, 2 lists, 2 images).
- Read time: 11 min at approximately 225 words per minute, rounded up.
- SEO title: 47 characters; SEO description: 161 characters.
- Both images have provider-neutral asset keys, distinct captions, descriptive alt text, and measured dimensions.

## Publication checks

- First publisher run: `created`, 43 blocks, 2 images, 2 uploads, 0 reused.
- Duplicate publisher run: `updated`, 43 blocks, 2 images, 0 uploads, 2 reused.
- IndexNow returned HTTP 200 for two submitted URLs with the deployed key location. This confirms receipt, not indexing.
- Live route: `https://me.mukhtada.my.id/blog/did-google-august-2026-spam-update-target-ai-content` returned HTTP 200.
- The page exposes one H1, eight article H2 sections, an exact self-canonical, the title suffix `· Mukhtada` once, and `BlogPosting` JSON-LD with `inLanguage: en-US`.
- `/sitemap-blog.xml` contains the canonical article route.
- Desktop 1440×1000 and mobile 375×812 checks found no page-level horizontal overflow. Tables remain intentionally scrollable inside their containers on mobile.
- Both article images decoded at 1600×900 and 1600×1000; the inline diagnostic diagram was inspected at its rendered position.
- Keyboard focus begins on the skip link with a visible 2 px solid outline.
- The article subtree has no active CSS animation; the shared stylesheet contains reduced-motion rules for the surrounding interface.
- Site-wide ALT audit: 38 published routes and 379 rendered images, zero missing or empty `alt` attributes.
- Final image audit: 110 encoded files match checked-in dimensions.
- Final SEO audit: 40 Blog records and 110 image blocks, zero missing fields or pending updates.
- `npm run convex:typecheck`, the 40-post deterministic seed build, `npm run build`, `git diff --check`, and the IndexNow protocol verifier passed.
- Render evidence: `live/desktop-1440x1000.png`, `live/mobile-375x812.png`, and `live/desktop-inline-diagnostic.png`.
