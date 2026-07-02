import Reveal from "./Reveal";
import { achievements } from "@/lib/data";

export default function Achievements() {
  return (
    <div className="ach-grid" data-testid="achievements-grid">
      {achievements.map((a, i) => (
        <Reveal key={a.title} className="ach-card" delay={i * 60}>
          <span className="ach-year">{a.year}</span>
          <span className="ach-tag">{a.tag}</span>
          <h3>{a.title}</h3>
          <p>{a.org}</p>
        </Reveal>
      ))}
    </div>
  );
}
