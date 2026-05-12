"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, FileText, AlertCircle } from "lucide-react";

interface Props {
  jobId: string;
  applyType: string;
  applyUrl?: string;
  applyEmail?: string;
  companyName: string;
  // Candidate info — only present when logged in as a candidate
  candidateId?: string;
  candidateName?: string;
  candidateEmail?: string;
  candidateHeadline?: string;
  candidateCity?: string;
  candidateExperienceLevel?: string;
  candidateSkills?: string[];
  cvUrl?: string;
}

function ensureAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function recordApply(jobId: string) {
  fetch("/api/candidates/applied-jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId }),
  }).catch(() => {});
}

export function ApplyButton({
  jobId, applyType, applyUrl, applyEmail, companyName,
  candidateId, candidateName, candidateEmail, candidateHeadline,
  candidateCity, candidateExperienceLevel, candidateSkills, cvUrl,
}: Props) {

  // ── External / email apply (URL | EMAIL) ─────────────────────────────────
  if (applyType !== "IN_APP") {
    function handleClick() {
      recordApply(jobId);
      if (applyEmail && !applyUrl) {
        window.location.href = `mailto:${applyEmail}`;
      } else if (applyUrl) {
        window.open(ensureAbsoluteUrl(applyUrl), "_blank", "noopener,noreferrer");
      }
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={handleClick} className="btn btn-accent btn-lg" style={{ width: "100%", justifyContent: "center" }}>
          Apply for this role →
        </button>
        <p className="mono-s" style={{ color: "var(--text-subtle)", textAlign: "center" }}>
          APPLIES TO {companyName.toUpperCase()} DIRECTLY
        </p>
      </div>
    );
  }

  // ── In-app apply ──────────────────────────────────────────────────────────
  return (
    <InAppApplyForm
      jobId={jobId}
      companyName={companyName}
      candidateId={candidateId}
      candidateName={candidateName}
      candidateEmail={candidateEmail}
      candidateHeadline={candidateHeadline}
      candidateCity={candidateCity}
      candidateExperienceLevel={candidateExperienceLevel}
      candidateSkills={candidateSkills}
      cvUrl={cvUrl}
    />
  );
}

function InAppApplyForm({
  jobId, companyName,
  candidateId, candidateName, candidateEmail, candidateHeadline,
  candidateCity, candidateExperienceLevel, candidateSkills, cvUrl,
}: Omit<Props, "applyType" | "applyUrl" | "applyEmail">) {
  const [open,        setOpen]        = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Not logged in as candidate
  if (!candidateId) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Link href="/login" className="btn btn-accent btn-lg" style={{ width: "100%", justifyContent: "center" }}>
          Sign in to apply →
        </Link>
        <p className="mono-s" style={{ color: "var(--text-subtle)", textAlign: "center" }}>
          APPLY DIRECTLY ON CYPRUSTECHJOBS
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "8px 0" }}>
        <CheckCircle2 size={28} style={{ color: "var(--success)" }} />
        <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", textAlign: "center", margin: 0 }}>
          Application submitted!
        </p>
        <p className="body-s" style={{ color: "var(--text-muted)", textAlign: "center", margin: 0 }}>
          {companyName} will review your profile and get back to you.
        </p>
      </div>
    );
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/candidates/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, coverLetter: coverLetter.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      recordApply(jobId);
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={() => setOpen(true)}
          className="btn btn-accent btn-lg"
          style={{ width: "100%", justifyContent: "center" }}
        >
          Apply on CyprusTech.Jobs →
        </button>
        <p className="mono-s" style={{ color: "var(--text-subtle)", textAlign: "center" }}>
          USES YOUR SAVED PROFILE &amp; CV
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Candidate snapshot */}
      <div style={{ background: "var(--bg-muted)", borderRadius: 8, padding: "12px 14px" }}>
        <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 8 }}>APPLYING AS</p>
        <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
          {candidateName || candidateEmail}
        </p>
        {candidateHeadline && (
          <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 4 }}>{candidateHeadline}</p>
        )}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {candidateCity && <span className="tag" style={{ fontSize: 11 }}>{candidateCity}</span>}
          {candidateExperienceLevel && <span className="tag tag-outline" style={{ fontSize: 11 }}>{candidateExperienceLevel}</span>}
        </div>
        {(candidateSkills ?? []).length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
            {(candidateSkills ?? []).slice(0, 5).map(s => (
              <span key={s} className="tag" style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>{s}</span>
            ))}
            {(candidateSkills ?? []).length > 5 && (
              <span className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 10 }}>+{(candidateSkills ?? []).length - 5} more</span>
            )}
          </div>
        )}
      </div>

      {/* CV status */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <FileText size={14} style={{ color: cvUrl ? "var(--success)" : "var(--text-subtle)", flexShrink: 0 }} />
        {cvUrl ? (
          <a href={cvUrl} target="_blank" rel="noopener noreferrer"
            className="body-s" style={{ color: "var(--accent)", textDecoration: "underline" }}>
            CV attached · View
          </a>
        ) : (
          <span className="body-s" style={{ color: "var(--text-subtle)" }}>
            No CV on file —{" "}
            <Link href="/candidates/dashboard" style={{ color: "var(--accent)" }}>upload in your profile</Link>
          </span>
        )}
      </div>

      {/* Cover letter */}
      <div>
        <label className="body-s" style={{ fontWeight: 500, color: "var(--text)", display: "block", marginBottom: 6 }}>
          Cover letter <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>(optional)</span>
        </label>
        <textarea
          className="textarea"
          rows={4}
          value={coverLetter}
          onChange={e => setCoverLetter(e.target.value)}
          placeholder={`Tell ${companyName} why you're a great fit…`}
          style={{ width: "100%", resize: "vertical" }}
        />
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--error)", background: "var(--error-bg)", borderRadius: 6, padding: "8px 12px" }}>
          <AlertCircle size={13} style={{ flexShrink: 0 }} />
          <span className="body-s">{error}</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn btn-accent btn-lg"
          style={{ flex: 1, justifyContent: "center", display: "flex", alignItems: "center", gap: 8 }}
        >
          {submitting
            ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Submitting…</>
            : "Submit application →"
          }
        </button>
        <button onClick={() => setOpen(false)} className="btn btn-ghost btn-lg" style={{ flexShrink: 0 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
