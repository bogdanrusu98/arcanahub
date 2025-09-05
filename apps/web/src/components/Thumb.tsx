'use client';

import NextImage from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { parseVttThumbnails, pickThumbAt, VttThumb } from '@/lib/thumbnails/vtt';

type Props = {
  src: string;           // poate fi imagine sau VTT
  alt: string;
  width: number;
  height: number;
  className?: string;
  timeSec?: number;
  unoptimized?: boolean;
};

function looksLikeVtt(url: string) {
  const u = url.toLowerCase();
  return u.endsWith('.vtt') || u.includes('/thumbnails/thumbnails.vtt');
}

export default function Thumb({
  src,
  alt,
  width,
  height,
  className,
  timeSec = 5,
  unoptimized,
}: Props) {
  const isVtt = useMemo(() => looksLikeVtt(src), [src]);
  const [thumb, setThumb] = useState<VttThumb | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);

  // Pentru VTT: fetch + parse + pick
  useEffect(() => {
    if (!isVtt) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(src, { credentials: 'same-origin' });
      if (!res.ok) return;
      const text = await res.text();
      const thumbs = parseVttThumbnails(text, src);
      const t = pickThumbAt(thumbs, timeSec) ?? null;
      if (!cancelled) setThumb(t);
    })();
    return () => { cancelled = true; };
  }, [src, isVtt, timeSec]);

  // Măsoară sprite-ul (doar în browser) pentru background-size corect
  useEffect(() => {
    if (!isVtt || !thumb) return;
    if (typeof window === 'undefined' || !('Image' in window)) return;
    const img = new window.Image();
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = thumb.image;
  }, [isVtt, thumb]);

  if (!isVtt) {
    // Imagine normală
    return (
      <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        unoptimized={unoptimized}
      />
    );
  }

  // VTT: placeholder până se încarcă
  if (!thumb) {
    return (
      <div
        className={`bg-neutral-800 ${className ?? ''}`}
        style={{ width, height }}
        aria-label={alt}
      />
    );
  }

  const bgSize = natural ? `${natural.w}px ${natural.h}px` : 'auto';
  const bgPos = `${-thumb.x}px ${-thumb.y}px`;
  const isLivepeerThumb = src.startsWith('https://image.livepeer.studio/');

  return (
    <NextImage
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={className}
    unoptimized={isLivepeerThumb || unoptimized} // 👈 important
  />
  );
}
