import { cookies } from "next/headers";
import { adminAuth } from "@/lib/server/firebaseAdmin";

const SESSION_COOKIE_NAME = "__session";

export type ServerUser = {
  uid: string;
  email?: string;
};

export async function getServerUser(): Promise<ServerUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid, email: decoded.email ?? undefined };
  } catch {
    return null;
  }
}
