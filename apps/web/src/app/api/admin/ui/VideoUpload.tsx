"use client";
import { useMemo, useState } from "react";
import * as tus from "tus-js-client";

/**
 * Renders a video upload form. The flow:
 *  1) Request TUS endpoint from our backend (Livepeer direct upload).
 *  2) Upload file via tus-js-client (client -> Livepeer).
 *  3) Poll asset status: wait for playbackUrl (and playbackId).
 *  4) Save a Firestore "videos" document via /api/admin/createVideo.
 */
type Channel = { id: string; handle?: string; name?: string };

export default function VideoUpload({ channels }: { channels: Channel[] }) {
  const [channelId, setChannelId] = useState(channels[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<"public" | "members">("public");
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState("");
  const [phase, setPhase] = useState<string>("");
  const [videoId, setVideoId] = useState<string | null>(null);

  const channelOptions = useMemo(
    () => channels.map((c) => ({ id: c.id, label: c.name || c.handle || c.id })),
    [channels]
  );

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  /** Polls Livepeer until we get playbackUrl (authoritative URL). */
  const pollPlaybackInfo = async (assetId: string) => {
    let delay = 2000; // start gently, backoff a bit
    for (let i = 0; i < 40; i++) {
      const stRes = await fetch(`/api/livepeer/asset-status?assetId=${assetId}`, { cache: "no-store" });
      const st = await stRes.json().catch(() => ({}));

      const p = st?.asset?.status?.phase as string | undefined;
      if (p) setPhase(p);

      const playbackId: string | null = st?.asset?.playbackId ?? null;
      const playbackUrl: string | null = st?.asset?.playbackUrl ?? null;

      if (playbackUrl) return { playbackId, playbackUrl };
      if (p === "failed") throw new Error("Livepeer processing failed");

      // Kick playback generation once if missing
      if (i === 2 && !playbackId) {
        await fetch(`/api/livepeer/request-playback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assetId }),
        }).catch(() => {});
      }

      await sleep(delay);
      if (delay < 8000) delay += 500;
    }
    return null;
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !channelId) return;

    setMsg("");
    setVideoId(null);
    setProgress(0);
    setPhase("");

    // 1) Ask backend for a TUS endpoint
    const upRes = await fetch("/api/livepeer/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name }),
    });
    const upData = await upRes.json().catch(() => ({}));
    if (!upRes.ok || !upData?.tusEndpoint || !upData?.asset?.id) {
      setMsg(`Failed to get upload URL: ${upData?.error ?? upRes.status}`);
      return;
    }

    const assetId: string = upData.asset.id;

    // 2) Upload via tus
    const upload = new tus.Upload(file, {
      endpoint: upData.tusEndpoint,
      metadata: { filename: file.name, filetype: file.type },
      onError(err) {
        console.error("Upload failed:", err);
        setMsg("Upload failed");
      },
      onProgress(bytesUploaded, bytesTotal) {
        setProgress(Math.floor((bytesUploaded / bytesTotal) * 100));
      },
      async onSuccess() {
        setMsg("Upload finished. Processing…");

        try {
          // 3) Wait for playback info (URL + ID)
          const info = await pollPlaybackInfo(assetId);
          if (!info) {
            setMsg("Asset not ready yet. Try again in a minute.");
            return;
          }
          const { playbackId, playbackUrl } = info; // ✅ use Livepeer's URL (works for VOD/CDN)

          // 4) Create Firestore "video" doc
          const nameForTitle = title.trim() || file.name;
          const createRes = await fetch("/api/admin/createVideo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: nameForTitle,
              channelId,
              visibility,
              playbackId,
              playbackUrl,
            }),
          });

          const createData = await createRes.json().catch(() => ({}));
          if (!createRes.ok) {
            setMsg(`Error saving video: ${createData?.error ?? createRes.status}`);
            return;
          }

          setVideoId(createData.id);
          setMsg(`Video saved! ID=${createData.id}`);
          setTitle("");
          setProgress(100);
        } catch (err) {
          setMsg(err instanceof Error ? err.message : "Processing failed");
        }
      },
    });

    upload.start();
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <select
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          className="rounded border border-neutral-700 px-3 py-2 bg-neutral-900"
        >
          {channelOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="rounded border border-neutral-700 px-3 py-2 bg-neutral-900"
        />

        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as "public" | "members")}
          className="rounded border border-neutral-700 px-3 py-2 bg-neutral-900"
        >
          <option value="public">public</option>
          <option value="members">members</option>
        </select>
      </div>

      <input type="file" accept="video/*" onChange={handleFile} />

      {progress > 0 && <p>Progress: {progress}%</p>}
      {phase && <p className="text-sm text-neutral-400">Status: {phase}</p>}
      {msg && <p className="text-sm">{msg}</p>}

      {videoId && (
        <a href={`/watch/${videoId}`} className="inline-block text-purple-400 hover:underline">
          Go to video →
        </a>
      )}
    </div>
  );
}
