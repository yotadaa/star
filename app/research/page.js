import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { publications } from "@/lib/data";

export const metadata = { title: "Research — Mukhtada Billah NST" };

export default function ResearchPage() {
  return (
    <div className="page-wrap">
      <PageHeader label="// Lab Notes & Research" title="Publikasi">
        Riset yang benar-benar terbit dan tersitasi di Google Scholar — 5 sitasi, h-index 2.
      </PageHeader>
      <div className="pub-grid">
        {publications.map((p, i) => (
          <Reveal as="a" key={p.title} href={p.href} target="_blank" rel="noopener noreferrer" className="pub-card" delay={i * 70} data-testid={`pub-card-${i}`}>
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
    </div>
  );
}
