# Claim ledger

Scoped to this article. Every row is carried from
`validation/ox-alpha-glm-5-3-flash-investigation-2026-08-27/claim-ledger.md`
with its original ID and status preserved, so the two articles cannot drift apart
on the same fact. No inherited status was upgraded. G04 was re-opened, checked
live, and captured inside this package because it is cited here for the first
time.

Status vocabulary: `verified` (direct artifact or first-party source),
`corroborated` (independent strong sources agree), `reported` (named reporting,
no independent confirmation found), `claimed` (asserted by an interested party),
`inferred` (follows from listed observations but stated by no source),
`unknown`, `rejected`. A source's authority is claim-specific.

## Load-bearing rows

| ID | Claim | Status | Source | Qualification carried into prose |
|---|---|---|---|---|
| **C16** | `stealth/ox-alpha` processed 10.3 trillion tokens and accounted for 30.9% of OpenRouter's coding-model usage through 2026-08-24, ranked first | `reported` | S08 (iThome, 李建興, 2026-08-27) | Attributed to iThome by name. Traffic share measures adoption of a free preview under promotion, not satisfaction. Stated as such beside the figure. |
| **C17** | A gap exists between the model page's statement that provider-retained prompts and completions are not used for training, and the Stealth Program's general terms | `reported` | S01 (first half, verified on the route page) + S08 (the general-terms reading) | The general-terms half rests on iThome's reading; attributed. The article does **not** assert which document controls. |
| **C18** | Z.ai's privacy documents cover only its own services and API, so the processing location during the anonymous test cannot be confirmed from them | `reported` | S08 | An unresolved question, not a finding of wrongdoing. Written as what the documents do not reach. |
| **C15** | GLM-5.3-Flash is served on Chinese AI chips with a 3× end-to-end improvement over Z.ai's own first baseline | `claimed` | S05 (Z.ai release post), noted by S08 | Baseline is Z.ai's own first attempt, not a competitor. iThome notes the cluster's country or region is unstated. Both qualifications appear beside the claim. |
| **C20** | Preview-week praise arrived without brand attribution | `inferred` | Every R-row predates the 2026-08-26 reveal (`sentiment-method.md`) | An inference about the *conditions* of the praise, not its strength. Phrased that way. |
| **C05** | Z.ai's release post states: "Before release, Z.ai tested it anonymously as `ox-alpha` on OpenCode and OpenRouter." | `verified` | S05 | Quoted once as settled background. The identity finding is not re-argued here; the article links to `/blog/ox-alpha-was-glm-5-3-flash`. |
| **C04** | Whether the weights served on `stealth/ox-alpha` are the weights released as `z-ai/glm-5.3-flash` | `unknown` | Unstated by S01, S02, S05, S06, S08 | Referenced only where it bears on what preview users were testing. Written as unstated, never as a contradiction. |
| **C01** | The stealth route was documented with a 1,048,576-token context window; provider-retained prompts and completions are stated not to be used for training | `verified` | S01 | The training-use half is the first-party anchor for C17. |
| **C02** | `z-ai/glm-5.3-flash` released 2026-08-26; 1,310,720-token context, 131,072 completion; twelve providers listed | `verified` | S02 | Used only for the released-route contrast, not as a performance claim. |
| **C24** | OpenRouter pricing is discounted at $0.075 in / $0.25 out / $0.015 cached per million against a list price of $0.15 / $0.50 | `verified` | S02, S09 | Must not be presented as the standing price. Written as what is on the page today. |
| **C11** | Artificial Analysis publishes $0.09 per Intelligence Index task; Z.ai's page claims the same score of 57 at $0.045 | both figures `verified`, reconciliation `unknown` | S09, S05 | Each number attributed to its owner. Neither averaged nor preferred. |
| **C09** | Artificial Analysis Intelligence Index v4.1.1 = 57, ranked 3rd of 110, median 28 | `verified` | S09 | Cited once, as the independent measure that adoption is *not*. |
| **C10** | Artificial Analysis output speed 50.2 tokens/second, ranked 46th of 110, median 65.1 | `verified` | S09 | Cited once, beside C09, because the two ranks differ. |
| **C23** | `reasoning_effort` defaults to `max`; `clear_thinking` defaults to `false` | `verified` | S06 (Hugging Face model card) | A real configuration footgun. Named as a default a caller inherits, not as a cause of any reported slowness — no source connects them. |
| **C03** | 320 billion total parameters, 18 billion active; MIT licence; weights on Hugging Face | `verified` | S05, S06 | Background only, one sentence. |

## Reception rows

Carried from `sentiment-method.md`. The article uses these for the attribution
argument, not for proportions.

| ID | Substance | Layer | Use here |
|---|---|---|---|
| **G02** | prashantbhudwal, `anomalyco/opencode` 44262, 2026-08-22: the route returns the string `"null"` for a `string \| null` tool argument; the same request to `nemotron-3-ultra-free` on the same endpoint returns JSON null. `strict: true`, `anyOf`, `oneOf`, reversed union order and `nullable: true` all reproduce it | **model** | The one report that isolates the model: endpoint held fixed, only the model name changed. Cited as the counterexample to "it was all the route". |
| **G04** | Gioxaa, `earendil-works/pi` 8541, 2026-08-23: a provider 429 — "temporarily at capacity upstream … not your API key's rate limit" — reached the user as `Error: ERROR`, so the harness retry classifier could not see it was retryable. Auto-closed by a new-contributor bot | **harness** | **Not cited in the first article.** Cited here as the clearest instance of the article's subject: a real provider capacity event that arrived unreadable. |
| **G01** | `anomalyco/opencode` 44300: requests carrying a `tools` array returned `Endpoint is unavailable`; identical requests without tools succeeded | route | Cited as a reproducible trigger, with its layer named. |
| **G03** | heesu0, `NousResearch/hermes-agent` 93030, 2026-08-23: tool-enabled requests through Nous Portal return HTTP 200, `finish_reason=stop`, no content, reasoning, tool calls or usage | model or gateway, **unresolved** | Cited as unresolved. Not assigned to a layer. |
| **R07** | EmperorSheep, 2026-08-25: advertised "Generous rate limits, near unlimited usage" against repeated `Upstream request failed: Endpoint is unavailable` | provider | The advertised-versus-delivered pair, quoted. |
| **R11** | Bajtss, 2026-08-25: "Endpoint not available" repeatedly in OpenCode, then the same model working through omp with OpenCode Go | harness | Same weights, two paths, different outcome — the reader's own attribution test. |
| **R09** | AI_docent, 2026-08-25: points to issue 44300 | harness | Cited with G01. |
| **R02, R03, R04, R10** | Capability praise: recent-top-model intelligence above Gemini 3.7 and Muse Spark 1.2; "worked very well as an orchestrator over the weekend"; solar tracker audited and redesigned; worked in pi.dev with automatic retries | model | The case that blind testing produced real signal (C20). |
| **R01, R06** | jacobpowaza: impressed, noticeably slower than Claude and Codex, sometimes hallucinates before the right result. diyadude: "slow and flaky", could not call ten subagents | both | The mixed reports, kept mixed. |
| **R05, R08** | SPEZ_IS_A_JABRONI: "great when it works." Any-Big-3336: four tries, one run | provider | Availability, named as availability. |

## Sampling limits that must appear in the prose

From `sentiment-method.md`, not as an appended note but beside the reception
material:

- Eleven attributable reports from two r/opencode threads, plus four filed bug
  reports on three trackers, dated 22–25 August 2026.
- The coding-harness sample reaches one free preview through a narrow set of
  paths under load. It does not describe the paid experience.
- No satisfaction percentage is calculable and none is stated.

## Rejected claims

Carried forward unchanged. None appears in the prose.

| Claim | Why rejected |
|---|---|
| "Ox Alpha beat Claude Opus 4.8" | Z.ai's own Code Bench v1.0 at maximum effort reports 29.0 against 29.5 — below, on the company's own scoreboard. |
| Any satisfaction percentage or ratio | No method in `sentiment-method.md` supports a population figure. |
| Any `oxalpha.org` "Intelligence Index" figure | Self-constructed index described as "inspired by" Artificial Analysis. |
| Equating Z.ai's DeepSWE 63.4 with the `MatchaOnMuffins/oxalpha` community run | Different configuration; not comparable in either direction. |
| Any claim that the anonymous test violated a policy or law | No source establishes it. C17 and C18 are an unresolved question. |
| Any claim about which document controls the retention terms | Unstated by every source examined. |
| Any local benchmark of GLM-5.3-Flash | No authorized API route exists from this environment. Manufacturing one is forbidden by the assignment. |
| C27, "most popular model of the week" | Superseded in usefulness by C16, which gives the window, the platform and the measure. |
