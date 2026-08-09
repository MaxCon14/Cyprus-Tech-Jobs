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

/* Deliberately one advisory state, in amber, never red, and never the word
   "broken". The checker runs from a datacenter and cannot tell a retired
   listing apart from a site refusing automated requests — Bolt answers it 404
   for jobs that are live in a browser. Presenting that as a verdict invites
   unpublishing a listing an employer is paying for, so the badge reports what
   was seen and leaves the judgement to the person reading it.
   If you are tempted to add a red "Broken" state back, read checkApplyUrl. */
const REASON_LABEL: Record<string, { label: string; hint: string }> = {
  "http-404": {
    label: "404",
    hint:  "Our server got HTTP 404. Some careers sites return 404 to automated requests even when the page is live — open it before acting.",
  },
  "http-410": {
    label: "410",
    hint:  "Our server got HTTP 410 (gone). Usually genuine, but confirm in a browser before unpublishing.",
  },
  "soft-404": {
    label: "reads as empty",
    hint:  "The page loaded normally but its title or heading reads like a not-found page. This is a guess about their markup — open it before acting.",
  },
};

function LinkBadge({ job }: { job: Job }) {
  const reason = job.applyUrlCheckReason ? REASON_LABEL[job.applyUrlCheckReason] : undefined;

  if (reason) {
    return (
      <span style={badgeStyle("#b45309", "#fffbeb")} title={reason.hint}>
        <HelpCircle size={10} /> Check · {reason.label}
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
  const [result, setResult]           = useState<{ checked: number; flagged: number } | null>(null);

  // Reason is the single source of truth; applyUrlBroken is a legacy name for
  // the same thing (see the schema comment) and is not read here.
  const isFlagged = (j: Job) => j.applyUrlCheckReason !== null;

  const filtered = jobs
    .filter(j => !flaggedOnly || isFlagged(j))
    .filter(j => !query ||
      j.title.toLowerCase().includes(query.toLowerCase()) ||
      j.companyDisplay.toLowerCase().includes(query.toLowerCase())
    );

  const flaggedCount = jobs.filter(isFlagged).length;

  async function runCheck() {
    setChecking(true);
    setResult(null);
    try {
      const res  = await fetch("/api/admin/jobs/check-links", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok && data) setResult({ checked: data.checked, flagged: data.flagged ?? 0 });
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
          {flaggedCount > 0 && (
            <span style={{ color: "#b45309", fontWeight: 600 }}> · {flaggedCount} apply link{flaggedCount === 1 ? "" : "s"} to check</span>
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
        <p className="mono-s" style={{ color: result.flagged > 0 ? "#b45309" : "var(--success)", marginBottom: 12 }}>
          Checked {result.checked} listing{result.checked === 1 ? "" : "s"} —{" "}
          {result.flagged === 0
            ? "every apply link responded normally."
            : `${result.flagged} worth a look. Open ${result.flagged === 1 ? "it" : "them"} before unpublishing — some careers sites answer automated checks with a 404 even when the page is live.`}
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
