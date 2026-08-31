"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ENTITY_COPY = {
  "butterfly-terracotta": "orange butterfly",
  "butterfly-moss": "moss-green butterfly",
  sparrow: "small sparrow",
  "migration-v": "migrating bird formation",
  bat: "small bat",
  firefly: "firefly",
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

const FLIGHT_CURVES = {
  butterfly: { primaryCycles: 1.25, secondaryCycles: 2.5, primaryWeight: 0.62, secondaryWeight: 0.18 },
  sparrow: { primaryCycles: 0.7, secondaryCycles: 1.45, primaryWeight: 0.48, secondaryWeight: 0.12 },
  migration: { primaryCycles: 0.45, secondaryCycles: 0.9, primaryWeight: 0.34, secondaryWeight: 0.08 },
  bat: { primaryCycles: 1.45, secondaryCycles: 2.65, primaryWeight: 0.56, secondaryWeight: 0.2 },
  firefly: { primaryCycles: 0.95, secondaryCycles: 2.1, primaryWeight: 0.46, secondaryWeight: 0.18 },
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

function getFlightDrift(encounter, progress) {
  const curve = FLIGHT_CURVES[encounter.flightKind];
  const envelope = Math.sin(Math.PI * progress);
  const primary = Math.sin((progress * curve.primaryCycles + encounter.primaryPhase) * Math.PI * 2);
  const secondary = Math.sin((progress * curve.secondaryCycles + encounter.secondaryPhase) * Math.PI * 2);

  return Math.round(
    encounter.drift * envelope * (primary * curve.primaryWeight + secondary * curve.secondaryWeight)
  );
}

function getFlightPosition(encounter, layerWidth, progress) {
  const edgeMargin = encounter.entity === "migration-v" ? 176 : 144;
  const startX = encounter.direction === "right" ? -edgeMargin : layerWidth + edgeMargin;
  const endX = encounter.direction === "right" ? layerWidth + edgeMargin : -edgeMargin;

  return {
    x: startX + (endX - startX) * progress,
    y: getFlightDrift(encounter, progress),
  };
}

function createFlightKeyframes(encounter, layerWidth) {
  const resumeProgress = encounter.resumeProgress || 0;
  const remainingDuration = encounter.duration * (1 - resumeProgress);
  const rejoinDuration = encounter.courseOffsetX || encounter.courseOffsetY ? 720 : 0;
  const frameCount = 24;

  return Array.from({ length: frameCount + 1 }, (_, index) => {
    const offset = index / frameCount;
    const progress = resumeProgress + (1 - resumeProgress) * offset;
    const coursePosition = getFlightPosition(encounter, layerWidth, progress);
    const rejoinProgress = rejoinDuration ? Math.min((remainingDuration * offset) / rejoinDuration, 1) : 1;
    const rejoinFactor = 1 - (1 - rejoinProgress) ** 3;
    const x = coursePosition.x + (encounter.courseOffsetX || 0) * (1 - rejoinFactor);
    const y = coursePosition.y + (encounter.courseOffsetY || 0) * (1 - rejoinFactor);

    return {
      offset,
      transform: `translate3d(${Math.round(x)}px, ${y}px, 0)`,
    };
  });
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
    drift,
    primaryPhase: between(0, 1),
    secondaryPhase: between(0, 1),
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function HeroEntityLayer({ phase = "morning" }) {
  const layerRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const finishTimerRef = useRef(null);
  const sparkTimerRef = useRef(null);
  const flightAnimationRef = useRef(null);
  const interactingRef = useRef(false);
  const encounterNodeRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [encounter, setEncounter] = useState(null);
  const [spark, setSpark] = useState(null);

  const clearTimers = useCallback(() => {
    clearTimer(spawnTimerRef);
    clearTimer(finishTimerRef);
    clearTimer(sparkTimerRef);
  }, []);

  const stopFlight = useCallback(() => {
    if (flightAnimationRef.current) {
      flightAnimationRef.current.cancel();
      flightAnimationRef.current = null;
    }
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
    stopFlight();
    setSpark(null);
    setEncounter(null);
    interactingRef.current = false;
    if (visible) {
      scheduleSpawn(reducedMotion ? 0 : 900);
    }
    return () => {
      clearTimers();
      stopFlight();
    };
  }, [clearTimers, phase, reducedMotion, scheduleSpawn, stopFlight, visible]);

  const finishEncounter = useCallback((encounterId, pause) => {
    setEncounter((current) => (current?.id === encounterId ? null : current));
    scheduleSpawn(between(pause[0], pause[1]));
  }, [scheduleSpawn]);

  useEffect(() => {
    stopFlight();
    if (!encounter || encounter.status !== "flying" || encounter.static || !visible) return undefined;

    const layer = layerRef.current;
    const node = encounterNodeRef.current;
    if (!layer || !node) return undefined;

    const resumeProgress = encounter.resumeProgress || 0;
    const animation = node.animate(
      createFlightKeyframes(encounter, layer.getBoundingClientRect().width),
      {
        duration: encounter.duration * (1 - resumeProgress),
        easing: "linear",
        fill: "forwards",
      }
    );
    flightAnimationRef.current = animation;
    animation.finished.then(() => {
      if (flightAnimationRef.current !== animation) return;
      flightAnimationRef.current = null;
      finishEncounter(encounter.id, encounter.pause);
    }).catch(() => {});

    return () => {
      if (flightAnimationRef.current === animation) {
        animation.cancel();
        flightAnimationRef.current = null;
      }
    };
  }, [encounter, finishEncounter, stopFlight, visible]);

  const handleInteract = useCallback((event) => {
    if (!encounter || encounter.status !== "flying" || interactingRef.current) return;
    const layer = layerRef.current;
    if (!layer) return;

    const previousProgress = encounter.resumeProgress || 0;
    const animationTime = Number(flightAnimationRef.current?.currentTime || 0);
    const resumeProgress = Math.min(previousProgress + animationTime / encounter.duration, 1);
    interactingRef.current = true;
    stopFlight();
    clearTimer(spawnTimerRef);
    const targetRect = event.currentTarget.getBoundingClientRect();
    const layerRect = layer.getBoundingClientRect();
    const startX = targetRect.left - layerRect.left;
    const startY = targetRect.top - layerRect.top;
    const centerX = startX + targetRect.width / 2;
    const centerY = startY + targetRect.height / 2;
    const pointerX = Number.isFinite(event.clientX) ? event.clientX - layerRect.left : centerX;
    const pointerY = Number.isFinite(event.clientY) ? event.clientY - layerRect.top : centerY;
    const sparkX = Math.max(
      26,
      Math.min(layerRect.width - 26, centerX)
    );
    const sparkY = Math.max(26, centerY - 22);

    setSpark({
      id: `${encounter.id}-spark`,
      x: sparkX,
      y: sparkY,
    });
    clearTimer(sparkTimerRef);
    sparkTimerRef.current = window.setTimeout(() => setSpark(null), 520);

    if (reducedMotion) {
      interactingRef.current = false;
      return;
    }

    const dodgeDuration = encounter.entity === "firefly" ? 360 : 300;
    const xMin = 14;
    const xMax = Math.max(xMin, layerRect.width - targetRect.width - 14);
    const yMin = 20;
    const yMax = Math.max(yMin, layerRect.height - targetRect.height - 20);
    const horizontalDirection = pointerX <= centerX ? 1 : -1;
    const verticalDirection = Math.abs(pointerY - centerY) < 8
      ? (Math.random() > 0.5 ? 1 : -1)
      : (pointerY <= centerY ? 1 : -1);
    const dodgeDistanceX = between(74, 116);
    const dodgeDistanceY = between(42, 68);
    let dodgeEndX = clamp(startX + horizontalDirection * dodgeDistanceX, xMin, xMax);
    if (Math.abs(dodgeEndX - startX) < dodgeDistanceX * 0.45) {
      dodgeEndX = clamp(startX - horizontalDirection * dodgeDistanceX, xMin, xMax);
    }
    const dodgeEndY = clamp(startY + verticalDirection * dodgeDistanceY, yMin, yMax);
    setEncounter((current) => {
      if (!current || current.id !== encounter.id) return current;
      return {
        ...current,
        status: "dodging",
        dodgeDuration,
        dodgeStartX: Math.round(startX),
        dodgeStartY: Math.round(startY),
        dodgeEndX: Math.round(dodgeEndX),
        dodgeEndY: Math.round(dodgeEndY),
        resumeProgress,
      };
    });

    clearTimer(finishTimerRef);
    finishTimerRef.current = window.setTimeout(() => {
      const baseline = getFlightPosition(encounter, layerRect.width, resumeProgress);
      setEncounter((current) => {
        if (current?.id !== encounter.id) return current;
        return {
          ...current,
          status: "flying",
          courseOffsetX: Math.round(dodgeEndX - baseline.x),
          courseOffsetY: Math.round(dodgeEndY - baseline.y),
        };
      });
      interactingRef.current = false;
    }, dodgeDuration + 30);
  }, [encounter, reducedMotion, stopFlight]);

  const handleKeyDown = useCallback((event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleInteract(event);
  }, [handleInteract]);

  const encounterStyle = encounter?.status === "dodging"
    ? {
      "--dodge-duration": `${encounter.dodgeDuration}ms`,
      "--dodge-start-x": `${encounter.dodgeStartX}px`,
      "--dodge-start-y": `${encounter.dodgeStartY}px`,
      "--dodge-end-x": `${encounter.dodgeEndX}px`,
      "--dodge-end-y": `${encounter.dodgeEndY}px`,
    }
    : {
      "--entity-lane": `${encounter?.lane || 18}%`,
      "--flight-start-x": encounter?.dodgeEndX
        ? `${encounter.dodgeEndX}px`
        : encounter?.direction === "right" ? "-10rem" : "calc(100vw + 10rem)",
      "--flight-start-y": encounter?.dodgeEndY ? `${encounter.dodgeEndY}px` : "0px",
      "--flap-duration": `${encounter?.flap || 1}ms`,
      "--static-x": encounter?.direction === "right" ? "12%" : "calc(100% - 10rem)",
    };

  return (
    <div className="hero-entity-layer" ref={layerRef} aria-label="Interactive flying creatures">
      {spark && (
        <span
          className="hero-entity-spark"
          aria-hidden="true"
          style={{ left: `${spark.x}px`, top: `${spark.y}px` }}
        />
      )}

      {encounter && (
        <div
          className={`hero-entity-encounter${encounter.static ? " is-static" : ""}${encounter.status === "dodging" ? " is-dodging" : ""}`}
          data-entity={encounter.entity}
          data-flight={encounter.flightKind}
          data-direction={encounter.direction}
          data-state={encounter.status}
          data-testid="hero-entity-encounter"
          style={encounterStyle}
          ref={encounterNodeRef}
        >
          <button
            className={`hero-entity-target${encounter.pair ? " is-pair" : ""}`}
            type="button"
            aria-label={`Activate the ${ENTITY_COPY[encounter.entity]} to make it dodge.`}
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
