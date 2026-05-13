"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, Star, Building2, Loader2, AlertCircle, Check, Rocket, ShoppingBag } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

// Converts old plain-text descriptions (custom markdown) to HTML for the editor.
// HTML descriptions (new format, starts with "<") are passed through unchanged.
function descriptionToHtml(text: string): string {
  if (!text) return "";
  if (text.trimStart().startsWith("<")) return text; // already HTML
  return text.split("\n\n").map(block => {
    if (block.startsWith("**") && block.endsWith("**")) {
      return `<h2>${block.slice(2, -2)}</h2>`;
    }
    if (block.startsWith("- ")) {
      const items = block.split("\n")
        .map(l => `<li>${l.replace(/^- /, "")}</li>`)
        .join("");
      return `<ul>${items}</ul>`;
    }
    return `<p>${block.replace(/\n/g, "<br>")}</p>`;
  }).join("");
}

interface Category { label: string; slug: string }

interface JobData {
  id:              string;
  slug:            string;
  title:           string;
  description:     string;
  categorySlug:    string;
  remoteType:      string;
  employmentType:  string;
  experienceLevel: string;
  city:            string;
  salaryMin:       number | string;
  salaryMax:       number | string;
  salaryDisclosed: boolean;
  applyUrl:        string;
  applyEmail:      string;
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

type ListingType = "standard" | "featured";

function validate(form: FormData, applyMethod: "url" | "email"): FormErrors {
  const errs: FormErrors = {};
  if (!String(form.get("title")          ?? "").trim()) errs.title           = "Job title is required.";
  if (!form.get("categorySlug"))                        errs.category        = "Please select a category.";
  if (!form.get("experienceLevel"))                     errs.experienceLevel = "Please select an experience level.";
  if (!form.get("remoteType"))                          errs.remoteType      = "Please select a work type.";
  if (!form.get("employmentType"))                      errs.employmentType  = "Please select an employment type.";
  if (!String(form.get("description")    ?? "").replace(/<[^>]*>/g, "").trim()) errs.description = "Job description is required.";
  if (applyMethod === "url"   && !String(form.get("applyUrl")   ?? "").trim()) errs.applyUrl = "Application URL is required.";
  if (applyMethod === "email" && !String(form.get("applyEmail") ?? "").trim()) errs.applyUrl = "Email address is required.";
  return errs;
}

interface Props {
  job:           JobData;
  categories:    Category[];
  isDraft?:      boolean;
  standardSlots?: number;
  featuredSlots?: number;
}

export function EditJobForm({ job, categories, isDraft = false, standardSlots = 0, featuredSlots = 0 }: Props) {
  const router = useRouter();
  const [remoteType,      setRemoteType]      = useState(job.remoteType);
  const [salaryDisclosed, setSalaryDisclosed] = useState(job.salaryDisclosed);
  const [applyMethod,     setApplyMethod]     = useState<"url" | "email">(job.applyEmail && !job.applyUrl ? "email" : "url");
  const [loading,         setLoading]         = useState(false);
  const [publishLoading,  setPublishLoading]  = useState(false);
  const [serverError,     setServerError]     = useState<string | null>(null);
  const [publishError,    setPublishError]    = useState<string | null>(null);
  const [fieldErrors,     setFieldErrors]     = useState<FormErrors>({});
  const [isDirty,         setIsDirty]         = useState(false);
  const [listingType,     setListingType]     = useState<ListingType>(featuredSlots > 0 ? "featured" : "standard");

  const hasSlots = standardSlots > 0 || featuredSlots > 0;

  // Warn before leaving with unsaved changes (only for live jobs)
  useEffect(() => {
    if (isDraft) return;
    const handler = (e: BeforeUnloadEvent) => { if (isDirty) e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, isDraft]);

  function buildBody(form: FormData) {
    return {
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
  }

  // Save changes (ACTIVE/PAUSED) or save draft fields (DRAFT)
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const form   = new FormData(e.currentTarget);
    const errors = validate(form, applyMethod);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0];
      document.getElementsByName(firstKey)[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      const res  = await fetch(`/api/jobs/${job.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(buildBody(form)),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? (data.errors?.[0]) ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      setIsDirty(false);
      if (isDraft) {
        router.push("/employers/dashboard?drafted-edit=1");
      } else {
        router.push("/employers/dashboard?edited=1");
      }
    } catch {
      setServerError("Network error. Please try again.");
      setLoading(false);
    }
  }

  // Publish draft → ACTIVE (reads from saved job prop — employer must save draft first)
  async function handlePublish() {
    setPublishError(null);

    const errs: FormErrors = {};
    if (!job.title?.trim())       errs.title           = "Job title is required. Save your draft first.";
    if (!job.categorySlug)        errs.category        = "Category is required. Save your draft first.";
    if (!job.experienceLevel)     errs.experienceLevel = "Experience level is required.";
    if (!job.remoteType)          errs.remoteType      = "Work type is required.";
    if (!job.employmentType)      errs.employmentType  = "Employment type is required.";
    if (!job.description?.trim()) errs.description     = "Job description is required. Save your draft first.";
    if (!job.applyUrl?.trim() && !job.applyEmail?.trim())
      errs.applyUrl = "Application URL or email is required. Save your draft first.";

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      document.getElementsByName(Object.keys(errs)[0])[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setPublishLoading(true);

    try {
      const res  = await fetch(`/api/jobs/${job.id}/publish`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          listingType,
          title:           job.title,
          description:     job.description,
          categorySlug:    job.categorySlug,
          remoteType:      job.remoteType,
          employmentType:  job.employmentType,
          experienceLevel: job.experienceLevel,
          city:            job.city || undefined,
          salaryDisclosed: job.salaryDisclosed,
          salaryMin:       job.salaryDisclosed ? job.salaryMin || undefined : null,
          salaryMax:       job.salaryDisclosed ? job.salaryMax || undefined : null,
          applyUrl:        job.applyUrl  || undefined,
          applyEmail:      job.applyEmail || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.error ?? (data.errors?.[0]) ?? "Something went wrong.");
        setPublishLoading(false);
        return;
      }
      router.push(`/employers/dashboard?posted=${data.jobSlug}`);
    } catch {
      setPublishError("Network error. Please try again.");
      setPublishLoading(false);
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

      <form onSubmit={handleSubmit} onChange={() => setIsDirty(true)} noValidate style={{ display: "flex", flexDirection: "column", gap: 0 }}>

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
            <RichTextEditor
              name="description"
              initialContent={descriptionToHtml(job.description)}
              error={fieldErrors.description}
            />
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
              onClick={() => { setSalaryDisclosed(v => !v); setIsDirty(true); }}
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
          <div>
            <div className="body-s" style={{ fontWeight: 500, color: "var(--text)", marginBottom: 8 }}>
              How should candidates apply? <span style={{ color: "var(--accent)" }}>*</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {(["url", "email"] as const).map(method => (
                <button key={method} type="button"
                  onClick={() => { setApplyMethod(method); setIsDirty(true); }}
                  style={{ padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${applyMethod === method ? "var(--accent)" : "var(--border)"}`, background: applyMethod === method ? "var(--accent-soft)" : "var(--surface)", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 13, color: applyMethod === method ? "var(--accent)" : "var(--text-muted)", transition: "all 120ms" }}>
                  {method === "url" ? "🔗 Redirect to URL" : "✉️ Via email"}
                </button>
              ))}
            </div>
            {applyMethod === "url" ? (
              <Field label="Application URL" required error={fieldErrors.applyUrl}>
                <input className="input" name="applyUrl" type="text" defaultValue={job.applyUrl} placeholder="yourcompany.com/careers/apply" />
                <input type="hidden" name="applyEmail" value="" />
                <span className="mono-s" style={{ color: "var(--text-subtle)" }}>NO NEED TO ADD HTTPS:// — WE HANDLE THAT</span>
              </Field>
            ) : (
              <Field label="HR email address" required error={fieldErrors.applyUrl}>
                <input className="input" name="applyEmail" type="email" defaultValue={job.applyEmail} placeholder="jobs@yourcompany.com" />
                <input type="hidden" name="applyUrl" value="" />
              </Field>
            )}
          </div>
        </FormSection>

        {/* ── Save/cancel row for live jobs ── */}
        {!isDraft && (
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
              onClick={() => {
                if (isDirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
                router.push("/employers/dashboard");
              }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Save draft button for draft jobs ── */}
        {isDraft && (
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="submit"
              className="btn btn-outline btn-lg"
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              {loading
                ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving…</>
                : "Save draft"
              }
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-lg"
              onClick={() => router.push("/employers/dashboard")}
              style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)" }}
            >
              Cancel
            </button>
          </div>
        )}
      </form>

      {/* ── Publish section (draft only) ── */}
      {isDraft && (
        <div style={{ border: "1px solid var(--accent)", borderRadius: 12, padding: 24, marginTop: 24, background: "var(--accent-soft)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Rocket size={16} style={{ color: "var(--accent)" }} />
            <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, margin: 0, color: "var(--accent)" }}>
              Ready to go live?
            </h3>
          </div>
          <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 20 }}>
            Save your draft first, then choose a listing type and publish. Uses 1 slot.
          </p>

          {/* Listing type selector */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {([
              { id: "standard" as ListingType, label: "Standard", slots: standardSlots, icon: <Zap size={14} /> },
              { id: "featured" as ListingType, label: "Featured",  slots: featuredSlots, icon: <Star size={14} /> },
            ] as const).map(opt => {
              const isSelected  = listingType === opt.id;
              const hasThisSlot = opt.slots > 0;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={!hasThisSlot}
                  onClick={() => hasThisSlot && setListingType(opt.id)}
                  style={{
                    all: "unset", boxSizing: "border-box",
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 14px", borderRadius: 8,
                    border:      isSelected ? "2px solid var(--accent)" : "1.5px solid var(--border)",
                    background:  isSelected ? "var(--surface)" : "var(--bg-alt)",
                    cursor:      hasThisSlot ? "pointer" : "not-allowed",
                    opacity:     hasThisSlot ? 1 : 0.45,
                  }}
                >
                  <span style={{ color: isSelected ? "var(--accent)" : "var(--text-muted)" }}>{opt.icon}</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, color: isSelected ? "var(--accent)" : "var(--text)" }}>
                    {opt.label}
                  </span>
                  <span className="mono-s" style={{ color: "var(--text-subtle)", marginLeft: "auto" }}>
                    {opt.slots} left
                  </span>
                </button>
              );
            })}
          </div>

          {publishError && (
            <div style={{ background: "var(--error-bg)", border: "1px solid var(--error)", borderRadius: 8, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <AlertCircle size={13} style={{ color: "var(--error)", flexShrink: 0, marginTop: 1 }} />
              <span className="body-s" style={{ color: "var(--error)" }}>{publishError}</span>
            </div>
          )}

          {!hasSlots ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShoppingBag size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <span className="body-s" style={{ color: "var(--text-muted)" }}>
                No slots available. <a href="/buy-credits" style={{ color: "var(--accent)", textDecoration: "underline" }}>Buy slots →</a>
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishLoading}
              className="btn btn-accent btn-lg"
              style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 8 }}
            >
              {publishLoading
                ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Publishing…</>
                : <><Rocket size={15} /> Publish {listingType === "featured" ? "Featured" : "Standard"} listing — goes live now</>
              }
            </button>
          )}

          <p className="mono-s" style={{ color: "var(--text-subtle)", marginTop: 10 }}>
            USES 1 {listingType.toUpperCase()} SLOT · LIVE INSTANTLY · 30 ACTIVE DAYS
          </p>
        </div>
      )}
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
