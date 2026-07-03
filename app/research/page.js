import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { HudStatusStrip, LockedSlot, SpriteIcon } from "@/components/claude";
import { publications } from "@/lib/data";

export const metadata = { title: "Research - Mukhtada Billah NST" };

export default function ResearchPage() {
  return (
    <div className="page-wrap">
      <PageHeader label="// Lab Notes & Research" title="Publikasi">
        Riset yang benar-benar terbit, terindeks, dan tersitasi di Google Scholar.
      </PageHeader>
      <HudStatusStrip
        className="research-hud"
        items={[
          { label: "5 sitasi", accent: "gold", icon: <SpriteIcon id="icon-star-level" size={14} /> },
          { label: "H-index 2", accent: "gold", icon: <SpriteIcon id="icon-trophy" size={14} /> },
          { label: "4 publikasi", accent: "aurora", icon: <SpriteIcon id="icon-command" size={14} /> },
        ]}
      />
      <div className="pub-grid">
        {publications.map((p, i) => (
          <Reveal as="a" key={p.title} href={p.href} target="_blank" rel="noopener noreferrer" className="pub-card" delay={i * 70} data-testid={`pub-card-${i}`}>
            <div className="pub-meta">
              <span className="pub-year">{p.year}</span>
              <span className="pub-cite">
                CITED {p.citedBy}
                <span className="cite-dots" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, index) => (
                    <i key={index} className={index < p.citedBy ? "filled" : ""} />
                  ))}
                </span>
              </span>
            </div>
            <h3>{p.title}</h3>
            <p className="pub-authors">{p.authors}</p>
            <p className="pub-venue">{p.venue}</p>
          </Reveal>
        ))}
        <Reveal className="pub-card locked-pub-card" delay={publications.length * 70}>
          <LockedSlot label="Publikasi berikutnya - in progress" />
        </Reveal>
      </div>
    </div>
  );
}
