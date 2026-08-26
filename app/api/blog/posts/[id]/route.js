import { NextResponse } from "next/server";
import { canWriteBackend, getApiActor } from "@/lib/backend/routeAuth";
import { getBlogPostById, updateBlogPost } from "@/lib/backend/featureStore";
import { notifyBlogChange } from "@/lib/indexNow";

export const dynamic = "force-dynamic";

function errorResponse(error, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: error.code || "BLOG_POST_API_ERROR",
      message: error.message,
    },
    { status }
  );
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const result = await getBlogPostById(id);
    if (!result.post) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request, { params }) {
  const actor = await canWriteBackend(request);
  if (!actor) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const payload = await request.json();
    const { post: previousPost } = await getBlogPostById(id);
    const post = await updateBlogPost(id, { payload, actor });
    if (!post) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND_OR_LOCAL_FALLBACK" }, { status: 404 });
    }

    const indexNow = await notifyBlogChange({ post, previousPost });
    return NextResponse.json({ ok: true, post, source: "convex", indexNow });
  } catch (error) {
    return errorResponse(error, 400);
  }
}
