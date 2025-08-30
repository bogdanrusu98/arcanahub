import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

type CheckoutBody = {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
  userId?: string;
  channelId?: string;
};

// Lazily create the Stripe client only when the route is invoked
function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null; // don't throw at import time
  return new Stripe(secret);
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured (missing STRIPE_SECRET_KEY)" },
      { status: 500 }
    );
  }

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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    console.error("Checkout error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
