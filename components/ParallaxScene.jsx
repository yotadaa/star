"use client";

import { startTransition, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { HERO_PHASES, advanceOrbitTarget, getHeroVisualContract, getStaticSceneStyle } from "@/components/hero/visualContract";

const AMBIENT_GRASS_BLADES = Array.from({ length: 24 }, (_, index) => ({
  left: (index * 43 + 7) % 101,
  height: 36 + ((index * 19) % 47),
  delay: -((index * 0.37) % 5.2),
  duration: 4.8 + ((index * 0.41) % 2.8),
  lean: -7 + ((index * 11) % 15),
}));

function supportsWebGL2() {
  return typeof window !== "undefined" && typeof window.WebGL2RenderingContext !== "undefined";
}

function SkyBackdrop({ phase, mobile }) {
  return (
    <span className="parallax-sky-stack" aria-hidden="true">
      {HERO_PHASES.map((layerPhase) => (
        <span
          className={`parallax-static-sky${layerPhase === phase ? " is-visible" : ""}`}
          data-sky-phase={layerPhase}
          key={layerPhase}
          style={getStaticSceneStyle(layerPhase, mobile)}
        />
      ))}
    </span>
  );
}

function orbitPosition(angle, kind) {
  const radiusX = kind === "sun" ? 0.3 : 0.282;
  const radiusY = kind === "sun" ? 0.39 : 0.3705;
  return {
    x: 0.5 + Math.cos(angle) * radiusX,
    y: 0.5 - Math.sin(angle) * radiusY,
  };
}

function orbitOpacity(angle, visibility, kind) {
  return Math.min(1, Math.max(0, Math.sin(angle)) * visibility * (kind === "sun" ? 1.12 : 1));
}

function StaticCelestial({ active, contract, kind, reduced }) {
  const elementRef = useRef(null);
  const animationRef = useRef(null);
  const lifecyclePausedRef = useRef(false);
  const previousPhaseRef = useRef(contract.phase);
  const rawAngle = kind === "sun" ? contract.theme.sunAngle : contract.theme.moonAngle;
  const rawVisibility = kind === "sun" ? contract.theme.sunVisibility : contract.theme.moonVisibility;
  const targetAngleRef = useRef(rawAngle);
  const targetVisibilityRef = useRef(rawVisibility);
  const motionRef = useRef({
    startAngle: rawAngle,
    targetAngle: rawAngle,
    startVisibility: rawVisibility,
    targetVisibility: rawVisibility,
    duration: 1,
  });
  const initialPosition = orbitPosition(rawAngle, kind);
  const size = kind === "sun" ? contract.profile.celestial.sunSize : contract.profile.celestial.moonSize;

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const setEndpoint = (angle, visibility) => {
      const position = orbitPosition(angle, kind);
      element.style.left = `${position.x * 100}%`;
      element.style.top = `${position.y * 100}%`;
      element.style.opacity = String(orbitOpacity(angle, visibility, kind));
    };

    if (reduced) {
      animationRef.current?.cancel();
      animationRef.current = null;
      lifecyclePausedRef.current = false;
      targetAngleRef.current = rawAngle;
      targetVisibilityRef.current = rawVisibility;
      motionRef.current = {
        startAngle: rawAngle,
        targetAngle: rawAngle,
        startVisibility: rawVisibility,
        targetVisibility: rawVisibility,
        duration: 1,
      };
      previousPhaseRef.current = contract.phase;
      setEndpoint(rawAngle, rawVisibility);
      return;
    }

    if (previousPhaseRef.current === contract.phase) {
      if (!animationRef.current) setEndpoint(targetAngleRef.current, targetVisibilityRef.current);
      return;
    }

    const previousMotion = motionRef.current;
    const previousAnimation = animationRef.current;
    const progress = previousAnimation
      ? Math.min(1, Math.max(0, Number(previousAnimation.currentTime || 0) / previousMotion.duration))
      : 1;
    const startAngle = previousMotion.startAngle + (previousMotion.targetAngle - previousMotion.startAngle) * progress;
    const startVisibility = previousMotion.startVisibility
      + (previousMotion.targetVisibility - previousMotion.startVisibility) * progress;
    const targetAngle = advanceOrbitTarget(targetAngleRef.current, rawAngle);
    const duration = Math.min(3000, Math.max(900, Math.abs(targetAngle - startAngle) / 0.9 * 1000));
    const steps = Math.max(18, Math.ceil(duration / 55));
    const keyframes = Array.from({ length: steps + 1 }, (_, index) => {
      const progressAtFrame = index / steps;
      const angle = startAngle + (targetAngle - startAngle) * progressAtFrame;
      const visibility = startVisibility + (rawVisibility - startVisibility) * progressAtFrame;
      const position = orbitPosition(angle, kind);
      return {
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
        opacity: orbitOpacity(angle, visibility, kind),
        offset: progressAtFrame,
      };
    });

    previousAnimation?.cancel();
    const animation = element.animate(keyframes, {
      duration,
      easing: "linear",
      fill: "forwards",
    });
    if (!active) animation.pause();
    lifecyclePausedRef.current = !active;
    animationRef.current = animation;
    targetAngleRef.current = targetAngle;
    targetVisibilityRef.current = rawVisibility;
    motionRef.current = {
      startAngle,
      targetAngle,
      startVisibility,
      targetVisibility: rawVisibility,
      duration,
    };
    previousPhaseRef.current = contract.phase;
    animation.finished.then(() => {
      if (animationRef.current === animation) lifecyclePausedRef.current = false;
    }).catch(() => {});
  }, [active, contract.phase, kind, rawAngle, rawVisibility, reduced]);

  useEffect(() => {
    const animation = animationRef.current;
    if (!animation || reduced) return;
    if (!active) {
      if (animation.playState === "finished" || animation.playState === "idle") {
        lifecyclePausedRef.current = false;
        return;
      }
      if (animation.playState !== "paused") animation.pause();
      lifecyclePausedRef.current = true;
      return;
    }
    if (lifecyclePausedRef.current && animation.playState === "paused") {
      lifecyclePausedRef.current = false;
      animation.play();
    }
  }, [active, reduced]);

  useEffect(() => () => animationRef.current?.cancel(), []);

  return (
    <span
      className={`parallax-static-celestial is-${kind}`}
      data-static-celestial={kind}
      ref={elementRef}
      style={{
        left: `${initialPosition.x * 100}%`,
        top: `${initialPosition.y * 100}%`,
        width: `${size * 100}vh`,
        opacity: orbitOpacity(rawAngle, rawVisibility, kind),
      }}
    >
      <span className="parallax-static-celestial-drift">
        {kind === "sun" ? (
          <span className="parallax-static-sun-glare" />
        ) : (
          <>
            <span className="parallax-static-aureole is-moon" />
            <img className="parallax-static-orb parallax-static-moon" src={contract.profile.assets.moon} alt="" />
          </>
        )}
      </span>
    </span>
  );
}

function StaticParallaxScene({ phase, mobile, active = true, reduced = false, loading = false, includeSky = true }) {
  const contract = getHeroVisualContract(phase, mobile);
  const { profile } = contract;

  return (
    <div
      className={`parallax-static-scene${loading ? " is-loading" : ""}`}
      data-phase={contract.phase}
      data-profile={mobile ? "mobile" : "desktop"}
      data-renderer="static"
      data-testid="parallax-static-scene"
      style={getStaticSceneStyle(contract.phase, mobile)}
      aria-hidden="true"
    >
      {includeSky && <SkyBackdrop phase={contract.phase} mobile={mobile} />}
      {!loading && (
        <>
          <StaticCelestial active={active} contract={contract} kind="sun" reduced={reduced} />
          <StaticCelestial active={active} contract={contract} kind="moon" reduced={reduced} />
          {profile.clouds.map((cloud, index) => {
            const anchorX = cloud.x + (contract.phase === "night" ? cloud.nightShiftX || 0 : 0);
            const anchorY = cloud.y + (contract.phase === "night" ? cloud.nightShiftY || 0 : 0);
            return (
              <img
                className="parallax-static-cloud"
                src={profile.assets.cloud}
                alt=""
                key={`${cloud.x}-${cloud.y}`}
                style={{
                  left: `${anchorX * 100}%`,
                  top: `${anchorY * 100}%`,
                  width: `${cloud.width * 100}vw`,
                  opacity: cloud.opacity * (contract.phase === "night" ? 0.22 : 1),
                  transform: `translate(-50%, -50%) scaleX(${cloud.flip ? -1 : 1})`,
                  "--cloud-drift-from": `${cloud.drift * -100}vw`,
                  "--cloud-drift-to": `${cloud.drift * 100}vw`,
                  "--cloud-drift-duration": `${38 + index * 11}s`,
                  "--cloud-drift-delay": `${-7 - index * 9}s`,
                }}
              />
            );
          })}
          {profile.layers.map((layer) => (
            <img
              className={`parallax-static-landscape parallax-static-${layer.key}`}
              src={profile.assets[layer.key]}
              alt=""
              key={layer.key}
              style={{
                bottom: "auto",
                top: `${layer.centerY * 100}%`,
                width: `${layer.width * 100}vw`,
                opacity: layer.opacity,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
          <div className="parallax-static-wash" />
        </>
      )}
    </div>
  );
}

function AmbientLife({ phase, mobile }) {
  return (
    <div className="hero-ambient-life" data-phase={phase} aria-hidden="true">
      <div className="hero-ambient-grass">
        {AMBIENT_GRASS_BLADES.map((blade, index) => (
          <span
            className="hero-ambient-grass-blade"
            key={index}
            style={{
              left: `${blade.left}%`,
              height: `${blade.height * (mobile ? 0.76 : 1)}px`,
              "--grass-delay": `${blade.delay}s`,
              "--grass-duration": `${blade.duration}s`,
              "--grass-lean": `${blade.lean}deg`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ParallaxScene({ phase = "morning", night = false, paused = false }) {
  const shellRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [clientState, setClientState] = useState(null);
  const [rendererMode, setRendererMode] = useState("checking");
  const rendererModeRef = useRef("checking");
  const [WebGLScene, setWebGLScene] = useState(null);
  const webglSessionRef = useRef(0);
  const [webglSession, setWebglSession] = useState(0);
  const [readySession, setReadySession] = useState(null);
  const [heroVisible, setHeroVisible] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);
  const themeName = phase || (night ? "night" : "morning");
  const mobile = clientState?.mobile || false;
  const sceneActive = heroVisible && documentVisible && !paused;
  const renderActive = rendererMode === "webgl" && sceneActive;
  const pauseReason = !heroVisible ? "offscreen" : !documentVisible ? "hidden" : paused ? "overlay" : "none";

  const showStaticScene = useCallback(() => {
    rendererModeRef.current = "static";
    setReadySession(null);
    setRendererMode("static");
  }, []);
  const showWebGLScene = useCallback(() => {
    if (rendererModeRef.current !== "webgl") {
      rendererModeRef.current = "webgl";
      webglSessionRef.current += 1;
      setWebglSession(webglSessionRef.current);
      setReadySession(null);
    }
    setRendererMode("webgl");
  }, []);
  const handleWebGLReady = useCallback((session) => {
    if (rendererModeRef.current === "webgl" && webglSessionRef.current === session) {
      setReadySession(session);
    }
  }, []);

  useEffect(() => {
    const compactMedia = window.matchMedia("(max-width: 639px)");
    const reducedMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false;

    const sync = () => {
      const diagnostics = process.env.NODE_ENV !== "production"
        ? new URLSearchParams(window.location.search)
        : null;
      const diagnostic = diagnostics?.get("hero-renderer") || "auto";
      const next = {
        mobile: compactMedia.matches,
        reduced: reducedMedia.matches,
        diagnostic,
        frameProbe: diagnostics?.get("hero-probe") === "frames",
      };
      startTransition(() => setClientState(next));

      if (diagnostic === "static" || next.reduced) {
        showStaticScene();
        return;
      }
      if (!supportsWebGL2()) {
        showStaticScene();
        return;
      }

      showWebGLScene();
      if (!WebGLScene) {
        import("@/components/hero/ParallaxWebGLScene").then((module) => {
          if (!cancelled) setWebGLScene(() => module.default);
        }).catch(showStaticScene);
      }
    };

    sync();
    compactMedia.addEventListener("change", sync);
    reducedMedia.addEventListener("change", sync);
    return () => {
      cancelled = true;
      compactMedia.removeEventListener("change", sync);
      reducedMedia.removeEventListener("change", sync);
    };
  }, [WebGLScene, showStaticScene, showWebGLScene]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.04 }
    );
    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncVisibility = () => setDocumentVisible(document.visibilityState === "visible");
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  useEffect(() => {
    if (rendererMode !== "webgl") return undefined;

    const onScroll = () => {
      if (!mobile) return;
      const viewportHeight = window.innerHeight || 1;
      const progress = Math.min(1, window.scrollY / viewportHeight);
      pointer.current = { x: 0, y: progress * 0.72 - 0.08 };
    };
    const onMove = (event) => {
      if (mobile) return;
      pointer.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, [mobile, rendererMode]);

  if (!clientState || rendererMode === "checking") {
    return (
      <div ref={shellRef} className="parallax-scene-shell" data-renderer="checking">
        <StaticParallaxScene phase={themeName} mobile={false} loading />
      </div>
    );
  }

  if (rendererMode === "static") {
    return (
      <div
        ref={shellRef}
        className="parallax-scene-shell"
        data-renderer="static"
        data-render-active={sceneActive ? "true" : "false"}
      >
        <StaticParallaxScene phase={themeName} mobile={mobile} active={sceneActive} reduced={clientState.reduced} />
        <AmbientLife phase={themeName} mobile={mobile} />
      </div>
    );
  }

  if (!WebGLScene) {
    return (
      <div
        ref={shellRef}
        className="parallax-scene-shell"
        data-renderer="checking"
        data-render-active={sceneActive ? "true" : "false"}
        data-pause-reason={pauseReason}
      >
        <StaticParallaxScene phase={themeName} mobile={mobile} active={sceneActive} />
        <AmbientLife phase={themeName} mobile={mobile} />
      </div>
    );
  }

  const contract = getHeroVisualContract(themeName, mobile);
  const webglReady = readySession === webglSession;

  return (
    <div
      ref={shellRef}
      className="parallax-scene-shell parallax-webgl-scene"
      data-phase={contract.phase}
      data-renderer="webgl"
      data-render-active={renderActive ? "true" : "false"}
      data-pause-reason={pauseReason}
      style={getStaticSceneStyle(contract.phase, mobile)}
    >
      <SkyBackdrop phase={contract.phase} mobile={mobile} />
      {!webglReady && (
        <StaticParallaxScene
          phase={contract.phase}
          mobile={mobile}
          active={sceneActive}
          includeSky={false}
        />
      )}
      <WebGLScene
        phase={contract.phase}
        pointer={pointer}
        mobile={mobile}
        active={renderActive}
        session={webglSession}
        onSceneReady={handleWebGLReady}
        diagnosticProbe={clientState.frameProbe}
        onContextLost={showStaticScene}
        simulateContextLoss={clientState.diagnostic === "context-loss"}
      />
      <AmbientLife phase={contract.phase} mobile={mobile} />
    </div>
  );
}
