import { RarityTag, SpriteIcon } from "@/components/claude";

export default function AchievementList({ achievements }) {
  return (
    <div className="player-grid achievement-grid">
      {achievements.map((achievement) => (
        <article
          key={achievement.id}
          className={`player-card achievement-card ${achievement.unlocked ? "is-unlocked" : "is-locked"}`}
        >
          <div className="player-card-top">
            <RarityTag rarity={achievement.rarity} label={achievement.rarity.toUpperCase()} className="player-rarity" />
            <span className="player-points">{achievement.unlocked ? `+${achievement.points}` : "+??"} PP</span>
          </div>
          <div className="achievement-body">
            <span className="achievement-icon" aria-hidden="true">
              <SpriteIcon id={achievement.unlocked ? achievement.icon : "icon-lock-silhouette"} size={30} />
            </span>
            <div>
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
            </div>
          </div>
          <span className="player-meta">
            {achievement.unlocked ? `Unlocked - ${achievement.unlockedAtLabel ?? "verified"}` : "Locked"}
          </span>
        </article>
      ))}
    </div>
  );
}
