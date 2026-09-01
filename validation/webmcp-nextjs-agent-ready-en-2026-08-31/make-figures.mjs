import path from "node:path";
import sharp from "sharp";

const packageDir = import.meta.dirname;
const cards = [
  ["search_blog", "Published summaries", "READ ONLY"],
  ["get_project", "Exact project title", "READ ONLY"],
  ["find_research", "Exact paper title", "READ ONLY"],
  ["get_contact_channels", "Verified public links", "READ ONLY"],
  ["filter_projects", "Visible grid state", "REVERSIBLE"],
];

const cardSvg = cards.map(([name, description, mode], index) => {
  const x = index < 3 ? 90 + index * 490 : 335 + (index - 3) * 490;
  const y = index < 3 ? 270 : 515;
  const modeColor = mode === "READ ONLY" ? "#315f59" : "#ad5b3e";
  return `<g>
    <rect x="${x}" y="${y}" width="440" height="175" rx="8" fill="#fbf8f0" stroke="#252621" stroke-width="3"/>
    <text x="${x + 28}" y="${y + 52}" class="tool">${name}</text>
    <text x="${x + 28}" y="${y + 94}" class="desc">${description}</text>
    <rect x="${x + 28}" y="${y + 120}" width="150" height="32" rx="3" fill="${modeColor}"/>
    <text x="${x + 103}" y="${y + 142}" text-anchor="middle" class="mode">${mode}</text>
  </g>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" fill="#eee8dc"/>
  <text x="80" y="105" class="title">WebMCP surface on the portfolio</text>
  <text x="80" y="155" class="subtitle">Structured tools are discovered only after the browser visits the site.</text>
  <path d="M800 190 V235" stroke="#252621" stroke-width="4"/>
  <rect x="585" y="180" width="430" height="68" rx="34" fill="#252621"/>
  <text x="800" y="225" text-anchor="middle" class="site">me.mukhtada.my.id</text>
  ${cardSvg}
  <line x1="80" y1="756" x2="1520" y2="756" stroke="#b3aa98"/>
  <text x="80" y="800" class="foot">No draft access · no message sending · no automatic navigation · no cross-origin exposure</text>
  <text x="80" y="838" class="foot">Unsupported browsers receive the ordinary site with no WebMCP UI or error.</text>
  <style>
    .title{font:700 44px Georgia,serif;fill:#20211d}.subtitle{font:23px Arial,sans-serif;fill:#55554c}.site{font:700 22px Arial,sans-serif;fill:#fff}.tool{font:700 26px monospace;fill:#20211d}.desc{font:21px Arial,sans-serif;fill:#55554c}.mode{font:700 15px Arial,sans-serif;fill:#fff;letter-spacing:1px}.foot{font:20px Arial,sans-serif;fill:#55554c}
  </style>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(path.join(packageDir, "assets/webmcp-tool-surface.png"));
await sharp(path.join(packageDir, "implementation/desktop-ai-filter.jpg"))
  .extract({ left: 0, top: 310, width: 1265, height: 720 })
  .jpeg({ quality: 90 })
  .toFile(path.join(packageDir, "assets/webmcp-filter-projects-evidence.jpg"));

console.log("assets/webmcp-tool-surface.png");
console.log("assets/webmcp-filter-projects-evidence.jpg");
