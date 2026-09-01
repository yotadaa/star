"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { HERO_MOON_TINT, advanceOrbitTarget, getHeroVisualContract } from "./visualContract";

const PARALLAX_X = 3.2;
const PARALLAX_Y = 2.1;

function srgb(texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function useViewportAt(z) {
  const camera = useThree((state) => state.camera);
  const viewport = useThree((state) => state.viewport);
  return viewport.getCurrentViewport(camera, [0, 0, z]);
}

function makeSunGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(255,255,245,1)");
  gradient.addColorStop(0.08, "rgba(255,250,190,0.98)");
  gradient.addColorStop(0.24, "rgba(255,230,110,0.52)");
  gradient.addColorStop(0.52, "rgba(255,190,70,0.18)");
  gradient.addColorStop(1, "rgba(255,170,70,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  return srgb(new THREE.CanvasTexture(canvas));
}

function BoundedInvalidationScheduler({ active, motionKey }) {
  const invalidate = useThree((state) => state.invalidate);
  const lastRenderedMotionKey = useRef(motionKey);

  useEffect(() => {
    if (!active) return undefined;

    let timer = null;
    let nextFrameAt = performance.now();
    const phaseChanged = lastRenderedMotionKey.current !== motionKey;
    lastRenderedMotionKey.current = motionKey;
    const highMotionUntil = phaseChanged ? nextFrameAt + 2600 : nextFrameAt;
    const tick = () => {
      invalidate();
      const now = performance.now();
      const frameInterval = 1000 / (now < highMotionUntil ? 60 : 30);
      nextFrameAt = Math.max(nextFrameAt + frameInterval, now + frameInterval);
      timer = window.setTimeout(tick, Math.max(0, nextFrameAt - performance.now()));
    };

    tick();
    return () => window.clearTimeout(timer);
  }, [active, invalidate, motionKey]);

  return null;
}

function InvalidateOnChange({ phase, mobile }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [invalidate, mobile, phase]);

  return null;
}

function DevelopmentFrameProbe() {
  const renderer = useThree((state) => state.gl);
  const countRef = useRef(0);

  useFrame(() => {
    countRef.current += 1;
    renderer.domElement.dataset.heroFrameCount = String(countRef.current);
  });

  return null;
}

function FirstFrameReady({ session, onReady }) {
  const announcedRef = useRef(false);

  useFrame(() => {
    if (announcedRef.current) return;
    announcedRef.current = true;
    queueMicrotask(() => onReady(session));
  });

  return null;
}

function ParallaxGroup({ pointer, depth, z, baseX = 0, baseY = 0, verticalScale = 1, children }) {
  const ref = useRef(null);
  const smooth = useRef({ x: 0, y: 0 });
  const smoothBase = useRef({ x: baseX, y: baseY });

  useFrame((_, delta) => {
    if (!ref.current) return;
    const boundedDelta = Math.min(delta, 0.05);
    const easing = 1 - Math.pow(0.001, boundedDelta);
    const baseEasing = 1 - Math.exp(-boundedDelta / 0.7);
    smooth.current.x = THREE.MathUtils.lerp(smooth.current.x, pointer.current.x, easing * 0.58);
    smooth.current.y = THREE.MathUtils.lerp(smooth.current.y, pointer.current.y, easing * 0.58);
    smoothBase.current.x = THREE.MathUtils.lerp(smoothBase.current.x, baseX, baseEasing);
    smoothBase.current.y = THREE.MathUtils.lerp(smoothBase.current.y, baseY, baseEasing);
    ref.current.position.set(
      smoothBase.current.x + smooth.current.x * depth * PARALLAX_X,
      smoothBase.current.y - smooth.current.y * depth * PARALLAX_Y * verticalScale,
      z
    );
  });

  return <group ref={ref}>{children}</group>;
}

function useSmoothTheme(themeName) {
  const current = getHeroVisualContract(themeName).theme;
  const target = useRef({
    sun: current.sunAngle,
    moon: current.moonAngle,
    sunVisibility: current.sunVisibility,
    moonVisibility: current.moonVisibility,
  });
  const live = useRef({ ...target.current });
  const previousTheme = useRef(themeName);

  useEffect(() => {
    if (previousTheme.current === themeName) return;
    const next = getHeroVisualContract(themeName).theme;
    target.current = {
      sun: advanceOrbitTarget(target.current.sun, next.sunAngle),
      moon: advanceOrbitTarget(target.current.moon, next.moonAngle),
      sunVisibility: next.sunVisibility,
      moonVisibility: next.moonVisibility,
    };
    previousTheme.current = themeName;
  }, [themeName]);

  useFrame((_, delta) => {
    const boundedDelta = Math.min(delta, 1 / 30);
    const orbitEasing = 1 - Math.exp(-boundedDelta / 0.7);
    const visibilityEasing = 1 - Math.exp(-boundedDelta / 0.76);
    live.current.sun = THREE.MathUtils.lerp(live.current.sun, target.current.sun, orbitEasing);
    live.current.moon = THREE.MathUtils.lerp(live.current.moon, target.current.moon, orbitEasing);
    live.current.sunVisibility = THREE.MathUtils.lerp(live.current.sunVisibility, target.current.sunVisibility, visibilityEasing);
    live.current.moonVisibility = THREE.MathUtils.lerp(live.current.moonVisibility, target.current.moonVisibility, visibilityEasing);
  });

  return live;
}

function SunGlare({ texture, live, radiusX, radiusY, size, themeName, washTint }) {
  const groupRef = useRef(null);
  const coreRef = useRef(null);
  const washRef = useRef(null);

  useFrame(() => {
    const angle = live.current.sun;
    const above = Math.max(0, Math.sin(angle));
    const opacity = above * live.current.sunVisibility;
    if (groupRef.current) groupRef.current.position.set(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, -15);
    if (coreRef.current) coreRef.current.opacity = Math.min(1, opacity * 1.18);
    if (washRef.current) washRef.current.opacity = opacity * 0.44;
  });

  return (
    <group ref={groupRef}>
      <mesh scale={[2.72, 2.72, 1]} position={[0, 0, -0.03]}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial ref={washRef} map={texture} color={washTint} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial ref={coreRef} map={texture} color={themeName === "sunset" ? "#ffd195" : "#fff1b0"} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

function MoonBody({ texture, live, radiusX, radiusY, size }) {
  const groupRef = useRef(null);
  const glowRef = useRef(null);
  const bodyRef = useRef(null);
  const aspect = texture.image.width / texture.image.height;

  useFrame(() => {
    const angle = live.current.moon;
    const above = Math.max(0, Math.sin(angle));
    const opacity = above * live.current.moonVisibility;
    if (groupRef.current) {
      groupRef.current.position.set(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, -15);
      groupRef.current.rotation.z = -angle * 0.07;
    }
    if (glowRef.current) glowRef.current.opacity = opacity * 0.28;
    if (bodyRef.current) bodyRef.current.opacity = opacity;
  });

  return (
    <group ref={groupRef}>
      <mesh scale={[1.6, 1.6, 1]} position={[0, 0, -0.02]}>
        <planeGeometry args={[size, size / aspect]} />
        <meshBasicMaterial ref={glowRef} map={texture} color={HERO_MOON_TINT} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[size, size / aspect]} />
        <meshBasicMaterial ref={bodyRef} map={texture} color={HERO_MOON_TINT} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function SunMoonRig({ contract, pointer, diagnosticProbe }) {
  const renderer = useThree((state) => state.gl);
  const moonTexture = useLoader(THREE.TextureLoader, contract.profile.assets.moon);
  const sunTexture = useMemo(() => makeSunGlowTexture(), []);
  const live = useSmoothTheme(contract.phase);
  const ref = useRef(null);
  const elapsedRef = useRef(0);
  const z = -15;
  const viewport = useViewportAt(z);

  useMemo(() => srgb(moonTexture), [moonTexture]);
  useEffect(() => () => sunTexture.dispose(), [sunTexture]);
  useFrame((_, delta) => {
    elapsedRef.current += Math.min(delta, 0.05);
    if (!ref.current) return;
    ref.current.position.x = pointer.current.x * 0.16;
    ref.current.position.y = -pointer.current.y * 0.12;
    ref.current.rotation.z = Math.sin(elapsedRef.current * 0.08) * 0.012;
    if (diagnosticProbe) {
      renderer.domElement.dataset.sunX = String(0.5 + Math.cos(live.current.sun) * 0.3);
      renderer.domElement.dataset.moonX = String(0.5 + Math.cos(live.current.moon) * 0.282);
      renderer.domElement.dataset.sunAngle = String(live.current.sun);
      renderer.domElement.dataset.moonAngle = String(live.current.moon);
      renderer.domElement.dataset.sunOpacity = String(Math.max(0, Math.sin(live.current.sun)) * live.current.sunVisibility);
      renderer.domElement.dataset.moonOpacity = String(Math.max(0, Math.sin(live.current.moon)) * live.current.moonVisibility);
    }
  });

  const radiusX = viewport.width * 0.3;
  const radiusY = viewport.height * 0.39;

  return (
    <group ref={ref}>
      <SunGlare texture={sunTexture} live={live} radiusX={radiusX} radiusY={radiusY} size={viewport.height * contract.profile.celestial.sunSize} themeName={contract.phase} washTint={contract.theme.sunWash} />
      <MoonBody texture={moonTexture} live={live} radiusX={radiusX * 0.94} radiusY={radiusY * 0.95} size={viewport.height * contract.profile.celestial.moonSize} />
    </group>
  );
}

function Clouds({ contract, pointer, diagnosticProbe }) {
  const { phase, theme, profile } = contract;
  const renderer = useThree((state) => state.gl);
  const texture = useLoader(THREE.TextureLoader, profile.assets.cloud);
  const refs = useRef([]);
  const materialRefs = useRef([]);
  const elapsedRef = useRef(0);
  const targetColor = useMemo(() => new THREE.Color(theme.haze), [theme.haze]);
  const z = -13;
  const viewport = useViewportAt(z);

  useMemo(() => srgb(texture), [texture]);
  useFrame((_, delta) => {
    const boundedDelta = Math.min(delta, 1 / 30);
    const appearanceEasing = 1 - Math.exp(-boundedDelta / 0.7);
    elapsedRef.current += boundedDelta;
    profile.clouds.forEach((cloud, index) => {
      const mesh = refs.current[index];
      if (mesh) mesh.position.x = Math.sin(elapsedRef.current * 0.18 + index * 2.1) * viewport.width * cloud.drift;
      const material = materialRefs.current[index];
      if (material) {
        const targetOpacity = cloud.opacity * (phase === "night" ? 0.22 : 1);
        material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, appearanceEasing);
        material.color.lerp(targetColor, appearanceEasing);
        if (diagnosticProbe && index === 0) {
          renderer.domElement.dataset.cloudOpacity = String(material.opacity);
          renderer.domElement.dataset.cloudColor = `#${material.color.getHexString()}`;
        }
      }
    });
  });

  const aspect = texture.image.width / texture.image.height;

  return profile.clouds.map((cloud, index) => {
    const width = viewport.width * cloud.width;
    const anchorX = cloud.x + (phase === "night" ? cloud.nightShiftX || 0 : 0);
    const anchorY = cloud.y + (phase === "night" ? cloud.nightShiftY || 0 : 0);
    const baseX = (anchorX - 0.5) * viewport.width;
    const baseY = (0.5 - anchorY) * viewport.height;
    return (
      <ParallaxGroup key={`${cloud.x}-${cloud.y}`} pointer={pointer} depth={cloud.depth} z={z + index * 0.04} baseX={baseX} baseY={baseY}>
        <mesh ref={(node) => { refs.current[index] = node; }} scale={[cloud.flip ? -1 : 1, 1, 1]}>
          <planeGeometry args={[width, width / aspect]} />
          <meshBasicMaterial
            ref={(node) => {
              materialRefs.current[index] = node;
              if (node && !node.userData.heroCloudInitialized) {
                node.color.set(theme.haze);
                node.opacity = cloud.opacity * (phase === "night" ? 0.22 : 1);
                node.userData.heroCloudInitialized = true;
              }
            }}
            map={texture}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </ParallaxGroup>
    );
  });
}

function Landscape({ contract, pointer, layer, mobile }) {
  const { phase, theme, profile } = contract;
  const texture = useLoader(THREE.TextureLoader, profile.assets[layer.key]);
  const viewport = useViewportAt(layer.z);
  const aspect = texture.image.width / texture.image.height;
  const width = viewport.width * layer.width;
  const baseY = (0.5 - layer.centerY) * viewport.height;
  const night = phase === "night";
  const tint = layer.key === "mountains" ? (night ? "#506277" : "#d8e5df") : theme.landscape;
  const opacity = night ? layer.key === "mountains" ? 0.72 : layer.key === "hills" ? 0.48 : 0.54 : layer.opacity;

  useMemo(() => srgb(texture), [texture]);
  return (
    <ParallaxGroup pointer={pointer} depth={layer.depth} z={layer.z} baseY={baseY} verticalScale={mobile ? 0.52 : 1}>
      <mesh>
        <planeGeometry args={[width, width / aspect]} />
        <meshBasicMaterial map={texture} color={tint} transparent opacity={opacity} alphaTest={0.025} depthWrite={false} toneMapped={false} />
      </mesh>
    </ParallaxGroup>
  );
}

function ColorWash({ contract }) {
  const { phase, theme } = contract;
  const z = -0.1;
  const viewport = useViewportAt(z);
  const opacity = phase === "night" ? 0.42 : phase === "sunset" ? 0.16 : 0.08;
  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[viewport.width * 1.2, viewport.height * 1.2]} />
      <meshBasicMaterial color={theme.wash} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function SceneContent({ phase, pointer, mobile, diagnosticProbe }) {
  const contract = getHeroVisualContract(phase, mobile);
  return (
    <>
      <SunMoonRig contract={contract} pointer={pointer} diagnosticProbe={diagnosticProbe} />
      <Clouds contract={contract} pointer={pointer} diagnosticProbe={diagnosticProbe} />
      {contract.profile.layers.map((layer) => <Landscape key={layer.key} contract={contract} pointer={pointer} layer={layer} mobile={mobile} />)}
      <ColorWash contract={contract} />
    </>
  );
}

function ProfilePreload({ mobile, onReady }) {
  const profile = getHeroVisualContract("morning", mobile).profile;
  const sources = useMemo(() => [...new Set(Object.values(profile.assets))], [profile]);
  const textures = useLoader(THREE.TextureLoader, sources);
  useMemo(() => textures.forEach(srgb), [textures]);
  useEffect(() => onReady(mobile), [mobile, onReady]);
  return null;
}

function WebGLContextGuard({ onContextLost, simulateContextLoss }) {
  const renderer = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = renderer?.domElement;
    if (!canvas) return undefined;
    const handleContextLost = (event) => { event.preventDefault(); onContextLost(); };
    canvas.addEventListener("webglcontextlost", handleContextLost, { once: true });
    const diagnosticTimer = simulateContextLoss ? window.setTimeout(() => renderer.getContext().getExtension("WEBGL_lose_context")?.loseContext(), 120) : null;
    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      if (diagnosticTimer) window.clearTimeout(diagnosticTimer);
    };
  }, [onContextLost, renderer, simulateContextLoss]);
  return null;
}

class WebGLSceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function ParallaxWebGLScene({ phase, pointer, mobile, active, session, onSceneReady, diagnosticProbe = false, onContextLost, simulateContextLoss = false }) {
  const [displayMobile, setDisplayMobile] = useState(mobile);
  const [preloadMobile, setPreloadMobile] = useState(null);
  const requestedMobileRef = useRef(mobile);
  requestedMobileRef.current = mobile;
  const handleProfileReady = useCallback((readyMobile) => {
    if (requestedMobileRef.current === readyMobile) setDisplayMobile(readyMobile);
    setPreloadMobile((current) => (current === readyMobile ? null : current));
  }, []);
  const createRenderer = useCallback((defaultProps) => {
    const { canvas, ...rendererDefaults } = defaultProps;
    const attributes = {
      ...rendererDefaults,
      alpha: true,
      depth: true,
      stencil: false,
      antialias: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: false,
    };

    try {
      const context = canvas.getContext("webgl2", attributes);
      if (!context || context.isContextLost()) throw new Error("WebGL2 context unavailable");
      return new THREE.WebGLRenderer({ canvas, ...attributes, context });
    } catch {
      onContextLost();
      return new Promise(() => {});
    }
  }, [onContextLost]);

  useEffect(() => {
    if (displayMobile !== mobile) setPreloadMobile(mobile);
  }, [displayMobile, mobile]);

  return (
    <WebGLSceneBoundary onError={onContextLost}>
      <Canvas
        frameloop={active ? "demand" : "never"}
        dpr={[1, 1.5]}
        gl={createRenderer}
        camera={{ position: [0, 0, 12], fov: 45, near: 0.1, far: 100 }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}
        data-renderer="webgl"
        data-active={active ? "true" : "false"}
        data-testid="parallax-canvas"
      >
        <WebGLContextGuard onContextLost={onContextLost} simulateContextLoss={simulateContextLoss} />
        <BoundedInvalidationScheduler active={active} motionKey={phase} />
        <InvalidateOnChange phase={phase} mobile={mobile} />
        {diagnosticProbe && <DevelopmentFrameProbe />}
        <Suspense fallback={null}>
          <SceneContent phase={phase} pointer={pointer} mobile={displayMobile} diagnosticProbe={diagnosticProbe} />
          <FirstFrameReady session={session} onReady={onSceneReady} />
        </Suspense>
        {preloadMobile !== null && (
          <Suspense fallback={null}>
            <ProfilePreload key={preloadMobile ? "mobile" : "desktop"} mobile={preloadMobile} onReady={handleProfileReady} />
          </Suspense>
        )}
      </Canvas>
    </WebGLSceneBoundary>
  );
}
