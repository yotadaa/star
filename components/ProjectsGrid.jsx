"use client";

import { useState, useMemo } from "react";
import { featuredQuests } from "@/lib/data";

const TYPES = ["Semua", "Web", "AI", "Data"];
const CATS = ["Semua", "Personal", "Research", "Community"];

export default function ProjectsGrid() {
  const [type, setType] = useState("Semua");
  const [cat, setCat] = useState("Semua");

  const list = useMemo(
    () =>
      featuredQuests.filter(
        (q) => (type === "Semua" || q.type === type) && (cat === "Semua" || q.category === cat)
      ),
    [type, cat]
  );

  return (
    <div data-testid="projects-grid">
      <div className="filters-wrap">
        <div className="filter-row">
          <span className="flabel">TIPE</span>
          {TYPES.map((t) => (
            <button key={t} type="button" className={`chip-btn ${type === t ? "active" : ""}`} onClick={() => setType(t)} data-testid={`filter-type-${t.toLowerCase()}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="filter-row">
          <span className="flabel">KATEGORI</span>
          {CATS.map((c) => (
            <button key={c} type="button" className={`chip-btn ${cat === c ? "active" : ""}`} onClick={() => setCat(c)} data-testid={`filter-cat-${c.toLowerCase()}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="quest-grid">
        {list.map((q, i) => (
          <a key={q.title} href={q.href} target="_blank" rel="noopener noreferrer" className="quest-card" data-testid={`quest-card-${i}`}>
            <span className="tier">{q.tier}</span>
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
      {list.length === 0 && <p style={{ color: "var(--ink-soft)", marginTop: 24 }}>Tidak ada quest untuk filter ini.</p>}
    </div>
  );
}
