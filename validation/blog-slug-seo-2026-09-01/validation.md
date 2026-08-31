# `/blog/{slug}` SEO validation — 2026-09-01

## Result

Passed for the complete current published-route set in a local production
build. The implementation preserves the existing article metadata contract
and aligns language, locale, publication/update dates, and visible semantics.

## Fresh production baseline

- `robots.txt`, the sitemap index, and `/sitemap-blog.xml` returned HTTP 200.
- The public IndexNow key route returned HTTP 200.
- The Blog sitemap exposed 37 published article URLs; sampled English and
  Indonesian routes returned 200, an exact self-canonical, `index, follow`,
  complete Open Graph/Twitter article metadata, and `BlogPosting` JSON-LD.
- Before this patch, Indonesian production routes emitted `og:locale=en_US`,
  rendered English month names, and omitted `article[lang]`.
- Search Console was not signed in within the available browser, so current
  Google index coverage and URL Inspection status could not be verified.

## Automated gates

- `npm run blog:seo-data` — passed: 40 records, 110 image blocks, zero missing
  SEO fields, and zero records requiring backfill.
- `npm run convex:typecheck` — passed.
- `npm run build` — passed after the final implementation.
- `git diff --check` — passed.
- Dependency diff — empty for `package.json` and `package-lock.json`.
- Local production route audit — 37/37 sitemap routes passed:
  - 33 `en-US` and 4 `id-ID` articles;
  - exact canonical, `index, follow`, title, description, Open Graph article
    fields, Twitter image, author, section, publication/modification dates,
    featured image, and `BlogPosting` JSON-LD;
  - `article[lang]`, `og:locale`, and JSON-LD `inLanguage` agree;
  - 13/13 genuine modification dates are visible through machine-readable
    `<time>` elements and localized update labels;
  - sitemap `lastmod` exactly matches JSON-LD `dateModified`;
  - the unknown-slug probe returns HTTP 404 with `noindex`.
- Featured-image audit — all 35 unique article images returned HTTP 200 with
  image content types and no `X-Robots-Tag: noindex` response.

Next.js may append dynamic metadata to the streamed document body when a
request resolves after the initial shell. The complete DOM retained every
metadata field in all 37 checks. This is expected for JavaScript-capable
crawlers such as Googlebot according to the current Next.js metadata contract;
HTML-limited bots receive blocking metadata.

## Visual gate

- Desktop English route: 1280 px browser viewport, zero horizontal overflow,
  `lang=en-US`, self-canonical, `index, follow`, and visible publication/update
  dates without the initially observed duplicate `Published` label.
- Mobile Indonesian route: 375 px browser viewport, zero horizontal overflow,
  `lang=id-ID`, `og:locale=id_ID`, Indonesian month names, and localized
  `Diperbarui` update text.

Evidence:

- `desktop-en.jpg` — SHA-256
  `eec1788622d2c051a8fe252a54356a3f9522d0e4369eb040f121f32728b1d6f9`
- `mobile-id.jpg` — SHA-256
  `0ecafdae327b1b925723003f89e4c791f2173eaadc75fddb59171621b2b31c3b`

## Boundaries

- No deployment or Search Console mutation was performed.
- No title, description, canonical, article body, author, tag, section, image,
  or publication timestamp was changed.
- `hreflang` was not guessed from similar titles or slugs. It should be added
  only after the Blog data contract stores explicit translation relationships.
- Google can still choose whether and when to crawl, index, rank, or show a
  rich result; passing these gates removes implementation friction but cannot
  guarantee those external outcomes.

## Primary guidance

- Google Article structured data:
  https://developers.google.com/search/docs/appearance/structured-data/article
- Google byline dates:
  https://developers.google.com/search/docs/appearance/publication-dates
- Next.js `generateMetadata` and streaming metadata:
  https://nextjs.org/docs/app/api-reference/functions/generate-metadata
