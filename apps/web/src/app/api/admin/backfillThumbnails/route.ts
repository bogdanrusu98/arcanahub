import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebaseAdmin";

export async function POST(_req: NextRequest) {
  const snap = await adminDb.collection("videos").get();
  const batch = adminDb.batch();
  let updated = 0;

  snap.docs.forEach((doc) => {
    const v = doc.data() as { title?: string; thumbnailUrl?: string; playbackId?: string | null };
    if (!v.thumbnailUrl) {
      const q = new URLSearchParams();
      if (v.playbackId) q.set("playbackId", v.playbackId);
      q.set("title", (v.title ?? "Video").slice(0, 80));
      q.set("t", "5");
      const local = `/thumb/frame?${q.toString()}`;
      batch.update(doc.ref, {
        thumbnailUrl: local,
        thumbnailUpdatedAt: Date.now(),
      });
      updated += 1;
    }
  });

  if (updated > 0) await batch.commit();
  return NextResponse.json({ ok: true, updated });
}
