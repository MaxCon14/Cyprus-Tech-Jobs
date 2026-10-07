"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HelpCircle, Loader2, RefreshCw, Download, ArrowUpRight } from "lucide-react";
import { AdminTable, AdminTr, AdminTd, StatusBadge } from "./AdminTable";
import { RowActions } from "./RowActions";
import { AdminSearchInput } from "./AdminSearchInput";
import { PAGE_SIZE, Pagination } from "./Pagination";
import { EmptyState } from "./AdminUI";
import { csvCell } from "@/lib/admin-metrics";

interface Job {
  id: string; title: string; expiresAt: string | null; applyUrl: string | null;
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

interface Props { jobs: Job[]; initialStatus?: string; initialQuery?: string; initialFlagged?: boolean; initialExpiring?: boolean; referenceTime: string; }

function timeAgoShort(iso: string, referenceTime: string): string {
  const ms = new Date(referenceTime).getTime() - new Date(iso).getTime();
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

function LinkBadge({ job, referenceTime }: { job: Job; referenceTime: string }) {
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
  return <span className="mono-s" style={{ color: "var(--text-subtle)" }}>OK · {timeAgoShort(job.applyUrlCheckedAt, referenceTime)}</span>;
}

export function JobsTableClient({ jobs, initialStatus = "ALL", initialQuery = "", initialFlagged = false, initialExpiring = false, referenceTime }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);
  const [flaggedOnly, setFlaggedOnly] = useState(initialFlagged);
  const [expiringOnly, setExpiringOnly] = useState(initialExpiring);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const now = new Date(referenceTime).getTime();
  const categories = [...new Set(jobs.map(j => j.category.name))].sort();
  const filtered = jobs.filter(j => (status === "ALL" || j.status === status) && (!flaggedOnly || j.applyUrlCheckReason !== null) && (!category || j.category.name === category) &&
    (!expiringOnly || (j.status === "ACTIVE" && j.expiresAt && new Date(j.expiresAt).getTime() >= now && new Date(j.expiresAt).getTime() <= now + 7 * 86400000)) &&
    (!query.trim() || `${j.title} ${j.companyDisplay}`.toLowerCase().includes(query.trim().toLowerCase())));
  if (sort === "clicks") filtered.sort((a, b) => b._count.applyClicks - a._count.applyClicks);
  if (sort === "title") filtered.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "oldest") filtered.reverse();
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = !!(query || status !== "ALL" || category || flaggedOnly || expiringOnly);
  function reset() { setQuery(""); setStatus("ALL"); setCategory(""); setFlaggedOnly(false); setExpiringOnly(false); setPage(1); }
  async function runCheck() {
    if (checking) return;
    setChecking(true); setMessage(null);
    try {
      const res = await fetch("/api/admin/jobs/check-links", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error || "Unable to check links. Please try again.");
      setMessage({ text: `Checked ${data.checked} listings. ${data.flagged ?? 0} links need a manual review. Automated checks are advisory; open a flagged link before unpublishing.`, error: false });
      router.refresh();
    } catch (error) { setMessage({ text: error instanceof Error ? error.message : "Connection failed. Please try again.", error: true }); }
    finally { setChecking(false); }
  }
  function exportCsv() {
    const rows = [["Title", "Company", "Category", "Status", "Apply clicks", "Posted", "Expires"], ...filtered.map(j => [j.title, j.companyDisplay, j.category.name, j.status, j._count.applyClicks, j.postedAt ?? "", j.expiresAt ?? ""])];
    const blob = new Blob(["\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "cyprustech-jobs.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className="adm-panel adm-management">
    <div className="adm-tabs" aria-label="Filter jobs by status">{["ALL", "ACTIVE", "DRAFT", "PAUSED", "EXPIRED", "CLOSED"].map(s => <button key={s} type="button" aria-pressed={s === status} onClick={() => { setStatus(s); setPage(1); }}>{s === "ALL" ? "All listings" : s.charAt(0) + s.slice(1).toLowerCase()}<span>{s === "ALL" ? jobs.length : jobs.filter(j => j.status === s).length}</span></button>)}</div>
    <div className="adm-toolbar"><AdminSearchInput placeholder="Search title or company…" value={query} onChange={v => { setQuery(v); setPage(1); }} /><div className="adm-toolbar-actions"><select aria-label="Filter by category" className="adm-select" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}><option value="">All categories</option>{categories.map(name => <option key={name}>{name}</option>)}</select><select aria-label="Sort listings" className="adm-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="clicks">Most apply clicks</option><option value="title">Title A–Z</option></select><button type="button" className="adm-button" disabled={!filtered.length} onClick={exportCsv}><Download size={15} /> Export</button></div></div>
    <div className="adm-filter-row"><div><label><input type="checkbox" checked={flaggedOnly} onChange={e => { setFlaggedOnly(e.target.checked); setPage(1); }} /> Links to review</label><label><input type="checkbox" checked={expiringOnly} onChange={e => { setExpiringOnly(e.target.checked); setPage(1); }} /> Expiring in 7 days</label>{hasFilters && <button type="button" className="adm-text-button" onClick={reset}>Clear filters</button>}</div><button className="adm-text-button" type="button" onClick={runCheck} disabled={checking}>{checking ? <Loader2 size={14} className="adm-spin" /> : <RefreshCw size={14} />}{checking ? "Checking links…" : "Check apply links"}</button></div>
    {message && <div className={`adm-notice ${message.error ? "is-error" : ""}`} role={message.error ? "alert" : "status"}>{message.text}</div>}
    <AdminTable columns={["Job listing", "Status", "Apply link", "Clicks", "Posted / expires", "Actions"]}>
      {visible.length ? visible.map(j => <AdminTr key={j.id}><AdminTd><Link href={`/admin/jobs/${j.id}/edit`} className="adm-job-name">{j.title}</Link><span className="adm-cell-subtitle">{j.companyDisplay} · {j.category.name}</span>{j.isCurated && <span className="adm-curated">Curated</span>}</AdminTd><AdminTd><StatusBadge status={j.status} /></AdminTd><AdminTd><LinkBadge job={j} referenceTime={referenceTime} />{j.applyUrl && /^https?:\/\//i.test(j.applyUrl) && <a href={j.applyUrl} target="_blank" rel="noopener noreferrer" className="adm-cell-subtitle adm-text-link">Open link <ArrowUpRight size={12} /></a>}</AdminTd><AdminTd mono>{j._count.applyClicks}</AdminTd><AdminTd subtle><span className="adm-nowrap">{j.postedAt ? new Date(j.postedAt).toLocaleDateString("en-GB", { timeZone: "UTC" }) : "Not published"}</span><small className="adm-cell-subtitle">{j.expiresAt ? `Ends ${new Date(j.expiresAt).toLocaleDateString("en-GB", { timeZone: "UTC" })}` : "No expiry set"}</small></AdminTd><AdminTd><div className="adm-job-actions"><Link href={`/admin/jobs/${j.id}/edit`} className="adm-edit-link">Edit listing</Link><RowActions actions={[
        ...(j.status === "ACTIVE" ? [{ label: "Unpublish", endpoint: `/api/admin/jobs/${j.id}`, method: "PATCH" as const, body: { status: "PAUSED" }, confirm: `Unpublish "${j.title}"? It will be hidden from the public job board.` }] : j.status === "PAUSED" ? [{ label: "Publish", endpoint: `/api/admin/jobs/${j.id}`, method: "PATCH" as const, body: { status: "ACTIVE" }, confirm: `Publish "${j.title}" for 30 days?` }] : []),
        { label: "Delete", endpoint: `/api/admin/jobs/${j.id}`, method: "DELETE", confirm: `Permanently delete "${j.title}" and its tracked clicks? This cannot be undone.`, destructive: true },
      ]} /></div></AdminTd></AdminTr>) : <tr><td colSpan={6}><EmptyState title={hasFilters ? "No listings match these filters" : "No job listings yet"} description={hasFilters ? "Try another search or clear your filters." : "Create your first listing to get started."} action={hasFilters ? <button type="button" className="adm-button" onClick={reset}>Clear filters</button> : <Link href="/admin/jobs/new" className="adm-button">Add a job</Link>} /></td></tr>}
    </AdminTable><Pagination total={filtered.length} page={currentPage} onChange={setPage} />
  </section>;
}
