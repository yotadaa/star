import { NextResponse } from "next/server";
import { healthCheckBackend } from "@/lib/backend/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const services = await healthCheckBackend();
    return NextResponse.json({
      ok: services.every((service) => service.ok),
      backend: "convex",
      deployment: process.env.CONVEX_DEPLOYMENT || null,
      services,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        backend: "convex",
        deployment: process.env.CONVEX_DEPLOYMENT || null,
        error: error.code || "BACKEND_HEALTH_ERROR",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
