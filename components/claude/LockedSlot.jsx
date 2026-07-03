import React from "react";
import SpriteIcon from "./SpriteIcon";

/**
 * LockedSlot - card teaser bergaya "locked achievement slot", dipasang
 * sebagai item terakhir di grid Research (atau grid lain yang butuh
 * placeholder "belum tercapai"). Murni display, tidak interaktif.
 *
 * Usage:
 *   <LockedSlot label="Publikasi berikutnya - in progress" />
 */
export default function LockedSlot({ label = "In progress", className = "" }) {
  return (
    <div
      className={`locked-slot ${className}`}
    >
      <SpriteIcon id="icon-lock" size={20} />
      <span>{label}</span>
    </div>
  );
}
