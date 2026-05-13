"use client";

import { createPortal } from "react-dom";
import { useRef, useState } from "react";
import {
  Upload, X, FileText, CheckCircle, AlertCircle,
  ArrowRight, Sparkles, ChevronDown, ChevronUp,
} from "lucide-react";
import { ProfileRing } from "@/components/onboarding/ProfileRing";
import Link from "next/link";

interface Strength {
  title: string;
  detail: string;
}

interface Improvement {
  title: string;
  detail: string;
  tip: string;
}

interface ReviewResult {
  score: number;
  headline: string;
  strengths: Strength[];
  improvements: Improvement[];
  encouragement: string;
}

interface Props {
  jobSlug: string;
  jobTitle: string;
  isCandidate: boolean;
  savedCvUrl?: string | null;
}

function scoreLabel(score: number) {
  if (score >= 80) return { text: "Strong Match",   color: "#16a34a" };
  if (score >= 60) return { text: "Good Match",     color: "#2563eb" };
  if (score >= 40) return { text: "Partial Match",  color: "#d97706" };
  return             { text: "Needs Work",          color: "#dc2626" };
}

// ── Guest modal (same style as SaveJobButton) ─────────────────────────────────

function GuestModal({ onClose }: { onClose: () => void }) {
  return createPortal(
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.45)", display: "grid", placeItems: "center", padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", padding: "32px 28px", maxWidth: 380, width: "100%", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: 4, display: "grid", placeItems: "center" }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent-soft)", display: "grid", placeItems: "center", marginBottom: 16 }}>
          <FileText size={22} style={{ color: "var(--accent)" }} />
        </div>

        <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 8, lineHeight: 1.3 }}>
          See how your CV matches this role
        </h2>

        <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 6 }}>
          Create a free candidate account to get an instant AI-powered CV review for any job listing — score, strengths, and actionable tips.
        </p>

        <p className="body-s" style={{ color: "var(--accent)", fontWeight: 600, marginBottom: 24 }}>
          Candidates are always free — no credit card needed.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/get-started" className="btn btn-accent" style={{ justifyContent: "center", width: "100%" }} onClick={onClose}>
            Create free account
          </Link>
          <Link href="/login" className="btn btn-outline" style={{ justifyContent: "center", width: "100%" }} onClick={onClose}>
            Sign in
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function CvReviewPanel({ jobSlug, jobTitle, isCandidate, savedCvUrl }: Props) {
  const [open, setOpen]           = useState(false);
  const [showGuest, setShowGuest] = useState(false);
  const [file, setFile]           = useState<File | null>(null);
  const [showUpload, setShowUpload] = useState(!savedCvUrl);
  const [dragging, setDragging]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [result, setResult]       = useState<ReviewResult | null>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
    setShowUpload(!savedCvUrl);
  }

  function close() {
    setOpen(false);
    reset();
  }

  function handleTrigger() {
    if (!isCandidate) {
      setShowGuest(true);
    } else {
      setOpen(true);
    }
  }

  function pickFile(f: File) {
    if (f.size > 5 * 1024 * 1024) { setError("File too large — max 5 MB."); return; }
    if (f.type !== "application/pdf") { setError("Please upload a PDF file."); return; }
    setError(null);
    setFile(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  }

  async function analyse(cvUrl?: string) {
    setLoading(true);
    setError(null);
    try {
      let res: Response;
      if (cvUrl) {
        res = await fetch("/api/cv-review", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ jobSlug, cvUrl }),
        });
      } else {
        if (!file) return;
        const fd = new FormData();
        fd.append("file", file);
        fd.append("jobSlug", jobSlug);
        res = await fetch("/api/cv-review", { method: "POST", body: fd });
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else if (
        typeof data.score !== "number" ||
        !Array.isArray(data.strengths) ||
        !Array.isArray(data.improvements)
      ) {
        setError("Received an unexpected response. Please try again.");
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
      {showGuest && <GuestModal onClose={() => setShowGuest(false)} />}

      {/* Trigger button */}
      <button
        type="button"
        onClick={handleTrigger}
        className="btn btn-outline"
        style={{ width: "100%", justifyContent: "center", gap: 8 }}
      >
        <FileText size={15} />
        Review my CV for this role
      </button>

      {/* Slide-in panel — portal so it clears the sticky nav */}
      {open && createPortal(
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "flex-end" }}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          {/* Backdrop */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }} onClick={close} />

          {/* Panel */}
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: 500,
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
                <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 4 }}>AI CV Review</p>
                <h2 className="h3" style={{ maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{jobTitle}</h2>
              </div>
              <button type="button" onClick={close} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, padding: "24px" }}>
              {result ? (
                <Results result={result} onReset={reset} />
              ) : loading ? (
                <LoadingState />
              ) : (
                <SourcePicker
                  savedCvUrl={savedCvUrl}
                  showUpload={showUpload}
                  setShowUpload={setShowUpload}
                  file={file}
                  dragging={dragging}
                  setDragging={setDragging}
                  error={error}
                  inputRef={inputRef}
                  onDrop={onDrop}
                  pickFile={pickFile}
                  reset={reset}
                  analyse={analyse}
                />
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ── Source picker ─────────────────────────────────────────────────────────────

function SourcePicker({
  savedCvUrl, showUpload, setShowUpload,
  file, dragging, setDragging, error,
  inputRef, onDrop, pickFile, reset, analyse,
}: {
  savedCvUrl?: string | null;
  showUpload: boolean;
  setShowUpload: (v: boolean) => void;
  file: File | null;
  dragging: boolean;
  setDragging: (v: boolean) => void;
  error: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onDrop: (e: React.DragEvent) => void;
  pickFile: (f: File) => void;
  reset: () => void;
  analyse: (cvUrl?: string) => Promise<void>;
}) {
  return (
    <>
      <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.6 }}>
        We'll score your CV against this job's requirements and give you a detailed breakdown — strengths, gaps, and actionable tips.
      </p>

      {/* Saved CV option */}
      {savedCvUrl && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ background: "var(--accent-soft)", border: "1px solid var(--pink-200)", borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <FileText size={16} style={{ color: "#fff" }} />
              </div>
              <div>
                <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>Your saved CV</p>
                <p className="mono-s" style={{ color: "var(--text-subtle)" }}>From your candidate profile</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => analyse(savedCvUrl)}
              className="btn btn-accent"
              style={{ width: "100%", justifyContent: "center", gap: 8 }}
            >
              <Sparkles size={14} /> Analyse my saved CV
            </button>
          </div>

          {/* Toggle upload */}
          <button
            type="button"
            onClick={() => setShowUpload(!showUpload)}
            className="btn btn-ghost btn-sm"
            style={{ width: "100%", justifyContent: "center", gap: 6, color: "var(--text-muted)" }}
          >
            {showUpload ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showUpload ? "Hide upload" : "Upload a different version"}
          </button>
        </div>
      )}

      {/* Upload zone */}
      {showUpload && (
        <>
          {!savedCvUrl && (
            <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
              Upload your CV below to get started.
            </p>
          )}

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
                padding: "36px 24px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 150ms ease",
                marginBottom: 16,
              }}
            >
              <Upload size={28} style={{ color: dragging ? "var(--accent)" : "var(--text-subtle)", margin: "0 auto 12px" }} />
              <p className="body-s" style={{ color: "var(--text)", fontWeight: 600, marginBottom: 4 }}>Drop your CV here or click to browse</p>
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
              <button type="button" onClick={reset} className="btn btn-ghost btn-icon btn-sm"><X size={14} /></button>
            </div>
          )}

          {error && (
            <div className="alert alert-error" style={{ borderRadius: 8, marginBottom: 16 }}>
              <span className="body-s">{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => analyse()}
            disabled={!file}
            className="btn btn-accent btn-lg"
            style={{ width: "100%", justifyContent: "center", gap: 8 }}
          >
            Analyse this CV <ArrowRight size={15} />
          </button>
        </>
      )}
    </>
  );
}

// ── Loading state ─────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 20, textAlign: "center" }}>
      {/* Animated brand logo — cloud bounces, star rotates */}
      <svg
        className="cv-logo-bounce"
        viewBox="0 0 628 576"
        width="72"
        height="66"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M234.178 81.8274C258.724 80.0262 283.352 84.0763 306.031 93.6387C354.289 114.076 376.911 148.774 395.717 194.74C427.171 196.938 456.134 207.959 481.685 229.363C548.67 285.475 573.597 455.969 516.642 524.313C481.668 566.276 378.055 570.73 322.872 574.333C240.4 577.345 67.8426 585.082 19.4964 502.064C-5.19045 459.673 -3.93004 390.244 9.41989 343.66C21.3852 301.91 39.1243 279.682 76.4278 258.847C92.2975 168.801 137.32 95.4874 234.178 81.8274Z" fill="#0A0A0A" />
        <path d="M286.845 278.152C256.611 278.152 247.806 312.32 247.805 354.471C247.805 396.623 256.611 430.796 286.845 430.796C317.079 430.794 325.881 396.622 325.881 354.471C325.88 312.321 317.079 278.154 286.845 278.152Z" fill="white" />
        <path d="M422.629 278.152C392.394 278.152 383.59 312.32 383.589 354.471C383.589 396.623 392.394 430.796 422.629 430.796C452.863 430.794 461.665 396.622 461.665 354.471C461.664 312.321 452.863 278.154 422.629 278.152Z" fill="white" />
        <path className="cv-star-rotate" d="M544.097 4.72659C546.156 -1.57553 555.154 -1.57553 557.213 4.72659L573.818 55.5565C574.491 57.6168 576.11 59.2388 578.182 59.928L623.301 74.9354C629.566 77.0196 629.566 85.8011 623.301 87.8852L578.182 102.893C576.11 103.582 574.491 105.204 573.818 107.264L557.213 158.094C555.154 164.396 546.156 164.396 544.097 158.094L527.475 107.213C526.811 105.182 525.227 103.574 523.192 102.87L479.861 87.8576C473.704 85.7244 473.704 77.0962 479.861 74.9631L523.192 59.9511C525.227 59.2462 526.811 57.639 527.475 55.6072L544.097 4.72659Z" fill="#FD3F73" />
      </svg>
      <div>
        <p className="h3" style={{ marginBottom: 8 }}>Analysing your CV…</p>
        <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
          Our AI is comparing your experience against the role requirements.<br />
          This takes 15–30 seconds.
        </p>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {["Scanning CV", "Matching skills", "Generating tips"].map((step, i) => (
          <span key={i} className="tag tag-outline mono-s" style={{ fontSize: 11 }}>{step}</span>
        ))}
      </div>
    </div>
  );
}

// ── Results ───────────────────────────────────────────────────────────────────

function ImprovementRow({ item }: { item: Improvement }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #fde68a", paddingBottom: 12, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
        <AlertCircle size={15} style={{ color: "#d97706", flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <p className="body-s" style={{ fontWeight: 700, color: "#92400e", marginBottom: 4 }}>{item.title}</p>
          <p className="body-s" style={{ color: "#92400e", margin: 0, lineHeight: 1.6 }}>{item.detail}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{ marginLeft: 25, background: "none", border: "1px solid #fcd34d", borderRadius: 6, padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: "#b45309", fontSize: 12, fontFamily: "var(--font-mono)" }}
      >
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {open ? "Hide tip" : "How to fix this"}
      </button>
      {open && (
        <div style={{ marginLeft: 25, marginTop: 10, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "12px 14px" }}>
          <p className="body-s" style={{ color: "#78350f", margin: 0, lineHeight: 1.7 }}>
            💡 {item.tip || "Review this section and add specific examples, measurable results, or relevant technologies to strengthen your application."}
          </p>
        </div>
      )}
    </div>
  );
}

function Results({ result, onReset }: { result: ReviewResult; onReset: () => void }) {
  const label = scoreLabel(result.score);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Score */}
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <ProfileRing score={result.score} size={100} strokeWidth={7} />
        </div>
        <p className="mono-s" style={{ color: label.color, fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
          {label.text} · {result.score}% Match
        </p>
        <p className="h3" style={{ lineHeight: 1.4 }}>{result.headline}</p>
      </div>

      {/* Strengths */}
      <div style={{ background: "var(--success-bg)", border: "1px solid #86efac", borderRadius: 12, padding: "16px 18px" }}>
        <p className="caption" style={{ color: "#15803d", marginBottom: 14 }}>What's working in your favour</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {result.strengths.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <CheckCircle size={15} style={{ color: "#16a34a", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="body-s" style={{ fontWeight: 700, color: "#166534", marginBottom: 3 }}>{s.title}</p>
                <p className="body-s" style={{ color: "#166534", margin: 0, lineHeight: 1.6 }}>{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvements */}
      <div style={{ background: "var(--warning-bg)", border: "1px solid #fcd34d", borderRadius: 12, padding: "16px 18px" }}>
        <p className="caption" style={{ color: "#b45309", marginBottom: 14 }}>Areas to strengthen</p>
        {result.improvements.map((item, i) => (
          <ImprovementRow key={i} item={item} />
        ))}
      </div>

      {/* Encouragement */}
      <div style={{ background: "var(--accent-soft)", border: "1px solid var(--pink-200)", borderRadius: 12, padding: "16px 18px" }}>
        <p className="body-s" style={{ color: "var(--accent)", margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>
          "{result.encouragement}"
        </p>
      </div>

      {/* Action */}
      <button type="button" onClick={onReset} className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>
        Try with a different CV
      </button>
    </div>
  );
}
