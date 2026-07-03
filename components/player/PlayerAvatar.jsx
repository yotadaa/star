"use client";

import { useState } from "react";
import { SpriteIcon } from "@/components/claude";

export default function PlayerAvatar({ size = "sm" }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={`player-avatar player-avatar-${size} player-avatar-fallback`} aria-hidden="true">
        <SpriteIcon id="icon-pixel-face" size={size === "lg" ? 34 : 19} />
      </span>
    );
  }

  return (
    <span className={`player-avatar player-avatar-${size}`} aria-hidden="true">
      <img
        src="/assets/avatar-pixelated.png"
        alt=""
        width={size === "lg" ? 64 : 34}
        height={size === "lg" ? 64 : 34}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
