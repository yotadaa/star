# Experiment results

Run date: 24 August 2026. CLI: Claude Code 2.1.233. All calls ran in disposable Git fixtures outside the project repository.

## Result at a glance

| Arm | Boundary observed | Post-boundary repository reads | Visible test | Hidden F01–F10 | Terminal result |
|---|---:|---:|---:|---:|---|
| Forced auto-compact | Two auto summaries in the first preparation call | Not reached | Not run | No score | Call budget exhausted before a plan returned |
| Focused manual `/compact` | One manual summary; 14,044 pre-summary tokens to 5,051 after | 0 | Pass | 10/10 | Implementation files and tests completed; final prose hit the call cap |
| Isolated fresh session | New session, no prior chat state | 6 unique fixture files | Pass | 2/10 | Implemented a different public function; call cap then ended |
| Fresh + curated `HANDOFF.md` | New session with durable decisions | `HANDOFF.md` + 6 fixture files | Pass | 10/10 | Implementation files and tests completed; final prose hit the call cap |

The auto arm has no quality score. It is not counted as a failed implementation.

## Exact runner shape

Each prompt was sent through Claude Code print mode from its arm directory with JSON output, the same account default model and `medium` effort, safe mode, Chrome disabled, no MCP config, and a fixed role-appropriate tool allowlist. The labels `"$PHASE_ONE"`, `"$CRITIQUE"`, `"$CHECKLIST"`, `"$IMPLEMENT"`, and `"$HANDOFF_IMPLEMENT"` below stand only for the exact quoted prompt bodies already recorded in `experiment-protocol.md`.

The automatic arm used:

```sh
cd /tmp/claude-compact-bench.JRftRD/auto
CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=5 \
claude -p --safe-mode --no-chrome --effort medium --autocompact 100k \
  --allowedTools "Read Glob Grep Bash" --permission-mode acceptEdits \
  --output-format json --max-budget-usd 0.50 "$PHASE_ONE"
```

The manual arm used five invocations:

```sh
cd /tmp/claude-compact-bench.JRftRD/manual
claude -p --safe-mode --no-chrome --effort medium \
  --allowedTools "Read Glob Grep Bash" --permission-mode acceptEdits \
  --output-format json --max-budget-usd 0.75 "$PHASE_ONE"

claude -p --safe-mode --no-chrome --effort medium --tools "" \
  --resume 39283b15-0016-4d92-99f1-0bca85a782c7 \
  --output-format json --max-budget-usd 0.25 "$CRITIQUE"

claude -p --safe-mode --no-chrome --effort medium --tools "" \
  --resume 39283b15-0016-4d92-99f1-0bca85a782c7 \
  --output-format json --max-budget-usd 0.25 "$CHECKLIST"

claude -p --safe-mode --no-chrome --effort medium --tools "" \
  --resume 39283b15-0016-4d92-99f1-0bca85a782c7 \
  --output-format json --max-budget-usd 0.25 \
  "/compact focus on the agreed F01-F10 delivery-brief decisions, approved output shape, accounting rule, rejected alternatives, files, and verification plan"

claude -p --safe-mode --no-chrome --effort medium \
  --resume 39283b15-0016-4d92-99f1-0bca85a782c7 \
  --allowedTools "Read Write Edit Bash Glob Grep" --permission-mode acceptEdits \
  --output-format json --max-budget-usd 0.75 "$IMPLEMENT"
```

The valid isolated fresh and curated-handoff implementation calls used:

```sh
cd /tmp/cc-fresh-isolated.R6QgVH
claude -p --safe-mode --no-chrome --effort medium \
  --allowedTools "Read Write Edit Bash Glob Grep" --permission-mode acceptEdits \
  --output-format json --max-budget-usd 0.50 "$IMPLEMENT"

cd /tmp/claude-compact-bench.JRftRD/handoff
claude -p --safe-mode --no-chrome --effort medium \
  --allowedTools "Read Write Edit Bash Glob Grep" --permission-mode acceptEdits \
  --output-format json --max-budget-usd 0.75 "$HANDOFF_IMPLEMENT"
```

Final visible and hidden checks used `npm test` in each implemented fixture and:

```sh
node /tmp/claude-compact-bench.JRftRD/verify.mjs /tmp/claude-compact-bench.JRftRD/manual
node /tmp/claude-compact-bench.JRftRD/verify.mjs /tmp/cc-fresh-isolated.R6QgVH
node /tmp/claude-compact-bench.JRftRD/verify.mjs /tmp/claude-compact-bench.JRftRD/handoff
```

The session IDs below are local benchmark identifiers, not credentials:

- auto: `4a8645a5-1af4-4772-9fd8-e76672007e8b`
- manual: `39283b15-0016-4d92-99f1-0bca85a782c7`
- isolated fresh: `b5d32d83-4c91-49d4-b021-e9be73374d9f`
- handoff: `d74110a5-839b-454b-8c34-b402a4cb5f5e`

The fixed prompts and boundary treatment are preserved in `experiment-protocol.md`. Phase-one resumed calls used the existing session ID; phase two used either that session or a newly started session exactly as specified by the arm.

## Token, cost, and time telemetry

| Arm | Reported input tokens | Reported output tokens | Cache read / create | Reported cost | Wall time | Reported turns |
|---|---:|---:|---:|---:|---:|---:|
| Forced auto | 86,479 | 5,509 | 0 / 0 | $0.570120 | 88.832 s | 11 |
| Manual, five CLI invocations | 265,160 | 15,203 | 0 / 0 | $1.705875 | 280.963 s | 19, excluding compact summary request |
| Isolated fresh | 100,497 | 1,208 | 0 / 0 | $0.532685 | 29.805 s | 8 |
| Handoff | 149,724 | 3,446 | 0 / 0 | $0.834770 | 123.293 s | 13 |

These totals are operational records, not a model-pricing comparison. The account resolved every call to the non-public route `qd/qmodel_38max[1m]`. All calls reported zero cache reads and writes, so this environment cannot measure Anthropic prompt-cache savings or the cache cost of model hopping.

## Boundary telemetry

### Forced automatic compaction

The 5% override produced two automatic summaries during the first preparation turn:

| Boundary | Pre-summary tokens | Post-summary tokens | Dropped at boundary | Summary duration |
|---|---:|---:|---:|---:|
| 1 | 16,457 | 2,479 | 13,978 | 30.870 s |
| 2 | 16,849 | 3,132 | 13,717 | 42.373 s |

Cumulative removed active history was 27,695 tokens. The resulting summaries contained all literal identifiers F01–F10, but the call budget ended before a plan or implementation returned. This demonstrates an edge case created by the low threshold, not a default-product failure and not a quality verdict.

### Focused manual compaction

The manual boundary reduced 14,044 pre-summary tokens to 5,051, a reduction of 8,993. The requested focus was the agreed F01–F10 decisions, output shape, accounting rule, rejected alternatives, files, and verification plan. The summary retained every checklist identifier.

After that boundary, the implementation turn used Write, Edit, and Bash but no Read, Grep, Glob, or shell file-read operation. It modified `src/brief.js`, `src/index.js`, and `test.mjs`. The visible suite passed and the strengthened hidden verifier scored 10/10.

### Isolated fresh session

The fresh prompt contained only the instruction to implement the already-agreed delivery brief. Because the new session had no access to that agreement, it read six fixture files and inferred a different API named `deliveryBrief(raw)`. The visible baseline still passed, but the hidden checker scored only F08 and F10: 2/10. This result tests missing chat-only requirements, not a fresh session given a complete new prompt.

A first fresh-session trial was excluded before scoring because its working directory allowed the agent to discover the hidden verifier in a sibling path. The corrected arm used a separate isolated parent directory where the verifier was not discoverable.

### Fresh session plus handoff

The new session read the benchmark-authored `HANDOFF.md` and six fixture files. It modified `src/brief.js`, `src/index.js`, and `test.mjs`; visible tests passed and the strengthened verifier scored 10/10. It first attempted an irrelevant `/Users/user/HANDOFF.md` path, then read the correct local file. The handoff was curated from the fixed checklist, so this arm measures state transfer through a good handoff, not handoff-writing quality.

## Verifier correction

The contaminated fresh trial revealed that the first hidden checker did not enforce several pre-registered rules tightly enough. Before scoring the valid comparison, the checker was strengthened to enforce the existing F02, F03, F05, and F06 definitions, and F08 was made independent of the new function. No decision was added or changed. The manual and handoff fixtures were rerun against the strengthened checker and remained 10/10; the corrected isolated fresh arm scored 2/10.

## What survived

| Decision group | Auto summary | Manual summary + implementation | Fresh | Handoff |
|---|---|---|---|---|
| Literal F01–F10 identifiers | Present in summaries | Present | Absent | Present in file |
| Approved `{ headline, items }` shape | Summary only; not implemented | Passed | Failed | Passed |
| UTC-day and same-day rule | Summary only; not implemented | Passed | Failed | Passed |
| Attention and stable ordering | Summary only; not implemented | Passed | Failed | Passed |
| Exact headline and accounting | Summary only; not implemented | Passed | Failed | Passed |
| Existing formatter and no dependencies | Unchanged fixture | Passed | Passed | Passed |

## Interpretation and limits

1. A focused summary was sufficient for this small decision-heavy fixture. It was not lossless, but the hidden checker found no lost acceptance decision.
2. A curated handoff produced the same 10/10 outcome and made the transferred state inspectable before the new session began.
3. A fresh session cannot reconstruct chat-only decisions from an unchanged repository. That result favors writing decisions down, not keeping every task in one endless session.
4. Automatic compaction remains inconclusive here. The artificial 5% trigger changed the workload itself and exhausted the budget before implementation.
5. One run per arm, a tiny proxy, a non-public route, no useful cache telemetry, and a strengthened checker after a contaminated trial rule out broad quality or cost claims.
