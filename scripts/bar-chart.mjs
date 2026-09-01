// Deterministic two-panel bar chart from a checked data file -> standalone HTML.
// Usage: node scripts/bar-chart.mjs <data.json> > chart.html
// Axes start at zero; every bar keeps its own value label, unit and rank.
// ponytail: fixed 2-panel layout, no scaling/legend logic — the only chart this package needs.
import { readFileSync } from "node:fs";

const d = JSON.parse(readFileSync(process.argv[2], "utf8"));
const esc = (s) => String(s).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]);

const panel = (p) => {
  const max = Math.max(...p.bars.map((b) => b.value));
  const rows = p.bars
    .map((b) => {
      const w = (b.value / max) * 100;
      return `<div class="row"><div class="lab">${esc(b.label)}</div>
<div class="track"><div class="bar${b.highlight ? " hi" : ""}" style="width:${w.toFixed(2)}%"></div>
<span class="val">${b.value}</span></div></div>`;
    })
    .join("\n");
  return `<section><h2>${esc(p.title)}</h2>
<p class="unit">${esc(p.unit)} · GLM-5.3-Flash ranked ${esc(p.rank)}</p>
${rows}
<p class="axis"><span>0</span><span>${max}</span></p></section>`;
};

process.stdout.write(`<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box}body{margin:0;padding:38px 44px;width:1200px;background:#fbfaf7;
font:16px/1.45 "DejaVu Sans",system-ui,sans-serif;color:#1d1c19}
h1{font-size:23px;margin:0 0 4px}h2{font-size:17px;margin:0 0 2px}
.sub{margin:0 0 30px;color:#5d5a52;font-size:14px}
section{margin-bottom:34px}.unit{margin:0 0 14px;color:#5d5a52;font-size:13px}
.row{display:flex;align-items:center;margin-bottom:10px}
.lab{width:230px;font-size:14px;padding-right:14px;text-align:right;color:#3a382f}
.track{flex:1;display:flex;align-items:center;border-left:2px solid #1d1c19}
.bar{height:26px;background:#b9b3a2}.bar.hi{background:#3f5c46}
.val{margin-left:12px;font-size:14px;font-variant-numeric:tabular-nums}
.axis{display:flex;justify-content:space-between;margin:6px 0 0 232px;
color:#5d5a52;font-size:12px;border-top:1px solid #cdc8bb;padding-top:3px}
footer{margin:0;color:#5d5a52;font-size:12px;border-top:1px solid #cdc8bb;padding-top:12px}
</style>
<h1>GLM-5.3-Flash: independently measured intelligence and speed</h1>
<p class="sub">Bars start at zero. Each panel compares the model with the median of the
same ${d.source.comparisonSet}-model comparison set.</p>
${d.panels.map(panel).join("\n")}
<footer>Measured by ${esc(d.source.owner)}, ${esc(d.source.indexVersion)}.
Accessed ${esc(d.source.accessed)}. ${esc(d.source.url)}</footer>`);
