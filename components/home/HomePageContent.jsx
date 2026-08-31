"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import BlogPostCard from "@/components/blog/BlogPostCard";
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

export default function HomePageContent({ recentPosts = [] }) {
  const { phase } = useSite();
  const featured = featuredQuests.filter((project) => project.featured);
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

      <section className="section-band glimpse-band" id="project-previews">
        <div className="content">
          <div className="section-head">
            <span className="pixel-label">// Project Previews</span>
            <h2>Interfaces from shipped and research projects</h2>
            <p>Opening screens from web, research, community, hackathon, and thesis projects.</p>
          </div>
          <Reveal>
            <HomeGlimpseSlider items={homeGlimpses} />
          </Reveal>
        </div>
      </section>

      <section className="section-band" id="featured-projects">
        <div className="content">
          <div className="section-head">
            <span className="pixel-label">// Featured Projects</span>
            <h2>Selected web, AI, and data projects</h2>
            <p>Three projects from Mukhtada&apos;s research, AI tooling, and community work, with source links and technology details.</p>
          </div>
          <div className="quest-grid">
            {featured.map((project, index) => (
              <Reveal as="a" key={project.title} href={project.href} target="_blank" rel="noopener noreferrer" className="quest-card project-card has-rarity" delay={index * 70} data-testid={`quest-card-${index}`}>
                <RarityTag rarity={tierRarity(project.tier)} label={project.tier} />
                <h3>{project.title}</h3>
                <p>{project.desc}</p>
                <div className="tag-row">
                  {project.tags.map((tag) => (
                    <span className="tag" key={tag}>{tag}</span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
          <div className="home-cta">
            <Link href="/projects" className="btn primary" data-testid="cta-projects">View all projects</Link>
            <Link href="/research" className="btn secondary" data-testid="cta-research">Read the publications</Link>
          </div>
        </div>
      </section>

      <section className="section-band alt" id="featured-blog" aria-labelledby="featured-blog-title">
        <div className="content">
          <div className="section-head">
            <span className="pixel-label">// Featured Blog Posts</span>
            <h2 id="featured-blog-title">Recent articles and technical notes</h2>
            <p>Writing on web development, AI tooling, open-source software, research, and the decisions behind real projects.</p>
          </div>
          {recentPosts.length > 0 && (
            <div className="blog-grid">
              {recentPosts.map((post) => (
                <BlogPostCard key={post.slug} post={post} headingLevel="h3" />
              ))}
            </div>
          )}
          <div className="home-cta">
            <Link href="/blog" className="btn primary" data-testid="cta-blog">Read all articles</Link>
          </div>
        </div>
      </section>
    </>
  );
}
