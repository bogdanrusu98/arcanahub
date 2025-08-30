// apps/web/src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) throw new Error("STRIPE_SECRET_KEY is not set");

const stripe = new Stripe(secret); // <-- no apiVersion here

export async function POST(req: NextRequest) {
  try {
    const { priceId, successUrl, cancelUrl } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl ?? `${req.nextUrl.origin}?checkout=success`,
      cancel_url: cancelUrl ?? `${req.nextUrl.origin}?checkout=cancel`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: err.message ?? "Checkout failed" }, { status: 400 });
  }
}
