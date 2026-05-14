"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import { JobListingsPanel } from "./JobListingsPanel";
import type { SerializedJob } from "./JobListingsPanel";
import { ApplicationsPanel } from "./ApplicationsPanel";
import type { ApplicationRow } from "./ApplicationsPanel";

export function DashboardContent({
  jobs,
  applications,
  appCountByJob,
  hasInAppJobs,
}: {
  jobs:          SerializedJob[];
  applications:  ApplicationRow[];
  appCountByJob: Record<string, number>;
  hasInAppJobs:  boolean;
}) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  function handleJobSelect(jobId: string) {
    setSelectedJobId(prev => prev === jobId ? null : jobId);
  }

  const visibleApplications = selectedJobId
    ? applications.filter(a => a.jobId === selectedJobId)
    : applications;

  const selectedJob = selectedJobId ? jobs.find(j => j.id === selectedJobId) : null;
  const unreviewedCount = applications.filter(a => a.status === "UNREVIEWED" || a.status === "PENDING").length;

  return (
    <>
      <JobListingsPanel
        jobs={jobs}
        appCountByJob={appCountByJob}
        selectedJobId={selectedJobId}
        onJobSelect={handleJobSelect}
      />

      {hasInAppJobs && (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 14, overflow: "hidden", marginBottom: 20,
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px clamp(16px,3vw,24px)", borderBottom: "1px solid var(--border)",
            background: "var(--bg-alt)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Inbox size={15} style={{ color: "var(--accent)" }} />
              <p style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, margin: 0 }}>
                Applications
              </p>
              {applications.length > 0 && (
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                  color: "var(--accent)", background: "var(--accent-soft)",
                  padding: "2px 8px", borderRadius: 99,
                }}>
                  {visibleApplications.length}{selectedJobId ? ` / ${applications.length}` : ""}
                </span>
              )}
              {selectedJob && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
                  color: "var(--accent)", background: "var(--accent-soft)",
                  padding: "3px 10px", borderRadius: 99,
                  border: "1px solid var(--accent)",
                }}>
                  Filtered: {selectedJob.title}
                  <button
                    type="button"
                    onClick={() => setSelectedJobId(null)}
                    style={{
                      background: "none", border: "none", padding: 0, cursor: "pointer",
                      color: "var(--accent)", display: "flex", lineHeight: 1,
                    }}
                    title="Clear filter"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <span className="mono-s" style={{ color: "var(--text-subtle)" }}>
              {unreviewedCount > 0 ? `${unreviewedCount} UNREVIEWED` : "ALL REVIEWED"}
            </span>
          </div>

          <ApplicationsPanel initialApplications={visibleApplications} />
        </div>
      )}
    </>
  );
}
