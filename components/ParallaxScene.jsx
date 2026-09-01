"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import HeroInitialScene from "@/components/hero/HeroInitialScene";
import { getHeroVisualContract, getStaticSceneStyle } from "@/components/hero/visualContract";

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

      if (diagnostic === "static" || next.reduced || next.mobile) {
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
        <HeroInitialScene phase={themeName} active={false} />
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
        <HeroInitialScene phase={themeName} active={sceneActive} />
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
        <HeroInitialScene phase={themeName} active={sceneActive} />
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
      data-webgl-ready={webglReady ? "true" : "false"}
      data-pause-reason={pauseReason}
      style={getStaticSceneStyle(contract.phase, mobile)}
    >
      <HeroInitialScene phase={contract.phase} active={sceneActive && !webglReady} />
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
