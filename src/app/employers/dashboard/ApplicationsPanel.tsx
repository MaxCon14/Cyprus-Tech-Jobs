"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Star, X, FileText, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

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
  status:                   string;
  appliedAt:                string;
  candidateLinkedinUrl:     string | null;
  candidateGithubUrl:       string | null;
  candidatePortfolioUrl:    string | null;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  UNREVIEWED: { label: "Unreviewed", bg: "var(--accent-soft)",  color: "var(--accent)",     icon: <Clock size={11} /> },
  PENDING:    { label: "Unreviewed", bg: "var(--accent-soft)",  color: "var(--accent)",     icon: <Clock size={11} /> },
  REVIEWED:   { label: "Reviewed",   bg: "var(--bg-muted)",     color: "var(--text-muted)", icon: <CheckCircle2 size={11} /> },
  SHORTLISTED:{ label: "Shortlisted",bg: "var(--success-bg)",   color: "var(--success)",    icon: <Star size={11} /> },
  REJECTED:   { label: "Rejected",   bg: "var(--error-bg)",     color: "var(--error)",      icon: <X size={11} /> },
};

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

function ApplicationCard({ app, onStatusChange }: {
  app: ApplicationRow;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.UNREVIEWED;

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

  return (
    <div style={{
      border: "1px solid var(--border)", borderRadius: 12,
      background: isUnreviewed(app.status) ? "var(--surface)" : "var(--bg-alt)",
      overflow: "hidden",
    }}>
      {/* Header row */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>

        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: "var(--accent-soft)", display: "grid", placeItems: "center",
          fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16, color: "var(--accent)",
        }}>
          {((app.candidateName || app.candidateEmail || "?")?.[0] ?? "?").toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
                {app.candidateName || app.candidateEmail}
              </p>
              {app.candidateHeadline && (
                <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 4 }}>{app.candidateHeadline}</p>
              )}
              {/* Applied for */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <span className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 10 }}>Applied for:</span>
                <Link
                  href={`/jobs/${app.jobSlug}`}
                  className="mono-s"
                  style={{ color: "var(--accent)", fontSize: 10, textDecoration: "none", fontWeight: 600 }}
                >
                  {app.jobTitle}
                </Link>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {app.candidateCity && <span className="tag" style={{ fontSize: 10 }}>{app.candidateCity}</span>}
                {app.candidateExperienceLevel && (
                  <span className="tag tag-outline" style={{ fontSize: 10 }}>{app.candidateExperienceLevel}</span>
                )}
              </div>
            </div>

            {/* Status badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "3px 9px", borderRadius: 5, fontSize: 10,
                fontFamily: "var(--font-mono)", fontWeight: 700,
                background: cfg.bg, color: cfg.color,
              }}>
                {cfg.icon} {cfg.label}
              </span>
              <span className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 10 }}>{timeAgo(app.appliedAt)}</span>
            </div>
          </div>

          {/* Skills */}
          {app.candidateSkills.length > 0 && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
              {app.candidateSkills.slice(0, 6).map(s => (
                <span key={s} className="tag" style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>{s}</span>
              ))}
              {app.candidateSkills.length > 6 && (
                <span className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 10 }}>+{app.candidateSkills.length - 6}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expand toggle */}
      {(app.coverLetter || app.cvUrl || app.candidateLinkedinUrl || app.candidateGithubUrl || app.candidatePortfolioUrl) && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "8px", background: "none", border: "none", borderTop: "1px solid var(--border)",
            cursor: "pointer", color: "var(--text-subtle)",
          }}
        >
          <span className="mono-s" style={{ fontSize: 10 }}>{expanded ? "LESS" : "VIEW DETAILS"}</span>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      )}

      {expanded && (
        <div style={{ padding: "14px 20px 16px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>
          {app.coverLetter && (
            <div>
              <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 6 }}>COVER LETTER</p>
              <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {app.coverLetter}
              </p>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {app.cvUrl && (
              <a href={app.cvUrl} target="_blank" rel="noopener noreferrer"
                className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <FileText size={12} /> View CV
              </a>
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
                className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <ExternalLink size={12} /> Portfolio
              </a>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{
        padding: "10px 20px 14px", display: "flex", gap: 6, flexWrap: "wrap",
        borderTop: "1px solid var(--border)", background: "var(--bg-muted)",
      }}>
        {(["REVIEWED", "SHORTLISTED", "REJECTED"] as const).map(s => {
          const c = STATUS_CONFIG[s];
          const active = app.status === s;
          return (
            <button
              key={s}
              type="button"
              disabled={updating || active}
              onClick={() => setStatus(s)}
              style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 11,
                fontFamily: "var(--font-mono)", fontWeight: 600,
                border: `1px solid ${active ? c.color : "var(--border)"}`,
                background: active ? c.bg : "var(--surface)",
                color: active ? c.color : "var(--text-muted)",
                cursor: active || updating ? "default" : "pointer",
                opacity: updating ? 0.6 : 1,
                display: "flex", alignItems: "center", gap: 4,
                transition: "all 120ms",
              }}
            >
              {c.icon} {c.label}
            </button>
          );
        })}
        {!isUnreviewed(app.status) && (
          <button
            type="button"
            disabled={updating}
            onClick={() => setStatus("UNREVIEWED")}
            style={{
              padding: "5px 12px", borderRadius: 6, fontSize: 11,
              fontFamily: "var(--font-mono)", fontWeight: 600,
              border: "1px solid var(--border)", background: "var(--surface)",
              color: "var(--text-subtle)", cursor: updating ? "default" : "pointer",
              opacity: updating ? 0.6 : 1,
            }}
          >
            Reset
          </button>
        )}
      </div>
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
    <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Status filter tabs */}
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
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "5px 12px", borderRadius: 6, fontSize: 11,
                fontFamily: "var(--font-mono)", fontWeight: 600, cursor: "pointer",
                border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                background: active ? "var(--accent-soft)" : "var(--surface)",
                color: active ? "var(--accent)" : "var(--text-muted)",
                transition: "all 120ms",
              }}
            >
              {f.label}
              <span style={{
                minWidth: 16, textAlign: "center",
                padding: "1px 4px", borderRadius: 4,
                background: active ? "var(--accent)" : "var(--bg-muted)",
                color: active ? "var(--white)" : "var(--text-subtle)",
                fontSize: 10,
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
