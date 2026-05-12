import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { fulfillSlotPurchase } from "@/lib/stripe-fulfill";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta    = session.metadata ?? {};

    if (meta.type === "slot_purchase") {
      const credited = await fulfillSlotPurchase({
        sessionId:   session.id,
        employerId:  meta.employerId  ?? "",
        standardQty: parseInt(meta.standardQty ?? "0", 10),
        featuredQty: parseInt(meta.featuredQty  ?? "0", 10),
      });
      console.log(`[stripe/webhook] session ${session.id}: ${credited ? "credited" : "already processed"}`);
    }
  }

  return NextResponse.json({ ok: true });
}
