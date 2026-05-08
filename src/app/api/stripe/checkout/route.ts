import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const PRICING = {
  standard: { base: 999, extra: 500 },  // cents
  featured:  { base: 1499, extra: 1000 },
} as const;

type SlotType = "standard" | "featured";

function calcAmountCents(qty: number, type: SlotType): number {
  const { base, extra } = PRICING[type];
  return base + (qty - 1) * extra;
}

export async function POST(req: NextRequest) {
  let body: { quantity?: number; slotType?: string; employerId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { quantity, slotType, employerId } = body;
  const qty = typeof quantity === "number" ? quantity : parseInt(String(quantity ?? "0"), 10);

  if (!slotType || (slotType !== "standard" && slotType !== "featured")) {
    return NextResponse.json({ error: "Invalid slot type." }, { status: 400 });
  }
  if (!qty || qty < 1 || qty > 50) {
    return NextResponse.json({ error: "Quantity must be between 1 and 50." }, { status: 400 });
  }
  if (!employerId) {
    return NextResponse.json({ error: "Employer ID required." }, { status: 400 });
  }

  const employer = await prisma.employer.findUnique({ where: { id: employerId } });
  if (!employer) {
    return NextResponse.json({ error: "Employer not found." }, { status: 404 });
  }

  const amountCents = calcAmountCents(qty, slotType);
  const label       = `${qty} ${slotType.charAt(0).toUpperCase() + slotType.slice(1)} Listing Slot${qty > 1 ? "s" : ""}`;
  const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency:     "eur",
          unit_amount:  amountCents,
          product_data: { name: label },
        },
        quantity: 1,
      }],
      metadata:    { type: "slot_purchase", slotType, quantity: String(qty), employerId },
      success_url: `${appUrl}/buy-credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/buy-credits`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
