# Convex Migration Runbook

Date: 2026-08-22

The application runtime now uses Convex for Blog, World Chat, Inventory,
editable content, Contact, generic records, and files. The inaccessible legacy
Supabase databases are not contacted by any migration step.

## What was recovered

The seed builder only transforms factual repository data:

| Table | Rows in seed |
|---|---:|
| `blogPosts` | 3 |
| `inventoryItems` | 14 |
| `contentEntries` | 6 |
| `contactChannels` | 5 |

The verified seed is `convex-seed-v1-e5d4a727b15e`, with content hash
`e5d4a727b15e728090d5d1624f645345c233c2f0f1b54edc430ba316b32b0bc9`.
World Chat, contact events, generic records/files, and old Nala conversations
start empty because no auditable backup exists. New data created after cutover
is preserved normally.

## Development migration

```bash
npm run convex:bridge:configure
npm run convex:migrate
npm run convex:typecheck
npm run build
```

`convex:migrate` is the required table-generation and data-migration entry
point. It performs these steps in order:

1. Builds deterministic JSONL files and a checksum manifest under the ignored
   `.migration/convex-seed/` directory.
2. Verifies every checksum before contacting Convex.
3. Replaces only the four recoverable seed tables and `seedManifests`.
4. Runs `@convex-dev/migrations` backfills through `migrations:runAll`.
5. Polls the internal migration audit and fails on count mismatches, duplicate
   business keys, or missing `schemaVersion` values.

The four seeded tables are deliberately replaceable. Do not run this command
after allowing production edits to those tables unless the seed strategy has
first been changed from `--replace` to a reviewed merge/upsert migration.

## Production cutover

Production has intentionally not been imported by the development migration.
At an approved maintenance window:

```bash
npx convex deploy
npm run convex:bridge:configure:prod
npm run convex:migrate:prod
```

Then configure the production Next.js host with:

- `NEXT_PUBLIC_CONVEX_URL` from the production Convex deployment.
- The same server-only `CONVEX_INTERNAL_API_KEY` configured by the production
  bridge command.
- Existing Auth.js values (`AUTH_SECRET`, `AUTH_URL`, Google credentials,
  `OWNER_EMAIL`, and `NEXT_PUBLIC_AUTH_ENABLED`).

Verify `/api/backend/health`, `/api/blog/posts`, `/api/chat/messages`,
`/api/about/entries`, `/api/inventory/items`, and `/api/contact/channels` before
removing the old provider variables from the production host. Locally,
`npm run convex:env:prune-legacy` removes only `DB_PASSWORD` and `SUPABASE_*`
keys without printing their values.

## Realtime World Chat

The browser subscribes directly with `useQuery(api.worldChat.listLatest)`. A
message write still crosses the Auth.js-protected Next.js route, which invokes a
secret-checked Convex bridge action. Convex invalidates the query subscription
after the mutation, so there are no shard fan-outs, browser Supabase clients, or
15-second polling fallback.

The migration was validated with two independent browser clients. A temporary
smoke message reached both clients reactively and was then hard-deleted; the
test function was removed from the final Convex deployment, and existing user
messages were preserved.

## Deferred boundary

Nala can still answer from factual local/Convex-backed tools, but conversation
persistence is disabled. Migrating Nala history/streaming to
`@convex-dev/agent` remains a separate confirmation gate because the old
conversation database is inaccessible and the Agent component changes the
storage/streaming model.
