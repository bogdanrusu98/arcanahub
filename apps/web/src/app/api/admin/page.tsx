import { getServerUser } from "@/lib/getServerUser";
import { adminDb } from "@/lib/server/firebaseAdmin";
import NewChannelForm from "./ui/NewChannelForm";
import VideoUpload from "./ui/VideoUpload";
import { Channel } from "@/types/content";
import ThumbnailUpload from "./ui/ThumbnailUpload";
import { Video } from "@/types/content";

async function getMyChannels(uid: string): Promise<Channel[]> {
  const snap = await adminDb.collection("channels").where("ownerUid", "==", uid).get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      handle: String(data.handle ?? "channel"),
      name: String(data.name ?? "Channel"),
      ownerUid: String(data.ownerUid ?? ""),
      avatarUrl: (data.avatarUrl as string | undefined) ?? null,
      priceId: (data.priceId as string | undefined) ?? undefined,
    };
  });
}

async function getMyVideos(uid: string): Promise<Video[]> {
  const channelsSnap = await adminDb.collection("channels").where("ownerUid", "==", uid).get();
  const channelIds = channelsSnap.docs.map((d) => d.id);
  if (channelIds.length === 0) return [];
  const videosSnap = await adminDb
    .collection("videos")
    .where("channelId", "in", channelIds.slice(0, 10)) // Firestore 'in' supports max 10 values
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  return videosSnap.docs.map((d) => {
    const v = d.data();
    return {
      id: d.id,
      title: String(v.title ?? "Untitled"),
      channelId: String(v.channelId ?? ""),
      playbackUrl: String(v.playbackUrl ?? ""),
      playbackId: (v.playbackId as string | null) ?? null,
      thumbnailUrl: (v.thumbnailUrl as string | undefined) ?? null,
      visibility: (v.visibility as "public" | "members") ?? "public",
      createdAt: Number(v.createdAt ?? Date.now()),
      views: (v.views as number | undefined) ?? 0,
      tags: (v.tags as string[] | undefined) ?? [],
      description: (v.description as string | undefined) ?? "",
      shareUrl: (v.shareUrl as string | undefined) ?? null,
    } as Video;
  });
}

export default async function AdminPage() {
  const user = await getServerUser();
  if (!user) return <div>Please log in.</div>;

  const channels = await getMyChannels(user.uid);
  const myVideos = await getMyVideos(user.uid);

  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-bold">Admin</h1>

      <NewChannelForm ownerUid={user.uid} />

      <div className="rounded border border-neutral-800 p-4">
        <h2 className="font-semibold mb-3">Upload video to a channel</h2>
        {channels.length === 0 ? <p className="text-neutral-400">Create a channel first.</p> : <VideoUpload channels={channels} />}
      </div>

      <div className="rounded border border-neutral-800 p-4">
        <h2 className="font-semibold mb-3">Thumbnails</h2>
        {myVideos.length === 0 ? (
          <p className="text-neutral-400">No videos yet.</p>
        ) : (
          <ThumbnailUpload videoIds={myVideos.map(v => v.id)} />
        )}
      </div>
    </section>
  );
}
