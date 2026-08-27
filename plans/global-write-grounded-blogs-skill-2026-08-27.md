# Global Write Grounded Blogs Skill Plan

## Objective

Make `write-grounded-blogs` available as one global Agent Skills package to Codex, Claude Code, and agents that discover `~/.agents/skills`, while bundling the Star Blog automation contract inside the skill.

## Sources of truth

- `/home/tada/.codex/skills/write-grounded-blogs/SKILL.md`
- `/home/tada/.codex/skills/.system/skill-creator/SKILL.md`
- `docs/blog-writing-automation-contract.md`
- `docs/blog-agent-upload-runbook.md`
- Agent Skills specification and Claude Code personal-skill discovery documentation

## Implementation

1. Preserve the existing skill as the behavioral source and add a bundled Star Blog contract reference.
2. Add explicit routing instructions so general Blog work loads the universal evidence/editorial references, while Star repository publication also loads the bundled contract and live operational runbook.
3. Install one canonical package at `~/.agents/skills/write-grounded-blogs`.
4. Point `~/.codex/skills/write-grounded-blogs` and `~/.claude/skills/write-grounded-blogs` to that canonical package with filesystem symlinks.
5. Preserve any replaced agent-specific package in a recoverable backup outside discovery roots.
6. Add repository documentation recording the canonical path, consumer aliases, bundled contract, validation commands, and update procedure.

## Acceptance criteria

- The canonical package contains `SKILL.md`, `agents/openai.yaml`, `scripts/audit_blog.py`, the editorial/evidence references, and a complete copy of `blog-writing-automation-contract.md`.
- The `SKILL.md` frontmatter remains portable Agent Skills YAML with only `name` and `description`.
- Codex and Claude paths resolve to the same canonical directory and do not create duplicate independently editable copies.
- The skill tells agents to read the bundled contract for Star Blog work and to prefer the live project contract when it is available.
- `quick_validate.py` passes for the canonical package and through both agent-specific paths.
- The audit script executes successfully through the canonical, Codex, and Claude paths.
- Claude Code discovers the personal skill from `~/.claude/skills`.
- An independent agent can identify the correct draft, publish, and no-op rerun boundaries from the installed package.
- No unrelated local worktree changes are staged.

## Validation evidence

Record checksums, symlink targets, validator output, audit-script smoke output, Claude discovery evidence, and the independent-agent result under `validation/global-write-grounded-blogs-skill-2026-08-27/`.
