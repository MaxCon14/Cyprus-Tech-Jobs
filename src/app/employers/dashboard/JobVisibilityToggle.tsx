"use client";

import { useState } from "react";
import { EyeOff, Play, Loader2 } from "lucide-react";

interface Props {
  jobId:          string;
  initialStatus:  "ACTIVE" | "PAUSED";
}

export function JobVisibilityToggle({ jobId, initialStatus }: Props) {
  const [status,  setStatus]  = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/visibility`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
      }
    } finally {
      setLoading(false);
    }
  }

  const isPaused = status === "PAUSED";

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="btn btn-ghost btn-icon btn-sm"
      title={isPaused ? "Resume listing" : "Pause listing"}
      style={{ color: isPaused ? "var(--accent)" : "var(--text-muted)" }}
    >
      {loading
        ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
        : isPaused
          ? <Play    size={13} />
          : <EyeOff  size={13} />
      }
    </button>
  );
}
