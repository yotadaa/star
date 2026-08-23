import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getBlogVoteState, toggleBlogVote } from "@/lib/backend/featureStore";
import { consumeRequestWindow, requestOriginAllowed } from "@/lib/backend/requestRateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VOTER_COOKIE = "mb_blog_voter";

function voterToken(request) {
  const existing = request.cookies.get(VOTER_COOKIE)?.value || "";
  return /^[a-f0-9-]{36}$/i.test(existing) ? { token: existing, fresh: false } : { token: crypto.randomUUID(), fresh: true };
}

function voterHash(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function responseWithToken(payload, token, fresh, status = 200) {
  const response = NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
  if (fresh) {
    response.cookies.set(VOTER_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}

function errorResponse(error, token, fresh, status = 400) {
  const missing = String(error?.message || "").includes("BLOG_POST_NOT_FOUND");
  return responseWithToken({
    ok: false,
    error: missing ? "BLOG_POST_NOT_FOUND" : error.code || "BLOG_UPVOTE_ERROR",
    message: missing ? "Published Blog post not found." : error.message,
  }, token, fresh, missing ? 404 : status);
}

export async function GET(request, { params }) {
  const { id: slug } = await params;
  const identity = voterToken(request);
  try {
    const state = await getBlogVoteState({ slug, voterHash: voterHash(identity.token) });
    return responseWithToken({ ok: true, ...state }, identity.token, identity.fresh);
  } catch (error) {
    return errorResponse(error, identity.token, identity.fresh);
  }
}

export async function POST(request, { params }) {
  const identity = voterToken(request);
  if (!requestOriginAllowed(request)) {
    return responseWithToken({ ok: false, error: "CROSS_ORIGIN_REQUEST" }, identity.token, identity.fresh, 403);
  }
  const hash = voterHash(identity.token);
  const rate = consumeRequestWindow("blog-upvote", hash, { limit: 12, windowMs: 60_000 });
  if (!rate.allowed) {
    const response = responseWithToken({ ok: false, error: "BLOG_UPVOTE_RATE_LIMIT" }, identity.token, identity.fresh, 429);
    response.headers.set("Retry-After", String(rate.retryAfterSeconds));
    return response;
  }

  try {
    const { id: slug } = await params;
    const state = await toggleBlogVote({ slug, voterHash: hash });
    return responseWithToken({ ok: true, ...state }, identity.token, identity.fresh);
  } catch (error) {
    return errorResponse(error, identity.token, identity.fresh);
  }
}
