# Global `write-grounded-blogs` Skill

`write-grounded-blogs` is installed once as an Agent Skills package and shared by local agent runtimes.

## Discovery paths

| Consumer | Discovery path | Role |
|---|---|---|
| Agent Skills-compatible tools configured for the shared root | `~/.agents/skills/write-grounded-blogs` | Canonical package |
| Codex | `~/.codex/skills/write-grounded-blogs` | Symlink to canonical package |
| Claude Code | `~/.claude/skills/write-grounded-blogs` | Symlink to canonical package |

The package includes:

- `SKILL.md` with the Evidence-to-Story workflow;
- `references/editorial-principles.md`;
- `references/evidence-and-visuals.md`;
- `references/blog-writing-automation-contract.md`, copied from the repository contract;
- `references/blog-agent-upload-runbook.md`, copied because the contract routes Star publishing work to it;
- `scripts/audit_blog.py`;
- `agents/openai.yaml` for Codex UI metadata.

[Claude Code's official skills documentation](https://code.claude.com/docs/en/skills) supports personal skills at `~/.claude/skills/<skill-name>/SKILL.md` and directory symlinks. The package follows the portable [`SKILL.md` Agent Skills specification](https://agentskills.io/specification); runtimes configured to scan the shared `~/.agents/skills` root can consume the same canonical files without creating independently editable copies.

## Install or refresh

Run a read-only preview first:

```bash
npm run skill:write-grounded-blogs:install -- --dry-run
```

Then install or refresh:

```bash
npm run skill:write-grounded-blogs:install
```

On first installation, an existing Codex or Claude package is moved to a recoverable timestamped backup under:

```text
~/.local/share/agent-skill-backups/write-grounded-blogs/
```

Later runs keep correct symlinks and refresh the two bundled Star references from `docs/`.

For another runtime, confirm its documented personal-skill directory, then point only that runtime's `write-grounded-blogs` entry at the canonical `~/.agents/skills/write-grounded-blogs` directory. The installer manages Codex and Claude because those discovery paths are verified on this machine; it does not guess paths for uninstalled tools.

## Update rules

- Edit the canonical global package when changing the universal workflow.
- Edit `docs/blog-writing-automation-contract.md` or `docs/blog-agent-upload-runbook.md` in the repository when changing Star-specific requirements, then rerun the installer to refresh the bundled copies.
- The skill tells agents to prefer the live repository contract when it exists and is newer or more specific.
- Do not replace one alias with a separate copied package; that reintroduces configuration drift.

## Validation

```bash
python /home/tada/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  ~/.agents/skills/write-grounded-blogs

python /home/tada/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  ~/.codex/skills/write-grounded-blogs

python /home/tada/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  ~/.claude/skills/write-grounded-blogs
```

Run the audit script through each path against the same fixture. Matching results prove that every consumer is executing the canonical package.
