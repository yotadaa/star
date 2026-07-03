import { NextResponse } from "next/server";
import { configuredShards, getMissingShardEnv } from "@/lib/backend/shards";

export const dynamic = "force-dynamic";

export async function GET() {
  const shards = configuredShards()
    .filter((shard) => getMissingShardEnv(shard).length === 0)
    .map((shard) => ({
      id: shard.id,
      url: shard.url,
      publishableKey: shard.publishableKey,
      channel: "chat:public",
    }));

  return NextResponse.json({
    ok: true,
    mode: "broadcast-public-read",
    events: ["message_created", "message_updated", "message_deleted"],
    shards,
  });
}
