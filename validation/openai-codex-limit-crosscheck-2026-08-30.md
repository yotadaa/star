# OpenAI/Codex usage-limit cross-check — 2026-08-30

## Scope and verdict

This memo independently checks two proposed stories:

1. **“OpenAI brings back a five-hour limit for Plus subscribers.”**
2. **“Codex grace limit is gone, so an in-flight task now stops immediately.”**

The first claim is well supported, with one wording correction: this is a **rolling five-hour usage window**, not five hours of guaranteed wall-clock access and not a fixed message count. It applies to the shared ChatGPT Work/Codex allowance described by OpenAI. The announcement specifically named Plus; OpenAI's current pricing table also shows a five-hour window for Business, but that broader rollout was not explained in the announcement.

The second claim is **not established as an official policy change**. Multiple dated reports after the restoration describe active turns stopping immediately, but OpenAI's live documentation still says an active turn can finish after the limit is reached, subject to fair-use limits. Archived copies show that promise before and after the August 25 announcement. The defensible story is therefore a **documented-behavior mismatch or possible regression**, not “OpenAI removed the grace limit.”

## Primary-source chronology

| Date and time | Source | Direct support | Limits |
|---|---|---|---|
| 2026-05-14 | [OpenAI Forum replay identifying Sottiaux](https://forum.openai.com/en/public/videos/event-replay-codex-is-for-everyone-why-codex-matters-beyond-code-2026-05-13) | OpenAI's own forum identifies Thibault “Tibo” Sottiaux as Head of Codex at OpenAI. | This establishes role/authority, not that every social post is a formal terms update. |
| 2026-05-22 to 2026-05-23 | [OpenAI status incident: Increase in users hitting Codex rate limits](https://status.openai.com/incidents/tcc95qa3) | OpenAI investigated an increase in users hitting Codex limits, applied mitigation, and marked it resolved. | Historical context only; not the August restoration. |
| 2026-06-02 | [openai/codex issue #25937](https://github.com/openai/codex/issues/25937) | A Plus user on app version `26.601.20914` reported that two follow-up messages could make Codex continue after the five-hour limit. The issue is still open and labeled `bug`, `rate-limits`, `app`. | The user—not OpenAI—defined the expected behavior. No staff reply confirms the mechanism or a fix. |
| 2026-06-15 | [openai/codex issue #28397](https://github.com/openai/codex/issues/28397) | A Plus user on app version `26.609.41114` documented a goal-resume/message-steering method to continue after the five-hour error. It is still open and labeled `bug`, `rate-limits`, `app`. | This is evidence of a bypass, not evidence that legitimate in-flight completion was itself a bug. No staff reply. |
| 2026-06-23 | [openai/codex issue #29717](https://github.com/openai/codex/issues/29717) | A Plus user on app version `26.622.11653` reported that a parent turn continued beyond the five-hour boundary, but Auto-review approval sub-calls were rejected. The expected behavior explicitly distinguishes an already-active turn from new quota-consuming calls. | User report in OpenAI's repository; no staff reply. |
| 2026-06-26 to 2026-06-29 | [OpenAI status incident: Codex Usage Limits Depleting Faster Than Expected](https://status.openai.com/incidents/01KW2E6W0503W4NXJNCVAG8V6T) | OpenAI said some accounts were incorrectly rate-limited by abuse/fraud systems, described the impact as limited, and marked recovery complete. | Separate incident. It demonstrates that limit behavior can be account-specific and that OpenAI has used the status page for verified limit incidents. |
| 2026-06-25 snapshot | [Archived OpenAI Help article](https://web.archive.org/web/20260625085147/https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan) | The archived official text says an active turn can continue after a usage limit, subject to fair-use limits. | Does not define “fair use” or promise completion of every tool/sub-call. |
| 2026-07-09 snapshot | [Archived OpenAI pricing page](https://web.archive.org/web/20260709184412/https://learn.chatgpt.com/docs/pricing) | Official text: if a limit is reached during an active turn, the agent can continue that turn, subject to fair use. | Oldest captured copy checked for this memo; not necessarily the first publication date. |
| 2026-08-24 snapshot | [Archived OpenAI pricing page](https://web.archive.org/web/20260824074206/https://learn.chatgpt.com/docs/pricing) | The same in-flight-turn promise appears immediately before the restored-limit announcement. | Does not prove every client implemented the promise correctly. |
| 2026-08-24 18:16 PT / 2026-08-25 01:16 UTC | [Tibo Sottiaux's original X post](https://x.com/thsottiaux/status/2092058556707344708) | Sottiaux says the five-hour limit will return “tomorrow” for Plus across ChatGPT Work and Codex. He gives two reasons: smoothing compute load while preserving generous weekly usage, and preventing casual/new Plus users from accidentally consuming the whole week's allowance. He says it will remain disabled for the $100 and $200 Pro subscriptions “for the upcoming months.” The attached user screenshot shows the same post. | The post does not publish quota size, reset algorithm, rollout version, regional timing, or in-flight-turn enforcement semantics. “Tomorrow” is timezone-sensitive. |
| 2026-08-25 14:35 UTC | [OpenAI community rate-limit thread, post 504](https://community.openai.com/t/codex-rate-limits-discussion-thread/1378553/504) | A Plus user posted that their Usage page now showed the restored five-hour limit beside the weekly limit, shared across Codex, Work, Workspace Agents, and ChatGPT for Excel. | User-supplied UI evidence, not a staff statement. |
| 2026-08-26 | [openai/codex issue #40905](https://github.com/openai/codex/issues/40905) | The reporter says an already-running long task was interrupted twice by the five-hour limit. Later commenters report the same in VS Code/Plus/Sol, including screenshots and remaining weekly quota. | Open enhancement issue with no OpenAI staff response or assignee as checked on August 30. Reports span some clients/configurations, not a controlled test of every surface. |
| 2026-08-27 | [OpenAI community question about changed behavior](https://community.openai.com/t/did-the-5-hour-usage-limit-behavior-change/1393093) | Original poster says active work now appears to stop immediately, unlike their remembered prior behavior. One community reply attributes the change to a public workaround. | The thread contains no OpenAI staff answer or release-note link. The workaround explanation is unverified community attribution. |
| 2026-08-27 | [OpenAI community main thread, page 28](https://community.openai.com/t/codex-rate-limits-discussion-thread/1378553?page=28) | Posts 587, 588, 591, 593, 596, and 597 independently describe unfinished tasks stopping at the five-hour boundary; several explicitly ask for in-flight completion or automatic resume. | Anecdotal reports with uncontrolled model, client, account, and fair-use conditions. |
| 2026-08-30 snapshot | [Archived OpenAI pricing page](https://web.archive.org/web/20260830020212/https://learn.chatgpt.com/docs/pricing) | The active-turn continuation promise remains after the reports began. | Archive timestamp proves page content, not backend behavior. |
| Live on 2026-08-30 | [OpenAI Codex pricing](https://developers.openai.com/codex/pricing) / [ChatGPT Learn pricing](https://learn.chatgpt.com/docs/pricing) | Current official documentation says ChatGPT Work and Codex share pricing/limits; local messages and cloud chats share a rolling five-hour window; weekly limits may also apply; an active turn may finish after the limit, subject to fair use. | No exact per-account quota or full reset algorithm is published. |
| Live on 2026-08-30 | [OpenAI banked-reset documentation](https://help.openai.com/en/articles/20001498-how-banked-codex-resets-work) | A full banked reset refreshes both the five-hour and weekly windows and moves the next weekly reset date. It distinguishes user-applied banked resets from automatic/global resets. | A reset is not the same thing as normal rolling replenishment. |

## Exact terminology the articles should use

### Five-hour window

- OpenAI calls it a **rolling five-hour window**.
- The published estimates are local messages per window, but actual capacity varies with model, task size/complexity, local versus cloud execution, retained context, reasoning, tools, retrieval, and caching.
- Local messages and cloud chats share the same five-hour window on ChatGPT plans. ChatGPT Work activity shares Codex pricing, credits, and limits.
- This is **not** “five hours of continuous use.” A demanding task can exhaust it much sooner, while light tasks may permit many more messages.
- Do not describe the exact reset algorithm beyond “rolling” unless the account UI or OpenAI publishes it. The docs do not say that every token expires exactly five hours after use or precisely when a new window begins.

### Weekly limit

- OpenAI says additional weekly limits **may apply**.
- The five-hour window is a burst/short-horizon constraint; the weekly limit is a second, longer-horizon constraint. Remaining weekly capacity does not guarantee that the five-hour window still has capacity.
- OpenAI does not publish one fixed weekly message number for all Plus accounts/tasks in the pages checked. Avoid inventing one.

### Rolling reset versus banked/global reset

- A normal rolling-window refresh is not documented in enough detail to describe an exact token-bucket formula.
- A **banked reset** is a saved, one-time promotional benefit the user applies. A full one refreshes both five-hour and weekly windows and changes the next weekly reset date.
- An **automatic/global reset** is applied by OpenAI and is not stored as a user-selectable reset. Neither kind permanently increases the plan allowance.

### “Grace limit” and active turns

- **“Grace limit” is not terminology found in the official pages checked.** Prefer **in-flight completion**, **active-turn continuation**, or **graceful completion**.
- The official promise is narrow: a turn that was already active when the quota boundary was crossed may finish, subject to fair-use limits.
- That promise does not authorize a new message, a resumed goal, or a message-steering workaround after the account is already blocked.
- Earlier issues show both phenomena existed: legitimate parent-turn continuation (#29717) and ways to trigger more work after the limit (#25937 and #28397). A fix for the latter would not automatically justify terminating the former.
- The public documentation does not define the fair-use threshold, how approval sub-calls are treated, or whether every surface/client has identical boundary handling.

## Corroboration and contrary evidence

### Story 1: restoration of the five-hour Plus limit

**Corroborated by:**

- the original statement from OpenAI's Head of Codex;
- current official pricing that describes the shared rolling five-hour window;
- a contemporaneous Plus Usage-page report in OpenAI's community;
- [9to5Mac's contemporaneous report](https://9to5mac.com/2026/08/24/openai-restores-5-hour-codex-and-work-limits-for-chatgpt-plus-users/), which links the original post and reports rollout beginning August 25 Pacific time.

**Scope caveats / contrary details:**

- Tibo's post named Plus. OpenAI's current pricing page also shows a five-hour Business allowance, and community users reported Business/Team UI changes, but the announcement did not explain that scope.
- The post said the five-hour limit would stay disabled for Pro $100/$200 “for the upcoming months,” not forever. Current live pricing now shows rolling five-hour estimates for Pro tiers. Because the phrase was explicitly temporary, do not present the August exemption as the current permanent rule without a fresh account-level check.
- The official Codex changelog and OpenAI status history checked through August 30 contain no matching entry that explains the August 25 policy restoration or an active-turn enforcement change. Absence from a focused search is not proof that no internal rollout note exists.

### Story 2: immediate stop / “grace removed”

**Corroborated as observed behavior by:**

- issue #40905 opened August 26 and its later Plus/VS Code/Sol reports;
- the August 27 community question;
- several independent posts on page 28 of the main rate-limit thread.

**Contradicted as a declared policy by:**

- live official pricing/help language saying the active turn can finish;
- archived official copies from June 25, July 9, August 24, and August 30 preserving the same promise;
- older issue #29717 showing that active parent-turn continuation was an observed product behavior distinct from rejected new approval calls.

**Best defensible conclusion:** Some users began seeing hard interruption at the restored five-hour boundary. That may be a regression, client/surface difference, fair-use enforcement, or undocumented rollout behavior. There is no primary-source confirmation that OpenAI formally abolished active-turn completion, and no evidence that “grace limit” was an official feature name.

## What remains unproven

1. The exact app/CLI/IDE release or server-side flag that changed boundary behavior, if any.
2. Whether immediate termination affects all Plus users, only certain clients/models/reasoning levels, or only runs that trip an undisclosed fair-use constraint.
3. Whether the backend intentionally changed while documentation remained stale, or whether the hard stops are a bug/regression.
4. Whether the earlier social-media workaround directly caused any enforcement change. A community reply asserts this; OpenAI has not confirmed it.
5. Whether continuation after the five-hour boundary is always charged only against the weekly pool. A user remembers that behavior, but the official text checked does not specify the accounting path.
6. The exact weekly quota for a given Plus account and the precise replenishment algorithm.
7. The current duration of the Pro exemption announced on August 25. The wording was temporary, and current public pricing now displays five-hour estimates for Pro.

## Safe headline/framing guidance

- Strong: **“OpenAI Restored a Five-Hour Plus Window for Codex and ChatGPT Work”**
- Strong investigative framing: **“Codex Users Say the Five-Hour Limit Is Killing Active Tasks—OpenAI's Docs Say It Shouldn't”**
- Avoid: **“OpenAI Removed Codex's Grace Limit”** (not officially confirmed)
- Avoid: **“Plus users get only five hours of Codex”** (misstates a quota window as elapsed access time)

## Evidence handling

No new screenshots were needed for this memo. The supplied screenshot is a legible capture of the original X post, and all other findings are tied to public URLs above. The article packages should still capture their own source screenshots so the evidence shown in each published article matches the exact claim and crop used there.
