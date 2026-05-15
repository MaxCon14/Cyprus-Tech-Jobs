"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type SectionType = "h2" | "h3" | "paragraph" | "list" | "callout" | "quote";
export interface SectionForForm { type: SectionType; text?: string; items?: string[]; variant?: string }
type Section = SectionForForm;

interface FormData {
  title: string; excerpt: string; author: string; authorRole: string;
  category: string; tags: string; readTime: string; published: boolean;
}

const INPUT: React.CSSProperties = {
  fontFamily: "var(--font-sans)", fontSize: 13, padding: "8px 12px",
  border: "1px solid var(--border)", borderRadius: 7,
  background: "var(--surface)", color: "var(--text)", outline: "none", width: "100%",
};
const LABEL = (label: string, node: React.ReactNode) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{label}</span>
    {node}
  </label>
);

function SectionEditor({ section, onChange, onRemove }: {
  section: Section;
  onChange: (s: Section) => void;
  onRemove: () => void;
}) {
  const bgColor: Record<string, string> = {
    h2: "var(--accent-soft)", h3: "var(--bg-muted)", paragraph: "var(--surface)",
    list: "var(--success-bg, #f0fdf4)", callout: "var(--warning-bg)", quote: "var(--info-bg, #eff6ff)",
  };

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: bgColor[section.type] ?? "var(--surface)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <select
          value={section.type}
          onChange={e => onChange({ type: e.target.value as SectionType })}
          style={{ ...INPUT, width: "auto", fontSize: 12, padding: "4px 8px" }}
        >
          {(["h2", "h3", "paragraph", "quote", "list", "callout"] as const).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {section.type === "callout" && (
          <select
            value={section.variant ?? "info"}
            onChange={e => onChange({ ...section, variant: e.target.value })}
            style={{ ...INPUT, width: "auto", fontSize: 12, padding: "4px 8px" }}
          >
            <option value="info">Info</option>
            <option value="tip">Tip</option>
            <option value="warning">Warning</option>
          </select>
        )}
        <button onClick={onRemove} style={{ marginLeft: "auto", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 13 }}>✕</button>
      </div>

      {section.type === "list" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(section.items ?? [""]).map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 6 }}>
              <input
                style={{ ...INPUT, flex: 1 }}
                value={item}
                onChange={e => {
                  const items = [...(section.items ?? [])];
                  items[i] = e.target.value;
                  onChange({ ...section, items });
                }}
                placeholder={`List item ${i + 1}`}
              />
              <button onClick={() => {
                const items = (section.items ?? []).filter((_, j) => j !== i);
                onChange({ ...section, items });
              }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>✕</button>
            </div>
          ))}
          <button onClick={() => onChange({ ...section, items: [...(section.items ?? []), ""] })}
            style={{ alignSelf: "flex-start", fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
            + Add item
          </button>
        </div>
      ) : (
        <textarea
          style={{ ...INPUT, resize: "vertical", lineHeight: 1.6 }}
          rows={section.type === "paragraph" ? 4 : 2}
          value={section.text ?? ""}
          onChange={e => onChange({ ...section, text: e.target.value })}
          placeholder={`${section.type} content…`}
        />
      )}
    </div>
  );
}

export function AdminBlogForm({ initial, postId }: {
  initial?: { meta: FormData; sections: Section[] };
  postId?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [meta, setMeta] = useState<FormData>(initial?.meta ?? {
    title: "", excerpt: "", author: "CyprusTech.Jobs Editorial",
    authorRole: "Editorial", category: "Market Insights", tags: "",
    readTime: "5", published: true,
  });
  const [sections, setSections] = useState<Section[]>(initial?.sections ?? []);

  const setMF = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setMeta(p => ({ ...p, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  function addSection(type: SectionType) {
    setSections(p => [...p, type === "list" ? { type, items: [""] } : { type }]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      ...meta,
      readTime: Number(meta.readTime),
      tags: meta.tags.split(",").map(t => t.trim()).filter(Boolean),
      content: sections,
    };
    const res = await fetch(postId ? `/api/admin/blog/${postId}` : "/api/admin/blog", {
      method: postId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (res.ok) router.push("/admin/blog");
    else alert("Error saving post");
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 800 }}>
      {/* Meta */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 20, background: "var(--surface)", display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Post details</h2>
        {LABEL("Title *", <input required style={INPUT} value={meta.title} onChange={setMF("title")} />)}
        {LABEL("Excerpt *", <textarea required rows={2} style={{ ...INPUT, resize: "vertical" }} value={meta.excerpt} onChange={setMF("excerpt")} />)}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {LABEL("Author", <input style={INPUT} value={meta.author} onChange={setMF("author")} />)}
          {LABEL("Author role", <input style={INPUT} value={meta.authorRole} onChange={setMF("authorRole")} />)}
          {LABEL("Category", (
            <select style={INPUT} value={meta.category} onChange={setMF("category")}>
              <option>Market Insights</option>
              <option>Employer Guides</option>
              <option>Regulation</option>
            </select>
          ))}
          {LABEL("Read time (min)", <input type="number" style={INPUT} value={meta.readTime} onChange={setMF("readTime")} min={1} />)}
          {LABEL("Tags (comma-separated)", <input style={INPUT} value={meta.tags} onChange={setMF("tags")} placeholder="Cyprus, Hiring, Fintech" />)}
          <label style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 20, cursor: "pointer", fontSize: 13 }}>
            <input type="checkbox" checked={meta.published} onChange={setMF("published")} />
            Published (visible on site)
          </label>
        </div>
      </div>

      {/* Content sections */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 20, background: "var(--surface)" }}>
        <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Content sections</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {sections.map((s, i) => (
            <SectionEditor
              key={i} section={s}
              onChange={updated => setSections(p => p.map((x, j) => j === i ? updated : x))}
              onRemove={() => setSections(p => p.filter((_, j) => j !== i))}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["paragraph", "h2", "h3", "list", "callout", "quote"] as const).map(t => (
            <button key={t} type="button" onClick={() => addSection(t)} style={{
              padding: "5px 12px", borderRadius: 6, border: "1px solid var(--border)",
              background: "var(--bg-muted)", fontFamily: "var(--font-sans)", fontSize: 12, cursor: "pointer",
            }}>
              + {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={busy} className="btn btn-accent" style={{ opacity: busy ? 0.6 : 1 }}>
          {busy ? "Saving…" : postId ? "Save changes" : "Publish post"}
        </button>
        <button type="button" onClick={() => router.push("/admin/blog")} className="btn btn-outline">Cancel</button>
      </div>
    </form>
  );
}
