import sharp from 'sharp';

// Offline extraction only. Some generated edits contain a pale neutral matte
// instead of alpha. Keep the largest physical object and remove that matte;
// never run this against an asset unless its source manifest opts in.
export async function prepareAlpha(input, { matte, alphaScale = 1 }) {
  if (!matte && alphaScale === 1) return input;
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const count = info.width * info.height;
  for (let pixel = 0; pixel < count; pixel++) {
    const i = pixel * 4;
    if (matte) {
      const lo = Math.min(data[i], data[i + 1], data[i + 2]);
      const hi = Math.max(data[i], data[i + 1], data[i + 2]);
      const coverage = hi - lo <= matte.chroma ? Math.max(0, Math.min(1, (matte.high - lo) / (matte.high - matte.low))) : 1;
      if (coverage > 0 && coverage < 1) {
        for (let channel = 0; channel < 3; channel++) data[i + channel] = Math.max(0, Math.min(255, (data[i + channel] - (1 - coverage) * matte.background) / coverage));
      }
      data[i + 3] = Math.round(data[i + 3] * coverage);
    }
  }
  if (matte) {
    const labels = new Int32Array(count);
    const queue = new Int32Array(count);
    let component = 0, largest = 0, largestSize = 0;
    for (let start = 0; start < count; start++) {
      if (labels[start] || data[start * 4 + 3] === 0) continue;
      component++;
      let read = 0, size = 1;
      queue[0] = start; labels[start] = component;
      while (read < size) {
        const current = queue[read++];
        const x = current % info.width;
        for (const neighbor of [x > 0 ? current - 1 : -1, x + 1 < info.width ? current + 1 : -1, current - info.width, current + info.width]) {
          if (neighbor < 0 || neighbor >= count || labels[neighbor] || data[neighbor * 4 + 3] === 0) continue;
          labels[neighbor] = component; queue[size++] = neighbor;
        }
      }
      if (size > largestSize) { largest = component; largestSize = size; }
    }
    if (largestSize < count * .1) throw new Error('Matte extraction lost the main object');
    for (let pixel = 0; pixel < count; pixel++) if (labels[pixel] !== largest) data[pixel * 4 + 3] = 0;
  }
  for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * alphaScale);
  return sharp(data, { raw: info }).png().toBuffer();
}
