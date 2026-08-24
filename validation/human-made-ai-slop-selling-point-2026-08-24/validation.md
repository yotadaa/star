# Validation

## Status and conclusion

- Title: **AI Slop Made “Human-Made” a Selling Point**
- Slug: `human-made-ai-slop-selling-point`
- Language and POV: `en-US`, warm third person
- Status: published through the shared Convex batch at `2026-08-24T22:24:11+07:00`
- Research cutoff: 24 August 2026, 23:59 Asia/Jakarta
- Thesis: human authorship is becoming a useful process and accountability signal as synthetic abundance makes responsibility harder to see.
- Boundary: policies, pledges, polling, and badge projects do not establish an economy-wide price premium. A human-made label cannot guarantee quality or verify itself without process evidence.

## Package completeness

- `assignment.md`
- `terminology-ledger.md`
- `claim-ledger.md` with twelve rows and a passed Research Gate
- `source-ledger.md` with eight opened sources
- `visual-ledger.md`
- `hook-scorecard.md` with four scored hooks
- `draft.md`
- `payload.json`
- `sources/` with one in-app Browser screenshot per used source
- `assets/` with one original feature and one bounded named-reporting capture

## Source capture

| Source capture | Intrinsic size | Browser assertion |
|---|---:|---|
| `sources/S01-wired-ai-slop-backlash.jpg` | 1265 × 7522 | Opened article documented platform controls, rollbacks, and marketing backlash. |
| `sources/S02-axios-human-only-flyers.jpg` | 1265 × 2815 | Opened report documented a venue pledge, campaign promises, affordability concerns, and false accusations. |
| `sources/S03-gallup-americans-cool-ai.jpg` | 1265 × 6219 | Opened poll contained the 39%, 47%, and trust findings used in the article. |
| `sources/S04-youtube-original-authentic-policy.jpg` | 1265 × 4305 | Opened first-party answer contained the mass-produced/repetitive clarification. |
| `sources/S05-pinterest-ai-controls.jpg` | 1273 × 3152 | Opened documentation contained labeling language and the “see less AI” control. |
| `sources/S06-arxiv-ai-slop-accusations.jpg` | 1265 × 1200 | Opened abstract contained the 25-million-comment method, tenfold rise, and matched-control result. |
| `sources/S07-guardian-youtube-ai-slop-study.jpg` | 1265 × 6207 | Opened report contained the 104/500 snapshot and its platform-scale limits. |
| `sources/S08-human-made-project.jpg` | 1265 × 8507 | Opened project artifact contained the badge, self-governing rule, and brand rationale. |

All eight captures came from the in-app Browser. Platform policy facts use their first-party pages rather than WIRED's summaries.

## Visual audit

| Asset | Role | Dimensions | SHA-256 | Durable asset key | Result |
|---|---|---:|---|---|---|
| `assets/human-made-process-feature.png` | Original feature | 1672 × 941 | `f7c39235a4921c22bc30f0b0da8b4f3e945f177593c0d9dee4837ca208023dc0` | `blog:human-made-ai-slop-selling-point:feature-process-traces` | Approved. The print-proof still life contains paper fibers, torn stock, corrections, tape, and uneven ink; it contains no badge, logo, person, legible text, fake metric, fake source page, or glossy AI-tech motif. |
| `assets/axios-human-only-flyers-evidence.jpg` | Bounded source evidence | 1265 × 712 | `23e86bf526183f02b127562a794beb457301be0173da673fd15a4232b162fb22` | `blog:human-made-ai-slop-selling-point:evidence-human-only-flyers` | Approved. Axios identity and the venue, campaign, and affordability passages remain visible. |

Third-party illustrations and photos visible inside full-page research captures remain private evidence and are absent from the payload.

## Editorial audit

Command:

```sh
python /home/tada/.codex/skills/write-grounded-blogs/scripts/audit_blog.py validation/human-made-ai-slop-selling-point-2026-08-24/draft.md --third-person
```

Result: **1,837 words, 9 Markdown headings, 10 URLs, 0 hard findings, 0 warnings.**

The `9 min read` estimate uses `ceil(1837 / 225)` at 225 words per minute. A separate banned-language scan against the anti-slop skill list returned no matches. First- and second-person narration checks returned no findings. The draft contains no research-note or source-cutoff paragraph.

The same audit on `payload.json` reports 0 hard findings and one expected mechanical warning that JSON has no Markdown headings. The native payload contains eight `{ "type": "heading" }` blocks.

## Native payload audit

- 50 blocks: 37 paragraphs, 8 headings, 2 lists, 1 evidence table, and 2 images.
- Supported block types only.
- `status` is `published`; `publishedAt` records the shared batch timestamp.
- `seoTitle` is 42 characters; `seoDescription` is 147 characters.
- Featured-image asset key, alt text, and 1672 × 941 dimensions exactly match the feature image block.
- Both image blocks use stable asset keys and positive intrinsic dimensions; neither persists `src`, `storageId`, a local path, or a temporary URL.
- Metadata includes language, canonical author record, section, tags, source URL, excerpt, and measured read time.

## Publication result

The shared publisher stored both keyed images, published the article, and reused both assets on the duplicate run. The route passed canonical, `index, follow`, one-H1, two-JSON-LD, intrinsic-image, title-suffix, and desktop/mobile overflow checks. Batch evidence is in `validation/six-internet-culture-blogs-2026-08-24/`.
