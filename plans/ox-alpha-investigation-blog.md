# Ox Alpha Investigation Blog

## Editorial objective

Publish an English, evidence-led investigation of Ox Alpha that answers three
separate questions instead of collapsing them into one:

1. Who publicly introduced the preview, and who published the earliest
   traceable technical identity hypothesis?
2. Which company most likely operates the serving stack?
3. What can the available fingerprints establish about the model family and
   exact checkpoint?

The article must also correct the circulating benchmark narrative, compare the
single public Ox Alpha run only with method-adjacent results, and give readers a
useful privacy warning while the provider remains anonymous.

Research cutoff: **August 24, 2026 (Asia/Jakarta)**.

## Terminology ledger

| Term | Working definition | Editorial rule |
|---|---|---|
| Ox Alpha | The temporary OpenRouter model ID `stealth/ox-alpha`, also exposed by OpenCode Zen as `x-preview-f-free`. | Do not treat the preview name as a company, checkpoint, or architecture. |
| Distributor / gateway | OpenRouter or OpenCode, which exposes an API route to the model. | Do not call either company the model developer without evidence. |
| Provider / operator | The upstream party that serves requests and controls at least part of the API stack. | The Z.ai conclusion is strongest at this layer. |
| Developer / training lab | The organization responsible for the model weights and training process. | Keep formally undisclosed unless the provider confirms it. |
| Model family | A lineage indicated by tokenizer vocabulary, template behavior, and protocol conventions. | “GLM-5 family/generation” is supported more strongly than a precise SKU. |
| Checkpoint | A specific trained model version, such as GLM-5, GLM-5.2, or GLM-5.3. | Remains unresolved; no public artifact ties Ox Alpha to one exact checkpoint. |
| Tokenizer fingerprint | A comparison of token counts on carefully chosen strings against known vocabularies. | Strong evidence of lineage, not proof of ownership or identical weights. |
| Serving-layer fingerprint | Error classes, numeric codes, request validation, routes, and parameter behavior exposed by an API. | Strong evidence about the operator; gateways can still transform requests. |
| DeepSWE score | Pass rate on 113 long-horizon software-engineering tasks using the benchmark's agent harness. | Ox Alpha has one community run, not an official leaderboard entry or replicated mean. |

## Source ledger

### Primary and first-party sources

| Source | Evidence used | Status |
|---|---|---|
| [OpenRouter model card](https://openrouter.ai/stealth/ox-alpha) | Anonymous third-party provider, OpenRouter's limited role, Aug. 20 release, 1,048,576 context, 131,072 max output, modalities, price, and provider retention statement. | Verified live on Aug. 24. |
| [OpenRouter launch post](https://x.com/OpenRouter/status/2090544970923184269) | Public launch wording and timestamp. | Traceable X source; indexed mirrors used because X required sign-in. |
| [OpenCode launch post](https://x.com/opencode/status/2090544355824038300) | Earliest public launch post found, preceding OpenRouter's post by about two minutes; one-week-free and 100T-token/day claims. | Traceable X source; capacity remains OpenCode's claim. |
| [OpenCode Zen docs](https://opencode.ai/docs/zen/) | `x-preview-f-free`, compatible endpoint, free preview, and route-specific privacy terms. | Verified live on Aug. 24. |
| [Z.ai HTTP introduction](https://docs.z.ai/guides/develop/http/introduction) | Official `/api/paas/v4/chat/completions` route family. | Verified. |
| [Z.ai parameter concepts](https://docs.z.ai/guides/overview/concept-param) | GLM output ceiling and request conventions. | Verified. |
| [DeepSWE leaderboard](https://deepswe.datacurve.ai/) | Official comparison rows, 113 tasks, common mini-swe-agent basis, and confidence intervals. | Verified live on Aug. 24. |
| [Ox Alpha DeepSWE run](https://github.com/MatchaOnMuffins/oxalpha/blob/main/README.md) | Community-run configuration, full 66/113 result, duration, partial-credit and failure breakdown. | Public raw run; not an official leaderboard submission. |
| [Aseem Shrey evidence archive](https://github.com/LuD1161/ox-alpha-identification-public) | 44/44 GLM-5-generation differential, 600+ calls, long-context probes, contaminated self-identification, and stated limitations. | Reported with independent corroboration; exact checkpoint claim remains inference. |
| [Independent fingerprint repository](https://github.com/Mich404elle/ox-alpha-black-box-fingerprint) | Ox vs GLM-5.3 token-delta match, MiMo controls, protocol observations, and explicit limits. | Corroborated; all 17 local offline unit tests passed. |
| [Joseph W. Elstner whitepaper](https://isimplifyme.com/whitepapers/the-tokenizer-is-a-fingerprint) | 95/95 GLM-5 vocabulary match and separate served-model comparison. | Corroborated; vocabulary identity is not ownership proof. |

### Secondary reconstruction and independent checking

| Source | Evidence used | Status |
|---|---|---|
| [Digital Applied timeline](https://www.digitalapplied.com/blog/stealth-ox-alpha-anonymous-frontier-model-appears) | Exact launch-post chronology and discovery of early X probes. | Secondary reconstruction, checked against tweet IDs. |
| [Chetaslua error trace](https://x.com/chetaslua/status/2091086141764354364) | Java class path and `[1214]` role error compared across hosts. | Reported, then partially reproduced independently on Aug. 24. |
| [ExplainX investigation](https://www.explainx.ai/blog/ox-alpha-what-we-know-mystery-ai-model-august-2026) | Serving-layer controls, video behavior, and MiMo audio counterexample. | Corroborating secondary analysis. |
| [KrabArena trace check](https://krabarena.com/claims/ox-alpha-s-public-deepswe-trace-checks-out-at-58-4) | Recalculation of 58.41% from the public run artifacts. | Trace validation, not an independent rerun. |
| [Unlock AI benchmark](https://unlock-ai.natebjones.com/benchmarks/ox-alpha) | Broader task profile: strong knowledge-work artifact, weaker data integrity and physical/factual validation. | Reported with harness-change caveat. |

## Direct checks performed for this investigation

- OpenRouter's live API metadata matched the public model card.
- A harmless OpenCode Zen request with `top_p` set to a string returned a Java
  deserialization path ending in
  `com.wd.paas.api.domain.v4.chat.ChatCompletionRequest["top_p"]`.
- A harmless request with an invalid `wizard` role returned upstream error
  `[1214] Incorrect role information`.
- The public DeepSWE repository was inspected locally; the complete aggregate
  is 66/113 or 58.4%, not the early 8/10 headline.
- The independent fingerprint repository's 17 offline tests passed locally.
- Reference images used to direct the original illustrations remain private and
  were not used as image-generation input. After the user explicitly requested
  visible evidence, four direct source captures were added separately with their
  original URLs and Convex Storage records.

## Claim ledger

| Claim | Classification | Publication wording |
|---|---|---|
| OpenCode posted Ox Alpha before OpenRouter's announcement. | Verified | State the two public timestamps and the roughly two-minute gap. |
| `@aitrackerbot` published the earliest technical fingerprint found in the indexed public record, 68 minutes after the listing appeared. | Corroborated | Say “earliest public technical fingerprint this search found,” not “first person on the internet.” |
| OpenRouter made or owns Ox Alpha. | Rejected | OpenRouter explicitly says it is only the router. |
| Z.ai operates the upstream serving stack. | Strong inference | Describe the converging Java namespace, error dialect, route family, tokenizer, and controls; label it a high-confidence attribution, not an official reveal. |
| Ox Alpha belongs to the GLM-5 generation. | Strong inference | Use “GLM-5-family/generation” and explain the 44/44 and 95/95 vocabulary evidence. |
| Ox Alpha is exactly the original GLM-5 checkpoint. | Unknown | The best-fit claim from one archive is not proven; serving, multimodal extension, quantization, or a newer private variant may differ. |
| Ox Alpha is GLM-5.3 Flash/Turbo. | Unknown | Do not select a SKU. |
| Ox Alpha is Xiaomi MiMo, Qwen, Gemini, or a leaked Claude model. | Rejected or unsupported | Mention only as weaker early hypotheses; tokenizer and route controls weigh against them. |
| The model's own self-description identifies it. | Rejected | The deployment prompt forced the `ox-alpha` persona. |
| Ox Alpha scored 80% on DeepSWE. | Misleading subset claim | Explain that 8/10 came from an early subset where one task moved the score by ten points. |
| Ox Alpha scored about 63% on DeepSWE. | Superseded interim report | Prefer the final auditable 58.4% aggregate. |
| Ox Alpha scored 58.4% on the full 113-task run. | Verified for one community run | State 66/113, single run, community setup, and no official leaderboard status. |
| Ox Alpha beats current frontier coding models. | Rejected | Its public run sits around Claude Opus 4.8 and Qwen3.8 Max, below current leaders; method and run-count caveats apply. |
| Ox Alpha is uniformly reliable as a coding agent. | Rejected | Tool-call formatting ended 11/113 tasks; broader benchmark results varied sharply by task. |
| OpenCode's 100T tokens/day is proven model capacity. | Claimed | Attribute it to OpenCode and avoid using it as verified throughput. |
| The preview is safe for private repositories because it is free or “no training.” | Rejected | OpenRouter says the anonymous provider retains prompts and completions; route-specific terms differ. |

## Conflict resolutions

- **Identity:** “Z.ai-operated GLM-5-family preview” is the narrowest conclusion
  supported by independent evidence. “Exactly GLM-5” is too specific.
- **Benchmark:** the final repository aggregate and trace recalculation supersede
  both the early 80% subset and the rough ~63% progress report.
- **Privacy:** OpenCode's zero-retention statement describes its route. It does
  not erase OpenRouter's separate disclosure that the anonymous provider
  retains prompts and completions on the OpenRouter route.
- **Performance comparison:** official leaderboard rows are described as
  reference points, not a clean ranking merger, because the Ox result is a
  single community run and official rows aggregate configurations/runs.
- **“First person”:** the article identifies the earliest traceable launch post
  and earliest traceable technical fingerprint found. It does not claim access
  to deleted, private, or unindexed discussion.

## Research Gate

- [x] The topic and all ambiguous identity terms have been defined.
- [x] Every central claim has evidence and a status.
- [x] Primary sources were opened where available.
- [x] Independent controls were used for the identity attribution.
- [x] Conflicting benchmark and privacy claims were resolved explicitly.
- [x] The uncertainty boundary is clear: operator/family are strongly inferred;
      exact checkpoint and formal developer identity remain undisclosed.
- [x] Visual references remain private; the four published evidence captures are
      direct records of sources cited by the article, not mood-board material.

**Research Gate status: PASSED. Article drafting may begin.**

## Narrative and visual plan

### Hook

“The model would not name its maker. Its error handler did.” The opening starts
with the harmless malformed request and then pulls back to the 68-minute rush
from launch to the first tokenizer comparison.

### Structure

1. The launch clock: OpenCode, OpenRouter, and the earliest traceable probe.
2. Why asking the model was a dead end.
3. The evidence stack: tokenizer, template, Java namespace, error dialect,
   modality controls.
4. A calibrated verdict separating operator, family, and checkpoint.
5. The benchmark correction: 80% → interim ~63% → final 58.4%.
6. Method-adjacent comparison table and failure-profile discussion.
7. The quiet cost of a free anonymous route: retained prompts and divergent
   gateway policies.
8. CTA: reproduce small, lawful probes; publish counter-evidence and raw traces;
   wait for official attribution before turning a fingerprint into a product name.

### Original generated visuals

1. **Featured image:** warm editorial evidence desk at night; an anonymous dark
   model core, paper trails, token ribbons, and a terminal-error clue. No logos,
   product UI, readable labels, or literal company branding.
2. **Support image A:** macro view of token ribbons aligning like fingerprints,
   with one distinct fixed wrapper band.
3. **Support image B:** an API trail passing through a gateway and exposing a
   Java-shaped error seam. It will sit consecutively with A so the renderer can
   present the pair as one carousel.

Factual scores, dates, and evidence weights remain native Blog tables; they are
not entrusted to generative imagery.

### Source-evidence visuals

At the user's explicit request, the article also carries four direct source
captures: OpenRouter's model card and provider notice, the public fingerprint
archive's calibrated verdict, the complete 66/113 DeepSWE result, and the
official DeepSWE leaderboard. Each capture sits next to the claim it supports,
links to the original page, and is uploaded through the same Convex Storage
pipeline as the generated art. The two benchmark captures form their own
carousel so they are not confused with the editorial illustrations.

## Implementation task

### Task: Research and publish the Ox Alpha identity investigation

- Sumber spesifikasi: user request, this evidence ledger, native Blog block
  contract, and existing Convex Storage publisher pattern.
- Halaman/letak persis: new published route
  `/blog/ox-alpha-api-left-a-trail`.
- Elemen & struktur: native Blog blocks (`paragraph`, `heading`, `image`,
  `quote`, `list`, `table`, `divider`) rendered by `BlogPostRenderer`.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: tidak; unresolved identity claims remain explicitly
  labeled as inference or unknown.
- Acceptance criteria:
  1. English prose throughout, warm third-person narration, strong evidence-led
     hook, natural section rhythm, and a concrete source-oriented CTA.
  2. The launch source, earliest traceable technical fingerprint, provider,
     model family, and checkpoint are kept as separate questions.
  3. Every important identity and performance statement matches this ledger;
     no provider reveal, benchmark supremacy, permanent price, or privacy promise
     is invented.
  4. Generated art and direct evidence captures are labeled by role. Every
     evidence capture links to its original page; unrelated visual references
     remain private and unpublished.
  5. Every image persists a Convex `storageId` and stable `assetKey`; the Blog
     stores no project path or manually appended delivery URL.
  6. A repeated publish reuses identical image checksums and does not duplicate
     the Blog post.
  7. The Blog audit, Convex typecheck, production build, public readback,
     desktop/mobile render, image decode, carousel controls, focus state, and
     horizontal-overflow checks pass.
- Guardrail relevan: no dependency, fabricated data, new UI color, unattributed
  source image, or horizontal overflow; preserve keyboard and reduced-motion
  behavior.
- Screenshot evidence: `validation/ox-alpha-investigation-blog/` covers the
  desktop opening, both generated carousel states, both benchmark-evidence
  carousel states, the standalone OpenRouter and fingerprint evidence, the CTA,
  and 375 × 812 mobile opening/evidence states.
- Temuan triase:
  - P0-P2: none. Seven unique images decode from Convex Storage; the document
    has no horizontal overflow at either tested viewport; both carousels change
    source correctly through their real next/previous controls.
  - P4, pre-existing/global: the Nala mobile FAB occupies a small lower-right
    area near Blog media. This is already recorded in `TASKS.md` and was not
    widened into this article task.
- Validation result:
  - Published readback: 42 blocks, seven image blocks, three generated images,
    and four direct source-evidence captures; an idempotent rerun reused all
    seven Convex files with zero uploads.
  - Blog audit: 0 hard findings; the remaining rhythm warning comes from short,
    repeated table cells and does not describe the narrative prose.
  - Convex typecheck and the isolated Next.js production build passed.
  - Two consecutive seed builds produced 10 Blog rows and identical SHA-256
    `2d1b840ff2e11240f617f8dc7dc84c534b3c8e9325c1c318e41abe3d4bb171c3`.
- Status: done.
