"use client";

import dynamic from "next/dynamic";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import TopNav from "./TopNav";
import UtilityBar from "./UtilityBar";
import Footer from "@/components/Footer";
import { ToastProvider, XpScrollBar } from "@/components/claude";

const SiteCtx = createContext(null);
export const useSite = () => useContext(SiteCtx);
const PHASES = ["morning", "noon", "sunset", "night"];

const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });
const PlayerStatusPopup = dynamic(() => import("@/components/player/PlayerStatusPopup"), { ssr: false });
const WorldChatPanel = dynamic(() => import("@/components/world-chat/WorldChatPanel"), { ssr: false });
const NalaWidget = dynamic(() => import("@/components/nala/NalaWidget"), { ssr: false });

export default function SiteProvider({ children }) {
  const [phase, setPhase] = useState("morning");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerTab, setPlayerTab] = useState("inventory");
  const [chatOpen, setChatOpen] = useState(false);
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
  const openPlayerStatus = useCallback((tab = "inventory") => {
    setPlayerTab(tab);
    setPlayerOpen(true);
  }, []);

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
    <SiteCtx.Provider value={{ phase, night, cycleTheme, toggleNight, paletteOpen, setPaletteOpen, playerOpen, setPlayerOpen, playerTab, openPlayerStatus, chatOpen, setChatOpen }}>
      <ToastProvider>
        <XpScrollBar />
        <UtilityBar />
        <TopNav />
        {paletteOpen && <CommandPalette />}
        {playerOpen && <PlayerStatusPopup open={playerOpen} initialTab={playerTab} onClose={() => setPlayerOpen(false)} />}
        {chatOpen && <WorldChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />}
        <NalaWidget obscured={chatOpen} />
        <main className="site-main" id="main">
          {children}
        </main>
        <Footer />
      </ToastProvider>
    </SiteCtx.Provider>
  );
}
