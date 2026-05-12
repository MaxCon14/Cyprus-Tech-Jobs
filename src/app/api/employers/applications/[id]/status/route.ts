import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: applicationId } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const employer = await prisma.employer.findUnique({
    where: { email: user.email },
    select: { id: true, companyId: true },
  });
  if (!employer?.companyId) {
    return NextResponse.json({ error: "Employer account not found." }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const status = typeof body.status === "string" ? body.status : null;
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 422 });
  }

  // Fetch the application and verify it belongs to one of the employer's jobs
  const { data: application } = await supabaseAdmin
    .from("job_applications")
    .select("id, jobId")
    .eq("id", applicationId)
    .single();

  if (!application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  // Verify the job belongs to this employer's company
  const job = await prisma.job.findUnique({
    where: { id: application.jobId },
    select: { companyId: true },
  });

  if (!job || job.companyId !== employer.companyId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from("job_applications")
    .update({ status })
    .eq("id", applicationId);

  if (error) {
    console.error("[employers/applications/status PATCH]", error);
    return NextResponse.json({ error: "Failed to update status." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status });
}
