import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, adminUnauthorized } from "@/lib/admin-auth";
import { checkApplyUrl } from "@/lib/link-check";

export const dynamic = "force-dynamic";
// Only takes effect on plans that allow function durations past the Hobby
// 10s cap — harmless to declare either way, it just won't be honoured there.
export const maxDuration = 60;

// Dozens of external hosts checked one at a time would blow past any
// function time limit; a small worker pool keeps this bounded.
const CONCURRENCY = 6;

/**
 * On-demand: check every active job's external apply URL and flag the ones
 * that now 404/410. Triggered from the admin Jobs page ("Check apply links"),
 * not on a schedule — see the button in JobsTableClient for why.
 */
export async function POST() {
  if (!await getAdminUser()) return adminUnauthorized();

  const jobs = await prisma.job.findMany({
    where:  { status: "ACTIVE", applyType: "URL", applyUrl: { not: null } },
    select: { id: true, applyUrl: true },
  });

  const now = new Date();
  const brokenIds: string[] = [];
  let cursor = 0;

  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      const { broken } = await checkApplyUrl(job.applyUrl!);
      await prisma.job.update({
        where: { id: job.id },
        data:  { applyUrlBroken: broken, applyUrlCheckedAt: now },
      });
      if (broken) brokenIds.push(job.id);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, worker)
  );

  return NextResponse.json({ checked: jobs.length, broken: brokenIds.length, brokenIds });
}
