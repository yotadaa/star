"use node";

import { createHash } from "node:crypto";
import { R2 } from "@convex-dev/r2";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";
import { actorSnapshot } from "./validators";

const uploadTicket = v.object({
  key: v.string(),
  url: v.string(),
  method: v.literal("PUT"),
});

type MigrationSource = {
  id: Id<"files">;
  storageId?: Id<"_storage">;
  storageProvider?: "convex" | "r2";
  access: "public" | "private";
  r2Key?: string;
  sha256?: string;
  r2VerifiedAt?: number;
  sourceKey?: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  metadata: any;
  legacyUrl?: string;
};
type MigrationResult = {
  fileId: Id<"files">;
  status: "already_verified" | "verified";
  targetKey: string;
  sha256: string;
  sizeBytes: number;
};
type DownloadResult = {
  url: string;
  contentType: string;
  originalName: string;
  sizeBytes: number;
  storageProvider: "convex" | "r2";
};

function configuredR2() {
  const bucket = process.env.R2_BUCKET_NAME;
  const endpoint = process.env.R2_S3_API;
  const accessKeyId = process.env.R2_ACCESS_KEY;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("R2_ENV_NOT_CONFIGURED");
  }
  return new R2(components.r2, { bucket, endpoint, accessKeyId, secretAccessKey });
}

function cleanSha256(value: string) {
  const checksum = value.trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(checksum)) throw new Error("FILE_SHA256_INVALID");
  return checksum;
}

function sha256(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

function extensionFor(contentType: string) {
  switch (contentType.trim().toLowerCase()) {
    case "image/jpeg": return "jpg";
    case "image/png": return "png";
    case "image/webp": return "webp";
    case "image/gif": return "gif";
    case "image/svg+xml": return "svg";
    case "application/pdf": return "pdf";
    default: return "bin";
  }
}

function objectKey(checksum: string, contentType: string) {
  const hash = cleanSha256(checksum);
  return `objects/sha256/${hash.slice(0, 2)}/${hash}.${extensionFor(contentType)}`;
}

async function fetchBytes(url: string, label: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${label}_FETCH_FAILED_${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function verifyTarget(
  r2: R2,
  key: string,
  expectedSha256: string,
  expectedSizeBytes: number,
) {
  const url = await r2.getUrl(key, { expiresIn: 300 });
  const bytes = await fetchBytes(url, "R2_TARGET");
  const targetSha256 = sha256(bytes);
  if (targetSha256 !== expectedSha256) throw new Error("R2_TARGET_HASH_MISMATCH");
  if (bytes.byteLength !== expectedSizeBytes) throw new Error("R2_TARGET_SIZE_MISMATCH");
  return { targetSha256, targetSizeBytes: bytes.byteLength };
}

export const generateUploadUrl = internalAction({
  args: { sha256: v.string(), contentType: v.string() },
  returns: uploadTicket,
  handler: async (_ctx, args) => {
    const r2 = configuredR2();
    const key = objectKey(args.sha256, args.contentType);
    const ticket = await r2.generateUploadUrl(key);
    return { ...ticket, method: "PUT" as const };
  },
});

export const commitUploadedFile = internalAction({
  args: {
    r2Key: v.string(),
    sha256: v.string(),
    access: v.union(v.literal("public"), v.literal("private")),
    recordId: v.optional(v.id("records")),
    sourceKey: v.optional(v.string()),
    originalName: v.string(),
    contentType: v.string(),
    sizeBytes: v.number(),
    metadata: v.any(),
    actor: actorSnapshot,
  },
  returns: v.id("files"),
  handler: async (ctx, args): Promise<Id<"files">> => {
    const r2 = configuredR2();
    const expectedSha256 = cleanSha256(args.sha256);
    const expectedKey = objectKey(expectedSha256, args.contentType);
    if (args.r2Key !== expectedKey) throw new Error("R2_UPLOAD_KEY_MISMATCH");
    const expectedSizeBytes = Math.max(0, Math.floor(args.sizeBytes));

    await r2.syncMetadata(ctx, args.r2Key);
    const verified = await verifyTarget(r2, args.r2Key, expectedSha256, expectedSizeBytes);
    return await ctx.runMutation(internal.files.commitR2, {
      r2Key: args.r2Key,
      sha256: verified.targetSha256,
      verifiedAt: Date.now(),
      access: args.access,
      ...(args.recordId ? { recordId: args.recordId } : {}),
      ...(args.sourceKey ? { sourceKey: args.sourceKey } : {}),
      originalName: args.originalName,
      contentType: args.contentType,
      sizeBytes: verified.targetSizeBytes,
      metadata: args.metadata,
      actor: args.actor,
    });
  },
});

export const migrateLegacyFile = internalAction({
  args: { fileId: v.id("files") },
  returns: v.object({
    fileId: v.id("files"),
    status: v.union(v.literal("already_verified"), v.literal("verified")),
    targetKey: v.string(),
    sha256: v.string(),
    sizeBytes: v.number(),
  }),
  handler: async (ctx, args): Promise<MigrationResult> => {
    const source: MigrationSource | null = await ctx.runQuery(
      internal.files.getMigrationSource,
      { id: args.fileId },
    );
    if (!source) throw new Error("FILE_NOT_FOUND");
    if (source.storageProvider === "r2" && source.r2Key && source.r2VerifiedAt && source.sha256) {
      return {
        fileId: source.id,
        status: "already_verified" as const,
        targetKey: source.r2Key,
        sha256: source.sha256,
        sizeBytes: source.sizeBytes,
      };
    }
    if (!source.storageId || !source.legacyUrl) throw new Error("FILE_LEGACY_SOURCE_MISSING");

    await ctx.runMutation(internal.files.markMigrationStarted, { fileId: source.id });
    try {
      const sourceBytes = await fetchBytes(source.legacyUrl, "CONVEX_SOURCE");
      const sourceSha256 = sha256(sourceBytes);
      const recordedSha256 = typeof source.metadata?.sha256 === "string"
        ? source.metadata.sha256.trim().toLowerCase()
        : undefined;
      if (recordedSha256 && /^[a-f0-9]{64}$/.test(recordedSha256) && recordedSha256 !== sourceSha256) {
        throw new Error("CONVEX_SOURCE_HASH_MISMATCH");
      }
      if (source.sizeBytes !== sourceBytes.byteLength) throw new Error("CONVEX_SOURCE_SIZE_MISMATCH");

      const r2 = configuredR2();
      const targetKey = objectKey(sourceSha256, source.contentType);
      const existing = await r2.getMetadata(ctx, targetKey);
      if (!existing) {
        await r2.store(ctx, sourceBytes, {
          key: targetKey,
          type: source.contentType,
          disposition: `inline; filename="${source.originalName.replace(/["\r\n]/g, "_")}"`,
          cacheControl: "public, max-age=31536000, immutable",
        });
      }
      const verified = await verifyTarget(r2, targetKey, sourceSha256, sourceBytes.byteLength);
      await ctx.runMutation(internal.files.markMigrationVerified, {
        fileId: source.id,
        targetKey,
        sourceSha256,
        targetSha256: verified.targetSha256,
        sourceSizeBytes: sourceBytes.byteLength,
        targetSizeBytes: verified.targetSizeBytes,
      });
      return {
        fileId: source.id,
        status: "verified" as const,
        targetKey,
        sha256: sourceSha256,
        sizeBytes: sourceBytes.byteLength,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await ctx.runMutation(internal.files.markMigrationFailed, { fileId: source.id, message });
      throw error;
    }
  },
});

export const getDownloadUrl = internalAction({
  args: { fileId: v.id("files"), publicOnly: v.boolean() },
  returns: v.union(v.object({
    url: v.string(),
    contentType: v.string(),
    originalName: v.string(),
    sizeBytes: v.number(),
    storageProvider: v.union(v.literal("convex"), v.literal("r2")),
  }), v.null()),
  handler: async (ctx, args): Promise<DownloadResult | null> => {
    const file: MigrationSource | null = await ctx.runQuery(
      internal.files.getDownloadDescriptor,
      { id: args.fileId },
    );
    if (!file) return null;
    if (args.publicOnly && file.access !== "public") throw new Error("FILE_NOT_PUBLIC");

    if (file.storageProvider === "r2" && file.r2Key && file.r2VerifiedAt) {
      const url = await configuredR2().getUrl(file.r2Key, { expiresIn: 900 });
      return {
        url,
        contentType: file.contentType,
        originalName: file.originalName,
        sizeBytes: file.sizeBytes,
        storageProvider: "r2" as const,
      };
    }
    if (!file.legacyUrl) return null;
    return {
      url: file.legacyUrl,
      contentType: file.contentType,
      originalName: file.originalName,
      sizeBytes: file.sizeBytes,
      storageProvider: "convex" as const,
    };
  },
});
