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

  const [open,            setOpen]            = useState(false);
  const [coverLetter,     setCoverLetter]     = useState("");
  const [clMode,          setClMode]          = useState<"type" | "upload">("type");
  const [clFileUrl,       setClFileUrl]       = useState<string | null>(null);
  const [clFileName,      setClFileName]      = useState<string | null>(null);
  const [clUploading,     setClUploading]     = useState(false);
  const [clUploadError,   setClUploadError]   = useState<string | null>(null);
  const [cvSource,        setCvSource]        = useState<"saved" | "upload">("saved");
  const [uploadedCvUrl,   setUploadedCvUrl]   = useState<string | null>(null);
  const [cvUploading,     setCvUploading]     = useState(false);
  const [cvUploadError,   setCvUploadError]   = useState<string | null>(null);
  const [submitting,      setSubmitting]      = useState(false);
  const [submitted,       setSubmitted]       = useState(false);
  const [error,           setError]           = useState<string | null>(null);

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
      if (!res.ok) { setCvUploadError(data.error ?? "Upload failed."); }
      else          { setUploadedCvUrl(data.url); }
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
      else          { setClFileUrl(data.url); }
    } catch {
      setClUploadError("Network error.");
      setClFileName(null);
    }
    setClUploading(false);
  }

  const activeCvUrl = cvSource === "upload" ? uploadedCvUrl : (cvUrl ?? null);

  async function handleSubmit() {
    setError(null);
    const hasClText = coverLetter.trim().length > 0;
    const hasClFile = !!clFileUrl;
    const hasCl     = clMode === "type" ? hasClText : hasClFile;

    if (coverLetterPolicy === "REQUIRED" && !hasCl) {
      setError(clMode === "type"
        ? "A cover letter is required for this role."
        : "Please upload your cover letter PDF.");
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
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* ── Applying As card ── */}
      <div style={{
        background: "var(--bg-alt)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid var(--accent)",
        borderRadius: 10,
        padding: "14px 16px",
      }}>
        <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>APPLYING AS</p>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "var(--accent)", color: "var(--white)",
            display: "grid", placeItems: "center",
            fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14,
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "var(--text)", margin: "0 0 2px" }}>
              {candidateName || candidateEmail}
            </p>
            {candidateHeadline && (
              <p className="body-s" style={{ color: "var(--text-muted)", margin: "0 0 8px" }}>{candidateHeadline}</p>
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
        </div>
      </div>

      {/* ── CV / Résumé ── */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "9px 14px", borderBottom: "1px solid var(--border)", background: "var(--bg-alt)", display: "flex", alignItems: "center", gap: 8 }}>
          <FileText size={13} style={{ color: "var(--accent)" }} />
          <span className="body-s" style={{ fontWeight: 600, color: "var(--text)" }}>CV / Résumé</span>
        </div>
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button type="button" onClick={() => setCvSource("saved")}
              style={{ padding: "8px 10px", borderRadius: 7, border: `1.5px solid ${cvSource === "saved" ? "var(--accent)" : "var(--border)"}`, background: cvSource === "saved" ? "var(--accent-soft)" : "var(--surface)", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 500, color: cvSource === "saved" ? "var(--accent)" : "var(--text-muted)", transition: "all 120ms" }}>
              Use profile CV
            </button>
            <button type="button" onClick={() => { setCvSource("upload"); cvFileRef.current?.click(); }}
              style={{ padding: "8px 10px", borderRadius: 7, border: `1.5px solid ${cvSource === "upload" ? "var(--accent)" : "var(--border)"}`, background: cvSource === "upload" ? "var(--accent-soft)" : "var(--surface)", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 500, color: cvSource === "upload" ? "var(--accent)" : "var(--text-muted)", transition: "all 120ms", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Upload size={11} /> Upload different
            </button>
          </div>
          <input ref={cvFileRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleCvFileChange} />

          {cvSource === "saved" ? (
            cvUrl ? (
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", flexShrink: 0 }} />
                <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="body-s" style={{ color: "var(--accent)", textDecoration: "underline" }}>
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
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {cvUploading ? (
                <><Loader2 size={12} style={{ animation: "spin 1s linear infinite", color: "var(--accent)" }} /><span className="body-s" style={{ color: "var(--text-muted)" }}>Uploading…</span></>
              ) : uploadedCvUrl ? (
                <>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", flexShrink: 0 }} />
                  <a href={uploadedCvUrl} target="_blank" rel="noopener noreferrer" className="body-s" style={{ color: "var(--accent)", textDecoration: "underline" }}>
                    New CV attached · View
                  </a>
                  <button type="button" onClick={() => cvFileRef.current?.click()} className="body-s" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 0, marginLeft: 4 }}>Change</button>
                </>
              ) : (
                <button type="button" onClick={() => cvFileRef.current?.click()} className="body-s" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", padding: 0, textDecoration: "underline" }}>
                  Choose PDF…
                </button>
              )}
            </div>
          )}
          {cvUploadError && <p className="body-s" style={{ color: "var(--error)", margin: 0 }}>{cvUploadError}</p>}
        </div>
      </div>

      {/* ── Cover letter ── */}
      {coverLetterPolicy !== "NONE" && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "9px 14px", borderBottom: "1px solid var(--border)", background: "var(--bg-alt)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="body-s" style={{ fontWeight: 600, color: "var(--text)" }}>
              Cover letter{" "}
              {coverLetterPolicy === "REQUIRED"
                ? <span style={{ color: "var(--accent)" }}>*</span>
                : <span style={{ color: "var(--text-subtle)", fontWeight: 400, fontSize: 11 }}>(optional)</span>
              }
            </span>
            {/* type / upload toggle */}
            <div style={{ display: "flex", gap: 4 }}>
              {(["type", "upload"] as const).map(m => (
                <button key={m} type="button" onClick={() => setClMode(m)}
                  style={{ padding: "3px 10px", borderRadius: 5, fontSize: 11, fontFamily: "var(--font-sans)", fontWeight: 500, cursor: "pointer", border: `1.5px solid ${clMode === m ? "var(--accent)" : "var(--border)"}`, background: clMode === m ? "var(--accent-soft)" : "transparent", color: clMode === m ? "var(--accent)" : "var(--text-subtle)", transition: "all 100ms" }}>
                  {m === "type" ? "Type" : "Upload PDF"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: "12px 14px" }}>
            {clMode === "type" ? (
              <textarea
                className="textarea"
                rows={4}
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                placeholder={`Tell ${companyName} why you're a great fit…`}
                style={{ width: "100%", resize: "vertical", margin: 0 }}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input ref={clFileRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleClFileChange} />
                {clUploading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0" }}>
                    <Loader2 size={13} style={{ animation: "spin 1s linear infinite", color: "var(--accent)" }} />
                    <span className="body-s" style={{ color: "var(--text-muted)" }}>Uploading cover letter…</span>
                  </div>
                ) : clFileUrl ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--bg-alt)", borderRadius: 7, border: "1px solid var(--border)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", flexShrink: 0 }} />
                    <a href={clFileUrl} target="_blank" rel="noopener noreferrer" className="body-s" style={{ color: "var(--accent)", textDecoration: "underline", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {clFileName ?? "Cover letter attached"}
                    </a>
                    <button type="button" onClick={() => clFileRef.current?.click()} className="body-s" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 0, flexShrink: 0 }}>
                      Change
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => clFileRef.current?.click()}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 7, border: "1.5px dashed var(--border)", background: "var(--bg-alt)", cursor: "pointer", width: "100%", justifyContent: "center", color: "var(--text-muted)", transition: "border-color 120ms" }}>
                    <Upload size={13} style={{ color: "var(--accent)" }} />
                    <span className="body-s">Upload cover letter PDF</span>
                  </button>
                )}
                {clUploadError && <p className="body-s" style={{ color: "var(--error)", margin: 0 }}>{clUploadError}</p>}
              </div>
            )}
            {coverLetterPolicy === "REQUIRED" && (
              <p className="mono-s" style={{ color: "var(--text-subtle)", marginTop: 6 }}>
                THIS EMPLOYER REQUIRES A COVER LETTER
              </p>
            )}
          </div>
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
          disabled={submitting || cvUploading || clUploading}
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
