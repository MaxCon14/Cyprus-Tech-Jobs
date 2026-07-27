"use client";

import { useRef, useState } from "react";
import { JobListingsPanel } from "./JobListingsPanel";
import type { SerializedJob } from "./JobListingsPanel";
import { ApplicationsPanel } from "./ApplicationsPanel";
import type { ApplicationRow, PositionOption } from "./ApplicationsPanel";

export function DashboardContent({
  jobs,
  applications: initialApplications,
  appCountByJob,
  hasInAppJobs,
}: {
  jobs:          SerializedJob[];
  applications:  ApplicationRow[];
  appCountByJob: Record<string, number>;
  hasInAppJobs:  boolean;
}) {
  // Applications live here rather than in the panel: the panel is filtered, so
  // holding them there meant a status change on a filtered-out row was lost.
  const [applications, setApplications]   = useState(initialApplications);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const applicationsRef = useRef<HTMLDivElement>(null);

  // Every position an applicant could arrive on: the in-app listings, plus any
  // job that already holds applications but has since been switched to a
  // link-out apply type — its applicants are still here and still need finding.
  const positions: PositionOption[] = jobs
    .filter(j => j.applyType === "IN_APP" || (appCountByJob[j.id] ?? 0) > 0)
    .map(j => ({ id: j.id, title: j.title, status: j.status, count: appCountByJob[j.id] ?? 0 }))
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));

  function selectJob(jobId: string | null) {
    setSelectedJobId(jobId);
    // The listings table sits a full screen above the applications panel on a
    // phone, so filtering from a job row otherwise looks like nothing happened.
    if (jobId) {
      requestAnimationFrame(() => {
        applicationsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  function handleStatusChange(id: string, status: string) {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  return (
    <>
      <JobListingsPanel
        jobs={jobs}
        appCountByJob={appCountByJob}
        selectedJobId={selectedJobId}
        onJobSelect={jobId => selectJob(selectedJobId === jobId ? null : jobId)}
      />

      {/* scrollMarginTop clears the 61px sticky site header, which would
          otherwise sit on top of the panel heading when we scroll it in. */}
      {hasInAppJobs && (
        <div ref={applicationsRef} style={{ scrollMarginTop: 76 }}>
          <ApplicationsPanel
            applications={applications}
            positions={positions}
            selectedJobId={selectedJobId}
            onSelectJob={selectJob}
            onStatusChange={handleStatusChange}
          />
        </div>
      )}
    </>
  );
}
