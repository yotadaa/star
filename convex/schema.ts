import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  actorRole,
  blogStatus,
  chatStatus,
  contentStatus,
  editorBlock,
  inventoryStatus,
  inventoryType,
  rarity,
  recordVisibility,
} from "./validators";

export default defineSchema({
  blogPosts: defineTable({
    legacyId: v.optional(v.string()),
    legacyShardId: v.optional(v.string()),
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    status: blogStatus,
    tags: v.array(v.string()),
    publishedAt: v.optional(v.number()),
    publishedAtLabel: v.string(),
    readTime: v.string(),
    coverTone: v.string(),
    sourceHref: v.string(),
    blocks: v.array(editorBlock),
    ownerKey: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    schemaVersion: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status_and_publishedAt", ["status", "publishedAt"])
    .index("by_legacyId", ["legacyId"]),

  worldChatMessages: defineTable({
    actorKey: v.string(),
    actorRole,
    authorName: v.string(),
    body: v.string(),
    status: chatStatus,
    sentAt: v.number(),
    deletedAt: v.optional(v.number()),
    deletedByKey: v.optional(v.string()),
    schemaVersion: v.number(),
  })
    .index("by_status_and_sentAt", ["status", "sentAt"])
    .index("by_actorKey_and_sentAt", ["actorKey", "sentAt"]),

  inventoryItems: defineTable({
    legacyId: v.optional(v.string()),
    legacyShardId: v.optional(v.string()),
    sourceKey: v.string(),
    sourceId: v.optional(v.string()),
    type: inventoryType,
    name: v.string(),
    fullName: v.string(),
    description: v.string(),
    rarity,
    icon: v.string(),
    acquiredAt: v.string(),
    linkTo: v.optional(v.string()),
    status: inventoryStatus,
    ownerKey: v.optional(v.string()),
    metadata: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
    schemaVersion: v.number(),
  })
    .index("by_sourceKey", ["sourceKey"])
    .index("by_status_and_createdAt", ["status", "createdAt"]),

  contentEntries: defineTable({
    legacyId: v.optional(v.string()),
    legacyShardId: v.optional(v.string()),
    entryKey: v.string(),
    title: v.string(),
    body: v.string(),
    payload: v.any(),
    status: contentStatus,
    ownerKey: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    schemaVersion: v.number(),
  })
    .index("by_entryKey", ["entryKey"])
    .index("by_status_and_updatedAt", ["status", "updatedAt"]),

  contactChannels: defineTable({
    legacyId: v.optional(v.string()),
    legacyShardId: v.optional(v.string()),
    channelKey: v.string(),
    label: v.string(),
    sub: v.string(),
    cta: v.string(),
    href: v.string(),
    tone: v.string(),
    sortOrder: v.number(),
    active: v.boolean(),
    ownerKey: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    schemaVersion: v.number(),
  })
    .index("by_channelKey", ["channelKey"])
    .index("by_active_and_sortOrder", ["active", "sortOrder"]),

  contactEvents: defineTable({
    channelKey: v.string(),
    eventName: v.string(),
    metadata: v.any(),
    occurredAt: v.number(),
    schemaVersion: v.number(),
  }).index("by_channelKey_and_occurredAt", ["channelKey", "occurredAt"]),

  records: defineTable({
    legacyId: v.optional(v.string()),
    collection: v.string(),
    slug: v.optional(v.string()),
    visibility: recordVisibility,
    ownerKey: v.optional(v.string()),
    payload: v.any(),
    fileCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    schemaVersion: v.number(),
  })
    .index("by_collection_and_createdAt", ["collection", "createdAt"])
    .index("by_visibility_and_createdAt", ["visibility", "createdAt"])
    .index("by_collection_and_visibility_and_createdAt", ["collection", "visibility", "createdAt"])
    .index("by_legacyId", ["legacyId"]),

  files: defineTable({
    recordId: v.optional(v.id("records")),
    storageId: v.id("_storage"),
    originalName: v.string(),
    contentType: v.string(),
    sizeBytes: v.number(),
    metadata: v.any(),
    createdAt: v.number(),
    schemaVersion: v.number(),
  }).index("by_recordId_and_createdAt", ["recordId", "createdAt"]),

  seedManifests: defineTable({
    version: v.string(),
    schemaVersion: v.number(),
    commit: v.string(),
    generatedAt: v.string(),
    sourceFiles: v.array(v.string()),
    counts: v.object({
      blogPosts: v.number(),
      inventoryItems: v.number(),
      contentEntries: v.number(),
      contactChannels: v.number(),
    }),
    checksums: v.object({
      blogPosts: v.string(),
      inventoryItems: v.string(),
      contentEntries: v.string(),
      contactChannels: v.string(),
    }),
    contentHash: v.string(),
    importedAt: v.number(),
  }).index("by_version", ["version"]),
});
