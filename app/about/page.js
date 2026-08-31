import { auth } from "@/auth";
import EditablePageCaption from "@/components/EditablePageCaption";
import PageHeader from "@/components/PageHeader";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import SkillsGrid from "@/components/SkillsGrid";
import Achievements from "@/components/Achievements";
import JourneyPath from "@/components/JourneyPath";
import { HudStatusStrip, SpriteIcon } from "@/components/claude";
import { profile, publicPageCopy, publications } from "@/lib/data";
import { listAboutEntries } from "@/lib/backend/featureStore";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: publicPageCopy.about.metadataTitle,
  description: publicPageCopy.about.metadataDescription,
  path: "/about",
  tags: publicPageCopy.about.keywords,
  titleSuffix: "",
  absoluteTitle: true,
});
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [session, { entries, warnings }] = await Promise.all([auth(), listAboutEntries()]);
  const introEntry = entries.find((entry) => entry.entryKey === "intro");
  const fallbackCaption = publicPageCopy.about.caption;
  const fallbackIntro = profile.about;
  const caption = entries.find((entry) => entry.entryKey === "about-caption")?.body || fallbackCaption;
  const intro = introEntry?.body || fallbackIntro;
  const canManage = session?.user?.role === "owner";

  return (
    <div className="page-wrap">
      <PageHeader label={publicPageCopy.about.label} title={publicPageCopy.about.title}>
        <EditablePageCaption
          entryKey="about-caption"
          title="About caption"
          initialText={caption}
          canManage={canManage}
        />
      </PageHeader>

      <EditablePageCaption
        entryKey="intro"
        title="About Mukhtada"
        initialText={intro}
        canManage={canManage}
        className="intro-editable"
        textClassName="intro-prose"
        payload={{ ...introEntry?.payload, type: "profile-intro" }}
        editLabel="Edit profile paragraph"
        textareaLabel="Profile paragraph"
      />
      <HudStatusStrip
        className="profile-hud"
        items={[
          { label: "Full-stack · AI · Data", accent: "gold", icon: <SpriteIcon id="icon-level-badge" size={14} /> },
          { label: `${publications.length} indexed publications`, accent: "gold", icon: <SpriteIcon id="icon-trophy" size={14} /> },
          { label: profile.location, accent: "aurora", icon: <SpriteIcon id="icon-pin" size={14} /> },
        ]}
      />
      {warnings?.length > 0 && <p className="backend-warning" role="status">Convex is not responding, so the factual local profile is being used as a fallback.</p>}

      <div className="page-divider" style={{ marginTop: 48 }} />
      <div className="section-head" style={{ textAlign: "left", margin: "0 0 28px", maxWidth: "none" }}>
        <span className="pixel-label" style={{ color: "var(--coral-dark)" }}>// Experience Record</span>
        <h2 style={{ color: "var(--ink)" }}>Professional and project experience</h2>
      </div>
      <ExperienceTimeline />

      <div className="page-divider" style={{ marginTop: 56 }} />
      <div className="section-head" style={{ textAlign: "left", margin: "0 0 28px", maxWidth: "none" }}>
        <span className="pixel-label" style={{ color: "var(--coral-dark)" }}>// Education Timeline</span>
        <h2 style={{ color: "var(--ink)" }}>Education and milestones</h2>
      </div>
      <JourneyPath embedded />

      <div className="page-divider" style={{ marginTop: 56 }} />
      <div className="section-head" style={{ textAlign: "left", margin: "0 0 28px", maxWidth: "none" }}>
        <span className="pixel-label" style={{ color: "var(--coral-dark)" }}>// Skills Inventory</span>
        <h2 style={{ color: "var(--ink)" }}>Technical and community skills</h2>
      </div>
      <SkillsGrid />

      <div className="page-divider" style={{ marginTop: 56 }} />
      <div className="section-head" style={{ textAlign: "left", margin: "0 0 28px", maxWidth: "none" }}>
        <span className="pixel-label" style={{ color: "var(--coral-dark)" }}>// Verified Milestones</span>
        <h2 style={{ color: "var(--ink)" }}>Selected achievements</h2>
      </div>
      <Achievements />
    </div>
  );
}
