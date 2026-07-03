# Commit And Validation Workflow

## Source

Steered request: commit every completed work unit.

## Rule

After a coherent implementation unit is done, validated, and logged, create a
git commit before starting the next unrelated unit.

## Done Means

1. Implementation scope is complete.
2. `npm run build` passes.
3. Relevant route screenshots are captured and visually audited.
4. `TASKS.md` is updated:
   - Active task moved to Done when applicable.
   - Date added in existing format.
5. Commit message mentions the user-facing unit, not a vague "updates".

## Validation Evidence To Keep

- Screenshot folder path.
- Build command result.
- Noted visual issues found and fixed during screenshot audit.
- Any task that remains blocked due to required confirmation.

## Current Notes

- `AGENTS.md` requires one task/component per commit cycle.
- Rarity mapping, medal mapping, PP thresholds, and popup data mapping contain
  assumptions that should not be silently finalized without owner confirmation.

