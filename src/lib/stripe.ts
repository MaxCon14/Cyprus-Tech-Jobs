import Stripe from "stripe";

let _stripe: Stripe | undefined;

export function getStripe() {
  return (_stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY as string));
}

export const PRICE_IDS = {
  standard: process.env.STRIPE_PRICE_STANDARD ?? "price_1TUDGzRsffOCYGPJ6riZKaa2",
  featured:  process.env.STRIPE_PRICE_FEATURED  ?? "price_1TUDHORsffOCYGPJkzVpYRr1",
  bundle:    process.env.STRIPE_PRICE_BUNDLE    ?? "",
} as const;
