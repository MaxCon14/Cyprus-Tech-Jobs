"use client";
import { useState } from "react";
import { AdminTable, AdminTr, AdminTd, StatusBadge } from "./AdminTable";
import { RowActions } from "./RowActions";
import { AdminSearchInput } from "./AdminSearchInput";

interface Employer {
  id: string; name: string | null; email: string;
  company: { name: string } | null;
  plan: string; standardSlots: number; featuredSlots: number;
  blocked: boolean; createdAt: string;
}

interface Candidate {
  id: string; email: string; firstName: string | null; lastName: string | null;
  city: string | null; experienceLevel: string | null;
  blocked: boolean; createdAt: string;
}

interface Props {
  employers: Employer[];
  candidates: Candidate[];
}

function matchesQuery(query: string, ...fields: (string | null | undefined)[]): boolean {
  const q = query.toLowerCase();
  return fields.some(f => f?.toLowerCase().includes(q));
}

export function UsersTableClient({ employers, candidates }: Props) {
  const [employerQ, setEmployerQ] = useState("");
  const [candidateQ, setCandidateQ] = useState("");

  const filteredEmployers = employerQ
    ? employers.filter(e => matchesQuery(employerQ, e.name, e.email, e.company?.name))
    : employers;

  const filteredCandidates = candidateQ
    ? candidates.filter(c => matchesQuery(candidateQ, c.firstName, c.lastName, c.email))
    : candidates;

  return (
    <>
      {/* Employers */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 600, margin: 0 }}>
          Employers
          <span className="mono-s" style={{ color: "var(--text-subtle)", fontWeight: 400, marginLeft: 8 }}>
            {filteredEmployers.length}{employerQ ? ` of ${employers.length}` : ""}
          </span>
        </h2>
        <AdminSearchInput placeholder="Name, email or company…" value={employerQ} onChange={setEmployerQ} />
      </div>
      <div style={{ marginBottom: 36 }}>
        <AdminTable columns={["Name", "Email", "Company", "Plan", "Slots", "Status", "Joined", "Actions"]}>
          {filteredEmployers.length === 0 ? (
            <tr><td colSpan={8} style={{ padding: "24px 16px", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-subtle)" }}>No employers match "{employerQ}"</td></tr>
          ) : filteredEmployers.map(e => (
            <AdminTr key={e.id}>
              <AdminTd>{e.name ?? "—"}</AdminTd>
              <AdminTd subtle mono>{e.email}</AdminTd>
              <AdminTd subtle>{e.company?.name ?? "—"}</AdminTd>
              <AdminTd><StatusBadge status={e.plan} /></AdminTd>
              <AdminTd mono subtle>{e.standardSlots}s / {e.featuredSlots}f</AdminTd>
              <AdminTd><StatusBadge status={e.blocked ? "BLOCKED" : "ACTIVE"} /></AdminTd>
              <AdminTd subtle mono>{new Date(e.createdAt).toLocaleDateString("en-GB")}</AdminTd>
              <AdminTd>
                <RowActions actions={[
                  e.blocked
                    ? { label: "Unblock", endpoint: `/api/admin/users/${e.id}`, method: "PATCH", body: { type: "employer", blocked: false } }
                    : { label: "Block",   endpoint: `/api/admin/users/${e.id}`, method: "PATCH", body: { type: "employer", blocked: true }, confirm: `Block ${e.email}?` },
                  { label: "Delete", endpoint: `/api/admin/users/${e.id}`, method: "DELETE", body: { type: "employer" }, confirm: `Permanently delete ${e.email}?`, destructive: true },
                ]} />
              </AdminTd>
            </AdminTr>
          ))}
        </AdminTable>
      </div>

      {/* Candidates */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 600, margin: 0 }}>
          Candidates
          <span className="mono-s" style={{ color: "var(--text-subtle)", fontWeight: 400, marginLeft: 8 }}>
            {filteredCandidates.length}{candidateQ ? ` of ${candidates.length}` : ""}
          </span>
        </h2>
        <AdminSearchInput placeholder="Name or email…" value={candidateQ} onChange={setCandidateQ} />
      </div>
      <AdminTable columns={["Name", "Email", "City", "Level", "Status", "Joined", "Actions"]}>
        {filteredCandidates.length === 0 ? (
          <tr><td colSpan={7} style={{ padding: "24px 16px", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-subtle)" }}>No candidates match "{candidateQ}"</td></tr>
        ) : filteredCandidates.map(c => (
          <AdminTr key={c.id}>
            <AdminTd>{[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}</AdminTd>
            <AdminTd subtle mono>{c.email}</AdminTd>
            <AdminTd subtle>{c.city ?? "—"}</AdminTd>
            <AdminTd subtle>{c.experienceLevel ?? "—"}</AdminTd>
            <AdminTd><StatusBadge status={c.blocked ? "BLOCKED" : "ACTIVE"} /></AdminTd>
            <AdminTd subtle mono>{new Date(c.createdAt).toLocaleDateString("en-GB")}</AdminTd>
            <AdminTd>
              <RowActions actions={[
                c.blocked
                  ? { label: "Unblock", endpoint: `/api/admin/users/${c.id}`, method: "PATCH", body: { type: "candidate", blocked: false } }
                  : { label: "Block",   endpoint: `/api/admin/users/${c.id}`, method: "PATCH", body: { type: "candidate", blocked: true }, confirm: `Block ${c.email}?` },
                { label: "Delete", endpoint: `/api/admin/users/${c.id}`, method: "DELETE", body: { type: "candidate" }, confirm: `Permanently delete ${c.email}?`, destructive: true },
              ]} />
            </AdminTd>
          </AdminTr>
        ))}
      </AdminTable>
    </>
  );
}
