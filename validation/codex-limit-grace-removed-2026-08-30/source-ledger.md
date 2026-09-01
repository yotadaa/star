# Source Ledger

Research cutoff: 30 August 2026, 23:59 Asia/Jakarta.

| ID | Source | URL | Role | Capture | Use / boundary |
|---|---|---|---|---|---|
| S01 | OpenAI Help, “Using Codex with your ChatGPT plan” | https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan | Current official policy wording | `sources/S01-openai-help-active-turn.jpg` | Directly supports conditional active-turn continuation and checking the usage page after the turn. Current page; does not define the fair-use threshold. |
| S02 | OpenAI, Codex pricing documentation | https://learn.chatgpt.com/docs/pricing | Current official quota wording | `sources/S02-openai-pricing-five-hour-active-turn.jpg`; `sources/S02b-openai-pricing-shared-five-hour-window.jpg` | Directly supports shared five-hour usage, possible weekly limits, and active-turn continuation. Primary policy source; two captures preserve both claim-bearing sections. |
| S03 | OpenAI Developer Community, “Did the 5-hour usage limit behavior change?” | https://community.openai.com/t/did-the-5-hour-usage-limit-behavior-change/1393093 | Recent firsthand report | `sources/S03-openai-community-aug27-immediate-stop.jpg` | Supports one immediate-stop observation and one recollection of earlier behavior. Replies speculating about a cause are not used as fact. |
| S04 | openai/codex issue #40905 | https://github.com/openai/codex/issues/40905 | Recent firsthand report | `sources/S04-github-40905-aug26-interruption-report.jpg` | Supports a Plus-context / GPT-5.6 Sol report of a long-running task interrupted twice. It is an open issue, not an official confirmation. |
| S05 | openai/codex issue #28397 | https://github.com/openai/codex/issues/28397 | Historical bug reproduction | `sources/S05-github-28397-jun15-bypass-report.jpg` | Supports a Plus / Codex App goal-resume and steering bypass report. The repository labels it `bug` and `rate-limits`; this is not equivalent to ordinary in-flight completion. |
| S06 | openai/codex issue #25937 | https://github.com/openai/codex/issues/25937 | Historical contrary case | `sources/S06-github-25937-jun2-continued-after-zero.jpg` | Supports a Plus / Codex App report of continued interaction after the limit via follow-ups. The issue is labeled `bug`; it does not establish an intended entitlement. |
| S07 | openai/codex issue #21073 | https://github.com/openai/codex/issues/21073 | Earlier hard-stop case | `sources/S07-github-21073-may4-midtask-stop.jpg` | Supports a CLI report that a turn could die mid-task before the alleged August change. This is the strongest disconfirming chronology item. |

## Inspected but excluded

- The open-source Codex rate-limit handler was inspected but excluded from article claims: client parsing and display code cannot establish backend enforcement semantics.
- A Reddit thread was excluded after the browser produced an access challenge rather than attributable page content.
- A Developer Community reply attributing the behavior to exploit closure was excluded because it supplied no primary evidence.
