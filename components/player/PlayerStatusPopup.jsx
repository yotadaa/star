"use client";

import { useEffect, useRef, useState } from "react";
import { HudStatusStrip, PixelButton, SpriteIcon, useToast } from "@/components/claude";
import AchievementList from "./AchievementList";
import InventoryGrid from "./InventoryGrid";
import MissionList from "./MissionList";
import ProgressBarSegmented from "./ProgressBarSegmented";
import usePlayerProgress from "./usePlayerProgress";

const tabs = [
  { key: "inventory", label: "Inventory" },
  { key: "achievements", label: "Achievement" },
  { key: "missions", label: "Mission" },
];

export default function PlayerStatusPopup({ open, onClose, initialTab = "inventory" }) {
  const [tab, setTab] = useState(initialTab);
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const progress = usePlayerProgress();
  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return undefined;
    previousFocusRef.current = document.activeElement;
    const id = window.requestAnimationFrame(() => dialogRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (open && tabs.some((item) => item.key === initialTab)) setTab(initialTab);
  }, [initialTab, open]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open) return;
    const storageKey = `player-status-toast-level-${progress.level.current.number}`;
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, "1");
    showToast(`Player Points synced: Lv.${progress.level.current.number} ${progress.level.current.label}`, {
      icon: <SpriteIcon id="icon-star-level" size={16} />,
    });
  }, [open, progress.level.current.label, progress.level.current.number, showToast]);

  if (!open) return null;

  const nextLabel = progress.level.next
    ? `${progress.totalPP}/${progress.level.next.points} toward Lv.${progress.level.next.number}`
    : `${progress.totalPP} PP - maximum level`;

  return (
    <div
      className="player-popup-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="player-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-popup-title"
        tabIndex={-1}
        data-testid="player-status-popup"
      >
        <header className="player-popup-header">
          <div className="player-tabs" role="tablist" aria-label="Player status tabs">
            {tabs.map((item) => (
              <PixelButton
                key={item.key}
                selected={tab === item.key}
                className="player-tab"
                onClick={() => setTab(item.key)}
                aria-selected={tab === item.key}
                role="tab"
              >
                {item.label}
              </PixelButton>
            ))}
          </div>
          <PixelButton className="player-close" onClick={onClose} aria-label="Close Player Status">
            X
          </PixelButton>
        </header>

        <div className="player-popup-summary">
          <h2 id="player-popup-title">Player Status</h2>
          <HudStatusStrip
            className="player-popup-hud-status"
            items={[
              {
                icon: <SpriteIcon id="icon-level-badge" size={14} />,
                label: `Lv.${progress.level.current.number}: ${progress.level.current.label}`,
                accent: "gold",
              },
              {
                icon: <SpriteIcon id="icon-player-points" size={14} />,
                label: `${progress.totalPP} PP`,
                accent: "aurora",
              },
              {
                icon: <SpriteIcon id="icon-backpack" size={14} />,
                label: `${progress.inventory.length} items`,
                accent: "ink",
              },
            ]}
          />
          <ProgressBarSegmented current={progress.level.progress} target={progress.level.target} label={nextLabel} />
        </div>

        <div className="player-popup-body">
          {tab === "inventory" && <InventoryGrid items={progress.inventory} />}
          {tab === "achievements" && <AchievementList achievements={progress.achievements} />}
          {tab === "missions" && <MissionList missions={progress.missions} />}
        </div>
      </section>
    </div>
  );
}
