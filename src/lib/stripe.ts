import Stripe from "stripe";

let _stripe: Stripe | undefined;

export function getStripe() {
  return (_stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY as string));
}

// Price IDs for listing slot packs (Stripe sandbox)
export const SLOT_PRICES = {
  standard_1: process.env.STRIPE_PRICE_STD_1  ?? "",
  standard_3: process.env.STRIPE_PRICE_STD_3  ?? "",
  standard_5: process.env.STRIPE_PRICE_STD_5  ?? "",
  featured_1: process.env.STRIPE_PRICE_FEAT_1 ?? "",
  featured_3: process.env.STRIPE_PRICE_FEAT_3 ?? "",
} as const;

export type SlotPriceKey = keyof typeof SLOT_PRICES;
