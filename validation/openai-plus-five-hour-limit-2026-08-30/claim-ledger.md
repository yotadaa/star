# Claim ledger

Research cutoff: 30 August 2026, 23:59 Asia/Jakarta (UTC+7). Status vocabulary
follows the repository contract.

| ID | Planned claim | Evidence | Class | Status | Limit or conflict | Article use |
|---|---|---|---|---|---|---|
| C01 | The supplied screenshot points to Tibo Sottiaux's public X post | S00, S01 | user artifact + direct social artifact | **verified** | S00 is a discovery lead, not the publication asset | provenance |
| C02 | Thibault “Tibo” Sottiaux leads Codex at OpenAI | S03 | first-party OpenAI role record | **verified** | The Forum page uses both Head of Codex and leads Codex | authority |
| C03 | In July, Sottiaux said Plus and Pro had operated without a five-hour limit for a few days and asked users about weekly-only management | S02 | direct social artifact | **verified** as what he said | The post does not give the exact removal date or formal experiment design | chronology |
| C04 | Sottiaux announced the return of the five-hour limit for Plus across ChatGPT Work and Codex | S01 | direct first-person social announcement | **verified** | The post does not define the usage unit or reset mechanics | title and opening |
| C05 | The announcement appeared Aug. 24 Pacific time / Aug. 25 Jakarta and said the return would happen the next day | S01, S06 | direct artifact + independent reporting | **corroborated** | `tomorrow` depends on the author's local date; 9to5Mac resolves the intended date as Aug. 25 | chronology |
| C06 | OpenAI's current pricing page exposes a five-hour window for Plus | S04, S05 | first-party documentation | **verified** at cutoff | Live documentation can change after the cutoff | central answer |
| C07 | The five-hour label is an allowance window, not five literal hours of active work | S04, S05 | first-party mechanics + inference from documented units | **verified** | The page estimates messages, not elapsed active-compute hours | definition |
| C08 | Local messages and cloud chats share the window, and additional weekly limits may apply | S05 | first-party documentation | **verified** | Account-specific allowance levels remain visible only in the user's dashboard | mechanics |
| C09 | Plus local-message estimates vary widely by model: Sol 10–100, Terra 25–200, and Luna 250–2,000 per five-hour window | S04 | first-party pricing table | **verified** at cutoff | Estimates are not guarantees and can vary with context, tools, reasoning, caching, and task size | table |
| C10 | OpenAI says the short window smooths compute demand and reduces accidental exhaustion of weekly usage | S01 | company rationale | **claimed** by OpenAI | No capacity data or user-study methodology was published with the post | stated benefits |
| C11 | The return can constrain users who concentrate work into occasional long sessions | S02, S07, S08 | firsthand user reports + product-mechanics inference | **corroborated as a reported cost** | Community posts are anecdotes and do not measure all Plus users | drawbacks |
| C12 | Some community members reported interruptions or failed last prompts after the return | S08 | attributable firsthand community reports | **claimed** | Not reproduced in a controlled test; one user's percentage calculation is excluded | counterevidence |
| C13 | Current OpenAI pricing says an active turn may finish after a limit is reached, subject to fair use | S04 source page | first-party documentation | **verified** at cutoff | Community reports conflict with the advertised behavior; this package did not reproduce either path | conflict and boundary |
| C14 | The announcement said $100 and $200 Pro would remain outside the five-hour limit for upcoming months | S01 | direct company-lead announcement | **verified** as announced | Current pricing lists Pro message estimates per five-hour window, leaving enforcement semantics unclear | Pro caveat |
| C15 | The current pricing table independently proves Pro remains exempt | S04 | first-party documentation | **rejected** | The table does not explain the relationship between its five-hour estimates and the announced exemption | omitted as fact |
| C16 | A Plus subscriber can inspect current limits in the account usage dashboard or `/status` | S04 source page | first-party documentation | **verified** | Dashboard values are account-specific and were not inspected | CTA |

## Thesis and uncertainty boundary

- **Thesis:** OpenAI restored a five-hour allowance window for Plus across
  Codex and ChatGPT Work on Aug. 25. The window is a variable usage meter
  nested inside a weekly allowance, not five literal hours of active work.
- **Boundary:** Public documentation does not expose a universal message count,
  a fixed amount of compute, or a complete account-level enforcement formula.
  Community interruption reports also conflict with OpenAI's documented
  active-turn continuation policy and were not independently reproduced here.

## Explicitly rejected transformations

- `5h` does not become five hours of continuous runtime.
- An estimated message range does not become a guaranteed quota.
- OpenAI's load-smoothing rationale does not become proof that the policy is
  necessary or optimally designed.
- Community complaints do not become population-level satisfaction data.
- The Aug. 25 Plus change does not establish the current enforcement state of
  either Pro tier.
