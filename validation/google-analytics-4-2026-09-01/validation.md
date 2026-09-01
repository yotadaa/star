# Google Analytics 4 validation — 2026-09-01

## Result

Passed. The App Router root layout now loads one Google tag and initializes one
GA4 config command for the env-configured measurement ID on every route. The
implementation uses the native async Google tag in the root `head` and adds no package, CSS,
database field, cookie implementation, or custom event.

## Source and implementation

- User-supplied source: `ganalytics4.md`.
- Global boundary: `app/layout.js`.
- Tag component: `components/GoogleAnalytics.jsx`.
- External loader uses
  `https://www.googletagmanager.com/gtag/js?id=<configured-id>`.
- Initialization keeps the supplied `dataLayer`, `gtag('js', ...)`, and
  `gtag('config', ...)` contract.
- Both scripts are present in the initial document `head`, matching Google's
  all-page tag-detection contract; the external loader remains asynchronous.
- No manual route-change pageview is emitted. GA4 Enhanced Measurement is the
  owner-controlled setting for browser-history page changes, avoiding a second
  custom page-view path that could duplicate data.

## Automated gates

| Gate | Result |
|---|---|
| `npm run convex:typecheck` | Passed |
| `npm run build` | Passed |
| Package and lockfile diff | Empty |
| `git diff --check` | Passed |
| Home response | 200 |
| About mobile response | 200 |
| External GA loader count | Exactly 1 per document |
| Inline config script count | Exactly 1 per document |
| `dataLayer` `js` command | Present |
| `dataLayer` config command | Exactly 1 for the configured ID |
| Client navigation Home → About | Loader and config remained singletons |
| Desktop/mobile console errors | 0 |
| Desktop/mobile horizontal overflow | 0 |

Full browser assertions are recorded in `browser-results.json`.

## Safe runtime validation

The browser audit intercepted the `googletagmanager.com/gtag/js` request and
returned an inert local response. Google Analytics collection endpoints were
also blocked. This verified the loader URL, hydrated scripts, `dataLayer`, and
client-navigation behavior without sending validation traffic to the user's
GA4 property.

## Screenshot evidence

- `screenshots/home-desktop.png` — 1440 x 1000 Home after analytics hydration.
- `screenshots/about-mobile.png` — 375 x 812 About after analytics hydration.

Visual inspection found no changed layout, clipping, or overflow.

## Triage

- P0 guardrail: none; no dependency, color, emoji, modal, or audio change.
- P1 functional: none after final runtime assertions.
- P2 accessibility: none; the tag adds no visible or interactive UI.
- P3 performance: the external loader is asynchronous. No app render loop,
  listener, or manual page-view observer was added.
- P4 cosmetic: none; visual output is unchanged.

## Deployment boundary

The code installs the tag when `GOOGLE_ANALYTICS_ID` is configured in the
server/build environment. GA4 Realtime or DebugView confirmation requires the
deployed production site and access to the user's Google Analytics property.
Enhanced Measurement's browser-history option should remain enabled in the GA4
web data stream so App Router navigations are counted without custom duplicate
events. Consent Mode or a consent banner is a separate product/privacy decision
and was not inferred in this scoped installation.
