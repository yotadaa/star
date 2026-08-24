# Validation

Validated on 24 August 2026, Asia/Jakarta. Package status: self-contained draft; not published.

## Deliverables

All eleven required top-level files are present:

1. `assignment.md`
2. `terminology-ledger.md`
3. `claim-ledger.md`
4. `source-ledger.md`
5. `experiment-protocol.md`
6. `experiment-results.md`
7. `visual-ledger.md`
8. `hook-scorecard.md`
9. `draft.md`
10. `payload.json`
11. `validation.md`

No shared manifest, publisher, Convex function, seed, task plan, or production source file was edited for this package. No upload, mutation, publication, commit, or push was performed by this task.

## Editorial result

- Visible title: `Does /compact Secretly Make Claude Code Worse?`
- Slug: `does-compact-make-claude-code-worse`
- Thesis: The evidence does not show a secret, general quality penalty. Compaction trades exact conversational history for selected state; a focused compact and a curated handoff each preserved the fixed contract in this proxy, while a blank session could not reconstruct chat-only decisions.
- Official boundary: `/compact` for continuing the same long task; `/clear` between distinct tasks.
- Direct experiment boundary: one small fixture, one valid run per usable arm, Claude Code 2.1.233, a non-public account route, `medium` effort, and no useful prompt-cache telemetry.
- Auto arm: inconclusive. The deliberately artificial 5% threshold compacted twice during the first preparation call and exhausted the cap before implementation.
- Read-time rule: 2,168 audited prose words at 225 words per minute, rounded up to `10 min read`.

## Experiment checks

Final rerun against the strengthened, pre-registered F01–F10 meanings:

| Arm | Visible test | Hidden verifier | Exit interpretation |
|---|---|---:|---|
| Focused manual compact | Pass | 10/10 | Valid result |
| Isolated fresh session | Pass | 2/10 | Valid result; F08 and F10 only |
| Curated handoff | Pass | 10/10 | Valid result |
| Forced auto-compact | Not reached | No score | Inconclusive, not counted as a failure |

The first fresh-session trial was excluded because the agent discovered the verifier in a sibling directory. The valid fresh arm used `/tmp/cc-fresh-isolated.R6QgVH`, outside the verifier's parent. The contaminated trial also exposed weak enforcement of existing F02, F03, F05, F06, and the placement of F08; the checker was strengthened without adding or changing a decision. Manual and handoff fixtures remained 10/10 after the correction.

Exact CLI invocations, working directories, budgets, prompts, session IDs, boundary token counts, wall time, tool reads, costs, and cache counters are in `experiment-results.md`. The fixture and final verifier remain in disposable `/tmp` paths and did not touch this repository.

## Research and source captures

- Source-ledger rows: 15.
- Exact external sources with browser evidence: 14 (S01–S14).
- Source-capture files: 15 JPEGs, comprising one capture for S01–S14 plus one bounded S01 payload crop.
- Threads result: no accessible, attributable post met the evidence gate; no qualifying source was opened or cited.
- Reddit result: S13 captured an old.reddit login wall. It remains discovery-only and is not cited in the draft or payload.
- Draft links: 10 URL occurrences, 8 unique external URLs. A final HTTP check returned 200 for all eight unique destinations on 24 August 2026.

The draft separates Anthropic documentation, local observations, community reports, and synthesis. Community issues and the X post carry no prevalence or causal claim.

## Media checks

| Asset | Role | Dimensions | SHA-256 | Payload key | Inspection |
|---|---|---:|---|---|---|
| `assets/claude-compact-handoff-feature.png` | Original feature illustration | 1672 × 941 | `455a4198392df90c5ac7e05cdc44c56f3c24065e45b29d1da58afcccc6037d4a` | `blog:does-compact-make-claude-code-worse:feature-summary-handoff` | Passed; no logo, person, fake UI, legible claim, numeric benchmark, or watermark |
| `sources/S01-crop-compact-clear-guidance.jpg` | Bounded first-party evidence | 1265 × 712 | `2f59160c1411ec38d300781cf39cbe92c22ef9f87acc91d5628ab824bca5e9fd` | `blog:does-compact-make-claude-code-worse:source-anthropic-compact-clear` | Passed; Claude Support identity and complete task-boundary rule are visible; no account data |

The source crop is a draft-only attributed editorial excerpt. Final publication still requires the owner's normal rights review. The other source captures are research material and are not payload assets.

## Draft and payload checks

The grounded-blog audit command:

```sh
python /home/tada/.codex/skills/write-grounded-blogs/scripts/audit_blog.py \
  validation/claude-compact-quality-2026-08-24/draft.md --third-person
```

Final result:

- 2,168 words
- 11 Markdown headings
- 10 URL occurrences
- 0 hard findings
- 0 warnings

Native-payload validation:

- Valid JSON.
- `status: "draft"`; no fabricated `publishedAt`.
- 55 supported native blocks.
- 10 heading blocks, 2 measured image blocks, and 1 real comparison table.
- Featured-image identity matches the first image block.
- Every image has a stable asset key, alt text, caption, and positive intrinsic dimensions.
- SEO title: 55 characters, within the 70-character repository limit.
- SEO description: 136 characters, within the 180-character repository limit.
- `language`, author identity, article section, source URL, cover tone, tags, and read time are explicit.
- The title metadata contains no author suffix; the route can append `· Mukhtada`.

The same prose audit run on JSON reports one mechanical `long_draft_has_few_headings` warning because the generic auditor looks for Markdown `#` markers after extracting JSON text. It is a parser mismatch, not a missing-structure finding: the payload contains 10 verified native `heading` blocks. The Markdown draft, which the heading heuristic is designed to inspect, passes with zero warnings.

## Publication blockers

1. Rights review for the bounded Anthropic Support crop.
2. Convex upload and durable `storageId` assignment for both payload images.
3. Normal repository metadata manifest, idempotent publisher, type, build, render, mobile, keyboard, and reduced-motion gates.

Those steps were outside this task's authorization. The package must remain a draft until they are completed.
