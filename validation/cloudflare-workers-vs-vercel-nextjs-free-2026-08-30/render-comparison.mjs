import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const packageDir = path.dirname(new URL(import.meta.url).pathname);
const comparisonOutput = path.join(packageDir, "assets/free-tier-boundaries.png");
const guidanceOutput = path.join(packageDir, "assets/vinext-guidance-reconstruction.png");

const width = 1600;
const height = 1000;
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
})[char]);

const rows = [
  ["Traffic", "100,000 Worker requests/day", "1,000,000 Edge Requests/month"],
  ["Static assets", "Free and unlimited when no Worker runs", "Count as Edge Requests"],
  ["Active CPU", "10 ms per HTTP request", "4 CPU-hours/month"],
  ["Runtime memory", "128 MB per isolate", "2 GB / 1 vCPU per function"],
  ["Server bundle", "3 MB compressed Worker", "250 MB uncompressed function"],
  ["Builds", "3,000 min/month; 20 min/build", "6,000 min/month; 45 min/build"],
  ["Plan policy", "Self-Serve and product terms apply", "Non-commercial personal use"],
];

const rowY = (index) => 300 + index * 88;
const rowLines = rows.map(([label, cloudflare, vercel], index) => {
  const y = rowY(index);
  return `
    <line x1="80" x2="1520" y1="${y - 41}" y2="${y - 41}" stroke="#c9c1b3" stroke-width="1" />
    <text x="92" y="${y}" class="label">${esc(label)}</text>
    <text x="390" y="${y}" class="value">${esc(cloudflare)}</text>
    <text x="1010" y="${y}" class="value">${esc(vercel)}</text>`;
}).join("");

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="1600" height="1000" fill="#eee9df" />
  <rect x="40" y="40" width="1520" height="920" rx="4" fill="#f8f5ed" stroke="#2e2d2a" stroke-width="2" />
  <rect x="80" y="80" width="20" height="112" fill="#df6c3a" />
  <rect x="1480" y="80" width="20" height="112" fill="#1f1f22" />
  <text x="130" y="120" class="eyebrow">FREE NEXT.JS DEPLOYMENT</text>
  <text x="130" y="178" class="title">Separate meters, separate failure modes</text>
  <text x="390" y="249" class="column cloudflare">CLOUDFLARE WORKERS FREE</text>
  <text x="1010" y="249" class="column vercel">VERCEL HOBBY</text>
  ${rowLines}
  <line x1="80" x2="1520" y1="875" y2="875" stroke="#2e2d2a" stroke-width="2" />
  <text x="92" y="916" class="foot">Daily requests and monthly compute are not one score. Static, dynamic, and build traffic must be evaluated separately.</text>
  <style>
    .eyebrow { font: 700 24px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 3px; fill: #5a554c; }
    .title { font: 700 47px Georgia, serif; fill: #20201f; }
    .column { font: 700 22px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 1.4px; }
    .cloudflare { fill: #c65226; }
    .vercel { fill: #202022; }
    .label { font: 700 22px ui-sans-serif, system-ui, sans-serif; fill: #4c4943; }
    .value { font: 500 23px ui-sans-serif, system-ui, sans-serif; fill: #20201f; }
    .foot { font: 500 20px ui-sans-serif, system-ui, sans-serif; fill: #5a554c; }
  </style>
</svg>`;

const guidanceSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" fill="#eee9df" />
  <rect x="48" y="48" width="1504" height="804" rx="4" fill="#f8f5ed" stroke="#2e2d2a" stroke-width="2" />
  <rect x="88" y="88" width="18" height="118" fill="#df6c3a" />
  <text x="136" y="126" class="eyebrow">DOCUMENTATION UPDATE · 25 AUG 2026</text>
  <text x="136" y="188" class="title">Cloudflare's Next.js deployment path changed</text>

  <rect x="96" y="272" width="548" height="278" rx="3" fill="#e7e0d4" stroke="#8e877a" stroke-width="2" />
  <text x="136" y="324" class="cardLabel">EARLIER GUIDE</text>
  <text x="136" y="390" class="cardTitle">OpenNext-centered</text>
  <text x="136" y="434" class="body">Build from Next.js output</text>
  <text x="136" y="470" class="body">and adapt it for Workers.</text>

  <line x1="682" x2="918" y1="412" y2="412" stroke="#2e2d2a" stroke-width="4" />
  <polygon points="918,412 884,392 884,432" fill="#2e2d2a" />
  <text x="703" y="376" class="arrowLabel">GUIDANCE CHANGE</text>

  <rect x="956" y="272" width="548" height="278" rx="3" fill="#242425" stroke="#242425" stroke-width="2" />
  <text x="996" y="324" class="cardLabelLight">CURRENT DEFAULT</text>
  <text x="996" y="390" class="cardTitleLight">vinext · beta</text>
  <text x="996" y="434" class="bodyLight">New projects start from a</text>
  <text x="996" y="470" class="bodyLight">Vite-based API reimplementation.</text>

  <rect x="96" y="610" width="1408" height="132" rx="3" fill="#fffaf0" stroke="#df6c3a" stroke-width="2" />
  <text x="136" y="660" class="bottomLabel">EXISTING OPENNEXT DEPLOYMENTS</text>
  <text x="136" y="706" class="bottomText">The documented path remains available when an existing application cannot migrate to vinext.</text>

  <line x1="96" x2="1504" y1="790" y2="790" stroke="#c9c1b3" stroke-width="1" />
  <text x="96" y="820" class="foot">Source basis: Cloudflare Workers documentation and commit 86bc28d.</text>
  <style>
    .eyebrow { font: 700 23px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 2.5px; fill: #5a554c; }
    .title { font: 700 48px Georgia, serif; fill: #20201f; }
    .cardLabel, .cardLabelLight, .bottomLabel, .arrowLabel { font: 700 20px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 1.7px; }
    .cardLabel { fill: #6b655b; }
    .cardLabelLight { fill: #df936f; }
    .arrowLabel { fill: #5a554c; font-size: 17px; }
    .cardTitle { font: 700 42px Georgia, serif; fill: #242425; }
    .cardTitleLight { font: 700 42px Georgia, serif; fill: #fffaf0; }
    .body { font: 500 25px ui-sans-serif, system-ui, sans-serif; fill: #4c4943; }
    .bodyLight { font: 500 25px ui-sans-serif, system-ui, sans-serif; fill: #f3ecdf; }
    .bottomLabel { fill: #c65226; }
    .bottomText { font: 500 25px ui-sans-serif, system-ui, sans-serif; fill: #242425; }
    .foot { font: 500 19px ui-sans-serif, system-ui, sans-serif; fill: #6b655b; }
  </style>
</svg>`;

fs.mkdirSync(path.dirname(comparisonOutput), { recursive: true });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(comparisonOutput);
await sharp(Buffer.from(guidanceSvg)).png({ compressionLevel: 9 }).toFile(guidanceOutput);
console.log(comparisonOutput);
console.log(guidanceOutput);
