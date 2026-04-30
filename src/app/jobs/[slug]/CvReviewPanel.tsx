"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText, CheckCircle, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { ProfileRing } from "@/components/onboarding/ProfileRing";

interface ReviewResult {
  score: number;
  headline: string;
  strengths: string[];
  improvements: string[];
  encouragement: string;
}

interface Props {
  jobSlug: string;
  jobTitle: string;
  savedCvUrl?: string | null;
}

export function CvReviewPanel({ jobSlug, jobTitle, savedCvUrl }: Props) {
  const [open, setOpen]           = useState(false);
  const [file, setFile]           = useState<File | null>(null);
  const [dragging, setDragging]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [result, setResult]       = useState<ReviewResult | null>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
  }

  function close() {
    setOpen(false);
    reset();
  }

  function pickFile(f: File) {
    if (f.size > 5 * 1024 * 1024) {
      setError("File too large — max 5 MB.");
      return;
    }
    if (f.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    setError(null);
    setFile(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  }

  async function analyse() {
    if (!file) return;
    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("jobSlug", jobSlug);

    try {
      const res = await fetch("/api/cv-review", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setResult(data as ReviewResult);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-outline"
        style={{ width: "100%", justifyContent: "center", gap: 8 }}
      >
        <FileText size={15} />
        Review my CV for this role
      </button>

      {/* Overlay */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          {/* Backdrop */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }} onClick={close} />

          {/* Panel */}
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
            {/* Panel header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--surface)", zIndex: 1 }}>
              <div>
                <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 4 }}>CV Review</p>
                <h2 className="h3">{jobTitle}</h2>
              </div>
              <button type="button" onClick={close} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, padding: "24px" }}>
              {!result ? (
                <>
                  <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 24 }}>
                    Upload your CV and we'll score it against this job's requirements, highlight your strengths, and suggest improvements.
                  </p>

                  {/* Saved CV shortcut */}
                  {savedCvUrl && !file && (
                    <div style={{ background: "var(--accent-soft)", border: "1px solid var(--pink-200)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                      <p className="body-s" style={{ fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>You have a saved CV</p>
                      <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 10 }}>
                        Your profile has a CV on file. You can use that or upload a different version below.
                      </p>
                      <a href={savedCvUrl.startsWith("http") ? savedCvUrl : `https://${savedCvUrl}`}
                        target="_blank" rel="noopener noreferrer"
                        className="btn btn-accent btn-sm" style={{ textDecoration: "none" }}>
                        Open saved CV <ArrowRight size={12} />
                      </a>
                    </div>
                  )}

                  {/* Drop zone */}
                  {!file ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={onDrop}
                      onClick={() => inputRef.current?.click()}
                      style={{
                        border: `2px dashed ${dragging ? "var(--accent)" : "var(--border-strong)"}`,
                        borderRadius: 12,
                        background: dragging ? "var(--accent-soft)" : "var(--bg-muted)",
                        padding: "40px 24px",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 150ms ease",
                        marginBottom: 16,
                      }}
                    >
                      <Upload size={28} style={{ color: dragging ? "var(--accent)" : "var(--text-subtle)", margin: "0 auto 12px" }} />
                      <p className="body-s" style={{ color: "var(--text)", fontWeight: 600, marginBottom: 4 }}>
                        Drop your CV here or click to browse
                      </p>
                      <p className="mono-s" style={{ color: "var(--text-subtle)" }}>PDF only · max 5 MB</p>
                      <input ref={inputRef} type="file" accept="application/pdf" style={{ display: "none" }}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />
                    </div>
                  ) : (
                    <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 16, background: "var(--surface)" }}>
                      <FileText size={20} style={{ color: "var(--accent)", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                        <p className="mono-s" style={{ color: "var(--text-subtle)" }}>{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button type="button" onClick={reset} className="btn btn-ghost btn-icon btn-sm">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="alert alert-error" style={{ borderRadius: 8, marginBottom: 16 }}>
                      <span className="body-s">{error}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={analyse}
                    disabled={!file || loading}
                    className="btn btn-accent btn-lg"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {loading
                      ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Analysing your CV…</>
                      : <>Analyse my CV <ArrowRight size={15} /></>}
                  </button>

                  {loading && (
                    <p className="body-s" style={{ color: "var(--text-subtle)", textAlign: "center", marginTop: 12 }}>
                      This takes 10–20 seconds — hang tight.
                    </p>
                  )}
                </>
              ) : (
                <Results result={result} onReset={reset} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Results ─────────────────────────────────────────────────────────────────

function Results({ result, onReset }: { result: ReviewResult; onReset: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Score + headline */}
      <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <ProfileRing score={result.score} size={96} strokeWidth={7} />
        </div>
        <p className="h3" style={{ marginBottom: 8 }}>{result.headline}</p>
      </div>

      {/* Strengths */}
      <div style={{ background: "var(--success-bg)", border: "1px solid #86efac", borderRadius: 12, padding: "16px 18px" }}>
        <p className="caption" style={{ color: "#15803d", marginBottom: 12 }}>What's working in your favour</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {result.strengths.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <CheckCircle size={15} style={{ color: "#16a34a", flexShrink: 0, marginTop: 1 }} />
              <p className="body-s" style={{ color: "#166534", margin: 0, lineHeight: 1.6 }}>{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Improvements */}
      <div style={{ background: "var(--warning-bg)", border: "1px solid #fcd34d", borderRadius: 12, padding: "16px 18px" }}>
        <p className="caption" style={{ color: "#b45309", marginBottom: 12 }}>Quick wins to boost your match</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {result.improvements.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <AlertCircle size={15} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
              <p className="body-s" style={{ color: "#92400e", margin: 0, lineHeight: 1.6 }}>{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Encouragement */}
      <div style={{ background: "var(--accent-soft)", border: "1px solid var(--pink-200)", borderRadius: 12, padding: "16px 18px" }}>
        <p className="body-s" style={{ color: "var(--accent)", margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>
          "{result.encouragement}"
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button type="button" onClick={onReset} className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>
          Upload a different CV
        </button>
      </div>
    </div>
  );
}
