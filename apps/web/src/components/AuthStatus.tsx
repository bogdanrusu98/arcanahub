"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
    });
    return () => unsub();
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded border border-neutral-700 px-3 py-1.5 hover:bg-neutral-800 text-neutral-100"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded bg-purple-600 px-3 py-1.5 text-white hover:bg-purple-700"
        >
          Sign up
        </Link>
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch("/api/auth/sessionLogout", { method: "POST" }); // clear cookie
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
