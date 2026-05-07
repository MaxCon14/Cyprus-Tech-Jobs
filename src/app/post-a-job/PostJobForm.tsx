"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/placeholder-data";
import { Check, Zap, Star, Building2, Loader2 } from "lucide-react";

type Plan = "standard" | "featured" | "bundle";

const PLANS: { id: Plan; name: string; price: string; period: string; description: string; features: string[]; highlight: boolean }[] = [
  {
    id: "standard",
    name: "Standard",
    price: "€99",
    period: "per listing · 30 days",
    description: "Everything you need to find great candidates.",
    features: [
      "Listed for 30 days",
      "Appears in all relevant category feeds",
      "Job alert emails to matching candidates",
      "Company profile page",
      "Apply tracking link",
    ],
    highlight: false,
  },
  {
    id: "featured",
    name: "Featured",
    price: "€199",
    period: "per listing · 30 days",
    description: "Maximum visibility for roles you need to fill fast.",
    features: [
      "Everything in Standard",
      "FEATURED badge on all listings",
      "Pinned to top of category for 7 days",
      "Highlighted in homepage hero",
      "\"Hiring this week\" company strip",
      "2× more applications on average",
    ],
    highlight: true,
  },
  {
    id: "bundle",
    name: "Bundle",
    price: "€349",
    period: "5 listings · 60 days each",
    description: "For teams with multiple open roles.",
    features: [
      "5 featured listings",
      "60-day duration per listing",
      "Dedicated company profile",
      "Priority support",
      "Candidate shortlist report",
    ],
    highlight: false,
  },
];

export function PostJobForm() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>("standard");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const activePlan = PLANS.find(p => p.id === selectedPlan)!;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const body = {
      plan:               selectedPlan,
      companyName:        form.get("companyName") as string,
      companyWebsite:     form.get("companyWebsite") as string,
      companyDescription: form.get("companyDescription") as string,
      jobTitle:           form.get("jobTitle") as string,
      category:           form.get("category") as string,
      experienceLevel:    form.get("experienceLevel") as string,
      remoteType:         form.get("remoteType") as string,
      employmentType:     form.get("employmentType") as string,
      city:               form.get("city") as string,
      description:        form.get("description") as string,
      salaryMin:          form.get("salaryMin") as string,
      salaryMax:          form.get("salaryMax") as string,
      applyUrl:           form.get("applyUrl") as string,
      applyEmail:         form.get("applyEmail") as string,
    };

    try {
      const res = await fetch("/api/stripe/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }

      // Use window.location for external Stripe checkout URL
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Plan selector */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h2 className="display-m" style={{ marginBottom: 8 }}>Choose your plan</h2>
        <p className="body" style={{ color: "var(--text-muted)" }}>No subscriptions. Pay per listing. Cancel anytime.</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 32 }}>
        {PLANS.map(plan => {
          const isSelected = selectedPlan === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                all: "unset",
                display: "block",
                cursor: "pointer",
                border: isSelected ? "2.5px solid var(--accent)" : "1.5px solid var(--border)",
                borderRadius: 12,
                padding: 24,
                background: isSelected ? "var(--accent-soft)" : "var(--surface)",
                position: "relative",
                transition: "border-color 0.15s, background 0.15s",
                textAlign: "left",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {plan.highlight && !isSelected && (
                <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)" }}>
                  <span style={{ background: "var(--accent)", color: "var(--white)", padding: "3px 12px", borderRadius: 99, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                    MOST POPULAR
                  </span>
                </div>
              )}
              {isSelected && (
                <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)" }}>
                  <span style={{ background: "var(--accent)", color: "var(--white)", padding: "3px 14px", borderRadius: 99, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
                    <Check size={9} /> SELECTED
                  </span>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 13, color: isSelected ? "var(--accent)" : "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{plan.name}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 30, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{plan.price}</div>
                <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{plan.period}</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <span style={{
                      width: 16, height: 16, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                      background: isSelected ? "var(--accent)" : "var(--success-bg)",
                      display: "grid", placeItems: "center",
                    }}>
                      <Check size={9} style={{ color: isSelected ? "var(--white)" : "var(--success)" }} />
                    </span>
                    <span className="body-s">{f}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected plan summary bar */}
      <div style={{
        background: "var(--accent-soft)", border: "1.5px solid var(--accent)",
        borderRadius: 10, padding: "14px 20px", marginBottom: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--accent)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Check size={11} style={{ color: "var(--white)" }} />
          </span>
          <span className="body-s" style={{ fontWeight: 600 }}>
            Selected: <span style={{ color: "var(--accent)" }}>{activePlan.name}</span> — {activePlan.price} / {activePlan.period}
          </span>
        </div>
        <span className="mono-s" style={{ color: "var(--text-subtle)" }}>Click a plan above to change</span>
      </div>

      {/* Job form */}
      <div id="form" className="layout-sidebar-right">
        <div>
          <h2 className="h2" style={{ marginBottom: 6 }}>Post your job</h2>
          <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 32 }}>
            Fill in the details below. Your listing will be reviewed and go live within 30 minutes.
          </p>

          {error && (
            <div style={{ background: "var(--error-bg)", border: "1px solid var(--error)", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "var(--error)" }} className="body-s">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>

            <FormSection icon={<Building2 size={14} />} title="Company details">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Company name" required>
                  <input className="input" name="companyName" type="text" placeholder="e.g. Acme Technologies" required />
                </Field>
                <Field label="Company website">
                  <input className="input" name="companyWebsite" type="url" placeholder="https://yourcompany.com" />
                </Field>
              </div>
              <Field label="Company description">
                <textarea className="textarea" name="companyDescription" placeholder="Brief description of your company…" style={{ minHeight: 80 }} />
              </Field>
            </FormSection>

            <FormSection icon={<Zap size={14} />} title="Job details">
              <Field label="Job title" required>
                <input className="input" name="jobTitle" type="text" placeholder="e.g. Senior Frontend Engineer" required />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Category" required>
                  <select className="select" name="category" required defaultValue="">
                    <option value="" disabled>Select category</option>
                    {CATEGORIES.slice(1).map(c => (
                      <option key={c.slug} value={c.slug}>{c.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Experience level" required>
                  <select className="select" name="experienceLevel" required defaultValue="">
                    <option value="" disabled>Select level</option>
                    <option>Junior</option>
                    <option>Mid-level</option>
                    <option>Senior</option>
                    <option>Lead</option>
                    <option>Executive</option>
                  </select>
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Work type" required>
                  <select className="select" name="remoteType" required defaultValue="">
                    <option value="" disabled>Select work type</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                    <option>On-site</option>
                  </select>
                </Field>
                <Field label="Employment type" required>
                  <select className="select" name="employmentType" required defaultValue="">
                    <option value="" disabled>Select type</option>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </Field>
              </div>
              <Field label="City">
                <select className="select" name="city" defaultValue="">
                  <option value="">Select city</option>
                  <option>Limassol</option>
                  <option>Nicosia</option>
                  <option>Larnaca</option>
                  <option>Paphos</option>
                </select>
              </Field>
              <Field label="Job description" required>
                <textarea className="textarea" name="description" placeholder="Describe the role, team, responsibilities, and what you're looking for. Markdown supported." style={{ minHeight: 200 }} required />
                <span className="mono-s" style={{ color: "var(--text-subtle)" }}>MARKDOWN SUPPORTED · MIN 200 CHARACTERS</span>
              </Field>
            </FormSection>

            <FormSection icon={<Star size={14} />} title="Salary & apply">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Salary min (€/year)">
                  <input className="input" name="salaryMin" type="number" placeholder="e.g. 60000" />
                </Field>
                <Field label="Salary max (€/year)">
                  <input className="input" name="salaryMax" type="number" placeholder="e.g. 85000" />
                </Field>
              </div>
              <p className="mono-s" style={{ color: "var(--text-subtle)", marginTop: -8 }}>
                LISTINGS WITH SALARY RANGES GET 2× MORE APPLICATIONS
              </p>
              <Field label="Application URL or email" required>
                <input className="input" name="applyUrl" type="text" placeholder="https://yourcompany.com/apply or jobs@yourcompany.com" required />
              </Field>
            </FormSection>

            <div style={{ marginTop: 8 }}>
              <button
                type="submit"
                className="btn btn-accent btn-lg"
                disabled={loading}
                style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 8 }}
              >
                {loading ? (
                  <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Redirecting to Stripe…</>
                ) : (
                  <>Pay {activePlan.price} · {activePlan.name} listing →</>
                )}
              </button>
              <p className="mono-s" style={{ color: "var(--text-subtle)", textAlign: "center", marginTop: 10 }}>
                REVIEWED WITHIN 30 MINUTES · SECURE PAYMENT VIA STRIPE
              </p>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 80 }}>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
            <h3 className="h3" style={{ marginBottom: 16 }}>Why CyprusTech.Jobs?</h3>
            {[
              ["Niche audience", "Every visitor is a tech professional actively looking for work in Cyprus."],
              ["Salary transparency", "Listings with salaries get 2× more applications. We encourage it."],
              ["Fast turnaround", "Listings are reviewed and live within 30 minutes."],
              ["Job alerts", "Your role is emailed to matching candidates the moment it goes live."],
            ].map(([title, desc]) => (
              <div key={title} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--accent-soft)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}>
                  <Check size={10} style={{ color: "var(--accent)" }} />
                </span>
                <div>
                  <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{title}</div>
                  <div className="body-s" style={{ color: "var(--text-muted)" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>COMPANIES WHO TRUST US</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Revolut", "Wargaming", "XM Group", "eToro", "Exness"].map(n => (
                <span key={n} className="tag">{n}</span>
              ))}
            </div>
          </div>

          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 8 }}>NEED HELP?</div>
            <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 12 }}>
              Questions about posting or want to discuss a custom package?
            </p>
            <a href="/contact" className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "center", display: "flex" }}>
              Contact us
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

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
        {label} {required && <span style={{ color: "var(--accent)" }}>*</span>}
      </label>
      {children}
    </div>
  );
}
