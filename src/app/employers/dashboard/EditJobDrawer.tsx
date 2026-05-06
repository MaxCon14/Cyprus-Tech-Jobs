"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, X, Save, Loader2 } from "lucide-react";
import { CATEGORIES, CITIES } from "@/lib/placeholder-data";

const REMOTE_OPTIONS   = [{ v: "REMOTE", l: "Remote" }, { v: "HYBRID", l: "Hybrid" }, { v: "ON_SITE", l: "On-site" }];
const LEVEL_OPTIONS    = [{ v: "JUNIOR", l: "Junior" }, { v: "MID", l: "Mid-level" }, { v: "SENIOR", l: "Senior" }, { v: "LEAD", l: "Lead" }];
const EMP_OPTIONS      = [{ v: "FULL_TIME", l: "Full-time" }, { v: "PART_TIME", l: "Part-time" }, { v: "CONTRACT", l: "Contract" }];
const STATUS_OPTIONS   = [{ v: "ACTIVE", l: "Active" }, { v: "DRAFT", l: "Draft" }, { v: "CLOSED", l: "Closed" }];

interface JobForEdit {
  id:              string;
  title:           string;
  description:     string;
  experienceLevel: string;
  remoteType:      string;
  employmentType:  string;
  city:            string | null;
  salaryMin:       number | null;
  salaryMax:       number | null;
  status:          string;
  category:        { slug: string };
  tags:            { tag: { name: string } }[];
}

export function EditJobDrawer({ job }: { job: JobForEdit }) {
  const router = useRouter();
  const [open, setOpen]     = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const [form, setForm] = useState({
    title:           job.title,
    description:     job.description,
    categorySlug:    job.category.slug,
    experienceLevel: job.experienceLevel,
    remoteType:      job.remoteType,
    employmentType:  job.employmentType,
    city:            job.city ?? "",
    salaryMin:       job.salaryMin ? String(job.salaryMin) : "",
    salaryMax:       job.salaryMax ? String(job.salaryMax) : "",
    status:          job.status,
    tags:            job.tags.map(t => t.tag.name).join(", "),
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
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
          status:          form.status,
          tags:            form.tags.split(",").map(t => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        className="btn btn-ghost btn-icon btn-sm"
        title="Edit listing"
        onClick={() => setOpen(true)}
      >
        <Edit2 size={13} />
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          {/* Backdrop */}
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div style={{
            position: "relative", marginLeft: "auto", width: "100%", maxWidth: 600,
            background: "var(--surface)", borderLeft: "1px solid var(--border)",
            display: "flex", flexDirection: "column", height: "100%", overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, margin: 0 }}>Edit listing</p>
                <p className="body-s" style={{ color: "var(--text-muted)", margin: 0 }}>{job.title}</p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setOpen(false)}><X size={16} /></button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                <Field label="Job title">
                  <input className="input" value={form.title} onChange={set("title")} />
                </Field>

                <Field label="Description">
                  <textarea className="input" value={form.description} onChange={set("description")}
                    rows={10} style={{ resize: "vertical", minHeight: 200 }} />
                  <p className="mono-s" style={{ color: "var(--text-subtle)", marginTop: 4 }}>{form.description.length} chars (min 100)</p>
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Category">
                    <select className="select" value={form.categorySlug} onChange={set("categorySlug")}>
                      {CATEGORIES.slice(1).map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select className="select" value={form.status} onChange={set("status")}>
                      {STATUS_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </Field>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  <Field label="Work type">
                    <select className="select" value={form.remoteType} onChange={set("remoteType")}>
                      {REMOTE_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </Field>
                  <Field label="Employment">
                    <select className="select" value={form.employmentType} onChange={set("employmentType")}>
                      {EMP_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </Field>
                  <Field label="Level">
                    <select className="select" value={form.experienceLevel} onChange={set("experienceLevel")}>
                      {LEVEL_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="City">
                  <select className="select" value={form.city} onChange={set("city")}>
                    <option value="">No specific city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Salary min (€)">
                    <input className="input" type="number" value={form.salaryMin} onChange={set("salaryMin")} placeholder="e.g. 40000" />
                  </Field>
                  <Field label="Salary max (€)">
                    <input className="input" type="number" value={form.salaryMax} onChange={set("salaryMax")} placeholder="e.g. 70000" />
                  </Field>
                </div>

                <Field label="Skills / tags" hint="Comma-separated, up to 10">
                  <input className="input" value={form.tags} onChange={set("tags")} placeholder="React, TypeScript, Node.js" />
                </Field>

                {error && <p className="body-s" style={{ color: "var(--error)" }}>{error}</p>}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, flexShrink: 0 }}>
              <button className="btn btn-accent" onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
                {saving ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving…</> : <><Save size={14} /> Save changes</>}
              </button>
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label className="body-s" style={{ fontWeight: 500 }}>
        {label}{hint && <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}> — {hint}</span>}
      </label>
      {children}
    </div>
  );
}
