# Phase and caption review — 2026-09-07

The owner accepted the caption iteration and requested moving to the next page. This closes composition refinement, not every performance investigation.

## Home: accepted

`home-trace-headed.json` records all four time edges and rapid reversal in static and WebGL modes against the local production build at port 3125. Assertions check intermediate opacity frames, final target, opaque coverage during reversal, promotion cleanup, CTA contrast and caption contour. The eight `home-{static,webgl}-{phase}-end.png` screenshots are the final endpoint evidence. Astra inspected all eight and accepted the repaired night CTA labels and single moon disk.

The isolated production build passed. The renderer uses constant opacity planes and a single material writer; it does not remount imagery or duplicate the WebGL canvas on phase changes. These local browser measurements are not a universal frame-rate guarantee.

## About and Projects composition: accepted

`copy-breakout-report.json`: 193 passing checks across 1440, 768 and 375px, four phases and both routes. Final files are `{about,projects}-{width}-{phase}-copy-breakout.png`. Astra inspected all 24, accepting the unboxed text, branch attachment/overhang, mobile copy clearance and grounded Projects terrain.

## Open follow-ups, retained honestly

- **P3, About motion budget:** the latest `report.json` stopped at desktop sunset: p95 55.7ms, maximum 370ms, one 376ms long task. All 76 assertions before that point passed. The complete performance gate is not passed; retain the log and investigate long-task attribution separately. The owner explicitly requested proceeding rather than further iteration now.
- **P2, About hover plaque:** Astra found the night “Focus on this branch” hover label dimmed beneath the atmosphere. The separately rendered keyboard focus label and caption are readable; the hover plaque still needs effective-contrast verification/correction. Evidence: `about-1440-night-copy-breakout.png`.
- Existing global Nala mobile FAB clearance remains a separate task in TASKS.md.

No push or deployment was requested. Projects interaction validation is recorded separately in its page folder.
