import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebaseAdmin";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try { return typeof err === "string" ? err : JSON.stringify(err); }
  catch { return String(err); }
}

interface AutoThumbnailBody {
  videoId?: string;
}

/**
 * JSON body: { videoId: string }
 * If video has no thumbnailUrl but has playbackId, compute a Livepeer thumb URL from template and save it.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AutoThumbnailBody;
    const videoId = body.videoId ?? "";

    if (!videoId) {
      return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
    }

    const docRef = adminDb.collection("videos").doc(videoId);
    const snap = await docRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const data = snap.data() as {
      thumbnailUrl?: string;
      playbackId?: string;
    } | undefined;

    const current = data?.thumbnailUrl;
    const playbackId = data?.playbackId;

    if (current) {
      return NextResponse.json({ ok: true, message: "Thumbnail already set" });
    }
    if (!playbackId) {
      return NextResponse.json({ error: "No playbackId on video" }, { status: 400 });
    }

    const template =
      process.env.NEXT_PUBLIC_LIVEPEER_THUMB_URL_TEMPLATE ??
      "https://image.livepeer.studio/thumbnail/{playbackId}.jpg?time=5";

    const url = template.replace("{playbackId}", encodeURIComponent(playbackId));

    await docRef.update({
      thumbnailUrl: url,
      thumbnailUpdatedAt: Date.now(),
    });

    return NextResponse.json({ ok: true, url });
  } catch (err: unknown) {
    const msg = getErrorMessage(err);
    console.error("autoThumbnail error", msg);
    return NextResponse.json({ error: msg ?? "Failed to set thumbnail" }, { status: 500 });
  }
}
