"use client";
import SubscribeButton from "@/components/SubscribeButton";

/**
 * Simple subscribe callout. Wire the priceId to your channel pricing.
 */
export default function SubscribeCTA({ priceId }: { priceId: string }) {
  return (
    <div className="rounded-lg border border-purple-800/40 bg-purple-950/20 p-4">
      <h3 className="font-semibold text-purple-300">Members-only content</h3>
      <p className="text-sm text-neutral-300">
        Subscribe to access this video and all members posts from this channel.
      </p>
      <div className="mt-3">
        <SubscribeButton priceId={priceId} />
      </div>
    </div>
  );
}
