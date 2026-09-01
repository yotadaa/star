# Assignment

## Working topic

A second, independent article built from the research ledgers of
`validation/ox-alpha-glm-5-3-flash-investigation-2026-08-27/`. Same evidence
base, different question.

The first article answered *who made Ox Alpha*. This one answers a question that
package explicitly declared out of scope (`validation.md`, "Unresolved claims",
C17/C18): **when a model serves a trillion-token workload under a name nobody
can attribute, who is accountable for the data, and what could users actually
tell about what they were using?**

## Angle, fixed before drafting

The anonymous-preview accountability story. Load-bearing claim rows, all from
the existing `claim-ledger.md`:

- **C16 `reported`** — 10.3 trillion tokens and 30.9% of OpenRouter's
  coding-model usage through 2026-08-24, ranked first. Attribute to iThome.
  Traffic share measures adoption of a free preview, not satisfaction.
- **C17 `reported`** — the gap between the model page's "not used for training"
  statement and the Stealth Program's general terms. The general-terms half
  rests on iThome's reading; attribute it. Do not assert which document controls.
- **C18 `reported`** — Z.ai's privacy documents cover only its own services and
  API, so the processing location during the anonymous test cannot be confirmed.
  An unresolved question, not a finding of wrongdoing.
- **C15 `claimed`** — serving on Chinese AI chips with a 3× end-to-end
  improvement over Z.ai's own first baseline. The baseline is Z.ai's own first
  attempt, not a competitor. iThome notes the cluster's country or region is
  unstated.
- **G01–G04 and R01–R11** from `sentiment-method.md` — the attribution split.
  Preview users could not reliably tell whether a failure belonged to the model,
  the route, or their harness. **G04** (`earendil-works/pi` 8541), uncited in the
  first article, is cited here: it is the clearest instance of the problem, a
  provider capacity event that a harness bug made unreadable.
- **C20 `inferred`** — preview-week praise arrived without brand attribution.
  Carried as the legitimate case *for* blind testing, stated as an inference
  about conditions rather than about strength of sentiment.

## Relationship to the two live articles

Must not contradict either:

- `/blog/ox-alpha-api-left-a-trail` — pre-reveal investigation.
- `/blog/ox-alpha-was-glm-5-3-flash` — the identity finding, published
  2026-08-28T00:47:32+07:00.

The identity is settled and is treated as settled background here, cited once
with an internal link, not re-argued. The checkpoint question (C04, `unknown`)
is referenced only where it bears on what preview users were testing.

## Originality constraint

Written from the ledgers, not from the published `draft.md` or `payload.json`.
New title, new slug, new structure, new prose, new featured illustration. No
passage is adapted from the first article. Overlap is limited to facts that
belong to both stories and to the four figures in the shared table.

## Method still in force

- Verdict vocabulary and status per claim; output similarity cannot prove
  identity; official claims, independent results and local measurements stay
  separate.
- No manufactured benchmark. There is still no authorized API route from this
  environment, so no `benchmark-plan.md` / `benchmark-results.md` and no
  local-measurement claim.
- Live project contract (`docs/blog-writing-automation-contract.md`) wins over
  the skill bundle. Anti-slop pass runs after the factual draft and may not
  alter facts, figures, qualifications, links, quotations or attributions.
- No generic "Research note", methodology disclaimer, source-count summary or
  cutoff paragraph appended to the article. Qualifications sit beside the claims
  they limit.
- Warm third-person prose. No author suffix in `seoTitle` — the route appends
  `· Mukhtada`.
- Blog audit with `--third-person`; fix hard findings, review warnings without
  suppressing them.

## Title and slug

- Title: **Ten Trillion Tokens Under a Name Nobody Could Check**
- Slug: `ox-alpha-anonymous-preview`
- Asset key prefix: `blog:ox-alpha-anonymous-preview:`

## Publication

**Authorized on 2026-08-28.** The user supplied this exact package handoff and
asked to “make another publication.” That authorizes the normal R2, Convex and
IndexNow publication workflow for this article. It does not separately authorize
a Git commit or push.

## Research cutoff

Inherited: 2026-08-27, 23:45 Asia/Jakarta (UTC+7). G04 was re-opened and captured
on 2026-08-28 for this article's publication audit. Package assembled
2026-08-28.
