# Claim ledger

| ID | Draft claim | Type | Support | Status / boundary |
|---|---|---|---|---|
| C01 | Anthropic recommends `/compact` for continuing the same long task and `/clear` between distinct tasks. | Current product guidance | S01, S02, S04 | Verified first-party. |
| C02 | `/compact` replaces the active conversation with a structured summary rather than retaining the complete history verbatim in model context. | Current product behavior | S02, S03 | Verified first-party. Do not say the on-disk transcript is deleted. |
| C03 | Root project instructions and memory can be re-injected after compaction, while path-scoped rules and nested instructions may be absent until matching files are read again. | Current product behavior | S03 | Verified first-party. |
| C04 | Compaction changes the prompt prefix, so the old cached conversation prefix no longer matches. | Current cache behavior | S02 | Verified first-party. Local cache counters cannot validate the economics. |
| C05 | Manual and automatic compaction are observable through hooks, and threshold controls exist. | Current product behavior | S05, S06 | Verified first-party. |
| C06 | Compaction behavior has changed across releases, including thinking inheritance in 2.1.198 and an apps-gateway fix in 2.1.233. | Release history | S07 | Verified first-party. The local build was 2.1.233. |
| C07 | In the local proxy, focused manual compaction dropped 8,993 pre-summary tokens, preserved all F01–F10 identifiers, then produced a 10/10 verifier result without a post-boundary file reread. | Direct observation | Experiment transcripts and verifier; `experiment-results.md` | Verified for one fixture and one run. |
| C08 | The curated handoff arm also scored 10/10 after reading the handoff and six repository files. | Direct observation | Experiment transcript and verifier | Verified for one fixture and one run. The handoff was benchmark-authored. |
| C09 | The isolated fresh session without requirements scored 2/10 because it could not reconstruct the chat-only API and business decisions. | Direct observation | Experiment transcript and verifier | Verified for one fixture and one run. It is not a test of a fresh session supplied with a complete prompt. |
| C10 | The forced auto arm compacted twice inside one phase-one turn, then exhausted the call cap before implementation. | Direct observation | Auto transcript | Verified local result, but inconclusive on quality and unlike the default threshold. |
| C11 | The benchmark's model route and zero cache counters prevent a fair comparison of public Claude models or prompt-cache savings. | Method limit | Result JSON; `experiment-results.md` | Verified limitation. Route `qd/qmodel_38max[1m]` is non-public and must not be marketed as a Claude model name. |
| C12 | Public users have reported lost decisions, early or missing auto-compaction, large-session connection failures, and poor access to pre-compact history. | Community counterevidence | S08–S12, S14 | Verified as reports only. No prevalence or causal claim. |
| C13 | The experiment does not show that `/compact` secretly makes Claude Code worse; it shows that task state has to survive either in the focused summary or in durable files. | Synthesis | C01–C12 | Supported inference, labeled as the article thesis rather than a universal result. |

## Research Gate decision

Passed for drafting. Central behavior claims have first-party support, counterevidence is bounded, and the direct experiment has a fixed checklist, disclosed amendments, and a one-run limit. Both required visuals are recorded in the ledger and payload. Publication remains blocked by the source-capture rights review and the repository's normal storage, render, and publish gates.
