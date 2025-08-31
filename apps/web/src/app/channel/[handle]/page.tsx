import { adminDb } from "@/lib/firebaseAdmin";
import { Channel, Video } from "@/types/content";
import Image from "next/image";
import Link from "next/link";

async function getChannelByHandle(handle: string): Promise<Channel | null> {
  const snap = await adminDb.collection("channels").where("handle", "==", handle).limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data();
  return {
    id: d.id,
    handle: String(data.handle ?? handle),
    name: String(data.name ?? "Channel"),
    ownerUid: String(data.ownerUid ?? ""),
    avatarUrl: (data.avatarUrl as string | undefined) ?? null,
    priceId: (data.priceId as string | undefined) ?? undefined,
  };
}

async function getChannelVideos(channelId: string): Promise<Video[]> {
  const snap = await adminDb
    .collection("videos")
    .where("channelId", "==", channelId)
    .orderBy("createdAt", "desc")
    .limit(24)
    .get();

  return snap.docs.map((d) => {
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

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return {
    title: `Channel @${handle} • ArcanaHub`,
    description: "Tarot creators on ArcanaHub.",
    openGraph: {
      type: "profile",
      url: `/channel/${handle}`,
      images: [{ url: `/channel/${handle}/opengraph-image` }],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/channel/${handle}/opengraph-image`],
    },
  };
}


export default async function ChannelPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const ch = await getChannelByHandle(handle);
  if (!ch) return <div className="p-6">Channel not found.</div>;

  const videos = await getChannelVideos(ch.id);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-full overflow-hidden bg-neutral-800 grid place-items-center">
          {ch.avatarUrl ? (
            <Image src={ch.avatarUrl} alt={ch.name} width={56} height={56} className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg">{ch.name[0] ?? "A"}</span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{ch.name}</h1>
          <div className="text-sm text-neutral-400">@{ch.handle}</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <Link
            key={v.id}
            href={`/watch/${v.id}`}
            className="rounded-lg border border-neutral-800 hover:bg-neutral-900 p-2"
          >
            <div className="h-40 w-full rounded bg-neutral-800 overflow-hidden grid place-items-center text-xs text-neutral-400">
              {v.thumbnailUrl ? (
                <Image
                  src={v.thumbnailUrl}
                  alt={v.title}
                  width={640}
                  height={360}
                  className="h-full w-full object-cover"
                />
              ) : (
                "Video"
              )}
            </div>
            <div className="mt-2 text-sm font-medium line-clamp-2">{v.title}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
