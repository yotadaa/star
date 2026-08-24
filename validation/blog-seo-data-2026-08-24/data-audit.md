# Blog SEO Data Audit — 2026-08-24

## Result

The live Convex inventory contains 11 Blog records: eight published and three archived. Every record now has explicit SEO title, SEO description, language, author, and article section data. The eight published articles contain 49 image blocks; all 49 have non-empty alt text and byte-measured intrinsic width and height. Every published record has an explicit featured image selected from its current blocks.

The archived records intentionally have no image blocks, featured image, or publication date. They do not enter the public Blog query or sitemap. The backend now refuses to publish them until the full content, date, tags, and measured featured-image contract is satisfied.

## Record matrix

| Slug | State | Section | SEO title / description length | Images measured | Featured image |
|---|---|---|---:|---:|---:|
| `deepseek-harness-npx-stuck-pnpm-dlx-wrapper` | published | Technical Case Study | 54 / 143 | 4 / 4 | 1672×941 |
| `ox-alpha-api-left-a-trail` | published | AI Investigation | 44 / 137 | 7 / 7 | 1672×941 |
| `gpt-6-astra-rumor-origin` | published | AI Investigation | 44 / 132 | 11 / 11 | 1672×941 |
| `e-ticket-tnks-project-review` | published | Project Review | 51 / 150 | 4 / 4 | 1920×1080 |
| `genbi-rebranding` | published | Project Review | 47 / 141 | 7 / 7 | 1920×1080 |
| `stok-toko-project-review` | published | Project Review | 46 / 150 | 6 / 6 | 612×1360 |
| `mukhtadas-portfolio` | published | Portfolio | 20 / 131 | 4 / 4 | 1280×900 |
| `caelestia-island-suite` | published | Open Source Project | 22 / 136 | 6 / 6 | 1920×1080 |
| `mentor-study-club-batch-4` | archived | Community Story | 25 / 106 | 0 / 0 | — |
| `dev-log-e-ticket-tnks` | archived | Development Log | 29 / 118 | 0 / 0 | — |
| `catatan-riset-knn-pendidikan` | archived | Research Note | 28 / 112 | 0 / 0 | — |

All 11 rows use `en-US` and the explicit first-party author record for Mukhtada Billah NST. Published records have real numeric `datePublished` and `dateModified` values; archived records omit `datePublished` instead of inventing a date.

## Data controls added

- The checked-in manifest owns the approved slug-specific title, description, language, author, section, and featured-image selection.
- A dependency-free byte parser measures PNG, JPEG, WebP, and GIF dimensions and caps remote reads at 24 MiB.
- The backfill script defaults to a read-only dry run, writes only with `--apply`, rejects unknown slugs or incomplete media, and exposes a sanitized `--report-json` audit.
- Stored Convex images retain storage IDs and stable asset keys. Resolved delivery URLs are generated only when records are read.
- Published writes require explicit metadata, a real publication date, tags, and a featured image whose identity, alt text, width, and height match a current image block.
- All eight publisher scripts and the deterministic seed path call the same completion function, so a later republish or import cannot silently remove the new data.

## Live evidence

```text
Dry run: 0 of 11 Blog records require SEO data updates.
Audit passed: 11 records, 49 image blocks, zero missing SEO fields.
Image audit passed: 49 encoded files match the checked-in dimensions.
```

`migrationAudit:seedStatus` reported 11 Blog rows, no duplicate keys, and zero missing SEO data, image dimensions, or schema versions.
