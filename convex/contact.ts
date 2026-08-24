import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, query } from "./_generated/server";
import { actorSnapshot, contactChannelInput, contactEventInput, publicContactChannel } from "./validators";

function cleanText(value: string | undefined, fallback = "") {
  return String(value ?? fallback).trim();
}

function cleanKey(value: string | undefined, fallback = "unknown") {
  const key = cleanText(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return key || fallback;
}

function toPublic(channel: Doc<"contactChannels">) {
  return {
    id: channel._id,
    key: channel.channelKey,
    label: channel.label,
    sub: channel.sub,
    cta: channel.cta,
    href: channel.href,
    tone: channel.tone,
  };
}

export const listActive = query({
  args: {},
  returns: v.object({
    channels: v.array(publicContactChannel),
    source: v.literal("convex"),
    warnings: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const channels = await ctx.db
      .query("contactChannels")
      .withIndex("by_active_and_sortOrder", (q) => q.eq("active", true))
      .order("asc")
      .take(40);
    return { channels: channels.map(toPublic), source: "convex" as const, warnings: [] };
  },
});

export const createChannel = internalMutation({
  args: { payload: contactChannelInput, actor: actorSnapshot },
  returns: publicContactChannel,
  handler: async (ctx, args) => {
    const now = Date.now();
    const channelKey = cleanKey(args.payload.key || args.payload.channelKey || args.payload.label);
    const existing = await ctx.db
      .query("contactChannels")
      .withIndex("by_channelKey", (q) => q.eq("channelKey", channelKey))
      .unique();
    if (existing) throw new Error("CONTACT_KEY_CONFLICT");
    const id = await ctx.db.insert("contactChannels", {
      channelKey,
      label: cleanText(args.payload.label, "Contact"),
      sub: cleanText(args.payload.sub),
      cta: cleanText(args.payload.cta, "Open"),
      href: cleanText(args.payload.href, "/contact"),
      tone: cleanText(args.payload.tone, "default"),
      sortOrder: Math.trunc(args.payload.sortOrder ?? args.payload.sort_order ?? 0),
      active: args.payload.active !== false,
      ownerKey: args.actor.key,
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
    });
    const channel = await ctx.db.get(id);
    if (!channel) throw new Error("CONTACT_CREATE_FAILED");
    return toPublic(channel);
  },
});

export const createEvent = internalMutation({
  args: { payload: contactEventInput },
  returns: v.object({ id: v.string(), channelKey: v.string(), eventName: v.string(), occurredAt: v.string() }),
  handler: async (ctx, args) => {
    const occurredAt = Date.now();
    const channelKey = cleanKey(args.payload.channelKey || args.payload.channel_key);
    const eventName = cleanKey(args.payload.eventName || args.payload.event_name, "open");
    const id = await ctx.db.insert("contactEvents", {
      channelKey,
      eventName,
      metadata: args.payload.metadata ?? {},
      occurredAt,
      schemaVersion: 1,
    });
    return { id, channelKey, eventName, occurredAt: new Date(occurredAt).toISOString() };
  },
});
