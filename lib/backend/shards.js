import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const SHARD_COUNT = 3;
const ROUTED_ID_PATTERN = /^(s[1-3])_[0-9a-f]{32}$/i;

function readShard(index) {
  const prefix = `SUPABASE_SHARD_${index}`;
  const id = process.env[`${prefix}_ID`] || `s${index}`;

  return {
    id,
    index,
    projectRef: process.env[`${prefix}_PROJECT_REF`] || "",
    url: process.env[`${prefix}_URL`] || "",
    publishableKey: process.env[`${prefix}_PUBLISHABLE_KEY`] || "",
    dbHost: process.env[`${prefix}_DB_HOST`] || "",
    storageEndpoint: process.env[`${prefix}_STORAGE_ENDPOINT`] || "",
    storageRegion: process.env[`${prefix}_STORAGE_REGION`] || "",
    storageAccessKeyId: process.env[`${prefix}_STORAGE_ACCESS_KEY_ID`] || "",
    storageSecretAccessKey: process.env[`${prefix}_STORAGE_SECRET_ACCESS_KEY`] || "",
  };
}

export const BACKEND_BUCKET = process.env.SUPABASE_BACKEND_BUCKET || "mb-backend-assets";
export const BACKEND_HEADER = "x-backend-api-key";

export function getBackendAppKey() {
  return process.env.SUPABASE_BACKEND_APP_KEY || "";
}

export function configuredShards() {
  return Array.from({ length: SHARD_COUNT }, (_, index) => readShard(index + 1));
}

export function getMissingShardEnv(shard) {
  return [
    ["url", shard.url],
    ["publishableKey", shard.publishableKey],
    ["storageEndpoint", shard.storageEndpoint],
    ["storageRegion", shard.storageRegion],
    ["storageAccessKeyId", shard.storageAccessKeyId],
    ["storageSecretAccessKey", shard.storageSecretAccessKey],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

export function getReadyShards() {
  return configuredShards().filter((shard) => getMissingShardEnv(shard).length === 0);
}

export function assertBackendConfigured() {
  const missing = [];
  if (!getBackendAppKey()) missing.push("SUPABASE_BACKEND_APP_KEY");
  if (!BACKEND_BUCKET) missing.push("SUPABASE_BACKEND_BUCKET");

  for (const shard of configuredShards()) {
    for (const key of getMissingShardEnv(shard)) {
      missing.push(`SUPABASE_SHARD_${shard.index}_${key}`);
    }
  }

  if (missing.length) {
    const error = new Error(`Backend Supabase env is incomplete: ${missing.join(", ")}`);
    error.code = "BACKEND_ENV_MISSING";
    error.missing = missing;
    throw error;
  }
}

function getRoundRobinState() {
  if (!globalThis.__mbBackendShardState) {
    globalThis.__mbBackendShardState = {
      nextIndex: crypto.randomInt(0, SHARD_COUNT),
    };
  }

  return globalThis.__mbBackendShardState;
}

export function pickWriteShard() {
  assertBackendConfigured();
  const shards = getReadyShards();
  const state = getRoundRobinState();
  const shard = shards[state.nextIndex % shards.length];
  state.nextIndex += 1;
  return shard;
}

export function getShardById(shardId) {
  assertBackendConfigured();
  const shard = getReadyShards().find((item) => item.id === shardId);
  if (!shard) {
    const error = new Error(`Unknown Supabase shard: ${shardId}`);
    error.code = "UNKNOWN_SHARD";
    throw error;
  }
  return shard;
}

export function getShardIdFromRoutedId(id) {
  const match = String(id || "").match(ROUTED_ID_PATTERN);
  return match?.[1]?.toLowerCase() || null;
}

export function createRoutedId(shardId) {
  return `${shardId}_${crypto.randomUUID().replaceAll("-", "")}`;
}

class ServerNoopWebSocket {
  constructor() {
    this.readyState = 3;
  }

  send() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
}

export function createShardClient(shard) {
  const appKey = getBackendAppKey();

  return createClient(shard.url, shard.publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      transport: ServerNoopWebSocket,
    },
    global: {
      headers: {
        [BACKEND_HEADER]: appKey,
      },
    },
  });
}
