# IslandNav Design-System Alignment

## Source

Steered request: Dynamic Island nav is structurally solid but needs closer
alignment with typography, popup entry, and token rules.

## What Is Already Good

- Capsule/pill shape matches the Dynamic Island direction.
- Active state uses solid `--gold`.
- Nav item spacing is balanced.
- Theme and command utility icons sit on the right as planned.

## Required Adjustments

1. Nav item typography must use Silkscreen:
   - `Home`, `About`, `Projects`, `Research`, `Contact`
   - `MB · NST`
   - utility labels/tooltips if rendered visibly
2. Add a future entry point for the Inventory/Achievement/Mission popup:
   - One backpack-style trigger, not three separate icons.
   - Preferred position: after theme/compass icon and before command icon.
3. Add mini player-level indicator once the PP system exists:
   - Example: small `Lv.3` badge attached to the backpack trigger.
4. Ensure separator/status dot color uses an existing token:
   - Prefer `--gold` or another confirmed token.

## Implementation Direction

- Immediate fix: make `.island-link` explicitly use `var(--font-pixel)`.
- Keep nav text small enough for legibility: around 10.5-12px.
- Do not build the popup trigger until `PlayerStatusPopup` exists, unless it is
  clearly disabled or hidden behind a planned state.

## Acceptance Criteria

1. Desktop screenshot shows nav labels and brand in the pixel UI font.
2. Active/hover/focus states remain readable.
3. Mobile nav remains compact with no horizontal overflow.
4. Popup trigger and level badge remain tracked as tasks until the popup system
   is implemented.

## Validation Gate

- Build passes.
- Screenshots for `/` desktop/mobile show nav typography consistency.
- No new hex colors or dependencies.

