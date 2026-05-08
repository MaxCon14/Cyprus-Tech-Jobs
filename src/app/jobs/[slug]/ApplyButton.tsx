"use client";

import { useEffect, useRef } from "react";

interface Props {
  jobId: string;
  applyUrl: string;
  companyName: string;
}

export function ApplyButton({ jobId, applyUrl, companyName }: Props) {
  const recorded = useRef(false);

  // Record on first mount so the button appears ready immediately
  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
  }, []);

  function handleClick() {
    // Fire-and-forget — don't block navigation
    fetch("/api/candidates/applied-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    }).catch(() => {/* non-critical */});

    window.open(applyUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <button
        onClick={handleClick}
        className="btn btn-accent btn-lg"
        style={{ width: "100%", justifyContent: "center" }}
      >
        Apply for this role →
      </button>
      <p className="mono-s" style={{ color: "var(--text-subtle)", textAlign: "center" }}>
        APPLIES TO {companyName.toUpperCase()} DIRECTLY
      </p>
    </div>
  );
}
