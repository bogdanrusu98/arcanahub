// apps/web/src/lib/server/getChannels.ts
import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";

export type ChannelItem = {
  id: string;
  handle: string;
  name: string;
  avatar?: string | null;
  category?: string | null;
  live?: boolean;
  viewers?: number;
};

export async function getRecommendedChannels(limit = 20): Promise<ChannelItem[]> {
  const snap = await adminDb
    .collection("channels")
    .orderBy("updatedAt", "desc") // poți schimba în "live" desc, "viewers" desc, etc.
    .limit(limit)
    .get();

  return snap.docs.map(d => {
    const c = d.data() ?? {};
    return {
      id: d.id,
      handle: String(c.handle ?? d.id),
      name: String(c.name ?? "Unknown"),
      avatar: (c.avatar as string | null) ?? null, // ex: "/avatars/adi.jpg" sau URL complet
      category: (c.category as string | null) ?? null,
      live: Boolean(c.live ?? false),
      viewers: Number(c.viewers ?? 0),
    };
  });
}
