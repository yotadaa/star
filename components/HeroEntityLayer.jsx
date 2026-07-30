"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ENTITY_COPY = {
  "butterfly-terracotta": "kupu-kupu jingga",
  "butterfly-moss": "kupu-kupu lumut",
  sparrow: "pipit kecil",
  "migration-v": "formasi burung migrasi",
  bat: "kelelawar kecil",
  firefly: "kunang-kunang",
};

const PHASE_ENTITIES = {
  morning: ["butterfly-terracotta", "butterfly-moss"],
  noon: ["sparrow"],
  sunset: ["migration-v"],
  night: ["bat", "firefly"],
};

const FLIGHT = {
  "butterfly-terracotta": { kind: "butterfly", duration: 10500, flap: 520, drift: 52, pause: [2400, 4000] },
  "butterfly-moss": { kind: "butterfly", duration: 10500, flap: 520, drift: 52, pause: [2400, 4000] },
  sparrow: { kind: "sparrow", duration: 6200, flap: 280, drift: 16, pause: [2000, 3400] },
  "migration-v": { kind: "migration", duration: 8800, flap: 360, drift: 10, pause: [3200, 5000] },
  bat: { kind: "bat", duration: 7200, flap: 300, drift: 34, pause: [2400, 4200] },
  firefly: { kind: "firefly", duration: 10800, flap: 480, drift: 18, pause: [3200, 5200] },
};

const LANE_BY_PHASE = {
  morning: [13, 18],
  noon: [13, 18],
  sunset: [15, 20],
  night: [14, 19],
};

const MOBILE_SKY_LANES = [10];

function between(min, max) {
  return min + Math.random() * (max - min);
}

function pick(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function createEncounter(phase, reducedMotion) {
  const entity = phase === "night" && Math.random() < 1 / 6
    ? "firefly"
    : pick(PHASE_ENTITIES[phase] || PHASE_ENTITIES.morning);
  const direction = Math.random() > 0.5 ? "right" : "left";
  const profile = FLIGHT[entity];
  const compact = window.innerWidth <= 640;
  const lane = pick(compact ? MOBILE_SKY_LANES : (LANE_BY_PHASE[phase] || LANE_BY_PHASE.morning));
  const drift = compact ? profile.drift * 0.3 : profile.drift;

  return {
    id: `${phase}-${entity}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    entity,
    direction,
    lane,
    flightKind: profile.kind,
    flightY1: Math.round(between(-drift, drift)),
    flightY2: Math.round(between(-drift, drift)),
    flightY3: Math.round(between(-drift, drift)),
    flightY4: Math.round(between(-drift, drift)),
    duration: profile.duration,
    flap: profile.flap,
    pause: profile.pause,
    pair: entity === "sparrow" && Math.random() > 0.56,
    static: reducedMotion,
    status: "flying",
  };
}

function clearTimer(ref) {
  if (ref.current) {
    window.clearTimeout(ref.current);
    ref.current = null;
  }
}

export default function HeroEntityLayer({ phase = "morning" }) {
  const layerRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const finishTimerRef = useRef(null);
  const sparkTimerRef = useRef(null);
  const interactingRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [encounter, setEncounter] = useState(null);
  const [spark, setSpark] = useState(null);

  const clearTimers = useCallback(() => {
    clearTimer(spawnTimerRef);
    clearTimer(finishTimerRef);
    clearTimer(sparkTimerRef);
  }, []);

  const scheduleSpawn = useCallback((delay) => {
    clearTimer(spawnTimerRef);
    if (!visible) return;

    spawnTimerRef.current = window.setTimeout(() => {
      interactingRef.current = false;
      setEncounter(createEncounter(phase, reducedMotion));
    }, delay);
  }, [phase, reducedMotion, visible]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(motion.matches);
    syncMotion();
    motion.addEventListener("change", syncMotion);
    return () => motion.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    const hero = layerRef.current?.closest(".hero");
    if (!hero) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.12 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    clearTimers();
    setSpark(null);
    setEncounter(null);
    interactingRef.current = false;
    if (visible) {
      scheduleSpawn(reducedMotion ? 0 : 900);
    }
    return clearTimers;
  }, [clearTimers, phase, reducedMotion, scheduleSpawn, visible]);

  const finishEncounter = useCallback((encounterId, pause) => {
    setEncounter((current) => (current?.id === encounterId ? null : current));
    scheduleSpawn(between(pause[0], pause[1]));
  }, [scheduleSpawn]);

  const handleFlightEnd = useCallback((event) => {
    if (event.target !== event.currentTarget || event.animationName !== "hero-entity-flight") return;
    const active = encounter;
    if (!active || active.status !== "flying") return;
    finishEncounter(active.id, active.pause);
  }, [encounter, finishEncounter]);

  const handleInteract = useCallback((event) => {
    if (!encounter || encounter.status !== "flying" || interactingRef.current) return;
    const layer = layerRef.current;
    if (!layer) return;

    interactingRef.current = true;
    clearTimer(spawnTimerRef);
    const targetRect = event.currentTarget.getBoundingClientRect();
    const layerRect = layer.getBoundingClientRect();
    const startX = targetRect.left - layerRect.left;
    const startY = targetRect.top - layerRect.top;
    const headingRight = encounter.direction === "right";
    const fleeDuration = encounter.entity === "firefly" ? 480 : 400;
    const fleeEndX = headingRight ? layerRect.width + 144 : -144;
    const fleeEndY = Math.max(18, Math.min(layerRect.height - 70, startY + between(-96, 96)));
    const sparkX = Math.max(
      26,
      Math.min(layerRect.width - 26, startX + targetRect.width / 2 + (headingRight ? -30 : 30))
    );
    const sparkY = Math.max(26, startY + targetRect.height / 2 - 22);

    setSpark({
      id: `${encounter.id}-spark`,
      x: sparkX,
      y: sparkY,
    });
    clearTimer(sparkTimerRef);
    sparkTimerRef.current = window.setTimeout(() => setSpark(null), 520);

    setEncounter((current) => {
      if (!current || current.id !== encounter.id) return current;
      return {
        ...current,
        status: "fleeing",
        fleeDuration,
        fleeStartX: Math.round(startX),
        fleeStartY: Math.round(startY),
        fleeEndX: Math.round(fleeEndX),
        fleeEndY: Math.round(fleeEndY),
      };
    });

    clearTimer(finishTimerRef);
    finishTimerRef.current = window.setTimeout(() => {
      setEncounter((current) => (current?.id === encounter.id ? null : current));
      interactingRef.current = false;
      scheduleSpawn(reducedMotion ? 900 : between(encounter.pause[0], encounter.pause[1]));
    }, reducedMotion ? 520 : fleeDuration + 80);
  }, [encounter, reducedMotion, scheduleSpawn]);

  const handleKeyDown = useCallback((event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleInteract(event);
  }, [handleInteract]);

  const encounterStyle = encounter?.status === "fleeing"
    ? {
      "--flee-duration": `${encounter.fleeDuration}ms`,
      "--flee-start-x": `${encounter.fleeStartX}px`,
      "--flee-start-y": `${encounter.fleeStartY}px`,
      "--flee-end-x": `${encounter.fleeEndX}px`,
      "--flee-end-y": `${encounter.fleeEndY}px`,
    }
    : {
      "--entity-lane": `${encounter?.lane || 18}%`,
      "--flight-start-x": encounter?.direction === "right" ? "-10rem" : "calc(100vw + 10rem)",
      "--flight-end-x": encounter?.direction === "right" ? "calc(100vw + 10rem)" : "-10rem",
      "--flight-y-1": `${encounter?.flightY1 || 0}px`,
      "--flight-y-2": `${encounter?.flightY2 || 0}px`,
      "--flight-y-3": `${encounter?.flightY3 || 0}px`,
      "--flight-y-4": `${encounter?.flightY4 || 0}px`,
      "--flight-duration": `${encounter?.duration || 1}ms`,
      "--flap-duration": `${encounter?.flap || 1}ms`,
      "--static-x": encounter?.direction === "right" ? "12%" : "calc(100% - 10rem)",
    };

  return (
    <div className="hero-entity-layer" ref={layerRef} aria-label="Makhluk terbang interaktif">
      {spark && (
        <span
          className="hero-entity-spark"
          aria-hidden="true"
          style={{ left: `${spark.x}px`, top: `${spark.y}px` }}
        />
      )}

      {encounter && (
        <div
          className={`hero-entity-encounter${encounter.static ? " is-static" : ""}${encounter.status === "fleeing" ? " is-fleeing" : ""}`}
          data-entity={encounter.entity}
          data-flight={encounter.flightKind}
          data-direction={encounter.direction}
          data-testid="hero-entity-encounter"
          style={encounterStyle}
          onAnimationEnd={handleFlightEnd}
        >
          <button
            className={`hero-entity-target${encounter.pair ? " is-pair" : ""}`}
            type="button"
            aria-label={`Sentuh ${ENTITY_COPY[encounter.entity]}; ia akan terbang menjauh.`}
            data-testid={`hero-entity-${encounter.entity}`}
            onClick={handleInteract}
            onKeyDown={handleKeyDown}
          >
            {encounter.pair ? (
              <>
                <span className="hero-entity-sprite hero-entity-sprite--rear" aria-hidden="true" />
                <span className="hero-entity-sprite hero-entity-sprite--front" aria-hidden="true" />
              </>
            ) : (
              <span className="hero-entity-sprite" aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
