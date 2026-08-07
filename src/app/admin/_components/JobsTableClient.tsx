"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { AdminTable, AdminTr, AdminTd, StatusBadge } from "./AdminTable";
import { RowActions } from "./RowActions";
import { AdminSearchInput } from "./AdminSearchInput";

interface Job {
  id: string; title: string;
  isCurated: boolean;
  companyDisplay: string;
  category: { name: string };
  status: string;
  _count: { applyClicks: number };
  postedAt: string | null;
  applyUrlBroken: boolean;
  applyUrlCheckedAt: string | null;
}

interface Props { jobs: Job[] }

function timeAgoShort(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function LinkBadge({ job }: { job: Job }) {
  if (job.applyUrlBroken) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
        padding: "2px 7px", borderRadius: 4, color: "#ef4444", background: "#fef2f2",
      }}>
        <AlertTriangle size={10} /> 404
      </span>
    );
  }
  if (!job.applyUrlCheckedAt) {
    return <span className="mono-s" style={{ color: "var(--text-subtle)" }}>Not checked</span>;
  }
  return <span className="mono-s" style={{ color: "var(--text-subtle)" }}>OK · {timeAgoShort(job.applyUrlCheckedAt)}</span>;
}

export function JobsTableClient({ jobs }: Props) {
  const router = useRouter();
  const [query, setQuery]           = useState("");
  const [brokenOnly, setBrokenOnly] = useState(false);
  const [checking, setChecking]     = useState(false);
  const [result, setResult]         = useState<{ checked: number; broken: number } | null>(null);

  const filtered = jobs
    .filter(j => !brokenOnly || j.applyUrlBroken)
    .filter(j => !query ||
      j.title.toLowerCase().includes(query.toLowerCase()) ||
      j.companyDisplay.toLowerCase().includes(query.toLowerCase())
    );

  const brokenCount = jobs.filter(j => j.applyUrlBroken).length;

  async function runCheck() {
    setChecking(true);
    setResult(null);
    try {
      const res  = await fetch("/api/admin/jobs/check-links", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok && data) setResult({ checked: data.checked, broken: data.broken });
      router.refresh();
    } finally {
      setChecking(false);
    }
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
        <p className="body-s" style={{ color: "var(--text-subtle)", margin: 0 }}>
          {filtered.length}{query || brokenOnly ? ` of ${jobs.length}` : ""} listings
          {brokenCount > 0 && (
            <span style={{ color: "#ef4444", fontWeight: 600 }}> · {brokenCount} with a broken apply link</span>
          )}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <AdminSearchInput placeholder="Job title or company…" value={query} onChange={setQuery} />
          <button
            type="button" onClick={runCheck} disabled={checking}
            className="btn btn-outline btn-sm"
            style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
          >
            {checking
              ? <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Checking…</>
              : <><RefreshCw size={12} /> Check apply links</>}
          </button>
        </div>
      </div>

      {result && (
        <p className="mono-s" style={{ color: result.broken > 0 ? "#ef4444" : "var(--success)", marginBottom: 12 }}>
          Checked {result.checked} listing{result.checked === 1 ? "" : "s"} —{" "}
          {result.broken > 0
            ? `${result.broken} apply link${result.broken === 1 ? "" : "s"} came back 404/410. Unpublish or delete them below.`
            : "no broken apply links found."}
        </p>
      )}

      {brokenCount > 0 && (
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12, fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}>
          <input type="checkbox" checked={brokenOnly} onChange={e => setBrokenOnly(e.target.checked)} />
          Show broken links only
        </label>
      )}

      <AdminTable columns={["Title", "Company", "Category", "Status", "Apply link", "Clicks", "Posted", "Actions"]}>
        {filtered.length === 0 ? (
          <tr><td colSpan={8} style={{ padding: "24px 16px", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-subtle)" }}>
            {brokenOnly ? "No broken apply links." : `No jobs match "${query}"`}
          </td></tr>
        ) : filtered.map(j => (
          <AdminTr key={j.id}>
            <AdminTd>
              <div style={{ fontWeight: 600, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.title}</div>
            </AdminTd>
            <AdminTd subtle>
              {j.companyDisplay}
              {j.isCurated && <span style={{ marginLeft: 6, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--accent)", background: "var(--accent-soft)", borderRadius: 4, padding: "1px 5px" }}>CURATED</span>}
            </AdminTd>
            <AdminTd subtle>{j.category.name}</AdminTd>
            <AdminTd><StatusBadge status={j.status} /></AdminTd>
            <AdminTd><LinkBadge job={j} /></AdminTd>
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
              <Link href={`/admin/jobs/${j.id}/edit`} style={{ display: "inline-block", marginTop: 4, fontSize: 11, color: "var(--text-subtle)", textDecoration: "none" }}>Edit</Link>
            </AdminTd>
          </AdminTr>
        ))}
      </AdminTable>
    </>
  );
}
