# Validation report

## Outcome

**PASS for an unpublished native-block draft package.** The research gate passed before drafting. The package is self-contained for editorial review and an idempotent asset-upload step; it is not ready for publication until both image asset keys receive approved storage identities.

## Supported thesis

Pay-to-rank sites formed a fast, measurable copy wave because a bid changes the page and creates a public status event. The indexed evidence does not support treating the format as a stable advertising market: the original held 67.7% of the directory's board-reported takings at the cutoff, while the median measurable clone reported $16.

The conclusion is bounded to public mechanics, accessible social posts, and the outoutbid.lol indexed corpus. It does not claim platform-wide trend status, audited revenue, net proceeds, valid click counts, advertiser conversions, or a complete census of deleted and unindexed projects.

## Research evidence

- 24 opened-source screenshots are stored in `sources/`, covering direct products, original X posts, accessible Threads posts, first-party policy and product documentation, primary FTC guidance, a historical artifact, and named contemporary reporting.
- One additional bounded article-evidence capture is stored as `generated/outoutbid-research-summary-evidence.jpg`. It shows the source title, cutoff, methodology boundary, and headline figures in one viewport. The source page permits attributed reuse of its figures under CC BY 4.0.
- The source chain includes Outbid's original launch and recap posts, not only reposts or search summaries.
- Direct mechanics were checked for FlappyBid, Topple, and TopBid. A parody generator was inspected to establish spoofability without treating it as evidence of actual fraud.
- The direct Outbid page displayed a Vercel Security Checkpoint at access, so current mechanics are not inferred from the blocked page.
- Every material claim has a class, date, direct-support note, uncertainty limit, and article-use decision in `claim-ledger.md`.

## Draft checks

- Markdown draft: 2,145 audited words, 11 Markdown headings, 19 source URLs.
- Estimated reading time: 11 minutes at 200 words per minute, rounded up.
- Deterministic editorial audit on `draft.md --third-person`: 0 hard findings, 0 warnings.
- Banned vocabulary and phrase scan against the anti-slop list: 0 matches.
- Point of view: no first- or second-person narration detected by the audit.
- Pros and cons are both present for advertisers and owners, including attention, price visibility, measurement, permanence, disclosure, moderation, payment rails, chargebacks, spoofability, brand adjacency, and novelty decay.
- The closing action gives a buyer five concrete checks without promising ROI.

## Native payload checks

- JSON parses successfully.
- Status is `draft`; `publishedAt` is absent.
- 51 native blocks: 37 paragraphs, 10 headings, 2 images, 1 table, and 1 list.
- Every block type belongs to the approved native set.
- Both image blocks use durable `assetKey`, `alt`, `width`, and `height` fields. Neither contains `src` or `storageId`.
- `seoTitle` is 56 characters; `seoDescription` is 159 characters.
- The payload audit reported 0 hard findings. Its single warning says the JSON has no Markdown headings; this is a known format limitation because the payload correctly represents all 10 headings as native `{ "type": "heading" }` blocks.
- Author identity uses the repository's existing Person object. The future HTML title suffix is expected to be handled by route metadata, not embedded in the post title.

## Visual checks

| Asset | Dimensions | SHA-256 | Review |
|---|---:|---|---|
| `generated/pay-to-rank-attention-board-feature.png` | 1672×941 | `23742a0ecb8cacb5de7965a9a9fb239a0770ee7893ea2647b0ad2c91b5f558c1` | Original-detail inspection passed; no text, logo, metric, real UI, face, or watermark |
| `generated/outoutbid-research-summary-evidence.jpg` | 1265×712 | `6979036a2633c1dc74b889fc235380b63da3be83ecf9a31cb06ccf3c6008182f` | Bounded first viewport; readable title, cutoff, method boundary, figures, and linked attribution |

## Publication boundary

- No Convex query, mutation, upload, seed, manifest edit, or publisher action was performed.
- No shared code, task file, plan, or automation contract was edited.
- No commit or push was performed.
- Required next step: upload both approved assets through the repository's idempotent publisher, resolve their storage identities, run the pre-publish audit against the resulting payload, and only then set a real publication date.
