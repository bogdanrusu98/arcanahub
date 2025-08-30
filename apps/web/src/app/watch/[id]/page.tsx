import { adminDb } from "@/lib/firebaseAdmin";
import VideoPlayer from "@/components/VideoPlayer";
import { timeAgo } from "@/lib/timeAgo";
import ViewPinger from "../ui/ViewPinger";
import VideoActions from "../ui/VideoActions";
import SubscribeCTA from "@/components/SubscribeCTA";
import Link from "next/link";

/** Load video by id (server) */
async function getVideo(id: string) {
  const doc = await adminDb.collection("videos").doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    id: doc.id,
    title: (data.title as string) ?? "Untitled",
    playbackUrl: (data.playbackUrl as string) ?? "",
    playbackId: (data.playbackId as string | null) ?? null,
    channelId: (data.channelId as string) ?? "",
    visibility: (data.visibility as "public" | "members") ?? "public",
    views: (data.views as number) ?? 0,
    tags: (data.tags as string[] | undefined) ?? [],
    description: (data.description as string | undefined) ?? "",
    createdAt: (data.createdAt as number | undefined) ?? Date.now(),
    shareUrl: (data.shareUrl as string | undefined) ?? null,
  };
}

/** Load channel minimal info (server) */
async function getChannel(id: string) {
  const doc = await adminDb.collection("channels").doc(id).get();
  if (!doc.exists) return null;
  const d = doc.data()!;
  return {
    id: doc.id,
    handle: (d.handle as string) ?? "channel",
    name: (d.name as string) ?? "Channel",
    avatarUrl: (d.avatarUrl as string | undefined) ?? null,
    priceId: (d.priceId as string | undefined) ?? "", // Stripe Price ID if you have it
    ownerUid: (d.ownerUid as string) ?? "",
  };
}

/** Load a few related videos (same channel, newest first) */
async function getRelated(channelId: string, excludeId: string) {
  const snap = await adminDb
    .collection("videos")
    .where("channelId", "==", channelId)
    .orderBy("createdAt", "desc")
    .limit(8)
    .get();

  return snap.docs
    .filter((d) => d.id !== excludeId)
    .map((d) => ({ id: d.id, ...(d.data() as any) })) as Array<{
      id: string;
      title?: string;
      playbackUrl?: string;
      thumbnailUrl?: string | null;
      createdAt?: number;
    }>;
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
            {Intl.NumberFormat().format(video.views)} views · {createdAtLabel}
            {video.playbackId ? (
              <span className="ml-2 text-neutral-500">
                · ID: {video.playbackId.slice(0, 6)}…
              </span>
            ) : null}
          </div>
          <VideoActions videoId={video.id} />
        </div>

        {/* Channel card + subscribe */}
        {channel ? (
          <div className="flex items-start gap-3 rounded-lg border border-neutral-800 p-3">
            <div className="h-10 w-10 rounded-full bg-neutral-700 overflow-hidden grid place-items-center text-sm">
              {channel.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={channel.avatarUrl} alt={channel.name} className="h-full w-full object-cover" />
              ) : (
                (channel.name?.[0] ?? "A")
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link
                    href={`/channel/${channel.handle}`}
                    className="font-semibold hover:underline"
                  >
                    {channel.name}
                  </Link>
                  <div className="text-xs text-neutral-400">@{channel.handle}</div>
                </div>
                {isMembersOnly ? (
                  <SubscribeCTA priceId={channel.priceId || ""} />
                ) : null}
              </div>

              {/* Description (collapsible) */}
              {video.description ? (
                <DescriptionBlock text={video.description} />
              ) : (
                <p className="mt-3 text-sm text-neutral-400">
                  No description provided.
                </p>
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
            related.map((r) => (
              <RelatedItem key={r.id} v={r} />
            ))
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
        {isLong ? (
          <span className="ml-2 text-purple-300 group-open:hidden">Show more</span>
        ) : null}
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
        {/* Prefer a real thumbnail; fallback to "Video" placeholder */}
        {v.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.thumbnailUrl} alt={v.title ?? "Video"} className="h-full w-full object-cover" />
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
