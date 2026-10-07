"use client";
import { useState } from "react";
import { AdminTable, AdminTr, AdminTd, StatusBadge } from "./AdminTable";
import { RowActions } from "./RowActions";
import { AdminSearchInput } from "./AdminSearchInput";
import { Pagination, PAGE_SIZE } from "./Pagination";

interface Company {
  id: string; name: string; website: string | null;
  city: string | null; size: string | null;
  _count: { jobs: number };
  verified: boolean; featured: boolean;
}

interface Props { companies: Company[] }

export function CompaniesTableClient({ companies }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const matched = query
    ? companies.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.website ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : companies;

  const results = matched.filter(c => filter === "all" || (filter === "verified" && c.verified) || (filter === "unverified" && !c.verified) || (filter === "featured" && c.featured));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(results.length / PAGE_SIZE)));
  const filtered = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  return (
    <section className="adm-panel adm-management">
      <div className="adm-tabs" aria-label="Filter companies">{["all", "verified", "unverified", "featured"].map(f => <button type="button" key={f} aria-pressed={filter === f} onClick={() => { setFilter(f); setPage(1); }}>{f === "all" ? "All companies" : f.charAt(0).toUpperCase() + f.slice(1)}</button>)}</div>
      <div className="adm-toolbar"><AdminSearchInput placeholder="Search company or website…" value={query} onChange={v => { setQuery(v); setPage(1); }} /><span className="adm-muted">{results.length} company profiles</span></div>
      <AdminTable columns={["Name", "City", "Size", "Active jobs", "Verified", "Featured", "Actions"]}>
        {filtered.length === 0 ? (
          <tr><td colSpan={7} style={{ padding: "24px 16px", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-subtle)" }}>No companies found. Try a different search or filter.</td></tr>
        ) : filtered.map(c => (
          <AdminTr key={c.id}>
            <AdminTd>
              <div style={{ fontWeight: 600 }}>{c.name}</div>
              {c.website && <div className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 10 }}>{c.website}</div>}
            </AdminTd>
            <AdminTd subtle>{c.city ?? "—"}</AdminTd>
            <AdminTd subtle>{c.size ?? "—"}</AdminTd>
            <AdminTd mono>{c._count.jobs}</AdminTd>
            <AdminTd><StatusBadge status={c.verified ? "VERIFIED" : "UNVERIFIED"} /></AdminTd>
            <AdminTd><StatusBadge status={c.featured ? "FEATURED" : "—"} /></AdminTd>
            <AdminTd>
              <RowActions actions={[
                c.verified
                  ? { label: "Unverify", endpoint: `/api/admin/companies/${c.id}`, method: "PATCH", body: { verified: false } }
                  : { label: "Verify",   endpoint: `/api/admin/companies/${c.id}`, method: "PATCH", body: { verified: true } },
                c.featured
                  ? { label: "Unfeature", endpoint: `/api/admin/companies/${c.id}`, method: "PATCH", body: { featured: false } }
                  : { label: "Feature",   endpoint: `/api/admin/companies/${c.id}`, method: "PATCH", body: { featured: true } },
                { label: "Delete", endpoint: `/api/admin/companies/${c.id}`, method: "DELETE", confirm: `Delete "${c.name}"? This will also delete all their jobs.`, destructive: true },
              ]} />
            </AdminTd>
          </AdminTr>
        ))}
      </AdminTable>
      <Pagination total={results.length} page={currentPage} onChange={setPage} />
    </section>
  );
}
