# Global `write-grounded-blogs` Skill Validation

## Installed topology

- Canonical package: `/home/tada/.agents/skills/write-grounded-blogs`
- Codex alias: `/home/tada/.codex/skills/write-grounded-blogs`
- Claude Code alias: `/home/tada/.claude/skills/write-grounded-blogs`
- Both aliases resolve to the canonical package.
- Recoverable pre-global Codex backup: `/home/tada/.local/share/agent-skill-backups/write-grounded-blogs/2026-08-27T11-51-06-191Z/codex`
- No existing Claude package was replaced.

## Canonical package contents

```text
SKILL.md
agents/openai.yaml
references/blog-agent-upload-runbook.md
references/blog-writing-automation-contract.md
references/editorial-principles.md
references/evidence-and-visuals.md
scripts/audit_blog.py
```

No `__pycache__` or unrelated file was copied into the package.

## Checksums

```text
3fd2b5b3f25e990263c82f1e03e9b720c1a2dbae6d01ac2250b7f279bfba019f  SKILL.md
f622dd5897d42b9944cb764323a0681ae00f83a9c101c6a9cc08f392a02bc5d3  agents/openai.yaml
3b257301ad2dd4627337ffe4a1c79f37b4f4d3ef71934bb73136f6122064cd49  references/editorial-principles.md
84b9cb0663218e874c6a108c575246efeccf3f35313bdf69cbdfd1f44105dcd7  references/evidence-and-visuals.md
272b01f883ddaef5e73f4406cd5b860348d997e7304f1189f82166c41b77aa02  references/blog-writing-automation-contract.md
7f92ac3bdba906783275844c73344ebcc9832bb8aa3643d5d5dd3bbc4e21436e  references/blog-agent-upload-runbook.md
62d7fb91b95302358f9fc3f58e80a6aea6e60a57907dc90bfaeb9996c31e08b8  scripts/audit_blog.py
```

The bundled contract checksum matches `docs/blog-writing-automation-contract.md`. The bundled upload-runbook checksum matches `docs/blog-agent-upload-runbook.md` after its canonical skill path was updated.

## Structural validation

`quick_validate.py` passed independently for:

- the canonical `~/.agents` path;
- the Codex symlink path;
- the Claude Code symlink path.

The skill body is 195 lines, below the 500-line progressive-disclosure threshold. Its YAML frontmatter contains only `name` and `description`, and the directory name matches `name`.

## Script smoke test

`scripts/audit_blog.py` was executed through the canonical, Codex, and Claude paths against `docs/blog-agent-upload-runbook.md`. All three outputs were byte-identical:

- 2,551 words
- 27 headings
- 9 URLs
- 0 hard findings
- 1 manually accepted uniform-rhythm warning arising from technical checklists

## Claude Code discovery test

Claude Code `2.1.246` was started in `/tmp` with no tools, so no project skill or repository context could satisfy the request. Direct `/write-grounded-blogs` invocation returned:

```text
CONTRACT=blog-writing-automation-contract.md
PUBLISH_WITHOUT_AUTHORITY=no
```

This proves the personal skill was discovered through `~/.claude/skills`, its bundled Star reference was visible, and its publication boundary remained active.

## Independent-agent forward test

An isolated agent was asked to prepare, but not publish, a Star Blog investigation using the canonical skill path. It correctly:

- loaded `editorial-principles.md`, `evidence-and-visuals.md`, `blog-writing-automation-contract.md`, and `blog-agent-upload-runbook.md`;
- kept the payload at `status: "draft"`;
- refused R2, Convex, IndexNow, commit, and push mutations without authorization;
- selected `npm run blog:publish:grounded-batch -- scripts/blog-batches/<batch-name>.json` as the later authorized publisher;
- required an unchanged second run with `action: "updated"`, `uploads: 0`, and `reused` equal to the asset count.

## Installer idempotency

The first run created the canonical package, backed up the old Codex directory, and created two aliases. A later real run performed only:

- `refresh-bundled-references` for the canonical package;
- `keep-alias` for Codex;
- `keep-alias` for Claude.

It created no additional backup and no duplicate skill package.

## Repository checks

- Installer JavaScript syntax: passed.
- `package.json` parse and npm-script lookup: passed.
- Local Markdown links: passed.
- Global installation guide prose audit: 276 words, 5 headings, 2 URLs, 0 hard findings, 0 warnings.
- `npm run convex:typecheck`: passed.
- `git diff --check`: passed.
