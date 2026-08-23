import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, internalQuery, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { actorSnapshot, blogVoteState, publicBlogComment } from "./validators";

type PublicComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  canDelete: boolean;
};

function cleanSlug(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function requireDigest(value: string, code: string) {
  const digest = String(value || "").trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(digest)) throw new Error(code);
  return digest;
}

function cleanComment(value: string) {
  const body = String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!body) throw new Error("BLOG_COMMENT_EMPTY");
  if (body.length > 800) throw new Error("BLOG_COMMENT_TOO_LONG");
  return body;
}

async function publishedPost(ctx: QueryCtx | MutationCtx, slug: string) {
  const post = await ctx.db
    .query("blogPosts")
    .withIndex("by_slug", (q) => q.eq("slug", cleanSlug(slug)))
    .unique();
  if (!post || post.status !== "published") throw new Error("BLOG_POST_NOT_FOUND");
  return post as Doc<"blogPosts">;
}

function toPublicComment(comment: Doc<"blogComments">, viewerToken?: string): PublicComment {
  return {
    id: comment._id,
    authorName: comment.authorName,
    body: comment.body,
    createdAt: new Date(comment.createdAt).toISOString(),
    canDelete: Boolean(viewerToken && comment.authorToken === viewerToken),
  };
}

export const listComments = query({
  args: {
    slug: v.string(),
    limit: v.optional(v.number()),
    viewerToken: v.optional(v.string()),
  },
  returns: v.object({
    comments: v.array(publicBlogComment),
    source: v.literal("convex"),
  }),
  handler: async (ctx, args): Promise<{ comments: PublicComment[]; source: "convex" }> => {
    const post = await publishedPost(ctx, args.slug);
    const limit = Math.max(1, Math.min(60, Math.floor(args.limit ?? 60)));
    const viewerToken = args.viewerToken ? requireDigest(args.viewerToken, "BLOG_VIEWER_TOKEN_INVALID") : undefined;
    const rows = await ctx.db
      .query("blogComments")
      .withIndex("by_postId_and_status_and_createdAt", (q) => q.eq("postId", post._id).eq("status", "active"))
      .order("desc")
      .take(limit);
    return { comments: rows.reverse().map((row) => toPublicComment(row, viewerToken)), source: "convex" as const };
  },
});

export const getVoteState = internalQuery({
  args: { slug: v.string(), voterHash: v.string() },
  returns: blogVoteState,
  handler: async (ctx, args): Promise<{ count: number; voted: boolean }> => {
    const post = await publishedPost(ctx, args.slug);
    const voterHash = requireDigest(args.voterHash, "BLOG_VOTER_INVALID");
    const vote = await ctx.db
      .query("blogVotes")
      .withIndex("by_postId_and_voterHash", (q) => q.eq("postId", post._id).eq("voterHash", voterHash))
      .unique();
    return { count: Math.max(0, Math.floor(post.upvoteCount ?? 0)), voted: Boolean(vote) };
  },
});

export const toggleVote = internalMutation({
  args: { slug: v.string(), voterHash: v.string() },
  returns: blogVoteState,
  handler: async (ctx, args): Promise<{ count: number; voted: boolean }> => {
    const post = await publishedPost(ctx, args.slug);
    const voterHash = requireDigest(args.voterHash, "BLOG_VOTER_INVALID");
    const existing = await ctx.db
      .query("blogVotes")
      .withIndex("by_postId_and_voterHash", (q) => q.eq("postId", post._id).eq("voterHash", voterHash))
      .unique();
    const currentCount = Math.max(0, Math.floor(post.upvoteCount ?? 0));

    if (existing) {
      await ctx.db.delete(existing._id);
      const count = Math.max(0, currentCount - 1);
      await ctx.db.patch(post._id, { upvoteCount: count });
      return { count, voted: false };
    }

    await ctx.db.insert("blogVotes", {
      postId: post._id,
      voterHash,
      createdAt: Date.now(),
      schemaVersion: 1,
    });
    const count = currentCount + 1;
    await ctx.db.patch(post._id, { upvoteCount: count });
    return { count, voted: true };
  },
});

export const createComment = internalMutation({
  args: {
    slug: v.string(),
    body: v.string(),
    authorToken: v.string(),
    actor: actorSnapshot,
  },
  returns: publicBlogComment,
  handler: async (ctx, args): Promise<PublicComment> => {
    if (!args.actor.email) throw new Error("BLOG_COMMENT_LOGIN_REQUIRED");
    const post = await publishedPost(ctx, args.slug);
    const body = cleanComment(args.body);
    const authorToken = requireDigest(args.authorToken, "BLOG_AUTHOR_TOKEN_INVALID");
    const recent = await ctx.db
      .query("blogComments")
      .withIndex("by_actorKey_and_createdAt", (q) => q.eq("actorKey", args.actor.key))
      .order("desc")
      .take(1);
    if (recent[0] && recent[0].createdAt > Date.now() - 15_000) {
      throw new Error("BLOG_COMMENT_COOLDOWN");
    }

    const createdAt = Date.now();
    const authorName = String(args.actor.name || args.actor.email.split("@")[0] || "Visitor").trim().slice(0, 80) || "Visitor";
    const id = await ctx.db.insert("blogComments", {
      postId: post._id,
      actorKey: args.actor.key,
      authorToken,
      authorName,
      body,
      status: "active",
      createdAt,
      schemaVersion: 1,
    });
    const comment = await ctx.db.get(id);
    if (!comment) throw new Error("BLOG_COMMENT_CREATE_FAILED");
    return toPublicComment(comment, authorToken);
  },
});

export const softDeleteComment = internalMutation({
  args: { slug: v.string(), id: v.string(), actor: actorSnapshot },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const post = await publishedPost(ctx, args.slug);
    const id = ctx.db.normalizeId("blogComments", args.id);
    if (!id) throw new Error("BLOG_COMMENT_ID_INVALID");
    const comment = await ctx.db.get(id);
    if (!comment) return false;
    if (comment.postId !== post._id) throw new Error("BLOG_COMMENT_NOT_FOUND");
    const privileged = args.actor.role === "owner" || args.actor.role === "backend";
    if (!privileged && comment.actorKey !== args.actor.key) throw new Error("BLOG_COMMENT_FORBIDDEN");
    if (comment.status === "deleted") return true;
    await ctx.db.patch(comment._id, {
      status: "deleted",
      deletedAt: Date.now(),
      deletedByKey: args.actor.key,
      schemaVersion: 1,
    });
    return true;
  },
});
