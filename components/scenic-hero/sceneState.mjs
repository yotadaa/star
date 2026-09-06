export const DISCOVERY_KEY = "star:scenic-discoveries:v1";
export const DISCOVERIES = Object.freeze({ canopy: "Among the branches", desert: "Stone desert", city: "City after rain", snow: "Snowy passage", ocean: "Underwater ruins" });
export const DISCOVERY_IDS = Object.freeze(Object.keys(DISCOVERIES));

export function flattenObjects(objects) {
  return objects.flatMap((object) => [object, ...flattenObjects(object.children || [])]);
}

export function parseDiscoveries(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((id) => DISCOVERY_IDS.includes(id)))].slice(0, DISCOVERY_IDS.length)
      : [];
  } catch { return []; }
}

export function advanceAction(previous = 0, stages = 1) {
  const limit = Number.isInteger(stages) && stages > 0 ? stages : 1;
  return Math.min(limit, Math.max(0, Number(previous) || 0) + 1);
}

export function focusBlur(depth, selected, distances) {
  return depth === selected ? 0 : Math.min(10, Math.max(0, distances?.[selected]?.[depth] ?? 0));
}

export function parallaxOffset(point, bounds, amplitude = 1) {
  if (!bounds.width || !bounds.height) return { x: 0, y: 0 };
  const clamp = (n) => Math.max(-1, Math.min(1, n));
  return {
    x: clamp((point.x - bounds.left) / bounds.width * 2 - 1) * amplitude,
    y: clamp((point.y - bounds.top) / bounds.height * 2 - 1) * amplitude,
  };
}
