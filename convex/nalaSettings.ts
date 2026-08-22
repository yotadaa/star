import { internalMutation, internalQuery } from "./_generated/server";
import { actorSnapshot, nalaSettingsInput, publicNalaSettings } from "./validators";

const CONFIG_KEY = "primary";

type NalaSettings = {
  enabled: boolean;
  model: string;
  systemPromptSupplement: string;
  temperature: number;
  maxTokens: number;
  updatedAt: number | null;
  persisted: boolean;
};

const DEFAULT_SETTINGS: NalaSettings = {
  enabled: true,
  model: "openrouter/auto",
  systemPromptSupplement: "",
  temperature: 0.25,
  maxTokens: 620,
  updatedAt: null,
  persisted: false,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeModel(value: string) {
  const model = value.trim().slice(0, 160);
  if (!model || !/^[a-z0-9._~:/-]+$/i.test(model)) throw new Error("NALA_MODEL_INVALID");
  return model;
}

export const get = internalQuery({
  args: {},
  returns: publicNalaSettings,
  handler: async (ctx): Promise<NalaSettings> => {
    const row = await ctx.db
      .query("nalaSettings")
      .withIndex("by_configKey", (q) => q.eq("configKey", CONFIG_KEY))
      .unique();
    if (!row) return DEFAULT_SETTINGS;
    return {
      enabled: row.enabled,
      model: row.model,
      systemPromptSupplement: row.systemPromptSupplement,
      temperature: row.temperature,
      maxTokens: row.maxTokens,
      updatedAt: row.updatedAt,
      persisted: true,
    };
  },
});

export const update = internalMutation({
  args: { payload: nalaSettingsInput, actor: actorSnapshot },
  returns: publicNalaSettings,
  handler: async (ctx, args): Promise<NalaSettings> => {
    if (args.actor.role !== "owner" && args.actor.role !== "backend") {
      throw new Error("NALA_CONFIG_FORBIDDEN");
    }

    const now = Date.now();
    const next = {
      configKey: CONFIG_KEY,
      enabled: Boolean(args.payload.enabled),
      model: normalizeModel(args.payload.model),
      systemPromptSupplement: args.payload.systemPromptSupplement.trim().slice(0, 2400),
      temperature: clamp(Number(args.payload.temperature) || 0, 0, 2),
      maxTokens: Math.round(clamp(Number(args.payload.maxTokens) || 620, 64, 1200)),
      updatedAt: now,
      updatedByKey: args.actor.key,
      schemaVersion: 1,
    };
    const row = await ctx.db
      .query("nalaSettings")
      .withIndex("by_configKey", (q) => q.eq("configKey", CONFIG_KEY))
      .unique();
    if (row) await ctx.db.patch(row._id, next);
    else await ctx.db.insert("nalaSettings", next);

    return {
      enabled: next.enabled,
      model: next.model,
      systemPromptSupplement: next.systemPromptSupplement,
      temperature: next.temperature,
      maxTokens: next.maxTokens,
      updatedAt: now,
      persisted: true,
    };
  },
});
