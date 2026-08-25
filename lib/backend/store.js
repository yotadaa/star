import crypto from "node:crypto";
import { api } from "@/convex/_generated/api";
import { actionConvex, queryConvex } from "@/lib/backend/convexServerClient";

const DEFAULT_LIMIT = 24;

function cleanCollection(value) {
  const collection = String(value || "general").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(collection)) {
    throw new Error("Collection must use lowercase letters, numbers, dash, or underscore.");
  }
  return collection;
}

function limitNumber(value) {
  const limit = Number.parseInt(value || `${DEFAULT_LIMIT}`, 10);
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT;
  return Math.max(1, Math.min(100, limit));
}

function bridgeSecret() {
  const secret = process.env.CONVEX_INTERNAL_API_KEY;
  if (!secret) {
    const error = new Error("CONVEX_INTERNAL_API_KEY is not configured on the Next.js server.");
    error.code = "CONVEX_BRIDGE_ENV_MISSING";
    throw error;
  }
  return secret;
}

function actorSnapshot(actor) {
  const email = String(actor?.email || "backend@local").trim().toLowerCase();
  const role = ["owner", "visitor", "backend"].includes(actor?.role) ? actor.role : "backend";
  return {
    key: actor?.key || crypto.createHash("sha256").update(email).digest("hex").slice(0, 32),
    email,
    name: String(actor?.name || email.split("@")[0] || "Backend").trim(),
    ...(actor?.image ? { image: String(actor.image) } : {}),
    role,
  };
}

export async function healthCheckBackend() {
  const status = await actionConvex(api.bridge.health, { secret: bridgeSecret() });
  return [{ id: "convex", projectRef: process.env.CONVEX_DEPLOYMENT || "development", ok: true, status }];
}

export async function createRecord({ collection, payload, visibility, slug, actor }) {
  return await actionConvex(api.bridge.createRecord, {
    secret: bridgeSecret(),
    collection: cleanCollection(collection),
    payload: payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {},
    visibility: visibility === "public" ? "public" : "private",
    ...(slug ? { slug: String(slug) } : {}),
    actor: actorSnapshot(actor),
  });
}

export async function listRecords({ collection, limit, includePrivate = false } = {}) {
  const args = {
    ...(collection ? { collection: cleanCollection(collection) } : {}),
    limit: limitNumber(limit),
  };
  if (includePrivate) {
    return await actionConvex(api.bridge.listRecordsAdmin, { secret: bridgeSecret(), ...args });
  }
  return await queryConvex(api.records.listPublic, args);
}

export async function getRecordById(id) {
  return await actionConvex(api.bridge.getRecordAdmin, { secret: bridgeSecret(), id });
}

export async function deleteRecordById(id, actor) {
  return await actionConvex(api.bridge.removeRecord, {
    secret: bridgeSecret(),
    id,
    actor: actorSnapshot(actor),
  });
}

export async function uploadFile({ file, recordId, sourceKey, metadata = {}, actor }) {
  const actorData = actorSnapshot(actor);
  const contentType = file.type || "application/octet-stream";
  const bytes = Buffer.from(await file.arrayBuffer());
  const checksum = crypto.createHash("sha256").update(bytes).digest("hex");
  const access = recordId ? "private" : (metadata?.purpose === "blog-image-block" ? "public" : "private");
  const resolvedSourceKey = sourceKey
    ? String(sourceKey)
    : (metadata?.purpose === "blog-image-block" ? `blog:editor:${checksum}` : undefined);
  const upload = await actionConvex(api.bridge.createFileUploadUrl, {
    secret: bridgeSecret(),
    actor: actorData,
    sha256: checksum,
    contentType,
    access,
  });
  const uploadResponse = await fetch(upload.url, {
    method: upload.method,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": access === "public" ? "public, max-age=31536000, immutable" : "private, no-store",
    },
    body: bytes,
  });
  if (!uploadResponse.ok) throw new Error(`R2 file upload failed: ${uploadResponse.status}`);
  const fileId = await actionConvex(api.bridge.commitFile, {
    secret: bridgeSecret(),
    r2Key: upload.key,
    sha256: checksum,
    access,
    ...(recordId ? { recordId: String(recordId) } : {}),
    ...(resolvedSourceKey ? { sourceKey: resolvedSourceKey } : {}),
    originalName: String(file.name || "file"),
    contentType,
    sizeBytes: bytes.byteLength,
    metadata: metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata : {},
    actor: actorData,
  });
  return await getFileById(fileId);
}

export async function getFileById(id) {
  return await actionConvex(api.bridge.getFile, { secret: bridgeSecret(), id });
}

export async function getFileDownloadById(id, { publicOnly = false } = {}) {
  return await actionConvex(api.bridge.getFileDownloadUrl, {
    secret: bridgeSecret(),
    id,
    publicOnly,
  });
}
