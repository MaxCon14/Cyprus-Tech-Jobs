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
 * On-demand: check every active job's external apply URL. Triggered from the
 * admin Jobs page ("Check apply links"), not on a schedule — see the button in
 * JobsTableClient for why.
 *
 * Two outcomes, kept separate on purpose. `applyUrlBroken` is only ever set by
 * an authoritative 404/410. A soft-404 heuristic match is recorded in
 * `applyUrlCheckReason` and surfaces as "Check", because it is an inference
 * about someone else's HTML — two live Bolt listings were previously shown as
 * definitively "Broken" on the strength of it.
 */
export async function POST() {
  if (!await getAdminUser()) return adminUnauthorized();

  const jobs = await prisma.job.findMany({
    where:  { status: "ACTIVE", applyType: "URL", applyUrl: { not: null } },
    select: { id: true, applyUrl: true },
  });

  const now = new Date();
  const brokenIds:  string[] = [];
  const suspectIds: string[] = [];
  let cursor = 0;

  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      const { broken, reason } = await checkApplyUrl(job.applyUrl!);
      await prisma.job.update({
        where: { id: job.id },
        // reason is always rewritten, so a link that recovers clears its flag.
        data:  { applyUrlBroken: broken, applyUrlCheckedAt: now, applyUrlCheckReason: reason },
      });
      if (broken) brokenIds.push(job.id);
      else if (reason === "soft-404") suspectIds.push(job.id);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, worker)
  );

  return NextResponse.json({
    checked: jobs.length,
    broken:  brokenIds.length,
    suspect: suspectIds.length,
    brokenIds,
    suspectIds,
  });
}
