"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Star, Building2, Loader2, AlertCircle, Check } from "lucide-react";
import { Select } from "@/components/ui/Select";

interface Category { label: string; slug: string }

interface JobData {
  id: string;
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  remoteType: string;
  employmentType: string;
  experienceLevel: string;
  city: string;
  salaryMin: number | string;
  salaryMax: number | string;
  salaryDisclosed: boolean;
  applyUrl: string;
  applyEmail: string;
}

interface FormErrors {
  title?:           string;
  category?:        string;
  experienceLevel?: string;
  remoteType?:      string;
  employmentType?:  string;
  description?:     string;
  applyUrl?:        string;
}

function validate(form: FormData): FormErrors {
  const errs: FormErrors = {};
  if (!String(form.get("title")          ?? "").trim()) errs.title           = "Job title is required.";
  if (!form.get("categorySlug"))                        errs.category        = "Please select a category.";
  if (!form.get("experienceLevel"))                     errs.experienceLevel = "Please select an experience level.";
  if (!form.get("remoteType"))                          errs.remoteType      = "Please select a work type.";
  if (!form.get("employmentType"))                      errs.employmentType  = "Please select an employment type.";
  if (!String(form.get("description")   ?? "").trim()) errs.description     = "Job description is required.";
  if (!String(form.get("applyUrl")      ?? "").trim() &&
      !String(form.get("applyEmail")    ?? "").trim()) errs.applyUrl        = "Application URL or email is required.";
  return errs;
}

export function EditJobForm({ job, categories }: { job: JobData; categories: Category[] }) {
  const router = useRouter();
  const [remoteType,      setRemoteType]      = useState(job.remoteType);
  const [salaryDisclosed, setSalaryDisclosed] = useState(job.salaryDisclosed);
  const [loading,         setLoading]         = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

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
      title:           form.get("title"),
      description:     form.get("description"),
      categorySlug:    form.get("categorySlug"),
      remoteType:      form.get("remoteType"),
      employmentType:  form.get("employmentType"),
      experienceLevel: form.get("experienceLevel"),
      city:            form.get("city"),
      salaryDisclosed,
      salaryMin:       salaryDisclosed ? (form.get("salaryMin") || undefined) : null,
      salaryMax:       salaryDisclosed ? (form.get("salaryMax") || undefined) : null,
      applyUrl:        form.get("applyUrl"),
      applyEmail:      form.get("applyEmail"),
    };

    try {
      const res  = await fetch(`/api/jobs/${job.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? (data.errors?.[0]) ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      router.push(`/employers/dashboard?edited=1`);
    } catch {
      setServerError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 760 }}>
      {serverError && (
        <div style={{ background: "var(--error-bg)", border: "1px solid var(--error)", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <AlertCircle size={14} style={{ color: "var(--error)", flexShrink: 0, marginTop: 1 }} />
          <span className="body-s" style={{ color: "var(--error)" }}>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 0 }}>

        <FormSection icon={<Zap size={14} />} title="Job details">
          <Field label="Job title" required error={fieldErrors.title}>
            <input className="input" name="title" type="text" defaultValue={job.title} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Category" required error={fieldErrors.category}>
              <Select
                name="categorySlug"
                placeholder="Select category"
                defaultValue={job.categorySlug}
                options={categories.map(c => ({ label: c.label, value: c.slug }))}
              />
            </Field>
            <Field label="Experience level" required error={fieldErrors.experienceLevel}>
              <Select
                name="experienceLevel"
                placeholder="Select level"
                defaultValue={job.experienceLevel}
                options={[
                  { label: "Junior",    value: "JUNIOR"    },
                  { label: "Mid-level", value: "MID"       },
                  { label: "Senior",    value: "SENIOR"    },
                  { label: "Lead",      value: "LEAD"      },
                  { label: "Executive", value: "EXECUTIVE" },
                ]}
              />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Work type" required error={fieldErrors.remoteType}>
              <Select
                name="remoteType"
                placeholder="Select work type"
                defaultValue={job.remoteType}
                onChange={setRemoteType}
                options={[
                  { label: "Remote",  value: "REMOTE"  },
                  { label: "Hybrid",  value: "HYBRID"  },
                  { label: "On-site", value: "ON_SITE" },
                ]}
              />
            </Field>
            <Field label="Employment type" required error={fieldErrors.employmentType}>
              <Select
                name="employmentType"
                placeholder="Select type"
                defaultValue={job.employmentType}
                options={[
                  { label: "Full-time",  value: "FULL_TIME"  },
                  { label: "Part-time",  value: "PART_TIME"  },
                  { label: "Contract",   value: "CONTRACT"   },
                  { label: "Internship", value: "INTERNSHIP" },
                  { label: "Freelance",  value: "FREELANCE"  },
                ]}
              />
            </Field>
          </div>
          {remoteType !== "REMOTE" && (
            <Field label="City">
              <Select
                name="city"
                placeholder="Select city (optional)"
                defaultValue={job.city}
                options={[
                  { label: "Limassol", value: "Limassol" },
                  { label: "Nicosia",  value: "Nicosia"  },
                  { label: "Larnaca",  value: "Larnaca"  },
                  { label: "Paphos",   value: "Paphos"   },
                ]}
              />
            </Field>
          )}
          <Field label="Job description" required error={fieldErrors.description}>
            <textarea className="textarea" name="description" defaultValue={job.description} style={{ minHeight: 200 }} />
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
                  <input className="input" name="salaryMin" type="number" defaultValue={job.salaryMin} placeholder="e.g. 60000" />
                </Field>
                <Field label="Salary max (€/year)">
                  <input className="input" name="salaryMax" type="number" defaultValue={job.salaryMax} placeholder="e.g. 85000" />
                </Field>
              </div>
              <p className="mono-s" style={{ color: "var(--text-subtle)", marginTop: -8 }}>
                LISTINGS WITH SALARY RANGES GET 2× MORE APPLICATIONS
              </p>
            </>
          )}
          <Field label="Application URL or email" required error={fieldErrors.applyUrl}>
            <input className="input" name="applyUrl" type="text" defaultValue={job.applyUrl || job.applyEmail} placeholder="https://yourcompany.com/apply or jobs@yourcompany.com" />
            <input type="hidden" name="applyEmail" value="" />
          </Field>
        </FormSection>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            type="submit"
            className="btn btn-accent btn-lg"
            disabled={loading}
            style={{ flex: 1, justifyContent: "center", display: "flex", alignItems: "center", gap: 8 }}
          >
            {loading
              ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Saving…</>
              : <><Check size={16} /> Save changes — live immediately</>
            }
          </button>
          <button
            type="button"
            className="btn btn-outline btn-lg"
            onClick={() => router.push("/employers/dashboard")}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            Cancel
          </button>
        </div>
      </form>
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
