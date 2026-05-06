import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const STANDARD_PRICE_ID = process.env.STRIPE_STANDARD_PRICE_ID!;
const FEATURED_PRICE_ID = process.env.STRIPE_FEATURED_PRICE_ID!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

// Discount percentages for bulk orders
const BULK_DISCOUNT_3 = 10; // 10% off for 3–4 listings
const BULK_DISCOUNT_5 = 20; // 20% off for 5+ listings

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Sign in to purchase listings." }, { status: 401 });
  }

  const employer = await prisma.employer.findUnique({ where: { email: user.email } });
  if (!employer) {
    return NextResponse.json({ error: "Employer account not found." }, { status: 403 });
  }

  let body: { standardQty?: number; featuredQty?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const standardQty = Math.max(0, Math.floor(body.standardQty ?? 0));
  const featuredQty = Math.max(0, Math.floor(body.featuredQty ?? 0));

  if (standardQty === 0 && featuredQty === 0) {
    return NextResponse.json({ error: "Select at least one listing." }, { status: 422 });
  }

  const totalQty = standardQty + featuredQty;

  // Build line items
  const lineItems: { price: string; quantity: number }[] = [];
  if (standardQty > 0) lineItems.push({ price: STANDARD_PRICE_ID, quantity: standardQty });
  if (featuredQty > 0) lineItems.push({ price: FEATURED_PRICE_ID, quantity: featuredQty });

  // Apply bulk discount coupon
  let discounts: { coupon: string }[] | undefined;
  if (totalQty >= 5 || totalQty >= 3) {
    const pct = totalQty >= 5 ? BULK_DISCOUNT_5 : BULK_DISCOUNT_3;
    const coupon = await stripe.coupons.create({
      percent_off: pct,
      duration: "once",
      name: `${pct}% bulk discount`,
    });
    discounts = [{ coupon: coupon.id }];
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    ...(discounts ? { discounts } : {}),
    metadata: {
      employerId: employer.id,
      standardQty: String(standardQty),
      featuredQty: String(featuredQty),
    },
    success_url: `${APP_URL}/post-a-job?payment=success`,
    cancel_url: `${APP_URL}/post-a-job`,
    customer_email: employer.email,
  });

  return NextResponse.json({ url: session.url });
}
