import Link from "next/link";

export default function HomePage() {
  return (
    <section className="grid gap-8 md:grid-cols-2 items-center">
      <div className="space-y-5">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Welcome to <span className="text-purple-400">ArcanaHub</span>
        </h1>
        <p className="text-neutral-300">
          A video platform for tarot creators: upload VODs, go live, and offer channel memberships to your audience.
        </p>
        <div className="flex gap-3">
          <Link
            href="/feed"
            className="inline-flex items-center rounded bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700"
          >
            Browse content
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center rounded border border-neutral-700 px-4 py-2 font-medium text-neutral-100 hover:bg-neutral-800"
          >
            Log in
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="aspect-video w-full rounded-md bg-neutral-800 grid place-items-center text-neutral-400">
          Player preview
        </div>
        <p className="mt-3 text-sm text-neutral-400">
          Plug in HLS/WebRTC once you connect your media provider.
        </p>
      </div>
    </section>
  );
}
