# Agent-Only Blog Upload Runbook

This is the operational tutorial for an agent that prepares, uploads, publishes, and validates Blog content **without using the `/blog/admin` web editor**. It documents the repository workflow that publishes native Blog blocks to Convex, uploads public images to Cloudflare R2, updates the reproducible seed, and notifies IndexNow.

Use this together with:

- [`docs/blog-writing-automation-contract.md`](blog-writing-automation-contract.md) for the editorial and evidence contract;
- `$write-grounded-blogs` at `~/.agents/skills/write-grounded-blogs/SKILL.md` for the shared research-first writing procedure;
- [`scripts/publish-grounded-blog-batch.mjs`](../scripts/publish-grounded-blog-batch.mjs) as the only normal agent-side publisher for grounded Blog packages.

## 1. What this workflow does

```text
research package
  -> audited Markdown draft
  -> native-block payload.json
  -> SEO and image manifest
  -> explicit batch manifest
  -> R2 image upload or checksum reuse
  -> Convex create/update by slug
  -> IndexNow notification
  -> live route validation
  -> deterministic seed rebuild
```

The publisher is server-to-server. An agent does not log in to the management page, click editor controls, paste HTML, or manually copy media URLs into a payload.

Important boundaries:

- Preparing a draft is **not** permission to publish it.
- Keep `status` as `"draft"` and do not run the publisher until the user has explicitly authorized publication.
- The grounded publisher intentionally rejects draft payloads. A publishable payload must use `"status": "published"` and a truthful `publishedAt` value.
- Publishing changes live Convex/R2 state. Committing and pushing are separate actions and also require user authorization unless the current task already grants it.
- Never expose `CONVEX_INTERNAL_API_KEY`, `INDEXNOW_API_KEY`, or other secret values in logs, Markdown, screenshots, commits, or chat output.

## 2. Required environment

The publisher loads repository-root `.env.local`. It requires:

```dotenv
CONVEX_CLOUD_URL=https://<deployment>.convex.cloud
CONVEX_INTERNAL_API_KEY=<server-only-secret>
NEXT_PUBLIC_SITE_URL=https://me.mukhtada.my.id
INDEXNOW_API_KEY=<server-only-indexnow-key>
OWNER_EMAIL=<owner-email>
```

`CONVEX_CLOUD_URL` and `CONVEX_INTERNAL_API_KEY` are mandatory. `OWNER_EMAIL` has the repository owner as a fallback, but configuring it explicitly is preferable. `INDEXNOW_API_KEY` is required for a successful search-engine notification, though an IndexNow failure does not undo a completed Blog or R2 write.

Do not add R2 access secrets to the Blog payload. The publisher asks the protected Convex bridge for a signed upload URL and then verifies the resulting R2-backed file record.

## 3. Create one self-contained article package

Use a stable lowercase kebab-case slug. Do not include a date in the public slug unless the date is part of the subject. Store working material under a dated validation directory:

```text
validation/<slug>-YYYY-MM-DD/
├── assignment.md
├── terminology-ledger.md
├── claim-ledger.md
├── source-ledger.md
├── visual-ledger.md
├── hook-scorecard.md
├── draft.md
├── payload.json
├── validation.md
├── assets/
│   ├── <feature-image>.png
│   └── <authorized-evidence-image>.jpg
└── sources/
    └── <private-research-captures>.jpg
```

The `sources/` captures prove what the agent actually inspected. They are private research evidence unless publication rights have been established. Do not add every captured third-party page to the article body.

### 3.1 Assignment packet

Before research, record:

- exact reader question and article form;
- audience and expected background;
- language, usually `en-US` for current Blog investigations;
- research cutoff and timezone when chronology matters;
- primary source for `sourceHref`;
- candidate thesis and what would falsify it;
- source classes required, including primary/first-party and independent sources;
- media ownership and publication-rights boundary;
- requested hook, CTA, pros/cons, and known wording restrictions.

If the user requests evidence-based research, do not treat a supplied article as sufficient by itself. Open multiple relevant sources, prefer direct artifacts and primary sources, and use secondary reporting for context or discovery.

### 3.2 Research Gate

Do not draft the article until all central claims have ledger support. At minimum:

1. Build `terminology-ledger.md` for ambiguous names, metrics, acronyms, and product terms.
2. Build `claim-ledger.md` with one falsifiable proposition per row.
3. Build `source-ledger.md` with every opened source, its role, event/publication/access dates, and limitations.
4. Capture each source actually used. A screenshot must show enough publisher identity and content to be attributable.
5. Mark social posts and community reports as firsthand reports, not universal facts.
6. Resolve numeric conflicts before they appear in the title, opening, table, caption, or conclusion.

The gate fails when a central claim depends only on a discovery snippet, inaccessible page, unattributed screenshot, or a single uncorroborated report.

### 3.3 Visual Gate

Every published image needs a row in `visual-ledger.md` with:

- narrative job;
- owner/source and publication-rights basis;
- final local path;
- stable `assetKey`;
- descriptive contextual alt text;
- caption that adds information rather than repeating the alt text;
- exact encoded width and height;
- SHA-256 checksum.

Measure the final bytes, not a CSS size or generation prompt. The repository image parser and the system checksum utility can inspect one local asset without uploading it:

```bash
node --input-type=module -e '
  import fs from "node:fs";
  import { readImageDimensions } from "./scripts/image-dimensions.mjs";
  console.log(readImageDimensions(fs.readFileSync(process.argv[1])));
' validation/<slug>-YYYY-MM-DD/assets/<image-file>

sha256sum validation/<slug>-YYYY-MM-DD/assets/<image-file>
```

Use a semantic key with this shape:

```text
blog:<slug>:<semantic-image-name>
```

Good:

```text
blog:example-agent-routing:feature-routing-workbench
blog:example-agent-routing:evidence-primary-benchmark-table
```

Bad:

```text
blog:image-1
blog:example-agent-routing:screenshot
```

For grounded investigations, the usual package contains one original editorial feature image and one tightly cropped, attributed, authorized evidence image. Reject generic glossy AI imagery, fake interfaces, fabricated screenshots, fake charts, fake quotes, and visuals that imply an event or result that was not observed.

## 4. Write and audit the Markdown draft

The article should be readable as a standalone English article before conversion to blocks. Use warm third-person editorial voice unless the assignment explicitly requires another voice. Discuss meaningful advantages, drawbacks, uncertainties, and counterexamples.

Do not add a generic "Research note," source-count summary, cutoff disclaimer, or methodology paragraph at the end. Put material limitations next to the affected claims and resolve the article's opening question before the CTA.

Audit the draft:

```bash
python ~/.agents/skills/write-grounded-blogs/scripts/audit_blog.py \
  validation/<slug>-YYYY-MM-DD/draft.md \
  --third-person
```

Resolve hard findings. Review warnings rather than suppressing them mechanically. Calculate `readTime` from the final prose, using the repository convention of about 225 words per minute and rounding up.

## 5. Convert the article to native Blog blocks

Do not submit raw article HTML. Create `payload.json` with repository-native blocks.

### 5.1 Complete payload example

The following is valid JSON and shows the expected shape. Replace every placeholder with real article data.

```json
{
  "title": "What a Smaller Agent Router Gets Right",
  "slug": "example-agent-routing",
  "excerpt": "A grounded comparison of retrieval precision, operational simplicity, and the limits of a smaller skill pool.",
  "status": "published",
  "tags": ["AI agents", "agent skills", "evaluation"],
  "publishedAt": "2026-08-26T21:00:00+07:00",
  "readTime": "8 min read",
  "coverTone": "research",
  "sourceHref": "https://example.org/primary-source",
  "seoTitle": "Why a Smaller Agent Skill Pool Can Work Better",
  "seoDescription": "A sourced look at how skill-pool size affects retrieval precision, where smaller routers help, and where the evidence remains limited.",
  "language": "en-US",
  "author": {
    "id": "https://me.mukhtada.my.id/#person",
    "name": "Mukhtada Billah NST",
    "url": "https://me.mukhtada.my.id/"
  },
  "articleSection": "AI Investigation",
  "blocks": [
    {
      "type": "paragraph",
      "text": "A verified, article-specific hook goes here. It states what happened and what the evidence can answer."
    },
    {
      "type": "image",
      "text": "A compact router exposes fewer candidates to the retrieval step, reducing one source of selection noise.",
      "assetKey": "blog:example-agent-routing:feature-routing-workbench",
      "alt": "Paper task cards being sorted through five labeled routing slots on a wooden workbench",
      "width": 1672,
      "height": 941
    },
    {
      "type": "heading",
      "text": "The measured result is narrower than the slogan"
    },
    {
      "type": "paragraph",
      "text": "A supported paragraph with an inline [primary-source link](https://example.org/primary-source)."
    },
    {
      "type": "list",
      "text": "The smaller pool reduces candidate competition.\nThe larger pool can cover more procedures.\nNeither result proves the same optimum for every workload."
    },
    {
      "type": "table",
      "text": "Observed trade-offs in the inspected evaluation",
      "rows": [
        ["Configuration", "Advantage", "Limitation"],
        ["Smaller pool", "Less retrieval competition", "Narrower capability coverage"],
        ["Larger pool", "More available procedures", "Harder selection problem"]
      ]
    },
    {
      "type": "image",
      "text": "The highlighted table cells are the bounded evidence used for the comparison above.",
      "assetKey": "blog:example-agent-routing:evidence-primary-benchmark-table",
      "alt": "Cropped benchmark table comparing retrieval results across several agent skill-pool sizes",
      "width": 1265,
      "height": 712
    },
    {
      "type": "divider",
      "text": ""
    },
    {
      "type": "paragraph",
      "text": "The conclusion answers the opening question, states the boundary, and gives the reader a useful source-led action."
    }
  ]
}
```

Use only these block types:

| Type | Required structure | Rendering note |
|---|---|---|
| `paragraph` | `text` | Supports the renderer's safe inline Markdown. |
| `heading` | `text` | Renders as an article section heading; do not duplicate the page H1. |
| `quote` | `text` | Attribute the speaker/source in nearby prose. |
| `list` | newline-separated `text` | Prefix every item with `1.` for an ordered list. |
| `code` | `text` | Also supports the repository's bounded flowchart syntax. |
| `image` | `text`, `assetKey`, `alt`, `width`, `height` | `text` is the caption; never add `src` or `storageId`. |
| `divider` | `text: ""` | Structural pause only. |
| `table` | caption in `text`, two-dimensional `rows` | The first row becomes column headers. |
| `icon` | `text` | Use sparingly; it is not an emoji escape hatch. |

Payload rules that frequently prevent publication:

- `slug` must exactly match the batch article slug.
- `status` must be `"published"` when the publisher is run.
- `publishedAt` must be a real ISO 8601 publication decision, not a research date copied from a source.
- `seoTitle` must be non-empty and at most 70 characters.
- `seoDescription` must be non-empty and at most 180 characters.
- Current grounded articles use `language: "en-US"` unless the assignment establishes another supported language.
- Every block needs `text`; image captions and alt text must both be non-empty.
- Every image block must correspond to exactly one batch asset.
- Do not persist an R2 URL, Convex delivery URL, `src`, or legacy `storageId`. The publisher resolves storage.
- Do not append an author suffix to `title` or `seoTitle`. The route produces document titles ending in `· Mukhtada`.

The payload may contain a provider-neutral `featuredImage` object, but it is safer to omit it. The checked-in SEO manifest selects the featured image from the matching image block and constructs the final object consistently.

## 6. Register SEO metadata and image dimensions

Before publishing, edit [`scripts/blog-seo-data.mjs`](../scripts/blog-seo-data.mjs).

Add one entry to `BLOG_SEO_RECORDS`:

```js
"example-agent-routing": Object.freeze({
  seoTitle: "Why a Smaller Agent Skill Pool Can Work Better",
  seoDescription:
    "A sourced look at how skill-pool size affects retrieval precision, where smaller routers help, and where the evidence remains limited.",
  language: "en-US",
  author: BLOG_AUTHOR,
  articleSection: "AI Investigation",
  featuredImageKey: "blog:example-agent-routing:feature-routing-workbench",
}),
```

Add the measured intrinsic dimensions of every published image to `BLOG_IMAGE_DIMENSIONS`:

```js
"blog:example-agent-routing:feature-routing-workbench": { width: 1672, height: 941 },
"blog:example-agent-routing:evidence-primary-benchmark-table": { width: 1265, height: 712 },
```

The payload and the SEO manifest should say the same thing. `completeBlogSeoData()` treats the manifest as authoritative and uses `featuredImageKey` to select the article's feature from its image blocks.

## 7. Create an explicit batch manifest

Create `scripts/blog-batches/<batch-name>.json`. One article is still a batch:

```json
{
  "name": "example-agent-routing-2026-08-26",
  "articles": [
    {
      "slug": "example-agent-routing",
      "payloadPath": "validation/example-agent-routing-2026-08-26/payload.json",
      "assets": [
        {
          "assetKey": "blog:example-agent-routing:feature-routing-workbench",
          "sourcePath": "validation/example-agent-routing-2026-08-26/assets/routing-workbench-feature.png",
          "fileName": "example-agent-routing-feature.png",
          "evidenceKind": "generated-editorial"
        },
        {
          "assetKey": "blog:example-agent-routing:evidence-primary-benchmark-table",
          "sourcePath": "validation/example-agent-routing-2026-08-26/assets/primary-benchmark-table.jpg",
          "fileName": "example-agent-routing-benchmark-evidence.jpg",
          "evidenceKind": "attributed-primary-research-source-evidence"
        }
      ]
    }
  ]
}
```

Batch rules:

- Every article needs `slug`, `payloadPath`, and `assets`.
- Every asset needs `assetKey`, `sourcePath`, `fileName`, and a meaningful `evidenceKind`.
- Every asset key must start with `blog:<article-slug>:`.
- Slugs and asset keys must be unique across the batch.
- Supported final image bytes are PNG, JPEG, and WebP.
- The number of batch assets must exactly equal the number of image blocks in that article's payload.
- Paths must remain inside the repository.

**Always pass the batch path explicitly.** The script retains an older default batch for backward compatibility. Running it without a path can update the wrong articles.

## 8. Register the article in the deterministic seed

Live publication and seed reproducibility are related but separate. The publisher updates live Convex/R2; the seed lets a future migration or rebuild reproduce the checked-in Blog corpus.

For every article approved for publication:

1. Add its `payload.json` path to `GROUNDED_BLOG_PAYLOAD_PATHS` in [`scripts/convex-seed-data.mjs`](../scripts/convex-seed-data.mjs).
2. Increase `expectedSeedCounts.blogPosts` by the number of newly registered slugs.
3. Add the batch manifest, payload, and every public article asset path to `sourceFiles` in [`scripts/build-convex-seed.mjs`](../scripts/build-convex-seed.mjs).
4. Do not add private research screenshots unless they are intentionally part of the reproducible publication artifact.

Do not register the same slug twice. Updating an existing article keeps the same seed count.

## 9. Pre-publish checks

First verify that the two JSON files parse:

```bash
jq empty validation/<slug>-YYYY-MM-DD/payload.json
jq empty scripts/blog-batches/<batch-name>.json
```

Then run the repository gates:

```bash
npm run convex:typecheck
npm run convex:seed:build
npm run blog:seo-data:verify-images
npm run blog:seo-data
npm run build
```

What these checks mean:

- `convex:typecheck` verifies the Convex contract.
- `convex:seed:build` validates the reproducible corpus, native blocks, dates, images, unique slugs, and expected counts.
- `blog:seo-data:verify-images` checks the checked-in dimensions against the stored public image bytes already known to live Convex.
- `blog:seo-data` is a read-only audit of the current live Blog corpus. It does not publish the new article.
- `build` checks the application integration and static route code.

The new article itself receives its final payload validation inside the grounded publisher before any Blog record is created or updated. Do not interpret successful JSON parsing alone as publish readiness.

## 10. Publish through the agent script

Only after explicit publication authority, run:

```bash
npm run blog:publish:grounded-batch -- \
  scripts/blog-batches/<batch-name>.json
```

For each article, the script:

1. validates the batch and provider-neutral payload;
2. hashes the final image bytes;
3. reuses an existing R2 file when its `assetKey` and checksum match;
4. otherwise obtains a signed upload URL, uploads the bytes, and commits the public file record;
5. applies the SEO manifest and selects the featured image;
6. finds an existing Blog post by slug;
7. creates the post when the slug is new or updates it when the slug already exists;
8. reads back the stored post and verifies its status and image count;
9. notifies IndexNow about `/blog` and every changed article route.

A normal first-run result resembles:

```json
{
  "batch": "example-agent-routing-2026-08-26",
  "results": [
    {
      "slug": "example-agent-routing",
      "action": "created",
      "blocks": 38,
      "images": 2,
      "uploads": 2,
      "reused": 0
    }
  ],
  "indexNow": {
    "ok": true,
    "status": 200
  }
}
```

Copy the real output into `validation.md`; never fabricate these counts.

### 10.1 Mandatory idempotency rerun

Run the exact same command a second time:

```bash
npm run blog:publish:grounded-batch -- \
  scripts/blog-batches/<batch-name>.json
```

For an unchanged package, expect:

- `action: "updated"` because the publisher upserts by slug;
- `uploads: 0`;
- `reused` equal to the article's asset count;
- no duplicate Blog row;
- no duplicate file upload.

If the second run uploads unchanged bytes again or creates another post, stop and investigate. Do not call the workflow complete.

### 10.2 Final live-data audit

After the first publish and the unchanged rerun, audit the now-live record again:

```bash
npm run blog:seo-data:verify-images
npm run blog:seo-data
```

This pass is the one that can verify the new article's resolved public R2 bytes, dimensions, featured image, machine dates, and complete SEO data. A correct result requires zero pending repairs. Do not run `blog:seo-data:apply` unless the user has approved a repair to existing live records.

## 11. Updating an existing article

Use the same public slug and the same semantic asset keys.

- Text-only update: edit the payload and run the same explicit batch. Existing image checksums should be reused.
- Replacing image bytes: keep the asset key when the image serves the same narrative identity. The changed checksum causes a new R2 upload and updated file record.
- Adding/removing an image: update the payload blocks, batch assets, visual ledger, dimensions manifest, and featured selection together.
- Changing SEO metadata: update both the payload and `BLOG_SEO_RECORDS`.
- Changing a slug is not an ordinary edit. It creates a new record because the publisher upserts by slug. A slug migration requires an explicit redirect/archive plan for the old URL.
- Never change `publishedAt` merely because an existing article was edited. The backend separately maintains its modification time.

## 12. Validate the public result

Open the actual public route:

```text
https://me.mukhtada.my.id/blog/<slug>
```

Capture and visually inspect at least:

- desktop at 1440 px wide;
- mobile at 375 px wide;
- keyboard focus on interactive Blog controls;
- reduced-motion mode;
- every image and caption;
- wide tables, code, and links for horizontal overflow.

Verify the rendered page, not only the payload:

- one visible H1 and a logical H2 section sequence;
- article title, excerpt, author, publication date, and read time are correct;
- canonical URL points to the same slug;
- Open Graph/Twitter title ends in `· Mukhtada` exactly once;
- `BlogPosting` JSON-LD has the correct headline, author, dates, section, and image;
- every content image has an actual, descriptive `alt` attribute;
- image dimensions are positive and match the encoded files;
- captions are visible and do not merely duplicate alt text;
- source links open the evidence claimed by nearby prose;
- no draft/admin controls appear for visitors;
- the article appears in `/blog` and `sitemap-blog.xml` after the live data refresh.

Save screenshots and rendered assertions in the package's validation folder. Inspect screenshots visually; a successful command is not a substitute for visual evidence.

## 13. IndexNow behavior

The grounded publisher automatically sends `/blog` and each changed Blog URL to IndexNow. An HTTP 200 or 202 means the update was accepted for processing. It does **not** guarantee that Bing has crawled, indexed, or ranked the page.

If the Blog result is successful but `indexNow.ok` is false:

- the Blog and R2 writes have already happened;
- do not republish merely to retry IndexNow;
- verify that the deployed key route matches the local server-only key;
- use the guarded catch-up command after deployment is correct.

For one URL:

```bash
npm run indexnow:submit -- \
  --dry-run \
  --url=https://me.mukhtada.my.id/blog/<slug>

npm run indexnow:submit -- \
  --url=https://me.mukhtada.my.id/blog/<slug>
```

The dry run reports the host, key location, and URL count without submitting. The real command refuses to submit when the deployed key file does not match the local key.

## 14. Finish the validation record

`validation.md` should record facts another agent can verify:

```markdown
# Validation

- Slug: `<slug>`
- Research Gate: passed / blocked
- Used sources: `<count>`
- Private source captures: `<count>`
- Draft audit: `<hard findings> hard, <warnings> warnings`
- Draft words: `<count>`
- Native blocks: `<count by type>`
- Published assets: `<asset key, dimensions, SHA-256, rights basis>`
- SEO title length: `<count>`
- SEO description length: `<count>`
- Seed build: passed / failed
- Application build: passed / failed
- First publish: `<created/updated, uploads, reused>`
- Duplicate publish: `<updated, 0 uploads, expected reused>`
- IndexNow: `<ok/status or exact failure code>`
- Desktop route: passed / failed, screenshot path
- Mobile route: passed / failed, screenshot path
- Reduced motion and keyboard: passed / failed
- Remaining blocker: none / exact blocker
```

Do not write "all checks passed" without the underlying counts and paths.

## 15. Common failures

| Error or symptom | Meaning | Required correction |
|---|---|---|
| `Published payload identity is invalid` | Slug mismatch or payload is still a draft. | Match the batch slug; publish only with authority and a truthful date. |
| `BLOG_SEO_RECORD_MISSING` | The slug is absent from the SEO manifest. | Add the approved `BLOG_SEO_RECORDS` entry. |
| `BLOG_IMAGE_DIMENSIONS_MISSING` | An image key has no measured dimension entry. | Measure the final encoded file and add it to `BLOG_IMAGE_DIMENSIONS`. |
| `BLOG_FEATURED_IMAGE_MISSING` | `featuredImageKey` does not match an image block. | Correct the manifest key or restore that payload image. |
| `Image alt text or caption is missing` | An image lacks `alt` or caption `text`. | Add distinct, contextual values to the image block. |
| `Expected N image blocks ... received M` | Batch assets and payload images disagree. | Make the two sets exactly equal. |
| `Unexpected Blog image` | An image block uses an unregistered asset key. | Add the matching batch asset or remove the block. |
| `Stored Blog image cannot persist src` | Payload contains a delivery URL. | Remove `src`; retain the stable `assetKey`. |
| `legacy Convex storageId` | Provider-specific storage leaked into the grounded input. | Remove `storageId`; let the R2 publisher resolve storage. |
| `R2 upload failed` | Signed upload or byte transfer failed. | Preserve the package, inspect the exact status, and retry only after the storage issue is resolved. |
| `Published Blog verification failed` | Convex readback did not match the expected published result. | Stop; do not claim publication. Inspect stored status and image records. |
| `indexNow.ok: false` | Search notification failed after publication. | Repair the deployed key route/env and submit the URL separately. |
| Duplicate route after slug edit | A rename was treated as a new post. | Stop and prepare an explicit old-slug redirect/archive migration. |

## 16. Final agent checklist

### Preparation

- [ ] Load `$write-grounded-blogs` and read the automation contract.
- [ ] Create the assignment, terminology, claim, source, and visual ledgers.
- [ ] Inspect multiple sources; capture every source used.
- [ ] Pass the Research Gate before drafting.
- [ ] Confirm rights for every public image.
- [ ] Audit the English draft and resolve findings.
- [ ] Do not add a generic research-note ending.

### Payload and repository

- [ ] Create native `payload.json`; do not submit raw HTML.
- [ ] Keep the payload provider-neutral: `assetKey`, no `src`, no `storageId`.
- [ ] Give every image descriptive alt text, a useful caption, and measured dimensions.
- [ ] Add the slug and featured-image key to `BLOG_SEO_RECORDS`.
- [ ] Add every image measurement to `BLOG_IMAGE_DIMENSIONS`.
- [ ] Create one explicit batch manifest.
- [ ] Register the approved payload/assets in the deterministic seed and update the expected count for new slugs.
- [ ] Run typecheck, seed build, SEO audits, and application build.

### Publication and validation

- [ ] Confirm explicit publication authority.
- [ ] Set `status: "published"` and a truthful ISO `publishedAt`.
- [ ] Run the grounded publisher with the explicit batch path.
- [ ] Record the actual publisher and IndexNow output.
- [ ] Run the same publisher command again and verify zero uploads.
- [ ] Run the final live image/SEO audits and verify zero pending repairs.
- [ ] Render and inspect desktop, 375 px mobile, keyboard, and reduced-motion states.
- [ ] Verify canonical metadata, JSON-LD, sitemap visibility, every image alt, and no overflow.
- [ ] Update `validation.md` with counts, hashes, outputs, screenshots, and remaining blockers.
- [ ] Commit only task files; keep unrelated worktree changes out of the commit.
- [ ] Push only when authorized and report the commit hash and branch.
