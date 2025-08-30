import { NextRequest, NextResponse } from "next/server";

/**
 * Returns Livepeer asset status. We expose: status.phase, playbackId, playbackUrl.
 * IMPORTANT: playbackUrl comes from Livepeer and may point to a VOD CDN route
 * (e.g. vod-cdn.lp-playback.studio/...); use it as-is.
 */
export async function GET(req: NextRequest) {
  const assetId = req.nextUrl.searchParams.get("assetId");
  if (!assetId) return NextResponse.json({ error: "assetId required" }, { status: 400 });

  if (!process.env.LIVEPEER_API_KEY) {
    return NextResponse.json({ error: "LIVEPEER_API_KEY is missing" }, { status: 500 });
  }

  const r = await fetch(`https://livepeer.studio/api/asset/${assetId}`, {
    headers: { Authorization: `Bearer ${process.env.LIVEPEER_API_KEY}` },
    cache: "no-store",
  });

  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    return NextResponse.json({ error: d?.error ?? r.status }, { status: 500 });
  }

  // Normalize the response we need on the client
  return NextResponse.json({
    asset: {
      id: d.id,
      status: d.status,                   // { phase: "waiting"|"processing"|"ready"|"failed"|... }
      playbackId: d.playbackId ?? null,
      playbackUrl: d.playbackUrl ?? null, // ✅ authoritative playback URL from Livepeer
    },
  });
}
