# Blog Article SEO Hardening — 2026-08-24

## Scope

Improve the public `/blog/[slug]` article route without changing Blog content or adding dependencies. The work covers article metadata, structured data, semantic publication details, crawler-visible galleries, locale consistency, and a data-completeness audit of every published post.

## Evidence

- Route: `app/blog/[slug]/page.js`
- Shared metadata: `lib/seo.js`, `app/layout.js`
- Article renderer: `components/blog/BlogPostRenderer.jsx`
- Gallery: `components/blog/BlogImageCarousel.jsx`
- Featured-image derivation: `lib/blog/featuredImage.js`
- Index discovery: `app/sitemap-blog.xml/route.js`, `app/robots.js`
- Google Article structured data: <https://developers.google.com/search/docs/appearance/structured-data/article>
- Google image indexing: <https://developers.google.com/search/docs/appearance/google-images>
- Next.js metadata API: <https://nextjs.org/docs/app/api-reference/functions/generate-metadata>
- Next.js JSON-LD guide: <https://nextjs.org/docs/app/guides/json-ld>

## Constraints and decisions

- No npm dependency additions.
- No new color tokens or hex colors.
- Existing English article content makes `en-US` / `en_US` the route and Open Graph fallback locale.
- The repository profile is the fallback author because every current post is first-party content. The data audit must flag the lack of per-post author fields before guest authors are supported.
- Invalid or absent dates are omitted from machine metadata; they are never synthesized.
- A first valid article image may be used as the social/structured-data image, but the audit must flag the lack of an explicit featured-image field.
- Image dimensions are not guessed. Missing width/height data is an audit finding.

## Task: Blog article metadata and semantic structure

- Sumber spesifikasi: Google Article structured data; Next.js `generateMetadata`; `PRODUCT.md` accessibility and anti-reference rules.
- Halaman/letak persis: `/blog/[slug]` head metadata and article header.
- Elemen & struktur: canonical metadata, Open Graph `article` fields, Twitter image, `BlogPosting` JSON-LD, semantic `<time>` values, and grouped article facts.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: TIDAK for first-party author fallback; missing per-post editorial fields are reported, not fabricated.
- Acceptance criteria:
  1. Every published article emits one canonical URL and Open Graph article metadata with valid available publication/update dates, author, tags, and article image.
  2. Every published article emits one safe `BlogPosting` JSON-LD object whose URL, headline, description, author, dates, keywords, language, and images match visible or repository-grounded data.
  3. The visible publication date uses `<time datetime="…">` and human-readable English formatting when the source date is valid.
  4. An unknown slug continues to return 404 with `noindex` metadata.
  5. Root HTML language, Open Graph locale, and structured-data language agree.
- Guardrail relevan: no dependency, no fabricated data, semantic HTML, keyboard/focus behavior unchanged.
- Screenshot evidence: `validation/blog-seo-2026-08-24/desktop-article.png`, `mobile-article.png`, `mobile-reduced-motion.png`.
- Temuan triase: P0 none; P1 carousel visibility fixed; P2 semantic date/targets/focus/reduced-motion/overflow passed; existing Nala mobile overlap remains logged in `TASKS.md` Someday.
- Status: done.

## Task: Crawlable and accessible article galleries

- Sumber spesifikasi: Google image SEO documentation; WCAG target-size guidance; current renderer behavior.
- Halaman/letak persis: consecutive image blocks rendered by `BlogImageCarousel` inside `/blog/[slug]`.
- Elemen & struktur: all gallery figures remain in server-rendered HTML; inactive slides use native `hidden`; controls retain current interaction and focus styles.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: TIDAK.
- Acceptance criteria:
  1. Every renderable gallery image and caption exists in the initial article HTML, including inactive slides.
  2. Only the selected slide is visually exposed; previous/next and direct-selection controls continue to work.
  3. Arrow and dot controls expose at least a 44 × 44 CSS-pixel hit area.
  4. Focus-visible styling remains present, reduced-motion removes control transitions, and mobile has no horizontal overflow.
- Guardrail relevan: focus-visible, reduced motion, mobile overflow, no new colors/dependencies.
- Screenshot evidence: `validation/blog-seo-2026-08-24/mobile-carousel-next.png`, `mobile-focus-visible.png`, plus rendered DOM assertions.
- Temuan triase: all 45 of 45 image blocks were present in initial HTML; one selected figure remained visually exposed; 44 px targets and focus-visible passed.
- Status: done.

## Task: Published-post SEO data audit

- Sumber spesifikasi: public Blog API/Convex records and the rendered article requirements above.
- Halaman/letak persis: every record returned by `/api/blog/posts?limit=100` whose status is `published`.
- Elemen & struktur: per-post matrix covering title, description, dates, author, language, tags, source, featured image, alt text, dimensions, heading structure, and content length.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: audit only; editorial additions remain owner decisions.
- Acceptance criteria:
  1. Every published post appears exactly once in `validation/blog-seo-2026-08-24/blog-data-audit.md`.
  2. The audit distinguishes present, safely derived, and missing fields.
  3. Recommendations identify which schema/editor fields should be added and which existing posts need editorial updates.
- Guardrail relevan: no fabricated authors, dates, dimensions, sources, or descriptions.
- Screenshot evidence: not applicable; API and production-HTML evidence recorded in `validation.md` and `blog-data-audit.md`.
- Temuan triase: eight published posts audited; no missing alt text or invalid current dates; missing per-post editorial fields are documented without fabricated backfills.
- Status: done.

## Validation gate

- `npm run build` succeeds.
- Production server assertions cover all published article URLs, canonical/OG/Twitter metadata, `BlogPosting` JSON-LD, semantic dates, gallery image counts, sitemap membership, and unknown-slug 404/noindex behavior.
- Desktop 1440px and mobile 375px screenshots are visually reviewed.
- Mobile reduced-motion state is captured and checked.
- No new horizontal overflow at 375px.
- `package.json` dependency diff from the pre-existing worktree remains unchanged by this task.
- Only this task's files are staged for commit.

## Status

`done` — implementation and all validation gates passed. Evidence: `validation/blog-seo-2026-08-24/`.
