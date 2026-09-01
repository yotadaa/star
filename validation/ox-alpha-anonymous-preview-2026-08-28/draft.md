# Ten Trillion Tokens Under a Name Nobody Could Check

For six days in August, the most heavily used coding model on OpenRouter had no maker's name on it.

The route was called `stealth/ox-alpha`. It appeared on 20 August 2026 and it worked: enough people ran real jobs through it that, by the Taiwanese technology outlet iThome's account, it processed 10.3 trillion tokens and accounted for 30.9% of all coding-model usage on the platform through 24 August, ranked first. Those figures come from [iThome's report](https://www.ithome.com.tw/news/178473) and belong to iThome; no independent count of the same window has been found. They measure adoption of a free preview under promotion, which is not the same thing as approval.

On 26 August, Z.ai's [GLM-5.3-Flash release post](https://z.ai/blog/glm-5.3-flash) closed the identity question in one line: "Before release, Z.ai tested it anonymously as `ox-alpha` on OpenCode and OpenRouter." That the model was GLM-5.3-Flash is [settled and documented elsewhere](/blog/ox-alpha-was-glm-5-3-flash). This is about the six days before the sentence existed, and about what a person running production work through that route could actually establish while it was running.

## Two statements, one route

The route page itself carried a data commitment. [OpenRouter's `stealth/ox-alpha` page](https://openrouter.ai/stealth/ox-alpha) documented a 1,048,576-token context window and stated that prompts and completions retained by the provider are not used for training. That is a first-party platform record, checkable on the page, and it is the reassuring half.

The other half is a reading rather than a record. iThome reports a gap between that statement and the general terms governing OpenRouter's Stealth Program, under which the route was served. Which document controls is not something any source examined here establishes, and this article does not assert it. What can be said is narrower and still worth saying: a user in August had two documents describing the handling of their prompts, at least one reading under which they do not agree, and no way to resolve the disagreement against a named provider, because the provider was the thing being withheld.

That is the structural feature of an anonymous preview that has nothing to do with the model's quality. Data commitments are only as good as the party making them, and identifying the party was the one piece of information the arrangement was designed to omit.

## Where the tokens were processed

Z.ai's release post describes serving the model on Chinese AI chips, and claims a 3× end-to-end improvement from that work. The comparison deserves care: the baseline is Z.ai's own first attempt at serving on that hardware, not a competitor's system, so the figure measures internal progress and not relative performance. iThome notes that the release post does not state the cluster's country or region.

For prompts sent during the anonymous test, that leaves a question open rather than answered. iThome's reading of Z.ai's published privacy documents is that they cover Z.ai's own services and its API, which does not reach a preview served through a third-party platform under a codename. The processing location for those six days therefore cannot be confirmed from the documents that exist. That is an unresolved question about coverage, not a finding of wrongdoing, and iThome frames it the same way.

Anyone who sent a proprietary codebase through the route in that window has no document to consult that would tell them where it went. Anyone who sent nothing sensitive lost nothing. The distinction matters, and it was not available at the time to the people who needed it.

## Nobody could tell what had failed

The clearest evidence that the arrangement cost users information is not in the terms. It is in how people talked about failures.

The reception evidence has a specific shape, and the shape matters before any of it is quoted. Eleven attributable reports were collected from two r/opencode threads, alongside four filed bug reports on three separate issue trackers, dated between 22 and 25 August 2026. Every community report describes the free preview through a coding harness; none describes the paid route. That convenience sample is useful for tracing failures, but it cannot produce a satisfaction figure and none is offered.

Read as sentiment, that sample is mixed. Read as an attribution record, it is clearer: the fault lands on the model, the provider path, the harness or remains unresolved.

`EmperorSheep` set the advertised "Generous rate limits, near unlimited usage" against repeated `Upstream request failed: Endpoint is unavailable` errors. `Any-Big-3336` tried four times and got one run to finish. `SPEZ_IS_A_JABRONI` summarised the week as "great when it works." Those are capacity failures on the serving path, and none of them says anything about the weights.

`Bajtss` ran the sharpest test without meaning to: repeated "Endpoint not available" in OpenCode, then the same model working without trouble through a different client. Same weights, two paths, one outcome each. When that happens the path is the variable, and `AI_docent` pointed at the mechanism, [OpenCode issue 44300](https://github.com/anomalyco/opencode/issues/44300), where requests carrying a `tools` array failed while identical requests without tools succeeded.

Then there is the case where the information existed and did not arrive. A report on the Pi tracker, [`earendil-works/pi` issue 8541](https://github.com/earendil-works/pi/issues/8541), records a provider response that said exactly what was wrong: temporarily at capacity upstream, explicitly not the caller's own rate limit. What the user saw was `Error: ERROR`. The harness retry classifier could not read it either, so it did not retry something that was retryable. The issue was closed by a new-contributor bot rather than by triage. A correctly-described, transient, upstream capacity event reached the person waiting on it as five characters carrying no information at all.

Attributing everything to the path would be the wrong lesson, and one filed report marks the limit. [OpenCode issue 44262](https://github.com/anomalyco/opencode/issues/44262), opened 22 August, holds the endpoint fixed and changes only the model name: asked for a tool argument declared as `string | null`, the route returned the string `"null"`, while the same request to a different model on the same endpoint returned JSON null. The reporter tried `strict: true`, `anyOf`, `oneOf`, a reversed union order and OpenAPI-style `nullable: true`, and the string came back every time, while null-only schemas and unions of null with integer, boolean, number, object and array all behaved correctly. That defect sits in the model. A [Hermes Agent report](https://github.com/NousResearch/hermes-agent/issues/93030) from 23 August adds a case that cannot be assigned on its own evidence: tool-enabled requests through Nous Portal returning HTTP 200 with `finish_reason=stop` and no content, reasoning, tool calls or usage.

Sorting those layers apart took a week of public triage across three trackers. During the preview, a user hitting an error had a codename, a platform, a harness and no supplier to ask.

## What the anonymity actually bought

The practice has a real defence, and the same evidence supports it.

The praise from the blind week arrived with no brand attached to it. `Prior-Meeting1645` rated the model's intelligence at recent-top-model level, above Gemini 3.7 and Muse Spark 1.2. `Ariquitaun` said it "worked very well as an orchestrator over the weekend," while noting they had not used it for writing code. `myaaa_tan` had it audit and redesign a solar tracker successfully, if slowly enough to play games while waiting. `Fedor_Doc` had it working in pi.dev with automatic retries covering occasional glitches. Nobody in that group was crediting a company they already trusted, because nobody knew which company to credit. That says something about the conditions under which the praise was given, rather than about how strong it was, and it is the best argument for testing a model without its label on it.

The independent numbers, published after the reveal, are consistent with what the blind testers described. [Artificial Analysis](https://artificialanalysis.ai/models/glm-5-3-flash/) scored the model 57 on its Intelligence Index v4.1.1, third of 110 comparable models against a median of 28, and measured output speed at 50.2 tokens per second, forty-sixth of the same 110 against a median of 65.1.

| Measure | GLM-5.3-Flash | Median of 110 models | Rank |
|---|---|---|---|
| Intelligence Index v4.1.1 | 57 points | 28 points | 3rd of 110 |
| Output speed | 50.2 tokens/second | 65.1 tokens/second | 46th of 110 |

Capable and slow is what `jacobpowaza` reported while the model was still nameless: impressed by its capability, finding it noticeably slower than Claude and Codex, and watching it sometimes hallucinate before arriving at the right answer. `diyadude` put it more briefly, "slow and flaky." Blind testing produced a description that an independent lab's instruments later matched. The mechanism worked.

What it did not produce was a way to check anything. The two accounts of cost illustrate the difference: Artificial Analysis puts the cost of running its index at $0.09 per task, while Z.ai's own page claims the same score of 57 at $0.045. Both figures are published, neither explains the other, and averaging them would invent a number nobody measured. That disagreement is resolvable in principle now, because both parties are named and both publish methodology. During the preview there was no second party to disagree with.

## The part still open

Two questions have first-party owners and neither has been answered. Whether the Stealth Program's general terms or the route page's data statement governed the prompts sent through `stealth/ox-alpha` is a question OpenRouter can settle in a sentence. Where those tokens were processed is a question Z.ai can settle in a sentence. As of 27 August 2026 neither sentence exists, and the reveal that answered the identity question did not touch either.

A third question sits underneath both and belongs to the record rather than to any party: no source examined here states whether the weights served on the stealth route are the weights released as `z-ai/glm-5.3-flash`. Not the release post, not the Hugging Face model card, not either OpenRouter route page, not the iThome report. The released route is documented at 1,310,720 tokens of context against the preview's 1,048,576, a difference that is in the record without an explanation attached. Preview reports describe the preview.

What would change any of this: a statement from OpenRouter naming which terms controlled would close the retention question outright. A statement from Z.ai on the processing location during the test would close the second. A first-party note that the stealth route served a different checkpoint would not disturb the identity finding but would sever every preview report from the released model.

Anonymous previews can buy honest first impressions; the August record contains praise that arrived before anyone knew the maker. They also remove the ability to check claims against a named party. That cost is uneven: trivial for a toy prompt, serious for a proprietary codebase or private repository. Ten trillion tokens is a large amount of work to have sent somewhere on the strength of a codename, whatever share of it was sensitive.

For anyone weighing the released model on its own terms rather than on preview reports: pricing on [OpenRouter](https://openrouter.ai/z-ai/glm-5.3-flash) currently sits at $0.075 per million input tokens, $0.25 output and $0.015 cached, discounted from a list price of $0.15 and $0.50, which is what the page shows today rather than a settled rate. The [Hugging Face card](https://huggingface.co/zai-org/GLM-5.3-Flash) is worth reading before the first request for one reason unrelated to price: `reasoning_effort` defaults to `max` and `clear_thinking` defaults to `false`, so a caller who sends neither field inherits the expensive end of the model's own scale.
