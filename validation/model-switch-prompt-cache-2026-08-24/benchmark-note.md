# Local CLI Benchmark Note

Date: August 24, 2026 (WIB).

## Environment

- Claude Code: `2.1.233 (Claude Code)`
- Authentication: first-party OAuth (`oauth_token`), not an API key
- Fixture: `/tmp/claude-model-switch-benchmark.RcrM6X`
- Session ID: `68467e1e-2e4d-4bf7-999b-9057acad9422`
- Mode: `--safe-mode`, empty tool set, low effort, short fixed response

## Commands

```text
claude -p --safe-mode --system-prompt 'Respond exactly as requested. Do not use tools.' --tools '' --model opus --effort low --session-id 68467e1e-2e4d-4bf7-999b-9057acad9422 --output-format json 'Reply with exactly: cache probe one'

claude -p --safe-mode --system-prompt 'Respond exactly as requested. Do not use tools.' --tools '' --model sonnet --effort low --resume 68467e1e-2e4d-4bf7-999b-9057acad9422 --output-format json 'Reply with exactly: cache probe two'
```

## Observed result

The first command completed in one turn and returned `2,327` input tokens, `28` output tokens, `0` cache-creation tokens, and `0` cache-read tokens. Its model field resolved to the private routing identifier `qd/qmodel_38max`, not a public Opus model ID. The prefix was also too small to produce the intended warm-cache condition.

The resumed command failed before inference with HTTP 404. Claude Code reported an invalid combined model selection, `cc/claude-sonnet-5aqd/qmodel_38max`. Token counters remained zero.

## Decision

This was not a valid Opus-to-Sonnet benchmark. It supplies no evidence about cache rebuild size, latency, or break-even. The draft therefore uses the current first-party prices and documented cache behavior for an analytical example, clearly labels the exclusions, and makes no empirical model-switch claim.
