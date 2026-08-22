import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

const tableAudit = v.object({ count: v.number(), schemaVersionMissing: v.number(), duplicateKeys: v.array(v.string()) });

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

export const seedStatus = internalQuery({
  args: {},
  returns: v.object({
    blogPosts: tableAudit,
    inventoryItems: tableAudit,
    contentEntries: tableAudit,
    contactChannels: tableAudit,
    worldChatMessages: v.number(),
    contactEvents: v.number(),
    records: v.number(),
    files: v.number(),
    seedManifests: v.number(),
  }),
  handler: async (ctx) => {
    const [blogPosts, inventoryItems, contentEntries, contactChannels, worldChatMessages, contactEvents, records, files, seedManifests] =
      await Promise.all([
        ctx.db.query("blogPosts").take(201),
        ctx.db.query("inventoryItems").take(201),
        ctx.db.query("contentEntries").take(201),
        ctx.db.query("contactChannels").take(201),
        ctx.db.query("worldChatMessages").take(201),
        ctx.db.query("contactEvents").take(201),
        ctx.db.query("records").take(201),
        ctx.db.query("files").take(201),
        ctx.db.query("seedManifests").take(201),
      ]);
    if ([blogPosts, inventoryItems, contentEntries, contactChannels].some((rows) => rows.length > 200)) {
      throw new Error("SEED_AUDIT_LIMIT_EXCEEDED");
    }
    return {
      blogPosts: auditRows(blogPosts, (row) => row.slug),
      inventoryItems: auditRows(inventoryItems, (row) => row.sourceKey),
      contentEntries: auditRows(contentEntries, (row) => row.entryKey),
      contactChannels: auditRows(contactChannels, (row) => row.channelKey),
      worldChatMessages: worldChatMessages.length,
      contactEvents: contactEvents.length,
      records: records.length,
      files: files.length,
      seedManifests: seedManifests.length,
    };
  },
});
