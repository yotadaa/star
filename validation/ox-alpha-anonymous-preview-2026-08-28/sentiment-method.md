# Sentiment sampling method

This article uses the attributable sample established in
`validation/ox-alpha-glm-5-3-flash-investigation-2026-08-27/sentiment-method.md`.
It does not expand that sample.

## Window and inclusion rules

- Research cutoff: 2026-08-27, 23:45 Asia/Jakarta (UTC+7).
- Community window: 2026-08-23 through 2026-08-25, before the 2026-08-26
  identity reveal.
- A community report counts only when it names Ox Alpha, has a visible handle
  and time marker, and appears at a resolvable original permalink or captured
  archive of that permalink.
- Duplicate reports from the same handle use the earliest attributable post.
- Vote counts are ignored. No percentage or population-level satisfaction claim
  is computed from the sample.

The sample contains **11 reports from two r/opencode threads**, plus **4 filed
bug reports on 3 public trackers**. It is a convenience sample of people using a
free preview through coding harnesses under load. It is useful for separating
model, provider-path and harness failures; it says nothing reliable about the
paid user population.

## Community reports

| ID | Handle | Date | Class | Layer | Substance |
|---|---|---|---|---|---|
| R01 | jacobpowaza | 2026-08-23 | mixed | both | Impressed by capability; noticeably slower than Claude and Codex; sometimes hallucinates before the right result |
| R02 | Prior-Meeting1645 | 2026-08-23 | positive | model | Rates its intelligence at recent-top-model level, above Gemini 3.7 and Muse Spark 1.2 |
| R03 | Ariquitaun | 2026-08-23 | positive | model | Says it worked very well as an orchestrator, while noting they had not tried it for writing code |
| R04 | myaaa_tan | 2026-08-23 | mixed | both | Reports a successful solar-tracker audit and redesign, but very slow execution |
| R05 | SPEZ_IS_A_JABRONI | 2026-08-23 | mixed | provider | “great when it works.” |
| R06 | diyadude | 2026-08-23 | negative | both | “slow and flaky”; a requested ten-subagent run did not work |
| R07 | EmperorSheep | 2026-08-25 | negative | provider | Contrasts near-unlimited wording with repeated upstream-unavailable errors |
| R08 | Any-Big-3336 | 2026-08-25 | negative | provider | Four attempts, one completed run |
| R09 | AI_docent | 2026-08-25 | negative | harness | Points to OpenCode issue 44300, where tool-bearing requests fail and otherwise-identical requests succeed |
| R10 | Fedor_Doc | 2026-08-25 | positive | model | Reports useful work in pi.dev, with automatic retries covering occasional glitches |
| R11 | Bajtss | 2026-08-25 | mixed | harness | Repeated OpenCode failures, then successful use of the same model through another client path |

Source captures:

- `sources/S12-reddit-what-does-everyone-think.png`
- `sources/S13-reddit-unlimited-free-capacity.png`

## Filed reports

| ID | Tracker | Date | Layer | Finding |
|---|---|---|---|---|
| G01 | `anomalyco/opencode` 44300 | 2026-08 | route | Requests with a `tools` array returned endpoint-unavailable errors; identical requests without tools succeeded |
| G02 | `anomalyco/opencode` 44262 | 2026-08-22 | **model** | The route returned the string `"null"` for a `string \| null` argument while a different model on the same endpoint returned JSON null |
| G03 | `NousResearch/hermes-agent` 93030 | 2026-08-23 | unresolved | Tool-enabled requests through Nous Portal returned HTTP 200 with no content, reasoning, tool calls or usage |
| G04 | `earendil-works/pi` 8541 | 2026-08-23 | **harness** | A provider 429 was reduced to `Error: ERROR`, preventing the retry classifier from seeing a retryable capacity event |

Source captures:

- `sources/S11-github-opencode-issue-44300.png`
- `sources/S14-github-opencode-issue-44262.png`
- `sources/S15-github-hermes-issue-93030.png`
- `sources/S16-github-pi-issue-8541.png`

## Supported conclusions

- Capability praise and availability complaints coexisted during the blind week.
- Praise arrived without brand attribution because every community report in the
  sample predates the reveal.
- Some failures belong to the provider path or harness rather than the model.
- G02 isolates one model defect by holding the endpoint fixed and changing the
  model name.
- G03 cannot be assigned beyond the evidence in the issue.

## Unsupported conclusions

- Any satisfaction percentage, platform-wide sentiment, or claim about paid
  `z-ai/glm-5.3-flash` users.
- Any claim that anonymous naming caused the reported failures.
- Any post-reveal claim, including price reaction or willingness to exchange
  data for free access; those reports were not captured with sufficient
  provenance for publication in this package.
