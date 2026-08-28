import { NextResponse } from "next/server";
import {
  applyBlogReaderCookie,
  blogReaderHash,
  blogReaderIdentity,
} from "@/lib/backend/blogReaderIdentity";
import { recordBlogReading } from "@/lib/backend/featureStore";
import { consumeRequestWindow, requestOriginAllowed } from "@/lib/backend/requestRateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY_BYTES = 512;

function responseWithIdentity(payload, identity, status = 200) {
  const response = NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
  return applyBlogReaderCookie(response, identity);
}

function readingError(error, identity) {
  const message = String(error?.message || "");
  const missing = message.includes("BLOG_POST_NOT_FOUND");
  const codes = [
    "BLOG_SLUG_INVALID",
    "BLOG_READER_HASH_INVALID",
    "BLOG_ACTIVE_TIME_INVALID",
    "BLOG_PROGRESS_INVALID",
    "BLOG_READING_AUTH_ENV_MISSING",
  ];
  const known = codes.find((code) => message.includes(code) || error?.code === code);
  return responseWithIdentity({
    ok: false,
    error: missing ? "BLOG_POST_NOT_FOUND" : known || "BLOG_READING_ERROR",
    message: missing ? "Published Blog post not found." : "Reading activity could not be recorded.",
  }, identity, missing ? 404 : known === "BLOG_READING_AUTH_ENV_MISSING" ? 503 : 400);
}

export async function POST(request, { params }) {
  const identity = blogReaderIdentity(request);
  if (!requestOriginAllowed(request)) {
    return responseWithIdentity({ ok: false, error: "CROSS_ORIGIN_REQUEST" }, identity, 403);
  }

  const declaredSize = Number.parseInt(request.headers.get("content-length") || "0", 10);
  if (Number.isFinite(declaredSize) && declaredSize > MAX_BODY_BYTES) {
    return responseWithIdentity({ ok: false, error: "BLOG_READING_BODY_TOO_LARGE" }, identity, 413);
  }

  let payload;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
      return responseWithIdentity({ ok: false, error: "BLOG_READING_BODY_TOO_LARGE" }, identity, 413);
    }
    payload = JSON.parse(raw);
  } catch {
    return responseWithIdentity({ ok: false, error: "BLOG_READING_BODY_INVALID" }, identity, 400);
  }

  const activeMsDelta = payload?.activeMsDelta;
  const progressBps = payload?.progressBps;
  if (!Number.isInteger(activeMsDelta) || activeMsDelta < 1 || activeMsDelta > 20_000) {
    return responseWithIdentity({ ok: false, error: "BLOG_ACTIVE_TIME_INVALID" }, identity, 400);
  }
  if (!Number.isInteger(progressBps) || progressBps < 0 || progressBps > 10_000) {
    return responseWithIdentity({ ok: false, error: "BLOG_PROGRESS_INVALID" }, identity, 400);
  }

  try {
    const { id: slug } = await params;
    const readerHash = blogReaderHash(identity.token, slug);
    const rate = consumeRequestWindow("blog-reading", readerHash, { limit: 12, windowMs: 60_000 });
    if (!rate.allowed) {
      const response = responseWithIdentity({ ok: false, error: "BLOG_READING_RATE_LIMIT" }, identity, 429);
      response.headers.set("Retry-After", String(rate.retryAfterSeconds));
      return response;
    }
    const stats = await recordBlogReading({
      slug,
      readerHash,
      activeMsDelta,
      progressBps,
    });
    return responseWithIdentity({ ok: true, stats }, identity);
  } catch (error) {
    return readingError(error, identity);
  }
}
