"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import HeroGlassPanel from "@/components/HeroGlassPanel";
import HeroEntityLayer from "@/components/HeroEntityLayer";
import QuestLog from "@/components/QuestLog";
import Reveal from "@/components/Reveal";
import { RarityTag } from "@/components/claude";
import { featuredQuests, homeGlimpses } from "@/lib/data";
import { useSite } from "@/components/site/SiteProvider";

const HomeGlimpseSlider = dynamic(() => import("@/components/HomeGlimpseSlider"), {
  ssr: false,
  loading: () => null,
});
const ParallaxScene = dynamic(() => import("@/components/ParallaxScene"), {
  ssr: false,
  loading: () => null,
});

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
        <HeroEntityLayer phase={phase} />
        <HeroGlassPanel phase={phase} />
        <div className="scroll-cue">
          SCROLL <span className="chev">▾</span>
        </div>
      </section>

      <QuestLog />

      <section className="section-band glimpse-band" id="glimpses">
        <div className="content">
          <div className="section-head">
            <span className="pixel-label">// Build Glimpses</span>
            <h2>Interfaces built along the way</h2>
            <p>A selection of opening screens from web projects, research, community platforms, hackathons, and thesis work.</p>
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
            <h2>Featured quests</h2>
            <p>A selection of completed work. The Projects page filters the full set drawn from 57 repositories.</p>
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
            <Link href="/projects" className="btn primary" data-testid="cta-projects">▶ All Projects</Link>
            <Link href="/research" className="btn secondary" data-testid="cta-research">Read Research</Link>
          </div>
        </div>
      </section>
    </>
  );
}
