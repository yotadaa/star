# Assignment

- Working title: `Some Codex Runs Now Stop at the Five-Hour Limit. OpenAI's Docs Say They Can Continue.`
- Proposed slug: `codex-five-hour-limit-active-turns`
- Status: draft only; do not publish.
- Language: English (`en-US`).
- Section: `AI Investigation`.
- Research cutoff: 30 August 2026, 23:59 Asia/Jakarta.
- Reader: Codex subscribers planning long-running work near a usage boundary, and maintainers trying to separate an enforcement regression from expected quota behavior.
- Reader outcome: understand what OpenAI currently promises, what recent users actually reported, why the historical record is mixed, and what evidence would make a hard-stop report actionable.
- Central thesis: recent reports establish that some Codex tasks stopped at the five-hour boundary, but they do not establish that OpenAI formally removed an active-turn completion policy. Current official documentation still says an in-flight turn can continue, subject to fair-use limits. The defensible story is a documentation-enforcement mismatch, possible regression, or surface-specific behavior—not a confirmed universal policy change.
- Counter-thesis: earlier continuation was not one clean entitlement. Some reports described a legitimate in-flight completion; others documented follow-up-message and resume paths that were filed as bugs. A stricter stop could be closing those bypasses without intentionally removing the narrower active-turn behavior promised in the documentation.
- Claim boundary: GitHub issues and forum posts establish attributable observations, not prevalence or server-side cause. No selected official source announces that a named “grace limit” was removed.
- CTA: readers should compare an incident against the live official limit text, then file a compact evidence packet naming the surface, plan, client version, model, window, task state, and exact stop behavior.
- Media: one original tactile feature image and one bounded screenshot of the attributable 27 August community report.
- Forbidden form: no generic research note, no source-cutoff epilogue, and no unsupported declaration that the grace behavior is universally gone.

## Story spine

1. Open on the contradiction between a recent immediate-stop report and OpenAI's current active-turn promise.
2. Define the five-hour window, active turn, task/session, and the unofficial word “grace.”
3. Trace the May, June, and August record, including disconfirming cases.
4. Explain how documentation and observed hard stops could diverge without inventing a cause.
5. Weigh the practical gains and costs of strict enforcement.
6. Provide a reproducible incident packet and a qualified verdict.
