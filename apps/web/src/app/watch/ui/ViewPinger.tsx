"use client";
import { useEffect, useRef } from "react";

/**
 * Pings the server once to increment a view.
 * It waits for a tiny delay to avoid counting instant bounces.
 */
export default function ViewPinger({ videoId }: { videoId: string }) {
  const sent = useRef(false);
  useEffect(() => {
    const t = setTimeout(async () => {
      if (sent.current) return;
      sent.current = true;
      await fetch(`/api/videos/${videoId}/incrementView`, { method: "POST" });
    }, 3000); // count as a "view" after ~3s
    return () => clearTimeout(t);
  }, [videoId]);
  return null;
}
