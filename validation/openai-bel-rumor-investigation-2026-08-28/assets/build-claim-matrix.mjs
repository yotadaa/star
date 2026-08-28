import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(await fs.readFile(path.join(here, "claim-matrix-data.json"), "utf8"));

const escapeXml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const verdictStyle = {
  VERIFIED: { fill: "#DDE7DB", text: "#27432B", stroke: "#91A98F" },
  CLAIMED: { fill: "#EFE3C7", text: "#624B19", stroke: "#B49A62" },
  UNKNOWN: { fill: "#E1E3E6", text: "#3F444B", stroke: "#A3A7AD" },
  "NOT CHECKABLE": { fill: "#E1E3E6", text: "#3F444B", stroke: "#A3A7AD" },
  UNSUPPORTED: { fill: "#EAD8D3", text: "#6C2C24", stroke: "#B77A6F" }
};

const width = 1600;
const height = 1080;
const left = 92;
const top = 218;
const rowHeight = 96;

const rows = data.rows.map((row, index) => {
  const y = top + index * rowHeight;
  const style = verdictStyle[row.verdict];
  const pillWidth = Math.max(142, row.verdict.length * 12 + 42);
  return `
    <g transform="translate(0 ${y})">
      <line x1="${left}" y1="0" x2="1508" y2="0" stroke="#CFC8BB" stroke-width="1" />
      <text x="${left}" y="31" class="claim">${escapeXml(row.claim)}</text>
      <rect x="${left}" y="46" rx="17" ry="17" width="${pillWidth}" height="34" fill="${style.fill}" stroke="${style.stroke}" />
      <text x="${left + 18}" y="69" class="verdict" fill="${style.text}">${escapeXml(row.verdict)}</text>
      <text x="390" y="67" class="detail">${escapeXml(row.detail)}</text>
    </g>`;
}).join("");

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="1600" height="1080" fill="#F3EFE7" />
  <rect x="40" y="40" width="1520" height="1000" rx="10" fill="#F8F5EE" stroke="#BBB2A2" stroke-width="2" />
  <circle cx="66" cy="96" r="10" fill="#A94B3F" />
  <text x="92" y="128" class="title">${escapeXml(data.title)}</text>
  <text x="92" y="168" class="subtitle">${escapeXml(data.subtitle)}</text>
  <text x="1508" y="168" text-anchor="end" class="date">${escapeXml(data.checked)}</text>
  ${rows}
  <line x1="92" y1="986" x2="1508" y2="986" stroke="#CFC8BB" stroke-width="1" />
  <text x="92" y="1020" class="footer">${escapeXml(data.sourceLine)}</text>
  <style>
    .title { font-family: Inter, Arial, sans-serif; font-size: 48px; font-weight: 700; fill: #252321; }
    .subtitle { font-family: Inter, Arial, sans-serif; font-size: 24px; fill: #625E57; }
    .date { font-family: Inter, Arial, sans-serif; font-size: 18px; fill: #7B756C; }
    .claim { font-family: Inter, Arial, sans-serif; font-size: 24px; font-weight: 650; fill: #252321; }
    .verdict { font-family: Inter, Arial, sans-serif; font-size: 17px; font-weight: 750; letter-spacing: 1.2px; }
    .detail { font-family: Inter, Arial, sans-serif; font-size: 20px; fill: #4C4944; }
    .footer { font-family: Inter, Arial, sans-serif; font-size: 17px; fill: #6B655D; }
  </style>
</svg>`;

await fs.writeFile(path.join(here, "claim-status-matrix.svg"), svg);
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(here, "claim-status-matrix.png"));

const metadata = await sharp(path.join(here, "claim-status-matrix.png")).metadata();
console.log(JSON.stringify({ width: metadata.width, height: metadata.height, format: metadata.format }, null, 2));
