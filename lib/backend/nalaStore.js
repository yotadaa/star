import crypto from "node:crypto";
import {
  createRoutedId,
  createShardClient,
  getReadyShards,
  getShardById,
  getShardIdFromRoutedId,
} from "@/lib/backend/shards";

const MAX_BODY_LENGTH = 4000;

function cleanText(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function cleanExpression(value) {
  return ["idle", "thinking", "happy", "confused", "greeting", "pointing"].includes(value) ? value : "idle";
}

function cleanSource(value) {
  return ["openrouter", "local-factual", "error"].includes(value) ? value : "local-factual";
}

function jsonObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function hashKey(value) {
  return crypto.createHash("sha256").update(cleanText(value, "anonymous")).digest("hex").slice(0, 32);
}

function truncateBody(value) {
  const body = cleanText(value);
  return body.length > MAX_BODY_LENGTH ? body.slice(0, MAX_BODY_LENGTH) : body;
}

function isSchemaUnavailable(error) {
  const message = error?.message || "";
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    /schema cache/i.test(message) ||
    /relation .* does not exist/i.test(message) ||
    /could not find the table/i.test(message)
  );
}

async function pickNalaWriteShard() {
  const stateKey = "__mbNalaShardState";
  if (!globalThis[stateKey]) {
    globalThis[stateKey] = { index: crypto.randomInt(0, Math.max(1, getReadyShards().length || 1)), shards: [], expiresAt: 0 };
  }

  const state = globalThis[stateKey];
  const now = Date.now();
  if (!state.shards.length || state.expiresAt < now) {
    const candidates = [];
    for (const shard of getReadyShards()) {
      try {
        const client = createShardClient(shard);
        const { error } = await client.from("nala_conversations").select("id").limit(1);
        if (!error) candidates.push(shard);
      } catch {
        // Health is reported by the route response; unavailable shards are skipped for writes.
      }
    }
    state.shards = candidates;
    state.expiresAt = now + 30_000;
  }

  if (!state.shards.length) {
    const error = new Error("No migrated Supabase shard is available for Nala. Run npm run supabase:setup first.");
    error.code = "NO_NALA_SHARD";
    throw error;
  }

  const shard = state.shards[state.index % state.shards.length];
  state.index += 1;
  return shard;
}

async function getConversation(conversationId) {
  const shardId = getShardIdFromRoutedId(conversationId);
  if (!shardId) return null;

  const shard = getShardById(shardId);
  const client = createShardClient(shard);
  const { data, error } = await client
    .from("nala_conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();

  if (error) throw error;
  return data ? { row: data, shard } : null;
}

async function createConversation({ sessionKey, source, expression, metadata }) {
  const shard = await pickNalaWriteShard();
  const client = createShardClient(shard);
  const id = createRoutedId(shard.id);
  const hashedSession = hashKey(sessionKey);

  const { data, error } = await client
    .from("nala_conversations")
    .insert({
      id,
      shard_id: shard.id,
      session_key: hashedSession,
      actor_key: hashedSession,
      source: cleanSource(source),
      last_expression: cleanExpression(expression),
      metadata: jsonObject(metadata),
    })
    .select()
    .single();

  if (error) throw error;
  return { row: data, shard };
}

export async function storeNalaExchange({
  conversationId,
  sessionKey,
  userMessage,
  assistantMessage,
  expression,
  source,
  toolResults,
  action,
  metadata,
}) {
  let conversation = null;
  try {
    conversation = await getConversation(conversationId);
  } catch (error) {
    if (!isSchemaUnavailable(error)) throw error;
  }

  if (!conversation) {
    conversation = await createConversation({ sessionKey, source, expression, metadata });
  }

  const { row, shard } = conversation;
  const client = createShardClient(shard);
  const userBody = truncateBody(userMessage);
  const assistantBody = truncateBody(assistantMessage);

  if (!userBody || !assistantBody) {
    const error = new Error("Nala messages cannot be empty.");
    error.code = "NALA_EMPTY_MESSAGE";
    throw error;
  }

  const messageRows = [
    {
      id: createRoutedId(shard.id),
      shard_id: shard.id,
      conversation_id: row.id,
      role: "user",
      body: userBody,
      tool_payload: {},
      metadata: jsonObject(metadata),
    },
    {
      id: createRoutedId(shard.id),
      shard_id: shard.id,
      conversation_id: row.id,
      role: "assistant",
      body: assistantBody,
      expression: cleanExpression(expression),
      tool_payload: { tools: Array.isArray(toolResults) ? toolResults.slice(0, 8) : [], action: action || null },
      metadata: { ...jsonObject(metadata), source: cleanSource(source) },
    },
  ];

  const { data, error } = await client.from("nala_messages").insert(messageRows).select();
  if (error) throw error;

  const { error: updateError } = await client
    .from("nala_conversations")
    .update({
      source: cleanSource(source),
      last_expression: cleanExpression(expression),
      last_message_at: new Date().toISOString(),
      metadata: { ...jsonObject(row.metadata), ...jsonObject(metadata), action: action || null },
    })
    .eq("id", row.id);

  if (updateError) throw updateError;

  return {
    conversationId: row.id,
    storage: { shardId: shard.id },
    messages: data || [],
  };
}
