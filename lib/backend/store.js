import {
  BACKEND_BUCKET,
  createRoutedId,
  createShardClient,
  getReadyShards,
  getShardById,
  getShardIdFromRoutedId,
  pickWriteShard,
} from "@/lib/backend/shards";
import { putObject, getObject, sanitizeObjectName } from "@/lib/backend/s3";

const DEFAULT_LIMIT = 24;

function cleanCollection(value) {
  const collection = String(value || "general").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(collection)) {
    throw new Error("Collection must use lowercase letters, numbers, dash, or underscore.");
  }
  return collection;
}

function cleanVisibility(value) {
  return value === "public" ? "public" : "private";
}

function payloadObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value;
}

function limitNumber(value) {
  const limit = Number.parseInt(value || `${DEFAULT_LIMIT}`, 10);
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT;
  return Math.max(1, Math.min(100, limit));
}

function isMissingTable(error) {
  return error?.code === "42P01" || /relation .* does not exist/i.test(error?.message || "");
}

function enrichRecord(record) {
  return record
    ? {
        ...record,
        storage: {
          shardId: record.shard_id,
        },
      }
    : null;
}

function enrichFile(file) {
  return file
    ? {
        ...file,
        storage: {
          shardId: file.shard_id,
          bucketId: file.bucket_id,
          objectPath: file.object_path,
        },
      }
    : null;
}

export async function healthCheckShards() {
  const shards = getReadyShards();

  return Promise.all(
    shards.map(async (shard) => {
      try {
        const client = createShardClient(shard);
        const { error } = await client
          .from("backend_records")
          .select("id")
          .limit(1);

        if (error) {
          return {
            id: shard.id,
            projectRef: shard.projectRef,
            ok: false,
            reason: isMissingTable(error) ? "schema_missing" : error.message,
          };
        }

        return { id: shard.id, projectRef: shard.projectRef, ok: true };
      } catch (error) {
        return { id: shard.id, projectRef: shard.projectRef, ok: false, reason: error.message };
      }
    })
  );
}

export async function createRecord({ collection, payload, visibility, ownerEmail, slug }) {
  const shard = pickWriteShard();
  const client = createShardClient(shard);
  const id = createRoutedId(shard.id);

  const { data, error } = await client
    .from("backend_records")
    .insert({
      id,
      shard_id: shard.id,
      collection: cleanCollection(collection),
      slug: slug || null,
      visibility: cleanVisibility(visibility),
      owner_email: ownerEmail || null,
      payload: payloadObject(payload),
    })
    .select()
    .single();

  if (error) throw new Error(`Create record failed on ${shard.id}: ${error.message}`);
  return enrichRecord(data);
}

export async function listRecords({ collection, limit, includePrivate = false } = {}) {
  const records = await Promise.all(
    getReadyShards().map(async (shard) => {
      const client = createShardClient(shard);
      let query = client
        .from("backend_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limitNumber(limit));

      if (collection) query = query.eq("collection", cleanCollection(collection));
      if (!includePrivate) query = query.eq("visibility", "public");

      const { data, error } = await query;
      if (error) throw new Error(`List records failed on ${shard.id}: ${error.message}`);
      return data.map(enrichRecord);
    })
  );

  return records
    .flat()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limitNumber(limit));
}

async function findAcrossShards(table, id) {
  for (const shard of getReadyShards()) {
    const client = createShardClient(shard);
    const { data, error } = await client.from(table).select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`Lookup ${table} failed on ${shard.id}: ${error.message}`);
    if (data) return { shard, data };
  }
  return { shard: null, data: null };
}

export async function getRecordById(id) {
  const shardId = getShardIdFromRoutedId(id);

  if (shardId) {
    const shard = getShardById(shardId);
    const client = createShardClient(shard);
    const { data, error } = await client.from("backend_records").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`Get record failed on ${shard.id}: ${error.message}`);
    return enrichRecord(data);
  }

  const { data } = await findAcrossShards("backend_records", id);
  return enrichRecord(data);
}

export async function deleteRecordById(id) {
  const record = await getRecordById(id);
  if (!record) return false;

  const shard = getShardById(record.shard_id);
  const client = createShardClient(shard);
  const { error } = await client.from("backend_records").delete().eq("id", id);
  if (error) throw new Error(`Delete record failed on ${shard.id}: ${error.message}`);
  return true;
}

export async function uploadFile({ file, recordId, collection = "files", metadata = {} }) {
  const record = recordId ? await getRecordById(recordId) : null;
  if (recordId && !record) {
    throw new Error(`Record ${recordId} was not found.`);
  }

  const shard = record ? getShardById(record.shard_id) : pickWriteShard();
  const client = createShardClient(shard);
  const id = createRoutedId(shard.id);
  const safeName = sanitizeObjectName(file.name);
  const objectPath = `${cleanCollection(collection)}/${id}/${safeName}`;
  const contentType = file.type || "application/octet-stream";
  const buffer = Buffer.from(await file.arrayBuffer());

  await putObject({
    shard,
    bucket: BACKEND_BUCKET,
    objectPath,
    body: buffer,
    contentType,
  });

  const { data, error } = await client
    .from("backend_files")
    .insert({
      id,
      record_id: record?.id || null,
      shard_id: shard.id,
      bucket_id: BACKEND_BUCKET,
      object_path: objectPath,
      original_name: safeName,
      content_type: contentType,
      size_bytes: buffer.length,
      metadata: payloadObject(metadata),
    })
    .select()
    .single();

  if (error) throw new Error(`Create file metadata failed on ${shard.id}: ${error.message}`);

  if (record?.id) {
    await client.rpc("increment_backend_record_file_count", { target_record_id: record.id }).then(async ({ error: rpcError }) => {
      if (!rpcError) return;
      await client
        .from("backend_records")
        .update({ file_count: Math.max(0, Number(record.file_count || 0) + 1) })
        .eq("id", record.id);
    });
  }

  return enrichFile(data);
}

export async function getFileById(id) {
  const shardId = getShardIdFromRoutedId(id);

  if (shardId) {
    const shard = getShardById(shardId);
    const client = createShardClient(shard);
    const { data, error } = await client.from("backend_files").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`Get file metadata failed on ${shard.id}: ${error.message}`);
    return enrichFile(data);
  }

  const { data } = await findAcrossShards("backend_files", id);
  return enrichFile(data);
}

export async function streamFileById(id) {
  const file = await getFileById(id);
  if (!file) return null;
  const shard = getShardById(file.shard_id);
  const response = await getObject({
    shard,
    bucket: file.bucket_id,
    objectPath: file.object_path,
  });

  return { file, response };
}
