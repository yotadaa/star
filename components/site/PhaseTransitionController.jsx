"use client";

import { useEffect } from "react";
import { PHASE_OVERLAYS } from "./phaseTransition.mjs";

export default function PhaseTransitionController() {
  useEffect(() => {
    const html = document.documentElement;
    let timer = 0, frame = 0;
    const syncVisibility = () => {
      const covered = [...document.querySelectorAll(PHASE_OVERLAYS)].some((node) => node.getClientRects().length);
      html.dataset.phaseTransitionSuspended = String(document.hidden || covered);
    };
    // Hydration and persisted phase restoration are initialization, not travel.
    const settle = () => {
      if (html.dataset.phaseTransitionReady === "true") return;
      clearTimeout(timer); cancelAnimationFrame(frame);
      timer = window.setTimeout(() => {
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() => { html.dataset.phaseTransitionReady = "true"; });
        });
      }, 120);
    };
    const phase = new MutationObserver(settle);
    phase.observe(html, { attributes: true, attributeFilter: ["data-cockpit-phase"] });
    const overlays = new MutationObserver(syncVisibility);
    overlays.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden", "open", "aria-hidden"] });
    document.addEventListener("visibilitychange", syncVisibility);
    syncVisibility(); settle();
    return () => {
      clearTimeout(timer); cancelAnimationFrame(frame); phase.disconnect(); overlays.disconnect();
      document.removeEventListener("visibilitychange", syncVisibility);
      delete html.dataset.phaseTransitionReady; delete html.dataset.phaseTransitionSuspended;
    };
  }, []);
  return null;
}
