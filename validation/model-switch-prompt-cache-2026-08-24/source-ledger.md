# Source Ledger

Research cutoff: August 24, 2026, 23:59 WIB (UTC+7). All selected pages are direct or primary records except the independent systems paper. Each selected page has a browser-rendered capture at the listed path; S02 also has a bounded crop for the article payload.

| ID | Source | Role | Used claims | Limits / counterevidence | Capture |
|---|---|---|---|---|---|
| S01 | [Maximizing the value of your Claude Code sessions](https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions) | Primary product explanation | Prefill/decode, automatic caching, 0.1× reads, model/effort invalidation, TTL, cheap switching moments | Product guidance, not an independent benchmark; model names and defaults can change | `sources/s01-maximizing-claude-code-sessions.jpg` |
| S02 | [How Claude Code uses prompt caching](https://code.claude.com/docs/en/prompt-caching) | Primary technical documentation | Exact prefix behavior, model- and effort-specific caches, full-history miss, TTL by authentication, telemetry fields, `opusplan` switches | Describes current Claude Code, not all gateways or providers | `sources/s02-claude-code-prompt-caching.jpg`; publication crop `sources/s02-crop-model-switch-cache.jpg` |
| S03 | [Models, usage, and limits in Claude Code](https://support.claude.com/en/articles/14552983-models-usage-and-limits-in-claude-code) | Primary counterevidence and user guidance | Conversation survives a model switch; Opus-plan/Sonnet-execute is common; `/cost` applies to API billing | Help guidance does not price the cache rebuild or guarantee that switching wins | `sources/s03-help-models-usage-limits.jpg` |
| S04 | [Anthropic model and feature pricing](https://platform.claude.com/docs/en/about-claude/pricing) | Primary pricing record | Current Opus 5/Sonnet 5 rates, cache-write/read multipliers, TTL pricing | API prices do not map directly to subscription quota accounting; rates are time-sensitive | `sources/s04-anthropic-pricing.jpg` |
| S05 | [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) | Primary API mechanism | Exact prefix match, cache lifecycle, supported models, output unaffected by caching | Generic API behavior; Claude Code adds its own TTL and request construction | `sources/s05-platform-prompt-caching.jpg` |
| S06 | [Optimizing for cost and intelligence](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence) | Primary measured guidance | Cache reads dominate selected internal runs; 81–90% hit rate; 2.5–3.7× savings; effort invalidation | Anthropic labels the measurements directional, not guarantees | `sources/s06-optimizing-cost-intelligence.jpg` |
| S07 | [Lessons from building Claude Code: Prompt caching is everything](https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything) | Primary engineering account | 100k-token Opus-to-Haiku one-off example; “don't change models mid-session” rationale; handoff/subagent alternative | Strong product-team advice conflicts in tone with S03; the article reconciles them through remaining-turn break-even | `sources/s07-prompt-caching-is-everything.jpg` |
| S08 | [Claude Code commands](https://code.claude.com/docs/en/commands) | Primary command reference | `/model` warns because the next response re-reads history without cached context; `/clear`, `/compact`, `/usage` definitions | Command behavior is version-sensitive | `sources/s08-claude-code-commands.jpg` |
| S09 | [Prompt Cache: Modular Attention Reuse for Low-Latency Inference](https://arxiv.org/abs/2311.04934) | Independent technical background | Reusing attention states reduces prefill/TTFT; benefits increase with reusable context | Research prototype, not Anthropic's commercial cache and not a Claude Code cost study | `sources/s09-prompt-cache-paper.jpg` |
| M01 | Local Claude Code 2.1.233 probe on first-party OAuth | Method record, not article evidence | Establishes that a valid local paired benchmark was unavailable | Tiny uncached first turn; private routing ID; resumed switch failed 404 | `benchmark-note.md` |

## Source diversity

- Seven first-party Anthropic pages cover product behavior, command UX, pricing, API mechanics, measured internal guidance, and deliberately conflicting workflow advice.
- One independent systems paper supplies the general attention-reuse mechanism without being used to infer Anthropic billing.
- The key counterevidence is first-party and explicit: mid-session switching is supported, conversation history survives, and Opus planning followed by Sonnet execution is a common workflow.
- No social post, forum anecdote, or unverified cost screenshot is used for a numerical claim.

## Screenshot policy

Every selected external page must have a browser-rendered capture in `sources/` before the source gate passes. Only the bounded S02 crop is proposed for the article because it contains the exact model-specific cache statement, is directly attributable, and avoids account data. Final publication still needs the owner's normal rights review. Other captures remain private evidence.
