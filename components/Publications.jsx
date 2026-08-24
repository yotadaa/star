import Reveal from "./Reveal";
import { publications, skills } from "@/lib/data";

export default function Publications() {
  return (
    <section className="section-band" id="notes">
      <div className="content">
        <div className="section-head">
          <span className="pixel-label">// Lab Notes &amp; Research</span>
          <h2>Indexed publications</h2>
          <p>Research that is published and cited on Google Scholar.</p>
        </div>
        <div className="pub-grid">
          {publications.map((p, i) => (
            <Reveal
              as="a"
              key={p.title}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pub-card"
              delay={i * 70}
              data-testid={`pub-card-${i}`}
            >
              <div className="pub-meta">
                <span className="pub-year">{p.year}</span>
                <span className="pub-cite">CITED {p.citedBy}</span>
              </div>
              <h3>{p.title}</h3>
              <p className="pub-authors">{p.authors}</p>
              <p className="pub-venue">{p.venue}</p>
            </Reveal>
          ))}
        </div>

        <div className="skills-row">
          {skills.map((s, i) => (
            <Reveal key={s.group} className="skill-group" delay={i * 60}>
              <h4>{s.group}</h4>
              <div className="tag-row">
                {s.items.map((it) => (
                  <span className="tag" key={it}>
                    {it}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
