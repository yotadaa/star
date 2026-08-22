import { auth } from "@/auth";
import EditablePageCaption from "@/components/EditablePageCaption";
import PageHeader from "@/components/PageHeader";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import SkillsGrid from "@/components/SkillsGrid";
import Achievements from "@/components/Achievements";
import JourneyPath from "@/components/JourneyPath";
import { HudStatusStrip, SpriteIcon } from "@/components/claude";
import { profile } from "@/lib/data";
import { listAboutEntries } from "@/lib/backend/featureStore";

export const metadata = { title: "About - Mukhtada Billah NST" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [session, { entries, source, warnings }] = await Promise.all([auth(), listAboutEntries()]);
  const introEntry = entries.find((entry) => entry.entryKey === "intro");
  const fallbackCaption = `${profile.affiliation} · ${profile.location}`;
  const fallbackIntro =
    "Aku Mukhtada Billah NST - mahasiswa Sistem Informasi Universitas Jambi yang senang mengubah riset jadi produk yang benar-benar jalan. Fokusku di fullstack web, AI tooling, dan data science. Aku suka mengajar, menulis riset, dan membangun hal-hal kecil yang berguna untuk komunitas.";
  const caption = entries.find((entry) => entry.entryKey === "about-caption")?.body || fallbackCaption;
  const intro = introEntry?.body || fallbackIntro;
  const canManage = session?.user?.role === "owner";

  return (
    <div className="page-wrap">
      <PageHeader label="// Save File · Profile" title="Tentang Mukhtada">
        <EditablePageCaption
          entryKey="about-caption"
          title="About caption"
          initialText={caption}
          canManage={canManage}
        />
      </PageHeader>

      <EditablePageCaption
        entryKey="intro"
        title="Tentang Mukhtada"
        initialText={intro}
        canManage={canManage}
        className="intro-editable"
        textClassName="intro-prose"
        payload={{ ...introEntry?.payload, type: "profile-intro" }}
        editLabel="Edit paragraf profil"
        textareaLabel="Paragraf profil"
      />
      <HudStatusStrip
        className="profile-hud"
        items={[
          { label: "Class: Fullstack Adventurer", accent: "gold", icon: <SpriteIcon id="icon-level-badge" size={14} /> },
          { label: "Level 4", accent: "gold", icon: <SpriteIcon id="icon-trophy" size={14} /> },
          { label: profile.location, accent: "aurora", icon: <SpriteIcon id="icon-pin" size={14} /> },
          { label: source === "local-fallback" ? "About local fallback" : "About DB synced", accent: "ink", icon: <SpriteIcon id={source === "local-fallback" ? "icon-database-offline" : "icon-database-online"} size={14} /> },
        ]}
      />
      {warnings?.length > 0 && <p className="backend-warning" role="status">Convex belum merespons, profil lokal faktual tetap dipakai sebagai cadangan baca.</p>}

      <div className="page-divider" style={{ marginTop: 48 }} />
      <div className="section-head" style={{ textAlign: "left", margin: "0 0 28px", maxWidth: "none" }}>
        <span className="pixel-label" style={{ color: "var(--coral-dark)" }}>// Experience Log</span>
        <h2 style={{ color: "var(--ink)" }}>Pengalaman</h2>
      </div>
      <ExperienceTimeline />

      <div className="page-divider" style={{ marginTop: 56 }} />
      <div className="section-head" style={{ textAlign: "left", margin: "0 0 28px", maxWidth: "none" }}>
        <span className="pixel-label" style={{ color: "var(--coral-dark)" }}>// Journey Log</span>
        <h2 style={{ color: "var(--ink)" }}>Perjalanan akademik</h2>
      </div>
      <JourneyPath embedded />

      <div className="page-divider" style={{ marginTop: 56 }} />
      <div className="section-head" style={{ textAlign: "left", margin: "0 0 28px", maxWidth: "none" }}>
        <span className="pixel-label" style={{ color: "var(--coral-dark)" }}>// Skill Tree</span>
        <h2 style={{ color: "var(--ink)" }}>Keahlian</h2>
      </div>
      <SkillsGrid />

      <div className="page-divider" style={{ marginTop: 56 }} />
      <div className="section-head" style={{ textAlign: "left", margin: "0 0 28px", maxWidth: "none" }}>
        <span className="pixel-label" style={{ color: "var(--coral-dark)" }}>// Achievements</span>
        <h2 style={{ color: "var(--ink)" }}>Pencapaian</h2>
      </div>
      <Achievements />
    </div>
  );
}
