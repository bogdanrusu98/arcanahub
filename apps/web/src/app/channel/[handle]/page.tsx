import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getChannelByHandle, getChannelVideos } from "@/lib/server/channel";
import SubscribeCTA from "@/components/SubscribeCTA";

type PageProps = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const channel = await getChannelByHandle(handle);
  const title = channel ? `${channel.name} (@${channel.handle})` : `Channel @${handle}`;
  const desc = channel?.description ?? "Channel on ArcanaHub";
  const og = channel?.bannerUrl ?? channel?.avatarUrl ?? undefined;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: og ? [{ url: og }] : undefined,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: og ? [og] : undefined,
    },
  };
}

export default async function ChannelPage({ params }: PageProps) {
  const { handle } = await params;
  const channel = await getChannelByHandle(handle);
  if (!channel) {
    return <div className="p-6">Channel not found.</div>;
  }

  const initial = await getChannelVideos(channel.id, 12);

  return (
    <section className="space-y-6">
      {/* Banner */}
      <div className="relative h-40 w-full rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900">
        {channel.bannerUrl ? (
          <Image
            src={channel.bannerUrl}
            alt={`${channel.name} banner`}
            fill
            className="object-cover"
            unoptimized
          />
        ) : null}

        {/* Avatar + name */}
        <div className="absolute left-4 bottom-4 flex items-center gap-3">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-neutral-700 grid place-items-center text-lg">
            {channel.avatarUrl ? (
              <Image
                src={channel.avatarUrl}
                alt={channel.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              (channel.name?.[0] ?? "A")
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold">{channel.name}</h1>
            <div className="text-sm text-neutral-400">
              @{channel.handle} · {channel.subscriberCount ?? 0} subscribers
            </div>
          </div>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-neutral-300 max-w-3xl">
          {channel.description ?? "No description provided."}
        </div>
        {channel.priceId ? <SubscribeCTA priceId={channel.priceId} /> : null}
      </div>

      {/* Tabs (static for now) */}
      <div className="border-b border-neutral-800">
        <div className="flex gap-4 text-sm">
          <span className="px-2 py-2 border-b-2 border-purple-400">Videos</span>
          <Link href={`/channel/${channel.handle}?tab=about`} className="px-2 py-2 text-neutral-400 hover:text-neutral-200">
            About
          </Link>
        </div>
      </div>

      {/* Videos list with pagination */}
      <Suspense fallback={<div>Loading videos…</div>}>
        {/* client component to paginate */}
        {/* @ts-expect-error Async Server Component interop comment not needed in Next 15, but safe */}
        <ChannelVideos island channelId={channel.id} initial={initial} />
      </Suspense>
    </section>
  );
}

/** Inline dynamic import keeps page file tidy */
async function ChannelVideos(props: { channelId: string; initial: { items: any[]; nextCursor: string | null } }) {
  const Mod = await import("./ChannelVideosClient");
  const ChannelVideosClient = Mod.default;
  return <ChannelVideosClient channelId={props.channelId} initial={props.initial} />;
}
