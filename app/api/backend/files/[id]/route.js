import { NextResponse } from "next/server";
import { canWriteBackend } from "@/lib/backend/routeAuth";
import { getFileById, getFileDownloadById } from "@/lib/backend/store";

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

    const download = await getFileDownloadById(id);
    if (!download) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    const response = NextResponse.redirect(download.url, 307);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
