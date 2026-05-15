"use client";
import { useState } from "react";
import { AdminTable, AdminTr, AdminTd, StatusBadge } from "./AdminTable";
import { RowActions } from "./RowActions";
import { AdminSearchInput } from "./AdminSearchInput";

interface Company {
  id: string; name: string; website: string | null;
  city: string | null; size: string | null;
  _count: { jobs: number };
  verified: boolean; featured: boolean;
}

interface Props { companies: Company[] }

export function CompaniesTableClient({ companies }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query
    ? companies.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.website ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : companies;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p className="body-s" style={{ color: "var(--text-subtle)", margin: 0 }}>
          {filtered.length}{query ? ` of ${companies.length}` : ""} company profiles
        </p>
        <AdminSearchInput placeholder="Name or website…" value={query} onChange={setQuery} />
      </div>

      <AdminTable columns={["Name", "City", "Size", "Active jobs", "Verified", "Featured", "Actions"]}>
        {filtered.length === 0 ? (
          <tr><td colSpan={7} style={{ padding: "24px 16px", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-subtle)" }}>No companies match "{query}"</td></tr>
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
    </>
  );
}
