// apps/web/src/app/api/channels/route.ts
import { NextResponse } from "next/server";
import { getRecommendedChannels } from "@/lib/server/getChannels";

export const revalidate = 30; // ISR pt. route handlers

export async function GET() {
  const data = await getRecommendedChannels(20);
  return NextResponse.json({ data });
}
