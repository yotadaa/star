# Hook Scorecard

Scoring: specificity, tension, evidence visibility, and fit for the promised reader outcome; five points each.

| Candidate | Specificity | Tension | Evidence | Fit | Total |
|---|---:|---:|---:|---:|---:|
| A. `A bug report says Claude Code began draining limits faster. The difficult part is that “limit” can refer to four different meters.` | 4 | 4 | 3 | 5 | 16 |
| B. `One report says the same workflow started hitting its limit early. Another records 1,364,156 tokens inside a 1,000,000-token window—a value the model could not actually have accepted.` | 5 | 5 | 5 | 5 | 20 |
| C. `Before blaming a secret quota change, a Claude Code user has to answer a less dramatic question: which percentage moved?` | 4 | 4 | 3 | 5 | 16 |
| D. `The strongest evidence in the usage-limit debate does not prove overbilling. It proves that at least one client-side counter could become physically impossible.` | 5 | 5 | 5 | 4 | 19 |

## Selected hook

Candidate B. It begins with the reader's lived symptom, then introduces a concrete contradiction that forces a more careful investigation. The next paragraph must immediately identify issue `#82863` as a single user report and separate its context counter from subscription quota.
