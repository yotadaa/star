// Stable scene seeds keep server/client markup identical and avoid correlated motion.
export function ambientObjects({ count, material, seed = 7, motion = 'drift', duration = 12, size = '3px', x = '80px', y = '12px', area = { left: 48, top: 16, width: 48, height: 50 } }) {
  let value = seed >>> 0;
  const next = () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
  return Array.from({ length: count }, (_, index) => ({
    id: `${material}-${index}`, primitive: material,
    layout: { x: `${(area.left + next() * area.width).toFixed(2)}%`, y: `${(area.top + next() * area.height).toFixed(2)}%`, w: size },
    parallax: -(0.1 + next() * 0.3),
    motion: { type: motion, duration: duration * (0.75 + next() * .5), delay: -next() * duration, x, y },
  }));
}
