# Google Analytics 4 integration plan — 2026-09-01

## Goal

Install the supplied Google tag globally in the Next.js 15 App Router site so
the env-configured GA4 property can receive page-view data from every public route
without changing the visual interface or the existing Convex Blog-reading
analytics.

## Evidence and boundary

- User source: `ganalytics4.md` contains the standard `gtag.js` loader and
  `gtag('config', ...)` contract.
- `app/layout.js` is the global App Router boundary and currently has no
  analytics component.
- No Content Security Policy is configured in `next.config.js` or the app.
- `@next/third-parties` is not installed. The project forbids adding an npm
  dependency without explicit approval, so the implementation will use
  `next/script`, which ships with the existing Next.js dependency.
- Google documents the supplied snippet as the standard Google tag setup.
- Next.js documents that GA4 can be placed in the root layout and that page
  changes based on browser history should be handled through GA4 Enhanced
  Measurement. No manual page-view event will be added because it can create
  duplicate data when automatic history measurement is enabled.
- Out of scope: custom events, conversions, Google Tag Manager, a consent
  banner, Consent Mode, GA account configuration, and changes to the existing
  privacy-preserving Blog analytics.

## Implementation

1. Add `components/GoogleAnalytics.jsx` with two `afterInteractive` scripts:
   - async `gtag.js` loader for `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`;
   - the supplied `dataLayer`, `gtag('js', ...)`, and `gtag('config', ...)`
     initialization.
2. Render the component once from `app/layout.js`, after the application body
   content, so every App Router route receives the same tag.
3. Add no dependency, CSS, cookie, database field, custom event, or fabricated
   measurement.

## Acceptance criteria

1. Production HTML/browser hydration results in exactly one external Google
   tag script and one inline config script for the env-configured ID.
2. `window.dataLayer` contains the `js` and `config` commands after hydration.
3. Client-side navigation does not duplicate either script or the config
   command.
4. Home and one secondary route render without console/hydration errors at
   1440 px and 375 px; screenshots show no visual regression or overflow.
5. `npm run convex:typecheck`, `npm run build`, dependency diff, scoped grep,
   and `git diff --check` pass.
6. Validation traffic does not reach the GA property: browser tests intercept
   Google measurement requests while asserting the loader/config contract.

## Task contract

- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi rarity/medal?: TIDAK.
- Screenshot evidence:
  `validation/google-analytics-4-2026-09-01/screenshots/`.
- Status: done. Evidence:
  `validation/google-analytics-4-2026-09-01/validation.md`.
