"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * XpScrollBar — garis tipis fixed-top yang terisi sesuai persentase
 * scroll halaman, dibingkai sebagai "XP bar".
 *
 * Pasang sekali di root layout, di atas <IslandNav/>:
 *   <XpScrollBar />
 *   <IslandNav />
 *   ...
 *
 * z-index harus lebih tinggi dari navbar pill (mis. navbar z-50 → ini z-60).
 */
export default function XpScrollBar() {
  const [percent, setPercent] = useState(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    function computePercent() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setPercent(Math.min(100, Math.max(0, pct)));
      tickingRef.current = false;
    }

    function onScroll() {
      if (!tickingRef.current) {
        tickingRef.current = true;
        window.requestAnimationFrame(computePercent);
      }
    }

    computePercent();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="xp-bar-track"
      aria-hidden="true"
    >
      <div
        className="xp-bar-fill"
        style={{ transform: `scaleX(${percent / 100})` }}
      />
    </div>
  );
}
