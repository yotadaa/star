# Validation: Model Switching and Prompt-Cache Cost

Validation date: August 24, 2026 (WIB).

## Outcome

The draft package passes the research, editorial, metadata, native-block, and core visual gates. It remains a draft and has not been uploaded, published, committed, or pushed.

The article's thesis is intentionally conditional: a switch preserves the conversation but rebuilds a model-specific cache; it can cost more for a late one-off request and still save money across a sufficiently long cheaper-model phase.

## Evidence Gate

- Selected external sources: 9.
- Primary/direct Anthropic sources: 8.
- Independent technical source: 1 systems paper.
- Local method record: 1 failed benchmark attempt, excluded from evidence.
- Browser source captures: 10 files, comprising one capture for each selected source plus one bounded S02 crop.
- Primary product source: `https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions`.
- Counterevidence: Anthropic's Help Center says mid-session switching preserves the conversation and calls Opus planning followed by Sonnet execution a common pattern.
- Uncertainty boundary: API dollar estimates do not convert subscription quota; output length, new input, retries, provider, TTL, and task quality can move the break-even.

All selected-source captures are valid. S01, S02, S07, and S08 are long stitched page captures; S03–S06 and S09 are bounded page records. The S02 crop used in the payload is fully legible and shows the exact model-specific cache statement.

## Calculation Gate

For a 100,000-token stable prefix, current Opus 5 and Sonnet 5 prices, and no new-input or output terms:

- Five-minute cache: stay on Opus costs `$0.05N`; switch to Sonnet costs `$0.25 + $0.02(N−1)`. The switch first wins at `N = 8` requests.
- One-hour cache: stay on Opus costs `$0.05N`; switch to Sonnet costs `$0.40 + $0.02(N−1)`. The switch first wins at `N = 13` requests.
- Check at the boundary: five-minute `N=7` gives `$0.35` stay versus `$0.37` switch; `N=8` gives `$0.40` stay versus `$0.39` switch. One-hour `N=12` gives `$0.60` stay versus `$0.62` switch; `N=13` gives `$0.65` stay versus `$0.64` switch.

These are prefix-only analytical examples, not task benchmarks.

## Editorial Gate

- Markdown draft audit: 1,497 words, 7 headings, 9 source URLs, 0 hard findings, 0 warnings.
- Point of view: third person; no first- or second-person narration detected.
- Hook: selected through `hook-scorecard.md`; the exact next-request calculation arrives before the first section break.
- Counterevidence: presented beside the main thesis rather than deferred to a disclaimer.
- Pros and cons: lower future rates and task matching are weighed against the cache write, latency, quality variance, and handoff loss.
- CTA: asks teams to log four measurable fields and resolve the opening break-even question.
- Read time: `8 min read`, calculated as `ceil(1,497 / 200)`.
- No placeholders, fake quotes, unsupported social claims, or fabricated benchmark results.

## Native Payload Gate

- JSON parses successfully.
- Status: `draft`.
- Native blocks: 39.
- Heading blocks: 6.
- Image blocks: 2.
- Table blocks: 2.
- Code blocks: 1.
- List blocks: 1.
- Unsupported block types: 0.
- Invalid image/table blocks: 0.
- Featured-image identity, alt text, width, and height exactly match the original feature image block.
- SEO title: 51 characters; no author suffix.
- SEO description: 162 characters.
- Payload audit: 0 hard findings. The only warning is the audit script's expected inability to count native JSON heading blocks; six native heading blocks are present.

## Visual Gate

- Original feature art: `generated/model-switch-cache-feature.png`, 1672×941 RGB PNG, SHA-256 `ccd6521bc23cb137507cf5d2f09b05e166cb18a878437ae19639e5ee16191261`.
- Source evidence: `sources/s02-crop-model-switch-cache.jpg`, 1265×712 JPEG, SHA-256 `43fb66f25a725f2d670fa083ec71c0f416926a7c4b491dd5a46c67304857dfa3`.
- The feature art contains no logo, generated interface, document imitation, chart, metric, or legible claim.
- The source capture is attributed in its caption, visually bounded to the relevant documentation, and contains no account data.

## Local CLI Gate

- Claude Code version: 2.1.233.
- Authentication: first-party OAuth.
- Fixture: isolated temporary directory.
- The first call returned usage for a private routing identifier and no cache creation; the resumed Sonnet selection failed with HTTP 404.
- Result: benchmark gate failed. No measured Opus-to-Sonnet cost or latency is claimed.

## Publication blockers

1. Upload the original feature art and the approved S02 evidence capture to durable storage, then add real `storageId` values while preserving the asset keys and measured dimensions.
2. Complete the normal rights review for publication of the Anthropic documentation capture.
3. Recheck current model names, prices, cache multipliers, Claude Code behavior, and source dates immediately before publication.
4. Make the actual editorial publication decision and add a truthful `publishedAt` value.
5. Run the repository's normal SEO-data and publisher pipeline only after those checks. No shared manifest or publisher file was changed in this lane.
