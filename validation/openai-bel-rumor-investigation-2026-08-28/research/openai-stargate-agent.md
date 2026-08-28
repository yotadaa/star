# OpenAI, Astra, "Bel," and Stargate: claim audit

Checked on 28 August 2026, Asia/Jakarta. Web discovery, page reading, and source capture were done in the in-app Browser. This file is a research handoff, not article copy.

## Bottom line

OpenAI has publicly named Astra. It calls Astra an upcoming model and says an internal version produced ten mathematical and theoretical-computer-science results. OpenAI also says Astra may reach its Critical cybersecurity threshold.

That is where the confirmed chain stops.

The claims that "Bel" is a completed pretrain, succeeds "Doug," has more than 10 trillion parameters, is similar in size to GPT-4.5, and will become the base for Astra or GPT-6 all trace to one post by `@synthwavedd`. The post supplies no named source, document, benchmark, training record, or independent confirmation. Coverage located during this pass either quotes that post or labels the story a rumor.

Stargate is real infrastructure, and some of it was already running early training and inference workloads by 2025. The announced gigawatt and investment figures are mostly planned or under-development capacity. None of the official Stargate pages reviewed links its compute to Bel. Compute availability is not evidence for a model name, parameter count, training lineage, or launch date.

## Claim ledger

| Claim | Status | What the public record supports | Safe wording |
|---|---|---|---|
| Astra is an OpenAI model | Confirmed | OpenAI called Astra "one of our upcoming models" on 7 August 2026 and "our next major model" on 1 August. | "OpenAI has publicly confirmed Astra as an upcoming model." |
| Astra is a near-term launch | Not established | OpenAI has not given a launch date in the reviewed pages. On 18 August it said a two-week RL pause had occurred, its largest planned frontier RL run remained on hold, and many Astra workloads were still paused. | "Astra is upcoming, but OpenAI has not published a launch date." |
| OpenAI completed a pretrain called Bel | Unverified single-source claim | The earliest explicit source located is `@synthwavedd`, posted at 2:00 AM on 26 August 2026. No OpenAI announcement or strong independently sourced report was found. | "An X account claims OpenAI completed a pretrain called Bel. OpenAI has not confirmed it." |
| Bel succeeds Doug | Unverified | This relationship appears in the same X post. A focused search of OpenAI's public site returned people named Doug and unrelated community material, not an OpenAI model disclosure. | Attribute directly to the post or omit. |
| Doug is the base for Astra or GPT-6 | Unverified | No OpenAI source reviewed names Doug as a model. No corporate OpenAI page reviewed announces GPT-6. A focused GPT-6 site search returned community posts, not a release or roadmap. | Do not state as fact. |
| Bel has more than 10 trillion parameters | Unverified | The X post says ">10T total parameters." It does not say training tokens. No model card, paper, OpenAI post, or named-source report was found to support the number. | Preserve "parameters," label it an unverified claim, and do not convert it into tokens. |
| Bel is similar in size to GPT-4.5 | Not checkable from public disclosures | OpenAI called GPT-4.5 its largest chat model at launch and later described it as very large and compute-intensive. It did not publish a parameter count on the launch page. | "OpenAI did not disclose GPT-4.5's parameter count, so the size comparison cannot be verified." |
| Bel will become Astra or GPT-6 after more RL | Unverified | The lineage comes from the same X post. OpenAI does discuss RL on frontier models, but it does not name Bel or connect a specific run to Bel. | Separate the general fact that OpenAI uses RL from the claimed Bel lineage. |
| Bel could be an AGI-threshold base | Speculation | The phrase comes from the same post. No evaluation threshold, definition, or evidence accompanies it. OpenAI's mission language about AGI does not validate the claim. | Quote only as the poster's speculation, preferably omit from headline and dek. |
| Anthropic has no answer to Astra because of compute constraints | Unverified | The allegation originates in the same post. Focused search surfaced paraphrases and commentary, not named-source reporting or an Anthropic statement. | Do not report as OpenAI's belief without independent sourcing. |
| Stargate already runs model training | Confirmed, narrow | OpenAI said parts of Abilene were running early training and inference workloads by July 2025. In September it called Abilene up and running on OCI. | "Part of the Abilene campus was running early training and inference workloads." |
| Stargate has delivered 7 or 10 GW | False if written as delivered capacity | In September 2025 OpenAI described nearly 7 GW as planned capacity. The 10 GW figure was a commitment. In July, more than 5 GW was under development. | Label each number "planned," "under development," or "commitment." |
| Stargate proves Bel exists | Unsupported inference | Stargate can train future models, but no reviewed source ties it to Bel, Doug, or a 10T-parameter run. | "Stargate makes large training runs more plausible. It does not authenticate this leak." |

## The rumor's source chain

The earliest explicit post located during the broader investigation is:

- `@synthwavedd`, X status `2092326145270456377`
- Timestamp shown by X: 2:00 AM, 26 August 2026
- Text claims: Bel succeeds Doug; Doug is expected to be the base for Astra and GPT-6 after further RL; Bel has more than 10T total parameters; Bel may be a post-GPT-6 or AGI-threshold base; Anthropic lacks a near-term answer because of compute constraints.
- Evidence supplied in the post: none beyond the account's assertion.
- The follow-up promotes access to a Discord server for more leaks.

The `@Adidotdev` post at 7:08 AM that day is downstream. It credits `@synthwavedd` and should not be counted as a second source.

Wccftech published a story on 25 August in US Eastern time, which corresponds to the same event window across time zones. The story embeds the `@synthwavedd` post, calls it a "wild rumor," and provides no independent source for Bel's name, size, lineage, or the Anthropic allegation. Search results from crypto and AI-aggregation sites repeat the same details. Volume is not corroboration when every arrow points back to one post.

## What OpenAI has actually said about Astra

### Astra produced research results

On 1 August 2026, OpenAI wrote that an internal version of Astra, "our next major model," generated arguments for ten open problems in mathematics and theoretical computer science. Humans prepared manuscripts with the model, and the model formalized the arguments in Lean certificates. OpenAI estimated that the solution-search tokens would cost about $2,000 at Sol API rates.

This confirms a model name and some internal capability. It does not disclose parameter count, training tokens, base model, pretrain codename, launch date, or relationship to GPT-6.

### OpenAI called Astra upcoming

On 7 August, OpenAI described Astra as "one of our upcoming models." Preliminary internal evaluations and expert assessments led OpenAI to say it could not rule out Critical cybersecurity capability under its Preparedness Framework. The company said it was increasing security controls and pausing Astra activities that did not meet the new bar.

### Training pace changed after the disclosure

On 18 August, OpenAI said it had temporarily slowed scaling and paused RL training on its latest deployment-intended models for two weeks. It also said its largest planned frontier RL run remained on hold while smaller training and evaluations continued. The same page says a significant number of Astra workloads remained paused pending stronger safeguards.

This matters for the article's timeline. "Upcoming" is supported. "Near-term launch" is not. A confident launch claim would ignore OpenAI's later statement about paused workloads.

## GPT-4.5 does not provide a numeric size anchor

OpenAI's 27 February 2025 launch page calls GPT-4.5 its "largest and best model for chat yet." It says GPT-4.5 scaled pre-training, post-training, compute, and data. The same page later calls the model "very large and compute-intensive."

The page does not give a parameter count. It also distinguishes pre-training from post-training and says GPT-4.5 used supervised fine-tuning and RLHF. Those facts support a general explanation of how base-model training can be followed by post-training. They do not support the claim that GPT-4.5 or Bel has 10 trillion parameters.

Do not make a size chart that places GPT-4.5 and Bel on numeric axes. Both numbers would come from the same unsupported rumor.

## Stargate: announced scale versus available compute

| Date | Public statement | Category |
|---|---|---|
| 21 Jan 2025 | Stargate intended to invest $500 billion over four years; it would begin deploying $100 billion immediately. Buildout started in Texas. | Commitment and intent, not delivered capacity |
| 22 Jul 2025 | OpenAI and Oracle agreed to develop 4.5 GW more capacity. With Abilene, OpenAI said more than 5 GW was under development and would run more than 2 million chips. | Agreement and capacity under development |
| 22 Jul 2025 | Parts of Abilene were up and running. OpenAI said early training and inference workloads had begun after Oracle started delivering GB200 racks in June. | Operational, but no live megawatt total disclosed |
| 23 Sep 2025 | Five new sites plus Abilene and CoreWeave brought Stargate to nearly 7 GW of planned capacity and more than $400 billion in investment over the next three years. | Planned capacity and planned investment |
| 23 Sep 2025 | Abilene was "already up and running" on OCI and early training and inference workloads had started. | Operational at one campus, still without a disclosed live-capacity figure |

Reuters independently reported the 4.5 GW agreement and more than 5 GW under development. Its July report also noted that OpenAI had not disclosed the new facilities' locations or funding details at that point, and that analysts had questioned whether the venture could secure the promised funding. That reporting is useful context for why commitment, construction, and live capacity should stay separate.

The careful conclusion is simple. Stargate was already supporting training. That makes the line "not just inference" defensible. It does not prove which model ran there, how large it was, or whether the work involved Bel.

## Recommended article framing

The strongest story is not "OpenAI built a 10T model." The strongest story is how one confirmed name, Astra, became the anchor for an elaborate unconfirmed roadmap within hours.

Possible headlines:

- OpenAI Confirmed Astra. It Did Not Confirm Bel.
- The Bel Leak Has One Source and Six Unconfirmed Arrows
- Stargate Is Training Models. That Still Doesn't Prove Bel.

A defensible opening could contrast two records. OpenAI's pages confirm Astra and show real training capacity at Abilene. A single X post supplies Bel, Doug, 10T parameters, GPT-6 lineage, an AGI threshold, and the claim about Anthropic. Readers should see that split before they see any speculation about performance.

### Visual treatment

- Use the real X screenshot to show the full claim and its attribution.
- Pair it with the official Astra disclosure and the targeted Stargate training screenshot.
- A deterministic claim map would work better than a scale graphic. Use solid lines for OpenAI-confirmed relationships and dotted lines for the X post's claims.
- Do not turn the "small Astra sun versus giant Bel sun" image into evidence. It encodes an unsupported scale comparison.
- Do not chart Bel against GPT-4.5 by parameter count. Neither numeric value is publicly established by OpenAI.
- If the article uses the Reuters aerial photo, keep it inside the attributed page screenshot or obtain the appropriate license. Do not strip and republish the image as a free-standing asset.

## Source ledger

### OpenAI, "Ten advances in mathematics and theoretical computer science"

- URL: https://openai.com/index/ten-advances-in-mathematics/
- Date: 1 August 2026
- Supports: Astra is OpenAI's next major model; an internal version generated the published mathematical results; approximate Sol-rate token cost for finding the solutions.
- Does not support: Bel, Doug, GPT-6 lineage, parameter count, launch timing.
- Captures: `../sources/official/10-openai-astra-ten-advances.png`

### OpenAI, "Responding to the next frontier of critical cyber capabilities"

- URL: https://openai.com/index/responding-next-frontier-critical-cyber-capabilities/
- Date: 7 August 2026
- Supports: Astra is upcoming; preliminary cyber evaluations; OpenAI could not rule out Critical capability; security controls and paused activities.
- Captures: `../sources/official/03-openai-astra-cyber-disclosure.png`

### OpenAI, "Pacing model development in an era of cyber-critical capabilities"

- URL: https://openai.com/index/pacing-model-development-cyber-capabilities/
- Date: 18 August 2026
- Supports: two-week RL pause, largest planned frontier RL run still on hold, many Astra workloads paused, smaller training and evaluations continuing.
- Captures: `../sources/official/04-openai-astra-rl-pause.png`, `../sources/official/04b-openai-astra-two-week-rl-pause.png`

### OpenAI, "Introducing GPT-4.5"

- URL: https://openai.com/index/introducing-gpt-4-5/
- Date: 27 February 2025
- Supports: largest chat model at launch, scaled pre-training and post-training, very large and compute-intensive, SFT and RLHF.
- Does not disclose: parameter count.
- Captures: `../sources/official/07-openai-gpt-4-5-disclosure.png`, `../sources/official/07b-openai-gpt-4-5-scale-claim.png`, `../sources/official/07c-openai-gpt-4-5-compute-intensive.png`, `../sources/official/07d-openai-gpt-4-5-rlhf.png`

### OpenAI, "GPT-5.6: Frontier intelligence that scales with your ambition"

- URL: https://openai.com/index/gpt-5-6/
- Date: 9 July 2026, with later updates shown on page
- Supports: GPT-5.6 was OpenAI's publicly released flagship family before the Astra disclosures. It does not establish a GPT-6 roadmap.
- Capture: `../sources/official/15-openai-current-model-line-gpt-5-6.png`

### X, `@synthwavedd`, status `2092326145270456377`

- URL: https://x.com/synthwavedd/status/2092326145270456377
- Timestamp shown: 2:00 AM, 26 August 2026
- Supports only: that this account made the claim and the wording of the claim.
- Does not independently establish: any claim about OpenAI, Bel, Doug, size, lineage, AGI, or Anthropic.
- Capture: `../sources/official/08-x-origin-bel-rumor.png`

### Wccftech, "OpenAI's 'Bel' Has Over 10 Trillion Parameters..."

- URL: https://wccftech.com/openais-bel-has-over-10-trillion-parameters-and-it-might-just-be-the-worlds-first-agi-threshold-base-model/
- Date shown: 25 August 2026 at 5:03 PM EDT
- Use: trace the rumor's propagation. The article embeds the X post and labels the story a wild rumor.
- Not independent confirmation.
- Capture: `../sources/official/09-wccftech-bel-rumor-single-source.png`

### OpenAI and SoftBank, "Announcing The Stargate Project"

- URL: https://openai.com/index/announcing-the-stargate-project/
- Date: 21 January 2025
- Supports: $500 billion four-year intent, $100 billion immediate-deployment statement, participants, and Texas buildout.
- Capture: `../sources/official/11-openai-stargate-original-announcement.png`

### OpenAI, "Stargate advances with 4.5 GW partnership with Oracle"

- URL: https://openai.com/index/stargate-advances-with-partnership-with-oracle/
- Date: 22 July 2025
- Supports: 4.5 GW agreement, more than 5 GW under development, more than 2 million chips planned, parts of Abilene running early training and inference.
- Capture: `../sources/official/12-openai-stargate-early-workloads.png`

### OpenAI, Oracle, and SoftBank, "Five new AI data center sites"

- URL: https://openai.com/index/five-new-stargate-sites/
- Date: 23 September 2025, updated 22 October 2025
- Supports: nearly 7 GW planned capacity, more than $400 billion planned investment over three years, Abilene live on OCI, early training and inference workloads.
- Captures: `../sources/official/13-openai-stargate-five-sites-planned-vs-live.png`, `../sources/official/13b-openai-stargate-planned-capacity-claim.png`, `../sources/official/13c-openai-stargate-abilene-live-claim.png`

### Reuters, "OpenAI, Oracle deepen AI data center push..."

- URL: https://www.reuters.com/business/openai-oracle-deepen-ai-data-center-push-with-45-gigawatt-stargate-expansion-2025-07-22/
- Date: 22 July 2025
- Supports: independent reporting of the 4.5 GW agreement and more than 5 GW under development; notes undisclosed site and funding details at the time and records funding doubts.
- Capture: `../sources/official/16-reuters-stargate-4-5gw-expansion.png`

## Search captures and limits

Focused site searches were used to test whether OpenAI had a public page for Bel, Doug as a model codename, or GPT-6. They found no corporate disclosure matching those claims. Search indexes can miss pages, so this is not proof that an internal codename does not exist. It is evidence that the rumor should not be presented as publicly confirmed.

- Bel search: `../sources/official/01-focused-site-search-bel.png`
- Doug and Astra search: `../sources/official/02-focused-site-search-doug-astra.png`
- Doug-only search: `../sources/official/05-focused-site-search-doug.png`
- GPT-6 search: `../sources/official/06-focused-site-search-gpt-6.png`
- Anthropic/Astra compute allegation search: `../sources/official/14-search-anthropic-astra-compute-claim.png`

## Drafting guardrails

1. Attribute every Bel claim to `@synthwavedd`; do not write "reports say" or "OpenAI thinks."
2. Say "parameters," not tokens, when quoting the 10T claim.
3. Do not count Wccftech, reposts, Google summaries, or aggregator stories as independent sources when they point to the same post.
4. Keep "upcoming" separate from a launch window. OpenAI's later RL-pause disclosure makes a confident schedule especially weak.
5. Keep Stargate's commitment, planned capacity, capacity under development, and live workloads in separate columns or sentences.
6. Do not infer model lineage from available compute.
7. Do not turn AGI marketing language into a measurable threshold without a published definition and evaluation.
8. Do not state anything about Anthropic's internal readiness or compute position without named-source reporting or an Anthropic statement.
