"use client";

import { useReducer, useEffect, useRef, useTransition, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = createSupabaseBrowserClient();
import Link from "next/link";
import { ArrowRight, ArrowLeft, Building2, Mail, Briefcase, CheckCircle2 } from "lucide-react";
import {
  employerReducer,
  initialEmployerState,
  EMPLOYER_STEPS,
  COMPANY_SIZES,
  TECH_STACK_OPTIONS,
  computeProfileScore,
  type EmployerWizardState,
  type EmployerWizardAction,
} from "@/lib/onboarding-types";
import { CITIES } from "@/lib/placeholder-data";
import { WizardShell } from "@/components/onboarding/WizardShell";
import { StepSlide } from "@/components/onboarding/StepSlide";
import { TechStackSelector } from "@/components/onboarding/TechStackSelector";
import { ProfileScore } from "@/components/onboarding/ProfileScore";

const LS_KEY = "cyprustechjobs:employer-draft";

// ─── Field helpers ─────────────────────────────────────────────────────────

function FieldError({ error, touched }: { error?: string; touched?: boolean }) {
  if (!error || !touched) return null;
  return (
    <p className="body-s" style={{ color: "var(--error)", marginTop: 6 }}>
      {error}
    </p>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 13, color: "var(--text)" }}>
        {label}
        {required && <span style={{ color: "var(--error)", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Step components ────────────────────────────────────────────────────────

function Step1Account({
  state,
  dispatch,
  onNext,
}: {
  state: EmployerWizardState;
  dispatch: React.Dispatch<EmployerWizardAction>;
  onNext: () => void;
}) {
  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--accent-soft)", display: "grid", placeItems: "center" }}>
            <Mail size={18} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h1 className="h1">Create your account</h1>
            <p className="body-s" style={{ color: "var(--text-muted)" }}>It only takes 2 minutes.</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Field label="Your name" required>
          <input
            className={`input${state.touched.name && state.errors.name ? " input-error" : ""}`}
            type="text"
            value={state.name}
            placeholder="Alex Konstantinou"
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "name", value: e.target.value })}
            onBlur={() => dispatch({ type: "BLUR_FIELD", field: "name" })}
            onKeyDown={(e) => e.key === "Enter" && onNext()}
            autoFocus
            style={state.touched.name && state.errors.name ? { borderColor: "var(--error)" } : undefined}
          />
          <FieldError error={state.errors.name} touched={state.touched.name} />
        </Field>

        <Field label="Work email" required>
          <input
            className="input"
            type="email"
            value={state.email}
            placeholder="alex@company.com"
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
            onBlur={() => dispatch({ type: "BLUR_FIELD", field: "email" })}
            onKeyDown={(e) => e.key === "Enter" && onNext()}
            style={state.touched.email && state.errors.email ? { borderColor: "var(--error)" } : undefined}
          />
          <FieldError error={state.errors.email} touched={state.touched.email} />
        </Field>

        <p className="body-s" style={{ color: "var(--text-subtle)" }}>
          By continuing you agree to our{" "}
          <Link href="/terms" style={{ color: "var(--accent)", textDecoration: "none" }}>Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" style={{ color: "var(--accent)", textDecoration: "none" }}>Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

function Step2Company({
  state,
  dispatch,
}: {
  state: EmployerWizardState;
  dispatch: React.Dispatch<EmployerWizardAction>;
}) {
  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--accent-soft)", display: "grid", placeItems: "center" }}>
            <Building2 size={18} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h1 className="h1">Tell us about your company</h1>
            <p className="body-s" style={{ color: "var(--text-muted)" }}>This appears on your public profile.</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Company name" required>
            <input
              className="input"
              type="text"
              value={state.companyName}
              placeholder="Acme Corp"
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "companyName", value: e.target.value })}
              onBlur={() => dispatch({ type: "BLUR_FIELD", field: "companyName" })}
              style={state.touched.companyName && state.errors.companyName ? { borderColor: "var(--error)" } : undefined}
            />
            <FieldError error={state.errors.companyName} touched={state.touched.companyName} />
          </Field>

          <Field label="Website">
            <input
              className="input"
              type="text"
              value={state.website}
              placeholder="example.com"
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "website", value: e.target.value })}
              onBlur={() => dispatch({ type: "BLUR_FIELD", field: "website" })}
              style={state.touched.website && state.errors.website ? { borderColor: "var(--error)" } : undefined}
            />
            <FieldError error={state.errors.website} touched={state.touched.website} />
          </Field>
        </div>

        <Field label="City">
          <select
            className="select"
            value={state.city}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "city", value: e.target.value })}
          >
            <option value="">Select city…</option>
            {CITIES.filter((c) => c !== "Remote").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="Company size">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {COMPANY_SIZES.map((s) => {
              const active = state.size === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => dispatch({ type: "SET_FIELD", field: "size", value: s.value })}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    border: `1.5px solid ${active ? "var(--accent)" : "var(--border-strong)"}`,
                    background: active ? "var(--accent-soft)" : "var(--surface)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 150ms ease",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, color: active ? "var(--accent)" : "var(--text)", marginBottom: 2 }}>
                    {s.label}
                  </div>
                  <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{s.description}</div>
                </button>
              );
            })}
          </div>
        </Field>
      </div>
    </div>
  );
}

function Step3Profile({
  state,
  dispatch,
}: {
  state: EmployerWizardState;
  dispatch: React.Dispatch<EmployerWizardAction>;
}) {
  const charCount = state.description.trim().length;
  const charGoal = 80;
  const charMet = charCount >= charGoal;

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--accent-soft)", display: "grid", placeItems: "center" }}>
            <Briefcase size={18} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h1 className="h1">Complete your profile</h1>
            <p className="body-s" style={{ color: "var(--text-muted)" }}>Richer profiles attract 2× more applicants.</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Field label="About your company">
          <textarea
            className="textarea"
            value={state.description}
            placeholder="We're a fintech company building the future of payments in Cyprus…"
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "description", value: e.target.value })}
            onBlur={() => dispatch({ type: "BLUR_FIELD", field: "description" })}
            rows={4}
            style={state.touched.description && state.errors.description ? { borderColor: "var(--error)" } : undefined}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <FieldError error={state.errors.description} touched={state.touched.description} />
            <span
              className="mono-s"
              style={{
                color: charMet ? "var(--success)" : charCount > 0 ? "var(--warning)" : "var(--text-subtle)",
                marginLeft: "auto",
                transition: "color 200ms ease",
              }}
            >
              {charCount}/{charGoal}
            </span>
          </div>
        </Field>

        <Field label="Tech stack">
          <TechStackSelector
            options={TECH_STACK_OPTIONS}
            selected={state.techStack}
            onChange={(tags) => dispatch({ type: "SET_FIELD", field: "techStack", value: tags })}
          />
          {state.techStack.length > 0 && state.techStack.length < 3 && (
            <p className="body-s" style={{ color: "var(--text-subtle)", marginTop: 8 }}>
              Add {3 - state.techStack.length} more for a stronger profile.
            </p>
          )}
        </Field>

        <div
          className="alert alert-info"
          style={{ borderRadius: "var(--radius-md)" }}
        >
          <span className="body-s">
            You can always update these details from your dashboard later.
          </span>
        </div>
      </div>
    </div>
  );
}

function Step4Verify({
  state,
  dispatch,
}: {
  state: EmployerWizardState;
  dispatch: React.Dispatch<EmployerWizardAction>;
}) {
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    await supabase.auth.signInWithOtp({
      email: state.email,
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    });
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  };

  return (
    <div style={{ textAlign: "center" }}>
      {/* Envelope illustration */}
      <div
        style={{
          width: 96,
          height: 72,
          margin: "0 auto 32px",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "var(--accent-soft)",
            borderRadius: 12,
            border: "2px solid var(--pink-200)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Envelope flap (triangle) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "50%",
              background: "linear-gradient(135deg, var(--pink-100) 50%, transparent 50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "50%",
              background: "linear-gradient(225deg, var(--pink-100) 50%, transparent 50%)",
            }}
          />
          {/* Envelope body lines */}
          <div style={{ position: "absolute", bottom: 12, left: 16, right: 16, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ height: 3, background: "var(--pink-200)", borderRadius: 2 }} />
            <div style={{ height: 3, background: "var(--pink-200)", borderRadius: 2, width: "60%" }} />
          </div>
        </div>
        {/* Pink dot animation */}
        <div
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "var(--accent)",
            border: "2px solid var(--white)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <span style={{ color: "var(--white)", fontSize: 10, fontWeight: 700 }}>1</span>
        </div>
      </div>

      <h1 className="h1" style={{ marginBottom: 12 }}>Check your inbox</h1>
      <p className="body" style={{ color: "var(--text-muted)", marginBottom: 24, maxWidth: 420, margin: "0 auto 24px" }}>
        We sent a verification link to
      </p>

      <div
        style={{
          display: "inline-block",
          padding: "10px 20px",
          background: "var(--bg-muted)",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-mono)",
          fontSize: 14,
          color: "var(--text)",
          marginBottom: 32,
        }}
      >
        {state.email}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <p className="body-s" style={{ color: "var(--text-subtle)" }}>
          Didn't receive it? Check your spam folder or{" "}
          <button
            type="button"
            style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", padding: 0, textDecoration: "underline" }}
            onClick={handleResend}
          >
            {resent ? "sent!" : "resend the email"}
          </button>
          .
        </p>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => dispatch({ type: "PREV_STEP" })}
          style={{ color: "var(--text-subtle)" }}
        >
          ← Wrong email? Go back
        </button>
      </div>
    </div>
  );
}

function Step5Done({ state }: { state: EmployerWizardState }) {
  const { score, breakdown } = computeProfileScore({
    emailVerified: false,
    description: state.description,
    techStack: state.techStack,
    website: state.website,
    logoUrl: "",
    hasPostedJob: false,
  });

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--success)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 16px",
          }}
        >
          <CheckCircle2 size={28} style={{ color: "var(--white)" }} strokeWidth={2} />
        </div>
        <h1 className="h1" style={{ marginBottom: 8 }}>You're all set, {state.name.split(" ")[0]}!</h1>
        <p className="body" style={{ color: "var(--text-muted)" }}>
          Your employer account for <strong>{state.companyName}</strong> has been created.
          Verify your email to unlock full access.
        </p>
      </div>

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: 28,
          marginBottom: 28,
          background: "var(--surface)",
        }}
      >
        <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 20 }}>
          PROFILE COMPLETION
        </div>
        <ProfileScore score={score} breakdown={breakdown} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Link href="/post-a-job" className="btn btn-accent btn-lg" style={{ width: "100%", justifyContent: "center" }}>
          Post your first job <ArrowRight size={16} />
        </Link>
        <Link href="/employers/dashboard" className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}

// ─── Main wizard component ──────────────────────────────────────────────────

export default function EmployerOnboardingPage() {
  const [state, dispatch] = useReducer(employerReducer, initialEmployerState());
  const [, startTransition] = useTransition();
  const hydrated = useRef(false);

  // Hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<EmployerWizardState>;
        // Only restore form field values, not transient state
        const fields: Array<keyof EmployerWizardState> = [
          "name", "email", "companyName", "website", "city", "size", "description", "techStack",
        ];
        for (const field of fields) {
          if (parsed[field] !== undefined) {
            dispatch({ type: "SET_FIELD", field, value: parsed[field] as string | string[] });
          }
        }
        if (parsed.employerId) {
          dispatch({ type: "SET_EMPLOYER_ID", id: parsed.employerId });
          dispatch({ type: "NEXT_STEP" }); // go to verify step
          dispatch({ type: "NEXT_STEP" });
          dispatch({ type: "NEXT_STEP" });
        }
      } catch {
        // ignore malformed draft
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
    if (state.step === 3 && !state.submitting && !state.employerId) {
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
    const { errors: _, touched: __, submitting: ___, direction: ____, ...formData } = state;
    dispatch({ type: "SET_SUBMITTING", value: true });

    try {
      const res = await fetch("/api/employers/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          companyName: formData.companyName,
          website: formData.website,
          city: formData.city,
          size: formData.size,
          description: formData.description,
          techStack: formData.techStack,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        dispatch({ type: "SET_ERRORS", errors: { submit: data.error ?? "Something went wrong." } });
        dispatch({ type: "SET_SUBMITTING", value: false });
        return;
      }

      // Send magic link via Supabase (handles both verification + sign-in)
      await supabase.auth.signInWithOtp({
        email: formData.email,
        options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/api/auth/callback` },
      });

      dispatch({ type: "SET_EMPLOYER_ID", id: data.employerId });
      dispatch({ type: "SET_SUBMITTING", value: false });
      dispatch({ type: "NEXT_STEP" });
    } catch {
      dispatch({ type: "SET_ERRORS", errors: { submit: "Network error. Please try again." } });
      dispatch({ type: "SET_SUBMITTING", value: false });
    }
  };

  const isLastInputStep = state.step === 3;
  const showNav = state.step < 4;

  return (
    <WizardShell steps={EMPLOYER_STEPS} currentStep={state.step - 1}>
      <StepSlide key={state.step} direction={state.direction}>
        {state.step === 1 && <Step1Account state={state} dispatch={dispatch} onNext={handleNext} />}
        {state.step === 2 && <Step2Company state={state} dispatch={dispatch} />}
        {state.step === 3 && <Step3Profile state={state} dispatch={dispatch} />}
        {state.step === 4 && <Step4Verify state={state} dispatch={dispatch} />}
        {state.step === 5 && <Step5Done state={state} />}
      </StepSlide>

      {/* Submit error */}
      {state.errors.submit && (
        <div className="alert alert-error" style={{ marginTop: 16, borderRadius: "var(--radius-md)" }}>
          {state.errors.submit}
        </div>
      )}

      {/* Navigation buttons */}
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
            {state.submitting ? (
              "Saving…"
            ) : isLastInputStep ? (
              <>Continue <ArrowRight size={15} /></>
            ) : (
              <>Next <ArrowRight size={15} /></>
            )}
          </button>
        </div>
      )}
    </WizardShell>
  );
}
