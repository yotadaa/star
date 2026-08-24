# Published Blog SEO Data Audit — 2026-08-24

## Audit boundary

The audit covers all eight `published` records returned by `/api/blog/posts?limit=100` at validation time. Counts come from the public Convex payload and the rendered `/blog/[slug]` HTML, not from draft files.

The title-length review is an editorial signal, not a Google ranking rule. “Rendered” includes the current ` · Mukhtada Billah NST` title-template suffix; search engines may rewrite or truncate titles by display width.

## Current inventory

| Post | Title chars raw / rendered | Excerpt chars | Body words / H2s | Images | Per-post copy to add |
|---|---:|---:|---:|---:|---|
| `deepseek-harness-npx-stuck-pnpm-dlx-wrapper` | 66 / 88 | 162 | 1,493 / 7 | 4 | Short `seoTitle`; shorter `seoDescription` |
| `ox-alpha-api-left-a-trail` | 44 / 66 | 143 | 1,669 / 9 | 3 | No urgent title/description override |
| `gpt-6-astra-rumor-origin` | 63 / 85 | 142 | 1,733 / 8 | 11 | Short `seoTitle` |
| `e-ticket-tnks-project-review` | 83 / 105 | 167 | 1,144 / 6 | 4 | Short `seoTitle`; shorter `seoDescription` |
| `genbi-rebranding` | 67 / 89 | 166 | 1,294 / 8 | 7 | Short `seoTitle`; shorter `seoDescription` |
| `stok-toko-project-review` | 60 / 82 | 178 | 1,050 / 7 | 6 | Short `seoTitle`; shorter `seoDescription` |
| `mukhtadas-portfolio` | 20 / 42 | 131 | 2,311 / 20 | 4 | No urgent title/description override |
| `caelestia-island-suite` | 22 / 44 | 160 | 943 / 11 | 6 | Description is at the review boundary; override is optional |

## What is already complete

- All eight posts have a unique slug, non-empty title/excerpt, four or five tags, a source URL, a valid ISO publication value, a valid update timestamp, and a plausible reading-time label.
- All eight articles render one H1 from the route and six or more H2 sections from their blocks.
- All 45 image blocks have non-empty alt text. The rendered preview count matches the stored image-block count on every article.
- Every post has at least one image, so the first valid image currently provides a working social and structured-data fallback.
- Canonical URLs, sitemap membership, article dates, and update dates can all be derived without adding content data.

## Data the Blog model/editor should add

### Priority 1 — explicit editorial identity

Add these fields to every post, even though the route now has safe first-party defaults:

```js
{
  seoTitle: "",
  seoDescription: "",
  language: "en-US",
  author: {
    id: "",
    name: "",
    url: ""
  },
  articleSection: ""
}
```

- `seoTitle` and `seoDescription` let the five flagged posts keep their expressive on-page H1/excerpt while publishing tighter search snippets.
- `language` is currently derived as `en-US` because all published bodies are English. Store it per post before multilingual entries are added.
- `author` is currently derived from the repository profile (`Mukhtada Billah NST`). Store an author reference before guest or organization-authored posts are possible.
- `articleSection` is missing from every post. `coverTone` is a visual theme token and should not be treated as an editorial category. Choose real sections such as project review, investigation, case study, or portfolio in the editor; this audit does not guess assignments.

### Priority 1 — explicit featured/social image

Add an explicit object to every post:

```js
{
  featuredImage: {
    storageId: "",
    assetKey: "",
    alt: "",
    width: 0,
    height: 0
  }
}
```

The first-image fallback works today, but editorial reordering can silently change the search/social image. Width and height are absent for all 45 image blocks, so the route cannot publish truthful image dimensions or reserve an exact aspect ratio without loading the asset first.

Add `width` and `height` to individual image blocks at upload time as well. Do not backfill guessed dimensions.

### Priority 2 — date contract cleanup

The database already stores numeric `publishedAt` and `updatedAt`, but the public Blog object exposes `publishedAtLabel` through the `publishedAt` property. Keep a canonical machine timestamp distinct from presentation text:

```js
{
  datePublished: 0,
  dateModified: 0
}
```

Validate these as real timestamps at write time. The current eight values are valid, so no content correction is needed now.

### Priority 3 — provenance extensions for research posts

For investigations and technical reviews, consider optional `citations[]`, `imageCredit`, and `licenseUrl` fields. The current posts already link sources in prose and have a primary `sourceHref`; these fields would improve machine-readable provenance and image-rights clarity, but they are not required for indexing.

## Per-post action list

- DeepSeek Harness: add both snippet overrides; assign a real section; persist author/language/featured-image dimensions.
- Ox Alpha: current title and description are concise; add the shared author/language/section/featured-image fields.
- GPT-6 Astra: add a shorter SEO title; add the shared fields.
- E-Ticket TNKS: add both snippet overrides; add the shared fields.
- GenBI Rebranding: add both snippet overrides; add the shared fields.
- Stok Toko: add both snippet overrides; add the shared fields.
- Mukhtada’s Portfolio: current snippet copy is compact; add the shared fields and choose a category other than the visual `research` tone if appropriate.
- Caelestia Island Suite: current title is compact and the description is exactly 160 characters; add the shared fields and make any description override an editorial choice.

## Recommended implementation order

1. Extend the Convex schema, public validator, write sanitization, deterministic seed, and Blog editor with optional fields.
2. Backfill `language`, `author`, `articleSection`, and explicit `featuredImage` for all eight posts.
3. Write the five flagged `seoTitle` values and four clearly overlong `seoDescription` values.
4. Capture image dimensions during upload, then backfill the existing 45 assets from their real files.
5. Switch article metadata from safe fallbacks to explicit fields while retaining backward-compatible fallbacks for older records.
