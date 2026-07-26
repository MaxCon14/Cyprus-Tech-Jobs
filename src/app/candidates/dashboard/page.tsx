export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { DashboardView } from "./DashboardView";
import { getMatchingJobsForCandidate } from "@/lib/queries";
import type { CandidateRow, PositionRow } from "@/lib/candidate-types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My dashboard — CyprusTech.Careers" };

// ─── Completion ───────────────────────────────────────────────────────────────

function getCompletion(c: CandidateRow, hasPositions: boolean) {
  const items = [
    { label: "Full name",               done: !!(c.firstName && c.lastName) },
    { label: "Professional headline",   done: !!c.headline },
    { label: "About / bio",             done: !!c.bio },
    { label: "Location or work type",   done: !!(c.city || c.remoteType) },
    { label: "GitHub or portfolio",     done: !!(c.githubUrl || c.linkedinUrl || c.portfolioUrl) },
    { label: "CV link",                 done: !!c.cvUrl },
    { label: "Work experience",         done: hasPositions },
  ];
  const score = items.filter(i => i.done).length;
  return { items, score, pct: Math.round((score / items.length) * 100) };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CandidateDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  const { data: candidateRaw } = await supabaseAdmin
    .from("candidates").select("*").eq("email", user.email).single();

  if (!candidateRaw) {
    // Employer trying to access candidate dashboard
    const employer = await prisma.employer.findUnique({
      where: { email: user.email }, select: { id: true },
    });
    redirect(employer ? "/employers/dashboard" : "/candidates/onboarding");
  }

  const c = candidateRaw as CandidateRow;

  const { data: positionsRaw } = await supabaseAdmin
    .from("candidate_positions").select("*").eq("candidateId", c.id)
    .order("current", { ascending: false }).order("startDate", { ascending: false });
  const positions = (positionsRaw ?? []) as PositionRow[];

  const completion = getCompletion(c, positions.length > 0);

  // Fetch matching jobs, saved jobs, and applied jobs in parallel
  const [matchingJobs, savedJobsResult, appliedJobsResult] = await Promise.all([
    getMatchingJobsForCandidate({
      remoteType:      c.remoteType,
      experienceLevel: c.experienceLevel,
      categories:      c.categories,
    }),
    supabaseAdmin.from("saved_jobs").select("jobId").eq("candidateId", c.id),
    supabaseAdmin.from("applied_jobs").select("jobId, appliedAt").eq("candidateId", c.id).order("appliedAt", { ascending: false }),
  ]);

  const savedJobIds = (savedJobsResult.data ?? []).map((r: { jobId: string }) => r.jobId);

  let savedJobs: { id: string; slug: string; title: string; city: string | null; remoteType: string; companyName: string }[] = [];
  if (savedJobIds.length > 0) {
    const { data: jobRows } = await supabaseAdmin
      .from("jobs")
      .select("id, slug, title, city, remoteType, company:companies(name)")
      .in("id", savedJobIds)
      .eq("status", "ACTIVE");
    savedJobs = (jobRows ?? []).map((j: { id: string; slug: string; title: string; city: string | null; remoteType: string; company: { name: string }[] }) => ({
      id: j.id,
      slug: j.slug,
      title: j.title,
      city: j.city,
      remoteType: j.remoteType,
      companyName: Array.isArray(j.company) ? (j.company[0]?.name ?? "") : "",
    }));
  }

  const appliedJobIds = (appliedJobsResult.data ?? []).map((r: { jobId: string }) => r.jobId);
  const appliedAtMap  = Object.fromEntries(
    (appliedJobsResult.data ?? []).map((r: { jobId: string; appliedAt: string }) => [r.jobId, r.appliedAt])
  );

  type AppliedJob = { id: string; slug: string; title: string; city: string | null; companyName: string; appliedAt: string; status: string };
  let appliedJobs: AppliedJob[] = [];
  if (appliedJobIds.length > 0) {
    const { data: jobRows } = await supabaseAdmin
      .from("jobs")
      .select("id, slug, title, city, status, company:companies(name)")
      .in("id", appliedJobIds);
    appliedJobs = (jobRows ?? []).map((j: { id: string; slug: string; title: string; city: string | null; status: string; company: { name: string }[] }) => ({
      id: j.id,
      slug: j.slug,
      title: j.title,
      city: j.city,
      status: j.status,
      companyName: Array.isArray(j.company) ? (j.company[0]?.name ?? "") : "",
      appliedAt: appliedAtMap[j.id] ?? "",
    }));
    // Restore chronological order from the applied_jobs query
    appliedJobs.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }

  return (
    <DashboardView
      candidate={c}
      positions={positions}
      completion={completion}
      savedJobs={savedJobs}
      appliedJobs={appliedJobs}
      matchingJobs={matchingJobs}
    />
  );
}
