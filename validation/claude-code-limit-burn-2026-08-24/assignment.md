# Assignment

- Working title: `Why Are Some Claude Code Users Suddenly Burning Through Their Limits Faster?`
- Slug: `why-claude-code-users-hit-limits-faster`
- Language: English (`en-US`)
- Section: `AI Investigation`
- Reader: Claude Code users who see an unexpected usage jump and need a defensible diagnosis before changing plans or blaming a release.
- Reader outcome: identify which meter changed, isolate the variables that can raise usage, recognize evidence of a real client bug, and run a controlled comparison worth attaching to a bug report.
- Central thesis: Some reports point to genuine client-side context-accounting and attribution defects, but issue `#84750` does not establish a universal subscription-meter regression. The observable jump can also come from longer carried context, a different model or effort level, shared product usage, large tool output, or a cold prompt cache. A useful diagnosis must separate those mechanisms instead of treating every percentage as the same meter.
- Counter-thesis: A workflow can feel unchanged while the prompt, cache state, selected model, connected tool set, or shared plan usage changed underneath it. Conversely, configuration advice cannot explain physically impossible context readings such as those recorded in issue `#82863`.
- Claim boundary: GitHub issues are user reports. They establish that a reporter observed and documented a symptom; they do not establish prevalence, an Anthropic-side billing change, or causation unless corroborated by controlled telemetry or an official fix.
- CTA: ask readers to collect a small before/after evidence bundle—version, model, effort, authentication path, session age, `/context`, `/usage`, cache read/write counts, MCP list, and the same bounded task—before adding another “same here” comment.
- Media: one original feature illustration plus one bounded, attributed Anthropic changelog capture.
- Forbidden form: no generic `Research note` section or a boilerplate source-cutoff paragraph. Evidence limits belong beside the relevant claim.

## Story spine

1. Open with the contrast between the broad allegation in `#84750` and the physically impossible reading recorded in `#82863`.
2. Audit what `#84750` actually proves and expose the age of three principal references.
3. Separate four meters: plan usage, context occupancy, `/usage` attribution, and API/cache token accounting.
4. Explain the non-bug mechanisms that can make an unchanged-looking workflow cost more.
5. Present the concrete bugs without inflating their scope.
6. Weigh the benefits and costs of long sessions, 1M context, MCP, caching, and compaction.
7. Give a reproducible A/B protocol and a compact evidence table.
8. Conclude with a calibrated verdict and source-led CTA.
