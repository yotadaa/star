import { NextResponse } from "next/server";

const USERNAME = "yotadaa";
const CONTRIBUTIONS_URL = `https://github.com/users/${USERNAME}/contributions`;

export const revalidate = 3600;

function readAttribute(tag, name) {
  const pattern = new RegExp(`${name}="([^"]*)"`);
  return tag.match(pattern)?.[1] || "";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseCount(text) {
  if (!text || /^no contributions/i.test(text)) return 0;
  const match = text.match(/([\d,]+)\s+contribution/i);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
}

function parseContributionCalendar(html) {
  const cells = [];
  const cellPattern = /<td\b[^>]*ContributionCalendar-day[^>]*><\/td>/g;
  const matches = html.matchAll(cellPattern);

  for (const match of matches) {
    const tag = match[0];
    const date = readAttribute(tag, "data-date");
    const id = readAttribute(tag, "id");
    if (!date || !id) continue;

    const tooltipPattern = new RegExp(
      `<tool-tip[^>]*for="${escapeRegExp(id)}"[^>]*>([^<]*)<\\/tool-tip>`,
      "i"
    );
    const tooltip = html.match(tooltipPattern)?.[1] || "";
    const count = parseCount(tooltip);

    cells.push({ date, count });
  }

  return cells.sort((a, b) => a.date.localeCompare(b.date));
}

function addIntensityLevels(cells) {
  const maxCount = Math.max(0, ...cells.map((cell) => cell.count));

  return cells.map((cell) => {
    if (cell.count <= 0 || maxCount <= 0) return { ...cell, level: 0 };

    const ratio = cell.count / maxCount;
    const level = ratio >= 0.78 ? 4 : ratio >= 0.5 ? 3 : ratio >= 0.24 ? 2 : 1;
    return { ...cell, level };
  });
}

export async function GET() {
  try {
    const response = await fetch(CONTRIBUTIONS_URL, {
      headers: {
        Accept: "text/html",
        "User-Agent": "porto-variant/1.0 (+https://github.com/yotadaa)",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status}`);
    }

    const html = await response.text();
    const cells = addIntensityLevels(parseContributionCalendar(html));

    if (!cells.length) {
      throw new Error("No contribution cells found");
    }

    return NextResponse.json(
      {
        user: USERNAME,
        cells,
        total: cells.reduce((sum, cell) => sum + cell.count, 0),
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        user: USERNAME,
        cells: [],
        total: 0,
        updatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
