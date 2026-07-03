import PageHeader from "@/components/PageHeader";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import SkillsGrid from "@/components/SkillsGrid";
import Achievements from "@/components/Achievements";
import JourneyPath from "@/components/JourneyPath";
import { HudStatusStrip, SpriteIcon } from "@/components/claude";
import { profile } from "@/lib/data";

export const metadata = { title: "About - Mukhtada Billah NST" };

export default function AboutPage() {
  return (
    <div className="page-wrap">
      <PageHeader label="// Save File · Profile" title="Tentang Mukhtada">
        {profile.affiliation} · {profile.location}
      </PageHeader>

      <p className="intro-prose">
        Aku <strong>Mukhtada Billah NST</strong> - mahasiswa <strong>Sistem Informasi Universitas Jambi</strong> yang
        senang mengubah riset jadi produk yang benar-benar jalan. Fokusku di{" "}
        <strong>fullstack web</strong>, <strong>AI tooling</strong>, dan <strong>data science</strong>. Aku suka
        mengajar, menulis riset, dan membangun hal-hal kecil yang berguna untuk komunitas.
      </p>
      <HudStatusStrip
        className="profile-hud"
        items={[
          { label: "Class: Fullstack Adventurer", accent: "gold", icon: <SpriteIcon id="icon-level-badge" size={14} /> },
          { label: "Level 4", accent: "gold", icon: <SpriteIcon id="icon-trophy" size={14} /> },
          { label: profile.location, accent: "aurora", icon: <SpriteIcon id="icon-pin" size={14} /> },
        ]}
      />

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
