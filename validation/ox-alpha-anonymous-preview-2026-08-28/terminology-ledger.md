# Terminology ledger

Terms this article uses in a precise sense, fixed before drafting so the prose
stays consistent and so no term does more work than the evidence allows.

| Term | Definition used here | Why it matters |
|---|---|---|
| **Anonymous preview** | A period during which a model is served publicly under a codename that identifies no maker. Used here for `stealth/ox-alpha` between 2026-08-20 and the 2026-08-26 reveal. | The article's subject. "Stealth model" is OpenRouter's own platform term; "anonymous testing" is Z.ai's phrase in the release post (S05). Both are quoted where they belong to their owner. |
| **Blind phase / named phase** | The window before and after the 2026-08-26 reveal, per `sentiment-method.md`. | Every classified user report (R01–R11) sits in the blind phase. No post-reveal report cleared the inclusion rules, so the sample cannot be described as reception of the released model. |
| **Traffic share** | The percentage of a platform's coding-model usage a route accounted for over a stated window. Here: 30.9% of OpenRouter coding-model usage through 2026-08-24, reported by iThome (C16). | It measures adoption of a free preview under promotion. It is not a satisfaction measure and is not used as one. |
| **Attribution layer** | Which of three things a failure belongs to: the **model** (the weights), the **provider path** (the route, gateway, capacity, rate limit), or the **harness** (the client that built and interpreted the request). | The whole reception argument turns on this split. `sentiment-method.md` records the layer for every negative and mixed report. A stall, an `Endpoint is unavailable` error, a rate limit or a harness bug is not a model-quality finding. |
| **Data governance** | Who states what about the retention, training use and processing location of prompts and completions, and which document controls. | The article reports a gap between statements (C17) and a limit of coverage (C18). It does not adjudicate either. |
| **Disclosure gap** | The difference between the model page's statement that provider-retained prompts and completions are not used for training, and the Stealth Program's general terms as iThome reads them (C17). | Named as a gap in the record and attributed to iThome. The article does not assert which document controls, because no source establishes that. |
| **Reported** | Claim status: a named publication states it, and no independent source has been found that confirms or contradicts it. | C16, C17 and C18 are all `reported`. The prose attributes each to iThome by name rather than stating it flatly. |
| **Claimed** | Claim status: asserted by a party with an interest, without independent confirmation. | C15 (Chinese AI chips, 3× end-to-end over Z.ai's own first baseline) is `claimed` and is written as Z.ai's claim, with the baseline identified. |
| **Inferred** | Claim status: follows from listed observations but is stated by no source. | C20, that preview-week praise arrived without brand attribution, is an inference about the *conditions* of the praise, not about its strength. |
| **Checkpoint** | The specific set of weights served at a specific time. | Whether the preview weights are the released weights is unstated by every source examined (C04, `unknown`). Referenced here only where it bears on what preview users were testing, not re-argued. |
| **Free preview** | Served at no cost to the caller during the anonymous period. | Every user report in the sample describes this route. None describes the paid `z-ai/glm-5.3-flash` experience, and the article says so beside the claim. |

## Terms deliberately not used

- **"Scandal", "cover-up", "violation", "breach"** — no source establishes
  wrongdoing. C17 and C18 are an unresolved question in the record.
- **"Most users", "most people", any percentage** — the sample is a convenience
  sample from two threads on one platform (`sentiment-method.md`, "No
  percentage").
- **"Beat" or "outperformed" against a named competitor** — Z.ai's own Code
  Bench shows 29.0 against Claude Opus 4.8's 29.5, below rather than above.
- **"Deceptive"** of the anonymous test itself — anonymous preview testing is a
  standard platform practice OpenRouter operates a program for, and Z.ai
  disclosed it in the release post.
