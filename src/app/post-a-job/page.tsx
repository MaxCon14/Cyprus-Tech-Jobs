import Link from "next/link";
import { CATEGORIES } from "@/lib/placeholder-data";
import { Check, Zap, Star, Building2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post a Job — Hire Tech Talent in Cyprus",
  description: "Post a tech job in Cyprus and reach thousands of active candidates. Listings go live within minutes.",
};

const PLANS = [
  {
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
    cta: "Post a standard listing",
    accent: false,
  },
  {
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
    cta: "Post a featured listing",
    accent: true,
  },
  {
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
    cta: "Get the bundle",
    accent: false,
  },
];

export default function PostAJobPage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "64px 24px 56px", background: "var(--bg-alt)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ width: 20, height: 1, background: "var(--accent)", display: "inline-block" }} />
            FOR EMPLOYERS · CYPRUSTECHJOBS
          </div>
          <h1 className="display-l" style={{ marginBottom: 16 }}>
            Hire tech talent<br />
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>in Cyprus.</em>
          </h1>
          <p className="body-l" style={{ color: "var(--text-muted)", maxWidth: 540, margin: "0 auto 32px" }}>
            Reach thousands of developers, designers, and engineers actively looking for roles in Cyprus. Listings go live within minutes.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            {[
              ["5,000+", "registered candidates"],
              ["248",    "active listings"],
              ["2–5 days", "average time to apply"],
            ].map(([val, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div className="mono-l" style={{ color: "var(--accent)" }}>{val}</div>
                <div className="body-s" style={{ color: "var(--text-subtle)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px" }}>

        {/* Pricing */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 className="display-m" style={{ marginBottom: 8 }}>Simple pricing</h2>
          <p className="body" style={{ color: "var(--text-muted)" }}>No subscriptions. Pay per listing. Cancel anytime.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 80 }}>
          {PLANS.map(plan => (
            <div
              key={plan.name}
              style={{
                border: plan.accent ? "2px solid var(--accent)" : "1px solid var(--border)",
                borderRadius: 12, padding: 28,
                background: plan.accent ? "var(--accent-soft)" : "var(--surface)",
                position: "relative",
              }}
            >
              {plan.accent && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)" }}>
                  <span style={{ background: "var(--accent)", color: "var(--white)", padding: "4px 14px", borderRadius: 99, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                    MOST POPULAR
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

              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", background: plan.accent ? "var(--accent)" : "var(--success-bg)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
                      <Check size={9} style={{ color: plan.accent ? "var(--white)" : "var(--success)" }} />
                    </span>
                    <span className="body-s">{f}</span>
                  </div>
                ))}
              </div>

              <Link href="#form" className={`btn ${plan.accent ? "btn-accent" : "btn-outline"}`} style={{ width: "100%", justifyContent: "center" }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Job posting form */}
        <div id="form" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 48, alignItems: "start" }}>

          {/* Form */}
          <div>
            <h2 className="h2" style={{ marginBottom: 6 }}>Post your job</h2>
            <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 32 }}>Fill in the details below. Your listing will be reviewed and go live within 30 minutes.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

              {/* Section: Company */}
              <FormSection icon={<Building2 size={14} />} title="Company details">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Company name" required>
                    <input className="input" type="text" placeholder="e.g. Acme Technologies" />
                  </Field>
                  <Field label="Company website" required>
                    <input className="input" type="url" placeholder="https://yourcompany.com" />
                  </Field>
                </div>
                <Field label="Company description">
                  <textarea className="textarea" placeholder="Brief description of your company (shown on your company profile)…" style={{ minHeight: 80 }} />
                </Field>
              </FormSection>

              {/* Section: Job */}
              <FormSection icon={<Zap size={14} />} title="Job details">
                <Field label="Job title" required>
                  <input className="input" type="text" placeholder="e.g. Senior Frontend Engineer" />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Category" required>
                    <select className="select">
                      <option value="">Select category</option>
                      {CATEGORIES.slice(1).map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Experience level" required>
                    <select className="select">
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
                    <select className="select">
                      <option value="">Select work type</option>
                      <option>Remote</option>
                      <option>Hybrid</option>
                      <option>On-site</option>
                    </select>
                  </Field>
                  <Field label="Employment type" required>
                    <select className="select">
                      <option value="">Select type</option>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                    </select>
                  </Field>
                </div>
                <Field label="City">
                  <select className="select">
                    <option value="">Select city</option>
                    <option>Limassol</option>
                    <option>Nicosia</option>
                    <option>Larnaca</option>
                    <option>Paphos</option>
                  </select>
                </Field>
                <Field label="Job description" required>
                  <textarea className="textarea" placeholder="Describe the role, team, responsibilities, and what you're looking for. Markdown supported." style={{ minHeight: 200 }} />
                  <span className="mono-s" style={{ color: "var(--text-subtle)" }}>MARKDOWN SUPPORTED · MIN 200 CHARACTERS</span>
                </Field>
              </FormSection>

              {/* Section: Salary */}
              <FormSection icon={<Star size={14} />} title="Salary & apply">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Salary min (€/year)">
                    <input className="input" type="number" placeholder="e.g. 60000" />
                  </Field>
                  <Field label="Salary max (€/year)">
                    <input className="input" type="number" placeholder="e.g. 85000" />
                  </Field>
                </div>
                <p className="mono-s" style={{ color: "var(--text-subtle)", marginTop: -8 }}>
                  LISTINGS WITH SALARY RANGES GET 2× MORE APPLICATIONS
                </p>
                <Field label="Application URL or email" required>
                  <input className="input" type="text" placeholder="https://yourcompany.com/apply or jobs@yourcompany.com" />
                </Field>
              </FormSection>

              <div style={{ marginTop: 8 }}>
                <button className="btn btn-accent btn-lg" style={{ width: "100%", justifyContent: "center" }}>
                  Continue to payment →
                </button>
                <p className="mono-s" style={{ color: "var(--text-subtle)", textAlign: "center", marginTop: 10 }}>
                  REVIEWED WITHIN 30 MINUTES · SECURE PAYMENT VIA STRIPE
                </p>
              </div>
            </div>
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
              <Link href="/contact" className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                Contact us
              </Link>
            </div>
          </aside>
        </div>
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
