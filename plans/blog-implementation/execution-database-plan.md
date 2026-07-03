# Blog + Backend Feature Execution Plan

Tanggal: 2026-07-03

## Evidence Sources

- `AGENTS.md`: fase DISCOVER -> PLAN -> IMPLEMENT -> VALIDATE -> LOG, no fabricated data, no new npm dependency without explicit owner confirmation, evidence-first validation.
- `PRODUCT.md`: gamification cannot rely on emoji as permanent production UI; feedback must stay non-blocking; no generic SaaS/glass drift.
- `design-system.md`: pixel labels use Silkscreen, hard-card border/shadow, token colors, reduced-motion and focus-visible requirements.
- `plans/blog-implementation/implementation-plan.md`: `/blog` public, `/blog/admin` owner-only, block-based CMS, login copy "Login ke System", Supabase-backed storage, no visitor write for admin content.
- `plans/blog-implementation/blog-editor-mockup.html`: editor surface uses neobrutalist hard borders, sectioned status chips, block toolbar, and side metadata.
- `docs/supabase/schema.sql`: existing round-robin foundation stores `shard_id` in every record and uses `private.is_backend_request()` from the `x-backend-api-key` header.

## Architecture Decision

The app uses Auth.js Google sessions, not Supabase Auth sessions. Because Supabase RLS helpers such as `auth.uid()` only represent Supabase Auth JWTs, feature writes will go through Next.js route handlers. Those handlers validate Auth.js role/session first, then call Supabase with the existing internal backend header.

Feature records keep `shard_id` and routed IDs (`s1_...`, `s2_...`, `s3_...`) so writes can round-robin randomly and reads can return to the original shard.

## Feature Schema

### Blog Feature

- Table: `public.blog_posts`
- Owner-only writes through API route.
- Public reads only for `status = 'published'`, backend reads include draft.
- Block content is `jsonb` and seeded/fallback content comes from `lib/data.js`.

### Chat Feature

- Tables: `public.chat_profiles`, `public.chat_messages`
- Logged-in users can post through API route.
- Messages store display name and source email from Auth.js; public read is limited to non-deleted messages.
- Realtime publication is enabled when migration can run; UI must keep polling fallback so chat still works if realtime is unavailable.

### Inventory Feature

- Table: `public.inventory_items`
- Public read for unlocked/published items.
- Owner-only writes through API route.
- Local derived `lib/playerProgress.js` remains the factual fallback.

### About Feature

- Table: `public.about_entries`
- Public read of profile/section entries.
- Owner-only writes through API route.
- Local `lib/data.js` remains fallback to avoid fabricated profile text.

### Contact Feature

- Tables: `public.contact_channels`, `public.contact_events`
- Public read of active channels.
- Owner-only write for channel metadata.
- Event insert can be public/server accepted, but no PII beyond route/action metadata.
- Local `socials` from `lib/data.js` remains fallback.

## Blocked Item

Remote migration is blocked if Supabase still rejects `.env.local` database passwords. Evidence from the setup attempt: direct host connection reached Supabase Postgres, but shard `s1` (`bmidlseqfflcswamyhtd`) returned `password authentication failed for user "postgres"`.

The migration script now supports per-shard passwords:

- `SUPABASE_SHARD_1_DB_PASSWORD`
- `SUPABASE_SHARD_2_DB_PASSWORD`
- `SUPABASE_SHARD_3_DB_PASSWORD`

If those are absent, it falls back to the shared `DB_PASSWORD`.

## Acceptance Criteria

1. Schema migration file includes all requested feature tables, RLS, explicit grants, and realtime publication for chat.
2. Next.js API routes expose blog, chat, inventory, about, and contact functionality with owner/session checks where required.
3. Public UI reads backend first and falls back to local factual data when schema/credentials are unavailable.
4. Admin/editor UI uses design-system neobrutalist styling and no new npm dependency.
5. `npm run build` passes.
6. Migration attempt is executed against all three shards; if credentials fail, result is logged as blocked rather than claimed complete.
7. Screenshots are captured and visually reviewed for the changed routes/components.
