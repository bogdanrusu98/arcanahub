import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

const SESSION_COOKIE_NAME = "__session";
const EXPIRES_IN_SEC = 7 * 24 * 60 * 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const idToken = typeof body?.idToken === "string" ? body.idToken : null;

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken in request body" }, { status: 400 });
    }

    // optional: check token before creating cookie (helps error clarity)
    await adminAuth.verifyIdToken(idToken);

    const cookie = await adminAuth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN_SEC * 1000 });

    const isProd = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: cookie,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: EXPIRES_IN_SEC,
      secure: isProd, // Secure în prod, non-secure local
    });

    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create session";
    // Trimite eroarea reală la client ca să o vezi în DevTools
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
