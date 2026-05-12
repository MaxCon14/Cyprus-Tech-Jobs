import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ACTIVE_DAYS_LIMIT   = 30;
const INACTIVE_DAYS_LIMIT = 30;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 1. Tick activeDays for every ACTIVE listing ──────────────
  // Jobs that will hit 30 are expired; the rest just get +1.
  const [expiredActive] = await prisma.$transaction([
    prisma.job.updateMany({
      where: { status: "ACTIVE", activeDays: { gte: ACTIVE_DAYS_LIMIT - 1 } },
      data:  { status: "EXPIRED", activeDays: { increment: 1 } },
    }),
    prisma.job.updateMany({
      where: { status: "ACTIVE", activeDays: { lt: ACTIVE_DAYS_LIMIT - 1 } },
      data:  { activeDays: { increment: 1 } },
    }),
  ]);

  // ── 2. Tick inactiveDays for every PAUSED listing ────────────
  const [expiredPaused] = await prisma.$transaction([
    prisma.job.updateMany({
      where: { status: "PAUSED", inactiveDays: { gte: INACTIVE_DAYS_LIMIT - 1 } },
      data:  { status: "EXPIRED", inactiveDays: { increment: 1 } },
    }),
    prisma.job.updateMany({
      where: { status: "PAUSED", inactiveDays: { lt: INACTIVE_DAYS_LIMIT - 1 } },
      data:  { inactiveDays: { increment: 1 } },
    }),
  ]);

  // ── 3. Legacy: expire by expiresAt for jobs predating counters ─
  const legacy = await prisma.job.updateMany({
    where: { status: "ACTIVE", expiresAt: { lt: new Date() } },
    data:  { status: "EXPIRED" },
  });

  return NextResponse.json({
    expiredActive: expiredActive.count,
    expiredPaused: expiredPaused.count,
    expiredLegacy: legacy.count,
  });
}
