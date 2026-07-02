"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sunrise, Sun, Sunset, Moon, Command } from "lucide-react";
import { navLinks, profile } from "@/lib/data";
import { useSite } from "./SiteProvider";

const PHASE_META = {
  morning: { label: "Ganti ke mode siang", Icon: Sunrise },
  noon: { label: "Ganti ke mode sunset", Icon: Sun },
  sunset: { label: "Ganti ke mode malam", Icon: Sunset },
  night: { label: "Ganti ke mode pagi", Icon: Moon },
};

export default function TopNav() {
  const pathname = usePathname();
  const { phase, cycleTheme, setPaletteOpen } = useSite();
  const { label, Icon } = PHASE_META[phase] || PHASE_META.morning;

  return (
    <div className="island-wrap">
      <nav className="island" aria-label="Navigasi utama" data-testid="top-nav">
        <Link href="/" className="island-logo" data-testid="nav-brand">
          <span className="dot" /> {profile.handle}
        </Link>

        <div className="island-navlinks">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`island-link ${pathname === l.href ? "active" : ""}`}
              data-testid={`nav-${l.label.toLowerCase()}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <button type="button" className="island-toggle" onClick={cycleTheme} aria-label={label} title={label} data-testid="daynight-toggle">
          <Icon size={16} />
        </button>
        <button type="button" className="island-toggle" onClick={() => setPaletteOpen(true)} aria-label="Buka command palette" data-testid="open-palette">
          <Command size={16} />
        </button>
      </nav>
    </div>
  );
}
