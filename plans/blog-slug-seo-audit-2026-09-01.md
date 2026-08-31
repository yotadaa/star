# `/blog/{slug}` SEO preservation and indexing audit

## Goal

Preserve the complete article metadata contract while removing verified
language/date inconsistencies that can make article pages harder for crawlers
and assistive technology to interpret.

## Evidence

- `app/blog/[slug]/page.js` and `lib/blog/articleSeo.js` already derive title,
  description, canonical, author, language, dates, tags, section, featured
  image, Open Graph/Twitter fields, and `BlogPosting` JSON-LD from published
  post data.
- Fresh production responses expose all current article metadata and exact
  self-canonicals, but Indonesian pages currently emit `og:locale=en_US`,
  render English date labels, and omit an article-level `lang` attribute.
- `dateModified` is present in Open Graph, JSON-LD, and the Blog sitemap but is
  not visible on the article. Google recommends prominent visible dates that
  remain consistent with structured data.
- Search Console could not be inspected in the available browser because it
  is not signed in. This limits the audit to crawl/index eligibility and live
  production signals; it does not prove Google index coverage or rankings.

## Scope

1. Preserve all existing metadata fields and fallbacks.
2. Keep the current worktree's locale-aware Open Graph and article-language
   changes.
3. Render localized publication and modification dates from the same ISO
   values used by metadata and JSON-LD.
4. Show `Last updated` only when a valid modification timestamp is later than
   the publication timestamp; never fabricate a date.
5. Do not add dependencies, alter Blog content, change canonicals, or create
   guessed translation/hreflang relationships.

## Acceptance criteria

1. Every published route retains its unique title, description, canonical,
   index/follow directive, Open Graph article fields, Twitter image, author,
   tags, section, dates, and `BlogPosting` data.
2. `article[lang]`, `og:locale`, visible date formatting, and JSON-LD
   `inLanguage` agree for both `en-US` and `id-ID` posts.
3. Visible `<time>` elements exactly reuse `datePublished` and, when present,
   `dateModified` from the SEO builder.
4. Every published sitemap URL returns 200 in a production build, is
   self-canonical, and remains in `/sitemap-blog.xml`; an unknown slug returns
   404 with `noindex`.
5. Desktop and 375 px screenshots show the metadata row without clipping or
   horizontal overflow.

## Validation evidence

Final command output and screenshots will be recorded under
`validation/blog-slug-seo-2026-09-01/`.
