"use client";
// Simple auth-aware header: shows user email + Logout, or Login link.

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Subscribe to Firebase Auth user changes
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded border border-neutral-700 px-3 py-1.5 hover:bg-neutral-800 text-neutral-100"
      >
        Log in
      </Link>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
    // Redirect to home (optional)
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
