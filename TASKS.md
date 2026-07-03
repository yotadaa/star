# Tasks

## Active

- [ ] **Improve Home performance** - real-image/R3F hero is currently laggy and heavy.
- [ ] **Commit every completed work unit** - after a coherent implementation + validation pass, create a git commit before starting the next unrelated unit. See `plans/commit-validation-workflow.md`.
- [ ] **Replace native dropdowns with custom controls** - later, scan all built-in HTML dropdowns/selects and replace them with design-system custom dropdowns.

## Waiting On

## Someday

## Done

- [x] ~~**Shrink utility chat/login from medium screens** - collapse the top-left Chat/Login bar into the circle menu on tablet/medium view so it does not force the navbar downward; screenshot evidence: `screenshots/utility-medium-2026-07-03/medium.png`, `medium-open.png`, `mobile.png`, `desktop.png`.~~ (2026-07-03)
- [x] ~~**Compress parallax images** - losslessly compress image assets in `public/assets/parallax/` and `source/` while preserving alpha and scene composition; saved ~1.32MB.~~ (2026-07-03)
- [x] ~~**Fix mobile parallax layer seams** - reduce mobile scroll parallax drift and add mobile-specific landscape overlap; screenshot evidence: `screenshots/parallax-mobile-2026-07-03/mobile-scrolled.png`, `desktop.png`.~~ (2026-07-03)
- [x] ~~**Optimize codebase for Vercel deploy** - split heavy Home/global chunks, stop closed-chat polling, enable Next image optimization, and verify Home first-load JS at 127 kB; evidence: `npm run build`, `screenshots/vercel-optimization-2026-07-03/mobile-production.png`.~~ (2026-07-03)
- [x] ~~**Shrink mobile utility bar into floating circle menu** - on narrow/mobile view, collapse World Chat/Login floating bar into one circular trigger; screenshot evidence: `screenshots/utility-mobile-2026-07-03/mobile-closed.png`, `mobile-open.png`, `desktop.png`.~~ (2026-07-03)
- [x] ~~**Fix World Chat send + Supabase Realtime** - make the Kirim button submit, subscribe to `chat:public` broadcast events across all shards, and keep polling as backup.~~ (2026-07-03)
- [x] ~~**Gate Blog CMS actions to owner email** - only `mukhtadanasution@gmail.com` can add/edit/archive blog content; visitors no longer see `// CMS ACCESS`.~~ (2026-07-03)
- [x] ~~**Rebuild Blog list/editor from mockup** - implement grid/list categories, owner row actions, Medium-style seamless block editor, block insert menu, table/list/icon blocks, and editable header caption.~~ (2026-07-03)
- [x] ~~**Shorten Inventory item names** - compact long inventory labels while preserving full names in detail metadata.~~ (2026-07-03)
- [x] ~~**Remove Home hero glass text container** - remove the glass text container from the Home hero.~~ (2026-07-03)
- [x] ~~**Polish Build Glimpses carousel to design system** - replace soft carousel styling with token gradient, hard-shadow card frame, RarityTag category badges, square node dots, PixelButton arrows, stronger HUD chip contrast, and inactive-card state.~~ (2026-07-03)
- [x] ~~**Build PlayerStatusPopup system** - Inventory / Achievement / Mission modal connected by Player Points, derived level thresholds, segmented mission progress, inventory artifacts, toast events, and new sprite icons.~~ (2026-07-03)
- [x] ~~**Add popup entry to IslandNav** - add backpack trigger, mini level badge, and connect it to the PlayerStatusPopup.~~ (2026-07-03)
- [x] ~~**Generate HTML build** - produce a built HTML/static artifact for the app when ready.~~ (2026-07-03)
- [x] ~~**Split Chat/Login into a top-left utility bar** - keep IslandNav focused and responsive.~~ (2026-07-03)
- [x] ~~**Configure Google Auth.js login** - server-only OAuth secrets, JWT session, and owner-aware route guards.~~ (2026-07-03)
- [x] ~~**Add route-state pages** - design-system-aligned not-found, forbidden, and allowlisted redirect routes.~~ (2026-07-03)
- [x] ~~**Apply Supabase round-robin backend schema** - apply backend schema to all three Supabase projects with explicit grants/RLS.~~ (2026-07-03)
- [x] ~~**Migrate feature databases to all Supabase shards** - apply Blog, Chat, Inventory, About, and Contact tables/policies to every configured shard.~~ (2026-07-03)
- [x] ~~**Implement Blog CMS + feature backend wiring** - execute `plans/blog-implementation/` with Auth.js owner guard, Supabase round-robin feature APIs, factual fallback for read-only pages, and visual validation.~~ (2026-07-03)
