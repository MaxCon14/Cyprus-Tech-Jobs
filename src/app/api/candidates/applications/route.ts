import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Sign in to apply." }, { status: 401 });
  }

  const { data: candidate } = await supabaseAdmin
    .from("candidates")
    .select("id, firstName, lastName, email, cvUrl, linkedinUrl, portfolioUrl")
    .eq("email", user.email)
    .single();

  if (!candidate) {
    return NextResponse.json({ error: "Candidate account not found." }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const jobId          = typeof body.jobId          === "string" ? body.jobId.trim()          : null;
  const coverLetter    = typeof body.coverLetter    === "string" ? body.coverLetter.trim()    : null;
  const coverLetterUrl = typeof body.coverLetterUrl === "string" ? body.coverLetterUrl.trim() : null;
  const customCvUrl    = typeof body.cvUrl          === "string" ? body.cvUrl.trim()          : null;

  if (!jobId) {
    return NextResponse.json({ error: "Job ID is required." }, { status: 422 });
  }

  const job = await prisma.job.findUnique({
    where:  { id: jobId },
    select: { id: true, status: true, applyType: true, coverLetter: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }
  if (job.status !== "ACTIVE") {
    return NextResponse.json({ error: "This job is no longer accepting applications." }, { status: 409 });
  }
  if (job.applyType !== "IN_APP") {
    return NextResponse.json({ error: "This job does not use in-app applications." }, { status: 409 });
  }

  const policy = (job.coverLetter ?? "OPTIONAL") as "REQUIRED" | "OPTIONAL" | "NONE";
  if (policy === "REQUIRED" && !coverLetter && !coverLetterUrl) {
    return NextResponse.json({ error: "A cover letter is required for this role." }, { status: 422 });
  }

  const { error } = await supabaseAdmin
    .from("job_applications")
    .upsert({
      jobId,
      candidateId:     candidate.id,
      status:          "PENDING",
      cvUrl:           customCvUrl || candidate.cvUrl || null,
      coverLetter:     coverLetter  || null,
      coverLetterUrl:  coverLetterUrl || null,
      linkedinUrl:     candidate.linkedinUrl  ?? null,
      portfolioUrl:    candidate.portfolioUrl ?? null,
    }, {
      onConflict:       "jobId,candidateId",
      ignoreDuplicates: false,
    });

  if (error) {
    console.error("[candidates/applications POST]", error);
    return NextResponse.json({ error: "Failed to submit application. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
