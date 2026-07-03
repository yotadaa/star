import crypto from "node:crypto";

const SERVICE = "s3";
const UNSAFE_KEY_CHARS = /[^a-zA-Z0-9._/-]/g;

function hashHex(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hmac(key, value, encoding) {
  return crypto.createHmac("sha256", key).update(value).digest(encoding);
}

function amzDate(now = new Date()) {
  const compact = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return {
    dateTime: compact,
    date: compact.slice(0, 8),
  };
}

function encodePathSegment(segment) {
  return encodeURIComponent(segment).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function encodeObjectPath(path) {
  return path.split("/").map(encodePathSegment).join("/");
}

export function sanitizeObjectName(name) {
  const cleaned = String(name || "file")
    .trim()
    .replaceAll("\\", "/")
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(UNSAFE_KEY_CHARS, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);

  return cleaned || "file";
}

function signingKey(secretAccessKey, date, region) {
  const kDate = hmac(`AWS4${secretAccessKey}`, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, SERVICE);
  return hmac(kService, "aws4_request");
}

function signedHeaders({ shard, method, bucket, objectPath, payload = Buffer.alloc(0), contentType }) {
  const endpoint = new URL(shard.storageEndpoint);
  const { date, dateTime } = amzDate();
  const canonicalUri = `${endpoint.pathname.replace(/\/$/, "")}/${encodePathSegment(bucket)}/${encodeObjectPath(objectPath)}`;
  const payloadHash = hashHex(payload);
  const canonicalHeaders = [
    `host:${endpoint.host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${dateTime}`,
  ].join("\n");
  const signedHeaderNames = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    method,
    canonicalUri,
    "",
    `${canonicalHeaders}\n`,
    signedHeaderNames,
    payloadHash,
  ].join("\n");
  const scope = `${date}/${shard.storageRegion}/${SERVICE}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    dateTime,
    scope,
    hashHex(canonicalRequest),
  ].join("\n");
  const signature = hmac(signingKey(shard.storageSecretAccessKey, date, shard.storageRegion), stringToSign, "hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${shard.storageAccessKeyId}/${scope}, SignedHeaders=${signedHeaderNames}, Signature=${signature}`;
  const url = new URL(canonicalUri, `${endpoint.protocol}//${endpoint.host}`);

  const headers = {
    Authorization: authorization,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": dateTime,
  };

  if (contentType) headers["content-type"] = contentType;

  return { url, headers };
}

export async function putObject({ shard, bucket, objectPath, body, contentType }) {
  const payload = Buffer.isBuffer(body) ? body : Buffer.from(body);
  const { url, headers } = signedHeaders({
    shard,
    method: "PUT",
    bucket,
    objectPath,
    payload,
    contentType,
  });

  const response = await fetch(url, {
    method: "PUT",
    headers,
    body: payload,
  });

  if (!response.ok) {
    throw new Error(`S3 put failed on ${shard.id}: ${response.status} ${await response.text()}`);
  }

  return { bucket, objectPath, size: payload.length };
}

export async function getObject({ shard, bucket, objectPath }) {
  const { url, headers } = signedHeaders({
    shard,
    method: "GET",
    bucket,
    objectPath,
  });

  const response = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`S3 get failed on ${shard.id}: ${response.status} ${await response.text()}`);
  }

  return response;
}

export async function deleteObject({ shard, bucket, objectPath }) {
  const { url, headers } = signedHeaders({
    shard,
    method: "DELETE",
    bucket,
    objectPath,
  });

  const response = await fetch(url, {
    method: "DELETE",
    headers,
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`S3 delete failed on ${shard.id}: ${response.status} ${await response.text()}`);
  }
}
