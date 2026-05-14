"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, X, ChevronRight } from "lucide-react";

export interface AppliedJob {
  id:          string;
  slug:        string;
  title:       string;
  city:        string | null;
  companyName: string;
  appliedAt:   string;
  status:      string;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30)  return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function isActive(status: string) {
  return status === "ACTIVE";
}

type TimeFilter = 30 | 60 | 90 | "all";

const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
  { key: 30,    label: "30 days"  },
  { key: 60,    label: "60 days"  },
  { key: 90,    label: "90 days"  },
  { key: "all", label: "All time" },
];

function StatusTag({ status }: { status: string }) {
  const active = isActive(status);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 5, fontSize: 10,
      fontFamily: "var(--font-mono)", fontWeight: 700,
      background: active ? "var(--success-bg)"  : "var(--bg-muted)",
      color:      active ? "var(--success)"      : "var(--text-subtle)",
    }}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function AllJobsModal({ jobs, onClose }: { jobs: AppliedJob[]; onClose: () => void }) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const now = Date.now();
  const visible = jobs.filter(job => {
    if (timeFilter === "all") return true;
    const ms = timeFilter * 24 * 60 * 60 * 1000;
    return now - new Date(job.appliedAt).getTime() <= ms;
  });

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
          borderRadius: 16, maxWidth: 560, width: "100%", maxHeight: "85vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Send size={14} style={{ color: "var(--accent)" }} />
            <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, margin: 0, color: "var(--text)" }}>
              Applied jobs
            </p>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
              color: "var(--accent)", background: "var(--accent-soft)",
              padding: "2px 8px", borderRadius: 99,
            }}>
              {visible.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none", border: "1px solid var(--border)",
              borderRadius: 8, width: 32, height: 32,
              display: "grid", placeItems: "center",
              cursor: "pointer", color: "var(--text-muted)",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Time filters */}
        <div style={{
          display: "flex", gap: 6, padding: "14px 24px",
          borderBottom: "1px solid var(--border)", flexWrap: "wrap",
        }}>
          {TIME_FILTERS.map(f => {
            const active = timeFilter === f.key;
            return (
              <button
                key={String(f.key)}
                type="button"
                onClick={() => setTimeFilter(f.key)}
                style={{
                  padding: "5px 12px", borderRadius: 6, fontSize: 11,
                  fontFamily: "var(--font-mono)", fontWeight: 600, cursor: "pointer",
                  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  background: active ? "var(--accent-soft)" : "var(--surface)",
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  transition: "all 120ms",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Job list */}
        <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
          {visible.length === 0 ? (
            <p className="body-s" style={{
              color: "var(--text-subtle)", fontStyle: "italic",
              padding: "24px", textAlign: "center",
            }}>
              No applications in this period.
            </p>
          ) : (
            visible.map((job, i) => (
              <div
                key={job.id}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 24px",
                  borderBottom: i < visible.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="body-s"
                      style={{ fontWeight: 600, color: "var(--text)", textDecoration: "none" }}
                      onClick={onClose}
                    >
                      {job.title}
                    </Link>
                    <StatusTag status={job.status} />
                  </div>
                  <p className="mono-s" style={{ color: "var(--text-subtle)", margin: 0 }}>
                    {job.companyName}{job.city ? ` · ${job.city}` : ""}
                  </p>
                </div>
                <span className="mono-s" style={{ color: "var(--text-subtle)", flexShrink: 0, fontSize: 11 }}>
                  {job.appliedAt ? timeAgo(new Date(job.appliedAt)) : ""}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function AppliedJobsCard({ jobs }: { jobs: AppliedJob[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const preview = jobs.slice(0, 3);

  return (
    <>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Send size={14} style={{ color: "var(--accent)" }} />
            <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", margin: 0 }}>Applied jobs</p>
            {jobs.length > 0 && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", background: "var(--accent-soft)", padding: "2px 7px", borderRadius: 99 }}>
                {jobs.length}
              </span>
            )}
          </div>
          <Link href="/jobs" className="btn btn-ghost btn-sm">Browse jobs</Link>
        </div>

        {/* Top 3 list */}
        <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 0 }}>
          {jobs.length === 0 ? (
            <p className="body-s" style={{ color: "var(--text-subtle)", fontStyle: "italic", padding: "8px 0" }}>
              Jobs you apply to will appear here.
            </p>
          ) : (
            <>
              {preview.map((job, i) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.slug}`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 8, padding: "12px 0",
                    borderBottom: i < preview.length - 1 ? "1px solid var(--border)" : "none",
                    textDecoration: "none",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                      <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                        {job.title}
                      </p>
                      <StatusTag status={job.status} />
                    </div>
                    <p className="mono-s" style={{ color: "var(--text-subtle)", margin: 0 }}>
                      {job.companyName}{job.city ? ` · ${job.city}` : ""}
                    </p>
                  </div>
                  <span className="mono-s" style={{ color: "var(--text-subtle)", flexShrink: 0, fontSize: 11 }}>
                    {job.appliedAt ? timeAgo(new Date(job.appliedAt)) : ""}
                  </span>
                </Link>
              ))}

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "12px 0", background: "none", border: "none",
                  borderTop: "1px solid var(--border)",
                  cursor: "pointer", color: "var(--accent)",
                  fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
                }}
              >
                View all {jobs.length} application{jobs.length !== 1 ? "s" : ""} <ChevronRight size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {modalOpen && <AllJobsModal jobs={jobs} onClose={() => setModalOpen(false)} />}
    </>
  );
}
