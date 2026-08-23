import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, internalQuery } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { actorSnapshot, publicFile } from "./validators";

async function toPublic(
  ctx: QueryCtx,
  file: Doc<"files">,
) {
  const url = await ctx.storage.getUrl(file.storageId);
  return {
    id: file._id,
    ...(file.recordId ? { record_id: file.recordId } : {}),
    storage_id: file.storageId,
    ...(file.sourceKey ? { source_key: file.sourceKey } : {}),
    original_name: file.originalName,
    content_type: file.contentType,
    size_bytes: file.sizeBytes,
    metadata: file.metadata,
    created_at: new Date(file.createdAt).toISOString(),
    ...(url ? { url } : {}),
  };
}

export const createUploadUrl = internalMutation({
  args: { actor: actorSnapshot },
  returns: v.string(),
  handler: async (ctx, args) => {
    if (args.actor.role !== "owner" && args.actor.role !== "backend") {
      throw new Error("FILE_FORBIDDEN");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const commit = internalMutation({
  args: {
    storageId: v.id("_storage"),
    recordId: v.optional(v.id("records")),
    sourceKey: v.optional(v.string()),
    originalName: v.string(),
    contentType: v.string(),
    sizeBytes: v.number(),
    metadata: v.any(),
    actor: actorSnapshot,
  },
  returns: v.id("files"),
  handler: async (ctx, args) => {
    if (args.actor.role !== "owner" && args.actor.role !== "backend") {
      throw new Error("FILE_FORBIDDEN");
    }
    const sourceKey = args.sourceKey?.trim() || undefined;
    if (sourceKey && args.recordId) throw new Error("FILE_SOURCE_KEY_RECORD_CONFLICT");
    const record = args.recordId ? await ctx.db.get(args.recordId) : null;
    if (args.recordId && !record) throw new Error("RECORD_NOT_FOUND");
    const existing = sourceKey
      ? await ctx.db
          .query("files")
          .withIndex("by_sourceKey", (q) => q.eq("sourceKey", sourceKey))
          .unique()
      : null;
    if (existing) {
      await ctx.storage.delete(existing.storageId);
      await ctx.db.patch(existing._id, {
        storageId: args.storageId,
        originalName: args.originalName.trim() || "file",
        contentType: args.contentType.trim() || "application/octet-stream",
        sizeBytes: Math.max(0, Math.floor(args.sizeBytes)),
        metadata: args.metadata && typeof args.metadata === "object" ? args.metadata : {},
        schemaVersion: 1,
      });
      return existing._id;
    }
    const id = await ctx.db.insert("files", {
      ...(args.recordId ? { recordId: args.recordId } : {}),
      ...(sourceKey ? { sourceKey } : {}),
      storageId: args.storageId,
      originalName: args.originalName.trim() || "file",
      contentType: args.contentType.trim() || "application/octet-stream",
      sizeBytes: Math.max(0, Math.floor(args.sizeBytes)),
      metadata: args.metadata && typeof args.metadata === "object" ? args.metadata : {},
      createdAt: Date.now(),
      schemaVersion: 1,
    });
    if (record) {
      await ctx.db.patch(record._id, {
        fileCount: record.fileCount + 1,
        updatedAt: Date.now(),
        schemaVersion: 1,
      });
    }
    return id;
  },
});

export const getById = internalQuery({
  args: { id: v.id("files") },
  returns: v.union(publicFile, v.null()),
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    return file ? await toPublic(ctx, file) : null;
  },
});

export const getBySourceKey = internalQuery({
  args: { sourceKey: v.string() },
  returns: v.union(publicFile, v.null()),
  handler: async (ctx, args) => {
    const sourceKey = args.sourceKey.trim();
    if (!sourceKey) return null;
    const file = await ctx.db
      .query("files")
      .withIndex("by_sourceKey", (q) => q.eq("sourceKey", sourceKey))
      .unique();
    return file ? await toPublic(ctx, file) : null;
  },
});
