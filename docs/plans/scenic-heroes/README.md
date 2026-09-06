# Scenic heroes — implementation plan

Date: 2026-09-06 · Owner: Mukhtada · Execution order: About → Projects → Research → Blog → Contact.

## 1. Approved contract

The owner approved the interactive biome mockup, requested more realistic textures and independently animated objects, a seamless hero-to-content fade, a detailed trackable plan followed immediately by implementation, and a separate commit for every completed page. The subsequent clarification explicitly requires maintainable, scalable, reusable code without hardcoded page components.

The approved reference is `portfolio-biome-atlas.html` from the conversation, summarized in `docs/research/hero-worlds-2026-09-06/biome-mockup-plan.md`. It is a composition and interaction reference, not production source or production imagery.

Precedence: current owner approval → `PRODUCT.md` → existing palette/type roles → this task specification. The old `report.md` does not describe new biomes. Its unrelated rarity, medal, skill-tree and XP tasks are outside this change. No new professional facts, score, backend achievement, audio, dependency, or Home scenery.

## 2. Deliverables and completion ledger

| ID | Page / unit | Status | Dependencies | Evidence | Commit |
|---|---|---|---|---|---|
| SH-00 | Plan, source inventory, architecture decision | committed | approved mockup | this folder | a1892de |
| SH-01 | Shared primitives + About canopy | committed | SH-00 | `validation/biome-heroes-2026-09-06/about/` | 4c4e5a7 |
| SH-01b | Shared phase transitions + Home | committed | SH-01 | `validation/hero-time-transition-2026-09-06/` | 6884b95 |
| SH-01c | About stability, readable copy, foreground breakout | owner-accepted; follow-ups open | SH-01b | `validation/hero-time-transition-2026-09-06/README.md` | pending |
| SH-02 | Projects desert | validating | owner approved proceeding from SH-01c | `validation/biome-heroes-2026-09-06/projects/` | pending |
| SH-03 | Research future city | planned | committed SH-02 | `validation/biome-heroes-2026-09-06/research/` | pending |
| SH-04 | Blog snow | planned | committed SH-03 | `validation/biome-heroes-2026-09-06/blog/` | pending |
| SH-05 | Contact underwater | planned | committed SH-04 | `validation/biome-heroes-2026-09-06/contact/` | pending |
| SH-06 | Final five-route integration review | planned | SH-01–05 | `validation/biome-heroes-2026-09-06/summary.json` | within SH-05 |

Statuses: planned → assets-in-progress → implementing → validating → validated → committed. A failed check returns the unit to implementing. Update the page checklist and this ledger together; never report an asset or page complete without its evidence. The next page starts after the prior page commit. On 2026-09-07 the owner explicitly accepted the caption iteration and requested moving forward; About's remaining motion-budget and hover-label checks are retained as follow-ups rather than falsely marked passed.

## 3. Architecture decision

Sol reviewed the live route structure, existing theme aliases, dirty worktree boundaries, and renderer choices. Adopt SSR DOM images + CSS motion + small reusable interaction controllers. Do not add Canvas/WebGL/R3F or clone Home's renderer.

### Public component contracts

| Module | Responsibility | Must not contain |
|---|---|---|
| `ScenicHero` | Semantic frame, existing title/caption slot, content anchor, atmosphere controls and journal | page-name conditionals, fetched copy, backend writes |
| `ScenicScene` | Map a validated scene definition into depth groups and objects | route-specific JSX or embedded base64 artwork |
| `ScenicObject` | Responsive positioning, pivot, separate parallax and ambient transforms, image and stationary accessible target | absolute viewport assumptions, competing transforms |
| `useScenicLifecycle` | Visibility, reduced motion, user pause, overlays, pointer coalescing and cleanup | global provider imports, animation loops in React state |
| `useScenicInteraction` | Reusable behavior strategies: depth, uncover, activate, approach, hop | checks such as `page === 'about'` |
| `discoveryJournal.mjs` | Versioned allowlisted session-local observations, corruption and storage failure handling | XP, account state, HTML from storage |
| route scene definition | Asset IDs, layer depth, per-breakpoint placement, pivot, motion parameters, allowed behaviors and labels | copied markup, page content, network logic |

Place modules in `components/scenic-hero/`; one scene-definition file per route under `components/scenic-hero/scenes/`. Each page imports only its own definition, so later scenes do not enter About's bundle. Asset descriptors are data, not components with hardcoded route branches. Keep reusable math/state in small pure `.mjs` helpers with meaningful tests.

New behaviors extend the behavior registry through one documented strategy; new scenery uses the same frame and object primitives. No one-file scene engine with five unrelated page branches. Do not overgeneralize the existing portfolio or introduce a generic game engine.

### Rendering and lifecycle

1. Render title, editable caption and first-paint artwork on the server. Hydration adds optional exploration.
2. Outer object wrapper owns layout/pivot; depth wrapper owns focus blur; parallax wrapper owns pointer translation; inner wrapper owns ambient or triggered animation. Transform ownership is explicit.
3. Animation runs only while visible, in viewport, unpaused, no global overlay is present, and reduced motion is off. Hidden/offscreen work suspends and cleans up on unmount.
4. Observe existing HTML phase attributes and centralized overlay selectors rather than depend on preexisting uncommitted `SiteContext` changes. Test command palette, player status and world chat independently.
5. Pointer movement schedules at most one pending animation frame; no idle JS frame loop and no React state writes per frame. Disable pointer parallax on coarse pointers.
6. Native keyboard targets remain at least 44×44px. A focused organism remains anchored; activation moves the inner image locally and never moves the focus ring away.
7. Reduced motion shows complete static scenery and immediate interaction end states. User pause suspends all looping motion. No hover-only requirement.
8. Depth focusing is enabled only by the About configuration. Other pages have ordinary parallax and their own behaviors.

### Content and smooth transition

Retain `publicPageCopy.<page>.title`, existing owner-editable captions, route metadata, authentication checks, body data and lists. Pass the existing `EditablePageCaption` as a child slot; remove only that route's old `PageHeader` instance. Exactly one h1 remains.

Hero sits before a normal narrow content wrapper. Main CTA scrolls to an actual content anchor with `scroll-margin-top`, and remains useful without JavaScript. Keep existing global navigation/HUD/Nala intact.

The bottom 25–30% of the scene fades to `var(--phase-page)`/inherited `var(--parchment)`. Its last pixels are fully opaque and the following content uses the identical computed token. Overlap by 1px to prevent subpixel seams. Test morning, noon, sunset and night; do not hardcode cream.

Preserve the approved unboxed text composition. The owner rejected both the broad left scrim and a local caption backing during implementation. Use contrasting letter fill/contour,17–20px caption type, and scene-specific placement/tone data. There is no panel behind the copy. Inspect real screenshots and measure the fill/contour pair; existing fixed foreground roles must not inherit night-remapped text incorrectly. See `time-transitions.md` for the approved refinement and evidence.

## 4. Asset production and traceability

Use the built-in image-generation tool for new consistent realistic material assets where matched stock cutouts are unavailable. Source photographs only when author/license/source are verified. No rasterized UI, labels, cards, badges, or page copy.

Produce backgrounds without the interactive subjects. Generate cutouts with actual alpha, generous separation, consistent lens/perspective/light direction, natural imperfections and restrained saturation. A branch and a leaf group are separate objects, not a single animated full-scene poster. Bird/fish frames represent the same organism with stable proportions.

### Asset pipeline per page

- [ ] Inventory every visible ingredient from the approved scene.
- [ ] Record prompt/source, intended crop and role before generation or download.
- [ ] Generate/source the environmental plate and each independent object.
- [ ] Inspect original pixels; reject plastic texture, malformed anatomy, lighting mismatch and baked-in UI.
- [ ] Crop/extract objects, preserve alpha, trim transparent padding; keep source files separate from production output.
- [ ] Export responsive WebP variants; visual comparison must retain useful bark/leaf/material detail.
- [ ] Record SHA-256, dimensions, bytes, alpha, nontransparent bounds, normalized pivot, depth, mobile/desktop safe bounds and motion parameters.
- [ ] Render against light and dark backgrounds to detect matte halos and cut edges.
- [ ] Compose in the real page, then recheck visual scale, focal hierarchy and seams.

Production assets: `public/scenic-heroes/<page>/`. Provenance, prompts and machine-readable manifests: `docs/plans/scenic-heroes/assets/<page>/`. Large raw generations stay in a task-owned source directory outside the production bundle; manifest records their durable paths and hashes. Commit production assets and provenance, not unused experiments.

Initial budgets per mounted hero: ≤8 unique mobile image requests, ≤10 desktop; ≤750KB image transfer at 375px, ≤1.5MB at1440px; ≤8MP decoded visible images; ≤12 simultaneous animated objects. Repeated instances may reuse one image URL. Only the background plate gets high fetch priority. New dependencies: zero. Budgets are acceptance targets; if violated, optimize and measure again before claiming validated.

## 5. Page specifications

### SH-01 — About: among the branches

Source: owner's close-up branch idea and approved About mock; `PRODUCT.md` identity/accessibility; existing `app/about/page.js` and `publicPageCopy.about`.

Objects: distant forest plate, separate far foliage, textured foreground branch, secondary mid-distance branch, two independently swaying leaf clusters, one visiting realistic bird sprite, partially occluded sun/moon. Reuse an asset instance only where its scale/orientation remains plausible. Do not reuse Home art.

Behavior: three labelled depth targets (near/mid/far), button pressed state and branch hit targets; nonselected depths blur while copy stays sharp. A bird idles, occasionally moves, and responds with a short nearby hop before settling. Observation journal records completed exploration without claiming a professional achievement.

Content: existing About h1 and editable caption; CTA `Explore my experience` → `#about-content`. Existing editable profile introduction, HUD, experience, journey, skills and achievements remain below the fade.

Acceptance: 3 distinct depth states visibly correct; focus target stays stationary; keyboard/tap equivalents; no bird overlap with copy/nav; visible texture detail; all About body sections retained; screenshot matrix and build pass. Shared primitives ship with this first page commit, not as an untested global rewrite.

### SH-02 — Projects: stone desert

Objects: distant sky/haze plate, separate sandstone arch/formation, foreground sand/rocks, a small beetle or desert visitor, independently drifting dust, compass cutout and separate covering sand.

Behavior: uncover progress clamps to 0–3. Each tap reveals more of the compass with a local sand response. Completion stays uncovered on revisit during the session. No randomized project tier or fake metrics.

Content: actual Projects h1/caption; CTA `Explore projects` → `#projects-content`. Preserve activity calendar, type/category filters, real card details and GitHub links.

Acceptance: states0/1/2/3 verified; fourth tap does not duplicate discovery; geometry and shadows align; functional filter regression; About regression if shared code changes; separate validated commit.

### SH-03 — Research: future city after rain

Objects: atmospheric distant city plate, independent building facade/silhouette layers, small vehicles with separate routes/speeds, rain and rooftop signal device. Material direction: weathered concrete, metal, wet glass and restrained practical lighting; no generic neon SaaS glow.

Behavior: activate a signal, play one bounded transmission sequence, settle to connected. This is a scene interaction, not an assertion about live research data.

Content: actual Research h1/caption; CTA `Read publications` → `#research-content`. Preserve publication records, factual citation totals/h-index and Scholar links.

Acceptance: real records unchanged; no vehicles cross copy/nav; signal usable by keyboard/touch; facade layers parallax independently; earlier-page regression for shared edits; separate commit.

### SH-04 — Blog: snowy passage

Objects: distant winter sky/mountains, separate conifer/snowbank layers, individual wind-driven snowflakes, a realistic small lantern, subtle local mist. Keep snow different from Home's alpine scenery through close conifers, winter textures, framing and atmosphere.

Behavior: lantern switches to a persistent session-lit state; warmth remains spatially local. Snow has independent depth/speed/phase and freezes under pause/reduced motion.

Content: actual Blog h1/caption; CTA `Browse articles` → `#blog-content`. Preserve query pagination, filters/list/grid, owner CMS controls, redirects and metadata for later pages.

Acceptance: default/lit/night/reduced verified; pagination and list controls work; no content-gating interaction; separate commit.

### SH-05 — Contact: underwater ruins

Objects: distant underwater plate, separate stone ruin/arch, foreground plants that sway independently, realistic fish sprites with independent trajectories, bubbles and a bounded ripple effect.

Behavior: touch/keyboard interaction attracts the school toward a safe point and produces a short ripple, then fish resume their own paths. Reduced motion sets the immediate end state. Contact channels remain directly accessible.

Content: actual Contact h1/caption; CTA `Choose a contact channel` → `#contact-content`. Preserve real channels and existing telemetry behavior; scene actions never send contact messages or fabricate contact events.

Acceptance: fish do not obstruct controls; scene cannot trigger external communications; actual contact links unchanged; final five-route review; separate commit.

## 6. Required validation for every page

| Gate | Evidence / assertion |
|---|---|
| Content | One h1, original caption/editor slot, expected body sections and links, metadata preserved |
| Desktop/mobile | Screenshots at1440,768,375px; no overflow, overlap, cutout halos or clipped targets |
| States | Default, triggered, visible keyboard focus, reduced-motion; About every depth; desert all stages |
| Themes/fade | Morning/noon/sunset/night final edge equals following content background; no hard seam |
| Lifecycle | User pause, reduced motion, offscreen, hidden page and all global overlays stop loops/pointer work |
| Recovery | Missing image does not hide copy/CTA; blocked/corrupt session storage safe; clean mount/unmount |
| Asset delivery | Manifest hashes/dimensions/alpha/bounds; route loads only its own images; transfer/decode budgets |
| Accessibility | 44px targets; focus rings; polite nonstacking feedback; text contrast ≥4.5:1, heading ≥3:1 |
| Performance | Production-mode cold samples, CLS<0.05, no persistent long tasks from hero; static/no-JS first paint |
| Build | Relevant behavior tests, asset validation, `npm run build`, browser runtime with no hero errors |
| Commit | GitNexus impact/change checks; explicit staged allowlist; unrelated worktree preserved |

Inspect screenshots visually after capture. Correct all P0 guardrail/P1 functional/P2 accessibility findings before commit. Maximum three visual rounds per unit; if still failing, split the component and diagnose the cause. Record all deferred P3/P4 findings with evidence; never silently drop them.

## 7. Commit boundaries and rollback

Planning gets a documentation commit. Each page gets its own implementation commit after validation, in the specified order. No push/deploy requested. Keep the existing dirty worktree intact; its snapshot was saved before changes.

Stage only explicit owned paths. `TASKS.md` already has unrelated changes: stage only this task's hunks. Do not stage the preexisting `SiteContext`, provider, backend, package or unrelated UI changes. Reconstruct the staged TASKS version from HEAD plus our entries when interactive hunk selection is ambiguous.

Before commit: complete untruncated GitNexus change analysis, staged diff check and content allowlist. After commit: record hash in this ledger and page evidence at the next log update. Each route rollback removes only its own scene import/adapter/assets; shared primitives remain inert for absent scenes. Never use destructive reset/clean or revert unrelated owner work.

## 8. Decisions and research

| Decision | Basis |
|---|---|
| Native DOM layers instead of another WebGL renderer | Sol architecture review; existing Home performance history; independent CSS transforms are sufficient |
| Generic primitives plus route data | Owner's explicit maintainable/scalable/reusable requirement; each route imports only its own data |
| About-only focus | Owner's explicit “ini implement di 1 page aja” |
| New realistic cutout assets | Owner approved mock composition but explicitly rejected direct prototype artwork in production |
| Unboxed copy with contrasting glyph contour | Owner rejected broad scrim and localized backing; accepted the final readable text iteration |
| Phase-aware fade | Owner's explicit seamless hero/content transition |
| Native motion pause | https://developer.mozilla.org/en-US/docs/Web/API/Animation/pause |
| Visibility lifecycle | https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API |
| Sourcing alternative reviewed | https://polyhaven.com/a/pine_tree_01 — useful realistic reference; not automatically a production asset |

GitNexus repository binding: `star`, `/home/tada/projects/star`, index/HEAD `d54a026`. Five route functions returned UNKNOWN/no indexed callers. Resolved through the actual Next App Router file convention and text verification that these functions have no userland callers; not treated as unused.

### SH-01a — Attached organism geometry (technical refinement)

Visual round three exposed tablet drift between separately positioned bird and perch. Split this P1 into a bounded attachment fix: nested object descriptors use the branch image as their coordinate system; the child keeps an independent action, animation, parallax and stable target. No page conditional or breakpoint-specific perch guess. Blur is applied to individual image surfaces so keyboard labels and outlines remain sharp. Acceptance: bird feet rest on the same branch at1440/768/375; nested actions reach the common controller; focus/reduced-motion/lifecycle tests still pass. Evidence stays in the About folder.

Owner follow-up: use only Mukhtada as the public display name across pages. Implemented and validated in commit 695ec17; see display-name.md.
