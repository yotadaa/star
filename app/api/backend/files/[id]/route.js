import { NextResponse } from "next/server";
import { canWriteBackend } from "@/lib/backend/routeAuth";
import { getFileById, streamFileById } from "@/lib/backend/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(error, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: error.code || "BACKEND_FILE_ERROR",
      message: error.message,
    },
    { status }
  );
}

export async function GET(request, context) {
  const actor = await canWriteBackend(request);
  if (!actor) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);

    if (searchParams.get("meta") === "1") {
      const file = await getFileById(id);
      if (!file) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
      return NextResponse.json({ ok: true, file });
    }

    const result = await streamFileById(id);
    if (!result) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

    const headers = {
      "Content-Type": result.file.content_type || "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(result.file.original_name || result.file.id)}"`,
      "Cache-Control": "private, max-age=60",
    };

    if (result.file.size_bytes) {
      headers["Content-Length"] = String(result.file.size_bytes);
    }

    return new Response(result.response.body, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}
