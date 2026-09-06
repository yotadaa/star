"use client";

import { useRef, useState } from "react";
import { Pause, Play, BookOpen, ArrowDown, Focus } from "lucide-react";
import ScenicScene from "./ScenicScene";
import ScenicAtmosphere from "./ScenicAtmosphere";
import useScenicInteraction from "./useScenicInteraction";
import useScenicLifecycle from "./useScenicLifecycle";
import useDiscoveryJournal from "./useDiscoveryJournal";
import { DISCOVERIES, DISCOVERY_IDS } from "./sceneState.mjs";
import styles from "./scenic-hero.module.css";

export default function ScenicHero({ scene, title, children, contentId, cta }) {
  const rootRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const journalButton = useRef(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const { motion, phase, focusTarget } = useScenicLifecycle(rootRef, paused);
  const { discoveries, record } = useDiscoveryJournal();
  const completed = discoveries.includes(scene.discoveryId);

  const { depth, selectDepth, interact, actionState, notice } = useScenicInteraction(scene, completed, record);
  const closeJournal = () => { setJournalOpen(false); journalButton.current?.focus(); };
  const breakout = scene.breakout;
  const flowStyle = breakout ? {
    "--scene-overhang-desktop": breakout.desktop,
    "--scene-overhang-tablet": breakout.tablet,
    "--scene-overhang-mobile": breakout.mobile,
  } : undefined;

  return (
    <div className={styles.flow} style={flowStyle}>
    <section ref={rootRef} className={styles.hero} data-scene={scene.id} data-motion={motion} data-phase={phase} data-focus={depth} data-focus-indicator={Boolean(focusTarget)} aria-label={scene.name} onKeyDown={(event) => { if (event.key === "Escape" && journalOpen) { event.stopPropagation(); closeJournal(); } }}>
      <div className={styles.viewport}>
      <div className={styles.backdrop} aria-hidden="true" style={{ "--background-defocus": `${scene.focus?.backgroundBlur || 4}px` }}>
        {(scene.focus ? ["sharp", "soft"] : ["sharp"]).map((plane) => <picture key={plane} className={styles.backgroundPlane} data-focus-plane={plane} data-visible={plane === "sharp" || depth !== "far"}>
          <source media="(max-width: 700px)" srcSet={scene.background.mobile} />
          <source media="(max-width: 1400px)" srcSet={scene.background.medium} />
          <img src={scene.background.src} alt="" width={scene.background.width} height={scene.background.height} fetchPriority={plane === "sharp" ? "high" : "auto"} className={styles.backgroundImage} />
        </picture>)}
      </div>
      <ScenicScene scene={scene} depth={depth} motion={motion} interact={interact} actionState={actionState} />
      <ScenicAtmosphere phase={phase} appearance={scene.atmosphere} />
      <div className={styles.fade} data-scene-fade aria-hidden="true" />
      </div>
      {breakout && <div className={styles.breakoutClip} data-scene-breakout>
        <div className={styles.breakoutCoordinates} style={{ opacity: breakout.opacity?.[phase] ?? 1 }}>
          <ScenicScene scene={scene} depth={depth} motion={motion} interact={interact} actionState={actionState} foreground />
        </div>
      </div>}
      <header className={styles.copy} data-copy-tone={scene.copy?.tones?.[phase] || "light"} style={{ "--copy-top": scene.copy?.top, "--copy-inset": scene.copy?.inset }}>
        <h1>{title}</h1>
        <div className={styles.caption}>{children}</div>
        <a href={`#${contentId}`} className={styles.cta}>{cta}<ArrowDown size={16} aria-hidden="true" /></a>
      </header>
      <div className={styles.controls} data-scene-controls>
        <span className={styles.place}>{scene.name}</span>
        <div className={styles.tools}>
          {scene.focus && <div className={styles.focusControls} role="group" aria-label="Choose scene depth">
            {scene.focus.options.map((option) => <button key={option.id} type="button" aria-pressed={depth === option.id} onClick={() => selectDepth(option.id)}><Focus size={14} aria-hidden="true" />{option.label}</button>)}
          </div>}
          <button type="button" aria-label={paused ? "Resume ambient motion" : "Pause ambient motion"} aria-pressed={paused} onClick={() => setPaused((value) => !value)}>{paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}<span>{paused ? "Resume" : "Pause"}</span></button>
          <button ref={journalButton} type="button" aria-expanded={journalOpen} aria-controls={`${scene.id}-journal`} onClick={() => setJournalOpen((value) => !value)}><BookOpen size={16} aria-hidden="true" />Journal <span>{discoveries.length}/{DISCOVERY_IDS.length}</span></button>
        </div>
      </div>
      <div className={styles.notice} role="status" aria-live="polite" aria-atomic="true">{notice}</div>
      {focusTarget && <div className={styles.focusIndicator} data-scene-focus-ring aria-hidden="true" style={{ left: focusTarget.x, top: focusTarget.y, width: focusTarget.width, height: focusTarget.height }}>
        <span style={{ left: focusTarget.labelLeft, top: focusTarget.labelTop }}>{focusTarget.label}</span>
      </div>}
      {journalOpen && <aside id={`${scene.id}-journal`} className={styles.journal} aria-label="Exploration journal">
        <h2>Places observed</h2>
        <p>Discoveries from this browsing session.</p>
        <ul>{Object.entries(DISCOVERIES).map(([id, label]) => <li key={id}><span>{label}</span><span>{discoveries.includes(id) ? "Observed" : "Unexplored"}</span></li>)}</ul>
        <button type="button" onClick={closeJournal}>Close journal</button>
      </aside>}
    </section>
    {breakout && <div className={styles.breakoutClearance} data-scene-clearance aria-hidden="true" />}
    </div>
  );
}
