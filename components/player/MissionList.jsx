import { RarityTag } from "@/components/claude";
import ProgressBarSegmented from "./ProgressBarSegmented";

const categoryLabel = {
  web: "WEB",
  research: "RESEARCH",
  community: "COMMUNITY",
};

export default function MissionList({ missions }) {
  return (
    <div className="player-grid mission-grid">
      {missions.map((mission) => (
        <article key={mission.id} className={`player-card mission-card status-${mission.status}`}>
          <div className="player-card-top">
            <RarityTag rarity={mission.status === "completed" ? "epic" : "rare"} label={categoryLabel[mission.category] ?? mission.category} className="player-rarity" />
            <span className="player-points">+{mission.points} PP</span>
          </div>
          <h3>{mission.title}</h3>
          <p>{mission.description}</p>
          <ProgressBarSegmented
            current={mission.current}
            target={mission.target}
            label={`${mission.current}/${mission.target}`}
          />
          <span className="player-meta">
            {mission.status === "completed" ? "Reward claimed" : "Reward saat target tercapai"}
          </span>
        </article>
      ))}
    </div>
  );
}
