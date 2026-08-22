import { NextResponse } from "next/server";
import { createContactEvent } from "@/lib/backend/featureStore";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const payload = await request.json();
    const event = await createContactEvent({ payload });
    return NextResponse.json({ ok: true, event, source: "convex" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.code || "CONTACT_EVENT_API_ERROR",
        message: error.message,
      },
      { status: 400 }
    );
  }
}
