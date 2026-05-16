"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Category { id: string; name: string; slug: string; jobCount?: number }
interface Tag      { id: string; name: string; slug: string }

function TaxonomySection<T extends { id: string; name: string; slug: string }>({
  title, items, endpoint, countKey,
}: {
  title: string;
  items: T[];
  endpoint: string;
  countKey?: keyof T;
}) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!newName.trim()) return;
    setBusy(true);
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    setBusy(false);
    router.refresh();
  }

  async function del(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, background: "var(--surface)" }}>
      <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{title} <span style={{ color: "var(--text-subtle)", fontWeight: 400, fontSize: 13 }}>({items.length})</span></h2>

      {/* Add form */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder={`New ${title.toLowerCase().replace("s", "")} name…`}
          style={{
            flex: 1, fontFamily: "var(--font-sans)", fontSize: 13, padding: "7px 12px",
            border: "1px solid var(--border)", borderRadius: 7, background: "var(--bg)",
            color: "var(--text)", outline: "none",
          }}
        />
        <button
          onClick={add}
          disabled={busy || !newName.trim()}
          style={{
            padding: "7px 16px", borderRadius: 7, border: "none",
            background: "var(--accent)", color: "#fff",
            fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
            cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1,
          }}
        >
          Add
        </button>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map(item => (
          <div key={item.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 12px", borderRadius: 7, background: "var(--bg-muted)",
          }}>
            <div>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500 }}>{item.name}</span>
              <span className="mono-s" style={{ color: "var(--text-subtle)", marginLeft: 8, fontSize: 11 }}>{item.slug}</span>
              {countKey && (item as Record<string, unknown>)[countKey as string] !== undefined && (
                <span className="mono-s" style={{ color: "var(--text-subtle)", marginLeft: 6, fontSize: 11 }}>
                  · {(item as Record<string, unknown>)[countKey as string] as number} jobs
                </span>
              )}
            </div>
            <button
              onClick={() => del(item.id, item.name)}
              style={{
                padding: "3px 10px", borderRadius: 5, border: "1px solid var(--border)",
                background: "transparent", color: "#ef4444",
                fontFamily: "var(--font-sans)", fontSize: 11, cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminTaxonomyPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags,       setTags]       = useState<Tag[]>([]);
  const [loading,    setLoading]    = useState(true);

  async function load() {
    const [catRes, tagRes] = await Promise.all([
      fetch("/api/admin/categories").then(r => r.json()),
      fetch("/api/admin/tags").then(r => r.json()),
    ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setCategories(catRes.map((c: any) => ({ ...c, jobCount: c._count?.jobs ?? 0 })));
    setTags(tagRes);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div style={{ color: "var(--text-subtle)", fontSize: 13 }}>Loading…</div>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Categories & Tags</h1>
        <p className="body-s" style={{ color: "var(--text-subtle)" }}>Manage the taxonomy used to organise job listings</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <TaxonomySection title="Categories" items={categories} endpoint="/api/admin/categories" countKey="jobCount" />
        <TaxonomySection title="Tags" items={tags} endpoint="/api/admin/tags" />
      </div>
    </div>
  );
}
