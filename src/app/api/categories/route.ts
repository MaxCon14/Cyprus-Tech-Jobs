import { NextResponse } from "next/server";
import { getNavCategories } from "@/lib/queries";

/**
 * The public category tree.
 *
 * Client components that let someone pick a category — candidate onboarding,
 * the profile editor — used to carry their own hardcoded lists. Those listed
 * nine of the twelve top-level categories, so a candidate could never say they
 * wanted Full Stack, Finance & Trading or Management work, and their alerts and
 * matches silently skipped every job in them.
 */
export async function GET() {
  return NextResponse.json(await getNavCategories());
}
