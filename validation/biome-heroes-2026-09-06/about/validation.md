# SH-01 — About canopy validation

Status: validated · 2026-09-06

- Specification: owner-approved biome mockup and close-up branch request; `docs/plans/scenic-heroes/README.md` SH-01/SH-01a; PRODUCT.md identity and a11y.
- Location: `app/about/page.js`, before `#about-content`.
- Structure: shared ScenicHero → ScenicScene → independent ScenicObject images; branch child anchors the bird; server title/caption slot; ordinary content remains below.
- New dependency/token/rarity/audio/backend writes: none. Fixed existing palette roles; no professional facts added.
- Validation: 43 browser assertions passed; 5 pure state/contrast tests passed; asset hashes/dimensions/alpha validated; production build completed with exit 0.
- Screenshots: 1440-default.png, 768-default.png, 375-default.png, desktop-focus-near/middle/far.png, desktop-triggered.png, desktop-reduced-motion.png, desktop-morning/noon/sunset/night-fade.png, asset-alpha-review.png.
- Visual review: actual rendered images inspected. P1 floating bird and obscuring foreground fixed. SH-01a anchors the bird to branch geometry; tablet/mobile feet now meet the perch. Alpha reviewed against both palette light/dark surfaces. No unresolved P0–P2.
- Lifecycle: manual pause, reduced motion, each of three real shell panels, offscreen and document-hidden event suspend hero animations; reload restores allowlisted discovery; blocked storage safe; no runtime page errors.
- Content: h1 and editable caption props retain existing source; body experience/journey/skills/achievement components remain unchanged. Owner login/save was not exercised because no content write is required.
- Fade: sampled pixels above/below the boundary match within 2 channels in all four themes (browser-report.json).
- Performance: six fresh-context local production samples; CLS 0 throughout; LCP 484–2084 ms; no long tasks during the idle observation windows; four active CSS animations; 321,810 mobile / 442,068 desktop image bytes. No network/CPU throttling; these are local measurements, not deployed field metrics. Baseline screenshots were development-mode layout evidence, not a production performance comparison.
- Source images: original generated PNGs retained outside production; optimized cutouts + responsive background in public/scenic-heroes/about; prompts/manifests in docs/plans/scenic-heroes/assets/about. Layout/depth/pivot metadata lives in the scene definition to avoid duplicated placement truth.
- Guardrails: keyboard equivalent and >=44px targets tested; decorative textures use empty alt; one polite status; zero npm changes in this unit; no emoji or blocking scene modal.
- Git scope: whole-worktree GitNexus risk is critical due preexisting changes across backend/auth; those paths are excluded from this commit. Scoped staged analysis recorded separately.

- Final scoped GitNexus: HIGH, 178 changed symbols returned without truncation, nine affected flows reviewed. New shared code is expected to have broad reach; the actual mounted route is About. `impact.json` records the check.
- Follow-up naming request: public name is Mukhtada (commit 695ec17); About screenshot and 43 assertions rerun after the copy change.
