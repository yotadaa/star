# Claim Ledger

| ID | Proposed claim | Evidence | Status / boundary |
|---|---|---|---|
| C01 | Issue `#84750` was opened 7 August 2026 and alleges much faster token consumption with no workflow change. | S01 | Direct report; allegation only. |
| C02 | The issue gives no last-working version or raw telemetry and its version field mixes model names and numbers. | S01 | Direct inspection. |
| C03 | Three principal references named by `#84750` were opened on 10 December 2025 against version 2.0.64. | S03, S04, S05 | Direct dates/version fields; weakens the claimed 2026 cluster. |
| C04 | Issue `#82863` recorded recurring near-doubling of reported main-chain usage and a final 1,364,156-token pre-compact reading on a 1M model while stable readings were around 335K. | S02 | Detailed user telemetry; not independently reproduced here. |
| C05 | A prompt larger than the active model window cannot be the real active context, making that reading evidence of an accounting/display artifact. | S02 | Logical inference from the reporter's 1M window and accepted 318K–335K requests. |
| C06 | Anthropic distinguishes usage limits from conversation length limits; model, effort, conversation complexity, features, and usage across product surfaces affect plan usage. | S06 | First-party current guidance. |
| C07 | In Claude Code, every turn carries the prior conversation and read project context; long sessions therefore make later turns heavier. | S07 | First-party current guidance. |
| C08 | Prompt-cache reuse depends on an exact prefix; switching model or effort, changing loaded tools, compacting, and upgrading can create cold turns. | S08 | First-party current guidance. |
| C09 | Cache read and creation counters are the direct diagnostic signals; repeated creation suggests a changing prefix. | S08 | First-party current guidance. |
| C10 | MCP tool search defers full definitions by default, but server instructions/names still load and large tool outputs can add substantial context. | S09 | First-party current guidance. |
| C11 | Claude Code 2.1.222 fixed `/usage` overattributing usage to MCP servers after any call; this was an attribution defect, not stated as total-quota overcharging. | S10 | Official changelog plus bounded inference. |
| C12 | `/context` shows startup material and accumulated reads; a subagent can isolate large research reads from the main session. | S11 | First-party current guidance. |
| C13 | No selected source demonstrates a universal, undisclosed reduction in Claude Code subscription allowances in July–August 2026. | S01–S11 | Negative finding limited to the selected evidence set. |
| C14 | A valid comparison must hold version, model, effort, authentication path, MCP set, task, and session state constant while recording both plan and cache/context signals. | S06–S11 | Synthesis and proposed diagnostic protocol. |

## Rejected or downgraded claims

- `Claude Code started charging everyone more in mid-July`: rejected; no controlled or official evidence.
- `MCP servers always consume a large fixed prompt`: rejected; current tool search defers full definitions by default.
- `The 1,364,156 reading proves subscription overbilling`: rejected; the issue documents auto-compact/context accounting, not plan-meter debits.
- `Auto-compact is the cause of the broad usage reports`: rejected; one detailed issue shows a compaction trigger artifact, while the broad report supplies no matching telemetry.
- `No bug exists because long sessions are expensive`: rejected; official changelog entries and detailed reports show real defects can coexist with expected usage mechanics.
