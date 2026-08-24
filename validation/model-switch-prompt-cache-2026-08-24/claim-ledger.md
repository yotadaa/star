# Claim Ledger

Research cutoff: August 24, 2026, 23:59 WIB (UTC+7).

| ID | Claim | Type | Support | Confidence | Draft treatment |
|---|---|---|---|---|---|
| C01 | Claude Code re-sends the full context on every turn because the model does not retain state between requests. | fact | [Claude Code caching docs](https://code.claude.com/docs/en/prompt-caching) | high | State directly. |
| C02 | Prompt caching reuses an exact request prefix so unchanged history is billed and processed differently from new content. | fact | [Claude Platform docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), [Prompt Cache paper](https://arxiv.org/abs/2311.04934) | high | State with implementation boundary. |
| C03 | Each Claude model has its own cache; switching models causes the next request to read the entire conversation with no cache hits. | fact | [Claude Code caching docs](https://code.claude.com/docs/en/prompt-caching), [Maximizing sessions](https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions) | high | Core claim. |
| C04 | Changing `/effort` mid-session has the same full-history cache consequence because effort is part of the cache key. | fact | [Claude Code caching docs](https://code.claude.com/docs/en/prompt-caching), [Maximizing sessions](https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions) | high | Treat as a parallel case, not the main headline. |
| C05 | Switching models does not clear the conversation, and Anthropic calls Opus planning followed by Sonnet execution a common pattern. | counterevidence | [Help Center](https://support.claude.com/en/articles/14552983-models-usage-and-limits-in-claude-code) | high | Put near the thesis so the article does not imply “never switch.” |
| C06 | Anthropic currently prices five-minute cache writes at 1.25 times base input, one-hour writes at 2 times, and cache reads at 0.1 times. | fact | [Pricing docs](https://platform.claude.com/docs/en/about-claude/pricing) | high | State with date and provider scope. |
| C07 | Current Claude API rates list Opus 5 at $5 input, $6.25 five-minute cache write, $10 one-hour write, $0.50 cache read, and $25 output per MTok; Sonnet 5 is $2, $2.50, $4, $0.20, and $10 respectively. | fact | [Pricing docs](https://platform.claude.com/docs/en/about-claude/pricing) | high | Use in table; label USD per MTok and cutoff date. |
| C08 | For a 100,000-token warm prefix under five-minute API caching, the prefix-only next-turn cost is $0.05 on Opus 5 versus $0.25 when switching and writing it for Sonnet 5. | calculation | C03, C06, C07 | high | Show arithmetic and exclusions. |
| C09 | Under the same five-minute prefix-only assumptions, staying on Opus costs `0.05N`, while switching to Sonnet costs `0.25 + 0.02(N−1)` for `N` requests; switching first becomes cheaper at request 8. | calculation | C03, C06, C07 | high | Main break-even example. |
| C10 | With the one-hour write rate, the same 100,000-token prefix-only comparison first favors the switch at request 13. | calculation | C03, C06, C07 | high | Present as sensitivity check. |
| C11 | New uncached input and generated output favor the cheaper model immediately, while differences in output length, reasoning effort, capability, and retries can move the real break-even in either direction. | inference | [Pricing docs](https://platform.claude.com/docs/en/about-claude/pricing), [Optimizing cost and intelligence](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence) | medium-high | State as a workload-dependent correction, not a measured result. |
| C12 | A switch after cache expiry has lower opportunity cost because staying on the old model also cannot reuse the expired prefix. | inference | [Claude Code caching docs](https://code.claude.com/docs/en/prompt-caching) | high | Recommend switching at session start, after `/clear`, at a compaction boundary, or after expiry if a switch is already justified. |
| C13 | The `opusplan` setting intentionally changes models between planning and execution, and each toggle starts a fresh cache. | fact | [Claude Code caching docs](https://code.claude.com/docs/en/prompt-caching), [Help Center](https://support.claude.com/en/articles/14552983-models-usage-and-limits-in-claude-code) | high | Explain why the pattern can still win: early/small rebuild and many later execution turns. |
| C14 | Anthropic says a one-off easy question at 100,000 tokens can cost more on Haiku after a switch than on Opus with its existing cache. | attributed example | [Prompt caching is everything](https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything) | high | Attribute and use as a concrete sanity check. |
| C15 | Anthropic's measured agent runs achieved 81% to 90% cache hit rates and 2.5 to 3.7 times cost reductions, but those internal workloads are directional rather than guarantees. | bounded first-party measurement | [Optimizing cost and intelligence](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence) | medium-high | Cite as evidence that cache economics can dominate; retain the internal/benchmark boundary. |
| C16 | The local Claude Code probe did not produce a valid Opus-to-Sonnet benchmark. | method result | `benchmark-note.md` | high | Disclose near the end; do not turn failed telemetry into evidence. |

## Break-even derivation

Let `H` be the already-cached prefix in millions of tokens, `P_o` the old model's base input price, `P_s` the new model's base input price, `w` the cache-write multiplier, `r` the cache-read multiplier, and `N` the number of requests made on the new model including the switch request.

- Stay on the old model: `C_stay = N × r × P_o × H`
- Switch models: `C_switch = [w × P_s + (N − 1) × r × P_s] × H`
- Break-even: `N ≥ ((w − r) × P_s) / (r × (P_o − P_s))`

For Opus 5 to Sonnet 5 with current prices, `P_o = 5`, `P_s = 2`, and `r = 0.1`:

- Five-minute write (`w = 1.25`): `N ≥ 7.67`, so the first whole-request break-even is 8.
- One-hour write (`w = 2`): `N ≥ 12.67`, so the first whole-request break-even is 13.

The prefix size `H` cancels from the turn count only because both paths are compared over the same stable prefix. It still controls the absolute dollar difference. The derivation excludes new uncached input, generated output, tool charges, retries, batch or regional modifiers, and quality differences.

## Claim exclusions

- No claim that users should never switch models.
- No claim that subscription quota units equal API dollars one for one.
- No claim that Sonnet produces the same amount or quality of work as Opus on every task.
- No claim that the local CLI probe measured a cache rebuild.
- No extension of Anthropic's model-specific cache behavior to every model provider.
