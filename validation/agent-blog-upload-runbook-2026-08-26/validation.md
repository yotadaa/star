# Agent Blog Upload Runbook Validation

## Scope

- Deliverable: `docs/blog-agent-upload-runbook.md`
- Supporting correction: `docs/blog-writing-automation-contract.md`
- Plan: `plans/agent-blog-upload-runbook-2026-08-26.md`
- Interface boundary: agent-side files and scripts only; no `/blog/admin` workflow

## Source verification

The runbook was checked against the current repository implementations:

- `scripts/publish-grounded-blog-batch.mjs`
- `scripts/blog-seo-data.mjs`
- `scripts/backfill-blog-seo-data.mjs`
- `scripts/image-dimensions.mjs`
- `scripts/convex-seed-data.mjs`
- `scripts/build-convex-seed.mjs`
- `scripts/submit-indexnow.mjs`
- `convex/validators.ts`
- `components/blog/BlogPostRenderer.jsx`
- `scripts/blog-batches/six-internet-culture-blogs-2026-08-24.json`
- `validation/anthropic-watermark-removers-2026-08-24/payload.json`

## Assertions

- JSON examples: 3 parsed successfully.
- Referenced npm scripts: 7 present.
- Referenced repository source files: all present.
- Publisher invocation: every example passes an explicit batch path.
- Provider boundary: examples use `assetKey` and contain no `src` or `storageId`.
- Image contract: every example image has alt text, caption text, width, and height.
- Publication boundary: draft preparation, live publication, commit, and push are described as separate authority decisions.
- Idempotency: the required unchanged second run expects `uploads: 0` and checksum reuse.
- IndexNow: acknowledgement is explicitly bounded as notification rather than crawl/index guarantee; notification failure is not described as a publish rollback.
- Seed integration: payload registration, provenance `sourceFiles`, and new-slug count changes are documented separately from live publication.
- Visual validation: not applicable to this documentation-only work unit; the runbook itself requires live desktop/mobile/reduced-motion screenshots for every published article.

## Prose audit

Command:

```bash
python /home/tada/.codex/skills/write-grounded-blogs/scripts/audit_blog.py docs/blog-agent-upload-runbook.md --third-person
```

Final result:

- 2,551 words
- 27 headings
- 9 URLs
- 0 hard findings
- 1 `uniform_sentence_rhythm` warning

The warning is accepted for this technical runbook because it points primarily to deliberately parallel checklists, field rules, and command descriptions rather than narrative prose. No factual or structural gate was suppressed.

## Repository hygiene

- `npm run convex:typecheck`: passed.
- `git diff --check`: passed.
- Unrelated pre-existing local changes remain excluded from this work unit.
