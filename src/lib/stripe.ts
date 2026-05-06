import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const PRICE_IDS = {
  standard: process.env.STRIPE_PRICE_STANDARD ?? "price_1TUCeQRupFe5vg1G7wpyHtgd",
  featured:  process.env.STRIPE_PRICE_FEATURED  ?? "price_1TUCf2RupFe5vg1G3fcZY9rp",
  bundle:    process.env.STRIPE_PRICE_BUNDLE    ?? "price_1TUD58RupFe5vg1GUgOO4EUv",
} as const;
