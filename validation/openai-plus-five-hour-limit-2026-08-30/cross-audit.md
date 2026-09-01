# Independent cross-audit

> Post-audit publication note: the project owner subsequently authorized the
> upload. The audit scope below describes the pre-publication package; current
> publication evidence is recorded in `validation.md`.

Date: 30 August 2026 (Asia/Jakarta)

Scope: draft package only. The article was checked against
`../openai-codex-limit-crosscheck-2026-08-30.md`, the package claim/source/
terminology/visual ledgers, `docs/blog-writing-automation-contract.md`, and
`docs/blog-agent-upload-runbook.md`. No shared manifest, Convex record, R2
object, batch manifest, Git history, or public route was changed.

## Verdict

**Passed after bounded corrections.** The package supports its central claim:
OpenAI restored a five-hour Plus allowance window across ChatGPT Work and Codex,
and that window is a variable usage frame layered with possible weekly limits,
not five wall-clock hours of guaranteed work. The article keeps OpenAI's stated
rationale separate from independently demonstrated effects, labels community
reports as reports, and leaves the Pro enforcement question unresolved.

## Corrections made

1. Replaced “short weekly-only experiment” with “a few days without the short
   window.” Sottiaux described the observed state and requested feedback; the
   selected evidence does not establish a formally designed experiment.
2. Replaced “reset frame” and the assertion that the clock governs a refresh
   with the narrower “allowance frame.” The draft now says OpenAI does not
   publish the exact account-level reset algorithm.
3. Changed the two rationales from proven “real” product problems to
   **plausible** problems. Capacity smoothing and accidental weekly exhaustion
   remain accurately attributed to Sottiaux.
4. Removed an unsupported summary of July replies. The revised paragraph says
   only what the July post and the captured Aug. 25 community post directly
   support.
5. Added an adjacent official-pricing link to the active-turn continuation
   statement.
6. Reconciled the `/558` community citation with the live post and its capture.
   It supports one Plus user's report of a failed final prompt, interruption,
   and prompting again after reset. A second allegation about unused weekly
   allowance was removed because the package did not carry adjacent evidence
   for it. The following paragraph is now singular and does not imply a survey.
7. Added a provider-neutral `featuredImage` object and verifier checks that its
   asset key, alt text, width, and height match the feature image block. This
   resolves the automation-contract checklist without persisting an R2 URL,
   `src`, or `storageId`; the future SEO manifest can remain authoritative at
   publication time.
8. Rebuilt `payload.json` from `build-payload.mjs` and updated validation counts.
9. The anti-slop pass removed a section-closing restatement after the official
   active-turn sentence. The source-backed sentence now stands on its own.

## Evidence and visual inspection

- `S01` preserves the complete Tibo announcement, identity, timestamp, scope,
  reasons, and stated temporary Pro exception.
- `S02` preserves the July “few days” statement and feedback question; it does
  not show replies, which is why the draft no longer generalizes them.
- `S03` visibly carries first-party OpenAI text identifying Sottiaux as Head of
  Codex. The cookie prompt contains no private account information.
- `S04` and `S05` visibly show the model-dependent estimates, shared five-hour
  window, and possible weekly limits.
- `S06` visibly shows the 9to5Mac headline, author, Pacific publication time,
  and Aug. 25 chronology.
- `S07` and `S08` show public, attributable community posts with the relevant
  passages legible. No email address, private message, account dashboard, or
  logged-in identity appears.
- The in-article announcement crop is readable and minimal. Its caption limits
  it to the decision and stated rationale.
- The generated feature is visibly conceptual: an unbranded timer, blank paper
  grid, pencil, and paper clips. It has no fake interface, factual number, logo,
  person, watermark, or claim-bearing text. Its alt text and dimensions match
  both the image block and `featuredImage`.

## Verification results

Commands rerun after the corrections:

```sh
node validation/openai-plus-five-hour-limit-2026-08-30/build-payload.mjs
python /home/tada/.codex/skills/write-grounded-blogs/scripts/audit_blog.py \
  validation/openai-plus-five-hour-limit-2026-08-30/draft.md --third-person --json
python /home/tada/.codex/skills/write-grounded-blogs/scripts/audit_blog.py \
  validation/openai-plus-five-hour-limit-2026-08-30/payload.json --third-person --json
node validation/openai-plus-five-hour-limit-2026-08-30/verify-package.mjs
jq empty validation/openai-plus-five-hour-limit-2026-08-30/payload.json
```

Results:

- Draft: 1,396 audited words, eight headings including H1, nine links across
  seven distinct URLs, zero hard findings, one reviewed rhythm warning.
- Payload: 31 native blocks: 20 paragraphs, seven headings, two images, one
  table, and one list.
- Package verifier: zero errors; two media checksums/dimensions and nine source
  captures passed; SEO title 54 characters and description 152 characters.
- JSON parse: passed.

The draft rhythm warning is non-blocking. Its groups include compact chronology,
table language, and intentionally short explanatory sentences; no repetitive
template ending or first/second-person voice was introduced.

## Remaining gates

The package remains intentionally `draft`, has no `publishedAt`, and was not
uploaded. Asset staging/reuse verification, SEO-manifest registration, a
truthful publication timestamp, duplicate publish check, live canonical and
sitemap checks, IndexNow, and desktop/mobile/keyboard/reduced-motion inspection
remain publication-stage work. The exact account-level reset algorithm, the
prevalence or cause of interruption reports, and current Pro enforcement are
still unproven and must not be promoted to fact.
