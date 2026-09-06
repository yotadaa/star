"use client";

import { useEffect, useRef } from "react";
import { HERO_PHASES, getStaticSceneStyle } from "./visualContract";
import { phaseDuration } from "../site/phaseTransition.mjs";

// Gradients stay constant. An opaque underlay prevents the fallback sky from
// leaking through, even when a visitor reverses a partially completed change.
export default function HeroSky({ phase, active }) {
  const root = useRef(null);
  const initial = useRef(phase);
  useEffect(() => {
    const planes = [...root.current.children];
    const target = planes.find((node) => node.dataset.skyPhase === phase);
    let firstFrame = 0, secondFrame = 0, finishTimer = 0;
    const cancelPending = () => {
      cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame); clearTimeout(finishTimer);
    };
    const normalize = () => {
      cancelPending();
      planes.forEach((node) => {
        node.style.transition = "none";
        node.style.opacity = node === target ? "1" : "0";
        node.style.zIndex = "0";
        node.style.willChange = "auto";
      });
    };
    const duration = phaseDuration(active);
    const displayed = planes.map((node) => ({ node, opacity: Number(getComputedStyle(node).opacity), order: Number(node.style.zIndex) || 0 }));
    const current = displayed.find(({ node }) => node === target);
    if (!duration || (current.opacity === 1 && displayed.every(({ node, opacity }) => node === target || opacity === 0))) normalize();
    else {
      displayed.forEach(({ node, opacity }) => { node.style.transition = "none"; node.style.opacity = String(opacity); node.style.willChange = "auto"; });
      if (current.opacity === 0) target.style.zIndex = String(Math.max(...displayed.map(({ order }) => order)) + 1);
      const targetOrder = Number(target.style.zIndex);
      const changing = displayed.filter(({ node, order, opacity }) => node === target || (order > targetOrder && opacity > 0));
      changing.forEach(({ node }) => { node.style.willChange = "opacity"; });
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          changing.forEach(({ node }) => {
            node.style.transition = "opacity var(--phase-visual-duration) var(--phase-easing)";
            node.style.opacity = node === target ? "1" : "0";
          });
          finishTimer = window.setTimeout(normalize, duration + 34);
        });
      });
    }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const suspend = () => { if (document.hidden || reduced.matches || document.documentElement.dataset.phaseTransitionSuspended === "true") normalize(); };
    const visibility = new MutationObserver(suspend);
    visibility.observe(document.documentElement, { attributes: true, attributeFilter: ["data-phase-transition-suspended"] });
    reduced.addEventListener("change", suspend); document.addEventListener("visibilitychange", suspend);
    return () => {
      // Do not normalize here: the next effect must freeze the displayed blend.
      cancelPending(); visibility.disconnect(); reduced.removeEventListener("change", suspend); document.removeEventListener("visibilitychange", suspend);
    };
  }, [phase, active]);
  return <div ref={root} className="parallax-sky-stack" data-sky-target={phase}>
    {HERO_PHASES.map((name) => <span key={name} className="parallax-static-sky" data-sky-phase={name} style={{ ...getStaticSceneStyle(name, false), opacity: name === initial.current ? 1 : 0, zIndex: 0 }} />)}
  </div>;
}
