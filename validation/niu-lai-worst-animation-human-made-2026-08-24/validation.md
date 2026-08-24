# Validation

## Status and conclusion

- Title: **The “Worst Animation Ever” Went Viral. Being Human-Made Changed the Joke**
- Slug: `niu-lai-worst-animation-human-made`
- Language and POV: `en-US`, warm third person
- Status: published through the shared Convex batch at `2026-08-24T22:24:11+07:00`
- Research cutoff: 24 August 2026, 23:59 Asia/Jakarta
- Thesis: mockery and verification drove the first discovery loop; the reported family production story later gave the roughness a human meaning that some viewers preferred to synthetic polish.
- Boundary: no selected evidence measures anti-AI sentiment as the main reason for ticket purchases. AP could not independently verify the reported five-year mother-and-son production account, and no reliable budget record was located.

## Package completeness

- `assignment.md`
- `terminology-ledger.md`
- `claim-ledger.md` with ten rows and a passed Research Gate
- `source-ledger.md` with six opened sources
- `visual-ledger.md`
- `hook-scorecard.md` with four scored hooks
- `draft.md`
- `payload.json`
- `sources/` with one in-app Browser screenshot per used source
- `assets/` with one original feature and one bounded named-reporting capture

## Source capture

| Source capture | Intrinsic size | Browser assertion |
|---|---:|---|
| `sources/S01-ap-niulai-report.jpg` | 1265 × 5396 | Opened article text contained the 17.1 million yuan snapshot and AP's verification limit. |
| `sources/S02-creative-bloq-niulai.jpg` | 1265 × 21186 | Opened article contained the attributed anti-AI framing. |
| `sources/S03-red-star-capital-niulai.jpg` | 1265 × 4034 | Opened report contained Lighthouse figures, credits, and failed outreach. |
| `sources/S04-yicai-niulai.jpg` | 1265 × 4114 | Opened report contained the clip chronology, group-screening account, and AI-era interpretation. |
| `sources/S05-guardian-niulai.jpg` | 1265 × 5069 | Opened report contained early admissions, Douban reaction, and industry criticism. |
| `sources/S06-reddit-human-effort-reaction.jpg` | 1280 × 4740 | Opened thread visibly contained both the human-effort argument and its direct rebuttal. |

All six captures came from the in-app Browser. Search snippets did not carry article claims.

## Visual audit

| Asset | Role | Dimensions | SHA-256 | Durable asset key | Result |
|---|---|---:|---|---|---|
| `assets/niu-lai-human-roughness-feature.png` | Original feature | 1672 × 941 | `dcf2f98474e389087a7ce735b9eb8c1637cb5ce6c2d09048b0e9d9239fcb5fa7` | `blog:niu-lai-worst-animation-human-made:feature-handmade-frames` | Approved after regenerating a generic empty-frame first pass. The final pegbar/onion-skin workflow reads as animation labor and contains no character, logo, text, fake source material, or glossy 3D treatment. |
| `assets/red-star-niulai-report-evidence.jpg` | Bounded source evidence | 1265 × 850 | `1d51e50e3898d84b8a2a2fb7a8b8d51f154ac5a34a18a0951ea666502bbbad3c` | `blog:niu-lai-worst-animation-human-made:evidence-red-star-report` | Approved. The upper crop shows Eastmoney, the article headline, date, and visible source line naming Red Star Capital; the lower crop shows the public-credit and early box-office passages. Both come from the opened page and contain no added copy. |

The collected web photographs and film imagery in research screenshots remain outside the payload. The only published-source candidate is the bounded reporting capture above.

## Editorial audit

Command:

```sh
python /home/tada/.codex/skills/write-grounded-blogs/scripts/audit_blog.py validation/niu-lai-worst-animation-human-made-2026-08-24/draft.md --third-person
```

Result: **1,618 words, 8 Markdown headings, 9 URLs, 0 hard findings, 0 warnings.**

The `8 min read` estimate uses `ceil(1618 / 225)` at 225 words per minute. A separate banned-language scan against the anti-slop skill list returned no matches. First- and second-person narration checks returned no findings. The draft contains no research-note or source-cutoff paragraph.

The same audit on `payload.json` reports 0 hard findings and one expected mechanical warning that JSON has no Markdown headings. The native payload contains seven `{ "type": "heading" }` blocks.

## Native payload audit

- 43 blocks: 32 paragraphs, 7 headings, 2 lists, and 2 images.
- Supported block types only.
- `status` is `published`; `publishedAt` records the shared batch timestamp.
- `seoTitle` is 43 characters; `seoDescription` is 146 characters.
- Featured-image asset key, alt text, and 1672 × 941 dimensions exactly match the feature image block.
- Both image blocks use stable asset keys and positive intrinsic dimensions; neither persists `src`, `storageId`, a local path, or a temporary URL.
- Metadata includes language, canonical author record, section, tags, source URL, excerpt, and measured read time.

## Publication result

The shared publisher stored both keyed images, published the article, and reused both assets on the duplicate run. The route passed canonical, `index, follow`, one-H1, two-JSON-LD, intrinsic-image, title-suffix, and desktop/mobile overflow checks. Batch evidence is in `validation/six-internet-culture-blogs-2026-08-24/`.
