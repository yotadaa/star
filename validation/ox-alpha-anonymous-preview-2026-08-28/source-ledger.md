# Source ledger

The primary rows are carried from
`validation/ox-alpha-glm-5-3-flash-investigation-2026-08-27/source-ledger.md`,
keeping their original IDs so the two packages cannot drift. Every cited source
now has a local capture in this package. G04 was re-opened and captured on
2026-08-28 because this article cites it for the first time.

Access date for every row: 2026-08-27 (research cutoff 23:45 Asia/Jakarta).

| ID | Owner / author | Title | Published | URL | Class | Supports here | Does not support |
|---|---|---|---|---|---|---|---|
| S08 | iThome (李建興) | 中國AI業者Z.ai揭曉神祕Ox Alpha模型就是GLM-5.3-Flash，匿名模型測試凸顯資料治理問題 | 2026-08-27 | https://www.ithome.com.tw/news/178473 | Independent reporting | C16 (10.3T tokens, 30.9% of OpenRouter coding-model usage through 2026-08-24, ranked first); C17 (the disclosure gap, on iThome's reading of the Stealth Program's general terms); C18 (Z.ai's privacy documents cover only its own services and API, so processing location during the test cannot be confirmed); the note that C15's cluster country or region is unstated | Any finding of wrongdoing. Any statement about which document controls. Any satisfaction measure — traffic share is adoption, not approval. |
| S05 | Z.ai | GLM-5.3-Flash release post | 2026-08-26 | https://z.ai/blog/glm-5.3-flash | First-party | C05 verbatim ("Before release, Z.ai tested it anonymously as `ox-alpha` on OpenCode and OpenRouter."); C15 as Z.ai's own claim, including that the 3× baseline is Z.ai's own first attempt; C03 architecture; C11's $0.045 half; the 3× Coding Plan quota | Independent verification of any benchmark figure. Its own Code Bench shows 29.0 against Claude Opus 4.8's 29.5 — below, so no "beat" claim survives here. |
| S01 | OpenRouter | `stealth/ox-alpha` route page | route listed 2026-08-20 | https://openrouter.ai/stealth/ox-alpha | First-party platform record | C01: the 1,048,576-token preview context window, and the first-party statement that provider-retained prompts and completions are not used for training — the anchor half of C17. The page also now records that the route "was revealed to be ZAI GLM-5.3-Flash" | The Stealth Program's general terms, which are a separate document. Whether the preview weights are the released weights. |
| S02 | OpenRouter | `z-ai/glm-5.3-flash` route page | released 2026-08-26 | https://openrouter.ai/z-ai/glm-5.3-flash | First-party platform record | C02 (1,310,720-token context, 131,072 completion, twelve providers); C24 (discounted $0.075 / $0.25 / $0.015 per million against list $0.15 / $0.50) | That the discount is a standing price. Any performance claim. |
| S09 | Artificial Analysis | GLM-5.3-Flash model page, Intelligence Index v4.1.1 | accessed 2026-08-27 | https://artificialanalysis.ai/models/glm-5-3-flash/ | Independent measurement | C09 (index 57, 3rd of 110, median 28); C10 (output speed 50.2 tok/s, 46th of 110, median 65.1); C11's $0.09 half; the 83% cache discount and 1.47 s TTFT | Comparability with any vendor-harness figure. Any statement about the preview checkpoint. |
| S06 | Z.ai on Hugging Face | `zai-org/GLM-5.3-Flash` model card and licence | 2026-08-26 | https://huggingface.co/zai-org/GLM-5.3-Flash | First-party | C23 (`reasoning_effort` defaults to `max`; `clear_thinking` defaults to `false`, with the card advising `true` for chat); C03 (320B total / 18B active, MIT licence) | Any causal link between those defaults and reported slowness. No source connects them. |
| S03 | TechCrunch | Who's behind the new "stealth model" Ox Alpha? | 2026-08-23 | https://techcrunch.com/2026/08/23/whos-behind-the-new-stealth-model-ox-alpha/ | Independent reporting | That the maker was still unidentified in mainstream coverage three days into the preview, while the route was already carrying heavy traffic | The identity, which it does not resolve. |

## Local capture map

- S01: `sources/S01-openrouter-ox-alpha-model-page.png`
- S02: `sources/S02-openrouter-glm-5-3-flash-model-page.png`
- S05: `sources/S05-zai-glm-5-3-flash-announcement.png`
- S06: `sources/S06-hf-glm-5-3-flash-card.png`
- S08: `sources/S08-ithome-ox-alpha-terms.png`
- S09: `sources/S09-artificialanalysis-glm-5-3-flash.png`
- S11: `sources/S11-github-opencode-issue-44300.png`
- S12: `sources/S12-reddit-what-does-everyone-think.png`
- S13: `sources/S13-reddit-unlimited-free-capacity.png`
- S14: `sources/S14-github-opencode-issue-44262.png`
- S15: `sources/S15-github-hermes-issue-93030.png`
- S16: `sources/S16-github-pi-issue-8541.png`

## Filed bug reports cited

Captured in full here as S11, S14, S15 and S16. Classified in
`sentiment-method.md`, not in this table's terms.

| ID | Tracker | URL | Layer |
|---|---|---|---|
| G01 / S11 | `anomalyco/opencode` 44300 | https://github.com/anomalyco/opencode/issues/44300 | route |
| G02 / S14 | `anomalyco/opencode` 44262 | https://github.com/anomalyco/opencode/issues/44262 | **model** |
| G03 / S15 | `NousResearch/hermes-agent` 93030 | https://github.com/NousResearch/hermes-agent/issues/93030 | unresolved |
| G04 / S16 | `earendil-works/pi` 8541 | https://github.com/earendil-works/pi/issues/8541 | **harness** |

## Community threads

Reddit reached only through the Internet Archive; live capture hits Reddit's
"Prove your humanity" interstitial and `old.reddit.com` requires login. Handles,
timestamps and permalinks are legible in both local captures, S12 and S13.

| Thread | Reports drawn |
|---|---|
| r/opencode `1vwlbr0`, 2026-08-23 | R01–R06 |
| r/opencode `1vyblz8`, 2026-08-25 | R07–R11 |

## Sources examined and not used

- **S04** `MatchaOnMuffins/oxalpha` — an individual community DeepSWE run on a
  different configuration. Not comparable to Z.ai's 63.4 in either direction, and
  this article makes no benchmark comparison at all.
- **S07** Cloudflare Workers AI changelog, 2026-08-26 — confirms release-day
  availability. Not relevant to the anonymous-preview question.
- **S10** Ollama library page — restates the anonymous-testing fact from S05. Not
  original evidence, so citing it would inflate the apparent source count.

## Rejected sources

Carried forward unchanged; none is cited. `ox-alpha.net`, `oxalpha.wiki`,
`oxalpha.org`, `glm5.app`, `cellcog.ai`, `toolscout.ai`, `arkeontech.de`,
`aikendra.com`, `explainx.ai`, `stealthmodelwatch.online`, `atoms.dev`,
`llmrumors.com`, `yfarmx.com`, `laura-martel.com`, `ai-primer.com`,
`brainbaselabs.com`, `orcarouter.ai`. `oxalpha.org/benchmarks` is rejected
specifically for publishing a self-constructed "Intelligence Index" described as
"inspired by" Artificial Analysis, which invites exactly the confusion between
independent measurement and imitation that this article's argument depends on
avoiding.

Additional aggregator restatements were excluded rather than used to inflate the
source count: `packetnebula.com`, `yix.ai`, `apidog.com` and
`progressiverobot.com`.
