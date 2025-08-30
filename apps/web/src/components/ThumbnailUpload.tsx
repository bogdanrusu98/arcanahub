"use client";
import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export default function ThumbnailUpload({ videoId, onUploaded }: { videoId: string; onUploaded: (url: string)=>void }) {
  const [loading, setLoading] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const path = `thumbnails/${videoId}/${file.name}`;
      const r = ref(storage, path);
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      onUploaded(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input type="file" accept="image/*" onChange={onFile} hidden />
      <span className="rounded border border-neutral-700 px-3 py-1.5 hover:bg-neutral-800">
        {loading ? "Uploading..." : "Upload thumbnail"}
      </span>
    </label>
  );
}
