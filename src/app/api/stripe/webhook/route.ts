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
    const jobId   = session.metadata?.jobId;

    if (!jobId) {
      console.error("[stripe/webhook] no jobId in session metadata");
      return NextResponse.json({ ok: true });
    }

    const now       = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.job.update({
      where: { id: jobId },
      data:  { status: "ACTIVE", postedAt: now, expiresAt },
    });

    console.log(`[stripe/webhook] Job ${jobId} activated`);
  }

  return NextResponse.json({ ok: true });
}
