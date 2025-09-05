"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Video } from "@/types/content";

type Props = {
  channelId: string;
  initial: { items: Video[]; nextCursor: string | null };
};

export default function ChannelVideosClient({ channelId, initial }: Props) {
  const [videos, setVideos] = useState<Video[]>(initial.items);
  const [cursor, setCursor] = useState<string | null>(initial.nextCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!cursor) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/channel/${channelId}/videos?cursor=${encodeURIComponent(cursor)}`);
      const data = (await res.json()) as { items: Video[]; nextCursor: string | null };
      setVideos((prev) => [...prev, ...(data.items ?? [])]);
      setCursor(data.nextCursor ?? null);
    } finally {
      setLoading(false);
    }
  }

  // If you ever need refresh-on-focus:
  useEffect(() => {
    // no-op for now
  }, []);

  return (
    <>
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
                  unoptimized /* In case remotePatterns don’t include the host yet */
                />
              ) : (
                "Video"
              )}
            </div>
            <div className="mt-2 text-sm font-medium line-clamp-2">{v.title}</div>
          </Link>
        ))}
      </div>

      {cursor ? (
        <div className="mt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-neutral-700 hover:bg-neutral-800"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </>
  );
}
