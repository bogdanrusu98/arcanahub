import { adminDb } from "@/lib/server/firebaseAdmin";
import Image from "next/image";
import Link from "next/link";
import { Video } from "@/types/content";
import { localThumb } from "@/lib/localThumb"; // folosește helperul, nu-l mai redefini
const isLocalThumb = (src: string) => src.startsWith("/thumb/");

async function getLatestVideos(): Promise<Video[]> {
  const snap = await adminDb
    .collection("videos")
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
      thumbnailUrl: (v.thumbnailUrl as string | null) ?? null,
      visibility: (v.visibility as "public" | "members") ?? "public",
      createdAt: Number(v.createdAt ?? Date.now()),
      views: (v.views as number | undefined) ?? 0,
      tags: (v.tags as string[] | undefined) ?? [],
      description: (v.description as string | undefined) ?? "",
      shareUrl: (v.shareUrl as string | undefined) ?? null,
    } as Video;
  });
}

export default async function FeedPage() {
  const videos = await getLatestVideos();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Latest videos</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => {
          const thumb = localThumb(v); // <- helperul returnează mereu ceva (inclusiv fallback local)
          return (
            <Link
              key={v.id}
              href={`/watch/${v.id}`}
              className="rounded-lg border border-neutral-800 hover:bg-neutral-900 p-2"
            >
              <div className="h-40 w-full rounded bg-neutral-800 overflow-hidden grid place-items-center text-xs text-neutral-400">
              <Image
  src={thumb}
  alt={v.title}
  width={640}
  height={360}
  className="h-full w-full object-cover"
  unoptimized={isLocalThumb(thumb)}
/>
              </div>
              <div className="mt-2 text-sm font-medium line-clamp-2">
                {v.title}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
