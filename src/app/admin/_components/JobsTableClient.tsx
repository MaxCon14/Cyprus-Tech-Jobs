"use client";
import { useState } from "react";
import Link from "next/link";
import { AdminTable, AdminTr, AdminTd, StatusBadge } from "./AdminTable";
import { RowActions } from "./RowActions";
import { AdminSearchInput } from "./AdminSearchInput";

interface Job {
  id: string; title: string;
  company: { name: string };
  category: { name: string };
  status: string;
  _count: { applyClicks: number };
  postedAt: string | null;
}

interface Props { jobs: Job[] }

export function JobsTableClient({ jobs }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query
    ? jobs.filter(j =>
        j.title.toLowerCase().includes(query.toLowerCase()) ||
        j.company.name.toLowerCase().includes(query.toLowerCase())
      )
    : jobs;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p className="body-s" style={{ color: "var(--text-subtle)", margin: 0 }}>
          {filtered.length}{query ? ` of ${jobs.length}` : ""} listings
        </p>
        <AdminSearchInput placeholder="Job title or company…" value={query} onChange={setQuery} />
      </div>

      <AdminTable columns={["Title", "Company", "Category", "Status", "Clicks", "Posted", "Actions"]}>
        {filtered.length === 0 ? (
          <tr><td colSpan={7} style={{ padding: "24px 16px", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-subtle)" }}>No jobs match "{query}"</td></tr>
        ) : filtered.map(j => (
          <AdminTr key={j.id}>
            <AdminTd>
              <div style={{ fontWeight: 600, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.title}</div>
            </AdminTd>
            <AdminTd subtle>{j.company.name}</AdminTd>
            <AdminTd subtle>{j.category.name}</AdminTd>
            <AdminTd><StatusBadge status={j.status} /></AdminTd>
            <AdminTd mono right>{j._count.applyClicks}</AdminTd>
            <AdminTd subtle mono>
              {j.postedAt ? new Date(j.postedAt).toLocaleDateString("en-GB") : "—"}
            </AdminTd>
            <AdminTd>
              <RowActions actions={[
                ...(j.status === "ACTIVE"
                  ? [{ label: "Unpublish", endpoint: `/api/admin/jobs/${j.id}`, method: "PATCH" as const, body: { status: "PAUSED" } }]
                  : j.status === "PAUSED"
                  ? [{ label: "Publish",   endpoint: `/api/admin/jobs/${j.id}`, method: "PATCH" as const, body: { status: "ACTIVE" } }]
                  : []
                ),
                { label: "Delete", endpoint: `/api/admin/jobs/${j.id}`, method: "DELETE" as const, confirm: `Delete "${j.title}"?`, destructive: true },
              ]} />
              <Link href={`/admin/jobs/${j.id}/edit`} style={{ display: "inline-block", marginTop: 4, fontSize: 11, color: "var(--text-subtle)", textDecoration: "none" }}>Edit →</Link>
            </AdminTd>
          </AdminTr>
        ))}
      </AdminTable>
    </>
  );
}
