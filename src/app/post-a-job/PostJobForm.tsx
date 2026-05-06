"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/placeholder-data";
import { Check, Zap, Star, Building2, Loader2 } from "lucide-react";

type Plan = "standard" | "featured" | "bundle";

const PLANS: { id: Plan; name: string; price: string; period: string; description: string; features: string[]; accent: boolean }[] = [
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
    accent: false,
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
    accent: true,
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
    accent: false,
  },
];

export function PostJobForm() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("standard");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

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

      router.push(data.url);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Plan selector */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h2 className="display-m" style={{ marginBottom: 8 }}>Simple pricing</h2>
        <p className="body" style={{ color: "var(--text-muted)" }}>No subscriptions. Pay per listing. Cancel anytime.</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 80 }}>
        {PLANS.map(plan => {
          const isSelected = selectedPlan === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                border: isSelected
                  ? "2px solid var(--accent)"
                  : plan.accent
                    ? "2px solid var(--accent)"
                    : "1px solid var(--border)",
                borderRadius: 12, padding: 28,
                background: plan.accent || isSelected ? "var(--accent-soft)" : "var(--surface)",
                position:   "relative",
                cursor:     "pointer",
                transition: "box-shadow 0.15s",
                boxShadow:  isSelected ? "0 0 0 3px var(--accent-soft)" : "none",
              }}
            >
              {plan.accent && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)" }}>
                  <span style={{ background: "var(--accent)", color: "var(--white)", padding: "4px 14px", borderRadius: 99, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                    MOST POPULAR
                  </span>
                </div>
              )}
              {isSelected && (
                <div style={{ position: "absolute", top: 12, right: 12 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--accent)", display: "grid", placeItems: "center" }}>
                    <Check size={11} style={{ color: "var(--white)" }} />
                  </span>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "var(--text-muted)", marginBottom: 8 }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 700, color: "var(--text)" }}>{plan.price}</span>
                </div>
                <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{plan.period}</div>
              </div>

              <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 20 }}>{plan.description}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", background: plan.accent || isSelected ? "var(--accent)" : "var(--success-bg)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
                      <Check size={9} style={{ color: plan.accent || isSelected ? "var(--white)" : "var(--success)" }} />
                    </span>
                    <span className="body-s">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
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
                  <select className="select" name="category" required>
                    <option value="">Select category</option>
                    {CATEGORIES.slice(1).map(c => (
                      <option key={c.slug} value={c.slug}>{c.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Experience level" required>
                  <select className="select" name="experienceLevel" required>
                    <option value="">Select level</option>
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
                  <select className="select" name="remoteType" required>
                    <option value="">Select work type</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                    <option>On-site</option>
                  </select>
                </Field>
                <Field label="Employment type" required>
                  <select className="select" name="employmentType" required>
                    <option value="">Select type</option>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </Field>
              </div>
              <Field label="City">
                <select className="select" name="city">
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
                <input className="input" name="applyUrl" type="text" placeholder="https://yourcompany.com/apply or jobs@yourcompany.com" />
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
                  <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Redirecting to payment…</>
                ) : (
                  `Continue to payment — ${PLANS.find(p => p.id === selectedPlan)?.price} →`
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
