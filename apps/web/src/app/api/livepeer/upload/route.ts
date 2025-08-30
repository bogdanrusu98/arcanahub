import { NextRequest, NextResponse } from "next/server";

/**
 * Creates a Livepeer "direct upload" request (TUS endpoint).
 * Client uploads the file directly to Livepeer using the returned endpoint.
 */
export async function POST(req: NextRequest) {
  if (!process.env.LIVEPEER_API_KEY) {
    return NextResponse.json({ error: "LIVEPEER_API_KEY is missing" }, { status: 500 });
  }

  const { name } = await req.json();

  const res = await fetch("https://livepeer.studio/api/asset/request-upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LIVEPEER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: name || `arcana-asset-${Date.now()}` }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json({ error: data?.error ?? res.status }, { status: 500 });
  }

  // Returns shape like: { asset: { id, ... }, tusEndpoint, url }
  return NextResponse.json(data);
}
