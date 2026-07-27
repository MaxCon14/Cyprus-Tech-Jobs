import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { enforceIpLimit, allowRequest } from "@/lib/rate-limit";

/**
 * Applying to an in-app job without an account.
 *
 * An application still needs a candidate row — job_applications.candidateId is
 * NOT NULL, and the employer dashboard resolves applicants through it — so a
 * guest gets one, created unverified. Nothing else has to change for the
 * application to show up like any other, and if that person later signs up with
 * the same address the auth callback flips emailVerified on the row they
 * already have, so their history is waiting for them.
 */

const IP_RULE    = { name: "guest-apply-ip",    limit: 8,  windowSeconds: 3600 };
const EMAIL_RULE = { name: "guest-apply-email", limit: 12, windowSeconds: 86400 };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

export async function POST(req: NextRequest) {
  const limited = await enforceIpLimit(req, IP_RULE, "Too many applications from this connection. Try again later.");
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const jobId     = str(body.jobId, 64);
  const email     = str(body.email, 254)?.toLowerCase() ?? null;
  const firstName = str(body.firstName, 80);
  const lastName  = str(body.lastName, 80);
  const cvUrl     = str(body.cvUrl, 1000);

  const coverLetter    = str(body.coverLetter, 20_000);
  const coverLetterUrl = str(body.coverLetterUrl, 1000);
  const linkedinUrl    = str(body.linkedinUrl, 500);
  const portfolioUrl   = str(body.portfolioUrl, 500);

  if (!jobId)                       return NextResponse.json({ error: "Job is required." }, { status: 422 });
  if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  if (!firstName)                   return NextResponse.json({ error: "Your name is required." }, { status: 422 });

  /* Second counter keyed on the address, so one sender cannot rotate IPs to
     spray applications at every listing under one identity. */
  if (!await allowRequest(email, EMAIL_RULE)) {
    return NextResponse.json(
      { error: "You have sent a lot of applications recently. Try again tomorrow." },
      { status: 429, headers: { "Retry-After": String(EMAIL_RULE.windowSeconds) } },
    );
  }

  const job = await prisma.job.findUnique({
    where:  { id: jobId },
    select: { id: true, status: true, applyType: true, coverLetter: true },
  });
  if (!job)                       return NextResponse.json({ error: "Job not found." }, { status: 404 });
  if (job.status !== "ACTIVE")    return NextResponse.json({ error: "This job is no longer accepting applications." }, { status: 409 });
  if (job.applyType !== "IN_APP") return NextResponse.json({ error: "This job does not use in-app applications." }, { status: 409 });

  const policy = (job.coverLetter ?? "OPTIONAL") as "REQUIRED" | "OPTIONAL" | "NONE";
  if (policy === "REQUIRED" && !coverLetter && !coverLetterUrl) {
    return NextResponse.json({ error: "A cover letter is required for this role." }, { status: 422 });
  }
  if (!cvUrl) return NextResponse.json({ error: "Attach your CV to apply." }, { status: 422 });

  const { data: existing } = await supabaseAdmin
    .from("candidates")
    .select("id, emailVerified, blocked")
    .eq("email", email)
    .maybeSingle();

  /* A verified address belongs to a real account. Letting a guest post under it
     would attach an application the account holder never made to their profile,
     and would expose whether an address is registered. Ask them to sign in
     instead — the same answer either way. */
  if (existing?.emailVerified) {
    return NextResponse.json(
      { error: "That email already has an account. Sign in to apply.", needsSignIn: true },
      { status: 409 },
    );
  }
  if (existing?.blocked) {
    return NextResponse.json({ error: "This account cannot apply." }, { status: 403 });
  }

  let candidateId = existing?.id ?? null;

  if (!candidateId) {
    const { data: created, error: createErr } = await supabaseAdmin
      .from("candidates")
      .insert({
        email,
        firstName,
        lastName,
        cvUrl,
        linkedinUrl,
        portfolioUrl,
        /* Marks this as a guest: no password, no dashboard, no alerts. It is
           not a retention flag — applications are kept for the employer for as
           long as the listing's owner may want them, whether or not the
           applicant ever registers. */
        emailVerified: false,
        /* Applying is not subscribing. Alert emails are driven entirely by rows
           in job_alerts, and this route deliberately creates none — the column
           below is a NOT NULL default that the send path never reads. A guest
           who separately signed up for alerts through the alert form keeps that
           subscription; it is theirs, and it has its own unsubscribe link. */
        alertFrequency: "WEEKLY",
      })
      .select("id")
      .single();

    if (createErr || !created) {
      console.error("[applications/guest] candidate insert", createErr);
      return NextResponse.json({ error: "Could not submit your application. Please try again." }, { status: 500 });
    }
    candidateId = created.id;
  } else {
    /* An unverified row from an earlier guest application. Refresh the details
       they just gave us, but never touch a field they left blank. */
    await supabaseAdmin
      .from("candidates")
      .update({
        firstName,
        lastName,
        cvUrl,
        ...(linkedinUrl  && { linkedinUrl }),
        ...(portfolioUrl && { portfolioUrl }),
      })
      .eq("id", candidateId);
  }

  const { error: appErr } = await supabaseAdmin
    .from("job_applications")
    .upsert({
      jobId,
      candidateId,
      status:         "UNREVIEWED",
      cvUrl,
      coverLetter,
      coverLetterUrl,
      linkedinUrl,
      portfolioUrl,
    }, { onConflict: "jobId,candidateId", ignoreDuplicates: false });

  if (appErr) {
    console.error("[applications/guest] application upsert", appErr);
    return NextResponse.json({ error: "Could not submit your application. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
