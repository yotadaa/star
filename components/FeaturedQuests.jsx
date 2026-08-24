import Reveal from "./Reveal";
import { featuredQuests } from "@/lib/data";

export default function FeaturedQuests() {
  return (
    <section className="section-band" id="quests">
      <div className="content">
        <div className="section-head">
          <span className="pixel-label">// Featured Quests</span>
          <h2>Selected work, not a repository dump</h2>
          <p>
            Each card is a completed quest with its stack, role, and impact.
            The remaining 57 repositories are available on GitHub.
          </p>
        </div>
        <div className="quest-grid">
          {featuredQuests.map((q, i) => (
            <Reveal
              as="a"
              key={q.title}
              href={q.href}
              target="_blank"
              rel="noopener noreferrer"
              className="quest-card"
              delay={i * 70}
              data-testid={`quest-card-${i}`}
            >
              <span className="tier">{q.tier}</span>
              <h3>{q.title}</h3>
              <p>{q.desc}</p>
              <div className="tag-row">
                {q.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
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
