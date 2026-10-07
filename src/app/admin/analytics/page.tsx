import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { dailyCounts } from "@/lib/admin-metrics";
import Link from "next/link";
import { MousePointer2, Bell, Users, Building2 } from "lucide-react";
import { AdminTable, AdminTr, AdminTd } from "../_components/AdminTable";
import { PageHeading, StatCard, PanelHeading, EmptyState } from "../_components/AdminUI";
import { ActivityChart } from "../_components/ActivityChart";
export const dynamic = "force-dynamic";
export default async function AdminAnalyticsPage() {
  const now = new Date();
  const since = new Date(now); since.setUTCHours(0, 0, 0, 0); since.setUTCDate(since.getUTCDate() - 29);
  const [topJobs, totalClicks, totalAlerts, totalEmployers, clicks, candidates] = await Promise.all([
    prisma.job.findMany({ where: { status: "ACTIVE" }, include: { company: true, category: true, _count: { select: { applyClicks: true } } }, orderBy: { applyClicks: { _count: "desc" } }, take: 20 }),
    prisma.applyClick.count(), prisma.jobAlert.count(), prisma.employer.count(),
    prisma.applyClick.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    supabaseAdmin.from("candidates").select("id", { count: "exact", head: true }),
  ]);
  return <div className="adm-page"><PageHeading eyebrow="Platform insights" title="Analytics" description="Understand listing engagement and the size of your growing community." />
    <div className="adm-stats-grid"><StatCard label="All-time apply clicks" value={totalClicks} detail="Total clicks on application buttons" icon={<MousePointer2 size={18} />} /><StatCard label="Job alerts" value={totalAlerts} detail="Alert subscriptions, not unique people" icon={<Bell size={18} />} /><StatCard label="Candidates" value={candidates.error ? "Unavailable" : candidates.count ?? 0} detail={candidates.error ? "Candidate data could not be loaded" : "Registered candidate accounts"} icon={<Users size={18} />} /><StatCard label="Employers" value={totalEmployers} detail="Registered employer accounts" icon={<Building2 size={18} />} /></div>
    <ActivityChart points={dailyCounts(clicks.map(c => c.createdAt), 30, now)} />
    <section className="adm-panel adm-management"><PanelHeading title="Top-performing active listings" description="Up to 20 active jobs ranked by all-time apply clicks. Click a title to manage the listing." /><AdminTable columns={["Job listing", "Company", "Category", "Apply clicks"]}>{topJobs.length ? topJobs.map(j => <AdminTr key={j.id}><AdminTd><Link className="adm-job-name" href={`/admin/jobs/${j.id}/edit`}>{j.title}</Link></AdminTd><AdminTd subtle>{j.curatedCompanyName ?? j.company?.name ?? "—"}</AdminTd><AdminTd subtle>{j.category.name}</AdminTd><AdminTd mono>{j._count.applyClicks}</AdminTd></AdminTr>) : <tr><td colSpan={4}><EmptyState title="No active listings to report on" description="Publish a job to start tracking interest." /></td></tr>}</AdminTable></section>
  </div>;
}
