"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/placeholder-data";
import { Check, Zap, Star, Building2, Loader2, ShoppingBag, AlertCircle } from "lucide-react";
import { Select } from "@/components/ui/Select";

type ListingType = "standard" | "featured";

interface Props {
  standardSlots: number;
  featuredSlots: number;
}

interface FormErrors {
  companyName?:     string;
  jobTitle?:        string;
  category?:        string;
  experienceLevel?: string;
  remoteType?:      string;
  employmentType?:  string;
  description?:     string;
  applyUrl?:        string;
}

export function PostJobForm({ standardSlots, featuredSlots }: Props) {
  const hasSlots        = standardSlots > 0 || featuredSlots > 0;
  const defaultType: ListingType = featuredSlots > 0 ? "featured" : "standard";

  const [listingType,      setListingType]      = useState<ListingType>(defaultType);
  const [remoteType,       setRemoteType]       = useState("");
  const [salaryDisclosed,  setSalaryDisclosed]  = useState(true);
  const [loading, setLoading]                   = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  function validate(form: FormData): FormErrors {
    const errs: FormErrors = {};
    if (!String(form.get("companyName") ?? "").trim())     errs.companyName     = "Company name is required.";
    if (!String(form.get("jobTitle") ?? "").trim())        errs.jobTitle        = "Job title is required.";
    if (!form.get("category"))                             errs.category        = "Please select a category.";
    if (!form.get("experienceLevel"))                      errs.experienceLevel = "Please select an experience level.";
    if (!form.get("remoteType"))                           errs.remoteType      = "Please select a work type.";
    if (!form.get("employmentType"))                       errs.employmentType  = "Please select an employment type.";
    if (!String(form.get("description") ?? "").trim())     errs.description     = "Job description is required.";
    if (!String(form.get("applyUrl") ?? "").trim())        errs.applyUrl        = "Application URL or email is required.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const form   = new FormData(e.currentTarget);
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0];
      document.getElementsByName(firstKey)[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setFieldErrors({});
    setLoading(true);

    const body = {
      listingType,
      companyName:        form.get("companyName"),
      companyWebsite:     form.get("companyWebsite"),
      companyDescription: form.get("companyDescription"),
      jobTitle:           form.get("jobTitle"),
      category:           form.get("category"),
      experienceLevel:    form.get("experienceLevel"),
      remoteType:         form.get("remoteType"),
      employmentType:     form.get("employmentType"),
      city:               form.get("city"),
      description:        form.get("description"),
      salaryDisclosed,
      salaryMin:          salaryDisclosed ? form.get("salaryMin") : null,
      salaryMax:          salaryDisclosed ? form.get("salaryMax") : null,
      applyUrl:           form.get("applyUrl"),
      applyEmail:         form.get("applyEmail"),
    };

    try {
      const res  = await fetch("/api/jobs/post", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }

      window.location.href = `/employers/dashboard?posted=${data.jobSlug}`;
    } catch {
      setServerError("Network error. Please try again.");
      setLoading(false);
    }
  }

  // No slots available
  if (!hasSlots) {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center", padding: "60px 0" }}>
        <div style={{ width: 64, height: 64, borderRadius: 14, background: "var(--bg-muted)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
          <ShoppingBag size={28} style={{ color: "var(--text-subtle)" }} />
        </div>
        <h2 className="h2" style={{ marginBottom: 8 }}>No listing slots yet</h2>
        <p className="body" style={{ color: "var(--text-muted)", marginBottom: 28 }}>
          You need at least one listing slot to post a job. Buy a pack and your slots are ready to use instantly.
        </p>
        <Link href="/buy-credits" className="btn btn-accent btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <ShoppingBag size={16} /> Buy listing slots
        </Link>
      </div>
    );
  }

  return (
    <div className="layout-sidebar-right">
      <div>

        {/* Listing type selector */}
        <div style={{ marginBottom: 32 }}>
          <h2 className="h2" style={{ marginBottom: 6 }}>Choose listing type</h2>
          <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 16 }}>
            Select the type of slot you want to use for this job.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              {
                id:       "standard" as ListingType,
                label:    "Standard",
                price:    "€99 value",
                slots:    standardSlots,
                icon:     <Zap size={16} />,
                features: ["30 days live", "Category feed placement", "Job alert emails"],
              },
              {
                id:       "featured" as ListingType,
                label:    "Featured",
                price:    "€199 value",
                slots:    featuredSlots,
                icon:     <Star size={16} />,
                features: ["FEATURED badge", "Pinned to top of results", "Homepage hero placement"],
              },
            ].map(opt => {
              const isSelected  = listingType === opt.id;
              const hasThisSlot = opt.slots > 0;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={!hasThisSlot}
                  onClick={() => hasThisSlot && setListingType(opt.id)}
                  style={{
                    all:         "unset",
                    display:     "block",
                    boxSizing:   "border-box",
                    cursor:      hasThisSlot ? "pointer" : "not-allowed",
                    border:      isSelected ? "2.5px solid var(--accent)" : "1.5px solid var(--border)",
                    borderRadius:10,
                    padding:     18,
                    background:  isSelected ? "var(--accent-soft)" : hasThisSlot ? "var(--surface)" : "var(--bg-muted)",
                    opacity:     hasThisSlot ? 1 : 0.5,
                    position:    "relative",
                    transition:  "border-color 0.15s, background 0.15s",
                  }}
                >
                  {isSelected && (
                    <span style={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, borderRadius: "50%", background: "var(--accent)", display: "grid", placeItems: "center" }}>
                      <Check size={10} style={{ color: "var(--white)" }} />
                    </span>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ color: isSelected ? "var(--accent)" : "var(--text-muted)" }}>{opt.icon}</span>
                    <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: isSelected ? "var(--accent)" : "var(--text)" }}>{opt.label}</span>
                    <span className="mono-s" style={{ color: "var(--text-subtle)", marginLeft: "auto" }}>
                      {opt.slots} slot{opt.slots !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {opt.features.map(f => (
                      <div key={f} style={{ display: "flex", gap: 7, alignItems: "center" }}>
                        <Check size={10} style={{ color: isSelected ? "var(--accent)" : "var(--text-subtle)", flexShrink: 0 }} />
                        <span className="body-s" style={{ color: "var(--text-muted)" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  {!hasThisSlot && (
                    <div style={{ marginTop: 10 }}>
                      <Link href="/buy-credits" className="mono-s" style={{ color: "var(--accent)", textDecoration: "underline" }} onClick={e => e.stopPropagation()}>
                        Buy {opt.label.toLowerCase()} slots →
                      </Link>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mono-s" style={{ color: "var(--text-subtle)", marginTop: 10 }}>
            USING 1 {listingType.toUpperCase()} SLOT · {listingType === "standard" ? standardSlots : featuredSlots} REMAINING AFTER THIS POST
          </p>
        </div>

        {serverError && (
          <div style={{ background: "var(--error-bg)", border: "1px solid var(--error)", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <AlertCircle size={14} style={{ color: "var(--error)", flexShrink: 0, marginTop: 1 }} />
            <span className="body-s" style={{ color: "var(--error)" }}>{serverError}</span>
          </div>
        )}

        <h2 className="h2" style={{ marginBottom: 6 }}>Job details</h2>
        <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 24 }}>Fill in the details below. Your listing goes live immediately.</p>

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 0 }}>

          <FormSection icon={<Building2 size={14} />} title="Company details">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Company name" required error={fieldErrors.companyName}>
                <input className="input" name="companyName" type="text" placeholder="e.g. Acme Technologies" />
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
            <Field label="Job title" required error={fieldErrors.jobTitle}>
              <input className="input" name="jobTitle" type="text" placeholder="e.g. Senior Frontend Engineer" />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Category" required error={fieldErrors.category}>
                <Select name="category" placeholder="Select category"
                  options={CATEGORIES.slice(1).map(c => ({ label: c.label, value: c.slug }))} />
              </Field>
              <Field label="Experience level" required error={fieldErrors.experienceLevel}>
                <Select name="experienceLevel" placeholder="Select level"
                  options={[
                    { label: "Junior",    value: "Junior" },
                    { label: "Mid-level", value: "Mid-level" },
                    { label: "Senior",    value: "Senior" },
                    { label: "Lead",      value: "Lead" },
                    { label: "Executive", value: "Executive" },
                  ]} />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Work type" required error={fieldErrors.remoteType}>
                <Select name="remoteType" placeholder="Select work type"
                  onChange={setRemoteType}
                  options={[
                    { label: "Remote",  value: "Remote" },
                    { label: "Hybrid",  value: "Hybrid" },
                    { label: "On-site", value: "On-site" },
                  ]} />
              </Field>
              <Field label="Employment type" required error={fieldErrors.employmentType}>
                <Select name="employmentType" placeholder="Select type"
                  options={[
                    { label: "Full-time",  value: "Full-time" },
                    { label: "Part-time",  value: "Part-time" },
                    { label: "Contract",   value: "Contract" },
                    { label: "Internship", value: "Internship" },
                  ]} />
              </Field>
            </div>
            {remoteType !== "Remote" && (
              <Field label="City">
                <Select name="city" placeholder="Select city (optional)"
                  options={[
                    { label: "Limassol", value: "Limassol" },
                    { label: "Nicosia",  value: "Nicosia" },
                    { label: "Larnaca",  value: "Larnaca" },
                    { label: "Paphos",   value: "Paphos" },
                  ]} />
              </Field>
            )}
            <Field label="Job description" required error={fieldErrors.description}>
              <textarea className="textarea" name="description" placeholder="Describe the role, responsibilities, and what you're looking for…" style={{ minHeight: 200 }} />
              <span className="mono-s" style={{ color: "var(--text-subtle)" }}>MARKDOWN SUPPORTED</span>
            </Field>
          </FormSection>

          <FormSection icon={<Star size={14} />} title="Salary & apply">
            {/* Salary disclosure toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 8 }}>
              <div>
                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 13, marginBottom: 2 }}>Show salary range</div>
                <div className="body-s" style={{ color: "var(--text-muted)" }}>
                  {salaryDisclosed ? "Candidates will see the salary range" : "Salary will appear as Undisclosed"}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={salaryDisclosed}
                onClick={() => setSalaryDisclosed(v => !v)}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", flexShrink: 0,
                  background: salaryDisclosed ? "var(--accent)" : "var(--border-strong)",
                  position: "relative", transition: "background 150ms",
                }}
              >
                <span style={{
                  position: "absolute", top: 3, left: salaryDisclosed ? 23 : 3,
                  width: 18, height: 18, borderRadius: "50%", background: "var(--white)",
                  transition: "left 150ms", display: "block",
                }} />
              </button>
            </div>

            {salaryDisclosed && (
              <>
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
              </>
            )}
            <Field label="Application URL or email" required error={fieldErrors.applyUrl}>
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
              {loading
                ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Posting job…</>
                : <>Post {listingType === "featured" ? "Featured" : "Standard"} listing — goes live now →</>
              }
            </button>
            <p className="mono-s" style={{ color: "var(--text-subtle)", textAlign: "center", marginTop: 10 }}>
              USES 1 {listingType.toUpperCase()} SLOT · LIVE INSTANTLY
            </p>
          </div>
        </form>
      </div>

      {/* Sidebar */}
      <aside style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 80 }}>
        <div style={{ border: "1px solid var(--accent)", borderRadius: 10, padding: 20, background: "var(--accent-soft)" }}>
          <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>YOUR SLOT BALANCE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="body-s" style={{ display: "flex", alignItems: "center", gap: 6 }}><Zap size={12} /> Standard slots</span>
              <span className="mono-s" style={{ color: "var(--accent)", fontWeight: 700 }}>{standardSlots}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="body-s" style={{ display: "flex", alignItems: "center", gap: 6 }}><Star size={12} /> Featured slots</span>
              <span className="mono-s" style={{ color: "var(--accent)", fontWeight: 700 }}>{featuredSlots}</span>
            </div>
          </div>
          <Link href="/buy-credits" className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "center", display: "flex" }}>
            Buy more slots
          </Link>
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 20, background: "var(--surface)" }}>
          <h3 className="h3" style={{ marginBottom: 14 }}>Tips for a great listing</h3>
          {[
            ["Add a salary range", "Listings with salaries get 2× more applications."],
            ["Be specific", "Clear role descriptions attract better-matched candidates."],
            ["Add your logo", "Company profiles with logos get more clicks."],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--accent-soft)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
                <Check size={9} style={{ color: "var(--accent)" }} />
              </span>
              <div>
                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{title}</div>
                <div className="body-s" style={{ color: "var(--text-muted)" }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function FormSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, marginBottom: 16, overflow: "hidden", background: "var(--surface)" }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, background: "var(--bg-alt)" }}>
        <span style={{ color: "var(--accent)" }}>{icon}</span>
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14 }}>{title}</span>
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 12, marginBottom: 6 }}>
        {label} {required && <span style={{ color: "var(--accent)" }}>*</span>}
      </label>
      {children}
      {error && (
        <p style={{ color: "var(--error)", fontSize: 11, marginTop: 5, fontFamily: "var(--font-mono)" }}>{error}</p>
      )}
    </div>
  );
}
