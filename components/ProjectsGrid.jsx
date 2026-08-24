"use client";

import { useState, useMemo } from "react";
import GithubActivityCalendar from "@/components/GithubActivityCalendar";
import { PixelButton, RarityTag } from "@/components/claude";
import { featuredQuests } from "@/lib/data";

const TYPES = ["All", "Web", "AI", "Data"];
const CATS = ["All", "Personal", "Research", "Community"];

function tierRarity(tier = "") {
  if (tier.includes("TIER S")) return "epic";
  if (tier.includes("TIER A")) return "rare";
  return "common";
}

export default function ProjectsGrid() {
  const [type, setType] = useState("All");
  const [cat, setCat] = useState("All");

  const list = useMemo(
    () =>
      featuredQuests.filter(
        (q) => (type === "All" || q.type === type) && (cat === "All" || q.category === cat)
      ),
    [type, cat]
  );

  return (
    <div data-testid="projects-grid">
      <GithubActivityCalendar />

      <div className="filters-wrap">
        <div className="filter-row">
          <span className="flabel">TYPE</span>
          {TYPES.map((t) => (
            <PixelButton key={t} as="pill" selected={type === t} className="chip-btn" onClick={() => setType(t)} data-testid={`filter-type-${t.toLowerCase()}`}>
              {t}
            </PixelButton>
          ))}
        </div>
        <div className="filter-row">
          <span className="flabel">CATEGORY</span>
          {CATS.map((c) => (
            <PixelButton key={c} as="pill" selected={cat === c} className="chip-btn" onClick={() => setCat(c)} data-testid={`filter-cat-${c.toLowerCase()}`}>
              {c}
            </PixelButton>
          ))}
        </div>
      </div>

      <div className="quest-grid">
        {list.map((q, i) => (
          <a key={q.title} href={q.href} target="_blank" rel="noopener noreferrer" className="quest-card project-card has-rarity" data-testid={`quest-card-${i}`}>
            <RarityTag rarity={tierRarity(q.tier)} label={q.tier} />
            <h3>{q.title}</h3>
            <p>{q.desc}</p>
            <div className="tag-row">
              {q.tags.map((t) => (
                <span className="tag" key={t}>{t}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
      {list.length === 0 && <p style={{ color: "var(--ink-soft)", marginTop: 24 }}>No quests match these filters.</p>}
    </div>
  );
}
