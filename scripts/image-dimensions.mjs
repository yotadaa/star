const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const JPEG_START = Buffer.from([0xff, 0xd8, 0xff]);
const GIF_87 = Buffer.from("GIF87a");
const GIF_89 = Buffer.from("GIF89a");
const MAX_IMAGE_BYTES = 24 * 1024 * 1024;

function validDimensions(width, height) {
  return Number.isInteger(width) && Number.isInteger(height) && width > 0 && height > 0;
}

function jpegDimensions(bytes) {
  let offset = 2;
  const startOfFrame = new Set([
    0xc0, 0xc1, 0xc2, 0xc3,
    0xc5, 0xc6, 0xc7,
    0xc9, 0xca, 0xcb,
    0xcd, 0xce, 0xcf,
  ]);

  while (offset + 8 < bytes.length) {
    while (offset < bytes.length && bytes[offset] !== 0xff) offset += 1;
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length) break;

    const marker = bytes[offset];
    offset += 1;
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) continue;
    if (offset + 2 > bytes.length) break;

    const segmentLength = bytes.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) break;
    if (startOfFrame.has(marker) && segmentLength >= 7) {
      const height = bytes.readUInt16BE(offset + 3);
      const width = bytes.readUInt16BE(offset + 5);
      if (validDimensions(width, height)) return { width, height, format: "jpeg" };
    }
    offset += segmentLength;
  }
  throw new Error("IMAGE_DIMENSIONS_JPEG_INVALID");
}

function webpDimensions(bytes) {
  if (bytes.length < 30 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error("IMAGE_DIMENSIONS_WEBP_INVALID");
  }
  const chunk = bytes.toString("ascii", 12, 16);
  const dataOffset = 20;

  if (chunk === "VP8X") {
    const width = 1 + bytes.readUIntLE(dataOffset + 4, 3);
    const height = 1 + bytes.readUIntLE(dataOffset + 7, 3);
    if (validDimensions(width, height)) return { width, height, format: "webp" };
  }
  if (chunk === "VP8 ") {
    if (bytes[dataOffset + 3] !== 0x9d || bytes[dataOffset + 4] !== 0x01 || bytes[dataOffset + 5] !== 0x2a) {
      throw new Error("IMAGE_DIMENSIONS_WEBP_VP8_INVALID");
    }
    const width = bytes.readUInt16LE(dataOffset + 6) & 0x3fff;
    const height = bytes.readUInt16LE(dataOffset + 8) & 0x3fff;
    if (validDimensions(width, height)) return { width, height, format: "webp" };
  }
  if (chunk === "VP8L") {
    if (bytes[dataOffset] !== 0x2f) throw new Error("IMAGE_DIMENSIONS_WEBP_VP8L_INVALID");
    const bits = bytes.readUInt32LE(dataOffset + 1);
    const width = 1 + (bits & 0x3fff);
    const height = 1 + ((bits >>> 14) & 0x3fff);
    if (validDimensions(width, height)) return { width, height, format: "webp" };
  }
  throw new Error(`IMAGE_DIMENSIONS_WEBP_CHUNK_UNSUPPORTED:${chunk}`);
}

export function readImageDimensions(value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error("IMAGE_DIMENSIONS_FILE_TOO_LARGE");

  if (bytes.length >= 24 && bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    const width = bytes.readUInt32BE(16);
    const height = bytes.readUInt32BE(20);
    if (validDimensions(width, height)) return { width, height, format: "png" };
    throw new Error("IMAGE_DIMENSIONS_PNG_INVALID");
  }
  if (bytes.length >= 10 && bytes.subarray(0, 3).equals(JPEG_START)) {
    return jpegDimensions(bytes);
  }
  if (
    bytes.length >= 10
    && (bytes.subarray(0, 6).equals(GIF_87) || bytes.subarray(0, 6).equals(GIF_89))
  ) {
    const width = bytes.readUInt16LE(6);
    const height = bytes.readUInt16LE(8);
    if (validDimensions(width, height)) return { width, height, format: "gif" };
    throw new Error("IMAGE_DIMENSIONS_GIF_INVALID");
  }
  if (bytes.length >= 30 && bytes.toString("ascii", 8, 12) === "WEBP") {
    return webpDimensions(bytes);
  }
  throw new Error("IMAGE_DIMENSIONS_FORMAT_UNSUPPORTED");
}

export async function fetchImageDimensions(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "star-blog-seo-data-audit/1.0" },
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`IMAGE_FETCH_FAILED:${response.status}`);
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_IMAGE_BYTES) throw new Error("IMAGE_FETCH_TOO_LARGE");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error("IMAGE_FETCH_TOO_LARGE");
  return readImageDimensions(bytes);
}
