import { auth } from "@/auth";
import EditablePageCaption from "@/components/EditablePageCaption";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { HudStatusStrip, LockedSlot, SpriteIcon } from "@/components/claude";
import { listAboutEntries } from "@/lib/backend/featureStore";
import { publications } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Research",
  description:
    "Mukhtada Billah NST's Google Scholar-indexed publications across education, optimization, data, and information systems.",
  path: "/research",
});
export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const [session, { entries }] = await Promise.all([auth(), listAboutEntries()]);
  const fallbackCaption = "Published, indexed, and cited research verified through Google Scholar.";
  const caption = entries.find((entry) => entry.entryKey === "research-caption")?.body || fallbackCaption;
  const canManage = session?.user?.role === "owner";

  return (
    <div className="page-wrap">
      <PageHeader label="// Lab Notes & Research" title="Publications">
        <EditablePageCaption
          entryKey="research-caption"
          title="Research caption"
          initialText={caption}
          canManage={canManage}
        />
      </PageHeader>
      <HudStatusStrip
        className="research-hud"
        items={[
          { label: "5 citations", accent: "gold", icon: <SpriteIcon id="icon-star-level" size={14} /> },
          { label: "H-index 2", accent: "gold", icon: <SpriteIcon id="icon-trophy" size={14} /> },
          { label: "4 publications", accent: "aurora", icon: <SpriteIcon id="icon-command" size={14} /> },
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
          <LockedSlot label="Next publication - in progress" />
        </Reveal>
      </div>
    </div>
  );
}
