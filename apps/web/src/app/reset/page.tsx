"use client";
// Send password reset email

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState<string>("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInfo("");
    await sendPasswordResetEmail(auth, email.trim());
    setInfo("If an account exists with that email, a reset link has been sent.");
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold">Reset password</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="email" className="w-full rounded border px-3 py-2"
          placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <button className="w-full rounded bg-purple-700 px-4 py-2 font-medium text-white">Send reset link</button>
      </form>
      {info && <p className="text-sm text-green-500 mt-3">{info}</p>}
    </div>
  );
}
