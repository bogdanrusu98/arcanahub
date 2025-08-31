import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebaseAdmin";

/**
 * Increments the "views" counter for a video document.
 * Uses a transaction to be safe in concurrent updates.
 */
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 in Next 15, params is a Promise
) {
  const { id } = await context.params; // 👈 await it

  const ref = adminDb.collection("videos").doc(id);

  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("Video not found");
    const prev = (snap.data()?.views as number) ?? 0;
    tx.update(ref, { views: prev + 1, lastViewedAt: Date.now() });
  });

  return NextResponse.json({ ok: true });
}
