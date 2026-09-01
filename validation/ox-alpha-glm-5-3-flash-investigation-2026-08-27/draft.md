# Ox Alpha Was GLM-5.3-Flash: What Z.ai Confirmed and What It Didn't

Ox Alpha was GLM-5.3-Flash. Z.ai says so in its own release post. What that
sentence does not settle is whether the model people spent a week testing is the
model that shipped.

![Three matte glass jars on pale birch, the front one sealed with a strip of masking tape carrying no writing, a graphite pencil resting beside it in warm window light.](blog:ox-alpha-was-glm-5-3-flash:feature-unlabelled-jar)

*An original illustration, not a screenshot: the front jar's tape was never
labelled, which is the part of the Ox Alpha story that is still open.*

## The sentence that closed the question

A model called `ox-alpha` appeared on OpenRouter's stealth routes on
20 August 2026 with no maker named. Six days later, Z.ai's
[GLM-5.3-Flash release post](https://z.ai/blog/glm-5.3-flash) included a line
that needed no interpretation:

> Before release, Z.ai tested it anonymously as `ox-alpha` on OpenCode and
> OpenRouter.

OpenRouter's own [Ox Alpha route page](https://openrouter.ai/stealth/ox-alpha)
now carries the same conclusion in its description, stating that the route was a
stealth model operated by a third-party provider and "was revealed to be ZAI
GLM-5.3-Flash." The Taiwanese technology outlet iThome
[reported the reveal independently](https://www.ithome.com.tw/news/178473) on
27 August.

That is three separate records: a first-party statement from the company that
built the model, a platform record from the company that served it, and a report
from a publication with no stake in either. The identity is verified, not
inferred. Nothing about it rests on comparing outputs and noticing a family
resemblance — which matters, because output similarity cannot establish identity
on its own, and in this case nobody has to try.

Until that post appeared, the question was genuinely open.
[TechCrunch was still asking who was behind the route](https://techcrunch.com/2026/08/23/whos-behind-the-new-stealth-model-ox-alpha/)
on 23 August, three days into the preview.

## What the confirmation leaves open

Z.ai's sentence establishes that the same *model* was behind both names. It does
not say whether the weights served on the stealth route were the weights
released on 26 August. None of the sources examined for this article states
whether the preview checkpoint and the public checkpoint are identical: not the
release post, not the model card, not either OpenRouter route page, not the
iThome report. That is an absence of any statement, not a contradiction between
statements.

One published difference sits beside the question without answering it. The
stealth route was documented with a 1,048,576-token context window. The released
[`z-ai/glm-5.3-flash` route](https://openrouter.ai/z-ai/glm-5.3-flash) is
documented with 1,310,720 tokens, and up to 131,072 completion tokens. The gap is
in the record; its cause is not.

This is the same question an
[earlier investigation into the Ox Alpha API](/blog/ox-alpha-api-left-a-trail)
left open before the reveal, and the reveal closed only half of it. It also sets
the boundary for everything below: the hands-on reports collected during the
preview describe the preview route, whatever relationship those weights have to
the ones now on Hugging Face.

## What GLM-5.3-Flash actually is

The released model is a sparse mixture-of-experts system: 320 billion total
parameters with 18 billion active per token, according to both Z.ai's release
post and the
[Hugging Face model card](https://huggingface.co/zai-org/GLM-5.3-Flash). The
weights are published under the MIT licence. Z.ai describes a hybrid of sparse
and linear attention, a component it calls mHC, and training on a 30-trillion-token
multimodal corpus. It reports 3.0× less attention compute and a 4.4× smaller
key-value cache than GLM-5.3, while noting in the same passage that the cache
remains slightly larger than Kimi-K3's and DeepSeek-V4-Flash's.

Two defaults in the model card are worth knowing before the first request.
`reasoning_effort` defaults to `max`, which is the expensive end of its own
scale. `clear_thinking` defaults to `false`, and the card advises setting it to
`true` for chat. A caller who sends neither field gets maximum reasoning effort
and retained thinking, which is a plausible explanation for some of the slowness
reports below, though no source connects the two directly.

The "Flash" in the name is Z.ai's own product-line label for its cheaper, faster
tier. It is not a version number, and it does not correspond to any comparable
label from another vendor.

## Vendor claims and independent measurement do not line up

Z.ai's release post publishes a benchmark table: Terminal Bench 2.1 at 84.3,
DeepSWE v1.1 at 63.4 against GLM-5.2's 46.2, Toolathlon Verified at 78.4,
AutomationBench v1.0.6 at 48.8 against 26.2, GDPval-AA v2 at 1773. On Z.ai's own
Code Bench v1.0 at maximum effort it reports 29.0 against Claude Opus 4.8's 29.5
— below, not above, on the company's own scoreboard.

These are vendor runs on vendor harnesses. They establish what Z.ai claims, and
they are the only figures available for most of those tasks. They are not
independent results, and they cannot be lined up against numbers from a different
harness as though they measured the same thing. A community DeepSWE run published
during the preview at
[`MatchaOnMuffins/oxalpha`](https://github.com/MatchaOnMuffins/oxalpha) used a
different configuration, so its score is not comparable to Z.ai's 63.4 in either
direction.

One independent measurement does exist.
[Artificial Analysis](https://artificialanalysis.ai/models/glm-5-3-flash/) ran
its own Intelligence Index v4.1.1 and scored the model 57, ranking it 3rd among
110 comparable models against a median of 28. On the same 110-model set it
measured output speed at 50.2 tokens per second, ranking 46th against a median of
65.1, with a time to first token of 1.47 seconds.

![Two bar panels. Intelligence Index v4.1.1: GLM-5.3-Flash 57 points against a median of 28 across 110 models, ranked 3rd. Output speed: GLM-5.3-Flash 50.2 tokens per second against a median of 65.1, ranked 46th.](blog:ox-alpha-was-glm-5-3-flash:chart-independent-measurements)

*Artificial Analysis measured both panels on the same 110-model set on 27 August
2026. The gap between the two ranks is why speed and intelligence have to be
quoted separately.*

| Measure | GLM-5.3-Flash | Median of 110 models | Rank |
|---|---|---|---|
| Intelligence Index v4.1.1 | 57 points | 28 points | 3rd of 110 |
| Output speed | 50.2 tokens/second | 65.1 tokens/second | 46th of 110 |

Third on intelligence and forty-sixth on speed is a specific shape, and it is the
shape the hands-on reports describe: capable, and slow.

The two sources also disagree on cost. Artificial Analysis puts the cost of
running its index at $0.09 per task. Z.ai's own page claims the same score of 57
at $0.045 per task. Both figures are published; neither source explains the
other, and averaging them would invent a number that nobody measured.

Pricing on OpenRouter is currently discounted: $0.075 per million input tokens,
$0.25 output, $0.015 cached, against a list price of $0.15 and $0.50. The
discount is what is on the page today, not a standing rate. Twelve providers were
listed as serving the model, and
[Cloudflare added it to Workers AI](https://developers.cloudflare.com/changelog/post/2026-08-26-glm-5.3-flash-workers-ai/)
on release day.

## What people said while using it

The reception evidence has a narrow shape and it is worth stating before the
quotations. Eleven attributable reports were collected from two r/opencode
threads, alongside three filed bug reports on three separate issue trackers, all
dated between 20 and 27 August 2026, all describing the free preview route.
Reports without a visible handle,
timestamp, or resolvable permalink were discarded, and roughly a dozen comments
fell out that way. X was not sampled, because posts could not be opened in full
in this environment. That sample supports themes, not proportions, and no
satisfaction percentage is calculable from it.

The population also skews. Both threads belong to one coding harness's community,
reaching the model through one route during a free preview under heavy load. Such
a group over-reports availability problems and says almost nothing about the paid
experience.

On capability, the praise is consistent. `Prior-Meeting1645` rated its
intelligence at recent-top-model level, above Gemini 3.7 and Muse Spark 1.2.
`Ariquitaun` reported it "worked very well as an orchestrator over the weekend,"
while noting they had not used it for writing code. `myaaa_tan` said it audited
and redesigned their solar tracker successfully. `Fedor_Doc` reported it working
in pi.dev without major problems.

Every one of those posts predates the 26 August reveal, so the praise was earned
without a brand attached to it. What that shows is something about the
*conditions*, since nobody was crediting a company they already trusted, rather
than anything about how strong the sentiment was.

Speed is where praise turns qualified. `myaaa_tan` finished the solar-tracker
work, but slowly enough to play games while waiting. `jacobpowaza` was impressed
by its capability while finding it noticeably slower than Claude and Codex, and
reported it sometimes hallucinating before arriving at the right result.
`diyadude` called it "slow and flaky."

The complaints cluster somewhere other than the model. `SPEZ_IS_A_JABRONI`
summarised the week as "great when it works." `EmperorSheep` set the advertised
"Generous rate limits, near unlimited usage" against repeated `Upstream request
failed: Endpoint is unavailable` errors. `Any-Big-3336` tried four times and got
one run to complete. Those are route failures during a free preview, not evidence
about the weights.

Two reports narrow it further. `AI_docent` pointed to
[OpenCode issue 44300](https://github.com/anomalyco/opencode/issues/44300), where
requests carrying a `tools` array failed while identical requests without tools
succeeded — a harness-level fault with a reproducible trigger. `Bajtss` saw
"Endpoint not available" repeatedly in OpenCode and then ran the same model
without problems through a different client. When the same weights work on one
path and fail on another, the path is the variable.

That reasoning has a limit, and one filed bug marks it.
[OpenCode issue 44262](https://github.com/anomalyco/opencode/issues/44262),
opened 22 August, reports the route returning the string `"null"` where a tool
argument was declared as `string | null`, while the same request to a different
model on the same endpoint returned JSON null. The reporter tried `strict: true`,
`anyOf`, `oneOf`, a reversed union order and OpenAPI-style `nullable: true`, and
got the string back every time, while null-only schemas and unions of null with
other types behaved correctly. Holding the endpoint fixed and changing only the
model points at the model. And the tool-path trouble was not confined to one
harness: a
[Hermes Agent report](https://github.com/NousResearch/hermes-agent/issues/93030)
from 23 August records tool-enabled requests to `stealth/ox-alpha` returning
HTTP 200 with `finish_reason=stop` and no content, reasoning, tool calls or usage
at all, through Nous Portal rather than OpenCode.

## Who it suits, and who should wait

The case for it: an independently verified intelligence score in the top three of
110 measured models, MIT-licensed weights that can be self-hosted, a context
window past 1.3 million tokens, function calling, twelve serving providers plus
Cloudflare, and a price that is low even at list rate. Several users reported it
holding up as an orchestrator over multi-step work.

The case against it, today: measured output speed below the median of the same
comparison set, first-hand reports of long waits on real tasks, availability
problems severe enough that some users could not complete a run, a tool-calling
schema bug that survives every documented workaround, empty tool-enabled
responses reported on a second harness, defaults that quietly select
maximum reasoning effort, a cost-per-task figure that the vendor and the
independent lab state differently, and a promotional price rather than a settled
one.

Someone who needs throughput and predictable availability today has reason to
wait. Someone who values capability per dollar on long-context, tool-using work,
and who can absorb a slow response and a retry, has an unusually cheap option
with public weights as a fallback.

## The verdict, bounded

The identity question is answered: Ox Alpha was GLM-5.3-Flash, on Z.ai's own
statement, corroborated by OpenRouter's route record and by independent
reporting. The checkpoint question is not answered, and no source examined here
addresses it. Anyone reading the preview-week reports as a guide to the released
weights is making an assumption the record does not support — one that the
published context-window difference makes worth holding lightly.

What would change the conclusion: a first-party statement that the stealth route
served a different checkpoint would break the inference from preview experience
to released model, without touching the identity finding. A retraction or
correction from Z.ai, or a contradicting record from OpenRouter, would reopen the
identity itself. A second independent lab measuring speed well above the median
would undercut the slowness theme. None of those exists as of 27 August 2026.

For anyone who wants to check the performance side rather than take it secondhand:
the
[Artificial Analysis model page](https://artificialanalysis.ai/models/glm-5-3-flash/)
publishes its methodology alongside the numbers, and the index version is stated
on the page, so a later run can be compared against this one.
