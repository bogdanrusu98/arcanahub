import { NextRequest, NextResponse } from "next/server";

/**
 * Some assets may not have playbackId immediately.
 * This endpoint triggers Livepeer to generate playback for an asset.
 */
export async function POST(req: NextRequest) {
  if (!process.env.LIVEPEER_API_KEY) {
    return NextResponse.json({ error: "LIVEPEER_API_KEY is missing" }, { status: 500 });
  }

  const { assetId } = await req.json();
  if (!assetId) return NextResponse.json({ error: "assetId required" }, { status: 400 });

  const res = await fetch(`https://livepeer.studio/api/asset/${assetId}/request-playback`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LIVEPEER_API_KEY}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json({ error: data?.error ?? res.status }, { status: 500 });
  }

  return NextResponse.json({ playbackId: data?.playbackId ?? null });
}
