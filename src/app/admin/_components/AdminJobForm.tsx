"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Company   { id: string; name: string }
interface Category  { id: string; name: string }

interface JobFormData {
  title: string; description: string; companyId: string; categoryId: string;
  city: string; remoteType: string; employmentType: string; experienceLevel: string;
  salaryMin: string; salaryMax: string; salaryDisclosed: boolean;
  applyType: string; applyUrl: string; applyEmail: string;
  featured: boolean; status: string;
}

interface Props {
  companies: Company[];
  categories: Category[];
  initial?: Partial<JobFormData>;
  jobId?: string;
}

const FIELD = (label: string, node: React.ReactNode) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{label}</span>
    {node}
  </label>
);

const INPUT_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-sans)", fontSize: 13, padding: "8px 12px",
  border: "1px solid var(--border)", borderRadius: 7, background: "var(--surface)",
  color: "var(--text)", outline: "none",
};

const SELECT_STYLE: React.CSSProperties = { ...INPUT_STYLE };

export function AdminJobForm({ companies, categories, initial, jobId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<JobFormData>({
    title: "", description: "", companyId: companies[0]?.id ?? "",
    categoryId: categories[0]?.id ?? "", city: "", remoteType: "ON_SITE",
    employmentType: "FULL_TIME", experienceLevel: "MID",
    salaryMin: "", salaryMax: "", salaryDisclosed: true,
    applyType: "URL", applyUrl: "", applyEmail: "",
    featured: false, status: "ACTIVE",
    ...initial,
  });

  const set = (k: keyof JobFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      ...form,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
    };
    const res = await fetch(jobId ? `/api/admin/jobs/${jobId}` : "/api/admin/jobs", {
      method: jobId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (res.ok) router.push("/admin/jobs");
    else alert("Error saving job");
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 720 }}>
      {FIELD("Title *", <input required style={INPUT_STYLE} value={form.title} onChange={set("title")} />)}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {FIELD("Company *", (
          <select required style={SELECT_STYLE} value={form.companyId} onChange={set("companyId")}>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        ))}
        {FIELD("Category *", (
          <select required style={SELECT_STYLE} value={form.categoryId} onChange={set("categoryId")}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        ))}
        {FIELD("City", <input style={INPUT_STYLE} value={form.city} onChange={set("city")} placeholder="Limassol" />)}
        {FIELD("Remote type", (
          <select style={SELECT_STYLE} value={form.remoteType} onChange={set("remoteType")}>
            <option value="ON_SITE">On-site</option>
            <option value="HYBRID">Hybrid</option>
            <option value="REMOTE">Remote</option>
          </select>
        ))}
        {FIELD("Employment type", (
          <select style={SELECT_STYLE} value={form.employmentType} onChange={set("employmentType")}>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="FREELANCE">Freelance</option>
          </select>
        ))}
        {FIELD("Experience level", (
          <select style={SELECT_STYLE} value={form.experienceLevel} onChange={set("experienceLevel")}>
            <option value="JUNIOR">Junior</option>
            <option value="MID">Mid</option>
            <option value="SENIOR">Senior</option>
            <option value="LEAD">Lead</option>
            <option value="EXECUTIVE">Executive</option>
          </select>
        ))}
        {FIELD("Salary min (€)", <input type="number" style={INPUT_STYLE} value={form.salaryMin} onChange={set("salaryMin")} placeholder="35000" />)}
        {FIELD("Salary max (€)", <input type="number" style={INPUT_STYLE} value={form.salaryMax} onChange={set("salaryMax")} placeholder="65000" />)}
        {FIELD("Apply type", (
          <select style={SELECT_STYLE} value={form.applyType} onChange={set("applyType")}>
            <option value="URL">External URL</option>
            <option value="EMAIL">Email</option>
          </select>
        ))}
        {form.applyType === "URL"
          ? FIELD("Apply URL", <input style={INPUT_STYLE} value={form.applyUrl} onChange={set("applyUrl")} placeholder="https://..." />)
          : FIELD("Apply email", <input style={INPUT_STYLE} value={form.applyEmail} onChange={set("applyEmail")} placeholder="jobs@..." />)
        }
        {FIELD("Status", (
          <select style={SELECT_STYLE} value={form.status} onChange={set("status")}>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="PAUSED">Paused</option>
            <option value="CLOSED">Closed</option>
          </select>
        ))}
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={form.featured} onChange={set("featured")} /> Featured listing
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={form.salaryDisclosed} onChange={set("salaryDisclosed")} /> Salary disclosed
        </label>
      </div>

      {FIELD("Description *", (
        <textarea
          required rows={12} style={{ ...INPUT_STYLE, resize: "vertical", lineHeight: 1.6 }}
          value={form.description} onChange={set("description")}
          placeholder="Job description (supports plain text)..."
        />
      ))}

      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={busy} className="btn btn-accent" style={{ opacity: busy ? 0.6 : 1 }}>
          {busy ? "Saving…" : jobId ? "Save changes" : "Create job"}
        </button>
        <button type="button" onClick={() => router.push("/admin/jobs")} className="btn btn-outline">Cancel</button>
      </div>
    </form>
  );
}
