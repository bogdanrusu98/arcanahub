"use client";
import { FormEvent, useState } from "react";

export default function NewVideoForm() {
  const [title, setTitle] = useState("");
  const [channelId, setChannelId] = useState("");
  const [playbackUrl, setPlaybackUrl] = useState("");
  const [visibility, setVisibility] = useState<"public"|"members">("public");
  const [msg, setMsg] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin/createVideo", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ title, channelId, playbackUrl, visibility }),
    });

    const data = await res.json().catch(()=> ({}));
    if (!res.ok) {
      setMsg(data?.error || `Failed (${res.status})`);
      return;
    }
    setMsg(`Created video id=${data.id}`);
    setTitle(""); setPlaybackUrl("");
  };

  return (
    <div className="rounded border border-neutral-800 p-4">
      <h2 className="font-semibold mb-2">Create Video</h2>
      <form onSubmit={submit} className="space-y-2">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="title" className="w-full rounded border px-3 py-2" />
        <input value={channelId} onChange={e=>setChannelId(e.target.value)} placeholder="channelId (from Create Channel)" className="w-full rounded border px-3 py-2" />
        <input value={playbackUrl} onChange={e=>setPlaybackUrl(e.target.value)} placeholder="HLS URL (optional)" className="w-full rounded border px-3 py-2" />
        <select value={visibility} onChange={e=>setVisibility(e.target.value as "public"|"members")} className="w-full rounded border px-3 py-2">
          <option value="public">public</option>
          <option value="members">members</option>
        </select>
        <button className="rounded bg-purple-600 text-white px-3 py-2">Create</button>
      </form>
      {msg && <p className="text-sm mt-2">{msg}</p>}
    </div>
  );
}
