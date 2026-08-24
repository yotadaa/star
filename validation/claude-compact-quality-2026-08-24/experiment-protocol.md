# Experiment protocol

Protocol fixed before execution on 24 August 2026.

## Question

In a small proxy for a long, multi-file coding task, how much agreed state survives four session-boundary strategies: automatic compaction, manual `/compact`, a fresh session, and a fresh session supplied with an explicit handoff document?

## Scope and stop rule

- CLI: Claude Code 2.1.233, authenticated subscription session.
- Model: the account's unchanged default model for every arm. The CLI resolves it as `qd/qmodel_38max[1m]`; this non-public account route must not be treated as a public Anthropic model name.
- Effort: `medium` for every model call.
- Customization: `--safe-mode`, `--no-chrome`, no MCP configuration, fixed built-in tool allowlist.
- Fixture: a disposable `mktemp -d` ESM Git repository. No benchmark call runs inside the project repository.
- Budget: at most four preparation turns plus one implementation turn per arm, one manual compact request where applicable, and no retry after a completed implementation.
- Auto-compact arm: one attempt with a 100K auto-compact window and the documented percentage override lowered to 5%. If no automatic compact boundary appears, the arm is reported as not triggered; no large filler loop follows.
- This is a controlled proxy, not a multi-hour production benchmark and not a statistical estimate of Claude Code quality.

## Seed fixture

The fixture contains `src/format.js`, `src/normalize.js`, `src/index.js`, a baseline test, a README, and no dependencies. Each arm starts from an identical Git commit copied from the same seed.

The hidden verifier stays outside every fixture. Agents can run the visible baseline test but cannot inspect the acceptance implementation.

## Fixed decisions supplied in the first session

| ID | Decision or fact | Verification |
|---|---|---|
| F01 | Export only `buildDeliveryBrief`, `formatTrackingId`, and `normalizeShipment`. Keep helpers private. | Exact exported-key set |
| F02 | Sort attention items first, then `high > normal > low`, preserving input order on ties. | Exact output order |
| F03 | Compare ETA against the UTC calendar day of `asOf`; normalize displayed ETA to its UTC `YYYY-MM-DD` date. A same-day ETA is not overdue. | Offset and same-day cases |
| F04 | Render an absent ETA as `pending`; it is never overdue by absence alone. | Pending item fields |
| F05 | Mark both exceptions and overdue in-transit records for attention. | Exception record |
| F06 | Use the exact headline format `<n> in transit · <n> overdue · <n> exception`. | Exact string |
| F07 | Do not mutate the input array or records. | Deep comparison |
| F08 | Preserve the existing tracking-ID formatter behavior. | Existing function assertion |
| F09 | Reject any other status with `RangeError("Unsupported shipment status: <status>")`. | Error type and message |
| F10 | Add no runtime or development dependency. | Package manifest |

Allowed statuses are `in_transit`, `delivered`, and `exception`. The phase-one prompt also states that exception rows count separately from in-transit rows and that only in-transit rows can be overdue.

## Common phase-one conversation

1. Inspect the repository and produce an implementation plan for the supplied decisions. Do not edit files.
2. Critique two tempting mistakes: local-time ETA comparison and sorting by status labels. Restate the correct decisions. Do not edit files.
3. Return a numbered acceptance checklist keyed F01–F10. Do not edit files.

## Boundary treatments

| Arm | Boundary after phase one | Phase-two input |
|---|---|---|
| Auto-compact | Low threshold attempts to trigger Claude Code's automatic summary during the fixed phase-one conversation. | “Implement the agreed delivery brief now. Run the visible tests.” |
| Manual compact | `/compact focus on the agreed F01-F10 delivery-brief decisions, rejected alternatives, files, and verification plan` | Same implementation prompt |
| Fresh | Discard the phase-one session and start a new session in the unchanged fixture. | Same implementation prompt, with no restated requirements |
| Handoff | Ask the phase-one session to write `HANDOFF.md` with the agreed F01–F10 decisions, rejected alternatives, file plan, and checks; then start a fresh session. | Read `HANDOFF.md`, implement the agreed delivery brief, and run visible tests |

## Measurements

- Claude result JSON: session ID, total calls, reported input/cache-creation/cache-read/output tokens, model route, wall time, and tool-denial count.
- Transcript: whether an `isCompactSummary` boundary appears, compact trigger where available, and file-read tool calls after the boundary.
- Repository: changed files, visible test result, hidden verifier score, exact F01–F10 pass vector, and whether a handoff file exists.
- Interpretation: one arm cannot establish a general quality rate. Differences describe this fixture and CLI build only.

## Protocol amendment recorded before the handoff arm

The 5% auto-compact setting triggered twice inside the first phase-one CLI call and exhausted the fixed call budget before it returned a plan. The run remains the auto-compact result; no larger filler loop or retry was added.

The unchanged phase-one conversation was not replayed for the fresh arm because its fixture had no phase-one edits and the fresh implementation call cannot observe a discarded session. Replaying it would spend quota without changing that arm's input.

For the handoff arm, the benchmark author wrote a fixed `HANDOFF.md` directly from the pre-registered F01–F10 table instead of asking another paid session to paraphrase the same table. This narrows the comparison: it tests a curated durable handoff, not Claude's ability to author one. The deviation avoids another identical three-turn preparation run and is carried into the results as a limit.
