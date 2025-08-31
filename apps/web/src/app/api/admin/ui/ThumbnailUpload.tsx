"use client";
import { useState } from "react";

/**
 * Minimal thumbnail uploader:
 * - pick a videoId
 * - choose image
 * - POST multipart to /api/admin/uploadThumbnail
 * Also allows pasting a direct URL and calls /api/admin/setThumbnail
 */
export default function ThumbnailUpload({ videoIds }: { videoIds: string[] }) {
  const [videoId, setVideoId] = useState(videoIds[0] ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState("");

  const upload = async () => {
    if (!file || !videoId) return;
    setMsg("Uploading…");
    const fd = new FormData();
    fd.append("videoId", videoId);
    fd.append("file", file);

    const res = await fetch("/api/admin/uploadThumbnail", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data?.error ?? "Upload failed");
    } else {
      setMsg(`Thumbnail set! ${data.url}`);
      setUrl("");
      setFile(null);
    }
  };

  const setDirect = async () => {
    if (!videoId || !url) return;
    setMsg("Setting URL…");
    const res = await fetch("/api/admin/setThumbnail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, url }),
    });
    const data = await res.json();
    if (!res.ok) setMsg(data?.error ?? "Failed");
    else setMsg("Thumbnail URL saved");
  };

  const autoGen = async () => {
    if (!videoId) return;
    setMsg("Auto-generating…");
    const res = await fetch("/api/admin/autoThumbnail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    });
    const data = await res.json();
    if (!res.ok) setMsg(data?.error ?? "Failed");
    else setMsg(`Auto-set: ${data.url ?? "ok"}`);
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <select
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          className="rounded border border-neutral-700 px-3 py-2 bg-neutral-900"
        >
          {videoIds.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="rounded border border-neutral-700 px-3 py-2 bg-neutral-900"
        />

        <button onClick={upload} className="rounded bg-purple-600 px-3 py-2 text-white hover:bg-purple-700">
          Upload thumbnail
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <input
          placeholder="Paste direct image URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="rounded border border-neutral-700 px-3 py-2 bg-neutral-900 sm:col-span-2"
        />
        <button onClick={setDirect} className="rounded border border-neutral-700 px-3 py-2 hover:bg-neutral-800">
          Use URL
        </button>
      </div>

      <div>
        <button onClick={autoGen} className="rounded border border-neutral-700 px-3 py-2 hover:bg-neutral-800">
          Auto-generate from playbackId
        </button>
      </div>

      {msg && <p className="text-sm text-neutral-300">{msg}</p>}
    </div>
  );
}
