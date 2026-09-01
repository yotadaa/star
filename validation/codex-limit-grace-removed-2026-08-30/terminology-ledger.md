# Terminology Ledger

| Term | Operational meaning in this article | Boundary |
|---|---|---|
| Five-hour window | The shared usage window OpenAI describes for local Codex messages and cloud tasks/chats on eligible ChatGPT plans. | It is an allowance window, not a promise that a single task runs for five wall-clock hours. Additional weekly limits may also apply. |
| Weekly limit | A separate, longer-horizon allowance that OpenAI says may apply in addition to the five-hour window. | The selected sources do not show that every post-limit active turn is charged to the weekly meter in one uniform way. |
| Active turn | Work already executing from one user instruction when a usage boundary is reached. | It is not automatically synonymous with an entire multi-hour goal, thread, session, or every follow-up sent after the meter reaches zero. |
| Task / goal | User-facing work that can contain multiple turns, tool calls, pauses, resumes, and follow-up instructions. | A report that “the task stopped” does not by itself prove that the server terminated one still-active turn rather than refusing a new turn or resume. |
| Session / thread | The longer conversation container around turns. | Historical reports sometimes use “session,” “task,” and “turn” interchangeably; this article does not. |
| “Grace” | Community shorthand for allowing work already in progress to finish after the nominal usage boundary. | OpenAI's selected documentation does not name a product feature called “grace limit.” The quotation marks are intentional. |
| Immediate stop | An observed interruption or refusal at the quota boundary, as described by a reporter. | The phrase does not identify client-side UI behavior, backend enforcement, rollout state, or root cause on its own. |
| Fair-use limits | OpenAI's explicit qualifier on active-turn continuation. | The selected public pages do not quantify the qualifier, so the article does not invent a duration or overage amount. |
| Continuation bypass | A post-limit follow-up, resume, or steering path that allows more work after the boundary. | This is different from letting the single already-running turn complete. Two June reports filed such behavior as bugs. |
| Client state | What the app or CLI displays and how it reacts to a rate-limit response. | Open-source client handling can expose messages and states, but it cannot prove the server's enforcement policy. |
