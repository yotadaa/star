# Terminology ledger

Research cutoff: 24 August 2026, Asia/Jakarta.

| Term | Working definition | Boundary used in the article |
|---|---|---|
| context window | The active token budget available to the model for the current request, including the conversation, tool results, instructions, and output allowance. | It is not the same as the transcript stored on disk. |
| transcript | Claude Code's local record of messages and tool activity for a session. | Old entries can remain in the transcript even when they are no longer included verbatim in the active model context. |
| `/compact` | A manual Claude Code command that replaces the active conversation with a structured summary, optionally guided by focus instructions. | It is a continuation mechanism for the same task, not a lossless archive. |
| auto-compaction | Claude Code initiating the same summary boundary when the configured context threshold is reached. | The benchmark forced an unusually low 5% threshold. That arm does not represent the product default. |
| `/clear` | A command that starts a new empty conversation while leaving project files and project instructions on disk. | Anthropic recommends it between distinct tasks. It cannot restore chat-only decisions unless they were written elsewhere. |
| fresh session | A newly started Claude Code session in the same fixture with no previous chat state. | It is operationally similar to `/clear` for this proxy, but the benchmark used a separate session rather than testing the literal command. |
| handoff document | A durable file containing decisions, rejected alternatives, file targets, and acceptance checks for a later session. | The benchmark-author wrote the fixed handoff from the pre-registered checklist. It did not test Claude's ability to write the handoff. |
| prompt cache | Provider-side reuse of an unchanged prompt prefix. | Anthropic says compaction replaces the conversation, so the old prefix no longer matches. Local calls reported zero cache reads and writes, so the benchmark cannot measure cache economics. |
| compact summary | The structured replacement context produced at a manual or automatic compaction boundary. | The summary is selective by design. A pass in one coding fixture does not prove that all evidence or reasoning survives. |
| path-scoped rule | A Claude Code rule or nested `CLAUDE.md` loaded only when a matching file path is read. | Official context documentation says these rules are absent after compaction until the relevant file is read again. |
| direct observation | A result measured in the disposable local fixtures, transcripts, or verifier. | Reported with CLI build, account route, turn cap, and one-run limit. |
| user report | A public GitHub, Reddit, X, or Threads claim from a user. | It is counterevidence or a failure report, not confirmation of product-wide behavior. |
| quality | Compliance with the fixed F01–F10 decision checklist in this proxy. | It does not include subjective code style, long-term maintainability, or a multi-hour production workload. |
