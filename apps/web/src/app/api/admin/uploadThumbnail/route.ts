import { NextRequest, NextResponse } from "next/server";
import { getBucket, publicDownloadUrl, signedReadUrl } from "@/lib/storageServer";
import { adminDb } from "@/lib/server/firebaseAdmin";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try { return typeof err === "string" ? err : JSON.stringify(err); }
  catch { return String(err); }
}

/**
 * POST multipart/form-data with fields:
 *  - videoId: string
 *  - file: File (image/*)
 *
 * Uploads to Firebase Storage: thumbnails/{videoId}.{ext}
 * Then updates videos/{videoId}.thumbnailUrl with a public or signed URL.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const videoId = String(form.get("videoId") ?? "");
    const file = form.get("file");

    if (!videoId || !file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing videoId or file" }, { status: 400 });
    }
    if (!file.type?.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    const arrayBuf = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    const ext =
      file.type === "image/png" ? "png" :
      file.type === "image/webp" ? "webp" : "jpg";

    const objectPath = `thumbnails/${videoId}.${ext}`;

    const bucket = getBucket();
    const gcsFile = bucket.file(objectPath);
    await gcsFile.save(buffer, {
      contentType: file.type,
      resumable: false,
      public: process.env.FIREBASE_PUBLIC_FILES === "true",
      metadata: {
        cacheControl: "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    });

    const url = process.env.FIREBASE_PUBLIC_FILES === "true"
      ? publicDownloadUrl(objectPath)
      : await signedReadUrl(objectPath, 60 * 24 * 30); // 30 days

    await adminDb.collection("videos").doc(videoId).update({
      thumbnailUrl: url,
      thumbnailUpdatedAt: Date.now(),
    });

    return NextResponse.json({ ok: true, url });
  } catch (err: unknown) {
    const msg = getErrorMessage(err);
    console.error("uploadThumbnail error", msg);
    return NextResponse.json({ error: msg ?? "Upload failed" }, { status: 500 });
  }
}
