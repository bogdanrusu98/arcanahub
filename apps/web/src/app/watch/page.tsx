import VideoPlayer from "@/components/VideoPlayer";
import SubscribeButton from "@/components/SubscribeButton";

export default function WatchPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const isMembersOnly = true;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Video {id}</h1>
      {isMembersOnly ? (
        <div className="p-4 border border-purple-600 rounded">
          <p className="mb-2">This video is for members only.</p>
          <SubscribeButton priceId="price_1S1pJpEBoJoG2kTn1tx9GZo3" />
        </div>
      ) : (
        <VideoPlayer src={process.env.NEXT_PUBLIC_SAMPLE_PLAYLIST!} />
      )}
    </div>
  );
}
