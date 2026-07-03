"use client";

import React from "react";
import { useInViewOnce } from "./useInViewOnce";

/**
 * UnlockCard — pembungkus generic untuk Experience card, Achievement card,
 * atau Project card. Muncul dengan efek "unlock": scale-up + flash border
 * kuning sekilas saat pertama kali masuk viewport.
 *
 * Ganti elemen pembungkus asli card (mis. <article className="relative ...">)
 * dengan komponen ini, tanpa mengubah isi/children.
 *
 * Usage:
 *   <UnlockCard as="article" className="relative border-2 ...">
 *     <RarityTag rarity="epic" />
 *     ...isi card...
 *   </UnlockCard>
 */
export default function UnlockCard({
  children,
  as = "div",
  className = "",
  ...props
}) {
  const { ref, inView } = useInViewOnce({ threshold: 0.2 });
  const Tag = as;

  return (
    <Tag
      ref={ref}
      className={`unlock-card ${inView ? "is-unlocked" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
}
