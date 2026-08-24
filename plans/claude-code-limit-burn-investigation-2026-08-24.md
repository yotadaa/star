# Claude Code Limit-Burn Investigation — Task Plan

## Scope

- Research, write, illustrate, publish, and validate one English Blog investigation: `Why Are Some Claude Code Users Suddenly Burning Through Their Limits Faster?`
- Start from Anthropic Claude Code issue `#84750`, then test its allegations against additional user reports, official Anthropic usage/context/cache documentation, and relevant release history.
- Remove the owner-rejected research-note paragraph from the existing `/compact` article in Markdown, native payload, deterministic seed output, and live Convex data.
- Do not add a generic `Research note` disclosure section to either article. Put uncertainty and evidence boundaries beside the claims they constrain.

## Evidence contract

- Follow `docs/blog-writing-automation-contract.md` and `$write-grounded-blogs`.
- Open and read every used source beyond its search snippet.
- Preserve one in-app Browser screenshot for every source used in the article.
- Treat GitHub/user reports as reports, not proof of prevalence or causation.
- Prefer official Anthropic documentation for usage accounting, context, caching, MCP/tool behavior, and release facts.
- Make the central conclusion falsifiable and keep platform-wide regression claims out unless controlled evidence supports them.
- Present advantages and disadvantages of long sessions, large contexts, MCP servers, and cache-sensitive workflows.

## Article and media contract

- Language: English.
- Voice: warm third person; no first-person narration; pass the anti-slop and third-person audits.
- Section: `AI Investigation` unless the evidence supports a more precise existing section.
- Repository-native Convex blocks with complete SEO metadata.
- Original feature illustration with no logos, fake UI, fake metrics, or embedded prose.
- At most one bounded, attributed source capture in the published body; all other captures remain validation-only.
- Stable image asset keys, positive intrinsic dimensions, descriptive alt text, and captions.

## Acceptance criteria

1. A source, claim, terminology, visual, and hook ledger exist before the final draft.
2. The draft uses multiple independent sources and explains both benefits and costs of the mechanisms under investigation.
3. Every used source has a saved Browser capture; links are reachable at validation time.
4. The grounded-blog audit reports zero hard findings and zero warnings on the Markdown draft.
5. The rejected `/compact` paragraph is absent from the affected Markdown draft, native payload, corrected live route text, and both affected validation packages.
6. The publisher is idempotent on a second run; deterministic seed count and Blog SEO image verification pass.
7. `npm run convex:typecheck`, `npm run blog:seo-data`, and `npm run build` pass.
8. Both affected live routes have index/follow robots, a canonical URL, `BlogPosting` JSON-LD, title suffix `· Mukhtada`, valid image metadata, and no horizontal overflow at 1440 px or 375 px.
9. Desktop, mobile, and keyboard-focus screenshots are captured and inspected.
10. Only scoped files are committed; existing unrelated worktree changes remain untouched; the commit is pushed to `origin/main`.

## Guardrails

- No new npm dependency, design token, route component, fabricated usage number, or destructive database operation.
- No attempt to convert subscription quota into API-dollar estimates.
- No claim that a release, MCP server, compaction, cache miss, or context length caused issue `#84750` without direct evidence.
- No external source screenshot is published without bounded framing, attribution, and the existing project rights decision.

## Validation evidence

- Package: `validation/claude-code-limit-burn-2026-08-24/`
- Route screenshots: `validation/claude-code-limit-burn-2026-08-24/routes/`
- Existing article correction evidence: recorded in the new package validation log and verified on `/blog/does-compact-make-claude-code-worse`.

## Status

`complete`
