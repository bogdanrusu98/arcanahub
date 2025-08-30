"use client";
// Subscribes via Stripe Checkout using a serverless API route.

import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SubscribeButton({ priceId }: { priceId: string }) {
  const go = async () => {
    const stripe = await stripePromise;
    if (!stripe) return;

    // Call our API route to create a Checkout Session
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId,
        // You can customize URLs here if needed
        // successUrl: "http://localhost:3000?checkout=success",
        // cancelUrl: "http://localhost:3000?checkout=cancel",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data?.error ?? "Checkout failed");
      return;
    }

    // Redirect the user to Stripe-hosted Checkout
    const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
    if (error) alert(error.message);
  };

  return (
    <button onClick={go} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
      Subscribe
    </button>
  );
}
