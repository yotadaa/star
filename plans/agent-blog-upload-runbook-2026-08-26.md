# Agent Blog Upload Runbook Plan

## Scope

Create an agent-facing Markdown runbook for preparing and publishing grounded Blog articles without using the `/blog/admin` web interface. The runbook must reflect the repository's current Convex bridge, Cloudflare R2 asset workflow, SEO manifest, deterministic seed, IndexNow notification, and idempotent batch publisher.

## Sources of truth

- `docs/blog-writing-automation-contract.md`
- `/home/tada/.codex/skills/write-grounded-blogs/SKILL.md`
- `scripts/publish-grounded-blog-batch.mjs`
- `scripts/blog-seo-data.mjs`
- `scripts/convex-seed-data.mjs`
- `scripts/build-convex-seed.mjs`
- Existing `validation/*/payload.json` and `scripts/blog-batches/*.json` packages

## Deliverables

1. `docs/blog-agent-upload-runbook.md` with:
   - draft versus publish authority boundaries;
   - required research/evidence package;
   - exact folder, payload, SEO manifest, and batch structures;
   - exact commands for audit, publish, duplicate-run verification, seed rebuild, build, IndexNow, and route validation;
   - update/slug/asset-key rules and common failure recovery;
   - a final handoff checklist suitable for another agent.
2. A short pointer from `docs/blog-writing-automation-contract.md` to the operational runbook.
3. Validation evidence proving referenced paths and commands exist and the Markdown is internally consistent.

## Acceptance criteria

- The runbook never instructs an agent to use the web editor.
- The publisher command always includes an explicit batch path.
- Examples use native blocks, `assetKey`, descriptive `alt`, caption `text`, and measured dimensions; they contain no persisted delivery URL or `storageId`.
- The runbook explains that draft preparation is not publication and that `status: "published"` plus a truthful `publishedAt` is required only after explicit publish authority.
- The runbook identifies `completeBlogSeoData()` manifest registration and deterministic seed registration as distinct required repository steps.
- The first run and no-op second run expectations are documented.
- IndexNow acknowledgement is described as notification, not guaranteed indexing, and failure is not described as a publish rollback.
- All referenced commands and repository files are verified locally.
- Only task-related documentation, plan, task log, and validation evidence are committed.

## Validation plan

1. Parse every JSON example extracted from the runbook.
2. Check every referenced local file and npm script exists.
3. Run the Blog prose audit on the runbook where applicable.
4. Review the final diff and verify unrelated worktree changes remain unstaged.
5. Commit and push the completed documentation.
