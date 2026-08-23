# Convex Migration Runbook

Date: 2026-08-22

The application runtime now uses Convex for Blog, World Chat, Nala runtime
settings, Inventory, editable content, Contact, generic records, and files. The
inaccessible legacy Supabase databases are not contacted by any migration step.

## What was recovered

The seed builder only transforms factual repository data:

| Table | Rows in seed |
|---|---:|
| `blogPosts` | 5 |
| `inventoryItems` | 14 |
| `contentEntries` | 6 |
| `contactChannels` | 5 |

The verified seed is `convex-seed-v1-619099a654b6`, with content hash
`619099a654b6ff278855e8e3ad9f87d1b015dd787703db17ed6f77ece7d3ed8c`.
World Chat, contact events, generic records/files, and old Nala conversations
start empty because no auditable backup exists. New data created after cutover
is preserved normally.

`nalaSettings` is operational state, not recovered content. It is created by an
owner/backend mutation as a singleton with `configKey: "primary"`; it is not
part of the replaceable seed. The OpenRouter key is never stored in Convex.

## Development migration

```bash
npm run convex:bridge:configure
npm run convex:migrate
npm run blog:publish:portfolio
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

The portfolio Blog seed stores stable asset keys, not deployment-specific file
URLs. `blog:publish:portfolio` uploads the four repository screenshots to the
selected deployment, stores their `_storage` IDs, and upserts the post. The
publisher is safe to rerun: an unchanged SHA-256 reuses the existing file.
The `files` table is outside the replaceable seed, so later content imports can
resolve the same assets by their indexed keys.

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
npm run blog:publish:portfolio
```

Run the publisher only after `CONVEX_CLOUD_URL` and the server-only
`CONVEX_INTERNAL_API_KEY` point to the production deployment.

Then configure the production Next.js host with:

- `CONVEX_CLOUD_URL` (`.convex.cloud`) from the production deployment. The
  root server layout passes this public address to `ConvexReactClient`, while
  server reads and writes use `ConvexHttpClient` directly.
- `CONVEX_HTTP_URL` (`.convex.site`) for the deployment's HTTP Actions origin.
  It remains distinct from the cloud URL and is not supplied to either client.
- The same server-only `CONVEX_INTERNAL_API_KEY` configured by the production
  bridge command.
- Existing Auth.js values (`AUTH_SECRET`, `AUTH_URL`, Google credentials,
  and `NEXT_PUBLIC_AUTH_ENABLED`). Owner access is pinned in `auth.js` to
  `mukhtadanasution@gmail.com`, not selected by a deployment variable.
- `NALA_KEY` as a server-only OpenRouter credential.
- `NEXT_PUBLIC_SITE_URL=https://me.mukhtada.my.id` for canonical metadata and
  the OpenRouter referer. `NALA_MODEL` is only a bootstrap default; once the
  singleton exists, `/manage` owns the persisted model slug.

Verify `/api/backend/health`, `/api/blog/posts`, `/api/chat/messages`,
`/api/about/entries`, `/api/inventory/items`, and `/api/contact/channels` before
removing the old provider variables from the production host. Locally,
`npm run convex:env:prune-legacy` removes only `DB_PASSWORD` and `SUPABASE_*`
keys without printing their values.

## Realtime World Chat

The browser subscribes directly with `useQuery(api.worldChat.listLatest)`. A
message write still crosses the Auth.js-protected Next.js route, which invokes a
secret-checked Convex bridge action. Optional `replyToId` values must resolve to
an active parent. The public query resolves the parent quote in the same batch;
if that parent is later deleted, child replies remain but receive
`replyUnavailable` without the deleted content.

Only the pinned owner or the protected backend actor can delete a message.
Deletion is an idempotent internal soft mutation that stores deletion time and
actor key, removes the row from active subscriptions, and preserves the audit
record. Convex invalidates the query subscription after mutations, so there are
no shard fan-outs, browser Supabase clients, or 15-second polling fallback.

The migration was validated with two independent browser clients. A temporary
smoke message reached both clients reactively and was then hard-deleted; the
test function was removed from the final Convex deployment, and existing user
messages were preserved.

## Nala configuration and deferred boundary

Nala answers through OpenRouter chat completions with at least one factual,
read-only local/Convex-backed tool. The current singleton is enabled with
`nvidia/nemotron-3-ultra-550b-a55b:free`; the owner can change the slug,
temperature, max tokens, prompt supplement, or kill switch from `/manage`.
The management API and the Convex mutation both enforce owner/backend access.

Conversation persistence remains disabled: `/api/nala/chat` returns
`storage: null`, the browser keeps only current-session history, and old Nala
conversations were not recoverable. Migrating history/streaming to
`@convex-dev/agent` remains a separate confirmation gate because the Agent
component changes the storage and streaming model.
