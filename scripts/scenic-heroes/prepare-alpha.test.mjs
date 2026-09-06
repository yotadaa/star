import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { prepareAlpha } from './prepare-alpha.mjs';

test('existing alpha assets bypass optional preparation byte-for-byte', async () => {
  const source = await sharp({ create: { width: 4, height: 4, channels: 4, background: { r: 30, g: 40, b: 50, alpha: .5 } } }).png().toBuffer();
  assert.equal(await prepareAlpha(source, {}), source);
});

test('light matte is removed while the connected dark object and colored lamp survive', async () => {
  const pixels = Buffer.alloc(10 * 10 * 3, 238);
  for (let y = 3; y < 8; y++) for (let x = 3; x < 8; x++) pixels.set([40, 50, 60], (y * 10 + x) * 3);
  pixels.set([240, 90, 65], (5 * 10 + 5) * 3);
  pixels.set([40, 40, 40], 0); // Disconnected matte artifact.
  const source = await sharp(pixels, { raw: { width: 10, height: 10, channels: 3 } }).png().toBuffer();
  const output = await prepareAlpha(source, { matte: { low: 170, high: 210, chroma: 22, background: 238 } });
  const data = await sharp(output).raw().toBuffer();
  assert.equal(data[3], 0);
  assert.equal(data[(2 * 10 + 2) * 4 + 3], 0);
  assert.deepEqual([...data.subarray((4 * 10 + 4) * 4, (4 * 10 + 4) * 4 + 4)], [40, 50, 60, 255]);
  assert.deepEqual([...data.subarray((5 * 10 + 5) * 4, (5 * 10 + 5) * 4 + 4)], [240, 90, 65, 255]);
});

test('vapor alpha scaling retains color and real translucency', async () => {
  const source = await sharp({ create: { width: 4, height: 4, channels: 4, background: { r: 30, g: 40, b: 50, alpha: 1 } } }).png().toBuffer();
  const output = await prepareAlpha(source, { alphaScale: .4 });
  assert.deepEqual([...(await sharp(output).raw().toBuffer()).subarray(0, 4)], [30, 40, 50, 102]);
});
