import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { authoriseCron } from "@/lib/cron-auth";
import { storagePathFromPublicUrl } from "@/lib/storage-path";

export const dynamic = "force-dynamic";

/**
 * Deletes guest applicants and everything attached to them after 30 days.
 *
 * Someone who applies without an account never asked us to keep a profile, so
 * we do not keep one. A guest is a candidate row with emailVerified = false:
 * signing up at any point flips that flag, which takes the person out of scope
 * here permanently — registering is how you keep your data.
 *
 * The clock runs from their most recent activity, so applying again on day 29
 * does not orphan the newer application. Rows with no application at all are
 * measured from when they were created, which catches abandoned attempts.
 *
 * Uploaded files are removed too, not just the rows that point at them. A
 * deleted database row with the CV still sitting in a public bucket is not a
 * deletion — the URL keeps working for anyone who has it.
 */

const RETENTION_DAYS = 30;

export async function GET(req: NextRequest) {
  const denied = authoriseCron(req);
  if (denied) return denied;

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Every guest, with the timestamps that decide whether they are still in scope.
  const { data: guests, error: guestErr } = await supabaseAdmin
    .from("candidates")
    .select("id, cvUrl, createdAt")
    .eq("emailVerified", false);

  if (guestErr) {
    console.error("[cron/purge-guest-data] candidate query", guestErr);
    return NextResponse.json({ error: "Query failed." }, { status: 500 });
  }
  if (!guests || guests.length === 0) {
    return NextResponse.json({ purged: 0, filesRemoved: 0 });
  }

  const guestIds = guests.map(g => g.id);

  const { data: apps, error: appErr } = await supabaseAdmin
    .from("job_applications")
    .select("candidateId, appliedAt, cvUrl, coverLetterUrl")
    .in("candidateId", guestIds);

  if (appErr) {
    console.error("[cron/purge-guest-data] application query", appErr);
    return NextResponse.json({ error: "Query failed." }, { status: 500 });
  }

  const lastActivity = new Map<string, string>();
  for (const a of apps ?? []) {
    const prev = lastActivity.get(a.candidateId);
    if (!prev || a.appliedAt > prev) lastActivity.set(a.candidateId, a.appliedAt);
  }

  const expired = guests.filter(g => (lastActivity.get(g.id) ?? g.createdAt) < cutoff);
  if (expired.length === 0) {
    return NextResponse.json({ purged: 0, filesRemoved: 0, guestsTracked: guests.length });
  }
  const expiredIds = new Set(expired.map(g => g.id));

  /* Collect the files before deleting the rows that point at them — afterwards
     there is no way left to find them. */
  const paths = new Set<string>();
  for (const g of expired) {
    const p = storagePathFromPublicUrl(g.cvUrl, "cvs");
    if (p) paths.add(p);
  }
  for (const a of apps ?? []) {
    if (!expiredIds.has(a.candidateId)) continue;
    for (const url of [a.cvUrl, a.coverLetterUrl]) {
      const p = storagePathFromPublicUrl(url, "cvs");
      if (p) paths.add(p);
    }
  }

  let filesRemoved = 0;
  if (paths.size > 0) {
    const { error: rmErr } = await supabaseAdmin.storage.from("cvs").remove([...paths]);
    if (rmErr) {
      /* Stop rather than press on: deleting the rows now would strand these
         files with nothing left pointing at them, so they could never be found
         and removed on a later run. Next run retries the whole set. */
      console.error("[cron/purge-guest-data] storage remove", rmErr);
      return NextResponse.json({ error: "Storage cleanup failed; rows kept for retry." }, { status: 500 });
    }
    filesRemoved = paths.size;
  }

  const ids = [...expiredIds];

  /* Children first: job_applications.candidateId has no cascade, so removing
     the candidate first would fail or orphan rows. */
  for (const table of ["job_applications", "applied_jobs", "saved_jobs", "candidate_positions"]) {
    const { error } = await supabaseAdmin.from(table).delete().in("candidateId", ids);
    if (error) {
      console.error(`[cron/purge-guest-data] delete ${table}`, error);
      return NextResponse.json({ error: `Failed clearing ${table}.` }, { status: 500 });
    }
  }

  const { error: delErr } = await supabaseAdmin.from("candidates").delete().in("id", ids);
  if (delErr) {
    console.error("[cron/purge-guest-data] delete candidates", delErr);
    return NextResponse.json({ error: "Failed removing guest records." }, { status: 500 });
  }

  console.log(`[cron/purge-guest-data] purged ${ids.length} guests, ${filesRemoved} files`);
  return NextResponse.json({
    purged:        ids.length,
    filesRemoved,
    guestsTracked: guests.length,
    retentionDays: RETENTION_DAYS,
  });
}
