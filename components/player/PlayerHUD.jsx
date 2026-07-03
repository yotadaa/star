"use client";

import { useEffect, useRef, useState } from "react";
import { SpriteIcon, useToast } from "@/components/claude";
import usePlayerProgress from "./usePlayerProgress";
import LevelBadge from "./LevelBadge";
import PlayerAvatar from "./PlayerAvatar";
import PlayerHUDCard from "./PlayerHUDCard";
import { useSite } from "@/components/site/SiteProvider";

export default function PlayerHUD() {
  const [open, setOpen] = useState(false);
  const [levelFlash, setLevelFlash] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const previousLevelRef = useRef(null);
  const progress = usePlayerProgress();
  const { openPlayerStatus, setChatOpen } = useSite();
  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    const currentLevel = progress.level.current.number;
    if (previousLevelRef.current === null) {
      previousLevelRef.current = currentLevel;
      return undefined;
    }

    if (currentLevel <= previousLevelRef.current) {
      previousLevelRef.current = currentLevel;
      return undefined;
    }

    previousLevelRef.current = currentLevel;
    setLevelFlash(true);
    showToast(`Level naik ke Lv.${currentLevel} · ${progress.level.current.label}`, {
      icon: <SpriteIcon id="icon-level-badge" size={16} />,
    });
    const timeoutId = window.setTimeout(() => setLevelFlash(false), 480);
    return () => window.clearTimeout(timeoutId);
  }, [progress.level.current.label, progress.level.current.number, showToast]);

  function openChat() {
    setOpen(false);
    setChatOpen(true);
  }

  function openTab(tab) {
    setOpen(false);
    openPlayerStatus(tab);
  }

  function handleTriggerKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setOpen((current) => !current);
  }

  return (
    <div ref={rootRef} className={`player-hud ${open ? "is-open" : ""} ${levelFlash ? "is-level-up" : ""}`}>
      <button
        ref={triggerRef}
        type="button"
        className="player-hud-trigger"
        aria-label={`Buka Player HUD Mukhtada, level ${progress.level.current.number}`}
        aria-expanded={open}
        aria-controls="player-hud-card"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        data-testid="player-hud-trigger"
      >
        <span className="player-avatar-wrap">
          <PlayerAvatar />
          <LevelBadge level={progress.level.current.number} />
        </span>
        <span className="player-hud-trigger-name">Mukhtada</span>
      </button>

      {open && (
        <PlayerHUDCard
          progress={progress}
          onOpenChat={openChat}
          onOpenPlayerTab={openTab}
        />
      )}
    </div>
  );
}
