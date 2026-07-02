"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const ASSETS = {
  mountains: "/assets/parallax/mountains.png",
  hills: "/assets/parallax/forest-hills.png",
  meadow: "/assets/parallax/meadow.png",
  cloud: "/assets/parallax/cloud.png",
  moon: "/assets/parallax/moon.png",
};

const THEMES = {
  morning: {
    sky: ["#243f5e", "#5f9fba", "#f6d79f"],
    haze: "#d8f3ef",
    landscape: "#d8f2d8",
    exposure: 0.92,
    sunAngle: 2.42,
    moonAngle: 5.58,
  },
  noon: {
    sky: ["#1d6fa3", "#77bde0", "#f8e9bd"],
    haze: "#f1fbff",
    landscape: "#f5fff0",
    exposure: 1,
    sunAngle: 1.56,
    moonAngle: 4.78,
  },
  sunset: {
    sky: ["#312b56", "#c16f63", "#f3c06d"],
    haze: "#ffd0a0",
    landscape: "#f0c083",
    exposure: 0.78,
    sunAngle: 0.34,
    moonAngle: 3.76,
  },
  night: {
    sky: ["#010208", "#040a17", "#071526"],
    haze: "#1d2b40",
    landscape: "#2d3747",
    nightWash: "#01030a",
    exposure: 0.26,
    sunAngle: 4.78,
    moonAngle: 1.46,
  },
};

const DEPTH = {
  cloudsFar: 0.05,
  cloudsNear: 0.08,
  mountains: 0.12,
  hills: 0.2,
  meadow: 0.36,
};

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

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function makeSkyTexture(themeName) {
  const theme = THEMES[themeName] || THEMES.morning;
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, theme.sky[0]);
  gradient.addColorStop(0.58, theme.sky[1]);
  gradient.addColorStop(1, theme.sky[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (themeName === "night") {
    const rand = seededRandom(7193);

    ctx.save();
    ctx.translate(width * 0.56, height * 0.5);
    ctx.rotate(-0.52);

    const band = ctx.createLinearGradient(0, -height * 0.28, 0, height * 0.28);
    band.addColorStop(0, "rgba(180,205,255,0)");
    band.addColorStop(0.18, "rgba(120,150,230,0.12)");
    band.addColorStop(0.4, "rgba(215,210,190,0.3)");
    band.addColorStop(0.5, "rgba(252,240,215,0.42)");
    band.addColorStop(0.6, "rgba(170,198,255,0.22)");
    band.addColorStop(0.82, "rgba(115,150,230,0.1)");
    band.addColorStop(1, "rgba(180,205,255,0)");
    ctx.filter = "blur(18px)";
    ctx.fillStyle = band;
    ctx.fillRect(-width, -height * 0.31, width * 2, height * 0.62);

    const dustLane = ctx.createLinearGradient(0, -height * 0.13, 0, height * 0.13);
    dustLane.addColorStop(0, "rgba(1,3,10,0)");
    dustLane.addColorStop(0.43, "rgba(1,3,10,0.2)");
    dustLane.addColorStop(0.52, "rgba(0,1,7,0.34)");
    dustLane.addColorStop(0.68, "rgba(1,3,10,0.14)");
    dustLane.addColorStop(1, "rgba(1,3,10,0)");
    ctx.filter = "blur(14px)";
    ctx.fillStyle = dustLane;
    ctx.fillRect(-width, -height * 0.11, width * 2, height * 0.22);
    ctx.filter = "none";

    for (let i = 0; i < 760; i += 1) {
      const x = (rand() - 0.5) * width * 1.8;
      const y = (rand() - 0.5) * height * 0.44;
      const core = rand() > 0.72;
      const radius = core ? 0.65 + rand() * 1.35 : 0.3 + rand() * 0.78;
      ctx.globalAlpha = core ? 0.12 + rand() * 0.22 : 0.045 + rand() * 0.12;
      ctx.fillStyle = rand() > 0.5 ? "#fff4df" : "#c9dcff";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    for (let i = 0; i < 360; i += 1) {
      const x = rand() * width;
      const y = rand() * height * 0.76;
      const r = rand() > 0.94 ? 1.05 + rand() * 0.75 : 0.32 + rand() * 0.58;
      ctx.globalAlpha = rand() > 0.9 ? 0.68 : 0.2 + rand() * 0.34;
      ctx.fillStyle = rand() > 0.78 ? "#ffe9c4" : "#e5eeff";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  return srgb(new THREE.CanvasTexture(canvas));
}

function makeSunGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(255,255,245,1)");
  gradient.addColorStop(0.08, "rgba(255,250,190,0.98)");
  gradient.addColorStop(0.24, "rgba(255,230,110,0.52)");
  gradient.addColorStop(0.52, "rgba(255,190,70,0.18)");
  gradient.addColorStop(1, "rgba(255,170,70,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return srgb(new THREE.CanvasTexture(canvas));
}

function useSmoothTheme(themeName) {
  const current = THEMES[themeName] || THEMES.morning;
  const target = useRef({
    sun: current.sunAngle,
    moon: current.moonAngle,
    exposure: current.exposure,
  });
  const live = useRef({ ...target.current });

  useEffect(() => {
    const next = THEMES[themeName] || THEMES.morning;
    target.current = {
      sun: next.sunAngle,
      moon: next.moonAngle,
      exposure: next.exposure,
    };
  }, [themeName]);

  useFrame((_, delta) => {
    const k = 1 - Math.pow(0.001, delta);
    live.current.sun = THREE.MathUtils.lerp(live.current.sun, target.current.sun, k * 0.58);
    live.current.moon = THREE.MathUtils.lerp(live.current.moon, target.current.moon, k * 0.58);
    live.current.exposure = THREE.MathUtils.lerp(live.current.exposure, target.current.exposure, k * 0.4);
  });

  return live;
}

function Layer({ pointer, depth, z, baseX = 0, baseY = 0, children }) {
  const ref = useRef(null);
  const smooth = useRef({ x: 0, y: 0 });

  useFrame(() => {
    const group = ref.current;
    if (!group) return;
    smooth.current.x += (pointer.current.x - smooth.current.x) * 0.06;
    smooth.current.y += (pointer.current.y - smooth.current.y) * 0.06;
    group.position.x = baseX + smooth.current.x * depth * PARALLAX_X;
    group.position.y = baseY - smooth.current.y * depth * PARALLAX_Y;
    group.position.z = z;
  });

  return <group ref={ref}>{children}</group>;
}

function Sky({ themeName }) {
  const z = -24;
  const vp = useViewportAt(z);
  const texture = useMemo(() => makeSkyTexture(themeName), [themeName]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[vp.width * 1.25, vp.height * 1.25]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function ImagePlane({
  texture,
  width,
  opacity = 1,
  tint = "#ffffff",
  transparent = true,
  y = 0,
  alphaTest = 0.02,
}) {
  const aspect = texture.image.width / texture.image.height;
  return (
    <mesh position={[0, y, 0]}>
      <planeGeometry args={[width, width / aspect]} />
      <meshBasicMaterial
        map={texture}
        color={tint}
        transparent={transparent}
        opacity={opacity}
        alphaTest={alphaTest}
        depthWrite={!transparent}
        toneMapped={false}
      />
    </mesh>
  );
}

function CloudLayer({ pointer, themeName }) {
  const texture = useLoader(THREE.TextureLoader, ASSETS.cloud);
  const z = -13;
  const vp = useViewportAt(z);
  const theme = THEMES[themeName] || THEMES.morning;
  const farRef = useRef(null);
  const nearRef = useRef(null);

  useMemo(() => srgb(texture), [texture]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (farRef.current) farRef.current.position.x = Math.sin(t * 0.045) * 0.22;
    if (nearRef.current) nearRef.current.position.x = Math.sin(t * 0.06 + 2.2) * 0.35;
  });

  const opacity = themeName === "night" ? 0.2 : 0.86;

  return (
    <>
      <Layer pointer={pointer} depth={DEPTH.cloudsFar} z={z} baseY={vp.height * 0.28}>
        <group ref={farRef}>
          <mesh position={[-vp.width * 0.32, 0.02, 0]}>
            <planeGeometry args={[vp.width * 0.24, vp.width * 0.24 / (texture.image.width / texture.image.height)]} />
            <meshBasicMaterial map={texture} color={theme.haze} transparent opacity={opacity * 0.7} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh position={[vp.width * 0.28, 0.18, 0]}>
            <planeGeometry args={[vp.width * 0.18, vp.width * 0.18 / (texture.image.width / texture.image.height)]} />
            <meshBasicMaterial map={texture} color={theme.haze} transparent opacity={opacity * 0.62} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      </Layer>
      <Layer pointer={pointer} depth={DEPTH.cloudsNear} z={z + 2} baseY={vp.height * 0.13}>
        <group ref={nearRef}>
          <mesh position={[vp.width * 0.46, 0, 0]}>
            <planeGeometry args={[vp.width * 0.28, vp.width * 0.28 / (texture.image.width / texture.image.height)]} />
            <meshBasicMaterial map={texture} color={theme.haze} transparent opacity={opacity * 0.78} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      </Layer>
    </>
  );
}

function SunGlare({
  texture,
  live,
  radiusX,
  radiusY,
  size,
  baseOpacity,
  aboveOpacity,
  tint,
}) {
  const groupRef = useRef(null);
  const coreRef = useRef(null);
  const washRef = useRef(null);

  useFrame(() => {
    const angle = live.current.sun;
    const above = Math.max(0, Math.sin(angle));
    const opacity = baseOpacity + above * aboveOpacity;

    if (groupRef.current) {
      groupRef.current.position.set(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, -15);
    }
    if (coreRef.current) coreRef.current.opacity = opacity;
    if (washRef.current) washRef.current.opacity = opacity * 0.28;
  });

  return (
    <group ref={groupRef}>
      <mesh scale={[2.65, 2.65, 1]} position={[0, 0, -0.03]}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial ref={washRef} map={texture} color={tint} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial ref={coreRef} map={texture} color={tint} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

function MoonBody({ texture, live, radiusX, radiusY, size, baseOpacity, aboveOpacity, tint }) {
  const groupRef = useRef(null);
  const glowRef = useRef(null);
  const bodyRef = useRef(null);
  const aspect = texture.image.width / texture.image.height;

  useFrame(() => {
    const angle = live.current.moon;
    const above = Math.max(0, Math.sin(angle));
    const opacity = baseOpacity + above * aboveOpacity;

    if (groupRef.current) {
      groupRef.current.position.set(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, -15);
      groupRef.current.rotation.z = -angle * 0.07;
    }
    if (glowRef.current) glowRef.current.opacity = opacity * 0.2;
    if (bodyRef.current) bodyRef.current.opacity = opacity;
  });

  return (
    <group ref={groupRef}>
      <mesh scale={[1.55, 1.55, 1]} position={[0, 0, -0.02]}>
        <planeGeometry args={[size, size / aspect]} />
        <meshBasicMaterial ref={glowRef} map={texture} color={tint} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[size, size / aspect]} />
        <meshBasicMaterial ref={bodyRef} map={texture} color={tint} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function SunMoonRig({ themeName, pointer }) {
  const moonTexture = useLoader(THREE.TextureLoader, ASSETS.moon);
  const sunGlowTexture = useMemo(() => makeSunGlowTexture(), []);
  const z = -15;
  const vp = useViewportAt(z);
  const live = useSmoothTheme(themeName);
  const ref = useRef(null);
  const theme = THEMES[themeName] || THEMES.morning;

  useMemo(() => {
    srgb(moonTexture);
  }, [moonTexture]);

  useEffect(() => () => sunGlowTexture.dispose(), [sunGlowTexture]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.x = pointer.current.x * 0.16;
    ref.current.position.y = -pointer.current.y * 0.12;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.08) * 0.012;
  });

  const radiusX = vp.width * 0.3;
  const radiusY = vp.height * 0.39;

  return (
    <group ref={ref}>
      <SunGlare
        texture={sunGlowTexture}
        live={live}
        radiusX={radiusX}
        radiusY={radiusY}
        size={vp.height * 0.52}
        baseOpacity={0.02}
        aboveOpacity={themeName === "night" ? 0.1 : 0.92}
        tint={themeName === "sunset" ? "#ffd195" : "#fff1b0"}
      />
      <MoonBody
        texture={moonTexture}
        live={live}
        radiusX={radiusX * 0.94}
        radiusY={radiusY * 0.95}
        size={vp.height * 0.14}
        baseOpacity={0.05}
        aboveOpacity={themeName === "night" ? 0.98 : 0.32}
        tint={themeName === "night" ? "#d9ecff" : "#f0f5ff"}
      />
    </group>
  );
}

function LandscapeLayer({ asset, pointer, depth, z, widthFactor, baseYFactor, opacity, tint }) {
  const texture = useLoader(THREE.TextureLoader, asset);
  const vp = useViewportAt(z);
  useMemo(() => srgb(texture), [texture]);

  const width = vp.width * widthFactor;
  const y = -vp.height * 0.5 + vp.height * baseYFactor;

  return (
    <Layer pointer={pointer} depth={depth} z={z} baseY={y}>
      <ImagePlane texture={texture} width={width} opacity={opacity} tint={tint} alphaTest={0.025} />
    </Layer>
  );
}

function ColorWash({ themeName }) {
  const theme = THEMES[themeName] || THEMES.morning;
  const z = -0.1;
  const vp = useViewportAt(z);
  const opacity = themeName === "night" ? 0.42 : themeName === "sunset" ? 0.16 : 0.08;
  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[vp.width * 1.2, vp.height * 1.2]} />
      <meshBasicMaterial color={theme.nightWash || theme.haze} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function SceneContent({ themeName, pointer }) {
  const theme = THEMES[themeName] || THEMES.morning;
  return (
    <>
      <Sky themeName={themeName} />
      <SunMoonRig themeName={themeName} pointer={pointer} />
      <CloudLayer pointer={pointer} themeName={themeName} />
      <LandscapeLayer asset={ASSETS.mountains} pointer={pointer} depth={DEPTH.mountains} z={-8} widthFactor={2.02} baseYFactor={0.3} opacity={themeName === "night" ? 0.72 : 0.94} tint={themeName === "night" ? "#506277" : "#d8e5df"} />
      <LandscapeLayer asset={ASSETS.hills} pointer={pointer} depth={DEPTH.hills} z={-4.2} widthFactor={1.48} baseYFactor={0.13} opacity={themeName === "night" ? 0.48 : 0.92} tint={theme.landscape} />
      <LandscapeLayer asset={ASSETS.meadow} pointer={pointer} depth={DEPTH.meadow} z={-1.2} widthFactor={1.34} baseYFactor={0.058} opacity={themeName === "night" ? 0.54 : 1} tint={theme.landscape} />
      <ColorWash themeName={themeName} />
    </>
  );
}

export default function ParallaxScene({ phase = "morning", night = false }) {
  const pointer = useRef({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);
  const themeName = phase || (night ? "night" : "morning");

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const apply = () => setMobile(media.matches);
    apply();
    setReady(true);
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!mobile) return;
      const h = window.innerHeight || 1;
      const y = Math.min(1, window.scrollY / h);
      pointer.current = { x: 0, y: y * 2 - 0.2 };
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
  }, [mobile]);

  if (!ready) return null;

  return (
    <Canvas
      frameloop="always"
      dpr={mobile ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 12], fov: 45, near: 0.1, far: 100 }}
      style={{ width: "100%", height: "100%" }}
      data-testid="parallax-canvas"
    >
      <SceneContent themeName={themeName} pointer={pointer} />
    </Canvas>
  );
}
