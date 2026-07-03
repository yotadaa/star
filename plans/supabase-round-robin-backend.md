# Supabase Round-Robin Backend Foundation

## Source

Steered request: use the three Supabase projects in `docs/supabase/` and
`DB_PASSWORD` from `.env.local`, then round-robin data and file storage across
the three databases/buckets while recording where each item lives so it can be
fetched back.

## Task

### Task: Backend 1 - Supabase shard router and storage ledger

- Sumber spesifikasi: user request 2026-07-03, `AGENTS.md` §1 and §5,
  Supabase Storage/Database API docs.
- Halaman/letak persis: server-only backend (`lib/backend/*`,
  `app/api/backend/*`), setup SQL/script (`docs/supabase/schema.sql`,
  `scripts/setup-supabase-shards.mjs`).
- Elemen & struktur:
  - Three shard descriptors: project ref, publishable key, storage endpoint,
    S3 region/access key env names.
  - Write selection starts at a random shard and advances round-robin per
    process.
  - Record IDs and file IDs include the shard prefix (`s1_`, `s2_`, `s3_`).
  - Metadata tables keep `shard_id`, `bucket_id`, `object_path`, and file
    metadata for deterministic fetch.
- Dependency baru dibutuhkan?: TIDAK. `@supabase/supabase-js` is already in
  `package.json`; S3 requests use server-side signed `fetch`.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: TIDAK for backend plumbing. No fabricated portfolio
  data is added.
- Acceptance criteria:
  1. `npm run build` passes.
  2. `/api/backend/health` returns shard statuses without leaking secrets.
  3. POST/GET record flow stores on one shard and reads it back by encoded ID.
  4. File upload metadata stores bucket/path/shard and can return a signed
     fetch URL or stream from the matching bucket.
  5. `.env.example` documents placeholders only; real credentials remain local.
- Guardrail relevan:
  - No dependency added without confirmation.
  - No secret exposed through `NEXT_PUBLIC_` unless it is explicitly a
    publishable key and already supplied as such.
  - No fake stats/data; only backend test records during validation, then
    clean them up when possible.
  - RLS/Data API access must use explicit grants and a server-only app API key.
- Status: blocked on remote schema application (`DB_PASSWORD` rejected by
  Supabase Postgres for the configured projects)

## Validation Notes

- Supabase changelog checked on 2026-07-03:
  - New public tables may not be exposed to Data API automatically; schema must
    include explicit grants.
  - Storage upload policies require INSERT and upsert requires SELECT/UPDATE.
- Storage docs checked on 2026-07-03:
  - Buckets can be created by SQL.
  - Server-side storage should use service/S3 keys, not public client access.
- Local build checked on 2026-07-03:
  - `npm run build` passes with the new dynamic backend routes.
- Remote apply checked on 2026-07-03:
  - `npm run supabase:setup` reaches `db.<project-ref>.supabase.co`, but
    Supabase rejects `.env.local` `DB_PASSWORD` for user `postgres`.
  - Regional pooler fallback also rejected the tenant/user, so a dashboard
    database connection string or corrected DB password is required.
