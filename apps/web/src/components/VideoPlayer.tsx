"use client";
// HLS player with hls.js fallback for non-Safari browsers.

import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Safari/iOS can play HLS natively
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else {
      // Fallback to direct MP4 (if src is MP4)
      video.src = src;
    }
  }, [src]);

  return <video ref={videoRef} controls className="w-full rounded-lg" />;
}
