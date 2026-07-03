import Reveal from "./Reveal";
import { featuredQuests } from "@/lib/data";

export default function FeaturedQuests() {
  return (
    <section className="section-band" id="quests">
      <div className="content">
        <div className="section-head">
          <span className="pixel-label">// Featured Quests</span>
          <h2>Proyek pilihan, bukan daftar penuh</h2>
          <p>
            Setiap kartu adalah quest yang sudah dijalani - lengkap dengan stack,
            peran, dan dampaknya. 57 repo lainnya menunggu di GitHub.
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
