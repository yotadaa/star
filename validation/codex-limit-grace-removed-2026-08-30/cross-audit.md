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

**Passed after material calibration fixes.** The package does not claim that
OpenAI officially removed a feature called “grace.” It frames late-August hard
stops as credible reports that conflict with current first-party active-turn
language, while preserving the alternative explanations of regression,
surface-specific behavior, fair-use enforcement, or closure of older bypasses.

## Corrections made

1. Replaced the original title's wall-clock shorthand with
   `Some Codex Runs Now Stop at the Five-Hour Limit. OpenAI's Docs Say They Can Continue.`
   This distinguishes an allowance boundary from five literal hours of work.
2. Changed the opening incident from a definite stop at the exact boundary to
   “appeared to stop when” the allowance was exhausted. The source is a user
   observation, not account telemetry.
3. Restored the complete official Help URL:
   `https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan`.
4. Corrected GitHub issue `#40905` from Pro to Plus context in the draft and
   both ledgers. The issue body describes Plus, and later comments also identify
   Plus; the selected evidence does not support using it as a Pro case.
5. Rewrote the generated feature caption as narrative explanation instead of
   process housekeeping. It now illustrates the distinction between finishing
   one running turn and starting more work, without claiming product behavior.
6. Replaced the SEO title with the bounded
   `Codex Five-Hour Limit: Why Are Some Runs Stopping?`.
7. Rebuilt `payload.json` and synchronized the validation title, word count,
   and SEO-title length.
8. The anti-slop pass removed demonstrative kickers after the deployment/docs
   mismatch and the `#40905` description. The revised passages keep the same
   evidence boundary while stating the corroboration directly.

## Chronology and terminology check

- Current OpenAI Help and pricing documentation say an active turn may continue
  after a limit, subject to reasonable/fair-use limits.
- Archived June 25, July 9, Aug. 24, and Aug. 30 snapshots preserve the same
  active-turn promise; the package therefore does not invent a newly added
  documentation defense after the reports.
- May issue `#21073` records a mid-task stop before the August restoration.
- June issues `#25937` and `#28397` describe follow-up, steering, resume, or
  goal paths that were labeled `bug` and `rate-limits`, so those paths cannot be
  treated as a guaranteed historical grace policy.
- June issue `#29717` demonstrates why the distinction matters: a parent turn
  reportedly continued while a new Auto-review sub-call was rejected.
- Aug. 26 issue `#40905` and the Aug. 27 community post support late-August hard
  stop observations, not a declared universal policy change.
- The draft consistently separates active turn, task/goal, follow-up message,
  steer/resume, sub-call, session, five-hour window, and weekly limit. “Grace”
  remains community shorthand only.

## Evidence and visual inspection

- All eight source captures were inspected. The claim-bearing passages are
  readable, and none shows email addresses, private messages, account usage
  dashboards, or logged-in account identity.
- The in-article community screenshot is a bounded public-source capture. Its
  caption says it documents one report and recollection, not prevalence or an
  announced policy.
- The feature image is an original tactile still life. It contains no product
  UI, logo, fake terminal, factual chart, person, watermark, or claim-bearing
  text. Its alt text is descriptive and its caption is explicitly illustrative.
- The provider-neutral `featuredImage` matches the first image block by asset
  key, alt text, width, and height.

## Verification results

Commands rerun after the corrections:

```sh
node validation/codex-limit-grace-removed-2026-08-30/build-payload.mjs
python /home/tada/.codex/skills/write-grounded-blogs/scripts/audit_blog.py \
  validation/codex-limit-grace-removed-2026-08-30/draft.md --third-person --json
node validation/codex-limit-grace-removed-2026-08-30/verify-package.mjs
jq empty validation/codex-limit-grace-removed-2026-08-30/payload.json
```

Results:

- Draft: 1,681 audited words, eight headings including H1, eight external URLs,
  zero hard findings, and zero warnings.
- Payload: 40 native blocks: 28 paragraphs, seven headings, two tables, two
  images, and one ordered list.
- Package verifier: passed; two media checksums/dimensions passed; SEO title 50
  characters and description 153 characters.
- JSON parse: passed.

## Remaining gates

The package remains intentionally `draft`, has no `publishedAt`, and was not
uploaded. Asset staging/reuse verification, SEO-manifest registration, a
truthful publication timestamp, duplicate publish check, live canonical and
sitemap checks, IndexNow, and desktop/mobile/keyboard/reduced-motion inspection
remain publication-stage work. A universal hard-stop policy, an officially
named “grace” feature, its formal removal, prevalence across accounts/surfaces,
and root cause remain unproven and must not be promoted to fact.
