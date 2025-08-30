import { getServerUser } from "@/lib/getServerUser";

export default async function FeedPage() {
  const user = await getServerUser();
  // middleware oricum protejează /feed, dar păstrăm fallback
  if (!user) return <div>Please log in.</div>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Your feed</h1>
      <p className="text-neutral-300">Welcome back{user.email ? `, ${user.email}` : ""}!</p>
      <div className="rounded border border-neutral-800 p-4">
        <p className="text-neutral-400">Soon: channels you follow, new videos, live now.</p>
      </div>
    </section>
  );
}
