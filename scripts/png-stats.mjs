// Objective "is this screenshot blank?" check for the evidence package.
// Decodes PNG with node:zlib (no deps) and reports ink coverage + contrast.
// Usage: node scripts/png-stats.mjs <file.png>...   exit 1 if any looks blank.
// ponytail: handles 8-bit non-interlaced RGB/RGBA only — that is what Playwright emits.
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const BLANK = { ink: 0.01, sd: 5 }; // below both => blank/unreadable

function decode(file) {
  const b = readFileSync(file);
  if (b.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  const depth = b[24], color = b[25], interlace = b[28];
  if (depth !== 8 || interlace !== 0 || (color !== 2 && color !== 6))
    throw new Error(`unsupported PNG: depth=${depth} color=${color} interlace=${interlace}`);
  const bpp = color === 6 ? 4 : 3;
  const idat = [];
  for (let p = 8; p < b.length; ) {
    const len = b.readUInt32BE(p), type = b.toString("ascii", p + 4, p + 8);
    if (type === "IDAT") idat.push(b.subarray(p + 8, p + 8 + len));
    p += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const prev = Buffer.alloc(stride), cur = Buffer.alloc(stride);
  let ink = 0, n = 0, sum = 0, sumSq = 0;
  for (let y = 0, o = 0; y < h; y++) {
    const filter = raw[o++];
    raw.copy(cur, 0, o, o + stride); o += stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, up = prev[i], ul = i >= bpp ? prev[i - bpp] : 0;
      if (filter === 1) cur[i] = (cur[i] + a) & 255;
      else if (filter === 2) cur[i] = (cur[i] + up) & 255;
      else if (filter === 3) cur[i] = (cur[i] + ((a + up) >> 1)) & 255;
      else if (filter === 4) {
        const p0 = a + up - ul, pa = Math.abs(p0 - a), pb = Math.abs(p0 - up), pc = Math.abs(p0 - ul);
        cur[i] = (cur[i] + (pa <= pb && pa <= pc ? a : pb <= pc ? up : ul)) & 255;
      }
    }
    for (let x = 0; x < stride; x += bpp) {
      const r = cur[x], g = cur[x + 1], bl = cur[x + 2];
      if (Math.min(r, g, bl) < 250) ink++;
      const l = 0.299 * r + 0.587 * g + 0.114 * bl;
      sum += l; sumSq += l * l; n++;
    }
    cur.copy(prev);
  }
  const mean = sum / n;
  return { w, h, bytes: b.length, ink: ink / n, sd: Math.sqrt(Math.max(0, sumSq / n - mean * mean)) };
}

let bad = 0;
for (const f of process.argv.slice(2)) {
  try {
    const s = decode(f);
    const blank = s.ink < BLANK.ink && s.sd < BLANK.sd;
    if (blank) bad++;
    console.log(
      `${blank ? "BLANK  " : "ok     "} ${f.split("/").pop()} ${s.w}x${s.h} ` +
      `${(s.bytes / 1024).toFixed(0)}KB ink=${(s.ink * 100).toFixed(1)}% sd=${s.sd.toFixed(1)}`,
    );
  } catch (e) { bad++; console.log(`ERROR   ${f.split("/").pop()} ${e.message}`); }
}
process.exit(bad ? 1 : 0);
