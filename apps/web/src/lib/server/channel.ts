import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { Channel, Video } from "@/types/content";

export async function getChannelByHandle(handle: string): Promise<Channel | null> {
  const snap = await adminDb.collection("channels").where("handle", "==", handle).limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data();
  return {
    id: d.id,
    handle: String(data.handle ?? "channel"),
    name: String(data.name ?? "Channel"),
    avatarUrl: (data.avatarUrl as string | null) ?? null,
    bannerUrl: (data.bannerUrl as string | null) ?? null,
    description: (data.description as string | null) ?? null,
    ownerUid: String(data.ownerUid ?? ""),
    priceId: (data.priceId as string | null) ?? null,
    subscriberCount: (data.subscriberCount as number | undefined) ?? 0,
    createdAt: (data.createdAt as number | undefined) ?? Date.now(),
  };
}

export type ChannelVideosResult = {
  items: Video[];
  nextCursor: string | null; // last doc id for pagination
};

export async function getChannelVideos(
  channelId: string,
  limit = 12,
  cursorDocId?: string
): Promise<ChannelVideosResult> {
  let q = adminDb
    .collection("videos")
    .where("channelId", "==", channelId)
    .orderBy("createdAt", "desc")
    .limit(limit);

  if (cursorDocId) {
    const cursorDoc = await adminDb.collection("videos").doc(cursorDocId).get();
    if (cursorDoc.exists) {
      q = q.startAfter(cursorDoc);
    }
  }

  const snap = await q.get();
  const items: Video[] = snap.docs.map((d) => {
    const v = d.data();
    return {
      id: d.id,
      title: String(v.title ?? "Untitled"),
      channelId: String(v.channelId ?? ""),
      playbackUrl: String(v.playbackUrl ?? ""),
      playbackId: (v.playbackId as string | null) ?? null,
      thumbnailUrl: (v.thumbnailUrl as string | null) ?? null,
      visibility: (v.visibility as "public" | "members") ?? "public",
      createdAt: Number(v.createdAt ?? Date.now()),
      views: (v.views as number | undefined) ?? 0,
      tags: (v.tags as string[] | undefined) ?? [],
      description: (v.description as string | undefined) ?? "",
      shareUrl: (v.shareUrl as string | undefined) ?? null,
    };
  });

  const nextCursor = snap.size === limit ? snap.docs[snap.docs.length - 1].id : null;
  return { items, nextCursor };
}
