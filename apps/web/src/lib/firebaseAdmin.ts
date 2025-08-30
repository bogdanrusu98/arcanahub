// apps/web/src/lib/firebaseAdmin.ts
import "server-only";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminDb } from "firebase-admin/firestore";
import { getDatabase as getAdminRtdb } from "firebase-admin/database";
import { getStorage as getAdminStorage } from "firebase-admin/storage";

const projectId = process.env.FIREBASE_PROJECT_ID || undefined;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || undefined;

// Normalize private key:
// - replace literal "\n" with real newlines (Vercel/Windows envs)
let privateKey = process.env.FIREBASE_PRIVATE_KEY || undefined;
if (privateKey) {
  // Remove surrounding quotes if added by platform
  if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, "\n");
}

const hasCreds = Boolean(projectId && clientEmail && privateKey);

function initAdmin() {
  if (getApps().length) return getApp();

  if (hasCreds) {
    return initializeApp({
      credential: cert({ projectId: projectId!, clientEmail: clientEmail!, privateKey: privateKey! }),
      projectId,
    });
  }

  // Fallback: initialize without explicit credential (will fail on protected ops),
  // but avoids throwing at import-time. Prefer to set envs properly.
  return initializeApp();
}

const app = initAdmin();

export const adminAuth = getAdminAuth(app);
export const adminDb = getAdminDb(app);
// export const adminRtdb = getAdminRtdb(app);
export const adminStorage = getAdminStorage(app);
