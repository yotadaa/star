import React from "react";

/**
 * HudChip — satu unit stat di HUD strip.
 * Contoh: <HudChip icon={<StarIcon/>} label="Level: Fullstack Explorer" accent="gold" />
 */
export function HudChip({ icon, label, accent = "ink" }) {
  const Tag = label?.href ? "a" : "span";
  const accentVar = accent === "gold" ? "var(--gold)" : accent === "aurora" ? "var(--aurora)" : "var(--ink)";
  return (
    <Tag
      className="hud-chip"
      href={label?.href}
      target={label?.href ? "_blank" : undefined}
      rel={label?.href ? "noopener noreferrer" : undefined}
      style={{ "--hud-accent": accentVar }}
    >
      {icon && (
        <span className="hud-chip-icon">
          {icon}
        </span>
      )}
      {label?.text || label}
    </Tag>
  );
}

/**
 * HudStatusStrip — baris stat pemain, reusable untuk Home (badge row)
 * dan Research (h-index/sitasi). Murni display, aria-hidden karena
 * dekoratif; ganti ke role="status" jika kontennya benar-benar berubah
 * secara dinamis (mis. streak count real-time).
 *
 * Usage:
 * <HudStatusStrip
 *   items={[
 *     { icon: <PinIcon/>, label: "Jambi, ID" },
 *     { icon: <StarIcon/>, label: "Level: Fullstack Explorer", accent: "gold" },
 *     { icon: <FlameIcon/>, label: "Streak: 4 publikasi aktif", accent: "gold" },
 *   ]}
 * />
 */
export default function HudStatusStrip({ items = [], className = "" }) {
  return (
    <div
      className={`hud-strip ${className}`}
      role="status"
      aria-label="Profile summary"
    >
      {items.map((item, i) => (
        <HudChip key={i} {...item} />
      ))}
    </div>
  );
}
