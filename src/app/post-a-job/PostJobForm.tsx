"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check, Zap, Star, Building2, Loader2, Lock, ChevronRight,
} from "lucide-react";
import { CATEGORIES } from "@/lib/placeholder-data";

// ─── Pricing plans ───────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "€0",
    period: "30-day listing",
    description: "Get your first role in front of Cyprus tech talent.",
    features: [
      "Listed for 30 days",
      "Appears in category feeds",
      "Job alerts to matching candidates",
      "Internal application tracking",
    ],
    cta: "Post for free",
    accent: false,
    badge: undefined,
    enabled: true,
  },
  {
    id: "standard",
    name: "Standard",
    price: "€9.99",
    period: "per listing · 30 days",
    description: "More visibility for roles you need to fill faster.",
    features: [
      "Everything in Free",
      "Highlighted in search results",
      "Priority in category feeds",
      "Applicant shortlist tools",
    ],
    cta: "Coming soon",
    accent: true,
    badge: "MOST POPULAR",
    enabled: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "€24.99",
    period: "per listing · 30 days",
    description: "Maximum visibility — fill roles in days, not weeks.",
    features: [
      "Everything in Standard",
      "FEATURED badge on listing",
      "Pinned to top for 7 days",
      "Homepage hero placement",
    ],
    cta: "Coming soon",
    accent: false,
    badge: undefined,
    enabled: false,
  },
] as const;

type PlanId = (typeof PLANS)[number]["id"];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  companyName?: string;
  companySlug?: string;
}

export function PostJobForm({ companyName, companySlug }: Props) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("free");

  const [form, setForm] = useState({
    title:           "",
    categorySlug:    "",
    experienceLevel: "",
    remoteType:      "",
    employmentType:  "",
    city:            "",
    description:     "",
    salaryMin:       "",
    salaryMax:       "",
    tags:            "",
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  const canSubmit = selectedPlan === "free" && !loading;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:           form.title.trim(),
          description:     form.description.trim(),
          categorySlug:    form.categorySlug,
          experienceLevel: form.experienceLevel,
          remoteType:      form.remoteType,
          employmentType:  form.employmentType,
          city:            form.city || null,
          salaryMin:       form.salaryMin ? parseInt(form.salaryMin, 10) : null,
          salaryMax:       form.salaryMax ? parseInt(form.salaryMax, 10) : null,
          tags,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push(`/jobs/${data.slug}?posted=1`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      {/* ── Plan selector ── */}
      <div style={{ marginBottom: 60 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 className="display-m" style={{ marginBottom: 8 }}>Choose a plan</h2>
          <p className="body" style={{ color: "var(--text-muted)" }}>Start free. Upgrade anytime for more visibility.</p>
        </div>

        <div className="grid-3" style={{ gap: 20 }}>
          {PLANS.map((plan) => {
            const selected = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                style={{
                  border: selected
                    ? "2px solid var(--accent)"
                    : plan.accent
                    ? "2px solid var(--border)"
                    : "1px solid var(--border)",
                  borderRadius: 14,
                  padding: 24,
                  background: selected
                    ? "var(--accent-soft)"
                    : plan.accent
                    ? "var(--surface)"
                    : "var(--surface)",
                  position: "relative",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "border-color 150ms, background 150ms",
                  width: "100%",
                }}
              >
                {plan.badge && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)" }}>
                    <span style={{ background: "var(--accent)", color: "var(--white)", padding: "3px 12px", borderRadius: 99, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Selected indicator */}
                <div style={{
                  position: "absolute", top: 14, right: 14,
                  width: 20, height: 20, borderRadius: "50%",
                  border: `2px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                  background: selected ? "var(--accent)" : "transparent",
                  display: "grid", placeItems: "center",
                  transition: "all 150ms",
                }}>
                  {selected && <Check size={11} style={{ color: "var(--white)" }} />}
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
                    {plan.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 2 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: selected ? "var(--accent)" : "var(--text)" }}>
                      {plan.price}
                    </span>
                  </div>
                  <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{plan.period}</div>
                </div>

                <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 16 }}>{plan.description}</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      {plan.enabled ? (
                        <span style={{ width: 15, height: 15, borderRadius: "50%", background: selected ? "var(--accent)" : "var(--success-bg)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
                          <Check size={8} style={{ color: selected ? "var(--white)" : "var(--success)" }} />
                        </span>
                      ) : (
                        <Lock size={12} style={{ color: "var(--text-subtle)", flexShrink: 0, marginTop: 2 }} />
                      )}
                      <span className="body-s" style={{ color: plan.enabled ? "var(--text)" : "var(--text-subtle)" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <div style={{
                  padding: "8px 14px", borderRadius: 8, textAlign: "center",
                  fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13,
                  background: !plan.enabled
                    ? "var(--bg-muted)"
                    : selected
                    ? "var(--accent)"
                    : "var(--bg-muted)",
                  color: !plan.enabled
                    ? "var(--text-subtle)"
                    : selected
                    ? "var(--white)"
                    : "var(--text)",
                }}>
                  {!plan.enabled ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Lock size={12} /> {plan.cta}
                    </span>
                  ) : plan.cta}
                </div>
              </button>
            );
          })}
        </div>

        {selectedPlan !== "free" && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--bg-muted)", borderRadius: 10, textAlign: "center" }}>
            <p className="body-s" style={{ color: "var(--text-muted)" }}>
              Paid plans are coming soon. Select <strong>Free</strong> to post your listing now.
            </p>
          </div>
        )}
      </div>

      {/* ── Job form ── */}
      <div id="form">
        <h2 className="h2" style={{ marginBottom: 6 }}>Job details</h2>
        {companyName ? (
          <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 32 }}>
            Posting as <strong>{companyName}</strong>
            {companySlug && (
              <> · <a href={`/companies/${companySlug}`} style={{ color: "var(--accent)" }}>view profile</a></>
            )}
          </p>
        ) : (
          <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 32 }}>
            Fill in the details below. Your listing will go live immediately on the free plan.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

          {/* Role */}
          <FormSection icon={<Zap size={14} />} title="Role information">
            <Field label="Job title" required>
              <input className="input" type="text" placeholder="e.g. Senior Frontend Engineer"
                value={form.title} onChange={field("title")} required />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Category" required>
                <select className="select" value={form.categorySlug} onChange={field("categorySlug")} required>
                  <option value="">Select category</option>
                  {CATEGORIES.slice(1).map((c) => (
                    <option key={c.slug} value={c.slug}>{c.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Experience level" required>
                <select className="select" value={form.experienceLevel} onChange={field("experienceLevel")} required>
                  <option value="">Select level</option>
                  <option value="JUNIOR">Junior</option>
                  <option value="MID">Mid-level</option>
                  <option value="SENIOR">Senior</option>
                  <option value="LEAD">Lead</option>
                  <option value="EXECUTIVE">Executive</option>
                </select>
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Work type" required>
                <select className="select" value={form.remoteType} onChange={field("remoteType")} required>
                  <option value="">Select work type</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ON_SITE">On-site</option>
                </select>
              </Field>
              <Field label="Employment type" required>
                <select className="select" value={form.employmentType} onChange={field("employmentType")} required>
                  <option value="">Select type</option>
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </Field>
            </div>
            <Field label="City">
              <select className="select" value={form.city} onChange={field("city")}>
                <option value="">Any / not specified</option>
                <option>Limassol</option>
                <option>Nicosia</option>
                <option>Larnaca</option>
                <option>Paphos</option>
              </select>
            </Field>
            <Field label="Skills / tech stack">
              <input className="input" type="text"
                placeholder="e.g. React, TypeScript, Node.js (comma-separated, max 10)"
                value={form.tags} onChange={field("tags")} />
              <span className="mono-s" style={{ color: "var(--text-subtle)", marginTop: 4, display: "block" }}>COMMA-SEPARATED · MAX 10 TAGS</span>
            </Field>
          </FormSection>

          {/* Description */}
          <FormSection icon={<Building2 size={14} />} title="Job description">
            <Field label="Description" required>
              <textarea className="textarea"
                placeholder="Describe the role, team, responsibilities, and what you're looking for…"
                style={{ minHeight: 240 }}
                value={form.description} onChange={field("description")}
                required minLength={100} />
              <span className="mono-s" style={{ color: "var(--text-subtle)", marginTop: 4, display: "block" }}>
                {form.description.length} characters · MIN 100
              </span>
            </Field>
          </FormSection>

          {/* Salary */}
          <FormSection icon={<Star size={14} />} title="Salary">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Min salary (€/year)">
                <input className="input" type="number" placeholder="e.g. 40000"
                  value={form.salaryMin} onChange={field("salaryMin")} min={0} />
              </Field>
              <Field label="Max salary (€/year)">
                <input className="input" type="number" placeholder="e.g. 60000"
                  value={form.salaryMax} onChange={field("salaryMax")} min={0} />
              </Field>
            </div>
            <p className="mono-s" style={{ color: "var(--text-subtle)", marginTop: -8 }}>
              LISTINGS WITH SALARY RANGES GET 2× MORE APPLICATIONS
            </p>
          </FormSection>

          {/* Error */}
          {error && (
            <div style={{ background: "var(--error-bg)", border: "1px solid var(--error)", borderRadius: 10, padding: "14px 18px", marginBottom: 8 }}>
              <p className="body-s" style={{ color: "var(--error)" }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <div style={{ marginTop: 8 }}>
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn btn-accent btn-lg"
              style={{ width: "100%", justifyContent: "center", gap: 8, opacity: selectedPlan !== "free" ? 0.5 : 1 }}
            >
              {loading ? (
                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Posting your job…</>
              ) : selectedPlan !== "free" ? (
                <><Lock size={15} /> Payment required — select Free to post now</>
              ) : (
                <>Post job for free <ChevronRight size={15} /></>
              )}
            </button>
            {selectedPlan === "free" && (
              <p className="mono-s" style={{ color: "var(--text-subtle)", textAlign: "center", marginTop: 10 }}>
                GOES LIVE IMMEDIATELY · NO PAYMENT NEEDED
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function FormSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, marginBottom: 16, overflow: "hidden", background: "var(--surface)" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, background: "var(--bg-alt)" }}>
        <span style={{ color: "var(--accent)" }}>{icon}</span>
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14 }}>{title}</span>
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 12, marginBottom: 6 }}>
        {label}{required && <span style={{ color: "var(--accent)", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}
