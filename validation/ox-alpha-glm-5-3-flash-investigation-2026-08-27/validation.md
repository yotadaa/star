# Validation

Package: `validation/ox-alpha-glm-5-3-flash-investigation-2026-08-27/`
Research cutoff: 2026-08-27, 23:45 Asia/Jakarta (UTC+7).
Published at `2026-08-28T00:47:32+07:00` to the production Blog at
`https://me.mukhtada.my.id/blog/ox-alpha-was-glm-5-3-flash`. No commit or
push was requested or performed.

## Publication execution

The user explicitly authorized publication with `kamu aja yg unggah`. The
package was registered in `BLOG_SEO_RECORDS`, `BLOG_IMAGE_DIMENSIONS`, the
explicit batch manifest, and the deterministic seed before production mutation.

The first publisher invocation uploaded and committed the two R2-backed assets
and created the Blog row, but its local readback assertion exited nonzero because
it still required a legacy Convex `storageId`. The current R2 resolver correctly
returns a stable `assetKey` plus an HTTPS `src` and deliberately removes
`storageId`. `scripts/publish-grounded-blog-batch.mjs` was corrected to verify the
exact declared asset-key set and HTTPS delivery URLs instead.

Two unchanged reruns then both returned the same result: `action: "updated"`,
42 blocks, two images, `uploads: 0`, and `reused: 2`. Each run submitted `/blog`
and the article URL to IndexNow; both acknowledgements were HTTP 202. The public
API contains one row for this slug, so the failed local assertion did not create
a duplicate.

## Counts

| Item | Count |
|---|---|
| Draft words (`wc -w draft.md`) | 2,066 |
| Draft words (audit prose measure) | 2,002 |
| Payload block words | 1,954 (1,980 including table cells) |
| `readTime` | `"9 min read"` (1,980 ÷ 225 = 8.80, rounded up) |
| Payload blocks | 42 |
| Heading blocks | 7 |
| Image blocks | 2 |
| Table blocks | 1 |
| Quote blocks | 1 |
| Outbound links in blocks | 14 (13 external, 1 internal) |
| Distinct external sources cited in article | 12 |
| Source ledger rows | 10 (S01–S10) + rejected-sources block |
| Screenshots in `sources/` | 15 (S01–S15) |
| Publishable assets in `assets/` | 2 |
| `seoTitle` length | 66 |
| `seoDescription` length | 161 |

`sources/` holds 15 captures against 10 ledger rows because S11–S15 back the
reception section and are logged in `sentiment-method.md` rather than the source
ledger: S11 is OpenCode issue 44300, S12 and S13 are the two archived r/opencode
threads, S14 is OpenCode issue 44262, S15 is Hermes Agent issue 93030.

## Commands run

Chart render, capture, decode check, checksum:

```
node scripts/bar-chart.mjs <package>/chart-data.json > /tmp/chart.html
node scripts/blog-screenshot.mjs "file:///tmp/chart.html" \
  <package>/assets/chart-independent-measurements.png w=1200 h=760 dsf=1 wait=1500 full=1
node scripts/png-stats.mjs <package>/assets/chart-independent-measurements.png
sha256sum <package>/assets/chart-independent-measurements.png
```

Results: capture ok; `png-stats.mjs` reports `1200x760 51KB ink=100.0% sd=42.0`;
SHA-256 `93d3ff8cd2b9f8882a441af6cd5bb0d92eed6b81e052c84ef9f26b8787367415`; encoded
size 52,534 bytes.

`ink=100.0%` is a limitation of the script, not a finding: its ink threshold is
"any channel below 250", and the chart's `#fbfaf7` background sits under it, so
every pixel counts as ink. A second decode pass over the same inflated scanlines
measured luminance bands instead: 5.61% of pixels below 128 (text and the dark
bars), 4.90% between 128 and 235 (the light comparison bars). Both figures are
consistent with a legible chart rather than a flat fill.

JPEG dimensions for the illustration were measured by walking SOF markers,
because `png-stats.mjs` rejects non-PNG magic and only handles 8-bit
non-interlaced colour types 2 and 6:

```
python3 -c "walk 0xFFC0/0xC1/0xC2, struct.unpack('>HH', b[i+5:i+9])"
```

Result: `1536 x 1024`, 219,406 bytes, SHA-256
`87388408f0b20186524afdfa2f8611ae5c919ecced10a4e39bc474cfc35ef810`.

Two measurement methods are therefore in use and are not interchangeable:
`scripts/png-stats.mjs` for the 13 PNG source captures and the PNG chart, and the
SOF-marker walk for the JPEG illustration.

Blog audit from the skill directory:

```
python /home/tada/.codex/skills/write-grounded-blogs/scripts/audit_blog.py draft.md --third-person
```

First run: 0 hard findings, 2 warnings — `em_dash_density` (8 against a suggested
maximum of 4) and `uniform_sentence_rhythm`. The em-dash count was reduced to 4
by rewriting two passages into colon-and-clause form; no fact, figure, name,
link, or quotation changed. A later run, after the tool-calling evidence was
added, reports 2,002 words, 8 headings, 13 URLs, **0 hard findings, 1 warning**.

The remaining `uniform_sentence_rhythm` warning was reviewed rather than
suppressed and is a false positive. Its groups were inspected by importing the
audit module and printing the flagged sentences: the tokeniser splits on the
period inside version strings, so the flagged "sentences" are fragments such as
`3-Flash.`, ` Z.`, ` It reports 3.`, `0× less attention compute and a 4.`,
`key-value cache than GLM-5.` and `2's 46.` — pieces of `GLM-5.3-Flash`, `Z.ai`,
`3.0×`, `4.4×` and `46.2`, not sentences. The genuine prose rhythm varies across
the article.

Payload schema, link text, and image checks were run as a separate pass over
`payload.json`, asserting: every block type is one of the nine repository-native
types; every block carries `text`; every image block carries a non-empty
`assetKey`, `alt`, `text` caption and positive `width`/`height`; every `assetKey`
starts with `blog:<slug>:` as `scripts/publish-grounded-blog-batch.mjs:96-121`
requires; no image block carries `src`, `storageId`, or `url`; no `alt`
duplicates its caption; no two image blocks are adjacent, which would make the
renderer merge them into a carousel; the `table` block's rows are all the same
width, since the renderer pads nothing; no block text contains raw HTML;
`status` is `published`; `publishedAt` is the parseable production decision
`2026-08-28T00:47:32+07:00`; `language` is `en-US`; `seoTitle`
≤70 with no author suffix; `seoDescription` ≤180; `tags` ≤12; and `readTime` is a
string of the schema's `"N min read"` form matching the computed value. All
assertions passed with no errors and no warnings.

`readTime` is a free-form `v.string()` (`convex/schema.ts:29`), not a number;
the 225-words-per-minute rule is documentation-only
(`docs/blog-agent-upload-runbook.md:166`) and no constant for it exists in code.
The payload was corrected from the number `9` to the string `"9 min read"` to
match the schema and every published payload.

Link liveness, all 200 with a browser user agent: z.ai release post, both
OpenRouter route pages, iThome, TechCrunch, Hugging Face model card,
`MatchaOnMuffins/oxalpha`, Artificial Analysis, Cloudflare changelog, OpenCode
issues 44300 and 44262, Hermes Agent issue 93030. The internal link
`/blog/ox-alpha-api-left-a-trail` matches the slug in
`scripts/publish-ox-alpha-investigation-blog.mjs:10` and the SEO manifest entry
at `scripts/blog-seo-data.mjs:134`.

## Publish-path registration

The checked-in publication path includes
a `BLOG_SEO_RECORDS` entry and both `BLOG_IMAGE_DIMENSIONS` entries in
`scripts/blog-seo-data.mjs`, a batch manifest at
`scripts/blog-batches/ox-alpha-glm-5-3-flash-2026-08-28.json`, the payload path
added to `GROUNDED_BLOG_PAYLOAD_PATHS` with `expectedSeedCounts.blogPosts` raised
from 24 to 25, three new `sourceFiles` entries in `scripts/build-convex-seed.mjs`,
and an exact asset-key-set check in the post-publish verification in
`scripts/publish-grounded-blog-batch.mjs`. The registered dimensions match the
bytes measured here: 1536 × 1024 and 1200 × 760. These paths were exercised by
the production publisher and deterministic seed build. The repository changes
remain uncommitted because commit and push were not part of the publication
request.

## Rendered-semantics review for `/blog/{slug}`

Checked against the renderer rather than inferred: `app/blog/[slug]/page.js:77-79`
supplies the only `<h1>` through `PageHeader`, and
`components/blog/BlogPostRenderer.jsx:51` renders every `heading` block as
`<h2>`, so no H3 exists and no level can be skipped.
`groupConsecutiveImages` (`:8-33`) silently merges two adjacent `image` blocks
into a carousel; the two images here are separated by many blocks, and the check
asserting non-adjacency passes.

- One visible H1: the route renders `title`; no `heading` block repeats it.
- Heading hierarchy: seven sibling section headings, no skipped levels, each
  descriptive of its section rather than a label.
- Source links sit inside the paragraphs whose claims they support; link text
  names the destination and its subject rather than reading "here" or "this page".
- Both images carry non-empty `alt` that states the content, and captions that add
  context the alt text does not: the illustration's caption says it is not a
  screenshot, the chart's caption gives the measurement date and why the two ranks
  are quoted separately.
- The first image block is the intended featured image.
- No raw HTML in any block; inline Markdown only.
- The rendered publication date comes from `2026-08-28T00:47:32+07:00`; the
  public machine date is `2026-08-27T17:47:32.000Z`, the same instant in UTC.
- No keyword stuffing; no author suffix inside `seoTitle`.
- No research-note section, methodology disclaimer, source-count summary, or
  cutoff paragraph at the end. Qualifications sit beside the claims they limit —
  the sampling limits open the reception section, the vendor-harness limit opens
  the benchmark section.

## Anti-slop pass

Applied after the factual draft. Two changes, both structural: em-dash parentheticals
converted to colon-and-clause and comma-clause forms. No fact, figure, date,
name, quotation, link, or source attribution was altered. Tell-catalogue items
checked and absent: no "in today's fast-paced", no "it's important to note", no
tricolon padding, no "not just X but Y" escalation, no rhetorical questions as
transitions, no summary paragraph restating the article.

## Unresolved claims

- **C04, unknown.** Whether the weights served on `stealth/ox-alpha` are the
  weights released as `z-ai/glm-5.3-flash` is unstated by every source examined
  (S01, S02, S05, S06, S08). The article states it as unstated, not as a
  contradiction. This is the article's declared uncertainty boundary and the
  second half of its title.
- **C11, both figures verified, reconciliation unknown.** Artificial Analysis
  publishes $0.09 per Intelligence Index task; Z.ai's page claims the same score
  of 57 at $0.045. Both are reported; neither is averaged or preferred.
- **C17, C18, reported.** iThome's data-governance findings — the gap between the
  model page's data statement and the Stealth Program's general terms, and the
  limit of Z.ai's privacy documents to its own services — are carried as an
  unresolved question in the ledger. They are outside this article's scope and are
  not asserted in the prose as findings of wrongdoing.
- **C20, inferred.** Preview-week praise arrived without brand attribution. The
  article states this as an inference about the *conditions* of the praise, not
  about its strength.

## Blockers and gaps

1. **No authorized API route, so no local benchmark (C26).** The environment
   holds only `ANTHROPIC_AUTH_TOKEN`, `CLAUDE_CODE_MAX_CONTEXT_TOKENS` and
   `HL_INITIAL_WORKSPACE_TOKEN`; credential variable *names* were listed without
   reading any value. Reading `.env.local` was denied and was not retried.
   There is therefore no route to GLM-5.3-Flash from here. Per the assignment, no
   benchmark was manufactured: `benchmark-plan.md` and `benchmark-results.md` are
   deliberately absent, the hands-on section is dropped from the article
   structure, and the article makes no local-measurement claim. Performance rests
   on one independent lab (S09) and Z.ai's own table, kept apart.
2. **No third-party evidence image is publishable.** Under
   `docs/blog-writing-automation-contract.md:145`, collected third-party web
   images are research references, not publishable Blog assets, and no publication
   rights were established for S01–S13. The article's non-generated evidence
   visual is therefore the factual chart, built in this environment from
   `chart-data.json` with code — an original asset carrying verified third-party
   figures, not a reproduction of a third-party page. No generated image is
   presented as evidence.
3. **X/Twitter not sampled.** Attributable posts could not be opened in full, so
   the platform is excluded and the exclusion is stated in the article, not only
   in the method file.
4. **Reddit reached only through the Wayback Machine.** Live capture hits an
   anti-bot interstitial and `old.reddit.com` requires login, so S12 and S13 carry
   archive chrome. Handles, timestamps and permalinks are legible in both.
5. **Publication gate resolved.** Both assets are live under their semantic keys,
   the Blog record is published, the deterministic seed builds at 25 Blog posts,
   and the global audit reports 25 records, 77 image blocks, and zero missing SEO
   fields or pending repairs.

## Live route validation

The production route returned HTTP 200 and was inspected at 1440 px and 375 px.
It contains one H1, seven article H2 headings, two decoded R2 images, two visible
captions, and no visitor-facing admin controls. The document width exactly
matched each viewport (`1440 / 1440` and `375 / 375`), so no horizontal overflow
was introduced.

Canonical, Open Graph, and Twitter metadata all point to the final slug. The
social titles append `· Mukhtada` exactly once. `BlogPosting` JSON-LD exposes the
correct headline, author, `AI Investigation` section, publication/modification
dates, and the 1536 × 1024 featured image. Both encoded files decoded at their
manifest dimensions: 1536 × 1024 and 1200 × 760.

Keyboard focus on a Blog link rendered a 2 px solid outline. Under
`prefers-reduced-motion: reduce`, the media query matched and the live page had
zero active CSS animations. Browser console and page-error collections were
empty. The slug was present in both `/blog` and `/sitemap-blog.xml`.

Screenshot evidence:

- `rendered/desktop-1440.png`
- `rendered/mobile-375.png`
- `rendered/mobile-top-375.png`
- `rendered/mobile-chart-375.png`
- `rendered/keyboard-focus-1440.png`
- `rendered/reduced-motion-375.png`

Final repository and live-data gates:

- `npm run convex:typecheck`: passed.
- `npm run convex:seed:build`: passed with 25 Blog posts and content hash
  `f77012491471644c5efb15b6e2df7ca525f9e9169262866c6fc1121df4781c7f`.
- `npm run blog:seo-data:verify-images`: 77 encoded files match the manifest.
- `npm run blog:seo-data`: 25 records, 77 image blocks, zero pending updates.
- `npm run blog:seo-alt -- --base=https://me.mukhtada.my.id`: 23 routes and
  265 rendered images, zero missing or empty alt attributes.
- `npm run build`: passed; `/blog/[slug]` remains dynamic server rendering.
- Public API uniqueness check: exactly one record for this slug.
- Public route status: HTTP 200.

## Relationship to the earlier article

`/blog/ox-alpha-api-left-a-trail` concluded before the reveal. Its operator and
family conclusions are superseded by the first-party statement (C05); its open
checkpoint question is *not* superseded and is carried forward as this article's
boundary. The new article links to it and states that the reveal closed half the
question. No claim in the earlier article is contradicted silently. Whether a
visible correction is warranted on the earlier post is a separate editorial
decision and was not made here.

## Security

No API key, cookie, authorization header, routing identifier, or account detail
appears in any command, log, screenshot, ledger, asset, or article text. The
credential check listed variable names only. `local-imagegen` was called without
an API key and without a `model` argument. No private system was probed and no
access was expanded beyond what already existed in the environment.
