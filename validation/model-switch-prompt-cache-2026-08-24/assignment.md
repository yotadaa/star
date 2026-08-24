# Assignment: Changing Your AI Model Mid-Session Can Cost More Than Staying on the Expensive Model

- Reader question: When does a mid-session model switch save money, and when does the cache rebuild make the cheaper model the more expensive immediate choice?
- Intended reader: Claude Code users and agent builders who know how to change models but have not priced the prompt-cache boundary.
- Article form: evidence-backed technical explainer with a bounded cost model.
- Language: English (`en-US`).
- Point of view: warm third-person narration; no first- or second-person narration outside source titles, commands, or short quotations.
- Research cutoff: August 24, 2026, 23:59 WIB (UTC+7).
- Output: research package, Markdown draft, and native-block draft payload. No publication, Convex mutation, commit, or push.
- Publishing system: this repository's Convex Blog schema and native blocks.
- Citation style: descriptive Markdown links beside the supported claim.
- Primary source (`sourceHref`): https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions
- Author: Mukhtada Billah NST, https://me.mukhtada.my.id/#person, https://me.mukhtada.my.id/
- Article section: `Research Note`.
- Draft status: `draft`; no publication date is asserted.
- Proposed slug: `changing-ai-model-mid-session-cost`
- Proposed SEO title: `When Switching Claude Models Mid-Session Costs More`
- Proposed SEO description: `A cache-aware break-even model shows when an Opus-to-Sonnet switch saves money, when it costs more, and why preserving a conversation does not preserve its cache.`
- Media ownership: one original generated feature illustration may enter the payload. One bounded Anthropic documentation capture is proposed as source evidence, subject to final rights review. Other third-party captures remain private research evidence.
- Reader action: estimate the cached prefix and expected remaining turns before changing model or effort, then measure cache creation and cache reads on the actual provider.

## Research questions

1. Does Claude Code preserve conversation history when `/model` changes?
2. Does that preserved history retain a prompt-cache hit on the new model?
3. What are the current Opus 5 and Sonnet 5 cache-write, cache-read, input, and output rates?
4. How many Sonnet turns are required to recover one Opus-to-Sonnet cache rebuild under a prefix-only model?
5. When does the official “plan with Opus, execute with Sonnet” pattern still make economic sense?
6. How do cache TTL, output length, new uncached input, model quality, provider, and effort level change the answer?
7. Can the local Claude Code installation produce a valid controlled Opus-to-Sonnet telemetry pair?

## Disproof conditions

The headline would fail if a model switch retained cache hits on an identical conversation, if cache writes carried no premium, or if the cheaper model's immediate savings necessarily exceeded the rebuild cost. None of those conditions held in the selected first-party sources. The stronger claim that switching is generally wasteful would also fail, and the official Help Center supplies the counterexample: an early Opus planning phase followed by many Sonnet execution turns can be a rational and supported workflow.

## Research Gate decision

**Passed on August 24, 2026.** Anthropic's Claude Code caching documentation states that each model and effort level has its own cache and that a switch re-reads the entire conversation with no cache hits. Anthropic's pricing documentation supplies the current write/read multipliers and model rates. The Help Center confirms that the conversation itself survives a switch and recommends Opus planning followed by Sonnet execution as a common pattern. These claims support a conditional break-even analysis, not a universal instruction to avoid switching.

The local benchmark gate did not pass. Claude Code 2.1.233 was authenticated through first-party OAuth. A tiny Opus probe returned JSON telemetry but resolved to a non-public routing identifier and produced no cacheable prefix. The resumed Sonnet call failed with a model-selection 404. No empirical Opus-to-Sonnet result is claimed.

## Boundary sentence

A mid-session switch preserves the transcript but not the model-specific cache; whether it costs more overall depends on the cached prefix, cache TTL, remaining turns, new input, output length, provider pricing, model quality, and whether the old cache was still warm.
