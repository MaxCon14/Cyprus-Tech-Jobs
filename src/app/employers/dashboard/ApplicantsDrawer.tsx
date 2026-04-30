"use client";

import { useState } from "react";
import {
  Users, X, ExternalLink, Globe, AtSign,
  FileText, Loader2, MapPin, Briefcase, DollarSign, Calendar, ChevronRight, ChevronDown, Link2,
  Clock, ShieldCheck,
} from "lucide-react";
import type { CandidateRow, PositionRow } from "@/lib/candidate-types";

interface Application {
  id: string;
  coverLetter: string | null;
  status: string;
  appliedAt: string;
  cvUrl: string | null;
  availability: string | null;
  noticePeriod: string | null;
  expectedSalary: number | null;
  rightToWork: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  candidate: CandidateRow | null;
  positions: PositionRow[];
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDate(d: string | null) {
  if (!d) return "";
  const [y, m] = d.split("-");
  const month = MONTHS[parseInt(m, 10) - 1];
  return month ? `${month} ${y}` : y;
}

function fmtApplied(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function durationLabel(start: string | null, end: string | null, current: boolean): string {
  if (!start) return "";
  const s = new Date(start + "-01");
  const e = current ? new Date() : (end ? new Date(end + "-01") : null);
  if (!e) return "";
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (months < 1) return "< 1 mo";
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  if (yrs === 0) return `${mos} mo${mos !== 1 ? "s" : ""}`;
  if (mos === 0) return `${yrs} yr${yrs !== 1 ? "s" : ""}`;
  return `${yrs} yr${yrs !== 1 ? "s" : ""} ${mos} mo${mos !== 1 ? "s" : ""}`;
}

function remoteLabel(r: string | null) {
  if (r === "REMOTE")  return "Remote";
  if (r === "HYBRID")  return "Hybrid";
  if (r === "ON_SITE") return "On-site";
  return r ?? "";
}

function availabilityLabel(v: string | null) {
  if (!v) return null;
  const map: Record<string, string> = {
    IMMEDIATELY:     "Immediately",
    "2_WEEKS":       "2 weeks",
    "1_MONTH":       "1 month",
    "3_MONTHS_PLUS": "3 months+",
  };
  return map[v] ?? v;
}

function noticePeriodLabel(v: string | null) {
  if (!v) return null;
  const map: Record<string, string> = {
    IMMEDIATE:       "Immediate",
    "2_WEEKS":       "2 weeks",
    "1_MONTH":       "1 month",
    "2_MONTHS":      "2 months",
    "3_MONTHS_PLUS": "3 months+",
  };
  return map[v] ?? v;
}

function rightToWorkInfo(v: string | null): { label: string; color: string; bg: string } | null {
  if (!v) return null;
  if (v === "EU_CITIZEN")        return { label: "EU / EEA citizen",       color: "var(--success)", bg: "var(--success-bg)" };
  if (v === "WORK_PERMIT")       return { label: "Work permit holder",     color: "#b45309",         bg: "#fef3c7"           };
  if (v === "NEEDS_SPONSORSHIP") return { label: "Needs visa sponsorship", color: "var(--error)",   bg: "var(--error-bg)"  };
  return null;
}

// ─── Position accordion item ──────────────────────────────────────────────────

function PositionItem({ pos }: { pos: PositionRow }) {
  const [open, setOpen] = useState(false);
  const hasDesc = !!pos.description?.trim();
  const duration = durationLabel(pos.startDate, pos.endDate, pos.current);

  return (
    <div style={{ borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => hasDesc && setOpen((v) => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "flex-start", gap: 10,
          padding: "10px 12px", background: "none", border: "none",
          cursor: hasDesc ? "pointer" : "default", textAlign: "left",
        }}
      >
        <Briefcase size={12} style={{ color: "var(--text-subtle)", flexShrink: 0, marginTop: 3 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{pos.title}</p>
          <p className="mono-s" style={{ color: "var(--text-subtle)" }}>
            {pos.company} · {fmtDate(pos.startDate)} – {pos.current ? "Present" : fmtDate(pos.endDate)}
            {duration && <> · {duration}</>}
          </p>
        </div>
        {hasDesc && (
          <ChevronDown size={13} style={{
            color: "var(--text-subtle)", flexShrink: 0, marginTop: 2,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms ease",
          }} />
        )}
      </button>
      {open && hasDesc && (
        <div style={{ padding: "0 12px 12px 34px", borderTop: "1px solid var(--border)" }}>
          <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap", paddingTop: 10 }}>
            {pos.description}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Applicant card ───────────────────────────────────────────────────────────

function ApplicantCard({ app }: { app: Application }) {
  const [showCover, setShowCover] = useState(false);
  const c = app.candidate;
  if (!c) return null;

  const name = [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email;
  const initial = name[0].toUpperCase();
  const skills = c.skills ?? [];
  const visibleSkills = skills.slice(0, 6);
  const extraSkills = skills.length - 6;

  // Option B: application-specific values override profile links
  const cvLink       = app.cvUrl       ?? c.cvUrl;
  const linkedinUrl  = app.linkedinUrl  ?? c.linkedinUrl;
  const portfolioUrl = app.portfolioUrl ?? c.portfolioUrl;

  const links = [
    { url: c.githubUrl,   icon: <Globe size={13} />,  label: "GitHub"    },
    { url: linkedinUrl,   icon: <Link2 size={13} />,  label: "LinkedIn"  },
    { url: portfolioUrl,  icon: <Globe size={13} />,  label: "Portfolio" },
    { url: c.twitterUrl,  icon: <AtSign size={13} />, label: "Twitter"   },
    { url: c.dribbbleUrl, icon: <AtSign size={13} />, label: "Dribbble"  },
    { url: c.behanceUrl,  icon: <Globe size={13} />,  label: "Behance"   },
  ].filter((l) => !!l.url);

  const rtw    = rightToWorkInfo(app.rightToWork);
  const avail  = availabilityLabel(app.availability);
  const notice = noticePeriodLabel(app.noticePeriod);

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          background: "var(--accent-soft)", border: "1.5px solid var(--accent)",
          display: "grid", placeItems: "center",
        }}>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 17, color: "var(--accent)" }}>{initial}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <div>
              <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{name}</p>
              {c.headline && <p className="body-s" style={{ color: "var(--text-muted)" }}>{c.headline}</p>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Calendar size={11} style={{ color: "var(--text-subtle)" }} />
              <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{fmtApplied(app.appliedAt)}</span>
            </div>
          </div>

          {/* Profile meta tags */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {c.city && (
              <span className="tag" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                <MapPin size={9} /> {c.city}
              </span>
            )}
            {c.remoteType && <span className="tag tag-outline" style={{ fontSize: 11 }}>{remoteLabel(c.remoteType)}</span>}
            {c.experienceLevel && <span className="tag tag-outline" style={{ fontSize: 11 }}>{c.experienceLevel}</span>}
            {c.salaryMin && (
              <span className="tag" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                <DollarSign size={9} /> €{c.salaryMin.toLocaleString()}+ min
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Zone A: Application summary ─────────────────────────────────────── */}
      {(rtw || avail || notice || app.expectedSalary) && (
        <div style={{ margin: "0 18px 14px", padding: "12px 14px", background: "var(--bg-muted)", borderRadius: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 2 }}>APPLICATION DETAILS</p>

          {/* Right to work — most prominent */}
          {rtw && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={13} style={{ color: rtw.color, flexShrink: 0 }} />
              <span style={{
                fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 12,
                color: rtw.color, background: rtw.bg,
                padding: "3px 10px", borderRadius: 99,
              }}>
                {rtw.label}
              </span>
            </div>
          )}

          {/* Availability + notice period */}
          {(avail || notice) && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <Clock size={12} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
              <span className="body-s" style={{ color: "var(--text-muted)" }}>
                {avail && <>Available: <strong>{avail}</strong></>}
                {avail && notice && <span style={{ color: "var(--border-strong)" }}> · </span>}
                {notice && <>Notice: <strong>{notice}</strong></>}
              </span>
            </div>
          )}

          {/* Expected salary */}
          {app.expectedSalary && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <DollarSign size={12} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
              <span className="body-s" style={{ color: "var(--text-muted)" }}>
                Expects <strong>€{app.expectedSalary.toLocaleString()}/yr</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Zone B: Candidate profile ───────────────────────────────────────── */}

      {/* Bio */}
      {c.bio && (
        <div style={{ padding: "0 18px 14px" }}>
          <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {c.bio}
          </p>
        </div>
      )}

      {/* Skills */}
      {visibleSkills.length > 0 && (
        <div style={{ padding: "0 18px 14px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {visibleSkills.map((s) => (
            <span key={s} className="tag" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{s}</span>
          ))}
          {extraSkills > 0 && <span className="tag tag-outline" style={{ fontSize: 11 }}>+{extraSkills} more</span>}
        </div>
      )}

      {/* Work history — expandable accordion cards */}
      {app.positions.length > 0 && (
        <div style={{ padding: "0 18px 14px" }}>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 8 }}>WORK EXPERIENCE</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {app.positions.map((pos) => <PositionItem key={pos.id} pos={pos} />)}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {links.map(({ url, icon, label }) => (
            <a key={label} href={url!.startsWith("http") ? url! : `https://${url}`}
              target="_blank" rel="noopener noreferrer" title={label}
              style={{ display: "flex", alignItems: "center", color: "var(--text-subtle)", textDecoration: "none", padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)" }}>
              {icon}
            </a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {app.coverLetter && (
            <button type="button" onClick={() => setShowCover((v) => !v)}
              className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <FileText size={12} />
              {showCover ? "Hide" : "Cover letter"}
            </button>
          )}
          {cvLink ? (
            <a href={cvLink.startsWith("http") ? cvLink : `https://${cvLink}`}
              target="_blank" rel="noopener noreferrer"
              className="btn btn-accent btn-sm"
              style={{ display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
              <ExternalLink size={12} /> View CV
            </a>
          ) : (
            <button type="button" disabled className="btn btn-outline btn-sm" style={{ opacity: 0.4 }}>No CV</button>
          )}
        </div>
      </div>

      {/* Cover letter */}
      {showCover && app.coverLetter && (
        <div style={{ padding: "14px 18px 16px", borderTop: "1px solid var(--border)", background: "var(--bg-muted)" }}>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 8 }}>Cover letter</p>
          <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{app.coverLetter}</p>
        </div>
      )}
    </div>
  );
}

// ─── Drawer (slide-in panel) ──────────────────────────────────────────────────

export function ApplicantsDrawer({ jobId, count, jobTitle }: { jobId: string; count: number; jobTitle: string }) {
  const [open, setOpen]                 = useState(false);
  const [loading, setLoading]           = useState(false);
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [error, setError]               = useState<string | null>(null);

  async function openPanel() {
    setOpen(true);
    if (applications !== null) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${jobId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setApplications(data.applications ?? []);
    } catch {
      setError("Could not load applicants. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={openPanel}
        className="btn btn-ghost btn-sm"
        style={{ display: "flex", alignItems: "center", gap: 5 }}
      >
        <Users size={12} />
        <span>{count}</span>
        <ChevronRight size={11} />
      </button>

      {/* Side panel */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
            onClick={() => setOpen(false)} />

          <div style={{
            position: "relative", width: "100%", maxWidth: 560, height: "100dvh",
            background: "var(--surface)", borderLeft: "1px solid var(--border)",
            display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)",
          }}>
            {/* Header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--surface)", zIndex: 1 }}>
              <div>
                <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 4 }}>Applicants</p>
                <h2 className="h3">{jobTitle}</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0" }}>
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite", color: "var(--accent)" }} />
                  <span className="body-s" style={{ color: "var(--text-muted)" }}>Loading applicants…</span>
                </div>
              )}
              {error && <p className="body-s" style={{ color: "var(--error)" }}>{error}</p>}
              {applications !== null && applications.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Users size={32} style={{ color: "var(--text-subtle)", margin: "0 auto 12px" }} />
                  <p className="body-s" style={{ color: "var(--text-subtle)" }}>No applications yet.</p>
                </div>
              )}
              {applications?.map((app) => (
                <ApplicantCard key={app.id} app={app} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
