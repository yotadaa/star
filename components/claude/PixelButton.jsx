"use client";

import React from "react";

/**
 * PixelButton - tombol/pill dasar dengan:
 *  - press state (turun 2px + shadow mengecil saat :active)
 *  - focus-visible outline dashed (aksesibilitas keyboard)
 *  - opsi `selected` untuk filter pill aktif (micro-bounce saat berubah)
 *
 * Dipakai untuk: CTA hero, filter pill Projects, nav pill.
 *
 * Usage:
 *   <PixelButton onClick={...}>► MULAI QUEST</PixelButton>
 *   <PixelButton as="pill" selected={active} onClick={() => setActive(v)}>WEB</PixelButton>
 */
export default function PixelButton({
  children,
  as = "button",
  selected = false,
  className = "",
  ...props
}) {
  const Tag = as === "a" ? "a" : "button";

  return (
    <Tag
      type={Tag === "button" ? "button" : undefined}
      className={`pixel-button ${selected ? "selected" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
}
