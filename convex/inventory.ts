import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, query } from "./_generated/server";
import {
  actorSnapshot,
  inventoryInput,
  publicInventoryItem,
} from "./validators";

function cleanText(value: string | undefined, fallback = "") {
  return String(value ?? fallback).trim();
}

function toPublic(item: Doc<"inventoryItems">) {
  return {
    id: item._id,
    sourceId: item.sourceId,
    type: item.type,
    icon: item.icon,
    name: item.name,
    fullName: item.fullName,
    description: item.description,
    rarity: item.rarity,
    acquiredAt: item.acquiredAt,
    linkTo: item.linkTo,
  };
}

export const listUnlocked = query({
  args: {},
  returns: v.object({
    items: v.array(publicInventoryItem),
    source: v.literal("convex"),
    warnings: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const items = await ctx.db
      .query("inventoryItems")
      .withIndex("by_status_and_createdAt", (q) => q.eq("status", "unlocked"))
      .order("desc")
      .take(80);
    return { items: items.map(toPublic), source: "convex" as const, warnings: [] };
  },
});

export const create = internalMutation({
  args: { payload: inventoryInput, actor: actorSnapshot },
  returns: publicInventoryItem,
  handler: async (ctx, args) => {
    const now = Date.now();
    const type = args.payload.type ?? "artifact";
    const fullName = cleanText(args.payload.fullName || args.payload.name, "Artifact");
    const sourceId = cleanText(args.payload.sourceId || args.payload.source_id) || undefined;
    const sourceKey = sourceId || `manual:${args.actor.key}:${now}`;
    const existing = await ctx.db
      .query("inventoryItems")
      .withIndex("by_sourceKey", (q) => q.eq("sourceKey", sourceKey))
      .unique();
    if (existing) throw new Error("INVENTORY_SOURCE_CONFLICT");
    const id = await ctx.db.insert("inventoryItems", {
      sourceKey,
      sourceId,
      type,
      icon: cleanText(args.payload.icon, type === "scroll" ? "icon-scroll" : "icon-artifact-vase"),
      name: cleanText(args.payload.name, fullName),
      fullName,
      description: cleanText(args.payload.description),
      rarity: args.payload.rarity ?? "common",
      acquiredAt: cleanText(args.payload.acquiredAt || args.payload.acquired_at_label, "Manual unlock"),
      linkTo: cleanText(args.payload.linkTo || args.payload.link_to) || undefined,
      status: args.payload.status ?? "unlocked",
      ownerKey: args.actor.key,
      metadata: args.payload.metadata ?? {},
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
    });
    const item = await ctx.db.get(id);
    if (!item) throw new Error("INVENTORY_CREATE_FAILED");
    return toPublic(item);
  },
});
