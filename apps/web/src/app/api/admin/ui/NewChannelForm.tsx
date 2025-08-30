"use client";
import { FormEvent, useState } from "react";

export default function NewChannelForm({ ownerUid }: { ownerUid: string }) {
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin/createChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, name, description: desc, ownerUid }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data?.error || `Failed (${res.status})`);
      return;
    }
    setMsg(`Created channel (${data.handle}) id=${data.id}`);
    setHandle(""); setName(""); setDesc("");
  };

  return (
    <div className="rounded border border-neutral-800 p-4">
      <h2 className="font-semibold mb-2">Create Channel</h2>
      <form onSubmit={submit} className="space-y-2">
        <input value={handle} onChange={e=>setHandle(e.target.value)} placeholder="handle" className="w-full rounded border px-3 py-2" />
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="name" className="w-full rounded border px-3 py-2" />
        <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="description" className="w-full rounded border px-3 py-2" />
        <button className="rounded bg-purple-600 text-white px-3 py-2">Create</button>
      </form>
      {msg && <p className="text-sm mt-2">{msg}</p>}
    </div>
  );
}
