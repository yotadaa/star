import { NextResponse } from "next/server";
import { configuredShards, getMissingShardEnv } from "@/lib/backend/shards";
import { healthCheckShards } from "@/lib/backend/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = configuredShards().map((shard) => ({
    id: shard.id,
    projectRef: shard.projectRef || null,
    configured: getMissingShardEnv(shard).length === 0,
    missing: getMissingShardEnv(shard),
  }));

  try {
    const shards = await healthCheckShards();
    return NextResponse.json({
      ok: shards.every((shard) => shard.ok),
      bucket: process.env.SUPABASE_BACKEND_BUCKET || "mb-backend-assets",
      config,
      shards,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        bucket: process.env.SUPABASE_BACKEND_BUCKET || "mb-backend-assets",
        config,
        error: error.code || "BACKEND_HEALTH_ERROR",
        message: error.message,
      },
      { status: error.code === "BACKEND_ENV_MISSING" ? 503 : 500 }
    );
  }
}
