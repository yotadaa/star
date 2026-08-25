"use node";

import { timingSafeEqual } from "node:crypto";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import {
  actorSnapshot,
  blogVoteState,
  blogInput,
  contactChannelInput,
  contactEventInput,
  contentInput,
  inventoryInput,
  nalaSettingsInput,
  publicBlogPost,
  publicBlogComment,
  publicChatMessage,
  publicContactChannel,
  publicContentEntry,
  publicFile,
  publicInventoryItem,
  publicNalaSettings,
  publicRecord,
  recordVisibility,
} from "./validators";

type EditorBlock = {
  type: "heading" | "paragraph" | "quote" | "list" | "code" | "image" | "divider" | "table" | "icon";
  text: string;
  rows?: string[][];
  storageId?: Id<"_storage">;
  assetKey?: string;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
};
type BlogAuthor = { id: string; name: string; url: string };
type BlogFeaturedImage = {
  storageId?: Id<"_storage">;
  assetKey?: string;
  src?: string;
  alt: string;
  width: number;
  height: number;
};
type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: "draft" | "published" | "archived";
  tags: string[];
  publishedAt: string;
  datePublished: number | null;
  dateModified: number;
  readTime: string;
  coverTone: string;
  sourceHref: string;
  seoTitle?: string;
  seoDescription?: string;
  language?: string;
  author?: BlogAuthor;
  articleSection?: string;
  featuredImage?: BlogFeaturedImage;
  blocks: EditorBlock[];
  upvoteCount: number;
  updatedAt: number;
};
type BlogVoteState = { count: number; voted: boolean };
type BlogComment = { id: string; authorName: string; body: string; createdAt: string; canDelete: boolean };
type ChatMessage = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  replyTo: { id: string; authorName: string; body: string } | null;
  replyUnavailable: boolean;
};
type ContentEntry = { id: string; entryKey: string; title: string; body: string; payload: unknown; source: "convex" };
type InventoryItem = {
  id: string;
  sourceId?: string;
  type: "scroll" | "tool" | "artifact" | "medal" | "key";
  icon: string;
  name: string;
  fullName: string;
  description: string;
  rarity: "common" | "rare" | "epic";
  acquiredAt: string;
  linkTo?: string;
};
type ContactChannel = { id: string; key: string; label: string; sub: string; cta: string; href: string; tone: string };
type ContactEvent = { id: string; channelKey: string; eventName: string; occurredAt: string };
type NalaSettings = {
  enabled: boolean;
  model: string;
  systemPromptSupplement: string;
  temperature: number;
  maxTokens: number;
  updatedAt: number | null;
  persisted: boolean;
};
type RecordResult = {
  id: string;
  collection: string;
  slug?: string;
  visibility: "public" | "private";
  payload: unknown;
  file_count: number;
  created_at: string;
  updated_at: string;
};
type FileResult = {
  id: string;
  record_id?: string;
  storage_id?: Id<"_storage">;
  storage_provider: "convex" | "r2";
  access: "public" | "private";
  source_key?: string;
  sha256?: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
  metadata: unknown;
  created_at: string;
  url?: string;
};
type FileDownload = {
  url: string;
  contentType: string;
  originalName: string;
  sizeBytes: number;
  storageProvider: "convex" | "r2";
};
type FileMigrationResult = {
  fileId: Id<"files">;
  status: "already_verified" | "verified";
  targetKey: string;
  sha256: string;
  sizeBytes: number;
};
type FileMigrationAudit = {
  totalFiles: number;
  legacyObjectsRetained: number;
  r2VerifiedFiles: number;
  pendingFiles: number;
  failedJobs: number;
  verifiedJobs: number;
  blogImageOccurrences: number;
  blogStorageIdReferences: number;
  blogAssetKeyReferences: number;
  unresolvedBlogAssets: number;
};
type TableAudit = { count: number; schemaVersionMissing: number; duplicateKeys: string[] };
type BlogTableAudit = TableAudit & { seoDataMissing: number; imageDimensionsMissing: number };
type MigrationStatus = {
  blogPosts: BlogTableAudit;
  inventoryItems: TableAudit;
  contentEntries: TableAudit;
  contactChannels: TableAudit;
  worldChatMessages: number;
  blogVotes: number;
  blogComments: number;
  contactEvents: number;
  records: number;
  files: number;
  seedManifests: number;
};

const tableAudit = v.object({
  count: v.number(),
  schemaVersionMissing: v.number(),
  duplicateKeys: v.array(v.string()),
});
const blogTableAudit = v.object({
  count: v.number(),
  schemaVersionMissing: v.number(),
  duplicateKeys: v.array(v.string()),
  seoDataMissing: v.number(),
  imageDimensionsMissing: v.number(),
});
const migrationStatus = v.object({
  blogPosts: blogTableAudit,
  inventoryItems: tableAudit,
  contentEntries: tableAudit,
  contactChannels: tableAudit,
  worldChatMessages: v.number(),
  blogVotes: v.number(),
  blogComments: v.number(),
  contactEvents: v.number(),
  records: v.number(),
  files: v.number(),
  seedManifests: v.number(),
});

function requireBridgeSecret(provided: string) {
  const expected = process.env.CONVEX_INTERNAL_API_KEY;
  if (!expected) throw new Error("BRIDGE_SECRET_NOT_CONFIGURED");
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    throw new Error("BRIDGE_UNAUTHORIZED");
  }
}

export const health = action({
  args: { secret: v.string() },
  returns: migrationStatus,
  handler: async (ctx, args): Promise<MigrationStatus> => {
    requireBridgeSecret(args.secret);
    return await ctx.runQuery(internal.migrationAudit.seedStatus, {});
  },
});

export const listBlogAdmin = action({
  args: { secret: v.string(), limit: v.optional(v.number()) },
  returns: v.array(publicBlogPost),
  handler: async (ctx, args): Promise<BlogPost[]> => {
    requireBridgeSecret(args.secret);
    return await ctx.runQuery(internal.blog.listAdmin, { limit: args.limit });
  },
});

export const getBlogAdmin = action({
  args: { secret: v.string(), id: v.id("blogPosts") },
  returns: v.union(publicBlogPost, v.null()),
  handler: async (ctx, args): Promise<BlogPost | null> => {
    requireBridgeSecret(args.secret);
    return await ctx.runQuery(internal.blog.getAdminById, { id: args.id });
  },
});

export const createBlog = action({
  args: { secret: v.string(), payload: blogInput, actor: actorSnapshot },
  returns: publicBlogPost,
  handler: async (ctx, args): Promise<BlogPost> => {
    requireBridgeSecret(args.secret);
    return await ctx.runMutation(internal.blog.create, { payload: args.payload, actor: args.actor });
  },
});

export const updateBlog = action({
  args: { secret: v.string(), id: v.id("blogPosts"), payload: blogInput, actor: actorSnapshot },
  returns: v.union(publicBlogPost, v.null()),
  handler: async (ctx, args): Promise<BlogPost | null> => {
    requireBridgeSecret(args.secret);
    return await ctx.runMutation(internal.blog.update, { id: args.id, payload: args.payload, actor: args.actor });
  },
});

export const getBlogVoteState = action({
  args: { secret: v.string(), slug: v.string(), voterHash: v.string() },
  returns: blogVoteState,
  handler: async (ctx, args): Promise<BlogVoteState> => {
    requireBridgeSecret(args.secret);
    return await ctx.runQuery(internal.blogEngagement.getVoteState, {
      slug: args.slug,
      voterHash: args.voterHash,
    });
  },
});

export const toggleBlogVote = action({
  args: { secret: v.string(), slug: v.string(), voterHash: v.string() },
  returns: blogVoteState,
  handler: async (ctx, args): Promise<BlogVoteState> => {
    requireBridgeSecret(args.secret);
    return await ctx.runMutation(internal.blogEngagement.toggleVote, {
      slug: args.slug,
      voterHash: args.voterHash,
    });
  },
});

export const createBlogComment = action({
  args: {
    secret: v.string(),
    slug: v.string(),
    body: v.string(),
    authorToken: v.string(),
    actor: actorSnapshot,
  },
  returns: publicBlogComment,
  handler: async (ctx, args): Promise<BlogComment> => {
    requireBridgeSecret(args.secret);
    return await ctx.runMutation(internal.blogEngagement.createComment, {
      slug: args.slug,
      body: args.body,
      authorToken: args.authorToken,
      actor: args.actor,
    });
  },
});

export const deleteBlogComment = action({
  args: { secret: v.string(), slug: v.string(), id: v.string(), actor: actorSnapshot },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    requireBridgeSecret(args.secret);
    return await ctx.runMutation(internal.blogEngagement.softDeleteComment, {
      slug: args.slug,
      id: args.id,
      actor: args.actor,
    });
  },
});

export const sendWorldChat = action({
  args: { secret: v.string(), body: v.string(), replyToId: v.optional(v.string()), actor: actorSnapshot },
  returns: publicChatMessage,
  handler: async (ctx, args): Promise<ChatMessage> => {
    requireBridgeSecret(args.secret);
    return await ctx.runMutation(internal.worldChat.sendFromBackend, {
      body: args.body,
      replyToId: args.replyToId,
      actor: args.actor,
    });
  },
});

export const deleteWorldChat = action({
  args: { secret: v.string(), id: v.string(), actor: actorSnapshot },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    requireBridgeSecret(args.secret);
    return await ctx.runMutation(internal.worldChat.softDelete, {
      id: args.id,
      actor: args.actor,
    });
  },
});

export const getNalaSettings = action({
  args: { secret: v.string() },
  returns: publicNalaSettings,
  handler: async (ctx, args): Promise<NalaSettings> => {
    requireBridgeSecret(args.secret);
    return await ctx.runQuery(internal.nalaSettings.get, {});
  },
});

export const updateNalaSettings = action({
  args: { secret: v.string(), payload: nalaSettingsInput, actor: actorSnapshot },
  returns: publicNalaSettings,
  handler: async (ctx, args): Promise<NalaSettings> => {
    requireBridgeSecret(args.secret);
    return await ctx.runMutation(internal.nalaSettings.update, {
      payload: args.payload,
      actor: args.actor,
    });
  },
});

export const createContent = action({
  args: { secret: v.string(), payload: contentInput, actor: actorSnapshot },
  returns: publicContentEntry,
  handler: async (ctx, args): Promise<ContentEntry> => {
    requireBridgeSecret(args.secret);
    return await ctx.runMutation(internal.content.create, { payload: args.payload, actor: args.actor });
  },
});

export const upsertContent = action({
  args: { secret: v.string(), payload: contentInput, actor: actorSnapshot },
  returns: publicContentEntry,
  handler: async (ctx, args): Promise<ContentEntry> => {
    requireBridgeSecret(args.secret);
    return await ctx.runMutation(internal.content.upsert, { payload: args.payload, actor: args.actor });
  },
});

export const createInventory = action({
  args: { secret: v.string(), payload: inventoryInput, actor: actorSnapshot },
  returns: publicInventoryItem,
  handler: async (ctx, args): Promise<InventoryItem> => {
    requireBridgeSecret(args.secret);
    return await ctx.runMutation(internal.inventory.create, { payload: args.payload, actor: args.actor });
  },
});

export const createContactChannel = action({
  args: { secret: v.string(), payload: contactChannelInput, actor: actorSnapshot },
  returns: publicContactChannel,
  handler: async (ctx, args): Promise<ContactChannel> => {
    requireBridgeSecret(args.secret);
    return await ctx.runMutation(internal.contact.createChannel, { payload: args.payload, actor: args.actor });
  },
});

export const createContactEvent = action({
  args: { secret: v.string(), payload: contactEventInput },
  returns: v.object({ id: v.string(), channelKey: v.string(), eventName: v.string(), occurredAt: v.string() }),
  handler: async (ctx, args): Promise<ContactEvent> => {
    requireBridgeSecret(args.secret);
    return await ctx.runMutation(internal.contact.createEvent, { payload: args.payload });
  },
});

export const listRecordsAdmin = action({
  args: { secret: v.string(), collection: v.optional(v.string()), limit: v.optional(v.number()) },
  returns: v.array(publicRecord),
  handler: async (ctx, args): Promise<RecordResult[]> => {
    requireBridgeSecret(args.secret);
    return await ctx.runQuery(internal.records.listAdmin, { collection: args.collection, limit: args.limit });
  },
});

export const getRecordAdmin = action({
  args: { secret: v.string(), id: v.id("records") },
  returns: v.union(publicRecord, v.null()),
  handler: async (ctx, args): Promise<RecordResult | null> => {
    requireBridgeSecret(args.secret);
    return await ctx.runQuery(internal.records.getAdminById, { id: args.id });
  },
});

export const createRecord = action({
  args: {
    secret: v.string(),
    collection: v.string(),
    payload: v.any(),
    visibility: recordVisibility,
    slug: v.optional(v.string()),
    actor: actorSnapshot,
  },
  returns: publicRecord,
  handler: async (ctx, args): Promise<RecordResult> => {
    requireBridgeSecret(args.secret);
    return await ctx.runMutation(internal.records.create, {
      collection: args.collection,
      payload: args.payload,
      visibility: args.visibility,
      slug: args.slug,
      actor: args.actor,
    });
  },
});

export const removeRecord = action({
  args: { secret: v.string(), id: v.id("records"), actor: actorSnapshot },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    requireBridgeSecret(args.secret);
    return await ctx.runMutation(internal.records.remove, { id: args.id, actor: args.actor });
  },
});

export const createFileUploadUrl = action({
  args: {
    secret: v.string(),
    actor: actorSnapshot,
    sha256: v.string(),
    contentType: v.string(),
    access: v.optional(v.union(v.literal("public"), v.literal("private"))),
  },
  returns: v.object({ key: v.string(), url: v.string(), method: v.literal("PUT") }),
  handler: async (ctx, args): Promise<{ key: string; url: string; method: "PUT" }> => {
    requireBridgeSecret(args.secret);
    if (args.actor.role !== "owner" && args.actor.role !== "backend") {
      throw new Error("FILE_FORBIDDEN");
    }
    return await ctx.runAction(internal.r2Storage.generateUploadUrl, {
      sha256: args.sha256,
      contentType: args.contentType,
      access: args.access,
    });
  },
});

export const commitFile = action({
  args: {
    secret: v.string(),
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
    requireBridgeSecret(args.secret);
    return await ctx.runAction(internal.r2Storage.commitUploadedFile, {
      r2Key: args.r2Key,
      sha256: args.sha256,
      access: args.access,
      ...(args.recordId ? { recordId: args.recordId } : {}),
      ...(args.sourceKey ? { sourceKey: args.sourceKey } : {}),
      originalName: args.originalName,
      contentType: args.contentType,
      sizeBytes: args.sizeBytes,
      metadata: args.metadata,
      actor: args.actor,
    });
  },
});

export const getFile = action({
  args: { secret: v.string(), id: v.id("files") },
  returns: v.union(publicFile, v.null()),
  handler: async (ctx, args): Promise<FileResult | null> => {
    requireBridgeSecret(args.secret);
    return await ctx.runQuery(internal.files.getById, { id: args.id });
  },
});

export const findFileBySourceKey = action({
  args: { secret: v.string(), sourceKey: v.string() },
  returns: v.union(publicFile, v.null()),
  handler: async (ctx, args): Promise<FileResult | null> => {
    requireBridgeSecret(args.secret);
    return await ctx.runQuery(internal.files.getBySourceKey, { sourceKey: args.sourceKey });
  },
});

export const getFileDownloadUrl = action({
  args: { secret: v.string(), id: v.id("files"), publicOnly: v.boolean() },
  returns: v.union(v.object({
    url: v.string(),
    contentType: v.string(),
    originalName: v.string(),
    sizeBytes: v.number(),
    storageProvider: v.union(v.literal("convex"), v.literal("r2")),
  }), v.null()),
  handler: async (ctx, args): Promise<FileDownload | null> => {
    requireBridgeSecret(args.secret);
    return await ctx.runAction(internal.r2Storage.getDownloadUrl, {
      fileId: args.id,
      publicOnly: args.publicOnly,
    });
  },
});

export const listPendingFileMigrations = action({
  args: { secret: v.string(), limit: v.number() },
  returns: v.array(v.id("files")),
  handler: async (ctx, args): Promise<Id<"files">[]> => {
    requireBridgeSecret(args.secret);
    return await ctx.runQuery(internal.files.listPendingMigration, { limit: args.limit });
  },
});

export const migrateFileToR2 = action({
  args: { secret: v.string(), id: v.id("files") },
  returns: v.object({
    fileId: v.id("files"),
    status: v.union(v.literal("already_verified"), v.literal("verified")),
    targetKey: v.string(),
    sha256: v.string(),
    sizeBytes: v.number(),
  }),
  handler: async (ctx, args): Promise<FileMigrationResult> => {
    requireBridgeSecret(args.secret);
    return await ctx.runAction(internal.r2Storage.migrateLegacyFile, { fileId: args.id });
  },
});

export const getFileMigrationAudit = action({
  args: { secret: v.string() },
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
  handler: async (ctx, args): Promise<FileMigrationAudit> => {
    requireBridgeSecret(args.secret);
    return await ctx.runQuery(internal.files.migrationAudit, {});
  },
});

export const rewriteBlogFileReferences = action({
  args: { secret: v.string() },
  returns: v.object({ postsUpdated: v.number(), imageReferencesRewritten: v.number() }),
  handler: async (ctx, args): Promise<{ postsUpdated: number; imageReferencesRewritten: number }> => {
    requireBridgeSecret(args.secret);
    const audit = await ctx.runQuery(internal.files.migrationAudit, {});
    if (audit.pendingFiles || audit.unresolvedBlogAssets) {
      throw new Error("R2_REFERENCE_REWRITE_PRECONDITION_FAILED");
    }
    return await ctx.runMutation(internal.blog.rewriteR2ImageReferences, {});
  },
});
