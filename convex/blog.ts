import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, internalQuery, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { actorSnapshot, blogInput, publicBlogPost } from "./validators";

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

function toPublic(post: Doc<"blogPosts">) {
  return {
    id: post._id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    status: post.status,
    tags: post.tags,
    publishedAt: post.publishedAtLabel,
    readTime: post.readTime,
    coverTone: post.coverTone,
    sourceHref: post.sourceHref,
    blocks: post.blocks,
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
    return { posts: rows.map(toPublic), source: "convex" as const, warnings: [] };
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
    return post?.status === "published" ? toPublic(post) : null;
  },
});

export const listAdmin = internalQuery({
  args: { limit: v.optional(v.number()) },
  returns: v.array(publicBlogPost),
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(100, Math.floor(args.limit ?? 48)));
    const rows = await ctx.db.query("blogPosts").order("desc").take(limit);
    return rows.map(toPublic);
  },
});

export const getAdminById = internalQuery({
  args: { id: v.id("blogPosts") },
  returns: v.union(publicBlogPost, v.null()),
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    return post ? toPublic(post) : null;
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
    await ensureUniqueSlug(ctx, slug);
    const id = await ctx.db.insert("blogPosts", {
      slug,
      title,
      excerpt: cleanText(args.payload.excerpt),
      status,
      tags: cleanTags(args.payload.tags),
      publishedAt: status === "published" ? now : undefined,
      publishedAtLabel: status === "published" ? new Date(now).toISOString() : "Draft",
      readTime: cleanText(args.payload.readTime || args.payload.read_time, "4 min baca"),
      coverTone: cleanText(args.payload.coverTone || args.payload.cover_tone, "research"),
      sourceHref: cleanText(args.payload.sourceHref || args.payload.source_href, "/blog"),
      blocks: args.payload.blocks ?? [],
      ownerKey: args.actor.key,
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
    });
    const post = await ctx.db.get(id);
    if (!post) throw new Error("BLOG_CREATE_FAILED");
    return toPublic(post);
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
    await ensureUniqueSlug(ctx, slug, existing._id);
    await ctx.db.patch(existing._id, {
      title,
      slug,
      excerpt: cleanText(args.payload.excerpt, existing.excerpt),
      status,
      tags: args.payload.tags ? cleanTags(args.payload.tags) : existing.tags,
      coverTone: cleanText(args.payload.coverTone || args.payload.cover_tone, existing.coverTone),
      sourceHref: cleanText(args.payload.sourceHref || args.payload.source_href, existing.sourceHref),
      readTime: cleanText(args.payload.readTime || args.payload.read_time, existing.readTime),
      blocks: args.payload.blocks ?? existing.blocks,
      ownerKey: args.actor.key,
      publishedAt: status === "published" ? existing.publishedAt ?? now : undefined,
      publishedAtLabel:
        status === "published"
          ? cleanText(args.payload.publishedAt, existing.publishedAtLabel === "Draft" ? new Date(now).toISOString() : existing.publishedAtLabel)
          : "Draft",
      updatedAt: now,
      schemaVersion: 1,
    });
    const post = await ctx.db.get(existing._id);
    return post ? toPublic(post) : null;
  },
});
