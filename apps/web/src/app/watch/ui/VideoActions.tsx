"use client";
import { useState } from "react";

/**
 * Local-only actions bar for MVP: Like / Save / Share (copy link) / Report.
 * You can wire these to Firestore later via API routes.
 */
export default function VideoActions({ videoId }: { videoId: string }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      // Future analytics hook:
      console.debug("share_copied", { videoId });
    } catch {}
  };

  return (
    <div className="flex flex-wrap gap-2" data-video-id={videoId}>
      <button
        onClick={() => setLiked((v) => !v)}
        className={`px-3 py-1.5 rounded border ${
          liked ? "border-purple-500 text-purple-300" : "border-neutral-700 text-neutral-200"
        } hover:bg-neutral-800`}
      >
        {liked ? "Liked" : "Like"}
      </button>

      <button
        onClick={() => setSaved((v) => !v)}
        className={`px-3 py-1.5 rounded border ${
          saved ? "border-purple-500 text-purple-300" : "border-neutral-700 text-neutral-200"
        } hover:bg-neutral-800`}
      >
        {saved ? "Saved" : "Save"}
      </button>

      <button
        onClick={copy}
        className="px-3 py-1.5 rounded border border-neutral-700 text-neutral-200 hover:bg-neutral-800"
      >
        {copied ? "Copied!" : "Share"}
      </button>

      <button
        onClick={() => alert("Report submitted (demo).")}
        className="px-3 py-1.5 rounded border border-neutral-700 text-neutral-200 hover:bg-neutral-800"
      >
        Report
      </button>
    </div>
  );
}
