import React from "react";

/**
 * RARITY TOKEN MAP — [ASUMSI, MOHON DIKONFIRMASI]
 * Remap dari token skema 1 yang sudah ada (bukan hex baru).
 * Ganti isi map ini kalau proyek final pindah ke skema 2.
 */
const RARITY_STYLES = {
  epic: { color: "var(--gold)", label: "TIER S" }, // EPIC / TIER S
  rare: { color: "var(--moss)", label: "TIER A" }, // RARE / TIER A
  common: { color: "var(--coral)", label: "COMMON" }, // COMMON
};

/**
 * RarityTag — badge sudut-terpotong (pixel-corner), diposisikan absolute
 * di pojok kiri-atas card (Experience card, Project card).
 * Wrapper card WAJIB `position: relative`.
 *
 * Usage:
 *   <article className="relative ...">
 *     <RarityTag rarity="epic" label="TIER S · AI TOOLING" />
 *     ...
 *   </article>
 */
export default function RarityTag({ rarity = "rare", label, className = "" }) {
  const style = RARITY_STYLES[rarity] ?? RARITY_STYLES.rare;
  return (
    <span
      className={`rarity-tag ${className}`}
      style={{
        "--rarity-color": style.color,
      }}
    >
      {label ?? style.label}
    </span>
  );
}
