# Legacy Supabase Reference

The application no longer reads or writes Supabase. `schema.sql` is retained only
as an offline recovery and audit reference for the inaccessible legacy database.

The reproducible data transformations that were recoverable from Git now live in
`scripts/convex-seed-data.mjs`; the Convex migration entry point is
`npm run convex:migrate`.
