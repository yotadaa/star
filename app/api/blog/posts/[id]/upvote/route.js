import { NextResponse } from "next/server";
import { getBlogVoteState, toggleBlogVote } from "@/lib/backend/featureStore";
import {
  applyBlogReaderCookie,
  blogReaderIdentity,
  blogVoterHash,
} from "@/lib/backend/blogReaderIdentity";
import { consumeRequestWindow, requestOriginAllowed } from "@/lib/backend/requestRateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function responseWithToken(payload, token, fresh, status = 200) {
  const response = NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
  return applyBlogReaderCookie(response, { token, fresh });
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
  const identity = blogReaderIdentity(request);
  try {
    const state = await getBlogVoteState({ slug, voterHash: blogVoterHash(identity.token) });
    return responseWithToken({ ok: true, ...state }, identity.token, identity.fresh);
  } catch (error) {
    return errorResponse(error, identity.token, identity.fresh);
  }
}

export async function POST(request, { params }) {
  const identity = blogReaderIdentity(request);
  if (!requestOriginAllowed(request)) {
    return responseWithToken({ ok: false, error: "CROSS_ORIGIN_REQUEST" }, identity.token, identity.fresh, 403);
  }
  const hash = blogVoterHash(identity.token);
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
