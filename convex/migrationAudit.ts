import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

const tableAudit = v.object({ count: v.number(), schemaVersionMissing: v.number(), duplicateKeys: v.array(v.string()) });
const blogTableAudit = v.object({
  count: v.number(),
  schemaVersionMissing: v.number(),
  duplicateKeys: v.array(v.string()),
  seoDataMissing: v.number(),
  imageDimensionsMissing: v.number(),
});

function auditRows<T extends { schemaVersion?: number }>(rows: T[], keyOf: (row: T) => string) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const row of rows) {
    const key = keyOf(row);
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  }
  return {
    count: rows.length,
    schemaVersionMissing: rows.filter((row) => row.schemaVersion === undefined).length,
    duplicateKeys: [...duplicates].sort(),
  };
}

function auditBlogRows(rows: Array<{
  slug: string;
  status: "draft" | "published" | "archived";
  schemaVersion?: number;
  seoTitle?: string;
  seoDescription?: string;
  language?: string;
  author?: { id: string; name: string; url: string };
  articleSection?: string;
  featuredImage?: { width: number; height: number };
  blocks: Array<{ type: string; width?: number; height?: number }>;
}>) {
  return {
    ...auditRows(rows, (row) => row.slug),
    seoDataMissing: rows.filter((row) => (
      !row.seoTitle
      || !row.seoDescription
      || !row.language
      || !row.author?.id
      || !row.author?.name
      || !row.author?.url
      || !row.articleSection
      || (row.status === "published" && !row.featuredImage)
    )).length,
    imageDimensionsMissing: rows.reduce(
      (count, row) => count + row.blocks.filter(
        (block) => block.type === "image" && (!block.width || !block.height),
      ).length,
      0,
    ),
  };
}

export const seedStatus = internalQuery({
  args: {},
  returns: v.object({
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
  }),
  handler: async (ctx) => {
    const [blogPosts, inventoryItems, contentEntries, contactChannels, worldChatMessages, blogVotes, blogComments, contactEvents, records, files, seedManifests] =
      await Promise.all([
        ctx.db.query("blogPosts").take(201),
        ctx.db.query("inventoryItems").take(201),
        ctx.db.query("contentEntries").take(201),
        ctx.db.query("contactChannels").take(201),
        ctx.db.query("worldChatMessages").take(201),
        ctx.db.query("blogVotes").take(201),
        ctx.db.query("blogComments").take(201),
        ctx.db.query("contactEvents").take(201),
        ctx.db.query("records").take(201),
        ctx.db.query("files").take(201),
        ctx.db.query("seedManifests").take(201),
      ]);
    if ([blogPosts, inventoryItems, contentEntries, contactChannels].some((rows) => rows.length > 200)) {
      throw new Error("SEED_AUDIT_LIMIT_EXCEEDED");
    }
    return {
      blogPosts: auditBlogRows(blogPosts),
      inventoryItems: auditRows(inventoryItems, (row) => row.sourceKey),
      contentEntries: auditRows(contentEntries, (row) => row.entryKey),
      contactChannels: auditRows(contactChannels, (row) => row.channelKey),
      worldChatMessages: worldChatMessages.length,
      blogVotes: blogVotes.length,
      blogComments: blogComments.length,
      contactEvents: contactEvents.length,
      records: records.length,
      files: files.length,
      seedManifests: seedManifests.length,
    };
  },
});
