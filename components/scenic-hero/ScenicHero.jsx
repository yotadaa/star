"use client";

import { useRef, useState } from "react";
import { Pause, Play, BookOpen, ArrowDown, Focus } from "lucide-react";
import ScenicScene from "./ScenicScene";
import useScenicInteraction from "./useScenicInteraction";
import useScenicLifecycle from "./useScenicLifecycle";
import useDiscoveryJournal from "./useDiscoveryJournal";
import { DISCOVERIES, DISCOVERY_IDS, focusBlur } from "./sceneState.mjs";
import styles from "./scenic-hero.module.css";

export default function ScenicHero({ scene, title, children, contentId, cta }) {
  const rootRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const journalButton = useRef(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const { motion, phase } = useScenicLifecycle(rootRef, paused);
  const { discoveries, record } = useDiscoveryJournal();
  const completed = discoveries.includes(scene.discoveryId);

  const { depth, selectDepth, interact, actionState, notice } = useScenicInteraction(scene, completed, record);
  const closeJournal = () => { setJournalOpen(false); journalButton.current?.focus(); };

  return (
    <section ref={rootRef} className={styles.hero} data-scene={scene.id} data-motion={motion} data-phase={phase} data-focus={depth} aria-label={scene.name} onKeyDown={(event) => { if (event.key === "Escape" && journalOpen) { event.stopPropagation(); closeJournal(); } }}>
      <div className={styles.backdrop} aria-hidden="true" style={{ "--depth-blur": `${scene.focus ? focusBlur("far", depth, scene.focus.blur) : 0}px` }}>
        <picture>
          <source media="(max-width: 700px)" srcSet={scene.background.mobile} />
          <source media="(max-width: 1400px)" srcSet={scene.background.medium} />
          <img src={scene.background.src} alt="" width={scene.background.width} height={scene.background.height} fetchPriority="high" className={styles.backgroundImage} />
        </picture>
      </div>
      <ScenicScene scene={scene} depth={depth} motion={motion} interact={interact} actionState={actionState} />
      <div className={styles.scrim} aria-hidden="true" />
      <header className={styles.copy}>
        <h1>{title}</h1>
        <div className={styles.caption}>{children}</div>
        <a href={`#${contentId}`} className={styles.cta}>{cta}<ArrowDown size={16} aria-hidden="true" /></a>
      </header>
      <div className={styles.controls}>
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
      {journalOpen && <aside id={`${scene.id}-journal`} className={styles.journal} aria-label="Exploration journal">
        <h2>Places observed</h2>
        <p>Discoveries from this browsing session.</p>
        <ul>{Object.entries(DISCOVERIES).map(([id, label]) => <li key={id}><span>{label}</span><span>{discoveries.includes(id) ? "Observed" : "Unexplored"}</span></li>)}</ul>
        <button type="button" onClick={closeJournal}>Close journal</button>
      </aside>}
      <div className={styles.fade} aria-hidden="true" />
    </section>
  );
}
