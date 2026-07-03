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
        <span className="live-dot" /> SYSTEM ONLINE - SAVE FILE: MUKHTADA.NST
      </span>
      <h1>
        Membangun sistem, <br></br> <em>satu quest</em> pada satu waktu.
      </h1>
      <p className="lede">{profile.lede_id}</p>
      <div className="hero-actions">
        <a href="#quests" className="btn primary" data-testid="cta-quests">
          ▶ Mulai Quest
        </a>
        <a href="#journey" className="btn secondary" data-testid="cta-journey">
          Baca Lore
        </a>
      </div>
    </div>
  );
}
