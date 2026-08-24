const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const MAX_EDGE = 2560;
const WEBP_QUALITY = 0.9;

export function formatImageBytes(value) {
  const bytes = Number(value || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function outputName(name) {
  const base = String(name || "blog-image").replace(/\.[^.]+$/, "") || "blog-image";
  return `${base}.webp`;
}

function canvasBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressBlogImage(file) {
  if (!file || !ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Use a JPEG, PNG, or WebP image.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("The original image exceeds the 20 MB limit.");
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return {
      file,
      compressed: false,
      originalBytes: file.size,
      outputBytes: file.size,
      originalWidth: null,
      originalHeight: null,
      width: null,
      height: null,
      reason: "The browser kept the original because the image could not be decoded again.",
    };
  }

  try {
    const originalWidth = bitmap.width;
    const originalHeight = bitmap.height;
    const scale = Math.min(1, MAX_EDGE / Math.max(originalWidth, originalHeight));
    const width = Math.max(1, Math.round(originalWidth * scale));
    const height = Math.max(1, Math.round(originalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("The browser canvas is unavailable.");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await canvasBlob(canvas, "image/webp", WEBP_QUALITY);
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) {
      return {
        file,
        compressed: false,
        originalBytes: file.size,
        outputBytes: file.size,
        originalWidth,
        originalHeight,
        width: originalWidth,
        height: originalHeight,
        reason: "The original file was already more efficient, so its quality and size were preserved.",
      };
    }

    return {
      file: new File([blob], outputName(file.name), { type: "image/webp", lastModified: Date.now() }),
      compressed: true,
      originalBytes: file.size,
      outputBytes: blob.size,
      originalWidth,
      originalHeight,
      width,
      height,
      reason: scale < 1 ? `The longest edge was limited to ${MAX_EDGE}px.` : "The original dimensions were preserved.",
    };
  } finally {
    bitmap.close();
  }
}
