import { getServerUser } from "@/lib/getServerUser";

export default async function AccountPage() {
  const user = await getServerUser();
  if (!user) {
    // Optional: you can render a gentle message; middleware should already redirect
    return <div>Please log in to access your account.</div>;
  }
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Account</h1>
      <p className="text-neutral-300">UID: {user.uid}</p>
      {user.email && <p className="text-neutral-300">Email: {user.email}</p>}
    </div>
  );
}
