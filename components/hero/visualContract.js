export const HERO_PHASES = ["morning", "noon", "sunset", "night"];
export const HERO_MOON_TINT = "#d9ecff";

export function advanceOrbitTarget(previousTarget, rawAngle) {
  let adjusted = rawAngle;
  while (adjusted >= previousTarget - 0.001) adjusted -= Math.PI * 2;
  while (adjusted < previousTarget - Math.PI * 2) adjusted += Math.PI * 2;
  return adjusted;
}

export const HERO_THEMES = {
  morning: {
    sky: ["#243f5e", "#5f9fba", "#f6d79f"],
    haze: "#d8f3ef",
    landscape: "#d8f2d8",
    wash: "#d8f3ef",
    sunAngle: 2.42,
    // Moon has just set beyond the right horizon after the night phase.
    moonAngle: 5.94,
    sunVisibility: 1,
    moonVisibility: 0,
    sunWash: "#45b8a4",
  },
  noon: {
    sky: ["#1d6fa3", "#77bde0", "#f8e9bd"],
    haze: "#f1fbff",
    landscape: "#f5fff0",
    wash: "#f1fbff",
    sunAngle: 1.56,
    // Continue beneath the horizon so the daytime reset stays invisible.
    moonAngle: 5.08,
    sunVisibility: 1,
    moonVisibility: 0,
    sunWash: "#45b8a4",
  },
  sunset: {
    sky: ["#312b56", "#c16f63", "#f3c06d"],
    haze: "#ffd0a0",
    landscape: "#f0c083",
    wash: "#ffd0a0",
    sunAngle: 0.34,
    // Stage below the left horizon before rising into the night sky.
    moonAngle: 3.42,
    sunVisibility: 1,
    moonVisibility: 0,
    sunWash: "#ffd195",
  },
  night: {
    sky: ["#010208", "#040a17", "#071526"],
    haze: "#1d2b40",
    landscape: "#2d3747",
    wash: "#01030a",
    sunAngle: 4.78,
    moonAngle: 1.46,
    sunVisibility: 0,
    moonVisibility: 1,
    sunWash: "#45b8a4",
  },
};

const assetRoot = "/assets/parallax/optimized";

export const HERO_PROFILES = {
  desktop: {
    assets: {
      cloud: `${assetRoot}/desktop/cloud.webp`,
      mountains: `${assetRoot}/desktop/mountains.webp`,
      hills: `${assetRoot}/desktop/forest-hills.webp`,
      meadow: `${assetRoot}/desktop/meadow.webp`,
      moon: `${assetRoot}/desktop/moon.webp`,
    },
    celestial: { sunSize: 0.52, moonSize: 0.14 },
    clouds: [
      { x: 0.18, y: 0.2, width: 0.25, depth: 0.05, opacity: 0.62, drift: 0.012, nightShiftX: -0.1, nightShiftY: 0.025 },
      { x: 0.78, y: 0.22, width: 0.18, depth: 0.05, opacity: 0.56, drift: -0.01, flip: true, nightShiftX: 0.1, nightShiftY: -0.02 },
      { x: 0.94, y: 0.4, width: 0.28, depth: 0.08, opacity: 0.68, drift: 0.015, nightShiftX: 0.09, nightShiftY: 0.035 },
    ],
    layers: [
      { key: "mountains", width: 2.02, centerY: 0.7, depth: 0.12, z: -8, opacity: 0.94 },
      { key: "hills", width: 1.48, centerY: 0.87, depth: 0.2, z: -4.2, opacity: 0.92 },
      { key: "meadow", width: 1.34, centerY: 0.942, depth: 0.36, z: -1.2, opacity: 1 },
    ],
  },
  mobile: {
    assets: {
      cloud: `${assetRoot}/mobile/cloud.webp`,
      mountains: `${assetRoot}/mobile/mountains.webp`,
      hills: `${assetRoot}/mobile/forest-hills.webp`,
      meadow: `${assetRoot}/mobile/meadow.webp`,
      moon: `${assetRoot}/mobile/moon.webp`,
    },
    celestial: { sunSize: 0.45, moonSize: 0.115 },
    clouds: [
      { x: 0.08, y: 0.18, width: 0.72, depth: 0.05, opacity: 0.6, drift: 0.012, nightShiftX: -0.14, nightShiftY: 0.03 },
      { x: 0.88, y: 0.3, width: 0.64, depth: 0.08, opacity: 0.54, drift: -0.01, flip: true, nightShiftX: 0.14, nightShiftY: -0.025 },
    ],
    layers: [
      { key: "mountains", width: 2.34, centerY: 0.66, depth: 0.12, z: -8, opacity: 0.94 },
      { key: "hills", width: 1.82, centerY: 0.78, depth: 0.2, z: -4.2, opacity: 0.92 },
      { key: "meadow", width: 1.68, centerY: 0.85, depth: 0.36, z: -1.2, opacity: 1 },
    ],
  },
};

export function getHeroVisualContract(phase = "morning", mobile = false) {
  const theme = HERO_THEMES[phase] || HERO_THEMES.morning;
  const profile = HERO_PROFILES[mobile ? "mobile" : "desktop"];
  return { phase: HERO_THEMES[phase] ? phase : "morning", theme, profile };
}

export function getStaticSceneStyle(phase, mobile) {
  const { theme } = getHeroVisualContract(phase, mobile);

  return {
    "--static-sky-top": theme.sky[0],
    "--static-sky-mid": theme.sky[1],
    "--static-sky-horizon": theme.sky[2],
    "--celestial-tint": HERO_MOON_TINT,
  };
}
