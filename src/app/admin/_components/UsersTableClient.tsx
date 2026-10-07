"use client";
import { useState } from "react";
import { AdminTable, AdminTr, AdminTd, StatusBadge } from "./AdminTable";
import { RowActions } from "./RowActions";
import { AdminSearchInput } from "./AdminSearchInput";
import { Pagination, PAGE_SIZE } from "./Pagination";

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
  initialType?: string;
}

function matchesQuery(query: string, ...fields: (string | null | undefined)[]): boolean {
  const q = query.toLowerCase();
  return fields.some(f => f?.toLowerCase().includes(q));
}

export function UsersTableClient({ employers, candidates, initialType = "employers" }: Props) {
  const [type, setType] = useState(initialType);
  const [blockedOnly, setBlockedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [employerQ, setEmployerQ] = useState("");
  const [candidateQ, setCandidateQ] = useState("");

  const matchedEmployers = employerQ
    ? employers.filter(e => matchesQuery(employerQ, e.name, e.email, e.company?.name))
    : employers;

  const matchedCandidates = candidateQ
    ? candidates.filter(c => matchesQuery(candidateQ, c.firstName, c.lastName, c.email))
    : candidates;

  const employerResults = matchedEmployers.filter(e => !blockedOnly || e.blocked);
  const candidateResults = matchedCandidates.filter(e => !blockedOnly || e.blocked);
  const total = type === "employers" ? employerResults.length : candidateResults.length;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(total / PAGE_SIZE)));
  const filteredEmployers = employerResults.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const filteredCandidates = candidateResults.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  return (
    <section className="adm-panel adm-management">
      <div className="adm-tabs" aria-label="Account type">{[["employers", "Employers", employers.length], ["candidates", "Candidates", candidates.length]].map(([value, label, count]) => <button type="button" key={value} aria-pressed={type === value} onClick={() => { setType(String(value)); setPage(1); }}>{label}<span>{count}</span></button>)}</div>
      <div className="adm-toolbar"><AdminSearchInput placeholder={type === "employers" ? "Name, email or company…" : "Name or email…"} value={type === "employers" ? employerQ : candidateQ} onChange={v => { if (type === "employers") setEmployerQ(v); else setCandidateQ(v); setPage(1); }} /><label className="adm-account-filter"><input type="checkbox" checked={blockedOnly} onChange={e => { setBlockedOnly(e.target.checked); setPage(1); }} /> Blocked accounts only</label></div>
      {type === "employers" ? <>

        <AdminTable columns={["Name", "Email", "Company", "Plan", "Slots", "Status", "Joined", "Actions"]}>
          {filteredEmployers.length === 0 ? (
            <tr><td colSpan={8} style={{ padding: "24px 16px", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-subtle)" }}>No employers found. Try a different search or filter.</td></tr>
          ) : filteredEmployers.map(e => (
            <AdminTr key={e.id}>
              <AdminTd>{e.name ?? "—"}</AdminTd>
              <AdminTd subtle mono>{e.email}</AdminTd>
              <AdminTd subtle>{e.company?.name ?? "—"}</AdminTd>
              <AdminTd><StatusBadge status={e.plan} /></AdminTd>
              <AdminTd mono subtle>{e.standardSlots} standard / {e.featuredSlots} featured</AdminTd>
              <AdminTd><StatusBadge status={e.blocked ? "BLOCKED" : "ACTIVE"} /></AdminTd>
              <AdminTd subtle mono>{new Date(e.createdAt).toLocaleDateString("en-GB", { timeZone: "UTC" })}</AdminTd>
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
      </>
      : <>

      <AdminTable columns={["Name", "Email", "City", "Level", "Status", "Joined", "Actions"]}>
        {filteredCandidates.length === 0 ? (
          <tr><td colSpan={7} style={{ padding: "24px 16px", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-subtle)" }}>No candidates found. Try a different search or filter.</td></tr>
        ) : filteredCandidates.map(c => (
          <AdminTr key={c.id}>
            <AdminTd>{[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}</AdminTd>
            <AdminTd subtle mono>{c.email}</AdminTd>
            <AdminTd subtle>{c.city ?? "—"}</AdminTd>
            <AdminTd subtle>{c.experienceLevel ?? "—"}</AdminTd>
            <AdminTd><StatusBadge status={c.blocked ? "BLOCKED" : "ACTIVE"} /></AdminTd>
            <AdminTd subtle mono>{new Date(c.createdAt).toLocaleDateString("en-GB", { timeZone: "UTC" })}</AdminTd>
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
      </>}
      <Pagination total={total} page={currentPage} onChange={setPage} />
    </section>
  );
}
