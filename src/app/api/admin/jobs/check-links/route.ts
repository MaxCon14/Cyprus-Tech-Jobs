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
 * On-demand: look at every active job's external apply URL and record which
 * ones are worth a human checking. Triggered from the admin Jobs page ("Check
 * apply links"), not on a schedule — see the button in JobsTableClient.
 *
 * The result is **advisory**, including an HTTP 404. Bolt returns 404 to this
 * checker for listings that are live in a browser, so a status code from here
 * is a signal and not a verdict — see checkApplyUrl. Nothing in this route may
 * mark a job as confirmed-dead, and nothing acts on the result automatically:
 * unpublishing stays a human decision.
 */
export async function POST() {
  if (!await getAdminUser()) return adminUnauthorized();

  const jobs = await prisma.job.findMany({
    where:  { status: "ACTIVE", applyType: "URL", applyUrl: { not: null } },
    select: { id: true, applyUrl: true },
  });

  const now = new Date();
  const flaggedIds: string[] = [];
  let cursor = 0;

  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      const { flagged, reason } = await checkApplyUrl(job.applyUrl!);
      await prisma.job.update({
        where: { id: job.id },
        // Always rewritten, so a link that recovers clears its own flag.
        data:  { applyUrlBroken: flagged, applyUrlCheckedAt: now, applyUrlCheckReason: reason },
      });
      if (flagged) flaggedIds.push(job.id);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, worker)
  );

  return NextResponse.json({ checked: jobs.length, flagged: flaggedIds.length, flaggedIds });
}
