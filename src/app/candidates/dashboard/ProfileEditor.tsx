"use client";

import { useState } from "react";
import { Globe, Save, Loader2, Plus, Trash2, ExternalLink, Sliders, Bell, ChevronDown } from "lucide-react";

const IconGitHub    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>;
const IconLinkedIn  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const IconDribbble  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.017-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.073c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.176zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.386z"/></svg>;
const IconBehance   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.49.35-1.06.6-1.71.75-.65.16-1.32.24-2.01.24H0V4.51h6.938v-.007zm10.002.507H23v1.52h-6.06V5.01zM3.59 7.963v3.35h3.07c.73 0 1.28-.16 1.66-.48.37-.33.56-.8.56-1.43 0-.65-.2-1.12-.6-1.42-.4-.3-.96-.44-1.75-.44H3.59zm0 5.86v3.84h3.42c.75 0 1.34-.17 1.76-.52.42-.34.63-.87.63-1.59 0-.72-.22-1.24-.67-1.56-.44-.33-1.05-.49-1.83-.49H3.59zm13.35-1.76c-.52 0-.95.14-1.28.43-.33.29-.53.71-.6 1.27h3.72c-.05-.57-.23-1-.55-1.28-.32-.27-.74-.42-1.3-.42zm-3.39 5.73c.53.55 1.27.83 2.2.83.69 0 1.28-.17 1.78-.53.5-.35.8-.72.92-1.11h2.73c-.44 1.38-1.1 2.37-2.01 2.96-.91.6-2.01.9-3.31.9-.9 0-1.71-.14-2.44-.43-.73-.3-1.35-.71-1.86-1.24-.51-.54-.9-1.18-1.17-1.92-.27-.74-.41-1.56-.41-2.44 0-.87.14-1.66.42-2.38.28-.72.67-1.35 1.18-1.87.51-.53 1.12-.93 1.84-1.23.72-.3 1.52-.44 2.41-.44.98 0 1.84.19 2.57.58.73.38 1.33.9 1.8 1.57.47.66.8 1.42.98 2.27.18.85.23 1.74.14 2.66H9.89c.03.73.24 1.3.77 1.85z"/></svg>;
const IconX         = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>;
const IconMedium    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>;
import type { CandidateRow, PositionRow } from "@/lib/candidate-types";
import { CATEGORY_OPTIONS, EXPERIENCE_LEVEL_OPTIONS, TECH_STACK_OPTIONS } from "@/lib/onboarding-types";
import { TechStackSelector } from "@/components/onboarding/TechStackSelector";
import { CvUpload } from "@/components/candidates/CvUpload";
import { CITIES } from "@/lib/placeholder-data";
import { Select } from "@/components/ui/Select";

// ─── Profile section ─────────────────────────────────────────────────────────

export function ProfileSection({ candidate }: { candidate: CandidateRow }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName:  candidate.firstName  ?? "",
    lastName:   candidate.lastName   ?? "",
    headline:   candidate.headline   ?? "",
    bio:        candidate.bio        ?? "",
    city:       candidate.city       ?? "",
    openToWork: candidate.openToWork,
  });

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: key === "openToWork" ? (e.target as HTMLInputElement).checked : e.target.value }));
  }

  async function save() {
    setSaving(true);
    await fetch("/api/candidates/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setEditing(false);
    window.location.reload();
  }

  if (!editing) {
    return (
      <Section title="Profile" onEdit={() => setEditing(true)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <p className="h3">{[candidate.firstName, candidate.lastName].filter(Boolean).join(" ") || "—"}</p>
            {candidate.headline && <p className="body-s" style={{ color: "var(--text-muted)", marginTop: 4 }}>{candidate.headline}</p>}
          </div>
          {candidate.bio && <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>{candidate.bio}</p>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            {candidate.city && <span className="tag">{candidate.city}</span>}
            <span className={`tag ${candidate.openToWork ? "tag-success" : ""}`}>
              {candidate.openToWork ? "Open to work" : "Not looking"}
            </span>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Profile" saving={saving} onSave={save} onCancel={() => setEditing(false)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <InputField label="First name" value={form.firstName} onChange={field("firstName")} placeholder="Alex" />
          <InputField label="Last name" value={form.lastName} onChange={field("lastName")} placeholder="Konstantinou" />
        </div>
        <InputField label="Headline" value={form.headline} onChange={field("headline")} placeholder="Senior React Developer · Cyprus" />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label className="body-s" style={{ fontWeight: 500, color: "var(--text)" }}>Bio</label>
          <textarea className="textarea" rows={4} value={form.bio} onChange={field("bio")} placeholder="Tell employers a bit about yourself…" />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={form.openToWork} onChange={field("openToWork")} style={{ accentColor: "var(--accent)", width: 16, height: 16 }} />
          <span className="body-s" style={{ color: "var(--text-muted)" }}>I'm open to new opportunities</span>
        </label>
      </div>
    </Section>
  );
}

// ─── Links section ────────────────────────────────────────────────────────────

const LINK_FIELDS = [
  { key: "githubUrl",    label: "GitHub",    icon: <IconGitHub />,   placeholder: "github.com/yourname" },
  { key: "linkedinUrl", label: "LinkedIn",  icon: <IconLinkedIn />, placeholder: "linkedin.com/in/yourname" },
  { key: "portfolioUrl",label: "Portfolio", icon: <Globe size={16} />, placeholder: "yourportfolio.com" },
  { key: "dribbbleUrl", label: "Dribbble",  icon: <IconDribbble />, placeholder: "dribbble.com/yourname" },
  { key: "behanceUrl",  label: "Behance",   icon: <IconBehance />,  placeholder: "behance.net/yourname" },
  { key: "twitterUrl",  label: "Twitter/X", icon: <IconX />,        placeholder: "x.com/yourname" },
  { key: "mediumUrl",   label: "Medium",    icon: <IconMedium />,   placeholder: "medium.com/@yourname" },
] as const;

export function LinksSection({ candidate }: { candidate: CandidateRow }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(() =>
    Object.fromEntries(LINK_FIELDS.map(({ key }) => [key, candidate[key] ?? ""]))
  );

  const hasAny = LINK_FIELDS.some(({ key }) => !!candidate[key]);

  async function save() {
    setSaving(true);
    const patch = Object.fromEntries(
      LINK_FIELDS.map(({ key }) => [key, form[key].trim() || null])
    );
    await fetch("/api/candidates/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    setEditing(false);
    window.location.reload();
  }

  if (!editing) {
    return (
      <Section title="Links & accounts" onEdit={() => setEditing(true)}>
        {hasAny ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {LINK_FIELDS.map(({ key, label, icon }) => {
              const val = candidate[key];
              if (!val) return null;
              return (
                <a key={key} href={val.startsWith("http") ? val : `https://${val}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text)", textDecoration: "none" }}>
                  <span style={{ color: "var(--text-subtle)", display: "flex" }}>{icon}</span>
                  <span className="body-s">{label}</span>
                  <span className="mono-s" style={{ color: "var(--accent)", marginLeft: "auto" }} title={val}>
                    {val.length > 22 ? val.slice(0, 22) + "…" : val}
                  </span>
                </a>
              );
            })}
          </div>
        ) : (
          <p className="body-s" style={{ color: "var(--text-subtle)", fontStyle: "italic" }}>
            No links added yet. Add your GitHub, portfolio, LinkedIn, and more.
          </p>
        )}
      </Section>
    );
  }

  return (
    <Section title="Links & accounts" saving={saving} onSave={save} onCancel={() => setEditing(false)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {LINK_FIELDS.map(({ key, label, icon, placeholder }) => (
          <div key={key} style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", display: "flex", pointerEvents: "none" }}>
              {icon}
            </span>
            <input className="input" type="text" value={form[key]} placeholder={placeholder}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              style={{ paddingLeft: 36 }}
              aria-label={label} />
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Work experience section ──────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(d: string | null) {
  if (!d) return "";
  const [y, m] = d.split("-");
  const month = MONTHS[parseInt(m, 10) - 1];
  return month ? `${month} ${y}` : y;
}

const EMPTY_POS = { title: "", company: "", startDate: "", endDate: "", current: false, description: "" };

export function ExperienceSection({ candidateId, initialPositions }: { candidateId: string; initialPositions: PositionRow[] }) {
  const [positions, setPositions] = useState(initialPositions);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_POS });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  function formField(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: key === "current" ? (e.target as HTMLInputElement).checked : e.target.value }));
  }

  async function addPosition() {
    if (!form.title.trim() || !form.company.trim()) return;
    setSaving(true);
    const res = await fetch("/api/candidates/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, candidateId }),
    });
    if (res.ok) {
      const pos = await res.json();
      setPositions((p) => [pos, ...p]);
      setForm({ ...EMPTY_POS });
      setAdding(false);
    }
    setSaving(false);
  }

  async function deletePosition(id: string) {
    setDeleting(id);
    await fetch(`/api/candidates/positions/${id}`, { method: "DELETE" });
    setPositions((p) => p.filter((x) => x.id !== id));
    setDeleting(null);
  }

  return (
    <Section title="Work experience" onEdit={() => setAdding(true)} editLabel="Add position">
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {positions.length === 0 && !adding && (
          <p className="body-s" style={{ color: "var(--text-subtle)", fontStyle: "italic" }}>
            No positions added yet. Add your work history to stand out.
          </p>
        )}

        {positions.map((pos, i) => (
          <div key={pos.id} style={{ paddingBottom: 20, marginBottom: 20, borderBottom: i < positions.length - 1 ? "1px solid var(--border)" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{pos.title}</p>
                <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 4 }}>{pos.company}</p>
                <p className="mono-s" style={{ color: "var(--text-subtle)" }}>
                  {formatDate(pos.startDate)} – {pos.current ? "Present" : formatDate(pos.endDate)}
                </p>
                {pos.description && <p className="body-s" style={{ color: "var(--text-muted)", marginTop: 8, lineHeight: 1.6 }}>{pos.description}</p>}
              </div>
              <button type="button" onClick={() => deletePosition(pos.id)} disabled={deleting === pos.id}
                className="btn btn-ghost btn-icon" style={{ color: "var(--text-subtle)", flexShrink: 0 }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {adding && (
          <div style={{ background: "var(--bg-muted)", borderRadius: 10, padding: "18px 20px", marginTop: positions.length > 0 ? 12 : 0 }}>
            <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 16 }}>New position</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <InputField label="Job title" value={form.title} onChange={formField("title")} placeholder="Senior Engineer" required />
                <InputField label="Company" value={form.company} onChange={formField("company")} placeholder="Wargaming" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <InputField label="Start date" value={form.startDate} onChange={formField("startDate")} placeholder="2021-03" type="month" />
                <InputField label="End date" value={form.endDate} onChange={formField("endDate")} placeholder="2024-01" type="month" disabled={form.current} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={form.current} onChange={formField("current")} style={{ accentColor: "var(--accent)", width: 15, height: 15 }} />
                <span className="body-s" style={{ color: "var(--text-muted)" }}>I currently work here</span>
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="body-s" style={{ fontWeight: 500, color: "var(--text)" }}>Description (optional)</label>
                <textarea className="textarea" rows={3} value={form.description} onChange={formField("description")}
                  placeholder="Key responsibilities and achievements…" />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setAdding(false); setForm({ ...EMPTY_POS }); }}>Cancel</button>
                <button type="button" className="btn btn-accent btn-sm" onClick={addPosition} disabled={saving || !form.title || !form.company}>
                  {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <><Plus size={13} /> Add position</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

// ─── CV section ──────────────────────────────────────────────────────────────

export function CvSection({ candidate }: { candidate: CandidateRow }) {
  const [cvUrl, setCvUrl] = useState(candidate.cvUrl ?? "");

  return (
    <Section title="CV / Résumé">
      <CvUpload
        currentUrl={cvUrl}
        onChange={(url) => {
          setCvUrl(url);
          // Persist the cleared state if user removes the CV
          if (!url) {
            fetch("/api/candidates/profile", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cvUrl: null }),
            });
          }
        }}
      />
      <p className="body-s" style={{ color: "var(--text-subtle)", marginTop: 10 }}>
        PDF only · max 5 MB. Your CV is saved automatically on upload.
      </p>
    </Section>
  );
}

// ─── Skills section ───────────────────────────────────────────────────────────

export function SkillsSection({ candidate }: { candidate: CandidateRow }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState<string[]>(candidate.skills ?? []);
  const MAX = 10;

  async function save() {
    setSaving(true);
    await fetch("/api/candidates/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills }),
    });
    setSaving(false);
    setEditing(false);
    window.location.reload();
  }

  if (!editing) {
    return (
      <Section title="Skills" onEdit={() => setEditing(true)}>
        {skills.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {skills.map((s) => (
              <span key={s} className="tag" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{s}</span>
            ))}
          </div>
        ) : (
          <p className="body-s" style={{ color: "var(--text-subtle)", fontStyle: "italic" }}>
            No skills added yet. Add up to 10 technologies you work with.
          </p>
        )}
      </Section>
    );
  }

  return (
    <Section title="Skills" saving={saving} onSave={save} onCancel={() => { setSkills(candidate.skills ?? []); setEditing(false); }}>
      <TechStackSelector
        options={skills.length >= MAX ? [] : TECH_STACK_OPTIONS}
        selected={skills}
        onChange={setSkills}
        placeholder={skills.length >= MAX ? "10/10 skills selected" : "Search skills — e.g. React, Go, PostgreSQL"}
      />
      {skills.length >= MAX && (
        <p className="body-s" style={{ color: "var(--text-muted)", marginTop: 8 }}>
          You've reached the 10-skill limit. Remove one to add another.
        </p>
      )}
    </Section>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Section({
  title, icon, children, onEdit, onSave, onCancel, saving, editLabel,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  saving?: boolean;
  editLabel?: string;
}) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon && <span style={{ color: "var(--accent)", display: "flex" }}>{icon}</span>}
          <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", margin: 0 }}>{title}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {onSave && (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} style={{ color: "var(--text-subtle)" }}>Cancel</button>
              <button type="button" className="btn btn-accent btn-sm" onClick={onSave} disabled={saving}>
                {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <><Save size={13} /> Save</>}
              </button>
            </>
          )}
          {onEdit && !onSave && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onEdit}>{editLabel ?? "Edit"}</button>
          )}
        </div>
      </div>
      <div style={{ padding: "20px 20px" }}>{children}</div>
    </div>
  );
}

function InputField({
  label, value, onChange, placeholder, required, type = "text", disabled,
}: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean; type?: string; disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label className="body-s" style={{ fontWeight: 500, color: "var(--text)" }}>
        {label}{required && <span style={{ color: "var(--error)", marginLeft: 3 }}>*</span>}
      </label>
      <input className="input" type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} />
    </div>
  );
}

// ─── Preferences section ──────────────────────────────────────────────────────

const REMOTE_OPTIONS = [
  { value: "REMOTE",  label: "Remote",   desc: "Work from anywhere" },
  { value: "HYBRID",  label: "Hybrid",   desc: "Mix of home & office" },
  { value: "ON_SITE", label: "On-site",  desc: "In the office" },
] as const;

export function PreferencesSection({ candidate }: { candidate: CandidateRow }) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form, setForm] = useState({
    categories:      candidate.categories ?? [],
    remoteType:      candidate.remoteType  ?? "",
    city:            candidate.city        ?? "",
    experienceLevel: candidate.experienceLevel ?? "",
    salaryMin:       candidate.salaryMin?.toString() ?? "",
  });

  function toggleCat(slug: string) {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(slug)
        ? f.categories.filter(c => c !== slug)
        : [...f.categories, slug],
    }));
  }

  async function save() {
    setSaving(true);
    await fetch("/api/candidates/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categories:      form.categories,
        remoteType:      form.remoteType      || null,
        city:            form.city.trim()     || null,
        experienceLevel: form.experienceLevel || null,
        salaryMin:       form.salaryMin ? parseInt(form.salaryMin, 10) : null,
      }),
    });
    setSaving(false);
    setEditing(false);
    window.location.reload();
  }

  if (!editing) {
    const rows: [string, string][] = [
      ["Categories",  candidate.categories.length > 0 ? candidate.categories.join(", ") : "All"],
      ["Work setup",  candidate.remoteType ?? "Any"],
      ["Location",    candidate.city ?? "Any city"],
      ["Level",       candidate.experienceLevel ?? "Any level"],
      ["Min salary",  candidate.salaryMin ? `€${candidate.salaryMin.toLocaleString()}` : "Not set"],
    ];
    return (
      <Section title="Job preferences" icon={<Sliders size={14} />} onEdit={() => setEditing(true)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span className="body-s" style={{ color: "var(--text-muted)" }}>{label}</span>
              <span className="mono-s" style={{ color: "var(--text)", textAlign: "right" }}>{value}</span>
            </div>
          ))}
        </div>
      </Section>
    );
  }

  return (
    <Section title="Job preferences" icon={<Sliders size={14} />} saving={saving} onSave={save} onCancel={() => setEditing(false)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Categories */}
        <div>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 10 }}>Job categories</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORY_OPTIONS.map(cat => {
              const active = form.categories.includes(cat.slug);
              return (
                <button key={cat.slug} type="button" onClick={() => toggleCat(cat.slug)}
                  style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`, background: active ? "var(--accent-soft)" : "var(--surface)", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 13, color: active ? "var(--accent)" : "var(--text)", transition: "all 150ms ease" }}>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Work arrangement */}
        <div>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 10 }}>Work arrangement</p>
          <div style={{ display: "flex", gap: 8 }}>
            {REMOTE_OPTIONS.map(opt => {
              const active = form.remoteType === opt.value;
              return (
                <button key={opt.value} type="button"
                  onClick={() => setForm(f => ({ ...f, remoteType: active ? "" : opt.value }))}
                  style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`, background: active ? "var(--accent-soft)" : "var(--surface)", cursor: "pointer", textAlign: "center", transition: "all 150ms ease" }}>
                  <div className="body-s" style={{ fontWeight: 600, color: active ? "var(--accent)" : "var(--text)", marginBottom: 2 }}>{opt.label}</div>
                  <div className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 10 }}>{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* City */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label className="body-s" style={{ fontWeight: 500, color: "var(--text)" }}>City</label>
          <Select
            name="city"
            placeholder="Any city"
            value={form.city}
            onChange={val => setForm(f => ({ ...f, city: val }))}
            options={CITIES.map(c => ({ label: c, value: c }))}
          />
        </div>

        {/* Experience level */}
        <div>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 10 }}>Experience level</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {EXPERIENCE_LEVEL_OPTIONS.map(opt => {
              const active = form.experienceLevel === opt.value;
              return (
                <button key={opt.value} type="button"
                  onClick={() => setForm(f => ({ ...f, experienceLevel: active ? "" : opt.value }))}
                  style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`, background: active ? "var(--accent-soft)" : "var(--surface)", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 13, color: active ? "var(--accent)" : "var(--text)", transition: "all 150ms ease" }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Min salary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label className="body-s" style={{ fontWeight: 500, color: "var(--text)" }}>Minimum salary (EUR / year)</label>
          <input className="input" type="number" min={0} step={1000}
            value={form.salaryMin}
            onChange={e => setForm(f => ({ ...f, salaryMin: e.target.value }))}
            placeholder="e.g. 40000" />
        </div>
      </div>
    </Section>
  );
}

// ─── Alert section ────────────────────────────────────────────────────────────

export function AlertSection({ candidate }: { candidate: CandidateRow }) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [freq, setFreq] = useState<"DAILY" | "WEEKLY">(candidate.alertFrequency as "DAILY" | "WEEKLY" ?? "WEEKLY");

  async function save() {
    setSaving(true);
    await fetch("/api/candidates/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertFrequency: freq }),
    });
    setSaving(false);
    setEditing(false);
    window.location.reload();
  }

  if (!editing) {
    return (
      <Section title="Job alerts" icon={<Bell size={14} />} onEdit={() => setEditing(true)}>
        <p className="body-s" style={{ color: "var(--text-muted)", margin: 0 }}>
          {candidate.alertFrequency === "DAILY" ? "Daily digest" : "Weekly roundup"} sent to{" "}
          <span style={{ color: "var(--text)", fontWeight: 500 }}>{candidate.email}</span>
        </p>
      </Section>
    );
  }

  return (
    <Section title="Job alerts" icon={<Bell size={14} />} saving={saving} onSave={save} onCancel={() => setEditing(false)}>
      <div style={{ display: "flex", gap: 10 }}>
        {(["WEEKLY", "DAILY"] as const).map(f => (
          <button key={f} type="button" onClick={() => setFreq(f)}
            style={{ flex: 1, padding: "12px", borderRadius: 8, border: `1.5px solid ${freq === f ? "var(--accent)" : "var(--border)"}`, background: freq === f ? "var(--accent-soft)" : "var(--surface)", cursor: "pointer", textAlign: "center", transition: "all 150ms ease" }}>
            <div className="body-s" style={{ fontWeight: 600, color: freq === f ? "var(--accent)" : "var(--text)", marginBottom: 2 }}>
              {f === "DAILY" ? "Daily" : "Weekly"}
            </div>
            <div className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 10 }}>
              {f === "DAILY" ? "Every morning" : "Every Monday"}
            </div>
          </button>
        ))}
      </div>
    </Section>
  );
}
