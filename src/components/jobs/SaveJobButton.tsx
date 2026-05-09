"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Heart, X } from "lucide-react";
import Link from "next/link";

function GuestModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.45)",
        display: "grid", placeItems: "center",
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--surface)", borderRadius: 16,
          border: "1px solid var(--border)",
          padding: "32px 28px", maxWidth: 380, width: "100%",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 4, display: "grid", placeItems: "center" }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent-soft)", display: "grid", placeItems: "center", marginBottom: 16 }}>
          <Heart size={22} style={{ color: "var(--accent)" }} fill="var(--accent)" />
        </div>

        <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 8, lineHeight: 1.3 }}>
          Save jobs to your wishlist
        </h2>

        <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 6 }}>
          Create a free candidate account to save jobs, track your applications, and get personalised alerts.
        </p>

        <p className="body-s" style={{ color: "var(--accent)", fontWeight: 600, marginBottom: 24 }}>
          Candidates are always free — no credit card needed.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link
            href="/get-started"
            className="btn btn-accent"
            style={{ justifyContent: "center", width: "100%" }}
            onClick={onClose}
          >
            Create free account
          </Link>
          <Link
            href="/login"
            className="btn btn-outline"
            style={{ justifyContent: "center", width: "100%" }}
            onClick={onClose}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SaveJobButton({
  jobId,
  initialSaved,
  isCandidate,
}: {
  jobId: string;
  initialSaved: boolean;
  isCandidate: boolean;
}) {
  const [saved,     setSaved]     = useState(initialSaved);
  const [loading,   setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isCandidate) {
      setShowModal(true);
      return;
    }

    if (loading) return;
    setLoading(true);
    const optimistic = !saved;
    setSaved(optimistic);
    try {
      const res = await fetch("/api/candidates/saved-jobs", {
        method:  optimistic ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ jobId }),
      });
      if (!res.ok) setSaved(!optimistic);
    } catch {
      setSaved(!optimistic);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {showModal && createPortal(
        <GuestModal onClose={() => setShowModal(false)} />,
        document.body
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={saved ? "Unsave job" : "Save job"}
        style={{
          background: "none", border: "none",
          cursor: loading ? "default" : "pointer",
          padding: 4, display: "grid", placeItems: "center",
          color: saved ? "var(--accent)" : "var(--text-subtle)",
          transition: "color 150ms ease, transform 150ms ease",
          transform: loading ? "scale(0.9)" : "scale(1)",
          flexShrink: 0,
        }}
      >
        <Heart size={18} fill={saved ? "var(--accent)" : "none"} strokeWidth={2} />
      </button>
    </>
  );
}
