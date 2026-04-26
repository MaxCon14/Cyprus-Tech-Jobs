"use client";

import { useReducer, useEffect, useRef, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Zap, MapPin, BarChart2, Bell, User, Code2, Link2, Globe, CheckCircle2 } from "lucide-react";
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
import { Confetti } from "@/components/onboarding/Confetti";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = createSupabaseBrowserClient();
const LS_KEY = "cyprustechjobs:candidate-draft";

// ─── Helpers ────────────────────────────────────────────────────────────────

function StepHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
      <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--accent-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <h1 className="h1">{title}</h1>
        <p className="body-s" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
      </div>
    </div>
  );
}

function FieldError({ error, touched }: { error?: string; touched?: boolean }) {
  if (!error || !touched) return null;
  return <p className="body-s" style={{ color: "var(--error)", marginTop: 6, margin: 0 }}>{error}</p>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label className="body-s" style={{ fontWeight: 500, color: "var(--text)" }}>
        {label}{required && <span style={{ color: "var(--error)", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Step 1: Work type ──────────────────────────────────────────────────────

function Step1WorkType({ state, dispatch }: { state: CandidateWizardState; dispatch: React.Dispatch<CandidateWizardAction> }) {
  const remoteOptions = [
    { value: "REMOTE", label: "Remote", description: "Work from anywhere" },
    { value: "HYBRID", label: "Hybrid", description: "Mix of office & home" },
    { value: "ON_SITE", label: "On-site", description: "In the office" },
  ] as const;

  return (
    <div>
      <StepHeader icon={<Zap size={20} style={{ color: "var(--accent)" }} />} title="What kind of work?" subtitle="Select all that interest you." />

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>Categories</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {CATEGORY_OPTIONS.map((cat) => {
              const active = state.categories.includes(cat.slug);
              return (
                <button key={cat.slug} type="button" onClick={() => dispatch({ type: "TOGGLE_CATEGORY", slug: cat.slug })}
                  style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`, background: active ? "var(--accent-soft)" : "var(--surface)", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 13, color: active ? "var(--accent)" : "var(--text)", transition: "all 150ms ease", textAlign: "center" }}>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>Work arrangement</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {remoteOptions.map((opt) => {
              const active = state.remoteType === opt.value;
              return (
                <button key={opt.value} type="button" onClick={() => dispatch({ type: "SET_FIELD", field: "remoteType", value: active ? "" : opt.value })}
                  style={{ padding: "14px 12px", borderRadius: "var(--radius-md)", border: `1.5px solid ${active ? "var(--accent)" : "var(--border-strong)"}`, background: active ? "var(--accent-soft)" : "var(--surface)", cursor: "pointer", textAlign: "center", transition: "all 150ms ease" }}>
                  <div className="body-s" style={{ fontWeight: 600, color: active ? "var(--accent)" : "var(--text)", marginBottom: 3 }}>{opt.label}</div>
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

function Step2Location({ state, dispatch }: { state: CandidateWizardState; dispatch: React.Dispatch<CandidateWizardAction> }) {
  const isRemoteOnly = state.remoteType === "REMOTE";

  return (
    <div>
      <StepHeader icon={<MapPin size={20} style={{ color: "var(--accent)" }} />} title="Where are you based?" subtitle="We'll prioritise jobs near you." />

      {isRemoteOnly ? (
        <div className="alert alert-success" style={{ borderRadius: "var(--radius-md)" }}>
          <span className="body-s">
            You selected <strong>Remote only</strong> — location doesn't matter. We'll show you fully remote roles from Cyprus-based companies.
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <select className="select" value={state.city} onChange={(e) => dispatch({ type: "SET_FIELD", field: "city", value: e.target.value })} style={{ fontSize: 15 }}>
            <option value="">Any city in Cyprus</option>
            {CITIES.filter((c) => c !== "Remote").map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <p className="body-s" style={{ color: "var(--text-subtle)" }}>Leave blank to see jobs across all Cyprus cities.</p>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Experience level ───────────────────────────────────────────────

function Step3Level({ state, dispatch }: { state: CandidateWizardState; dispatch: React.Dispatch<CandidateWizardAction> }) {
  return (
    <div>
      <StepHeader icon={<BarChart2 size={20} style={{ color: "var(--accent)" }} />} title="Your experience level" subtitle="We'll filter out roles that don't match." />

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>Level</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {EXPERIENCE_LEVEL_OPTIONS.map((opt) => {
              const active = state.experienceLevel === opt.value;
              return (
                <button key={opt.value} type="button" onClick={() => dispatch({ type: "SET_FIELD", field: "experienceLevel", value: active ? "" : opt.value })}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: "var(--radius-md)", border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`, background: active ? "var(--accent-soft)" : "var(--surface)", cursor: "pointer", transition: "all 150ms ease" }}>
                  <span className="body-s" style={{ fontWeight: 600, color: active ? "var(--accent)" : "var(--text)" }}>{opt.label}</span>
                  <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{opt.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>Minimum salary (optional)</p>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-muted)" }}>€</span>
            <input className="input" type="number" value={state.salaryMin} placeholder="30000" min={0} step={1000}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "salaryMin", value: e.target.value })}
              style={{ paddingLeft: 28 }} />
          </div>
          <p className="mono-s" style={{ color: "var(--text-subtle)", marginTop: 6 }}>Shown to you only — not shared with employers</p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Alert frequency ────────────────────────────────────────────────

function Step4Frequency({ state, dispatch }: { state: CandidateWizardState; dispatch: React.Dispatch<CandidateWizardAction> }) {
  const options = [
    { value: "DAILY" as const, label: "Daily digest", description: "Get new matching jobs every morning. Best for active job seekers.", icon: <Zap size={20} /> },
    { value: "WEEKLY" as const, label: "Weekly roundup", description: "A curated summary every Monday. Perfect if you're passively looking.", icon: <Bell size={20} /> },
  ];

  return (
    <div>
      <StepHeader icon={<Bell size={20} style={{ color: "var(--accent)" }} />} title="How often should we alert you?" subtitle="You can change this anytime from your dashboard." />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {options.map((opt) => {
          const active = state.alertFrequency === opt.value;
          return (
            <button key={opt.value} type="button" onClick={() => dispatch({ type: "SET_FIELD", field: "alertFrequency", value: opt.value })}
              style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 24px", borderRadius: "var(--radius-lg)", border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`, background: active ? "var(--accent-soft)" : "var(--surface)", cursor: "pointer", textAlign: "left", transition: "all 150ms ease" }}>
              <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: active ? "var(--accent)" : "var(--bg-muted)", display: "grid", placeItems: "center", flexShrink: 0, transition: "background 150ms ease" }}>
                <span style={{ color: active ? "var(--white)" : "var(--text-muted)" }}>{opt.icon}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div className="body-s" style={{ fontWeight: 700, color: active ? "var(--accent)" : "var(--text)", marginBottom: 4 }}>{opt.label}</div>
                <div className="body-s" style={{ color: "var(--text-muted)" }}>{opt.description}</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${active ? "var(--accent)" : "var(--border-strong)"}`, background: active ? "var(--accent)" : "transparent", flexShrink: 0, transition: "all 150ms ease" }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 5: Profile ────────────────────────────────────────────────────────

function Step5Profile({ state, dispatch, onNext }: { state: CandidateWizardState; dispatch: React.Dispatch<CandidateWizardAction>; onNext: () => void }) {
  return (
    <div>
      <StepHeader icon={<User size={20} style={{ color: "var(--accent)" }} />} title="Create your account" subtitle="We'll send you a magic link — no password needed." />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Name row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="First name" required>
            <input className="input" type="text" value={state.firstName} placeholder="Alex"
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "firstName", value: e.target.value })}
              onBlur={() => dispatch({ type: "BLUR_FIELD", field: "firstName" })}
              style={state.touched.firstName && state.errors.firstName ? { borderColor: "var(--error)" } : undefined}
              autoFocus />
            <FieldError error={state.errors.firstName} touched={state.touched.firstName} />
          </Field>
          <Field label="Last name">
            <input className="input" type="text" value={state.lastName} placeholder="Konstantinou"
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "lastName", value: e.target.value })} />
          </Field>
        </div>

        {/* Email */}
        <Field label="Email address" required>
          <input className="input" type="email" value={state.email} placeholder="alex@email.com"
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
            onBlur={() => dispatch({ type: "BLUR_FIELD", field: "email" })}
            onKeyDown={(e) => e.key === "Enter" && onNext()}
            style={state.touched.email && state.errors.email ? { borderColor: "var(--error)" } : undefined} />
          <FieldError error={state.errors.email} touched={state.touched.email} />
        </Field>

        {/* Optional links */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 16 }}>Links (optional — you can add more in your profile)</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { field: "githubUrl", icon: <Code2 size={14} />, placeholder: "github.com/yourname" },
              { field: "linkedinUrl", icon: <Link2 size={14} />, placeholder: "linkedin.com/in/yourname" },
              { field: "portfolioUrl", icon: <Globe size={14} />, placeholder: "yourportfolio.com" },
            ].map(({ field, icon, placeholder }) => (
              <div key={field} style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", display: "flex", alignItems: "center" }}>
                  {icon}
                </span>
                <input className="input" type="text" value={state[field as keyof CandidateWizardState] as string}
                  placeholder={placeholder}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field, value: e.target.value })}
                  style={{ paddingLeft: 36 }} />
              </div>
            ))}
          </div>
        </div>

        <p className="body-s" style={{ color: "var(--text-subtle)" }}>
          By continuing you agree to our{" "}
          <Link href="/terms" style={{ color: "var(--accent)", textDecoration: "none" }}>Terms</Link>{" "}and{" "}
          <Link href="/privacy" style={{ color: "var(--accent)", textDecoration: "none" }}>Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

// ─── Step 6: Done ────────────────────────────────────────────────────────────

function Step6Done({ state }: { state: CandidateWizardState }) {
  return (
    <>
      <Confetti />
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--success)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
          <CheckCircle2 size={28} style={{ color: "var(--white)" }} strokeWidth={2} />
        </div>

        <h1 className="h1" style={{ marginBottom: 10 }}>
          {state.firstName ? `You're all set, ${state.firstName}!` : "You're all set!"}
        </h1>
        <p className="body" style={{ color: "var(--text-muted)", marginBottom: 8 }}>
          We sent a sign-in link to
        </p>
        <div style={{ display: "inline-block", padding: "8px 18px", background: "var(--bg-muted)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text)", marginBottom: 32 }}>
          {state.email}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 360, margin: "0 auto" }}>
          <Link href="/jobs" className="btn btn-accent btn-lg" style={{ width: "100%", justifyContent: "center" }}>
            Browse jobs while you wait <ArrowRight size={15} />
          </Link>
          <p className="body-s" style={{ color: "var(--text-subtle)" }}>
            Click the link in your email to activate your account. Check spam if you don't see it.
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CandidateOnboardingPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(candidateReducer, initialCandidateState());
  const [, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState("");
  const hydrated = useRef(false);
  // null = checking, false = not a candidate (allow), true = redirect in progress
  const [authChecked, setAuthChecked] = useState(false);

  // Security guard: if user is already a registered candidate, send them to
  // their dashboard. This prevents accessing other users' localStorage drafts.
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user?.email) {
        const res = await fetch("/api/candidates/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });
        const { exists } = await res.json();
        if (exists) {
          router.replace("/candidates/dashboard");
          return;
        }
        // Scope the draft to this user's email so different accounts
        // can never see each other's unfinished onboarding state.
        const scopedKey = `${LS_KEY}:${user.email}`;
        const saved = localStorage.getItem(scopedKey) ?? localStorage.getItem(LS_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as Partial<CandidateWizardState>;
            const fields = ["categories", "remoteType", "city", "experienceLevel", "salaryMin", "alertFrequency", "firstName", "lastName", "email", "githubUrl", "linkedinUrl", "portfolioUrl"] as const;
            for (const field of fields) {
              if (parsed[field] !== undefined) dispatch({ type: "SET_FIELD", field, value: parsed[field] as string | string[] });
            }
          } catch { /* ignore */ }
        }
      } else {
        // Not logged in — restore generic draft
        const saved = localStorage.getItem(LS_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as Partial<CandidateWizardState>;
            const fields = ["categories", "remoteType", "city", "experienceLevel", "salaryMin", "alertFrequency", "firstName", "lastName", "email", "githubUrl", "linkedinUrl", "portfolioUrl"] as const;
            for (const field of fields) {
              if (parsed[field] !== undefined) dispatch({ type: "SET_FIELD", field, value: parsed[field] as string | string[] });
            }
          } catch { /* ignore */ }
        }
      }
      hydrated.current = true;
      setAuthChecked(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const { errors, touched, submitting, direction, candidateId, ...persistable } = state;
    // Scope draft to email when available so different users don't share state
    const key = state.email ? `${LS_KEY}:${state.email}` : LS_KEY;
    localStorage.setItem(key, JSON.stringify(persistable));
  }, [state]);

  const handleNext = () => {
    if (state.step === 5 && !state.submitting && !state.candidateId) {
      handleSubmit();
      return;
    }
    startTransition(() => dispatch({ type: "NEXT_STEP" }));
  };

  const handleBack = () => startTransition(() => dispatch({ type: "PREV_STEP" }));

  const handleSubmit = async () => {
    dispatch({ type: "SET_SUBMITTING", value: true });
    setSubmitError("");

    try {
      const res = await fetch("/api/candidates/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: state.email,
          firstName: state.firstName,
          lastName: state.lastName,
          categories: state.categories,
          remoteType: state.remoteType || null,
          city: state.city || null,
          experienceLevel: state.experienceLevel || null,
          salaryMin: state.salaryMin ? parseInt(state.salaryMin, 10) : null,
          alertFrequency: state.alertFrequency,
          githubUrl: state.githubUrl || null,
          linkedinUrl: state.linkedinUrl || null,
          portfolioUrl: state.portfolioUrl || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong.");
        dispatch({ type: "SET_SUBMITTING", value: false });
        return;
      }

      // Send magic link for auth
      await supabase.auth.signInWithOtp({
        email: state.email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/candidates/dashboard`,
        },
      });

      dispatch({ type: "SET_CANDIDATE_ID", id: data.candidateId });
      dispatch({ type: "SET_SUBMITTING", value: false });
      localStorage.removeItem(LS_KEY);
      dispatch({ type: "NEXT_STEP" });
    } catch {
      setSubmitError("Network error. Please try again.");
      dispatch({ type: "SET_SUBMITTING", value: false });
    }
  };

  const showNav = state.step < 6;

  // Block render until we've confirmed the user isn't already registered.
  // This prevents any flash of the wizard (and localStorage restore) before redirect.
  if (!authChecked) return null;

  return (
    <WizardShell steps={CANDIDATE_STEPS} currentStep={state.step - 1}>
      <StepSlide key={state.step} direction={state.direction}>
        {state.step === 1 && <Step1WorkType state={state} dispatch={dispatch} />}
        {state.step === 2 && <Step2Location state={state} dispatch={dispatch} />}
        {state.step === 3 && <Step3Level state={state} dispatch={dispatch} />}
        {state.step === 4 && <Step4Frequency state={state} dispatch={dispatch} />}
        {state.step === 5 && <Step5Profile state={state} dispatch={dispatch} onNext={handleNext} />}
        {state.step === 6 && <Step6Done state={state} />}
      </StepSlide>

      {submitError && (
        <div className="alert alert-error" style={{ marginTop: 16, borderRadius: "var(--radius-md)" }}>
          {submitError}
        </div>
      )}

      {showNav && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
          {state.step > 1 ? (
            <button type="button" className="btn btn-ghost" onClick={handleBack}><ArrowLeft size={15} /> Back</button>
          ) : <div />}
          <button type="button" className="btn btn-accent btn-lg" onClick={handleNext} disabled={state.submitting} style={{ minWidth: 140, justifyContent: "center" }}>
            {state.submitting ? "Saving…" : state.step === 5 ? <>Create account <ArrowRight size={15} /></> : <>Next <ArrowRight size={15} /></>}
          </button>
        </div>
      )}
    </WizardShell>
  );
}
