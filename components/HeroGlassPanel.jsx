import { homeConfig, profile } from "@/lib/data";

export default function HeroGlassPanel() {
  const showGlassContainer = homeConfig.hero.showGlassContainer;

  return (
    <div
      className={`hero-copy ${showGlassContainer ? "glass-window" : "hero-copy--plain"}`}
      data-testid="hero-glass"
      data-glass-container={showGlassContainer ? "enabled" : "disabled"}
    >
      <span className="kicker">
        <span className="live-dot" /> SYSTEM ONLINE — SAVE FILE: MUKHTADA.NST
      </span>
      <h1>
        Membangun sistem, <em>satu quest</em>
        <br />
        pada satu waktu.
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
