# Validation

Package: `validation/codex-limit-grace-removed-2026-08-30/`

Status: **published** at `2026-08-30T16:36:01+07:00` after explicit owner
authorization.

Live URL:
`https://me.mukhtada.my.id/blog/codex-five-hour-limit-active-turns`

## Editorial result

- Visible title: `Some Codex Runs Now Stop at the Five-Hour Limit. OpenAI's Docs Say They Can Continue.`
- Proposed slug: `codex-five-hour-limit-active-turns`
- Thesis: late-August hard-stop reports conflict with current first-party active-turn guidance, but the evidence supports an enforcement mismatch or regression hypothesis—not a confirmed universal removal.
- Boundary: “grace” is treated as community shorthand. The draft separates an already-running turn from a broader goal, follow-up message, steer, resume, session, and client meter.
- Disconfirming evidence: a May CLI report says mid-task interruption already occurred; two June continuation paths were filed and labeled as rate-limit bugs.
- Pros and cons: the article weighs predictable quota enforcement and bypass closure against interrupted work, missing handoffs, and extra supervision.
- Ending: a concrete eight-field incident packet and CTA replace a generic research-note epilogue.
- Read-time rule: 1,681 audited Markdown prose words at 225 words per minute, rounded up to `8 min read`.

## Research and source captures

- Source-ledger rows: 7.
- Claim-ledger rows: 15.
- Terminology-ledger rows: 10.
- Sources used: two current first-party OpenAI documentation pages, one OpenAI Developer Community post, and four public issues in the official `openai/codex` repository.
- Screenshot files: 8 JPEG captures. Every source has a capture; pricing has two so both the active-turn promise and the shared five-hour-window wording remain visible.
- S01–S03 and S02b visibly contain the claim-bearing passage. S04–S07 were recaptured as single viewports after full-page screenshots produced repeated sticky-header frames.
- Six article URLs returned HTTP 200 in the command-line link check. OpenAI Help returned HTTP 403 to the automated HTTP client but loaded in the in-app browser; S01 preserves the readable current page and active-turn passage. This is recorded as an access-path difference, not as a dead link.
- A Reddit page, an unsupported forum explanation, and client-only rate-limit parsing code were excluded from article claims.

## Media checks

| Asset | Role | Dimensions | SHA-256 | Payload key | Inspection |
|---|---|---:|---|---|---|
| `assets/codex-limit-boundary-feature.png` | Original editorial feature | 1672 × 941 | `eb7df147378eb3e9ef5d3a53b816fadada2175ee577517a6841454d623a66c36` | `blog:codex-five-hour-limit-active-turns:feature-boundary-counter` | Passed; tactile still life, no product UI, branding, screen, fake terminal, or fabricated chart |
| `assets/evidence-community-aug27-immediate-stop.jpg` | Bounded real-source evidence | 1265 × 720 | `d15c8be620636a50f35b8bd2792bfbccda45e1afee7f5620972b211ee80cf9ba` | `blog:codex-five-hour-limit-active-turns:evidence-community-immediate-stop` | Passed; public source identity and report are legible, with no private account data |

The feature image is conceptual and is never used as evidence. The real screenshot caption limits it to one attributable incident and does not imply prevalence.

## Draft audit

Command:

```sh
python /home/tada/.codex/skills/write-grounded-blogs/scripts/audit_blog.py \
  validation/codex-limit-grace-removed-2026-08-30/draft.md --third-person --json
```

Result:

- 1,681 words.
- 8 Markdown headings: one H1 and seven H2 sections.
- 8 external source URLs.
- 0 hard findings.
- 0 warnings.
- No first- or second-person narration, placeholder, generic AI-writing phrase, excessive em-dash finding, weak ending, or missing-source-link warning.

## Native payload checks

Commands:

```sh
node validation/codex-limit-grace-removed-2026-08-30/build-payload.mjs
node validation/codex-limit-grace-removed-2026-08-30/verify-package.mjs
jq empty validation/codex-limit-grace-removed-2026-08-30/payload.json
```

Result:

- Valid JSON with 40 native blocks: 28 paragraphs, 7 headings, 2 tables, 2 images, and 1 ordered list.
- `status: "published"`; `publishedAt` is
  `2026-08-30T16:36:01+07:00`, set only after upload authorization.
- Featured-image identity matches the first image block.
- Both image blocks have stable asset keys, descriptive alt text, and positive intrinsic dimensions.
- SEO title: 50 characters, inside the 70-character repository limit.
- SEO description: 153 characters, inside the 180-character repository limit.
- `language`, complete author identity, section, source URL, cover tone, tags, and read time are explicit.
- The payload title carries no author suffix; the route can append `· Mukhtada`.
- `verify-package.mjs` checks draft status, title synchronization, asset checksums, native blocks, image alt text/dimensions, SEO lengths, and rejected research-note phrases.

## Publication result

- The shared SEO manifest now registers both public assets and their encoded
  dimensions.
- The deterministic Convex seed now includes the payload and both assets;
  `npm run convex:seed:build` produced
  `convex-seed-v2-472fd6c091bc` with 29 Blog records.
- The explicit batch manifest is
  `scripts/blog-batches/openai-codex-five-hour-limits-2026-08-30.json`.
- First publisher run: `created`, 40 blocks, 2 images, 2 uploaded assets.
- Exact publisher rerun: `updated`, 40 blocks, 2 images, 0 uploads and 2 reused
  assets. This passed the duplicate/asset-idempotency gate.
- IndexNow returned HTTP 202 on both runs for the two articles plus the Blog
  index.
- `npm run convex:typecheck`, `npm run convex:seed:build`, and `npm run build`
  passed.
- Post-publish SEO audit: 29 records and 85 image blocks, zero missing SEO
  fields, and all 85 encoded image files matched their declared dimensions.
- Commit/push was not performed because this publication request did not ask
  for a Git handoff.

## Live route validation

- HTTP response: 200.
- Metadata: canonical, description, Open Graph, Twitter title, and
  `BlogPosting` JSON-LD match the payload; the document title ends in
  `· Mukhtada`.
- Images: both article images load with descriptive alt text and exact intrinsic
  dimensions; modal copies also have descriptive `Enlarged view:` alt text.
- Layout: no document-level horizontal overflow at desktop or 375 px mobile;
  both comparison tables remain inside their own horizontal scroll containers.
- Keyboard: the first Tab stop exposes the visible `Skip to main content` link
  with a 2 px focus outline.
- Reduced motion: the production stylesheet globally reduces animations and
  transitions to one near-instant iteration and disables smooth scrolling. The
  selected in-app Browser exposes viewport control but not media emulation, so
  no reduced-motion screenshot is claimed.
- Desktop evidence: `live-desktop.png`.
- Mobile evidence: `live-mobile-375.png`.
- Keyboard evidence: `live-keyboard-focus.png`.
