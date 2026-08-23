import { NextResponse } from "next/server";
import { getApiActor } from "@/lib/backend/routeAuth";
import { createBlogComment, deleteBlogComment } from "@/lib/backend/featureStore";
import { consumeRequestWindow, requestOriginAllowed } from "@/lib/backend/requestRateLimit";

export const dynamic = "force-dynamic";

const ERROR_STATUS = {
  BLOG_COMMENT_LOGIN_REQUIRED: 401,
  BLOG_COMMENT_FORBIDDEN: 403,
  BLOG_COMMENT_ID_INVALID: 400,
  BLOG_COMMENT_NOT_FOUND: 404,
  BLOG_COMMENT_EMPTY: 400,
  BLOG_COMMENT_TOO_LONG: 400,
  BLOG_COMMENT_COOLDOWN: 429,
  BLOG_POST_NOT_FOUND: 404,
};

function errorCode(error) {
  return Object.keys(ERROR_STATUS).find((code) => String(error?.message || "").includes(code)) || error.code || "BLOG_COMMENT_ERROR";
}

function errorResponse(error) {
  const code = errorCode(error);
  return NextResponse.json({ ok: false, error: code, message: error.message }, { status: ERROR_STATUS[code] || 400 });
}

async function authenticatedActor(request) {
  const actor = await getApiActor(request);
  return actor?.email && actor?.key ? actor : null;
}

export async function POST(request, { params }) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ ok: false, error: "CROSS_ORIGIN_REQUEST" }, { status: 403 });
  }
  const actor = await authenticatedActor(request);
  if (!actor) return NextResponse.json({ ok: false, error: "BLOG_COMMENT_LOGIN_REQUIRED" }, { status: 401 });
  const rate = consumeRequestWindow("blog-comment-create", actor.key, { limit: 5, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "BLOG_COMMENT_RATE_LIMIT", retryAfter: rate.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  try {
    const { id: slug } = await params;
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 4_096) {
      return NextResponse.json({ ok: false, error: "BLOG_COMMENT_PAYLOAD_TOO_LARGE" }, { status: 413 });
    }
    const payload = await request.json();
    const comment = await createBlogComment({ slug, body: payload?.body, actor });
    return NextResponse.json({ ok: true, comment }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request, { params }) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ ok: false, error: "CROSS_ORIGIN_REQUEST" }, { status: 403 });
  }
  const actor = await authenticatedActor(request);
  if (!actor) return NextResponse.json({ ok: false, error: "BLOG_COMMENT_LOGIN_REQUIRED" }, { status: 401 });
  const rate = consumeRequestWindow("blog-comment-delete", actor.key, { limit: 12, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ ok: false, error: "BLOG_COMMENT_RATE_LIMIT" }, { status: 429 });
  }

  try {
    const { id: slug } = await params;
    const payload = await request.json();
    const deleted = await deleteBlogComment({ slug, id: payload?.id, actor });
    return NextResponse.json({ ok: true, deleted });
  } catch (error) {
    return errorResponse(error);
  }
}
