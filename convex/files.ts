import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, internalQuery } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { r2PublicUrl } from "./r2PublicUrl";
import { actorSnapshot, publicFile } from "./validators";

const storageAccess = v.union(v.literal("public"), v.literal("private"));

function effectiveAccess(file: Doc<"files">) {
  return file.access ?? (file.recordId ? "private" : "public");
}

function isVerifiedR2(file: Doc<"files">) {
  return file.storageProvider === "r2" && Boolean(file.r2Key && file.r2VerifiedAt);
}

async function toPublic(
  ctx: QueryCtx | MutationCtx,
  file: Doc<"files">,
) {
  const storageProvider = isVerifiedR2(file) ? "r2" as const : "convex" as const;
  const access = effectiveAccess(file);
  const url = storageProvider === "r2"
    ? (access === "public"
        ? r2PublicUrl(file.r2Key as string)
        : `/api/backend/files/${file._id}`)
    : (file.storageId ? await ctx.storage.getUrl(file.storageId) : null);

  return {
    id: file._id,
    ...(file.recordId ? { record_id: file.recordId } : {}),
    ...(file.storageId ? { storage_id: file.storageId } : {}),
    storage_provider: storageProvider,
    access,
    ...(file.sourceKey ? { source_key: file.sourceKey } : {}),
    ...(file.sha256 ? { sha256: file.sha256 } : {}),
    original_name: file.originalName,
    content_type: file.contentType,
    size_bytes: file.sizeBytes,
    metadata: file.metadata,
    created_at: new Date(file.createdAt).toISOString(),
    ...(url ? { url } : {}),
  };
}

function cleanSha256(value: string) {
  const checksum = value.trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(checksum)) throw new Error("FILE_SHA256_INVALID");
  return checksum;
}

function cleanR2Key(value: string) {
  const key = value.trim();
  if (!key || key.length > 512 || key.startsWith("/") || key.includes("..")) {
    throw new Error("FILE_R2_KEY_INVALID");
  }
  return key;
}

export const commitR2 = internalMutation({
  args: {
    r2Key: v.string(),
    sha256: v.string(),
    verifiedAt: v.number(),
    access: storageAccess,
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

    const now = Date.now();
    const sourceKey = args.sourceKey?.trim() || undefined;
    const r2Key = cleanR2Key(args.r2Key);
    const sha256 = cleanSha256(args.sha256);
    if (sourceKey && args.recordId) throw new Error("FILE_SOURCE_KEY_RECORD_CONFLICT");
    const record = args.recordId ? await ctx.db.get(args.recordId) : null;
    if (args.recordId && !record) throw new Error("RECORD_NOT_FOUND");

    const existing = sourceKey
      ? await ctx.db
          .query("files")
          .withIndex("by_sourceKey", (q) => q.eq("sourceKey", sourceKey))
          .unique()
      : null;

    const patch = {
      storageProvider: "r2" as const,
      access: args.access,
      r2Key,
      sha256,
      r2VerifiedAt: Math.max(1, Math.floor(args.verifiedAt)),
      originalName: args.originalName.trim() || "file",
      contentType: args.contentType.trim() || "application/octet-stream",
      sizeBytes: Math.max(0, Math.floor(args.sizeBytes)),
      metadata: args.metadata && typeof args.metadata === "object" ? args.metadata : {},
      updatedAt: now,
      schemaVersion: 2,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    const id = await ctx.db.insert("files", {
      ...(args.recordId ? { recordId: args.recordId } : {}),
      ...(sourceKey ? { sourceKey } : {}),
      ...patch,
      createdAt: now,
    });
    if (record) {
      await ctx.db.patch(record._id, {
        fileCount: record.fileCount + 1,
        updatedAt: now,
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

const migrationSource = v.object({
  id: v.id("files"),
  storageId: v.optional(v.id("_storage")),
  storageProvider: v.optional(v.union(v.literal("convex"), v.literal("r2"))),
  access: storageAccess,
  r2Key: v.optional(v.string()),
  sha256: v.optional(v.string()),
  r2VerifiedAt: v.optional(v.number()),
  sourceKey: v.optional(v.string()),
  originalName: v.string(),
  contentType: v.string(),
  sizeBytes: v.number(),
  metadata: v.any(),
  legacyUrl: v.optional(v.string()),
});

async function migrationSourceFor(ctx: QueryCtx, file: Doc<"files">) {
  const legacyUrl = file.storageId ? await ctx.storage.getUrl(file.storageId) : null;
  return {
    id: file._id,
    ...(file.storageId ? { storageId: file.storageId } : {}),
    ...(file.storageProvider ? { storageProvider: file.storageProvider } : {}),
    access: effectiveAccess(file),
    ...(file.r2Key ? { r2Key: file.r2Key } : {}),
    ...(file.sha256 ? { sha256: file.sha256 } : {}),
    ...(file.r2VerifiedAt ? { r2VerifiedAt: file.r2VerifiedAt } : {}),
    ...(file.sourceKey ? { sourceKey: file.sourceKey } : {}),
    originalName: file.originalName,
    contentType: file.contentType,
    sizeBytes: file.sizeBytes,
    metadata: file.metadata,
    ...(legacyUrl ? { legacyUrl } : {}),
  };
}

export const getMigrationSource = internalQuery({
  args: { id: v.id("files") },
  returns: v.union(migrationSource, v.null()),
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    return file ? await migrationSourceFor(ctx, file) : null;
  },
});

export const getDownloadDescriptor = internalQuery({
  args: { id: v.id("files") },
  returns: v.union(migrationSource, v.null()),
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    return file ? await migrationSourceFor(ctx, file) : null;
  },
});

export const listPendingMigration = internalQuery({
  args: { limit: v.number() },
  returns: v.array(v.id("files")),
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(100, Math.floor(args.limit)));
    const withoutProvider = await ctx.db
      .query("files")
      .withIndex("by_storageProvider_and_createdAt", (q) => q.eq("storageProvider", undefined))
      .take(limit);
    if (withoutProvider.length >= limit) return withoutProvider.map((file) => file._id);
    const convexFiles = await ctx.db
      .query("files")
      .withIndex("by_storageProvider_and_createdAt", (q) => q.eq("storageProvider", "convex"))
      .take(limit - withoutProvider.length);
    return [...withoutProvider, ...convexFiles].map((file) => file._id);
  },
});

export const markMigrationStarted = internalMutation({
  args: { fileId: v.id("files") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("FILE_NOT_FOUND");
    const now = Date.now();
    const existing = await ctx.db
      .query("fileMigrationJobs")
      .withIndex("by_fileId", (q) => q.eq("fileId", args.fileId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "copying",
        attempts: existing.attempts + 1,
        updatedAt: now,
        lastError: undefined,
      });
    } else {
      await ctx.db.insert("fileMigrationJobs", {
        fileId: file._id,
        ...(file.storageId ? { legacyStorageId: file.storageId } : {}),
        status: "copying",
        attempts: 1,
        createdAt: now,
        updatedAt: now,
        schemaVersion: 1,
      });
    }
    return null;
  },
});

export const markMigrationVerified = internalMutation({
  args: {
    fileId: v.id("files"),
    targetKey: v.string(),
    sourceSha256: v.string(),
    targetSha256: v.string(),
    sourceSizeBytes: v.number(),
    targetSizeBytes: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("FILE_NOT_FOUND");
    const sourceSha256 = cleanSha256(args.sourceSha256);
    const targetSha256 = cleanSha256(args.targetSha256);
    if (sourceSha256 !== targetSha256) throw new Error("FILE_MIGRATION_HASH_MISMATCH");
    if (args.sourceSizeBytes !== args.targetSizeBytes) throw new Error("FILE_MIGRATION_SIZE_MISMATCH");
    const now = Date.now();
    const targetKey = cleanR2Key(args.targetKey);

    await ctx.db.patch(file._id, {
      storageProvider: "r2",
      access: effectiveAccess(file),
      r2Key: targetKey,
      sha256: sourceSha256,
      r2VerifiedAt: now,
      sizeBytes: args.targetSizeBytes,
      updatedAt: now,
      schemaVersion: 2,
    });

    const job = await ctx.db
      .query("fileMigrationJobs")
      .withIndex("by_fileId", (q) => q.eq("fileId", file._id))
      .unique();
    if (!job) throw new Error("FILE_MIGRATION_JOB_NOT_FOUND");
    await ctx.db.patch(job._id, {
      targetKey,
      status: "verified",
      sourceSha256,
      targetSha256,
      sourceSizeBytes: args.sourceSizeBytes,
      targetSizeBytes: args.targetSizeBytes,
      updatedAt: now,
      verifiedAt: now,
      lastError: undefined,
    });
    return null;
  },
});

export const markMigrationFailed = internalMutation({
  args: { fileId: v.id("files"), message: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("fileMigrationJobs")
      .withIndex("by_fileId", (q) => q.eq("fileId", args.fileId))
      .unique();
    if (job) {
      await ctx.db.patch(job._id, {
        status: "failed",
        lastError: args.message.slice(0, 1000),
        updatedAt: Date.now(),
      });
    }
    return null;
  },
});

export const migrationAudit = internalQuery({
  args: {},
  returns: v.object({
    totalFiles: v.number(),
    legacyObjectsRetained: v.number(),
    r2VerifiedFiles: v.number(),
    pendingFiles: v.number(),
    failedJobs: v.number(),
    verifiedJobs: v.number(),
    blogImageOccurrences: v.number(),
    blogStorageIdReferences: v.number(),
    blogAssetKeyReferences: v.number(),
    unresolvedBlogAssets: v.number(),
  }),
  handler: async (ctx) => {
    const [files, jobs, posts] = await Promise.all([
      ctx.db.query("files").take(501),
      ctx.db.query("fileMigrationJobs").take(501),
      ctx.db.query("blogPosts").take(501),
    ]);
    if (files.length > 500 || jobs.length > 500 || posts.length > 500) {
      throw new Error("FILE_MIGRATION_AUDIT_LIMIT_EXCEEDED");
    }
    const fileBySourceKey = new Map(
      files.filter((file) => file.sourceKey).map((file) => [file.sourceKey as string, file]),
    );
    let blogImageOccurrences = 0;
    let blogStorageIdReferences = 0;
    let blogAssetKeyReferences = 0;
    let unresolvedBlogAssets = 0;
    for (const post of posts) {
      const images = [
        ...(post.featuredImage ? [post.featuredImage] : []),
        ...post.blocks.filter((block) => block.type === "image"),
      ];
      for (const image of images) {
        blogImageOccurrences += 1;
        if (image.storageId) blogStorageIdReferences += 1;
        if (image.assetKey) {
          blogAssetKeyReferences += 1;
          const file = fileBySourceKey.get(image.assetKey);
          if (!file || !isVerifiedR2(file)) unresolvedBlogAssets += 1;
        } else if (image.storageId) {
          unresolvedBlogAssets += 1;
        }
      }
    }
    const r2VerifiedFiles = files.filter(isVerifiedR2).length;
    return {
      totalFiles: files.length,
      legacyObjectsRetained: files.filter((file) => Boolean(file.storageId)).length,
      r2VerifiedFiles,
      pendingFiles: files.length - r2VerifiedFiles,
      failedJobs: jobs.filter((job) => job.status === "failed").length,
      verifiedJobs: jobs.filter((job) => job.status === "verified").length,
      blogImageOccurrences,
      blogStorageIdReferences,
      blogAssetKeyReferences,
      unresolvedBlogAssets,
    };
  },
});
