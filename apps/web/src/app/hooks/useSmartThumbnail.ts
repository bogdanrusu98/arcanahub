import { useState, useEffect } from 'react';

interface ThumbnailOptions {
  playbackId: string;
  title?: string;
  timePoints?: number[]; // [5, 15, 30] - va încerca în ordine
  fallbackToOG?: boolean;
}

export function useSmartThumbnail({
  playbackId,
  title,
  timePoints = [5, 15, 30],
  fallbackToOG = true,
}: ThumbnailOptions) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [timeUsed, setTimeUsed] = useState<number>(5);

  useEffect(() => {
    let cancelled = false;

    async function findBestThumbnail() {
      setLoading(true);

      for (const time of timePoints) {
        if (cancelled) return;

        const testUrl = `/api/thumb/${playbackId}?time=${time}`;
        
        try {
          const response = await fetch(testUrl, { method: 'HEAD' });
          if (response.ok) {
            setThumbnailUrl(testUrl);
            setTimeUsed(time);
            setLoading(false);
            return;
          }
        } catch {
          // continuă cu următorul time point
          continue;
        }
      }

      // Dacă toate time points eșuează, folosește fallback OG
      if (fallbackToOG && !cancelled) {
        const params = new URLSearchParams({
          playbackId,
          title: title || 'Video',
          t: timePoints[0].toString(),
        });
        setThumbnailUrl(`/thumb/frame?${params.toString()}`);
        setTimeUsed(timePoints[0]);
      }

      setLoading(false);
    }

    findBestThumbnail();

    return () => {
      cancelled = true;
    };
  }, [playbackId, title, fallbackToOG]);

  return { thumbnailUrl, loading, timeUsed };
}