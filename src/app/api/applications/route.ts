import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  // Auth — must be a logged-in candidate
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { data: candidate } = await supabaseAdmin
    .from("candidates")
    .select("id")
    .eq("email", user.email)
    .single();

  if (!candidate) {
    return NextResponse.json({ error: "Candidate profile not found." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const jobId = typeof body.jobId === "string" ? body.jobId.trim() : "";
  if (!jobId) {
    return NextResponse.json({ error: "jobId is required." }, { status: 422 });
  }

  const coverLetter    = typeof body.coverLetter === "string" ? body.coverLetter.trim().slice(0, 1000) || null : null;
  const cvUrl          = typeof body.cvUrl === "string" ? body.cvUrl.trim() || null : null;
  const availability   = typeof body.availability === "string" ? body.availability || null : null;
  const noticePeriod   = typeof body.noticePeriod === "string" ? body.noticePeriod || null : null;
  const expectedSalary = typeof body.expectedSalary === "number" && body.expectedSalary > 0 ? body.expectedSalary : null;
  const rightToWork    = typeof body.rightToWork === "string" ? body.rightToWork || null : null;
  const linkedinUrl    = typeof body.linkedinUrl === "string" ? body.linkedinUrl.trim() || null : null;
  const portfolioUrl   = typeof body.portfolioUrl === "string" ? body.portfolioUrl.trim() || null : null;

  const { data, error } = await supabaseAdmin
    .from("job_applications")
    .upsert(
      { jobId, candidateId: candidate.id, coverLetter, cvUrl, availability, noticePeriod, expectedSalary, rightToWork, linkedinUrl, portfolioUrl },
      { onConflict: "jobId,candidateId", ignoreDuplicates: true }
    )
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[applications/post]", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }

  // data is null when the row already existed (ignoreDuplicates) — that's fine
  return NextResponse.json({ applicationId: data?.id ?? null }, { status: 201 });
}
