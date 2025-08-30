import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebaseAdmin";

function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY;
  return secret ? new Stripe(secret) : null;
}

async function upsertSubscription(params: {
  stripeSubId: string;
  userId?: string | null;
  channelId?: string | null;
  status: string;
  customerId?: string | null;
  currentPeriodEnd?: number | null; // epoch ms
  cancelAtPeriodEnd?: boolean | null;
}) {
  const doc = {
    ...params,
    updatedAt: Date.now(),
    createdAt: Date.now(),
  };
  await adminDb.collection("subs").doc(params.stripeSubId).set(doc, { merge: true });
}

type StripeSubWithPeriodEnd = Stripe.Subscription & {
  current_period_end?: number; // seconds
};

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !whsec) return new NextResponse("Stripe webhook not configured", { status: 500 });

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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = (session.metadata || {}) as Record<string, string | undefined>;
        const userId = meta.userId ?? null;
        const channelId = meta.channelId ?? null;
        const stripeSubId = (session.subscription as string) ?? null;
        const customerId = (session.customer as string) ?? null;

        if (stripeSubId) {
          await upsertSubscription({
            stripeSubId,
            userId,
            channelId,
            customerId,
            status: "active",
            currentPeriodEnd: null,
            cancelAtPeriodEnd: null,
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as StripeSubWithPeriodEnd;
        const currentPeriodEndMs = sub.current_period_end ? sub.current_period_end * 1000 : null;

        await upsertSubscription({
          stripeSubId: sub.id,
          userId: (sub.metadata?.userId as string | undefined) ?? null,
          channelId: (sub.metadata?.channelId as string | undefined) ?? null,
          status: sub.status,
          customerId: (sub.customer as string) ?? null,
          currentPeriodEnd: currentPeriodEndMs,
          cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
        });
        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook processing failed";
    console.error("Webhook handler error:", msg);
    return new NextResponse(msg, { status: 500 });
  }
}
