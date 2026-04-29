export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { AvatarHero, CvSection, ProfileSection, LinksSection, ExperienceSection, PreferencesSection, AlertSection } from "./ProfileEditor";
import { NavAvatar } from "./NavAvatar";
import { SignOutClient } from "./SignOutClient";
import { ProfileRing } from "@/components/onboarding/ProfileRing";
import { getJobs } from "@/lib/queries";
import { remoteLabel, formatSalary } from "@/lib/utils";
import type { CandidateRow, PositionRow } from "@/lib/candidate-types";
import type { Metadata } from "next";
import {
  MapPin, Briefcase, CheckCircle2, Circle, AlertCircle,
  ExternalLink, ChevronRight,
} from "lucide-react";

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

  // Fetch a few matching jobs for the sidebar
  const matchingJobs = await getJobs({
    remoteType:      c.remoteType  ?? undefined,
    experienceLevel: c.experienceLevel ?? undefined,
    take: 3,
  });

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
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: "var(--text)", textDecoration: "none", letterSpacing: "-0.3px" }}>
            CyprusTech<span style={{ color: "var(--accent)" }}>.Jobs</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <NavAvatar avatarUrl={c.avatarUrl} displayName={displayName} initials={initials} />
            <span className="body-s dash-nav-name" style={{ color: "var(--text-muted)" }}>{c.firstName ?? c.email}</span>
            <div style={{ width: 1, height: 16, background: "var(--border-strong)", margin: "0 2px" }} />
            <Link href="/jobs" className="btn btn-ghost btn-sm">Browse jobs</Link>
            <SignOutClient />
          </div>
        </div>
      </header>

      <div className="dash-page">

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
        <div className="dash-hero" style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
          padding: "28px 32px", marginBottom: 20,
        }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            {/* Avatar — click to change photo */}
            <AvatarHero candidate={c} />

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
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <ProfileRing score={completion.pct} size={84} strokeWidth={6} />
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
            <div className="dash-checklist-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ height: 6, width: 120, background: "var(--bg-muted)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${completion.pct}%`, background: completion.pct < 50 ? "var(--warning)" : "var(--accent)", borderRadius: 99, transition: "width 600ms var(--ease-out)" }} />
                </div>
                <span className="mono-s" style={{ color: "var(--text-subtle)" }}>
                  {completion.score}/{completion.items.length} complete
                </span>
              </div>
              <span className="caption" style={{ color: "var(--text-subtle)" }}>Complete your profile to stand out</span>
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
        <div className="dash-two-col">

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ProfileSection candidate={c} />
            <ExperienceSection candidateId={c.id} initialPositions={positions} />
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <CvSection candidate={c} />
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
