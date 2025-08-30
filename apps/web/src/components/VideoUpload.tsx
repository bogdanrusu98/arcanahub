"use client";
import { useState } from "react";
import * as tus from "tus-js-client";

export default function VideoUpload({ channelId }: { channelId: string }) {
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState("");
  const [phase, setPhase] = useState<string>("");

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // Poll Livepeer asset until we get a playbackId
  const getPlaybackId = async (assetId: string) => {
    let delay = 2000; // start with 2s, gentle backoff
    for (let i = 0; i < 40; i++) {
      const stRes = await fetch(`/api/livepeer/asset-status?assetId=${assetId}`, { cache: "no-store" });
      const st = await stRes.json().catch(() => ({}));

      const p = st?.asset?.status?.phase as string | undefined;
      if (p) setPhase(p);

      const playbackId: string | undefined = st?.asset?.playbackId;
      if (playbackId) return playbackId;

      // If first attempts don't have playback yet, proactively request it once
      if (i === 2) {
        await fetch(`/api/livepeer/request-playback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assetId }),
        }).catch(() => {});
      }

      // Stop early on failure
      if (p === "failed") throw new Error("Livepeer processing failed");

      await sleep(delay);
      if (delay < 8000) delay += 500;
    }
    return null;
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMsg("");
    setProgress(0);
    setPhase("");

    // 1) Ask backend for a tus endpoint to upload to
    const res = await fetch("/api/livepeer/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name }),
    });
    const data = await res.json();

    if (!res.ok || !data?.tusEndpoint || !data?.asset?.id) {
      setMsg(`Failed to get upload URL: ${data?.error ?? res.status}`);
      return;
    }

    const assetId: string = data.asset.id;

    // 2) Upload the video via tus
    const upload = new tus.Upload(file, {
      endpoint: data.tusEndpoint,
      metadata: { filename: file.name, filetype: file.type },
      onError(err) {
        console.error("Upload failed:", err);
        setMsg("Upload failed");
      },
      onProgress(uploaded, total) {
        setProgress(Math.floor((uploaded / total) * 100));
      },
      async onSuccess() {
        setMsg("Upload finished. Processing…");

        try {
          // 3) Wait for playbackId (not the assetId!)
          const playbackId = await getPlaybackId(assetId);
          if (!playbackId) {
            setMsg("Asset not ready yet. Try again in a minute.");
            return;
          }

          // ✅ Correct playback URL
          const playbackUrl = `https://livepeercdn.com/hls/${playbackId}/index.m3u8`;

          // 4) Save video document in Firestore
          const createRes = await fetch("/api/admin/createVideo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: file.name,
              channelId,
              playbackUrl,
              visibility: "public",
            }),
          });
          const createData = await createRes.json().catch(() => ({}));
          if (!createRes.ok) {
            setMsg(`Error saving video: ${createData?.error ?? createRes.status}`);
            return;
          }

          setMsg(`Video saved! ID=${createData.id}`);
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
      <input type="file" accept="video/*" onChange={handleFile} />
      {progress > 0 && <p>Progress: {progress}%</p>}
      {phase && <p className="text-sm text-neutral-400">Status: {phase}</p>}
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
