"use client";

import { useState } from "react";
import { X, CheckCircle2, Loader2, ArrowRight, Send, FileText, Link2 } from "lucide-react";
import Link from "next/link";

interface Props {
  jobId: string;
  jobSlug: string;
  jobTitle: string;
  candidateId?: string | null;
  candidateName?: string | null;
  candidateHeadline?: string | null;
  candidateCvUrl?: string | null;
  candidateLinkedinUrl?: string | null;
  candidatePortfolioUrl?: string | null;
  hasApplied: boolean;
}

export function ApplyPanel({
  jobId,
  jobSlug,
  jobTitle,
  candidateId,
  candidateName,
  candidateHeadline,
  candidateCvUrl,
  candidateLinkedinUrl,
  candidatePortfolioUrl,
  hasApplied: initialHasApplied,
}: Props) {
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [applied, setApplied] = useState(initialHasApplied);

  // Form state
  const [cvChoice, setCvChoice]         = useState<"profile" | "custom">(candidateCvUrl ? "profile" : "custom");
  const [customCvUrl, setCustomCvUrl]   = useState("");
  const [availability, setAvailability] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [rightToWork, setRightToWork]   = useState("");
  const [linkedinUrl, setLinkedinUrl]   = useState(candidateLinkedinUrl ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(candidatePortfolioUrl ?? "");
  const [coverLetter, setCoverLetter]   = useState("");

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
        body: JSON.stringify({
          jobId,
          coverLetter:    coverLetter.trim() || null,
          cvUrl:          cvChoice === "custom" ? customCvUrl.trim() || null : null,
          availability:   availability || null,
          noticePeriod:   noticePeriod || null,
          expectedSalary: expectedSalary ? parseInt(expectedSalary, 10) : null,
          rightToWork:    rightToWork || null,
          linkedinUrl:    linkedinUrl.trim() || null,
          portfolioUrl:   portfolioUrl.trim() || null,
        }),
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
        Apply on CyprusTech.Careers <ArrowRight size={15} />
      </button>

      {/* Panel overlay */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }} onClick={close} />

          <div className="slide-panel">
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

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>

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
              </div>

              {/* CV */}
              <Section label="Your CV" required>
                {candidateCvUrl ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={radioCardStyle(cvChoice === "profile")} onClick={() => setCvChoice("profile")}>
                      <RadioDot selected={cvChoice === "profile"} />
                      <div>
                        <p className="body-s" style={{ fontWeight: 600, color: "var(--text)" }}>Use my saved CV</p>
                        <p className="mono-s" style={{ color: "var(--text-subtle)", wordBreak: "break-all" }}>
                          {candidateCvUrl.replace(/^https?:\/\//, "").slice(0, 60)}
                          {candidateCvUrl.length > 60 ? "…" : ""}
                        </p>
                      </div>
                    </label>
                    <label style={radioCardStyle(cvChoice === "custom")} onClick={() => setCvChoice("custom")}>
                      <RadioDot selected={cvChoice === "custom"} />
                      <div style={{ flex: 1 }}>
                        <p className="body-s" style={{ fontWeight: 600, color: "var(--text)" }}>Use a different CV</p>
                        {cvChoice === "custom" && (
                          <input
                            className="input"
                            type="url"
                            placeholder="https://drive.google.com/…"
                            value={customCvUrl}
                            onChange={(e) => setCustomCvUrl(e.target.value)}
                            style={{ marginTop: 8 }}
                          />
                        )}
                      </div>
                    </label>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input
                      className="input"
                      type="url"
                      placeholder="https://drive.google.com/…"
                      value={customCvUrl}
                      onChange={(e) => setCustomCvUrl(e.target.value)}
                    />
                    <p className="mono-s" style={{ color: "var(--text-subtle)" }}>
                      No saved CV.{" "}
                      <Link href="/candidates/dashboard" style={{ color: "var(--accent)" }}>
                        Upload one in your dashboard →
                      </Link>
                    </p>
                  </div>
                )}
              </Section>

              {/* Availability & notice */}
              <Section label="Availability">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <p className="mono-s" style={{ color: "var(--text-subtle)", marginBottom: 6 }}>START DATE</p>
                    <select className="select" value={availability} onChange={(e) => setAvailability(e.target.value)}>
                      <option value="">Select…</option>
                      <option value="IMMEDIATELY">Immediately</option>
                      <option value="2_WEEKS">2 weeks</option>
                      <option value="1_MONTH">1 month</option>
                      <option value="3_MONTHS_PLUS">3 months+</option>
                    </select>
                  </div>
                  <div>
                    <p className="mono-s" style={{ color: "var(--text-subtle)", marginBottom: 6 }}>NOTICE PERIOD</p>
                    <select className="select" value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)}>
                      <option value="">Select…</option>
                      <option value="IMMEDIATE">Immediate</option>
                      <option value="2_WEEKS">2 weeks</option>
                      <option value="1_MONTH">1 month</option>
                      <option value="2_MONTHS">2 months</option>
                      <option value="3_MONTHS_PLUS">3 months+</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <p className="mono-s" style={{ color: "var(--text-subtle)", marginBottom: 6 }}>RIGHT TO WORK IN CYPRUS <span style={{ color: "var(--accent)" }}>*</span></p>
                  <select className="select" value={rightToWork} onChange={(e) => setRightToWork(e.target.value)} required>
                    <option value="">Select…</option>
                    <option value="EU_CITIZEN">EU / EEA citizen</option>
                    <option value="WORK_PERMIT">Work permit holder</option>
                    <option value="NEEDS_SPONSORSHIP">Needs visa sponsorship</option>
                  </select>
                </div>
              </Section>

              {/* For this role */}
              <Section label="For this role">
                <div>
                  <p className="mono-s" style={{ color: "var(--text-subtle)", marginBottom: 6 }}>EXPECTED SALARY (€/YEAR)</p>
                  <input
                    className="input"
                    type="number"
                    placeholder="e.g. 55000"
                    min={0}
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                  <div>
                    <p className="mono-s" style={{ color: "var(--text-subtle)", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                      <Link2 size={10} /> LINKEDIN
                    </p>
                    <input
                      className="input"
                      type="url"
                      placeholder="linkedin.com/in/…"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <p className="mono-s" style={{ color: "var(--text-subtle)", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                      <FileText size={10} /> PORTFOLIO
                    </p>
                    <input
                      className="input"
                      type="url"
                      placeholder="yoursite.com"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                    />
                  </div>
                </div>
              </Section>

              {/* Cover letter */}
              <Section label="Cover letter" hint="optional">
                <textarea
                  className="textarea"
                  rows={5}
                  maxLength={1000}
                  placeholder="Tell the employer why you're a great fit for this role…"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
                <p className="mono-s" style={{ color: "var(--text-subtle)", textAlign: "right" }}>
                  {coverLetter.length}/1000
                </p>
              </Section>

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
                style={{ width: "100%", justifyContent: "center", gap: 8 }}
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function radioCardStyle(selected: boolean): React.CSSProperties {
  return {
    display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px",
    borderRadius: 10, cursor: "pointer",
    border: `1.5px solid ${selected ? "var(--accent)" : "var(--border)"}`,
    background: selected ? "var(--accent-soft)" : "var(--surface)",
    transition: "border-color 120ms, background 120ms",
  };
}

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <div style={{
      width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 2,
      border: `2px solid ${selected ? "var(--accent)" : "var(--border)"}`,
      background: selected ? "var(--accent)" : "transparent",
      display: "grid", placeItems: "center",
    }}>
      {selected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--white)" }} />}
    </div>
  );
}

function Section({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>
        {label}
        {required && <span style={{ color: "var(--accent)", marginLeft: 3 }}>*</span>}
        {hint && <span style={{ color: "var(--text-subtle)", fontWeight: 400, marginLeft: 6 }}>({hint})</span>}
      </p>
      {children}
    </div>
  );
}
