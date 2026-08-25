import { NextResponse } from "next/server";
import { getFileDownloadById } from "@/lib/backend/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request, context) {
  try {
    const { id } = await context.params;
    const download = await getFileDownloadById(id, { publicOnly: true });
    if (!download) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }
    const response = NextResponse.redirect(download.url, 307);
    response.headers.set("Cache-Control", "public, max-age=120, stale-while-revalidate=600");
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
  } catch (error) {
    const status = error instanceof Error && error.message === "FILE_NOT_PUBLIC" ? 403 : 404;
    return NextResponse.json({ ok: false, error: status === 403 ? "FORBIDDEN" : "NOT_FOUND" }, { status });
  }
}
