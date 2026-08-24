"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sunrise, Sun, Sunset, Moon, Command } from "lucide-react";
import { SpriteIcon } from "@/components/claude";
import usePlayerProgress from "@/components/player/usePlayerProgress";
import { navLinks, profile } from "@/lib/data";
import { useSite } from "./SiteProvider";

const PHASE_META = {
  morning: { label: "Switch to noon", Icon: Sunrise },
  noon: { label: "Switch to sunset", Icon: Sun },
  sunset: { label: "Switch to night", Icon: Sunset },
  night: { label: "Switch to morning", Icon: Moon },
};

export default function TopNav() {
  const pathname = usePathname();
  const { phase, cycleTheme, setPaletteOpen, openPlayerStatus } = useSite();
  const progress = usePlayerProgress();
  const { label, Icon } = PHASE_META[phase] || PHASE_META.morning;
  const isActive = (href) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <div className="island-wrap">
      <nav className="island" aria-label="Primary navigation" data-testid="top-nav">
        <Link href="/" className="island-logo" data-testid="nav-brand">
          <span className="dot" /> {profile.handle}
        </Link>

        <div className="island-navlinks">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`island-link ${isActive(l.href) ? "active" : ""}`}
              data-testid={`nav-${l.label.toLowerCase()}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <button type="button" className="island-toggle" onClick={cycleTheme} aria-label={`${label}. Current application theme: ${phase}.`} title={label} data-phase={phase} data-testid="daynight-toggle">
          <Icon size={16} />
        </button>
        <button
          type="button"
          className="island-toggle island-player-toggle"
          onClick={() => openPlayerStatus("inventory")}
          aria-label={`Open player inventory, level ${progress.level.current.number}`}
          title="Inventory, Achievement, Mission"
          data-testid="open-player-status"
        >
          <SpriteIcon id="icon-backpack" size={16} />
          <span className="island-level-badge">Lv.{progress.level.current.number}</span>
        </button>
        <button type="button" className="island-toggle" onClick={() => setPaletteOpen(true)} aria-label="Open command palette" data-testid="open-palette">
          <Command size={16} />
        </button>
      </nav>
    </div>
  );
}
