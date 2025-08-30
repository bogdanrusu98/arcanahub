import SubscribeButton from "@/components/SubscribeButton";

export default function ChannelPage({ params }: { params: { handle: string } }) {
  const { handle } = params;
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Channel: {handle}</h1>
      <p className="text-neutral-400">Exclusive tarot streams and content.</p>

      <div className="p-4 border border-purple-600 rounded">
        <p className="mb-2">Subscribe to unlock members-only content</p>
        <SubscribeButton priceId="price_1S1pJpEBoJoG2kTn1tx9GZo3" />
      </div>
    </div>
  );
}
