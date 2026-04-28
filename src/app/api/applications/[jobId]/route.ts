import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import type { CandidateRow, PositionRow } from "@/lib/candidate-types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  // Auth — must be a logged-in employer
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const employer = await prisma.employer.findUnique({
    where: { email: user.email },
    select: { id: true },
  });
  if (!employer) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Verify this job belongs to the employer's company
  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      company: { employers: { some: { email: user.email } } },
    },
    select: { id: true },
  });
  if (!job) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Fetch applications
  const { data: applications, error } = await supabaseAdmin
    .from("job_applications")
    .select("id, candidateId, coverLetter, status, appliedAt")
    .eq("jobId", jobId)
    .order("appliedAt", { ascending: false });

  if (error) {
    console.error("[applications/get]", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }

  if (!applications || applications.length === 0) {
    return NextResponse.json({ applications: [] });
  }

  const candidateIds = applications.map((a) => a.candidateId);

  // Batch fetch candidate profiles
  const { data: candidates } = await supabaseAdmin
    .from("candidates")
    .select("*")
    .in("id", candidateIds);

  // Batch fetch positions (latest 2 per candidate)
  const { data: allPositions } = await supabaseAdmin
    .from("candidate_positions")
    .select("*")
    .in("candidateId", candidateIds)
    .order("current", { ascending: false })
    .order("startDate", { ascending: false });

  const candidateMap = new Map<string, CandidateRow>(
    (candidates ?? []).map((c) => [c.id, c as CandidateRow])
  );

  const positionsMap = new Map<string, PositionRow[]>();
  for (const pos of (allPositions ?? []) as PositionRow[]) {
    const arr = positionsMap.get(pos.candidateId) ?? [];
    if (arr.length < 2) {
      arr.push(pos);
      positionsMap.set(pos.candidateId, arr);
    }
  }

  const result = applications.map((app) => ({
    id: app.id,
    coverLetter: app.coverLetter,
    status: app.status,
    appliedAt: app.appliedAt,
    candidate: candidateMap.get(app.candidateId) ?? null,
    positions: positionsMap.get(app.candidateId) ?? [],
  }));

  return NextResponse.json({ applications: result });
}
