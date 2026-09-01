# Visual ledger

Every visual is assigned a narrative job before it is made. Two assets are
publishable. Fifteen source screenshots are research references only.

## Publishable assets

### V01 — Editorial illustration (featured image)

| Field | Value |
|---|---|
| Narrative job | Carry the article's two-part claim in one object: the unlabelled jar is a model that ran six days without a maker's name on it, and the tape tag left blank is the checkpoint question the reveal did not answer (C04). |
| File | `assets/feature-unlabelled-jar.jpg` |
| Asset key | `blog:ox-alpha-was-glm-5-3-flash:feature-unlabelled-jar` |
| Owner / source | Original generated illustration, made in this environment with the `local-imagegen` MCP `generate_image` tool from written art direction. `model` argument omitted as required; the service reported `cx/gpt-5.4-image`. |
| Rights status | Original generated illustration. Publishable under `docs/blog-writing-automation-contract.md:145`. Impersonates no screenshot, person, document, result, benchmark, or event. |
| Publish | Yes — first image block, and therefore the featured image. |
| Measured dimensions | 1536 × 1024, measured from the encoded bytes by walking JPEG SOF markers (`png-stats.mjs` cannot read JPEG). |
| Bytes | 219,406 |
| SHA-256 | `87388408f0b20186524afdfa2f8611ae5c919ecced10a4e39bc474cfc35ef810` |
| Alt text | Three matte glass jars on pale birch, the front one sealed with a strip of masking tape carrying no writing, a graphite pencil resting beside it in warm window light. |
| Caption | An original illustration, not a screenshot: the front jar's tape was never labelled, which is the part of the Ox Alpha story that is still open. |
| Reject-list inspection | Read back at full resolution. No text, letters, numbers, logos or watermarks; no screens, devices or interface elements; no glowing elements, neon, purple-blue gradients or glass panels; no robots, humanoid figures or hands; no fake terminal, dashboard or invented product mark; no advertisement framing; no malformed objects. |

### V02 — Factual chart

| Field | Value |
|---|---|
| Narrative job | Hold the independent measurement apart from the vendor table: the same third-party harness that ranks the model 3rd of 110 on intelligence ranks it 46th of 110 on output speed. The two panels are the reason the article's title makes no performance claim. |
| File | `assets/chart-independent-measurements.png` |
| Asset key | `blog:ox-alpha-was-glm-5-3-flash:chart-independent-measurements` |
| Owner / source | Original chart, rendered in this environment by `scripts/bar-chart.mjs` from `chart-data.json`. Underlying values measured and published by Artificial Analysis (S09); the rendering is ours. |
| Rights status | Original repository-produced asset built from verified figures. No third-party imagery is reproduced. |
| Publish | Yes. |
| Measured dimensions | 1200 × 760, measured from the encoded PNG IHDR. |
| Bytes | 52,534 |
| SHA-256 | `93d3ff8cd2b9f8882a441af6cd5bb0d92eed6b81e052c84ef9f26b8787367415` |
| Data provenance | `chart-data.json`, claim rows C09 and C10, Artificial Analysis GLM-5.3-Flash page accessed 2026-08-27. Values: index 57 against a 110-model median of 28; output speed 50.2 tok/s against a 110-model median of 65.1. |
| Scale inspection | Both panels start at zero and label the zero and maximum tick. Panel maxima differ (57 index points, 65.1 tokens per second) because the units differ; no shared axis is implied. Bars are ranked within their own panel only. Ranks, units, comparison-set size, access date and source URL are printed inside the image. |
| Legibility check | 5.61% of pixels below luminance 128 (text and dark bars), 4.90% mid-tone (light bars). `scripts/png-stats.mjs` reports `ink=100%` for this file because the `#fbfaf7` background falls under its 250 threshold, so its blank test is uninformative here and the dark/mid measurement is used instead. |
| Alt text | Two bar panels. Intelligence Index v4.1.1: GLM-5.3-Flash 57 points against a median of 28 across 110 models, ranked 3rd. Output speed: GLM-5.3-Flash 50.2 tokens per second against a median of 65.1, ranked 46th. |
| Caption | Artificial Analysis measured both panels on the same 110-model set on 27 August 2026. The gap between the two ranks is why speed and intelligence have to be quoted separately. |
| Accessible values | Mirrored into a `table` block in `payload.json`, so the four numbers are readable without the image. |

## Research references — not published

`sources/S01`–`S15` are screenshots of first-party pages, an independent
benchmark page, reporting, filed bug reports, and archived community threads.
Under `docs/blog-writing-automation-contract.md:145` collected third-party web
images are research references, not publishable Blog assets, and no publication
rights were established for any of them. They stay in the package as audit
evidence and appear in no block.

| ID | Subject | Owner | Publish |
|---|---|---|---|
| S01 | OpenRouter `stealth/ox-alpha` route page | OpenRouter | No |
| S02 | OpenRouter `z-ai/glm-5.3-flash` route page | OpenRouter | No |
| S03 | TechCrunch, "Who's behind the new 'stealth model' Ox Alpha?" | TechCrunch | No |
| S04 | `MatchaOnMuffins/oxalpha` community DeepSWE run | GitHub user MatchaOnMuffins | No |
| S05 | Z.ai GLM-5.3-Flash release post, including the anonymous-testing sentence and vendor benchmark table | Z.ai | No |
| S06 | Hugging Face `zai-org/GLM-5.3-Flash` model card and licence | Z.ai on Hugging Face | No |
| S07 | Cloudflare Workers AI changelog entry | Cloudflare | No |
| S08 | iThome report on the reveal and the data-governance gap | iThome (李建興) | No |
| S09 | Artificial Analysis GLM-5.3-Flash page | Artificial Analysis | No |
| S10 | Ollama `glm-5.3-flash` library page | Ollama | No |
| S11 | OpenCode issue 44300, tool-array request failures | GitHub, `anomalyco/opencode` | No |
| S12 | r/opencode thread `1vwlbr0`, Wayback capture | Reddit users, via Internet Archive | No |
| S13 | r/opencode thread `1vyblz8`, Wayback capture | Reddit users, via Internet Archive | No |
| S14 | OpenCode issue 44262, nullable-string tool-argument type bug | GitHub, `anomalyco/opencode` | No |
| S15 | Hermes Agent issue 93030, empty tool-enabled responses via Nous Portal | GitHub, `NousResearch/hermes-agent` | No |

The article therefore carries one original illustration and one original chart,
and links to sources in prose instead of reproducing their pages.
