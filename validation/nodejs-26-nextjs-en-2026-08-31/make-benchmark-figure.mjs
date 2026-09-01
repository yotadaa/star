import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const packageDir = import.meta.dirname;
const report = JSON.parse(fs.readFileSync(path.join(packageDir, "benchmark/results.json"), "utf8"));
const [node24, node26] = report.results;
const esc = (value) => String(value).replace(/[&<>]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character]);
const metrics = [
  { label: "Clean Next.js build", unit: "seconds", values: [node24.build.elapsedMs / 1000, node26.build.elapsedMs / 1000], digits: 2 },
  { label: "First local HTTP 200", unit: "seconds", values: [node24.server.startupMs / 1000, node26.server.startupMs / 1000], digits: 3 },
  { label: "Server RSS snapshot", unit: "MiB", values: [node24.server.rssKiB / 1024, node26.server.rssKiB / 1024], digits: 1 },
];

const metricPanels = metrics.map((metric, index) => {
  const y = 250 + index * 180;
  const max = Math.max(...metric.values) * 1.15;
  const bars = metric.values.map((value, valueIndex) => {
    const width = Math.max(4, Math.round((value / max) * 820));
    const barY = y + 45 + valueIndex * 50;
    const fill = valueIndex === 0 ? "#315f59" : "#ad5b3e";
    const label = valueIndex === 0 ? "Node 24.20.0 LTS" : "Node 26.7.0 Current";
    return `<text x="84" y="${barY + 22}" class="runtime">${label}</text><rect x="360" y="${barY}" width="${width}" height="30" rx="3" fill="${fill}"/><text x="${380 + width}" y="${barY + 22}" class="value">${value.toFixed(metric.digits)} ${metric.unit}</text>`;
  }).join("");
  return `<g><text x="84" y="${y}" class="metric">${esc(metric.label)}</text>${bars}</g>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" fill="#f2eee4"/>
  <rect x="42" y="42" width="1516" height="816" rx="10" fill="#fbf8f0" stroke="#252621" stroke-width="3"/>
  <text x="84" y="112" class="title">One project, two Node runtimes</text>
  <text x="84" y="158" class="subtitle">Next.js ${esc(report.project.next)} · React ${esc(report.project.react)} · Convex ${esc(report.project.convex)} · Linux x64</text>
  <text x="84" y="199" class="note">Both clean builds exited 0. Both production servers returned HTTP 200.</text>
  ${metricPanels}
  <line x1="84" y1="806" x2="1516" y2="806" stroke="#b9b09f"/>
  <text x="84" y="837" class="foot">One run per runtime. Times and RSS describe this machine only; they are not a stable speed ranking.</text>
  <style>
    .title{font:700 42px Georgia,serif;fill:#20211d}.subtitle{font:22px Arial,sans-serif;fill:#55554c}.note{font:700 22px Arial,sans-serif;fill:#20211d}.metric{font:700 25px Arial,sans-serif;fill:#20211d}.runtime{font:20px Arial,sans-serif;fill:#494a43}.value{font:700 20px Arial,sans-serif;fill:#20211d}.foot{font:18px Arial,sans-serif;fill:#55554c}
  </style>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(path.join(packageDir, "assets/node24-node26-compatibility-probe.png"));
console.log("assets/node24-node26-compatibility-probe.png");
