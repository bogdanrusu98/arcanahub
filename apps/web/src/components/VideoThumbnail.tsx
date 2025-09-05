'use client';

import Image from "next/image";
import { useState } from "react";
import { useSmartThumbnail } from "../app/hooks/useSmartThumbnail";

interface VideoThumbnailProps {
  playbackId?: string | null;
  title: string;
  fallbackUrl?: string;
  className?: string;
  showPlayButton?: boolean;
  onPlay?: () => void;
}

export function VideoThumbnail({
  playbackId,
  title,
  fallbackUrl = "/placeholder-video.jpg",
  className = "",
  showPlayButton = true,
  onPlay,
}: VideoThumbnailProps) {
  const [imageError, setImageError] = useState(false);
  
  const { thumbnailUrl, loading } = useSmartThumbnail({
    playbackId: playbackId || "",
    title,
    timePoints: [5, 15, 30, 60],
    fallbackToOG: true,
  });

  const finalUrl = imageError ? fallbackUrl : thumbnailUrl;

  if (loading) {
    return (
      <div className={`bg-neutral-800 animate-pulse flex items-center justify-center ${className}`}>
        <div className="text-neutral-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <Image
        src={finalUrl}
        alt={title}
        fill
        className="object-cover transition-transform group-hover:scale-105"
        onError={() => setImageError(true)}
        unoptimized={finalUrl.startsWith('/thumb/')}
      />
      
      {showPlayButton && (
        <button
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors"
        >
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center text-black text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
            ▶
          </div>
        </button>
      )}
    </div>
  );
}