import { Video } from "@/types/content";

export function localThumb(v: Pick<Video, "thumbnailUrl" | "playbackId" | "title">) {
  if (v.thumbnailUrl) return v.thumbnailUrl;
  const q = new URLSearchParams();
  if (v.playbackId) q.set("playbackId", v.playbackId);
  q.set("title", (v.title || "Video").slice(0, 80));
  q.set("t", "5");
  return `/thumb/frame?${q.toString()}`;
}
