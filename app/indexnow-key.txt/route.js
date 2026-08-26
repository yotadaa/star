import { configuredIndexNowKey } from "@/lib/indexNow";

export const dynamic = "force-dynamic";

const headers = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "public, max-age=300, stale-while-revalidate=300",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function GET() {
  try {
    return new Response(configuredIndexNowKey(), { status: 200, headers });
  } catch {
    return new Response("IndexNow key is unavailable.\n", {
      status: 503,
      headers: { ...headers, "Cache-Control": "no-store" },
    });
  }
}
