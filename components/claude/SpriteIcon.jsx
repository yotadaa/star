import React from "react";

export default function SpriteIcon({ id, className = "", size = 16, title }) {
  return (
    <svg
      className={`sprite-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      <use href={`/assets/svg/icons-sprite.svg#${id}`} />
    </svg>
  );
}
