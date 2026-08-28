import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation, internalQuery, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { r2PublicUrl } from "./r2PublicUrl";
import { actorSnapshot, blogInput, publicBlogPost, publicBlogPostSummary } from "./validators";

const BLOG_SCHEMA_VERSION = 2;
const DEFAULT_LANGUAGE = "en-US";
const DEFAULT_AUTHOR = {
  id: "https://me.mukhtada.my.id/#person",
  name: "Mukhtada Billah NST",
  url: "https://me.mukhtada.my.id/",
};

function cleanText(value: string | undefined, fallback = "") {
  return String(value ?? fallback).trim();
}

function cleanSlug(value: string | undefined, fallback = "untitled") {
  const slug = cleanText(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function cleanTags(value: string[] | undefined) {
  return (value ?? []).map((tag) => cleanText(tag)).filter(Boolean).slice(0, 12);
}

function cleanOptionalText(value: string | undefined, maxLength: number) {
  const cleaned = cleanText(value).slice(0, maxLength);
  return cleaned || undefined;
}

function cleanDimension(value: number | undefined) {
  return Number.isFinite(value) && Number(value) > 0
    ? Math.floor(Number(value))
    : undefined;
}

function cleanLanguage(value: string | undefined, fallback = DEFAULT_LANGUAGE) {
  const language = cleanText(value, fallback);
  if (!/^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(language)) {
    throw new Error("BLOG_LANGUAGE_INVALID");
  }
  return language;
}

function cleanHttpUrl(value: string, code: string) {
  try {
    const url = new URL(cleanText(value));
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error(code);
    return url.toString();
  } catch {
    throw new Error(code);
  }
}

function cleanAuthor(
  value: Doc<"blogPosts">["author"] | undefined,
  fallback: Doc<"blogPosts">["author"] = DEFAULT_AUTHOR,
) {
  if (!value) return fallback;
  const id = cleanText(value.id).slice(0, 256);
  const name = cleanText(value.name).slice(0, 120);
  if (!id || !name) throw new Error("BLOG_AUTHOR_INVALID");
  return {
    id,
    name,
    url: cleanHttpUrl(value.url, "BLOG_AUTHOR_URL_INVALID"),
  };
}

function cleanFeaturedImage(value: Doc<"blogPosts">["featuredImage"] | undefined) {
  if (!value) return undefined;
  const width = cleanDimension(value.width);
  const height = cleanDimension(value.height);
  const alt = cleanText(value.alt).slice(0, 320);
  if (!width || !height || !alt) throw new Error("BLOG_FEATURED_IMAGE_INVALID");

  const cleaned = { ...value, width, height, alt };
  if (cleaned.assetKey) {
    delete cleaned.storageId;
    delete cleaned.src;
  } else if (cleaned.storageId) {
    delete cleaned.src;
  }
  if (!cleaned.storageId && !cleanText(cleaned.assetKey) && !cleanText(cleaned.src)) {
    throw new Error("BLOG_FEATURED_IMAGE_SOURCE_MISSING");
  }
  if (cleaned.assetKey) cleaned.assetKey = cleanText(cleaned.assetKey).slice(0, 240);
  if (cleaned.src) {
    const source = cleanText(cleaned.src);
    cleaned.src = source.startsWith("/") && !source.startsWith("//")
      ? source
      : cleanHttpUrl(source, "BLOG_FEATURED_IMAGE_URL_INVALID");
  }
  return cleaned;
}

function parsePublishedAt(value: string | undefined, fallback: number) {
  if (value === undefined) return fallback;
  const timestamp = Date.parse(cleanText(value));
  if (!Number.isFinite(timestamp) || timestamp <= 0) throw new Error("BLOG_PUBLISHED_AT_INVALID");
  return timestamp;
}

function cleanBlocks(blocks: Doc<"blogPosts">["blocks"] | undefined) {
  return (blocks ?? []).map((block) => {
    const stored = { ...block };
    const width = cleanDimension(block.width);
    const height = cleanDimension(block.height);
    if (width && height) {
      stored.width = width;
      stored.height = height;
    } else {
      delete stored.width;
      delete stored.height;
    }
    if (block.assetKey) {
      delete stored.storageId;
      delete stored.src;
    } else if (block.storageId) {
      delete stored.src;
    }
    return stored;
  });
}

function featuredImageFromBlocks(blocks: Doc<"blogPosts">["blocks"]) {
  const block = blocks.find((item) => item.type === "image" && item.width && item.height);
  if (!block) return undefined;
  return cleanFeaturedImage({
    ...(block.assetKey ? { assetKey: block.assetKey } : {}),
    ...(!block.assetKey && block.storageId ? { storageId: block.storageId } : {}),
    ...(!block.storageId && !block.assetKey && block.src ? { src: block.src } : {}),
    alt: cleanText(block.alt || block.text, "Article image"),
    width: block.width as number,
    height: block.height as number,
  });
}

function imageIdentity(image: {
  storageId?: Id<"_storage">;
  assetKey?: string;
  src?: string;
}) {
  return String(image.assetKey || image.storageId || image.src || "").trim();
}

function assertPublishable(value: {
  status: Doc<"blogPosts">["status"];
  title: string;
  excerpt: string;
  tags: string[];
  publishedAt?: number;
  seoTitle?: string;
  seoDescription?: string;
  language?: string;
  author?: Doc<"blogPosts">["author"];
  articleSection?: string;
  featuredImage?: Doc<"blogPosts">["featuredImage"];
  blocks: Doc<"blogPosts">["blocks"];
}) {
  if (value.status !== "published") return;
  if (!value.title || !value.excerpt || !value.tags.length || !value.publishedAt) {
    throw new Error("BLOG_PUBLISH_CONTENT_INCOMPLETE");
  }
  if (
    !value.seoTitle
    || !value.seoDescription
    || !value.language
    || !value.author?.id
    || !value.author?.name
    || !value.author?.url
    || !value.articleSection
  ) {
    throw new Error("BLOG_PUBLISH_SEO_INCOMPLETE");
  }
  const featuredIdentity = value.featuredImage ? imageIdentity(value.featuredImage) : "";
  const featuredBlock = value.blocks.find((block) => (
    block.type === "image"
    && imageIdentity(block) === featuredIdentity
    && block.width === value.featuredImage?.width
    && block.height === value.featuredImage?.height
    && cleanText(block.alt || block.text) === value.featuredImage?.alt
  ));
  if (!featuredIdentity || !featuredBlock) throw new Error("BLOG_PUBLISH_FEATURED_IMAGE_INVALID");
}

async function resolveImage<T extends {
  storageId?: Id<"_storage">;
  assetKey?: string;
  src?: string;
}>(
  ctx: QueryCtx | MutationCtx,
  image: T | undefined,
): Promise<T | undefined> {
  if (!image) return undefined;
  const resolved = { ...image } as T;
  if (image.storageId || image.assetKey) delete resolved.src;

  let file = image.assetKey
    ? await ctx.db
      .query("files")
      .withIndex("by_sourceKey", (q) => q.eq("sourceKey", image.assetKey))
      .unique()
    : null;
  if (!file && image.storageId) {
    file = await ctx.db
      .query("files")
      .withIndex("by_storageId", (q) => q.eq("storageId", image.storageId))
      .unique();
  }

  if (file?.storageProvider === "r2" && file.r2Key && file.r2VerifiedAt) {
    if (file.sourceKey) resolved.assetKey = file.sourceKey;
    delete resolved.storageId;
    resolved.src = r2PublicUrl(file.r2Key);
    return resolved;
  }

  const storageId = file?.storageId ?? image.storageId;
  const url = storageId ? await ctx.storage.getUrl(storageId) : null;
  if (storageId) resolved.storageId = storageId;
  if (url) resolved.src = url;
  return resolved;
}

async function canonicalR2Image<T extends {
  storageId?: Id<"_storage">;
  assetKey?: string;
  src?: string;
}>(ctx: MutationCtx, image: T): Promise<T> {
  let file = image.assetKey
    ? await ctx.db
        .query("files")
        .withIndex("by_sourceKey", (q) => q.eq("sourceKey", image.assetKey))
        .unique()
    : null;
  if (!file && image.storageId) {
    file = await ctx.db
      .query("files")
      .withIndex("by_storageId", (q) => q.eq("storageId", image.storageId))
      .unique();
  }
  if (!file?.sourceKey || file.storageProvider !== "r2" || !file.r2Key || !file.r2VerifiedAt) {
    throw new Error(`BLOG_R2_ASSET_UNRESOLVED:${image.assetKey || image.storageId || "missing"}`);
  }
  const canonical = { ...image, assetKey: file.sourceKey } as T;
  delete canonical.storageId;
  delete canonical.src;
  return canonical;
}

export const rewriteR2ImageReferences = internalMutation({
  args: {},
  returns: v.object({ postsUpdated: v.number(), imageReferencesRewritten: v.number() }),
  handler: async (ctx) => {
    const posts = await ctx.db.query("blogPosts").take(501);
    if (posts.length > 500) throw new Error("BLOG_R2_REWRITE_LIMIT_EXCEEDED");
    let postsUpdated = 0;
    let imageReferencesRewritten = 0;
    for (const post of posts) {
      let changed = false;
      const blocks = await Promise.all(post.blocks.map(async (block) => {
        if (block.type !== "image" || (!block.assetKey && !block.storageId)) return block;
        const canonical = await canonicalR2Image(ctx, block);
        const blockChanged = Boolean(block.storageId || block.src || block.assetKey !== canonical.assetKey);
        if (blockChanged) {
          changed = true;
          imageReferencesRewritten += 1;
        }
        return canonical;
      }));
      const featuredImage = post.featuredImage?.assetKey || post.featuredImage?.storageId
        ? await canonicalR2Image(ctx, post.featuredImage)
        : post.featuredImage;
      if (
        post.featuredImage
        && (post.featuredImage.assetKey || post.featuredImage.storageId)
        && (post.featuredImage.storageId || post.featuredImage.src || post.featuredImage.assetKey !== featuredImage?.assetKey)
      ) {
        changed = true;
        imageReferencesRewritten += 1;
      }
      if (changed) {
        await ctx.db.patch(post._id, {
          blocks,
          ...(featuredImage ? { featuredImage } : {}),
        });
        postsUpdated += 1;
      }
    }
    return { postsUpdated, imageReferencesRewritten };
  },
});

async function resolveBlocks(
  ctx: QueryCtx | MutationCtx,
  blocks: Doc<"blogPosts">["blocks"],
) {
  return await Promise.all(
    blocks.map(async (block) => {
      if (block.type !== "image") return block;
      return (await resolveImage(ctx, block)) ?? block;
    }),
  );
}

async function publicReadingStats(ctx: QueryCtx | MutationCtx, slug: string) {
  const stats = await ctx.db
    .query("blogReadStats")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  const engagedReadCount = Math.max(0, Math.floor(stats?.engagedReadCount ?? 0));
  return {
    slug,
    viewCount: Math.max(0, Math.floor(stats?.viewCount ?? 0)),
    engagedReadCount,
    averageActiveReadMs: stats && engagedReadCount >= 5
      ? Math.max(0, Math.floor(stats.totalEngagedReadMs / engagedReadCount))
      : null,
  };
}

async function toPublic(ctx: QueryCtx | MutationCtx, post: Doc<"blogPosts">) {
  return {
    id: post._id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    status: post.status,
    tags: post.tags,
    publishedAt: post.publishedAtLabel,
    datePublished: post.publishedAt ?? null,
    dateModified: post.updatedAt,
    readTime: post.readTime,
    coverTone: post.coverTone,
    sourceHref: post.sourceHref,
    ...(post.seoTitle ? { seoTitle: post.seoTitle } : {}),
    ...(post.seoDescription ? { seoDescription: post.seoDescription } : {}),
    ...(post.language ? { language: post.language } : {}),
    ...(post.author ? { author: post.author } : {}),
    ...(post.articleSection ? { articleSection: post.articleSection } : {}),
    ...(post.featuredImage ? { featuredImage: await resolveImage(ctx, post.featuredImage) } : {}),
    blocks: await resolveBlocks(ctx, post.blocks),
    upvoteCount: Math.max(0, Math.floor(post.upvoteCount ?? 0)),
    readingStats: await publicReadingStats(ctx, post.slug),
    updatedAt: post.updatedAt,
  };
}

async function ensureUniqueSlug(
  ctx: MutationCtx,
  slug: string,
  exceptId?: Doc<"blogPosts">["_id"],
) {
  const existing = await ctx.db
    .query("blogPosts")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  if (existing && existing._id !== exceptId) {
    throw new Error("BLOG_SLUG_CONFLICT");
  }
}

export const listPublished = query({
  args: { limit: v.optional(v.number()) },
  returns: v.object({
    posts: v.array(publicBlogPost),
    source: v.literal("convex"),
    warnings: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(100, Math.floor(args.limit ?? 48)));
    const rows = await ctx.db
      .query("blogPosts")
      .withIndex("by_status_and_publishedAt", (q) => q.eq("status", "published"))
      .order("desc")
      .take(limit);
    return { posts: await Promise.all(rows.map((post) => toPublic(ctx, post))), source: "convex" as const, warnings: [] };
  },
});

export const listPublishedSummaries = query({
  args: { limit: v.optional(v.number()) },
  returns: v.object({
    posts: v.array(publicBlogPostSummary),
    source: v.literal("convex"),
    warnings: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(100, Math.floor(args.limit ?? 24)));
    const rows = await ctx.db
      .query("blogPosts")
      .withIndex("by_status_and_publishedAt", (q) => q.eq("status", "published"))
      .order("desc")
      .take(limit);

    const posts = await Promise.all(rows.map(async (post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      status: post.status,
      tags: post.tags,
      publishedAt: post.publishedAtLabel,
      datePublished: post.publishedAt ?? null,
      readTime: post.readTime,
      ...(post.featuredImage ? { featuredImage: await resolveImage(ctx, post.featuredImage) } : {}),
      upvoteCount: Math.max(0, Math.floor(post.upvoteCount ?? 0)),
      readingStats: await publicReadingStats(ctx, post.slug),
    })));

    return { posts, source: "convex" as const, warnings: [] };
  },
});

export const getPublishedBySlug = query({
  args: { slug: v.string() },
  returns: v.union(publicBlogPost, v.null()),
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", cleanSlug(args.slug)))
      .unique();
    return post?.status === "published" ? await toPublic(ctx, post) : null;
  },
});

export const listAdmin = internalQuery({
  args: { limit: v.optional(v.number()) },
  returns: v.array(publicBlogPost),
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(100, Math.floor(args.limit ?? 48)));
    const rows = await ctx.db.query("blogPosts").order("desc").take(limit);
    return await Promise.all(rows.map((post) => toPublic(ctx, post)));
  },
});

export const getAdminById = internalQuery({
  args: { id: v.id("blogPosts") },
  returns: v.union(publicBlogPost, v.null()),
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    return post ? await toPublic(ctx, post) : null;
  },
});

export const create = internalMutation({
  args: { payload: blogInput, actor: actorSnapshot },
  returns: publicBlogPost,
  handler: async (ctx, args) => {
    const now = Date.now();
    const title = cleanText(args.payload.title, "Untitled Lore Entry");
    const slug = cleanSlug(args.payload.slug || title);
    const status = args.payload.status === "published" ? "published" : "draft";
    const excerpt = cleanText(args.payload.excerpt);
    const blocks = cleanBlocks(args.payload.blocks);
    const tags = cleanTags(args.payload.tags);
    const publishedAt = status === "published"
      ? parsePublishedAt(args.payload.publishedAt, now)
      : undefined;
    const seoTitle = cleanOptionalText(args.payload.seoTitle, 70) ?? title;
    const seoDescription = cleanOptionalText(args.payload.seoDescription, 180) ?? excerpt;
    const language = cleanLanguage(args.payload.language);
    const author = cleanAuthor(args.payload.author);
    const articleSection = cleanOptionalText(args.payload.articleSection, 80) ?? "Blog";
    const featuredImage = cleanFeaturedImage(args.payload.featuredImage) ?? featuredImageFromBlocks(blocks);
    assertPublishable({
      status,
      title,
      excerpt,
      tags,
      publishedAt,
      seoTitle,
      seoDescription,
      language,
      author,
      articleSection,
      featuredImage,
      blocks,
    });
    await ensureUniqueSlug(ctx, slug);
    const id = await ctx.db.insert("blogPosts", {
      slug,
      title,
      excerpt,
      status,
      tags,
      publishedAt,
      publishedAtLabel: publishedAt ? new Date(publishedAt).toISOString() : "Draft",
      readTime: cleanText(args.payload.readTime || args.payload.read_time, "4 min read"),
      coverTone: cleanText(args.payload.coverTone || args.payload.cover_tone, "research"),
      sourceHref: cleanText(args.payload.sourceHref || args.payload.source_href, "/blog"),
      seoTitle,
      seoDescription,
      language,
      author,
      articleSection,
      featuredImage,
      blocks,
      ownerKey: args.actor.key,
      createdAt: now,
      updatedAt: now,
      schemaVersion: BLOG_SCHEMA_VERSION,
    });
    const post = await ctx.db.get(id);
    if (!post) throw new Error("BLOG_CREATE_FAILED");
    return await toPublic(ctx, post);
  },
});

export const update = internalMutation({
  args: { id: v.id("blogPosts"), payload: blogInput, actor: actorSnapshot },
  returns: v.union(publicBlogPost, v.null()),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) return null;
    const now = Date.now();
    const status = args.payload.status ?? existing.status;
    const title = cleanText(args.payload.title, existing.title);
    const slug = cleanSlug(args.payload.slug || existing.slug);
    const excerpt = cleanText(args.payload.excerpt, existing.excerpt);
    const blocks = args.payload.blocks ? cleanBlocks(args.payload.blocks) : existing.blocks;
    const publishedAt = status === "published"
      ? parsePublishedAt(args.payload.publishedAt, existing.publishedAt ?? now)
      : undefined;
    const tags = args.payload.tags ? cleanTags(args.payload.tags) : existing.tags;
    const seoTitle = cleanOptionalText(args.payload.seoTitle, 70) ?? existing.seoTitle ?? title;
    const seoDescription = cleanOptionalText(args.payload.seoDescription, 180) ?? existing.seoDescription ?? excerpt;
    const language = cleanLanguage(args.payload.language, existing.language ?? DEFAULT_LANGUAGE);
    const author = cleanAuthor(args.payload.author, existing.author ?? DEFAULT_AUTHOR);
    const articleSection = cleanOptionalText(args.payload.articleSection, 80) ?? existing.articleSection ?? "Blog";
    const featuredImage = cleanFeaturedImage(args.payload.featuredImage) ?? existing.featuredImage ?? featuredImageFromBlocks(blocks);
    assertPublishable({
      status,
      title,
      excerpt,
      tags,
      publishedAt,
      seoTitle,
      seoDescription,
      language,
      author,
      articleSection,
      featuredImage,
      blocks,
    });
    await ensureUniqueSlug(ctx, slug, existing._id);
    if (slug !== existing.slug) {
      const [stats, windows] = await Promise.all([
        ctx.db
          .query("blogReadStats")
          .withIndex("by_slug", (q) => q.eq("slug", existing.slug))
          .take(1),
        ctx.db
          .query("blogReadWindows")
          .withIndex("by_slug_and_readerHash_and_dayKey", (q) => q.eq("slug", existing.slug))
          .take(1),
      ]);
      if (stats.length || windows.length) throw new Error("BLOG_SLUG_HAS_READING_ANALYTICS");
    }
    await ctx.db.patch(existing._id, {
      title,
      slug,
      excerpt,
      status,
      tags,
      coverTone: cleanText(args.payload.coverTone || args.payload.cover_tone, existing.coverTone),
      sourceHref: cleanText(args.payload.sourceHref || args.payload.source_href, existing.sourceHref),
      readTime: cleanText(args.payload.readTime || args.payload.read_time, existing.readTime),
      seoTitle,
      seoDescription,
      language,
      author,
      articleSection,
      featuredImage,
      blocks,
      ownerKey: args.actor.key,
      publishedAt,
      publishedAtLabel: publishedAt ? new Date(publishedAt).toISOString() : "Draft",
      updatedAt: now,
      schemaVersion: BLOG_SCHEMA_VERSION,
    });
    const post = await ctx.db.get(existing._id);
    return post ? await toPublic(ctx, post) : null;
  },
});
