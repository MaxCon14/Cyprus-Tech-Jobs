export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getEmployerWithCompanyAndJobs } from "@/lib/queries";
import { formatSalary, remoteLabel, timeAgo } from "@/lib/utils";
import {
  Plus, Eye, Edit2, Briefcase, Building2,
  ExternalLink, MapPin, Clock, ChevronRight,
  CheckCircle2, AlertCircle, FileText,
} from "lucide-react";
import type { Metadata } from "next";
import { SignOutClient } from "./SignOutClient";

export const metadata: Metadata = {
  title: "Employer Dashboard — CyprusTech.Jobs",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  ACTIVE:  { bg: "var(--success-bg)",  color: "var(--success)",  label: "Active"  },
  DRAFT:   { bg: "var(--bg-muted)",    color: "var(--text-muted)", label: "Draft" },
  EXPIRED: { bg: "var(--error-bg)",    color: "var(--error)",    label: "Expired" },
  CLOSED:  { bg: "var(--bg-muted)",    color: "var(--text-subtle)", label: "Closed" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EmployerDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/employers/login?callbackUrl=/employers/dashboard");

  const employer = await getEmployerWithCompanyAndJobs(user.email);

  if (!employer) {
    // Candidate trying to access employer dashboard
    const { data: candidate } = await supabaseAdmin
      .from("candidates").select("id").eq("email", user.email).single();
    redirect(candidate ? "/candidates/dashboard" : "/employers/login");
  }

  const company = employer.company;
  const jobs    = company?.jobs ?? [];

  const activeJobs  = jobs.filter(j => j.status === "ACTIVE");
  const draftJobs   = jobs.filter(j => j.status === "DRAFT");
  const expiredJobs = jobs.filter(j => j.status === "EXPIRED" || j.status === "CLOSED");

  const companyInitial = (company?.name ?? employer.name ?? employer.email)[0].toUpperCase();

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
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--accent-soft)", border: "1.5px solid var(--accent)", display: "grid", placeItems: "center" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 11, color: "var(--accent)" }}>{companyInitial}</span>
            </div>
            <span className="body-s" style={{ color: "var(--text-muted)" }}>{company?.name ?? employer.name ?? "Employer"}</span>
            <div style={{ width: 1, height: 16, background: "var(--border-strong)", margin: "0 2px" }} />
            <Link href="/post-a-job" className="btn btn-accent btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Plus size={13} /> Post a job
            </Link>
            <SignOutClient />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* ── Company hero ── */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
          padding: "28px 32px", marginBottom: 24,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20,
        }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 14, flexShrink: 0,
              background: "var(--black)", color: "var(--white)",
              display: "grid", placeItems: "center",
              fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 24,
            }}>
              {companyInitial}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 20, color: "var(--text)", margin: 0 }}>
                  {company?.name ?? "Your company"}
                </h1>
                {company?.verified && (
                  <span className="tag tag-success" style={{ fontSize: 11, padding: "3px 8px", display: "flex", alignItems: "center", gap: 3 }}>
                    <CheckCircle2 size={10} /> Verified
                  </span>
                )}
                <span className="tag tag-outline" style={{ fontSize: 11 }}>{employer.plan}</span>
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

          <div style={{ display: "flex", gap: 10 }}>
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

        {/* ── Stats row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Active listings",  value: activeJobs.length.toString(),  icon: <Briefcase size={16} />,  accent: true },
            { label: "Draft",            value: draftJobs.length.toString(),   icon: <FileText size={16} />,   accent: false },
            { label: "Expired / closed", value: expiredJobs.length.toString(), icon: <Clock size={16} />,     accent: false },
            { label: "Total posted",     value: jobs.length.toString(),        icon: <Building2 size={16} />, accent: false },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "var(--surface)", border: `1px solid ${stat.accent ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 12, padding: "18px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: stat.accent ? "var(--accent)" : "var(--text-muted)", display: "flex" }}>{stat.icon}</span>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 28, color: stat.accent ? "var(--accent)" : "var(--text)", marginBottom: 4 }}>
                {stat.value}
              </div>
              <div className="body-s" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Job listings ── */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>

          {/* Table header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg-alt)" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, margin: 0 }}>Your listings</p>
            <Link href="/post-a-job" className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Plus size={12} /> New listing
            </Link>
          </div>

          {jobs.length === 0 ? (
            /* Empty state */
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--bg-muted)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
                <Briefcase size={22} style={{ color: "var(--text-subtle)" }} />
              </div>
              <p className="body-s" style={{ fontWeight: 600, marginBottom: 6 }}>No jobs posted yet</p>
              <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 20 }}>
                Post your first job to start receiving applications from Cyprus's best tech talent.
              </p>
              <Link href="/post-a-job" className="btn btn-accent" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Plus size={14} /> Post your first job
              </Link>
            </div>
          ) : (
            /* Jobs list */
            <div>
              {/* Column headers */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px 140px 80px", gap: 16, padding: "10px 24px", borderBottom: "1px solid var(--border)" }}>
                {["Role", "Status", "Posted", "Expires", ""].map(h => (
                  <span key={h} className="caption" style={{ color: "var(--text-subtle)" }}>{h}</span>
                ))}
              </div>

              {jobs.map((job, i) => {
                const st = STATUS_STYLE[job.status] ?? STATUS_STYLE.CLOSED;
                const isExpiringSoon = job.expiresAt
                  ? new Date(job.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
                  : false;

                return (
                  <div key={job.id} style={{
                    display: "grid", gridTemplateColumns: "1fr 100px 120px 140px 80px",
                    gap: 16, padding: "16px 24px", alignItems: "center",
                    borderBottom: i < jobs.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    {/* Role */}
                    <div>
                      <p className="body-s" style={{ fontWeight: 600, marginBottom: 4 }}>{job.title}</p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {job.city && (
                          <span className="tag" style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 3 }}>
                            <MapPin size={8} /> {job.city}
                          </span>
                        )}
                        <span className="tag tag-outline" style={{ fontSize: 10 }}>{remoteLabel(job.remoteType)}</span>
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="mono-s" style={{ color: "var(--accent)", fontSize: 11 }}>
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "4px 10px", borderRadius: 6, fontSize: 11,
                        fontFamily: "var(--font-mono)", fontWeight: 600,
                        background: st.bg, color: st.color,
                      }}>
                        {job.status === "ACTIVE" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "block" }} />}
                        {st.label}
                      </span>
                    </div>

                    {/* Posted */}
                    <div className="mono-s" style={{ color: "var(--text-subtle)" }}>
                      {job.postedAt ? timeAgo(job.postedAt) : job.createdAt ? timeAgo(job.createdAt) : "—"}
                    </div>

                    {/* Expires */}
                    <div className="mono-s" style={{ color: isExpiringSoon && job.status === "ACTIVE" ? "var(--warning)" : "var(--text-subtle)" }}>
                      {job.expiresAt
                        ? isExpiringSoon && job.status === "ACTIVE"
                          ? `Expires ${timeAgo(job.expiresAt)}`
                          : new Date(job.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                        : "—"}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <Link href={`/jobs/${job.slug}`} className="btn btn-ghost btn-icon btn-sm" title="View listing">
                        <Eye size={13} />
                      </Link>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Edit listing" disabled>
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── No company warning ── */}
        {!company && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "var(--warning-bg)", border: "1px solid #fcd34d", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
            <AlertCircle size={16} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="body-s" style={{ fontWeight: 600, color: "#92400e", marginBottom: 4 }}>Complete your company setup</p>
              <p className="body-s" style={{ color: "#92400e", marginBottom: 10 }}>
                You haven't linked a company to your account yet. Complete onboarding to post jobs.
              </p>
              <Link href="/employers/onboarding" className="btn btn-outline btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                Complete setup <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* ── Upgrade CTA (only for FREE plan) ── */}
        {employer.plan === "FREE" && (
          <div style={{
            border: "1px solid var(--accent)", borderRadius: 12, padding: "20px 24px",
            background: "var(--accent-soft)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <p style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                Upgrade to Featured for 2× visibility
              </p>
              <p className="body-s" style={{ color: "var(--text-muted)" }}>
                Featured listings are pinned to the top of search results for 30 days.
              </p>
            </div>
            <Link href="/post-a-job#pricing" className="btn btn-accent" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              Upgrade listing <ChevronRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
