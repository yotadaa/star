import { NextResponse } from "next/server";
import { canWriteBackend, getApiActor } from "@/lib/backend/routeAuth";
import { createBlogPost, listBlogPosts } from "@/lib/backend/featureStore";

export const dynamic = "force-dynamic";

function errorResponse(error, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: error.code || "BLOG_API_ERROR",
      message: error.message,
    },
    { status }
  );
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const actor = await getApiActor(request);
    const includeDrafts = actor?.role === "owner" || actor?.role === "backend";
    const result = await listBlogPosts({
      includeDrafts,
      limit: searchParams.get("limit"),
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  const actor = await canWriteBackend(request);
  if (!actor) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const post = await createBlogPost({ payload, actor });
    return NextResponse.json({ ok: true, post, source: "supabase" }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 400);
  }
}
