"use client";

import { useState } from "react";
import { X, CheckCircle2, Loader2, ArrowRight, Send } from "lucide-react";
import Link from "next/link";

interface Props {
  jobId: string;
  jobSlug: string;
  jobTitle: string;
  candidateId?: string | null;
  candidateName?: string | null;
  candidateHeadline?: string | null;
  hasApplied: boolean;
}

export function ApplyPanel({
  jobId,
  jobSlug,
  jobTitle,
  candidateId,
  candidateName,
  candidateHeadline,
  hasApplied: initialHasApplied,
}: Props) {
  const [open, setOpen]             = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [applied, setApplied]       = useState(initialHasApplied);

  function close() {
    setOpen(false);
    setError(null);
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, coverLetter: coverLetter.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setApplied(true);
        close();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Not logged in
  if (!candidateId) {
    return (
      <Link
        href={`/candidates/login?callbackUrl=/jobs/${jobSlug}`}
        className="btn btn-accent btn-lg"
        style={{ width: "100%", justifyContent: "center", display: "flex" }}
      >
        Sign in to apply
      </Link>
    );
  }

  // Already applied
  if (applied) {
    return (
      <button
        type="button"
        disabled
        className="btn btn-accent btn-lg"
        style={{ width: "100%", justifyContent: "center", gap: 8, opacity: 1, cursor: "default", background: "var(--success)", borderColor: "var(--success)" }}
      >
        <CheckCircle2 size={16} /> Applied ✓
      </button>
    );
  }

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-accent btn-lg"
        style={{ width: "100%", justifyContent: "center", gap: 8 }}
      >
        Apply on CyprusTech.Jobs <ArrowRight size={15} />
      </button>

      {/* Panel overlay */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }} onClick={close} />

          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: 480,
            height: "100dvh",
            background: "var(--surface)",
            borderLeft: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            boxShadow: "var(--shadow-lg)",
          }}>
            {/* Header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--surface)", zIndex: 1 }}>
              <div>
                <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 4 }}>Apply for role</p>
                <h2 className="h3">{jobTitle}</h2>
              </div>
              <button type="button" onClick={close} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Applicant identity */}
              <div style={{ background: "var(--bg-muted)", borderRadius: 12, padding: "16px 18px" }}>
                <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 10 }}>Applying as</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    background: "var(--accent-soft)", border: "1.5px solid var(--accent)",
                    display: "grid", placeItems: "center",
                  }}>
                    <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: "var(--accent)" }}>
                      {(candidateName ?? "?")[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="body-s" style={{ fontWeight: 600, color: "var(--text)" }}>{candidateName ?? "Your profile"}</p>
                    {candidateHeadline && (
                      <p className="body-s" style={{ color: "var(--text-muted)" }}>{candidateHeadline}</p>
                    )}
                  </div>
                </div>
                <p className="mono-s" style={{ color: "var(--text-subtle)", marginTop: 12 }}>
                  Your full profile, skills, and CV will be shared with the employer.
                </p>
              </div>

              {/* Cover letter */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label className="body-s" style={{ fontWeight: 500, color: "var(--text)" }}>
                  Cover letter <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  className="textarea"
                  rows={6}
                  maxLength={1000}
                  placeholder="Tell the employer why you're a great fit for this role…"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
                <p className="mono-s" style={{ color: "var(--text-subtle)", textAlign: "right" }}>
                  {coverLetter.length}/1000
                </p>
              </div>

              {error && (
                <div style={{ background: "var(--error-bg)", border: "1px solid var(--error)", borderRadius: 8, padding: "12px 14px" }}>
                  <p className="body-s" style={{ color: "var(--error)" }}>{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="btn btn-accent btn-lg"
                style={{ width: "100%", justifyContent: "center", gap: 8, marginTop: "auto" }}
              >
                {loading
                  ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Submitting…</>
                  : <><Send size={15} /> Submit application</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
