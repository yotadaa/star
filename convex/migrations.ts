import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api";
import schema from "./schema";

export const migrations = new Migrations(components.migrations, { schema });

export const backfillBlogSchemaVersion = migrations.define({
  table: "blogPosts",
  migrateOne: (_ctx, row) => row.schemaVersion === undefined ? { schemaVersion: 1 } : undefined,
});

export const backfillChatSchemaVersion = migrations.define({
  table: "worldChatMessages",
  migrateOne: (_ctx, row) => row.schemaVersion === undefined ? { schemaVersion: 1 } : undefined,
});

export const backfillInventorySchemaVersion = migrations.define({
  table: "inventoryItems",
  migrateOne: (_ctx, row) => row.schemaVersion === undefined ? { schemaVersion: 1 } : undefined,
});

export const backfillContentSchemaVersion = migrations.define({
  table: "contentEntries",
  migrateOne: (_ctx, row) => row.schemaVersion === undefined ? { schemaVersion: 1 } : undefined,
});

export const backfillContactChannelSchemaVersion = migrations.define({
  table: "contactChannels",
  migrateOne: (_ctx, row) => row.schemaVersion === undefined ? { schemaVersion: 1 } : undefined,
});

export const backfillContactEventSchemaVersion = migrations.define({
  table: "contactEvents",
  migrateOne: (_ctx, row) => row.schemaVersion === undefined ? { schemaVersion: 1 } : undefined,
});

export const backfillRecordSchemaVersion = migrations.define({
  table: "records",
  migrateOne: (_ctx, row) => row.schemaVersion === undefined ? { schemaVersion: 1 } : undefined,
});

export const backfillFileSchemaVersion = migrations.define({
  table: "files",
  migrateOne: (_ctx, row) => row.schemaVersion === undefined ? { schemaVersion: 1 } : undefined,
});

export const runAll = migrations.runner([
  internal.migrations.backfillBlogSchemaVersion,
  internal.migrations.backfillChatSchemaVersion,
  internal.migrations.backfillInventorySchemaVersion,
  internal.migrations.backfillContentSchemaVersion,
  internal.migrations.backfillContactChannelSchemaVersion,
  internal.migrations.backfillContactEventSchemaVersion,
  internal.migrations.backfillRecordSchemaVersion,
  internal.migrations.backfillFileSchemaVersion,
]);
