"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, HelpCircle, Loader2, RefreshCw } from "lucide-react";
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
  applyUrlCheckReason: string | null;
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

const badgeStyle = (color: string, background: string) => ({
  display: "inline-flex", alignItems: "center", gap: 4,
  fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
  padding: "2px 7px", borderRadius: 4, color, background,
});

function LinkBadge({ job }: { job: Job }) {
  /* Two distinct states, and the difference matters to whoever acts on it:
     "Broken" is the server's own 404/410 and can be trusted. "Check" is our
     guess from the page's wording and has produced false positives on live
     listings, so it asks for a look rather than asserting the job is dead.
     Never collapse these back into one badge. */
  if (job.applyUrlBroken) {
    const code = job.applyUrlCheckReason === "http-410" ? "410" : "404";
    return (
      <span style={badgeStyle("#ef4444", "#fef2f2")} title={`Server returned HTTP ${code}`}>
        <AlertTriangle size={10} /> Broken · {code}
      </span>
    );
  }
  if (job.applyUrlCheckReason === "soft-404") {
    return (
      <span
        style={badgeStyle("#b45309", "#fffbeb")}
        title="Page loaded with HTTP 200 but its title or heading reads like a not-found page. This is a guess — open the link before acting on it."
      >
        <HelpCircle size={10} /> Check
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
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [checking, setChecking]       = useState(false);
  const [result, setResult]           = useState<{ checked: number; broken: number; suspect: number } | null>(null);

  const isFlagged = (j: Job) => j.applyUrlBroken || j.applyUrlCheckReason === "soft-404";

  const filtered = jobs
    .filter(j => !flaggedOnly || isFlagged(j))
    .filter(j => !query ||
      j.title.toLowerCase().includes(query.toLowerCase()) ||
      j.companyDisplay.toLowerCase().includes(query.toLowerCase())
    );

  const brokenCount  = jobs.filter(j => j.applyUrlBroken).length;
  const suspectCount = jobs.filter(j => j.applyUrlCheckReason === "soft-404").length;
  const flaggedCount = brokenCount + suspectCount;

  async function runCheck() {
    setChecking(true);
    setResult(null);
    try {
      const res  = await fetch("/api/admin/jobs/check-links", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok && data) setResult({ checked: data.checked, broken: data.broken, suspect: data.suspect ?? 0 });
      router.refresh();
    } finally {
      setChecking(false);
    }
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
        <p className="body-s" style={{ color: "var(--text-subtle)", margin: 0 }}>
          {filtered.length}{query || flaggedOnly ? ` of ${jobs.length}` : ""} listings
          {brokenCount > 0 && (
            <span style={{ color: "#ef4444", fontWeight: 600 }}> · {brokenCount} broken</span>
          )}
          {suspectCount > 0 && (
            <span style={{ color: "#b45309", fontWeight: 600 }}> · {suspectCount} to check</span>
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
        <p className="mono-s" style={{ color: result.broken > 0 ? "#ef4444" : result.suspect > 0 ? "#b45309" : "var(--success)", marginBottom: 12 }}>
          Checked {result.checked} listing{result.checked === 1 ? "" : "s"} —{" "}
          {result.broken === 0 && result.suspect === 0 && "no broken apply links found."}
          {result.broken > 0 &&
            `${result.broken} came back 404/410 and can be unpublished. `}
          {result.suspect > 0 &&
            `${result.suspect} loaded fine but read like a not-found page — open ${result.suspect === 1 ? "it" : "them"} before acting, this check can be wrong.`}
        </p>
      )}

      {flaggedCount > 0 && (
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12, fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}>
          <input type="checkbox" checked={flaggedOnly} onChange={e => setFlaggedOnly(e.target.checked)} />
          Show flagged links only
        </label>
      )}

      <AdminTable columns={["Title", "Company", "Category", "Status", "Apply link", "Clicks", "Posted", "Actions"]}>
        {filtered.length === 0 ? (
          <tr><td colSpan={8} style={{ padding: "24px 16px", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-subtle)" }}>
            {flaggedOnly ? "No flagged apply links." : `No jobs match "${query}"`}
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
