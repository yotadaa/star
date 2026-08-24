# Six internet-culture Blogs: publication validation

## Result

- Published six English, evidence-led articles at `2026-08-24T22:24:11+07:00`.
- Every article has one original tactile editorial feature and one bounded, attributed real-source image.
- All six Markdown drafts pass the grounded-blog audit with 0 hard findings and 0 warnings.
- No article ends with a generic research note or source-cutoff paragraph.
- The title template renders `· Mukhtada`; the author record remains `Mukhtada Billah NST`.

## Article matrix

| Slug | Words | Sources | Blocks | Images | Central boundary |
|---|---:|---:|---:|---:|---|
| `niu-lai-worst-animation-human-made` | 1,618 | 6 | 43 | 2 | Human provenance changed the interpretation; no source measures it as the main ticket motive. |
| `anthropic-watermark-removers` | 1,456 | 7 | 40 | 2 | No public test proves a remover defeats Claude's undisclosed detector. |
| `x-original-content-rewards-repost-economy` | 1,545 | 6 | 36 | 2 | X's payment rules form a plausible feedback loop, not proof they caused every repost account. |
| `moltbook-ai-agents-social-network` | 1,643 | 7 | 40 | 2 | Formulaic comments are 47.9%; 62.3% is the broader formulaic-plus-unassigned category. |
| `human-made-ai-slop-selling-point` | 1,837 | 8 | 50 | 2 | Human-made is an accountability signal, not proof of quality or an economy-wide premium. |
| `instagram-real-content-labeled-ai` | 1,592 | 8 | 45 | 2 | The verified problem is provenance-label mismatch, not one universal detector failure. |

## Publication and storage

- Batch manifest: `scripts/blog-batches/six-internet-culture-blogs-2026-08-24.json`.
- Initial publication created or updated all six records and stored the 12 keyed assets.
- The immediate duplicate run returned `uploads: 0` and `reused: 2` for each article, proving all 12 assets were reused.
- Each persisted Blog response contained the expected block count, two image blocks, durable storage IDs, and delivery URLs.
- `npm run blog:seo-data` reported 24 records, 75 image blocks, and zero missing SEO fields.
- `npm run blog:seo-data:verify-images` verified all 75 encoded files against checked-in dimensions.

## Code and seed gates

- `npm run convex:typecheck`: passed.
- `npm run convex:seed:build`: passed with 24 Blog posts; content SHA-256 `4206d9725a52cdee4f1624a754d3c236c0702d2a8fdf6b78b2343c051a48b213`.
- `npm run build`: passed on Next.js 15.5.19.
- The source-link sweep checked 40 unique article URLs. Thirty-five returned HTTP 200 directly; five returned bot-gate HTTP 403 to command-line fetches but had already been opened, read, and captured in the in-app Browser.

## Route gate

Every route was rendered at a desktop override and a mobile override in the in-app Browser. All six passed:

- one `<main>`, one `<article>`, and one `<h1>` matching the public title;
- a logical `H1` then `H2` sequence, with the shared CTA rendered as `H3`;
- canonical `https://me.mukhtada.my.id/blog/{slug}`;
- robots `index, follow`;
- `lang="en-US"`;
- two JSON-LD scripts;
- two semantic images with non-empty alt text and verified intrinsic dimensions;
- no forbidden research-note phrase;
- no horizontal overflow at either viewport;
- SEO title suffix `· Mukhtada` on all six routes.

The responsive override exposed a 360-pixel content viewport inside the requested 375-pixel browser surface. `scrollWidth` remained 360 for every route. A keyboard pass moved focus to an author link with a visible 2-pixel solid outline (`rgb(69, 184, 164)`).

## Screenshot evidence

Desktop and mobile viewport captures for every slug are stored under `routes/`:

- `niu-lai-worst-animation-human-made-{desktop,mobile}.jpg`
- `anthropic-watermark-removers-{desktop,mobile}.jpg`
- `x-original-content-rewards-repost-economy-{desktop,mobile}.jpg`
- `moltbook-ai-agents-social-network-{desktop,mobile}.jpg`
- `human-made-ai-slop-selling-point-{desktop,mobile}.jpg`
- `instagram-real-content-labeled-ai-{desktop,mobile}.jpg`
