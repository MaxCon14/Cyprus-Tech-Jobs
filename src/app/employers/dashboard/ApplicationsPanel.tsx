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
  PENDING:     { label: "New",         bg: "var(--accent-soft)",  color: "var(--accent)",  icon: <Clock size={11} /> },
  REVIEWED:    { label: "Reviewed",    bg: "var(--bg-muted)",     color: "var(--text-muted)", icon: <CheckCircle2 size={11} /> },
  SHORTLISTED: { label: "Shortlisted", bg: "var(--success-bg)",   color: "var(--success)", icon: <Star size={11} /> },
  REJECTED:    { label: "Rejected",    bg: "var(--error-bg)",     color: "var(--error)",   icon: <X size={11} /> },
};

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
  const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.PENDING;

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
      background: app.status === "PENDING" ? "var(--surface)" : "var(--bg-alt)",
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
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {app.candidateCity && <span className="tag" style={{ fontSize: 10 }}>{app.candidateCity}</span>}
                {app.candidateExperienceLevel && (
                  <span className="tag tag-outline" style={{ fontSize: 10 }}>{app.candidateExperienceLevel}</span>
                )}
                <Link href={`/jobs/${app.jobSlug}`} className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 10, textDecoration: "none" }}>
                  {app.jobTitle}
                </Link>
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

      {/* Expand toggle for cover letter + links */}
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

          {/* Cover letter */}
          {app.coverLetter && (
            <div>
              <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 6 }}>COVER LETTER</p>
              <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {app.coverLetter}
              </p>
            </div>
          )}

          {/* Links */}
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
        {app.status !== "PENDING" && (
          <button
            type="button"
            disabled={updating}
            onClick={() => setStatus("PENDING")}
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

export function ApplicationsPanel({ initialApplications }: { initialApplications: ApplicationRow[] }) {
  const [applications, setApplications] = useState(initialApplications);

  function handleStatusChange(id: string, status: string) {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  const pending     = applications.filter(a => a.status === "PENDING");
  const shortlisted = applications.filter(a => a.status === "SHORTLISTED");
  const reviewed    = applications.filter(a => a.status === "REVIEWED");
  const rejected    = applications.filter(a => a.status === "REJECTED");

  if (applications.length === 0) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", color: "var(--text-subtle)" }}>
        <p className="body-s">No applications yet. Post a job with in-app applications to receive candidates here.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Summary badges */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          { label: "New",         count: pending.length,     color: "var(--accent)"  },
          { label: "Shortlisted", count: shortlisted.length, color: "var(--success)" },
          { label: "Reviewed",    count: reviewed.length,    color: "var(--text-muted)" },
          { label: "Rejected",    count: rejected.length,    color: "var(--error)"   },
        ].map(s => s.count > 0 && (
          <span key={s.label} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 6, fontSize: 12,
            fontFamily: "var(--font-mono)", fontWeight: 600,
            background: "var(--bg-muted)", color: s.color,
          }}>
            {s.count} {s.label}
          </span>
        ))}
      </div>

      {/* New applications first */}
      {[...pending, ...shortlisted, ...reviewed, ...rejected].map(app => (
        <ApplicationCard key={app.id} app={app} onStatusChange={handleStatusChange} />
      ))}
    </div>
  );
}
