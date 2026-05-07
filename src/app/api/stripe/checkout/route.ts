import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe, SLOT_PRICES, type SlotPriceKey } from "@/lib/stripe";

const SLOT_QUANTITIES: Record<string, number> = {
  standard_1: 1, standard_3: 3, standard_5: 5,
  featured_1: 1, featured_3: 3,
};

export async function POST(req: NextRequest) {
  let body: { slotPriceKey?: string; employerId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { slotPriceKey, employerId } = body;

  if (!slotPriceKey || !(slotPriceKey in SLOT_PRICES)) {
    return NextResponse.json({ error: "Invalid slot type." }, { status: 400 });
  }
  if (!employerId) {
    return NextResponse.json({ error: "Employer ID required." }, { status: 400 });
  }

  const priceId = SLOT_PRICES[slotPriceKey as SlotPriceKey];
  if (!priceId) {
    return NextResponse.json({ error: "Price not configured." }, { status: 500 });
  }

  const employer = await prisma.employer.findUnique({ where: { id: employerId } });
  if (!employer) {
    return NextResponse.json({ error: "Employer not found." }, { status: 404 });
  }

  const slotType     = slotPriceKey.startsWith("standard") ? "standard" : "featured";
  const quantity     = SLOT_QUANTITIES[slotPriceKey];
  const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const session = await getStripe().checkout.sessions.create({
      mode:       "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata:   { type: "slot_purchase", slotType, quantity: String(quantity), employerId },
      success_url:`${appUrl}/buy-credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/buy-credits`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
