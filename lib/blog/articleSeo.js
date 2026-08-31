import { profile } from "@/lib/data";
import { getBlogFeaturedImage } from "@/lib/blog/featuredImage";
import {
  absoluteUrl,
  DEFAULT_LANGUAGE,
  SITE_URL,
} from "@/lib/seo";

export function toIsoDate(value) {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number" && (!Number.isFinite(value) || value <= 0)) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) || date.getTime() <= 0
    ? undefined
    : date.toISOString();
}

export function formatArticleDate(value, language = DEFAULT_LANGUAGE) {
  const isoDate = toIsoDate(value);
  if (!isoDate) return null;

  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(isoDate));
}

export function buildBlogArticleSeo(post = {}) {
  const path = `/blog/${encodeURIComponent(String(post.slug || ""))}`;
  const url = absoluteUrl(path);
  const publishedTime = toIsoDate(post.datePublished ?? post.publishedAt);
  const modifiedCandidate = toIsoDate(post.dateModified ?? post.updatedAt);
  const modifiedTime = modifiedCandidate
    && (!publishedTime || Date.parse(modifiedCandidate) >= Date.parse(publishedTime))
    ? modifiedCandidate
    : undefined;
  const tags = Array.isArray(post.tags)
    ? post.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
    : [];
  const section = String(post.articleSection || post.category || "").trim() || undefined;
  const language = String(post.language || DEFAULT_LANGUAGE).trim() || DEFAULT_LANGUAGE;
  const seoTitle = String(post.seoTitle || post.title || "").trim();
  const seoDescription = String(post.seoDescription || post.excerpt || "").trim();
  const featuredImage = getBlogFeaturedImage(post);
  const image = featuredImage
    ? {
        url: absoluteUrl(featuredImage.src),
        alt: featuredImage.alt || String(post.title || "Article image"),
        ...(featuredImage.width ? { width: featuredImage.width } : {}),
        ...(featuredImage.height ? { height: featuredImage.height } : {}),
      }
    : undefined;
  const authorUrl = absoluteUrl(post.author?.url || "/");
  const personId = String(post.author?.id || `${authorUrl.replace(/\/$/, "")}/#person`).trim();
  const author = {
    "@type": "Person",
    "@id": personId,
    name: String(post.author?.name || profile.name).trim(),
    url: authorUrl,
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#blog-posting`,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline: String(post.title || "").trim(),
    description: seoDescription,
    inLanguage: language,
    author,
    publisher: author,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    ...(publishedTime ? { datePublished: publishedTime } : {}),
    ...(modifiedTime ? { dateModified: modifiedTime } : {}),
    ...(image
      ? {
          image: {
            "@type": "ImageObject",
            url: image.url,
            caption: image.alt,
            ...(image.width ? { width: image.width } : {}),
            ...(image.height ? { height: image.height } : {}),
          },
        }
      : {}),
    ...(tags.length ? { keywords: tags.join(", ") } : {}),
    ...(section ? { articleSection: section } : {}),
  };

  return {
    path,
    url,
    publishedTime,
    modifiedTime,
    tags,
    section,
    image,
    language,
    seoTitle,
    seoDescription,
    authorName: author.name,
    authorUrl,
    structuredData,
  };
}

export function serializeStructuredData(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
