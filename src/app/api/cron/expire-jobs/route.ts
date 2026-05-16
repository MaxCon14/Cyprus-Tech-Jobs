import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyGoogleBatch } from "@/lib/google-indexing";

export const dynamic = "force-dynamic";

const ACTIVE_DAYS_LIMIT   = 30;
const INACTIVE_DAYS_LIMIT = 30;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 1. Find ACTIVE jobs that have reached the limit ──────────
  const activeToExpire = await prisma.job.findMany({
    where:  { status: "ACTIVE", activeDays: { gte: ACTIVE_DAYS_LIMIT - 1 } },
    select: { id: true, slug: true },
  });
  if (activeToExpire.length > 0) {
    await prisma.job.updateMany({
      where: { id: { in: activeToExpire.map(j => j.id) } },
      data:  { status: "EXPIRED", activeDays: { increment: 1 } },
    });
  }

  // ── 2. Tick remaining ACTIVE listings ────────────────────────
  await prisma.job.updateMany({
    where: { status: "ACTIVE", activeDays: { lt: ACTIVE_DAYS_LIMIT - 1 } },
    data:  { activeDays: { increment: 1 } },
  });

  // ── 3. Find PAUSED jobs that have reached the limit ──────────
  const pausedToExpire = await prisma.job.findMany({
    where:  { status: "PAUSED", inactiveDays: { gte: INACTIVE_DAYS_LIMIT - 1 } },
    select: { id: true, slug: true },
  });
  if (pausedToExpire.length > 0) {
    await prisma.job.updateMany({
      where: { id: { in: pausedToExpire.map(j => j.id) } },
      data:  { status: "EXPIRED", inactiveDays: { increment: 1 } },
    });
  }

  // ── 4. Tick remaining PAUSED listings ────────────────────────
  await prisma.job.updateMany({
    where: { status: "PAUSED", inactiveDays: { lt: INACTIVE_DAYS_LIMIT - 1 } },
    data:  { inactiveDays: { increment: 1 } },
  });

  // ── 5. Legacy: expire by expiresAt for jobs predating counters ─
  const legacyToExpire = await prisma.job.findMany({
    where:  { status: "ACTIVE", expiresAt: { lt: new Date() } },
    select: { id: true, slug: true },
  });
  if (legacyToExpire.length > 0) {
    await prisma.job.updateMany({
      where: { id: { in: legacyToExpire.map(j => j.id) } },
      data:  { status: "EXPIRED" },
    });
  }

  // ── 6. Notify Google to remove all newly-expired URLs ────────
  const allExpiredSlugs = [
    ...activeToExpire,
    ...pausedToExpire,
    ...legacyToExpire,
  ].map(j => j.slug);

  if (allExpiredSlugs.length > 0) {
    await notifyGoogleBatch(allExpiredSlugs, "URL_DELETED");
  }

  return NextResponse.json({
    expiredActive: activeToExpire.length,
    expiredPaused: pausedToExpire.length,
    expiredLegacy: legacyToExpire.length,
  });
}
