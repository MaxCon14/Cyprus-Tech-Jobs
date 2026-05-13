"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase, PauseCircle, FileText, Clock,
  MapPin, Eye, Edit2, Inbox, Plus,
} from "lucide-react";
import { formatSalary, remoteLabel, timeAgo } from "@/lib/utils";
import { JobVisibilityToggle } from "./JobVisibilityToggle";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SerializedJob {
  id:           string;
  title:        string;
  slug:         string;
  status:       string;
  city:         string | null;
  remoteType:   string;
  salaryMin:    number | null;
  salaryMax:    number | null;
  postedAt:     string | null;
  createdAt:    string | null;
  activeDays:   number;
  inactiveDays: number;
  applyType:    string;
  featured:     boolean;
}

// ── Config ─────────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  ACTIVE:  { bg: "var(--success-bg)",   color: "var(--success)",     label: "Active"   },
  PAUSED:  { bg: "var(--warning-bg)",   color: "var(--warning)",     label: "Inactive" },
  DRAFT:   { bg: "var(--bg-muted)",     color: "var(--text-muted)",  label: "Draft"    },
  EXPIRED: { bg: "var(--error-bg)",     color: "var(--error)",       label: "Expired"  },
  CLOSED:  { bg: "var(--bg-muted)",     color: "var(--text-subtle)", label: "Closed"   },
};

type FilterKey = "ACTIVE" | "PAUSED" | "DRAFT" | "EXPIRED";

const FILTERS: { key: FilterKey; label: string; icon: React.ReactNode }[] = [
  { key: "ACTIVE",  label: "Active listings",  icon: <Briefcase   size={16} /> },
  { key: "PAUSED",  label: "Inactive",          icon: <PauseCircle size={16} /> },
  { key: "DRAFT",   label: "Draft",             icon: <FileText    size={16} /> },
  { key: "EXPIRED", label: "Expired / closed",  icon: <Clock       size={16} /> },
];

function countFor(jobs: SerializedJob[], key: FilterKey) {
  if (key === "EXPIRED") return jobs.filter(j => j.status === "EXPIRED" || j.status === "CLOSED").length;
  return jobs.filter(j => j.status === key).length;
}

// ── Panel ──────────────────────────────────────────────────────────────────────

export function JobListingsPanel({
  jobs,
  appCountByJob,
}: {
  jobs:          SerializedJob[];
  appCountByJob: Record<string, number>;
}) {
  const [filter, setFilter] = useState<FilterKey>("ACTIVE");

  const filtered = jobs.filter(j =>
    filter === "EXPIRED"
      ? j.status === "EXPIRED" || j.status === "CLOSED"
      : j.status === filter
  );

  return (
    <>
      {/* ── Stats / filter cards ── */}
      <div className="employer-stats-grid" style={{ marginBottom: 16 }}>
        {FILTERS.map(f => {
          const count    = countFor(jobs, f.key);
          const selected = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              style={{
                textAlign: "left",
                background: selected ? "var(--accent-soft)" : "var(--surface)",
                border:     `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 12,
                padding: "16px 18px",
                cursor: "pointer",
                transition: "background 150ms, border-color 150ms, box-shadow 150ms",
                boxShadow: selected ? "0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent)" : "none",
              }}
            >
              <div style={{ color: selected ? "var(--accent)" : "var(--text-muted)", display: "flex", marginBottom: 10 }}>
                {f.icon}
              </div>
              <div style={{
                fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 26,
                color: selected ? "var(--accent)" : "var(--text)", marginBottom: 3,
              }}>
                {count}
              </div>
              <div className="body-s" style={{ color: selected ? "var(--accent)" : "var(--text-muted)", fontWeight: selected ? 600 : 400 }}>
                {f.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Job listings table ── */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px clamp(16px,3vw,24px)", borderBottom: "1px solid var(--border)", background: "var(--bg-alt)" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, margin: 0 }}>
            {FILTERS.find(f => f.key === filter)?.label ?? "Listings"}
            {" "}
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 400, fontSize: 12, color: "var(--text-subtle)" }}>
              ({filtered.length})
            </span>
          </p>
          <Link href="/post-a-job" className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={12} /> New listing
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <p className="body-s" style={{ color: "var(--text-muted)" }}>
              {filter === "ACTIVE"  && "No active listings right now. Post a job to get started."}
              {filter === "PAUSED"  && "No inactive listings."}
              {filter === "DRAFT"   && "No saved drafts."}
              {filter === "EXPIRED" && "No expired or closed listings."}
            </p>
            {filter === "ACTIVE" && (
              <Link href="/post-a-job" className="btn btn-accent" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16 }}>
                <Plus size={14} /> Post your first job
              </Link>
            )}
          </div>
        ) : (
          <div>
            {/* Column headers */}
            <div className="employer-job-header-row">
              {["Role", "Status", "Posted", "Days left", ""].map(h => (
                <span key={h} className="caption" style={{ color: "var(--text-subtle)" }}>{h}</span>
              ))}
            </div>

            {filtered.map((job, i) => {
              const st          = STATUS_STYLE[job.status] ?? STATUS_STYLE.CLOSED;
              const postedLabel = job.postedAt  ? timeAgo(job.postedAt)
                                : job.createdAt ? timeAgo(job.createdAt)
                                : "—";

              const activeDaysLeft   = Math.max(0, 30 - job.activeDays);
              const inactiveDaysLeft = Math.max(0, 30 - job.inactiveDays);
              const isActiveLow      = job.status === "ACTIVE" && activeDaysLeft <= 7;
              const isInactiveLow    = job.status === "PAUSED" && inactiveDaysLeft <= 7;

              const daysLabel = job.status === "ACTIVE" || job.status === "PAUSED"
                ? job.status === "PAUSED"
                  ? `${activeDaysLeft}d active · ${inactiveDaysLeft}d idle`
                  : `${activeDaysLeft}d left`
                : "—";

              const canToggle = job.status === "ACTIVE" || job.status === "PAUSED";

              return (
                <div key={job.id} className="employer-job-row" style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  {/* Role */}
                  <div style={{ minWidth: 0 }}>
                    <p className="body-s" style={{ fontWeight: 600, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {job.title}
                    </p>
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
                    {/* Mobile: status + days */}
                    <div className="employer-row-mobile-meta">
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "3px 8px", borderRadius: 5, fontSize: 11,
                        fontFamily: "var(--font-mono)", fontWeight: 600,
                        background: st.bg, color: st.color,
                      }}>
                        {job.status === "ACTIVE" && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--success)", display: "block" }} />}
                        {st.label}
                      </span>
                      <span className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 11 }}>
                        {postedLabel}{daysLabel !== "—" ? ` · ${daysLabel}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Status — hidden on mobile */}
                  <div className="employer-col-hide-mobile">
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

                  {/* Posted — hidden on mobile */}
                  <div className="employer-col-hide-mobile mono-s" style={{ color: "var(--text-subtle)" }}>
                    {postedLabel}
                  </div>

                  {/* Days remaining — hidden on mobile */}
                  <div className="employer-col-hide-mobile mono-s" style={{
                    color: isActiveLow || isInactiveLow ? "var(--warning)" : "var(--text-subtle)",
                  }}>
                    {daysLabel}
                  </div>

                  {/* Application badge (IN_APP jobs) */}
                  {job.applyType === "IN_APP" && (
                    <div className="employer-col-hide-mobile" style={{ display: "flex", alignItems: "center" }}>
                      {(appCountByJob[job.id] ?? 0) > 0 ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "3px 8px", borderRadius: 5, fontSize: 10,
                          fontFamily: "var(--font-mono)", fontWeight: 700,
                          background: "var(--accent-soft)", color: "var(--accent)",
                        }}>
                          <Inbox size={10} /> {appCountByJob[job.id]} applied
                        </span>
                      ) : (
                        <span className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 10 }}>0 applied</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    {canToggle && (
                      <JobVisibilityToggle
                        jobId={job.id}
                        initialStatus={job.status as "ACTIVE" | "PAUSED"}
                      />
                    )}
                    {job.status !== "DRAFT" && (
                      <Link href={`/jobs/${job.slug}`} className="btn btn-ghost btn-icon btn-sm" title="View listing">
                        <Eye size={13} />
                      </Link>
                    )}
                    <Link
                      href={`/employers/jobs/${job.id}/edit`}
                      className="btn btn-ghost btn-icon btn-sm"
                      title={job.status === "DRAFT" ? "Edit & publish draft" : "Edit listing"}
                    >
                      <Edit2 size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
