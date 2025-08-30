import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebaseAdmin";

// Lazy init
function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null;
  return new Stripe(secret);
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !whsec) {
    return new NextResponse("Stripe webhook not configured", { status: 500 });
  }

  const sig = req.headers.get("stripe-signature")!;
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, whsec);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    console.error("Webhook verification failed:", msg);
    return new NextResponse(`Webhook Error: ${msg}`, { status: 400 });
  }

  // Handle relevant events
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = (session.metadata || {}) as Record<string, string | undefined>;
    const userId = meta.userId;
    const channelId = meta.channelId;
    const subscriptionId = (session.subscription as string) || undefined;
    const customerId = (session.customer as string) || undefined;

    if (userId && channelId && subscriptionId) {
      // Upsert subscription doc
      await adminDb.collection("subs").doc(subscriptionId).set({
        userId,
        channelId,
        stripeSubId: subscriptionId,
        customerId,
        status: "active",
        createdAt: Date.now(),
      }, { merge: true });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
  
    const currentPeriodEnd = (sub as any).current_period_end; // fallback if TS complains
  
    await adminDb.collection("subs").doc(sub.id).set({
      status: sub.status,
      currentPeriodEnd: currentPeriodEnd ? currentPeriodEnd * 1000 : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
      updatedAt: Date.now(),
    }, { merge: true });
  }

  return NextResponse.json({ received: true });
}
