import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { dailyCounts } from "@/lib/admin-metrics";
import Link from "next/link";
import { ArrowRight, Plus, BriefcaseBusiness, Users, Building2, MousePointer2, FilePenLine, Link2, Clock3, CheckCircle2, Bell, FileText } from "lucide-react";
import { PageHeading, StatCard, PanelHeading, EmptyState } from "../_components/AdminUI";
import { StatusBadge } from "../_components/AdminTable";
import { ActivityChart } from "../_components/ActivityChart";

export const dynamic = "force-dynamic";
export default async function AdminDashboardPage() {
  const now = new Date();
  const since = new Date(now); since.setUTCHours(0, 0, 0, 0); since.setUTCDate(since.getUTCDate() - 29);
  const [totalJobs, activeJobs, draftJobs, pausedJobs, expiredJobs, totalEmployers, totalCompanies, totalAlerts, totalBlogPosts, flaggedJobs, expiringJobs, recentJobs, topJobs, clicks, candidates] = await Promise.all([
    prisma.job.count(), prisma.job.count({ where: { status: "ACTIVE" } }), prisma.job.count({ where: { status: "DRAFT" } }), prisma.job.count({ where: { status: "PAUSED" } }), prisma.job.count({ where: { status: "EXPIRED" } }),
    prisma.employer.count(), prisma.company.count(), prisma.jobAlert.count(), prisma.blogPost.count(),
    prisma.job.count({ where: { status: "ACTIVE", applyUrlCheckReason: { not: null } } }),
    prisma.job.count({ where: { status: "ACTIVE", expiresAt: { gte: now, lte: new Date(now.getTime() + 7 * 86400000) } } }),
    prisma.job.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { company: { select: { name: true } }, category: { select: { name: true } } } }),
    prisma.job.findMany({ take: 4, where: { status: "ACTIVE" }, orderBy: { applyClicks: { _count: "desc" } }, include: { company: { select: { name: true } }, _count: { select: { applyClicks: true } } } }),
    prisma.applyClick.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    supabaseAdmin.from("candidates").select("id", { count: "exact", head: true }),
  ]);
  const points = dailyCounts(clicks.map(c => c.createdAt), 30, now);
  const clicks30 = points.reduce((sum, p) => sum + p.count, 0);
  const attention = [
    { label: "Draft listings", detail: "Review and prepare for publishing", count: draftJobs, href: "/admin/jobs?status=DRAFT", icon: FilePenLine },
    { label: "Apply links to review", detail: "Open flagged links before taking action", count: flaggedJobs, href: "/admin/jobs?status=ACTIVE&flagged=1", icon: Link2 },
    { label: "Expiring this week", detail: "Active listings nearing their end date", count: expiringJobs, href: "/admin/jobs?expiring=1", icon: Clock3 },
  ];
  const statuses = [{ label: "Active", value: activeJobs, status: "ACTIVE", color: "var(--success)" }, { label: "Draft", value: draftJobs, status: "DRAFT", color: "var(--text-subtle)" }, { label: "Paused", value: pausedJobs, status: "PAUSED", color: "var(--info)" }, { label: "Expired", value: expiredJobs, status: "EXPIRED", color: "var(--warning)" }, { label: "Closed", value: Math.max(0, totalJobs - activeJobs - draftJobs - pausedJobs - expiredJobs), status: "CLOSED", color: "var(--error)" }];
  return <div className="adm-page">
    <PageHeading eyebrow="Your platform at a glance" title="Overview" description="A clear view of your community, listings, and what needs your attention." actions={<><Link className="adm-button" href="/admin/analytics">View analytics <ArrowRight size={15} /></Link><Link className="adm-button adm-button-primary" href="/admin/jobs/new"><Plus size={16} /> Add a job</Link></>} />
    <div className="adm-stats-grid">
      <StatCard label="Active listings" value={activeJobs} detail={`${totalJobs} listings across your platform`} icon={<BriefcaseBusiness size={18} />} href="/admin/jobs?status=ACTIVE" />
      <StatCard label="Candidates" value={candidates.error ? "Unavailable" : candidates.count ?? 0} detail={candidates.error ? "Candidate data could not be loaded" : "People in your talent community"} icon={<Users size={18} />} href="/admin/users?type=candidates" />
      <StatCard label="Companies" value={totalCompanies} detail={`${totalEmployers} registered employer accounts`} icon={<Building2 size={18} />} href="/admin/companies" />
      <StatCard label="Apply clicks" value={clicks30} detail="Last 30 calendar days · including today" icon={<MousePointer2 size={18} />} href="/admin/analytics" />
    </div>
    <div className="adm-overview-grid"><ActivityChart points={points} /><section className="adm-panel"><PanelHeading title="Needs attention" description="Your daily review queue" /><div className="adm-attention-list">{attention.map(({ label, detail, count, href, icon: Icon }) => <Link key={label} href={href} className="adm-attention-item"><span className={`adm-attention-icon ${count ? "has-items" : ""}`}><Icon size={18} /></span><div><strong>{label}</strong><small>{detail}</small></div><span className="adm-attention-count">{count}</span><ArrowRight size={14} /></Link>)}</div>{attention.every(a => a.count === 0) && <div className="adm-all-clear"><CheckCircle2 size={16} /> Your review queue is clear.</div>}<div className="adm-attention-footer">Link checks are advisory. Always confirm in a browser.</div></section></div>
    <div className="adm-overview-grid"><section className="adm-panel"><PanelHeading title="Recent listings" description="The latest additions to your job board" action={<Link className="adm-text-link" href="/admin/jobs">View all <ArrowRight size={14} /></Link>} />
      {recentJobs.length ? <div className="admin-table-scroll"><table className="adm-table adm-recent-table"><thead><tr><th scope="col">Job / company</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col"><span className="adm-sr-only">Action</span></th></tr></thead><tbody>{recentJobs.map(j => <tr key={j.id}><td><Link href={`/admin/jobs/${j.id}/edit`} className="adm-job-name">{j.title}</Link><small className="adm-cell-subtitle">{j.curatedCompanyName ?? j.company?.name ?? "—"}</small></td><td className="adm-muted">{j.category.name}</td><td><StatusBadge status={j.status} /></td><td><Link href={`/admin/jobs/${j.id}/edit`} className="adm-icon-button" aria-label={`Edit ${j.title}`}><ArrowRight size={15} /></Link></td></tr>)}</tbody></table></div> : <EmptyState title="Your first opportunity starts here" description="Add a job listing to start building your board." action={<Link href="/admin/jobs/new" className="adm-button">Add a job</Link>} />}
    </section><section className="adm-panel"><PanelHeading title="Listing health" description={`${totalJobs} listings in total`} /><div className="adm-health"><div className="adm-health-total"><strong>{totalJobs ? Math.round(activeJobs / totalJobs * 100) : 0}%</strong><span>of listings are active</span></div><div className="adm-status-bar" aria-hidden="true">{statuses.map(s => <span key={s.label} style={{ width: `${totalJobs ? s.value / totalJobs * 100 : 0}%`, background: s.color }} />)}</div>{statuses.map(s => <Link key={s.label} href={`/admin/jobs?status=${s.status}`} className="adm-health-row"><span><i style={{ background: s.color }} />{s.label}</span><strong>{s.value}</strong></Link>)}</div></section></div>
    <div className="adm-overview-grid"><section className="adm-panel"><PanelHeading title="Most popular active jobs" description="Ranked by all-time apply clicks" action={<Link href="/admin/analytics" className="adm-text-link">Full report <ArrowRight size={14} /></Link>} />{topJobs.length ? <div className="adm-top-jobs">{topJobs.map((j, i) => <Link key={j.id} href={`/admin/jobs/${j.id}/edit`}><span className="adm-rank">0{i + 1}</span><div><strong>{j.title}</strong><small>{j.curatedCompanyName ?? j.company?.name ?? "—"}</small></div><span className="adm-click-count">{j._count.applyClicks}<small>clicks</small></span></Link>)}</div> : <EmptyState title="No active listings yet" description="Published jobs will appear here." />}</section><section className="adm-panel"><PanelHeading title="Keep your community growing" description="Manage the content that brings people back" /><div className="adm-shortcuts"><Link href="/admin/blog"><FileText size={20} /><div><strong>Editorial hub</strong><small>{totalBlogPosts} blog posts · write your next story</small></div><ArrowRight size={16} /></Link><Link href="/admin/analytics"><Bell size={20} /><div><strong>Job alerts</strong><small>{totalAlerts} alert subscriptions</small></div><ArrowRight size={16} /></Link></div></section></div>
  </div>;
}
