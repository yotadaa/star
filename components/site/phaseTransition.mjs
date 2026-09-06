// CSS and WebGL use the same interruption-safe timing curve.
export function phaseEase(progress) {
  const x = Math.max(0, Math.min(1, progress));
  let low = 0, high = 1, t = x;
  for (let i = 0; i < 16; i++) {
    const current = 3 * (1 - t) ** 2 * t * .22 + 3 * (1 - t) * t ** 2 * .36 + t ** 3;
    if (current < x) low = t; else high = t;
    t = (low + high) / 2;
  }
  return x === 0 || x === 1 ? x : 1 - (1 - t) ** 3;
}

export function phaseDuration(active = true) {
  if (!active || typeof document === "undefined" || document.hidden) return 0;
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--phase-visual-duration")) || 0;
}

export const PHASE_OVERLAYS = '[data-testid="command-palette"], [data-testid="player-status-popup"], [data-testid="world-chat-panel"], dialog[open]';
