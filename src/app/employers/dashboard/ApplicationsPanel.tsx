"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Star, X, FileText, ExternalLink, ScrollText, Briefcase, ChevronRight } from "lucide-react";

export interface ApplicationRow {
  id:                       string;
  jobId:                    string;
  jobTitle:                 string;
  jobSlug:                  string;
  candidateName:            string | null;
  candidateEmail:           string;
  candidateHeadline:        string | null;
  candidateCity:            string | null;
  candidateExperienceLevel: string | null;
  candidateSkills:          string[];
  cvUrl:                    string | null;
  coverLetter:              string | null;
  coverLetterUrl:           string | null;
  status:                   string;
  appliedAt:                string;
  candidateLinkedinUrl:     string | null;
  candidateGithubUrl:       string | null;
  candidatePortfolioUrl:    string | null;
  candidatePositions:       CandidatePosition[];
}

export interface CandidatePosition {
  id:          string;
  title:       string;
  company:     string;
  startDate:   string | null;
  endDate:     string | null;
  current:     boolean;
  description: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  UNREVIEWED: { label: "Unreviewed", bg: "var(--accent-soft)",  color: "var(--accent)",     icon: <Clock size={11} /> },
  PENDING:    { label: "Unreviewed", bg: "var(--accent-soft)",  color: "var(--accent)",     icon: <Clock size={11} /> },
  REVIEWED:   { label: "Reviewed",   bg: "var(--bg-muted)",     color: "var(--text-muted)", icon: <CheckCircle2 size={11} /> },
  SHORTLISTED:{ label: "Shortlisted",bg: "var(--success-bg)",   color: "var(--success)",    icon: <Star size={11} /> },
  REJECTED:   { label: "Rejected",   bg: "var(--error-bg)",     color: "var(--error)",      icon: <X size={11} /> },
};

// The three decisions an employer makes on a candidate. Color-coded so the
// choice is legible at a glance: neutral (seen), green (yes), red (no).
const DECISIONS = [
  { key: "REVIEWED",    label: "Reviewed",  color: "var(--text-muted)", icon: <CheckCircle2 size={15} /> },
  { key: "SHORTLISTED", label: "Shortlist", color: "var(--success)",    icon: <Star size={15} /> },
  { key: "REJECTED",    label: "Reject",    color: "var(--error)",      icon: <X size={15} /> },
] as const;

type StatusFilter = "ALL" | "UNREVIEWED" | "REVIEWED" | "SHORTLISTED" | "REJECTED";

function isUnreviewed(status: string) {
  return status === "UNREVIEWED" || status === "PENDING";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30)  return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(d: string | null) {
  if (!d) return "";
  const [y, m] = d.split("-");
  const month = MONTHS[parseInt(m, 10) - 1];
  return month ? `${month} ${y}` : y;
}

// The portfolio field is free-form, so a candidate may drop a social link in
// it. Label the link by its actual destination so the employer knows where
// it goes instead of a generic "Portfolio".
function linkLabel(url: string): string {
  let host = "";
  try {
    host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "Portfolio";
  }
  if (host === "x.com" || host.endsWith(".x.com") || host.endsWith("twitter.com")) return "X / Twitter";
  if (host.endsWith("instagram.com"))  return "Instagram";
  if (host.endsWith("linkedin.com"))   return "LinkedIn";
  if (host.endsWith("github.com"))     return "GitHub";
  if (host.endsWith("behance.net"))    return "Behance";
  if (host.endsWith("dribbble.com"))   return "Dribbble";
  if (host.endsWith("medium.com"))     return "Medium";
  if (host.endsWith("youtube.com") || host === "youtu.be") return "YouTube";
  if (host.endsWith("tiktok.com"))     return "TikTok";
  if (host.endsWith("facebook.com"))   return "Facebook";
  if (host.endsWith("gitlab.com"))     return "GitLab";
  return "Portfolio";
}

function WorkExperienceModal({ positions, candidateName, onClose }: {
  positions:     CandidatePosition[];
  candidateName: string;
  onClose:       () => void;
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  function toggle(id: string) {
    setOpenIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 16, padding: "24px 28px",
          maxWidth: 560, width: "100%", maxHeight: "80vh",
          display: "flex", flexDirection: "column", gap: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, margin: 0, color: "var(--text)" }}>
              Work Experience
            </p>
            <p className="body-s" style={{ color: "var(--text-subtle)", marginTop: 2 }}>{candidateName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none", border: "1px solid var(--border)",
              borderRadius: 8, width: 32, height: 32,
              display: "grid", placeItems: "center",
              cursor: "pointer", color: "var(--text-muted)", flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Positions list */}
        <div style={{ overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {positions.map((pos, i) => {
            const isOpen  = openIds.has(pos.id);
            const dateRange = [fmtDate(pos.startDate), pos.current ? "Present" : fmtDate(pos.endDate)].filter(Boolean).join(" – ");
            return (
              <div key={pos.id} style={{ borderBottom: i < positions.length - 1 ? "1px solid var(--border)" : "none" }}>
                <button
                  type="button"
                  onClick={() => toggle(pos.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "14px 0", background: "none", border: "none",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <span style={{
                    color: "var(--text-subtle)", flexShrink: 0, display: "flex",
                    transition: "transform 150ms",
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                  }}>
                    <ChevronRight size={14} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="body-s" style={{ fontWeight: 700, color: "var(--text)", display: "block" }}>{pos.title}</span>
                    <span className="body-s" style={{ color: "var(--text-muted)" }}>{pos.company}</span>
                    {dateRange && (
                      <span className="mono-s" style={{ color: "var(--text-subtle)", display: "block", marginTop: 2 }}>{dateRange}</span>
                    )}
                  </span>
                </button>
                {isOpen && (
                  <div style={{ paddingBottom: 14, paddingLeft: 24 }}>
                    {pos.description
                      ? <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>{pos.description}</p>
                      : <p className="body-s" style={{ color: "var(--text-subtle)", fontStyle: "italic" }}>No description added.</p>
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ApplicationCard({ app, onStatusChange }: {
  app: ApplicationRow;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [updating, setUpdating]               = useState(false);
  const [expanded, setExpanded]               = useState(false);
  const [coverLetterOpen, setCoverLetterOpen] = useState(false);
  const [experienceOpen, setExperienceOpen]   = useState(false);
  const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.UNREVIEWED;
  const hasCoverLetter = !!(app.coverLetter || app.coverLetterUrl);
  const hasExperience  = app.candidatePositions?.length > 0;

  async function setStatus(status: string) {
    if (updating || status === app.status) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/employers/applications/${app.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) onStatusChange(app.id, status);
    } finally {
      setUpdating(false);
    }
  }

  const unreviewed  = isUnreviewed(app.status);
  const displayName = app.candidateName || app.candidateEmail;
  const panelId     = `applicant-panel-${app.id}`;
  // One-line summary shown on the collapsed row
  const metaParts   = [app.candidateExperienceLevel, app.candidateCity, app.candidateHeadline].filter(Boolean);
  const hasLinks    = hasCoverLetter || hasExperience || !!app.cvUrl ||
                      !!app.candidateLinkedinUrl || !!app.candidateGithubUrl || !!app.candidatePortfolioUrl;

  return (
    <div style={{
      border: "1px solid var(--border-strong)",
      borderRadius: 12,
      background: "var(--surface)",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.05)",
      overflow: "hidden",
    }}>
      {/* Collapsed row — dense by default; click the name area to expand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px 12px 12px" }}>
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          aria-controls={panelId}
          style={{
            flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10,
            background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left",
          }}
        >
          <span style={{
            color: "var(--text-subtle)", flexShrink: 0, display: "flex",
            transition: "transform 150ms", transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
          }}>
            <ChevronRight size={16} />
          </span>
          <span style={{ minWidth: 0, flex: 1 }}>
            <span className="body-s" style={{ fontWeight: 700, color: "var(--text)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </span>
            <span className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 11, display: "block", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>{app.jobTitle}</span>
              {metaParts.length > 0 && ` · ${metaParts.join(" · ")}`}
            </span>
          </span>
        </button>

        {/* Right: quick triage + status + time */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Quick shortlist / reject — one-tap triage without expanding */}
          <div className="applicant-quick" style={{ display: "flex", gap: 6 }}>
            {(["SHORTLISTED", "REJECTED"] as const).map(s => {
              const c = STATUS_CONFIG[s];
              const active  = app.status === s;
              const isShort = s === "SHORTLISTED";
              return (
                <button
                  key={s}
                  type="button"
                  title={isShort ? "Shortlist" : "Reject"}
                  aria-label={`${isShort ? "Shortlist" : "Reject"} ${displayName}`}
                  disabled={updating}
                  onClick={() => setStatus(s)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center",
                    cursor: updating ? "default" : "pointer",
                    border: `1.5px solid ${active ? c.color : "var(--border-strong)"}`,
                    background: active ? c.color : "var(--surface)",
                    color: active ? "var(--white)" : (isShort ? "var(--success)" : "var(--error)"),
                    transition: "all 120ms",
                  }}
                >
                  {isShort ? <Star size={14} /> : <X size={14} />}
                </button>
              );
            })}
          </div>

          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 999, fontSize: 12,
            fontFamily: "var(--font-sans)", fontWeight: 600, whiteSpace: "nowrap",
            background: cfg.bg, color: cfg.color,
          }}>
            {cfg.icon} {cfg.label}
          </span>
          <span className="applicant-time mono-s" style={{ color: "var(--text-subtle)", fontSize: 10, whiteSpace: "nowrap" }}>
            {timeAgo(app.appliedAt)}
          </span>
        </div>
      </div>

      {/* Expanded detail — contact, skills, documents, and full status controls */}
      {expanded && (
        <div id={panelId} style={{ borderTop: "1px solid var(--border)", background: "var(--bg-alt)" }}>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Applied-for job + email */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 10 }}>Applied for</span>
              <Link href={`/jobs/${app.jobSlug}`} className="mono-s" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
                {app.jobTitle}
              </Link>
              <a href={`mailto:${app.candidateEmail}`} className="mono-s" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
                {app.candidateEmail}
              </a>
            </div>

            {/* Skills */}
            {app.candidateSkills.length > 0 && (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {app.candidateSkills.map(s => (
                  <span key={s} className="tag" style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>{s}</span>
                ))}
              </div>
            )}

            {/* Document / profile links */}
            {hasLinks && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {app.cvUrl && (
                  <a href={app.cvUrl} target="_blank" rel="noopener noreferrer"
                    className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <FileText size={12} /> View CV
                  </a>
                )}
                {hasCoverLetter && (
                  app.coverLetterUrl ? (
                    <a href={app.coverLetterUrl} target="_blank" rel="noopener noreferrer"
                      className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <ScrollText size={12} /> View Cover Letter
                    </a>
                  ) : (
                    <button type="button" onClick={() => setCoverLetterOpen(true)}
                      className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <ScrollText size={12} /> View Cover Letter
                    </button>
                  )
                )}
                {hasExperience && (
                  <button type="button" onClick={() => setExperienceOpen(true)}
                    className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Briefcase size={12} /> Work Experience
                  </button>
                )}
                {app.candidateLinkedinUrl && (
                  <a href={app.candidateLinkedinUrl.startsWith("http") ? app.candidateLinkedinUrl : `https://${app.candidateLinkedinUrl}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <ExternalLink size={12} /> LinkedIn
                  </a>
                )}
                {app.candidateGithubUrl && (
                  <a href={app.candidateGithubUrl.startsWith("http") ? app.candidateGithubUrl : `https://${app.candidateGithubUrl}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <ExternalLink size={12} /> GitHub
                  </a>
                )}
                {app.candidatePortfolioUrl && (
                  <a href={app.candidatePortfolioUrl.startsWith("http") ? app.candidatePortfolioUrl : `https://${app.candidatePortfolioUrl}`}
                    target="_blank" rel="noopener noreferrer"
                    title={app.candidatePortfolioUrl}
                    className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <ExternalLink size={12} /> {linkLabel(app.candidatePortfolioUrl)}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Decision bar — the employer sets the candidate's status here */}
          <div style={{ padding: "12px 16px 14px", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 12, color: "var(--text-muted)" }}>
                Set status
              </span>
              {!unreviewed && (
                <button type="button" disabled={updating} onClick={() => setStatus("UNREVIEWED")}
                  style={{
                    background: "none", border: "none", padding: 0, cursor: updating ? "default" : "pointer",
                    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500,
                    color: "var(--text-subtle)", textDecoration: "underline",
                  }}>
                  Move back to unreviewed
                </button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {DECISIONS.map(d => {
                const active = app.status === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    disabled={updating}
                    onClick={() => setStatus(d.key)}
                    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = d.color; (e.currentTarget as HTMLElement).style.color = "var(--white)"; } }}
                    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "var(--surface)"; (e.currentTarget as HTMLElement).style.color = d.color; } }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: "10px 10px", borderRadius: 9,
                      fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13,
                      border: `1.5px solid ${d.color}`,
                      background: active ? d.color : "var(--surface)",
                      color: active ? "var(--white)" : d.color,
                      cursor: updating ? "default" : "pointer",
                      opacity: updating && !active ? 0.55 : 1,
                      transition: "background 120ms, color 120ms",
                      minWidth: 0,
                    }}
                  >
                    {d.icon}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{d.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Work experience modal */}
      {experienceOpen && (
        <WorkExperienceModal
          positions={app.candidatePositions}
          candidateName={app.candidateName || app.candidateEmail}
          onClose={() => setExperienceOpen(false)}
        />
      )}

      {/* Cover letter modal */}
      {coverLetterOpen && app.coverLetter && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          }}
          onClick={() => setCoverLetterOpen(false)}
        >
          <div
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "24px 28px",
              maxWidth: 580, width: "100%", maxHeight: "80vh",
              display: "flex", flexDirection: "column", gap: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, margin: 0, color: "var(--text)" }}>
                  Cover Letter
                </p>
                <p className="body-s" style={{ color: "var(--text-subtle)", marginTop: 2 }}>
                  {app.candidateName || app.candidateEmail}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCoverLetterOpen(false)}
                style={{
                  background: "none", border: "1px solid var(--border)",
                  borderRadius: 8, width: 32, height: 32,
                  display: "grid", placeItems: "center",
                  cursor: "pointer", color: "var(--text-muted)", flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              <p className="body-s" style={{
                color: "var(--text-muted)", lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0,
              }}>
                {app.coverLetter}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "ALL",        label: "All"         },
  { key: "UNREVIEWED", label: "Unreviewed"  },
  { key: "REVIEWED",   label: "Reviewed"    },
  { key: "SHORTLISTED",label: "Shortlisted" },
  { key: "REJECTED",   label: "Rejected"    },
];

export function ApplicationsPanel({
  initialApplications,
}: {
  initialApplications: ApplicationRow[];
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [statusFilter, setStatusFilter]  = useState<StatusFilter>("ALL");

  function handleStatusChange(id: string, status: string) {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  const counts: Record<StatusFilter, number> = {
    ALL:         applications.length,
    UNREVIEWED:  applications.filter(a => isUnreviewed(a.status)).length,
    REVIEWED:    applications.filter(a => a.status === "REVIEWED").length,
    SHORTLISTED: applications.filter(a => a.status === "SHORTLISTED").length,
    REJECTED:    applications.filter(a => a.status === "REJECTED").length,
  };

  const visible = applications.filter(a =>
    statusFilter === "ALL"        ? true :
    statusFilter === "UNREVIEWED" ? isUnreviewed(a.status) :
    a.status === statusFilter
  );

  if (applications.length === 0) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", color: "var(--text-subtle)" }}>
        <p className="body-s">No applications yet. Post a job with in-app applications to receive candidates here.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 16, background: "var(--bg-alt)" }}>

      {/* Status filter tabs — switch which applicants are shown */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {STATUS_FILTERS.map(f => {
          const active = statusFilter === f.key;
          const count  = counts[f.key];
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 13px", borderRadius: 8, fontSize: 13,
                fontFamily: "var(--font-sans)", fontWeight: 600, cursor: "pointer",
                border: `1px solid ${active ? "var(--accent)" : "var(--border-strong)"}`,
                background: active ? "var(--accent)" : "var(--surface)",
                color: active ? "var(--white)" : "var(--text-muted)",
                transition: "all 120ms",
              }}
            >
              {f.label}
              <span style={{
                minWidth: 18, textAlign: "center",
                padding: "1px 6px", borderRadius: 999,
                fontFamily: "var(--font-mono)",
                background: active ? "rgba(255,255,255,0.25)" : "var(--bg-muted)",
                color: active ? "var(--white)" : "var(--text-subtle)",
                fontSize: 11, fontWeight: 700,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="body-s" style={{ color: "var(--text-subtle)", padding: "12px 0" }}>
          No {statusFilter === "ALL" ? "" : STATUS_FILTERS.find(f => f.key === statusFilter)?.label.toLowerCase() + " "}applications.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {visible.map(app => (
            <ApplicationCard key={app.id} app={app} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
