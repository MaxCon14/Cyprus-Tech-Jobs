import Stripe from "stripe";

let _stripe: Stripe | undefined;

export function getStripe() {
  return (_stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY as string));
}
