# Hook Scorecard

Scoring: 1 (weak) to 5 (strong). The selected hook must be specific, supportable, and legible without hype.

| Candidate | Specificity | Stakes | Evidence fit | Curiosity | Human cadence | Total / 25 | Decision |
|---|---:|---:|---:|---:|---:|---:|---|
| “The cheaper model can be the expensive button when it is pressed late.” | 4 | 4 | 5 | 5 | 5 | 23 | Selected opening line. |
| “Claude Code keeps the conversation when a model changes, but it does not keep the computation that made the conversation cheap to reread.” | 5 | 4 | 5 | 4 | 4 | 22 | Selected second sentence. |
| “An Opus-to-Sonnet switch on a warm 100,000-token prefix can cost five times as much on the next prefix read.” | 5 | 5 | 5 | 4 | 3 | 22 | Used as the numerical reveal, not the first line. |
| “Model hopping has a hidden cache tax.” | 3 | 4 | 4 | 4 | 4 | 19 | Rejected: “hidden tax” is catchy but less exact than a cache write. |
| “Never switch models mid-session.” | 3 | 5 | 1 | 5 | 4 | 18 | Rejected: contradicted by Anthropic's own workflow guidance and the break-even analysis. |

## Selected hook sequence

1. Start with the late-switch paradox in one sentence.
2. Separate conversation continuity from computational continuity.
3. Give the 100,000-token Opus 5 to Sonnet 5 next-request comparison.
4. State the boundary immediately: a longer Sonnet execution phase can still win.

## CTA test

The closing action is earned because the article derives four measurable fields: cached prefix, cache creation/read counts, expected remaining turns, and completed task result. The CTA asks teams to log those fields before treating model switching as either automatically wasteful or automatically economical.
