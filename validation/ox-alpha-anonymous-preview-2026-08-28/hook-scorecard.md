# Hook scorecard

Openings drafted and scored before the article was written. The requirement: the
first sentence carries a verified or attributed fact, names the article's subject,
and does not reuse the first article's opening move (a flat identity statement
followed by a reversal).

Scoring, 1–5 each: **grounded** (opens on a fact in the ledger), **specific**
(names a figure, document or actor), **honest** (no implied finding the evidence
does not support), **original** (no structural echo of the published article).

| # | Opening | G | S | H | O | Verdict |
|---|---|---|---|---|---|---|
| 1 | "For six days in August, the most-used coding model on OpenRouter had no maker's name attached to it." | 5 | 4 | 5 | 5 | **Chosen.** Opens on C16's rank and the anonymous condition together. "Most-used coding model" is iThome's reported rank, attributed in the following sentence with the figures. |
| 2 | "Ten point three trillion tokens went through a route called `stealth/ox-alpha` before anyone outside Z.ai could say who was answering." | 5 | 5 | 4 | 5 | Strong, and it became the second sentence. Rejected as the opener because leading with a raw eleven-digit figure reads as a statistic hunting for a story, and "before anyone outside Z.ai could say" slightly overstates: OpenRouter knew, which is the point the article makes later. |
| 3 | "Z.ai tested GLM-5.3-Flash anonymously as `ox-alpha`, and disclosed it in the release post." | 5 | 5 | 5 | 2 | Rejected. This is the first article's opening fact and nearly its opening structure. |
| 4 | "Anonymous model previews are normal. What happened in August was not the practice but its scale." | 3 | 2 | 4 | 4 | Rejected. The first clause is an unsourced generality and the second promises a judgement the evidence does not deliver — the article's finding is a gap in the record, not a verdict on scale. |
| 5 | "iThome reported that a model nobody could name accounted for 30.9% of OpenRouter's coding traffic." | 5 | 5 | 5 | 4 | Rejected only for rhythm: leading with the attribution buries the subject behind a publication name. The attribution moves to sentence three, where it still governs the figure. |
| 6 | "The parcel arrived, the work got done, and the label was blank." | 1 | 1 | 3 | 5 | Rejected. Metaphor before fact. The illustration can carry this; the prose cannot open on it. |

## Chosen opening, as drafted

> For six days in August, the most heavily used coding model on OpenRouter had no
> maker's name on it.

Followed immediately by the figures and their attribution, so no reader takes the
rank as this article's own measurement.

## Title candidates

| Title | Chars | Verdict |
|---|---|---|
| **Ten Trillion Tokens Under a Name Nobody Could Check** | 51 | **Chosen.** Carries the reported scale and the article's actual subject — checkability — without claiming wrongdoing. No overlap with the two live titles. |
| Who Was Accountable for Ox Alpha? | 33 | Rejected: a rhetorical question as a title, and "accountable" front-loads a verdict. |
| The Anonymous Preview Problem | 29 | Rejected: asserts a problem in the abstract; the article documents a gap in a specific record. |
| What Ox Alpha's Users Could Not Tell | 36 | Close second. Rejected because it drops the scale, which is what makes the gap matter. |
| Ox Alpha's Data Trail | 21 | Rejected: too close to the live `/blog/ox-alpha-api-left-a-trail`. |

`seoTitle` uses the chosen title unchanged, with no author suffix — the route
appends `· Mukhtada`.

## Closing move

Not a summary. The article ends on what would change the conclusion: a
first-party statement on the retention question, or a Z.ai correction, or a
platform document that settles which terms controlled. Same discipline as the
opening — the last sentence carries a fact about the record, not a flourish.

The closing scopes the cost instead of universalising it: trivial for a toy
prompt, serious for a proprietary codebase or private repository. The final
sentence keeps the reported figure and attaches the qualification directly
("whatever share of it was sensitive") rather than letting scale imply a harm
the evidence cannot measure.

The chosen opening and title remain grounded. The opener asserts only the
anonymous condition and reported rank; the title claims checkability rather
than wrongdoing.
