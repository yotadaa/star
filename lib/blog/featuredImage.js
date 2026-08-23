export function isRenderableBlogImageSource(value) {
  const source = String(value || "").trim();
  return (source.startsWith("/") && !source.startsWith("//")) || source.startsWith("https://");
}

function normalizedImage(candidate, fallbackAlt = "") {
  if (!candidate) return null;
  const image = typeof candidate === "string" ? { src: candidate } : candidate;
  const src = String(image.src || image.url || "").trim();
  if (!isRenderableBlogImageSource(src)) return null;

  return {
    src,
    alt: String(image.alt || image.text || fallbackAlt || "").trim(),
  };
}

export function getBlogFeaturedImage(post = {}) {
  const explicitCandidates = [
    post.featuredImage,
    post.featured_image,
    post.coverImage,
    post.cover_image,
  ];

  for (const candidate of explicitCandidates) {
    const image = normalizedImage(candidate, post.title);
    if (image) return image;
  }

  for (const block of Array.isArray(post.blocks) ? post.blocks : []) {
    if (block?.type === "image") {
      const image = normalizedImage(block, post.title);
      if (image) return image;
    }

    if (block?.type === "image-carousel") {
      for (const candidate of Array.isArray(block.images) ? block.images : []) {
        const image = normalizedImage(candidate, post.title);
        if (image) return image;
      }
    }
  }

  return null;
}
