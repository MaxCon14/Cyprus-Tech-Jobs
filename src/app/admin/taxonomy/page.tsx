"use client";
import { useCallback, useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  jobCount: number;
  childCount: number;
}
interface Tag { id: string; name: string; slug: string }

/* Shared bits ─────────────────────────────────────────────── */

const inputStyle: React.CSSProperties = {
  flex: 1, fontFamily: "var(--font-sans)", fontSize: 13, padding: "7px 12px",
  border: "1px solid var(--border)", borderRadius: 7, background: "var(--bg)",
  color: "var(--text)", outline: "none",
};

function AddButton({ onClick, busy, disabled }: { onClick: () => void; busy: boolean; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={busy || disabled}
      style={{
        padding: "7px 16px", borderRadius: 7, border: "none",
        background: "var(--accent)", color: "#fff",
        fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
        cursor: busy || disabled ? "not-allowed" : "pointer", opacity: busy || disabled ? 0.6 : 1,
      }}
    >
      Add
    </button>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "3px 10px", borderRadius: 5, border: "1px solid var(--border)",
        background: "transparent", color: "#ef4444",
        fontFamily: "var(--font-sans)", fontSize: 11, cursor: "pointer",
      }}
    >
      Delete
    </button>
  );
}

function Panel({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, background: "var(--surface)" }}>
      <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
        {title} <span style={{ color: "var(--text-subtle)", fontWeight: 400, fontSize: 13 }}>({count})</span>
      </h2>
      {children}
    </div>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p className="body-s" style={{ color: "#ef4444", margin: "0 0 12px" }} role="alert">
      {message}
    </p>
  );
}

/* Categories ──────────────────────────────────────────────────
   Rendered as the two-level tree the site actually filters on, rather than one
   flat alphabetical list. A subcategory that looks top-level here is a job
   nobody can find: /jobs?category=<slug> matches a category and its children,
   so anything sitting loose at the root belongs to no parent page. */

function CategorySection({ items, reload }: { items: Category[]; reload: () => void }) {
  const [newName,  setNewName]  = useState("");
  const [parentId, setParentId] = useState("");
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState("");

  const parents = items.filter(c => !c.parentId);

  async function add() {
    if (!newName.trim()) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/categories", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: newName.trim(), parentId: parentId || null }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not add that category.");
      return;
    }
    setNewName("");
    reload();
  }

  async function del(cat: Category) {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    setError("");
    const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not delete that category.");
      return;
    }
    reload();
  }

  return (
    <Panel title="Categories" count={items.length}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="New category name…"
          style={inputStyle}
        />
        <AddButton onClick={add} busy={busy} disabled={!newName.trim()} />
      </div>
      <select
        value={parentId}
        onChange={e => setParentId(e.target.value)}
        aria-label="Parent category"
        style={{ ...inputStyle, width: "100%", flex: "none", marginBottom: 20 }}
      >
        <option value="">Top-level category</option>
        {parents.map(p => <option key={p.id} value={p.id}>Under {p.name}</option>)}
      </select>

      {error && <ErrorNote message={error} />}

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {parents.map(parent => (
          <div key={parent.id}>
            <CategoryRow cat={parent} onDelete={() => del(parent)} />
            <div style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 2, marginTop: 2 }}>
              {items.filter(c => c.parentId === parent.id).map(child => (
                <CategoryRow key={child.id} cat={child} onDelete={() => del(child)} nested />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function CategoryRow({ cat, onDelete, nested = false }: { cat: Category; onDelete: () => void; nested?: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 12px", borderRadius: 7,
      background: nested ? "transparent" : "var(--bg-muted)",
      border: nested ? "1px solid var(--border)" : "none",
    }}>
      <div>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: nested ? 400 : 600 }}>{cat.name}</span>
        <span className="mono-s" style={{ color: "var(--text-subtle)", marginLeft: 8, fontSize: 11 }}>{cat.slug}</span>
        <span className="mono-s" style={{ color: "var(--text-subtle)", marginLeft: 6, fontSize: 11 }}>
          · {cat.jobCount} jobs
        </span>
      </div>
      <DeleteButton onClick={onDelete} />
    </div>
  );
}

/* Tags ─────────────────────────────────────────────────────── */

function TagSection({ items, reload }: { items: Tag[]; reload: () => void }) {
  const [newName, setNewName] = useState("");
  const [busy,    setBusy]    = useState(false);

  async function add() {
    if (!newName.trim()) return;
    setBusy(true);
    await fetch("/api/admin/tags", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    setBusy(false);
    reload();
  }

  async function del(tag: Tag) {
    if (!confirm(`Delete "${tag.name}"?`)) return;
    await fetch(`/api/admin/tags/${tag.id}`, { method: "DELETE" });
    reload();
  }

  return (
    <Panel title="Tags" count={items.length}>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="New tag name…"
          style={inputStyle}
        />
        <AddButton onClick={add} busy={busy} disabled={!newName.trim()} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map(tag => (
          <div key={tag.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 12px", borderRadius: 7, background: "var(--bg-muted)",
          }}>
            <div>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500 }}>{tag.name}</span>
              <span className="mono-s" style={{ color: "var(--text-subtle)", marginLeft: 8, fontSize: 11 }}>{tag.slug}</span>
            </div>
            <DeleteButton onClick={() => del(tag)} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* Page ─────────────────────────────────────────────────────── */

export default function AdminTaxonomyPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags,       setTags]       = useState<Tag[]>([]);
  const [loading,    setLoading]    = useState(true);

  /* Both lists are fetched here on the client, so a write has to re-fetch them.
     This used to call router.refresh(), which re-renders the server component
     and leaves client-fetched state exactly as it was — added categories only
     appeared after a manual reload. */
  const load = useCallback(async () => {
    const [catRes, tagRes] = await Promise.all([
      fetch("/api/admin/categories").then(r => r.json()),
      fetch("/api/admin/tags").then(r => r.json()),
    ]);
    setCategories(catRes.map((c: {
      id: string; name: string; slug: string; parentId: string | null;
      _count?: { jobs?: number; children?: number };
    }) => ({
      id:         c.id,
      name:       c.name,
      slug:       c.slug,
      parentId:   c.parentId,
      jobCount:   c._count?.jobs     ?? 0,
      childCount: c._count?.children ?? 0,
    })));
    setTags(tagRes);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{ color: "var(--text-subtle)", fontSize: 13 }}>Loading…</div>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Categories &amp; Tags</h1>
        <p className="body-s" style={{ color: "var(--text-subtle)" }}>Manage the taxonomy used to organise job listings</p>
      </div>
      <div className="admin-grid-2" style={{ gap: 24 }}>
        <CategorySection items={categories} reload={load} />
        <TagSection      items={tags}       reload={load} />
      </div>
    </div>
  );
}
