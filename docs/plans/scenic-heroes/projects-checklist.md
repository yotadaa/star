# SH-02 — Projects completion

Status: validated · 2026-09-07

Sources: owner-approved desert mockup, scenic README §5 SH-02, PRODUCT.md accessibility and anti-reference rules. Owner accepted the caption iteration and explicitly requested moving forward on 2026-09-07. Remaining About diagnostics are separate follow-ups, not a reason to reopen the accepted composition.

- [x] Realistic independent desert plate, arch, sandbank, compass, covering sand and beetle exported with provenance and responsive variants.
- [x] Seven bounded dust particles, one beetle, existing pause/reduced-motion/visibility lifecycle; no new dependencies, colors, audio or backend state.
- [x] Scene-specific text tone and placement; no caption backing. Tablet arch grounded; mobile arch clears copy; sandbank joins the lower fade.
- [x] Astra accepted final composition in all twelve Projects viewport/phase screenshots.
- [x] Restore the same completed action state for rendering and subsequent interaction; a fourth/revisit click inspects without reannouncing discovery.
- [x] Run desktop/mobile assertions for stages 0/1/2/3, fourth click and revisit (73 total interaction assertions including label placement).
- [x] Verify all 16 type/category combinations against real repository records and links at desktop/mobile widths.
- [x] Verify generic lifecycle, four actual intermediate phase blends and fade endpoints, keyboard, storage fallback, SSR and asset budgets (39 browser assertions).
- [x] Inspect actual interaction/focus screenshots with Astra. Final overlap review: ACCEPT; mobile label clears compass, feedback and controls; correct stage3 label; desktop focus remains clear.
- [x] Production build and regression of shared About action behavior (48 browser assertions plus 15 focus assertions).
- [ ] Stage only Projects paths and the small shared interaction change; commit separately.

Evidence: `validation/biome-heroes-2026-09-06/projects/`; composition evidence: `validation/hero-time-transition-2026-09-06/projects-*-copy-breakout.png`. No placeholder or fabricated portfolio facts.

## Validation corrections

- First interaction probe sampled restoration while its hydration opacity transition was still running; it now waits for the actual restored end state before asserting coverage.
- Astra's second bounded review found the mobile focus label covering Journal. The shared label placement now avoids actual control/notice bounds, and an observer attached only to the focused target refreshes its label when the action changes. No animation loop or page-specific positioning was added.
- The local `start` script actually launches development mode. A restarted preview accidentally used that script. Discard its performance numbers as production evidence; stop it, rebuild the isolated output, then launch `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3125` explicitly and rerun final assertions. This correction does not affect the source change.
