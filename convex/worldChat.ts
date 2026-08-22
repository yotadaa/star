import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation, query } from "./_generated/server";
import { actorSnapshot, publicChatMessage } from "./validators";

type ChatReply = { id: string; authorName: string; body: string };
type ChatMessage = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  replyTo: ChatReply | null;
  replyUnavailable: boolean;
};

function toPublic(
  message: Doc<"worldChatMessages">,
  parent: Doc<"worldChatMessages"> | null = null,
): ChatMessage {
  const replyTo = parent?.status === "active"
    ? { id: parent._id, authorName: parent.authorName, body: parent.body }
    : null;
  return {
    id: message._id,
    authorName: message.authorName,
    body: message.body,
    createdAt: new Date(message.sentAt).toISOString(),
    replyTo,
    replyUnavailable: Boolean(message.replyToId && !replyTo),
  };
}

async function resolveParent(
  ctx: { db: { get: (id: Id<"worldChatMessages">) => Promise<Doc<"worldChatMessages"> | null> } },
  message: Doc<"worldChatMessages">,
) {
  return message.replyToId ? await ctx.db.get(message.replyToId) : null;
}

export const listLatest = query({
  args: { limit: v.optional(v.number()) },
  returns: v.object({
    messages: v.array(publicChatMessage),
    source: v.literal("convex"),
  }),
  handler: async (ctx, args): Promise<{ messages: ChatMessage[]; source: "convex" }> => {
    const limit = Math.max(1, Math.min(40, Math.floor(args.limit ?? 40)));
    const rows = await ctx.db
      .query("worldChatMessages")
      .withIndex("by_status_and_sentAt", (q) => q.eq("status", "active"))
      .order("desc")
      .take(limit);
    const resolved = await Promise.all(
      rows.map(async (message) => ({ message, parent: await resolveParent(ctx, message) })),
    );
    return {
      messages: resolved.reverse().map(({ message, parent }) => toPublic(message, parent)),
      source: "convex" as const,
    };
  },
});

export const sendFromBackend = internalMutation({
  args: { body: v.string(), replyToId: v.optional(v.string()), actor: actorSnapshot },
  returns: publicChatMessage,
  handler: async (ctx, args): Promise<ChatMessage> => {
    const body = args.body.trim();
    if (!body) throw new Error("CHAT_EMPTY");
    if (body.length > 280) throw new Error("CHAT_TOO_LONG");
    let parent: Doc<"worldChatMessages"> | null = null;
    let replyToId: Id<"worldChatMessages"> | undefined;
    if (args.replyToId) {
      const normalized = ctx.db.normalizeId("worldChatMessages", args.replyToId);
      if (!normalized) throw new Error("CHAT_PARENT_INVALID");
      parent = await ctx.db.get(normalized);
      if (!parent) throw new Error("CHAT_PARENT_NOT_FOUND");
      if (parent.status !== "active") throw new Error("CHAT_PARENT_DELETED");
      replyToId = normalized;
    }
    const sentAt = Date.now();
    const id = await ctx.db.insert("worldChatMessages", {
      actorKey: args.actor.key,
      actorRole: args.actor.role,
      authorName: args.actor.name,
      body,
      ...(replyToId ? { replyToId } : {}),
      status: "active",
      sentAt,
      schemaVersion: 1,
    });
    const message = await ctx.db.get(id);
    if (!message) throw new Error("CHAT_CREATE_FAILED");
    return toPublic(message, parent);
  },
});

export const softDelete = internalMutation({
  args: { id: v.string(), actor: actorSnapshot },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const id = ctx.db.normalizeId("worldChatMessages", args.id);
    if (!id) throw new Error("CHAT_ID_INVALID");
    const message = await ctx.db.get(id);
    if (!message) return false;
    if (args.actor.role !== "owner" && args.actor.role !== "backend") {
      throw new Error("CHAT_FORBIDDEN");
    }
    if (message.status === "deleted") return true;
    await ctx.db.patch(message._id, {
      status: "deleted",
      deletedAt: Date.now(),
      deletedByKey: args.actor.key,
      schemaVersion: 1,
    });
    return true;
  },
});
