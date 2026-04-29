"use client";

import { useReducer, useEffect, useRef, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Zap, MapPin, BarChart2, Bell, User, Code2, Link2, Globe, CheckCircle2, FileText, Camera, Upload, X, Briefcase, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  candidateReducer,
  initialCandidateState,
  CANDIDATE_STEPS,
  EXPERIENCE_LEVEL_OPTIONS,
  CATEGORY_OPTIONS,
  TECH_STACK_OPTIONS,
  type CandidateWizardState,
  type CandidateWizardAction,
} from "@/lib/onboarding-types";
import { TechStackSelector } from "@/components/onboarding/TechStackSelector";
import { CITIES } from "@/lib/placeholder-data";
import { WizardShell } from "@/components/onboarding/WizardShell";
import { StepSlide } from "@/components/onboarding/StepSlide";
import { Confetti } from "@/components/onboarding/Confetti";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = createSupabaseBrowserClient();
const LS_KEY = "cyprustechcareers:candidate-draft";

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

// ─── Step 5: Skills ─────────────────────────────────────────────────────────

function Step5Skills({ state, dispatch }: { state: CandidateWizardState; dispatch: React.Dispatch<CandidateWizardAction> }) {
  return (
    <div>
      <StepHeader icon={<Code2 size={20} style={{ color: "var(--accent)" }} />} title="Your tech stack" subtitle="Add skills so employers can find you. Optional — you can update anytime." />
      <TechStackSelector
        options={TECH_STACK_OPTIONS}
        selected={state.skills}
        onChange={(tags) => dispatch({ type: "SET_FIELD", field: "skills", value: tags })}
      />
    </div>
  );
}

// ─── Step 6: Profile ────────────────────────────────────────────────────────

interface Step6Props {
  state: CandidateWizardState;
  dispatch: React.Dispatch<CandidateWizardAction>;
  onNext: () => void;
  avatarFile: File | null;
  avatarPreview: string | null;
  onAvatarChange: (file: File | null) => void;
  cvFile: File | null;
  cvTab: "upload" | "link";
  onCvFileChange: (file: File | null) => void;
  onCvTabChange: (tab: "upload" | "link") => void;
}

function Step6Profile({ state, dispatch, onNext, avatarFile, avatarPreview, onAvatarChange, cvFile, cvTab, onCvFileChange, onCvTabChange }: Step6Props) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [cvDragOver, setCvDragOver] = useState(false);

  const EXT_BADGE: Record<string, string> = { pdf: "#e53e3e", doc: "#2b6cb0", docx: "#2b6cb0" };
  const cvExt = cvFile?.name.split(".").pop()?.toLowerCase() ?? "";

  return (
    <div>
      <StepHeader icon={<User size={20} style={{ color: "var(--accent)" }} />} title="Create your account" subtitle="We'll send you a magic link — no password needed." />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Avatar picker */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <div
              onClick={() => avatarInputRef.current?.click()}
              style={{
                width: 80, height: 80, borderRadius: "50%", cursor: "pointer",
                overflow: "hidden", display: "grid", placeItems: "center",
                background: avatarPreview ? "transparent" : "var(--bg-muted)",
                border: "2px dashed var(--border-strong)",
                transition: "border-color 150ms",
              }}
            >
              {avatarPreview
                ? <img src={avatarPreview} alt="Profile preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <User size={28} style={{ color: "var(--text-subtle)" }} />
              }
            </div>
            <div style={{
              position: "absolute", bottom: 2, right: 2,
              width: 22, height: 22, borderRadius: "50%",
              background: "var(--accent)", display: "grid", placeItems: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)", pointerEvents: "none",
            }}>
              <Camera size={11} style={{ color: "var(--white)" }} />
            </div>
            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }}
              onChange={(e) => onAvatarChange(e.target.files?.[0] ?? null)} />
          </div>
          <p className="mono-s" style={{ color: "var(--text-subtle)" }}>
            {avatarFile ? avatarFile.name : "Click to add a profile photo (optional)"}
          </p>
        </div>

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

        {/* CV */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>CV / Résumé (optional)</p>

          {/* Tab toggle */}
          <div style={{ display: "flex", gap: 0, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", alignSelf: "flex-start", marginBottom: 12, width: "fit-content" }}>
            {(["upload", "link"] as const).map((t) => (
              <button key={t} type="button" onClick={() => { onCvTabChange(t); onCvFileChange(null); dispatch({ type: "SET_FIELD", field: "cvUrl", value: "" }); }}
                style={{ padding: "7px 16px", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, cursor: "pointer", border: "none", background: cvTab === t ? "var(--accent)" : "transparent", color: cvTab === t ? "var(--white)" : "var(--text-muted)", transition: "all 120ms" }}>
                {t === "upload" ? "Upload file" : "Use a link"}
              </button>
            ))}
          </div>

          {cvTab === "upload" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
                onChange={(e) => onCvFileChange(e.target.files?.[0] ?? null)} />
              {!cvFile ? (
                <div
                  onClick={() => cvInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setCvDragOver(true); }}
                  onDragLeave={() => setCvDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setCvDragOver(false); onCvFileChange(e.dataTransfer.files[0] ?? null); }}
                  style={{
                    border: `2px dashed ${cvDragOver ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: 10, padding: "28px 20px", textAlign: "center", cursor: "pointer",
                    background: cvDragOver ? "var(--accent-soft)" : "var(--bg-muted)",
                    transition: "all 150ms",
                  }}
                >
                  <Upload size={22} style={{ color: "var(--text-subtle)", margin: "0 auto 8px", display: "block" }} />
                  <p className="body-s" style={{ color: "var(--text)", fontWeight: 600, marginBottom: 3 }}>Click to browse or drag & drop</p>
                  <p className="mono-s" style={{ color: "var(--text-subtle)" }}>PDF, DOC or DOCX · Max 10 MB</p>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--bg-muted)", borderRadius: 10, border: "1px solid var(--border)" }}>
                  <span style={{ padding: "3px 7px", borderRadius: 4, background: EXT_BADGE[cvExt] ?? "var(--text-subtle)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                    {cvExt.toUpperCase()}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cvFile.name}
                    </p>
                    <p className="mono-s" style={{ color: "var(--text-subtle)" }}>{(cvFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button type="button" onClick={() => { onCvFileChange(null); if (cvInputRef.current) cvInputRef.current.value = ""; }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", display: "flex", padding: 4 }}>
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {cvTab === "link" && (
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", display: "flex", alignItems: "center" }}>
                <FileText size={14} />
              </span>
              <input className="input" type="url" value={state.cvUrl}
                placeholder="drive.google.com/file/… or dropbox.com/s/…"
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "cvUrl", value: e.target.value })}
                style={{ paddingLeft: 36 }} />
            </div>
          )}
        </div>

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

// ─── Step 7: Work experience ────────────────────────────────────────────────

interface PositionDraft {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

const emptyDraft = (): PositionDraft => ({ title: "", company: "", startDate: "", endDate: "", current: false, description: "" });

function formatMonth(ym: string) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  const date = new Date(Number(y), Number(m) - 1);
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

interface Step7Props {
  positions: PositionDraft[];
  setPositions: React.Dispatch<React.SetStateAction<PositionDraft[]>>;
}

function Step7Experience({ positions, setPositions }: Step7Props) {
  const [draft, setDraft]     = useState<PositionDraft>(emptyDraft());
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [adding, setAdding]   = useState(positions.length === 0);

  function field(k: keyof PositionDraft) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft((d) => ({ ...d, [k]: e.target.value }));
  }

  function addPosition() {
    const t = { title: true, company: true };
    setTouched(t);
    if (!draft.title.trim() || !draft.company.trim()) return;
    setPositions((ps) => [...ps, { ...draft }]);
    setDraft(emptyDraft());
    setTouched({});
    setAdding(false);
  }

  function remove(i: number) {
    setPositions((ps) => ps.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <StepHeader
        icon={<Briefcase size={20} style={{ color: "var(--accent)" }} />}
        title="Work experience"
        subtitle="Add past roles so employers can see your background. You can skip or edit anytime."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Saved positions */}
        {positions.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: "var(--bg-muted)", borderRadius: 10, border: "1px solid var(--border)" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", margin: 0 }}>{p.title}</p>
              <p className="body-s" style={{ color: "var(--text-muted)", margin: "2px 0 0" }}>
                {p.company}
                {p.startDate && <> · {formatMonth(p.startDate)} – {p.current ? "Present" : formatMonth(p.endDate)}</>}
              </p>
            </div>
            <button type="button" onClick={() => remove(i)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", display: "flex", padding: 4, flexShrink: 0 }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {/* Add form */}
        {adding ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Job title" required>
                <input className="input" type="text" value={draft.title} placeholder="Software Engineer"
                  onChange={field("title")} onBlur={() => setTouched((t) => ({ ...t, title: true }))}
                  style={touched.title && !draft.title.trim() ? { borderColor: "var(--error)" } : undefined} autoFocus />
                {touched.title && !draft.title.trim() && <p className="body-s" style={{ color: "var(--error)", margin: 0 }}>Required</p>}
              </Field>
              <Field label="Company" required>
                <input className="input" type="text" value={draft.company} placeholder="Acme Corp"
                  onChange={field("company")} onBlur={() => setTouched((t) => ({ ...t, company: true }))}
                  style={touched.company && !draft.company.trim() ? { borderColor: "var(--error)" } : undefined} />
                {touched.company && !draft.company.trim() && <p className="body-s" style={{ color: "var(--error)", margin: 0 }}>Required</p>}
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Start date">
                <input className="input" type="month" value={draft.startDate} onChange={field("startDate")} />
              </Field>
              <Field label="End date">
                <input className="input" type="month" value={draft.endDate} onChange={field("endDate")} disabled={draft.current} style={draft.current ? { opacity: 0.4 } : undefined} />
              </Field>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={draft.current}
                onChange={(e) => setDraft((d) => ({ ...d, current: e.target.checked, endDate: "" }))} />
              <span className="body-s" style={{ color: "var(--text)" }}>I currently work here</span>
            </label>

            <Field label="Description (optional)">
              <textarea className="input" rows={3} value={draft.description}
                placeholder="What did you build or achieve?"
                onChange={field("description")}
                style={{ resize: "vertical", fontFamily: "var(--font-sans)" }} />
            </Field>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={addPosition} className="btn btn-accent btn-sm" style={{ gap: 6 }}>
                <Plus size={13} /> Add position
              </button>
              {positions.length > 0 && (
                <button type="button" onClick={() => { setAdding(false); setDraft(emptyDraft()); setTouched({}); }}
                  className="btn btn-ghost btn-sm">
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setAdding(true)} className="btn btn-outline btn-sm" style={{ alignSelf: "flex-start", gap: 6 }}>
            <Plus size={13} /> Add another position
          </button>
        )}

        <p className="body-s" style={{ color: "var(--text-subtle)" }}>
          You can add, edit, or remove positions anytime from your dashboard.
        </p>
      </div>
    </div>
  );
}

// ─── Step 8: Done ────────────────────────────────────────────────────────────

function Step8Done({ state, avatarUploadError, submitError }: { state: CandidateWizardState; avatarUploadError: boolean; submitError: string }) {
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
        <div style={{ display: "inline-block", padding: "8px 18px", background: "var(--bg-muted)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text)", marginBottom: 24 }}>
          {state.email}
        </div>

        {submitError && (
          <div className="alert alert-error" style={{ marginBottom: 20, borderRadius: "var(--radius-md)", textAlign: "left" }}>
            {submitError}
          </div>
        )}

        {avatarUploadError && (
          <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 20 }}>
            Your profile photo couldn't be uploaded — you can add it from your dashboard.
          </p>
        )}

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
  const [authChecked, setAuthChecked] = useState(false);

  // File upload state — kept outside the reducer since Files aren't serialisable
  const [avatarFile, setAvatarFile]         = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview]   = useState<string | null>(null);
  const [avatarUploadError, setAvatarUploadError] = useState(false);
  const [cvFile, setCvFile]                 = useState<File | null>(null);
  const [cvTab, setCvTab]                   = useState<"upload" | "link">("upload");
  const [positions, setPositions]           = useState<PositionDraft[]>([]);

  function handleAvatarChange(file: File | null) {
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  }

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
            const fields = ["categories", "remoteType", "city", "experienceLevel", "alertFrequency", "skills", "firstName", "lastName", "email", "githubUrl", "linkedinUrl", "portfolioUrl", "cvUrl"] as const;
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
            const fields = ["categories", "remoteType", "city", "experienceLevel", "alertFrequency", "skills", "firstName", "lastName", "email", "githubUrl", "linkedinUrl", "portfolioUrl", "cvUrl"] as const;
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
    if (state.step === 6 && !state.submitting && !state.candidateId) {
      handleSubmit();
      return;
    }
    if (state.step === 7) {
      handleSavePositions();
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
          alertFrequency: state.alertFrequency,
          skills: state.skills,
          githubUrl: state.githubUrl || null,
          linkedinUrl: state.linkedinUrl || null,
          portfolioUrl: state.portfolioUrl || null,
          // Only send cvUrl when the link tab is active; file upload happens below
          cvUrl: cvTab === "link" ? (state.cvUrl || null) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong.");
        dispatch({ type: "SET_SUBMITTING", value: false });
        return;
      }

      const { candidateId } = data as { candidateId: string };

      // Upload CV file if one was selected
      if (cvFile && cvTab === "upload") {
        const fd = new FormData();
        fd.append("file", cvFile);
        fd.append("candidateId", candidateId);
        await fetch("/api/candidates/upload-cv-onboarding", { method: "POST", body: fd });
      }

      // Upload avatar if one was selected
      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        fd.append("candidateId", candidateId);
        const avatarRes = await fetch("/api/candidates/upload-avatar-onboarding", { method: "POST", body: fd });
        if (!avatarRes.ok) setAvatarUploadError(true);
      }

      // Send magic link for auth
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: state.email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/candidates/dashboard`,
        },
      });
      if (otpError) {
        const msg = otpError.message ?? "";
        const isRateLimit = msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("second");
        setSubmitError(isRateLimit
          ? "Account created! Check your inbox — if no email arrived, wait 60 seconds and sign in from the login page."
          : `Account created, but we couldn't send the sign-in link: ${msg}. Go to the login page to request a new one.`
        );
        dispatch({ type: "SET_CANDIDATE_ID", id: candidateId });
        dispatch({ type: "SET_SUBMITTING", value: false });
        localStorage.removeItem(LS_KEY);
        dispatch({ type: "NEXT_STEP" });
        return;
      }

      dispatch({ type: "SET_CANDIDATE_ID", id: candidateId });
      dispatch({ type: "SET_SUBMITTING", value: false });
      localStorage.removeItem(LS_KEY);
      dispatch({ type: "NEXT_STEP" });
    } catch {
      setSubmitError("Network error. Please try again.");
      dispatch({ type: "SET_SUBMITTING", value: false });
    }
  };

  const handleSavePositions = async () => {
    if (positions.length > 0 && state.candidateId) {
      await fetch("/api/candidates/positions-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: state.candidateId, positions }),
      });
    }
    startTransition(() => dispatch({ type: "NEXT_STEP" }));
  };

  const showNav = state.step < 8;

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
        {state.step === 5 && <Step5Skills state={state} dispatch={dispatch} />}
        {state.step === 6 && (
          <Step6Profile
            state={state}
            dispatch={dispatch}
            onNext={handleNext}
            avatarFile={avatarFile}
            avatarPreview={avatarPreview}
            onAvatarChange={handleAvatarChange}
            cvFile={cvFile}
            cvTab={cvTab}
            onCvFileChange={setCvFile}
            onCvTabChange={setCvTab}
          />
        )}
        {state.step === 7 && <Step7Experience positions={positions} setPositions={setPositions} />}
        {state.step === 8 && <Step8Done state={state} avatarUploadError={avatarUploadError} submitError={submitError} />}
      </StepSlide>

      {showNav && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
          {state.step > 1 ? (
            <button type="button" className="btn btn-ghost" onClick={handleBack}><ArrowLeft size={15} /> Back</button>
          ) : <div />}
          <button type="button" className="btn btn-accent btn-lg" onClick={handleNext} disabled={state.submitting} style={{ minWidth: 140, justifyContent: "center" }}>
            {state.submitting
              ? "Saving…"
              : state.step === 6
                ? <>Create account <ArrowRight size={15} /></>
                : <>Next <ArrowRight size={15} /></>}
          </button>
        </div>
      )}
    </WizardShell>
  );
}
