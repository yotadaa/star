"use client";

import { useEffect, useMemo, useState } from "react";

const DAYS_IN_WEEK = 7;
const WEEKS = 53;
const FALLBACK_DAYS = DAYS_IN_WEEK * WEEKS;

function buildEmptyCells() {
  return Array.from({ length: FALLBACK_DAYS }, (_, index) => ({
    date: `empty-${index}`,
    count: 0,
    level: 0,
  }));
}

function normalizeCells(cells) {
  if (!Array.isArray(cells) || cells.length === 0) return buildEmptyCells();
  return cells.map((cell) => ({
    date: cell.date,
    count: Number(cell.count) || 0,
    level: Math.min(4, Math.max(0, Number(cell.level) || 0)),
  }));
}

export default function GithubActivityCalendar() {
  const [cells, setCells] = useState(() => buildEmptyCells());

  useEffect(() => {
    let alive = true;

    async function loadCalendar() {
      try {
        const response = await fetch("/api/github-activity");
        if (!response.ok) throw new Error("Unable to load GitHub activity");
        const data = await response.json();
        if (alive) setCells(normalizeCells(data.cells));
      } catch {
        if (alive) setCells(buildEmptyCells());
      }
    }

    loadCalendar();
    return () => {
      alive = false;
    };
  }, []);

  const total = useMemo(() => cells.reduce((sum, cell) => sum + cell.count, 0), [cells]);

  return (
    <section
      className="github-activity"
      data-testid="github-activity-calendar"
      aria-label={`GitHub contribution activity calendar, ${total} contributions`}
    >
      <div className="github-calendar-wrap">
        <div className="github-calendar" role="img" aria-label={`GitHub contribution heatmap with ${total} contributions`}>
          {cells.map((cell, index) => (
            <span
              key={`${cell.date}-${index}`}
              className="github-day"
              data-level={cell.level}
              title={`${cell.count} contributions on ${cell.date}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
