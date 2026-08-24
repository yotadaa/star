# Assignment: Does `/compact` Secretly Make Claude Code Worse?

- Working question: Does Claude Code compaction reduce task quality, and when should a long task continue through `/compact` versus restart with `/clear`, a fresh session, or a written handoff?
- Article form: Evidence-based investigation with a bounded local experiment.
- Intended reader: Claude Code users who work through long coding sessions and need a practical session-management rule.
- Language and voice: English (`en-US`), warm third-person narration, no first- or second-person narration outside short source titles, UI labels, or quotations.
- Research cutoff: 24 August 2026, 23:59 Asia/Jakarta (UTC+7).
- Direct artifact: Local authenticated Claude Code CLI 2.1.233, exercised only inside disposable `mktemp -d` Git fixtures.
- Experimental scope: Four small proxy arms, fixed model and effort where the CLI exposes them, identical seeded fixture state, fixed verifier, fixed hidden-fact and decision checklist, and a bounded turn budget.
- Output: Research package, experiment record, English draft, and native-block draft payload only.
- Publishing system: Repository-native Convex Blog blocks with inline Markdown links; `AI Investigation` section.
- Author: Mukhtada Billah NST (`https://me.mukhtada.my.id/#person`, canonical profile `https://me.mukhtada.my.id/`).
- Primary source: [Anthropic Support: Models, usage, and limits in Claude Code](https://support.claude.com/en/articles/14552983-models-usage-and-limits-in-claude-code).
- Media: One newly generated original feature illustration plus one bounded, attributed first-party source-evidence capture in the draft payload. Other web captures remain private research material.
- Reader action: Match session boundaries to task boundaries, preserve durable decisions in a handoff file, and compare later Claude Code releases against the experiment protocol.
- Explicit exclusions: No shared manifest or publisher edits, no Convex mutation, no repository benchmark fixture, no publication, no commit, and no push.

## Research questions

1. What does Claude Code retain or discard when compaction occurs?
2. What does Anthropic currently recommend for `/compact` and `/clear`?
3. How do compact instructions, auto-compaction, prompt caching, and version changes affect the claim?
4. Which failure reports exist in GitHub or public social sources, and what do they actually prove?
5. In a small reproducible proxy, which facts, decisions, files, and verifier outcomes survive manual compaction, a fresh session, and a handoff-assisted fresh session?
6. Can auto-compaction be triggered and measured without an unreasonable quota burn?

## Research Gate

Passed on 24 August 2026. Official behavior and task-boundary guidance are verified from Anthropic sources, community counterevidence is explicitly anecdotal, the protocol was fixed before the valid comparison, and each central pro/con claim maps to the claim ledger. Publication remains blocked pending final review of the bounded first-party evidence capture and the normal repository publish gates.
