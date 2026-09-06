"use client";

import { useEffect, useState } from "react";
import { parallaxOffset } from "./sceneState.mjs";
import { PHASE_OVERLAYS } from "../site/phaseTransition.mjs";

// Centralized integration contract; independent of the shell's React provider.
const OVERLAYS = PHASE_OVERLAYS;

export default function useScenicLifecycle(rootRef, userPaused) {
  const [motion, setMotion] = useState("paused");
  const [phase, setPhase] = useState("morning");
  const [focusTarget, setFocusTarget] = useState(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");
    let inView = false, running = false, pointerFrame = 0, boundsFrame = 0;
    let bounds = root.getBoundingClientRect();
    let latestPointer = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
    let position = { x: 0, y: 0 };
    const focusedTransforms = new Map();
    const updateFocusIndicator = (target = document.activeElement) => {
      if (!focusedTransforms.size || !root.contains(target)) return;
      const rect = target.getBoundingClientRect();
      const x = rect.left - bounds.left, y = rect.top - bounds.top;
      const labelWidth = 260, labelHeight = 34, gap = 10;
      const labelLeft = Math.max(12, Math.min(x, bounds.width - labelWidth - 12));
      let labelTop = Math.min(y + rect.height + gap, bounds.height - 90);
      // Keep the label clear of controls and live feedback at any breakpoint.
      const obstacles = [rect, ...[...root.querySelectorAll('[data-scene-controls], [role="status"]')]
        .filter(node => node.textContent.trim()).map(node => node.getBoundingClientRect())]
        .sort((a, b) => b.top - a.top);
      for (const obstacle of obstacles) {
        const left = obstacle.left - bounds.left, top = obstacle.top - bounds.top;
        if (labelLeft < left + obstacle.width && labelLeft + labelWidth > left && labelTop < top + obstacle.height && labelTop + labelHeight + gap > top) labelTop = top - labelHeight - gap;
      }
      setFocusTarget({ x, y, width: rect.width, height: rect.height, label: target.getAttribute("aria-label"), labelLeft: labelLeft - x, labelTop: Math.max(12, labelTop) - y });
    };
    const focusLabel = new MutationObserver(() => updateFocusIndicator());
    const releaseFocus = () => {
      focusLabel.disconnect();
      for (const [node, original] of focusedTransforms) {
        node.style.transform = original.transform;
        node.style.transition = original.transition;
      }
      focusedTransforms.clear();
      setFocusTarget(null);
    };
    const holdFocus = (event) => {
      releaseFocus();
      // Freeze at the displayed matrix, never reset to the layout origin.
      // Reading geometry here is bounded to an explicit focus event, not pointermove.
      const parents = [];
      for (let node = event.target.parentElement; node && node !== root; node = node.parentElement) {
        if (node.hasAttribute("data-scene-parallax")) parents.push([node, getComputedStyle(node).transform]);
      }
      for (const [node, transform] of parents) {
        focusedTransforms.set(node, { transform: node.style.transform, transition: node.style.transition });
        node.style.transition = "none";
        node.style.transform = transform;
      }
      if (parents.length) {
        bounds = root.getBoundingClientRect();
        focusLabel.observe(event.target, { attributes: true, attributeFilter: ["aria-label"] });
        const notice = root.querySelector('[role="status"]');
        if (notice) focusLabel.observe(notice, { childList: true, subtree: true, characterData: true });
        updateFocusIndicator(event.target);
      }
    };
    const resetPointer = () => {
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      position = { x: 0, y: 0 };
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
    const updateBounds = () => {
      if (boundsFrame) return;
      boundsFrame = requestAnimationFrame(() => { boundsFrame = 0; bounds = root.getBoundingClientRect(); updateFocusIndicator(); });
    };
    const onPointer = (event) => {
      if (!running || coarse.matches) return;
      latestPointer = { x: event.clientX, y: event.clientY };
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        const next = parallaxOffset(latestPointer, bounds, 10);
        if (Math.abs(next.x - position.x) < .05 && Math.abs(next.y - position.y) < .05) return;
        position = next;
        root.style.setProperty("--scene-pointer-x", `${position.x.toFixed(2)}px`);
        root.style.setProperty("--scene-pointer-y", `${position.y.toFixed(2)}px`);
      });
    };
    const viewport = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }, { threshold: 0.08 });
    viewport.observe(root);
    const resize = new ResizeObserver(updateBounds);
    resize.observe(root);
    window.addEventListener("scroll", updateBounds, { passive: true });
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
    root.addEventListener("focusin", holdFocus);
    root.addEventListener("focusout", releaseFocus);
    syncPhase(); sync();
    return () => {
      viewport.disconnect(); resize.disconnect(); overlays.disconnect(); theme.disconnect(); resetPointer(); releaseFocus();
      cancelAnimationFrame(boundsFrame);
      window.removeEventListener("scroll", updateBounds);
      reduced.removeEventListener("change", sync); coarse.removeEventListener("change", resetPointer);
      document.removeEventListener("visibilitychange", sync);
      root.removeEventListener("pointermove", onPointer); root.removeEventListener("pointerleave", resetPointer);
      root.removeEventListener("focusin", holdFocus); root.removeEventListener("focusout", releaseFocus);
    };
  }, [rootRef, userPaused]);

  return { motion, phase, focusTarget };
}
