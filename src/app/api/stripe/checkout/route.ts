import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const PRICING = {
  standard: { base: 999,  extra: 500  },
  featured:  { base: 1499, extra: 1000 },
} as const;

type SlotType = "standard" | "featured";

function calcAmountCents(qty: number, type: SlotType): number {
  const { base, extra } = PRICING[type];
  return base + (qty - 1) * extra;
}

export async function POST(req: NextRequest) {
  let body: {
    standardQty?: number;
    featuredQty?: number;
    employerId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { employerId } = body;
  const standardQty = Math.max(0, Math.min(50, Number(body.standardQty ?? 0)));
  const featuredQty  = Math.max(0, Math.min(50, Number(body.featuredQty  ?? 0)));

  if (standardQty + featuredQty === 0) {
    return NextResponse.json({ error: "Select at least one slot to purchase." }, { status: 400 });
  }
  if (!employerId) {
    return NextResponse.json({ error: "Employer ID required." }, { status: 400 });
  }

  const employer = await prisma.employer.findUnique({ where: { id: employerId } });
  if (!employer) {
    return NextResponse.json({ error: "Employer not found." }, { status: 404 });
  }

  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const lineItems = [];

  if (standardQty > 0) {
    lineItems.push({
      price_data: {
        currency:     "eur",
        unit_amount:  calcAmountCents(standardQty, "standard"),
        product_data: {
          name: `${standardQty} Standard Listing Slot${standardQty > 1 ? "s" : ""}`,
        },
      },
      quantity: 1,
    });
  }

  if (featuredQty > 0) {
    lineItems.push({
      price_data: {
        currency:     "eur",
        unit_amount:  calcAmountCents(featuredQty, "featured"),
        product_data: {
          name: `${featuredQty} Featured Listing Slot${featuredQty > 1 ? "s" : ""}`,
        },
      },
      quantity: 1,
    });
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode:       "payment",
      line_items: lineItems,
      metadata: {
        type:        "slot_purchase",
        employerId,
        standardQty: String(standardQty),
        featuredQty:  String(featuredQty),
      },
      success_url: `${appUrl}/buy-credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/buy-credits`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
