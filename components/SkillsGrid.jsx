import Reveal from "./Reveal";
import { skills } from "@/lib/data";

export default function SkillsGrid() {
  return (
    <div className="skills-row" style={{ justifyContent: "flex-start" }} data-testid="skills-grid">
      {skills.map((s, i) => (
        <Reveal key={s.group} className="skill-group" delay={i * 60}>
          <div className="skill-head">
            <h4>{s.group}</h4>
            <span className="skill-meter" aria-label={`${s.group} level ${s.level} dari 8`}>
              {Array.from({ length: 8 }, (_, index) => (
                <i key={index} className={index < s.level ? "filled" : ""} />
              ))}
            </span>
          </div>
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
