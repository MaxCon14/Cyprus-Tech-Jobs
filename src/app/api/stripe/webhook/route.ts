import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
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
      const { employerId } = meta;
      const standardQty    = parseInt(meta.standardQty ?? "0", 10);
      const featuredQty    = parseInt(meta.featuredQty  ?? "0", 10);

      if (!employerId || (standardQty + featuredQty === 0)) {
        console.error("[stripe/webhook] missing slot_purchase metadata", meta);
        return NextResponse.json({ ok: true });
      }

      await prisma.employer.update({
        where: { id: employerId },
        data: {
          ...(standardQty > 0 && { standardSlots: { increment: standardQty } }),
          ...(featuredQty  > 0 && { featuredSlots:  { increment: featuredQty  } }),
        },
      });

      console.log(`[stripe/webhook] Added ${standardQty} standard + ${featuredQty} featured slots to employer ${employerId}`);
    }
  }

  return NextResponse.json({ ok: true });
}
