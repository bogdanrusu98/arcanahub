import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getServerUser } from "@/lib/getServerUser";

export async function POST(req: NextRequest) {
  const me = await getServerUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { handle, name, description } = await req.json();

  if (!handle || typeof handle !== "string") {
    return NextResponse.json({ error: "handle is required" }, { status: 400 });
  }
  const safeHandle = handle.trim().toLowerCase();

  // Uniqueness check
  const existing = await adminDb
    .collection("channels")
    .where("handle", "==", safeHandle)
    .limit(1)
    .get();
  if (!existing.empty) {
    return NextResponse.json({ error: "Handle already taken" }, { status: 409 });
  }

  const doc = await adminDb.collection("channels").add({
    handle: safeHandle,
    name: name?.trim() || safeHandle,
    description: description?.trim() || "",
    ownerUid: me.uid,
    createdAt: Date.now(),
  });

  return NextResponse.json({ id: doc.id, handle: safeHandle });
}
