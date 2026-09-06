"use client";

import { useEffect, useRef } from "react";
import styles from "./scenic-hero.module.css";

function placementVars(layout, prefix = "") {
  return Object.fromEntries(Object.entries(layout || {}).map(([key, value]) => [`--${prefix}${key}`, value]));
}

export default function ScenicObject({ object, state, active, onInteract, motion, getState }) {
  const imageRef = useRef(null);
  const animationRef = useRef(null);
  useEffect(() => () => animationRef.current?.cancel(), []);
  useEffect(() => {
    const animation = animationRef.current;
    if (!animation) return;
    if (motion === "reduced") animation.cancel();
    else if (motion === "running" && animation.playState === "paused") animation.play();
    else if (motion !== "running") animation.pause();
  }, [motion]);
  const action = object.action;
  const progress = state?.progress || 0;
  const reveal = object.reveal ? (object.reveal.invert ? 1 - progress : progress) : 1;
  const variables = {
    ...placementVars({ x: "50%", y: "50%", b: "auto", w: "30%", r: "0deg", ...object.layout }),
    ...placementVars({ x: "50%", y: "50%", b: "auto", w: "30%", r: "0deg", ...object.layout, ...object.tablet }, "t-"),
    ...placementVars({ x: "50%", y: "50%", b: "auto", w: "30%", r: "0deg", ...object.layout, ...object.tablet, ...object.mobile }, "m-"),
    "--pivot": object.pivot || "50% 50%",
    "--parallax": object.parallax ?? 0,
    "--duration": `${object.motion?.duration || 9}s`,
    "--delay": `${object.motion?.delay || 0}s`,
    "--sway": object.motion?.sway || "1deg",
    "--travel-x": object.motion?.x || "8px",
    "--travel-y": object.motion?.y || "-4px",
    "--object-opacity": reveal,
    ...placementVars(action?.hitArea?.desktop, "hit-"),
    ...placementVars(action?.hitArea?.tablet || action?.hitArea?.desktop, "t-hit-"),
    ...placementVars(action?.hitArea?.mobile || action?.hitArea?.desktop, "m-hit-"),
  };
  const trigger = () => {
    onInteract(object);
    animationRef.current?.cancel();
    if (motion !== "running" || !object.response?.keyframes || !imageRef.current) return;
    animationRef.current = imageRef.current.animate(object.response.keyframes, {
      duration: object.response.duration || 850,
      easing: object.response.easing || "ease-in-out",
    });
  };
  const image = object.primitive ? <span ref={imageRef} className={styles.primitive} data-material={object.primitive} /> : <img ref={imageRef} src={active && object.activeSrc ? object.activeSrc : object.src} alt="" width={object.width} height={object.height} draggable="false" decoding="async" className={styles.objectImage} />;
  const visual = <span className={styles.ambient} data-animation={object.motion?.type || "none"}>{image}</span>;

  return (
    <div className={styles.object} data-object={object.id} data-active={active || undefined} data-kind={object.kind || "scenery"} style={variables}>
      <div className={styles.parallax} data-scene-parallax>
          {action?.hitArea && <span aria-hidden="true">{visual}</span>}
          {action ? (
            <button type="button" className={styles.objectButton} data-hit-area={Boolean(action.hitArea) || undefined} aria-label={state?.label || action.label} onClick={trigger} aria-pressed={action.pressed || action.depth ? Boolean(active) : undefined}>
              {!action.hitArea && visual}
              <span className={styles.objectLabel}>{state?.label || action.label}</span>
            </button>
          ) : <span aria-hidden="true">{visual}</span>}
          {object.children?.map((child) => {
            const childState = getState(child);
            return <ScenicObject key={child.id} object={child} state={childState} active={childState.progress === 1} onInteract={onInteract} motion={motion} getState={getState} />;
          })}
      </div>
    </div>
  );
}
