import styles from "./scenic-hero.module.css";

const DEFAULT_ATMOSPHERE = {
  morning: { color: "var(--palette-cream)", strength: 3.5 },
  noon: { color: "var(--palette-cream)", strength: 0 },
  sunset: { color: "var(--palette-coral-dark)", strength: 19 },
  night: { color: "var(--sky-1)", strength: 72 },
};

export default function ScenicAtmosphere({ phase, appearance = DEFAULT_ATMOSPHERE }) {
  return <div className={styles.atmosphere} data-atmosphere aria-hidden="true">
    {Object.entries(appearance).map(([name, { color, strength }]) => <div key={name} className={styles.atmospherePlane} data-atmosphere-phase={name} style={{ backgroundColor: `color-mix(in srgb, ${color} ${strength}%, transparent)`, opacity: phase === name ? 1 : 0 }} />)}
  </div>;
}
