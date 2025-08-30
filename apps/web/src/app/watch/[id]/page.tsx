import { adminDb } from "@/lib/firebaseAdmin";
import VideoPlayer from "@/components/VideoPlayer";
import { timeAgo } from "@/lib/timeAgo";
import ViewPinger from "../ui/ViewPinger";
import VideoActions from "../ui/VideoActions";
import SubscribeCTA from "@/components/SubscribeCTA";
import Link from "next/link";
import Image from "next/image";
import { Channel, Video } from "@/types/content";

/** Load video by id (server) */
async function getVideo(id: string): Promise<Video | null> {
  const doc = await adminDb.collection("videos").doc(id).get();
  if (!doc.exists) return null;
  const v = doc.data()!;
  return {
    id: doc.id,
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
  };
}

/** Load channel minimal info (server) */
async function getChannel(id: string): Promise<Channel | null> {
  const doc = await adminDb.collection("channels").doc(id).get();
  if (!doc.exists) return null;
  const d = doc.data()!;
  return {
    id: doc.id,
    handle: String(d.handle ?? "channel"),
    name: String(d.name ?? "Channel"),
    ownerUid: String(d.ownerUid ?? ""),
    avatarUrl: (d.avatarUrl as string | undefined) ?? null,
    priceId: (d.priceId as string | undefined) ?? undefined,
  };
}

/** Load a few related videos (same channel, newest first) */
async function getRelated(channelId: string, excludeId: string): Promise<Video[]> {
  const snap = await adminDb
    .collection("videos")
    .where("channelId", "==", channelId)
    .orderBy("createdAt", "desc")
    .limit(8)
    .get();

  return snap.docs
    .filter((d) => d.id !== excludeId)
    .map((d) => {
      const v = d.data();
      return {
        id: d.id,
        title: String(v.title ?? "Untitled"),
        channelId: String(v.channelId ?? channelId),
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

/**
 * Next 15 App Router: `params` is async. Await it before use.
 */
export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const video = await getVideo(id);
  if (!video) return <div className="p-6">Video not found.</div>;

  const channel = await getChannel(video.channelId);
  const related = await getRelated(video.channelId, video.id);

  const createdAtLabel = timeAgo(video.createdAt);
  const isMembersOnly = video.visibility === "members";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Left: player + details */}
      <div className="space-y-4">
        {/* Player */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-2">
          <VideoPlayer src={video.playbackUrl} />
        </div>
        {/* Count a view (client) */}
        <ViewPinger videoId={video.id} />

        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold">{video.title}</h1>

        {/* Meta row: views + time + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-neutral-400">
            {Intl.NumberFormat().format(video.views ?? 0)} views · {createdAtLabel}
            {video.playbackId ? (
              <span className="ml-2 text-neutral-500">· ID: {video.playbackId.slice(0, 6)}…</span>
            ) : null}
          </div>
          <VideoActions videoId={video.id} />
        </div>

        {/* Channel card + subscribe */}
        {channel ? (
          <div className="flex items-start gap-3 rounded-lg border border-neutral-800 p-3">
            <div className="h-10 w-10 rounded-full bg-neutral-700 overflow-hidden grid place-items-center text-sm">
              {channel.avatarUrl ? (
                <Image
                  src={channel.avatarUrl}
                  alt={channel.name}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                (channel.name?.[0] ?? "A")
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link href={`/channel/${channel.handle}`} className="font-semibold hover:underline">
                    {channel.name}
                  </Link>
                  <div className="text-xs text-neutral-400">@{channel.handle}</div>
                </div>
                {isMembersOnly ? <SubscribeCTA priceId={channel.priceId || ""} /> : null}
              </div>

              {/* Description (collapsible) */}
              {video.description ? (
                <DescriptionBlock text={video.description} />
              ) : (
                <p className="mt-3 text-sm text-neutral-400">No description provided.</p>
              )}

              {/* Tags */}
              {video.tags && video.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {video.tags.map((t) => (
                    <span key={t} className="text-xs px-2 py-1 rounded bg-neutral-800 text-neutral-300">
                      #{t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Comments skeleton (you can wire later) */}
        <div className="rounded-lg border border-neutral-800 p-4">
          <h3 className="font-semibold mb-2">Comments</h3>
          <p className="text-sm text-neutral-400">
            Comments are coming soon. For now, this is a placeholder.
          </p>
        </div>
      </div>

      {/* Right: related videos */}
      <aside className="space-y-3">
        <h3 className="font-semibold">Related</h3>
        <div className="space-y-3">
          {related.length === 0 ? (
            <div className="text-sm text-neutral-400">No related videos yet.</div>
          ) : (
            related.map((r) => <RelatedItem key={r.id} v={r} />)
          )}
        </div>
      </aside>
    </div>
  );
}

/** Collapsible long description */
function DescriptionBlock({ text }: { text: string }) {
  const MAX = 220;
  const isLong = text.length > MAX;
  return (
    <details className="mt-3 group">
      <summary className="cursor-pointer list-none text-sm text-neutral-300">
        {isLong ? text.slice(0, MAX) + "…" : text}
        {isLong ? <span className="ml-2 text-purple-300 group-open:hidden">Show more</span> : null}
      </summary>
      {isLong ? (
        <div className="mt-2 text-sm text-neutral-300 group-open:block hidden">
          {text}
          <div className="text-purple-300 mt-1">Show less</div>
        </div>
      ) : null}
    </details>
  );
}

/** Compact related video item */
function RelatedItem({
  v,
}: {
  v: { id: string; title?: string; playbackUrl?: string; thumbnailUrl?: string | null; createdAt?: number };
}) {
  const when = v.createdAt ? timeAgo(v.createdAt) : "";
  return (
    <Link href={`/watch/${v.id}`} className="flex gap-3 rounded-lg border border-neutral-800 hover:bg-neutral-900 p-2">
      <div className="h-20 w-32 rounded bg-neutral-800 overflow-hidden grid place-items-center text-xs text-neutral-400">
        {v.thumbnailUrl ? (
          <Image
            src={v.thumbnailUrl}
            alt={v.title ?? "Video"}
            width={160}
            height={90}
            className="h-full w-full object-cover"
          />
        ) : (
          "Video"
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium line-clamp-2">{v.title ?? "Untitled"}</div>
        <div className="text-xs text-neutral-400">{when}</div>
      </div>
    </Link>
  );
}
