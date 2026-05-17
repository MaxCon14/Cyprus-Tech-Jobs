export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getEmployerWithCompanyAndJobs } from "@/lib/queries";
import {
  Plus, Eye, ExternalLink, MapPin, ChevronRight,
  CheckCircle2, AlertCircle, ShoppingBag,
} from "lucide-react";
import type { Metadata } from "next";
import type { SerializedJob } from "./JobListingsPanel";
import type { ApplicationRow } from "./ApplicationsPanel";
import { DashboardContent } from "./DashboardContent";

export const metadata: Metadata = {
  title: "Employer Dashboard — CyprusTech.Careers",
};

type SearchParams = Promise<{ posted?: string; edited?: string; drafted?: string; "drafted-edit"?: string }>;

export default async function EmployerDashboard({ searchParams }: { searchParams: SearchParams }) {
  const { posted, edited, drafted, "drafted-edit": draftedEdit } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  const employer = await getEmployerWithCompanyAndJobs(user.email);

  if (!employer) {
    const { data: candidate } = await supabaseAdmin
      .from("candidates").select("id").eq("email", user.email).single();
    redirect(candidate ? "/candidates/dashboard" : "/login");
  }

  const company = employer.company;
  const jobs    = company?.jobs ?? [];

  // Fetch in-app applications for all this employer's jobs
  const inAppJobIds = jobs.filter(j => j.applyType === "IN_APP").map(j => j.id);
  let applications: ApplicationRow[] = [];
  if (inAppJobIds.length > 0) {
    const { data: appRows } = await supabaseAdmin
      .from("job_applications")
      .select("*")
      .in("jobId", inAppJobIds)
      .order("appliedAt", { ascending: false });

    if (appRows) {
      const jobMap = Object.fromEntries(jobs.map(j => [j.id, j]));

      const candidateIds = [...new Set((appRows as any[]).map((a: any) => a.candidateId).filter(Boolean))];
      let candidateMap: Record<string, any> = {};
      let positionsMap: Record<string, any[]> = {};
      if (candidateIds.length > 0) {
        const [{ data: candidates }, { data: positions }] = await Promise.all([
          supabaseAdmin
            .from("candidates")
            .select("id, email, firstName, lastName, headline, city, experienceLevel, skills, linkedinUrl, githubUrl, portfolioUrl")
            .in("id", candidateIds),
          supabaseAdmin
            .from("candidate_positions")
            .select("id, candidateId, title, company, startDate, endDate, current, description")
            .in("candidateId", candidateIds)
            .order("startDate", { ascending: false }),
        ]);
        if (candidates) {
          candidateMap = Object.fromEntries((candidates as any[]).map((c: any) => [c.id, c]));
        }
        if (positions) {
          for (const p of positions as any[]) {
            if (!positionsMap[p.candidateId]) positionsMap[p.candidateId] = [];
            positionsMap[p.candidateId].push(p);
          }
        }
      }

      applications = (appRows as any[]).map(a => {
        const candidate = candidateMap[a.candidateId];
        return {
          ...a,
          jobTitle:                 jobMap[a.jobId]?.title ?? "Unknown job",
          jobSlug:                  jobMap[a.jobId]?.slug  ?? "",
          candidateName:            candidate ? (`${candidate.firstName ?? ""} ${candidate.lastName ?? ""}`).trim() || null : null,
          candidateEmail:           candidate?.email ?? "",
          candidateHeadline:        candidate?.headline ?? null,
          candidateCity:            candidate?.city ?? null,
          candidateExperienceLevel: candidate?.experienceLevel ?? null,
          candidateSkills:          Array.isArray(candidate?.skills) ? candidate.skills : [],
          candidateLinkedinUrl:     a.linkedinUrl ?? candidate?.linkedinUrl ?? null,
          candidateGithubUrl:       candidate?.githubUrl ?? null,
          candidatePortfolioUrl:    a.portfolioUrl ?? candidate?.portfolioUrl ?? null,
          candidatePositions:       positionsMap[a.candidateId] ?? [],
        } as ApplicationRow;
      });
    }
  }

  // Application count per job for badge display
  const appCountByJob: Record<string, number> = {};
  for (const a of applications) {
    appCountByJob[a.jobId] = (appCountByJob[a.jobId] ?? 0) + 1;
  }

  const serializedJobs: SerializedJob[] = jobs.map(j => ({
    id:           j.id,
    title:        j.title,
    slug:         j.slug,
    status:       j.status,
    city:         j.city,
    remoteType:   j.remoteType,
    salaryMin:    j.salaryMin,
    salaryMax:    j.salaryMax,
    postedAt:     j.postedAt?.toISOString()  ?? null,
    createdAt:    j.createdAt?.toISOString() ?? null,
    activeDays:   j.activeDays,
    inactiveDays: j.inactiveDays,
    applyType:    j.applyType,
    featured:     j.featured,
  }));

  const companyInitial = (company?.name ?? employer.name ?? employer.email)[0].toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      <div className="employer-page-inner">

        {/* ── Success banner ── */}
        {(posted || edited || drafted || draftedEdit) && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: drafted || draftedEdit ? "var(--bg-alt)" : "var(--success-bg)",
            border: `1px solid ${drafted || draftedEdit ? "var(--border)" : "var(--success)"}`,
            borderRadius: 10, padding: "12px 18px", marginBottom: 16,
          }}>
            <CheckCircle2 size={15} style={{ color: drafted || draftedEdit ? "var(--text-muted)" : "var(--success)", flexShrink: 0 }} />
            <span className="body-s" style={{ color: drafted || draftedEdit ? "var(--text-muted)" : "var(--success)", fontWeight: 500 }}>
              {posted       ? "Your job listing is now live."
               : edited     ? "Your listing has been updated successfully."
               : draftedEdit ? "Draft saved."
               :               "Draft saved — no slot used. Edit and publish when ready."}
            </span>
            {drafted && (
              <Link href="/post-a-job" className="btn btn-outline btn-sm" style={{ marginLeft: "auto", flexShrink: 0 }}>
                Continue editing
              </Link>
            )}
          </div>
        )}

        {/* ── Company hero ── */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
          padding: "clamp(20px,3vw,28px) clamp(16px,3vw,32px)", marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", minWidth: 0 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 13, flexShrink: 0,
              background: "var(--black)", color: "var(--white)",
              display: "grid", placeItems: "center", overflow: "hidden",
              fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 22,
            }}>
              {company?.logoUrl
                ? <img src={company.logoUrl} alt={company.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : companyInitial
              }
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, color: "var(--text)", margin: 0 }}>
                  {company?.name ?? "Your company"}
                </h1>
                {company?.verified && (
                  <span className="tag tag-success" style={{ fontSize: 11, padding: "3px 8px", display: "flex", alignItems: "center", gap: 3 }}>
                    <CheckCircle2 size={10} /> Verified
                  </span>
                )}

              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {company?.city && (
                  <span className="tag" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                    <MapPin size={10} /> {company.city}
                  </span>
                )}
                {company?.size && (
                  <span className="tag tag-outline" style={{ fontSize: 11 }}>{company.size} employees</span>
                )}
                {company?.website && (
                  <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent)", textDecoration: "none", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                    <ExternalLink size={10} /> {company.website}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="employer-hero-actions">
            {company && (
              <Link href={`/companies/${company.slug}`} className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Eye size={13} /> View public page
              </Link>
            )}
            <Link href="/post-a-job" className="btn btn-accent" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Plus size={14} /> Post a new job
            </Link>
          </div>
        </div>

        {/* ── Slot balance ── */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12,
          padding: "14px clamp(16px,3vw,20px)", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
        }}>
          <ShoppingBag size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18, color: "var(--accent)" }}>{employer.standardSlots}</span>
            <span className="body-s" style={{ color: "var(--text-muted)" }}>standard slots</span>
          </div>
          <div className="employer-slot-divider" />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18, color: "var(--accent)" }}>{employer.featuredSlots}</span>
            <span className="body-s" style={{ color: "var(--text-muted)" }}>featured slots</span>
          </div>
          <div className="employer-slot-actions">
            <Link href="/buy-credits" className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ShoppingBag size={12} /> Buy slots
            </Link>
          </div>
        </div>

        {/* ── Job listings + applications (with cross-filter state) ── */}
        <DashboardContent
          jobs={serializedJobs}
          applications={applications}
          appCountByJob={appCountByJob}
          hasInAppJobs={inAppJobIds.length > 0}
        />

        {/* ── No company warning ── */}
        {!company && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "var(--warning-bg)", border: "1px solid #fcd34d", borderRadius: 12, padding: "clamp(14px,2vw,16px) clamp(16px,3vw,20px)", marginBottom: 20 }}>
            <AlertCircle size={16} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="body-s" style={{ fontWeight: 600, color: "#92400e", marginBottom: 4 }}>Complete your company setup</p>
              <p className="body-s" style={{ color: "#92400e", marginBottom: 10 }}>
                You haven&apos;t linked a company to your account yet. Complete onboarding to post jobs.
              </p>
              <Link href="/employers/onboarding" className="btn btn-outline btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                Complete setup <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* ── Featured slots CTA ── */}
        {employer.featuredSlots === 0 && (
          <div style={{
            border: "1px solid var(--accent)", borderRadius: 12,
            padding: "clamp(16px,2vw,20px) clamp(16px,3vw,24px)",
            background: "var(--accent-soft)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16,
          }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                Get featured listings for 2× visibility
              </p>
              <p className="body-s" style={{ color: "var(--text-muted)" }}>
                Featured listings are pinned to the top of search results with a FEATURED badge.
              </p>
            </div>
            <Link href="/buy-credits" className="btn btn-accent" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              Buy featured slots <ChevronRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
