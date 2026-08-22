import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, query } from "./_generated/server";
import { actorSnapshot, publicChatMessage } from "./validators";

type ChatMessage = { id: string; authorName: string; body: string; createdAt: string };

function toPublic(message: Doc<"worldChatMessages">): ChatMessage {
  return {
    id: message._id,
    authorName: message.authorName,
    body: message.body,
    createdAt: new Date(message.sentAt).toISOString(),
  };
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
    return { messages: rows.reverse().map(toPublic), source: "convex" as const };
  },
});

export const sendFromBackend = internalMutation({
  args: { body: v.string(), actor: actorSnapshot },
  returns: publicChatMessage,
  handler: async (ctx, args): Promise<ChatMessage> => {
    const body = args.body.trim();
    if (!body) throw new Error("CHAT_EMPTY");
    if (body.length > 280) throw new Error("CHAT_TOO_LONG");
    const sentAt = Date.now();
    const id = await ctx.db.insert("worldChatMessages", {
      actorKey: args.actor.key,
      actorRole: args.actor.role,
      authorName: args.actor.name,
      body,
      status: "active",
      sentAt,
      schemaVersion: 1,
    });
    const message = await ctx.db.get(id);
    if (!message) throw new Error("CHAT_CREATE_FAILED");
    return toPublic(message);
  },
});

export const softDelete = internalMutation({
  args: { id: v.id("worldChatMessages"), actor: actorSnapshot },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const message = await ctx.db.get(args.id);
    if (!message) return false;
    if (args.actor.role !== "owner" && args.actor.role !== "backend") {
      throw new Error("CHAT_FORBIDDEN");
    }
    await ctx.db.patch(message._id, {
      status: "deleted",
      deletedAt: Date.now(),
      deletedByKey: args.actor.key,
      schemaVersion: 1,
    });
    return true;
  },
});
