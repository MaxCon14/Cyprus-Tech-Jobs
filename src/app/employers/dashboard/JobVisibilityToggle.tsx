"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Pause, Play, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  jobId:         string;
  initialStatus: "ACTIVE" | "PAUSED";
}

export function JobVisibilityToggle({ jobId, initialStatus }: Props) {
  const [status,  setStatus]  = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();

  async function doToggle() {
    setConfirm(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/visibility`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        router.refresh(); // re-render server component: status badge, stats row
      }
    } finally {
      setLoading(false);
    }
  }

  function handleClick() {
    if (status === "ACTIVE") {
      setConfirm(true); // show warning before pausing
    } else {
      doToggle();        // resume immediately, no confirmation needed
    }
  }

  const isPaused = status === "PAUSED";

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn btn-ghost btn-icon btn-sm"
        title={isPaused ? "Resume listing" : "Make inactive"}
        style={{ color: isPaused ? "var(--accent)" : "var(--text-muted)" }}
      >
        {loading
          ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
          : isPaused
            ? <Play  size={13} />
            : <Pause size={13} />
        }
      </button>

      {confirm && createPortal(
        <div
          onClick={() => setConfirm(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 400,
            background: "rgba(0,0,0,0.45)",
            display: "grid", placeItems: "center", padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--surface)", borderRadius: 16,
              border: "1px solid var(--border)",
              padding: "32px 28px", maxWidth: 400, width: "100%",
              position: "relative",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            }}
          >
            <button
              onClick={() => setConfirm(false)}
              style={{
                position: "absolute", top: 14, right: 14,
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-subtle)", padding: 4,
                display: "grid", placeItems: "center",
              }}
              aria-label="Cancel"
            >
              <X size={16} />
            </button>

            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "var(--warning-bg)", display: "grid", placeItems: "center",
              marginBottom: 16,
            }}>
              <Pause size={20} style={{ color: "var(--warning)" }} />
            </div>

            <h2 style={{
              fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 17,
              color: "var(--text)", marginBottom: 8, lineHeight: 1.3,
            }}>
              Make this listing inactive?
            </h2>
            <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 24 }}>
              This will hide the listing from candidates immediately. Your slot time continues to count while inactive. You can reactivate it at any time.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirm(false)}
                className="btn btn-outline"
                style={{ flex: 1, justifyContent: "center" }}
              >
                Keep active
              </button>
              <button
                onClick={doToggle}
                className="btn"
                style={{
                  flex: 1, justifyContent: "center",
                  background: "var(--warning-bg)",
                  color: "var(--warning)",
                  border: "1px solid #fcd34d",
                  fontWeight: 600,
                }}
              >
                Make inactive
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
