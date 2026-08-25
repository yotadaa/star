# Convex File Storage to R2 validation

Date: 2026-08-26
Deployment: `dev:impartial-basilisk-364`
Production changed: no

## Restore point

- Complete Convex export with File Storage: `/home/tada/Backups/star/convex-dev-pre-r2-2026-08-26.zip`
- Export size: 65,741,187 bytes
- Export SHA-256: `3b7c6f9c597090a17c4bbe387e028a1087fdb012a760be631c66c289100a1486`
- Export inventory: 69 `_storage` objects, 69 logical file rows, 24 Blog rows, 21 published posts, no orphaned storage/file rows, and no private record attachments

## Copy and reconciliation gates

| Gate | Result |
|---|---:|
| Logical file rows | 69 |
| R2-verified file rows | 69 |
| Pending migrations | 0 |
| Failed migration jobs | 0 |
| Verified migration jobs | 69 |
| Convex rollback references retained | 69 |
| R2 object count | 69 |
| R2 byte total | 66,351,372 |
| Source byte total | 66,351,372 |
| Blog image occurrences | 96 |
| Stored Blog image occurrences | 89 |
| Intentional external GitHub images | 7 |
| Blog `storageId` references after rewrite | 0 |
| Unresolved stored Blog assets | 0 |

Each migrated object was downloaded from Convex, hashed, copied to a content-addressed R2 key, downloaded from R2, and compared by full SHA-256 and byte length before its file row was marked active on R2. No source object was deleted.

## Delivery and write gates

- Canary stable route returned HTTP 307 with a 120-second cache boundary, followed by HTTP 200 from R2.
- Canary response: `image/png`, 623,420 bytes, SHA-256 `261627fc63429eec9c761daa0108f7ee7abab8cbb589718ee76aae4191a81a3f`.
- Published Blog query: 21 posts, 96 image occurrences, 89 `/api/media/` sources, seven external GitHub sources, zero Convex Storage URLs, and zero exposed `storageId` fields.
- Idempotent new-write canary: signed R2 PUT returned HTTP 200, committed to the same logical file row, retained the legacy Convex reference, and returned the stable media URL.
- Idempotent full migration rerun: zero pending copies, zero Blog references rewritten, and zero posts updated.
- Final audit after the write canary remained 69 verified, zero pending, zero failed, and zero Blog storage-ID references.

## Code and visual gates

- `npm run convex:typecheck`: pass
- Convex component/schema deployment: pass
- Publisher and migration scripts `node --check`: pass
- `npm run build`: pass; `/api/media/[id]` included as a dynamic route
- Desktop Blog render at 1440 × 900 with reduced motion: [blog-desktop.png](blog-desktop.png)
- Mobile Blog render at 375 × 812 with reduced motion: [blog-mobile.png](blog-mobile.png)
- Media-related failed browser requests in both visual runs: zero

The production dependency audit still reports vulnerabilities in the pre-existing pinned Next.js, Auth.js, PostCSS, Sharp, and NanoID dependency paths. None is introduced through `@convex-dev/r2`; dependency upgrades remain a separate security maintenance task.

## Rollback state

Rollback remains possible because every `files.storageId` and every original Convex blob is retained. Do not delete Convex objects until the owner explicitly closes the retention window. Production requires its own export and migration run; this development result is not a production backup.
