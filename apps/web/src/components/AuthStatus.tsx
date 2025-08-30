"use client";
// Shows user email + Logout; creates/clears a Firebase session cookie via API.

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut, User, getIdToken } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u ?? null);
      // When user logs in on client, exchange ID token for a session cookie.
      if (u) {
        const idToken = await getIdToken(u, true);
        await fetch("/api/auth/sessionLogin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
      } else {
        await fetch("/api/auth/sessionLogout", { method: "POST" });
      }
    });
    return () => unsub();
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="rounded border border-neutral-700 px-3 py-1.5 hover:bg-neutral-800 text-neutral-100">
          Log in
        </Link>
        <Link href="/signup" className="rounded bg-purple-600 px-3 py-1.5 text-white hover:bg-purple-700">
          Sign up
        </Link>
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch("/api/auth/sessionLogout", { method: "POST" }); // clear cookie first
    await signOut(auth);
    window.location.href = "/";
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-neutral-300">{user.email}</span>
      <button
        onClick={handleLogout}
        className="rounded border border-neutral-700 px-3 py-1.5 hover:bg-neutral-800 text-neutral-100"
      >
        Log out
      </button>
    </div>
  );
}
