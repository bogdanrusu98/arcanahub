import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

/**
 * JSON body: { videoId: string }
 * If video has no thumbnailUrl but has playbackId, compute a Livepeer thumb URL from template and save it.
 */
export async function POST(req: NextRequest) {
  try {
    const { videoId } = await req.json();
    if (!videoId) return NextResponse.json({ error: "Missing videoId" }, { status: 400 });

    const docRef = adminDb.collection("videos").doc(videoId);
    const snap = await docRef.get();
    if (!snap.exists) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    const data = snap.data() || {};
    const current = data.thumbnailUrl as string | undefined;
    const playbackId = data.playbackId as string | undefined;

    if (current) return NextResponse.json({ ok: true, message: "Thumbnail already set" });
    if (!playbackId) return NextResponse.json({ error: "No playbackId on video" }, { status: 400 });

    const template = process.env.NEXT_PUBLIC_LIVEPEER_THUMB_URL_TEMPLATE
      ?? "https://image.livepeer.studio/thumbnail/{playbackId}.jpg?time=5";
    const url = template.replace("{playbackId}", playbackId);

    await docRef.update({
      thumbnailUrl: url,
      thumbnailUpdatedAt: Date.now(),
    });

    return NextResponse.json({ ok: true, url });
  } catch (e: any) {
    console.error("autoThumbnail error", e);
    return NextResponse.json({ error: e?.message ?? "Failed to set thumbnail" }, { status: 500 });
  }
}
