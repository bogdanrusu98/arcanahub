import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getServerUser } from "@/lib/getServerUser";

/**
 * Creates a Firestore "videos" document.
 * We trust the Livepeer-provided playbackUrl (works for both HLS+VOD/CDN).
 */
export async function POST(req: NextRequest) {
  const me = await getServerUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, channelId, visibility, playbackId, playbackUrl } = await req.json();

  if (!title || !channelId || !playbackUrl) {
    return NextResponse.json({ error: "title, channelId, playbackUrl are required" }, { status: 400 });
  }

  // Ownership guard: current user must own the channel
  const ch = await adminDb.collection("channels").doc(String(channelId)).get();
  if (!ch.exists) return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  if (ch.data()?.ownerUid !== me.uid) {
    return NextResponse.json({ error: "Forbidden (not channel owner)" }, { status: 403 });
  }

  const doc = await adminDb.collection("videos").add({
    title: String(title),
    channelId: String(channelId),
    visibility: visibility === "members" ? "members" : "public",
    playbackId: playbackId ? String(playbackId) : null,
    playbackUrl: String(playbackUrl),     // ✅ store the authoritative URL from Livepeer
    thumbnailUrl: null,
    createdAt: Date.now(),
  });

  return NextResponse.json({ id: doc.id });
}
