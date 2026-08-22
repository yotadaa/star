import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, query } from "./_generated/server";
import { actorSnapshot, contentInput, publicContentEntry } from "./validators";

function cleanText(value: string | undefined, fallback = "") {
  return String(value ?? fallback).trim();
}

function cleanKey(value: string | undefined, fallback = "page-caption") {
  const key = cleanText(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return key || fallback;
}

function toPublic(entry: Doc<"contentEntries">) {
  return {
    id: entry._id,
    entryKey: entry.entryKey,
    title: entry.title,
    body: entry.body,
    payload: entry.payload,
    source: "convex" as const,
  };
}

export const listPublic = query({
  args: {},
  returns: v.object({
    entries: v.array(publicContentEntry),
    source: v.literal("convex"),
    warnings: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("contentEntries")
      .withIndex("by_status_and_updatedAt", (q) => q.eq("status", "public"))
      .order("desc")
      .take(40);
    return { entries: entries.map(toPublic), source: "convex" as const, warnings: [] };
  },
});

export const create = internalMutation({
  args: { payload: contentInput, actor: actorSnapshot },
  returns: publicContentEntry,
  handler: async (ctx, args) => {
    const now = Date.now();
    const entryKey = cleanKey(args.payload.entryKey || args.payload.entry_key || args.payload.title);
    const existing = await ctx.db
      .query("contentEntries")
      .withIndex("by_entryKey", (q) => q.eq("entryKey", entryKey))
      .unique();
    if (existing) throw new Error("CONTENT_KEY_CONFLICT");
    const id = await ctx.db.insert("contentEntries", {
      entryKey,
      title: cleanText(args.payload.title),
      body: cleanText(args.payload.body),
      payload: args.payload.payload ?? {},
      status: args.payload.status === "private" ? "private" : "public",
      ownerKey: args.actor.key,
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
    });
    const entry = await ctx.db.get(id);
    if (!entry) throw new Error("CONTENT_CREATE_FAILED");
    return toPublic(entry);
  },
});

export const upsert = internalMutation({
  args: { payload: contentInput, actor: actorSnapshot },
  returns: publicContentEntry,
  handler: async (ctx, args) => {
    const now = Date.now();
    const entryKey = cleanKey(args.payload.entryKey || args.payload.entry_key || args.payload.title);
    const existing = await ctx.db
      .query("contentEntries")
      .withIndex("by_entryKey", (q) => q.eq("entryKey", entryKey))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        title: cleanText(args.payload.title, existing.title),
        body: cleanText(args.payload.body, existing.body),
        payload: args.payload.payload ?? existing.payload,
        status: args.payload.status ?? existing.status,
        ownerKey: args.actor.key,
        updatedAt: now,
        schemaVersion: 1,
      });
      const updated = await ctx.db.get(existing._id);
      if (!updated) throw new Error("CONTENT_UPDATE_FAILED");
      return toPublic(updated);
    }
    const id = await ctx.db.insert("contentEntries", {
      entryKey,
      title: cleanText(args.payload.title),
      body: cleanText(args.payload.body),
      payload: args.payload.payload ?? {},
      status: args.payload.status === "private" ? "private" : "public",
      ownerKey: args.actor.key,
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
    });
    const entry = await ctx.db.get(id);
    if (!entry) throw new Error("CONTENT_CREATE_FAILED");
    return toPublic(entry);
  },
});
