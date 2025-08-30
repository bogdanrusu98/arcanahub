import { getServerUser } from "@/lib/getServerUser";
import { adminDb } from "@/lib/firebaseAdmin";
import NewChannelForm from "./ui/NewChannelForm";
import VideoUpload from "./ui/VideoUpload";
import { Channel } from "@/types/content";

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

export default async function AdminPage() {
  const user = await getServerUser();
  if (!user) return <div>Please log in.</div>;

  const channels = await getMyChannels(user.uid);

  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-bold">Admin</h1>
      <NewChannelForm ownerUid={user.uid} />
      <div className="rounded border border-neutral-800 p-4">
        <h2 className="font-semibold mb-3">Upload video to a channel</h2>
        {channels.length === 0 ? (
          <p className="text-neutral-400">Create a channel first.</p>
        ) : (
          <VideoUpload channels={channels} />
        )}
      </div>
    </section>
  );
}
