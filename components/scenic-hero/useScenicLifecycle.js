"use client";

import { useEffect, useState } from "react";
import { parallaxOffset } from "./sceneState.mjs";

// Centralized integration contract; independent of the shell's React provider.
const OVERLAYS = '[data-testid="command-palette"], [data-testid="player-status-popup"], [data-testid="world-chat-panel"], dialog[open]';

export default function useScenicLifecycle(rootRef, userPaused) {
  const [motion, setMotion] = useState("paused");
  const [phase, setPhase] = useState("morning");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");
    let inView = false, running = false, pointerFrame = 0;
    let position = { x: 0, y: 0 };
    const resetPointer = () => {
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      root.style.setProperty("--scene-pointer-x", "0px");
      root.style.setProperty("--scene-pointer-y", "0px");
    };
    const sync = () => {
      const covered = [...document.querySelectorAll(OVERLAYS)].some((node) => node.getClientRects().length > 0);
      running = inView && !document.hidden && !covered && !userPaused && !reduced.matches;
      const next = reduced.matches ? "reduced" : running ? "running" : "paused";
      root.dataset.motion = next;
      setMotion(next);
      if (!running) resetPointer();
    };
    const syncPhase = () => setPhase(document.documentElement.dataset.cockpitPhase || "morning");
    const onPointer = (event) => {
      if (!running || coarse.matches) return;
      position = parallaxOffset({ x: event.clientX, y: event.clientY }, root.getBoundingClientRect(), 10);
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        root.style.setProperty("--scene-pointer-x", `${position.x.toFixed(2)}px`);
        root.style.setProperty("--scene-pointer-y", `${position.y.toFixed(2)}px`);
      });
    };
    const viewport = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }, { threshold: 0.08 });
    viewport.observe(root);
    const overlays = new MutationObserver((records) => {
      if (records.some((record) => !root.contains(record.target))) sync();
    });
    overlays.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "open", "aria-hidden"] });
    const theme = new MutationObserver(syncPhase);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-cockpit-phase"] });
    reduced.addEventListener("change", sync);
    coarse.addEventListener("change", resetPointer);
    document.addEventListener("visibilitychange", sync);
    root.addEventListener("pointermove", onPointer, { passive: true });
    root.addEventListener("pointerleave", resetPointer);
    syncPhase(); sync();
    return () => {
      viewport.disconnect(); overlays.disconnect(); theme.disconnect(); resetPointer();
      reduced.removeEventListener("change", sync); coarse.removeEventListener("change", resetPointer);
      document.removeEventListener("visibilitychange", sync);
      root.removeEventListener("pointermove", onPointer); root.removeEventListener("pointerleave", resetPointer);
    };
  }, [rootRef, userPaused]);

  return { motion, phase };
}
