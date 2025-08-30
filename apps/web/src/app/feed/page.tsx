import { adminDb } from "@/lib/firebaseAdmin";
import Link from "next/link";
import { getServerUser } from "@/lib/getServerUser";

async function getChannels() {
  const snap = await adminDb.collection("channels").limit(12).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
}

async function getLatestVideos() {
  const snap = await adminDb.collection("videos").orderBy("createdAt","desc").limit(12).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
}

export default async function FeedPage() {
  const user = await getServerUser();
  if (!user) return <div>Please log in.</div>;

  const [channels, videos] = await Promise.all([getChannels(), getLatestVideos()]);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Your feed</h1>
        <p className="text-neutral-400">Welcome{user.email ? `, ${user.email}` : ""}!</p>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-semibold">Channels</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map(c => (
            <Link key={c.id} href={`/channel/${c.handle ?? c.id}`} className="rounded border border-neutral-800 p-4 hover:bg-neutral-900">
              <div className="font-medium">{c.name ?? c.handle}</div>
              <div className="text-sm text-neutral-400 line-clamp-2">{c.description ?? "Tarot channel"}</div>
            </Link>
          ))}
          {channels.length === 0 && <div className="text-neutral-400">No channels yet.</div>}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-semibold">Latest videos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map(v => (
            <Link key={v.id} href={`/watch/${v.id}`} className="rounded border border-neutral-800 p-2 hover:bg-neutral-900">
              <div className="aspect-video rounded bg-neutral-800 overflow-hidden">
                {v.thumbnailUrl ? <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" /> : null}
              </div>
              <div className="p-2">
                <div className="font-medium">{v.title}</div>
                <div className="text-xs text-neutral-500">{v.visibility ?? "public"}</div>
              </div>
            </Link>
          ))}
          {videos.length === 0 && <div className="text-neutral-400">No videos yet.</div>}
        </div>
      </div>
    </section>
  );
}
