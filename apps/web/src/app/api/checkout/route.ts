import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) throw new Error("STRIPE_SECRET_KEY is not set");

// use SDK default apiVersion to avoid TS literal mismatch
const stripe = new Stripe(secret);

type CheckoutBody = {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
  userId?: string;
  channelId?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutBody;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: body.priceId, quantity: 1 }],
      success_url: body.successUrl ?? `${req.nextUrl.origin}?checkout=success`,
      cancel_url: body.cancelUrl ?? `${req.nextUrl.origin}?checkout=cancel`,
      client_reference_id: body.userId,
      metadata: {
        ...(body.userId ? { userId: body.userId } : {}),
        ...(body.channelId ? { channelId: body.channelId } : {}),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Checkout failed";
    console.error("Checkout error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
