"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, FileText, AlertCircle, Upload } from "lucide-react";

interface Props {
  jobId: string;
  applyType: string;
  applyUrl?: string;
  applyEmail?: string;
  companyName: string;
  coverLetterPolicy?: "REQUIRED" | "OPTIONAL" | "NONE";
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
  const [clMode,        setClMode]        = useState<"type" | "upload">("type");
  const [clFileUrl,     setClFileUrl]     = useState<string | null>(null);
  const [clFileName,    setClFileName]    = useState<string | null>(null);
  const [clUploading,   setClUploading]   = useState(false);
  const [clUploadError, setClUploadError] = useState<string | null>(null);
  const [cvSource,      setCvSource]      = useState<"saved" | "upload">("saved");
  const [uploadedCvUrl, setUploadedCvUrl] = useState<string | null>(null);
  const [cvUploading,   setCvUploading]   = useState(false);
  const [cvUploadError, setCvUploadError] = useState<string | null>(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [submitted,     setSubmitted]     = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  const cvFileRef = useRef<HTMLInputElement>(null);
  const clFileRef = useRef<HTMLInputElement>(null);

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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "20px 0" }}>
        <CheckCircle2 size={32} style={{ color: "var(--success)" }} />
        <div style={{ textAlign: "center" }}>
          <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", margin: "0 0 6px" }}>
            Application submitted!
          </p>
          <p className="body-s" style={{ color: "var(--text-muted)", margin: 0 }}>
            {companyName} will review your profile and get back to you.
          </p>
        </div>
      </div>
    );
  }

  async function handleCvFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvUploadError(null);
    setCvUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res  = await fetch("/api/candidates/cv-upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) setCvUploadError(data.error ?? "Upload failed.");
      else         setUploadedCvUrl(data.url);
    } catch {
      setCvUploadError("Network error.");
    }
    setCvUploading(false);
  }

  async function handleClFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setClUploadError(null);
    setClUploading(true);
    setClFileName(file.name);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res  = await fetch("/api/candidates/cover-letter-upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setClUploadError(data.error ?? "Upload failed."); setClFileName(null); }
      else          setClFileUrl(data.url);
    } catch {
      setClUploadError("Network error.");
      setClFileName(null);
    }
    setClUploading(false);
  }

  const activeCvUrl = cvSource === "upload" ? uploadedCvUrl : (cvUrl ?? null);

  async function handleSubmit() {
    setError(null);
    const hasCl = clMode === "type" ? coverLetter.trim().length > 0 : !!clFileUrl;
    if (coverLetterPolicy === "REQUIRED" && !hasCl) {
      setError(clMode === "type" ? "A cover letter is required for this role." : "Please upload your cover letter PDF.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/candidates/applications", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          coverLetter:    clMode === "type"   ? (coverLetter.trim() || null) : null,
          coverLetterUrl: clMode === "upload" ? (clFileUrl || null)          : null,
          cvUrl:          activeCvUrl ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong. Please try again."); setSubmitting(false); return; }
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
        <button onClick={() => setOpen(true)} className="btn btn-accent btn-lg" style={{ width: "100%", justifyContent: "center" }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Applying As ── */}
      <div style={{
        background: "var(--bg-alt)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid var(--accent)",
        borderRadius: 10,
        padding: 20,
      }}>
        <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 16, letterSpacing: "0.08em" }}>
          APPLYING AS
        </p>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          {/* Avatar */}
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "var(--accent)", color: "var(--white)",
            display: "grid", placeItems: "center",
            fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16,
            flexShrink: 0,
          }}>
            {initials}
          </div>
          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: "var(--text)", margin: "0 0 3px" }}>
              {candidateName || candidateEmail}
            </p>
            {candidateHeadline && (
              <p className="body-s" style={{ color: "var(--text-muted)", margin: "0 0 10px" }}>{candidateHeadline}</p>
            )}
            {(candidateCity || candidateExperienceLevel) && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: (candidateSkills ?? []).length > 0 ? 10 : 0 }}>
                {candidateCity && <span className="tag" style={{ fontSize: 11 }}>{candidateCity}</span>}
                {candidateExperienceLevel && <span className="tag tag-outline" style={{ fontSize: 11 }}>{candidateExperienceLevel}</span>}
              </div>
            )}
            {(candidateSkills ?? []).length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
      </div>

      {/* ── CV / Résumé ── */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        {/* Section header */}
        <div style={{
          padding: "12px 18px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-alt)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <FileText size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
          <span className="body-s" style={{ fontWeight: 600, color: "var(--text)" }}>CV / Résumé</span>
        </div>

        {/* Section body */}
        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Source toggle */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button
              type="button"
              onClick={() => setCvSource("saved")}
              style={{
                padding: "11px 14px", borderRadius: 8,
                border: `1.5px solid ${cvSource === "saved" ? "var(--accent)" : "var(--border)"}`,
                background: cvSource === "saved" ? "var(--accent-soft)" : "var(--surface)",
                cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 13,
                color: cvSource === "saved" ? "var(--accent)" : "var(--text-muted)",
                transition: "all 120ms",
              }}
            >
              Use profile CV
            </button>
            <button
              type="button"
              onClick={() => { setCvSource("upload"); cvFileRef.current?.click(); }}
              style={{
                padding: "11px 14px", borderRadius: 8,
                border: `1.5px solid ${cvSource === "upload" ? "var(--accent)" : "var(--border)"}`,
                background: cvSource === "upload" ? "var(--accent-soft)" : "var(--surface)",
                cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 13,
                color: cvSource === "upload" ? "var(--accent)" : "var(--text-muted)",
                transition: "all 120ms",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              }}
            >
              <Upload size={12} /> Upload different
            </button>
          </div>

          <input ref={cvFileRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleCvFileChange} />

          {/* Status */}
          {cvSource === "saved" ? (
            cvUrl ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success)", flexShrink: 0 }} />
                <a href={cvUrl} target="_blank" rel="noopener noreferrer"
                  className="body-s" style={{ color: "var(--accent)", textDecoration: "underline" }}>
                  Profile CV attached · View
                </a>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--warning)", flexShrink: 0 }} />
                <span className="body-s" style={{ color: "var(--text-muted)" }}>
                  No CV on file —{" "}
                  <Link href="/candidates/dashboard" style={{ color: "var(--accent)" }}>upload in your profile</Link>
                </span>
              </div>
            )
          ) : cvUploading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Loader2 size={13} style={{ animation: "spin 1s linear infinite", color: "var(--accent)" }} />
              <span className="body-s" style={{ color: "var(--text-muted)" }}>Uploading…</span>
            </div>
          ) : uploadedCvUrl ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success)", flexShrink: 0 }} />
              <a href={uploadedCvUrl} target="_blank" rel="noopener noreferrer"
                className="body-s" style={{ color: "var(--accent)", textDecoration: "underline" }}>
                New CV attached · View
              </a>
              <button type="button" onClick={() => cvFileRef.current?.click()}
                className="body-s" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 0, marginLeft: 2 }}>
                Change
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => cvFileRef.current?.click()}
              className="body-s" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", padding: 0, textDecoration: "underline", textAlign: "left" }}>
              Choose PDF…
            </button>
          )}

          {cvUploadError && (
            <p className="body-s" style={{ color: "var(--error)", margin: 0 }}>{cvUploadError}</p>
          )}
        </div>
      </div>

      {/* ── Cover letter ── */}
      {coverLetterPolicy !== "NONE" && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          {/* Header — label only, no crammed toggle */}
          <div style={{
            padding: "12px 18px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-alt)",
          }}>
            <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", margin: "0 0 2px" }}>
              Cover letter{" "}
              {coverLetterPolicy === "REQUIRED"
                ? <span style={{ color: "var(--accent)" }}>*</span>
                : <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>(optional)</span>
              }
            </p>
            {coverLetterPolicy === "REQUIRED" && (
              <p className="mono-s" style={{ color: "var(--text-subtle)", margin: 0 }}>
                THIS EMPLOYER REQUIRES A COVER LETTER
              </p>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Mode toggle — full-width, not crammed */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {(["type", "upload"] as const).map(m => (
                <button
                  key={m} type="button"
                  onClick={() => setClMode(m)}
                  style={{
                    padding: "10px 14px", borderRadius: 8,
                    border: `1.5px solid ${clMode === m ? "var(--accent)" : "var(--border)"}`,
                    background: clMode === m ? "var(--accent-soft)" : "var(--surface)",
                    cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 13,
                    color: clMode === m ? "var(--accent)" : "var(--text-muted)",
                    transition: "all 120ms",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: m === "upload" ? 7 : 0,
                  }}
                >
                  {m === "upload" && <Upload size={12} />}
                  {m === "type" ? "Type it" : "Upload PDF"}
                </button>
              ))}
            </div>

            {/* Content */}
            {clMode === "type" ? (
              <textarea
                className="textarea"
                rows={5}
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                placeholder={`Tell ${companyName} why you're a great fit…`}
                style={{ width: "100%", resize: "vertical", margin: 0, minHeight: 120 }}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input ref={clFileRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleClFileChange} />
                {clUploading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 0" }}>
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite", color: "var(--accent)" }} />
                    <span className="body-s" style={{ color: "var(--text-muted)" }}>Uploading cover letter…</span>
                  </div>
                ) : clFileUrl ? (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 14px", background: "var(--bg-alt)",
                    borderRadius: 8, border: "1px solid var(--border)",
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success)", flexShrink: 0 }} />
                    <a href={clFileUrl} target="_blank" rel="noopener noreferrer"
                      className="body-s" style={{ color: "var(--accent)", textDecoration: "underline", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {clFileName ?? "Cover letter attached"}
                    </a>
                    <button type="button" onClick={() => clFileRef.current?.click()}
                      className="body-s" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 0, flexShrink: 0 }}>
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => clFileRef.current?.click()}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      padding: "18px 14px", borderRadius: 8,
                      border: "1.5px dashed var(--border)",
                      background: "var(--bg-alt)",
                      cursor: "pointer", width: "100%",
                      transition: "border-color 120ms",
                    }}
                  >
                    <Upload size={15} style={{ color: "var(--accent)" }} />
                    <span className="body-s" style={{ color: "var(--text-muted)" }}>
                      Upload cover letter PDF
                    </span>
                  </button>
                )}
                {clUploadError && (
                  <p className="body-s" style={{ color: "var(--error)", margin: 0 }}>{clUploadError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "var(--error)", background: "var(--error-bg)", borderRadius: 8, padding: "12px 14px" }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span className="body-s">{error}</span>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={handleSubmit}
          disabled={submitting || cvUploading || clUploading}
          className="btn btn-accent btn-lg"
          style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 8 }}
        >
          {submitting
            ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Submitting…</>
            : "Submit application →"
          }
        </button>
        <button
          onClick={() => setOpen(false)}
          className="btn btn-ghost btn-lg"
          style={{ width: "100%", justifyContent: "center" }}
        >
          Cancel
        </button>
      </div>

    </div>
  );
}
