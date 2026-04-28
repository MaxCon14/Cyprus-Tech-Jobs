export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { ProfileSection, LinksSection, ExperienceSection, PreferencesSection, AlertSection, SkillsSection } from "./ProfileEditor";
import { SignOutClient } from "./SignOutClient";
import { ProfileRing } from "@/components/onboarding/ProfileRing";
import { getJobs } from "@/lib/queries";
import { remoteLabel, formatSalary } from "@/lib/utils";
import type { CandidateRow, PositionRow } from "@/lib/candidate-types";
import type { Metadata } from "next";
import {
  MapPin, Briefcase, CheckCircle2, Circle, AlertCircle,
  ExternalLink, ChevronRight, Heart,
} from "lucide-react";

export const metadata: Metadata = { title: "My dashboard — CyprusTech.Jobs" };

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
  if (!user?.email) redirect("/candidates/login");

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

  // Fetch matching jobs and saved jobs in parallel
  const [matchingJobs, savedJobsResult] = await Promise.all([
    getJobs({
      remoteType:      c.remoteType  ?? undefined,
      experienceLevel: c.experienceLevel ?? undefined,
      take: 3,
    }),
    supabaseAdmin.from("saved_jobs").select("jobId").eq("candidateId", c.id),
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

  const displayName = [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email;
  const initials    = (c.firstName?.[0] ?? c.email[0]).toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── Top nav ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "0 24px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-soft)", border: "1.5px solid var(--accent)", display: "grid", placeItems: "center" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 11, color: "var(--accent)" }}>{initials}</span>
            </div>
            <span className="body-s dashboard-header-name" style={{ color: "var(--text-muted)" }}>{c.firstName ?? c.email}</span>
            <div style={{ width: 1, height: 16, background: "var(--border-strong)", margin: "0 2px" }} />
            <Link href="/jobs" className="btn btn-ghost btn-sm">Browse jobs</Link>
            <SignOutClient />
          </div>
        </div>
      </header>

      <div className="dashboard-page-padding" style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Email unverified ── */}
        {!c.emailVerified && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--warning-bg)", border: "1px solid #fcd34d", borderRadius: 10, padding: "12px 16px", marginBottom: 24 }}>
            <AlertCircle size={16} style={{ color: "var(--warning)", flexShrink: 0 }} />
            <p className="body-s" style={{ margin: 0, color: "#92400e" }}>
              <strong>Verify your email</strong> — we sent a sign-in link to <strong>{c.email}</strong>. Check your inbox to activate your account.
            </p>
          </div>
        )}

        {/* ── Profile hero ── */}
        <div className="dashboard-hero" style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
          padding: "24px", marginBottom: 20,
        }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: 14, flexShrink: 0,
              background: "var(--accent-soft)", border: "2px solid var(--accent)",
              display: "grid", placeItems: "center",
            }}>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 26, color: "var(--accent)" }}>{initials}</span>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 20, color: "var(--text)", margin: 0 }}>
                  {displayName}
                </h1>
                {c.openToWork && (
                  <span className="tag tag-success" style={{ fontSize: 11, padding: "3px 8px" }}>Open to work</span>
                )}
              </div>
              <p className="body-s" style={{ color: c.headline ? "var(--text-muted)" : "var(--text-subtle)", marginBottom: 10, fontStyle: c.headline ? "normal" : "italic" }}>
                {c.headline || "Add a professional headline…"}
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {c.city && (
                  <span className="tag" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={10} /> {c.city}
                  </span>
                )}
                {c.remoteType && <span className="tag tag-outline">{remoteLabel(c.remoteType)}</span>}
                {c.experienceLevel && <span className="tag tag-outline">{c.experienceLevel}</span>}
              </div>
            </div>
          </div>

          {/* Completion ring */}
          <div className="dashboard-hero-ring" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <ProfileRing score={completion.pct} size={72} strokeWidth={6} />
            <span className="caption" style={{ color: "var(--text-subtle)", textAlign: "center" }}>
              Profile strength
            </span>
          </div>
        </div>

        {/* ── Completion checklist ── */}
        {completion.pct < 100 && (
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14,
            padding: "20px 24px", marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ height: 6, width: 120, background: "var(--bg-muted)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${completion.pct}%`, background: completion.pct < 50 ? "var(--warning)" : "var(--accent)", borderRadius: 99, transition: "width 600ms var(--ease-out)" }} />
                </div>
                <span className="mono-s" style={{ color: "var(--text-subtle)" }}>
                  {completion.score}/{completion.items.length} complete
                </span>
              </div>
              <span className="caption dashboard-checklist-label" style={{ color: "var(--text-subtle)" }}>Complete your profile to stand out</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
              {completion.items.map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {item.done
                    ? <CheckCircle2 size={14} style={{ color: "var(--success)", flexShrink: 0 }} />
                    : <Circle      size={14} style={{ color: "var(--border-strong)", flexShrink: 0 }} />
                  }
                  <span className="body-s" style={{ color: item.done ? "var(--text-subtle)" : "var(--text)" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Two-column layout ── */}
        <div className="dashboard-two-col">

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ProfileSection candidate={c} />
            <SkillsSection candidate={c} />
            <ExperienceSection candidateId={c.id} initialPositions={positions} />
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SavedJobsCard jobs={savedJobs} />
            <LinksSection candidate={c} />
            <PreferencesSection candidate={c} />
            <AlertSection candidate={c} />
            {matchingJobs.length > 0 && <MatchingJobsCard jobs={matchingJobs} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Matching jobs card ───────────────────────────────────────────────────────

function MatchingJobsCard({ jobs }: { jobs: Awaited<ReturnType<typeof getJobs>> }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--accent)", display: "flex" }}><Briefcase size={14} /></span>
          <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", margin: 0 }}>Jobs for you</p>
        </div>
        <Link href="/jobs" className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          All <ChevronRight size={11} />
        </Link>
      </div>
      <div style={{ padding: "4px 18px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {jobs.map((job, i) => (
          <Link
            key={job.id}
            href={`/jobs/${job.slug}`}
            style={{
              display: "block", textDecoration: "none", color: "inherit",
              padding: "12px 0",
              borderTop: i > 0 ? "1px solid var(--border)" : "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {job.title}
                </p>
                <p className="mono-s" style={{ color: "var(--text-subtle)", marginBottom: 4 }}>{job.company.name}</p>
                {(job.salaryMin || job.salaryMax) && (
                  <p className="mono-s" style={{ color: "var(--accent)" }}>{formatSalary(job.salaryMin, job.salaryMax)}</p>
                )}
              </div>
              <ExternalLink size={12} style={{ color: "var(--text-subtle)", flexShrink: 0, marginTop: 2 }} />
            </div>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}

// ─── Saved jobs card ──────────────────────────────────────────────────────────

function SavedJobsCard({ jobs }: { jobs: { id: string; slug: string; title: string; city: string | null; remoteType: string; companyName: string }[] }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Heart size={14} style={{ color: "var(--accent)" }} fill="var(--accent)" />
          <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", margin: 0 }}>Saved jobs</p>
        </div>
        <Link href="/jobs" className="btn btn-ghost btn-sm">Browse jobs</Link>
      </div>
      <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 0 }}>
        {jobs.length === 0 ? (
          <p className="body-s" style={{ color: "var(--text-subtle)", fontStyle: "italic", padding: "8px 0" }}>
            No saved jobs yet. Hit the ♥ on any listing to save it here.
          </p>
        ) : (
          jobs.map((job, i) => (
            <Link key={job.id} href={`/jobs/${job.slug}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "12px 0", borderBottom: i < jobs.length - 1 ? "1px solid var(--border)" : "none", textDecoration: "none" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {job.title}
                </p>
                <p className="mono-s" style={{ color: "var(--text-subtle)" }}>
                  {job.companyName}{job.city ? ` · ${job.city}` : ""}
                </p>
              </div>
              <ChevronRight size={14} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
