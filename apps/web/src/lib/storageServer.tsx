import { getStorage } from "firebase-admin/storage";
import { adminApp } from "./firebaseAdmin";

const storage = getStorage(adminApp);

// Try to infer bucket from env or project
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
const fallbackBucket = projectId ? `${projectId}.appspot.com` : undefined;
const BUCKET = process.env.FIREBASE_STORAGE_BUCKET || fallbackBucket;

if (!BUCKET) {
  console.warn("[storageServer] No storage bucket configured. Set FIREBASE_STORAGE_BUCKET.");
}

export function getBucket() {
  return storage.bucket(BUCKET);
}

/** Convert gs file path into a public download URL (if rules allow public). */
export function publicDownloadUrl(path: string) {
  // Public URL (if object is publicly readable). For private buckets, better use signed URLs.
  return `https://storage.googleapis.com/${BUCKET}/${encodeURIComponent(path)}`;
}

/** Creates a signed URL (read) valid for X minutes (default 7 days). */
export async function signedReadUrl(path: string, minutes = 60 * 24 * 7) {
  const bucket = getBucket();
  const file = bucket.file(path);
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + minutes * 60 * 1000,
  });
  return url;
}
