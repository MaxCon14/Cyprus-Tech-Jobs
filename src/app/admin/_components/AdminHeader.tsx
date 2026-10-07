"use client";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronRight, RefreshCw, Search } from "lucide-react";
const names: Record<string, string> = { dashboard: "Overview", jobs: "Job listings", users: "People", companies: "Companies", analytics: "Analytics", blog: "Blog posts", taxonomy: "Categories & tags", new: "Create", edit: "Edit" };
export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const parts = pathname.split("/").filter(part => names[part]);
  return <header className="adm-header"><div className="adm-breadcrumb"><span>Workspace</span>{parts.map((part, i) => <span key={i}><ChevronRight size={13} /><strong>{names[part]}</strong></span>)}</div><div className="adm-header-actions"><form action="/admin/jobs" className="adm-header-search" role="search"><Search size={15} /><input name="q" placeholder="Search job listings…" aria-label="Search job listings" /></form><button type="button" className="adm-icon-button" disabled={pending} aria-label="Refresh dashboard data" title="Refresh data" onClick={() => startTransition(() => router.refresh())}><RefreshCw size={17} className={pending ? "adm-spin" : ""} /></button><span className="adm-admin-pill">Admin</span></div></header>;
}
