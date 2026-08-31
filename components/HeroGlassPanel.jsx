import { homeConfig, profile } from "@/lib/data";

export default function HeroGlassPanel({ phase = "morning" }) {
  const showGlassContainer = homeConfig.hero.showGlassContainer;

  return (
    <div
      className={`hero-copy ${showGlassContainer ? "glass-window" : "hero-copy--plain"}`}
      data-testid="hero-glass"
      data-glass-container={showGlassContainer ? "enabled" : "disabled"}
      data-hero-phase={phase}
    >
      <span className="kicker">
        <span className="live-dot" /> SYSTEM ONLINE · MUKHTADA.NST · JAMBI, INDONESIA
      </span>
      <h1>
        Full-stack developer building <br /> <em>web, AI, and data systems.</em>
      </h1>
      <p className="lede">{profile.lede_id}</p>
      <div className="hero-actions">
        <a href="#featured-projects" className="btn primary" data-testid="cta-quests">
          View featured projects
        </a>
        <a href="/lore" className="btn secondary" data-testid="cta-journey">
          Read the Lore
        </a>
      </div>
    </div>
  );
}
