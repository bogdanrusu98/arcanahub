// // components/ThumbnailFromVTT.tsx
// import { useEffect, useState } from 'react';
// import { parseVttThumbnails, pickThumbAt, VttThumb } from '@/lib/thumbnails/vtt';

// type Props = {
//   vttUrl: string;
//   timeSec?: number; // default 5
//   width?: number;   // dimensiunea dorită în UI
//   height?: number;  // dacă lipsește, păstrează aspectul regionului
//   className?: string;
// };

// export default function ThumbnailFromVTT({ vttUrl, timeSec = 5, width, height, className }: Props) {
//   const [thumb, setThumb] = useState<VttThumb | null>(null);
//   const [naturalW, setNaturalW] = useState<number | null>(null);
//   const [naturalH, setNaturalH] = useState<number | null>(null);

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       const res = await fetch(vttUrl);
//       const text = await res.text();
//       const thumbs = parseVttThumbnails(text, vttUrl);
//       const t = pickThumbAt(thumbs, timeSec);
//       if (!cancelled) setThumb(t ?? null);
//     })();
//     return () => { cancelled = true; };
//   }, [vttUrl, timeSec]);

//   useEffect(() => {
//     if (!thumb) return;
//     const img = new Image();
//     img.onload = () => {
//       setNaturalW(img.naturalWidth);
//       setNaturalH(img.naturalHeight);
//     };
//     img.src = thumb.image;
//   }, [thumb]);

//   if (!thumb) {
//     return <div className={`bg-neutral-800 ${className ?? ''}`} style={{ width, height }} />;
//   }

//   const regionW = thumb.w || 160;
//   const regionH = thumb.h || 90;
//   const aspect = regionW && regionH ? regionW / regionH : 16 / 9;
//   const finalW = width ?? (height ? height * aspect : 320);
//   const finalH = height ?? finalW / aspect;

//   // calc background-position (%)
//   // dacă naturalW/H nu-s încă disponibile, folosim px fallback
//   const bgSize = naturalW && naturalH ? `${naturalW}px ${naturalH}px` : 'auto';
//   const bgPos = `${-thumb.x}px ${-thumb.y}px`;

//   return (
//     <div
//       className={className}
//       style={{
//         width: finalW,
//         height: finalH,
//         backgroundImage: `url(${thumb.image})`,
//         backgroundRepeat: 'no-repeat',
//         backgroundSize: bgSize,       // asigură scalare 1:1 la sprite
//         backgroundPosition: bgPos,    // decupează regiunea
//         borderRadius: 12,
//         overflow: 'hidden',
//       }}
//       aria-label="Video thumbnail"
//     />
//   );
// }
