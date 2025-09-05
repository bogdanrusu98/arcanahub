// apps/web/src/app/api/admin/autoThumbnail/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebaseAdmin";

type Ok = { ok: true; url: string; updated: boolean; reason?: string };
type Err = { error: string };

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try { return typeof err === "string" ? err : JSON.stringify(err); }
  catch { return String(err); }
}

interface AutoThumbnailBody {
  videoId?: string;
  /** suprascrie chiar dacă există deja thumbnail */
  force?: boolean;
  /** secunda din clip pentru cadru (default 5) */
  time?: number;
  /** validează URL-ul (HEAD) înainte de salvare */
  verify?: boolean;
}

function isPositiveNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

function buildThumbUrl({
  playbackId,
  time,
  preferProxy = true,
}: { playbackId: string; time: number; preferProxy?: boolean }): string {
  if (preferProxy) {
    // proxy-ul tău intern (evită whitelist & 502)
    // asigură-te că ai ruta /api/thumb/[playbackId] implementată
    const t = Math.floor(time);
    return `/api/thumb/${encodeURIComponent(playbackId)}?time=${t}`;
  }
  const CACHE_HEADERS = {
    // Cache thumbnail-urile pentru 4 ore, stale pentru 24h
    "Cache-Control": "public, max-age=14400, stale-while-revalidate=86400",
    // Permite cache-ing condițional
    "ETag": `"${playbackId}-${time}"`,
    // Specifică că poate fi cached de CDN
    "Vary": "Accept-Encoding",
  };
  // fallback direct Livepeer template (dacă vrei să sari peste proxy)
  const template =
  process.env.NEXT_PUBLIC_LIVEPEER_THUMB_URL_TEMPLATE ??
  // ✅ CDN public, fără auth:
  "https://livepeercdn.com/thumbnail/{playbackId}.jpg?time=5";
  const url = template.replace("{playbackId}", encodeURIComponent(playbackId));

  return template
    .replace("{playbackId}", encodeURIComponent(playbackId))
    .replace("{time}", String(Math.floor(time)));
}

async function headOk(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // auth simplă
    const adminToken = req.headers.get("x-admin-token");
    if (!adminToken || adminToken !== process.env.ADMIN_API_TOKEN) {
      return NextResponse.json<Err>({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as AutoThumbnailBody;
    const videoId = body.videoId?.trim() ?? "";
    const force = Boolean(body.force);
    const time = isPositiveNumber(body.time) ? body.time : 5;
    const verify = Boolean(body.verify);

    if (!videoId) {
      return NextResponse.json<Err>({ error: "Missing videoId" }, { status: 400 });
    }

    const docRef = adminDb.collection("videos").doc(videoId);
    const snap = await docRef.get();
    if (!snap.exists) {
      return NextResponse.json<Err>({ error: "Video not found" }, { status: 404 });
    }

    const data = snap.data() as {
      thumbnailUrl?: string | null;
      playbackId?: string | null;
    } | undefined;

    const current = data?.thumbnailUrl ?? null;
    const playbackId = data?.playbackId ?? null;

    if (!force && current) {
      return NextResponse.json<Ok>({
        ok: true,
        url: current,
        updated: false,
        reason: "Thumbnail already set",
      });
    }

    if (!playbackId) {
      return NextResponse.json<Err>({ error: "No playbackId on video" }, { status: 400 });
    }

    // preferă proxy-ul intern (schimbă la preferProxy:false ca să folosești direct Livepeer)
    const candidateUrl = buildThumbUrl({ playbackId, time, preferProxy: true });

    // opțional verificăm că răspunde
    let finalUrl = candidateUrl;
    if (verify) {
      const ok = await headOk(candidateUrl);
      if (!ok) {
        // dacă verificarea eșuează, încearcă fallback direct Livepeer;
        const livepeerUrl = buildThumbUrl({ playbackId, time, preferProxy: false });
        const livepeerOk = await headOk(livepeerUrl);
        if (livepeerOk) finalUrl = livepeerUrl;
        // dacă nu răspunde nici Livepeer, lăsăm să se salveze proxy-ul (clientul are fallback imagine locală)
      }
    }

    if (!force && current === finalUrl) {
      return NextResponse.json<Ok>({ ok: true, url: finalUrl, updated: false, reason: "No change" });
    }

    await docRef.update({
      thumbnailUrl: finalUrl,
      thumbnailUpdatedAt: Date.now(),
    });

    return NextResponse.json<Ok>({ ok: true, url: finalUrl, updated: true });
  } catch (err: unknown) {
    const msg = getErrorMessage(err);
    console.error("autoThumbnail error", msg);
    return NextResponse.json<Err>({ error: msg || "Failed to set thumbnail" }, { status: 500 });
  }
}
