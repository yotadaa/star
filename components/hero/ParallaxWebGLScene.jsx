"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { phaseDuration, phaseEase } from "../site/phaseTransition.mjs";
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
    const highMotionUntil = phaseChanged ? nextFrameAt + phaseDuration() + 100 : nextFrameAt;
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

function appearanceTarget(contract) {
  const { phase, theme, profile } = contract;
  const night = phase === "night";
  const values = {
    sun: theme.sunAngle, moon: theme.moonAngle,
    sunVisibility: theme.sunVisibility, moonVisibility: theme.moonVisibility,
    nightWeight: night ? 1 : 0,
    haze: new THREE.Color(theme.haze),
    sunCore: new THREE.Color(phase === "sunset" ? "#ffd195" : "#fff1b0"),
    sunWash: new THREE.Color(theme.sunWash),
    wash: new THREE.Color(theme.wash), washOpacity: night ? .42 : phase === "sunset" ? .16 : .08,
  };
  profile.layers.forEach((layer) => {
    values[`${layer.key}Color`] = new THREE.Color(layer.key === "mountains" ? (night ? "#506277" : "#d8e5df") : theme.landscape);
    values[`${layer.key}Opacity`] = night ? layer.key === "mountains" ? .72 : layer.key === "hills" ? .48 : .54 : layer.opacity;
  });
  return values;
}

function copyAppearance(values) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.isColor ? value.clone() : value]));
}

function usePhaseAppearance(contract, active, diagnosticProbe) {
  const renderer = useThree((state) => state.gl);
  const target = useMemo(() => appearanceTarget(contract), [contract.phase, contract.profile]);
  const live = useRef(copyAppearance(target));
  const transition = useRef(null);
  const previous = useRef(contract.phase);
  useEffect(() => {
    const duration = previous.current !== contract.phase ? phaseDuration(active) : 0;
    previous.current = contract.phase;
    if (!duration) {
      live.current = copyAppearance(target);
      transition.current = null;
      return;
    }
    const destination = copyAppearance(target);
    destination.sun = advanceOrbitTarget(live.current.sun, destination.sun);
    destination.moon = advanceOrbitTarget(live.current.moon, destination.moon);
    transition.current = { from: copyAppearance(live.current), target: destination, start: performance.now(), duration };
  }, [target, contract.phase, active]);
  // Earlier priority makes this the single phase writer before material consumers.
  useFrame(() => {
    const current = transition.current;
    if (current) {
      const progress = Math.min(1, (performance.now() - current.start) / current.duration);
      const amount = phaseEase(progress);
      for (const [key, value] of Object.entries(current.target)) {
        if (value.isColor) live.current[key].lerpColors(current.from[key], value, amount);
        else live.current[key] = THREE.MathUtils.lerp(current.from[key], value, amount);
      }
      if (progress === 1) transition.current = null;
    }
    if (diagnosticProbe) renderer.domElement.dataset.phaseInterpolating = String(Boolean(transition.current));
  }, -1);
  return live;
}

function SunGlare({ texture, live, radiusX, radiusY, size }) {
  const groupRef = useRef(null);
  const coreRef = useRef(null);
  const washRef = useRef(null);

  useFrame(() => {
    const angle = live.current.sun;
    const above = Math.max(0, Math.sin(angle));
    const opacity = above * live.current.sunVisibility;
    if (groupRef.current) groupRef.current.position.set(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, -15);
    if (coreRef.current) { coreRef.current.opacity = Math.min(1, opacity * 1.18); coreRef.current.color.copy(live.current.sunCore); }
    if (washRef.current) { washRef.current.opacity = opacity * 0.44; washRef.current.color.copy(live.current.sunWash); }
  });

  return (
    <group ref={groupRef}>
      <mesh scale={[2.72, 2.72, 1]} position={[0, 0, -0.03]}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial ref={washRef} map={texture} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial ref={coreRef} map={texture} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

function MoonBody({ texture, live, radiusX, radiusY, size }) {
  const groupRef = useRef(null);
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
    if (bodyRef.current) bodyRef.current.opacity = opacity;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <planeGeometry args={[size, size / aspect]} />
        <meshBasicMaterial ref={bodyRef} map={texture} color={HERO_MOON_TINT} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function SunMoonRig({ contract, pointer, diagnosticProbe, live }) {
  const renderer = useThree((state) => state.gl);
  const moonTexture = useLoader(THREE.TextureLoader, contract.profile.assets.moon);
  const sunTexture = useMemo(() => makeSunGlowTexture(), []);
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
      <SunGlare texture={sunTexture} live={live} radiusX={radiusX} radiusY={radiusY} size={viewport.height * contract.profile.celestial.sunSize} />
      <MoonBody texture={moonTexture} live={live} radiusX={radiusX * 0.94} radiusY={radiusY * 0.95} size={viewport.height * contract.profile.celestial.moonSize} />
    </group>
  );
}

function Clouds({ contract, pointer, diagnosticProbe, live }) {
  const { profile } = contract;
  const renderer = useThree((state) => state.gl);
  const texture = useLoader(THREE.TextureLoader, profile.assets.cloud);
  const refs = useRef([]);
  const materialRefs = useRef([]);
  const elapsedRef = useRef(0);
  const z = -13;
  const viewport = useViewportAt(z);

  useMemo(() => srgb(texture), [texture]);
  useFrame((_, delta) => {
    const boundedDelta = Math.min(delta, 1 / 30);
    elapsedRef.current += boundedDelta;
    profile.clouds.forEach((cloud, index) => {
      const mesh = refs.current[index];
      if (mesh) {
        mesh.position.x = (Math.sin(elapsedRef.current * 0.18 + index * 2.1) * cloud.drift + live.current.nightWeight * (cloud.nightShiftX || 0)) * viewport.width;
        mesh.position.y = -live.current.nightWeight * (cloud.nightShiftY || 0) * viewport.height;
      }
      const material = materialRefs.current[index];
      if (material) {
        material.opacity = cloud.opacity * (1 - live.current.nightWeight * .78);
        material.color.copy(live.current.haze);
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
    const anchorX = cloud.x;
    const anchorY = cloud.y;
    const baseX = (anchorX - 0.5) * viewport.width;
    const baseY = (0.5 - anchorY) * viewport.height;
    return (
      <ParallaxGroup key={`${cloud.x}-${cloud.y}`} pointer={pointer} depth={cloud.depth} z={z + index * 0.04} baseX={baseX} baseY={baseY}>
        <mesh ref={(node) => { refs.current[index] = node; }} scale={[cloud.flip ? -1 : 1, 1, 1]}>
          <planeGeometry args={[width, width / aspect]} />
          <meshBasicMaterial
            ref={(node) => { materialRefs.current[index] = node; }}
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

function Landscape({ contract, pointer, layer, mobile, live, diagnosticProbe }) {
  const { profile } = contract;
  const texture = useLoader(THREE.TextureLoader, profile.assets[layer.key]);
  const viewport = useViewportAt(layer.z);
  const aspect = texture.image.width / texture.image.height;
  const width = viewport.width * layer.width;
  const baseY = (0.5 - layer.centerY) * viewport.height;
  const material = useRef(null);
  const renderer = useThree((state) => state.gl);
  useFrame(() => {
    if (!material.current) return;
    material.current.color.copy(live.current[`${layer.key}Color`]);
    material.current.opacity = live.current[`${layer.key}Opacity`];
    if (diagnosticProbe) renderer.domElement.dataset[`${layer.key}Color`] = `#${material.current.color.getHexString()}`;
  });

  useMemo(() => srgb(texture), [texture]);
  return (
    <ParallaxGroup pointer={pointer} depth={layer.depth} z={layer.z} baseY={baseY} verticalScale={mobile ? 0.52 : 1}>
      <mesh>
        <planeGeometry args={[width, width / aspect]} />
        <meshBasicMaterial ref={material} map={texture} transparent alphaTest={0.025} depthWrite={false} toneMapped={false} />
      </mesh>
    </ParallaxGroup>
  );
}

function ColorWash({ live, diagnosticProbe }) {
  const z = -0.1;
  const viewport = useViewportAt(z);
  const material = useRef(null);
  const renderer = useThree((state) => state.gl);
  useFrame(() => {
    if (!material.current) return;
    material.current.color.copy(live.current.wash);
    material.current.opacity = live.current.washOpacity;
    if (diagnosticProbe) renderer.domElement.dataset.washOpacity = String(material.current.opacity);
  });
  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[viewport.width * 1.2, viewport.height * 1.2]} />
      <meshBasicMaterial ref={material} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function SceneContent({ phase, pointer, mobile, diagnosticProbe, active }) {
  const contract = getHeroVisualContract(phase, mobile);
  const live = usePhaseAppearance(contract, active, diagnosticProbe);
  return (
    <>
      <SunMoonRig live={live} contract={contract} pointer={pointer} diagnosticProbe={diagnosticProbe} />
      <Clouds live={live} contract={contract} pointer={pointer} diagnosticProbe={diagnosticProbe} />
      {contract.profile.layers.map((layer) => <Landscape live={live} diagnosticProbe={diagnosticProbe} key={layer.key} contract={contract} pointer={pointer} layer={layer} mobile={mobile} />)}
      <ColorWash live={live} diagnosticProbe={diagnosticProbe} />
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
          <SceneContent active={active} phase={phase} pointer={pointer} mobile={displayMobile} diagnosticProbe={diagnosticProbe} />
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
