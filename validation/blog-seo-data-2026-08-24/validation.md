# Blog SEO Data Validation — 2026-08-24

## Automated gates

- `npm run convex:typecheck` — passed.
- `npx convex dev --once` — deployed the widened development contract.
- `npm run convex:seed:build` — passed with seed `convex-seed-v2-da1071be7c49` and expected counts: 11 Blog, 14 Inventory, 6 Content, 5 Contact.
- `npm run blog:seo-data` — no-op dry run; 0 of 11 records require changes.
- `npm run blog:seo-data:verify-images` — all 49 encoded images match the checked-in intrinsic dimensions.
- `migrationAudit:seedStatus` — zero duplicate slugs, missing SEO data, missing dimensions, or missing schema versions.
- `npm run build` — optimized Next.js production build passed.
- `git diff --check` — passed.

The backfill was also applied twice during rollout. The first pass updated all 11 records; the second pass updated zero records.

## Rendered article assertions

All eight public `/blog/{slug}` pages passed 10 of 10 checks:

- HTTP 200;
- document title ends `· Mukhtada` and not `· Mukhtada Billah NST`;
- exact canonical article URL;
- exactly one visible H1;
- non-empty meta description;
- no `noindex` directive;
- `BlogPosting` structured data;
- measured Open Graph image width and height;
- semantic machine-readable publication time;
- public route remains indexable.

The DeepSeek article additionally exposed `en-US`, an explicit first-party author identity, `Technical Case Study`, numeric published/modified dates, and a 1672×941 `ImageObject` in its `BlogPosting` JSON-LD. Its visible H1 remains unchanged; only the search/social title uses the shorter SEO wording and suffix.

## Visual gate

### Desktop, 1440 px

- Fully styled page, settled dark phase.
- H1 and summary clear of the floating navigation.
- Article renderer width: 760 px.
- All visible images loaded with real width/height attributes.
- Horizontal overflow: 0 px.

Evidence: `desktop-1440-viewport.png`.

### Mobile, 375×812

- Responsive navigation collapsed as designed.
- H1, summary, metadata strip, and featured image remain readable.
- Article renderer width: 320 px.
- Horizontal overflow: 0 px.
- Images below the viewport remain intentionally lazy; the visible featured image loaded successfully.

Evidence: `mobile-375.png`.

### Reduced motion, 375×812

The in-app browser has no media-emulation capability, so the validation-only Electron helper launched a local offscreen renderer with forced reduced motion. Before capture it asserted:

```json
{
  "reducedMotion": true,
  "overflow": 0,
  "viewport": { "width": 375, "height": 812 },
  "visibleAnimations": 0
}
```

Evidence: `mobile-375-reduced-motion.png` and `capture-reduced-motion.cjs`.

## Convex review

- Public Blog reads return only published records; writes remain internal and the bridge retains its secret plus timing-safe comparison.
- New arguments and return values have explicit validators.
- Public list reads are indexed and bounded; no unbounded `.collect()` path was added.
- Optional schema fields keep the widen-first deployment readable before backfill.
- Durable stored media never persists a resolved Convex delivery URL when a storage ID or asset key exists.
- The publish gate checks content, metadata, dates, and an exact featured-image identity/alt/dimension match.
- No secret or sensitive actor value is logged by the maintenance script.

No unresolved Convex review finding remains.

## Triage

The existing global Nala trigger still occupies a small lower-right area over Blog media at 375 px. This predates the SEO/data work and is already recorded in `TASKS.md` under Someday. No new visual, accessibility, overflow, or indexing defect was introduced by this task.
