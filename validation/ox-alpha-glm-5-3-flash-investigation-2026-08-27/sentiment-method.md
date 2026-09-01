# Sentiment sampling method

Written before classifying any post. Governs the reception section of the article.

## Research cutoff

2026-08-27, 23:45 Asia/Jakarta (UTC+7).

## Platforms searched

- Reddit: `r/opencode`, `r/opencodeCLI`, `r/openrouter`, `r/LLMDevs`
- GitHub issue trackers: `anomalyco/opencode`, `NousResearch/hermes-agent`,
  `earendil-works/pi`

X/Twitter was **not** sampled. Attributable X posts could not be opened in full
in this environment, and the assignment forbids using social sources whose
original post is not visible in context. This is a stated gap, not a silent one.

## Search terms

`reddit "ox alpha" openrouter impressions coding slow rate limit thoughts`,
plus the related-post list surfaced on the r/opencode thread pages.

## Date window

2026-08-20 (route listed) through 2026-08-27 (research cutoff). The
2026-08-26 reveal splits the window into a **blind** phase, when the maker was
unknown, and a **named** phase.

## Inclusion rules

A post counts only if all four hold:

1. it names Ox Alpha or GLM-5.3-Flash as the model under discussion;
2. it has a visible account handle;
3. it has a visible date or relative timestamp;
4. its permalink resolves to the original, not a repost or aggregator.

## Exclusion rules

- Aggregator and SEO restatements (see the reject list in `source-ledger.md`).
- Posts whose complaint cannot be attributed to either the model or the
  provider path, because the article must keep those separate.
- Vote counts and "most upvoted" framing. Reddit scores are not a population
  measure and are not cited.

## Duplicate handling

Where several threads carry the same complaint from the same handle, the
earliest is used. `EmperorSheep` appears in both sampled threads; the
2026-08-25 post is the primary citation because it is that user's own post
rather than a comment.

## Classification

- **positive** — reports the model completed useful work
- **negative** — reports the model or its route failed the user's task
- **mixed** — reports capability and failure in the same post
- **model vs provider** — recorded separately for every negative and mixed
  report. A stall, an `Endpoint is unavailable` error, a rate limit, or a
  harness bug is **not** a model-quality finding.

## Known bias

Both sampled subreddits are communities for a specific coding harness
(OpenCode). Their members hit the model through one narrow path, during a free
preview under heavy load. That population over-reports availability problems
and under-reports the paid experience. It is not a general user base, and the
article says so beside the claim.

## Inaccessible communities

Reddit refuses headless capture and serves a "Prove your humanity" interstitial;
`old.reddit.com` requires login. Screenshots were taken through the Wayback
Machine instead, which is why `S12` and `S13` carry an archive chrome. Discord
and any private community were not reachable and were not sampled.

## No percentage

No satisfaction percentage is computed. The sample is a convenience sample from
two threads on one platform; no method here supports a population figure.

## Classified sample

| # | Handle | Date | Platform | Class | Model or route | ≤25-word quote / paraphrase |
|---|---|---|---|---|---|---|
| R01 | jacobpowaza | 2026-08-23 | r/opencode (`1vwlbr0`) | mixed | both | Impressed by its capability and intelligence; it sometimes hallucinates before reaching the right result, and feels noticeably slower than Claude and Codex |
| R02 | Prior-Meeting1645 | 2026-08-23 | r/opencode (`1vwlbr0`) | positive | model | Rates its intelligence at recent-top-model level, better than Gemini 3.7 and Muse Spark 1.2 |
| R03 | Ariquitaun | 2026-08-23 | r/opencode (`1vwlbr0`) | positive | model | Says it "worked very well as an orchestrator over the weekend", while noting they had not tried it for writing code |
| R04 | myaaa_tan | 2026-08-23 | r/opencode (`1vwlbr0`) | mixed | both | Says it audited and redesigned their solar tracker successfully, but slowly enough that they played games while waiting |
| R05 | SPEZ_IS_A_JABRONI | 2026-08-23 | r/opencode (`1vwlbr0`) | mixed | provider | "great when it works." |
| R06 | diyadude | 2026-08-23 | r/opencode (`1vwlbr0`) | negative | both | Reports it has been "slow and flaky"; through Claude CLI it could not call ten subagents using the code-review agent |
| R07 | EmperorSheep | 2026-08-25 | r/opencode (`1vyblz8`) | negative | provider | Quotes the advertised "Generous rate limits, near unlimited usage" against repeated `Upstream request failed: Endpoint is unavailable` errors |
| R08 | Any-Big-3336 | 2026-08-25 | r/opencode (`1vyblz8`) | negative | provider | Tried four times, got it to run once; the other three attempts returned the upstream-request-failed error |
| R09 | AI_docent | 2026-08-25 | r/opencode (`1vyblz8`) | negative | harness | Points to OpenCode issue 44300: requests carrying a `tools` array returned the same error while identical requests without tools succeeded |
| R10 | Fedor_Doc | 2026-08-25 | r/opencode (`1vyblz8`) | positive | model | Reports it worked in pi.dev without major problems, glitching occasionally, with automatic retries continuing the conversation |
| R11 | Bajtss | 2026-08-25 | r/opencode (`1vyblz8`) | mixed | harness | Frequently saw "Endpoint not available" in OpenCode, but the model worked without problems through omp with OpenCode Go |

## Filed bug reports

Kept separate from the community sample because they are reproducible reports
with controls, not user impressions. Each was opened in full and captured.

| # | Reporter | Date | Tracker | Class | Model or route | Finding |
|---|---|---|---|---|---|---|
| G01 | AI_docent's citation, reporter on tracker | 2026-08-2x | `anomalyco/opencode` 44300 | negative | route | Requests carrying a `tools` array returned `Endpoint is unavailable`; identical requests without tools succeeded |
| G02 | prashantbhudwal | 2026-08-22 | `anomalyco/opencode` 44262 | negative | **model** | Returns the string `"null"` for a `string \| null` tool argument; the same request to `nemotron-3-ultra-free` on the same endpoint returns JSON null. `strict: true`, `anyOf`, `oneOf`, reversed union order and `nullable: true` all reproduce it; null-only schemas and unions of null with integer, boolean, number, object or array behave correctly |
| G03 | heesu0 | 2026-08-23 | `NousResearch/hermes-agent` 93030 | negative | model or gateway, unresolved | Tool-enabled requests through **Nous Portal**, not OpenCode, return HTTP 200 with `finish_reason=stop` and no content, reasoning, tool calls or usage; Hermes retries to `empty_response_exhausted` |
| G04 | Gioxaa | 2026-08-23 | `earendil-works/pi` 8541 | negative | **harness** | A provider 429, "temporarily at capacity upstream … not your API key's rate limit", reached the user as `Error: ERROR`, so the harness retry classifier could not see it was retryable. Auto-closed by a new-contributor bot, not by triage |

G02 is the one report that isolates the model rather than the path: the endpoint
is held fixed and only the model name changes. G04 is the reverse: the failure is
a provider capacity event that a harness bug made unreadable. G03 is not
attributable to either layer on the evidence in the issue, and is recorded as
unresolved rather than assigned.

G04 is not cited in the article. It documents a Pi error-surfacing bug, which is
a fact about Pi, and the article already states that availability failures during
the preview were route-level.

## Discarded

Roughly a dozen further comments in both threads were discarded for lacking a
visible handle, a visible timestamp, or a resolvable permalink at capture time.
They are not counted and not cited.

Two X posts were reachable in part and still discarded, which is why the X
exclusion above stands even though candidate posts exist: one from a named,
high-profile account showed a command invoking `stealth/ox-alpha` and a
favourable one-line verdict, but its date was not present in the fetched body;
another was available only as a search snippet. A third widely-quoted X post was
traceable only through an aggregator. The inclusion rules require a visible
timestamp and a resolvable original, so none of the three is counted or cited.

No post-reveal reception evidence cleared the rules at all. Every classified
report above is from the blind phase, and the article says so rather than
implying the sample describes the released model.

## What the sample supports

- That capability praise and availability complaints coexisted in the same
  threads, from the same week.
- That several users traced their failures to the route or the harness rather
  than to the model — R09 and R11 in particular, and G04 as a filed instance.
- That one tool-calling defect does sit in the model: G02 changes only the model
  name against a fixed endpoint and the wrong type follows the model.
- That the tool path failed on more than one harness: G03 reports it through Nous
  Portal, not OpenCode.
- That the blind phase produced praise without brand attribution, because every
  post above predates the 2026-08-26 reveal.

## What it does not support

- Any share, ratio, or percentage of satisfied users.
- Any claim about the paid `z-ai/glm-5.3-flash` experience. Every post above
  describes the free preview.
