"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Star, Building2, Check, Loader2, AlertCircle, DollarSign, Tag } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { SkillTagSelector } from "@/components/ui/SkillTagSelector";

interface Category { id: string; name: string }

interface InitialValues {
  title?: string;
  description?: string;
  companyName?: string;
  categoryId?: string;
  city?: string;
  remoteType?: string;
  employmentType?: string;
  experienceLevel?: string;
  salaryMin?: string;
  salaryMax?: string;
  salaryDisclosed?: boolean;
  applyUrl?: string;
  featured?: boolean;
  status?: string;
}

interface Props {
  categories: Category[];
  allTags: string[];
  initialTags?: string[];
  initial?: InitialValues;
  jobId?: string;
}

function FormSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, marginBottom: 16, overflow: "hidden", background: "var(--surface)" }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, background: "var(--bg-alt)" }}>
        <span style={{ color: "var(--accent)" }}>{icon}</span>
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14 }}>{title}</span>
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 12, marginBottom: 6, color: "var(--text)" }}>
        {label} {required && <span style={{ color: "var(--accent)" }}>*</span>}
      </label>
      {children}
      {hint && <p className="mono-s" style={{ color: "var(--text-subtle)", marginTop: 5 }}>{hint}</p>}
      {error && <p style={{ color: "var(--error)", fontSize: 11, marginTop: 5, fontFamily: "var(--font-mono)" }}>{error}</p>}
    </div>
  );
}

export function AdminJobForm({ categories, allTags, initialTags = [], initial, jobId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Controlled select/toggle state
  const [categoryId,     setCategoryId]     = useState(initial?.categoryId     ?? categories[0]?.id ?? "");
  const [remoteType,     setRemoteType]     = useState(initial?.remoteType     ?? "ON_SITE");
  const [employmentType, setEmploymentType] = useState(initial?.employmentType ?? "FULL_TIME");
  const [experienceLevel,setExperienceLevel]= useState(initial?.experienceLevel?? "MID");
  const [city,           setCity]           = useState(initial?.city           ?? "");
  const [status,         setStatus]         = useState(initial?.status         ?? "ACTIVE");
  const [salaryDisclosed,setSalaryDisclosed]= useState(initial?.salaryDisclosed ?? true);
  const [featured,       setFeatured]       = useState(initial?.featured        ?? false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setBusy(true);

    const fd = new FormData(e.currentTarget);

    const payload = {
      title:          String(fd.get("title") ?? "").trim(),
      description:    String(fd.get("description") ?? ""),
      companyName:    String(fd.get("companyName") ?? "").trim(),
      applyUrl:       String(fd.get("applyUrl") ?? "").trim(),
      tags:           String(fd.get("tags") ?? "[]"),
      categoryId,
      city:           city || null,
      remoteType,
      employmentType,
      experienceLevel,
      salaryDisclosed,
      salaryMin:      salaryDisclosed && fd.get("salaryMin") ? Number(fd.get("salaryMin")) : null,
      salaryMax:      salaryDisclosed && fd.get("salaryMax") ? Number(fd.get("salaryMax")) : null,
      featured,
      status,
    };

    const res = await fetch(jobId ? `/api/admin/jobs/${jobId}` : "/api/admin/jobs", {
      method:  jobId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    setBusy(false);

    if (res.ok) {
      router.push("/admin/jobs");
    } else {
      const data = await res.json().catch(() => ({}));
      setServerError(data.error ?? "Error saving job. Please try again.");
    }
  }

  return (
    <form onSubmit={submit} noValidate style={{ maxWidth: 760 }}>
      {serverError && (
        <div style={{ background: "var(--error-bg)", border: "1px solid var(--error)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <AlertCircle size={14} style={{ color: "var(--error)", flexShrink: 0, marginTop: 1 }} />
          <span className="body-s" style={{ color: "var(--error)" }}>{serverError}</span>
        </div>
      )}

      {/* ── Job details ── */}
      <FormSection icon={<Zap size={14} />} title="Job details">
        <Field label="Job title" required>
          <input className="input" name="title" required defaultValue={initial?.title ?? ""} placeholder="e.g. Senior Backend Engineer" />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Category" required>
            <Select name="categoryId" value={categoryId} onChange={setCategoryId}
              options={categories.map(c => ({ label: c.name, value: c.id }))}
              placeholder="Select category"
            />
          </Field>
          <Field label="Experience level" required>
            <Select name="experienceLevel" value={experienceLevel} onChange={setExperienceLevel}
              options={[
                { label: "Junior",    value: "JUNIOR"    },
                { label: "Mid-level", value: "MID"       },
                { label: "Senior",    value: "SENIOR"    },
                { label: "Lead",      value: "LEAD"      },
                { label: "Executive", value: "EXECUTIVE" },
              ]}
            />
          </Field>
          <Field label="Work type" required>
            <Select name="remoteType" value={remoteType} onChange={setRemoteType}
              options={[
                { label: "On-site", value: "ON_SITE" },
                { label: "Hybrid",  value: "HYBRID"  },
                { label: "Remote",  value: "REMOTE"  },
              ]}
            />
          </Field>
          <Field label="Employment type" required>
            <Select name="employmentType" value={employmentType} onChange={setEmploymentType}
              options={[
                { label: "Full-time",  value: "FULL_TIME"  },
                { label: "Part-time",  value: "PART_TIME"  },
                { label: "Contract",   value: "CONTRACT"   },
                { label: "Internship", value: "INTERNSHIP" },
                { label: "Freelance",  value: "FREELANCE"  },
              ]}
            />
          </Field>
          {remoteType !== "REMOTE" && (
            <Field label="City">
              <Select name="city" value={city} onChange={setCity}
                placeholder="Select city (optional)"
                options={[
                  { label: "Limassol", value: "Limassol" },
                  { label: "Nicosia",  value: "Nicosia"  },
                  { label: "Larnaca",  value: "Larnaca"  },
                  { label: "Paphos",   value: "Paphos"   },
                ]}
              />
            </Field>
          )}
          <Field label="Status">
            <Select name="status" value={status} onChange={setStatus}
              options={[
                { label: "Active",  value: "ACTIVE"  },
                { label: "Draft",   value: "DRAFT"   },
                { label: "Paused",  value: "PAUSED"  },
                { label: "Closed",  value: "CLOSED"  },
              ]}
            />
          </Field>
        </div>

        <Field label="Job description" required>
          <RichTextEditor
            name="description"
            initialContent={initial?.description ?? ""}
            placeholder="Describe the role, responsibilities, and requirements…"
          />
        </Field>
      </FormSection>

      {/* ── Skills & technologies ── */}
      <FormSection icon={<Tag size={14} />} title="Skills & technologies">
        <p className="body-s" style={{ color: "var(--text-muted)", marginTop: -4 }}>
          Select the skills and technologies required for this role.
        </p>
        <SkillTagSelector name="tags" allTags={allTags} initialSelected={initialTags} showAll />
      </FormSection>

      {/* ── Company ── */}
      <FormSection icon={<Building2 size={14} />} title="Company">
        <Field label="Company name" required hint="A COMPANY PROFILE IS CREATED AUTOMATICALLY IF ONE DOESN'T EXIST YET.">
          <input
            className="input" name="companyName" required
            defaultValue={initial?.companyName ?? ""}
            placeholder="e.g. Revolut, Exness, Cyta…"
          />
        </Field>
        <Field label="Original job posting URL" required hint="CANDIDATES ARE REDIRECTED HERE WHEN THEY CLICK APPLY.">
          <input
            className="input" name="applyUrl" required
            defaultValue={initial?.applyUrl ?? ""}
            placeholder="https://careers.company.com/job/…"
          />
        </Field>
      </FormSection>

      {/* ── Salary ── */}
      <FormSection icon={<DollarSign size={14} />} title="Salary">
        {/* Toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 8 }}>
          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 13, marginBottom: 2 }}>Show salary range</div>
            <div className="body-s" style={{ color: "var(--text-muted)" }}>
              {salaryDisclosed ? "Candidates will see the salary range" : "Salary will show as Undisclosed"}
            </div>
          </div>
          <button
            type="button" role="switch" aria-checked={salaryDisclosed}
            onClick={() => setSalaryDisclosed(v => !v)}
            style={{
              width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", flexShrink: 0,
              background: salaryDisclosed ? "var(--accent)" : "var(--border-strong)",
              position: "relative", transition: "background 150ms",
            }}
          >
            <span style={{
              position: "absolute", top: 3, left: salaryDisclosed ? 23 : 3,
              width: 18, height: 18, borderRadius: "50%", background: "#fff",
              transition: "left 150ms", display: "block",
            }} />
          </button>
        </div>

        {salaryDisclosed && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Salary min (€/year)">
                <input className="input" name="salaryMin" type="number" defaultValue={initial?.salaryMin ?? ""} placeholder="e.g. 60000" />
              </Field>
              <Field label="Salary max (€/year)">
                <input className="input" name="salaryMax" type="number" defaultValue={initial?.salaryMax ?? ""} placeholder="e.g. 90000" />
              </Field>
            </div>
            <p className="mono-s" style={{ color: "var(--text-subtle)", marginTop: -8 }}>
              LISTINGS WITH SALARY RANGES GET 2× MORE APPLICATIONS
            </p>
          </>
        )}
      </FormSection>

      {/* ── Options ── */}
      <FormSection icon={<Check size={14} />} title="Listing options">
        <button
          type="button"
          onClick={() => setFeatured(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left",
            padding: "12px 16px", borderRadius: 8, width: "100%",
            border: `1.5px solid ${featured ? "var(--accent)" : "var(--border)"}`,
            background: featured ? "var(--accent-soft)" : "transparent",
            transition: "all 120ms",
          }}
        >
          <span style={{
            width: 18, height: 18, borderRadius: 4, flexShrink: 0, display: "grid", placeItems: "center",
            border: `2px solid ${featured ? "var(--accent)" : "var(--border-strong)"}`,
            background: featured ? "var(--accent)" : "transparent", transition: "all 120ms",
          }}>
            {featured && <Check size={11} color="#fff" />}
          </span>
          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, color: featured ? "var(--accent)" : "var(--text)" }}>
              Featured listing
            </div>
            <div className="body-s" style={{ color: "var(--text-muted)" }}>Pinned to the top of search results</div>
          </div>
        </button>
      </FormSection>

      {/* ── Actions ── */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="submit" disabled={busy} className="btn btn-accent"
          style={{ display: "flex", alignItems: "center", gap: 8, opacity: busy ? 0.6 : 1 }}
        >
          {busy
            ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving…</>
            : <><Check size={14} /> {jobId ? "Save changes" : "Create job"}</>
          }
        </button>
        <button type="button" onClick={() => router.push("/admin/jobs")} className="btn btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}
