"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, FileText, AlertCircle, Upload, ChevronDown } from "lucide-react";

interface Props {
  jobId: string;
  applyType: string;
  applyUrl?: string;
  applyEmail?: string;
  companyName: string;
  coverLetterPolicy?: "REQUIRED" | "OPTIONAL" | "NONE";
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
  coverLetterPolicy = "OPTIONAL",
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
      coverLetterPolicy={coverLetterPolicy}
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
  jobId, companyName, coverLetterPolicy = "OPTIONAL",
  candidateId, candidateName, candidateEmail, candidateHeadline,
  candidateCity, candidateExperienceLevel, candidateSkills, cvUrl,
}: Omit<Props, "applyType" | "applyUrl" | "applyEmail"> & { coverLetterPolicy: "REQUIRED" | "OPTIONAL" | "NONE" }) {
  const [open,          setOpen]          = useState(false);
  const [coverLetter,   setCoverLetter]   = useState("");
  const [submitting,    setSubmitting]    = useState(false);
  const [submitted,     setSubmitted]     = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  // CV source: "saved" = use profile CV, "upload" = pick file
  const [cvSource,      setCvSource]      = useState<"saved" | "upload">("saved");
  const [uploadedCvUrl, setUploadedCvUrl] = useState<string | null>(null);
  const [uploading,     setUploading]     = useState(false);
  const [uploadError,   setUploadError]   = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res  = await fetch("/api/candidates/cv-upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed.");
        setUploading(false);
        return;
      }
      setUploadedCvUrl(data.url);
    } catch {
      setUploadError("Network error. Please try again.");
    }
    setUploading(false);
  }

  const activeCvUrl = cvSource === "upload" ? uploadedCvUrl : (cvUrl ?? null);

  async function handleSubmit() {
    setError(null);
    if (coverLetterPolicy === "REQUIRED" && !coverLetter.trim()) {
      setError("A cover letter is required for this role.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/candidates/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          coverLetter: coverLetter.trim() || null,
          cvUrl: activeCvUrl ?? null,
        }),
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

  const initials = (candidateName ?? candidateEmail ?? "?")
    .split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Candidate snapshot — styled card */}
      <div style={{
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "var(--surface)",
      }}>
        {/* Gradient header bar */}
        <div style={{
          background: "linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 60%, #6366f1) 100%)",
          padding: "14px 16px 28px",
          position: "relative",
        }}>
          <p className="caption" style={{ color: "rgba(255,255,255,0.75)", letterSpacing: "0.1em", margin: 0 }}>
            APPLYING AS
          </p>
        </div>

        {/* Avatar overlapping the bar */}
        <div style={{ padding: "0 16px 16px", marginTop: -22 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "var(--surface)",
            border: "3px solid var(--surface)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            display: "grid", placeItems: "center",
            fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16,
            color: "var(--accent)",
            marginBottom: 10,
          }}>
            {initials}
          </div>

          <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: "var(--text)", margin: "0 0 2px" }}>
            {candidateName || candidateEmail}
          </p>
          {candidateHeadline && (
            <p className="body-s" style={{ color: "var(--text-muted)", margin: "0 0 10px" }}>{candidateHeadline}</p>
          )}

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: (candidateSkills ?? []).length > 0 ? 8 : 0 }}>
            {candidateCity && (
              <span className="tag" style={{ fontSize: 11 }}>{candidateCity}</span>
            )}
            {candidateExperienceLevel && (
              <span className="tag tag-outline" style={{ fontSize: 11 }}>{candidateExperienceLevel}</span>
            )}
          </div>

          {(candidateSkills ?? []).length > 0 && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {(candidateSkills ?? []).slice(0, 5).map(s => (
                <span key={s} className="tag" style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>{s}</span>
              ))}
              {(candidateSkills ?? []).length > 5 && (
                <span className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 10 }}>
                  +{(candidateSkills ?? []).length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CV selector */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--bg-alt)", display: "flex", alignItems: "center", gap: 8 }}>
          <FileText size={13} style={{ color: "var(--accent)" }} />
          <span className="body-s" style={{ fontWeight: 600, color: "var(--text)" }}>CV / Résumé</span>
        </div>

        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Toggle */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button
              type="button"
              onClick={() => setCvSource("saved")}
              style={{
                padding: "8px 12px", borderRadius: 7, border: `1.5px solid ${cvSource === "saved" ? "var(--accent)" : "var(--border)"}`,
                background: cvSource === "saved" ? "var(--accent-soft)" : "var(--surface)",
                cursor: "pointer", fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 500,
                color: cvSource === "saved" ? "var(--accent)" : "var(--text-muted)",
                transition: "all 120ms",
              }}
            >
              Use profile CV
            </button>
            <button
              type="button"
              onClick={() => { setCvSource("upload"); fileInputRef.current?.click(); }}
              style={{
                padding: "8px 12px", borderRadius: 7, border: `1.5px solid ${cvSource === "upload" ? "var(--accent)" : "var(--border)"}`,
                background: cvSource === "upload" ? "var(--accent-soft)" : "var(--surface)",
                cursor: "pointer", fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 500,
                color: cvSource === "upload" ? "var(--accent)" : "var(--text-muted)",
                transition: "all 120ms",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Upload size={11} /> Upload different
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {/* Status line */}
          {cvSource === "saved" && (
            cvUrl ? (
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", flexShrink: 0 }} />
                <a href={cvUrl} target="_blank" rel="noopener noreferrer"
                  className="body-s" style={{ color: "var(--accent)", textDecoration: "underline" }}>
                  Profile CV attached · View
                </a>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--warning)", flexShrink: 0 }} />
                <span className="body-s" style={{ color: "var(--text-muted)" }}>
                  No CV on file —{" "}
                  <Link href="/candidates/dashboard" style={{ color: "var(--accent)" }}>upload in your profile</Link>
                </span>
              </div>
            )
          )}

          {cvSource === "upload" && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {uploading ? (
                <><Loader2 size={12} style={{ animation: "spin 1s linear infinite", color: "var(--accent)" }} />
                <span className="body-s" style={{ color: "var(--text-muted)" }}>Uploading…</span></>
              ) : uploadedCvUrl ? (
                <>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", flexShrink: 0 }} />
                  <a href={uploadedCvUrl} target="_blank" rel="noopener noreferrer"
                    className="body-s" style={{ color: "var(--accent)", textDecoration: "underline" }}>
                    New CV attached · View
                  </a>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="body-s"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 0, marginLeft: 4 }}
                  >
                    Change
                  </button>
                </>
              ) : (
                <>
                  <ChevronDown size={12} style={{ color: "var(--text-subtle)" }} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="body-s"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", padding: 0, textDecoration: "underline" }}
                  >
                    Choose PDF file…
                  </button>
                </>
              )}
            </div>
          )}

          {uploadError && (
            <p className="body-s" style={{ color: "var(--error)", margin: 0 }}>{uploadError}</p>
          )}
        </div>
      </div>

      {/* Cover letter — respects policy */}
      {coverLetterPolicy !== "NONE" && (
        <div>
          <label className="body-s" style={{ fontWeight: 500, color: "var(--text)", display: "block", marginBottom: 6 }}>
            Cover letter{" "}
            {coverLetterPolicy === "REQUIRED"
              ? <span style={{ color: "var(--accent)" }}>*</span>
              : <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>(optional)</span>
            }
          </label>
          <textarea
            className="textarea"
            rows={4}
            value={coverLetter}
            onChange={e => setCoverLetter(e.target.value)}
            placeholder={`Tell ${companyName} why you're a great fit…`}
            style={{ width: "100%", resize: "vertical" }}
          />
          {coverLetterPolicy === "REQUIRED" && (
            <p className="mono-s" style={{ color: "var(--text-subtle)", marginTop: 4 }}>
              THIS EMPLOYER REQUIRES A COVER LETTER
            </p>
          )}
        </div>
      )}

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--error)", background: "var(--error-bg)", borderRadius: 6, padding: "8px 12px" }}>
          <AlertCircle size={13} style={{ flexShrink: 0 }} />
          <span className="body-s">{error}</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleSubmit}
          disabled={submitting || uploading}
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
