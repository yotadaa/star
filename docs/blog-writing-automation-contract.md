# Blog Writing Automation Contract

This document defines what an automated Blog-writing agent must prepare before it can create or update an article in this repository. A writing request is not a publish instruction until every required input and gate below is complete.

For the current agent-only Convex/R2 upload commands, file templates, batch parameters, duplicate-run check, and IndexNow procedure, follow [`docs/blog-agent-upload-runbook.md`](blog-agent-upload-runbook.md). This contract defines the evidence and editorial gates; the runbook defines the repository operation.

This contract and its upload runbook are also bundled into the global `write-grounded-blogs` Agent Skills package. The live repository copies remain authoritative for Star Blog work; refresh the global bundle with `npm run skill:write-grounded-blogs:install` after changing either document.

## 1. Assignment packet

The automation must receive or establish these items before research starts:

- Working topic and the exact reader question.
- Article form: investigation, project review, README adaptation, technical explainer, case study, research note, development log, or community story.
- Intended audience and the knowledge they can be expected to have.
- Research cutoff date and timezone when chronology matters.
- Repository, branch, commit, deployment, document, dataset, interview, or other direct artifact in scope.
- Primary source URL for `sourceHref`.
- Author identity and canonical profile URL.
- Publication language as a BCP 47 tag such as `en-US`.
- Article section from the existing editorial taxonomy.
- Media ownership: generated original, user-owned, first-party repository asset, or source evidence with explicit permission.
- One useful action readers can take after the article, such as opening the inspected repository or checking the original source chain.

If the subject, identity, acronym, date, metric, ownership, or publication authority is unclear, the agent must stop and request a specific answer. It must not fill the gap from intuition.

## 2. Evidence packet

Research must produce a claim ledger before drafting begins.

| Field | Required content |
|---|---|
| Claim ID | Stable key such as `C01` |
| Planned claim | One exact proposition, not a broad topic |
| Source | Direct URL or repository file with a line, commit, query, or screenshot reference |
| Source class | Direct artifact, first-party publication, primary reporting/research, firsthand social source, secondary synthesis, or discovery lead |
| Direct support | A short paraphrase of what the source proves |
| Event date | Date of the event or measured state |
| Publication/access date | Date the source was published or inspected |
| Status | `verified`, `corroborated`, `reported`, `claimed`, `inferred`, `unknown`, or `rejected` |
| Limit or conflict | Missing context, access limit, disagreement, later correction, or uncertainty |
| Article use | Opening, section name, table row, caption, CTA, or omitted |

The central claim, title, opening, numeric facts, dates, names, quotations, verdict, and CTA must each map to at least one ledger row. A discovery lead may point to evidence but cannot carry a central claim by itself.

The agent must also prepare a terminology ledger for every unclear acronym, codename, role, benchmark, technical term, or measurement:

| Term | Accepted meaning | Direct source | Rejected alternatives | Wording used in article |
|---|---|---|---|---|

Unresolved terms must be labelled as uncertain in the article or removed.

## 3. Editorial data

Every article payload must contain these fields:

```js
{
  title: "<visible H1>",
  slug: "<lowercase-kebab-case>",
  excerpt: "<visible article summary>",
  status: "draft" | "published" | "archived",
  tags: ["<specific tag>"],
  publishedAt: "<valid ISO 8601 value when publishing>",
  readTime: "<measured estimate, for example 8 min read>",
  coverTone: "<an existing visual tone>",
  sourceHref: "<primary source URL or internal path>",
  seoTitle: "<plain search title, 70 characters or fewer>",
  seoDescription: "<accurate search summary, 180 characters or fewer>",
  language: "<BCP 47 language tag>",
  author: {
    id: "<stable canonical person or organization ID>",
    name: "<verified public name>",
    url: "<canonical HTTPS profile URL>"
  },
  articleSection: "<editorial section, not coverTone>",
  // The grounded publisher derives featuredImage from the checked-in
  // featuredImageKey and its matching provider-neutral image block.
  blocks: []
}
```

Rules for these fields:

- `title` may carry the article's voice. `seoTitle` must make a bounded promise in ordinary language.
- Do not put an author suffix in `seoTitle`. The article route appends `· Mukhtada` to document, Open Graph, and Twitter titles.
- `excerpt` describes the visible article. `seoDescription` must accurately summarize the answer or scope without hiding uncertainty.
- The title and description limits are repository validation limits, not promises about how a search engine will display the snippet.
- `readTime` must come from the final word count and a stated reading-rate rule. It must not be copied from another post.
- `coverTone` is presentation data. It cannot stand in for `articleSection`.
- `publishedAt` must describe the real publication decision. The backend exposes it as numeric `datePublished` and exposes the last write as `dateModified`.
- `archived` keeps a record out of the public Blog query. It is not a shortcut around the publish gate.
- A guest or organization author requires its own verified ID, name, and URL. The default Mukhtada identity is valid only for Mukhtada's first-party work.
- A published article must have an explicit featured image selected from its image blocks. Reordering body images must not silently change the featured image.

Current first-party author record:

```js
{
  id: "https://me.mukhtada.my.id/#person",
  name: "Mukhtada Billah NST",
  url: "https://me.mukhtada.my.id/"
}
```

Current section names include `Technical Case Study`, `AI Investigation`, `Project Review`, `Portfolio`, `Open Source Project`, `Research Note`, `Development Log`, and `Community Story`. A new section requires an editorial decision; the agent must not derive one from a color or visual tone.

## 4. Native block payload

The Convex Blog model accepts these block types only:

| Type | Required data | Optional data |
|---|---|---|
| `heading` | `text` | none |
| `paragraph` | `text` | none |
| `quote` | `text` and a verifiable speaker/source in nearby prose | none |
| `list` | newline-separated `text` | numeric prefixes for an ordered list |
| `code` | `text` | a supported flowchart declaration |
| `image` | `text`, `alt`, `width`, `height`, and a durable `assetKey` | none for grounded batch input |
| `divider` | empty `text` | none |
| `table` | `text` caption and `rows` | none |
| `icon` | `text` | none |

Do not submit raw article HTML. Links, emphasis, and inline code use the renderer's supported Markdown syntax inside text fields. Tables carry real comparisons or timelines; they are not layout devices.

The first paragraph must give the reader a verified anchor and the article's honest promise. Section headings must make sense when read by themselves. Claims should appear next to their evidence, and the ending must resolve the opening question before the CTA.

## 5. Media packet

Every image needs a visual-ledger row:

| Field | Required content |
|---|---|
| Visual ID | Stable key such as `V01` |
| Narrative job | What the image helps the reader understand |
| Owner/source | User, repository, generated original, or licensed source |
| Rights status | Why publication is allowed |
| Source artifact | Local path or source URL used for verification |
| Durable asset key | `blog:<slug>:<semantic-key>` |
| Alt text | What matters in the article context |
| Caption | Evidence or relationship added beyond the alt text |
| Width and height | Intrinsic encoded-pixel dimensions measured from the final file |
| Checksum | SHA-256 of the uploaded bytes for idempotent reuse |

Collected third-party web images are research references, not publishable Blog assets. The agent may publish an original generated illustration, authorized user-owned media, a first-party repository asset, or source evidence whose publication rights have been established. Generated art cannot impersonate a real screenshot, person, document, result, benchmark, or event.

For an image published through the grounded batch uploader:

- Declare the final local file once in the explicit batch manifest.
- Reuse an existing R2-backed file when its stable asset key and checksum match.
- Keep the input payload provider-neutral: persist `assetKey`, not `storageId` or `src`.
- Let the protected publisher resolve and verify the R2-backed delivery record.
- Measure `width` and `height` from the encoded bytes, not from CSS or the intended crop.
- Write brief alt text that describes the image's role. A caption should add evidence or context rather than repeat the alt text.

A stable HTTPS `src` is allowed for a pinned first-party external asset when storage is not appropriate. Unpinned branch URLs and temporary, signed, blob, or local filesystem URLs are not durable sources.

## 6. Draft gate

The agent may draft only after all of these are true:

- [ ] The assignment packet is complete.
- [ ] The article form has been chosen from the evidence available.
- [ ] Every central claim has a claim-ledger row.
- [ ] Disputed facts have direct attribution.
- [ ] Event dates and source publication dates are separate.
- [ ] Ambiguous terms are resolved, bounded, or omitted.
- [ ] The title does not promise a fact the evidence cannot answer.
- [ ] The opening contains a fact specific to this article.
- [ ] The article distinguishes observation, reporting, claim, inference, and judgment.
- [ ] Quotations are short, exact, contextual, and attributed.
- [ ] The CTA points to a useful source, artifact, check, repository, or demo.

## 7. Publish gate

The agent may publish only after all of these are true:

- [ ] The final payload uses only the supported block types.
- [ ] `seoTitle`, `seoDescription`, `language`, `author`, and `articleSection` are explicit.
- [ ] The publication date is real and parseable.
- [ ] Every image has publication rights, a durable identity, non-empty alt text, a useful caption, and measured positive dimensions.
- [ ] `featuredImage` points to one current image block and carries the same identity, alt text, width, and height.
- [ ] Stored images contain no persisted delivery URL.
- [ ] All links open the source that supports the nearby statement.
- [ ] The publisher updates by slug and reuses media by asset key/checksum.
- [ ] Running the publisher twice creates no duplicate post or file.
- [ ] Desktop, 375 px mobile, keyboard focus, and reduced-motion states have been rendered and checked.
- [ ] The article has no new horizontal overflow.

## 8. Repository procedure

Each publisher must call `completeBlogSeoData()` from `scripts/blog-seo-data.mjs` before it sends a Blog payload to Convex. Add the article's approved metadata and measured image entries to that file first. The global maintenance script rejects any record or image missing from the manifest.

Run these checks in order:

```bash
npm run convex:typecheck
npm run convex:seed:build
npm run blog:seo-data:verify-images
npm run blog:seo-data
```

`npm run blog:seo-data` is read-only. It must report no unknown slug, missing image measurement, invalid date, or incomplete field. Apply an approved repair with:

```bash
npm run blog:seo-data:apply
```

Run the read-only command again. A correct second pass reports zero required updates. Then run:

```bash
npm run build
```

The grounded batch publisher also notifies IndexNow for `/blog` and every changed article URL when `AHREFS_INDEXNOW_KEY` is configured. Its output must show `indexNow.ok: true` with HTTP 200 or 202. That acknowledgement means the URL update was received, not that the page has been crawled or indexed. If deployment-time catch-up is required, inspect the URL count first and submit only after the deployed key route matches:

```bash
npm run indexnow:submit -- --dry-run
npm run indexnow:submit
```

The final evidence folder must contain the claim ledger, terminology ledger when used, visual ledger, publisher output, no-op rerun output, rendered metadata assertions, and desktop/mobile/reduced-motion screenshots.

## 9. Stop conditions

The automation must leave the article as a draft and request input when any of these remains unresolved:

- the central claim has no direct support;
- sources conflict and the article does not state the conflict;
- a name, role, date, number, quote, metric, or codename cannot be verified;
- media ownership or permission is unknown;
- an image lacks measured intrinsic dimensions or durable identity;
- author identity, language, section, primary source, or publication date is missing;
- the article promises a result, release date, security property, performance claim, or production status that was not tested;
- the publisher is not idempotent;
- the final global Blog SEO audit fails.

No deadline or automation schedule overrides these stop conditions.
