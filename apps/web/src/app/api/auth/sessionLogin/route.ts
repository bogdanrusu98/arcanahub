import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

const SESSION_COOKIE_NAME = "__session";
const EXPIRES_IN_SEC = 7 * 24 * 60 * 60; // 7 days

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: EXPIRES_IN_SEC * 1000,
    });

    const isProd =
      process.env.NODE_ENV === "production" ||
      process.env.VERCEL === "1"; // on Vercel this is set

    const res = NextResponse.json({ ok: true });
    // Use NextResponse.cookies API (handles header formatting)
    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: EXPIRES_IN_SEC,
      secure: isProd, // 🔑 only secure in prod
    });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create session";
    console.error("sessionLogin error:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
