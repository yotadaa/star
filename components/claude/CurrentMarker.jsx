import React from "react";

/**
 * CurrentMarker — dipasang HANYA di node terakhir Journey Log timeline
 * untuk menandai posisi "sekarang". Node lain di timeline tetap statis
 * (kotak solid biasa), jangan pasang komponen ini di node non-terakhir.
 *
 * Usage:
 *   {isLast ? <CurrentMarker /> : <TimelineNodeStatic />}
 */
export default function CurrentMarker({ className = "" }) {
  return (
    <span className={`current-marker ${className}`}>
      <span className="current-marker-node" aria-hidden="true">
        <span className="current-marker-ring" />
        <span className="current-marker-core" />
      </span>
      <span className="current-marker-label">Kamu di sini</span>
    </span>
  );
}
