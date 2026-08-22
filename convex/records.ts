import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { actorSnapshot, publicRecord, recordVisibility } from "./validators";

function cleanCollection(value: string | undefined) {
  const collection = String(value || "general").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(collection)) {
    throw new Error("INVALID_COLLECTION");
  }
  return collection;
}

function toPublic(record: Doc<"records">) {
  return {
    id: record._id,
    collection: record.collection,
    slug: record.slug,
    visibility: record.visibility,
    payload: record.payload,
    file_count: record.fileCount,
    created_at: new Date(record.createdAt).toISOString(),
    updated_at: new Date(record.updatedAt).toISOString(),
  };
}

export const listPublic = query({
  args: { collection: v.optional(v.string()), limit: v.optional(v.number()) },
  returns: v.array(publicRecord),
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(100, Math.floor(args.limit ?? 24)));
    const collection = args.collection ? cleanCollection(args.collection) : undefined;
    const rows = collection
      ? await ctx.db
        .query("records")
        .withIndex("by_collection_and_visibility_and_createdAt", (q) =>
          q.eq("collection", collection).eq("visibility", "public"),
        )
        .order("desc")
        .take(limit)
      : await ctx.db
        .query("records")
        .withIndex("by_visibility_and_createdAt", (q) => q.eq("visibility", "public"))
        .order("desc")
        .take(limit);
    return rows.map(toPublic);
  },
});

export const getPublicById = query({
  args: { id: v.id("records") },
  returns: v.union(publicRecord, v.null()),
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id);
    return record?.visibility === "public" ? toPublic(record) : null;
  },
});

export const listAdmin = internalQuery({
  args: { collection: v.optional(v.string()), limit: v.optional(v.number()) },
  returns: v.array(publicRecord),
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(100, Math.floor(args.limit ?? 24)));
    const rows = args.collection
      ? await ctx.db
        .query("records")
        .withIndex("by_collection_and_createdAt", (q) => q.eq("collection", cleanCollection(args.collection)))
        .order("desc")
        .take(limit)
      : await ctx.db.query("records").order("desc").take(limit);
    return rows.map(toPublic);
  },
});

export const getAdminById = internalQuery({
  args: { id: v.id("records") },
  returns: v.union(publicRecord, v.null()),
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id);
    return record ? toPublic(record) : null;
  },
});

export const create = internalMutation({
  args: {
    collection: v.string(),
    payload: v.any(),
    visibility: recordVisibility,
    slug: v.optional(v.string()),
    actor: actorSnapshot,
  },
  returns: publicRecord,
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("records", {
      collection: cleanCollection(args.collection),
      slug: args.slug?.trim() || undefined,
      visibility: args.visibility,
      ownerKey: args.actor.key,
      payload: args.payload && typeof args.payload === "object" ? args.payload : {},
      fileCount: 0,
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
    });
    const record = await ctx.db.get(id);
    if (!record) throw new Error("RECORD_CREATE_FAILED");
    return toPublic(record);
  },
});

export const remove = internalMutation({
  args: { id: v.id("records"), actor: actorSnapshot },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id);
    if (!record) return false;
    if (args.actor.role !== "owner" && args.actor.role !== "backend") {
      throw new Error("RECORD_FORBIDDEN");
    }
    const linkedFiles = await ctx.db
      .query("files")
      .withIndex("by_recordId_and_createdAt", (q) => q.eq("recordId", record._id))
      .take(101);
    if (linkedFiles.length > 100) throw new Error("RECORD_TOO_MANY_FILES");
    for (const file of linkedFiles) {
      await ctx.db.patch(file._id, { recordId: undefined });
    }
    await ctx.db.delete(record._id);
    return true;
  },
});
