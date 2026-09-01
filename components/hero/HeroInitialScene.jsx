import { HERO_PROFILES, getHeroVisualContract, getStaticSceneStyle } from "@/components/hero/visualContract";

const COMMON_CLOUD_COUNT = Math.min(
  HERO_PROFILES.desktop.clouds.length,
  HERO_PROFILES.mobile.clouds.length
);

const IMAGE_DIMENSIONS = {
  cloud: {
    desktop: { width: 1024, height: 683 },
    mobile: { width: 768, height: 512 },
  },
  mountains: {
    desktop: { width: 1600, height: 600 },
    mobile: { width: 1024, height: 384 },
  },
  hills: {
    desktop: { width: 1600, height: 640 },
    mobile: { width: 1024, height: 409 },
  },
  meadow: {
    desktop: { width: 1600, height: 640 },
    mobile: { width: 1024, height: 409 },
  },
  moon: {
    desktop: { width: 512, height: 512 },
    mobile: { width: 384, height: 384 },
  },
};

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

function ResponsiveCelestial({ kind, phase }) {
  const desktop = HERO_PROFILES.desktop;
  const mobile = HERO_PROFILES.mobile;
  const theme = getStaticSceneStyle(phase, false);
  const contractTheme = getHeroVisualContract(phase, false).theme;
  const angle = kind === "sun" ? contractTheme.sunAngle : contractTheme.moonAngle;
  const visibility = kind === "sun" ? contractTheme.sunVisibility : contractTheme.moonVisibility;
  const position = orbitPosition(angle, kind);
  const opacity = orbitOpacity(angle, visibility, kind);
  if (opacity <= 0) return null;

  return (
    <span
      className={`parallax-initial-celestial is-${kind}`}
      data-static-celestial={kind}
      style={{
        "--initial-celestial-left": `${position.x * 100}%`,
        "--initial-celestial-top": `${position.y * 100}%`,
        "--initial-celestial-desktop-size": `${desktop.celestial[kind === "sun" ? "sunSize" : "moonSize"] * 100}vh`,
        "--initial-celestial-mobile-size": `${mobile.celestial[kind === "sun" ? "sunSize" : "moonSize"] * 100}vh`,
        "--initial-celestial-opacity": opacity,
        ...theme,
      }}
    >
      <span className="parallax-initial-celestial-drift">
        {kind === "sun" ? (
          <span className="parallax-static-sun-glare" />
        ) : (
          <>
            <span className="parallax-static-aureole is-moon" />
            <ResponsiveSceneryImage
              className="parallax-initial-orb parallax-static-moon"
              desktopSrc={desktop.assets.moon}
              mobileSrc={mobile.assets.moon}
              dimensions={IMAGE_DIMENSIONS.moon}
              loading="lazy"
              testId="moon"
            />
          </>
        )}
      </span>
    </span>
  );
}

function ResponsiveSceneryImage({
  className,
  desktopSrc,
  mobileSrc,
  dimensions,
  fetchPriority,
  loading = "eager",
  style,
  testId,
}) {
  return (
    <picture>
      <source
        media="(max-width: 639px)"
        srcSet={mobileSrc}
        width={dimensions.mobile.width}
        height={dimensions.mobile.height}
      />
      <img
        className={className}
        src={desktopSrc}
        alt=""
        aria-hidden="true"
        decoding="async"
        loading={loading}
        fetchPriority={fetchPriority}
        width={dimensions.desktop.width}
        height={dimensions.desktop.height}
        draggable="false"
        style={style}
        data-initial-hero-asset={testId}
      />
    </picture>
  );
}

export default function HeroInitialScene({ phase = "morning", active = false }) {
  const desktop = HERO_PROFILES.desktop;
  const mobile = HERO_PROFILES.mobile;

  return (
    <div
      className="parallax-static-scene parallax-initial-scene"
      data-phase={phase}
      data-renderer="static-initial"
      data-render-active={active ? "true" : "false"}
      style={getStaticSceneStyle(phase, false)}
      aria-hidden="true"
    >
      <span
        className="parallax-static-sky is-visible"
        data-sky-phase={phase}
        style={getStaticSceneStyle(phase, false)}
      />

      <ResponsiveCelestial kind="sun" phase={phase} />
      <ResponsiveCelestial kind="moon" phase={phase} />

      {Array.from({ length: COMMON_CLOUD_COUNT }, (_, index) => {
        const desktopCloud = desktop.clouds[index];
        const mobileCloud = mobile.clouds[index];
        const desktopLeft = desktopCloud.x + (phase === "night" ? desktopCloud.nightShiftX || 0 : 0);
        const desktopTop = desktopCloud.y + (phase === "night" ? desktopCloud.nightShiftY || 0 : 0);
        const mobileLeft = mobileCloud.x + (phase === "night" ? mobileCloud.nightShiftX || 0 : 0);
        const mobileTop = mobileCloud.y + (phase === "night" ? mobileCloud.nightShiftY || 0 : 0);
        return (
          <ResponsiveSceneryImage
            className="parallax-static-cloud parallax-initial-cloud"
            desktopSrc={desktop.assets.cloud}
            mobileSrc={mobile.assets.cloud}
            dimensions={IMAGE_DIMENSIONS.cloud}
            key={`initial-cloud-${index}`}
            testId={`cloud-${index}`}
            style={{
              "--initial-desktop-left": `${desktopLeft * 100}%`,
              "--initial-desktop-top": `${desktopTop * 100}%`,
              "--initial-desktop-width": `${desktopCloud.width * 100}vw`,
              "--initial-desktop-opacity": desktopCloud.opacity * (phase === "night" ? 0.22 : 1),
              "--initial-desktop-flip": desktopCloud.flip ? -1 : 1,
              "--initial-mobile-left": `${mobileLeft * 100}%`,
              "--initial-mobile-top": `${mobileTop * 100}%`,
              "--initial-mobile-width": `${mobileCloud.width * 100}vw`,
              "--initial-mobile-opacity": mobileCloud.opacity * (phase === "night" ? 0.22 : 1),
              "--initial-mobile-flip": mobileCloud.flip ? -1 : 1,
              "--cloud-drift-from": `${desktopCloud.drift * -100}vw`,
              "--cloud-drift-to": `${desktopCloud.drift * 100}vw`,
              "--cloud-drift-duration": `${38 + index * 11}s`,
              "--cloud-drift-delay": `${-7 - index * 9}s`,
            }}
          />
        );
      })}

      {desktop.layers.map((desktopLayer) => {
        const mobileLayer = mobile.layers.find((layer) => layer.key === desktopLayer.key);
        const dimensions = IMAGE_DIMENSIONS[desktopLayer.key];
        return (
          <ResponsiveSceneryImage
            className={`parallax-static-landscape parallax-static-${desktopLayer.key} parallax-initial-layer`}
            desktopSrc={desktop.assets[desktopLayer.key]}
            mobileSrc={mobile.assets[desktopLayer.key]}
            dimensions={dimensions}
            fetchPriority={desktopLayer.key === "mountains" ? "high" : "auto"}
            key={desktopLayer.key}
            testId={desktopLayer.key}
            style={{
              "--initial-desktop-top": `${desktopLayer.centerY * 100}%`,
              "--initial-desktop-width": `${desktopLayer.width * 100}vw`,
              "--initial-desktop-opacity": desktopLayer.opacity,
              "--initial-mobile-top": `${mobileLayer.centerY * 100}%`,
              "--initial-mobile-width": `${mobileLayer.width * 100}vw`,
              "--initial-mobile-opacity": mobileLayer.opacity,
            }}
          />
        );
      })}

      <div className="parallax-static-wash" />
    </div>
  );
}
