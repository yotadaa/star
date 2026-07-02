import Reveal from "./Reveal";
import { skills } from "@/lib/data";

export default function SkillsGrid() {
  return (
    <div className="skills-row" style={{ justifyContent: "flex-start" }} data-testid="skills-grid">
      {skills.map((s, i) => (
        <Reveal key={s.group} className="skill-group" delay={i * 60}>
          <h4>{s.group}</h4>
          <div className="tag-row">
            {s.items.map((it) => (
              <span className="tag" key={it}>{it}</span>
            ))}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
