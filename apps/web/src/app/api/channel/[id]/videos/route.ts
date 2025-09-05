import { NextRequest, NextResponse } from "next/server";
import { getChannelVideos } from "@/lib/server/channel";

/** GET /api/channel/:id/videos?limit=12&cursor=<lastDocId> */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const cursor = searchParams.get("cursor") || undefined;

  const limit = Math.min(Math.max(Number(limitParam ?? "12"), 1), 50);

  const channelId = params.id;
  if (!channelId) {
    return NextResponse.json({ error: "Missing channel id" }, { status: 400 });
  }

  const { items, nextCursor } = await getChannelVideos(channelId, limit, cursor);
  return NextResponse.json({ items, nextCursor });
}
