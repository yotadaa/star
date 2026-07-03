"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import TopNav from "./TopNav";
import CommandPalette from "./CommandPalette";
import Footer from "@/components/Footer";
import { ToastProvider, XpScrollBar } from "@/components/claude";

const SiteCtx = createContext(null);
export const useSite = () => useContext(SiteCtx);
const PHASES = ["morning", "noon", "sunset", "night"];

export default function SiteProvider({ children }) {
  const [phase, setPhase] = useState("morning");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const night = phase === "night";

  useEffect(() => {
    const saved = localStorage.getItem("cockpit-phase");
    if (PHASES.includes(saved)) setPhase(saved);
  }, []);

  const cycleTheme = useCallback(() => {
    setPhase((current) => {
      const next = PHASES[(PHASES.indexOf(current) + 1) % PHASES.length];
      localStorage.setItem("cockpit-phase", next);
      return next;
    });
  }, []);

  const toggleNight = cycleTheme;

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SiteCtx.Provider value={{ phase, night, cycleTheme, toggleNight, paletteOpen, setPaletteOpen }}>
      <ToastProvider>
        <XpScrollBar />
        <TopNav />
        <CommandPalette />
        <main className="site-main" id="main">
          {children}
        </main>
        <Footer />
      </ToastProvider>
    </SiteCtx.Provider>
  );
}
