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

const PERSIST_FIELDS = [
  "categories", "remoteType", "city", "experienceLevel", "salaryMin",
  "alertFrequency", "firstName", "lastName", "email",
  "githubUrl", "linkedinUrl", "portfolioUrl",
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Mascot ───────────────────────────────────────────────────────────────────

function MascotSpeaking() {
  return (
    <div className="mascot-float">
      <svg width="110" height="101" viewBox="0 0 628 576" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M234.178 81.8274C258.724 80.0262 283.352 84.0763 306.031 93.6387C354.289 114.076 376.911 148.774 395.717 194.74C427.171 196.938 456.134 207.959 481.685 229.363C548.67 285.475 573.597 455.969 516.642 524.313C481.668 566.276 378.055 570.73 322.872 574.333C240.4 577.345 67.8426 585.082 19.4964 502.064C-5.19045 459.673 -3.93004 390.244 9.41989 343.66C21.3852 301.91 39.1243 279.682 76.4278 258.847C92.2975 168.801 137.32 95.4874 234.178 81.8274Z" fill="#0A0A0A"/>
        <g className="mascot-eye-left">
          <path d="M286.845 278.152C256.611 278.152 247.806 312.32 247.805 354.471C247.805 396.623 256.611 430.796 286.845 430.796C317.079 430.794 325.881 396.622 325.881 354.471C325.88 312.321 317.079 278.154 286.845 278.152Z" fill="white"/>
        </g>
        <g className="mascot-eye-right">
          <path d="M422.629 278.152C392.394 278.152 383.59 312.32 383.589 354.471C383.589 396.623 392.394 430.796 422.629 430.796C452.863 430.794 461.665 396.622 461.665 354.471C461.664 312.321 452.863 278.154 422.629 278.152Z" fill="white"/>
        </g>
        <g className="mascot-star">
          <path d="M544.097 4.72659C546.156 -1.57553 555.154 -1.57553 557.213 4.72659L573.818 55.5565C574.491 57.6168 576.11 59.2388 578.182 59.928L623.301 74.9354C629.566 77.0196 629.566 85.8011 623.301 87.8852L578.182 102.893C576.11 103.582 574.491 105.204 573.818 107.264L557.213 158.094C555.154 164.396 546.156 164.396 544.097 158.094L527.475 107.213C526.811 105.182 525.227 103.574 523.192 102.87L479.861 87.8576C473.704 85.7244 473.704 77.0962 479.861 74.9631L523.192 59.9511C525.227 59.2462 526.811 57.639 527.475 55.6072L544.097 4.72659Z" fill="#FD3F73"/>
        </g>
      </svg>
    </div>
  );
}

// ─── Step 1: Welcome ──────────────────────────────────────────────────────────

function Step1Welcome() {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <MascotSpeaking />
      </div>

      {/* Speech bubble */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
        <div style={{
          position: "relative",
          background: "var(--surface)",
          border: "1.5px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "20px 24px",
          maxWidth: 360,
          textAlign: "left",
        }}>
          <div style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderBottom: "10px solid var(--border)",
          }} />
          <div style={{
            position: "absolute",
            top: -8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "9px solid transparent",
            borderRight: "9px solid transparent",
            borderBottom: "9px solid var(--surface)",
          }} />
          <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
            Hey! I&#39;m so glad you&#39;re here 👋
          </p>
          <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
            I&#39;m going to help you find your next tech job in Cyprus. It&#39;ll only take 2 minutes — promise.
          </p>
        </div>
      </div>

      <h1 className="h1" style={{ marginBottom: 10 }}>Find your dream tech job in Cyprus</h1>
      <p className="body" style={{ color: "var(--text-muted)", maxWidth: 340, margin: "0 auto" }}>
        Tell us what you&#39;re looking for and we&#39;ll match you with the best opportunities.
      </p>
    </div>
  );
}

// ─── Step 2: Work type ────────────────────────────────────────────────────────

function Step2WorkType({ state, dispatch }: { state: CandidateWizardState; dispatch: React.Dispatch<CandidateWizardAction> }) {
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

// ─── Step 3: Location ─────────────────────────────────────────────────────────

function Step3Location({ state, dispatch }: { state: CandidateWizardState; dispatch: React.Dispatch<CandidateWizardAction> }) {
  const isRemoteOnly = state.remoteType === "REMOTE";

  return (
    <div>
      <StepHeader icon={<MapPin size={20} style={{ color: "var(--accent)" }} />} title="Where are you based?" subtitle="We'll prioritise jobs near you." />

      {isRemoteOnly ? (
        <div className="alert alert-success" style={{ borderRadius: "var(--radius-md)" }}>
          <span className="body-s">
            You selected <strong>Remote only</strong> — location doesn&#39;t matter. We&#39;ll show you fully remote roles from Cyprus-based companies.
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

// ─── Step 4: Experience level ─────────────────────────────────────────────────

function Step4Level({ state, dispatch }: { state: CandidateWizardState; dispatch: React.Dispatch<CandidateWizardAction> }) {
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

// ─── Step 6: Alert frequency ──────────────────────────────────────────────────

function Step6Alerts({ state, dispatch }: { state: CandidateWizardState; dispatch: React.Dispatch<CandidateWizardAction> }) {
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

// ─── Step 7: Profile / account ────────────────────────────────────────────────

function Step7Profile({ state, dispatch, onNext }: { state: CandidateWizardState; dispatch: React.Dispatch<CandidateWizardAction>; onNext: () => void }) {
  return (
    <div>
      <StepHeader icon={<User size={20} style={{ color: "var(--accent)" }} />} title="Create your account" subtitle="We'll send you a magic link — no password needed." />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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

        <Field label="Email address" required>
          <input className="input" type="email" value={state.email} placeholder="alex@email.com"
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
            onBlur={() => dispatch({ type: "BLUR_FIELD", field: "email" })}
            onKeyDown={(e) => e.key === "Enter" && onNext()}
            style={state.touched.email && state.errors.email ? { borderColor: "var(--error)" } : undefined} />
          <FieldError error={state.errors.email} touched={state.touched.email} />
        </Field>

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

// ─── Step 9: Done ─────────────────────────────────────────────────────────────

function Step9Done({ state }: { state: CandidateWizardState }) {
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
            Click the link in your email to activate your account. Check spam if you don&#39;t see it.
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
  const [authChecked, setAuthChecked] = useState(false);

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
        const scopedKey = `${LS_KEY}:${user.email}`;
        const saved = localStorage.getItem(scopedKey) ?? localStorage.getItem(LS_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as Partial<CandidateWizardState>;
            for (const field of PERSIST_FIELDS) {
              if (parsed[field] !== undefined) dispatch({ type: "SET_FIELD", field, value: parsed[field] as string | string[] });
            }
          } catch { /* ignore */ }
        }
      } else {
        const saved = localStorage.getItem(LS_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as Partial<CandidateWizardState>;
            for (const field of PERSIST_FIELDS) {
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
    const key = state.email ? `${LS_KEY}:${state.email}` : LS_KEY;
    const toSave: Partial<typeof persistable> = {};
    for (const field of PERSIST_FIELDS) {
      // @ts-expect-error dynamic key
      toSave[field] = persistable[field];
    }
    localStorage.setItem(key, JSON.stringify(toSave));
  }, [state]);

  const handleNext = () => {
    if (state.step === 7 && !state.submitting && !state.candidateId) {
      handleSubmit();
      return;
    }
    startTransition(() => dispatch({ type: "NEXT_STEP" }));
  };

  const handleBack = () => startTransition(() => dispatch({ type: "PREV_STEP" }));
  const handleSkip = () => startTransition(() => dispatch({ type: "NEXT_STEP" }));

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

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      await supabase.auth.signInWithOtp({
        email: state.email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${appUrl}/api/auth/callback?next=/candidates/dashboard`,
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

  const isSkippable = state.step === 5 || state.step === 8;
  const isDone = state.step === 9;
  const showNav = !isDone;

  if (!authChecked) return null;

  return (
    <WizardShell steps={CANDIDATE_STEPS} currentStep={state.step - 1}>
      <StepSlide key={state.step} direction={state.direction}>
        {state.step === 1 && <Step1Welcome />}
        {state.step === 2 && <Step2WorkType state={state} dispatch={dispatch} />}
        {state.step === 3 && <Step3Location state={state} dispatch={dispatch} />}
        {state.step === 4 && <Step4Level state={state} dispatch={dispatch} />}
        {state.step === 5 && null /* Skills — coming in 1c */}
        {state.step === 6 && <Step6Alerts state={state} dispatch={dispatch} />}
        {state.step === 7 && <Step7Profile state={state} dispatch={dispatch} onNext={handleNext} />}
        {state.step === 8 && null /* Experience — coming in 1f */}
        {state.step === 9 && <Step9Done state={state} />}
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

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {isSkippable && (
              <button type="button" className="btn btn-ghost" onClick={handleSkip}>
                Skip for now
              </button>
            )}
            <button type="button" className="btn btn-accent btn-lg" onClick={handleNext} disabled={state.submitting} style={{ minWidth: 140, justifyContent: "center" }}>
              {state.submitting ? "Saving…" : state.step === 7 ? <>Create account <ArrowRight size={15} /></> : <>Next <ArrowRight size={15} /></>}
            </button>
          </div>
        </div>
      )}
    </WizardShell>
  );
}
