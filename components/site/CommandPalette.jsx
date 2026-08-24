"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Home, User, FolderGit2, FlaskConical, Mail, Github, Linkedin, GraduationCap, PenLine, Sun } from "lucide-react";
import { navLinks, socials } from "@/lib/data";
import { useSite } from "./SiteProvider";
import { beginRouteProgress } from "./RouteProgressBar";

const NAV_ICONS = { "/": Home, "/about": User, "/projects": FolderGit2, "/research": FlaskConical, "/blog": PenLine, "/contact": Mail };
const LINK_ICONS = { linkedin: Linkedin, github: Github, scholar: GraduationCap, blog: PenLine };

export default function CommandPalette() {
  const { paletteOpen, setPaletteOpen, phase, cycleTheme } = useSite();
  const router = useRouter();

  const go = (href) => {
    beginRouteProgress(href);
    setPaletteOpen(false);
    router.push(href);
  };
  const open = (href) => { setPaletteOpen(false); window.open(href, "_blank", "noopener,noreferrer"); };

  if (!paletteOpen) return null;

  return (
    <div className="cmdk-overlay" onClick={() => setPaletteOpen(false)} data-testid="command-palette">
      <div className="cmdk-box" onClick={(e) => e.stopPropagation()}>
        <Command label="Command Menu">
          <Command.Input placeholder="Search pages, links, or actions…" autoFocus />
          <Command.List>
            <Command.Empty className="cmdk-empty">No results.</Command.Empty>
            <Command.Group heading="Pages">
              {navLinks.map((l) => {
                const Ic = NAV_ICONS[l.href] || Home;
                return (
                  <Command.Item key={l.href} className="cmdk-item" value={`page ${l.label}`} onSelect={() => go(l.href)} data-testid={`cmd-${l.label.toLowerCase()}`}>
                    <span className="ic"><Ic size={16} /></span> {l.label}
                  </Command.Item>
                );
              })}
            </Command.Group>
            <Command.Group heading="Links">
              {socials.map((s) => {
                const Ic = LINK_ICONS[s.key] || Mail;
                return (
                  <Command.Item key={s.key} className="cmdk-item" value={`link ${s.label} ${s.key}`} onSelect={() => open(s.href)}>
                    <span className="ic"><Ic size={16} /></span> {s.cta}
                  </Command.Item>
                );
              })}
            </Command.Group>
            <Command.Group heading="Actions">
              <Command.Item className="cmdk-item" value="toggle sky theme morning noon sunset night" onSelect={() => { cycleTheme(); setPaletteOpen(false); }}>
                <span className="ic"><Sun size={16} /></span>
                Change sky theme ({phase})
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
