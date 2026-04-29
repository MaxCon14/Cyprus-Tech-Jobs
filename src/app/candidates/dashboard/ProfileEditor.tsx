"use client";

import { useState, useRef } from "react";
import { Code2, Link2, Globe, AtSign, Save, Loader2, Plus, Trash2, Sliders, Bell, FileText, Eye, Upload, X, Camera } from "lucide-react";
import type { CandidateRow, PositionRow } from "@/lib/candidate-types";
import { CATEGORY_OPTIONS, EXPERIENCE_LEVEL_OPTIONS } from "@/lib/onboarding-types";
import { CITIES } from "@/lib/placeholder-data";

// ─── CV section ──────────────────────────────────────────────────────────────

function fileLabel(url: string): string {
  try {
    const parts = new URL(url).pathname.split("/");
    const name = parts[parts.length - 1];
    return decodeURIComponent(name);
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

export function CvSection({ candidate }: { candidate: CandidateRow }) {
  const [editing, setEditing]   = useState(!candidate.cvUrl);
  const [tab, setTab]           = useState<"upload" | "link">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [linkUrl, setLinkUrl]   = useState(candidate.cvUrl ?? "");
  const [savingLink, setSavingLink] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUrl  = candidate.cvUrl;
  const currentHref = currentUrl
    ? (currentUrl.startsWith("http") ? currentUrl : `https://${currentUrl}`)
    : null;

  function handleFileChange(file: File | null) {
    if (!file) return;
    setError(null);
    setSelectedFile(file);
  }

  async function uploadFile() {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    const body = new FormData();
    body.append("file", selectedFile);
    const res = await fetch("/api/candidates/upload-cv", { method: "POST", body });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { setError(data.error ?? "Upload failed."); return; }
    window.location.reload();
  }

  async function saveLink() {
    setSavingLink(true);
    setError(null);
    await fetch("/api/candidates/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvUrl: linkUrl.trim() || null }),
    });
    setSavingLink(false);
    window.location.reload();
  }

  function cancel() {
    setEditing(false);
    setSelectedFile(null);
    setError(null);
    setLinkUrl(candidate.cvUrl ?? "");
  }

  const EXT_BADGE: Record<string, string> = { pdf: "#e53e3e", doc: "#2b6cb0", docx: "#2b6cb0" };
  const fileExt = selectedFile?.name.split(".").pop()?.toLowerCase() ?? "";

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileText size={14} style={{ color: "var(--accent)" }} />
          <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", margin: 0 }}>CV / Résumé</p>
        </div>
        {!editing ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
            {currentUrl ? "Change CV" : "Add CV"}
          </button>
        ) : currentUrl && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={cancel} style={{ color: "var(--text-subtle)" }}>
            Cancel
          </button>
        )}
      </div>

      <div style={{ padding: "20px" }}>
        {/* Current CV display */}
        {!editing && currentUrl && currentHref && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <FileText size={16} style={{ color: "var(--accent)", flexShrink: 0 }} />
            <p className="body-s" style={{ flex: 1, minWidth: 0, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {fileLabel(currentUrl)}
            </p>
            <a href={currentHref} target="_blank" rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ display: "flex", alignItems: "center", gap: 5, textDecoration: "none", flexShrink: 0 }}>
              <Eye size={12} /> Preview
            </a>
          </div>
        )}

        {!editing && !currentUrl && (
          <p className="body-s" style={{ color: "var(--text-subtle)", fontStyle: "italic" }}>
            No CV added yet. Employers see a &quot;No CV&quot; badge on your application.
          </p>
        )}

        {/* Editor */}
        {editing && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Tab toggle */}
            <div style={{ display: "flex", gap: 0, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", alignSelf: "flex-start" }}>
              {(["upload", "link"] as const).map((t) => (
                <button key={t} type="button" onClick={() => { setTab(t); setError(null); setSelectedFile(null); }}
                  style={{ padding: "7px 16px", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, cursor: "pointer", border: "none", background: tab === t ? "var(--accent)" : "transparent", color: tab === t ? "var(--white)" : "var(--text-muted)", transition: "all 120ms" }}>
                  {t === "upload" ? "Upload file" : "Use a link"}
                </button>
              ))}
            </div>

            {/* Upload tab */}
            {tab === "upload" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />

                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0] ?? null); }}
                    style={{
                      border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: 10, padding: "32px 20px", textAlign: "center", cursor: "pointer",
                      background: dragOver ? "var(--accent-soft)" : "var(--bg-muted)",
                      transition: "all 150ms",
                    }}
                  >
                    <Upload size={24} style={{ color: "var(--text-subtle)", margin: "0 auto 10px", display: "block" }} />
                    <p className="body-s" style={{ color: "var(--text)", fontWeight: 600, marginBottom: 4 }}>
                      Click to browse or drag & drop
                    </p>
                    <p className="mono-s" style={{ color: "var(--text-subtle)" }}>PDF, DOC or DOCX · Max 10 MB</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--bg-muted)", borderRadius: 10, border: "1px solid var(--border)" }}>
                    <span style={{ padding: "3px 7px", borderRadius: 4, background: EXT_BADGE[fileExt] ?? "var(--text-subtle)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                      {fileExt.toUpperCase()}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {selectedFile.name}
                      </p>
                      <p className="mono-s" style={{ color: "var(--text-subtle)" }}>
                        {(selectedFile.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button type="button" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="btn btn-ghost btn-icon" style={{ color: "var(--text-subtle)", flexShrink: 0 }}>
                      <X size={14} />
                    </button>
                  </div>
                )}

                {error && <p className="body-s" style={{ color: "var(--error)" }}>{error}</p>}

                <button type="button" onClick={uploadFile} disabled={!selectedFile || uploading}
                  className="btn btn-accent" style={{ width: "100%", justifyContent: "center", gap: 8 }}>
                  {uploading
                    ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Uploading…</>
                    : <><Upload size={14} /> Upload CV</>}
                </button>
              </div>
            )}

            {/* Link tab */}
            {tab === "link" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ position: "relative" }}>
                  <Link2 size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
                  <input className="input" type="url" value={linkUrl}
                    placeholder="drive.google.com/file/… or dropbox.com/s/…"
                    onChange={(e) => setLinkUrl(e.target.value)}
                    style={{ paddingLeft: 36 }} autoFocus />
                </div>
                <p className="mono-s" style={{ color: "var(--text-subtle)" }}>Make sure the link is publicly accessible.</p>
                {error && <p className="body-s" style={{ color: "var(--error)" }}>{error}</p>}
                <button type="button" onClick={saveLink} disabled={!linkUrl.trim() || savingLink}
                  className="btn btn-accent" style={{ width: "100%", justifyContent: "center", gap: 8 }}>
                  {savingLink
                    ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving…</>
                    : <><Save size={14} /> Save link</>}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Avatar hero (inline photo upload inside the hero banner) ────────────────

export function AvatarHero({ candidate }: { candidate: CandidateRow }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [hovered, setHovered]     = useState(false);
  const [imgError, setImgError]   = useState(false);
  const inputRef                  = useRef<HTMLInputElement>(null);

  const initials    = (candidate.firstName?.[0] ?? candidate.email[0]).toUpperCase();
  const displayName = [candidate.firstName, candidate.lastName].filter(Boolean).join(" ") || candidate.email;

  async function handleFile(f: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("JPEG, PNG or WebP only.");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setError("Image must be under 2 MB.");
      return;
    }
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", f);
    const res  = await fetch("/api/candidates/upload-avatar", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) {
      setUploading(false);
      setError(data.error ?? "Upload failed.");
      return;
    }
    window.location.reload();
  }

  const showOverlay = hovered || uploading;

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={candidate.avatarUrl ? "Change photo" : "Add a photo"}
        style={{
          width: 72, height: 72, borderRadius: 14, overflow: "hidden",
          background: "var(--accent-soft)", border: "2px solid var(--accent)",
          display: "grid", placeItems: "center",
          cursor: uploading ? "wait" : "pointer",
          position: "relative",
        }}
      >
        {candidate.avatarUrl && !imgError
          ? <img src={candidate.avatarUrl} alt={displayName} onError={() => setImgError(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 26, color: "var(--accent)" }}>{initials}</span>
        }
        {showOverlay && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "grid", placeItems: "center",
          }}>
            {uploading
              ? <Loader2 size={20} style={{ color: "#fff", animation: "spin 1s linear infinite" }} />
              : <Camera size={20} style={{ color: "#fff" }} />
            }
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      {error && (
        <p className="mono-s" style={{ color: "var(--error)", marginTop: 4, maxWidth: 80, lineHeight: 1.3 }}>{error}</p>
      )}
    </div>
  );
}

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
        <div className="dash-form-two-col">
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
  { key: "githubUrl",    label: "GitHub",    icon: <Code2 size={14} />,  placeholder: "github.com/yourname" },
  { key: "linkedinUrl", label: "LinkedIn",  icon: <Link2 size={14} />,   placeholder: "linkedin.com/in/yourname" },
  { key: "portfolioUrl",label: "Portfolio", icon: <Globe size={14} />,   placeholder: "yourportfolio.com" },
  { key: "dribbbleUrl", label: "Dribbble",  icon: <AtSign size={14} />,  placeholder: "dribbble.com/yourname" },
  { key: "behanceUrl",  label: "Behance",   icon: <AtSign size={14} />,  placeholder: "behance.net/yourname" },
  { key: "twitterUrl",  label: "Twitter/X", icon: <AtSign size={14} />,  placeholder: "x.com/yourname" },
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
                  <span className="mono-s" style={{ color: "var(--accent)", marginLeft: "auto" }}>{val}</span>
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
              <div className="dash-form-two-col">
                <InputField label="Job title" value={form.title} onChange={formField("title")} placeholder="Senior Engineer" required />
                <InputField label="Company" value={form.company} onChange={formField("company")} placeholder="Wargaming" required />
              </div>
              <div className="dash-form-two-col">
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
          <select className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}>
            <option value="">Any city</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
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
