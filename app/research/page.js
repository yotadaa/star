import { auth } from "@/auth";
import EditablePageCaption from "@/components/EditablePageCaption";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { HudStatusStrip, LockedSlot, SpriteIcon } from "@/components/claude";
import { listAboutEntries } from "@/lib/backend/featureStore";
import { publicPageCopy, publications } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: publicPageCopy.research.metadataTitle,
  description: publicPageCopy.research.metadataDescription,
  path: "/research",
  tags: publicPageCopy.research.keywords,
});
export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const [session, { entries }] = await Promise.all([auth(), listAboutEntries()]);
  const fallbackCaption = publicPageCopy.research.caption;
  const caption = entries.find((entry) => entry.entryKey === "research-caption")?.body || fallbackCaption;
  const canManage = session?.user?.role === "owner";
  const citationCount = publications.reduce((total, publication) => total + Math.max(0, Number(publication.citedBy || 0)), 0);
  const hIndex = [...publications]
    .map((publication) => Math.max(0, Number(publication.citedBy || 0)))
    .sort((left, right) => right - left)
    .reduce((value, citations, index) => (citations >= index + 1 ? index + 1 : value), 0);

  return (
    <div className="page-wrap">
      <PageHeader label={publicPageCopy.research.label} title={publicPageCopy.research.title}>
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
          { label: `${citationCount} citations`, accent: "gold", icon: <SpriteIcon id="icon-star-level" size={14} /> },
          { label: `h-index ${hIndex}`, accent: "gold", icon: <SpriteIcon id="icon-trophy" size={14} /> },
          { label: `${publications.length} publications`, accent: "aurora", icon: <SpriteIcon id="icon-command" size={14} /> },
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
