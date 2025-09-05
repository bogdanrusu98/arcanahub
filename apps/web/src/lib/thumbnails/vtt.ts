// src/lib/thumbnails/vtt.ts
export type VttThumb = {
    start: number; // sec
    end: number;   // sec
    image: string; // url sprite (fără #xywh)
    x: number; y: number; w: number; h: number;
  };
  
  const parseTimestamp = (t: string) => {
    // 00:00:05.000
    const [hh, mm, ss] = t.split(':');
    return (+hh) * 3600 + (+mm) * 60 + parseFloat(ss.replace(',', '.'));
  };
  
  export function parseVttThumbnails(vttText: string, baseUrl?: string): VttThumb[] {
    const lines = vttText.split(/\r?\n/);
    const thumbs: VttThumb[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line || line.startsWith('WEBVTT')) continue;
      if (line.includes('-->')) {
        const [s, e] = line.split('-->').map(s => s.trim());
        const start = parseTimestamp(s);
        const end   = parseTimestamp(e);
        const urlLine = (lines[++i] || '').trim();
        if (!urlLine) continue;
  
        const [imgUrlRaw, frag] = urlLine.split('#');
        const imgUrl = new URL(imgUrlRaw, baseUrl).toString();
  
        let x=0,y=0,w=0,h=0;
        if (frag?.startsWith('xywh=')) {
          const [xs,ys,ws,hs] = frag.slice(5).split(',').map(Number);
          x=xs; y=ys; w=ws; h=hs;
        }
        thumbs.push({ start, end, image: imgUrl, x, y, w, h });
      }
    }
    return thumbs;
  }
  
  export function pickThumbAt(thumbs: VttThumb[], tSec: number): VttThumb | undefined {
    return thumbs.find(t => t.start <= tSec && tSec < t.end) || thumbs[0];
  }
  