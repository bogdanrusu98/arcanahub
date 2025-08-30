import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getServerUser } from "@/lib/getServerUser";

export async function POST(req: NextRequest) {
  const me = await getServerUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { videoId, url } = await req.json();
  if (!videoId || !url) {
    return NextResponse.json({ error: "videoId and url are required" }, { status: 400 });
  }

  const vidRef = adminDb.collection("videos").doc(videoId);
  const vid = await vidRef.get();
  if (!vid.exists) return NextResponse.json({ error: "Video not found" }, { status: 404 });

  // Optional: ensure user owns the channel of this video
  const channelId = vid.data()?.channelId as string;
  const ch = await adminDb.collection("channels").doc(channelId).get();
  if (!ch.exists || ch.data()?.ownerUid !== me.uid) {
    return NextResponse.json({ error: "Forbidden (not channel owner)" }, { status: 403 });
  }

  await vidRef.update({ thumbnailUrl: url });
  return NextResponse.json({ ok: true });
}
