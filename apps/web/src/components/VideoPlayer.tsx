"use client";
import { useEffect, useRef } from "react";
import Hls from "hls.js";

/**
 * Minimal HLS player with native Safari fallback.
 */
export default function VideoPlayer({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return;

    // Clean previous source
    video.removeAttribute("src");
    video.load();

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else {
      video.src = src;
    }
  }, [src]);

  return <video ref={ref} controls playsInline className="w-full rounded" />;
}
