# Validation handoff

## Deliverable

- Title: `The Harness Is Becoming More Important Than the Model`
- Slug: `harness-more-important-than-model`
- Language: English (`en-US`)
- Point of view: third person
- Status: draft only
- Research cutoff: August 24, 2026, 23:59 WIB (UTC+7)
- Markdown length: 1,978 audited prose words
- Reading-time rule: 200 words per minute, rounded up to `10 min read`
- Native blocks: 38 total; 7 headings, 28 paragraphs, 2 images, 1 table
- Sources used: 15
- Discovery-only social search records: 1 Threads search
- Source screenshots: 16 full-page or surface captures plus 3 essential crops
- Original generated visuals: 1

## Thesis and boundary

**Thesis:** The harness has become a first-class selection variable because it can change task success, tokens per solved task, failure patterns, tool authority, recovery, and traceability without changing the base model.

**Boundary:** The inspected evidence does not prove that a harness always matters more than a model. Claw-SWE-Bench reports a 29.4-point model effect and a 27.4-point harness effect in its sweeps, while each benchmark covers a bounded task set and the named 2026 studies remain preprints.

## Research checks

- DeepSeek's exact “Everything is a plugin” phrase appears in its launch page and official X post.
- The repository architecture confirms that the model adapter, tool registry, session log, and agent loop sit behind the plugin boundary.
- Harness effects are supported by three independent 2026 studies and the earlier SWE-agent interface paper.
- Claude Code and Codex comparisons use their own first-party documentation.
- Counterevidence appears in the article rather than being buried in the ledger.
- X accounts are named and attributed. Ahmad Awais's internal result is not presented as a public benchmark.
- Threads was searched directly. The visible results did not provide a measurement strong enough to carry an article claim.
- Security figures retain the tested revision, model, persona, fixture, sink, and judge limits.

## Editorial checks

Command:

```text
python /home/tada/.codex/skills/write-grounded-blogs/scripts/audit_blog.py validation/harness-more-important-than-model-2026-08-24/draft.md --third-person
```

Result: 0 hard findings, 0 warnings. A separate literal pronoun scan found no first- or second-person narration. The banned-word scan found no matches, and the article contains no em dash.

The same audit on `payload.json` reports 0 hard findings and one mechanical warning that a long draft has no Markdown headings. That warning is expected because native headings use `{ "type": "heading" }`; the payload contains seven such blocks.

## Payload checks

- JSON parses successfully.
- Only accepted native block types appear.
- `seoTitle` is 52 characters; the repository limit is 70.
- `seoDescription` is 153 characters; the repository limit is 180.
- Every image block has a stable asset key, caption, alt text, and positive intrinsic dimensions.
- No image block persists a local path or delivery URL.
- `featuredImage` matches the original feature block by asset key, alt text, width, and height.
- The first-party source-evidence block is bounded to a 1280 × 720 crop and attributes the visible claim to DeepSeek with a nearby source link and capture date.
- `publishedAt` is intentionally absent because the payload remains a draft and no publication decision has been made.

## Visual checks

- `generated/harness-system-feature.png` decodes as a 1672 × 941 PNG.
- Full-size inspection found no logo, person, fake interface, source document, quotation, metric, accidental text, or watermark.
- Browser captures decode as JPEG and use matching `.jpg` extensions.
- `sources/crops/e01-deepseek-everything-is-plugin.jpg` enters the native draft as attributed source evidence at the user's direction.
- The two arXiv evidence crops remain private research material pending a publication-rights decision.

## Publication blockers

The package is ready for editorial review, not publication. Publication still requires:

1. an owner or legal decision on the bounded DeepSeek source capture;
2. upload and checksum-based reuse of both payload images in Convex Storage;
3. a real publication date;
4. publisher integration through `completeBlogSeoData()`;
5. idempotent publisher rerun plus desktop, 375 px mobile, keyboard, reduced-motion, link, metadata, and overflow checks.

No live database was changed. No commit or push was performed by this task.
