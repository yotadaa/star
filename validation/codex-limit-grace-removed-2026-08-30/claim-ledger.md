# Claim Ledger

| ID | Claim | Source(s) | Evidence class | Status / wording |
|---|---|---|---|---|
| C01 | A 27 August forum post reports that Codex stopped the current task when the five-hour limit was reached. | S03 | Attributable first-person report | Supported as one report; never generalized. |
| C02 | The same post remembers earlier work finishing after the boundary and asks whether behavior changed. | S03 | Attributable recollection | Supported as recollection, not as verified prior policy. |
| C03 | Current OpenAI Help says Codex can continue an active turn after a limit, subject to fair-use limits. | S01 | Current first-party documentation | Supported. |
| C04 | Current OpenAI pricing documentation says the agent will be able to continue an active turn, subject to fair use. | S02 | Current first-party documentation | Supported. |
| C05 | Local messages and cloud work share a five-hour window, and additional weekly limits may apply. | S02 | Current first-party documentation | Supported; do not infer exact per-plan counts beyond the page. |
| C06 | A 26 August GitHub issue framed around Plus reports a GPT-5.6 Sol task being interrupted twice by the five-hour boundary. | S04 | Attributable first-person report | Supported as a report; no prevalence claim. |
| C07 | A May CLI issue already described a turn dying mid-task at a usage limit. | S07 | Attributable first-person report | Supported; disconfirms a clean “all runs used to finish” history. |
| C08 | A June Codex App issue on Plus described continued interaction after the five-hour limit and was labeled `bug`. | S06 | Attributable bug report and repository label | Supported; describes follow-up continuation, not necessarily the intended active-turn path. |
| C09 | A second June App issue documented a goal-resume / steer route past the boundary and was labeled `bug`. | S05 | Attributable reproduction and repository label | Supported; classify as bypass rather than ordinary in-flight completion. |
| C10 | No selected official source announces removal of an active-turn completion policy or a named “grace limit.” | S01, S02 | Bounded source-corpus result | Use only as “no announcement was located in the selected official pages,” not proof of absence everywhere. |
| C11 | The record supports a documentation-enforcement mismatch or regression hypothesis more strongly than a universal policy-removal claim. | S01–S07 | Cross-source synthesis | Qualified inference. |
| C12 | A strict boundary can improve quota predictability and close post-limit bypasses. | S05, S06 | Product inference | Present as a possible benefit, not OpenAI's stated motive. |
| C13 | A strict boundary can interrupt uncheckpointed work and increase supervision. | S04, S07 | Report-supported consequence | Supported as reported risk; do not promise data loss in every case. |
| C14 | A useful incident report must distinguish surface, plan, model, client version, quota window, active turn, resume, and follow-up. | S01–S07 | Methodological synthesis | Supported as recommended diagnostic practice. |
| C15 | Users should not plan production work around undocumented extra allowance. | S01, S02 | Conservative operational advice | Supported as advice, not policy. |
