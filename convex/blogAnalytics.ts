import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, internalQuery, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { adminBlogReadStats, publicBlogReadStats } from "./validators";
import { advanceReadingWindow } from "../lib/blog/readingAnalyticsMath.mjs";

const ANALYTICS_SCHEMA_VERSION = 1;
const PUBLIC_AVERAGE_SAMPLE_MINIMUM = 5;
const RETENTION_MS = 90 * 24 * 60 * 60 * 1_000;
const CLEANUP_BATCH_LIMIT = 200;

type StatsRecord = Pick<
  Doc<"blogReadStats">,
  | "viewCount"
  | "engagedReadCount"
  | "totalEngagedReadMs"
  | "completionCount"
  | "startedAt"
  | "updatedAt"
>;

function cleanSlug(value: string) {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) throw new Error("BLOG_SLUG_INVALID");
  return slug;
}

function requireDigest(value: string) {
  const digest = String(value || "").trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(digest)) throw new Error("BLOG_READER_HASH_INVALID");
  return digest;
}

function requireIntegerInRange(value: number, minimum: number, maximum: number, code: string) {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(code);
  }
  return value;
}

async function publishedPost(ctx: QueryCtx | MutationCtx, slugValue: string) {
  const slug = cleanSlug(slugValue);
  const post = await ctx.db
    .query("blogPosts")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  if (!post || post.status !== "published") throw new Error("BLOG_POST_NOT_FOUND");
  return post;
}

async function statsBySlug(ctx: QueryCtx | MutationCtx, slug: string) {
  return await ctx.db
    .query("blogReadStats")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
}

function averageActiveReadMs(stats: StatsRecord | null, publicGate: boolean) {
  if (!stats || stats.engagedReadCount < (publicGate ? PUBLIC_AVERAGE_SAMPLE_MINIMUM : 1)) {
    return null;
  }
  return Math.max(0, Math.floor(stats.totalEngagedReadMs / stats.engagedReadCount));
}

function publicStats(slug: string, stats: StatsRecord | null) {
  return {
    slug,
    viewCount: Math.max(0, Math.floor(stats?.viewCount ?? 0)),
    engagedReadCount: Math.max(0, Math.floor(stats?.engagedReadCount ?? 0)),
    averageActiveReadMs: averageActiveReadMs(stats, true),
  };
}

function adminStats(slug: string, stats: StatsRecord | null) {
  const viewCount = Math.max(0, Math.floor(stats?.viewCount ?? 0));
  const completionCount = Math.max(0, Math.floor(stats?.completionCount ?? 0));
  return {
    slug,
    viewCount,
    engagedReadCount: Math.max(0, Math.floor(stats?.engagedReadCount ?? 0)),
    averageActiveReadMs: averageActiveReadMs(stats, false),
    completionCount,
    completionRateBps: viewCount > 0
      ? Math.min(10_000, Math.floor((completionCount * 10_000) / viewCount))
      : 0,
    startedAt: stats?.startedAt ?? null,
    updatedAt: stats?.updatedAt ?? null,
  };
}

export const getPublicStats = query({
  args: { slug: v.string() },
  returns: publicBlogReadStats,
  handler: async (ctx, args) => {
    const post = await publishedPost(ctx, args.slug);
    return publicStats(post.slug, await statsBySlug(ctx, post.slug));
  },
});

export const listPublicStats = query({
  args: { slugs: v.array(v.string()) },
  returns: v.array(publicBlogReadStats),
  handler: async (ctx, args) => {
    if (args.slugs.length > 100) throw new Error("BLOG_STATS_LIMIT_EXCEEDED");
    const slugs = [...new Set(args.slugs.map(cleanSlug))];
    const results = [];
    for (const slug of slugs) {
      const post = await ctx.db
        .query("blogPosts")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (!post || post.status !== "published") continue;
      results.push(publicStats(slug, await statsBySlug(ctx, slug)));
    }
    return results;
  },
});

export const listAdminStats = internalQuery({
  args: { slugs: v.array(v.string()) },
  returns: v.array(adminBlogReadStats),
  handler: async (ctx, args) => {
    if (args.slugs.length > 100) throw new Error("BLOG_STATS_LIMIT_EXCEEDED");
    const slugs = [...new Set(args.slugs.map(cleanSlug))];
    const results = [];
    for (const slug of slugs) {
      results.push(adminStats(slug, await statsBySlug(ctx, slug)));
    }
    return results;
  },
});

export const recordReadingWindow = internalMutation({
  args: {
    slug: v.string(),
    readerHash: v.string(),
    activeMsDelta: v.number(),
    progressBps: v.number(),
  },
  returns: publicBlogReadStats,
  handler: async (ctx, args) => {
    const post = await publishedPost(ctx, args.slug);
    const readerHash = requireDigest(args.readerHash);
    const activeMsDelta = requireIntegerInRange(
      args.activeMsDelta,
      1,
      20_000,
      "BLOG_ACTIVE_TIME_INVALID",
    );
    const progressBps = requireIntegerInRange(
      args.progressBps,
      0,
      10_000,
      "BLOG_PROGRESS_INVALID",
    );
    const now = Date.now();
    const dayKey = new Date(now).toISOString().slice(0, 10);
    const existingWindow = await ctx.db
      .query("blogReadWindows")
      .withIndex("by_slug_and_readerHash_and_dayKey", (q) => (
        q.eq("slug", post.slug).eq("readerHash", readerHash).eq("dayKey", dayKey)
      ))
      .unique();
    const existingStats = await statsBySlug(ctx, post.slug);

    const transition = advanceReadingWindow(existingWindow, activeMsDelta, progressBps);
    const {
      activeReadMs,
      maxProgressBps,
      becameEngaged,
      becameCompleted,
    } = transition;

    if (existingWindow) {
      await ctx.db.patch(existingWindow._id, {
        activeReadMs,
        maxProgressBps,
        ...(becameEngaged ? { engagedAt: now } : {}),
        ...(becameCompleted ? { completedAt: now } : {}),
        lastActiveAt: now,
        schemaVersion: ANALYTICS_SCHEMA_VERSION,
      });
    } else {
      await ctx.db.insert("blogReadWindows", {
        slug: post.slug,
        readerHash,
        dayKey,
        viewRecordedAt: now,
        activeReadMs,
        maxProgressBps,
        ...(becameEngaged ? { engagedAt: now } : {}),
        ...(becameCompleted ? { completedAt: now } : {}),
        lastActiveAt: now,
        schemaVersion: ANALYTICS_SCHEMA_VERSION,
      });
    }

    const viewCount = Math.max(0, Math.floor(existingStats?.viewCount ?? 0))
      + transition.viewCountDelta;
    const engagedReadCount = Math.max(0, Math.floor(existingStats?.engagedReadCount ?? 0))
      + transition.engagedReadCountDelta;
    const completionCount = Math.max(0, Math.floor(existingStats?.completionCount ?? 0))
      + transition.completionCountDelta;
    const totalEngagedReadMs = Math.max(0, Math.floor(existingStats?.totalEngagedReadMs ?? 0))
      + transition.engagedTimeDelta;
    const nextStats = {
      slug: post.slug,
      viewCount,
      engagedReadCount,
      totalEngagedReadMs,
      completionCount,
      startedAt: existingStats?.startedAt ?? now,
      updatedAt: now,
      schemaVersion: ANALYTICS_SCHEMA_VERSION,
    };

    if (existingStats) {
      await ctx.db.patch(existingStats._id, nextStats);
    } else {
      await ctx.db.insert("blogReadStats", nextStats);
    }
    return publicStats(post.slug, nextStats);
  },
});

export const cleanupExpiredWindows = internalMutation({
  args: {
    cutoff: v.optional(v.number()),
    batchSize: v.optional(v.number()),
  },
  returns: v.object({ deleted: v.number(), scheduledContinuation: v.boolean() }),
  handler: async (ctx, args) => {
    const cutoff = Number.isFinite(args.cutoff) ? Math.floor(args.cutoff as number) : Date.now() - RETENTION_MS;
    const batchSize = Math.max(
      1,
      Math.min(CLEANUP_BATCH_LIMIT, Math.floor(args.batchSize ?? CLEANUP_BATCH_LIMIT)),
    );
    const expired = await ctx.db
      .query("blogReadWindows")
      .withIndex("by_lastActiveAt", (q) => q.lt("lastActiveAt", cutoff))
      .order("asc")
      .take(batchSize);
    for (const window of expired) await ctx.db.delete(window._id);
    const scheduledContinuation = expired.length === batchSize;
    if (scheduledContinuation) {
      await ctx.scheduler.runAfter(0, internal.blogAnalytics.cleanupExpiredWindows, {
        cutoff,
        batchSize,
      });
    }
    return { deleted: expired.length, scheduledContinuation };
  },
});
