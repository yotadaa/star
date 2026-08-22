# Nala reliability validation — 2026-08-23

## Scope

- Exact reported prompt: `can you navigate me to his projects`
- Persisted model: `nvidia/nemotron-3-ultra-550b-a55b:free`
- Provider: live OpenRouter chat completions
- Viewports observed: 393 × 700 mobile and 1280 × 720 desktop

## Functional checks

- The server runs the inferred `search_projects` reader before contacting the
  model and sends the result as plain verified context. The provider request no
  longer includes `tools`, `tool_choice`, or provider-specific function syntax.
- The exact prompt returned `expression: pointing`, a server-owned action for
  `/projects`, and ordinary English prose. No serialized tool markup reached the
  UI.
- The navigation control rendered as an `A` element with `href="/projects"`.
  Activating it ended at `http://127.0.0.1:3123/projects`, where the `Projects`
  heading was present.
- Arbitrary navigation is blocked by a six-route public allowlist. `/manage`
  cannot become a Nala client action.

## Failure and retry checks

- `desktop-retry-state.jpg` captures an honest failed request with one user
  prompt and a `Coba lagi` control.
- Activating retry removed the failure bubble, retained exactly one copy of the
  original prompt, hid quick prompts while pending, and kept the composer busy.
  `desktop-retry-pending.jpg` captures this state.
- The retried request later completed live and exposed the navigation action.
  Failed assistant copy and its unanswered user turn are excluded from later
  model history.

## Layout and accessibility checks

- `mobile-live-navigation.jpg`: 393 px viewport, live answer, action link, quick
  prompts, and composer fit without horizontal overflow. The text input regained
  focus after completion.
- `desktop-live-navigation.jpg`: measured `innerWidth: 1280` and
  `scrollWidth: 1265`; the 15 px difference is the vertical scrollbar, not
  horizontal overflow.
- `desktop-projects-handoff.jpg`: destination after activating the action link.
- The thread exposes `aria-live="polite"` and `aria-busy` while pending. Retry
  and navigation use native button/link semantics and inherit the project’s
  existing `:focus-visible` press-state treatment.
- This change adds no animation. Existing Nala typing/FAB animation remains
  inside `@media (prefers-reduced-motion: no-preference)`, so reduced-motion
  users receive the static state.

## Automated checks

- `git diff --check`
- `npm run convex:typecheck`
- `npm run build` — Next.js 15.5.19 production build completed with 14/14 static
  pages and the dynamic `/api/nala/chat` route.
