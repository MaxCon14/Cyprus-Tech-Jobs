import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook verification failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { employerId, standardQty, featuredQty } = session.metadata ?? {};

    if (!employerId) {
      return NextResponse.json({ error: "Missing employerId in metadata." }, { status: 400 });
    }

    const addStandard = parseInt(standardQty ?? "0", 10);
    const addFeatured = parseInt(featuredQty ?? "0", 10);

    await prisma.employer.update({
      where: { id: employerId },
      data: {
        ...(addStandard > 0 ? { standardCredits: { increment: addStandard } } : {}),
        ...(addFeatured > 0 ? { featuredCredits: { increment: addFeatured } } : {}),
        ...(session.customer ? { stripeCustomerId: session.customer as string } : {}),
      },
    });
  }

  return NextResponse.json({ received: true });
}
