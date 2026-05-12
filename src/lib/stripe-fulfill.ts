import { prisma } from "@/lib/prisma";

/**
 * Idempotently credits slot purchases to an employer.
 * Safe to call from both the Stripe webhook and the success-page fallback.
 * Returns true if slots were credited, false if already processed.
 */
export async function fulfillSlotPurchase({
  sessionId,
  employerId,
  standardQty,
  featuredQty,
}: {
  sessionId: string;
  employerId: string;
  standardQty: number;
  featuredQty: number;
}): Promise<boolean> {
  if (!employerId || standardQty + featuredQty === 0) return false;

  // Check for duplicate before entering transaction (fast path)
  const existing = await prisma.slotPurchase.findUnique({ where: { sessionId } });
  if (existing) return false;

  try {
    await prisma.$transaction([
      prisma.slotPurchase.create({
        data: { sessionId, employerId, standardQty, featuredQty },
      }),
      prisma.employer.update({
        where: { id: employerId },
        data: {
          ...(standardQty > 0 && { standardSlots: { increment: standardQty } }),
          ...(featuredQty  > 0 && { featuredSlots:  { increment: featuredQty  } }),
        },
      }),
    ]);
    return true;
  } catch (err: unknown) {
    // Unique constraint violation = another request already processed this session
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return false;
    }
    throw err;
  }
}
