"use client";

import React, { useState } from "react";

/**
 * PortalCard - kartu channel di halaman Contact (LinkedIn, GitHub, Scholar,
 * Blog, Instagram). Hover lift + shadow warna sesuai tema card, dan efek
 * ripple singkat dari titik klik sebelum membuka link di tab baru.
 *
 * Usage:
 *   <PortalCard
 *     href="https://linkedin.com/in/..."
 *     accent="#2f6fa8"        // warna dominan card (biru untuk LinkedIn dst)
 *     icon={<LinkedinIcon/>}
 *     title="Let's Connect"
 *     description="Terhubung secara profesional"
 *     cta="Buka LinkedIn"
 *   />
 */
export default function PortalCard({
  href,
  accent = "var(--ink)",
  icon,
  title,
  description,
  cta,
  className = "",
}) {
  const [ripple, setRipple] = useState(null); // { x, y, id }

  function handleClick(e) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipple({ x, y, id });

    // beri waktu ripple terlihat sebagian sebelum navigasi
    window.setTimeout(() => {
      window.open(href, "_blank", "noopener,noreferrer");
    }, 150);

    window.setTimeout(() => setRipple(null), 450);
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className={`portal-card ${className}`}
      style={{ "--card-accent": accent }}
    >
      <div className="portal-card-head">
        <h3>{title}</h3>
        {icon && <span className="portal-card-icon">{icon}</span>}
      </div>
      <p>{description}</p>
      <span className="portal-card-cta">{cta}</span>

      {ripple && (
        <span
          key={ripple.id}
          className="portal-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
        />
      )}
    </a>
  );
}
