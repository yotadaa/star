"use client";

import Link from "next/link";
import HeroGlassPanel from "@/components/HeroGlassPanel";
import HomeGlimpseSlider from "@/components/HomeGlimpseSlider";
import ParallaxScene from "@/components/ParallaxScene";
import QuestLog from "@/components/QuestLog";
import Reveal from "@/components/Reveal";
import { RarityTag } from "@/components/claude";
import { featuredQuests, homeGlimpses } from "@/lib/data";
import { useSite } from "@/components/site/SiteProvider";

export default function Home() {
  const { phase } = useSite();
  const featured = featuredQuests.filter((q) => q.featured);
  const tierRarity = (tier = "") => (tier.includes("TIER S") ? "epic" : tier.includes("TIER A") ? "rare" : "common");

  return (
    <>
      <section className="hero" id="hero">
        <div className="hero-canvas">
          <ParallaxScene phase={phase} />
        </div>
        <HeroGlassPanel />
        <div className="scroll-cue">
          GULIR <span className="chev">▾</span>
        </div>
      </section>

      <QuestLog />

      <section className="section-band glimpse-band" id="glimpses">
        <div className="content">
          <div className="section-head">
            <span className="pixel-label">// Build Glimpses</span>
            <h2>Header yang pernah dibangun</h2>
            <p>Beberapa first-screen dari proyek web, riset, community platform, hackathon, dan thesis build.</p>
          </div>
          <Reveal>
            <HomeGlimpseSlider items={homeGlimpses} />
          </Reveal>
        </div>
      </section>

      <section className="section-band" id="quests">
        <div className="content">
          <div className="section-head">
            <span className="pixel-label">// Featured Quests</span>
            <h2>Quest unggulan</h2>
            <p>Cuplikan proyek pilihan. Filter lengkap dari 57 repo ada di halaman Projects.</p>
          </div>
          <div className="quest-grid">
            {featured.map((q, i) => (
              <Reveal as="a" key={q.title} href={q.href} target="_blank" rel="noopener noreferrer" className="quest-card project-card has-rarity" delay={i * 70} data-testid={`quest-card-${i}`}>
                <RarityTag rarity={tierRarity(q.tier)} label={q.tier} />
                <h3>{q.title}</h3>
                <p>{q.desc}</p>
                <div className="tag-row">
                  {q.tags.map((t) => (
                    <span className="tag" key={t}>{t}</span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
          <div className="home-cta">
            <Link href="/projects" className="btn primary" data-testid="cta-projects">▶ Semua Projects</Link>
            <Link href="/research" className="btn secondary" data-testid="cta-research">Baca Research</Link>
          </div>
        </div>
      </section>
    </>
  );
}
