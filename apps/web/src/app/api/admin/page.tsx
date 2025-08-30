import { getServerUser } from "@/lib/getServerUser";
import { adminDb } from "@/lib/firebaseAdmin";
import VideoUpload from "./ui/VideoUpload";
import NewChannelForm from "./ui/NewChannelForm";

async function getMyChannels(uid: string) {
  const snap = await adminDb.collection("channels").where("ownerUid", "==", uid).get();
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
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
