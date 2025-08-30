import VideoPlayer from "@/components/VideoPlayer";

export default function WatchPage() {
  const demo = process.env.NEXT_PUBLIC_SAMPLE_PLAYLIST!;
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-bold">Watch</h1>
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <VideoPlayer src={demo} />
      </div>
      <p className="text-sm text-neutral-400">
        Replace the demo HLS URL (env: <code>NEXT_PUBLIC_SAMPLE_PLAYLIST</code>) with your media provider playback URL.
      </p>
    </section>
  );
}
