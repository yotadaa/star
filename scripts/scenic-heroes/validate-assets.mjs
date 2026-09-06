import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const requested = process.argv.slice(2);
const pages = requested.length ? requested : await readdir('docs/plans/scenic-heroes/assets');
for (const page of pages) {
 const manifest = JSON.parse(await readFile(`docs/plans/scenic-heroes/assets/${page}/manifest.json`));
 for (const asset of manifest.assets) {
  const buffer = await readFile(`public${asset.src}`);
  const m = await sharp(buffer).metadata();
  assert.equal(createHash('sha256').update(buffer).digest('hex'), asset.sha256, `${asset.id} checksum`);
  assert.equal(buffer.length, asset.bytes);
  assert.equal(m.width, asset.width); assert.equal(m.height, asset.height);
  assert.equal(!!m.hasAlpha, asset.alpha);
 }
 const objects = manifest.assets.filter(a => a.alpha);
 for (const [viewport, width, budget] of [['mobile',768,750000],['desktop',1536,1500000]]) {
  const selected = [...objects, ...manifest.assets.filter(a => !a.alpha && a.id.endsWith(`-${width}`))];
  const bytes = selected.reduce((s,a) => s+a.bytes,0), pixels = selected.reduce((s,a)=>s+a.width*a.height,0);
  assert.ok(bytes <= budget, `${page} ${viewport} ${bytes} exceeds transfer budget`);
  assert.ok(pixels <= 8000000, `${page} decoded budget`);
  assert.ok(selected.length <= 8, `${page} requests`);
  console.log(JSON.stringify({ page, viewport, bytes, decodedPixels:pixels, requests:selected.length }));
 }
}
