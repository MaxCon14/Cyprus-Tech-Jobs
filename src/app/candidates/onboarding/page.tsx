"use client";

import { useReducer, useEffect, useRef, useTransition, useState } from "react";
import { ArrowRight, ArrowLeft, Zap, MapPin, BarChart2, Bell, Mail, Inbox } from "lucide-react";
import Link from "next/link";
import {
  candidateReducer,
  initialCandidateState,
  CANDIDATE_STEPS,
  EXPERIENCE_LEVEL_OPTIONS,
  CATEGORY_OPTIONS,
  type CandidateWizardState,
  type CandidateWizardAction,
} from "@/lib/onboarding-types";
import { CITIES } from "@/lib/placeholder-data";
import { WizardShell } from "@/components/onboarding/WizardShell";
import { StepSlide } from "@/components/onboarding/StepSlide";

const LS_KEY = "cyprustechjobs:candidate-draft";

// ─── Field helpers ──────────────────────────────────────────────────────────

function FieldError({ error, touched }: { error?: string; touched?: boolean }) {
  if (!error || !touched) return null;
  return (
    <p className="body-s" style={{ color: "var(--error)", marginTop: 6 }}>
      {error}
    </p>
  );
}

// ─── Step 1: Work type ──────────────────────────────────────────────────────

function Step1WorkType({
  state,
  dispatch,
}: {
  state: CandidateWizardState;
  dispatch: React.Dispatch<CandidateWizardAction>;
}) {
  const remoteOptions = [
    { value: "REMOTE", label: "Remote", description: "Work from anywhere" },
    { value: "HYBRID", label: "Hybrid", description: "Mix of office & home" },
    { value: "ON_SITE", label: "On-site", description: "In the office" },
  ] as const;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
        <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--accent-soft)", display: "grid", placeItems: "center" }}>
          <Zap size={18} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <h1 className="h1">What kind of work?</h1>
          <p className="body-s" style={{ color: "var(--text-muted)" }}>Select all that interest you.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/* Categories */}
        <div>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>CATEGORIES</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {CATEGORY_OPTIONS.map((cat) => {
              const active = state.categories.includes(cat.slug);
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => dispatch({ type: "TOGGLE_CATEGORY", slug: cat.slug })}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                    background: active ? "var(--accent-soft)" : "var(--surface)",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 500,
                    fontSize: 13,
                    color: active ? "var(--accent)" : "var(--text)",
                    transition: "all 150ms ease",
                    textAlign: "center",
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Remote type */}
        <div>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>WORK ARRANGEMENT</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {remoteOptions.map((opt) => {
              const active = state.remoteType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => dispatch({ type: "SET_FIELD", field: "remoteType", value: active ? "" : opt.value })}
                  style={{
                    padding: "14px 12px",
                    borderRadius: "var(--radius-md)",
                    border: `1.5px solid ${active ? "var(--accent)" : "var(--border-strong)"}`,
                    background: active ? "var(--accent-soft)" : "var(--surface)",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 150ms ease",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, color: active ? "var(--accent)" : "var(--text)", marginBottom: 3 }}>
                    {opt.label}
                  </div>
                  <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{opt.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Location ───────────────────────────────────────────────────────

function Step2Location({
  state,
  dispatch,
}: {
  state: CandidateWizardState;
  dispatch: React.Dispatch<CandidateWizardAction>;
}) {
  const isRemoteOnly = state.remoteType === "REMOTE";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
        <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--accent-soft)", display: "grid", placeItems: "center" }}>
          <MapPin size={18} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <h1 className="h1">Where are you based?</h1>
          <p className="body-s" style={{ color: "var(--text-muted)" }}>We&apos;ll prioritise jobs near you.</p>
        </div>
      </div>

      {isRemoteOnly ? (
        <div className="alert alert-success" style={{ borderRadius: "var(--radius-md)" }}>
          <span className="body-s">
            You selected <strong>Remote only</strong> — location doesn&apos;t matter. We&apos;ll show you fully remote roles from Cyprus-based companies worldwide.
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <select
            className="select"
            value={state.city}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "city", value: e.target.value })}
            style={{ fontSize: 15 }}
          >
            <option value="">Any city in Cyprus</option>
            {CITIES.filter((c) => c !== "Remote").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <p className="body-s" style={{ color: "var(--text-subtle)" }}>
            Leave blank to see jobs across all Cyprus cities.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Experience level ───────────────────────────────────────────────

function Step3Level({
  state,
  dispatch,
}: {
  state: CandidateWizardState;
  dispatch: React.Dispatch<CandidateWizardAction>;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
        <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--accent-soft)", display: "grid", placeItems: "center" }}>
          <BarChart2 size={18} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <h1 className="h1">Your experience level</h1>
          <p className="body-s" style={{ color: "var(--text-muted)" }}>We&apos;ll filter out roles that don&apos;t match.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>LEVEL</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {EXPERIENCE_LEVEL_OPTIONS.map((opt) => {
              const active = state.experienceLevel === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => dispatch({ type: "SET_FIELD", field: "experienceLevel", value: active ? "" : opt.value })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    borderRadius: "var(--radius-md)",
                    border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                    background: active ? "var(--accent-soft)" : "var(--surface)",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: active ? "var(--accent)" : "var(--text)" }}>
                    {opt.label}
                  </span>
                  <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{opt.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>MINIMUM SALARY (OPTIONAL)</p>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                color: "var(--text-muted)",
              }}
            >
              €
            </span>
            <input
              className="input"
              type="number"
              value={state.salaryMin}
              placeholder="30000"
              min={0}
              step={1000}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "salaryMin", value: e.target.value })}
              style={{ paddingLeft: 28 }}
            />
          </div>
          <p className="mono-s" style={{ color: "var(--text-subtle)", marginTop: 6 }}>
            SHOWN TO YOU ONLY — NOT SHARED WITH EMPLOYERS
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Alert frequency ────────────────────────────────────────────────

function Step4Frequency({
  state,
  dispatch,
}: {
  state: CandidateWizardState;
  dispatch: React.Dispatch<CandidateWizardAction>;
}) {
  const options = [
    {
      value: "DAILY" as const,
      label: "Daily digest",
      description: "Get new matching jobs every morning. Best for active job seekers.",
      icon: <Zap size={20} style={{ color: "var(--accent)" }} />,
    },
    {
      value: "WEEKLY" as const,
      label: "Weekly roundup",
      description: "A curated summary every Monday. Perfect if you're passively looking.",
      icon: <Bell size={20} style={{ color: "var(--accent)" }} />,
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
        <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--accent-soft)", display: "grid", placeItems: "center" }}>
          <Bell size={18} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <h1 className="h1">How often should we alert you?</h1>
          <p className="body-s" style={{ color: "var(--text-muted)" }}>You can change this anytime.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {options.map((opt) => {
          const active = state.alertFrequency === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => dispatch({ type: "SET_FIELD", field: "alertFrequency", value: opt.value })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "20px 24px",
                borderRadius: "var(--radius-lg)",
                border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                background: active ? "var(--accent-soft)" : "var(--surface)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 150ms ease",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius-md)",
                  background: active ? "var(--accent)" : "var(--bg-muted)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  transition: "background 150ms ease",
                }}
              >
                <span style={{ color: active ? "var(--white)" : "var(--text-muted)" }}>
                  {opt.icon}
                </span>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: active ? "var(--accent)" : "var(--text)", marginBottom: 4 }}>
                  {opt.label}
                </div>
                <div className="body-s" style={{ color: "var(--text-muted)" }}>{opt.description}</div>
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: `2px solid ${active ? "var(--accent)" : "var(--border-strong)"}`,
                  background: active ? "var(--accent)" : "transparent",
                  flexShrink: 0,
                  transition: "all 150ms ease",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 5: Email ──────────────────────────────────────────────────────────

function Step5Email({
  state,
  dispatch,
  onNext,
}: {
  state: CandidateWizardState;
  dispatch: React.Dispatch<CandidateWizardAction>;
  onNext: () => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
        <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--accent-soft)", display: "grid", placeItems: "center" }}>
          <Mail size={18} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <h1 className="h1">Where should we send alerts?</h1>
          <p className="body-s" style={{ color: "var(--text-muted)" }}>No account needed. Unsubscribe anytime.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 13 }}>
              First name (optional)
            </label>
            <input
              className="input"
              type="text"
              value={state.firstName}
              placeholder="Alex"
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "firstName", value: e.target.value })}
              autoFocus
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 13 }}>
              Email address <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <input
              className="input"
              type="email"
              value={state.email}
              placeholder="alex@email.com"
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
              onBlur={() => dispatch({ type: "BLUR_FIELD", field: "email" })}
              onKeyDown={(e) => e.key === "Enter" && onNext()}
              style={state.touched.email && state.errors.email ? { borderColor: "var(--error)" } : undefined}
            />
            <FieldError error={state.errors.email} touched={state.touched.email} />
          </div>
        </div>

        {/* Summary of their choices */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "16px 20px",
            background: "var(--bg-muted)",
          }}
        >
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 10 }}>YOUR ALERT SETTINGS</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              ["Categories", state.categories.length > 0 ? state.categories.join(", ") : "All categories"],
              ["Work type", state.remoteType || "Any"],
              ["Location", state.city || "All cities"],
              ["Level", state.experienceLevel || "Any level"],
              ["Frequency", state.alertFrequency === "DAILY" ? "Daily digest" : "Weekly roundup"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span className="body-s" style={{ color: "var(--text-muted)" }}>{label}</span>
                <span className="mono-s" style={{ color: "var(--text)", textAlign: "right" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Consent */}
        <label
          style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              flexShrink: 0,
              borderRadius: 4,
              border: `1.5px solid ${state.touched.consent && state.errors.consent ? "var(--error)" : state.consent ? "var(--accent)" : "var(--border-strong)"}`,
              background: state.consent ? "var(--accent)" : "transparent",
              display: "grid",
              placeItems: "center",
              marginTop: 2,
              transition: "all 150ms ease",
              cursor: "pointer",
            }}
            onClick={() => dispatch({ type: "SET_FIELD", field: "consent", value: !state.consent })}
          >
            {state.consent && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
            I agree to receive job alert emails from CyprusTech.Jobs. I can unsubscribe at any time with one click.
          </span>
        </label>
        {state.touched.consent && state.errors.consent && (
          <p className="body-s" style={{ color: "var(--error)", marginTop: -12 }}>{state.errors.consent}</p>
        )}
      </div>
    </div>
  );
}

// ─── Step 6: Done ────────────────────────────────────────────────────────────

function Step6Done({ state }: { state: CandidateWizardState }) {
  return (
    <div style={{ textAlign: "center" }}>
      {/* Inbox illustration */}
      <div style={{ margin: "0 auto 32px", position: "relative", width: 80 }}>
        <div
          style={{
            width: 80,
            height: 60,
            background: "var(--accent-soft)",
            borderRadius: 10,
            border: "2px solid var(--pink-200)",
            position: "relative",
            overflow: "hidden",
            margin: "0 auto",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(135deg, var(--pink-100) 50%, transparent 50%)" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(225deg, var(--pink-100) 50%, transparent 50%)" }} />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: -8,
            right: -8,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--success)",
            border: "2px solid var(--white)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <h1 className="h1" style={{ marginBottom: 12 }}>
        {state.firstName ? `You're all set, ${state.firstName}!` : "You're all set!"}
      </h1>
      <p className="body" style={{ color: "var(--text-muted)", marginBottom: 8, maxWidth: 400, margin: "0 auto 8px" }}>
        We sent a confirmation to
      </p>
      <div
        style={{
          display: "inline-block",
          padding: "8px 16px",
          background: "var(--bg-muted)",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: "var(--text)",
          marginBottom: 32,
        }}
      >
        {state.email}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 360, margin: "0 auto" }}>
        <Link href="/jobs" className="btn btn-accent btn-lg" style={{ width: "100%", justifyContent: "center" }}>
          Browse jobs now →
        </Link>
        <p className="body-s" style={{ color: "var(--text-subtle)" }}>
          Click the link in your email to confirm your subscription. Check spam if you don&apos;t see it.
        </p>
      </div>
    </div>
  );
}

// ─── Main wizard ─────────────────────────────────────────────────────────────

export default function CandidateOnboardingPage() {
  const [state, dispatch] = useReducer(candidateReducer, initialCandidateState());
  const [, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState("");
  const hydrated = useRef(false);

  // Hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<CandidateWizardState>;
        const fields = [
          "categories", "remoteType", "city", "experienceLevel",
          "salaryMin", "alertFrequency", "firstName", "email", "consent",
        ] as const;
        for (const field of fields) {
          if (parsed[field] !== undefined) {
            dispatch({ type: "SET_FIELD", field, value: parsed[field] as string | string[] | boolean });
          }
        }
      } catch {
        // ignore
      }
    }
    hydrated.current = true;
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!hydrated.current) return;
    const { errors, touched, submitting, direction, ...persistable } = state;
    localStorage.setItem(LS_KEY, JSON.stringify(persistable));
  }, [state]);

  const handleNext = () => {
    if (state.step === 5 && !state.submitting) {
      handleSubmit();
      return;
    }
    startTransition(() => {
      dispatch({ type: "NEXT_STEP" });
    });
  };

  const handleBack = () => {
    startTransition(() => {
      dispatch({ type: "PREV_STEP" });
    });
  };

  const handleSubmit = async () => {
    dispatch({ type: "SET_SUBMITTING", value: true });

    try {
      const res = await fetch("/api/candidates/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: state.email,
          firstName: state.firstName || null,
          categoryId: state.categories[0] ?? null,
          remoteType: state.remoteType || null,
          city: state.city || null,
          experienceLevel: state.experienceLevel || null,
          salaryMin: state.salaryMin ? parseInt(state.salaryMin, 10) : null,
          alertFrequency: state.alertFrequency,
        }),
      });

      dispatch({ type: "SET_SUBMITTING", value: false });

      if (res.ok) {
        localStorage.removeItem(LS_KEY);
        dispatch({ type: "NEXT_STEP" });
      } else {
        const data = await res.json();
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please try again.");
      dispatch({ type: "SET_SUBMITTING", value: false });
    }
  };

  const showNav = state.step < 6;

  return (
    <WizardShell steps={CANDIDATE_STEPS} currentStep={state.step - 1}>
      <StepSlide key={state.step} direction={state.direction}>
        {state.step === 1 && <Step1WorkType state={state} dispatch={dispatch} />}
        {state.step === 2 && <Step2Location state={state} dispatch={dispatch} />}
        {state.step === 3 && <Step3Level state={state} dispatch={dispatch} />}
        {state.step === 4 && <Step4Frequency state={state} dispatch={dispatch} />}
        {state.step === 5 && <Step5Email state={state} dispatch={dispatch} onNext={handleNext} />}
        {state.step === 6 && <Step6Done state={state} />}
      </StepSlide>

      {submitError && (
        <div className="alert alert-error" style={{ marginTop: 16, borderRadius: "var(--radius-md)" }}>
          {submitError}
        </div>
      )}

      {showNav && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 36,
            paddingTop: 24,
            borderTop: "1px solid var(--border)",
          }}
        >
          {state.step > 1 ? (
            <button type="button" className="btn btn-ghost" onClick={handleBack}>
              <ArrowLeft size={15} /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            className="btn btn-accent btn-lg"
            onClick={handleNext}
            disabled={state.submitting}
            style={{ minWidth: 140, justifyContent: "center" }}
          >
            {state.submitting ? "Saving…" : state.step === 5 ? (
              <>Get alerts <ArrowRight size={15} /></>
            ) : (
              <>Next <ArrowRight size={15} /></>
            )}
          </button>
        </div>
      )}
    </WizardShell>
  );
}
