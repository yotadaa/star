import Reveal from "./Reveal";
import { experience } from "@/lib/data";

export default function ExperienceTimeline() {
  return (
    <div className="exp-list" data-testid="experience-list">
      {experience.map((e, i) => (
        <Reveal key={e.role + e.org} className="exp-card" delay={i * 60} data-testid={`exp-card-${i}`}>
          <div className="exp-top">
            <h3 className="exp-role">{e.role}</h3>
            <span className="exp-period">{e.period}</span>
          </div>
          <div className="exp-org">{e.org}</div>
          <div className="exp-meta">
            <span className="pill">{e.type}</span>
            <span className="pill">{e.mode}</span>
            {e.stack.map((s) => (
              <span className="pill" key={s}>{s}</span>
            ))}
          </div>
          <p className="exp-detail">{e.detail}</p>
        </Reveal>
      ))}
    </div>
  );
}
