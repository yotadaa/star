# Terminology Ledger

| Term | Meaning in this article | Do not conflate with |
|---|---|---|
| Usage limit | A plan-level allowance over a rolling or weekly period, shared across supported Claude surfaces for Pro/Max users. | A single conversation's context-window capacity. |
| Length limit / context window | The maximum active information a model can consider in one conversation. | Subscription quota or API billing. |
| `/usage` | Claude Code's usage display and attribution surface. | A raw, audited invoice of every prompt token. |
| `/context` | The current session's context composition and occupancy display. | The plan-level remaining usage percentage. |
| Prompt cache | Server-side reuse of an exact request prefix; read and creation tokens expose its behavior. | Model memory or a saved transcript. |
| Cache miss | A request prefix could not reuse the prior cached prefix and must be processed again. | Proof of incorrect billing. |
| Auto-compact | Automatic replacement of older conversation history with a shorter summary near the context threshold. | `/clear`, which starts a new conversation. |
| MCP overhead | Tool names/server instructions at startup plus full schemas and tool outputs when loaded or used. | A fixed cost for every configured server; tool search defers most schemas by default. |
| Reported regression | A user says a previously stable behavior changed. | A confirmed software regression with an isolated first-bad version. |
| Subscription authentication | Claude Code signed in to a Claude plan. | API-key authentication, which is pay-as-you-go and exposes `/cost`. |

## Ambiguities resolved

- Issue `#84750` lists a mid-July to early-August 2026 onset but supplies no last-working version, no raw log, and a malformed mixed model/version field. It is treated as a lead, not a measured result.
- Three linked issues—`#13552`, `#13536`, and `#13551`—were opened on 10 December 2025 against Claude Code 2.0.64. They cannot independently confirm a July–August 2026 regression.
- Issue `#82863` documents a context/auto-compaction accounting artifact. It does not show that the subscription quota meter charged 1,364,156 tokens.
- Claude Code 2.1.222 fixed `/usage` attribution to MCP servers. The changelog wording concerns the server share shown by `/usage`, not the total plan allowance.
